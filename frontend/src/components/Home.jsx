import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { transactionService, accountService } from '../services/api'
import PluggyConnectModal from './PluggyConnectModal'

function Home() {
  const navigate = useNavigate()
  const { user, logout } = useAuth()
  const [selectedPeriod, setSelectedPeriod] = useState('30 Dias')
  const [expensePeriod, setExpensePeriod] = useState('Esta semana')
  const [chartPeriod, setChartPeriod] = useState('2025')
  const [transactions, setTransactions] = useState([])
  const [loading, setLoading] = useState(true)
  const [balance, setBalance] = useState(10900.0)
  const [totalExpenses, setTotalExpenses] = useState(5870.9)
  const [totalSaved, setTotalSaved] = useState(3500.0)
  const [isPluggyModalOpen, setIsPluggyModalOpen] = useState(false)

  useEffect(() => {
    loadData()
  }, [expensePeriod])

  const loadData = async () => {
    try {
      setLoading(true)
      // Simulando chamadas à API - substituir quando o backend estiver pronto
      // const transactionsData = await transactionService.getTransactions(expensePeriod)
      // const accountsData = await accountService.getAccounts()
      
      // Dados mockados por enquanto
      const mockTransactions = [
        { name: 'McDonald\'s', date: '01 out, 2025', amount: 33.90, logo: '🍔' },
        { name: 'UniFECAF', date: '07 out, 2025', amount: 693.00, logo: '🎓' },
        { name: 'Netflix', date: '25 out, 2025', amount: 59.90, logo: '📺' },
        { name: 'iFood', date: '14 nov, 2025', amount: 89.90, logo: '🍴' },
        { name: 'Nike', date: '15 nov, 2025', amount: 749.00, logo: '👟' },
      ]
      setTransactions(mockTransactions)
    } catch (error) {
      console.error('Erro ao carregar dados:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <div className="min-h-screen bg-gray-50 flex relative">
      {/* Sidebar */}
      <div className="w-20 bg-purple-900 flex flex-col items-center py-6 animate-slide-in-left">
        {/* Logo placeholder */}
        <div className="w-12 h-12 bg-white rounded-lg mb-8"></div>
        
        {/* Menu Icons */}
        <div className="flex flex-col gap-6 flex-1">
          <button className="text-teal-400 transition-smooth">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
          </button>
          
          <button 
            onClick={() => navigate('/calendar')}
            className="text-white hover:text-purple-300 transition"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </button>
          
          <button 
            onClick={() => navigate('/transactions')}
            className="text-white hover:text-purple-300 transition"
          >
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
            onClick={() => navigate('/rewards')}
            className="text-white hover:text-purple-300 transition"
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
      <div className="flex-1 flex flex-col animate-fade-in animate-delay-100">
        {/* Header */}
        <div className="bg-purple-900 text-white px-8 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold">
            Bem-Vindo {user?.fullName || user?.email || 'Usuário'}
          </h1>
          <div className="flex gap-4 items-center">
            <button className="hover:text-purple-300 transition">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
            </button>
            <div className="relative group">
              <button className="hover:text-purple-300 transition">
                <div className="w-8 h-8 bg-purple-700 rounded-full flex items-center justify-center">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                  </svg>
                </div>
              </button>
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg py-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-10">
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
          {/* Summary Cards */}
          <div className="grid grid-cols-3 gap-6 mb-8">
            {/* Saldo Total */}
            <div className="bg-white rounded-lg shadow-md p-6 relative animate-scale-in animate-delay-200 transition-smooth hover:shadow-lg hover:scale-105">
              <button className="absolute top-4 right-4 text-gray-400 hover:text-gray-600">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z" />
                </svg>
              </button>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
              <p className="text-gray-600 text-sm mb-1">Saldo Total</p>
              <p className="text-2xl font-bold text-gray-900">R$ 10.900,00</p>
            </div>

            {/* Gasto Total */}
            <div className="bg-white rounded-lg shadow-md p-6 relative animate-scale-in animate-delay-300 transition-smooth hover:shadow-lg hover:scale-105">
              <button className="absolute top-4 right-4 text-gray-400 hover:text-gray-600">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z" />
                </svg>
              </button>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
              <p className="text-gray-600 text-sm mb-1">Gasto Total</p>
              <p className="text-2xl font-bold text-gray-900">R$ 5.870,90</p>
            </div>

            {/* Total Economizado */}
            <div className="bg-white rounded-lg shadow-md p-6 relative animate-scale-in animate-delay-400 transition-smooth hover:shadow-lg hover:scale-105">
              <button className="absolute top-4 right-4 text-gray-400 hover:text-gray-600">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z" />
                </svg>
              </button>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
              <p className="text-gray-600 text-sm mb-1">Total Economizado</p>
              <p className="text-2xl font-bold text-gray-900">R$ 3.500,00</p>
            </div>
          </div>

          {/* Main Content Grid */}
          <div className="grid grid-cols-12 gap-6">
            {/* Left Column - Income and Chart */}
            <div className="col-span-3 space-y-6">
              {/* Renda Card */}
              <div className="bg-white rounded-lg shadow-md p-4">
                <div className="flex justify-between items-center mb-2">
                  <h2 className="text-lg font-bold text-gray-900">Renda</h2>
                  <select 
                    value={selectedPeriod}
                    onChange={(e) => setSelectedPeriod(e.target.value)}
                    className="px-3 py-1 border border-gray-300 rounded-lg text-sm"
                  >
                    <option>30 Dias</option>
                    <option>7 Dias</option>
                    <option>90 Dias</option>
                  </select>
                </div>
                <p className="text-xl font-bold text-gray-900 mb-1">R$ 10.900,00</p>
                <div className="flex items-center gap-2">
                  <span className="text-green-600 font-semibold text-sm">+28%</span>
                  <span className="text-gray-500 text-xs">vs mês anterior</span>
                </div>
              </div>

              {/* Chart Card */}
              <div className="bg-white rounded-lg shadow-md p-6">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-bold text-gray-900">Despesas</h2>
                  <select 
                    value={chartPeriod}
                    onChange={(e) => setChartPeriod(e.target.value)}
                    className="px-3 py-1 border border-gray-300 rounded-lg text-sm"
                  >
                    <option>2025</option>
                    <option>2024</option>
                  </select>
                </div>
                <div className="flex items-end justify-between gap-2 h-32">
                  {[
                    { month: 'Jun', value: 7.3, height: '70%' },
                    { month: 'Jul', value: 3.5, height: '35%' },
                    { month: 'Ago', value: 4.8, height: '48%' },
                    { month: 'Set', value: 9.6, height: '96%' },
                    { month: 'Out', value: 5.5, height: '55%' },
                  ].map((bar, index) => (
                    <div key={index} className="flex-1 flex flex-col items-center">
                      <div className="w-full bg-cyan-500 rounded-t-lg mb-2" style={{ height: bar.height }}></div>
                      <p className="text-xs text-gray-500">{bar.month}</p>
                      <p className="text-xs font-semibold text-gray-700">{bar.value}k</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Middle Column - Expenses List */}
            <div className="col-span-5">
              <div className="bg-white rounded-lg shadow-md p-6 h-full">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-bold text-gray-900">Despesas</h2>
                  <select 
                    value={expensePeriod}
                    onChange={(e) => setExpensePeriod(e.target.value)}
                    className="px-3 py-1 border border-gray-300 rounded-lg text-sm"
                  >
                    <option>Esta semana</option>
                    <option>Este mês</option>
                    <option>Este ano</option>
                  </select>
                </div>

                {/* Expenses List */}
                {loading ? (
                  <div className="flex items-center justify-center h-64">
                    <div className="text-gray-500">Carregando transações...</div>
                  </div>
                ) : transactions.length === 0 ? (
                  <div className="flex items-center justify-center h-64">
                    <div className="text-gray-500">Nenhuma transação encontrada</div>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {transactions.map((expense, index) => (
                      <div key={index} className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center text-xl border border-gray-200">
                              {expense.logo}
                            </div>
                            <div>
                              <p className="font-semibold text-gray-900 text-sm">{expense.name}</p>
                              <p className="text-xs text-gray-500">{expense.date}</p>
                            </div>
                          </div>
                          <p className="font-bold text-gray-900 text-sm">
                            R$ {typeof expense.amount === 'number' 
                              ? expense.amount.toFixed(2).replace('.', ',') 
                              : expense.amount}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Right Column - Cards and Contacts */}
            <div className="col-span-4 flex flex-col">
              {/* Single Banner with all sections */}
              <div className="bg-purple-600 rounded-lg shadow-md p-6 text-white space-y-6 flex-1 flex flex-col">
                {/* Meus Cartões */}
                <div>
                  <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-bold">Meus Cartões</h2>
                    <button 
                      onClick={() => setIsPluggyModalOpen(true)}
                      className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center hover:bg-green-600 transition"
                    >
                      <span className="text-xl font-bold">+</span>
                    </button>
                  </div>
                  <div className="bg-white rounded-lg h-48 flex items-center justify-center text-gray-400">
                    <p className="text-sm">Adicione um cartão</p>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="grid grid-cols-2 gap-4">
                  <button className="bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-4 rounded-lg flex items-center justify-center gap-2 transition">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
                    </svg>
                    <span>Enviar</span>
                  </button>
                  <button className="bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-4 rounded-lg flex items-center justify-center gap-2 transition">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                    </svg>
                    <span>Recebido</span>
                  </button>
                </div>

                {/* Contatos Recentes */}
                <div>
                  <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-bold">Contatos Recentes</h2>
                    <button className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center hover:bg-green-600 transition">
                      <span className="text-xl font-bold">+</span>
                    </button>
                  </div>
                  <p className="text-sm mb-4 opacity-90">30 contatos</p>
                  <div className="flex gap-2">
                    {['Samuel', 'Erik', 'Pedro B.', 'Pedro L.', 'Mike'].map((name, index) => (
                      <div key={index} className="flex flex-col items-center">
                        <div className="w-12 h-12 bg-purple-700 rounded-full flex items-center justify-center mb-1">
                          <span className="text-sm font-semibold">{name[0]}</span>
                        </div>
                        <span className="text-xs">{name}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modal Pluggy Connect */}
      <PluggyConnectModal 
        isOpen={isPluggyModalOpen} 
        onClose={() => setIsPluggyModalOpen(false)} 
      />
    </div>
  )
}

export default Home

