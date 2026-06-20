import { useAuth } from '../../context/AuthContext';
import { Menu, User as UserIcon } from 'lucide-react';
import { useState } from 'react';
import NotificationBell from './NotificationBell';

const Header = ({ toggleSidebar }) => {
  const { user, logout } = useAuth();
  const [showDropdown, setShowDropdown] = useState(false);

  return (
    <header className="bg-white border-b border-gray-200 h-16 flex items-center justify-between px-4 sm:px-6 lg:px-8 z-10 sticky top-0">
      <div className="flex items-center">
        <button
          type="button"
          className="text-gray-500 hover:text-gray-700 focus:outline-none lg:hidden"
          onClick={toggleSidebar}
        >
          <Menu className="h-6 w-6" />
        </button>
        <div className="ml-4 lg:ml-0 flex items-center">
          <h1 className="text-xl font-bold text-blue-600 hidden sm:block">BazaarBid Seller Portal</h1>
        </div>
      </div>

      <div className="flex items-center space-x-4">
        <NotificationBell />

        <div className="relative">
          <button
            className="flex items-center space-x-2 focus:outline-none"
            onClick={() => setShowDropdown(!showDropdown)}
          >
            <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
              <UserIcon className="h-5 w-5" />
            </div>
            <div className="hidden md:block text-left">
              <p className="text-sm font-medium text-gray-700">{user?.name || 'Seller'}</p>
              <div className="flex items-center gap-1 mt-0.5">
                <p className="text-xs text-gray-500">{user?.bigMarketProfile?.shopName || 'Shop Name'}</p>
                <span className="text-yellow-500 text-[10px] ml-1">★</span>
                <span className="text-[10px] text-gray-500 font-bold">{user?.rating?.average || 0}</span>
                <span className="text-[9px] text-gray-400">({user?.rating?.count || 0})</span>
              </div>
            </div>
          </button>

          {showDropdown && (
            <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 ring-1 ring-black ring-opacity-5">
              <div className="px-4 py-2 border-b border-gray-100">
                <p className="text-sm text-gray-700 font-medium">{user?.name}</p>
                <p className="text-xs text-gray-500 truncate">{user?.email}</p>
              </div>
              <button
                onClick={logout}
                className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-50"
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
