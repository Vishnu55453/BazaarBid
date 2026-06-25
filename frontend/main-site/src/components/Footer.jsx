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
    <footer id="footer" className="border-t border-slate-200 bg-white text-slate-900 relative z-50">

      {/* Newsletter band */}
      <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-fuchsia-600 py-16 text-white shadow-inner">
        <div className="mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
          <h3 className="text-3xl font-bold">Stay Updated</h3>
          <p className="mt-4 text-base text-indigo-50 font-medium">
            Get the latest market trends and auction updates delivered to your inbox.
          </p>
          <div className="mx-auto mt-8 flex max-w-md gap-3">
            <input
              type="email"
              placeholder="Enter your email"
              className="flex-1 rounded-xl bg-white/10 px-4 py-3 text-sm text-white placeholder-indigo-200 ring-1 ring-white/20 outline-none focus:ring-2 focus:ring-white/50 backdrop-blur-sm"
            />
            <motion.button
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.96 }}
              className="rounded-xl bg-white px-6 py-3 text-sm font-bold text-indigo-700 transition hover:bg-indigo-50 shadow-md"
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
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center text-white font-bold text-xl shadow-md">
                B
              </div>
              <h4 className="text-2xl font-extrabold text-slate-900 tracking-tight">
                BazaarBid
              </h4>
            </div>
            <p className="mt-4 text-sm leading-relaxed text-slate-500 font-medium">
              Revolutionizing wholesale marketplace with reverse auction technology.
            </p>
            <div className="mt-6 flex gap-4">
              {[FaTwitter, FaLinkedin, FaFacebook, FaInstagram].map((Icon, idx) => (
                <motion.button
                  key={idx}
                  whileHover={{ scale: 1.2, color: '#4f46e5' }}
                  className="text-slate-400 transition hover:text-indigo-600"
                >
                  <Icon className="h-4 w-4" />
                </motion.button>
              ))}
            </div>
          </div>

          {/* Link columns */}
          {Object.entries(footerLinks).map(([category, links], idx) => (
            <div key={idx}>
              <h5 className="mb-4 text-sm font-bold text-slate-900">{category}</h5>
              <ul className="space-y-3">
                {links.map((link, lidx) => (
                  <li key={lidx}>
                    <a
                      href="#"
                      className="text-sm text-slate-500 font-medium transition hover:text-indigo-600"
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
        <div className="grid grid-cols-1 gap-8 border-y border-slate-200 py-12 md:grid-cols-3">
          {[
            { icon: FiPhone,  label: 'Phone',   value: '+91 98765 43210' },
            { icon: FiMail,   label: 'Email',   value: 'contact@bazaarbid.com' },
            { icon: FiMapPin, label: 'Address', value: 'Mumbai, India' },
          ].map(({ icon: Icon, label, value }, idx) => (
            <div key={idx} className="flex items-center gap-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 border border-indigo-100 shadow-sm">
                <Icon className="h-4 w-4" />
              </div>
              <div>
                <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">{label}</p>
                <p className="text-sm font-bold text-slate-900">{value}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Copyright */}
        <div className="pt-8 text-center">
          <p className="text-sm text-slate-500 font-medium">
            © 2026 BazaarBid. All rights reserved.{' '}|{' '}
            <a href="#" className="text-indigo-600 transition hover:text-indigo-700">Privacy Policy</a>
            {' '}|{' '}
            <a href="#" className="text-indigo-600 transition hover:text-indigo-700">Terms of Service</a>
          </p>
        </div>
      </div>
    </footer>
  )
}
