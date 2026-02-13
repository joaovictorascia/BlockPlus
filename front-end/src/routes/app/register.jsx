import { createFileRoute, useNavigate, Link } from '@tanstack/react-router'
import { useState, useEffect, useRef } from 'react'
import { ApiPromise, WsProvider } from '@polkadot/api'
import { web3Accounts, web3Enable, web3FromAddress } from '@polkadot/extension-dapp'

// --- Configuration ---
const SERVICE_WALLET = '5EU1Jt7XHKgZhHo3HJji63PQi54t8wmZ8wQQF3Dnn1WBFoyy'
const REGISTRATION_FEE = 3
const NETWORK_WS = 'wss://testnet-rpc.cess.network'
const RECONNECT_DELAY_MS = 3000 // 3 seconds delay between reconnection attempts

export const Route = createFileRoute('/app/register')({
  component: RegisterComponent,
})

// --- Hook: Wallet & Blockchain Logic ---
function useCessWallet() {
  const [api, setApi] = useState(null)
  const [isInitializing, setIsInitializing] = useState(true)
  const [status, setStatus] = useState('idle')
  const [statusMsg, setStatusMsg] = useState('')
  const [accounts, setAccounts] = useState([])
  const [selectedAccount, setSelectedAccount] = useState(null)
  const [walletInfo, setWalletInfo] = useState({ address: '', name: '', balance: 0, symbol: 'TCESS', decimals: 12 })
  const [txHash, setTxHash] = useState('')
  const [txInProgress, setTxInProgress] = useState(false)
  
  // Use refs to track ongoing transactions
  const unsubscribeRef = useRef(null)
  const connectionAttemptsRef = useRef(0)

  // 1. Initialize API with reconnection logic
  useEffect(() => {
    let mounted = true
    let wsProvider = null
    let reconnectTimeout = null

    const initApi = async () => {
      try {
        setStatusMsg('Connecting to CESS network...')
        
        wsProvider = new WsProvider(NETWORK_WS)
        
        // Add event listeners for connection status
        wsProvider.on('disconnected', () => {
          if (mounted) {
            setStatusMsg('⚠️ Network disconnected. Attempting to reconnect...')
            // Attempt to reconnect after delay
            reconnectTimeout = setTimeout(() => initApi(), RECONNECT_DELAY_MS)
          }
        })

        wsProvider.on('error', () => {
          if (mounted) {
            setStatusMsg('⚠️ Network error. Attempting to reconnect...')
            reconnectTimeout = setTimeout(() => initApi(), RECONNECT_DELAY_MS)
          }
        })

        const polkadotApi = await ApiPromise.create({ 
          provider: wsProvider, 
          throwOnConnect: false,
          noInitWarn: true
        })
        
        // Wait for API to be ready
        await polkadotApi.isReady
        
        if (mounted) {
          setApi(polkadotApi)
          const props = polkadotApi.registry.getChainProperties()
          setWalletInfo(prev => ({
            ...prev,
            decimals: props?.tokenDecimals?.toJSON()?.[0] || 12,
            symbol: props?.tokenSymbol?.toJSON()?.[0] || 'TCESS'
          }))
          setStatusMsg('✅ Connected to CESS network')
          setIsInitializing(false)
          connectionAttemptsRef.current = 0
        }
      } catch (e) {
        console.error('API initialization error:', e)
        if (mounted) {
          connectionAttemptsRef.current += 1
          
          // Only show error after multiple failed attempts
          if (connectionAttemptsRef.current > 3) {
            setStatus('error')
            setStatusMsg('❌ Failed to connect to CESS network after multiple attempts')
            setIsInitializing(false)
          } else {
            setStatusMsg(`⚠️ Connection attempt ${connectionAttemptsRef.current}/3 failed. Retrying...`)
            reconnectTimeout = setTimeout(() => initApi(), RECONNECT_DELAY_MS)
          }
        }
      }
    }

    initApi()

    return () => { 
      mounted = false
      if (reconnectTimeout) clearTimeout(reconnectTimeout)
      if (wsProvider) {
        wsProvider.disconnect()
      }
      // Clean up any ongoing transaction subscription
      if (unsubscribeRef.current) {
        unsubscribeRef.current()
      }
    }
  }, [])

  // 2. Connect Extension
  const connectWallet = async () => {
    try {
      setStatus('connecting')
      setStatusMsg('Checking for Polkadot extension...')
      
      const extensions = await web3Enable('Block+ Registration')
      if (extensions.length === 0) throw new Error('Polkadot extension not found')

      const allAccounts = await web3Accounts()
      if (!allAccounts.length) throw new Error('No accounts found')

      setAccounts(allAccounts)
      setStatus('idle') 
      setStatusMsg(`Found ${allAccounts.length} account(s)`)
    } catch (err) {
      setStatus('error')
      setStatusMsg(err.message)
    }
  }

  // 3. Select & Check Balance
  const selectAccount = async (account) => {
    if (!api || !api.isReady) {
      setStatus('error')
      setStatusMsg('Network not ready. Please wait...')
      return
    }

    setStatus('charging')
    setStatusMsg(`Checking balance for ${account.meta.name}...`)
    setSelectedAccount(account)

    try {
      const { data: { free } } = await api.query.system.account(account.address)
      
      const rawBalance = BigInt(free.toString())
      const divisor = BigInt(10 ** walletInfo.decimals)
      const readableBalance = Number(rawBalance) / Number(divisor)

      if (readableBalance < REGISTRATION_FEE) {
        throw new Error(`Insufficient balance. Need ${REGISTRATION_FEE} ${walletInfo.symbol}`)
      }

      setWalletInfo(prev => ({ 
        ...prev, 
        address: account.address, 
        name: account.meta.name, 
        balance: readableBalance 
      }))
      
      // Auto-trigger charge
      await chargeFee(account.address, walletInfo.decimals)
    } catch (err) {
      setStatus('error')
      setStatusMsg(err.message)
      setSelectedAccount(null)
    }
  }

  // 4. Charge Fee - Wait indefinitely, no timeout
  const chargeFee = async (address, decimals) => {
    if (!api || !api.isReady) {
      setStatus('error')
      setStatusMsg('Network not ready. Please try again.')
      return
    }

    setTxInProgress(true)
    setStatus('charging')
    setStatusMsg(`Processing ${REGISTRATION_FEE} ${walletInfo.symbol} registration fee...`)
    setTxHash('')

    try {
      const injector = await web3FromAddress(address)
      const amount = BigInt(REGISTRATION_FEE) * BigInt(10 ** decimals)
      
      const tx = api.tx.balances.transferKeepAlive 
        ? api.tx.balances.transferKeepAlive(SERVICE_WALLET, amount)
        : api.tx.balances.transfer(SERVICE_WALLET, amount)

      // Create a promise that resolves when transaction is finalized
      const transactionPromise = new Promise(async (resolve, reject) => {
        try {
          // Sign and send transaction
          const unsub = await tx.signAndSend(address, { signer: injector.signer }, ({ status, events, txHash, dispatchError }) => {
            
            // Update status based on transaction progress
            if (status.isBroadcast) {
              setStatusMsg('📡 Transaction broadcast to network...')
            }
            
            if (status.isInBlock) {
              setStatusMsg('📦 Transaction in block, waiting for finalization...')
            }
            
            if (status.isFinalized) {
              // Check if transaction was successful
              const success = events.some(({ event }) => api.events.system.ExtrinsicSuccess.is(event))
              
              if (success) {
                setTxHash(txHash.toHex())
                setStatus('success')
                setStatusMsg(`✅ Connected & Charged: -${REGISTRATION_FEE} ${walletInfo.symbol}`)
                setTxInProgress(false)
                resolve(txHash.toHex())
              } else {
                // Find error event
                const failedEvent = events.find(({ event }) => 
                  api.events.system.ExtrinsicFailed.is(event)
                )
                
                if (failedEvent) {
                  const { event: { data } } = failedEvent
                  const error = data[0]
                  
                  // Decode error
                  if (error.isModule) {
                    const decoded = api.registry.findMetaError(error.asModule)
                    reject(new Error(`${decoded.section}.${decoded.name}: ${decoded.docs}`))
                  } else {
                    reject(new Error('Transaction failed on-chain'))
                  }
                } else {
                  reject(new Error('Transaction failed on-chain'))
                }
              }
              
              // Unsubscribe after transaction is finalized
              unsub()
            }

            // Handle dispatch error
            if (dispatchError) {
              if (dispatchError.isModule) {
                const decoded = api.registry.findMetaError(dispatchError.asModule)
                reject(new Error(`${decoded.section}.${decoded.name}: ${decoded.docs}`))
              } else {
                reject(new Error('Transaction failed: ' + dispatchError.toString()))
              }
              unsub()
            }
          })
          
          // Store unsubscribe function for cleanup
          unsubscribeRef.current = unsub
        } catch (e) {
          reject(e)
        }
      })

      // Wait for transaction to complete (no timeout)
      const hash = await transactionPromise
      
    } catch (err) {
      console.error('Transaction error:', err)
      setStatus('error')
      
      // Handle specific error messages
      if (err.message.includes('1010: Invalid Transaction')) {
        setStatusMsg('Error: Invalid transaction. The fee might have changed.')
      } else if (err.message.includes('Cancelled')) {
        setStatusMsg('❌ Transaction was cancelled in extension')
      } else if (err.message.includes('disconnected')) {
        setStatusMsg('❌ Network disconnected during transaction. Please try again.')
      } else {
        setStatusMsg(`Error: ${err.message}`)
      }
      
      setTxInProgress(false)
      setSelectedAccount(null)
      
      // Reset wallet selection on error
      setWalletInfo(prev => ({ ...prev, address: '', name: '', balance: 0 }))
    }
  }

  // Function to retry transaction if it fails
  const retryTransaction = async () => {
    if (selectedAccount && api?.isReady) {
      await chargeFee(selectedAccount.address, walletInfo.decimals)
    }
  }

  return { 
    api, 
    isInitializing, 
    status, 
    statusMsg, 
    accounts, 
    walletInfo, 
    txHash,
    txInProgress,
    selectedAccount,
    connectWallet, 
    selectAccount,
    retryTransaction
  }
}

