# FireBudget

Plataforma de controle financeiro com integração bancária através da Pluggy API.

## Estrutura do Projeto

```
firebudget/
├── backend/          # Backend em Rust com Rocket
│   ├── src/
│   │   ├── main.rs
│   │   ├── config.rs
│   │   └── pluggy/
│   │       ├── mod.rs
│   │       ├── client.rs
│   │       └── models.rs
│   ├── Cargo.toml
│   └── .env.example
├── frontend/         # Frontend React
└── docker-compose.yml # Orquestração com Docker
```

## Executando com Docker Compose (Recomendado)

Para iniciar toda a aplicação (Banco de dados, Backend e Frontend) em containers:

1. Certifique-se de ter o Docker e Docker Compose instalados.
2. Crie o arquivo `.env` na raiz do projeto (ou configure as variáveis no `docker-compose.yml`):
   ```bash
   PLUGGY_CLIENT_ID=seu_client_id
   PLUGGY_CLIENT_SECRET=seu_client_secret
   PLUGGY_ENV=sandbox
   ```
3. Execute:
   ```bash
   docker-compose up --build
   ```

O sistema estará disponível em:
- Frontend: http://localhost:80
- Backend: http://localhost:8000

O banco de dados PostgreSQL será inicializado automaticamente com as tabelas necessárias.

## Configuração Manual do Backend

### Pré-requisitos

- Rust (versão 1.80 ou superior recomendada)
  - Para atualizar o Rust: `rustup update stable`
- Cargo (gerenciador de pacotes do Rust)
- Credenciais da Pluggy API (obtenha em https://pluggy.ai/)
- PostgreSQL (para banco de dados local)

**Nota:** Se você encontrar erros de compilação relacionados a versões do Rust, atualize para a versão mais recente usando `rustup update stable`.

### Instalação

1. Navegue até o diretório do backend:
```bash
cd backend
```

2. Copie o arquivo de exemplo de variáveis de ambiente:
```bash
cp .env.example .env
```

3. Edite o arquivo `.env` e adicione suas credenciais da Pluggy e URL do banco:
```
PLUGGY_CLIENT_ID=seu_client_id_aqui
PLUGGY_CLIENT_SECRET=seu_client_secret_aqui
PLUGGY_ENV=sandbox
DATABASE_URL=postgres://user:pass@localhost:5432/firebudget
```

4. Compile e execute o projeto:
```bash
cargo run
```

## Funcionalidades da Pluggy API

O backend está configurado com as seguintes funcionalidades:

- **Autenticação**: Autenticação com renovação automática de token
- **Links**: Criação e listagem de links bancários
- **Contas**: Busca de contas bancárias
- **Transações**: Extração de transações bancárias
- **Saldos**: Consulta de saldos de contas

## Desenvolvimento

### Estrutura do Código

- `main.rs`: Ponto de entrada da aplicação e teste de conexão
- `config.rs`: Gerenciamento de configurações e variáveis de ambiente
- `pluggy/client.rs`: Cliente HTTP para interação com a API Pluggy
- `pluggy/models.rs`: Modelos de dados para serialização/deserialização

### Testes

Para testar a conexão com a Pluggy API:

```bash
cd backend
cargo run
```

O programa irá:
1. Carregar as configurações do arquivo `.env`
2. Autenticar na API Pluggy
3. Exibir mensagem de confirmação se a conexão for bem-sucedida

## Próximos Passos

- Implementar endpoints REST para expor funcionalidades da Pluggy
- Adicionar tratamento de erros mais robusto
- Implementar cache de tokens
- Desenvolver frontend para interface do usuário

## Documentação

- [Pluggy API Documentation](https://pluggy.ai/)
- [Rocket Framework](https://rocket.rs/)
- [Rust Book](https://doc.rust-lang.org/book/)
