import { motion, useTransform } from 'framer-motion'
import { FiTrendingUp, FiZap, FiUsers, FiShield, FiBarChart2, FiLock } from 'react-icons/fi'

const features = [
  {
    icon: FiTrendingUp,
    title: 'Reverse auction efficiency',
    description: 'Buyers receive the lowest price while sellers compete transparently in every auction.',
    color: 'from-indigo-500/20 to-indigo-600/5',
    iconBg: 'bg-indigo-500/15 text-indigo-400',
  },
  {
    icon: FiZap,
    title: 'Real-time decision making',
    description: 'Track bids, watch trends, and close agreements faster with instant updates.',
    color: 'from-violet-500/20 to-violet-600/5',
    iconBg: 'bg-violet-500/15 text-violet-400',
  },
  {
    icon: FiUsers,
    title: 'Connected marketplace',
    description: 'Link retail buyers, wholesalers, and sellers across one modern portal.',
    color: 'from-sky-500/20 to-sky-600/5',
    iconBg: 'bg-sky-500/15 text-sky-400',
  },
  {
    icon: FiShield,
    title: 'Secure trading flow',
    description: 'Data-protected accounts, verified partners, and safe settlement for every order.',
    color: 'from-emerald-500/20 to-emerald-600/5',
    iconBg: 'bg-emerald-500/15 text-emerald-400',
  },
  {
    icon: FiBarChart2,
    title: 'Actionable insights',
    description: 'Monitor bid performance, inventory demand, and pricing with intuitive analytics.',
    color: 'from-amber-500/20 to-amber-600/5',
    iconBg: 'bg-amber-500/15 text-amber-400',
  },
  {
    icon: FiLock,
    title: 'Support & compliance',
    description: 'Dedicated marketplace support with controls built for enterprise workflows.',
    color: 'from-rose-500/20 to-rose-600/5',
    iconBg: 'bg-rose-500/15 text-rose-400',
  },
]

export default function Features({ progress }) {
  // Move horizontally from 0 to -40% of the container's width
  // (which holds all cards side-by-side) between scroll phase 0.15 and 0.85
  const x = useTransform(progress, [0.15, 0.85], ['0%', '-50%'])
  return (
    <section className="w-full py-16 text-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="mb-14 text-center"
        >
          <p className="text-xs font-bold uppercase tracking-[0.28em] text-indigo-400">Core capabilities</p>
          <h2 className="mt-4 text-3xl font-bold tracking-tight text-white sm:text-4xl">
            Designed for modern trade and{' '}
            <span className="bg-gradient-to-r from-indigo-400 to-violet-400 bg-clip-text text-transparent">
              wholesale excellence.
            </span>
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-base leading-7 text-slate-400">
            Everything needed to run professional auctions, manage buyer-seller workflows,
            and scale your retail ecosystem.
          </p>
        </motion.div>

        {/* Horizontal Feature track */}
        <div className="relative mt-12 flex items-center">
          <motion.div style={{ x }} className="flex gap-6 pr-[50vw]">
            {features.map((feature, idx) => {
              const Icon = feature.icon
              return (
                <div
                  key={idx}
                  className={`group relative flex-shrink-0 w-[340px] overflow-hidden rounded-3xl border border-white/6 bg-gradient-to-br ${feature.color} p-8 backdrop-blur-sm shadow-xl shadow-black/20 transition-transform duration-300 hover:-translate-y-2`}
                >
                  {/* Subtle inner glow on hover */}
                  <div className="pointer-events-none absolute inset-0 rounded-3xl opacity-0 ring-1 ring-inset ring-white/10 transition-opacity duration-300 group-hover:opacity-100" />

                  <div className={`mb-5 inline-flex items-center justify-center rounded-2xl ${feature.iconBg} h-14 w-14`}>
                    <Icon className="h-6 w-6" />
                  </div>
                  <h3 className="mb-3 text-xl font-bold text-white">{feature.title}</h3>
                  <p className="text-base leading-relaxed text-slate-400">{feature.description}</p>
                </div>
              )
            })}
          </motion.div>
        </div>

      </div>
    </section>
  )
}
