use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};
use sqlx::FromRow;
use uuid::Uuid;

#[derive(Debug, Serialize, Deserialize, FromRow)]
pub struct Balance {
    pub id: Uuid,
    pub pluggy_balance_id: String,
    pub account_id: Uuid,
    pub item_id: Uuid,
    pub balance: rust_decimal::Decimal,
    pub currency: String,
    pub created_at: Option<DateTime<Utc>>,
    pub updated_at: Option<DateTime<Utc>>,
}

#[derive(Debug, Deserialize)]
pub struct NewBalance {
    pub pluggy_balance_id: String,
    pub account_id: Uuid,
    pub item_id: Uuid,
    pub balance: rust_decimal::Decimal,
    pub currency: String,
}

impl Balance {
    /// Busca saldos por account_id
    pub async fn find_by_account_id(
        pool: &sqlx::PgPool,
        account_id: Uuid,
    ) -> Result<Vec<Self>, sqlx::Error> {
        sqlx::query_as::<_, Balance>(
            "SELECT id, pluggy_balance_id, account_id, item_id, balance, currency, created_at, updated_at FROM balances WHERE account_id = $1 ORDER BY updated_at DESC"
        )
        .bind(account_id)
        .fetch_all(pool)
        .await
    }

    /// Busca saldos por item_id
    pub async fn find_by_item_id(
        pool: &sqlx::PgPool,
        item_id: Uuid,
    ) -> Result<Vec<Self>, sqlx::Error> {
        sqlx::query_as::<_, Balance>(
            "SELECT id, pluggy_balance_id, account_id, item_id, balance, currency, created_at, updated_at FROM balances WHERE item_id = $1 ORDER BY updated_at DESC"
        )
        .bind(item_id)
        .fetch_all(pool)
        .await
    }
}

