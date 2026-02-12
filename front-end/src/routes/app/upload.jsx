import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useState, useRef, useEffect } from 'react'

// --- NEW UTILITY FUNCTION ---
const truncateHash = (hash, startLength = 6, endLength = 4) => {
  if (!hash || hash.length <= startLength + endLength) {
    return hash || 'N/A';
  }
  return `${hash.substring(0, startLength)}...${hash.substring(hash.length - endLength)}`;
};
// ----------------------------

export const Route = createFileRoute('/app/upload')({
  component: UploadComponent,
})

function UploadComponent() {
  const [selectedFile, setSelectedFile] = useState(null)
  const [uploading, setUploading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [message, setMessage] = useState({ text: '', type: '' })
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [walletAddress, setWalletAddress] = useState('')
  const [showNotification, setShowNotification] = useState(false)
  const [notification, setNotification] = useState({ text: '', type: '' })
  const fileInputRef = useRef(null)
  const navigate = useNavigate()

  // Check authentication on component mount
  useEffect(() => {
    checkAuthentication()
  }, [])

  // Auto-hide success notifications
  useEffect(() => {
    if ((notification.type === 'success' || notification.type === 'error') && showNotification) {
      const timer = setTimeout(() => {
        setShowNotification(false)
        setNotification({ text: '', type: '' })
      }, 5000)
      return () => clearTimeout(timer)
    }
  }, [notification, showNotification])

  const checkAuthentication = () => {
    const token = localStorage.getItem('jwtToken')
    const wallet = localStorage.getItem('walletAddress')
    
    if (!token || !wallet) {
      setIsAuthenticated(false)
      return
    }
    
    // Check if token is expired
    try {
      const payload = JSON.parse(atob(token.split('.')[1]))
      const isValid = payload.exp * 1000 > Date.now()
      setIsAuthenticated(isValid)
      if (isValid) {
        setWalletAddress(wallet)
      }
    } catch (e) {
      setIsAuthenticated(false)
    }
  }

  const showUploadStatus = (text, type) => {
    console.log('Showing upload status:', { text, type }) // Debug
    setNotification({ text, type })
    setShowNotification(true)
    
    // Also update the message state for inline display
    setMessage({ text, type })
  }

  const handleFileSelect = (e) => {
    const file = e.target.files?.[0]
    if (file) {
      // Check file size (100MB limit)
      if (file.size > 100 * 1024 * 1024) {
        showUploadStatus('File size exceeds 100MB limit', 'error')
        if (fileInputRef.current) {
          fileInputRef.current.value = ''
        }
        setSelectedFile(null)
        return
      }
      
      setSelectedFile(file)
      setMessage({ text: '', type: '' })
      setShowNotification(false) // Hide any existing notification
    }
  }

  const clearFile = () => {
    setSelectedFile(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
    setMessage({ text: '', type: '' })
    // Removed: setShowNotification(false)
  }

  const simulateProgress = () => {
    setProgress(0)
    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 95) {
          clearInterval(interval)
          return 95
        }
        return Math.min(95, prev + Math.random() * 15)
      })
    }, 200)
    return interval
  }

  // --- UPDATED handleUpload FUNCTION ---
  const handleUpload = async () => {
    if (!selectedFile) {
      showUploadStatus('Please select a file first', 'error')
      return
    }

    if (!isAuthenticated) {
      showUploadStatus('Please login to upload files', 'error')
      return
    }

    setUploading(true)
    setProgress(0)
    setMessage({ text: '', type: '' })
    
    const progressInterval = simulateProgress()
    
    try {
      const token = localStorage.getItem('jwtToken')
      
      if (!token) {
        throw new Error('Not authenticated')
      }

      const formData = new FormData()
      formData.append('file', selectedFile)

      // Show loading notification immediately
      showUploadStatus('Uploading file, please wait...', 'loading')
      console.log('Starting upload...') // Debug

      const response = await fetch('/file/upload', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      })

      clearInterval(progressInterval)
      setProgress(100)

      console.log('Upload response status:', response.status) // Debug

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || errorData.msg || `Upload failed with status: ${response.status}`)
      }

      const result = await response.json()
      console.log('Upload result:', result) // Debug
      
      // Extract and truncate the hash for display
      const fullHash = result.fid || result.hash || 'N/A';
      const displayHash = truncateHash(fullHash, 6, 4); 

      // Show success notification with TRUNCATED hash
      showUploadStatus(
        `File uploaded successfully! Hash: ${displayHash}`,
        'success'
      )
      
      clearFile()
      
    } catch (error) {
      console.error('Upload error:', error) // Debug
      clearInterval(progressInterval)
      showUploadStatus(`Upload failed: ${error.message}`, 'error')
    } finally {
      setUploading(false)
      setTimeout(() => setProgress(0), 1000)
    }
  }
  // --- END UPDATED handleUpload FUNCTION ---


  const handleDragOver = (e) => {
    e.preventDefault()
    e.stopPropagation()
  }

  const handleDrop = (e) => {
    e.preventDefault()
    e.stopPropagation()
    
    const files = e.dataTransfer.files
    if (files && files.length > 0) {
      const file = files[0]
      if (file.size > 100 * 1024 * 1024) {
        showUploadStatus('File size exceeds 100MB limit', 'error')
        return
      }
      setSelectedFile(file)
      setMessage({ text: '', type: '' })
      setShowNotification(false)
    }
  }

  const handleLoginRedirect = () => {
    navigate({ to: '/app/login' })
  }

  if (!isAuthenticated) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-white mb-2">
            Upload <span className="text-blue-500">Files</span>
          </h2>
        </div>
        
        <div className="bg-slate-800/40 rounded-xl p-8 border-2 border-dashed border-slate-700/50">
          <div className="text-center">
            <div className="w-16 h-16 bg-red-600/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m0 0v2m0-2h2m-2 0H9m3-6a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            
            <h3 className="text-lg font-medium text-white mb-2">
              Authentication Required
            </h3>
            <p className="text-gray-400 text-sm mb-6">
              Please login to upload files to the decentralized network
            </p>
            
            <button
              onClick={handleLoginRedirect}
              className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors duration-200"
            >
              Go to Login
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto">
      {/* Snackbar Notification - FIXED POSITIONING */}
      {showNotification && (
        <div className="fixed top-4 right-4 z-50 animate-slide-in">
          <div className={`p-4 rounded-lg border shadow-lg min-w-[300px] max-w-[400px] ${
            notification.type === 'success' 
              ? 'bg-green-900/90 border-green-700 text-green-100' 
              : notification.type === 'error'
              ? 'bg-red-900/90 border-red-700 text-red-100'
              : notification.type === 'loading'
              ? 'bg-blue-900/90 border-blue-700 text-blue-100'
              : 'bg-gray-900/90 border-gray-700 text-gray-100'
          }`}>
            <div className="flex items-center gap-3">
              {notification.type === 'success' ? (
                <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              ) : notification.type === 'error' ? (
                <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.998-.833-2.732 0L4.142 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              ) : notification.type === 'loading' ? (
                <svg className="w-5 h-5 flex-shrink-0 animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              ) : (
                <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h1m0-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              )}
              <span className="flex-1">{notification.text}</span>
              <button
                onClick={() => {
                  setShowNotification(false)
                  setNotification({ text: '', type: '' })
                }}
                className="ml-2 text-gray-300 hover:text-white"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* User Info */}
      <div className="flex justify-between items-center mb-6">
        <div className="text-center mb-4">
          <h2 className="text-2xl font-bold text-white mb-2">
            Upload <span className="text-blue-500">Files</span>
          </h2>
          <p className="text-gray-400">
            Upload your files to the decentralized network
          </p>
        </div>
        
        <div className="bg-slate-800/40 rounded-lg px-4 py-2 border border-slate-700/50">
          <p className="text-sm text-gray-300">
            Connected: <span className="text-blue-400">
              {walletAddress.substring(0, 6)}...{walletAddress.substring(walletAddress.length - 4)}
            </span>
          </p>
        </div>
      </div>

      {/* Upload Area */}
      <div 
        className="bg-slate-800/40 rounded-xl p-8 border-2 border-dashed border-slate-700/50 hover:border-blue-500/50 transition-all duration-300 mb-6"
        onDragOver={handleDragOver}
        onDrop={handleDrop}
      >
        <div className="text-center">
          <div className="w-16 h-16 bg-blue-600/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
            </svg>
          </div>
          
          <div className="mb-6">
            <label htmlFor="file-input" className="cursor-pointer block">
              <h3 className="text-lg font-medium text-white mb-2">
                {selectedFile ? selectedFile.name : 'Select a file'}
              </h3>
              <p className="text-gray-400 text-sm mb-4">
                {selectedFile 
                  ? `${(selectedFile.size / (1024 * 1024)).toFixed(2)} MB` 
                  : 'Click to browse or drag and drop'}
              </p>
              <button 
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors duration-200"
                onClick={(e) => {
                  e.preventDefault()
                  fileInputRef.current?.click()
                }}
              >
                Browse Files
              </button>
            </label>
            <input
              id="file-input"
              ref={fileInputRef}
              type="file"
              onChange={handleFileSelect}
              className="hidden"
              disabled={uploading}
            />
          </div>

          {/* Progress Bar */}
          {uploading && (
            <div className="w-full max-w-md mx-auto mb-6">
              <div className="flex justify-between text-sm text-gray-400 mb-2">
                <span>Uploading...</span>
                <span>{Math.round(progress)}%</span>
              </div>
              <div className="w-full bg-slate-700/50 rounded-full h-2">
                <div 
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${progress}%` }}
                ></div>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3 justify-center">
            <button
              onClick={handleUpload}
              disabled={!selectedFile || uploading}
              className={`px-6 py-3 text-white font-medium rounded-lg transition-all duration-200 flex items-center justify-center gap-2 ${
                selectedFile && !uploading
                  ? 'bg-blue-600 hover:bg-blue-700 hover:shadow-lg hover:shadow-blue-500/25'
                  : 'bg-gray-600 cursor-not-allowed'
              }`}
            >
              {uploading ? (
                <>
                  <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span>Uploading...</span>
                </>
              ) : (
                <>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                  <span>Upload File</span>
                </>
              )}
            </button>

            {selectedFile && !uploading && (
              <button
                onClick={clearFile}
                className="px-6 py-3 bg-gray-600 hover:bg-gray-700 text-white font-medium rounded-lg transition-colors duration-200"
              >
                Clear
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Inline Message Display */}
      {message.text && (
        <div className={`p-4 rounded-lg border mb-6 ${
          message.type === 'success' 
            ? 'bg-green-900/30 border-green-700 text-green-300' 
            : message.type === 'error'
            ? 'bg-red-900/30 border-red-700 text-red-300'
            : message.type === 'loading'
            ? 'bg-blue-900/30 border-blue-700 text-blue-300'
            : 'bg-gray-900/30 border-gray-700 text-gray-300'
        }`}>
          <div className="flex items-center gap-2">
            {message.type === 'success' ? (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            ) : message.type === 'error' ? (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.998-.833-2.732 0L4.142 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            ) : message.type === 'loading' ? (
              <svg className="w-5 h-5 animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            ) : (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h1m0-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            )}
            <span>{message.text}</span>
          </div>
        </div>
      )}

      {/* Upload Info */}
      <div className="mt-6 space-y-4">
        <div className="p-4 bg-slate-800/30 rounded-lg border border-slate-700/30">
          <h4 className="text-sm font-medium text-white mb-2 flex items-center gap-2">
            <span>📦</span> Upload Limits
          </h4>
          <ul className="text-gray-400 text-sm space-y-1">
            <li className="flex items-center gap-2">
              <span className="text-blue-500">•</span>
              <span>Maximum file size: 100MB</span>
            </li>
            <li className="flex items-center gap-2">
              <span className="text-blue-500">•</span>
              <span>Supported formats: All file types</span>
            </li>
            <li className="flex items-center gap-2">
              <span className="text-blue-500">•</span>
              <span>Files are encrypted before upload</span>
            </li>
            <li className="flex items-center gap-2">
              <span className="text-blue-500">•</span>
              <span>Drag and drop supported</span>
            </li>
          </ul>
        </div>

        <div className="p-4 bg-slate-800/30 rounded-lg border border-slate-700/30">
          <h4 className="text-sm font-medium text-white mb-2 flex items-center gap-2">
            <span>🔒</span> Security Note
          </h4>
          <p className="text-gray-400 text-sm">
            Your files are encrypted client-side before being uploaded to the decentralized network. 
            Not even Block+ can access your file contents.
          </p>
        </div>

        <div className="p-4 bg-slate-800/30 rounded-lg border border-slate-700/30">
          <h4 className="text-sm font-medium text-white mb-2 flex items-center gap-2">
            <span>⚡</span> How it Works
          </h4>
          <ul className="text-gray-400 text-sm space-y-1">
            <li className="flex items-center gap-2">
              <span className="text-blue-500">1.</span>
              <span>Select your file (up to 100MB)</span>
            </li>
            <li className="flex items-center gap-2">
              <span className="text-blue-500">2.</span>
              <span>File is encrypted locally</span>
            </li>
            <li className="flex items-center gap-2">
              <span className="text-blue-500">3.</span>
              <span>Uploaded to decentralized network</span>
            </li>
            <li className="flex items-center gap-2">
              <span className="text-blue-500">4.</span>
              <span>Receive a unique file hash</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  )
}