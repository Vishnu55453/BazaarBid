import { motion } from 'framer-motion'
import { FiMail, FiPhone, FiMapPin } from 'react-icons/fi'
import { FaTwitter, FaLinkedin, FaFacebook, FaInstagram } from 'react-icons/fa'

const footerLinks = {
  Product: ['Features', 'Pricing', 'Security', 'Enterprise'],
  Company: ['About', 'Blog', 'Careers', 'Press'],
  Legal: ['Privacy', 'Terms', 'Compliance', 'Cookies'],
  Support: ['Help Center', 'Contact', 'Status', 'Docs'],
}

export default function Footer() {
  return (
    <footer id="footer" className="border-t border-white/5 bg-[#07080f] text-white">

      {/* Newsletter band */}
      <div className="bg-gradient-to-r from-violet-700 via-purple-700 to-indigo-700 py-16">
        <div className="mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
          <h3 className="text-3xl font-bold">Stay Updated</h3>
          <p className="mt-4 text-base text-white/80">
            Get the latest market trends and auction updates delivered to your inbox.
          </p>
          <div className="mx-auto mt-8 flex max-w-md gap-3">
            <input
              type="email"
              placeholder="Enter your email"
              className="flex-1 rounded-xl bg-white/10 px-4 py-3 text-sm text-white placeholder-white/40 ring-1 ring-white/10 outline-none focus:ring-2 focus:ring-white/30"
            />
            <motion.button
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.96 }}
              className="rounded-xl bg-white px-6 py-3 text-sm font-bold text-violet-700 transition hover:bg-violet-50"
            >
              Subscribe
            </motion.button>
          </div>
        </div>
      </div>

      {/* Main footer body */}
      <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="mb-12 grid grid-cols-1 gap-12 md:grid-cols-5">

          {/* Brand */}
          <div className="md:col-span-1">
            <h4 className="bg-gradient-to-r from-violet-400 to-indigo-400 bg-clip-text text-2xl font-bold text-transparent">
              BazaarBid
            </h4>
            <p className="mt-4 text-sm leading-relaxed text-slate-500">
              Revolutionizing wholesale marketplace with reverse auction technology.
            </p>
            <div className="mt-6 flex gap-4">
              {[FaTwitter, FaLinkedin, FaFacebook, FaInstagram].map((Icon, idx) => (
                <motion.button
                  key={idx}
                  whileHover={{ scale: 1.2, color: '#a855f7' }}
                  className="text-slate-600 transition hover:text-violet-400"
                >
                  <Icon className="h-4 w-4" />
                </motion.button>
              ))}
            </div>
          </div>

          {/* Link columns */}
          {Object.entries(footerLinks).map(([category, links], idx) => (
            <div key={idx}>
              <h5 className="mb-4 text-sm font-semibold text-white">{category}</h5>
              <ul className="space-y-3">
                {links.map((link, lidx) => (
                  <li key={lidx}>
                    <a
                      href="#"
                      className="text-sm text-slate-500 transition hover:text-violet-400"
                    >
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Contact row */}
        <div className="grid grid-cols-1 gap-8 border-y border-white/5 py-12 md:grid-cols-3">
          {[
            { icon: FiPhone,  label: 'Phone',   value: '+91 98765 43210' },
            { icon: FiMail,   label: 'Email',   value: 'contact@bazaarbid.com' },
            { icon: FiMapPin, label: 'Address', value: 'Mumbai, India' },
          ].map(({ icon: Icon, label, value }, idx) => (
            <div key={idx} className="flex items-center gap-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-500/15 text-violet-400">
                <Icon className="h-4 w-4" />
              </div>
              <div>
                <p className="text-xs text-slate-500">{label}</p>
                <p className="text-sm font-semibold text-white">{value}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Copyright */}
        <div className="pt-8 text-center">
          <p className="text-sm text-slate-600">
            © 2026 BazaarBid. All rights reserved.{' '}|{' '}
            <a href="#" className="text-violet-500 transition hover:text-violet-400">Privacy Policy</a>
            {' '}|{' '}
            <a href="#" className="text-violet-500 transition hover:text-violet-400">Terms of Service</a>
          </p>
        </div>
      </div>
    </footer>
  )
}
