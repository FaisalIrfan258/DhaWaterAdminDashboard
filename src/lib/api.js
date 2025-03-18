import Cookies from 'js-cookie'

export const fetchWithAuth = async (url, options = {}) => {
  const token = Cookies.get('admin_token')
  
  if (!token) {
    // Redirect to login if token is missing
    window.location.href = '/login'
    throw new Error('No authentication token found')
  }

  const defaultOptions = {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
      ...options.headers,
    },
  }

  return fetch(url, {
    ...options,
    ...defaultOptions,
    headers: {
      ...defaultOptions.headers,
      ...options.headers,
    },
  })
} 