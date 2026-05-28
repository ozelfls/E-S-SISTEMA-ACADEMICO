import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? '/api',
  timeout: 15000
})

function clearAuthSession() {
  localStorage.removeItem('ghflusao_token')
  localStorage.removeItem('ghflusao-auth')
}

api.interceptors.request.use(config => {
  const token = localStorage.getItem('ghflusao_token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

api.interceptors.response.use(
  response => response,
  error => {
    if ([401, 403].includes(error.response?.status)) {
      clearAuthSession()
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

export default api
