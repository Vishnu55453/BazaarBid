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
            className="inline-flex rounded-full border border-indigo-500/30 bg-indigo-500/10 px-4 py-2 text-xs font-semibold text-indigo-300 tracking-wide"
          >
            Wholesale reverse auction marketplace for buyers and sellers
          </motion.span>

          <motion.div variants={itemVariant}>
            <h1 className="text-4xl font-extrabold tracking-tight text-white sm:text-5xl lg:text-6xl leading-[1.1]">
              Turn every bid into a{' '}
              <span className="bg-gradient-to-r from-indigo-400 via-violet-400 to-purple-400 bg-clip-text text-transparent">
                winning deal.
              </span>
            </h1>
            <p className="mt-5 text-base leading-8 text-slate-400 max-w-xl">
              BazaarBid brings buyers, retailers, and sellers together in a professional auction network.
              Discover better pricing, instant matches, and transparent transactions.
            </p>
          </motion.div>

          <motion.div variants={itemVariant} className="flex flex-wrap gap-3">
            <button
              onClick={() => {
                const el = document.getElementById('portals')
                if (el) window.scrollTo({ top: el.offsetTop + el.offsetHeight * 0.22, behavior: 'smooth' })
              }}
              className="inline-flex items-center justify-center rounded-full bg-indigo-600 px-7 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-600/30 transition hover:bg-indigo-500"
            >
              Explore Portals <FiArrowRight className="ml-2 h-4 w-4" />
            </button>
            <button
              onClick={() => {
                const el = document.getElementById('features')
                if (el) window.scrollTo({ top: el.offsetTop + el.offsetHeight * 0.22, behavior: 'smooth' })
              }}
              className="inline-flex items-center justify-center rounded-full border border-white/10 bg-white/5 px-7 py-3 text-sm font-semibold text-white transition hover:bg-white/10"
            >
              See Features
            </button>
          </motion.div>

          <motion.div variants={itemVariant} className="grid grid-cols-3 gap-3">
            {[
              { label: 'Competitive pricing', value: 'Real-time bids' },
              { label: 'Verified partners',   value: 'Secure transactions' },
              { label: 'Fast onboarding',     value: 'Intuitive dashboards' },
            ].map((s) => (
              <div key={s.label} className="rounded-2xl border border-white/5 bg-white/[0.04] p-4">
                <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-500">{s.label}</p>
                <p className="mt-2 text-sm font-semibold text-white">{s.value}</p>
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
          <div className="rounded-3xl border border-white/8 bg-white/[0.04] p-7 backdrop-blur-md shadow-2xl shadow-black/50">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-medium text-slate-500">Trusted by teams across wholesale markets</p>
                <h2 className="mt-2 text-xl font-bold text-white">One platform. Four portals. Unlimited scale.</h2>
              </div>
              <span className="shrink-0 rounded-xl border border-indigo-500/30 bg-indigo-500/10 px-3 py-1.5 text-xs font-bold text-indigo-300">
                Live
              </span>
            </div>
            <div className="mt-6 grid grid-cols-2 gap-3">
              {[
                { icon: <FiTrendingUp className="h-4 w-4" />, title: 'Market momentum' },
                { icon: <FiShield     className="h-4 w-4" />, title: 'Secure & compliant' },
                { icon: <FiLayers    className="h-4 w-4" />, title: 'Role-based portals' },
                { icon: <FiArrowRight className="h-4 w-4"/>, title: 'Fast onboarding' },
              ].map((c) => (
                <div key={c.title} className="flex items-center gap-3 rounded-2xl border border-white/5 bg-white/[0.03] p-3.5">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-indigo-500/15 text-indigo-400">
                    {c.icon}
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-white">{c.title}</p>
                    <p className="mt-0.5 text-[10px] text-slate-500">Reliable marketplace intelligence.</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* CTA strip */}
          <div className="rounded-3xl bg-gradient-to-br from-indigo-600 via-violet-600 to-purple-700 p-7 shadow-2xl shadow-indigo-900/50">
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-indigo-200">Ready for professional bidding?</p>
            <h3 className="mt-3 text-xl font-bold text-white">Start your first auction in minutes.</h3>
            <p className="mt-2 text-xs leading-6 text-indigo-100/80">
              Built for buyers, retailers, and sellers who expect fast workflows, transparent pricing, and enterprise-grade reliability.
            </p>
            <div className="mt-5 grid grid-cols-3 gap-2">
              {[
                { label: 'Buyers',    value: 'Retail & wholesale' },
                { label: 'Sellers',   value: 'Market access' },
                { label: 'Retailers', value: 'Inventory flow' },
              ].map((s) => (
                <div key={s.label} className="rounded-2xl bg-black/20 p-3">
                  <p className="text-[10px] text-indigo-200">{s.label}</p>
                  <p className="mt-1 text-xs font-semibold text-white">{s.value}</p>
                </div>
              ))}
            </div>
          </div>
        </motion.div>

      </div>
    </section>
  )
}
