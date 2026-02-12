import { createFileRoute } from '@tanstack/react-router'
import { useState, useEffect } from 'react'
import { ApiPromise, WsProvider } from '@polkadot/api'
import { web3Accounts, web3Enable } from '@polkadot/extension-dapp'

export const Route = createFileRoute('/app/guest')({
  component: GuestTestComponent,
})

function GuestTestComponent() {
  const [api, setApi] = useState(null)
  const [accounts, setAccounts] = useState([])
  const [selectedAccount, setSelectedAccount] = useState(null)
  const [balance, setBalance] = useState(null)
  const [status, setStatus] = useState('Loading...')
  const [isConnected, setIsConnected] = useState(false)
  const [networkInfo, setNetworkInfo] = useState(null)
  const [tokenDecimals, setTokenDecimals] = useState(12) // Default para CESS
  const [tokenSymbol, setTokenSymbol] = useState('TCESS')

  // Inicializar conexão com a rede Polkadot
  useEffect(() => {
    const initPolkadot = async () => {
      try {
        setStatus('Connecting to CESS network...')
        
        // Conectar ao testnet da CESS
        const wsProvider = new WsProvider('wss://testnet-rpc.cess.network')
        const polkadotApi = await ApiPromise.create({ 
          provider: wsProvider 
        })
        
        setApi(polkadotApi)
        
        // Obter informações do token
        const chainProperties = polkadotApi.registry.getChainProperties()
        const decimals = chainProperties?.tokenDecimals?.toJSON()?.[0] || 12
        const symbol = chainProperties?.tokenSymbol?.toJSON()?.[0] || 'TCESS'
        
        setTokenDecimals(Number(decimals))
        setTokenSymbol(symbol)
        
        // Obter informações da rede
        const [chain, nodeName, nodeVersion] = await Promise.all([
          polkadotApi.rpc.system.chain(),
          polkadotApi.rpc.system.name(),
          polkadotApi.rpc.system.version()
        ])
        
        setNetworkInfo({
          chain: chain.toString(),
          nodeName: nodeName.toString(),
          nodeVersion: nodeVersion.toString(),
          decimals: Number(decimals),
          symbol: symbol
        })
        
        setStatus(`✅ Connected to ${chain.toString()} (${symbol})`)
        console.log('Token decimals:', decimals, 'Symbol:', symbol)
        
      } catch (error) {
        console.error('Failed to connect:', error)
        setStatus(`❌ Connection failed: ${error.message}`)
      }
    }

    initPolkadot()

    return () => {
      if (api) {
        api.disconnect()
      }
    }
  }, [])

  // Buscar contas da carteira
  const fetchAccounts = async () => {
    try {
      setStatus('Checking for Polkadot extension...')
      
      // Habilitar extensão
      const extensions = await web3Enable('Block+ Test')
      
      if (extensions.length === 0) {
        setStatus('❌ No Polkadot extension found. Please install Polkadot.js extension.')
        return
      }

      setStatus('Fetching accounts...')
      const allAccounts = await web3Accounts()
      
      if (allAccounts.length === 0) {
        setStatus('❌ No accounts found in wallet')
        return
      }

      setAccounts(allAccounts)
      setStatus(`✅ Found ${allAccounts.length} account(s)`)
      
    } catch (error) {
      console.error('Error fetching accounts:', error)
      setStatus(`❌ Error: ${error.message}`)
    }
  }

  // Conectar a uma conta específica
  const connectAccount = async (account) => {
    try {
      setStatus(`Connecting to ${account.meta.name || 'Account'}...`)
      setSelectedAccount(account)
      setIsConnected(true)

      // Buscar saldo da conta
      if (api) {
        const { data: accountInfo } = await api.query.system.account(account.address)
        const freeBalance = accountInfo.free
        const reservedBalance = accountInfo.reserved
        
        // Converter para unidades humanas usando os decimals da rede
        const divisor = Math.pow(10, tokenDecimals)
        const freeInTCESS = freeBalance.toNumber() / divisor
        const reservedInTCESS = reservedBalance.toNumber() / divisor
        
        setBalance({
          free: freeInTCESS,
          reserved: reservedInTCESS,
          total: freeInTCESS + reservedInTCESS,
          raw: {
            free: freeBalance.toNumber(),
            reserved: reservedBalance.toNumber(),
            decimals: tokenDecimals
          }
        })
        
        console.log('Balance raw:', freeBalance.toNumber(), 'Decimals:', tokenDecimals)
        console.log('Balance in TCESS:', freeInTCESS)
      }

      setStatus(`✅ Connected to: ${account.address.substring(0, 10)}...`)

    } catch (error) {
      console.error('Error connecting account:', error)
      setStatus(`❌ Connection error: ${error.message}`)
    }
  }

  // Simular cobrança de 100 TCESS (SEM transação real por enquanto)
  const simulateTCESSCharge = async () => {
    if (!selectedAccount || !api) return

    try {
      setStatus('Processing 100 TCESS charge...')
      
      // Verificar saldo
      if (!balance || balance.free < 100) {
        setStatus(`❌ Insufficient balance. Need at least 100 ${tokenSymbol}.`)
        return
      }

      // Simular delay da transação
      await new Promise(resolve => setTimeout(resolve, 1500))
      
      // Atualizar saldo (simulado)
      setBalance(prev => ({
        ...prev,
        free: prev.free - 100,
        total: prev.total - 100
      }))
      
      setStatus(`✅ Successfully charged 100 ${tokenSymbol}! (Simulation)`)
      
      // Disparar evento para a página principal (se necessário)
      window.dispatchEvent(new CustomEvent('tcessCharged', {
        detail: { 
          address: selectedAccount.address,
          amount: 100,
          symbol: tokenSymbol
        }
      }))

    } catch (error) {
      console.error('Error charging TCESS:', error)
      setStatus(`❌ Charge failed: ${error.message}`)
    }
  }

  // Implementação REAL da cobrança (para quando quiser fazer transação real)
  const realTCESSCharge = async () => {
    if (!selectedAccount || !api) return

    try {
      setStatus('Preparing transaction...')
      
      // Verificar saldo
      if (!balance || balance.free < 100) {
        setStatus(`❌ Insufficient balance. Need at least 100 ${tokenSymbol}.`)
        return
      }

      // Importar o web3FromAddress para assinar transações
      const { web3FromAddress } = await import('@polkadot/extension-dapp')
      
      // Obter signer da extensão
      const injector = await web3FromAddress(selectedAccount.address)
      
      // Converter 100 TCESS para unidades base
      const amountInBaseUnits = 100 * Math.pow(10, tokenDecimals)
      
      // Substitua pelo endereço da sua conta de serviço
      const SERVICE_ADDRESS = 'YOUR_SERVICE_WALLET_ADDRESS_HERE'
      
      // Criar transação de transferência
      const transfer = api.tx.balances.transfer(
        SERVICE_ADDRESS,
        amountInBaseUnits
      )
      
      // Enviar transação
      const unsub = await transfer.signAndSend(
        selectedAccount.address,
        { signer: injector.signer },
        ({ status, events }) => {
          if (status.isInBlock) {
            setStatus(`Transaction included in block: ${status.asInBlock.toHex()}`)
          }
          
          if (status.isFinalized) {
            setStatus(`Transaction finalized in block: ${status.asFinalized.toHex()}`)
            
            // Verificar se a transação foi bem-sucedida
            events.forEach(({ event }) => {
              if (api.events.system.ExtrinsicSuccess.is(event)) {
                setStatus(`✅ Successfully charged 100 ${tokenSymbol}!`)
                
                // Atualizar saldo após transação real
                if (unsub) unsub()
                
                // Atualizar saldo local
                setBalance(prev => ({
                  ...prev,
                  free: prev.free - 100,
                  total: prev.total - 100
                }))
              }
              
              if (api.events.system.ExtrinsicFailed.is(event)) {
                setStatus('❌ Transaction failed')
                if (unsub) unsub()
              }
            })
          }
        }
      )

    } catch (error) {
      console.error('Transaction error:', error)
      setStatus(`❌ Transaction failed: ${error.message}`)
    }
  }

  // Desconectar
  const disconnect = () => {
    setSelectedAccount(null)
    setIsConnected(false)
    setBalance(null)
    setStatus('Disconnected')
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-white mb-2">
          Polkadot Wallet <span className="text-purple-500">Test</span>
        </h2>
        <p className="text-gray-400">
          Test connection and TCESS charging before registration
        </p>
      </div>

      {/* Status Card */}
      <div className="bg-slate-800/40 rounded-xl p-6 border border-slate-700/30 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium text-white">Connection Status</h3>
          <div className={`px-3 py-1 rounded-full text-xs font-medium ${
            isConnected ? 'bg-green-600/20 text-green-400' : 'bg-yellow-600/20 text-yellow-400'
          }`}>
            {isConnected ? 'Connected' : 'Not Connected'}
          </div>
        </div>
        
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <div className={`w-3 h-3 rounded-full ${api ? 'bg-green-500' : 'bg-red-500'}`}></div>
            <span className="text-gray-300">
              {api ? `✅ ${networkInfo?.chain || 'Network'} Connected` : '❌ Network Disconnected'}
            </span>
          </div>
          
          <div className="text-sm text-gray-400 bg-slate-900/50 p-3 rounded-lg">
            {status}
          </div>

          {networkInfo && (
            <div className="grid grid-cols-3 gap-3 mt-4 pt-4 border-t border-slate-700/30">
              <div>
                <p className="text-xs text-gray-500">Network</p>
                <p className="text-white font-medium">{networkInfo.chain}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Token</p>
                <p className="text-white font-medium">{networkInfo.symbol}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Decimals</p>
                <p className="text-white font-medium">{networkInfo.decimals}</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Wallet Connection Card */}
      <div className="bg-slate-800/40 rounded-xl p-6 border border-slate-700/30 mb-6">
        <h3 className="text-lg font-medium text-white mb-4">Wallet Connection</h3>
        
        {!isConnected ? (
          <div className="space-y-4">
            <button
              onClick={fetchAccounts}
              disabled={!api}
              className={`w-full py-3 px-4 rounded-lg transition-all duration-200 flex items-center justify-center gap-2 ${
                api 
                  ? 'bg-purple-600 hover:bg-purple-700 text-white hover:shadow-lg hover:shadow-purple-500/25' 
                  : 'bg-gray-600 text-gray-400 cursor-not-allowed'
              }`}
            >
              <div className="w-5 h-5">
                <svg viewBox="0 0 32 32" fill="currentColor">
                  <circle cx="16" cy="16" r="16" fill="#E6007A"/>
                  <path d="M16 25.6c5.3 0 9.6-4.3 9.6-9.6S21.3 6.4 16 6.4 6.4 10.7 6.4 16s4.3 9.6 9.6 9.6z" fill="white"/>
                  <path d="M19.2 16c0 1.8-1.4 3.2-3.2 3.2s-3.2-1.4-3.2-3.2 1.4-3.2 3.2-3.2 3.2 1.4 3.2 3.2z" fill="#E6007A"/>
                </svg>
              </div>
              <span>Load Polkadot Wallet</span>
            </button>

            {/* Lista de Contas */}
            {accounts.length > 0 && (
              <div className="space-y-2">
                <p className="text-sm text-gray-400">Select an account:</p>
                {accounts.map((account, index) => (
                  <button
                    key={account.address}
                    onClick={() => connectAccount(account)}
                    className="w-full p-3 text-left bg-slate-700/30 hover:bg-slate-700/50 rounded-lg transition-colors duration-150 border border-slate-700/50"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-white font-medium">
                          {account.meta.name || `Account ${index + 1}`}
                        </p>
                        <p className="text-gray-400 text-sm">
                          {account.address.substring(0, 16)}...
                        </p>
                      </div>
                      <svg className="w-5 h-5 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                      </svg>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {/* Account Info */}
            <div className="p-4 bg-slate-900/50 rounded-lg">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <p className="text-white font-medium">
                    {selectedAccount.meta.name || 'Connected Account'}
                  </p>
                  <p className="text-gray-400 text-sm font-mono">
                    {selectedAccount.address.substring(0, 24)}...
                  </p>
                </div>
                <button
                  onClick={disconnect}
                  className="px-3 py-1 text-sm bg-red-600/20 text-red-400 hover:bg-red-600/30 rounded-lg transition-colors"
                >
                  Disconnect
                </button>
              </div>

              {/* Balance Display */}
              {balance && (
                <div>
                  <div className="grid grid-cols-3 gap-3 pt-3 border-t border-slate-700/30">
                    <div className="text-center">
                      <p className="text-xs text-gray-500">Free</p>
                      <p className="text-green-400 font-bold">
                        {balance.free.toFixed(4)} {tokenSymbol}
                      </p>
                    </div>
                    <div className="text-center">
                      <p className="text-xs text-gray-500">Reserved</p>
                      <p className="text-yellow-400 font-bold">
                        {balance.reserved.toFixed(4)} {tokenSymbol}
                      </p>
                    </div>
                    <div className="text-center">
                      <p className="text-xs text-gray-500">Total</p>
                      <p className="text-white font-bold">
                        {balance.total.toFixed(4)} {tokenSymbol}
                      </p>
                    </div>
                  </div>
                  
                  {/* Debug info */}
                  {balance.raw && (
                    <div className="mt-3 pt-3 border-t border-slate-700/30">
                      <p className="text-xs text-gray-500 mb-1">Raw balance (for debugging):</p>
                      <p className="text-xs font-mono text-gray-400">
                        Free: {balance.raw.free.toLocaleString()} units
                        <br />
                        Decimals: {balance.raw.decimals}
                        <br />
                        100 {tokenSymbol} = {100 * Math.pow(10, balance.raw.decimals).toLocaleString()} units
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* TCESS Charge Buttons */}
            <div className="space-y-3">
              {/* Botão de Simulação */}
              <button
                onClick={simulateTCESSCharge}
                disabled={!balance || balance.free < 100}
                className={`w-full py-3 px-4 rounded-lg transition-all duration-200 flex items-center justify-center gap-2 ${
                  balance && balance.free >= 100
                    ? 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white hover:shadow-lg hover:shadow-purple-500/25'
                    : 'bg-gray-700 text-gray-400 cursor-not-allowed'
                }`}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>Simulate Charge 100 {tokenSymbol}</span>
              </button>

              {/* Botão para Transação REAL (comentado por enquanto) */}
              {/*
              <button
                onClick={realTCESSCharge}
                disabled={!balance || balance.free < 100}
                className={`w-full py-3 px-4 rounded-lg transition-all duration-200 flex items-center justify-center gap-2 ${
                  balance && balance.free >= 100
                    ? 'bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700 text-white hover:shadow-lg hover:shadow-red-500/25'
                    : 'bg-gray-700 text-gray-400 cursor-not-allowed'
                }`}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
                <span>REAL Charge 100 {tokenSymbol}</span>
              </button>
              */}
            </div>

            {/* Requirements */}
            <div className="p-3 bg-blue-900/20 rounded-lg border border-blue-700/30">
              <p className="text-sm text-gray-300">
                <span className="text-blue-400">ℹ️</span> Current mode: <strong>Simulation</strong>. The button above will simulate charging 100 {tokenSymbol} without making a real transaction.
              </p>
              {balance && balance.free < 100 && (
                <p className="text-sm text-red-300 mt-1">
                  <span className="text-red-400">⚠️</span> You need at least 100 {tokenSymbol} to test the charge. Current free balance: {balance.free.toFixed(4)} {tokenSymbol}
                </p>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Debug Panel */}
      <div className="mt-6 p-4 bg-gray-900/50 rounded-lg border border-gray-700/30">
        <h4 className="text-sm font-medium text-white mb-2">Debug Information</h4>
        <div className="text-xs font-mono text-gray-400 space-y-1">
          <p>API Status: {api ? '✅ Connected' : '❌ Disconnected'}</p>
          <p>Extension Available: {typeof window.injectedWeb3 !== 'undefined' ? '✅ Yes' : '❌ No'}</p>
          <p>Accounts Found: {accounts.length}</p>
          <p>Selected Account: {selectedAccount ? '✅ Yes' : '❌ No'}</p>
          <p>Token Decimals: {tokenDecimals}</p>
          <p>Token Symbol: {tokenSymbol}</p>
          {balance && (
            <>
              <p>Free Balance: {balance.free.toFixed(6)} {tokenSymbol}</p>
              <p>Has enough for charge: {balance.free >= 100 ? '✅ Yes' : '❌ No'}</p>
            </>
          )}
        </div>
      </div>
    </div>
  )
}


export default GuestTestComponent