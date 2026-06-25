import { motion, useTransform } from 'framer-motion'
import { FiArrowRight } from 'react-icons/fi'

const portals = [
  {
    title: 'Buyer Portal',
    description: 'Shop retail inventory with a clean buyer interface and fast login flow.',
    features: ['Simple buyer onboarding', 'Quick email login', 'Browse products easily'],
    button: 'Open Buyer Portal',
    link: 'http://localhost:5173',
    gradient: 'from-indigo-50 to-white',
    ring: 'ring-indigo-100',
    accent: 'text-indigo-600 bg-indigo-100 border border-indigo-200 shadow-inner',
    glow: 'shadow-indigo-100',
    icon: '🛒',
    dotColor: 'bg-indigo-500',
  },
  {
    title: 'Seller Portal',
    description: 'Access buyer demand, submit competitive bids, and grow sales through auction listings.',
    features: ['Review buyer requests', 'Submit smart bids', 'Manage stock efficiently'],
    button: 'Open Seller Portal',
    link: 'http://localhost:5174',
    gradient: 'from-sky-50 to-white',
    ring: 'ring-sky-100',
    accent: 'text-sky-600 bg-sky-100 border border-sky-200 shadow-inner',
    glow: 'shadow-sky-100',
    icon: '📊',
    dotColor: 'bg-sky-500',
  },
  {
    title: 'Retail Buyer Portal',
    description: 'Browse fresh inventory and manage retail purchases from a dedicated business buyer experience.',
    features: ['Discover product offers', 'Track order progress', 'Secure delivery options'],
    button: 'Open Retail Portal',
    link: 'http://localhost:5175',
    gradient: 'from-emerald-50 to-white',
    ring: 'ring-emerald-100',
    accent: 'text-emerald-600 bg-emerald-100 border border-emerald-200 shadow-inner',
    glow: 'shadow-emerald-100',
    icon: '🏠',
    dotColor: 'bg-emerald-500',
  },
]

export default function PortalCTA() {
  return (
    <section className="w-full py-16 text-slate-900">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-14 text-center"
        >
          <p className="text-xs font-bold uppercase tracking-[0.28em] text-indigo-600">Portal access</p>
          <h2 className="mt-4 text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
            Choose the portal that{' '}
            <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
              matches your role.
            </span>
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-base leading-7 text-slate-600 font-medium">
            One platform, tailored entry points for buyers, sellers and retailers with dedicated workflows and ports.
          </p>
        </motion.div>

        {/* Portal cards grid layout */}
        <div className="mt-12 grid grid-cols-1 gap-8 md:grid-cols-3">
          {portals.map((portal, idx) => (
            <div
              key={idx}
              className={`group relative overflow-hidden rounded-3xl border border-slate-200 bg-gradient-to-br ${portal.gradient} p-8 ring-1 ${portal.ring} shadow-md ${portal.glow} transition-all duration-300 hover:-translate-y-2 hover:shadow-xl`}
            >
              <div className={`inline-flex h-16 w-16 items-center justify-center rounded-3xl ${portal.accent}`}>
                <span className="text-3xl">{portal.icon}</span>
              </div>

              <h3 className="mt-8 text-2xl font-bold text-slate-900">{portal.title}</h3>
              <p className="mt-4 text-base leading-relaxed text-slate-600 font-medium min-h-[80px]">{portal.description}</p>

              <ul className="mt-8 space-y-4">
                {portal.features.map((f, fidx) => (
                  <li key={fidx} className="flex items-center gap-3 text-sm text-slate-600 font-medium">
                    <span className={`h-2 w-2 shrink-0 rounded-full ${portal.dotColor}`} />
                    {f}
                  </li>
                ))}
              </ul>

              <a
                href={portal.link}
                target="_blank"
                rel="noreferrer"
                className="mt-12 inline-flex items-center gap-2 rounded-full bg-slate-900 px-6 py-4 text-sm font-bold text-white transition hover:bg-slate-800 shadow-md shadow-slate-300"
              >
                {portal.button}
                <FiArrowRight className="h-5 w-5" />
              </a>
            </div>
          ))}
        </div>

        {/* Bottom CTA band */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mt-12 overflow-hidden rounded-3xl border border-slate-200 bg-gradient-to-r from-indigo-600 via-purple-600 to-fuchsia-600 px-8 py-12 shadow-xl shadow-indigo-200 sm:px-12"
        >
          <div className="sm:flex sm:items-center sm:justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.24em] text-indigo-100">Get started</p>
              <h3 className="mt-3 text-2xl font-bold tracking-tight text-white">
                One dashboard for every participant.
              </h3>
              <p className="mt-4 max-w-xl text-sm leading-7 text-indigo-50 font-medium">
                Access your portal instantly with dedicated ports for buyer, seller, and retail experiences.
              </p>
            </div>
            <a
              href="#portals"
              className="mt-6 inline-flex items-center justify-center rounded-full bg-white px-6 py-3 text-sm font-bold text-indigo-700 shadow-lg transition hover:bg-slate-50 hover:scale-105 sm:mt-0"
            >
              View Portal Links
            </a>
          </div>
        </motion.div>

      </div>
    </section>
  )
}
