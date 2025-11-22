use crate::models::transaction::{NewTransaction, Transaction};
use crate::config::AppConfig; // Used for JWT secret verification if we manually decode token
use rocket::http::Status;
use rocket::serde::json::Json;
use rocket::{delete, get, post, put, State};
use sqlx::PgPool;
use uuid::Uuid;
use rocket::request::{Outcome, Request, FromRequest};
use jsonwebtoken::{decode, Validation, DecodingKey};
use serde::{Deserialize, Serialize};

// --- Auth Middleware Placeholder ---
// In a real app, this should be in a shared module. 
// Re-implementing `Claims` here to allow decoding.
#[derive(Debug, Serialize, Deserialize)]
struct Claims {
    sub: String,
    exp: usize,
    iat: usize,
}

pub struct AuthenticatedUser {
    pub id: Uuid,
}

#[rocket::async_trait]
impl<'r> FromRequest<'r> for AuthenticatedUser {
    type Error = ();

    async fn from_request(request: &'r Request<'_>) -> Outcome<Self, Self::Error> {
        let keys: Vec<_> = request.headers().get("Authorization").collect();
        if keys.len() != 1 {
            return Outcome::Forward(Status::Unauthorized);
        }

        let token_str = keys[0].replace("Bearer ", "");
        let config = request.guard::<&State<std::sync::Arc<AppConfig>>>().await;
        
        if let Outcome::Success(config) = config {
            let validation = Validation::default();
            let token_data = decode::<Claims>(
                &token_str,
                &DecodingKey::from_secret(config.jwt_secret.as_bytes()),
                &validation,
            );

            match token_data {
                Ok(c) => {
                    if let Ok(uuid) = Uuid::parse_str(&c.claims.sub) {
                        Outcome::Success(AuthenticatedUser { id: uuid })
                    } else {
                        Outcome::Forward(Status::Unauthorized)
                    }
                },
                Err(_) => Outcome::Forward(Status::Unauthorized),
            }
        } else {
             Outcome::Forward(Status::InternalServerError)
        }
    }
}


#[get("/transactions")]
pub async fn get_transactions(
    user: AuthenticatedUser,
    pool: &State<PgPool>,
) -> Result<Json<Vec<Transaction>>, Status> {
    let transactions = sqlx::query_as!(
        Transaction,
        r#"
        SELECT 
            id, pluggy_transaction_id, account_id, item_id, amount, date, 
            description, category, subcategory, currency, status, merchant, balance, 
            created_at, updated_at 
        FROM transactions 
        WHERE user_id = $1
        ORDER BY date DESC
        "#,
        user.id
    )
    .fetch_all(pool.inner())
    .await
    .map_err(|_| Status::InternalServerError)?;

    Ok(Json(transactions))
}

#[post("/transactions", format = "json", data = "<new_transaction>")]
pub async fn create_transaction(
    user: AuthenticatedUser,
    new_transaction: Json<NewTransaction>,
    pool: &State<PgPool>,
) -> Result<Json<Transaction>, Status> {
    let transaction = sqlx::query_as!(
        Transaction,
        r#"
        INSERT INTO transactions (user_id, amount, date, description, category, currency)
        VALUES ($1, $2, $3, $4, $5, $6)
        RETURNING 
            id, pluggy_transaction_id, account_id, item_id, amount, date, 
            description, category, subcategory, currency, status, merchant, balance, 
            created_at, updated_at
        "#,
        user.id,
        new_transaction.amount,
        new_transaction.date,
        new_transaction.description,
        new_transaction.category,
        new_transaction.currency
    )
    .fetch_one(pool.inner())
    .await
    .map_err(|e| {
        eprintln!("Erro ao criar transação: {}", e);
        Status::InternalServerError
    })?;

    Ok(Json(transaction))
}

#[delete("/transactions/<id>")]
pub async fn delete_transaction(
    user: AuthenticatedUser,
    id: Uuid,
    pool: &State<PgPool>,
) -> Result<Status, Status> {
    let result = sqlx::query!(
        "DELETE FROM transactions WHERE id = $1 AND user_id = $2",
        id,
        user.id
    )
    .execute(pool.inner())
    .await
    .map_err(|_| Status::InternalServerError)?;

    if result.rows_affected() == 0 {
        return Err(Status::NotFound);
    }

    Ok(Status::NoContent)
}

#[put("/transactions/<id>", format = "json", data = "<updated_transaction>")]
pub async fn update_transaction(
    user: AuthenticatedUser,
    id: Uuid,
    updated_transaction: Json<NewTransaction>,
    pool: &State<PgPool>,
) -> Result<Json<Transaction>, Status> {
    let transaction = sqlx::query_as!(
        Transaction,
        r#"
        UPDATE transactions 
        SET amount = $1, date = $2, description = $3, category = $4, currency = $5
        WHERE id = $6 AND user_id = $7
        RETURNING 
            id, pluggy_transaction_id, account_id, item_id, amount, date, 
            description, category, subcategory, currency, status, merchant, balance, 
            created_at, updated_at
        "#,
        updated_transaction.amount,
        updated_transaction.date,
        updated_transaction.description,
        updated_transaction.category,
        updated_transaction.currency,
        id,
        user.id
    )
    .fetch_optional(pool.inner())
    .await
    .map_err(|_| Status::InternalServerError)?;

    match transaction {
        Some(t) => Ok(Json(t)),
        None => Err(Status::NotFound),
    }
}


