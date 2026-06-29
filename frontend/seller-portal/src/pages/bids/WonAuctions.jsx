import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Trophy, MapPin, Package, Clock, ChevronRight } from 'lucide-react';
import api from '../../services/api';
import Loader from '../../components/common/Loader';

const WonAuctions = () => {
  const [bids, setBids] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchWonAuctions = async () => {
      try {
        setIsLoading(true);
        const res = await api.get('/api/bids/my-bids', { status: 'won' });
        if (res.success) {
          setBids(res.bids || []);
        }
      } catch (err) {
        setError(err.message || 'Failed to load won auctions');
      } finally {
        setIsLoading(false);
      }
    };

    fetchWonAuctions();
  }, []);

  if (isLoading) return <Loader text="Loading won auctions..." />;

  const totalRevenue = bids.reduce((sum, bid) => sum + (bid.totalBidValue || 0), 0);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Won Auctions</h1>
          <p className="text-gray-500 text-sm mt-1">Auctions where your bid was the winning bid.</p>
        </div>
        {bids.length > 0 && (
          <div className="bg-green-50 border border-green-200 rounded-xl px-5 py-3">
            <p className="text-xs font-medium text-green-600 uppercase tracking-wider">Total Won Value</p>
            <p className="text-2xl font-black text-green-700">₹{totalRevenue.toLocaleString()}</p>
          </div>
        )}
      </div>

      {error && (
        <div className="bg-red-50 text-red-600 p-4 rounded-lg border border-red-200">{error}</div>
      )}

      {bids.length === 0 && !isLoading && !error ? (
        <div className="text-center py-16 bg-white rounded-xl shadow-sm border border-gray-100">
          <Trophy className="mx-auto h-14 w-14 text-gray-200 mb-4" />
          <h3 className="text-lg font-semibold text-gray-900">No won auctions yet</h3>
          <p className="text-gray-500 mt-1 mb-5">Keep bidding competitively to win your first auction!</p>
          <Link
            to="/auctions"
            className="inline-flex items-center bg-blue-600 hover:bg-blue-700 text-white font-medium px-5 py-2.5 rounded-lg transition"
          >
            Browse Open Auctions <ChevronRight className="ml-1 w-4 h-4" />
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {bids.map((bid) => {
            const auction = bid.auctionId;
            return (
              <div key={bid._id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition">
                <div className="p-5">
                  <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
                    <div className="flex items-start">
                      <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mr-4">
                        <Trophy className="w-5 h-5 text-green-600" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="text-lg font-bold text-gray-900">
                            {auction?.items?.[0]?.productName || 'Product'}
                            {auction?.items?.length > 1 ? ` + ${auction.items.length - 1} more` : ''}
                          </h3>
                          <span className="inline-block px-2 py-0.5 bg-green-100 text-green-700 text-xs font-semibold rounded">
                            WON
                          </span>
                        </div>

                        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-gray-500">
                          <span className="flex items-center">
                            <Package className="w-3.5 h-3.5 mr-1" />
                            {auction?.items?.[0]?.quantity} {auction?.items?.[0]?.unit}
                          </span>
                          <span className="flex items-center">
                            <MapPin className="w-3.5 h-3.5 mr-1" />
                            {auction?.deliveryAddress?.city || 'N/A'}
                          </span>
                          <span className="flex items-center">
                            <Clock className="w-3.5 h-3.5 mr-1" />
                            Deliver in {bid.deliveryTimeline} days
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="text-right flex-shrink-0">
                      <p className="text-2xl font-black text-gray-900">
                        ₹{bid.totalBidValue?.toLocaleString()}
                      </p>
                      <p className="text-xs text-gray-500 mt-0.5">
                        ₹{bid.bidItems?.[0]?.pricePerUnit}/{auction?.items?.[0]?.unit}
                      </p>
                      <p className="text-xs text-gray-400 mt-1">
                        Won on {new Date(bid.updatedAt || bid.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>

                  <div className="mt-4 pt-4 border-t border-gray-100 flex items-center justify-between">
                    <p className="text-xs text-gray-500">
                      Auction ended · {auction?.items?.[0]?.category}
                    </p>
                    <div className="flex gap-4">
                      {auction?.orderId && (
                        <Link
                          to={`/orders/${auction.orderId}/invoice`}
                          className="text-sm text-indigo-600 font-bold hover:text-indigo-800 flex items-center"
                        >
                          View Bill <ChevronRight className="w-4 h-4 ml-0.5" />
                        </Link>
                      )}
                      <Link
                        to={`/auctions/${auction?._id}`}
                        className="text-sm text-blue-600 font-medium hover:text-blue-800 flex items-center"
                      >
                        View Details <ChevronRight className="w-4 h-4 ml-0.5" />
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default WonAuctions;

