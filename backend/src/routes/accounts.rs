use crate::routes::transactions::AuthenticatedUser;
use chrono::{Datelike, Utc};
use rocket::http::Status;
use rocket::serde::json::Json;
use rocket::{get, State};
use serde::{Deserialize, Serialize};
use sqlx::PgPool;
use rust_decimal::Decimal;

#[derive(Debug, Serialize)]
pub struct TotalBalanceResponse {
    pub total_balance: Decimal,
    pub currency: String,
}

#[get("/accounts/balance/total")]
pub async fn get_total_balance(
    user: AuthenticatedUser,
    pool: &State<PgPool>,
) -> Result<Json<TotalBalanceResponse>, Status> {
    let result = sqlx::query!(
        r#"
        SELECT COALESCE(SUM(a.balance), 0) as total_balance
        FROM accounts a
        INNER JOIN items i ON a.item_id = i.id
        WHERE i.user_id = $1
        "#,
        user.id
    )
    .fetch_one(pool.inner())
    .await
    .map_err(|e| {
        eprintln!("Erro ao buscar saldo total: {}", e);
        Status::InternalServerError
    })?;

    let total_balance = result.total_balance.unwrap_or(Decimal::ZERO);

    Ok(Json(TotalBalanceResponse {
        total_balance,
        currency: "BRL".to_string(),
    }))
}

#[derive(Debug, Serialize)]
pub struct TotalExpensesResponse {
    pub total_expenses: Decimal,
    pub currency: String,
}

#[get("/accounts/expenses/total")]
pub async fn get_total_expenses(
    user: AuthenticatedUser,
    pool: &State<PgPool>,
) -> Result<Json<TotalExpensesResponse>, Status> {
    let result = sqlx::query!(
        r#"
        SELECT COALESCE(ABS(SUM(amount)), 0) as total_expenses
        FROM transactions
        WHERE user_id = $1 AND amount < 0
        "#,
        user.id
    )
    .fetch_one(pool.inner())
    .await
    .map_err(|e| {
        eprintln!("Erro ao buscar gastos totais: {}", e);
        Status::InternalServerError
    })?;

    let total_expenses = result.total_expenses.unwrap_or(Decimal::ZERO);

    Ok(Json(TotalExpensesResponse {
        total_expenses,
        currency: "BRL".to_string(),
    }))
}

#[derive(Debug, Serialize)]
pub struct MonthlyExpense {
    pub month: i32,
    pub year: i32,
    pub total: Decimal,
}

#[derive(Debug, Deserialize, rocket::FromForm)]
pub struct MonthlyExpensesQuery {
    pub year: Option<i32>,
}

#[get("/accounts/expenses/monthly?<query>")]
pub async fn get_monthly_expenses(
    user: AuthenticatedUser,
    query: MonthlyExpensesQuery,
    pool: &State<PgPool>,
) -> Result<Json<Vec<MonthlyExpense>>, Status> {
    let year = query.year.unwrap_or_else(|| Utc::now().year() as i32);
    
    let results = sqlx::query!(
        r#"
        SELECT 
            EXTRACT(MONTH FROM date)::INTEGER as month,
            EXTRACT(YEAR FROM date)::INTEGER as year,
            COALESCE(ABS(SUM(amount)), 0) as total
        FROM transactions
        WHERE user_id = $1 
          AND amount < 0
          AND EXTRACT(YEAR FROM date)::INTEGER = $2
        GROUP BY EXTRACT(MONTH FROM date), EXTRACT(YEAR FROM date)
        ORDER BY month
        "#,
        user.id,
        year
    )
    .fetch_all(pool.inner())
    .await
    .map_err(|e| {
        eprintln!("Erro ao buscar despesas mensais: {}", e);
        Status::InternalServerError
    })?;

    let monthly_expenses: Vec<MonthlyExpense> = results
        .into_iter()
        .map(|row| MonthlyExpense {
            month: row.month.unwrap_or(0),
            year: row.year.unwrap_or(year),
            total: row.total.unwrap_or(Decimal::ZERO),
        })
        .collect();

    Ok(Json(monthly_expenses))
}

#[derive(Debug, Serialize)]
pub struct AccountResponse {
    pub id: uuid::Uuid,
    pub name: String,
    pub balance: Decimal,
    pub currency: String,
    #[serde(rename = "type")]
    pub type_: Option<String>,
    pub number: Option<String>,
    pub item_id: uuid::Uuid,
    pub connector: Option<serde_json::Value>,
}

#[get("/accounts")]
pub async fn get_accounts(
    user: AuthenticatedUser,
    pool: &State<PgPool>,
) -> Result<Json<Vec<AccountResponse>>, Status> {
    let accounts = sqlx::query!(
        r#"
        SELECT 
            a.id, 
            a.name, 
            a.balance, 
            a.currency, 
            a.type as "type_", 
            a.number,
            a.item_id,
            i.connector as "connector?"
        FROM accounts a
        INNER JOIN items i ON a.item_id = i.id
        WHERE i.user_id = $1
        "#,
        user.id
    )
    .fetch_all(pool.inner())
    .await
    .map_err(|e| {
        eprintln!("Erro ao buscar contas: {}", e);
        Status::InternalServerError
    })?;

    let response = accounts
        .into_iter()
        .map(|row| AccountResponse {
            id: row.id,
            name: row.name.unwrap_or_else(|| "Conta sem nome".to_string()),
            balance: row.balance.unwrap_or(Decimal::ZERO),
            currency: row.currency.unwrap_or_else(|| "BRL".to_string()),
            type_: row.type_,
            number: row.number,
            item_id: row.item_id.unwrap(), // item_id is not null in DB schema but join might make it nullable if not careful, but here inner join
            connector: row.connector,
        })
        .collect();

    Ok(Json(response))
}
