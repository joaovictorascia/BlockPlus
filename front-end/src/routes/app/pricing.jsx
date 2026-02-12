import { createFileRoute, Link } from '@tanstack/react-router'

export const Route = createFileRoute('/app/pricing')({
  component: PricingComponent,
})

function PricingComponent() {
  return (
    <div className="max-w-4xl mx-auto">
      <div className="text-center mb-12">
        <h2 className="text-3xl font-bold mb-4 text-white">
          Simple, Transparent <span className="text-blue-500">Pricing</span>
        </h2>
        <p className="text-gray-400 text-lg">
          Choose the plan that fits your needs. No hidden fees.
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-6 mb-12">
        {/* Free Plan */}
        <div className="bg-slate-800/40 rounded-xl p-6 border border-slate-700/30 hover:border-blue-500/30 transition-all duration-300">
          <div className="mb-6">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600/20 rounded-full mb-4">
              <span className="text-blue-500 font-medium">Free</span>
              <span className="text-sm text-gray-400">Forever</span>
            </div>
            <h3 className="text-2xl font-bold text-white mb-2">Starter</h3>
            <p className="text-gray-400 text-sm">Perfect for personal use and testing</p>
          </div>

          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <span className="text-gray-300">8-day initial lifespan</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <span className="text-gray-300">+2 days per download</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <span className="text-gray-300">Max 60 days lifespan</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <span className="text-gray-300">Permanent with 30+ downloads/60 days</span>
            </div>
          </div>

          <div className="mt-8 pt-6 border-t border-slate-700/30">
            <div className="text-center">
              <span className="text-3xl font-bold text-white">$0</span>
              <span className="text-gray-400"> / month</span>
            </div>
            <button className="w-full mt-6 px-4 py-3 bg-slate-700/50 hover:bg-slate-700 text-white font-medium rounded-lg transition-all duration-200">
              Start for Free
            </button>
          </div>
        </div>

        {/* Premium Plan */}
        <div className="bg-slate-800/60 rounded-xl p-6 border-2 border-blue-500/50 relative transform hover:-translate-y-1 transition-all duration-300">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2">
            <span className="px-4 py-1 bg-blue-600 text-white text-sm font-medium rounded-full">
              Most Popular
            </span>
          </div>

          <div className="mb-6">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600/30 rounded-full mb-4">
              <span className="text-blue-400 font-medium">Premium</span>
              <span className="text-sm text-gray-300">Recommended</span>
            </div>
            <h3 className="text-2xl font-bold text-white mb-2">Professional</h3>
            <p className="text-gray-400 text-sm">For businesses and power users</p>
          </div>

          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <span className="text-gray-300">50 CESS Tokens required</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <span className="text-gray-300">5 CESS Tokens / GB / Month</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <span className="text-gray-300">Permanent storage</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <span className="text-gray-300">Priority support</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <span className="text-gray-300">Advanced features</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <span className="text-gray-300">Grace period for limits</span>
            </div>
          </div>

          <div className="mt-8 pt-6 border-t border-slate-700/30">
            <div className="text-center">
              <span className="text-3xl font-bold text-white">Custom</span>
              <span className="text-gray-400"> based on usage</span>
            </div>
            <button className="w-full mt-6 px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-all duration-200 hover:shadow-lg hover:shadow-blue-500/25">
              Upgrade Now
            </button>
          </div>
        </div>

        {/* Non-Profit Plan */}
        <div className="bg-slate-800/40 rounded-xl p-6 border border-slate-700/30 hover:border-emerald-500/30 transition-all duration-300">
          <div className="mb-6">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600/20 rounded-full mb-4">
              <span className="text-emerald-500 font-medium">Non-Profit</span>
              <span className="text-sm text-gray-400">Special</span>
            </div>
            <h3 className="text-2xl font-bold text-white mb-2">Community</h3>
            <p className="text-gray-400 text-sm">For verified non-profit organizations</p>
          </div>

          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
              <span className="text-gray-300">Free permanent storage</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
              <span className="text-gray-300">Verified organizations only</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
              <span className="text-gray-300">Priority support</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
              <span className="text-gray-300">Extended features</span>
            </div>
          </div>

          <div className="mt-8 pt-6 border-t border-slate-700/30">
            <div className="text-center">
              <span className="text-3xl font-bold text-white">Free</span>
              <span className="text-gray-400"> for eligible organizations</span>
            </div>
            <Link
              to="/app/contact"
              className="w-full mt-6 px-4 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-lg transition-all duration-200 hover:shadow-lg hover:shadow-emerald-500/25 flex items-center justify-center gap-2"
            >
              Apply Now
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </Link>
          </div>
        </div>
      </div>

      {/* Additional Information */}
      <div className="bg-slate-800/40 rounded-xl p-8 border border-slate-700/30">
        <h3 className="text-xl font-bold mb-6 text-white">Important Notes</h3>
        
        <div className="grid md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-blue-600/20 rounded-lg flex items-center justify-center flex-shrink-0">
                <span className="text-blue-500">ℹ️</span>
              </div>
              <div>
                <h4 className="font-medium mb-1 text-white">Grace Period</h4>
                <p className="text-gray-400 text-sm">
                  Premium accounts exceeding subscribed limits will have a grace period before files revert to Free account rules.
                </p>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-blue-600/20 rounded-lg flex items-center justify-center flex-shrink-0">
                <span className="text-blue-500">🔄</span>
              </div>
              <div>
                <h4 className="font-medium mb-1 text-white">Automatic Renewal</h4>
                <p className="text-gray-400 text-sm">
                  Storage is billed monthly based on actual usage. You can upgrade or downgrade at any time.
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-blue-600/20 rounded-lg flex items-center justify-center flex-shrink-0">
                <span className="text-blue-500">🔒</span>
              </div>
              <div>
                <h4 className="font-medium mb-1 text-white">Data Protection</h4>
                <p className="text-gray-400 text-sm">
                  All plans include end-to-end encryption and decentralized storage on CESS Network.
                </p>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-blue-600/20 rounded-lg flex items-center justify-center flex-shrink-0">
                <span className="text-blue-500">💬</span>
              </div>
              <div>
                <h4 className="font-medium mb-1 text-white">Support</h4>
                <p className="text-gray-400 text-sm">
                  Free accounts get community support. Premium includes priority email and chat support.
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-slate-700/30 text-center">
          <p className="text-gray-400 mb-4">
            Need help choosing a plan or have custom requirements?
          </p>
          <Link
            to="/app/contact"
            className="inline-flex items-center gap-2 px-6 py-3 bg-slate-700 hover:bg-slate-600 text-white font-medium rounded-lg transition-all duration-200"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
            </svg>
            <span>Contact Our Team</span>
          </Link>
        </div>
      </div>
    </div>
  )
}