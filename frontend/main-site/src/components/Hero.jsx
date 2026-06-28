import { motion } from 'framer-motion'
import { FiArrowRight, FiLayers, FiShield, FiTrendingUp, FiActivity, FiTruck, FiCheckCircle } from 'react-icons/fi'

function EcosystemShowcase() {
  return (
    <div className="relative w-full h-[550px] bg-slate-50/50 rounded-[40px] border border-slate-200/60 shadow-[inset_0_0_80px_rgba(0,0,0,0.02)] overflow-hidden flex items-center justify-center">
      
      {/* Background Dot Grid */}
      <div 
        className="absolute inset-0 opacity-[0.3]" 
        style={{ 
          backgroundImage: 'radial-gradient(#94a3b8 1.5px, transparent 1.5px)', 
          backgroundSize: '32px 32px',
          backgroundPosition: 'center center'
        }} 
      />

      {/* SVG Connection Lines */}
      <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="absolute inset-0 w-full h-full pointer-events-none z-0 opacity-60">
        <defs>
          <linearGradient id="lineGrad1" x1="50%" y1="50%" x2="25%" y2="20%">
            <stop offset="0%" stopColor="#a855f7" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#6366f1" stopOpacity="0.1" />
          </linearGradient>
          <linearGradient id="lineGrad2" x1="50%" y1="50%" x2="75%" y2="20%">
            <stop offset="0%" stopColor="#a855f7" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#6366f1" stopOpacity="0.1" />
          </linearGradient>
          <linearGradient id="lineGrad3" x1="50%" y1="50%" x2="25%" y2="80%">
            <stop offset="0%" stopColor="#a855f7" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#6366f1" stopOpacity="0.1" />
          </linearGradient>
          <linearGradient id="lineGrad4" x1="50%" y1="50%" x2="75%" y2="80%">
            <stop offset="0%" stopColor="#a855f7" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#6366f1" stopOpacity="0.1" />
          </linearGradient>
        </defs>

        <motion.line x1="50" y1="50" x2="20" y2="25" stroke="url(#lineGrad1)" strokeWidth="0.4" strokeDasharray="1 2" strokeLinecap="round"
          animate={{ strokeDashoffset: [0, -10] }} transition={{ duration: 3, repeat: Infinity, ease: "linear" }} />
        
        <motion.line x1="50" y1="50" x2="80" y2="25" stroke="url(#lineGrad2)" strokeWidth="0.4" strokeDasharray="1 2" strokeLinecap="round"
          animate={{ strokeDashoffset: [0, -10] }} transition={{ duration: 3, repeat: Infinity, ease: "linear" }} />
        
        <motion.line x1="50" y1="50" x2="20" y2="75" stroke="url(#lineGrad3)" strokeWidth="0.4" strokeDasharray="1 2" strokeLinecap="round"
          animate={{ strokeDashoffset: [0, -10] }} transition={{ duration: 3, repeat: Infinity, ease: "linear" }} />
        
        <motion.line x1="50" y1="50" x2="80" y2="75" stroke="url(#lineGrad4)" strokeWidth="0.4" strokeDasharray="1 2" strokeLinecap="round"
          animate={{ strokeDashoffset: [0, -10] }} transition={{ duration: 3, repeat: Infinity, ease: "linear" }} />
      </svg>

      {/* Central Engine Hub */}
      <motion.div
        animate={{ scale: [1, 1.05, 1], boxShadow: ['0 0 0 rgba(99,102,241,0)', '0 0 40px rgba(99,102,241,0.3)', '0 0 0 rgba(99,102,241,0)'] }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-gradient-to-br from-indigo-600 via-purple-600 to-fuchsia-600 p-5 rounded-3xl shadow-xl z-20 w-36 h-36 flex flex-col items-center justify-center border border-white/20 backdrop-blur-md"
      >
        <motion.div 
          animate={{ rotate: 360 }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          className="bg-white/20 p-3 rounded-2xl backdrop-blur-md mb-3"
        >
          <FiActivity className="w-8 h-8 text-white" />
        </motion.div>
        <span className="text-[10px] font-bold text-white uppercase tracking-[0.2em] text-center leading-tight">BazaarBid<br/>Engine</span>
      </motion.div>

      {/* Top Left: Supplier Verification */}
      <motion.div
        animate={{ y: [0, -8, 0] }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        className="absolute top-8 left-4 sm:left-8 bg-white/90 backdrop-blur-xl rounded-2xl p-4 shadow-xl shadow-slate-200/50 border border-slate-100 w-52 z-10"
      >
        <div className="flex items-center gap-3">
          <div className="bg-emerald-50 border border-emerald-100 p-2.5 rounded-xl text-emerald-600 shadow-sm">
            <FiShield className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Supplier Auth</p>
            <p className="text-sm font-bold text-slate-900">KYC Verified</p>
          </div>
        </div>
        <div className="mt-4 flex items-center justify-between bg-slate-50/50 rounded-lg p-2.5 border border-slate-100">
          <div className="flex items-center gap-1.5">
            <FiCheckCircle className="w-3.5 h-3.5 text-emerald-500" />
            <span className="text-xs font-bold text-slate-600">Trust Score</span>
          </div>
          <span className="text-xs font-extrabold text-emerald-600">98/100</span>
        </div>
      </motion.div>

      {/* Top Right: Live Auction Engine */}
      <motion.div
        animate={{ y: [0, 10, 0] }}
        transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
        className="absolute top-12 right-4 sm:right-8 bg-white/90 backdrop-blur-xl rounded-2xl p-4 shadow-xl shadow-slate-200/50 border border-slate-100 w-56 z-10"
      >
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2 bg-rose-50 px-2 py-1 rounded-md border border-rose-100">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse" />
            <span className="text-[9px] font-bold text-rose-600 uppercase tracking-wider">Live Auction</span>
          </div>
          <span className="text-xs font-mono font-bold text-slate-500 bg-slate-50 px-2 py-1 rounded-md">00:04:12</span>
        </div>
        <div className="space-y-3">
          <div className="flex justify-between items-end">
            <span className="text-[11px] font-bold text-slate-500">Winning Bid</span>
            <motion.span 
              animate={{ color: ['#0f172a', '#10b981', '#0f172a'], scale: [1, 1.05, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="text-lg font-black text-slate-900"
            >₹1,240</motion.span>
          </div>
          <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
            <motion.div 
              animate={{ width: ['30%', '85%', '95%'] }} 
              transition={{ duration: 6, repeat: Infinity }}
              className="bg-indigo-500 h-full rounded-full"
            />
          </div>
        </div>
      </motion.div>

      {/* Bottom Left: Logistics Tracking */}
      <motion.div
        animate={{ y: [0, 8, 0] }}
        transition={{ duration: 5.5, repeat: Infinity, ease: "easeInOut", delay: 1.5 }}
        className="absolute bottom-12 left-4 sm:left-8 bg-white/90 backdrop-blur-xl rounded-2xl p-4 shadow-xl shadow-slate-200/50 border border-slate-100 w-56 z-10"
      >
        <div className="flex items-center gap-2.5 mb-4">
          <div className="bg-purple-50 border border-purple-100 p-2 rounded-xl text-purple-600 shadow-sm">
            <FiTruck className="w-4 h-4" />
          </div>
          <span className="text-xs font-bold text-slate-800">Route Analytics</span>
        </div>
        <div className="relative h-1.5 bg-slate-100 rounded-full w-full mt-5 mb-2">
          <motion.div 
            animate={{ left: ['0%', '100%'] }}
            transition={{ duration: 5, repeat: Infinity, ease: "linear" }}
            className="absolute top-1/2 -translate-y-1/2 -ml-2 w-5 h-5 bg-purple-600 rounded-full border-[3px] border-white shadow-md flex items-center justify-center z-10"
          />
          {/* Track fill */}
          <motion.div 
            animate={{ width: ['0%', '100%'] }}
            transition={{ duration: 5, repeat: Infinity, ease: "linear" }}
            className="absolute top-0 left-0 h-full bg-purple-200 rounded-full"
          />
        </div>
        <div className="flex justify-between text-[9px] font-bold text-slate-400 mt-2 uppercase tracking-wider">
          <span>Dispatch</span>
          <span>Delivered</span>
        </div>
      </motion.div>

      {/* Bottom Right: Market Analytics */}
      <motion.div
        animate={{ y: [0, -10, 0] }}
        transition={{ duration: 4.5, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
        className="absolute bottom-8 right-4 sm:right-8 bg-white/90 backdrop-blur-xl rounded-2xl p-4 shadow-xl shadow-slate-200/50 border border-slate-100 w-52 z-10"
      >
        <div className="flex items-center gap-2 mb-4">
          <div className="bg-indigo-50 border border-indigo-100 p-2 rounded-xl text-indigo-600 shadow-sm">
            <FiTrendingUp className="w-4 h-4" />
          </div>
          <span className="text-xs font-bold text-slate-800">Demand Trend</span>
        </div>
        <div className="flex items-end gap-1.5 h-16 mt-2 pb-1 border-b border-slate-100">
          {[40, 65, 45, 80, 55, 95].map((h, i) => (
            <motion.div
              key={i}
              animate={{ height: [`${h}%`, `${Math.max(20, h - 20)}%`, `${h}%`] }}
              transition={{ duration: 3, repeat: Infinity, delay: i * 0.15 }}
              className="flex-1 bg-gradient-to-t from-indigo-500 to-purple-500 rounded-sm opacity-90"
            />
          ))}
        </div>
      </motion.div>

    </div>
  )
}

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
              { label: 'Rank Tracking', value: 'Live competitor data' },
              { label: 'Verified Network', value: 'Secure KYC' },
              { label: 'Dynamic Bidding', value: 'Multi-item discounts' },
            ].map((s) => (
              <div key={s.label} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-indigo-500">{s.label}</p>
                <p className="mt-2 text-sm font-bold text-slate-800">{s.value}</p>
              </div>
            ))}
          </motion.div>
        </motion.div>

        {/* ── Right Column (Animated Ecosystem Showcase) ── */}
        <motion.div
          initial={{ opacity: 0, x: 28 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.75, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
          className="w-full flex items-center justify-center"
        >
          <EcosystemShowcase />
        </motion.div>

      </div>
    </section>
  )
}
