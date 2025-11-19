import { useEffect, useRef, useState } from 'react'
import { pluggyService } from '../services/api'

function PluggyConnectModal({ isOpen, onClose }) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const pluggyConnectRef = useRef(null)
  const scriptLoadedRef = useRef(false)

  useEffect(() => {
    if (!isOpen) {
      return
    }

    const loadPluggyWidget = async () => {
      try {
        setLoading(true)
        setError(null)

        // Carrega o script do Pluggy Connect dinamicamente
        if (!scriptLoadedRef.current) {
          await loadPluggyScript()
          scriptLoadedRef.current = true
        }

        // Verifica se PluggyConnect está disponível (pode estar em window ou global)
        const PluggyConnectClass = window.PluggyConnect || (typeof PluggyConnect !== 'undefined' ? PluggyConnect : null)
        
        if (!PluggyConnectClass) {
          throw new Error('PluggyConnect não está disponível. Verifique se o script foi carregado corretamente.')
        }

        // Obtém o connectToken do backend
        const response = await pluggyService.getConnectToken()
        // O backend retorna accessToken (mapeado de accessToken da API Pluggy)
        const connectToken = response.accessToken || response.connectToken

        if (!connectToken) {
          throw new Error('Token não foi retornado pelo servidor')
        }

        console.log('Inicializando PluggyConnect com token:', connectToken.substring(0, 20) + '...')
        console.log('PluggyConnectClass:', PluggyConnectClass)
        console.log('Tipo:', typeof PluggyConnectClass)

        // Inicializa o widget
        // O PluggyConnect cria seu próprio modal, então não precisamos do container
        const config = {
          connectToken: connectToken,
          onSuccess: (item) => {
            console.log('Conexão bem-sucedida:', item)
            onClose()
            // Aqui você pode adicionar lógica para atualizar a lista de contas
            // Por exemplo, recarregar a lista de contas ou mostrar uma mensagem de sucesso
          },
          onError: (error) => {
            console.error('Erro ao conectar:', error)
            setError('Erro ao conectar com a instituição financeira. Tente novamente.')
          },
          onClose: () => {
            onClose()
          },
        }

        console.log('Configuração do widget:', config)
        
        const pluggyConnect = new PluggyConnectClass(config)
        
        console.log('Instância criada:', pluggyConnect)
        console.log('Métodos disponíveis:', Object.keys(pluggyConnect))
        console.log('Tipo da instância:', typeof pluggyConnect)

        pluggyConnectRef.current = pluggyConnect

        // Tenta diferentes formas de abrir o widget
        if (typeof pluggyConnect.open === 'function') {
          console.log('Chamando pluggyConnect.open()')
          pluggyConnect.open()
        } else if (typeof pluggyConnect.init === 'function') {
          console.log('Chamando pluggyConnect.init()')
          pluggyConnect.init()
        } else if (typeof pluggyConnect.launch === 'function') {
          console.log('Chamando pluggyConnect.launch()')
          pluggyConnect.launch()
        } else if (typeof pluggyConnect.show === 'function') {
          console.log('Chamando pluggyConnect.show()')
          pluggyConnect.show()
        } else {
          // Talvez o widget seja aberto automaticamente ao criar a instância
          console.log('Nenhum método open/init/launch/show encontrado. Verificando se o widget abriu automaticamente...')
          // Aguarda um pouco para ver se o widget abre automaticamente
          await new Promise(resolve => setTimeout(resolve, 1000))
          
          // Se ainda não abriu, tenta acessar diretamente
          if (pluggyConnect && typeof pluggyConnect === 'object') {
            console.log('Tentando acessar propriedades da instância:', Object.getOwnPropertyNames(pluggyConnect))
            console.log('Prototype:', Object.getPrototypeOf(pluggyConnect))
          }
          
          // Se chegou aqui sem erro, assume que funcionou ou mostra erro
          console.warn('Não foi possível encontrar método para abrir o widget. Verifique a documentação da Pluggy.')
        }

        setLoading(false)
      } catch (err) {
        console.error('Erro ao carregar widget Pluggy:', err)
        setError(err.message || 'Erro ao carregar o widget. Tente novamente.')
        setLoading(false)
      }
    }

    loadPluggyWidget()

    // Cleanup ao fechar o modal
    return () => {
      if (pluggyConnectRef.current) {
        try {
          // Verifica se o método close existe antes de chamar
          if (typeof pluggyConnectRef.current.close === 'function') {
            pluggyConnectRef.current.close()
          } else if (typeof pluggyConnectRef.current.destroy === 'function') {
            pluggyConnectRef.current.destroy()
          } else if (typeof pluggyConnectRef.current.hide === 'function') {
            pluggyConnectRef.current.hide()
          }
          // Se nenhum método existir, apenas limpa a referência
          // O widget Pluggy Connect gerencia seu próprio ciclo de vida
        } catch (e) {
          // Ignora erros silenciosamente, pois o widget pode já ter sido fechado
          // ou não ter método de fechamento
        }
        pluggyConnectRef.current = null
      }
    }
  }, [isOpen, onClose])

  const loadPluggyScript = () => {
    return new Promise((resolve, reject) => {
      // Verifica se o script já foi carregado
      if (document.querySelector('script[src*="pluggy-connect"]')) {
        resolve()
        return
      }

      const script = document.createElement('script')
      // Tenta usar a URL mais recente do CDN
      script.src = 'https://cdn.pluggy.ai/pluggy-connect/v2.7.0/pluggy-connect.js'
      script.async = true
      script.onload = () => {
        // Aguarda um pouco mais para garantir que a classe está disponível
        setTimeout(() => {
          if (typeof window.PluggyConnect !== 'undefined' || typeof PluggyConnect !== 'undefined') {
            resolve()
          } else {
            reject(new Error('Script carregado mas PluggyConnect não está disponível'))
          }
        }, 200)
      }
      script.onerror = () => {
        reject(new Error('Erro ao carregar o script do Pluggy Connect'))
      }
      document.body.appendChild(script)
    })
  }

  if (!isOpen) {
    return null
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Overlay */}
      <div
        className="absolute inset-0 bg-black bg-opacity-50"
        onClick={onClose}
      ></div>

      {/* Modal */}
      <div className="relative bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex justify-between items-center p-4 border-b">
          <h2 className="text-xl font-bold text-gray-900">Conectar Conta Bancária</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto p-4">
          {loading && (
            <div className="flex items-center justify-center h-64">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
                <p className="text-gray-600">Carregando widget...</p>
              </div>
            </div>
          )}

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
              <p className="text-red-800">{error}</p>
              <button
                onClick={() => {
                  setError(null)
                  setLoading(true)
                  // Recarrega o widget
                  const event = new Event('pluggy-reload')
                  window.dispatchEvent(event)
                }}
                className="mt-2 text-red-600 hover:text-red-800 underline text-sm"
              >
                Tentar novamente
              </button>
            </div>
          )}

          {/* O widget Pluggy Connect cria seu próprio modal, então este container não é necessário */}
          {!loading && !error && (
            <div className="flex items-center justify-center h-64">
              <p className="text-gray-600">O widget será aberto em uma nova janela...</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default PluggyConnectModal

