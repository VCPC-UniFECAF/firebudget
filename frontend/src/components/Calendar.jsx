import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

function Calendar() {
  const navigate = useNavigate()
  const { user, logout } = useAuth()
  
  const [currentDate, setCurrentDate] = useState(new Date(2025, 10, 1)) // Novembro 2025
  const [selectedYear, setSelectedYear] = useState(2025)

  const months = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ]

  const weekDays = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado']
  const weekDaysShort = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb']

  const currentMonth = currentDate.getMonth()
  const currentYear = currentDate.getFullYear()

  // Obter primeiro dia do mês e quantos dias tem o mês
  const firstDayOfMonth = new Date(currentYear, currentMonth, 1).getDay()
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate()

  // Criar array de dias do calendário
  const calendarDays = []
  
  // Adicionar dias vazios antes do primeiro dia do mês
  for (let i = 0; i < firstDayOfMonth; i++) {
    calendarDays.push(null)
  }
  
  // Adicionar dias do mês
  for (let day = 1; day <= daysInMonth; day++) {
    calendarDays.push(day)
  }

  // Verificar se é domingo
  const isSunday = (day) => {
    if (day === null) return false
    const date = new Date(currentYear, currentMonth, day)
    return date.getDay() === 0
  }

  const handlePreviousMonth = () => {
    setCurrentDate(new Date(currentYear, currentMonth - 1, 1))
  }

  const handleNextMonth = () => {
    setCurrentDate(new Date(currentYear, currentMonth + 1, 1))
  }

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  // Gerar anos para o dropdown (2020-2030)
  const years = Array.from({ length: 11 }, (_, i) => 2020 + i)

  return (
    <div className="min-h-screen bg-gray-900 flex relative">
      {/* Sidebar */}
      <div className="w-20 bg-purple-900 flex flex-col items-center py-6 rounded-r-2xl animate-slide-in-left">
        {/* Logo placeholder */}
        <div className="w-12 h-12 bg-gray-300 rounded-lg mb-8"></div>
        
        {/* Menu Icons */}
        <div className="flex flex-col gap-6 flex-1">
          <button 
            onClick={() => navigate('/home')}
            className="text-white hover:text-purple-300 transition"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
          </button>
          
          <button className="text-teal-400 transition-smooth">
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
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="bg-gray-900 px-8 py-4 flex justify-between items-center">
          <h1 className="text-3xl font-bold text-teal-400">
            Calendário Financeiro
          </h1>
          <div className="flex gap-4 items-center">
            <button className="hover:text-gray-300 transition">
              <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center">
                <svg className="w-5 h-5 text-gray-800" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
              </div>
            </button>
            <div className="relative group">
              <button className="hover:text-gray-300 transition">
                <div className="w-10 h-10 bg-white rounded-full overflow-hidden">
                  <img 
                    src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop" 
                    alt="Profile" 
                    className="w-full h-full object-cover"
                  />
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

        {/* Calendar Content */}
        <div className="flex-1 p-8 flex items-center justify-center">
          <div className="bg-gray-50 rounded-2xl p-8 w-full max-w-5xl shadow-2xl animate-scale-in transition-smooth hover:shadow-3xl">
            {/* Month and Year Header */}
            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center gap-4">
                <button
                  onClick={handlePreviousMonth}
                  className="text-blue-600 hover:text-blue-800 transition"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                <h2 className="text-2xl font-bold text-blue-600">
                  {months[currentMonth]}
                </h2>
                <button
                  onClick={handleNextMonth}
                  className="text-blue-600 hover:text-blue-800 transition"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
              
              <div className="flex items-center gap-2">
                <span className="text-xl font-bold text-blue-600">{currentYear}</span>
                <select
                  value={currentYear}
                  onChange={(e) => {
                    const newYear = parseInt(e.target.value)
                    setSelectedYear(newYear)
                    setCurrentDate(new Date(newYear, currentMonth, 1))
                  }}
                  className="text-blue-600 font-bold bg-transparent border-none cursor-pointer appearance-none focus:outline-none"
                >
                  {years.map(year => (
                    <option key={year} value={year}>{year}</option>
                  ))}
                </select>
                <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>

            {/* Days of Week Header */}
            <div className="grid grid-cols-7 gap-2 mb-4">
              {weekDays.map((day, index) => (
                <div
                  key={index}
                  className={`text-center font-semibold py-2 ${
                    index === 0 ? 'text-teal-500' : 'text-blue-600'
                  }`}
                >
                  {day}
                </div>
              ))}
            </div>

            {/* Calendar Grid */}
            <div className="grid grid-cols-7 gap-2">
              {calendarDays.map((day, index) => {
                const isSundayDay = isSunday(day)
                return (
                  <div
                    key={index}
                    className={`
                      aspect-square rounded-lg flex items-center justify-center text-lg font-semibold
                      ${day === null 
                        ? 'bg-gray-100' 
                        : isSundayDay
                        ? 'bg-teal-500 text-white'
                        : 'bg-gray-200 text-gray-800 hover:bg-gray-300 transition cursor-pointer'
                      }
                    `}
                  >
                    {day}
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Calendar

