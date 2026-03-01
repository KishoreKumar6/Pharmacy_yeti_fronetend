import { API_BASE_URL } from '../utils/api'

const handleResponse = async (response) => {
  const data = await response.json()

  if (!response.ok) {
    throw new Error(data.message || 'Request failed')
  }

  return data
}

export const registerCustomer = async (payload) => {
  const response = await fetch(`${API_BASE_URL}/customers`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  })

  return handleResponse(response)
}

export const fetchCustomers = async () => {
  const response = await fetch(`${API_BASE_URL}/customers`)
  const data = await handleResponse(response)
  return data.customers || []
}
