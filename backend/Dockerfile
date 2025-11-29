# Build stage
FROM rust:slim as builder

WORKDIR /usr/src/app

# Instalar dependências de build
RUN apt-get update && apt-get install -y pkg-config libssl-dev && rm -rf /var/lib/apt/lists/*

# Copiar tudo de uma vez para evitar camadas extras e uso de disco intermediário
COPY . .

# Forçar modo offline do SQLx (requer que o cache .sqlx esteja presente e completo)
ENV SQLX_OFFLINE=true

# Build da aplicação real em um único passo e limpar target logo em seguida para economizar espaço na imagem final (embora em multi-stage isso importe menos para a imagem final, importa para o cache de build)
RUN cargo build --release && strip target/release/firebudget-backend

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
