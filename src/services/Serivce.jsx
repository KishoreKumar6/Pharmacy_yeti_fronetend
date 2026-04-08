import { API_BASE_URL, getAuthHeaders } from '../utils/api'

const handleResponse = async (response) => {
  if (response.status === 401) {
    throw new Error('Unauthorized')
  }

  const data = await response.json()

  if (!response.ok) {
    throw new Error(data.message || 'Request failed')
  }

  return data
}

export const login = async (payload) => {
  const response = await fetch(`${API_BASE_URL}/auth/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  })

  return handleResponse(response)
}

export const registerCustomer = async (payload) => {
  const response = await fetch(`${API_BASE_URL}/customers`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeaders(),
    },
    body: JSON.stringify(payload),
  })

  return handleResponse(response)
}

export const fetchCustomers = async () => {
  const response = await fetch(`${API_BASE_URL}/customers`, {
    headers: {
      ...getAuthHeaders(),
    },
  })
  const data = await handleResponse(response)
  return data.customers || []
}

export const fetchMedicines = async () => {
  const response = await fetch(`${API_BASE_URL}/medicines`, {
    headers: {
      ...getAuthHeaders(),
    },
  })
  const data = await handleResponse(response)
  return data.medicines || []
}

export const updateCustomer = async (id, payload) => {
  const response = await fetch(`${API_BASE_URL}/customers/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeaders(),
    },
    body: JSON.stringify(payload),
  })

  return handleResponse(response)
}

export const deleteCustomer = async (id) => {
  const response = await fetch(`${API_BASE_URL}/customers/${id}`, {
    method: 'DELETE',
    headers: {
      ...getAuthHeaders(),
    },
  })

  return handleResponse(response)
}
