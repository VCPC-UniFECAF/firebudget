use crate::config::AppConfig;
use crate::routes::items::sync_item_data;
use rocket::http::Status;
use rocket::serde::json::Json;
use rocket::{post, State};
use serde::Deserialize;
use serde::Serialize;
use sqlx::{PgPool, Row};
use std::sync::Arc;

#[derive(Debug, Deserialize)]
pub struct PluggyWebhookPayload {
    pub event: String,
    #[serde(rename = "eventId")]
    pub event_id: Option<String>,
    #[serde(rename = "itemId")]
    pub item_id: Option<String>,
    pub item: Option<PluggyWebhookItem>,
    #[serde(rename = "accountId")]
    pub account_id: Option<String>,
    #[serde(rename = "transactionIds")]
    pub transaction_ids: Option<Vec<String>>,
    #[serde(rename = "createdTransactionsLink")]
    pub created_transactions_link: Option<String>,
    #[serde(rename = "transactionsCreatedAtFrom")]
    pub transactions_created_at_from: Option<String>,
}

#[derive(Debug, Deserialize)]
pub struct PluggyWebhookItem {
    pub id: String,
    pub status: String,
    #[serde(rename = "executionStatus")]
    pub execution_status: Option<String>,
}

#[derive(Debug, Serialize)]
pub struct WebhookResponse {
    pub message: String,
}

// Endpoint público para receber webhooks da Pluggy
// Nota: Em produção, você deve validar a assinatura do webhook para segurança
// IP whitelist: 177.71.238.212
#[post("/webhooks/pluggy", format = "json", data = "<payload>")]
pub async fn handle_pluggy_webhook(
    payload: Json<PluggyWebhookPayload>,
    pool: &State<PgPool>,
    config: &State<Arc<AppConfig>>,
) -> Result<Json<WebhookResponse>, Status> {
    let event = payload.event.clone();
    let item_id = payload
        .item_id
        .as_ref()
        .or_else(|| payload.item.as_ref().map(|i| &i.id))
        .map(|s| s.as_str());
    let account_id = payload.account_id.as_deref();
    let transaction_ids = payload.transaction_ids.clone();

    eprintln!("Webhook recebido: evento = {}, item_id = {:?}, account_id = {:?}", event, item_id, account_id);

    // Responder rapidamente (< 5 segundos) conforme documentação
    // Processar em background após responder
    let config_clone = config.inner().clone();
    let pool_clone = pool.inner().clone();
    let event_clone = event.clone();
    let item_id_clone = item_id.map(|s| s.to_string());
    let account_id_clone = account_id.map(|s| s.to_string());
    let transaction_ids_clone = transaction_ids.clone();

    tokio::spawn(async move {
        if let Err(e) = process_webhook_event(
            config_clone,
            pool_clone,
            &event_clone,
            item_id_clone.as_deref(),
            account_id_clone.as_deref(),
            transaction_ids_clone.as_deref(),
        )
        .await
        {
            eprintln!("Erro ao processar webhook: {}", e);
        }
    });

    Ok(Json(WebhookResponse {
        message: "Webhook recebido com sucesso".to_string(),
    }))
}

