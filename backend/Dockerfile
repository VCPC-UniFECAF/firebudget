# Build stage
FROM rust:slim as builder

WORKDIR /usr/src/app

# Instalar dependências de build
RUN apt-get update && apt-get install -y pkg-config libssl-dev && rm -rf /var/lib/apt/lists/*

# Criar projeto dummy para cachear dependências
RUN mkdir src && \
    echo "fn main() {println!(\"if you see this, the build broke\")}" > src/main.rs

COPY Cargo.toml Cargo.lock ./

# Build apenas das dependências
RUN cargo build --release

# Remover o dummy e copiar o código fonte real
RUN rm -f target/release/deps/firebudget_backend*
COPY . .

# Forçar modo offline do SQLx e garantir que o diretório .sqlx seja copiado
ENV SQLX_OFFLINE=true

# Build da aplicação real
RUN cargo build --release

# Runtime stage
FROM debian:bookworm-slim

# Instalar dependências de runtime
RUN apt-get update && apt-get install -y libssl3 ca-certificates && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copiar binário do builder
COPY --from=builder /usr/src/app/target/release/firebudget-backend /app/firebudget-backend
COPY --from=builder /usr/src/app/.env.example /app/.env.example

EXPOSE 8000

CMD ["./firebudget-backend"]
