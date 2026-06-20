import { NavLink } from 'react-router-dom'

// High-fidelity custom SVG icons for each navigation item
const navItems = [
  {
    label: 'Products',
    to: '/products',
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
      </svg>
    )
  },
  {
    label: 'Cart',
    to: '/cart',
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
      </svg>
    )
  },
  {
    label: 'Orders',
    to: '/orders',
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
      </svg>
    )
  },
  {
    label: 'Sellers',
    to: '/sellers',
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
      </svg>
    )
  },
  {
    label: 'Profile',
    to: '/profile',
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
      </svg>
    )
  }
]

export default function Sidebar() {
  return (
    <aside className="hidden md:flex flex-col w-64 h-[calc(100vh-4rem)] overflow-y-auto scrollbar-hide bg-slate-900 text-white border-r border-slate-800 py-6 px-4 sticky top-16 justify-between select-none">
      <div className="flex flex-col gap-6">
        {/* Navigation Items */}
        <nav className="flex flex-col gap-1.5">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors ${
                  isActive
                    ? 'bg-blue-600 text-white'
                    : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                }`
              }
            >
              <span className="mr-3 h-5 w-5 flex-shrink-0">
                {item.icon}
              </span>
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>
      </div>

      {/* Decorative Premium Widget at the bottom */}
      <div className="mt-auto px-2 pt-6">
        <div className="relative overflow-hidden rounded-2xl bg-slate-800 p-4 border border-slate-700">
          <div className="absolute -right-6 -bottom-6 w-20 h-20 bg-blue-500/10 rounded-full blur-xl" />
          <div className="absolute -left-6 -top-6 w-16 h-16 bg-violet-500/10 rounded-full blur-lg" />

          <div className="relative z-10 flex flex-col gap-2">
            <span className="flex items-center gap-1.5 text-xs font-semibold text-blue-400 bg-blue-400/10 w-fit px-2 py-0.5 rounded-full">
              ✨ Pro Experience
            </span>
            <p className="text-xs font-bold text-white mt-1">BazaarBid Portal</p>
            <p className="text-[11px] text-slate-400 leading-normal">
              Enjoy lightning-fast bidding, secure transactions, and verified local sellers.
            </p>
          </div>
        </div>
      </div>
    </aside>
  )
}