async fn process_webhook_event(
    config: Arc<AppConfig>,
    pool: PgPool,
    event: &str,
    item_id: Option<&str>,
    account_id: Option<&str>,
    transaction_ids: Option<&[String]>,
) -> anyhow::Result<()> {
    // Verificar se é um evento relacionado a transações
    if event.starts_with("transactions/") {
        let item_id = item_id.ok_or_else(|| anyhow::anyhow!("item_id não encontrado no webhook de transação"))?;
        let account_id = account_id.ok_or_else(|| anyhow::anyhow!("account_id não encontrado no webhook de transação"))?;
        
        eprintln!("Processando evento de transação {} para item {} e account {}", event, item_id, account_id);
        
        process_transaction_event(config.clone(), pool.clone(), event, item_id, account_id, transaction_ids).await?;
        
        // Após processar eventos de transações, buscar e salvar saldos
        fetch_and_save_balances(config, pool, Some(item_id), Some(account_id)).await?;
        
        return Ok(());
    }

    // Verificar se é um evento relacionado a items
    if !event.starts_with("item/") {
        eprintln!("Evento não relacionado a items ou transações: {}", event);
        return Ok(());
    }

    let item_id = item_id.ok_or_else(|| anyhow::anyhow!("item_id não encontrado no webhook"))?;

    eprintln!("Processando evento {} para item {}", event, item_id);

    match event {
        "item/created" | "item/updated" => {
            // Conforme documentação: fazer GET /items/{id} para recuperar informações mais recentes
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

            use crate::pluggy::client::PluggyClient;
            let mut client = PluggyClient::new(app_config);

            // Fazer GET /items/{id} conforme documentação
            let pluggy_item = client.get_item_by_id(item_id).await?;

            eprintln!(
                "Item {} tem status: {} (execution_status: {:?})",
                item_id, pluggy_item.status, pluggy_item.execution_status
            );

            // Só sincronizar se o item estiver UPDATED
            if pluggy_item.status == "UPDATED" {
                // Buscar o item no banco local
                let item_record = sqlx::query("SELECT id, user_id FROM items WHERE pluggy_item_id = $1")
                    .bind(item_id)
                    .fetch_optional(&pool)
                    .await?;

                if let Some(row) = item_record {
                    let id: uuid::Uuid = row.get("id");
                    let user_id: uuid::Uuid = row.get("user_id");

                    eprintln!(
                        "Item encontrado no banco. Iniciando sincronização para item: {}",
                        item_id
                    );

                    let config_for_sync = Arc::new(AppConfig {
                        client_id: config.client_id.clone(),
                        client_secret: config.client_secret.clone(),
                        environment: config.environment.clone(),
                        base_url: config.base_url.clone(),
                        database_url: config.database_url.clone(),
                        jwt_secret: config.jwt_secret.clone(),
                        admin_email: config.admin_email.clone(),
                        admin_password: config.admin_password.clone(),
                        admin_name: config.admin_name.clone(),
                    });

                    if let Err(e) = sync_item_data(
                        config_for_sync.clone(),
                        pool.clone(),
                        item_id,
                        id,
                        user_id,
                    )
                    .await
                    {
                        eprintln!("Erro na sincronização via webhook: {}", e);
                        return Err(e);
                    } else {
                        eprintln!(
                            "Sincronização via webhook concluída com sucesso para item: {}",
                            item_id
                        );
                    }
                    
                    // Após sincronizar item, buscar e salvar saldos
                    if let Err(e) = fetch_and_save_balances(config_for_sync, pool, Some(item_id), None).await {
                        eprintln!("Erro ao buscar saldos após sincronização de item: {}", e);
                        // Não retornar erro, apenas logar
                    }
                } else {
                    eprintln!(
                        "Item {} não encontrado no banco de dados. Pode ser um item novo que ainda não foi registrado.",
                        item_id
                    );
                }
            } else {
                eprintln!(
                    "Item {} ainda não está UPDATED (status: {}), ignorando sincronização",
                    item_id, pluggy_item.status
                );
            }
        }
        "item/error" => {
            eprintln!("Item {} encontrou um erro. Verificar logs da Pluggy.", item_id);
            // Poderia atualizar status no banco se necessário
        }
        "item/waiting_user_input" => {
            eprintln!("Item {} está aguardando input do usuário.", item_id);
        }
        "item/login_succeeded" => {
            eprintln!("Item {} fez login com sucesso e está coletando dados.", item_id);
        }
        "item/deleted" => {
            eprintln!("Item {} foi deletado.", item_id);
            // Poderia marcar como deletado no banco se necessário
        }
        _ => {
            eprintln!("Evento não tratado: {}", event);
        }
    }

    Ok(())
}

