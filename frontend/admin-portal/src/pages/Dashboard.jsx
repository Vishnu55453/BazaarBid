import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { toast } from 'react-hot-toast';
import { LogOut, CheckCircle, Shield } from 'lucide-react';

export default function Dashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [pendingUsers, setPendingUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPendingUsers();
  }, []);

  const fetchPendingUsers = async () => {
    try {
      const res = await api.get('/api/admin/users/pending');
      setPendingUsers(res.users);
    } catch (err) {
      toast.error('Failed to load pending users');
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (userId) => {
    try {
      await api.put(`/api/admin/users/${userId}/verify`);
      toast.success('User verified successfully!');
      setPendingUsers(prev => prev.filter(u => u._id !== userId));
    } catch (err) {
      toast.error('Verification failed');
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-indigo-100 p-2 rounded-lg">
              <Shield className="w-5 h-5 text-indigo-600" />
            </div>
            <h1 className="text-lg font-bold text-slate-900">Admin Console</h1>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm font-medium text-slate-600">{user?.name}</span>
            <button
              onClick={handleLogout}
              className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition"
              title="Logout"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-slate-900">Pending Verifications</h2>
          <p className="text-slate-500 mt-1">Review and approve new user registrations.</p>
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
          </div>
        ) : pendingUsers.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
            <div className="mx-auto w-16 h-16 bg-green-50 rounded-full flex items-center justify-center mb-4">
              <CheckCircle className="w-8 h-8 text-green-500" />
            </div>
            <h3 className="text-lg font-bold text-slate-900">All Caught Up!</h3>
            <p className="text-slate-500 mt-1">There are no pending verifications at the moment.</p>
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200">
                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">User Details</th>
                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Role</th>
                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Business Info</th>
                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {pendingUsers.map(user => (
                    <tr key={user._id} className="hover:bg-slate-50 transition">
                      <td className="px-6 py-4">
                        <div className="font-bold text-slate-900">{user.name}</div>
                        <div className="text-sm text-slate-500 mt-0.5">{user.email}</div>
                        <div className="text-sm text-slate-500">{user.phone}</div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-indigo-50 text-indigo-700">
                          {user.role.replace('_', ' ').toUpperCase()}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        {user.role === 'kirana_user' && (
                          <>
                            <div className="font-medium text-slate-700">{user.kiranaProfile?.asSeller?.shopName || 'N/A'}</div>
                            {user.kiranaProfile?.asBuyer?.gstNumber && (
                              <div className="text-xs text-slate-500 mt-1">GST: {user.kiranaProfile.asBuyer.gstNumber}</div>
                            )}
                          </>
                        )}
                        {user.role === 'big_market_seller' && (
                          <>
                            <div className="font-medium text-slate-700">{user.bigMarketProfile?.shopName || 'N/A'}</div>
                            <div className="text-xs text-slate-500 mt-1">Market: {user.bigMarketProfile?.marketName}</div>
                          </>
                        )}
                        {user.role === 'normal_buyer' && (
                          <div className="text-sm text-slate-500">Normal Consumer</div>
                        )}
                        {user.role === 'delivery_partner' && (
                          <>
                            <div className="font-medium text-slate-700">Driver</div>
                            <div className="text-xs text-slate-500 mt-1">License: {user.deliveryProfile?.licenseNumber || 'N/A'}</div>
                          </>
                        )}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button
                          onClick={() => handleVerify(user._id)}
                          className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold rounded-xl transition shadow-sm"
                        >
                          <CheckCircle className="w-4 h-4" />
                          Verify
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
