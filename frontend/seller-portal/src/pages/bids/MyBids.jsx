import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Gavel, Clock, MapPin, CheckCircle, XCircle } from 'lucide-react';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import Loader from '../../components/common/Loader';
import StatusBadge from '../../components/common/StatusBadge';

const MyBids = () => {
  const { user } = useAuth();
  const [bids, setBids] = useState([]);
  const [stats, setStats] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchBids = async () => {
      try {
        setIsLoading(true);
        const res = await api.get('/api/bids/my-bids');
        if (res.success) {
          setBids(res.bids || []);
          setStats(res.stats);
        }
      } catch (err) {
        setError(err.message || 'Failed to load your bids');
      } finally {
        setIsLoading(false);
      }
    };

    fetchBids();
  }, []);

  if (isLoading) return <Loader text="Loading your bids..." />;

  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold text-gray-900">My Bids</h1>
          {user?.features?.hasPremiumBadge && (
            <span className="flex items-center gap-1 bg-gradient-to-r from-amber-100 to-yellow-100 text-amber-700 text-[10px] px-2.5 py-1 rounded-full font-bold uppercase tracking-wider border border-amber-200 shadow-sm">
              ★ Premium Supplier
            </span>
          )}
        </div>
        <p className="text-gray-500 text-sm mt-1">Track the status of all your active and past bids.</p>
      </div>

      {/* Stats Summary */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex items-center">
            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 mr-3">
              <Gavel className="w-5 h-5" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Total Bids</p>
              <p className="text-xl font-bold text-gray-900">{stats.totalBids}</p>
            </div>
          </div>
          <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex items-center">
            <div className="w-10 h-10 rounded-full bg-yellow-100 flex items-center justify-center text-yellow-600 mr-3">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Active</p>
              <p className="text-xl font-bold text-gray-900">{stats.activeBids}</p>
            </div>
          </div>
          <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex items-center">
            <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center text-green-600 mr-3">
              <CheckCircle className="w-5 h-5" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Won</p>
              <p className="text-xl font-bold text-gray-900">{stats.wonAuctions}</p>
            </div>
          </div>
          <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex items-center">
            <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center text-red-600 mr-3">
              <XCircle className="w-5 h-5" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Lost</p>
              <p className="text-xl font-bold text-gray-900">{stats.totalBids - stats.activeBids - stats.wonAuctions}</p>
            </div>
          </div>
        </div>
      )}

      {error && (
        <div className="bg-red-50 text-red-600 p-4 rounded-lg border border-red-200">
          {error}
        </div>
      )}

      {/* Bids List */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {bids.length === 0 && !isLoading && !error ? (
          <div className="text-center py-12">
            <Gavel className="mx-auto h-12 w-12 text-gray-300 mb-3" />
            <h3 className="text-lg font-medium text-gray-900">No bids placed yet</h3>
            <p className="text-gray-500 mt-1 mb-4">You haven't participated in any auctions.</p>
            <Link to="/auctions" className="text-blue-600 font-medium hover:underline">
              Browse Open Auctions
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Product & Auction</th>
                  <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Your Bid</th>
                  <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Date</th>
                  <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {bids.map((bid) => {
                  const auction = bid.auctionId;
                  const firstAuctionItem = auction?.items?.[0] || {};
                  const itemCount = auction?.items?.length || 0;
                  const productName = itemCount > 1 
                    ? `${firstAuctionItem.productName} + ${itemCount - 1} more` 
                    : (firstAuctionItem.productName || 'Unknown Product');
                  const quantity = firstAuctionItem.quantity || 0;
                  const unit = firstAuctionItem.unit || '';
                  
                  const totalBidValue = bid.totalBidValue || 0;
                  const firstBidItem = bid.bidItems?.[0] || {};
                  const pricePerUnit = firstBidItem.pricePerUnit || 0;

                  return (
                    <tr key={bid._id} className="hover:bg-gray-50/50 transition">
                      <td className="px-6 py-4">
                        <div className="font-semibold text-gray-900">{productName}</div>
                        <div className="text-xs text-gray-500 flex items-center mt-1">
                          {quantity} {unit} {itemCount > 1 ? '(First Item)' : ''} • 
                          <MapPin className="w-3 h-3 mx-1 inline" /> {auction?.deliveryAddress?.city || 'N/A'}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="font-bold text-gray-900">₹{totalBidValue.toLocaleString()}</div>
                        <div className="text-xs text-gray-500 mt-1">
                          ₹{pricePerUnit}/{unit} {itemCount > 1 ? '(First Item)' : ''} • {bid.deliveryTimeline} days
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <StatusBadge status={bid.status} type="bid" />
                        {auction?.status === 'closed' && bid.status === 'active' && (
                          <span className="block text-xs text-red-500 mt-1">Auction Closed</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {new Date(bid.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 text-sm font-medium">
                        {auction ? (
                          <Link to={`/auctions/${auction._id}`} className="text-blue-600 hover:text-blue-900">
                            {bid.status === 'active' && auction.status === 'open' ? 'Update Bid' : 'View'}
                          </Link>
                        ) : (
                          <span className="text-gray-400">Unavailable</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default MyBids;
