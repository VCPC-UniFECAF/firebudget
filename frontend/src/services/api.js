import axios from 'axios'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Interceptor para adicionar token de autenticação
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Interceptor para tratar erros de resposta
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expirado ou inválido
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

// Serviços de autenticação
export const authService = {
  async login(email, password) {
    const response = await api.post('/auth/login', { email, password })
    return response.data
  },

  async register(fullName, email, password) {
    const response = await api.post('/auth/register', {
      fullName,
      email,
      password,
    })
    return response.data
  },

  async forgotPassword(email) {
    const response = await api.post('/auth/forgot-password', { email })
    return response.data
  },

  async resetPassword(email, password, confirmPassword) {
    const response = await api.post('/auth/reset-password', {
      email,
      password,
      confirmPassword,
    })
    return response.data
  },
}

// Serviços de transações
export const transactionService = {
  async getTransactions(period = 'week') {
    const response = await api.get(`/transactions?period=${period}`)
    return response.data
  },

  async createTransaction(transaction) {
    const response = await api.post('/transactions', transaction)
    return response.data
  },
}

// Serviços de contas bancárias
export const accountService = {
  async getAccounts() {
    const response = await api.get('/accounts')
    return response.data
  },

  async getAccountBalance(accountId) {
    const response = await api.get(`/accounts/${accountId}/balance`)
    return response.data
  },
}

// Serviços de links bancários (Belvo)
export const linkService = {
  async createLink(institution, username, password) {
    const response = await api.post('/links', {
      institution,
      username,
      password,
    })
    return response.data
  },

  async getLinks() {
    const response = await api.get('/links')
    return response.data
  },
}

export default api




