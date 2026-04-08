const TOKEN_KEY = 'pharmacy_auth_token'

export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

export const getAuthToken = () => localStorage.getItem(TOKEN_KEY)

export const setAuthToken = (token) => {
  if (!token) return
  localStorage.setItem(TOKEN_KEY, token)
}

export const clearAuthToken = () => {
  localStorage.removeItem(TOKEN_KEY)
}

export const getAuthHeaders = () => {
  const token = getAuthToken()
  if (!token) return {}
  return { Authorization: `Bearer ${token}` }
}
