use std::env;

pub struct PluggyConfig {
    pub client_id: String,
    pub client_secret: String,
    pub environment: String,
    pub base_url: String,
}

impl PluggyConfig {
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

        Ok(PluggyConfig {
            client_id,
            client_secret,
            environment,
            base_url: base_url.to_string(),
        })
    }
}

