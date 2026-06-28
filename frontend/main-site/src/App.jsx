import { motion } from 'framer-motion'
import Hero from './components/Hero'
import Features from './components/Features'
import PortalCTA from './components/PortalCTA'
import Pricing from './components/Pricing'
import Testimonials from './components/Testimonials'
import Footer from './components/Footer'

// ─── App ──────────────────────────────────────────────────────────────────────
export default function App() {

  const scrollToSection = (id) => {
    const el = document.getElementById(id)
    if (!el) return
    const top = el.offsetTop
    window.scrollTo({ top: top - 80, behavior: 'smooth' }) // -80px to account for fixed nav
  }

  return (
    <div className="bg-slate-50 text-slate-900 min-h-screen relative overflow-x-hidden">

      {/* Ambient background colors for light mode */}
      <div className="pointer-events-none fixed inset-0 z-0 bg-slate-50">
        <div className="absolute left-1/2 top-1/4 h-[55vw] w-[55vw] -translate-x-1/2 -translate-y-1/2 rounded-full bg-indigo-100/50 blur-[120px]" />
        <div className="absolute right-[-10%] top-[20%] h-[40vw] w-[40vw] rounded-full bg-purple-100/60 blur-[120px]" />
        <div className="absolute left-[-10%] bottom-[10%] h-[45vw] w-[45vw] rounded-full bg-blue-100/50 blur-[120px]" />
        <div
          className="absolute inset-0 opacity-[0.4]"
          style={{
            backgroundImage:
              'linear-gradient(rgba(148, 163, 184, 0.15) 1px, transparent 1px), linear-gradient(90deg, rgba(148, 163, 184, 0.15) 1px, transparent 1px)',
            backgroundSize: '52px 52px',
          }}
        />
      </div>

      {/* Fixed Nav - Light Mode */}
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-slate-200/50 bg-white/70 backdrop-blur-xl shadow-sm">
        <div className="mx-auto flex h-20 max-w-8xl items-center justify-between px-4 sm:px-16 lg:px-32">
          <button
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="flex items-center gap-2"
          >
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center text-white font-bold text-xl shadow-md">
              B
            </div>
            <span className="text-xl font-extrabold text-slate-900 tracking-tight">
              BazaarBid
            </span>
          </button>

          <div className="hidden items-center gap-8 text-sm font-bold text-slate-500 md:flex">
            <button onClick={() => scrollToSection('features')} className="transition hover:text-indigo-600">Features</button>
            <button onClick={() => scrollToSection('portals')} className="transition hover:text-indigo-600">Portals</button>
            <button onClick={() => scrollToSection('pricing')} className="transition hover:text-indigo-600">Pricing</button>
            <button onClick={() => scrollToSection('testimonials')} className="transition hover:text-indigo-600">Testimonials</button>
          </div>

          <div className="hidden items-center gap-4 md:flex">
            <button
              onClick={() => document.getElementById('footer')?.scrollIntoView({ behavior: 'smooth' })}
              className="text-sm font-bold text-slate-600 hover:text-indigo-600 transition"
            >
              Contact
            </button>
            <button
              onClick={() => scrollToSection('portals')}
              className="rounded-full bg-slate-900 px-6 py-2.5 text-sm font-bold text-white transition hover:bg-slate-800 shadow-lg shadow-slate-200"
            >
              Get Started
            </button>
          </div>
        </div>
      </nav>

      {/* Main Content Sections - Standard Flow */}
      <div className="relative z-10 flex flex-col pt-12 pb-20 gap-32">
        <div id="hero" className="w-full flex justify-center px-4 sm:px-6 lg:px-8 pt-8">
          <Hero />
        </div>

        <div id="features" className="w-full relative z-10">
          <Features />
        </div>

        <div id="portals" className="w-full relative z-10">
          <PortalCTA />
        </div>

        <div id="pricing" className="w-full relative z-10">
          <Pricing />
        </div>

        <div id="testimonials" className="w-full relative z-10">
          <Testimonials />
        </div>
      </div>

      {/* Footer — normal document flow, outside all pins */}
      <Footer />
    </div>
  )
}

