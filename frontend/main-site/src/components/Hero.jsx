import { motion } from 'framer-motion'
import { FiArrowRight, FiLayers, FiShield, FiTrendingUp } from 'react-icons/fi'

const containerVariants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.1, delayChildren: 0.05 } },
}
const itemVariant = {
  hidden: { opacity: 0, y: 24 },
  show:   { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] } },
}

export default function Hero() {
  return (
    <section className="w-full max-w-7xl">
      <div className="grid items-start gap-10 lg:grid-cols-2 lg:items-center">

        {/* ── Left Column ── */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="show"
          className="space-y-7"
        >
          <motion.span
            variants={itemVariant}
            className="inline-flex rounded-full border border-indigo-200 bg-indigo-50 px-4 py-2 text-xs font-bold text-indigo-700 tracking-wide shadow-sm"
          >
            The premium B2B wholesale marketplace
          </motion.span>

          <motion.div variants={itemVariant}>
            <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 sm:text-5xl lg:text-6xl leading-[1.1]">
              Smarter sourcing.{' '}
              <span className="bg-gradient-to-r from-indigo-600 via-purple-600 to-fuchsia-600 bg-clip-text text-transparent">
                Better margins.
              </span>
            </h1>
            <p className="mt-5 text-base leading-8 text-slate-600 max-w-xl font-medium">
              BazaarBid brings retailers and verified wholesale suppliers together. 
              Discover true market pricing, secure transactions, and powerful market insights.
            </p>
          </motion.div>

          <motion.div variants={itemVariant} className="flex flex-wrap gap-3">
            <button
              onClick={() => {
                const el = document.getElementById('portals')
                if (el) window.scrollTo({ top: el.offsetTop + el.offsetHeight * 0.22, behavior: 'smooth' })
              }}
              className="inline-flex items-center justify-center rounded-full bg-gradient-to-r from-indigo-600 to-purple-600 px-7 py-3 text-sm font-bold text-white shadow-lg shadow-indigo-200 transition hover:scale-105"
            >
              Explore Portals <FiArrowRight className="ml-2 h-4 w-4" />
            </button>
            <button
              onClick={() => {
                const el = document.getElementById('pricing')
                if (el) window.scrollTo({ top: el.offsetTop + el.offsetHeight * 0.22, behavior: 'smooth' })
              }}
              className="inline-flex items-center justify-center rounded-full border border-slate-200 bg-white px-7 py-3 text-sm font-bold text-slate-700 transition hover:bg-slate-50 shadow-sm hover:shadow-md"
            >
              View Pricing
            </button>
          </motion.div>

          <motion.div variants={itemVariant} className="grid grid-cols-3 gap-3">
            {[
              { label: 'Demand Heatmaps', value: 'Live market data' },
              { label: 'Verified Partners', value: 'Secure KYC' },
              { label: 'Market Insights', value: 'Price trends' },
            ].map((s) => (
              <div key={s.label} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-indigo-500">{s.label}</p>
                <p className="mt-2 text-sm font-bold text-slate-800">{s.value}</p>
              </div>
            ))}
          </motion.div>
        </motion.div>

        {/* ── Right Column ── */}
        <motion.div
          initial={{ opacity: 0, x: 28 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.75, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
          className="space-y-4"
        >
          {/* Platform card */}
          <div className="rounded-3xl border border-slate-200 bg-white p-7 shadow-xl shadow-slate-200/50">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">The New Standard</p>
                <h2 className="mt-2 text-xl font-bold text-slate-900">Premium B2B Workflows.</h2>
              </div>
              <span className="shrink-0 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-600 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></span> Live
              </span>
            </div>
            <div className="mt-6 grid grid-cols-2 gap-3">
              {[
                { icon: <FiTrendingUp className="h-4 w-4" />, title: 'Market Insights' },
                { icon: <FiShield     className="h-4 w-4" />, title: 'Verified Only' },
                { icon: <FiLayers    className="h-4 w-4" />, title: 'Demand Heatmaps' },
                { icon: <FiArrowRight className="h-4 w-4"/>, title: 'Premium Badges' },
              ].map((c) => (
                <div key={c.title} className="flex items-center gap-3 rounded-2xl border border-slate-100 bg-slate-50 p-3.5 transition hover:bg-white hover:shadow-sm">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-indigo-100 text-indigo-600">
                    {c.icon}
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-800">{c.title}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* CTA strip */}
          <div className="rounded-3xl bg-gradient-to-br from-indigo-600 via-purple-600 to-fuchsia-600 p-7 shadow-xl shadow-indigo-200">
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-indigo-100">Ready to level up?</p>
            <h3 className="mt-3 text-xl font-bold text-white">Unlock Premium Features Today.</h3>
            <p className="mt-2 text-xs leading-6 text-indigo-50 font-medium">
              Join BazaarBid and experience completely transparent pricing, regional demand heatmaps, and secure verified transactions.
            </p>
            <div className="mt-5 grid grid-cols-3 gap-2">
              {[
                { label: 'Retailers',    value: 'Buy smarter' },
                { label: 'Suppliers',   value: 'Sell faster' },
                { label: 'Market', value: '100% Secure' },
              ].map((s) => (
                <div key={s.label} className="rounded-2xl bg-white/10 backdrop-blur-sm p-3 border border-white/20">
                  <p className="text-[10px] text-indigo-100 uppercase font-bold tracking-wider">{s.label}</p>
                  <p className="mt-1 text-xs font-bold text-white">{s.value}</p>
                </div>
              ))}
            </div>
          </div>
        </motion.div>

      </div>
    </section>
  )
}
