mod config;
mod belvo;

use config::BelvoConfig;
use belvo::client::BelvoClient;
use dotenv::dotenv;

#[tokio::main]
async fn main() {
    // Carrega variáveis de ambiente do arquivo .env
    dotenv().ok();

    // Carrega configuração da Belvo
    let belvo_config = match BelvoConfig::from_env() {
        Ok(config) => config,
        Err(e) => {
            eprintln!("Erro ao carregar configuração: {}", e);
            eprintln!("Certifique-se de que as variáveis BELVO_SECRET_ID e BELVO_SECRET_PASSWORD estão definidas no arquivo .env");
            std::process::exit(1);
        }
    };

    // Cria cliente Belvo e testa conexão
    let mut belvo_client = BelvoClient::new(belvo_config);
    
    println!("Testando conexão com Belvo API...");
    match belvo_client.test_connection().await {
        Ok(message) => {
            println!("✓ {}", message);
        }
        Err(e) => {
            eprintln!("✗ Erro ao conectar com Belvo API: {}", e);
            std::process::exit(1);
        }
    }

    println!("\nBackend iniciado com sucesso!");
    println!("A API da Belvo está pronta para uso.");
    println!("\nO servidor Rocket será iniciado em uma versão futura.");
    println!("Por enquanto, a integração Belvo está funcionando corretamente.");
}
