use serde::{Deserialize, Serialize};

#[derive(Debug, Serialize, Deserialize)]
pub struct TokenResponse {
    pub access: String,
    pub refresh: Option<String>,
    pub expires_in: Option<i64>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct Link {
    pub id: String,
    pub institution: String,
    pub access_mode: String,
    pub status: String,
    pub created_at: String,
    pub external_id: Option<String>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct Account {
    pub id: String,
    pub link: String,
    pub name: Option<String>,
    pub number: Option<String>,
    pub category: Option<String>,
    pub balance: Option<f64>,
    pub currency: Option<String>,
    pub bank_product_id: Option<String>,
    pub created_at: String,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct Transaction {
    pub id: String,
    pub link: String,
    pub account: Option<String>,
    pub account_holder: Option<serde_json::Value>,
    pub category: Option<String>,
    pub subcategory: Option<String>,
    pub merchant: Option<serde_json::Value>,
    pub amount: f64,
    pub currency: String,
    pub description: Option<String>,
    pub value_date: Option<String>,
    pub accounting_date: Option<String>,
    pub internal_identification: Option<String>,
    pub created_at: String,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct Balance {
    pub id: String,
    pub link: String,
    pub account: String,
    pub balance: f64,
    pub currency: String,
    pub created_at: String,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct ErrorResponse {
    pub detail: Option<String>,
    pub message: Option<String>,
}

