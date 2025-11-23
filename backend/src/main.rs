mod config;
mod models;
mod pluggy;
mod routes;

use config::AppConfig;
use pluggy::client::PluggyClient;
use pluggy::models::ConnectTokenResponse;
use routes::{auth, transactions, items, accounts};
use dotenvy::dotenv;
use rocket::{get, post, routes, State, serde::json::Json, http::Status};
use rocket_cors::{CorsOptions, AllowedOrigins};
use sqlx::postgres::PgPoolOptions;
use std::sync::Arc;

#[get("/health")]
fn health() -> &'static str {
    "OK"
}

#[post("/api/pluggy/connect-token")]
async fn create_connect_token(config: &State<Arc<AppConfig>>) -> Result<Json<ConnectTokenResponse>, (Status, String)> {
    let pluggy_config = AppConfig {
        client_id: config.client_id.clone(),
        client_secret: config.client_secret.clone(),
        environment: config.environment.clone(),
        base_url: config.base_url.clone(),
        database_url: config.database_url.clone(),
        jwt_secret: config.jwt_secret.clone(),
        admin_email: None,
        admin_password: None,
        admin_name: None,
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

    // Carrega configuração
    let app_config = match AppConfig::from_env() {
        Ok(config) => Arc::new(config),
        Err(e) => {
            eprintln!("Erro ao carregar configuração: {}", e);
            eprintln!("Certifique-se de que as variáveis de ambiente estão definidas no arquivo .env");
            std::process::exit(1);
        }
    };

    // Configura conexão com Banco de Dados
    let pool = match PgPoolOptions::new()
        .max_connections(5)
        .connect(&app_config.database_url)
        .await
    {
        Ok(pool) => {
            println!("✓ Conexão com banco de dados estabelecida");
            pool
        }
        Err(e) => {
            eprintln!("✗ Erro ao conectar ao banco de dados: {}", e);
            std::process::exit(1);
        }
    };

    // Seed Admin User se credenciais estiverem presentes
    if let (Some(email), Some(password), Some(name)) = (
        &app_config.admin_email,
        &app_config.admin_password,
        &app_config.admin_name,
    ) {
        use models::user::User;
        
        println!("Verificando usuário admin...");
        let admin_exists = sqlx::query!("SELECT id FROM users WHERE email = $1", email)
            .fetch_optional(&pool)
            .await
            .unwrap_or(None);

        if admin_exists.is_none() {
            println!("Criando usuário admin: {}", email);
            match User::hash_password(password) {
                Ok(hash) => {
                    let result = sqlx::query!(
                        "INSERT INTO users (email, full_name, password_hash) VALUES ($1, $2, $3)",
                        email,
                        name,
                        hash
                    )
                    .execute(&pool)
                    .await;

                    match result {
                        Ok(_) => println!("✓ Usuário admin criado com sucesso"),
                        Err(e) => eprintln!("✗ Erro ao criar usuário admin: {}", e),
                    }
                }
                Err(e) => eprintln!("✗ Erro ao gerar hash da senha do admin: {}", e),
            }
        } else {
            println!("✓ Usuário admin já existe");
        }
    }

    // Testa conexão com Pluggy
    let test_config = AppConfig {
        client_id: app_config.client_id.clone(),
        client_secret: app_config.client_secret.clone(),
        environment: app_config.environment.clone(),
        base_url: app_config.base_url.clone(),
        database_url: app_config.database_url.clone(),
        jwt_secret: app_config.jwt_secret.clone(),
        admin_email: None,
        admin_password: None,
        admin_name: None,
    };
    let mut test_client = PluggyClient::new(test_config);
    
    println!("Testando conexão com Pluggy API...");
    match test_client.test_connection().await {
        Ok(message) => {
            println!("✓ {}", message);
        }
        Err(e) => {
            eprintln!("✗ Erro ao conectar com Pluggy API: {}", e);
            // std::process::exit(1); // Não vamos parar o servidor se a Pluggy falhar por enquanto
        }
    }

    // Configura CORS
    let cors = CorsOptions::default()
        .allowed_origins(AllowedOrigins::all())
        .allowed_methods(
            vec![
                rocket::http::Method::Get, 
                rocket::http::Method::Post, 
                rocket::http::Method::Put, 
                rocket::http::Method::Delete,
                rocket::http::Method::Options
            ]
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
        .manage(app_config)
        .manage(pool)
        .attach(cors)
        .mount("/", routes![
            health, 
            create_connect_token, 
            auth::register, 
            auth::login,
            transactions::get_transactions,
            transactions::create_transaction,
            transactions::delete_transaction,
            transactions::update_transaction,
            items::create_item,
            accounts::get_total_balance,
            accounts::get_total_expenses,
            accounts::get_monthly_expenses
        ])
        .launch()
        .await?;

    Ok(())
}
