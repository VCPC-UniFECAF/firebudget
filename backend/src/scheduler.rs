use std::sync::Arc;
use std::time::Duration;
use sqlx::{PgPool, FromRow};
use uuid::Uuid;
use crate::config::AppConfig;
use crate::routes::items::sync_item_data;

#[derive(FromRow)]
struct ItemToSync {
    id: Uuid,
    pluggy_item_id: String,
    user_id: Uuid,
}

pub fn start_scheduler(pool: PgPool, config: Arc<AppConfig>) {
    tokio::spawn(async move {
        eprintln!("Iniciando agendador de atualizações...");
        let mut interval = tokio::time::interval(Duration::from_secs(60));

        loop {
            interval.tick().await;
            eprintln!("Executando atualização agendada de items...");

            match update_all_items(&pool, &config).await {
                Ok(_) => eprintln!("Atualização agendada concluída com sucesso."),
                Err(e) => eprintln!("Erro na atualização agendada: {}", e),
            }
        }
    });
}

async fn update_all_items(pool: &PgPool, config: &Arc<AppConfig>) -> anyhow::Result<()> {
    // Buscar todos os items
    let items = sqlx::query_as::<_, ItemToSync>(
        r#"
        SELECT id, pluggy_item_id, user_id
        FROM items
        "#
    )
    .fetch_all(pool)
    .await?;

    eprintln!("Encontrados {} items para atualizar.", items.len());

    for item in items {
        let pool_clone = pool.clone();
        let config_clone = config.clone();
        let item_id = item.id;
        let pluggy_id = item.pluggy_item_id.clone();
        
        // Executar sync para cada item
        // Podemos fazer sequencial ou concorrente. Vamos fazer concorrente com spawn mas sem aguardar todos para não bloquear o loop principal demais se um falhar?
        // Melhor fazer sequencial dentro do job para não sobrecarregar ou concorrente controlado.
        // Como é background job, vamos fazer sequencial simples aqui para garantir logs claros, ou spawnar tasks.
        // Dado que `sync_item_data` é async, podemos fazer await.
        
        eprintln!("Atualizando item: {}", pluggy_id);
        
        // Spawnar task individual para não parar se um der erro
        tokio::spawn(async move {
            match sync_item_data(config_clone, pool_clone, &pluggy_id, item_id, item.user_id).await {
                Ok(_) => eprintln!("Item {} atualizado com sucesso.", pluggy_id),
                Err(e) => eprintln!("Erro ao atualizar item {}: {}", pluggy_id, e),
            }
        });
    }

    Ok(())
}

