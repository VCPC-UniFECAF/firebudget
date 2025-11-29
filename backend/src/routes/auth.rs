use crate::config::AppConfig;
use crate::models::user::{LoginUser, NewUser, User};
use argon2::{
    password_hash::{rand_core::OsRng, PasswordHash, PasswordHasher, PasswordVerifier, SaltString},
    Argon2,
};
use chrono::{Duration, Utc};
use jsonwebtoken::{encode, EncodingKey, Header};
use rocket::http::Status;
use rocket::serde::json::Json;
use rocket::{post, State};
use serde::{Deserialize, Serialize};
use sqlx::PgPool;
use std::sync::Arc;

#[derive(Debug, Serialize, Deserialize)]
pub struct AuthResponse {
    pub token: String,
    pub user: User,
}

#[derive(Debug, Serialize, Deserialize)]
struct Claims {
    sub: String,
    exp: usize,
    iat: usize,
}

#[post("/auth/register", format = "json", data = "<new_user>")]
pub async fn register(
    new_user: Json<NewUser>,
    pool: &State<PgPool>,
    config: &State<Arc<AppConfig>>,
) -> Result<Json<AuthResponse>, (Status, String)> {
    // Verifica se email já existe
    let user_exists = sqlx::query!(
        "SELECT id FROM users WHERE email = $1",
        new_user.email
    )
    .fetch_optional(pool.inner())
    .await
    .map_err(|e| (Status::InternalServerError, format!("Erro de banco de dados: {}", e)))?;

    if user_exists.is_some() {
        return Err((Status::Conflict, "Email já cadastrado".to_string()));
    }

    // Hash da senha
    let salt = SaltString::generate(&mut OsRng);
    let argon2 = Argon2::default();
    let password_hash = argon2
        .hash_password(new_user.password.as_bytes(), &salt)
        .map_err(|e| (Status::InternalServerError, format!("Erro ao criar hash da senha: {}", e)))?
        .to_string();

    // Inserir usuário
    let user = sqlx::query_as!(
        User,
        "INSERT INTO users (email, full_name, password_hash) VALUES ($1, $2, $3) RETURNING id, email, full_name, password_hash, created_at, updated_at",
        new_user.email,
        new_user.full_name,
        password_hash
    )
    .fetch_one(pool.inner())
    .await
    .map_err(|e| (Status::InternalServerError, format!("Erro ao criar usuário: {}", e)))?;

    // Gera JWT
    let expiration = Utc::now()
        .checked_add_signed(Duration::hours(24))
        .expect("valid timestamp")
        .timestamp();

    let claims = Claims {
        sub: user.id.to_string(),
        exp: expiration as usize,
        iat: Utc::now().timestamp() as usize,
    };

    let token = encode(
        &Header::default(),
        &claims,
        &EncodingKey::from_secret(config.jwt_secret.as_bytes()),
    )
    .map_err(|e| (Status::InternalServerError, format!("Erro ao gerar token: {}", e)))?;

    Ok(Json(AuthResponse { token, user }))
}

#[post("/auth/login", format = "json", data = "<login_user>")]
pub async fn login(
    login_user: Json<LoginUser>,
    pool: &State<PgPool>,
    config: &State<Arc<AppConfig>>,
) -> Result<Json<AuthResponse>, (Status, String)> {
    // Busca usuário
    let user = sqlx::query_as!(
        User,
        "SELECT id, email, full_name, password_hash, created_at, updated_at FROM users WHERE email = $1",
        login_user.email
    )
    .fetch_optional(pool.inner())
    .await
    .map_err(|e| (Status::InternalServerError, format!("Erro de banco de dados: {}", e)))?;

    let user = match user {
        Some(u) => u,
        None => return Err((Status::Unauthorized, "Email ou senha inválidos".to_string())),
    };

    // Verifica senha
    let parsed_hash = PasswordHash::new(&user.password_hash)
        .map_err(|e| (Status::InternalServerError, format!("Erro ao processar hash: {}", e)))?;
    
    if Argon2::default().verify_password(login_user.password.as_bytes(), &parsed_hash).is_err() {
        return Err((Status::Unauthorized, "Email ou senha inválidos".to_string()));
    }

    // Gera JWT
    let expiration = Utc::now()
        .checked_add_signed(Duration::hours(24))
        .expect("valid timestamp")
        .timestamp();

    let claims = Claims {
        sub: user.id.to_string(),
        exp: expiration as usize,
        iat: Utc::now().timestamp() as usize,
    };

    let token = encode(
        &Header::default(),
        &claims,
        &EncodingKey::from_secret(config.jwt_secret.as_bytes()),
    )
    .map_err(|e| (Status::InternalServerError, format!("Erro ao gerar token: {}", e)))?;

    Ok(Json(AuthResponse { token, user }))
}

