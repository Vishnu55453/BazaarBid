import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { FiArrowRight, FiLayers, FiShield, FiTrendingUp, FiActivity, FiTruck, FiCheckCircle, FiPackage, FiUsers, FiLock, FiShoppingCart, FiCpu } from 'react-icons/fi'

function NodeCard({ x, y, icon, title, subtitle, color, active, status, large }) {
  const colorMap = {
    blue: { bg: 'bg-blue-500/10', border: 'border-blue-500/30', text: 'text-blue-500' },
    purple: { bg: 'bg-purple-500/10', border: 'border-purple-500/30', text: 'text-purple-500' },
    pink: { bg: 'bg-pink-500/10', border: 'border-pink-500/30', text: 'text-pink-500' },
    emerald: { bg: 'bg-emerald-500/10', border: 'border-emerald-500/30', text: 'text-emerald-500' },
    amber: { bg: 'bg-amber-500/10', border: 'border-amber-500/30', text: 'text-amber-500' },
  }
  const c = colorMap[color]

  return (
    <motion.div
      animate={{
        y: [0, -6, 0],
        scale: active ? 1.05 : 1,
        boxShadow: active ? `0 0 30px rgba(0,0,0,0.05), inset 0 0 20px rgba(255,255,255,0.6)` : `0 10px 30px rgba(0,0,0,0.03)`
      }}
      transition={{
        y: { duration: 3 + Math.random() * 2, repeat: Infinity, ease: "easeInOut" },
        scale: { duration: 0.3 }
      }}
      className={`absolute z-10 flex flex-col items-center -translate-x-1/2 -translate-y-1/2 w-[130px] sm:w-[150px] ${large ? 'sm:w-[190px]' : ''}`}
      style={{ left: `${x}%`, top: `${y}%` }}
    >
      <AnimatePresence>
        {active && status && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.8 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, scale: 0.8 }}
            className="absolute -top-8 whitespace-nowrap px-2.5 py-1 bg-slate-900 text-white text-[9px] font-bold rounded-full shadow-lg border border-slate-700 z-20"
          >
            {status}
            <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-slate-900 rotate-45 border-r border-b border-slate-700" />
          </motion.div>
        )}
      </AnimatePresence>

      <div className={`w-full p-2.5 sm:p-3.5 rounded-2xl backdrop-blur-xl bg-white/70 border ${c.border} shadow-xl transition-colors duration-300 ${active ? 'bg-white/95' : ''}`}>
        <div className="flex items-center gap-2.5">
          <div className={`w-8 h-8 sm:w-10 sm:h-10 shrink-0 rounded-xl flex items-center justify-center ${c.bg} ${c.text} ${active ? 'animate-pulse' : ''}`}>
            {icon}
          </div>
          <div>
            <h3 className="text-[10px] sm:text-xs font-black text-slate-800 leading-tight">{title}</h3>
            <p className="text-[8px] sm:text-[9px] font-bold text-slate-400 mt-0.5">{subtitle}</p>
          </div>
        </div>
      </div>
    </motion.div>
  )
}

