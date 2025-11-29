import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { transactionService } from '../services/api'

function Transactions() {
  const navigate = useNavigate()
  const { user, logout } = useAuth()
  const [transactions, setTransactions] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    fetchTransactions()
  }, [])

  const fetchTransactions = async () => {
    try {
      const data = await transactionService.getTransactions()
      setTransactions(data)
    } catch (err) {
      console.error('Erro ao buscar transações:', err)
      setError('Não foi possível carregar as transações.')
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const formatCurrency = (value) => {
    if (value === null || value === undefined) return 'R$ 0,00'
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value)
  }

  const formatDate = (dateString) => {
      if (!dateString) return '-'
      const date = new Date(dateString)
      return new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' }).format(date)
  }

  return (
    <div className="min-h-screen bg-[#140A23] flex relative">
      {/* Sidebar */}
      <div className="w-20 bg-[#7802D6] fixed left-0 top-0 h-screen flex flex-col items-center py-6 rounded-r-2xl animate-slide-in-left z-10">
        {/* Logo */}
        <div className="w-12 h-12 rounded-lg overflow-hidden mb-8 bg-[#7802D6]">
          <img
            src="/images/logo/logofirebudget.png"
            alt="FireBudget"
            className="w-full h-full object-contain"
          />
        </div>
        
        {/* Menu Icons */}
        <div className="flex flex-col gap-6 flex-1">
          <button 
            onClick={() => navigate('/home')}
            className="text-white hover:opacity-80 transition"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
          </button>
          
          <button 
            onClick={() => navigate('/calendar')}
            className="text-white hover:opacity-80 transition"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </button>
          
          <button className="text-[#00FFB2] transition-smooth">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
            </svg>
          </button>
          
          <button className="text-white hover:text-purple-300 transition">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </button>
          
          <button 
            onClick={() => navigate('/about')}
            className="text-white hover:text-[#00FFB2] transition"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5V4H2v16h5m10 0V10a3 3 0 00-3-3H10a3 3 0 00-3 3v10m10 0H7" />
            </svg>
          </button>
          
          <button 
            onClick={() => navigate('/rewards')}
            className="text-white hover:opacity-80 transition"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" />
            </svg>
          </button>
        </div>
        
        {/* Settings Icon */}
        <button 
          onClick={() => navigate('/settings')}
          className="text-white hover:text-purple-300 transition mb-0"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        </button>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col ml-20">
        {/* Header */}
        <div className="bg-[#140A23] px-8 py-4 flex justify-between items-center">
          <h1 className="text-3xl font-bold text-[#00FFB2]">
            Transações
          </h1>
          <div className="flex gap-4 items-center">
            <button className="text-[#00FFB2] hover:opacity-80 transition">
              <div className="w-10 h-10 bg-[#7802D6] rounded-full flex items-center justify-center">
                <svg className="w-5 h-5 text-gray-800" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
              </div>
            </button>
            <div className="relative group">
              <button className="text-[#00FFB2] hover:opacity-80 transition">
                <div className="w-10 h-10 bg-[#7802D6] rounded-full overflow-hidden">
                  <img 
                    src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop" 
                    alt="Profile" 
                    className="w-full h-full object-cover"
                  />
                </div>
              </button>
              <div className="absolute right-0 mt-2 w-48 bg-[#7802D6] rounded-lg shadow-lg py-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-10">
                <button
                  onClick={handleLogout}
                  className="w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100 text-sm"
                >
                  Sair
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 p-8 overflow-y-auto">
          {loading ? (
             <div className="text-white">Carregando...</div>
          ) : error ? (
             <div className="text-red-500">{error}</div>
          ) : (
          <div className="grid grid-cols-12 gap-6">
            {/* Left Column - Transações Recentes */}
            <div className="col-span-7">
              <div className="bg-gray-50 rounded-2xl p-6 shadow-lg animate-fade-in animate-delay-200 transition-smooth hover:shadow-xl">
                <h2 className="text-xl font-bold text-gray-800 mb-6">Transações Recentes</h2>
                
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-200">
                        <th className="text-left py-3 px-4 text-[#00FFB2] font-semibold text-sm">Nome/Plataforma</th>
                        <th className="text-left py-3 px-4 text-[#00FFB2] font-semibold text-sm">Data</th>
                        <th className="text-left py-3 px-4 text-[#00FFB2] font-semibold text-sm">Categoria</th>
                        <th className="text-left py-3 px-4 text-[#00FFB2] font-semibold text-sm">Valor</th>
                      </tr>
                    </thead>
                    <tbody>
                      {transactions.length === 0 ? (
                          <tr><td colSpan="4" className="text-center py-4 text-gray-500">Nenhuma transação encontrada</td></tr>
                      ) : (
                      transactions.map((transaction) => (
                        <tr key={transaction.id} className="border-b border-gray-100 hover:bg-gray-100 transition">
                          <td className="py-4 px-4">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center text-white font-bold">
                                  $
                                </div>
                              <span className="font-medium text-gray-800">{transaction.description || 'Sem descrição'}</span>
                            </div>
                          </td>
                          <td className="py-4 px-4 text-gray-600">{formatDate(transaction.date)}</td>
                          <td className="py-4 px-4 text-gray-600">{transaction.category || '-'}</td>
                          <td className="py-4 px-4 font-semibold text-gray-800">{formatCurrency(transaction.amount)}</td>
                        </tr>
                      ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* Right Column - Análise Financeira */}
            <div className="col-span-5">
              <div className="bg-gray-50 rounded-2xl p-6 shadow-lg h-full flex flex-col animate-fade-in animate-delay-300 transition-smooth hover:shadow-xl">
                <h2 className="text-xl font-bold text-gray-800 mb-4">Análise Financeira</h2>
                
                {/* Legend */}
                <div className="flex flex-wrap gap-3 mb-4">
                  <div className="flex items-center gap-1.5">
                    <div className="w-2.5 h-2.5 bg-[#00FFB2] rounded-full"></div>
                    <span className="text-xs text-gray-600">Receitas</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className="w-2.5 h-2.5 bg-red-500 rounded-full"></div>
                    <span className="text-xs text-gray-600">Despesas</span>
                  </div>
                </div>

                {/* Chart Placeholder - Real logic needs aggregation */}
                <div className="flex-1 flex items-end justify-center gap-6">
                   <div className="text-gray-400 text-sm text-center w-full flex items-center justify-center">
                       Gráfico em desenvolvimento
                   </div>
                </div>
              </div>
            </div>
          </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default Transactions

