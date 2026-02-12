import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/app/about')({
  component: AboutComponent,
})

function AboutComponent() {
  return (
    <div className="max-w-3xl mx-auto">
      <div className="text-center mb-10">
        <h2 className="text-3xl font-bold mb-4 text-white">
          About <span className="text-blue-500">Block+</span>
        </h2>
        <p className="text-gray-400 text-lg">
          Decentralized storage reimagined for the modern web
        </p>
      </div>

      <div className="space-y-8">
        {/* Mission Section */}
        <section className="bg-slate-800/40 rounded-xl p-6 border border-slate-700/30">
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0">
              <div className="w-12 h-12 bg-blue-600/20 rounded-lg flex items-center justify-center">
                <span className="text-blue-500 text-xl">🎯</span>
              </div>
            </div>
            <div>
              <h3 className="text-xl font-bold mb-3 text-white">Our Mission</h3>
              <p className="text-gray-400 leading-relaxed">
                To provide accessible, secure, and decentralized file storage solutions that empower 
                users to take control of their data. We believe in a future where everyone can store 
                and share files without compromising privacy or relying on centralized entities.
              </p>
            </div>
          </div>
        </section>

        {/* Technology Section */}
        <section className="bg-slate-800/40 rounded-xl p-6 border border-slate-700/30">
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0">
              <div className="w-12 h-12 bg-blue-600/20 rounded-lg flex items-center justify-center">
                <span className="text-blue-500 text-xl">⚙️</span>
              </div>
            </div>
            <div>
              <h3 className="text-xl font-bold mb-3 text-white">Built on CESS Network</h3>
              <p className="text-gray-400 mb-4 leading-relaxed">
                Block+ leverages the power of CESS (Cumulus Encrypted Storage System) Network, 
                a decentralized cloud storage infrastructure that ensures:
              </p>
              <ul className="space-y-3">
                <li className="flex items-center gap-3 text-gray-400">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <span>End-to-end encryption for all stored files</span>
                </li>
                <li className="flex items-center gap-3 text-gray-400">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <span>Data redundancy across multiple decentralized nodes</span>
                </li>
                <li className="flex items-center gap-3 text-gray-400">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <span>Transparent blockchain-based storage verification</span>
                </li>
                <li className="flex items-center gap-3 text-gray-400">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <span>Resistance to censorship and single points of failure</span>
                </li>
              </ul>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="grid md:grid-cols-2 gap-6">
          <div className="bg-slate-800/40 rounded-xl p-6 border border-slate-700/30">
            <div className="w-10 h-10 bg-blue-600/20 rounded-lg flex items-center justify-center mb-4">
              <span className="text-blue-500">🔐</span>
            </div>
            <h4 className="text-lg font-semibold mb-2 text-white">Privacy First</h4>
            <p className="text-gray-400 text-sm">
              Your files are encrypted before leaving your device. We never have access to your data.
            </p>
          </div>

          <div className="bg-slate-800/40 rounded-xl p-6 border border-slate-700/30">
            <div className="w-10 h-10 bg-blue-600/20 rounded-lg flex items-center justify-center mb-4">
              <span className="text-blue-500">⚡</span>
            </div>
            <h4 className="text-lg font-semibold mb-2 text-white">High Performance</h4>
            <p className="text-gray-400 text-sm">
              Fast upload and download speeds with parallel processing across multiple nodes.
            </p>
          </div>

          <div className="bg-slate-800/40 rounded-xl p-6 border border-slate-700/30">
            <div className="w-10 h-10 bg-blue-600/20 rounded-lg flex items-center justify-center mb-4">
              <span className="text-blue-500">🌐</span>
            </div>
            <h4 className="text-lg font-semibold mb-2 text-white">Global Network</h4>
            <p className="text-gray-400 text-sm">
              Files stored across a worldwide network of nodes for maximum availability.
            </p>
          </div>

          <div className="bg-slate-800/40 rounded-xl p-6 border border-slate-700/30">
            <div className="w-10 h-10 bg-blue-600/20 rounded-lg flex items-center justify-center mb-4">
              <span className="text-blue-500">💸</span>
            </div>
            <h4 className="text-lg font-semibold mb-2 text-white">Fair Pricing</h4>
            <p className="text-gray-400 text-sm">
              Pay only for what you use with transparent, competitive pricing.
            </p>
          </div>
        </section>

        {/* Team Philosophy */}
        <section className="bg-slate-800/40 rounded-xl p-6 border border-slate-700/30">
          <h3 className="text-xl font-bold mb-4 text-white">Our Philosophy</h3>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-600/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-blue-500 text-xl">🤝</span>
              </div>
              <h4 className="font-semibold mb-2 text-white">Transparency</h4>
              <p className="text-gray-400 text-sm">
                Open-source principles and clear communication
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-600/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-blue-500 text-xl">🛡️</span>
              </div>
              <h4 className="font-semibold mb-2 text-white">Security</h4>
              <p className="text-gray-400 text-sm">
                Military-grade encryption and regular security audits
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-600/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-blue-500 text-xl">🚀</span>
              </div>
              <h4 className="font-semibold mb-2 text-white">Innovation</h4>
              <p className="text-gray-400 text-sm">
                Constantly evolving with blockchain technology
              </p>
            </div>
          </div>
        </section>

        {/* Contact CTA */}
        <div className="text-center pt-8 border-t border-slate-700/30">
          <p className="text-gray-400 mb-4">
            Have questions or want to learn more?
          </p>
          <a 
            href="/app/contact" 
            className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-all duration-200 hover:shadow-lg hover:shadow-blue-500/25"
          >
            <span>Get in Touch</span>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
          </a>
        </div>
      </div>
    </div>
  )
}