use std::env;

pub struct BelvoConfig {
    pub secret_id: String,
    pub secret_password: String,
    pub environment: String,
    pub base_url: String,
}

impl BelvoConfig {
    pub fn from_env() -> anyhow::Result<Self> {
        let secret_id = env::var("BELVO_SECRET_ID")
            .map_err(|_| anyhow::anyhow!("BELVO_SECRET_ID não encontrada"))?;
        
        let secret_password = env::var("BELVO_SECRET_PASSWORD")
            .map_err(|_| anyhow::anyhow!("BELVO_SECRET_PASSWORD não encontrada"))?;
        
        let environment = env::var("BELVO_ENV").unwrap_or_else(|_| "sandbox".to_string());
        
        let base_url = match environment.as_str() {
            "production" => "https://api.belvo.com",
            "sandbox" => "https://sandbox.belvo.com",
            _ => "https://sandbox.belvo.com",
        };

        Ok(BelvoConfig {
            secret_id,
            secret_password,
            environment,
            base_url: base_url.to_string(),
        })
    }
}

