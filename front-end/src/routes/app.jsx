import { Outlet, createFileRoute, Link, useNavigate } from '@tanstack/react-router'
import { useState, useEffect } from 'react'

export const Route = createFileRoute('/app')({
  component: AppLayoutComponent,
})

function AppLayoutComponent() {
  const navigate = useNavigate()
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [userWallet, setUserWallet] = useState('')
  const [userInfo, setUserInfo] = useState(null)

  // Verificar autenticação ao carregar
  useEffect(() => {
    const checkAuth = () => {
      const token = localStorage.getItem('jwtToken')
      const wallet = localStorage.getItem('walletAddress')
      
      if (token && wallet) {
        try {
          // Decodificar token JWT para verificar expiração
          const payload = JSON.parse(atob(token.split('.')[1]))
          
          if (payload.exp > Date.now() / 1000) {
            setIsAuthenticated(true)
            setUserWallet(wallet)
            
            // Extrair informações do usuário do token
            setUserInfo({
              username: payload.username,
              wallet: payload.wallet,
              exp: payload.exp
            })
            
            console.log('User authenticated:', payload.username)
          } else {
            // Token expirado
            handleLogout()
          }
        } catch (e) {
          console.error('Token inválido:', e)
          handleLogout()
        }
      } else {
        setIsAuthenticated(false)
        setUserWallet('')
        setUserInfo(null)
      }
    }
    
    checkAuth()
    
    // Ouvir eventos de mudança de autenticação
    const handleAuthChange = (event) => {
      if (event.detail && event.detail.isAuthenticated) {
        setIsAuthenticated(true)
        setUserWallet(event.detail.wallet)
        
        // Extrair informações do token
        const token = localStorage.getItem('jwtToken')
        if (token) {
          try {
            const payload = JSON.parse(atob(token.split('.')[1]))
            setUserInfo({
              username: payload.username,
              wallet: payload.wallet,
              exp: payload.exp
            })
          } catch (e) {
            console.error('Erro ao decodificar token:', e)
          }
        }
      } else {
        setIsAuthenticated(false)
        setUserWallet('')
        setUserInfo(null)
      }
    }
    
    window.addEventListener('authChange', handleAuthChange)
    
    // Verificar periodicamente se o token expirou
    const authCheckInterval = setInterval(checkAuth, 60000) // A cada minuto
    
    return () => {
      window.removeEventListener('authChange', handleAuthChange)
      clearInterval(authCheckInterval)
    }
  }, [])

  const handleLogout = () => {
    localStorage.removeItem('jwtToken')
    localStorage.removeItem('walletAddress')
    localStorage.removeItem('rememberLogin')
    
    setIsAuthenticated(false)
    setUserWallet('')
    setUserInfo(null)
    
    // Disparar evento para outros componentes
    window.dispatchEvent(new CustomEvent('authChange', { 
      detail: { isAuthenticated: false, wallet: '' }
    }))
    
    navigate({ to: '/app' })
  }

  const handleAuthClick = () => {
    if (isAuthenticated) {
      handleLogout()
    } else {
      navigate({ to: '/app/login' })
    }
  }

  const formatWalletAddress = (address) => {
    if (!address || address.length < 10) return address
    return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-gray-100">
      {/* Fixed Header */}
      <header className="sticky top-0 z-50 bg-slate-900/95 backdrop-blur-md border-b border-slate-700/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link to="/app" className="flex items-center hover:opacity-90 transition-opacity duration-200">
              <div className="text-2xl font-bold tracking-tight">
                <span className="text-white">block</span>
                <span className="text-blue-500">+</span>
              </div>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center space-x-1">
              <Link
                to="/app/upload"
                className="px-4 py-2 text-sm font-medium text-gray-300 hover:text-white hover:bg-slate-800/50 rounded-lg transition-all duration-200 group relative"
                activeProps={{ className: 'text-white bg-slate-800/70' }}
              >
                <span>Upload</span>
                <span className="absolute bottom-0 left-4 right-4 h-0.5 bg-blue-500 scale-x-0 group-hover:scale-x-100 transition-transform duration-300"></span>
              </Link>
              <Link
                to="/app/files"
                className="px-4 py-2 text-sm font-medium text-gray-300 hover:text-white hover:bg-slate-800/50 rounded-lg transition-all duration-200 group relative"
                activeProps={{ className: 'text-white bg-slate-800/70' }}
              >
                <span>Files</span>
                <span className="absolute bottom-0 left-4 right-4 h-0.5 bg-blue-500 scale-x-0 group-hover:scale-x-100 transition-transform duration-300"></span>
              </Link>
              <Link
                to="/app/pricing"
                className="px-4 py-2 text-sm font-medium text-gray-300 hover:text-white hover:bg-slate-800/50 rounded-lg transition-all duration-200 group relative"
                activeProps={{ className: 'text-white bg-slate-800/70' }}
              >
                <span>Pricing</span>
                <span className="absolute bottom-0 left-4 right-4 h-0.5 bg-blue-500 scale-x-0 group-hover:scale-x-100 transition-transform duration-300"></span>
              </Link>
              <Link
                to="/app/contact"
                className="px-4 py-2 text-sm font-medium text-gray-300 hover:text-white hover:bg-slate-800/50 rounded-lg transition-all duration-200 group relative"
                activeProps={{ className: 'text-white bg-slate-800/70' }}
              >
                <span>Contact</span>
                <span className="absolute bottom-0 left-4 right-4 h-0.5 bg-blue-500 scale-x-0 group-hover:scale-x-100 transition-transform duration-300"></span>
              </Link>
              
              {/* Divider - apenas se autenticado */}
              {isAuthenticated && (
                <div className="h-6 w-px bg-slate-700 mx-2"></div>
              )}

              {/* Botão de Autenticação/Usuário */}
              {isAuthenticated ? (
                <div className="flex items-center gap-2">
                  {/* Indicador do usuário */}
                  <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-800/50 rounded-lg">
                    <div className="w-6 h-6 bg-blue-600/20 rounded-full flex items-center justify-center">
                      <svg className="w-3 h-3 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.121 17.804A7.968 7.968 0 0112 15c2.305 0 4.39.867 5.804 2.276M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div className="text-xs">
                      <div className="text-gray-300 font-medium">
                        {userInfo?.username || formatWalletAddress(userWallet)}
                      </div>
                      <div className="text-gray-500">
                        {formatWalletAddress(userWallet)}
                      </div>
                    </div>
                  </div>
                  
                  {/* Botão de Logout */}
                  <button
                    onClick={handleLogout}
                    className="px-4 py-2 text-sm font-medium bg-red-600 hover:bg-red-700 text-white rounded-lg transition-all duration-200 hover:shadow-lg hover:shadow-red-500/25 flex items-center gap-2"
                    title="Sign Out"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                    </svg>
                    <span>Sign Out</span>
                  </button>
                </div>
              ) : (
                <button
                  onClick={handleAuthClick}
                  className="px-4 py-2 text-sm font-medium bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-all duration-200 hover:shadow-lg hover:shadow-blue-500/25 flex items-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                  </svg>
                  <span>Login</span>
                </button>
              )}
            </nav>

            {/* Mobile menu button */}
            <button className="md:hidden p-2 rounded-lg hover:bg-slate-800/50 transition-colors duration-150 text-gray-300 hover:text-white">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Banner se autenticado */}
        {isAuthenticated && (
          <div className="mb-8 p-4 bg-gradient-to-r from-blue-900/20 to-slate-800/20 rounded-xl border border-blue-700/30">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-600/20 rounded-full flex items-center justify-center">
                  <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.121 17.804A7.968 7.968 0 0112 15c2.305 0 4.39.867 5.804 2.276M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-white font-medium">
                    Welcome back{userInfo?.username ? `, ${userInfo.username}` : ''}!
                  </h3>
                  <p className="text-gray-400 text-sm">
                    Wallet: {formatWalletAddress(userWallet)}
                  </p>
                </div>
              </div>
              <div className="text-sm text-gray-400">
                Session active
              </div>
            </div>
          </div>
        )}

        {/* Hero Section - apenas se não autenticado */}
        {!isAuthenticated && (
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-4">
              <span className="text-white">Store. Share.</span>
              <br />
              <span className="text-blue-500">Simplify.</span>
            </h1>
            <p className="text-gray-400 text-lg max-w-2xl mx-auto">
              Fast, secure, and reliable cloud storage with a minimalist approach.
            </p>
            <div className="mt-8 flex justify-center gap-4">
              <Link
                to="/app/login"
                className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-all duration-200 hover:shadow-lg hover:shadow-blue-500/25"
              >
                Sign In
              </Link>
              <Link
                to="/app/register"
                className="px-6 py-3 bg-slate-700 hover:bg-slate-600 text-white font-medium rounded-lg transition-all duration-200"
              >
                Create Account
              </Link>
            </div>
          </div>
        )}

        {/* Content Area */}
        <div className="bg-slate-800/60 backdrop-blur-sm rounded-xl border border-slate-700/50 p-6 md:p-8 shadow-2xl mb-12">
          <Outlet />
        </div>

        {/* Stats/Cards Section - apenas se autenticado */}
        {isAuthenticated && (
          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-slate-800/40 rounded-xl p-6 border border-slate-700/30 hover:border-blue-500/30 transition-all duration-300 group">
              <div className="text-blue-500 text-2xl font-bold mb-2 group-hover:scale-110 transition-transform duration-300">📁</div>
              <h3 className="text-white font-semibold mb-2">Your Files</h3>
              <p className="text-gray-400 text-sm">Access your uploaded files anytime</p>
            </div>
            
            <div className="bg-slate-800/40 rounded-xl p-6 border border-slate-700/30 hover:border-blue-500/30 transition-all duration-300 group">
              <div className="text-blue-500 text-2xl font-bold mb-2 group-hover:scale-110 transition-transform duration-300">🔐</div>
              <h3 className="text-white font-semibold mb-2">Secure Storage</h3>
              <p className="text-gray-400 text-sm">All files encrypted on the blockchain</p>
            </div>
            
            <div className="bg-slate-800/40 rounded-xl p-6 border border-slate-700/30 hover:border-blue-500/30 transition-all duration-300 group">
              <Link to="/app/upload" className="block">
                <div className="text-blue-500 text-2xl font-bold mb-2 group-hover:scale-110 transition-transform duration-300">⬆️</div>
                <h3 className="text-white font-semibold mb-2">Upload More</h3>
                <p className="text-gray-400 text-sm">Add new files to your collection</p>
              </Link>
            </div>
          </div>
        )}

        {/* Stats/Cards Section - apenas se não autenticado */}
        {!isAuthenticated && (
          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-slate-800/40 rounded-xl p-6 border border-slate-700/30 hover:border-blue-500/30 transition-all duration-300 group">
              <div className="text-blue-500 text-2xl font-bold mb-2 group-hover:scale-110 transition-transform duration-300">∞</div>
              <h3 className="text-white font-semibold mb-2">Unlimited Speed</h3>
              <p className="text-gray-400 text-sm">Lightning-fast uploads and downloads</p>
            </div>
            
            <div className="bg-slate-800/40 rounded-xl p-6 border border-slate-700/30 hover:border-blue-500/30 transition-all duration-300 group">
              <div className="text-blue-500 text-2xl font-bold mb-2 group-hover:scale-110 transition-transform duration-300">🔒</div>
              <h3 className="text-white font-semibold mb-2">Bank-Grade Security</h3>
              <p className="text-gray-400 text-sm">End-to-end encryption for all files</p>
            </div>
            
            <div className="bg-slate-800/40 rounded-xl p-6 border border-slate-700/30 hover:border-blue-500/30 transition-all duration-300 group">
              <div className="text-blue-500 text-2xl font-bold mb-2 group-hover:scale-110 transition-transform duration-300">⚡</div>
              <h3 className="text-white font-semibold mb-2">Instant Access</h3>
              <p className="text-gray-400 text-sm">Share files with one click</p>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="mt-16 border-t border-slate-700/30 bg-slate-900/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-4 md:mb-0">
              <div className="text-xl font-bold tracking-tight">
                <span className="text-white">block</span>
                <span className="text-blue-500">+</span>
              </div>
              <p className="text-gray-500 text-sm mt-1">© {new Date().getFullYear()} All rights reserved.</p>
            </div>
            
            <div className="flex items-center space-x-6 text-sm">
              <Link 
                to="/app/terms" 
                className="text-gray-400 hover:text-white transition-colors duration-150 hover:underline hover:underline-offset-4"
                activeProps={{ className: 'text-blue-500' }}
              >
                Terms
              </Link>
              <Link 
                to="/app/about" 
                className="text-gray-400 hover:text-white transition-colors duration-150 hover:underline hover:underline-offset-4"
                activeProps={{ className: 'text-blue-500' }}
              >
                About
              </Link>
              <a href="#" className="text-gray-400 hover:text-white transition-colors duration-150 hover:underline hover:underline-offset-4">
                Privacy
              </a>
            </div>
          </div>
        </div>
      </footer>

      {/* Background Elements */}
      <div className="fixed inset-0 -z-10 overflow-hidden">
        {/* Gradient background */}
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900"></div>
        
        {/* Subtle grid pattern */}
        <div className="absolute inset-0 opacity-5"
          style={{
            backgroundImage: `linear-gradient(to right, #60a5fa 1px, transparent 1px),
                            linear-gradient(to bottom, #60a5fa 1px, transparent 1px)`,
            backgroundSize: '50px 50px'
          }}
        ></div>
        
        {/* Subtle floating elements - no glow */}
        <div className="absolute top-20 -left-20 w-64 h-64 border border-slate-700/20 rounded-full animate-[float_20s_ease-in-out_infinite]"></div>
        <div className="absolute bottom-20 -right-20 w-80 h-80 border border-slate-700/20 rounded-full animate-[float_25s_ease-in-out_infinite_reverse]"></div>
      </div>

      {/* Add custom styles */}
      <style>{`
        @keyframes float {
          0%, 100% { transform: translate(0, 0) rotate(0deg); }
          33% { transform: translate(30px, -30px) rotate(120deg); }
          66% { transform: translate(-20px, 20px) rotate(240deg); }
        }
        
        .active {
          position: relative;
        }
        
        .active::after {
          content: '';
          position: absolute;
          bottom: 0;
          left: 16px;
          right: 16px;
          height: 2px;
          background: linear-gradient(to right, #3b82f6, #06b6d4);
          border-radius: 2px;
        }
        
        /* Smooth scroll */
        html {
          scroll-behavior: smooth;
        }
        
        /* Custom scrollbar */
        ::-webkit-scrollbar {
          width: 8px;
        }
        
        ::-webkit-scrollbar-track {
          background: #1e293b;
        }
        
        ::-webkit-scrollbar-thumb {
          background: #475569;
          border-radius: 4px;
        }
        
        ::-webkit-scrollbar-thumb:hover {
          background: #64748b;
        }
      `}</style>
    </div>
  )
}