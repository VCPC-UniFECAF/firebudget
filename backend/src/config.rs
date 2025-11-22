use std::env;

pub struct AppConfig {
    pub client_id: String,
    pub client_secret: String,
    pub environment: String,
    pub base_url: String,
    pub database_url: String,
    pub jwt_secret: String,
    pub admin_email: Option<String>,
    pub admin_password: Option<String>,
    pub admin_name: Option<String>,
}

impl AppConfig {
    pub fn from_env() -> anyhow::Result<Self> {
        let client_id = env::var("PLUGGY_CLIENT_ID")
            .map_err(|_| anyhow::anyhow!("PLUGGY_CLIENT_ID não encontrada"))?;
        
        let client_secret = env::var("PLUGGY_CLIENT_SECRET")
            .map_err(|_| anyhow::anyhow!("PLUGGY_CLIENT_SECRET não encontrada"))?;
        
        let environment = env::var("PLUGGY_ENV").unwrap_or_else(|_| "sandbox".to_string());
        
        let base_url = match environment.as_str() {
            "production" => "https://api.pluggy.ai",
            "sandbox" => "https://api.pluggy.ai",
            _ => "https://api.pluggy.ai",
        };

        let database_url = env::var("DATABASE_URL")
            .map_err(|_| anyhow::anyhow!("DATABASE_URL não encontrada"))?;

        let jwt_secret = env::var("JWT_SECRET")
            .map_err(|_| anyhow::anyhow!("JWT_SECRET não encontrada"))?;

        let admin_email = env::var("ADMIN_EMAIL").ok();
        let admin_password = env::var("ADMIN_PASSWORD").ok();
        let admin_name = env::var("ADMIN_NAME").ok();

        Ok(AppConfig {
            client_id,
            client_secret,
            environment,
            base_url: base_url.to_string(),
            database_url,
            jwt_secret,
            admin_email,
            admin_password,
            admin_name,
        })
    }
}
