import { createFileRoute, Link, useNavigate } from '@tanstack/react-router'
import { useState, useEffect } from 'react'
import { loginUser, isLoggedIn } from '../../utils/auth'

export const Route = createFileRoute('/app/login')({
  component: LoginComponent,
})

function LoginComponent() {
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    remember: false
  })
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState({ text: '', type: '' })

  // Verificar se já está logado
  useEffect(() => {
    if (isLoggedIn()) {
      navigate({ to: '/app/upload' })
    }
  }, [navigate])

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    // Validação básica
    if (!formData.username.trim() || !formData.password) {
      setMessage({ text: 'Por favor, insira nome de usuário e senha', type: 'error' })
      return
    }

    setLoading(true)
    setMessage({ text: '', type: '' })

    try {
      console.log('Tentando login com:', { username: formData.username })
      
      // Chamada REAL para a API
      const result = await loginUser(formData.username, formData.password)
      
      console.log('Resposta da API:', result)
      
      // Armazenar no localStorage
      localStorage.setItem('jwtToken', result.token)
      localStorage.setItem('walletAddress', result.wallet)
      
      if (formData.remember) {
        localStorage.setItem('rememberLogin', 'true')
      }
      
      setMessage({ text: 'Login realizado com sucesso! Redirecionando...', type: 'success' })
      
      // Atualizar o estado de autenticação
      window.dispatchEvent(new CustomEvent('authChange', { 
        detail: { isAuthenticated: true, wallet: result.wallet }
      }))
      
      // Redirecionar após 1 segundo
      setTimeout(() => {
        navigate({ to: '/app/upload' })
      }, 1000)
      
    } catch (error) {
      console.error('Erro no login:', error)
      
      // Mapear mensagens de erro específicas
      let errorMessage = 'Erro ao fazer login'
      
      if (error.message.includes('Network')) {
        errorMessage = 'Erro de conexão. Verifique sua internet.'
      } else if (error.message.includes('Invalid')) {
        errorMessage = 'Usuário ou senha incorretos'
      } else if (error.message.includes('response')) {
        errorMessage = 'Erro no servidor. Tente novamente mais tarde.'
      } else {
        errorMessage = error.message
      }
      
      setMessage({ text: errorMessage, type: 'error' })
    } finally {
      setLoading(false)
    }
  }

  const handleForgotPassword = () => {
    setMessage({ text: 'Redirecionando para recuperação de senha...', type: 'info' })
    // Implemente a lógica de recuperação de senha aqui
  }

  return (
    <div className="max-w-md mx-auto">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-white mb-2">
          Login no <span className="text-blue-500">Block+</span>
        </h2>
        <p className="text-gray-400">
          Acesse sua conta para gerenciar seus arquivos
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Campo de Usuário */}
        <div>
          <label htmlFor="username" className="block text-sm font-medium text-gray-300 mb-2">
            Nome de Usuário
          </label>
          <input
            type="text"
            id="username"
            name="username"
            value={formData.username}
            onChange={handleChange}
            required
            placeholder="Digite seu nome de usuário"
            className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700/50 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
            disabled={loading}
          />
        </div>

        {/* Campo de Senha */}
        <div>
          <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-2">
            Senha
          </label>
          <input
            type="password"
            id="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            required
            placeholder="Digite sua senha"
            className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700/50 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
            disabled={loading}
          />
        </div>

        {/* Lembrar-me e Esqueci a senha */}
        <div className="flex justify-between items-center">
          <label className="flex items-center gap-2 text-gray-300 text-sm cursor-pointer">
            <input
              type="checkbox"
              id="remember"
              name="remember"
              checked={formData.remember}
              onChange={handleChange}
              className="w-4 h-4 rounded border-slate-600 bg-slate-700 text-blue-600 focus:ring-blue-500 focus:ring-offset-slate-800"
              disabled={loading}
            />
            Lembrar-me
          </label>
          
          <button
            type="button"
            onClick={handleForgotPassword}
            className="text-sm text-blue-400 hover:text-blue-300 transition-colors duration-200 hover:underline"
            disabled={loading}
          >
            Esqueceu a senha?
          </button>
        </div>

        {/* Botão de Login */}
        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-all duration-200 hover:shadow-lg hover:shadow-blue-500/25 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <span>Entrando...</span>
            </>
          ) : (
            'Entrar'
          )}
        </button>

        {/* Mensagem de feedback */}
        {message.text && (
          <div className={`p-4 rounded-lg border ${
            message.type === 'success' 
              ? 'bg-green-900/30 border-green-700 text-green-300' 
              : message.type === 'error'
              ? 'bg-red-900/30 border-red-700 text-red-300'
              : 'bg-blue-900/30 border-blue-700 text-blue-300'
          }`}>
            {message.text}
          </div>
        )}

        {/* Link para Registro */}
        <div className="text-center pt-4 border-t border-slate-700/30">
          <p className="text-gray-400 text-sm">
            Não tem uma conta?{' '}
            <Link
              to="/app/register"
              className="text-blue-400 hover:text-blue-300 transition-colors duration-200 hover:underline font-medium"
            >
              Cadastre-se aqui
            </Link>
          </p>
        </div>
      </form>

      {/* Informações extras */}
      <div className="mt-8 p-4 bg-slate-800/30 rounded-lg border border-slate-700/30">
        <h4 className="text-sm font-medium text-white mb-2">🔐 Informações de segurança:</h4>
        <ul className="text-gray-400 text-sm space-y-1">
          <li className="flex items-start gap-2">
            <span className="text-blue-500 mt-0.5">•</span>
            <span>Sua senha é criptografada e nunca armazenada em texto puro</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-blue-500 mt-0.5">•</span>
            <span>O token JWT expira automaticamente após 24 horas</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-blue-500 mt-0.5">•</span>
            <span>Seu endereço de carteira é vinculado à sua conta</span>
          </li>
        </ul>
      </div>
    </div>
  )
}