import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Clock, MapPin, Package, AlertCircle, Wallet, Trophy, User, Leaf, Target, Truck, Edit } from 'lucide-react';
import { Link } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import api from '../../services/api';
import Loader from '../../components/common/Loader';
import StatusBadge from '../../components/common/StatusBadge';
import ReviewsModal from '../../components/ReviewsModal';

function InfoRow({ label, value }) {
  if (!value) return null;
  return (
    <div className="flex justify-between items-start gap-4 py-2.5 border-b border-slate-50 last:border-0">
      <span className="text-xs text-slate-400 font-semibold flex-shrink-0">{label}</span>
      <span className="text-xs font-bold text-slate-800 text-right">{value}</span>
    </div>
  );
}

const AuctionDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [auction, setAuction] = useState(null);
  const [bids, setBids] = useState([]);
  const [userBid, setUserBid] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Form state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [bidForm, setBidForm] = useState({
    prices: {}, // Map of itemId to pricePerUnit
    deliveryTimeline: '',
    notes: '',
    freeDelivery: false,
    deliveryCharges: '',
    qualityGuarantee: false
  });
  const [planFeatures, setPlanFeatures] = useState({
    canViewCompetitors: true,
    canOfferDiscounts: true
  });

  useEffect(() => {
    const fetchAuctionDetails = async () => {
      try {
        setIsLoading(true);
        const res = await api.get(`/api/auctions/${id}`);
        if (res.success) {
          setAuction(res.auction);
          setBids(res.bids || []);
          setUserBid(res.userBid);
          if (res.features) {
            setPlanFeatures(res.features);
          }

          if (res.userBid) {
            const initialPrices = {};
            if (res.userBid.bidItems) {
              res.userBid.bidItems.forEach(bi => {
                initialPrices[bi.itemId] = bi.pricePerUnit;
              });
            }
            setBidForm({
              prices: initialPrices,
              deliveryTimeline: res.userBid.deliveryTimeline,
              notes: res.userBid.additionalNotes || '',
              freeDelivery: res.userBid.freeDelivery || false,
              deliveryCharges: res.userBid.deliveryCharges || '',
              qualityGuarantee: res.userBid.qualityGuarantee || false,
              discountOffered: res.userBid.discountOffered || 0
            });
          } else {
            setBidForm({
              prices: {},
              deliveryTimeline: res.auction.deliveryTimeline || '',
              notes: '',
              freeDelivery: false,
              deliveryCharges: '',
              discountOffered: 0
            });
          }
        }
      } catch (err) {
        setError(err.message || 'Failed to load auction details');
      } finally {
        setIsLoading(false);
      }
    };

    fetchAuctionDetails();
  }, [id]);

  // Reviews Modal state
  const [reviewsModalOpen, setReviewsModalOpen] = useState(false);
  const [selectedBuyer, setSelectedBuyer] = useState({ id: null, name: '' });

  const handleBidSubmit = async (e) => {
    e.preventDefault();

    // Prepare bidItems
    const bidItems = [];
    for (const item of auction.items) {
      if (item.status === 'open') {
        const price = bidForm.prices[item._id];
        if (price) {
          bidItems.push({
            itemId: item._id,
            pricePerUnit: Number(price)
          });
        } else if (!auction.allowPartialBids) {
          toast.error(`Please provide a price for ${item.productName}`);
          return;
        }
      }
    }

    if (bidItems.length === 0) {
      toast.error('You must bid on at least one item.');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await api.post(`/api/bids/${id}`, {
        bidItems,
        deliveryTimeline: Number(bidForm.deliveryTimeline),
        notes: bidForm.notes,
        freeDelivery: bidForm.freeDelivery,
        deliveryCharges: bidForm.freeDelivery ? 0 : Number(bidForm.deliveryCharges),
        qualityGuarantee: bidForm.qualityGuarantee,
        discountOffered: Number(bidForm.discountOffered) || 0
      });

      if (res.success) {
        toast.success(userBid ? 'Bid updated successfully!' : 'Bid placed successfully!');
        setUserBid(res.bid);
        // Refresh bids
        const updatedRes = await api.get(`/api/auctions/${id}`);
        setBids(updatedRes.bids || []);
      }
    } catch (err) {
      toast.error(err.message || 'Failed to submit bid');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) return <Loader text="Loading auction details..." />;
  if (error || !auction) return (
    <div className="p-6 bg-red-50 text-red-600 rounded-lg">
      <h3 className="font-bold">Error</h3>
      <p>{error || 'Auction not found'}</p>
      <button onClick={() => navigate('/auctions')} className="mt-4 text-blue-600 underline">Back to Auctions</button>
    </div>
  );

  const isClosed = auction.status !== 'open' || new Date(auction.endTime) < new Date();
  const lowestBid = bids.length > 0 ? bids[0] : null;

  const openItems = auction.items?.filter(item => item.status === 'open') || [];
  const hasBidOnAllOpenItems = openItems.length > 0 && openItems.every(item => bidForm.prices[item._id] && Number(bidForm.prices[item._id]) > 0);
  const showDiscountField = auction.items?.length > 1 && hasBidOnAllOpenItems;

  // Calculate total bid value based on current form inputs
  const calculatedTotal = auction.items ? auction.items.reduce((sum, item) => {
    const price = bidForm.prices[item._id];
    return sum + (price ? Number(price) * item.quantity : 0);
  }, 0) : 0;

  const now = new Date();
  const endDate = new Date(auction.endTime);
  const diff = endDate - now;
  const hrs = Math.max(0, Math.floor(diff / 3600000));
  const mins = Math.max(0, Math.floor((diff % 3600000) / 60000));

  return (
    <div className="space-y-6 pb-12 max-w-5xl mx-auto">
      <button
        onClick={() => navigate('/auctions')}
        className="flex items-center text-slate-600 hover:text-slate-900 transition mb-2"
      >
        <ArrowLeft className="w-4 h-4 mr-2" /> Back to Open Auctions
      </button>

      <div className="space-y-4">
        {/* Section 1: Auction Info */}
        <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm mb-6">
          <div className="flex items-center justify-between pb-6 border-b border-slate-100 mb-6">
            <div className="flex items-center gap-3">
              <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold ${auction.status === 'open' ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-700'}`}>
                <div className={`w-1.5 h-1.5 rounded-full ${auction.status === 'open' ? 'bg-emerald-500' : 'bg-slate-500'}`}></div>
                {auction.status.charAt(0).toUpperCase() + auction.status.slice(1)}
              </div>
              
              {auction.status === 'open' && (
                <div className="flex items-center gap-1.5 bg-orange-50 text-orange-600 px-3 py-1.5 rounded-full text-xs font-bold">
                  <Clock className="w-3.5 h-3.5" />
                  {hrs}h {mins}m remaining
                </div>
              )}
            </div>

            {auction.buyerId && (
              <div className="text-right">
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">Requested By</p>
                <div className="flex items-center justify-end gap-2">
                  <span className="text-sm font-black text-slate-900">
                    {auction.buyerId?.kiranaProfile?.asBuyer?.shopName || auction.buyerId?.name || 'Retailer'}
                  </span>
                  <button
                    onClick={() => {
                      setSelectedBuyer({
                        id: auction.buyerId?._id,
                        name: auction.buyerId?.kiranaProfile?.asBuyer?.shopName || auction.buyerId?.name
                      });
                      setReviewsModalOpen(true);
                    }}
                    className="text-xs font-bold text-slate-500 hover:text-indigo-600 transition flex items-center bg-slate-50 px-2 py-0.5 rounded-md border border-slate-100"
                  >
                    <span className="text-yellow-400 mr-1">★</span>
                    {auction.buyerId?.rating?.average || 0}
                  </button>
                </div>
              </div>
            )}
          </div>
          
          {auction.items && auction.items.length > 0 && (
            <div className="space-y-8">
              {auction.items.map((item, index) => (
                <div key={item._id || index} className="space-y-4">
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                      <p className="text-[11px] font-bold text-indigo-700 uppercase tracking-widest mb-1">Item {index + 1}</p>
                      <h2 className="text-2xl font-black text-slate-900 mb-3">{item.productName}</h2>
                      <div className="flex items-center gap-2">
                        <span className="flex items-center gap-1.5 bg-emerald-50 text-emerald-800 px-2.5 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider">
                          <Leaf className="w-3.5 h-3.5 text-emerald-600" />
                          {item.category}
                        </span>
                        <span className="flex items-center gap-1.5 bg-blue-50 text-blue-800 px-2.5 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider">
                          <Package className="w-3.5 h-3.5 text-blue-600" />
                          {item.qualitySpecs?.packaging || 'No Packaging Info'}
                        </span>
                      </div>
                    </div>
                    
                    <div className="bg-emerald-50 rounded-2xl p-4 flex items-center gap-4 min-w-[200px] justify-between border border-emerald-100/50">
                      <div>
                        <p className="text-[10px] font-bold text-slate-500 mb-1 uppercase tracking-wider">Item Status</p>
                        <p className="text-lg font-black text-emerald-600 uppercase tracking-wide">{item.status}</p>
                      </div>
                      <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center">
                        <svg className="w-5 h-5 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                        </svg>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white border border-slate-100 rounded-3xl overflow-hidden shadow-sm">
                    <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-slate-100">
                      <div className="p-6 flex items-center gap-4">
                        <div className="w-12 h-12 rounded-full bg-indigo-50 flex items-center justify-center flex-shrink-0">
                          <Package className="w-5 h-5 text-indigo-600" />
                        </div>
                        <div>
                          <p className="text-[11px] font-bold text-slate-400 mb-0.5">Quantity Required</p>
                          <p className="text-base font-black text-slate-900">{item.quantity} {item.unit}</p>
                        </div>
                      </div>
                      <div className="p-6 flex items-center gap-4">
                        <div className="w-12 h-12 rounded-full bg-emerald-50 flex items-center justify-center flex-shrink-0">
                          <span className="text-emerald-600 font-bold text-lg">₹</span>
                        </div>
                        <div>
                          <p className="text-[11px] font-bold text-slate-400 mb-0.5">Budget Range</p>
                          <p className="text-base font-black text-slate-900">
                            {item.budgetRange?.min && item.budgetRange?.max 
                              ? `₹${item.budgetRange.min} – ₹${item.budgetRange.max} / unit` 
                              : 'Not specified'}
                          </p>
                        </div>
                      </div>
                    </div>
                    {item.qualitySpecs?.packaging && (
                      <div className="border-t border-slate-100 p-6 flex items-center gap-4">
                        <div className="w-12 h-12 rounded-full bg-purple-50 flex items-center justify-center flex-shrink-0">
                          <Package className="w-5 h-5 text-purple-600" />
                        </div>
                        <div>
                          <p className="text-[11px] font-bold text-slate-400 mb-0.5">Packaging</p>
                          <p className="text-base font-black text-slate-900">{item.qualitySpecs.packaging}</p>
                        </div>
                      </div>
                    )}
                  </div>
                  {item.qualitySpecs?.customRequirements && (
                    <div className="mt-3">
                      <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">Custom Requirements</p>
                      <p className="text-sm font-medium text-slate-700 leading-relaxed bg-slate-50 p-4 rounded-2xl border border-slate-100">{item.qualitySpecs.customRequirements}</p>
                    </div>
                  )}
                </div>
              ))}
              
              <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-indigo-50 flex items-center justify-center flex-shrink-0">
                      <svg className="w-4 h-4 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-[11px] font-bold text-slate-400 mb-0.5">Bidding Mode</p>
                      <p className="text-sm font-black text-slate-900">{auction.allowPartialBids ? 'Partial Bids Allowed' : 'All Items Mandatory'}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center flex-shrink-0">
                      <Target className="w-4 h-4 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-[11px] font-bold text-slate-400 mb-0.5">Preferred Market</p>
                      <p className="text-sm font-black text-slate-900">{auction.preferredMarket?.replace(/_/g, ' ')}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-emerald-50 flex items-center justify-center flex-shrink-0">
                      <Truck className="w-4 h-4 text-emerald-600" />
                    </div>
                    <div>
                      <p className="text-[11px] font-bold text-slate-400 mb-0.5">Delivery Timeline</p>
                      <p className="text-sm font-black text-slate-900">{auction.deliveryTimeline} day(s)</p>
                    </div>
                  </div>
                </div>
                
                <div className="bg-slate-50/80 rounded-2xl p-4 flex items-center gap-4">
                  <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                    <MapPin className="w-4 h-4 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-[11px] font-bold text-slate-500 mb-0.5">Delivery To</p>
                    <p className="text-sm font-black text-slate-900">{auction.deliveryAddress?.area}, {auction.deliveryAddress?.city} - {auction.deliveryAddress?.pincode}</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Section 2: Bidding Form */}
        <div className="bg-white border border-slate-100 rounded-3xl p-6 md:p-8 shadow-sm">
          <div className="flex items-center gap-4 mb-8 pb-6 border-b border-slate-100">
            <div className="w-12 h-12 rounded-2xl bg-indigo-50 flex items-center justify-center flex-shrink-0">
              <Edit className="w-6 h-6 text-indigo-600" />
            </div>
            <div>
              <h2 className="text-xl font-black text-slate-900">{userBid ? 'Update Your Bid' : 'Place a Bid'}</h2>
              <p className="text-sm font-medium text-slate-500">Review and update your offer details below</p>
            </div>
          </div>

          {userBid?.status === 'won' ? (
            <div className="bg-emerald-50 border border-emerald-200 p-8 rounded-2xl flex flex-col items-center text-center max-w-md mx-auto">
              <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mb-4">
                <Trophy className="w-8 h-8 text-emerald-600" />
              </div>
              <h3 className="text-emerald-800 font-black text-2xl mb-2">Congratulations!</h3>
              <p className="text-emerald-700 font-medium mb-6">Your bid was awarded for this auction.</p>
              {auction?.orderId && (
                <Link
                  to={`/orders/${auction.orderId}/invoice`}
                  className="w-full inline-block bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3.5 rounded-xl transition shadow-sm"
                >
                  View Bill / Invoice
                </Link>
              )}
            </div>
          ) : isClosed ? (
            <div className="bg-amber-50 text-amber-800 p-6 rounded-2xl flex items-start max-w-md mx-auto">
              <AlertCircle className="w-6 h-6 mr-3 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-bold text-lg mb-1">Auction Closed</p>
                <p className="text-sm">This auction has closed. No more bids can be placed or updated.</p>
              </div>
            </div>
          ) : (
            <form onSubmit={handleBidSubmit} className="flex flex-col lg:flex-row gap-8">
              
              {/* Form Fields Side */}
              <div className="flex-1 space-y-6">
                
                {/* Dynamic Item Fields */}
                {auction.items?.filter(item => item.status === 'open').map(item => (
                  <div key={item._id} className="relative flex gap-4 pb-6 border-b border-slate-100">
                    <div className="w-12 h-12 rounded-xl bg-indigo-50 flex items-center justify-center flex-shrink-0 mt-2">
                      <span className="text-indigo-600 font-bold text-lg">₹</span>
                    </div>
                    <div className="flex-1">
                      <label className="block text-xs font-bold text-slate-700 mb-2">
                        Price for {item.productName} ({item.unit}) <span className="text-rose-500">{!auction.allowPartialBids && '*'}</span>
                      </label>
                      <div className="relative">
                        <input
                          type="number"
                          required={!auction.allowPartialBids}
                          min="1"
                          step="0.01"
                          value={bidForm.prices[item._id] || ''}
                          onChange={(e) => setBidForm({ ...bidForm, prices: { ...bidForm.prices, [item._id]: e.target.value }})}
                          className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-300 focus:ring-4 focus:ring-indigo-50 font-bold text-slate-900 bg-white transition"
                        />
                        <div className="absolute inset-y-0 right-0 flex items-center pr-4 pointer-events-none text-slate-400 font-bold text-sm border-l border-slate-100 pl-4 my-2">
                          / {item.unit}
                        </div>
                      </div>
                      <p className="text-xs font-medium text-slate-500 mt-2">
                        Required Quantity: <span className="font-bold text-indigo-600">{item.quantity} {item.unit}</span>
                      </p>
                    </div>
                  </div>
                ))}
                
                {/* Delivery Timeline */}
                <div className="relative flex gap-4 pb-6 border-b border-slate-100">
                  <div className="w-12 h-12 rounded-xl bg-emerald-50 flex items-center justify-center flex-shrink-0 mt-2">
                    <Clock className="w-5 h-5 text-emerald-600" />
                  </div>
                  <div className="flex-1">
                    <label className="block text-xs font-bold text-slate-700 mb-2">
                      Delivery (Days) <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        required min="1" max={auction.deliveryTimeline}
                        value={bidForm.deliveryTimeline}
                        onChange={(e) => setBidForm({ ...bidForm, deliveryTimeline: e.target.value })}
                        className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:border-emerald-300 focus:ring-4 focus:ring-emerald-50 font-bold text-slate-900 bg-white transition"
                      />
                      <div className="absolute inset-y-0 right-0 flex items-center pr-4 pointer-events-none text-slate-400 font-bold text-sm border-l border-slate-100 pl-4 my-2">
                        Days
                      </div>
                    </div>
                    <p className="text-xs font-medium text-slate-500 mt-2">
                      Requested: <span className="font-bold text-emerald-600">&le; {auction.deliveryTimeline} days</span>
                    </p>
                  </div>
                </div>

                {/* Notes & Perks */}
                <div className="relative flex gap-4 pb-6 border-b border-slate-100">
                  <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center flex-shrink-0 mt-2">
                    <svg className="w-5 h-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" /></svg>
                  </div>
                  <div className="flex-1 space-y-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-2">Notes (Optional)</label>
                      <textarea
                        value={bidForm.notes}
                        onChange={(e) => setBidForm({ ...bidForm, notes: e.target.value })}
                        className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-300 focus:ring-4 focus:ring-blue-50 text-sm placeholder-slate-400 resize-none transition"
                        rows="2"
                        maxLength="300"
                        placeholder="Any specific terms or quality assurances..."
                      ></textarea>
                      <p className="text-right text-[10px] font-medium text-slate-400 mt-1">{bidForm.notes.length} / 300</p>
                    </div>
                    <div className="flex gap-8 mt-2">
                      <label className="flex items-center gap-2 cursor-pointer group">
                        <input type="checkbox" checked={bidForm.freeDelivery} onChange={(e) => setBidForm({ ...bidForm, freeDelivery: e.target.checked, deliveryCharges: e.target.checked ? '' : bidForm.deliveryCharges })} className="w-4 h-4 text-emerald-600 rounded border-slate-300 focus:ring-emerald-500" />
                        <Truck className="w-4 h-4 text-emerald-600" />
                        <span className="text-sm font-bold text-slate-700 group-hover:text-slate-900 transition">Free Delivery</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer group">
                        <input type="checkbox" checked={bidForm.qualityGuarantee} onChange={(e) => setBidForm({ ...bidForm, qualityGuarantee: e.target.checked })} className="w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500" />
                        <svg className="w-4 h-4 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
                        <span className="text-sm font-bold text-slate-700 group-hover:text-slate-900 transition">Quality Guarantee</span>
                      </label>
                    </div>
                  </div>
                </div>

                {/* Delivery Charges (Conditional) */}
                {!bidForm.freeDelivery && (
                  <div className="relative flex gap-4 pb-6 border-b border-slate-100 animate-fade-in">
                    <div className="w-12 h-12 rounded-xl bg-purple-50 flex items-center justify-center flex-shrink-0 mt-2">
                      <span className="text-purple-600 font-bold text-lg">₹</span>
                    </div>
                    <div className="flex-1">
                      <label className="block text-xs font-bold text-slate-700 mb-2">
                        Delivery Charges (₹) <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="number"
                        required min="0" step="1"
                        value={bidForm.deliveryCharges}
                        onChange={(e) => setBidForm({ ...bidForm, deliveryCharges: e.target.value })}
                        className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:border-purple-300 focus:ring-4 focus:ring-purple-50 font-bold text-slate-900 bg-white transition"
                      />
                      <p className="text-xs font-medium text-slate-500 mt-2">Additional charges for delivery</p>
                    </div>
                  </div>
                )}

                {/* Discount (Conditional) */}
                {planFeatures.canOfferDiscounts && showDiscountField && (
                  <div className="relative flex gap-4 pb-6 border-b border-slate-100">
                    <div className="w-12 h-12 rounded-xl bg-violet-50 flex items-center justify-center flex-shrink-0 mt-2">
                      <span className="text-violet-600 font-bold text-lg">%</span>
                    </div>
                    <div className="flex-1">
                      <label className="block text-xs font-bold text-slate-700 mb-2">
                        Bulk Discount (%)
                      </label>
                      <input
                        type="number"
                        min="0" max="100"
                        value={bidForm.discountOffered || ''}
                        onChange={(e) => setBidForm({ ...bidForm, discountOffered: e.target.value })}
                        className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:border-violet-300 focus:ring-4 focus:ring-violet-50 font-bold text-slate-900 bg-white transition"
                        placeholder="0"
                      />
                      <p className="text-xs font-medium text-slate-500 mt-2">Applies only if Retailer awards you the entire auction.</p>
                    </div>
                  </div>
                )}

                {/* Info Notice */}
                <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4 flex gap-3 items-start">
                  <AlertCircle className="w-5 h-5 text-indigo-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-xs font-bold text-slate-900">Please review your bid details carefully before {userBid ? 'updating' : 'submitting'}.</p>
                    <p className="text-xs font-medium text-slate-500 mt-1">Once submitted, your offer will be considered for the auction.</p>
                  </div>
                </div>

              </div>

              {/* Right Sidebar - Total Value */}
              <div className="w-full lg:w-80 flex-shrink-0">
                <div className="sticky top-6 border border-slate-100 rounded-3xl p-6 shadow-sm bg-white">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-bold text-slate-900">Total Value</h3>
                    <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center">
                      <svg className="w-5 h-5 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" /></svg>
                    </div>
                  </div>
                  
                  <p className={`text-4xl font-black ${showDiscountField && bidForm.discountOffered > 0 ? 'text-slate-300 line-through' : 'text-emerald-600'}`}>
                    ₹{(calculatedTotal + (!bidForm.freeDelivery ? Number(bidForm.deliveryCharges || 0) : 0)).toLocaleString()}
                  </p>

                  {showDiscountField && bidForm.discountOffered > 0 && (
                    <p className="text-4xl font-black text-emerald-600 mt-2">
                       ₹{((calculatedTotal * (1 - Number(bidForm.discountOffered)/100)) + (!bidForm.freeDelivery ? Number(bidForm.deliveryCharges || 0) : 0)).toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
                    </p>
                  )}

                  <hr className="border-t-2 border-dashed border-slate-100 my-6" />

                  <div className="space-y-4">
                    {auction.items?.filter(item => item.status === 'open').map(item => {
                       const price = bidForm.prices[item._id] || 0;
                       const total = price * item.quantity;
                       if(total > 0) {
                         return (
                           <div key={item._id} className="flex justify-between items-center text-sm">
                             <span className="text-slate-500 font-medium">Price ({price} × {item.quantity})</span>
                             <span className="font-bold text-slate-900">₹{total.toLocaleString()}</span>
                           </div>
                         )
                       }
                       return null;
                    })}
                    
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-slate-500 font-medium">Delivery Charges</span>
                      <span className="font-bold text-slate-900">
                        {bidForm.freeDelivery ? 'Free' : `₹${Number(bidForm.deliveryCharges || 0).toLocaleString()}`}
                      </span>
                    </div>

                    {showDiscountField && bidForm.discountOffered > 0 && (
                      <div className="flex justify-between text-sm text-emerald-600 font-bold pt-2 border-t border-slate-50">
                        <span>Bulk Discount</span>
                        <span>-{bidForm.discountOffered}%</span>
                      </div>
                    )}
                  </div>

                  <hr className="border-t border-slate-200 my-6" />

                  <div className="flex justify-between items-center mb-6">
                    <span className="font-bold text-slate-900">Total</span>
                    <span className="text-xl font-black text-emerald-600">
                      ₹{((calculatedTotal * (1 - (showDiscountField ? Number(bidForm.discountOffered || 0) : 0)/100)) + (!bidForm.freeDelivery ? Number(bidForm.deliveryCharges || 0) : 0)).toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
                    </span>
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3.5 px-4 rounded-xl transition disabled:opacity-50 text-sm tracking-widest shadow-sm hover:shadow-md uppercase"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" /></svg>
                    {isSubmitting ? 'PROCESSING...' : userBid ? 'UPDATE BID' : 'SUBMIT BID'}
                  </button>
                </div>
              </div>
            </form>
          )}
        </div>
      </div>

      {/* Section 3: Competitor Bids */}
        <div className="mt-8">
          <div className="flex justify-between items-end mb-4">
            <div>
              <h2 className="text-xl font-bold text-gray-900">Competitor Bids {planFeatures.canViewCompetitors && <span className="bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded-full ml-2 align-middle">{bids.length}</span>}</h2>
              <p className="text-sm text-gray-500 mt-1">
                {planFeatures.canViewCompetitors 
                  ? "Live ranking of all bids submitted for this auction."
                  : "Live rankings are hidden for Free suppliers."}
              </p>
            </div>
          </div>

          {!planFeatures.canViewCompetitors ? (
            <div className="bg-white border border-gray-200 rounded-xl p-10 text-center shadow-sm">
              <div className="w-16 h-16 bg-indigo-50 text-indigo-500 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl">
                🔒
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">Competitor Rankings Hidden</h3>
              <p className="text-gray-500 max-w-md mx-auto mb-6 text-sm">
                You are currently on the Free Supplier plan (Blind Bidding). Upgrade to Premium to instantly see where your bid ranks against your competitors in real-time.
              </p>
              <button className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold py-2.5 px-6 rounded-lg hover:from-indigo-700 hover:to-purple-700 transition shadow-md">
                Unlock Premium Features
              </button>
            </div>
          ) : bids.length === 0 ? (
            <div className="bg-gray-50 border border-gray-200 border-dashed rounded-lg p-10 text-center">
              <p className="text-gray-500">No bids have been placed on this auction yet.</p>
              <p className="text-sm text-gray-400 mt-1">Be the first to submit a bid!</p>
            </div>
          ) : (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100 text-xs uppercase tracking-wider text-gray-500 font-bold">
                <th className="px-6 py-4">Rank</th>
                <th className="px-6 py-4">Competitor</th>
                <th className="px-6 py-4">Items Included</th>
                <th className="px-6 py-4 text-right">Total Value</th>
                <th className="px-6 py-4">Delivery</th>
                <th className="px-6 py-4">Perks & Notes</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {bids.length === 0 ? (
                <tr>
                  <td colSpan="6" className="p-10 text-center">
                    <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-gray-100">
                      <Wallet className="w-6 h-6 text-gray-400" />
                    </div>
                    <p className="text-gray-500 font-medium">No bids yet. Be the first to secure this deal!</p>
                  </td>
                </tr>
              ) : (
                bids.map((bid, index) => {
                  const isMine = bid.sellerId?._id === userBid?.sellerId;
                  return (
                    <tr key={bid._id} className={`transition-colors hover:bg-gray-50 ${isMine ? 'bg-blue-50/40' : ''}`}>
                      <td className="px-6 py-4">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center font-black text-sm shadow-sm border
                          ${index === 0 ? 'bg-emerald-100 text-emerald-700 border-emerald-200' : 'bg-gray-50 text-gray-500 border-gray-200'}`}>
                          #{index + 1}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <p className={`font-bold flex items-center gap-2 ${isMine ? 'text-blue-700' : 'text-gray-900'}`}>
                          {isMine ? 'Your Bid' : bid.sellerId?.bigMarketProfile?.shopName || bid.sellerId?.name || 'Competitor'}
                          {isMine && <span className="text-[9px] bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full uppercase tracking-wider">You</span>}
                        </p>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col gap-1">
                          {bid.bidItems?.map(bItem => {
                            const aItem = auction.items?.find(i => i._id === bItem.itemId);
                            return (
                              <div key={bItem.itemId} className="text-xs bg-gray-50 border border-gray-100 p-1.5 rounded-md flex justify-between items-center gap-3">
                                <span className="font-bold text-gray-700 truncate max-w-[120px]">{aItem?.productName || 'Item'}</span>
                                <span className="text-gray-600">₹{bItem.pricePerUnit}/unit</span>
                              </div>
                            );
                          })}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <p className={`text-sm font-bold ${bid.discountOffered > 0 && auction.items?.length > 1 ? 'text-gray-400 line-through' : 'text-gray-700'}`}>₹{bid.totalBidValue}</p>
                        {bid.discountOffered > 0 && auction.items?.length > 1 && bid.bidItems?.length === auction.items?.length && (
                          <div className="mt-1 flex flex-col items-end gap-1">
                            <p className="text-[10px] font-bold text-violet-600 bg-violet-50 border border-violet-200 px-1.5 py-0.5 rounded leading-tight whitespace-nowrap">
                              -{bid.discountOffered}% if all awarded
                            </p>
                            <p className="text-sm font-black text-emerald-600 whitespace-nowrap">
                              ₹{(bid.totalBidValue * (1 - bid.discountOffered / 100)).toFixed(0)} <span className="text-[9px] uppercase tracking-wider ml-0.5 text-emerald-600/70">total</span>
                            </p>
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-sm text-gray-600 font-medium flex items-center gap-1.5 whitespace-nowrap">
                          <Clock className="w-4 h-4 text-gray-400" /> {bid.deliveryTimeline} days
                        </p>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-wrap gap-1.5 min-w-[120px]">
                          {bid.freeDelivery ? (
                            <span className="text-[10px] font-bold bg-green-50 text-green-700 border border-green-200 px-2 py-0.5 rounded">Free Delivery</span>
                          ) : (
                            <span className="text-[10px] font-bold bg-orange-50 text-orange-700 border border-orange-200 px-2 py-0.5 rounded">+ ₹{bid.deliveryCharges} Delivery</span>
                          )}
                          {bid.qualityGuarantee && <span className="text-[10px] font-bold bg-purple-50 text-purple-700 border border-purple-200 px-2 py-0.5 rounded">Quality Guarantee</span>}
                          {bid.notes && <span className="text-[10px] font-medium bg-gray-50 text-gray-600 border border-gray-200 px-2 py-0.5 rounded italic max-w-[150px] truncate" title={bid.notes}>"{bid.notes}"</span>}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
          </div>
          </div>
          )}
        </div>

      <ReviewsModal
        isOpen={reviewsModalOpen}
        onClose={() => setReviewsModalOpen(false)}
        userId={selectedBuyer.id}
        userName={selectedBuyer.name}
      />
    </div>
  );
};

export default AuctionDetail;
