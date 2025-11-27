import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

function Rewards() {
  const navigate = useNavigate()
  const { user, logout } = useAuth()

  const availableRewards = [
    {
      id: 1,
      title: '5% de cashback',
      icon: '💵',
      cost: 300
    },
    {
      id: 2,
      title: 'Vale café no Starbucks',
      icon: '☕',
      cost: 850
    },
    {
      id: 3,
      title: 'Vale lanche no McDonald\'s',
      icon: '🍔',
      cost: 2000
    },
    {
      id: 4,
      title: '30% de cashback',
      icon: '💵',
      cost: 3500
    }
  ]

  const missions = [
    {
      id: 1,
      title: 'Faça login 7 dias',
      icon: '🎯',
      current: 5,
      target: 7,
      reward: 50
    },
    {
      id: 2,
      title: 'Economize R$ 100,00',
      icon: '🎯',
      current: 20,
      target: 100,
      reward: 100
    },
    {
      id: 3,
      title: 'Economize R$ 1000,00',
      icon: '🎯',
      current: 350,
      target: 1000,
      reward: 500
    }
  ]

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const calculateProgress = (current, target) => {
    return Math.min((current / target) * 100, 100)
  }

  return (
    <div className="min-h-screen bg-[#140A23] flex relative">
      {/* Sidebar */}
      <div className="w-20 bg-[#7802D6] fixed left-0 top-0 h-screen flex flex-col items-center py-6 rounded-r-2xl animate-slide-in-left z-10">
        {/* Logo placeholder */}
        <div className="w-12 h-12 bg-gray-300 rounded-lg mb-8"></div>
        
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
          
          <button 
            onClick={() => navigate('/transactions')}
            className="text-white hover:opacity-80 transition"
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
          
          <button className="text-[#00FFB2] transition-smooth">
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
            Presentes e Conquistas
          </h1>
          <div className="flex gap-4 items-center">
            <button className="text-[#00FFB2] hover:opacity-80 transition">
              <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center">
                <svg className="w-5 h-5 text-gray-800" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
              </div>
            </button>
            <div className="relative group">
              <button className="text-[#00FFB2] hover:opacity-80 transition">
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

        {/* Content Area */}
        <div className="flex-1 p-8 overflow-y-auto">
          <div className="grid grid-cols-12 gap-6">
            {/* Top Card - Conquistas */}
            <div className="col-span-12">
              <div className="bg-gray-50 rounded-2xl p-8 shadow-lg border-2 border-blue-200 animate-scale-in animate-delay-200 transition-smooth hover:shadow-xl">
                <h2 className="text-xl font-bold text-gray-800 mb-6">Conquistas</h2>
                <div className="flex flex-col items-center justify-center py-12">
                  <svg className="w-32 h-32 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                  </svg>
                </div>
              </div>
            </div>

            {/* Bottom Left - Recompensas Disponíveis */}
            <div className="col-span-6">
              <div className="bg-gray-50 rounded-2xl p-6 shadow-lg border-2 border-blue-200 animate-fade-in animate-delay-300 transition-smooth hover:shadow-xl">
                <h2 className="text-xl font-bold text-gray-800 mb-6">Recompensas Disponíveis</h2>
                
                <div className="space-y-4">
                  {availableRewards.map((reward) => (
                    <div key={reward.id} className="flex items-center justify-between p-4 bg-white rounded-lg border border-gray-200 hover:shadow-md transition">
                      <div className="flex items-center gap-4">
                        <div className="text-3xl">{reward.icon}</div>
                        <span className="font-medium text-gray-800">{reward.title}</span>
                      </div>
                      <span className="text-[#00FFB2] font-bold">$ {reward.cost}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Bottom Right - Missões */}
            <div className="col-span-6">
              <div className="bg-gray-50 rounded-2xl p-6 shadow-lg border-2 border-blue-200 animate-fade-in animate-delay-400 transition-smooth hover:shadow-xl">
                <h2 className="text-xl font-bold text-gray-800 mb-6">Missões</h2>
                
                <div className="space-y-4">
                  {missions.map((mission) => {
                    const progress = calculateProgress(mission.current, mission.target)
                    return (
                      <div key={mission.id} className="p-4 bg-white rounded-lg border border-gray-200 hover:shadow-md transition">
                        <div className="flex items-center gap-3 mb-3">
                          <div className="text-2xl">{mission.icon}</div>
                          <span className="font-medium text-gray-800 flex-1">{mission.title}</span>
                        </div>
                        
                        {/* Progress Bar */}
                        <div className="mb-3">
                          <div className="w-full bg-gray-200 rounded-full h-2.5">
                            <div 
                              className="bg-[#00FFB2] h-2.5 rounded-full transition-all duration-300"
                              style={{ width: `${progress}%` }}
                            ></div>
                          </div>
                          <div className="flex justify-between items-center mt-1">
                            <span className="text-xs text-gray-600">{mission.current}/{mission.target}</span>
                            <span className="text-[#00FFB2] font-bold text-sm">$ {mission.reward}</span>
                          </div>
                        </div>
                        
                        {/* Redeem Button */}
                        <button className="w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg transition">
                          Resgatar
                        </button>
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Rewards

