mod config;
mod pluggy;

use config::PluggyConfig;
use pluggy::client::PluggyClient;
use pluggy::models::ConnectTokenResponse;
use dotenvy::dotenv;
use rocket::{get, post, routes, State, serde::json::Json, http::Status};
use rocket_cors::{CorsOptions, AllowedOrigins};
use std::sync::Arc;

#[get("/health")]
fn health() -> &'static str {
    "OK"
}

#[post("/api/pluggy/connect-token")]
async fn create_connect_token(config: &State<Arc<PluggyConfig>>) -> Result<Json<ConnectTokenResponse>, (Status, String)> {
    let pluggy_config = PluggyConfig {
        client_id: config.client_id.clone(),
        client_secret: config.client_secret.clone(),
        environment: config.environment.clone(),
        base_url: config.base_url.clone(),
    };
    
    let mut pluggy_client = PluggyClient::new(pluggy_config);
    
    match pluggy_client.create_connect_token().await {
        Ok(connect_token) => {
            eprintln!("✓ Connect token criado com sucesso");
            Ok(Json(connect_token))
        },
        Err(e) => {
            eprintln!("✗ Erro ao criar connect token: {}", e);
            Err((Status::InternalServerError, format!("Erro ao criar connect token: {}", e)))
        },
    }
}

#[rocket::main]
async fn main() -> Result<(), rocket::Error> {
    // Carrega variáveis de ambiente do arquivo .env
    dotenvy::from_filename(".env")
        .or_else(|_| dotenv())
        .ok();

    // Carrega configuração da Pluggy
    let pluggy_config = match PluggyConfig::from_env() {
        Ok(config) => Arc::new(config),
        Err(e) => {
            eprintln!("Erro ao carregar configuração: {}", e);
            eprintln!("Certifique-se de que as variáveis PLUGGY_CLIENT_ID e PLUGGY_CLIENT_SECRET estão definidas no arquivo .env");
            eprintln!("Procurando .env em: backend/.env ou .env (raiz do projeto)");
            std::process::exit(1);
        }
    };

    // Testa conexão com Pluggy
    let test_config = PluggyConfig {
        client_id: pluggy_config.client_id.clone(),
        client_secret: pluggy_config.client_secret.clone(),
        environment: pluggy_config.environment.clone(),
        base_url: pluggy_config.base_url.clone(),
    };
    let mut test_client = PluggyClient::new(test_config);
    
    println!("Testando conexão com Pluggy API...");
    match test_client.test_connection().await {
        Ok(message) => {
            println!("✓ {}", message);
        }
        Err(e) => {
            eprintln!("✗ Erro ao conectar com Pluggy API: {}", e);
            std::process::exit(1);
        }
    }

    // Configura CORS
    let cors = CorsOptions::default()
        .allowed_origins(AllowedOrigins::all())
        .allowed_methods(
            vec![rocket::http::Method::Get, rocket::http::Method::Post]
                .into_iter()
                .map(From::from)
                .collect(),
        )
        .allow_credentials(true)
        .to_cors()
        .unwrap_or_else(|e| {
            eprintln!("Erro ao configurar CORS: {}", e);
            std::process::exit(1);
        });

    println!("\nIniciando servidor Rocket na porta 8000...");
    
    let _rocket = rocket::build()
        .manage(pluggy_config)
        .attach(cors)
        .mount("/", routes![health, create_connect_token])
        .launch()
        .await?;

    Ok(())
}
