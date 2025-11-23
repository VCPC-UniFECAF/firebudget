use crate::config::AppConfig;
use crate::routes::items::sync_item_data;
use rocket::http::Status;
use rocket::serde::json::Json;
use rocket::{post, State};
use serde::Deserialize;
use serde::Serialize;
use sqlx::PgPool;
use std::sync::Arc;

#[derive(Debug, Deserialize)]
pub struct PluggyWebhookPayload {
    pub event: String,
    #[serde(rename = "eventId")]
    pub event_id: Option<String>,
    #[serde(rename = "itemId")]
    pub item_id: Option<String>,
    pub item: Option<PluggyWebhookItem>,
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

    eprintln!("Webhook recebido: evento = {}, item_id = {:?}", event, item_id);

    // Responder rapidamente (< 5 segundos) conforme documentação
    // Processar em background após responder
    let config_clone = config.inner().clone();
    let pool_clone = pool.inner().clone();
    let event_clone = event.clone();
    let item_id_clone = item_id.map(|s| s.to_string());

    tokio::spawn(async move {
        if let Err(e) = process_webhook_event(
            config_clone,
            pool_clone,
            &event_clone,
            item_id_clone.as_deref(),
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
) -> anyhow::Result<()> {
    // Verificar se é um evento relacionado a items
    if !event.starts_with("item/") {
        eprintln!("Evento não relacionado a items: {}", event);
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
                let item_record = sqlx::query!(
                    "SELECT id, user_id FROM items WHERE pluggy_item_id = $1",
                    item_id
                )
                .fetch_optional(&pool)
                .await?;

                if let Some(item) = item_record {
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
                        config_for_sync,
                        pool,
                        item_id,
                        item.id,
                        item.user_id,
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

