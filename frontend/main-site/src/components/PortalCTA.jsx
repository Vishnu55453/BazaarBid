import { motion, useTransform } from 'framer-motion'
import { FiArrowRight } from 'react-icons/fi'

const portals = [
  {
    title: 'Buyer Portal',
    description: 'Shop retail inventory with a clean buyer interface and fast login flow.',
    features: ['Simple buyer onboarding', 'Quick email login', 'Browse products easily'],
    button: 'Open Buyer Portal',
    link: 'http://localhost:5173',
    gradient: 'from-indigo-600/20 via-indigo-500/10 to-transparent',
    ring: 'ring-indigo-500/20',
    accent: 'text-indigo-300 bg-indigo-500/10',
    glow: 'shadow-indigo-500/20',
    icon: '🛒',
    dotColor: 'bg-indigo-400',
  },
  {
    title: 'Seller Portal',
    description: 'Access buyer demand, submit competitive bids, and grow sales through auction listings.',
    features: ['Review buyer requests', 'Submit smart bids', 'Manage stock efficiently'],
    button: 'Open Seller Portal',
    link: 'http://localhost:5174',
    gradient: 'from-sky-600/20 via-sky-500/10 to-transparent',
    ring: 'ring-sky-500/20',
    accent: 'text-sky-300 bg-sky-500/10',
    glow: 'shadow-sky-500/20',
    icon: '📊',
    dotColor: 'bg-sky-400',
  },
  {
    title: 'Retail Buyer Portal',
    description: 'Browse fresh inventory and manage retail purchases from a dedicated business buyer experience.',
    features: ['Discover product offers', 'Track order progress', 'Secure delivery options'],
    button: 'Open Retail Portal',
    link: 'http://localhost:5175',
    gradient: 'from-emerald-600/20 via-emerald-500/10 to-transparent',
    ring: 'ring-emerald-500/20',
    accent: 'text-emerald-300 bg-emerald-500/10',
    glow: 'shadow-emerald-500/20',
    icon: '🏠',
    dotColor: 'bg-emerald-400',
  },
]

export default function PortalCTA({ progress }) {
  const x = useTransform(progress, [0.15, 0.85], ['0%', '-40%'])
  return (
    <section className="w-full py-16 text-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-14 text-center"
        >
          <p className="text-xs font-bold uppercase tracking-[0.28em] text-slate-500">Portal access</p>
          <h2 className="mt-4 text-3xl font-bold tracking-tight text-white sm:text-4xl">
            Choose the portal that{' '}
            <span className="bg-gradient-to-r from-violet-400 to-purple-400 bg-clip-text text-transparent">
              matches your role.
            </span>
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-base leading-7 text-slate-400">
            One platform, tailored entry points for buyers, sellers and retailers with dedicated workflows and ports.
          </p>
        </motion.div>

        {/* Portal cards horizontal track */}
        <div className="relative mt-12 flex items-center">
          <motion.div style={{ x }} className="flex gap-6 pr-[50vw]">
            {portals.map((portal, idx) => (
              <div
                key={idx}
                className={`group relative flex-shrink-0 w-[400px] overflow-hidden rounded-3xl border border-white/6 bg-gradient-to-br ${portal.gradient} p-8 ring-1 ${portal.ring} shadow-2xl ${portal.glow} backdrop-blur-sm transition-transform duration-300 hover:-translate-y-2`}
              >
                <div className="pointer-events-none absolute inset-0 rounded-3xl opacity-0 ring-1 ring-inset ring-white/10 transition-opacity duration-300 group-hover:opacity-100" />

                <div className={`inline-flex h-16 w-16 items-center justify-center rounded-3xl ${portal.accent}`}>
                  <span className="text-3xl">{portal.icon}</span>
                </div>

                <h3 className="mt-8 text-2xl font-bold text-white">{portal.title}</h3>
                <p className="mt-4 text-base leading-relaxed text-slate-400 min-h-[80px]">{portal.description}</p>

                <ul className="mt-8 space-y-4">
                  {portal.features.map((f, fidx) => (
                    <li key={fidx} className="flex items-center gap-3 text-sm text-slate-400">
                      <span className={`h-2 w-2 shrink-0 rounded-full ${portal.dotColor}`} />
                      {f}
                    </li>
                  ))}
                </ul>

                <a
                  href={portal.link}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-12 inline-flex items-center gap-2 rounded-full bg-white/10 px-6 py-4 text-sm font-bold text-white transition hover:bg-white/20"
                >
                  {portal.button}
                  <FiArrowRight className="h-5 w-5" />
                </a>
              </div>
            ))}
          </motion.div>
        </div>

        {/* Bottom CTA band */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mt-12 overflow-hidden rounded-3xl border border-white/6 bg-gradient-to-r from-indigo-600 via-violet-600 to-purple-700 px-8 py-12 shadow-2xl shadow-indigo-900/40 sm:px-12"
        >
          <div className="sm:flex sm:items-center sm:justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.24em] text-indigo-200">Get started</p>
              <h3 className="mt-3 text-2xl font-bold tracking-tight text-white">
                One dashboard for every participant.
              </h3>
              <p className="mt-4 max-w-xl text-sm leading-7 text-indigo-100/80">
                Access your portal instantly with dedicated ports for buyer, seller, and retail experiences.
              </p>
            </div>
            <a
              href="#portals"
              className="mt-6 inline-flex items-center justify-center rounded-full bg-white px-6 py-3 text-sm font-bold text-indigo-700 transition hover:bg-indigo-50 sm:mt-0"
            >
              View Portal Links
            </a>
          </div>
        </motion.div>

      </div>
    </section>
  )
}
