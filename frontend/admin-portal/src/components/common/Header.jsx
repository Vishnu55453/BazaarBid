import { useAuth } from '../../context/AuthContext';
import { Menu, User as UserIcon, Bell } from 'lucide-react';
import { useState } from 'react';

const Header = ({ toggleSidebar }) => {
  const { user, logout } = useAuth();
  const [showDropdown, setShowDropdown] = useState(false);

  return (
    <header className="bg-white border-b border-slate-200 h-16 flex items-center justify-between px-4 sm:px-6 lg:px-8 z-10 sticky top-0">
      <div className="flex items-center">
        <button
          type="button"
          className="text-slate-500 hover:text-slate-700 focus:outline-none lg:hidden"
          onClick={toggleSidebar}
        >
          <Menu className="h-6 w-6" />
        </button>
        <div className="ml-4 lg:ml-0 flex items-center">
          <h1 className="text-xl font-bold text-rose-600 hidden sm:block">Admin Console</h1>
        </div>
      </div>

      <div className="flex items-center space-x-4">
        <button className="p-2 text-slate-400 hover:text-slate-500">
          <span className="sr-only">View notifications</span>
          <Bell className="h-6 w-6" aria-hidden="true" />
        </button>

        <div className="relative">
          <button
            className="flex items-center space-x-2 focus:outline-none"
            onClick={() => setShowDropdown(!showDropdown)}
          >
            <div className="h-8 w-8 rounded-full bg-rose-100 flex items-center justify-center text-rose-600">
              <UserIcon className="h-5 w-5" />
            </div>
            <div className="hidden md:block text-left">
              <p className="text-sm font-medium text-slate-700">{user?.name || 'Administrator'}</p>
              <div className="flex items-center gap-1 mt-0.5">
                <p className="text-xs text-slate-500">Super Admin</p>
              </div>
            </div>
          </button>

          {showDropdown && (
            <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 ring-1 ring-black ring-opacity-5">
              <div className="px-4 py-2 border-b border-slate-100">
                <p className="text-sm text-slate-700 font-medium">{user?.name}</p>
                <p className="text-xs text-slate-500 truncate">{user?.email}</p>
              </div>
              <button
                onClick={logout}
                className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-slate-50 font-medium"
              >
                Sign out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
