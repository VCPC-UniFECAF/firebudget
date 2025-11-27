use serde::{Deserialize, Serialize};

#[derive(Debug, Serialize, Deserialize)]
pub struct ApiKeyResponse {
    #[serde(rename = "apiKey")]
    pub api_key: String,
    #[serde(rename = "expiresIn")]
    pub expires_in: Option<i64>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct Item {
    pub id: String,
    pub connector: Option<serde_json::Value>,
    #[serde(rename = "createdAt")]
    pub created_at: String,
    #[serde(rename = "updatedAt")]
    pub updated_at: Option<String>,
    pub status: String,
    #[serde(rename = "executionStatus")]
    pub execution_status: Option<String>,
    pub error: Option<serde_json::Value>,
    pub parameter: Option<serde_json::Value>,
    #[serde(rename = "clientUserId")]
    pub client_user_id: Option<String>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct PageResponse<T> {
    pub results: Vec<T>,
    pub total: u32,
    #[serde(rename = "totalPages")]
    pub total_pages: u32,
    pub page: u32,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct Account {
    pub id: String,
    #[serde(rename = "itemId")]
    pub item_id: Option<String>,
    pub name: Option<String>,
    pub number: Option<String>,
    pub balance: Option<f64>,
    #[serde(rename = "currencyCode")]
    pub currency_code: Option<String>,
    #[serde(rename = "type")]
    pub type_field: Option<String>,
    pub subtype: Option<String>,
    #[serde(rename = "bankData")]
    pub bank_data: Option<serde_json::Value>,
    #[serde(rename = "creditData")]
    pub credit_data: Option<serde_json::Value>,
    #[serde(rename = "loanData")]
    pub loan_data: Option<serde_json::Value>,
    #[serde(rename = "investmentData")]
    pub investment_data: Option<serde_json::Value>,
    #[serde(rename = "createdAt")]
    pub created_at: String,
    #[serde(rename = "updatedAt")]
    pub updated_at: Option<String>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct Transaction {
    pub id: String,
    #[serde(rename = "accountId")]
    pub account_id: String,
    #[serde(rename = "itemId")]
    pub item_id: Option<String>,
    pub amount: f64,
    pub date: String,
    pub description: Option<String>,
    pub category: Option<String>,
    pub subcategory: Option<String>,
    #[serde(rename = "currencyCode")]
    pub currency_code: String,
    pub merchant: Option<serde_json::Value>,
    pub balance: Option<f64>,
    pub status: Option<String>,
    #[serde(rename = "createdAt")]
    pub created_at: String,
    #[serde(rename = "updatedAt")]
    pub updated_at: Option<String>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct Balance {
    pub id: String,
    #[serde(rename = "accountId")]
    pub account_id: String,
    #[serde(rename = "itemId")]
    pub item_id: Option<String>,
    pub balance: f64,
    pub currency: String,
    #[serde(rename = "createdAt")]
    pub created_at: String,
    #[serde(rename = "updatedAt")]
    pub updated_at: Option<String>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct ErrorResponse {
    pub detail: Option<String>,
    pub message: Option<String>,
    pub code: Option<String>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct ConnectTokenResponse {
    #[serde(rename = "accessToken")]
    pub connect_token: String,
}
