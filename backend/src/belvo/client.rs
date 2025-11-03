use crate::belvo::models::*;
use crate::config::BelvoConfig;
use anyhow::Result;
use reqwest::Client;
use std::time::{SystemTime, UNIX_EPOCH};

pub struct BelvoClient {
    client: Client,
    config: BelvoConfig,
    access_token: Option<String>,
    token_expires_at: Option<u64>,
}

impl BelvoClient {
    pub fn new(config: BelvoConfig) -> Self {
        BelvoClient {
            client: Client::new(),
            config,
            access_token: None,
            token_expires_at: None,
        }
    }

    async fn authenticate(&mut self) -> Result<String> {
        // Verifica se o token ainda é válido
        if let (Some(token), Some(expires_at)) = (&self.access_token, self.token_expires_at) {
            let now = SystemTime::now()
                .duration_since(UNIX_EPOCH)
                .unwrap()
                .as_secs();
            
            if now < expires_at - 60 {
                return Ok(token.clone());
            }
        }

        // Cria credenciais Basic Auth
        let credentials = format!("{}:{}", self.config.secret_id, self.config.secret_password);
        let encoded = base64::encode(credentials);

        let url = format!("{}/api/token/", self.config.base_url);
        
        let response = self
            .client
            .post(&url)
            .header("Authorization", format!("Basic {}", encoded))
            .header("Content-Type", "application/x-www-form-urlencoded")
            .form(&[("grant_type", "client_credentials")])
            .send()
            .await?;

        if !response.status().is_success() {
            let error_text = response.text().await?;
            return Err(anyhow::anyhow!("Erro na autenticação: {}", error_text));
        }

        let token_response: TokenResponse = response.json().await?;
        
        // Calcula quando o token expira (padrão: 3600 segundos se não especificado)
        let expires_in = token_response.expires_in.unwrap_or(3600);
        let expires_at = SystemTime::now()
            .duration_since(UNIX_EPOCH)
            .unwrap()
            .as_secs() + expires_in as u64;

        self.access_token = Some(token_response.access.clone());
        self.token_expires_at = Some(expires_at);

        Ok(token_response.access)
    }

    async fn get_authorization_header(&mut self) -> Result<String> {
        let token = self.authenticate().await?;
        Ok(format!("Bearer {}", token))
    }

    pub async fn create_link(
        &mut self,
        institution: &str,
        username: &str,
        password: &str,
    ) -> Result<Link> {
        let auth_header = self.get_authorization_header().await?;
        let url = format!("{}/api/links/", self.config.base_url);

        let payload = serde_json::json!({
            "institution": institution,
            "username": username,
            "password": password,
            "save_data": true
        });

        let response = self
            .client
            .post(&url)
            .header("Authorization", &auth_header)
            .header("Content-Type", "application/json")
            .json(&payload)
            .send()
            .await?;

        if !response.status().is_success() {
            let error_text = response.text().await?;
            return Err(anyhow::anyhow!("Erro ao criar link: {}", error_text));
        }

        let link: Link = response.json().await?;
        Ok(link)
    }

    pub async fn get_links(&mut self) -> Result<Vec<Link>> {
        let auth_header = self.get_authorization_header().await?;
        let url = format!("{}/api/links/", self.config.base_url);

        let response = self
            .client
            .get(&url)
            .header("Authorization", &auth_header)
            .send()
            .await?;

        if !response.status().is_success() {
            let error_text = response.text().await?;
            return Err(anyhow::anyhow!("Erro ao buscar links: {}", error_text));
        }

        let links: Vec<Link> = response.json().await?;
        Ok(links)
    }

    pub async fn get_accounts(&mut self, link_id: Option<&str>) -> Result<Vec<Account>> {
        let auth_header = self.get_authorization_header().await?;
        let mut url = format!("{}/api/accounts/", self.config.base_url);

        if let Some(link_id) = link_id {
            url = format!("{}?link={}", url, link_id);
        }

        let response = self
            .client
            .get(&url)
            .header("Authorization", &auth_header)
            .send()
            .await?;

        if !response.status().is_success() {
            let error_text = response.text().await?;
            return Err(anyhow::anyhow!("Erro ao buscar contas: {}", error_text));
        }

        let accounts: Vec<Account> = response.json().await?;
        Ok(accounts)
    }

    pub async fn get_transactions(
        &mut self,
        link_id: Option<&str>,
        account_id: Option<&str>,
    ) -> Result<Vec<Transaction>> {
        let auth_header = self.get_authorization_header().await?;
        let mut url = format!("{}/api/transactions/", self.config.base_url);

        let mut params = Vec::new();
        if let Some(link_id) = link_id {
            params.push(format!("link={}", link_id));
        }
        if let Some(account_id) = account_id {
            params.push(format!("account={}", account_id));
        }

        if !params.is_empty() {
            url = format!("{}?{}", url, params.join("&"));
        }

        let response = self
            .client
            .get(&url)
            .header("Authorization", &auth_header)
            .send()
            .await?;

        if !response.status().is_success() {
            let error_text = response.text().await?;
            return Err(anyhow::anyhow!("Erro ao buscar transações: {}", error_text));
        }

        let transactions: Vec<Transaction> = response.json().await?;
        Ok(transactions)
    }

    pub async fn get_balances(
        &mut self,
        link_id: Option<&str>,
        account_id: Option<&str>,
    ) -> Result<Vec<Balance>> {
        let auth_header = self.get_authorization_header().await?;
        let mut url = format!("{}/api/balances/", self.config.base_url);

        let mut params = Vec::new();
        if let Some(link_id) = link_id {
            params.push(format!("link={}", link_id));
        }
        if let Some(account_id) = account_id {
            params.push(format!("account={}", account_id));
        }

        if !params.is_empty() {
            url = format!("{}?{}", url, params.join("&"));
        }

        let response = self
            .client
            .get(&url)
            .header("Authorization", &auth_header)
            .send()
            .await?;

        if !response.status().is_success() {
            let error_text = response.text().await?;
            return Err(anyhow::anyhow!("Erro ao buscar saldos: {}", error_text));
        }

        let balances: Vec<Balance> = response.json().await?;
        Ok(balances)
    }

    pub async fn test_connection(&mut self) -> Result<String> {
        let token = self.authenticate().await?;
        Ok(format!("Conexão com Belvo API estabelecida com sucesso! Token obtido: {}...", &token[..20]))
    }
}

