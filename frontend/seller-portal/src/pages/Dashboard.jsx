import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Gavel, ListOrdered, Trophy, DollarSign, ArrowRight } from 'lucide-react';
import api from '../services/api';
import Loader from '../components/common/Loader';
import StatusBadge from '../components/common/StatusBadge';

const StatCard = ({ title, value, icon: Icon, colorClass }) => (
  <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex items-center">
    <div className={`p-4 rounded-lg ${colorClass} mr-4`}>
      <Icon className="w-6 h-6 text-white" />
    </div>
    <div>
      <p className="text-sm font-medium text-gray-500">{title}</p>
      <h3 className="text-2xl font-bold text-gray-900">{value}</h3>
    </div>
  </div>
);

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalBids: 0,
    activeBids: 0,
    wonAuctions: 0,
    totalRevenue: 0
  });
  const [recentBids, setRecentBids] = useState([]);
  const [openAuctions, setOpenAuctions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setIsLoading(true);
        // Fetch user's bids for stats and recent list
        const bidsRes = await api.get('/api/bids/my-bids');
        
        // Fetch open auctions
        const auctionsRes = await api.get('/api/auctions/open?limit=5');

        if (bidsRes.success) {
          setStats(bidsRes.stats || {
            totalBids: bidsRes.bids?.length || 0,
            activeBids: bidsRes.bids?.filter(b => b.status === 'active').length || 0,
            wonAuctions: bidsRes.bids?.filter(b => b.status === 'won').length || 0,
            totalRevenue: 0 // Would need order API for actual revenue
          });
          setRecentBids(bidsRes.bids?.slice(0, 5) || []);
        }

        if (auctionsRes.success) {
          setOpenAuctions(auctionsRes.auctions || []);
        }
      } catch (err) {
        setError(err.message || 'Failed to load dashboard data');
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (isLoading) return <Loader text="Loading dashboard..." />;

  if (error) {
    return (
      <div className="bg-red-50 text-red-600 p-4 rounded-lg border border-red-200">
        <h3 className="font-bold">Error loading dashboard</h3>
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title="Total Bids" 
          value={stats.totalBids} 
          icon={ListOrdered} 
          colorClass="bg-blue-500" 
        />
        <StatCard 
          title="Active Bids" 
          value={stats.activeBids} 
          icon={Gavel} 
          colorClass="bg-yellow-500" 
        />
        <StatCard 
          title="Won Auctions" 
          value={stats.wonAuctions} 
          icon={Trophy} 
          colorClass="bg-green-500" 
        />
        <StatCard 
          title="Total Revenue" 
          value={`₹${stats.totalRevenue?.toLocaleString() || 0}`} 
          icon={DollarSign} 
          colorClass="bg-purple-500" 
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Open Auctions */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center">
            <h2 className="text-lg font-bold text-gray-900">Recent Open Auctions</h2>
            <Link to="/auctions" className="text-sm font-medium text-blue-600 hover:text-blue-800 flex items-center">
              View All <ArrowRight className="w-4 h-4 ml-1" />
            </Link>
          </div>
          <div className="divide-y divide-gray-100">
            {openAuctions.length === 0 ? (
              <div className="p-6 text-center text-gray-500">No open auctions available.</div>
            ) : (
              openAuctions.map(auction => (
                <div key={auction._id} className="p-6 hover:bg-gray-50 transition">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h3 className="font-semibold text-gray-900">{auction.productName}</h3>
                      <p className="text-sm text-gray-500">{auction.quantity} {auction.unit}</p>
                    </div>
                    <span className="text-sm font-medium text-green-600 bg-green-50 px-2 py-1 rounded">
                      Current: ₹{auction.currentLowestBid || auction.budgetRange?.max || 'N/A'}
                    </span>
                  </div>
                  <div className="mt-4">
                    <Link 
                      to={`/auctions/${auction._id}`}
                      className="text-sm font-medium text-blue-600 border border-blue-600 rounded px-3 py-1.5 hover:bg-blue-50 transition"
                    >
                      Place Bid
                    </Link>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Recent Bids */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center">
            <h2 className="text-lg font-bold text-gray-900">Your Recent Bids</h2>
            <Link to="/bids" className="text-sm font-medium text-blue-600 hover:text-blue-800 flex items-center">
              View All <ArrowRight className="w-4 h-4 ml-1" />
            </Link>
          </div>
          <div className="divide-y divide-gray-100">
            {recentBids.length === 0 ? (
              <div className="p-6 text-center text-gray-500">You haven't placed any bids yet.</div>
            ) : (
              recentBids.map(bid => (
                <div key={bid._id} className="p-6 hover:bg-gray-50 transition flex justify-between items-center">
                  <div>
                    <h3 className="font-semibold text-gray-900">{bid.auctionId?.productName || 'Unknown Product'}</h3>
                    <p className="text-sm text-gray-500">Your Bid: ₹{bid.bidPrice} ({bid.pricePerUnit}/{bid.auctionId?.unit || 'unit'})</p>
                  </div>
                  <StatusBadge status={bid.status} />
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
