use crate::config::AppConfig;
use crate::pluggy::client::PluggyClient;
use crate::routes::transactions::AuthenticatedUser;
use rocket::http::Status;
use rocket::serde::json::Json;
use rocket::{post, State};
use serde::{Deserialize, Serialize};
use sqlx::PgPool;
use std::sync::Arc;
use uuid::Uuid;

#[derive(Debug, Deserialize)]
pub struct CreateItemRequest {
    pub item_id: String,
}

#[derive(Debug, Serialize)]
pub struct ItemResponse {
    pub id: Uuid,
    pub pluggy_item_id: String,
    pub status: String,
}

#[post("/items", format = "json", data = "<item_request>")]
pub async fn create_item(
    user: AuthenticatedUser,
    item_request: Json<CreateItemRequest>,
    pool: &State<PgPool>,
    config: &State<Arc<AppConfig>>,
) -> Result<Json<ItemResponse>, Status> {
    // 1. Salvar o Item no banco de dados
    let item_id = Uuid::new_v4();
    let item = sqlx::query!(
        r#"
        INSERT INTO items (id, pluggy_item_id, user_id, status)
        VALUES ($1, $2, $3, 'UPDATED')
        ON CONFLICT (pluggy_item_id) DO UPDATE SET updated_at = CURRENT_TIMESTAMP
        RETURNING id, pluggy_item_id, status
        "#,
        item_id,
        item_request.item_id,
        user.id
    )
    .fetch_one(pool.inner())
    .await
    .map_err(|e| {
        eprintln!("Erro ao salvar item: {}", e);
        Status::InternalServerError
    })?;

    // 2. Iniciar sincronização (Fetch accounts & transactions)
    // Nota: Em um app real, isso deveria ser feito em background (job queue) para não bloquear a request.
    // Como estamos usando Rocket simples, faremos inline por enquanto ou spawnaremos uma task tokio.
    
    let config_clone = config.inner().clone(); // Arc clone
    let pool_clone = pool.inner().clone();
    let pluggy_item_id = item.pluggy_item_id.clone();
    let db_item_id = item.id;
    let user_id = user.id;

    tokio::spawn(async move {
        eprintln!("Iniciando sincronização para item: {}", pluggy_item_id);
        if let Err(e) = sync_item_data(config_clone, pool_clone, &pluggy_item_id, db_item_id, user_id).await {
            eprintln!("Erro na sincronização: {}", e);
        } else {
            eprintln!("Sincronização concluída com sucesso para item: {}", pluggy_item_id);
        }
    });

    Ok(Json(ItemResponse {
        id: item.id,
        pluggy_item_id: item.pluggy_item_id,
        status: item.status,
    }))
}

pub async fn sync_item_data(
    config: Arc<AppConfig>,
    pool: PgPool,
    pluggy_item_id: &str,
    db_item_id: Uuid,
    user_id: Uuid,
) -> anyhow::Result<()> {
    // Configurar client da Pluggy (precisamos criar AppConfig compatível com PluggyConfig ou adaptar)
    // O PluggyClient espera AppConfig agora (conforme nossa refatoração anterior).
    
    // Hack: Reconstruir AppConfig ou clonar. O client espera struct AppConfig.
    // Como passamos Arc<AppConfig>, precisamos desreferenciar.
    let app_config = AppConfig {
        client_id: config.client_id.clone(),
        client_secret: config.client_secret.clone(),
        environment: config.environment.clone(),
        base_url: config.base_url.clone(),
        database_url: config.database_url.clone(),
        jwt_secret: config.jwt_secret.clone(),
        admin_email: config.admin_email.clone(),
        admin_password: config.admin_password.clone(),
        admin_name: config.admin_name.clone(),
    };

    let mut client = PluggyClient::new(app_config);

    // 0. Buscar detalhes do Item (para pegar o connector e salvar no banco)
    match client.get_item_by_id(pluggy_item_id).await {
        Ok(item_details) => {
            if let Some(connector) = item_details.connector {
                let update_result = sqlx::query!(
                    "UPDATE items SET connector = $1 WHERE id = $2",
                    connector,
                    db_item_id
                )
                .execute(&pool)
                .await;
                
                if let Err(e) = update_result {
                    eprintln!("Erro ao atualizar connector do item: {}", e);
                }
            }
        },
        Err(e) => {
             eprintln!("Erro ao buscar detalhes do item: {}", e);
             // Não abortar, continuar para buscar contas
        }
    }

    // 1. Buscar Contas
    let accounts = client.get_accounts(Some(pluggy_item_id)).await?;
    
    for acc in accounts {
        // Inserir conta
        let account_id = Uuid::new_v4();
        
        // Parse balance to Decimal
        use rust_decimal::Decimal;
        use rust_decimal::prelude::FromPrimitive;
        
        let balance_decimal = Decimal::from_f64(acc.balance.unwrap_or(0.0)).unwrap_or(Decimal::ZERO);

        let db_account = sqlx::query!(
            r#"
            INSERT INTO accounts (id, pluggy_account_id, item_id, name, number, balance, currency, type, subtype)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
            ON CONFLICT (pluggy_account_id) DO UPDATE SET 
                balance = EXCLUDED.balance,
                name = EXCLUDED.name,
                updated_at = CURRENT_TIMESTAMP
            RETURNING id
            "#,
            account_id,
            acc.id,
            db_item_id,
            acc.name,
            acc.number,
            balance_decimal,
            acc.currency_code,
            acc.type_field,
            acc.subtype
        )
        .fetch_one(&pool)
        .await?;

        // 2. Buscar Transações desta conta
        // Pluggy API pede accountId para filtrar
        let transactions = client.get_transactions(Some(pluggy_item_id), Some(&acc.id)).await?;

        for tx in transactions {
            let tx_amount = Decimal::from_f64(tx.amount).unwrap_or(Decimal::ZERO);
            // Parse date (string ISO)
            let tx_date = chrono::NaiveDate::parse_from_str(&tx.date[0..10], "%Y-%m-%d")
                .unwrap_or_else(|_| chrono::Utc::now().date_naive());

            sqlx::query!(
                r#"
                INSERT INTO transactions (
                    pluggy_transaction_id, account_id, item_id, user_id, 
                    amount, date, description, category, currency, status
                )
                VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
                ON CONFLICT (pluggy_transaction_id) DO NOTHING
                "#,
                tx.id,
                db_account.id,
                db_item_id,
                user_id,
                tx_amount,
                tx_date,
                tx.description,
                tx.category,
                tx.currency_code,
                tx.status.unwrap_or_else(|| "PENDING".to_string()) // Default status if missing
            )
            .execute(&pool)
            .await?;
        }
    }

    Ok(())
}

