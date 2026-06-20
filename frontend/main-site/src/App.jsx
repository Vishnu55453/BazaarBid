import { useRef } from 'react'
import { motion, useScroll, useTransform, useSpring } from 'framer-motion'
import Hero from './components/Hero'
import Features from './components/Features'
import PortalCTA from './components/PortalCTA'
import Testimonials from './components/Testimonials'
import Footer from './components/Footer'

// ─── Scroll progress bar ───────────────────────────────────────────────────────
function ScrollBar() {
  const { scrollYProgress } = useScroll()
  const scaleX = useSpring(scrollYProgress, { stiffness: 120, damping: 30 })
  return (
    <motion.div
      style={{ scaleX, transformOrigin: 'left' }}
      className="fixed top-0 left-0 right-0 z-[200] h-[2px] bg-gradient-to-r from-indigo-500 via-violet-500 to-purple-500"
    />
  )
}

// ─── Liquid Focal Dot ─────────────────────────────────────────────────────────
// Replicates the Zajno-style: dramatic diagonal weaving, per-section colour
// changes, and ambient blob scale-ups. Uses pixel values so useSpring works.
//
// Trajectory (matching Zajno analysis):
//   0%  → left:26%, top:48%  — hero left, indigo
//  12%  → left:72%, top:62%  — hero right card, violet  (diagonal ↘)
//  25%  → left:50%, top:44%  — features centre, BIG magenta blob  (↖)
//  40%  → left:20%, top:35%  — features left icon, emerald  (↙)
//  55%  → left:78%, top:65%  — portals right card, amber   (↘)
//  70%  → left:60%, top:32%  — portals header, cyan  (↗)
//  85%  → left:28%, top:42%  — testimonials left, rose BIG blob  (↙)
// 100%  → fade out
function FocalDot() {
  const { scrollYProgress } = useScroll()
  const W = typeof window !== 'undefined' ? window.innerWidth  : 1440
  const H = typeof window !== 'undefined' ? window.innerHeight : 900

  // ── X waypoints (pixels) ──
  const rawX = useTransform(
    scrollYProgress,
    [0,    0.06,  0.12,  0.20,  0.25,  0.33,  0.40,  0.48,  0.55,  0.63,  0.70,  0.78,  0.85,  0.93,  1.0],
    [
      W * 0.26,   // hero — left column text
      W * 0.48,   // hero — drifting towards centre
      W * 0.72,   // hero — right card
      W * 0.62,   // transitioning inward
      W * 0.50,   // features — dead centre (big blob)
      W * 0.35,   // features — moving left
      W * 0.20,   // features — left icon highlight
      W * 0.50,   // features→portals transition
      W * 0.78,   // portals — right card
      W * 0.70,   // portals — staying right
      W * 0.60,   // portals header
      W * 0.44,   // moving left
      W * 0.28,   // testimonials — left card (big blob)
      W * 0.40,   // fading out position
      W * 0.50,   // centre fade
    ]
  )

  // ── Y waypoints (pixels) ──
  const rawY = useTransform(
    scrollYProgress,
    [0,    0.06,  0.12,  0.20,  0.25,  0.33,  0.40,  0.48,  0.55,  0.63,  0.70,  0.78,  0.85,  0.93,  1.0],
    [
      H * 0.48,   // hero left mid
      H * 0.50,
      H * 0.62,   // hero right bottom
      H * 0.50,
      H * 0.44,   // features centre
      H * 0.40,
      H * 0.35,   // features left top
      H * 0.55,
      H * 0.65,   // portals right bottom
      H * 0.55,
      H * 0.32,   // portals header top
      H * 0.38,
      H * 0.42,   // testimonials mid-left
      H * 0.50,
      H * 0.60,
    ]
  )

  // ── Scale — big ambient blob at features-centre (0.25) and testimonials (0.85) ──
  const rawScale = useTransform(
    scrollYProgress,
    [0,   0.05, 0.20, 0.25, 0.35, 0.50, 0.80, 0.85, 0.92, 1.0],
    [0,   1,    0.9,  2.8,  1.0,  0.9,  0.9,  2.5,  1.0,  0]
  )

  // ── Opacity ──
  const rawOpacity = useTransform(scrollYProgress, [0, 0.04, 0.94, 1.0], [0, 1, 1, 0])

  // ── Colour stops — matching section themes ──
  // We animate the dot's colour by interpolating a CSS hue-rotate filter
  // and swapping background gradient via a colour MotionValue.
  const hue = useTransform(
    scrollYProgress,
    [0,    0.12,  0.25,  0.40,  0.55,  0.70,  0.85,  1.0],
    [240,  260,   300,   160,   40,    190,   340,   240]   // indigo→violet→magenta→emerald→amber→cyan→rose→indigo
  )

  // Spring physics — stiffness:90, damping:22 as requested
  const cfg = { stiffness: 90, damping: 22 }
  const x       = useSpring(rawX,       cfg)
  const y       = useSpring(rawY,       cfg)
  const scale   = useSpring(rawScale,   { stiffness: 60, damping: 18 })
  const opacity = useSpring(rawOpacity, { stiffness: 120, damping: 30 })
  const hueSpring = useSpring(hue,      { stiffness: 50, damping: 20 })

  // Derive hue-rotate filter string as a MotionValue
  const hueFilter = useTransform(hueSpring, h => `hue-rotate(${h - 240}deg)`)

  return (
    <motion.div
      style={{ left: x, top: y, scale, opacity }}
      className="pointer-events-none fixed z-30 -translate-x-1/2 -translate-y-1/2"
    >
      {/* Outer ambient glow — large, blurry, colour-reactive, breathing */}
      <motion.div
        animate={{ scale: [1, 1.5, 1], opacity: [0.18, 0.45, 0.18] }}
        transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut' }}
        style={{ width: 200, height: 200, left: -75, top: -75, filter: hueFilter }}
        className="absolute rounded-full bg-violet-500/20 blur-[60px]"
      />
      {/* Mid glow */}
      <motion.div
        animate={{ scale: [1, 1.25, 1] }}
        transition={{ duration: 2.2, repeat: Infinity, ease: 'easeInOut', delay: 0.3 }}
        style={{ width: 100, height: 100, left: -28, top: -28, filter: hueFilter }}
        className="absolute rounded-full bg-indigo-400/35 blur-2xl"
      />
      {/* Core dot — colour shifts via CSS hue-rotate on the indigo gradient */}
      <motion.div
        style={{ filter: hueFilter }}
        className="relative h-10 w-10 rounded-full bg-gradient-to-br from-indigo-300 via-violet-500 to-purple-600 shadow-[0_0_32px_rgba(139,92,246,0.8)]"
      />
      {/* Specular highlight */}
      <div className="absolute left-2 top-1.5 h-2.5 w-2.5 rounded-full bg-white/60 blur-[1.5px]" />
    </motion.div>
  )
}



