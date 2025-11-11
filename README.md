# FireBudget

Plataforma de controle financeiro com integração bancária através da Belvo API.

## Estrutura do Projeto

```
firebudget/
├── backend/          # Backend em Rust com Rocket
│   ├── src/
│   │   ├── main.rs
│   │   ├── config.rs
│   │   └── belvo/
│   │       ├── mod.rs
│   │       ├── client.rs
│   │       └── models.rs
│   ├── Cargo.toml
│   └── .env.example
└── frontend/         # Espaço reservado para frontend
```

## Configuração do Backend

### Pré-requisitos

- Rust (versão 1.80 ou superior recomendada)
  - Para atualizar o Rust: `rustup update stable`
- Cargo (gerenciador de pacotes do Rust)
- Credenciais da Belvo API (obtenha em https://developers.belvo.com/)

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

3. Edite o arquivo `.env` e adicione suas credenciais da Belvo:
```
BELVO_SECRET_ID=seu_secret_id_aqui
BELVO_SECRET_PASSWORD=sua_secret_password_aqui
BELVO_ENV=sandbox
```

4. Compile e execute o projeto:
```bash
cargo run
```

## Funcionalidades da Belvo API

O backend está configurado com as seguintes funcionalidades:

- **Autenticação**: Autenticação OAuth2 com renovação automática de token
- **Links**: Criação e listagem de links bancários
- **Contas**: Busca de contas bancárias
- **Transações**: Extração de transações bancárias
- **Saldos**: Consulta de saldos de contas

## Desenvolvimento

### Estrutura do Código

- `main.rs`: Ponto de entrada da aplicação e teste de conexão
- `config.rs`: Gerenciamento de configurações e variáveis de ambiente
- `belvo/client.rs`: Cliente HTTP para interação com a API Belvo
- `belvo/models.rs`: Modelos de dados para serialização/deserialização

### Testes

Para testar a conexão com a Belvo API:

```bash
cd backend
cargo run
```

O programa irá:
1. Carregar as configurações do arquivo `.env`
2. Autenticar na API Belvo
3. Exibir mensagem de confirmação se a conexão for bem-sucedida

## Próximos Passos

- Implementar endpoints REST para expor funcionalidades da Belvo
- Adicionar tratamento de erros mais robusto
- Implementar cache de tokens
- Desenvolver frontend para interface do usuário

## Documentação

- [Belvo API Documentation](https://developers.belvo.com/)
- [Rocket Framework](https://rocket.rs/)
- [Rust Book](https://doc.rust-lang.org/book/)

