import { NavLink } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'

const mainItems = [
  {
    label: 'Dashboard',
    to: '/',
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
      </svg>
    )
  }
]

const buyerItems = [
  {
    label: 'My Auctions',
    to: '/buyer/auctions',
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
      </svg>
    )
  },
  {
    label: 'Create Auction',
    to: '/buyer/create-auction',
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    )
  },
  {
    label: 'Bought Inventory',
    to: '/seller/inventory',
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16.01H9" />
      </svg>
    )
  },
  {
    label: 'Market Insights',
    to: '/buyer/insights',
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
      </svg>
    )
  }
]

const sellerItems = [
  {
    label: 'Analytics',
    to: '/seller/analytics',
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
      </svg>
    )
  },
  {
    label: 'Active Listings',
    to: '/seller/products',
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
      </svg>
    )
  },
  {
    label: 'Add Retail Product',
    to: '/seller/add-product',
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
      </svg>
    )
  },
  {
    label: 'Orders Received',
    to: '/seller/orders',
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
      </svg>
    )
  }
]

const profileItems = [
  {
    label: 'Shop Profile',
    to: '/profile',
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
      </svg>
    )
  }
]

export default function Sidebar() {
  const { user } = useAuth();

  const renderList = (title, items) => (
    <div className="flex flex-col gap-2">
      {title && (
        <div className="px-3 mt-4">
          <p className="text-[10px] font-bold tracking-[0.2em] text-slate-400 uppercase">
            {title}
          </p>
        </div>
      )}
      <nav className="flex flex-col gap-1">
        {items.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === '/'}
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
  )

  return (
    <aside className="hidden md:flex flex-col w-64 h-[calc(100vh-4rem)] overflow-y-auto scrollbar-hide bg-slate-900 text-white border-r border-slate-800 py-6 px-4 sticky top-16 justify-between select-none">
      <div className="flex flex-col gap-4">
        {renderList(null, mainItems)}
        
        {/* Buyer Section */}
        {renderList('Bulk Buyer (Wholesale)', buyerItems)}

        {/* Seller Section */}
        {renderList('Retail Seller (Shop)', sellerItems)}

        {/* Account Section */}
        {renderList('Settings', profileItems)}
      </div>

      {/* Subscription Plan Status */}
      {user && user.subscription && (
        <div className="mt-auto px-2 pt-6">
          <div className={`relative overflow-hidden rounded-2xl p-4 border flex flex-col gap-2 ${
            user.subscription.planCode === 'premium_buyer' 
              ? 'bg-gradient-to-r from-amber-500/10 to-amber-600/10 border-amber-500/20' 
              : 'bg-slate-800 border-slate-700'
          }`}>
            <div className="flex items-center justify-between relative z-10">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Current Plan</span>
              {user.subscription.planCode === 'premium_buyer' && (
                <svg className="w-4 h-4 text-amber-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 2a1 1 0 011 1v1.323l3.954 1.582 1.599-.8a1 1 0 01.894 1.79l-1.233.616 1.738 5.42a1 1 0 01-.285 1.05A3.989 3.989 0 0115 15a3.989 3.989 0 01-2.667-1.019 1 1 0 01-.285-1.05l1.715-5.349L11 6.477V16h2a1 1 0 110 2H7a1 1 0 110-2h2V6.477L6.237 7.582l1.715 5.349a1 1 0 01-.285 1.05A3.989 3.989 0 015 15a3.989 3.989 0 01-2.667-1.019 1 1 0 01-.285-1.05l1.738-5.42-1.233-.617a1 1 0 01.894-1.788l1.599.799L9 4.323V3a1 1 0 011-1z" clipRule="evenodd" />
                </svg>
              )}
            </div>
            <p className={`text-sm font-bold relative z-10 ${
              user.subscription.planCode === 'premium_buyer' ? 'text-amber-400' : 'text-slate-300'
            }`}>
              {user.subscription.planCode === 'premium_buyer' ? 'Premium Retailer' : 'Free Retailer'}
            </p>
            
            {user.subscription.planCode === 'free_buyer' && (
              <button 
                onClick={() => window.location.href = '/profile'}
                className="relative z-10 mt-1 w-full bg-slate-700 hover:bg-slate-600 text-white text-xs font-bold py-1.5 rounded transition-colors"
              >
                Upgrade Plan
              </button>
            )}
          </div>
        </div>
      )}
    </aside>
  )
}
