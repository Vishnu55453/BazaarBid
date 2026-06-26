import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Users, 
  FileCheck, 
  LineChart,
  Settings,
  ShieldAlert
} from 'lucide-react';

const Sidebar = ({ isOpen, toggleSidebar }) => {
  const navItems = [
    { name: 'Dashboard', path: '/', icon: LayoutDashboard },
    { name: 'User Approvals', path: '/approvals', icon: Users },
    { name: 'KYC Management', path: '/kyc', icon: FileCheck },
    { name: 'Platform Analytics', path: '/analytics', icon: LineChart },
    { name: 'Settings', path: '/settings', icon: Settings },
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
        fixed inset-y-0 left-0 z-30 w-64 h-full overflow-y-auto scrollbar-hide bg-slate-950 text-white transition-transform duration-300 ease-in-out lg:static lg:translate-x-0
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="flex items-center justify-center h-16 border-b border-slate-800">
          <span className="text-2xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-rose-400 to-orange-400 flex items-center gap-2">
            <ShieldAlert className="h-6 w-6 text-rose-500" />
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
                    ? 'bg-rose-600 text-white shadow-lg shadow-rose-600/20' 
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

        {/* System Status Indicator */}
        <div className="absolute bottom-0 w-full p-4 border-t border-slate-800 bg-slate-950/50">
          <div className="p-3 rounded-xl border bg-slate-900 border-slate-800 flex flex-col gap-1">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">System Health</span>
              <div className="flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-2 w-2 rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </div>
            </div>
            <p className="text-sm font-bold text-slate-300">
              All services operational
            </p>
          </div>
        </div>
      </div>
    </>
  );
};

export default Sidebar;
