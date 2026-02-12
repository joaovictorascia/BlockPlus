import { createFileRoute, Link } from '@tanstack/react-router'
import { useState, useEffect } from 'react'

export const Route = createFileRoute('/')({
  component: LandingPage,
})

function LandingPage() {
  const [stats, setStats] = useState({
    filesStored: '1.2M',
    activeUsers: '45K',
    storageUsed: '15.7TB',
    uptime: '99.9%'
  })

  const [featuredLogos] = useState([
    { name: 'TechCorp', color: 'blue' },
    { name: 'InnovateX', color: 'purple' },
    { name: 'DataSecure', color: 'green' },
    { name: 'CloudPlus', color: 'pink' },
    { name: 'FutureStack', color: 'orange' },
  ])

  useEffect(() => {
    // Animação para os números das estatísticas
    const interval = setInterval(() => {
      setStats(prev => ({
        ...prev,
        filesStored: (parseFloat(prev.filesStored) + 0.1).toFixed(1) + 'M',
      }))
    }, 5000)

    return () => clearInterval(interval)
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-gray-100 overflow-x-hidden">
      {/* Hero Section */}
      <section className="relative pt-20 pb-32 px-4 sm:px-6 lg:px-8 overflow-hidden">
        {/* Background elements */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
          <div className="absolute top-20 left-10 w-72 h-72 bg-blue-500/10 rounded-full blur-3xl"></div>
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-cyan-500/5 rounded-full blur-3xl"></div>
        </div>

        <div className="relative max-w-7xl mx-auto">
          <div className="text-center">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600/20 border border-blue-500/30 rounded-full mb-8">
              <span className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></span>
              <span className="text-sm text-blue-400 font-medium">Decentralized Storage Network</span>
            </div>

            {/* Main Heading */}
            <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-6">
              <span className="text-white">Store Files on the</span>
              <br />
              <span className="bg-gradient-to-r from-blue-500 to-cyan-400 bg-clip-text text-transparent">
                Decentralized Cloud
              </span>
            </h1>

            {/* Subheading */}
            <p className="text-xl md:text-2xl text-gray-400 max-w-3xl mx-auto mb-10">
              Secure, fast, and censorship-resistant file storage powered by blockchain technology.
              Your data, your control.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
              <Link
                to="/app/register"
                className="px-8 py-4 bg-gradient-to-r from-blue-600 to-cyan-500 text-white font-semibold rounded-xl hover:shadow-2xl hover:shadow-blue-500/30 transition-all duration-300 transform hover:-translate-y-1 flex items-center justify-center gap-2"
              >
                <span>Get Started Free</span>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </Link>
              <Link
                to="/app/about"
                className="px-8 py-4 bg-slate-800/50 border border-slate-700 text-white font-semibold rounded-xl hover:bg-slate-700/50 transition-all duration-300 flex items-center justify-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>Watch Demo</span>
              </Link>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-3xl mx-auto">
              {Object.entries(stats).map(([key, value]) => (
                <div key={key} className="text-center p-4 bg-slate-800/30 rounded-xl border border-slate-700/30">
                  <div className="text-2xl md:text-3xl font-bold text-white mb-1">{value}</div>
                  <div className="text-sm text-gray-400 capitalize">
                    {key.replace(/([A-Z])/g, ' $1').trim()}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Trusted By Section */}
      <section className="py-16 bg-slate-900/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <p className="text-gray-400 mb-4">Trusted by innovative companies worldwide</p>
          </div>
          <div className="flex flex-wrap justify-center items-center gap-8 md:gap-12">
            {featuredLogos.map((logo, index) => (
              <div
                key={logo.name}
                className="relative group"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className={`w-32 h-16 bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700/50 rounded-xl flex items-center justify-center transform group-hover:scale-105 transition-all duration-300`}>
                  <span className={`text-lg font-bold bg-gradient-to-r from-${logo.color}-400 to-${logo.color}-600 bg-clip-text text-transparent`}>
                    {logo.name}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Why Choose <span className="text-blue-500">Block+</span>
            </h2>
            <p className="text-gray-400 text-lg max-w-2xl mx-auto">
              Experience the future of cloud storage with unmatched security and performance
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: '🔐',
                title: 'Military-Grade Security',
                description: 'End-to-end encryption with zero-knowledge architecture. Your files are encrypted before they leave your device.',
                color: 'blue'
              },
              {
                icon: '⚡',
                title: 'Lightning Fast',
                description: 'Distributed network ensures fast upload and download speeds from anywhere in the world.',
                color: 'purple'
              },
              {
                icon: '🌐',
                title: 'Truly Decentralized',
                description: 'No single point of failure. Files are distributed across multiple nodes globally.',
                color: 'green'
              },
              {
                icon: '💸',
                title: 'Fair Pricing',
                description: 'Pay only for what you use. No hidden fees or subscription traps.',
                color: 'yellow'
              },
              {
                icon: '🔄',
                title: 'Automatic Backup',
                description: 'Automatic replication ensures your files are always safe and accessible.',
                color: 'pink'
              },
              {
                icon: '🔗',
                title: 'Blockchain Verified',
                description: 'Every file is timestamped and verified on the blockchain for authenticity.',
                color: 'cyan'
              }
            ].map((feature, index) => (
              <div
                key={index}
                className="group bg-slate-800/30 border border-slate-700/50 rounded-2xl p-6 hover:border-blue-500/30 hover:bg-slate-800/50 transition-all duration-300 hover:-translate-y-2"
              >
                <div className={`w-14 h-14 bg-${feature.color}-600/20 rounded-xl flex items-center justify-center mb-4`}>
                  <span className="text-2xl">{feature.icon}</span>
                </div>
                <h3 className="text-xl font-bold text-white mb-3">{feature.title}</h3>
                <p className="text-gray-400">{feature.description}</p>
                <div className="mt-6 pt-6 border-t border-slate-700/30 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <Link
                    to="/app/about"
                    className="text-blue-400 hover:text-blue-300 text-sm font-medium inline-flex items-center gap-1"
                  >
                    Learn more
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 relative">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 to-purple-600/10"></div>
        <div className="relative max-w-4xl mx-auto text-center">
          <div className="bg-slate-800/50 border border-slate-700/50 rounded-3xl p-8 md:p-12 backdrop-blur-sm">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Ready to Secure Your Digital Assets?
            </h2>
            <p className="text-gray-400 text-lg mb-8 max-w-2xl mx-auto">
              Join thousands of users who trust Block+ with their most important files
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/app/register"
                className="px-8 py-4 bg-gradient-to-r from-blue-600 to-cyan-500 text-white font-semibold rounded-xl hover:shadow-2xl hover:shadow-blue-500/30 transition-all duration-300 transform hover:scale-105"
              >
                Start Free Trial
              </Link>
              <Link
                to="/app/pricing"
                className="px-8 py-4 bg-slate-700/50 border border-slate-600 text-white font-semibold rounded-xl hover:bg-slate-600/50 transition-all duration-300"
              >
                View Pricing
              </Link>
            </div>
            <p className="text-gray-500 text-sm mt-6">
              No credit card required • 14-day free trial • Cancel anytime
            </p>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              How <span className="text-blue-500">Block+</span> Works
            </h2>
            <p className="text-gray-400 text-lg max-w-2xl mx-auto">
              Simple, secure, and seamless in just three steps
            </p>
          </div>

          <div className="relative">
            {/* Connection line */}
            <div className="hidden md:block absolute top-1/2 left-0 right-0 h-0.5 bg-gradient-to-r from-blue-500/50 via-purple-500/50 to-cyan-500/50 transform -translate-y-1/2"></div>

            <div className="grid md:grid-cols-3 gap-8">
              {[
                {
                  step: '01',
                  title: 'Connect Wallet',
                  description: 'Link your Polkadot wallet in seconds',
                  icon: '👛',
                  color: 'blue'
                },
                {
                  step: '02',
                  title: 'Upload Files',
                  description: 'Drag & drop or select files to upload',
                  icon: '📤',
                  color: 'purple'
                },
                {
                  step: '03',
                  title: 'Access Anywhere',
                  description: 'Retrieve your files from any device',
                  icon: '🌍',
                  color: 'cyan'
                }
              ].map((step, index) => (
                <div key={index} className="relative text-center">
                  <div className={`relative z-10 w-20 h-20 bg-gradient-to-br from-${step.color}-600 to-${step.color}-400 rounded-2xl flex items-center justify-center mx-auto mb-6 transform hover:scale-110 transition-transform duration-300`}>
                    <span className="text-3xl">{step.icon}</span>
                    <div className="absolute -top-3 -right-3 w-8 h-8 bg-white text-slate-900 rounded-full flex items-center justify-center text-sm font-bold">
                      {step.step}
                    </div>
                  </div>
                  <h3 className="text-xl font-bold text-white mb-2">{step.title}</h3>
                  <p className="text-gray-400">{step.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-800 bg-slate-900/50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-6 md:mb-0">
              <div className="text-2xl font-bold">
                <span className="text-white">block</span>
                <span className="text-blue-500">+</span>
              </div>
              <p className="text-gray-500 text-sm mt-2">
                © {new Date().getFullYear()} Block+. All rights reserved.
              </p>
            </div>
            
            <div className="flex items-center space-x-6">
              <Link
                to="/app/about"
                className="text-gray-400 hover:text-white transition-colors duration-200"
              >
                About
              </Link>
              <Link
                to="/app/pricing"
                className="text-gray-400 hover:text-white transition-colors duration-200"
              >
                Pricing
              </Link>
              <Link
                to="/app/contact"
                className="text-gray-400 hover:text-white transition-colors duration-200"
              >
                Contact
              </Link>
              <a
                href="#"
                className="text-gray-400 hover:text-white transition-colors duration-200"
              >
                Privacy
              </a>
              <a
                href="#"
                className="text-gray-400 hover:text-white transition-colors duration-200"
              >
                Terms
              </a>
            </div>
          </div>
          
          <div className="mt-8 pt-8 border-t border-slate-800 text-center">
            <p className="text-gray-500 text-sm">
              Built with ❤️ on Polkadot • Powered by CESS Network
            </p>
          </div>
        </div>
      </footer>

      {/* Floating CTA */}
      <div className="fixed bottom-6 right-6 z-50">
        <Link
          to="/app/register"
          className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-cyan-500 text-white font-semibold rounded-full shadow-2xl hover:shadow-blue-500/50 transition-all duration-300 transform hover:scale-105"
        >
          <span>Get Started</span>
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
          </svg>
        </Link>
      </div>
    </div>
  )
}

export default LandingPage