// ─── One Pinned Section ───────────────────────────────────────────────────────
// noFade=true → always visible at load (Hero), only fades out when leaving.
function PinnedSection({ id, scrollBudget, children, noFade = false }) {
  const ref = useRef(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end start'] })

  // Always call both — pick the right one after (Rules of Hooks)
  const opacityFade   = useTransform(scrollYProgress, [0, 0.15, 0.78, 1.0], [0, 1, 1, 0])
  const opacityNoFade = useTransform(scrollYProgress, [0, 0.80, 1.0],        [1, 1, 0])
  const yFade         = useTransform(scrollYProgress, [0, 0.15, 0.78, 1.0],  [28, 0, 0, -28])
  const yNoFade       = useTransform(scrollYProgress, [0.80, 1.0],           [0, -28])

  const opacity = noFade ? opacityNoFade : opacityFade
  const y       = noFade ? yNoFade       : yFade

  return (
    <div
      id={id}
      ref={ref}
      style={{ height: `calc(100vh + ${scrollBudget}px)` }}
      className="relative"
    >
      <div className="sticky top-0 h-screen overflow-hidden">
        <motion.div
          style={{ opacity, y }}
          className="relative z-10 h-full w-full"
        >
          {typeof children === 'function' ? children(scrollYProgress) : children}
        </motion.div>
      </div>
    </div>
  )
}


// ─── Dark ambient background ───────────────────────────────────────────────────
function Background() {
  return (
    <div className="pointer-events-none fixed inset-0 z-0">
      <div className="absolute left-1/2 top-1/3 h-[55vw] w-[55vw] -translate-x-1/2 -translate-y-1/2 rounded-full bg-indigo-900/20 blur-[140px]" />
      <div className="absolute right-[5%]  top-[15%] h-[30vw] w-[30vw] rounded-full bg-violet-900/15 blur-[110px]" />
      <div className="absolute left-[8%] bottom-[20%] h-[25vw] w-[25vw] rounded-full bg-purple-900/12 blur-[90px]" />
      <div
        className="absolute inset-0 opacity-[0.028]"
        style={{
          backgroundImage:
            'linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)',
          backgroundSize: '52px 52px',
        }}
      />
    </div>
  )
}

// ─── App ──────────────────────────────────────────────────────────────────────
export default function App() {

  // Scroll past the fade-in zone of each pinned section (22% into the track)
  // so the content is immediately visible (opacity=1) when you land there.
  const scrollToSection = (id) => {
    const el = document.getElementById(id)
    if (!el) return
    const top    = el.offsetTop
    const height = el.offsetHeight
    // Jump to 22% into the section — past the 0→0.15 fade-in window
    window.scrollTo({ top: top + height * 0.22, behavior: 'smooth' })
  }

  return (
    <div className="bg-[#07080f] text-slate-100">
      <ScrollBar />
      <FocalDot />
      <Background />

      {/* Fixed Nav */}
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-white/5 bg-[#07080f]/80 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <button
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="bg-gradient-to-r from-indigo-400 to-violet-400 bg-clip-text text-xl font-bold text-transparent"
          >
            BazaarBid
          </button>
          <div className="hidden items-center gap-8 text-sm font-medium text-slate-400 md:flex">
            <button onClick={() => scrollToSection('features')}     className="transition hover:text-white">Features</button>
            <button onClick={() => scrollToSection('portals')}      className="transition hover:text-white">Portals</button>
            <button onClick={() => scrollToSection('testimonials')} className="transition hover:text-white">Testimonials</button>
            <button onClick={() => document.getElementById('footer')?.scrollIntoView({ behavior: 'smooth' })} className="transition hover:text-white">Contact</button>
          </div>
          <button
            onClick={() => scrollToSection('portals')}
            className="hidden rounded-full bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-500 md:inline-flex"
          >
            Get Started
          </button>
        </div>
      </nav>

      {/* ── FRAME 1: Hero — always visible at load, fades out on leave ── */}
      <PinnedSection id="hero" scrollBudget={600} noFade>
        <div className="flex h-screen w-full items-center justify-center px-4 sm:px-6 lg:px-8 pt-16">
          <Hero />
        </div>
      </PinnedSection>

      {/* ── FRAME 2: Features ── */}
      <PinnedSection id="features" scrollBudget={1600}>
        {(progress) => (
          <div className="flex h-screen w-full items-center overflow-hidden px-4 sm:px-6 lg:px-8">
            <div className="w-full max-w-7xl mx-auto">
              <Features progress={progress} />
            </div>
          </div>
        )}
      </PinnedSection>

      {/* ── FRAME 3: Portal CTA ── */}
      <PinnedSection id="portals" scrollBudget={1600}>
        {(progress) => (
          <div className="flex h-screen w-full items-center overflow-hidden px-4 sm:px-6 lg:px-8">
            <div className="w-full max-w-7xl mx-auto">
              <PortalCTA progress={progress} />
            </div>
          </div>
        )}
      </PinnedSection>

      {/* ── FRAME 4: Testimonials ── */}
      <PinnedSection id="testimonials" scrollBudget={1200}>
        {(progress) => (
          <div className="flex h-screen w-full items-center overflow-hidden px-4 sm:px-6 lg:px-8">
            <div className="w-full max-w-7xl mx-auto">
              <Testimonials progress={progress} />
            </div>
          </div>
        )}
      </PinnedSection>

      {/* Footer — normal document flow, outside all pins */}
      <Footer />
    </div>
  )
}

