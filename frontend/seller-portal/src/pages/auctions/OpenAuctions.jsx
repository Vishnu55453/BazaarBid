import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, Filter, Clock, Package, MapPin, Gavel } from 'lucide-react';
import api from '../../services/api';
import Loader from '../../components/common/Loader';

const OpenAuctions = () => {
  const navigate = useNavigate();
  const [auctions, setAuctions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');

  useEffect(() => {
    const fetchAuctions = async () => {
      try {
        setIsLoading(true);
        const res = await api.get('/api/auctions/open', { limit: 100 });
        if (res.success) {
          setAuctions(res.auctions || []);
        }
      } catch (err) {
        setError(err.message || 'Failed to load auctions');
      } finally {
        setIsLoading(false);
      }
    };

    fetchAuctions();
  }, []);

  const filteredAuctions = auctions.filter(auction => {
    const productName = auction.items?.[0]?.productName || auction.productName || '';
    const category = auction.items?.[0]?.category || auction.category || '';
    const matchesSearch = productName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter ? category === categoryFilter : true;
    return matchesSearch && matchesCategory;
  });

  const categories = [...new Set(auctions.map(a => a.items?.[0]?.category || a.category).filter(Boolean))];

  if (isLoading) return <Loader text="Loading open auctions..." />;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Open Auctions</h1>
          <p className="text-gray-500 text-sm mt-1">Discover and bid on bulk requirements from Kirana users.</p>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search products..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div className="relative w-full md:w-64">
          <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none bg-white"
          >
            <option value="">All Categories</option>
            {categories.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 text-red-600 p-4 rounded-lg border border-red-200">
          {error}
        </div>
      )}

      {/* Auctions Table */}
      {filteredAuctions.length === 0 && !isLoading && !error ? (
        <div className="text-center py-16 bg-white rounded-xl shadow-sm border border-gray-100">
          <Package className="mx-auto h-12 w-12 text-gray-400 mb-3" />
          <h3 className="text-lg font-medium text-gray-900">No open auctions found</h3>
          <p className="text-gray-500 mt-1">Check back later for new bulk requirements.</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse table-fixed min-w-[800px]">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200 text-xs uppercase tracking-wider text-gray-500 font-semibold">
                  <th className="px-6 py-4 whitespace-nowrap w-[25%]">Product</th>
                  <th className="px-6 py-4 whitespace-nowrap w-[15%]">Quantity</th>
                  <th className="px-6 py-4 whitespace-nowrap w-[20%]">Location</th>
                  <th className="px-6 py-4 whitespace-nowrap w-[15%]">Delivery</th>
                  <th className="px-6 py-4 whitespace-nowrap w-[15%]">Lowest Bid</th>
                  <th className="px-6 py-4 whitespace-nowrap w-[10%]">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredAuctions.map(auction => {
                  const endDate = new Date(auction.endTime);
                  const isClosingSoon = endDate.getTime() - new Date().getTime() < 24 * 60 * 60 * 1000; // Less than 24h

                  return (
                    <tr 
                      key={auction._id} 
                      onClick={() => navigate(`/auctions/${auction._id}`)}
                      className="even:bg-slate-50 hover:bg-indigo-50/80 transition-all duration-200 group cursor-pointer"
                    >
                      <td className="px-6 py-4 whitespace-nowrap truncate" title={auction.items?.length > 1 ? `${auction.items.length} Items Auction` : (auction.items?.[0]?.productName || auction.productName)}>
                        <div className="flex flex-col truncate">
                          <span className="font-bold text-gray-900 text-sm truncate">
                            {auction.items?.length > 1 ? `${auction.items.length} Items Auction` : (auction.items?.[0]?.productName || auction.productName)}
                          </span>
                          <span className="text-xs text-gray-500 mt-0.5 truncate" title={auction.items?.[0]?.category || auction.category}>
                            {auction.items?.length > 1 ? 'Multiple Categories' : (auction.items?.[0]?.category || auction.category)}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap truncate" title={auction.items?.length > 1 ? `${auction.items.length} Items` : `${auction.items?.[0]?.quantity || auction.quantity} ${auction.items?.[0]?.unit || auction.unit}`}>
                        <span className="inline-flex items-center justify-center px-2.5 py-1 bg-gray-100 text-gray-800 text-xs font-bold rounded-md truncate">
                          {auction.items?.length > 1 ? `${auction.items.length} Items` : `${auction.items?.[0]?.quantity || auction.quantity} ${auction.items?.[0]?.unit || auction.unit}`}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 truncate" title={`${auction.buyerId?.location?.city || 'Local Area'} (${auction.buyerId?.location?.pincode || 'N/A'})`}>
                        <div className="flex items-center truncate">
                          <MapPin className="w-4 h-4 mr-1.5 text-gray-400 flex-shrink-0" />
                          <span className="truncate">
                            {auction.buyerId?.location?.city || 'Local Area'} <span className="text-gray-400">({auction.buyerId?.location?.pincode || 'N/A'})</span>
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 truncate" title={`Delivery in ${auction.deliveryTimeline} days`}>
                        <div className="flex items-center truncate">
                          <span className="truncate">{auction.deliveryTimeline} days</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap truncate" title={auction.lowestBid ? `Total: ₹${auction.lowestBid.totalBidValue}` : 'No bids yet'}>
                        {auction.lowestBid ? (
                          <span className="font-bold text-emerald-600 text-sm truncate">₹{auction.lowestBid.totalBidValue}</span>
                        ) : (
                          <span className="text-gray-400 text-sm italic truncate">No bids yet</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap truncate" title={isClosingSoon ? 'Closing Soon' : 'Active'}>
                        {isClosingSoon ? (
                          <span className="inline-flex items-center text-xs font-bold text-red-600 bg-red-50 px-2.5 py-1 rounded-md border border-red-100 truncate">
                            <Clock className="w-3.5 h-3.5 mr-1 flex-shrink-0" /> Closing Soon
                          </span>
                        ) : (
                          <span className="inline-flex items-center text-xs font-medium text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-100 truncate">
                            Active
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default OpenAuctions;
