import { createFileRoute, Link, useNavigate } from '@tanstack/react-router'
import { useState, useEffect } from 'react'
import { ApiPromise, WsProvider } from '@polkadot/api'
import { web3Accounts, web3Enable, web3FromAddress } from '@polkadot/extension-dapp'

export const Route = createFileRoute('/app/register')({
  component: RegisterComponent,
})

function RegisterComponent() {
  const navigate = useNavigate()
  const [api, setApi] = useState(null)
  const [formData, setFormData] = useState({
    wallet: '',
    username: '',
    password: '',
    terms: false
  })
  const [loading, setLoading] = useState(false)
  const [connecting, setConnecting] = useState(false)
  const [charging, setCharging] = useState(false)
  const [message, setMessage] = useState({ text: '', type: '' })
  const [walletConnected, setWalletConnected] = useState(false)
  const [walletAddress, setWalletAddress] = useState('')
  const [walletName, setWalletName] = useState('')
  const [walletStatus, setWalletStatus] = useState('Connect your Polkadot wallet to register')
  const [userBalance, setUserBalance] = useState(null)
  const [tokenDecimals, setTokenDecimals] = useState(12)
  const [tokenSymbol, setTokenSymbol] = useState('TCESS')
  const [accounts, setAccounts] = useState([])
  const [showAccountList, setShowAccountList] = useState(false)
  const [tCessCharged, setTCessCharged] = useState(false)
  const [transactionHash, setTransactionHash] = useState('')

  // Configurações
  const SERVICE_WALLET = '5EU1Jt7XHKgZhHo3HJji63PQi54t8wmZ8wQQF3Dnn1WBFoyy'
  const REGISTRATION_FEE = 3 // 3 TCESS em vez de 100

  // Inicializar API Polkadot
  useEffect(() => {
    const initializeApi = async () => {
      try {
        setWalletStatus('Connecting to CESS network...')
        const wsProvider = new WsProvider('wss://testnet-rpc.cess.network')
        const polkadotApi = await ApiPromise.create({
          provider: wsProvider,
          throwOnConnect: true
        })

        setApi(polkadotApi)

        // Obter informações do token
        const chainProperties = polkadotApi.registry.getChainProperties()
        const decimals = chainProperties?.tokenDecimals?.toJSON()?.[0] || 12
        const symbol = chainProperties?.tokenSymbol?.toJSON()?.[0] || 'TCESS'

        setTokenDecimals(Number(decimals))
        setTokenSymbol(symbol)

        setWalletStatus('✅ Connected to CESS network')
        console.log(`Connected to CESS network (${symbol}, decimals: ${decimals})`)
        console.log(`Service wallet: ${SERVICE_WALLET}`)
        console.log(`Registration fee: ${REGISTRATION_FEE} ${symbol}`)

      } catch (error) {
        console.error('Failed to connect to CESS network:', error)
        setWalletStatus('❌ Failed to connect to CESS network')
        setMessage({
          text: 'Cannot connect to blockchain network. Please try again later.',
          type: 'error'
        })
      }
    }

    initializeApi()

    return () => {
      if (api) {
        api.disconnect()
      }
    }
  }, [])

  // Verificar se já está logado
  useEffect(() => {
    const token = localStorage.getItem('jwtToken')
    const wallet = localStorage.getItem('walletAddress')

    if (token && wallet) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]))
        if (payload.exp > Date.now() / 1000) {
          navigate({ to: '/app' })
        }
      } catch (e) {
        // Token inválido, continuar com registro
      }
    }
  }, [navigate])

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))
  }

  const handlePolkadotConnect = async () => {
    try {
      setConnecting(true)
      setWalletStatus('Checking for Polkadot extension...')

      // Habilitar extensão
      const extensions = await web3Enable('Block+ Registration')

      if (extensions.length === 0) {
        throw new Error('No Polkadot extension found. Please install Polkadot.js extension.')
      }

      setWalletStatus('Loading your accounts...')
      const allAccounts = await web3Accounts()

      if (!allAccounts || allAccounts.length === 0) {
        throw new Error('No accounts found in wallet. Please create or import an account.')
      }

      setAccounts(allAccounts)
      setShowAccountList(true)
      setWalletStatus(`Found ${allAccounts.length} account(s). Select one to continue.`)
      setConnecting(false)

    } catch (error) {
      console.error('Polkadot connection error:', error)
      setMessage({
        text: `Wallet Error: ${error.message}`,
        type: 'error'
      })
      setWalletStatus('Connection failed. Please try again.')
      setConnecting(false)
    }
  }

  const selectAccount = async (account) => {
    try {
      setConnecting(true)
      setWalletStatus(`Connecting to ${account.meta.name || 'Account'}...`)

      // Armazenar informações da conta
      setWalletAddress(account.address)
      setWalletName(account.meta.name || 'Account')
      setFormData(prev => ({ ...prev, wallet: account.address }))

      // Obter saldo de forma SEGURA
      if (api) {
        const { data: accountInfo } = await api.query.system.account(account.address)
        const freeBalance = accountInfo.free

        console.log('Balance raw (string):', freeBalance.toString())
        console.log('Balance human readable:', freeBalance.toHuman())

        // Calcular saldo em TCESS
        let freeInTCESS = 0
        const balanceStr = freeBalance.toString()
        const divisor = Math.pow(10, tokenDecimals)

        if (balanceStr.length <= 15) {
          // Se for pequeno o suficiente, usar Number direto
          freeInTCESS = Number(balanceStr) / divisor
        } else {
          // Para números muito grandes, usar divisão de string
          const decimalPos = balanceStr.length - tokenDecimals
          const wholePart = decimalPos > 0 ? balanceStr.substring(0, decimalPos) : '0'
          const decimalPart = decimalPos > 0 ?
            balanceStr.substring(decimalPos) :
            '0'.repeat(-decimalPos) + balanceStr

          freeInTCESS = Number(wholePart) +
            Number('0.' + decimalPart.substring(0, 10))
        }

        console.log(`Account balance: ${freeInTCESS} ${tokenSymbol}`)
        setUserBalance(freeInTCESS)

        // Verificar se tem saldo suficiente para 3 TCESS
        if (freeInTCESS < REGISTRATION_FEE) {
          throw new Error(`Insufficient balance. You need at least ${REGISTRATION_FEE} ${tokenSymbol} to register. Current: ${freeInTCESS.toFixed(2)} ${tokenSymbol}`)
        }

        // Cobrar 3 TCESS (transação REAL)
        await chargeTCESS(account.address, freeInTCESS)
      }

      setShowAccountList(false)

    } catch (error) {
      console.error('Account selection error:', error)
      setMessage({
        text: `Error: ${error.message}`,
        type: 'error'
      })
      setWalletStatus('Account selection failed.')
      setConnecting(false)
    }
  }

  // Função REAL para cobrar 3 TCESS
  const chargeTCESS = async (address, currentBalance) => {
    try {
      setCharging(true)
      setWalletStatus(`Verifying balance: ${currentBalance.toFixed(2)} ${tokenSymbol}...`)

      // Verificação de saldo
      if (currentBalance < REGISTRATION_FEE) {
        throw new Error(`Insufficient balance. Need ${REGISTRATION_FEE} ${tokenSymbol}, you have ${currentBalance.toFixed(2)}`)
      }

      setWalletStatus(`Processing ${REGISTRATION_FEE} ${tokenSymbol} registration fee...`)

      // Para DEBUG: Mostrar quanto será debitado
      console.log(`Will charge: ${REGISTRATION_FEE} ${tokenSymbol}`)
      console.log(`Current balance: ${currentBalance} ${tokenSymbol}`)
      console.log(`Service wallet: ${SERVICE_WALLET}`)

      // FAZER TRANSAÇÃO REAL
      try {
        const txHash = await realTCESSCharge(address)

        // Sucesso na transação
        setTCessCharged(true)
        setWalletConnected(true)
        setTransactionHash(txHash)

        const shortenedAddress = address.substring(0, 8) + '...' + address.substring(address.length - 6)
        setWalletStatus(`✅ Connected & Charged: ${shortenedAddress} | -${REGISTRATION_FEE} ${tokenSymbol}`)

        // Atualizar saldo local (estimativa)
        const remainingBalance = parseFloat((currentBalance - REGISTRATION_FEE).toFixed(6))
        setUserBalance(remainingBalance)

        // Salvar informações da transação
        localStorage.setItem('registrationFeePaid', 'true')
        localStorage.setItem('registrationFeeAmount', REGISTRATION_FEE.toString())
        localStorage.setItem('registrationFeeToken', tokenSymbol)
        localStorage.setItem('registrationTxHash', txHash)

      } catch (txError) {
        throw new Error(`Transaction failed: ${txError.message}`)
      }

    } catch (error) {
      setMessage({
        text: `Charge Error: ${error.message}`,
        type: 'error'
      })
      throw error
    } finally {
      setCharging(false)
      setConnecting(false)
    }
  }

  // Função REAL para transação de 3 TCESS
  // Função ULTIMATE com todos os fallbacks
  const realTCESSCharge = async (address) => {
    try {
      // 1. Obter signer
      const injector = await web3FromAddress(address)

      // 2. Calcular amount
      const amountInBaseUnits = BigInt(REGISTRATION_FEE) * BigInt(10 ** tokenDecimals)
      console.log(`Transfer ${REGISTRATION_FEE} ${tokenSymbol} = ${amountInBaseUnits} units`)

      // 3. DEBUG: Listar todos os módulos disponíveis
      console.log('=== DEBUG: API TX MODULES ===')
      const modules = Object.keys(api.tx).sort()
      modules.forEach(module => {
        const methods = Object.keys(api.tx[module] || {})
        console.log(`${module}: ${methods.join(', ')}`)
      })
      console.log('============================')

      // 4. Tentar diferentes métodos de transferência (em ordem)
      let transferTx = null
      let usedMethod = ''

      // Métodos a tentar (em ordem de probabilidade)
      const transferMethods = [
        { module: 'balances', method: 'transferKeepAlive' },
        { module: 'balances', method: 'transferAllowDeath' },
        { module: 'balances', method: 'transfer' },
        { module: 'assets', method: 'transfer' },
        { module: 'tokens', method: 'transfer' },
        { module: 'currency', method: 'transfer' },
        { module: 'ormlTokens', method: 'transfer' },
        { module: 'genericAsset', method: 'transfer' }
      ]

      for (const { module, method } of transferMethods) {
        if (api.tx[module]?.[method]) {
          try {
            console.log(`Trying ${module}.${method}`)

            if (module === 'assets') {
              // Assets module geralmente precisa de assetId
              transferTx = api.tx[module][method](0, SERVICE_WALLET, amountInBaseUnits)
            } else {
              transferTx = api.tx[module][method](SERVICE_WALLET, amountInBaseUnits)
            }

            usedMethod = `${module}.${method}`
            console.log(`✓ Using ${usedMethod}`)
            break
          } catch (error) {
            console.log(`✗ ${module}.${method} failed:`, error.message)
          }
        }
      }

      // 5. Se nenhum método funcionar, tentar detectar automaticamente
      if (!transferTx) {
        console.log('No standard transfer found, searching...')

        for (const module of modules) {
          if (api.tx[module]?.transfer) {
            try {
              console.log(`Trying ${module}.transfer as fallback`)
              transferTx = api.tx[module].transfer(SERVICE_WALLET, amountInBaseUnits)
              usedMethod = `${module}.transfer`
              console.log(`✓ Found fallback: ${usedMethod}`)
              break
            } catch (error) {
              console.log(`✗ ${module}.transfer failed:`, error.message)
            }
          }
        }
      }

      if (!transferTx) {
        throw new Error(`No transfer function found. Available modules: ${modules.join(', ')}`)
      }

      // 6. Enviar transação
      console.log(`Using transfer method: ${usedMethod}`)
      console.log('Transaction details:', transferTx.toHuman())

      return new Promise((resolve, reject) => {
        transferTx.signAndSend(
          address,
          { signer: injector.signer },
          ({ status, events, txHash }) => {
            console.log(`Status: ${status.type}`)

            if (status.isInBlock) {
              setWalletStatus('Transaction confirmed (in block)...')
            }

            if (status.isFinalized) {
              console.log(`Transaction finalized in block: ${status.asFinalized.toHex()}`)

              // Verificar resultado
              let success = false
              events.forEach(({ event }) => {
                const eventName = `${event.section}.${event.method}`
                console.log(`Event: ${eventName}`, event.data.toHuman())

                if (event.section === 'system' && event.method === 'ExtrinsicSuccess') {
                  success = true
                }
              })

              if (success) {
                console.log('✅ Transaction successful!')
                resolve(txHash.toHex())
              } else {
                console.log('❌ Transaction failed - no success event')
                reject(new Error('Transaction execution failed'))
              }
            }
          }
        ).catch(reject)
      })

    } catch (error) {
      console.error('Transaction setup failed:', error)
      throw new Error(`Transaction failed: ${error.message}`)
    }
  }

  const validateForm = () => {
    return (
      walletConnected &&
      tCessCharged &&
      formData.username.trim().length >= 3 &&
      formData.password.length >= 6 &&
      formData.terms
    )
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!validateForm()) {
      setMessage({
        text: 'Please complete all steps: connect wallet, pay fee, and fill form',
        type: 'error'
      })
      return
    }

    setLoading(true)
    setMessage({ text: '', type: '' })

    try {
      console.log('Sending registration data:', {
        wallet: formData.wallet,
        username: formData.username,
        transactionHash: transactionHash
      })

      const response = await fetch('/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          wallet: formData.wallet,
          username: formData.username.trim(),
          password: formData.password,
          transactionHash: transactionHash // Enviar hash da transação para validação
        })
      })

      const result = await response.json()

      if (response.ok) {
        // Armazenar token e wallet
        if (result.token && result.wallet) {
          localStorage.setItem('jwtToken', result.token)
          localStorage.setItem('walletAddress', result.wallet)
          console.log('Registration successful - user logged in')
        }

        setMessage({
          text: 'Account created successfully! Redirecting...',
          type: 'success'
        })

        // Atualizar estado de autenticação
        window.dispatchEvent(new CustomEvent('authChange', {
          detail: { isAuthenticated: true, wallet: result.wallet }
        }))

        // Redirecionar
        setTimeout(() => {
          navigate({ to: '/app' })
        }, 1500)

      } else {
        setMessage({
          text: `Error: ${result.message || 'Registration failed'}`,
          type: 'error'
        })
      }
    } catch (error) {
      console.error('Registration error:', error)
      setMessage({
        text: `Network error: ${error.message}`,
        type: 'error'
      })
    } finally {
      setLoading(false)
    }
  }

  const isFormValid = validateForm()

  return (
    <div className="max-w-md mx-auto">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-white mb-2">
          Create Your <span className="text-blue-500">Block+</span> Account
        </h2>
        <p className="text-gray-400">
          Decentralized storage with Polkadot wallet - {REGISTRATION_FEE} {tokenSymbol} fee
        </p>
      </div>

      {/* Progress Steps */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div className={`flex flex-col items-center ${walletConnected ? 'text-green-400' : 'text-gray-400'}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center mb-1 ${walletConnected ? 'bg-green-600' : 'bg-gray-700'}`}>
              {walletConnected ? '✓' : '1'}
            </div>
            <span className="text-xs">Connect Wallet</span>
          </div>
          <div className={`flex flex-col items-center ${tCessCharged ? 'text-green-400' : 'text-gray-400'}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center mb-1 ${tCessCharged ? 'bg-green-600' : walletConnected ? 'bg-blue-600' : 'bg-gray-700'}`}>
              {tCessCharged ? '✓' : '2'}
            </div>
            <span className="text-xs">Pay {REGISTRATION_FEE} {tokenSymbol}</span>
          </div>
          <div className={`flex flex-col items-center ${isFormValid ? 'text-green-400' : 'text-gray-400'}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center mb-1 ${isFormValid ? 'bg-green-600' : tCessCharged ? 'bg-blue-600' : 'bg-gray-700'}`}>
              {isFormValid ? '✓' : '3'}
            </div>
            <span className="text-xs">Register</span>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Polkadot Wallet Connection */}
        <div>
          <div className="mb-4">
            {!walletConnected ? (
              <div className="space-y-4">
                {!showAccountList ? (
                  <button
                    type="button"
                    onClick={handlePolkadotConnect}
                    disabled={connecting || !api}
                    className={`w-full py-3 px-4 text-white font-medium rounded-lg transition-all duration-200 flex items-center justify-center gap-2 ${api && !connecting
                      ? 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 hover:shadow-lg hover:shadow-purple-500/25'
                      : 'bg-gray-700 cursor-not-allowed'
                      }`}
                  >
                    {connecting ? (
                      <>
                        <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        <span>Connecting...</span>
                      </>
                    ) : (
                      <>
                        <div className="w-5 h-5">
                          <svg viewBox="0 0 32 32" fill="currentColor">
                            <circle cx="16" cy="16" r="16" fill="#E6007A" />
                            <path d="M16 25.6c5.3 0 9.6-4.3 9.6-9.6S21.3 6.4 16 6.4 6.4 10.7 6.4 16s4.3 9.6 9.6 9.6z" fill="white" />
                            <path d="M19.2 16c0 1.8-1.4 3.2-3.2 3.2s-3.2-1.4-3.2-3.2 1.4-3.2 3.2-3.2 3.2 1.4 3.2 3.2z" fill="#E6007A" />
                          </svg>
                        </div>
                        <span>Connect Polkadot Wallet ({REGISTRATION_FEE} {tokenSymbol} fee)</span>
                      </>
                    )}
                  </button>
                ) : (
                  <div className="space-y-3">
                    <p className="text-sm text-gray-400 text-center mb-2">Select your account (need {REGISTRATION_FEE} {tokenSymbol}):</p>
                    {accounts.map((account, index) => (
                      <button
                        key={account.address}
                        type="button"
                        onClick={() => selectAccount(account)}
                        disabled={connecting || charging}
                        className={`w-full p-3 text-left rounded-lg transition-colors duration-150 border ${connecting || charging
                          ? 'bg-gray-800/50 border-gray-700/50 cursor-not-allowed'
                          : 'bg-slate-700/30 hover:bg-slate-700/50 border-slate-700/50'
                          }`}
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-white font-medium">
                              {account.meta.name || `Account ${index + 1}`}
                            </p>
                            <p className="text-gray-400 text-sm font-mono">
                              {account.address.substring(0, 16)}...
                            </p>
                          </div>
                          {connecting || charging ? (
                            <svg className="animate-spin h-4 w-4 text-purple-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                          ) : (
                            <svg className="w-5 h-5 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                            </svg>
                          )}
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <div className="p-4 bg-green-900/20 rounded-lg border border-green-700/30">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-green-600/20 rounded-full flex items-center justify-center flex-shrink-0">
                    <svg className="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-white font-medium">
                      {walletName} • {walletAddress.substring(0, 8)}...{walletAddress.substring(walletAddress.length - 6)}
                    </p>
                    <p className="text-green-400 text-sm">
                      ✓ {REGISTRATION_FEE} {tokenSymbol} fee paid • Balance: {userBalance?.toFixed(2)} {tokenSymbol}
                    </p>
                    {transactionHash && (
                      <p className="text-blue-400 text-xs mt-1">
                        TX: {transactionHash.substring(0, 16)}...
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>

          <p className={`text-sm ${walletConnected ? 'text-green-400' : charging ? 'text-blue-400' : 'text-gray-500'}`}>
            {walletStatus}
            {charging && (
              <span className="ml-2 inline-flex items-center">
                <svg className="animate-spin h-3 w-3 mr-1" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Processing transaction...
              </span>
            )}
          </p>
        </div>

        {/* Username Field */}
        <div>
          <label htmlFor="username" className="block text-sm font-medium text-gray-300 mb-2">
            Username *
          </label>
          <input
            type="text"
            id="username"
            name="username"
            value={formData.username}
            onChange={handleChange}
            required
            minLength="3"
            placeholder="Choose a unique username"
            className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700/50 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
            disabled={loading || !walletConnected}
          />
          <p className="text-xs text-gray-500 mt-1">
            Must be at least 3 characters, letters and numbers only
          </p>
        </div>

        {/* Password Field */}
        <div>
          <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-2">
            Password *
          </label>
          <input
            type="password"
            id="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            required
            minLength="6"
            placeholder="Create a strong password"
            className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700/50 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
            disabled={loading || !walletConnected}
          />
          <p className="text-xs text-gray-500 mt-1">
            Minimum 6 characters, include numbers and special characters
          </p>
        </div>

        {/* Terms Agreement */}
        <div className="flex items-start gap-3">
          <input
            type="checkbox"
            id="terms"
            name="terms"
            checked={formData.terms}
            onChange={handleChange}
            required
            className="mt-1 w-4 h-4 rounded border-slate-600 bg-slate-700 text-blue-600 focus:ring-blue-500 focus:ring-offset-slate-800"
            disabled={loading || !walletConnected}
          />
          <label htmlFor="terms" className="text-sm text-gray-300 cursor-pointer">
            I agree to the{' '}
            <Link
              to="/app/terms"
              className="text-blue-400 hover:text-blue-300 hover:underline"
            >
              Terms of Service
            </Link>
            {' '}and{' '}
            <Link
              to="/app/privacy"
              className="text-blue-400 hover:text-blue-300 hover:underline"
            >
              Privacy Policy
            </Link>
          </label>
        </div>

        {/* Hidden wallet field */}
        <input type="hidden" name="wallet" value={formData.wallet} />

        {/* Submit Button */}
        <button
          type="submit"
          disabled={!isFormValid || loading}
          className={`w-full py-3 px-4 text-white font-medium rounded-lg transition-all duration-200 flex items-center justify-center gap-2 ${isFormValid && !loading
            ? 'bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 hover:shadow-lg hover:shadow-blue-500/25'
            : 'bg-gray-700 cursor-not-allowed'
            }`}
        >
          {loading ? (
            <>
              <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <span>Creating Account...</span>
            </>
          ) : (
            'Complete Registration'
          )}
        </button>

        {/* Message Display */}
        {message.text && (
          <div className={`p-4 rounded-lg border ${message.type === 'success'
            ? 'bg-green-900/30 border-green-700 text-green-300'
            : 'bg-red-900/30 border-red-700 text-red-300'
            }`}>
            <div className="flex items-center gap-2">
              {message.type === 'success' ? (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              ) : (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.998-.833-2.732 0L4.142 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              )}
              <span>{message.text}</span>
            </div>
          </div>
        )}

        {/* Login Link */}
        <div className="text-center pt-4 border-t border-slate-700/30">
          <p className="text-gray-400 text-sm">
            Already have an account?{' '}
            <Link
              to="/app/login"
              className="text-blue-400 hover:text-blue-300 transition-colors duration-200 hover:underline font-medium"
            >
              Login here
            </Link>
          </p>
        </div>
      </form>

      {/* Registration Info */}
      <div className="mt-8 space-y-4">
        <div className="p-4 bg-slate-800/30 rounded-lg border border-slate-700/30">
          <h4 className="text-sm font-medium text-white mb-2">💰 Registration Fee</h4>
          <ul className="text-gray-400 text-sm space-y-1">
            <li className="flex items-center gap-2">
              <span className="text-purple-500">•</span>
              <span>One-time fee: {REGISTRATION_FEE} {tokenSymbol} (real transaction)</span>
            </li>
            <li className="flex items-center gap-2">
              <span className="text-purple-500">•</span>
              <span>Sent to service wallet: {SERVICE_WALLET.substring(0, 12)}...</span>
            </li>
            <li className="flex items-center gap-2">
              <span className="text-purple-500">•</span>
              <span>Required for account activation and blockchain storage</span>
            </li>
          </ul>
        </div>

        <div className="p-4 bg-slate-800/30 rounded-lg border border-slate-700/30">
          <h4 className="text-sm font-medium text-white mb-2">🔐 Real Transaction</h4>
          <ul className="text-gray-400 text-sm space-y-1">
            <li className="flex items-start gap-2">
              <span className="text-blue-500 mt-0.5">•</span>
              <span>Uses real on-chain transaction (not simulation)</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-500 mt-0.5">•</span>
              <span>Transaction hash will be saved with your account</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-500 mt-0.5">•</span>
              <span>You need to sign the transaction in Polkadot.js extension</span>
            </li>
          </ul>
          {transactionHash && (
            <div className="mt-3 p-2 bg-blue-900/20 rounded border border-blue-700/30">
              <p className="text-xs text-blue-400">
                Transaction: {transactionHash.substring(0, 24)}...
              </p>
            </div>
          )}
        </div>

        <div className="p-4 bg-slate-800/30 rounded-lg border border-slate-700/30">
          <h4 className="text-sm font-medium text-white mb-2">⚠️ Important Notes</h4>
          <ul className="text-gray-400 text-sm space-y-1">
            <li className="flex items-start gap-2">
              <span className="text-orange-500 mt-0.5">•</span>
              <span>Wallet address cannot be changed after registration</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-orange-500 mt-0.5">•</span>
              <span>{REGISTRATION_FEE} {tokenSymbol} fee is non-refundable</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-orange-500 mt-0.5">•</span>
              <span>Ensure you have enough balance for network fees too</span>
            </li>
          </ul>
        </div>
      </div>

      {/* Debug Info para Desenvolvimento */}
      {process.env.NODE_ENV === 'development' && (
        <div className="mt-6 p-4 bg-gray-900/50 rounded-lg border border-gray-700/30">
          <h4 className="text-sm font-medium text-white mb-2">Debug Info</h4>
          <div className="text-xs font-mono text-gray-400 space-y-1">
            <p>Service Wallet: {SERVICE_WALLET}</p>
            <p>Registration Fee: {REGISTRATION_FEE} {tokenSymbol}</p>
            <p>Token Decimals: {tokenDecimals}</p>
            <p>Connected: {walletConnected ? 'Yes' : 'No'}</p>
            <p>Charged: {tCessCharged ? 'Yes' : 'No'}</p>
            <p>TX Hash: {transactionHash || 'None'}</p>
          </div>
        </div>
      )}
    </div>
  )
}


export default RegisterComponent