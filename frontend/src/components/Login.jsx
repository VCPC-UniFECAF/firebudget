import { useState } from 'react'

function Login({ onForgotPassword, onRegister, onLogin }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [keepLoggedIn, setKeepLoggedIn] = useState(false)

  const handleSubmit = (e) => {
    e.preventDefault()
    // Implementar lógica de login aqui
    console.log('Login:', { email, password, keepLoggedIn })
    // Após login bem-sucedido, chamar onLogin
    if (onLogin) {
      onLogin()
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white border-2 shadow-xl w-full max-w-6xl overflow-hidden" style={{ borderRadius: '0.55rem' }}>
        <div className="flex flex-col md:flex-row md:items-start">
          {/* Left Section - Login Form */}
          <div className="w-full p-8 md:p-12" style={{ width: '65%' }}>
            <h1 className="text-5xl font-bold text-purple-600 mb-8">Login</h1>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Email Input */}
              <div className="relative">
                <input
                  type="email"
                  placeholder="E-mail"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-gray-900 text-gray-300 placeholder-purple-300/50 px-4 py-3 pr-12 shadow-md focus:outline-none focus:ring-2 focus:ring-purple-500 transition"
                  style={{ borderRadius: '0.55rem' }}
                  required
                />
                <svg
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-purple-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                  />
                </svg>
              </div>

              {/* Password Input */}
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Senha"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-gray-900 text-gray-300 placeholder-purple-300/50 px-4 py-3 pr-12 shadow-md focus:outline-none focus:ring-2 focus:ring-purple-500 transition"
                  style={{ borderRadius: '0.55rem' }}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 text-purple-400 hover:text-purple-300 transition"
                >
                  {showPassword ? (
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                      />
                    </svg>
                  ) : (
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.736m0 0L21 21"
                      />
                    </svg>
                  )}
                </button>
              </div>

              {/* Keep Logged In Checkbox */}
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="keepLoggedIn"
                  checked={keepLoggedIn}
                  onChange={(e) => setKeepLoggedIn(e.target.checked)}
                  className="w-4 h-4 text-purple-600 bg-gray-100 border-gray-300 focus:ring-purple-500"
                  style={{ borderRadius: '0.275rem' }}
                />
                <label
                  htmlFor="keepLoggedIn"
                  className="ml-2 text-sm text-gray-600 cursor-pointer"
                >
                  Manter conectado
                </label>
              </div>

              {/* Login Button */}
              <button
                type="submit"
                className="w-full bg-gradient-to-r from-purple-600 to-purple-700 text-white font-bold py-3 shadow-lg hover:from-purple-700 hover:to-purple-800 transition transform hover:scale-[1.02]"
                style={{ borderRadius: '0.55rem' }}
              >
                Entrar
              </button>
            </form>

            {/* Links */}
            <div className="mt-6 flex justify-center space-x-4">
              <button
                type="button"
                onClick={onRegister}
                className="text-purple-600 hover:text-purple-700 font-medium bg-transparent border-none cursor-pointer"
              >
                Criar conta
              </button>
              <button
                type="button"
                onClick={onForgotPassword}
                className="text-gray-500 hover:text-gray-600 underline bg-transparent border-none cursor-pointer"
              >
                Esqueceu a senha
              </button>
            </div>

            {/* Divider */}
            <div className="relative my-8">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">Ou</span>
              </div>
            </div>

            {/* Social Login */}
            <div className="flex justify-center space-x-4">
              <button className="w-12 h-12 rounded-full bg-white border-2 border-gray-300 shadow-md flex items-center justify-center hover:shadow-lg transition">
                <span className="text-xl font-bold text-gray-700">G</span>
              </button>
              <button className="w-12 h-12 rounded-full bg-white border-2 border-gray-300 shadow-md flex items-center justify-center hover:shadow-lg transition">
                <svg
                  className="w-6 h-6 text-gray-800"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09l.01-.01zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z" />
                </svg>
              </button>
            </div>
          </div>

          {/* Right Section - Placeholder */}
          <div className="hidden md:block md:pt-12" style={{ backgroundColor: '#818181', borderRadius: '1.55rem', width: '385.9px', height: '560px', alignSelf: 'center' }}></div>
        </div>
      </div>
    </div>
  )
}

export default Login

