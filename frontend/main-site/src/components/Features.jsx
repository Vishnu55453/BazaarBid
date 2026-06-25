import { motion, useTransform } from 'framer-motion'
import { FiTrendingUp, FiZap, FiUsers, FiShield, FiBarChart2, FiLock } from 'react-icons/fi'

const features = [
  {
    icon: FiShield,
    title: 'Verified Sellers Only',
    description: 'Ensure total trust by restricting your auctions so only KYC-verified wholesale suppliers can place bids.',
    color: 'from-emerald-50 to-white',
    iconBg: 'bg-emerald-100 text-emerald-600',
  },
  {
    icon: FiTrendingUp,
    title: 'Market Insights',
    description: 'Track real-time average winning bids and price trends across all categories to forecast your sourcing budget.',
    color: 'from-indigo-50 to-white',
    iconBg: 'bg-indigo-100 text-indigo-600',
  },
  {
    icon: FiBarChart2,
    title: 'Demand Heatmaps',
    description: 'Suppliers get access to regional demand intelligence, showing exactly which cities have the highest volume of active auctions.',
    color: 'from-amber-50 to-white',
    iconBg: 'bg-amber-100 text-amber-600',
  },
  {
    icon: FiZap,
    title: 'Premium Supplier Badges',
    description: 'Stand out from the crowd. Premium suppliers earn a visible trust badge, increasing their chances of winning large bids.',
    color: 'from-violet-50 to-white',
    iconBg: 'bg-violet-100 text-violet-600',
  },
  {
    icon: FiUsers,
    title: 'Connected marketplace',
    description: 'Link retail buyers, wholesalers, and sellers across role-specific, modern portals.',
    color: 'from-sky-50 to-white',
    iconBg: 'bg-sky-100 text-sky-600',
  },
  {
    icon: FiLock,
    title: 'Anonymous Bidding',
    description: 'Maintain leverage. Supplier identities and competitor bids are strategically masked until you decide to reveal them.',
    color: 'from-rose-50 to-white',
    iconBg: 'bg-rose-100 text-rose-600',
  },
]

export default function Features() {
  return (
    <section className="w-full py-16 text-slate-900">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="mb-14 text-center"
        >
          <p className="text-xs font-bold uppercase tracking-[0.28em] text-indigo-600">Core capabilities</p>
          <h2 className="mt-4 text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
            Designed for modern trade and{' '}
            <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
              wholesale excellence.
            </span>
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-base leading-7 text-slate-600 font-medium">
            Everything needed to run professional auctions, manage buyer-seller workflows,
            and scale your retail ecosystem using powerful SaaS tools.
          </p>
        </motion.div>

        {/* Grid layout for features */}
        <div className="mt-12 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((feature, idx) => {
            const Icon = feature.icon
            return (
              <div
                key={idx}
                className={`group relative overflow-hidden rounded-3xl border border-slate-200 bg-gradient-to-br ${feature.color} p-8 shadow-md transition-all duration-300 hover:-translate-y-2 hover:shadow-xl hover:shadow-indigo-100`}
              >
                <div className={`mb-5 inline-flex items-center justify-center rounded-2xl ${feature.iconBg} h-14 w-14 shadow-inner border border-white/50`}>
                  <Icon className="h-6 w-6" />
                </div>
                <h3 className="mb-3 text-xl font-bold text-slate-900">{feature.title}</h3>
                <p className="text-base leading-relaxed text-slate-600 font-medium">{feature.description}</p>
              </div>
            )
          })}
        </div>

      </div>
    </section>
  )
}
