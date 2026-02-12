import { createFileRoute } from '@tanstack/react-router'
import { useState, useEffect } from 'react'

export const Route = createFileRoute('/app/files')({
  component: FilesComponent,
})

function FilesComponent() {
  const [files, setFiles] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [copiedHash, setCopiedHash] = useState('')
  const [deletingFile, setDeletingFile] = useState(null)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [fileToDelete, setFileToDelete] = useState(null)

  useEffect(() => {
    fetchFiles()
    
    // Optional: Update every 30 seconds
    const interval = setInterval(() => {
      fetchFiles()
    }, 30000)
    
    return () => clearInterval(interval)
  }, [])

  const fetchFiles = async () => {
    try {
      setLoading(true)
      setError('')
      
      const jwtToken = localStorage.getItem('jwtToken')
      
      if (!jwtToken) {
        throw new Error('Not authenticated. Please log in again.')
      }

      const response = await fetch('/file/', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${jwtToken}`
        },
      })

      if (!response.ok) {
        if (response.status === 401) {
          // Token expired
          localStorage.removeItem('jwtToken')
          localStorage.removeItem('walletAddress')
          
          // Dispatch event to update authentication
          window.dispatchEvent(new CustomEvent('authChange', {
            detail: { isAuthenticated: false, wallet: '' }
          }))
          
          throw new Error('Session expired. Please log in again.')
        }
        
        const errorText = await response.text()
        throw new Error(`Failed to fetch files: ${response.status}`)
      }

      const filesData = await response.json()
      console.log('Files received:', filesData)
      setFiles(filesData)
      
    } catch (error) {
      console.error('Error fetching files:', error)
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }

  const downloadFile = async (hash, filename) => {
    try {
      const jwtToken = localStorage.getItem('jwtToken')
      
      if (!jwtToken) {
        alert('Please log in again to download files.')
        return
      }

      const response = await fetch(`/file/download/${hash}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${jwtToken}`
        }
      })

      if (!response.ok) {
        throw new Error(`Download failed: ${response.status}`)
      }

      const blob = await response.blob()
      
      // Extract filename from header or use the provided one
      const disposition = response.headers.get('Content-Disposition')
      let downloadFilename = filename || 'downloaded_file'
      
      if (disposition && disposition.includes('attachment')) {
        const matches = /filename="([^"]+)"/.exec(disposition)
        if (matches && matches[1]) {
          downloadFilename = matches[1]
        }
      }

      // Create download link
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = downloadFilename
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
      
      showTempMessage('Download started successfully', 'success')
      
    } catch (error) {
      console.error('Download error:', error)
      showTempMessage(`Download failed: ${error.message}`, 'error')
    }
  }

  const confirmDelete = (file) => {
    setFileToDelete(file)
    setShowDeleteConfirm(true)
  }

  const cancelDelete = () => {
    setFileToDelete(null)
    setShowDeleteConfirm(false)
  }

  const deleteFile = async (hash) => {
    try {
      setDeletingFile(hash)
      
      const jwtToken = localStorage.getItem('jwtToken')
      
      if (!jwtToken) {
        throw new Error('Not authenticated. Please log in again.')
      }

      const response = await fetch(`/file/${hash}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${jwtToken}`
        },
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || `Delete failed: ${response.status}`)
      }

      const result = await response.json()
      
      // Remove file from local state
      setFiles(prevFiles => prevFiles.filter(file => file.hash !== hash))
      
      showTempMessage('File deleted successfully', 'success')
      
    } catch (error) {
      console.error('Delete error:', error)
      showTempMessage(`Delete failed: ${error.message}`, 'error')
    } finally {
      setDeletingFile(null)
      setShowDeleteConfirm(false)
      setFileToDelete(null)
    }
  }

  const copyHashToClipboard = async (hash) => {
    try {
      await navigator.clipboard.writeText(hash)
      setCopiedHash(hash)
      showTempMessage('Hash copied to clipboard', 'success')
      
      // Reset copied state after 2 seconds
      setTimeout(() => {
        setCopiedHash('')
      }, 2000)
      
    } catch (err) {
      // Fallback for older browsers
      const textArea = document.createElement('textarea')
      textArea.value = hash
      document.body.appendChild(textArea)
      textArea.select()
      
      try {
        document.execCommand('copy')
        setCopiedHash(hash)
        showTempMessage('Hash copied to clipboard', 'success')
        
        setTimeout(() => {
          setCopiedHash('')
        }, 2000)
        
      } catch (fallbackErr) {
        console.error('Copy failed:', fallbackErr)
        showTempMessage('Failed to copy hash', 'error')
      }
      
      document.body.removeChild(textArea)
    }
  }

  const showTempMessage = (message, type) => {
    // Create temporary message element
    const messageDiv = document.createElement('div')
    messageDiv.textContent = message
    messageDiv.className = `fixed top-4 right-4 z-50 px-4 py-2 rounded-lg text-sm font-medium ${
      type === 'success' 
        ? 'bg-green-900/90 text-green-100 border border-green-700/50' 
        : 'bg-red-900/90 text-red-100 border border-red-700/50'
    }`
    
    document.body.appendChild(messageDiv)
    
    setTimeout(() => {
      if (document.body.contains(messageDiv)) {
        document.body.removeChild(messageDiv)
      }
    }, 3000)
  }

  const formatFileSize = (bytes) => {
    if (!bytes || bytes === 0) return '0 B'
    
    const k = 1024
    const sizes = ['B', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const formatDate = (dateString) => {
    if (!dateString) return 'Unknown'
    
    const date = new Date(dateString)
    return date.toLocaleString()
  }

  const getFilename = (file) => {
    return file.original_filename || file.filename || 'Unknown File'
  }

  const getShortenedHash = (hash) => {
    if (!hash || hash.length < 16) return hash || 'N/A'
    return `${hash.substring(0, 8)}...${hash.substring(hash.length - 8)}`
  }

  return (
    <div className="max-w-6xl mx-auto">
      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && fileToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-slate-800/90 border border-slate-700/50 rounded-xl p-6 max-w-md w-full shadow-2xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-red-600/20 rounded-full flex items-center justify-center">
                <svg className="w-5 h-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.998-.833-2.732 0L4.142 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              <h3 className="text-lg font-bold text-white">Delete File</h3>
            </div>
            
            <div className="mb-6">
              <p className="text-gray-300 mb-2">
                Are you sure you want to delete this file?
              </p>
              <div className="bg-slate-700/30 rounded-lg p-4 border border-slate-600/30">
                <p className="text-white font-medium truncate mb-1">
                  {getFilename(fileToDelete)}
                </p>
                <p className="text-gray-400 text-sm">
                  Hash: {getShortenedHash(fileToDelete.hash)}
                </p>
                <p className="text-gray-400 text-sm mt-1">
                  Size: {formatFileSize(fileToDelete.size)}
                </p>
              </div>
              <p className="text-red-400 text-sm mt-3">
                ⚠️ This action cannot be undone. The file will be permanently removed from the decentralized network.
              </p>
            </div>
            
            <div className="flex gap-3">
              <button
                onClick={cancelDelete}
                disabled={deletingFile === fileToDelete.hash}
                className="flex-1 px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white font-medium rounded-lg transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Cancel
              </button>
              <button
                onClick={() => deleteFile(fileToDelete.hash)}
                disabled={deletingFile === fileToDelete.hash}
                className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg transition-colors duration-200 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {deletingFile === fileToDelete.hash ? (
                  <>
                    <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span>Deleting...</span>
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                    <span>Delete Permanently</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-white mb-2">
          Your <span className="text-blue-500">Files</span>
        </h2>
        <p className="text-gray-400">
          Manage your uploaded files on the decentralized network
        </p>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="bg-slate-800/40 rounded-xl p-8 border border-slate-700/30 text-center">
          <div className="flex flex-col items-center justify-center">
            <svg className="animate-spin h-8 w-8 text-blue-500 mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <p className="text-gray-300">Loading files...</p>
          </div>
        </div>
      )}

      {/* Error State */}
      {!loading && error && (
        <div className="bg-red-900/20 rounded-xl p-6 border border-red-700/30">
          <div className="flex items-start gap-3">
            <div className="w-6 h-6 bg-red-600/20 rounded-full flex items-center justify-center flex-shrink-0">
              <svg className="w-4 h-4 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.998-.833-2.732 0L4.142 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <div className="flex-1">
              <h4 className="font-medium text-white mb-1">Error Loading Files</h4>
              <p className="text-gray-300 text-sm mb-3">{error}</p>
              <button
                onClick={fetchFiles}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-medium rounded-lg transition-colors duration-200"
              >
                Try Again
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Files Table */}
      {!loading && !error && (
        <div className="bg-slate-800/40 rounded-xl border border-slate-700/30 overflow-hidden">
          {/* Table Header */}
          <div className="bg-slate-800/60 px-6 py-4 border-b border-slate-700/30">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-medium text-white">
                  Index of /{files.length} files
                </h3>
                <p className="text-gray-400 text-sm mt-1">
                  Files stored on the decentralized network
                </p>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={fetchFiles}
                  className="px-3 py-1.5 text-sm bg-slate-700 hover:bg-slate-600 text-gray-300 rounded-lg transition-colors duration-200 flex items-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  Refresh
                </button>
              </div>
            </div>
          </div>

          {/* Files List */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-700/30">
                  <th className="text-left py-4 px-6 text-sm font-medium text-gray-300 w-2/5">
                    <div className="flex items-center gap-2">
                      <span>Filename</span>
                    </div>
                  </th>
                  <th className="text-left py-4 px-6 text-sm font-medium text-gray-300 w-1/3">
                    <div className="flex items-center gap-2">
                      <span>Created At</span>
                    </div>
                  </th>
                  <th className="text-right py-4 px-6 text-sm font-medium text-gray-300 w-1/6">
                    <div className="flex items-center justify-end gap-2">
                      <span>Size</span>
                    </div>
                  </th>
                  <th className="text-center py-4 px-6 text-sm font-medium text-gray-300 w-1/5">
                    <div className="flex items-center justify-center gap-2">
                      <span>Actions</span>
                    </div>
                  </th>
                </tr>
              </thead>
              <tbody>
                {files.length === 0 ? (
                  <tr>
                    <td colSpan="4" className="py-12 px-6 text-center">
                      <div className="flex flex-col items-center justify-center">
                        <div className="w-16 h-16 bg-slate-700/50 rounded-full flex items-center justify-center mb-4">
                          <svg className="w-8 h-8 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 13h6m-3-3v6m5 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                        </div>
                        <h4 className="text-lg font-medium text-white mb-2">No files found</h4>
                        <p className="text-gray-400 mb-4">Upload your first file to get started</p>
                        <a 
                          href="/app/upload"
                          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors duration-200"
                        >
                          Upload Files
                        </a>
                      </div>
                    </td>
                  </tr>
                ) : (
                  files.map((file, index) => (
                    <tr 
                      key={file.hash || index} 
                      className={`border-b border-slate-700/30 hover:bg-slate-800/30 transition-colors duration-150 ${
                        index % 2 === 0 ? 'bg-slate-800/20' : ''
                      }`}
                    >
                      {/* Filename */}
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-blue-600/20 rounded-lg flex items-center justify-center flex-shrink-0">
                            <svg className="w-4 h-4 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                          </div>
                          <div className="min-w-0">
                            <button
                              onClick={() => downloadFile(file.hash, getFilename(file))}
                              className="text-left group"
                            >
                              <p className="text-white font-medium truncate max-w-md group-hover:text-blue-400 transition-colors duration-150">
                                {getFilename(file)}
                              </p>
                              <p className="text-gray-500 text-xs mt-1 truncate max-w-md">
                                Hash: {getShortenedHash(file.hash)}
                              </p>
                            </button>
                          </div>
                        </div>
                      </td>

                      {/* Created At */}
                      <td className="py-4 px-6">
                        <div className="text-gray-300">
                          {formatDate(file.createdAt)}
                        </div>
                      </td>

                      {/* Size */}
                      <td className="py-4 px-6 text-right">
                        <div className="text-gray-300 font-medium">
                          {formatFileSize(file.size)}
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="py-4 px-6">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => downloadFile(file.hash, getFilename(file))}
                            className="p-2 text-blue-400 hover:text-blue-300 hover:bg-blue-600/20 rounded-lg transition-all duration-200"
                            title="Download File"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                            </svg>
                          </button>

                          <button
                            onClick={() => copyHashToClipboard(file.hash)}
                            className={`p-2 rounded-lg transition-all duration-200 ${
                              copiedHash === file.hash
                                ? 'text-green-400 bg-green-600/20'
                                : 'text-gray-400 hover:text-gray-300 hover:bg-slate-700/50'
                            }`}
                            title="Copy Hash"
                          >
                            {copiedHash === file.hash ? (
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                              </svg>
                            ) : (
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                              </svg>
                            )}
                          </button>

                          <button
                            onClick={() => confirmDelete(file)}
                            disabled={deletingFile === file.hash}
                            className="p-2 text-red-400 hover:text-red-300 hover:bg-red-600/20 rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                            title="Delete File"
                          >
                            {deletingFile === file.hash ? (
                              <svg className="w-4 h-4 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                              </svg>
                            ) : (
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            )}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Table Footer */}
          {files.length > 0 && (
            <div className="bg-slate-800/60 px-6 py-4 border-t border-slate-700/30">
              <div className="flex items-center justify-between text-sm">
                <div className="text-gray-400">
                  Showing {files.length} file{files.length !== 1 ? 's' : ''}
                </div>
                <div className="text-gray-400">
                  Total size: {formatFileSize(files.reduce((acc, file) => acc + (file.size || 0), 0))}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Information Banner */}
      {!loading && files.length > 0 && (
        <div className="mt-6 p-4 bg-blue-900/20 border border-blue-700/30 rounded-lg">
          <div className="flex items-start gap-3">
            <div className="w-6 h-6 bg-blue-600/20 rounded-full flex items-center justify-center flex-shrink-0">
              <svg className="w-4 h-4 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <h4 className="text-sm font-medium text-white mb-1">File Status Information</h4>
              <p className="text-gray-400 text-sm">
                If your file is not being exhibited correctly, please wait until the blockchain can allocate resources. It may take a while.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Statistics */}
      {!loading && files.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
          <div className="bg-slate-800/40 rounded-lg p-4 border border-slate-700/30">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Total Files</p>
                <p className="text-2xl font-bold text-white">{files.length}</p>
              </div>
              <div className="w-10 h-10 bg-blue-600/20 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-slate-800/40 rounded-lg p-4 border border-slate-700/30">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Total Storage</p>
                <p className="text-2xl font-bold text-white">
                  {formatFileSize(files.reduce((acc, file) => acc + (file.size || 0), 0))}
                </p>
              </div>
              <div className="w-10 h-10 bg-blue-600/20 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-slate-800/40 rounded-lg p-4 border border-slate-700/30">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Latest Upload</p>
                <p className="text-lg font-medium text-white">
                  {files.length > 0 ? formatDate(files[0].createdAt) : 'N/A'}
                </p>
              </div>
              <div className="w-10 h-10 bg-blue-600/20 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// Utility to format dates
export const formatDate = (dateString) => {
  if (!dateString) return 'Unknown'
  const date = new Date(dateString)
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

// Utility to format file sizes
export const formatFileSize = (bytes) => {
  if (!bytes || bytes === 0) return '0 B'
  
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}