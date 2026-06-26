import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Truck, 
  MapPin, 
  Banknote,
  UserCircle
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const Sidebar = ({ isOpen, toggleSidebar }) => {
  const { user } = useAuth();
  
  const navItems = [
    { name: 'Dashboard', path: '/', icon: LayoutDashboard },
    { name: 'My Vehicles', path: '/vehicles', icon: Truck },
    { name: 'Delivery Requests', path: '/requests', icon: MapPin },
    { name: 'Earnings', path: '/earnings', icon: Banknote },
    { name: 'Profile', path: '/profile', icon: UserCircle },
  ];

  return (
    <>
      {/* Mobile sidebar backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-20 bg-slate-900 bg-opacity-75 lg:hidden"
          onClick={toggleSidebar}
        ></div>
      )}

      {/* Sidebar */}
      <div className={`
        fixed inset-y-0 left-0 z-30 w-64 h-full overflow-y-auto scrollbar-hide bg-slate-900 text-white transition-transform duration-300 ease-in-out lg:static lg:translate-x-0
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="flex items-center justify-center h-16 border-b border-slate-800">
          <span className="text-2xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-cyan-400 flex items-center gap-2">
            <Truck className="h-6 w-6 text-indigo-400" />
            BazaarBid
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
                  flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-colors
                  ${isActive 
                    ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20' 
                    : 'text-slate-400 hover:bg-slate-800 hover:text-white'
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

        {/* Status Indicator */}
        <div className="absolute bottom-0 w-full p-4 border-t border-slate-800 bg-slate-900/50">
          <div className="p-3 rounded-xl border bg-slate-800 border-slate-700 flex flex-col gap-1">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Status</span>
              <div className="h-2 w-2 rounded-full bg-emerald-500"></div>
            </div>
            <p className="text-sm font-bold text-emerald-400">
              Available for delivery
            </p>
          </div>
        </div>
      </div>
    </>
  );
};

export default Sidebar;
