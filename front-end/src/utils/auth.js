// utils/auth.js

// Funções de autenticação
export const loginUser = async (username, password) => {
  try {
    const response = await fetch('/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        username: username,
        password: password
      })
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.message || 'Login failed')
    }

    const result = await response.json()
    
    if (!result.token || !result.wallet) {
      throw new Error('Invalid response from server')
    }

    // Armazenar no localStorage
    localStorage.setItem('jwtToken', result.token)
    localStorage.setItem('walletAddress', result.wallet)
    
    // Disparar evento global de autenticação
    window.dispatchEvent(new CustomEvent('authChange', {
      detail: { 
        isAuthenticated: true, 
        wallet: result.wallet,
        token: result.token
      }
    }))

    return result
  } catch (error) {
    console.error('Login error:', error)
    throw error
  }
}

export const registerUser = async (wallet, username, password) => {
  try {
    const response = await fetch('/auth/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        wallet: wallet,
        username: username,
        password: password
      })
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.message || 'Registration failed')
    }

    const result = await response.json()
    
    if (!result.token || !result.wallet) {
      throw new Error('Invalid response from server')
    }

    // Armazenar no localStorage
    localStorage.setItem('jwtToken', result.token)
    localStorage.setItem('walletAddress', result.wallet)
    
    // Disparar evento global de autenticação
    window.dispatchEvent(new CustomEvent('authChange', {
      detail: { 
        isAuthenticated: true, 
        wallet: result.wallet,
        token: result.token
      }
    }))

    return result
  } catch (error) {
    console.error('Registration error:', error)
    throw error
  }
}

// Verificar se está logado
export const isLoggedIn = () => {
  const token = localStorage.getItem('jwtToken')
  const wallet = localStorage.getItem('walletAddress')
  
  if (!token || !wallet) return false
  
  try {
    const payload = JSON.parse(atob(token.split('.')[1]))
    return payload.exp > Date.now() / 1000
  } catch (e) {
    return false
  }
}

// Obter informações do usuário do token
export const getUserInfo = () => {
  const token = localStorage.getItem('jwtToken')
  
  if (!token) return null
  
  try {
    const payload = JSON.parse(atob(token.split('.')[1]))
    return {
      username: payload.username,
      wallet: payload.wallet,
      exp: payload.exp
    }
  } catch (e) {
    return null
  }
}

// Obter token
export const getToken = () => {
  return localStorage.getItem('jwtToken')
}

// Obter wallet
export const getWalletAddress = () => {
  return localStorage.getItem('walletAddress')
}

// Formatar endereço de carteira
export const formatWalletAddress = (address) => {
  if (!address || address.length < 10) return address
  return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`
}

// Fazer logout
export const logoutUser = () => {
  localStorage.removeItem('jwtToken')
  localStorage.removeItem('walletAddress')
  localStorage.removeItem('rememberLogin')
  
  // Disparar evento para atualizar componentes
  window.dispatchEvent(new CustomEvent('authChange', {
    detail: { isAuthenticated: false, wallet: '' }
  }))
}

// Para requisições autenticadas
export const authenticatedFetch = async (url, options = {}) => {
  const token = getToken()
  
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers
  }
  
  if (token) {
    headers['Authorization'] = `Bearer ${token}`
  }
  
  const response = await fetch(url, {
    ...options,
    headers,
    credentials: 'same-origin'
  })
  
  if (response.status === 401) {
    logoutUser()
    throw new Error('Session expired')
  }
  
  return response
}