async fn process_transaction_event(
    config: Arc<AppConfig>,
    pool: PgPool,
    event: &str,
    item_id: &str,
    account_id: &str,
    transaction_ids: Option<&[String]>,
) -> anyhow::Result<()> {
    use crate::pluggy::client::PluggyClient;
    use rust_decimal::Decimal;
    use rust_decimal::prelude::FromPrimitive;

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

    // Buscar o account_id local no banco
    let account_record = sqlx::query("SELECT id, item_id FROM accounts WHERE pluggy_account_id = $1")
        .bind(account_id)
        .fetch_optional(&pool)
        .await?;

    let (db_account_id, db_item_id) = match account_record {
        Some(row) => (row.get::<uuid::Uuid, _>("id"), row.get::<uuid::Uuid, _>("item_id")),
        None => {
            eprintln!("Account {} não encontrado no banco de dados", account_id);
            return Ok(());
        }
    };

    // Buscar o item para obter user_id
    let item_record = sqlx::query("SELECT user_id FROM items WHERE id = $1")
        .bind(db_item_id)
        .fetch_optional(&pool)
        .await?;

    let user_id = match item_record {
        Some(row) => row.get::<uuid::Uuid, _>("user_id"),
        None => {
            eprintln!("Item {} não encontrado no banco de dados", db_item_id);
            return Ok(());
        }
    };

    match event {
        "transactions/created" | "transactions/updated" => {
            // Fazer GET /transactions com itemId e accountId
            let transactions = client.get_transactions(Some(item_id), Some(account_id)).await?;

            eprintln!("Encontradas {} transações para processar", transactions.len());

            for tx in transactions {
                let tx_amount = Decimal::from_f64(tx.amount).unwrap_or(Decimal::ZERO);
                let tx_date = chrono::NaiveDate::parse_from_str(&tx.date[0..10], "%Y-%m-%d")
                    .unwrap_or_else(|_| chrono::Utc::now().date_naive());
                
                let tx_balance = tx.balance.map(|b| Decimal::from_f64(b).unwrap_or(Decimal::ZERO));

                sqlx::query(
                    r#"
                    INSERT INTO transactions (
                        pluggy_transaction_id, account_id, item_id, user_id, 
                        amount, date, description, category, subcategory, currency, status, balance
                    )
                    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
                    ON CONFLICT (pluggy_transaction_id) DO UPDATE SET
                        amount = EXCLUDED.amount,
                        date = EXCLUDED.date,
                        description = EXCLUDED.description,
                        category = EXCLUDED.category,
                        subcategory = EXCLUDED.subcategory,
                        currency = EXCLUDED.currency,
                        status = EXCLUDED.status,
                        balance = EXCLUDED.balance,
                        updated_at = CURRENT_TIMESTAMP
                    "#
                )
                .bind(&tx.id)
                .bind(db_account_id)
                .bind(db_item_id)
                .bind(user_id)
                .bind(tx_amount)
                .bind(tx_date)
                .bind(&tx.description)
                .bind(&tx.category)
                .bind(&tx.subcategory)
                .bind(&tx.currency_code)
                .bind(tx.status.unwrap_or_else(|| "PENDING".to_string()))
                .bind(tx_balance)
                .execute(&pool)
                .await?;
            }

            eprintln!("Transações processadas com sucesso para account {}", account_id);
        }
        "transactions/deleted" => {
            // Remover transações do banco usando os transactionIds
            if let Some(ids) = transaction_ids {
                for tx_id in ids {
                    sqlx::query("DELETE FROM transactions WHERE pluggy_transaction_id = $1")
                        .bind(tx_id)
                        .execute(&pool)
                        .await?;
                }
                eprintln!("{} transações deletadas", ids.len());
            } else {
                eprintln!("Nenhum transaction_id fornecido para deletar");
            }
        }
        _ => {
            eprintln!("Evento de transação não tratado: {}", event);
        }
    }

    Ok(())
}

async fn fetch_and_save_balances(
    config: Arc<AppConfig>,
    pool: PgPool,
    item_id: Option<&str>,
    account_id: Option<&str>,
) -> anyhow::Result<()> {
    use crate::pluggy::client::PluggyClient;
    use rust_decimal::Decimal;
    use rust_decimal::prelude::FromPrimitive;

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

    // Fazer GET /balances com itemId e accountId
    let balances = client.get_balances(item_id, account_id).await?;

    eprintln!("Encontrados {} saldos para processar", balances.len());

    for balance in balances {
        // Buscar o account_id local no banco
        let account_record = sqlx::query("SELECT id, item_id FROM accounts WHERE pluggy_account_id = $1")
            .bind(&balance.account_id)
            .fetch_optional(&pool)
            .await?;

        let (db_account_id, db_item_id) = match account_record {
            Some(row) => (row.get::<uuid::Uuid, _>("id"), row.get::<uuid::Uuid, _>("item_id")),
            None => {
                eprintln!("Account {} não encontrado no banco de dados, pulando saldo", balance.account_id);
                continue;
            }
        };

        let balance_decimal = Decimal::from_f64(balance.balance).unwrap_or(Decimal::ZERO);

        // db_item_id já vem do account_record acima, que é o item_id local correto

        // Verificar se o saldo já existe
        let existing_balance = sqlx::query("SELECT id FROM balances WHERE pluggy_balance_id = $1 AND account_id = $2")
            .bind(&balance.id)
            .bind(db_account_id)
            .fetch_optional(&pool)
            .await?;

        if let Some(_) = existing_balance {
            // Atualizar saldo existente
            sqlx::query(
                r#"
                UPDATE balances 
                SET balance = $1, currency = $2, updated_at = CURRENT_TIMESTAMP
                WHERE pluggy_balance_id = $3 AND account_id = $4
                "#
            )
            .bind(balance_decimal)
            .bind(&balance.currency)
            .bind(&balance.id)
            .bind(db_account_id)
            .execute(&pool)
            .await?;
        } else {
            // Inserir novo saldo
            sqlx::query(
                r#"
                INSERT INTO balances (pluggy_balance_id, account_id, item_id, balance, currency)
                VALUES ($1, $2, $3, $4, $5)
                "#
            )
            .bind(&balance.id)
            .bind(db_account_id)
            .bind(db_item_id)
            .bind(balance_decimal)
            .bind(&balance.currency)
            .execute(&pool)
            .await?;
        }

        // Atualizar também o saldo na tabela accounts para refletir na dashboard
        sqlx::query("UPDATE accounts SET balance = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2")
            .bind(balance_decimal)
            .bind(db_account_id)
            .execute(&pool)
            .await?;
    }

    eprintln!("Saldos processados com sucesso");
    Ok(())
}