// --- Component ---
function RegisterComponent() {
  const navigate = useNavigate()
  const { 
    isInitializing, 
    status, 
    statusMsg, 
    accounts, 
    walletInfo, 
    txHash,
    txInProgress,
    selectedAccount,
    connectWallet, 
    selectAccount,
    retryTransaction
  } = useCessWallet()
  
  const [formData, setFormData] = useState({ username: '', password: '', terms: false })
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!txHash) return

    setIsSubmitting(true)
    try {
      const response = await fetch('/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          wallet: walletInfo.address,
          username: formData.username,
          password: formData.password,
          transactionHash: txHash
        })
      })

      const result = await response.json()
      if (response.ok) {
        localStorage.setItem('jwtToken', result.token)
        localStorage.setItem('walletAddress', result.wallet)
        navigate({ to: '/app' })
      } else {
        throw new Error(result.message)
      }
    } catch (error) {
      alert(`Registration failed: ${error.message}`)
    } finally {
      setIsSubmitting(false)
    }
  }

  // State flags
  const isPaid = status === 'success' && txHash
  const isProcessing = status === 'charging' || txInProgress
  const isConnecting = status === 'connecting'
  const hasError = status === 'error'
  const canRegister = isPaid && formData.username && formData.password.length >= 6 && formData.terms

  // Determine status display message
  const getStatusDisplay = () => {
    if (isInitializing) return 'Initializing connection...'
    if (isProcessing) {
      if (statusMsg.includes('Processing')) return '⏳ Processing payment - This may take a moment...'
      if (statusMsg.includes('broadcast')) return '📡 Transaction sent - Waiting for confirmation...'
      if (statusMsg.includes('block')) return '📦 Transaction in block - Almost done...'
      return statusMsg || 'Processing transaction...'
    }
    return statusMsg
  }

  // Get status bar color
  const getStatusBarClass = () => {
    if (hasError) return 'bg-red-900/30 text-red-300 border border-red-800'
    if (isPaid) return 'bg-green-900/30 text-green-300 border border-green-800'
    if (isProcessing) return 'bg-blue-900/30 text-blue-300 border border-blue-800'
    if (isConnecting) return 'bg-yellow-900/30 text-yellow-300 border border-yellow-800'
    return 'bg-slate-800/50 text-gray-400 border border-slate-700'
  }

  return (
    <div className="max-w-md mx-auto">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-white mb-2">
          Create Your <span className="text-blue-500">Block+</span> Account
        </h2>
        <p className="text-gray-400">
          Decentralized storage with Polkadot wallet
        </p>
      </div>

      {/* Status Bar */}
      {(statusMsg || isInitializing) && (
        <div className={`mb-6 p-3 rounded-lg text-sm text-center transition-colors ${getStatusBarClass()}`}>
          {(isProcessing || isInitializing || isConnecting) && !hasError && !isPaid && (
            <span className="mr-2 animate-spin inline-block">⏳</span>
          )}
          {getStatusDisplay()}
        </div>
      )}

      {/* Error with Retry Option */}
      {hasError && selectedAccount && !isPaid && (
        <div className="mb-4 text-center">
          <button
            onClick={retryTransaction}
            disabled={isProcessing}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm transition-colors"
          >
            🔄 Retry Payment
          </button>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* WALLET CONNECTION */}
        <div>
          {!walletInfo.address ? (
            <div className="space-y-4">
              {accounts.length === 0 ? (
                <button
                  type="button"
                  onClick={connectWallet}
                  disabled={isConnecting || isProcessing || isInitializing}
                  className={`w-full py-3 px-4 text-white font-medium rounded-lg transition-all duration-200 flex items-center justify-center gap-2 
                    ${!isConnecting && !isProcessing && !isInitializing
                      ? 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 hover:shadow-lg hover:shadow-purple-500/25' 
                      : 'bg-gray-700 cursor-not-allowed opacity-70'
                    }`}
                >
                  {(isConnecting || isProcessing || isInitializing) ? (
                    <>
                      <span className="animate-spin">⏳</span>
                      Connecting...
                    </>
                  ) : (
                    `Connect Polkadot Wallet (${REGISTRATION_FEE} ${walletInfo.symbol})`
                  )}
                </button>
              ) : (
                <div className="space-y-2">
                  <p className="text-sm text-gray-400 mb-2">Select account to pay fee:</p>
                  {accounts.map(acc => (
                    <button
                      key={acc.address}
                      type="button"
                      onClick={() => selectAccount(acc)}
                      disabled={isProcessing || isConnecting || isInitializing || (selectedAccount?.address === acc.address && isProcessing)}
                      className={`w-full p-3 text-left rounded-lg border transition flex justify-between items-center
                        ${selectedAccount?.address === acc.address && isProcessing
                          ? 'bg-blue-900/50 border-blue-700 text-white'
                          : 'bg-slate-700/30 hover:bg-slate-700/50 border-slate-700/50 text-white'
                        }`}
                    >
                      <span>{acc.meta.name}</span>
                      {selectedAccount?.address === acc.address && isProcessing && (
                        <span className="flex items-center gap-2">
                          <span className="text-xs text-blue-400">Processing...</span>
                          <span className="animate-spin">⏳</span>
                        </span>
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div className="p-4 bg-green-900/20 rounded-lg border border-green-700/30 flex items-center gap-3">
              <div className="w-10 h-10 bg-green-600/20 rounded-full flex items-center justify-center text-green-400">
                {isPaid ? '✓' : '⏳'}
              </div>
              <div>
                <p className="text-white font-medium">{walletInfo.name}</p>
                <p className={`text-sm ${isPaid ? 'text-green-400' : 'text-blue-400'}`}>
                  {isPaid 
                    ? `Fee Paid • Balance: ${walletInfo.balance.toFixed(2)}` 
                    : `Processing payment...`}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* REGISTRATION FORM (Only visible after payment) */}
        <div className={`space-y-6 transition-all duration-500 ${!isPaid ? 'opacity-50 pointer-events-none filter blur-sm' : 'opacity-100'}`}>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Username</label>
            <input
              type="text" 
              name="username" 
              required 
              minLength="3"
              value={formData.username} 
              onChange={handleChange}
              className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700/50 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Choose a username"
              disabled={!isPaid}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Password</label>
            <input
              type="password" 
              name="password" 
              required 
              minLength="6"
              value={formData.password} 
              onChange={handleChange}
              className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700/50 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Create password"
              disabled={!isPaid}
            />
          </div>

          <div className="flex items-start gap-3">
            <input
              type="checkbox" 
              name="terms" 
              required
              checked={formData.terms} 
              onChange={handleChange}
              className="mt-1 w-4 h-4 rounded bg-slate-700 border-slate-600 text-blue-600 focus:ring-blue-500"
              disabled={!isPaid}
            />
            <label className="text-sm text-gray-300">
              I agree to the <span className="text-blue-400">Terms of Service</span> and <span className="text-blue-400">Privacy Policy</span>
            </label>
          </div>
        </div>

        {/* SUBMIT BUTTON */}
        <button
          type="submit"
          disabled={!canRegister || isSubmitting}
          className={`w-full py-3 px-4 text-white font-medium rounded-lg transition-all duration-200 flex items-center justify-center gap-2
            ${canRegister && !isSubmitting
              ? 'bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 hover:shadow-lg hover:shadow-blue-500/25'
              : 'bg-gray-700 cursor-not-allowed opacity-70'
            }`}
        >
          {isSubmitting ? (
            <>
              <span className="animate-spin">⏳</span>
              Creating Account...
            </>
          ) : (
            'Complete Registration'
          )}
        </button>
        
        <div className="text-center pt-4">
          <Link to="/app/login" className="text-blue-400 hover:text-blue-300 text-sm hover:underline">
            Already have an account? Login here
          </Link>
        </div>
      </form>
    </div>
  )
}