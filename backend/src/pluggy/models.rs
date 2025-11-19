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
pub struct Account {
    pub id: String,
    #[serde(rename = "itemId")]
    pub item_id: String,
    pub name: Option<String>,
    pub number: Option<String>,
    pub balance: Option<f64>,
    pub currency: Option<String>,
    pub r#type: Option<String>,
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
    pub item_id: String,
    pub amount: f64,
    pub date: String,
    pub description: Option<String>,
    pub category: Option<String>,
    pub subcategory: Option<String>,
    pub currency: String,
    pub merchant: Option<serde_json::Value>,
    pub balance: Option<f64>,
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
    pub item_id: String,
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