function LivingEcosystem() {
  const [phase, setPhase] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setPhase((p) => (p + 1) % 6)
    }, 2800)
    return () => clearInterval(interval)
  }, [])

  const activeRetailerOut = phase === 0
  const activeEngineOut = phase === 1 || phase === 3
  const activeSupplierOut = phase === 2
  const activeLogisticsOut = phase === 4
  const activeRetailerToConsumer = phase === 5

  return (
    <div className="relative w-full aspect-[4/5] sm:aspect-square max-w-[600px] flex items-center justify-center mx-auto mt-0 lg:mt-0">

      {/* Background Ambient Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[60%] h-[60%] bg-indigo-500/10 blur-[80px] rounded-full pointer-events-none" />
      <div className="absolute top-1/4 right-1/4 w-[40%] h-[40%] bg-purple-500/10 blur-[60px] rounded-full pointer-events-none" />

      {/* Connection Lines & Data Flow */}
      <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="absolute inset-0 w-full h-full pointer-events-none z-0 overflow-visible" style={{ filter: 'drop-shadow(0 0 4px rgba(139, 92, 246, 0.4))' }}>
        <defs>
          <linearGradient id="retailer-engine" x1="0%" y1="100%" x2="100%" y2="0%"><stop offset="0%" stopColor="#3b82f6" stopOpacity="0.5" /><stop offset="100%" stopColor="#8b5cf6" stopOpacity="0.8" /></linearGradient>
          <linearGradient id="engine-supplier" x1="0%" y1="100%" x2="100%" y2="0%"><stop offset="0%" stopColor="#8b5cf6" stopOpacity="0.8" /><stop offset="100%" stopColor="#ec4899" stopOpacity="0.5" /></linearGradient>
          <linearGradient id="engine-logistics" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stopColor="#8b5cf6" stopOpacity="0.8" /><stop offset="100%" stopColor="#10b981" stopOpacity="0.5" /></linearGradient>
          <linearGradient id="logistics-retailer" x1="100%" y1="100%" x2="0%" y2="100%"><stop offset="0%" stopColor="#10b981" stopOpacity="0.8" /><stop offset="100%" stopColor="#3b82f6" stopOpacity="0.5" /></linearGradient>
          <linearGradient id="retailer-consumer" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stopColor="#3b82f6" stopOpacity="0.8" /><stop offset="100%" stopColor="#f59e0b" stopOpacity="0.5" /></linearGradient>
        </defs>

        <path d="M 15 75 Q 25 40 45 40" fill="none" stroke="url(#retailer-engine)" strokeWidth="0.4" strokeDasharray="1 1" opacity={0.3} />
        {activeRetailerOut && <circle r="1" fill="#60a5fa"><animateMotion dur="1.5s" repeatCount="indefinite" path="M 15 75 Q 25 40 45 40" /></circle>}

        <path d="M 45 40 Q 65 30 85 20" fill="none" stroke="url(#engine-supplier)" strokeWidth="0.4" strokeDasharray="1 1" opacity={0.3} />
        {phase === 1 && <circle r="1" fill="#c084fc"><animateMotion dur="1.5s" repeatCount="indefinite" path="M 45 40 Q 65 30 85 20" /></circle>}

        <path d="M 85 20 Q 65 45 45 40" fill="none" stroke="url(#engine-supplier)" strokeWidth="0.4" strokeDasharray="1 1" opacity={0.3} />
        {activeSupplierOut && <circle r="1" fill="#f472b6"><animateMotion dur="1.2s" repeatCount="indefinite" path="M 85 20 Q 65 45 45 40" /></circle>}

        <path d="M 45 40 Q 60 65 80 65" fill="none" stroke="url(#engine-logistics)" strokeWidth="0.4" strokeDasharray="1 1" opacity={0.3} />
        {phase === 3 && <circle r="1" fill="#34d399"><animateMotion dur="1.5s" repeatCount="indefinite" path="M 45 40 Q 60 65 80 65" /></circle>}

        <path d="M 80 65 Q 45 75 15 75" fill="none" stroke="url(#logistics-retailer)" strokeWidth="0.4" strokeDasharray="1 1" opacity={0.3} />
        {activeLogisticsOut && <circle r="1" fill="#10b981"><animateMotion dur="1.5s" repeatCount="indefinite" path="M 80 65 Q 45 75 15 75" /></circle>}

        <path d="M 15 75 Q 25 90 50 85" fill="none" stroke="url(#retailer-consumer)" strokeWidth="0.4" strokeDasharray="1 1" opacity={0.3} />
        {activeRetailerToConsumer && <circle r="1" fill="#fbbf24"><animateMotion dur="1s" repeatCount="indefinite" path="M 15 75 Q 25 90 50 85" /></circle>}
      </svg>

      {/* Nodes */}
      <NodeCard x={15} y={75} icon={<FiShoppingCart size={16} />} title="Retailer Hub" subtitle="Procurement" color="blue" active={phase === 0 || phase === 4 || phase === 5} status={phase === 0 ? "Publishing Req" : phase === 4 ? "Receiving Goods" : phase === 5 ? "Fulfilling Order" : ""} />

      <NodeCard x={45} y={40} icon={<FiCpu size={20} />} title="BazaarBid Core" subtitle="Reverse Auction Engine" color="purple" active={phase === 1 || phase === 2 || phase === 3} status={phase === 1 ? "Broadcasting..." : phase === 2 ? "Ranking Bids..." : phase === 3 ? "Order Confirmed" : ""} large />

      <NodeCard x={85} y={20} icon={<FiShield size={16} />} title="Supplier Net" subtitle="Verified Vendors" color="pink" active={phase === 1 || phase === 2} status={phase === 1 ? "Evaluating Req" : phase === 2 ? "Bidding (₹42/kg)" : ""} />

      <NodeCard x={80} y={65} icon={<FiTruck size={16} />} title="Logistics" subtitle="Fulfillment Fleet" color="emerald" active={phase === 3 || phase === 4} status={phase === 3 ? "Dispatching..." : phase === 4 ? "En Route" : ""} />

      <NodeCard x={50} y={85} icon={<FiUsers size={16} />} title="Consumer" subtitle="Local Shopper" color="amber" active={phase === 5} status={phase === 5 ? "Groceries Delivered!" : ""} />

    </div>
  )
}

const containerVariants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.1, delayChildren: 0.05 } },
}
const itemVariant = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] } },
}

export default function Hero() {
  return (
    <section className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
      <div className="grid lg:grid-cols-2 gap-4 lg:gap-4 min-h-[calc(100vh-100px)]">

        {/* ── Left Column ── */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="show"
          className="flex flex-col justify-center space-y-7"
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
          className="w-full flex items-center justify-center mr-20"
        >
          <LivingEcosystem />
        </motion.div>

      </div>
    </section>
  )
}
