use chrono::{NaiveDate, DateTime, Utc};
use serde::{Deserialize, Serialize};
use sqlx::FromRow;
use uuid::Uuid;

#[derive(Debug, Serialize, Deserialize, FromRow)]
pub struct Transaction {
    pub id: Uuid,
    // pluggy_transaction_id is optional because manually created transactions won't have it
    pub pluggy_transaction_id: Option<String>,
    pub account_id: Option<Uuid>,
    pub item_id: Option<Uuid>,
    pub amount: rust_decimal::Decimal,
    pub date: NaiveDate,
    pub description: Option<String>,
    pub category: Option<String>,
    pub subcategory: Option<String>,
    pub currency: String,
    pub status: Option<String>,
    pub merchant: Option<serde_json::Value>,
    pub balance: Option<rust_decimal::Decimal>,
    pub created_at: Option<DateTime<Utc>>,
    pub updated_at: Option<DateTime<Utc>>,
    // user_id isn't in the table schema provided earlier for transactions directly, 
    // but usually we link via account -> item -> user. 
    // However, for manual transactions, we might need to link to a user directly or via a manual account.
    // Let's check the schema again.
}

#[derive(Debug, Deserialize)]
pub struct NewTransaction {
    pub amount: rust_decimal::Decimal,
    pub date: NaiveDate,
    pub description: String,
    pub category: Option<String>,
    pub currency: String,
}


