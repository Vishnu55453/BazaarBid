import { motion, useTransform } from 'framer-motion'

const testimonials = [
  {
    name: 'Rajesh Kumar',
    role: 'Retail Buyer – Restaurant Chain',
    text: 'BazaarBid reduced our procurement costs by 35%. The reverse auction system ensures we always get competitive prices.',
    rating: 5,
    initial: 'RK',
    color: 'from-indigo-500 to-violet-600',
  },
  {
    name: 'Priya Singh',
    role: 'Seller – Vashi Market',
    text: 'Finally, a platform where we can directly reach retail buyers. Our monthly revenue increased by 50% in the first quarter.',
    rating: 5,
    initial: 'PS',
    color: 'from-sky-500 to-indigo-600',
  },
  {
    name: 'Amit Patel',
    role: 'Home Buyer – Mumbai',
    text: 'Fresh produce at amazing prices, delivered to my door. The quality and reliability are unmatched.',
    rating: 5,
    initial: 'AP',
    color: 'from-emerald-500 to-sky-600',
  },
]

const stars = (n) => Array.from({ length: n }, (_, i) => (
  <svg key={i} className="h-3.5 w-3.5 fill-amber-400 text-amber-400" viewBox="0 0 24 24">
    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
  </svg>
))

export default function Testimonials({ progress }) {
  const x = useTransform(progress, [0.15, 0.85], ['0%', '-40%'])
  return (
    <section className="w-full py-16 text-white" id="testimonials">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-14 text-center"
        >
          <p className="text-xs font-bold uppercase tracking-[0.28em] text-indigo-400">Client feedback</p>
          <h2 className="mt-4 text-3xl font-bold tracking-tight text-white sm:text-4xl">
            Trusted by buyers, retailers,{' '}
            <span className="bg-gradient-to-r from-amber-400 to-rose-400 bg-clip-text text-transparent">
              and sellers.
            </span>
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-base leading-7 text-slate-400">
            Hear how BazaarBid delivers consistent performance and trust across every role in the marketplace.
          </p>
        </motion.div>

        {/* Testimonials horizontal track */}
        <div className="relative mt-12 flex items-center">
          <motion.div style={{ x }} className="flex gap-6 pr-[50vw]">
            {testimonials.map((t, idx) => (
              <div
                key={idx}
                className="relative flex-shrink-0 w-[420px] overflow-hidden rounded-3xl border border-white/6 bg-white/[0.03] p-10 backdrop-blur-sm shadow-xl shadow-black/30 transition-transform duration-300 hover:-translate-y-2"
              >
                {/* Quote mark */}
                <div className="absolute right-8 top-8 text-7xl font-serif leading-none text-white/5 select-none">"</div>

                {/* Stars */}
                <div className="mb-8 flex gap-1">{stars(t.rating)}</div>

                <p className="text-base leading-8 text-slate-300">"{t.text}"</p>

                <div className="mt-10 flex items-center gap-4">
                  <div className={`flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br ${t.color} text-sm font-bold text-white shrink-0`}>
                    {t.initial}
                  </div>
                  <div>
                    <p className="text-base font-semibold text-white">{t.name}</p>
                    <p className="text-sm text-slate-500">{t.role}</p>
                  </div>
                  <div className="ml-auto rounded-xl border border-white/8 bg-white/5 px-3 py-1 text-sm font-bold text-amber-400">
                    5.0
                  </div>
                </div>
              </div>
            ))}
          </motion.div>
        </div>

      </div>
    </section>
  )
}
