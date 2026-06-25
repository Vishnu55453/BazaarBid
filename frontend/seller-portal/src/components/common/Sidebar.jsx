import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Gavel, 
  ListOrdered, 
  Trophy, 
  Package, 
  UserCircle,
  BarChart2,
  Crown
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const Sidebar = ({ isOpen, toggleSidebar }) => {
  const { user } = useAuth();
  
  const navItems = [
    { name: 'Dashboard', path: '/', icon: LayoutDashboard },
    { name: 'Analytics', path: '/analytics', icon: BarChart2 },
    { name: 'Open Auctions', path: '/auctions', icon: Gavel },
    { name: 'My Bids', path: '/bids', icon: ListOrdered },
    { name: 'Won Auctions', path: '/won-auctions', icon: Trophy },
    { name: 'Bulk Orders', path: '/orders', icon: Package },
    { name: 'Profile', path: '/profile', icon: UserCircle },
  ];

  return (
    <>
      {/* Mobile sidebar backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-20 bg-gray-600 bg-opacity-75 lg:hidden"
          onClick={toggleSidebar}
        ></div>
      )}

      {/* Sidebar */}
      <div className={`
        fixed inset-y-0 left-0 z-30 w-64 h-full overflow-y-auto scrollbar-hide bg-slate-900 text-white transition-transform duration-300 ease-in-out lg:static lg:translate-x-0
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="flex items-center justify-center h-16 border-b border-slate-800">
          <span className="text-2xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-emerald-400">
            Big Market
          </span>
        </div>

        <nav className="mt-6 px-4 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.name}
                to={item.path}
                className={({ isActive }) => `
                  flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors
                  ${isActive 
                    ? 'bg-blue-600 text-white' 
                    : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                  }
                `}
                onClick={() => {
                  if (window.innerWidth < 1024) toggleSidebar();
                }}
              >
                <Icon className="mr-3 h-5 w-5 flex-shrink-0" />
                {item.name}
              </NavLink>
            );
          })}
        </nav>

        {/* Subscription Plan Status */}
        {user && user.subscription && (
          <div className="absolute bottom-0 w-full p-4 border-t border-slate-800 bg-slate-900/50">
            <div className={`p-3 rounded-lg border flex flex-col gap-2 ${
              user.subscription.planCode === 'premium_seller' 
                ? 'bg-gradient-to-r from-amber-500/10 to-amber-600/10 border-amber-500/20' 
                : 'bg-slate-800 border-slate-700'
            }`}>
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Current Plan</span>
                {user.subscription.planCode === 'premium_seller' && (
                  <Crown className="w-4 h-4 text-amber-400" />
                )}
              </div>
              <p className={`text-sm font-bold ${
                user.subscription.planCode === 'premium_seller' ? 'text-amber-400' : 'text-slate-300'
              }`}>
                {user.subscription.planCode === 'premium_seller' ? 'Premium Supplier' : 'Free Supplier'}
              </p>
              
              {user.subscription.planCode === 'free_seller' && (
                <button 
                  onClick={() => window.location.href = '/profile'}
                  className="mt-1 w-full bg-slate-700 hover:bg-slate-600 text-white text-xs font-bold py-1.5 rounded transition-colors"
                >
                  Upgrade Plan
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default Sidebar;
