use crate::pluggy::models::*;
use crate::config::PluggyConfig;
use anyhow::Result;
use reqwest::Client;
use std::time::{SystemTime, UNIX_EPOCH};

pub struct PluggyClient {
    client: Client,
    config: PluggyConfig,
    api_key: Option<String>,
    api_key_expires_at: Option<u64>,
}

impl PluggyClient {
    pub fn new(config: PluggyConfig) -> Self {
        PluggyClient {
            client: Client::new(),
            config,
            api_key: None,
            api_key_expires_at: None,
        }
    }

    async fn authenticate(&mut self) -> Result<String> {
        // Verifica se o API Key ainda é válido
        if let (Some(key), Some(expires_at)) = (&self.api_key, self.api_key_expires_at) {
            let now = SystemTime::now()
                .duration_since(UNIX_EPOCH)
                .unwrap()
                .as_secs();
            
            // Renova se faltar menos de 5 minutos
            if now < expires_at - 300 {
                return Ok(key.clone());
            }
        }

        // Obtém API Key usando CLIENT_ID e CLIENT_SECRET
        let url = format!("{}/auth", self.config.base_url);
        
        let response = self
            .client
            .post(&url)
            .header("Content-Type", "application/json")
            .json(&serde_json::json!({
                "clientId": self.config.client_id,
                "clientSecret": self.config.client_secret
            }))
            .send()
            .await?;

        if !response.status().is_success() {
            let error_text = response.text().await?;
            return Err(anyhow::anyhow!("Erro na autenticação: {}", error_text));
        }

        let api_key_response: ApiKeyResponse = response.json().await?;
        
        // Calcula quando o API Key expira (padrão: 7200 segundos = 2 horas se não especificado)
        let expires_in = api_key_response.expires_in.unwrap_or(7200);
        let expires_at = SystemTime::now()
            .duration_since(UNIX_EPOCH)
            .unwrap()
            .as_secs() + expires_in as u64;

        self.api_key = Some(api_key_response.api_key.clone());
        self.api_key_expires_at = Some(expires_at);

        Ok(api_key_response.api_key)
    }

    async fn get_api_key_header(&mut self) -> Result<String> {
        let api_key = self.authenticate().await?;
        Ok(api_key)
    }

    pub async fn create_item(
        &mut self,
        connector_id: &str,
        parameters: Option<serde_json::Value>,
    ) -> Result<Item> {
        let api_key = self.get_api_key_header().await?;
        let url = format!("{}/items", self.config.base_url);

        let mut payload = serde_json::json!({
            "connectorId": connector_id
        });

        if let Some(params) = parameters {
            payload["parameters"] = params;
        }

        let response = self
            .client
            .post(&url)
            .header("X-API-KEY", &api_key)
            .header("Content-Type", "application/json")
            .json(&payload)
            .send()
            .await?;

        if !response.status().is_success() {
            let error_text = response.text().await?;
            return Err(anyhow::anyhow!("Erro ao criar item: {}", error_text));
        }

        let item: Item = response.json().await?;
        Ok(item)
    }

    pub async fn get_items(&mut self) -> Result<Vec<Item>> {
        let api_key = self.get_api_key_header().await?;
        let url = format!("{}/items", self.config.base_url);

        let response = self
            .client
            .get(&url)
            .header("X-API-KEY", &api_key)
            .send()
            .await?;

        if !response.status().is_success() {
            let error_text = response.text().await?;
            return Err(anyhow::anyhow!("Erro ao buscar items: {}", error_text));
        }

        let items: Vec<Item> = response.json().await?;
        Ok(items)
    }

    pub async fn get_accounts(&mut self, item_id: Option<&str>) -> Result<Vec<Account>> {
        let api_key = self.get_api_key_header().await?;
        let mut url = format!("{}/accounts", self.config.base_url);

        if let Some(item_id) = item_id {
            url = format!("{}?itemId={}", url, item_id);
        }

        let response = self
            .client
            .get(&url)
            .header("X-API-KEY", &api_key)
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
        item_id: Option<&str>,
        account_id: Option<&str>,
    ) -> Result<Vec<Transaction>> {
        let api_key = self.get_api_key_header().await?;
        let mut url = format!("{}/transactions", self.config.base_url);

        let mut params = Vec::new();
        if let Some(item_id) = item_id {
            params.push(format!("itemId={}", item_id));
        }
        if let Some(account_id) = account_id {
            params.push(format!("accountId={}", account_id));
        }

        if !params.is_empty() {
            url = format!("{}?{}", url, params.join("&"));
        }

        let response = self
            .client
            .get(&url)
            .header("X-API-KEY", &api_key)
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
        item_id: Option<&str>,
        account_id: Option<&str>,
    ) -> Result<Vec<Balance>> {
        let api_key = self.get_api_key_header().await?;
        let mut url = format!("{}/balances", self.config.base_url);

        let mut params = Vec::new();
        if let Some(item_id) = item_id {
            params.push(format!("itemId={}", item_id));
        }
        if let Some(account_id) = account_id {
            params.push(format!("accountId={}", account_id));
        }

        if !params.is_empty() {
            url = format!("{}?{}", url, params.join("&"));
        }

        let response = self
            .client
            .get(&url)
            .header("X-API-KEY", &api_key)
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
        let api_key = self.authenticate().await?;
        Ok(format!("Conexão com Pluggy API estabelecida com sucesso! API Key obtido: {}...", &api_key[..20.min(api_key.len())]))
    }

    pub async fn create_connect_token(&mut self) -> Result<ConnectTokenResponse> {
        let api_key = self.get_api_key_header().await?;
        let url = format!("{}/connect_token", self.config.base_url);

        eprintln!("Criando connect token na URL: {}", url);
        eprintln!("API Key (primeiros 20 chars): {}...", &api_key[..20.min(api_key.len())]);

        let response = self
            .client
            .post(&url)
            .header("X-API-KEY", &api_key)
            .header("Content-Type", "application/json")
            .send()
            .await?;

        let status = response.status();
        eprintln!("Status da resposta: {}", status);

        if !status.is_success() {
            let error_text = response.text().await?;
            eprintln!("Erro da API Pluggy: {}", error_text);
            return Err(anyhow::anyhow!("Erro ao criar connect token (status {}): {}", status, error_text));
        }

        let response_text = response.text().await?;
        eprintln!("Resposta da API: {}", response_text);
        
        let connect_token_response: ConnectTokenResponse = serde_json::from_str(&response_text)
            .map_err(|e| anyhow::anyhow!("Erro ao deserializar resposta: {}. Resposta: {}", e, response_text))?;
        
        Ok(connect_token_response)
    }
}

