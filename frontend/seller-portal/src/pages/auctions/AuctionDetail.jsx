import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Clock, MapPin, Package, AlertCircle, Wallet, Trophy, User } from 'lucide-react';
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
              qualityGuarantee: res.userBid.qualityGuarantee || false,
              discountOffered: res.userBid.discountOffered || 0
            });
          } else {
            setBidForm({
              prices: {},
              deliveryTimeline: res.auction.deliveryTimeline || '',
              notes: '',
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
        <div className="bg-white border border-slate-200 rounded-[24px] p-6 shadow-md shadow-slate-100/50">
          <div className="flex items-center justify-between mb-6 border-b border-slate-100 pb-4">
            <div className="flex items-center gap-3">
              <StatusBadge status={auction.status} />
              {auction.status === 'open' && (
                <span className={`text-xs font-bold ${hrs < 2 ? 'text-rose-600 bg-rose-50' : 'text-amber-600 bg-amber-50'} px-2.5 py-1 rounded-full`}>
                  ⏱ {hrs}h {mins}m remaining
                </span>
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

          {auction.items && auction.items.length > 0 ? (
            <div className="space-y-6">
              {auction.items.map((item, index) => (
                <div key={item._id || index} className="bg-slate-50 border border-slate-100 rounded-2xl p-5">
                  <h3 className="text-xs font-black text-indigo-700 uppercase tracking-widest mb-3 border-b border-indigo-100 pb-2">Item {index + 1}: {item.productName}</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-12 gap-y-1">
                    <InfoRow label="Category" value={item.category} />
                    <InfoRow label="Quantity Required" value={`${item.quantity} ${item.unit}`} />
                    <InfoRow label="Grade" value={item.qualitySpecs?.grade} />
                    <InfoRow label="Organic" value={item.qualitySpecs?.organic ? 'Yes' : 'No'} />
                    <InfoRow label="Freshness" value={item.qualitySpecs?.freshness} />
                    <InfoRow label="Packaging" value={item.qualitySpecs?.packaging} />
                    {item.budgetRange?.max && <InfoRow label="Target Budget" value={`Max ₹${item.budgetRange.max} / unit`} />}
                    <InfoRow label="Item Status" value={item.status.toUpperCase()} />
                  </div>
                  {item.qualitySpecs?.customRequirements && (
                    <div className="mt-3 pt-3 border-t border-slate-200">
                      <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">Custom Requirements</p>
                      <p className="text-sm font-medium text-slate-700 leading-relaxed">{item.qualitySpecs.customRequirements}</p>
                    </div>
                  )}
                </div>
              ))}

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-12 gap-y-1 pt-4 border-t border-slate-100">
                <InfoRow label="Bidding Mode" value={auction.allowPartialBids ? 'Partial Bids Allowed' : 'All Items Mandatory'} />
                <InfoRow label="Preferred Market" value={auction.preferredMarket?.replace(/_/g, ' ')} />
                <InfoRow label="Delivery Timeline" value={`Within ${auction.deliveryTimeline} day(s)`} />
                {auction.minRatingRequired > 0 && <InfoRow label="Min Rating Req." value={`${auction.minRatingRequired}+ Stars`} />}
                <div className="md:col-span-2 lg:col-span-3">
                  <InfoRow label="Delivery To" value={`${auction.deliveryAddress?.area}, ${auction.deliveryAddress?.city} - ${auction.deliveryAddress?.pincode}`} />
                </div>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-12 gap-y-1">
              <InfoRow label="Category" value={auction.category} />
              <InfoRow label="Quantity Required" value={`${auction.quantity} ${auction.unit}`} />
              <InfoRow label="Delivery Timeline" value={`Within ${auction.deliveryTimeline} day(s)`} />
              {auction.minRatingRequired > 0 && <InfoRow label="Min Rating Req." value={`${auction.minRatingRequired}+ Stars`} />}
              <div className="md:col-span-2 lg:col-span-3">
                <InfoRow label="Delivery To" value={`${auction.deliveryAddress?.area}, ${auction.deliveryAddress?.city} - ${auction.deliveryAddress?.pincode}`} />
              </div>
            </div>
          )}
        </div>

        {/* Section 2: Bidding Form */}
        <div>
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4">{userBid ? 'Update Your Bid' : 'Place a Bid'}</h2>

            {userBid?.status === 'won' ? (
              <div className="bg-emerald-50 border border-emerald-200 p-5 rounded-lg flex flex-col items-center text-center">
                <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center mb-3">
                  <Trophy className="w-6 h-6 text-emerald-600" />
                </div>
                <h3 className="text-emerald-800 font-bold text-lg mb-1">Congratulations!</h3>
                <p className="text-emerald-700 text-sm mb-4">Your bid was awarded for this auction.</p>
                {auction?.orderId && (
                  <Link
                    to={`/orders/${auction.orderId}/invoice`}
                    className="w-full inline-block bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2.5 rounded-lg transition shadow-sm"
                  >
                    View Bill / Invoice
                  </Link>
                )}
              </div>
            ) : isClosed ? (
              <div className="bg-yellow-50 text-yellow-800 p-4 rounded-lg flex items-start">
                <AlertCircle className="w-5 h-5 mr-2 flex-shrink-0 mt-0.5" />
                <p className="text-sm">This auction has closed. No more bids can be placed.</p>
              </div>
            ) : (
              <form onSubmit={handleBidSubmit} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-6 items-start">

                {/* Dynamic fields for each item */}
                <div className="xl:col-span-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 border-b border-gray-100 pb-4">
                  {auction.items?.filter(item => item.status === 'open').map(item => (
                    <div key={item._id} className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                      <label className="block text-xs font-bold text-gray-700 mb-2 truncate">
                        Price for {item.productName} ({item.unit}) <span className="text-red-500">{!auction.allowPartialBids && '*'}</span>
                      </label>
                      <input
                        type="number"
                        required={!auction.allowPartialBids}
                        min="1"
                        step="0.01"
                        value={bidForm.prices[item._id] || ''}
                        onChange={(e) => setBidForm({
                          ...bidForm,
                          prices: { ...bidForm.prices, [item._id]: e.target.value }
                        })}
                        className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-bold text-lg bg-white"
                        placeholder="Price / unit"
                      />
                      <p className="text-[10px] font-bold text-gray-500 mt-1.5 uppercase tracking-wider">
                        Req. Qty: {item.quantity}
                      </p>
                    </div>
                  ))}
                </div>

                <div className="xl:col-span-1 flex flex-col">
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
                    Delivery (Days)
                  </label>
                  <input
                    type="number"
                    required
                    min="1"
                    max={auction.deliveryTimeline}
                    value={bidForm.deliveryTimeline}
                    onChange={(e) => setBidForm({ ...bidForm, deliveryTimeline: e.target.value })}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-bold text-base"
                  />
                  <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mt-1.5">
                    Requested: &le; {auction.deliveryTimeline} days
                  </p>
                </div>

                <div className="md:col-span-3 flex flex-col">
                  {planFeatures.canOfferDiscounts ? (
                    showDiscountField ? (
                      <div className="animate-fade-in flex flex-col h-full">
                        <label className="block text-xs font-bold text-emerald-700 uppercase tracking-wider mb-2 flex items-center gap-1">
                          🎁 Bulk Discount (%)
                        </label>
                        <input
                          type="number"
                          min="0"
                          max="100"
                          value={bidForm.discountOffered || ''}
                          onChange={(e) => setBidForm({ ...bidForm, discountOffered: e.target.value })}
                          className="w-full px-4 py-2.5 border border-emerald-200 bg-emerald-50 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 font-bold text-base text-emerald-700"
                          placeholder="0"
                        />
                        <p className="text-[9px] text-emerald-600 font-bold uppercase tracking-wider mt-2 leading-tight">
                          Applies only if Retailer awards you the entire auction.
                        </p>
                      </div>
                    ) : (
                      auction.items?.length > 1 && (
                        <div className="h-full border border-dashed border-gray-200 rounded-lg bg-gray-50/50 flex flex-col items-center justify-center p-3 text-center min-h-[76px]">
                          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Bulk Discount</p>
                          <p className="text-[9px] text-gray-500 font-medium leading-tight">Bid on all items to unlock the bulk discount field.</p>
                        </div>
                      )
                    )
                  ) : (
                    <div className="h-full border border-gray-200 rounded-lg bg-gray-50 flex flex-col items-center justify-center p-3 text-center min-h-[76px]">
                      <span className="text-xl mb-1">🔒</span>
                      <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-0.5">Bulk Discount Locked</p>
                      <p className="text-[9px] text-indigo-500 font-bold cursor-pointer hover:underline">Upgrade to Premium</p>
                    </div>
                  )}
                </div>

                <div className="md:col-span-6 lg:col-span-4 flex flex-col justify-between">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
                      Notes (Optional)
                    </label>
                    <input
                      type="text"
                      value={bidForm.notes}
                      onChange={(e) => setBidForm({ ...bidForm, notes: e.target.value })}
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm placeholder-gray-400"
                      placeholder="Any specific terms or quality assurances..."
                    />
                  </div>
                  <div className="flex gap-4 mt-2">
                    <label className="flex items-center gap-2 cursor-pointer group">
                      <input
                        type="checkbox"
                        checked={bidForm.freeDelivery}
                        onChange={(e) => setBidForm({ ...bidForm, freeDelivery: e.target.checked })}
                        className="w-4 h-4 text-emerald-600 rounded cursor-pointer border-gray-300 focus:ring-emerald-500"
                      />
                      <span className="text-xs font-bold text-gray-600 group-hover:text-gray-900 transition">Free Delivery</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer group">
                      <input
                        type="checkbox"
                        checked={bidForm.qualityGuarantee}
                        onChange={(e) => setBidForm({ ...bidForm, qualityGuarantee: e.target.checked })}
                        className="w-4 h-4 text-purple-600 rounded cursor-pointer border-gray-300 focus:ring-purple-500"
                      />
                      <span className="text-xs font-bold text-gray-600 group-hover:text-gray-900 transition">Quality Guarantee</span>
                    </label>
                  </div>
                </div>

                <div className="xl:col-span-1 flex flex-col justify-end h-full">
                  <div className="bg-blue-50/50 p-3 rounded-t-lg border-b border-blue-100 flex flex-col items-end justify-center">
                    <span className="text-[10px] font-bold text-blue-800 uppercase tracking-wider mb-0.5">Total Value</span>
                    <span className={`text-lg font-black tracking-tight ${showDiscountField && bidForm.discountOffered > 0 ? 'text-blue-300 line-through text-sm' : 'text-blue-900'}`}>
                      ₹{calculatedTotal.toLocaleString()}
                    </span>
                    {showDiscountField && bidForm.discountOffered > 0 && (
                      <span className="text-lg font-black text-emerald-600">
                        ₹{(calculatedTotal * (1 - Number(bidForm.discountOffered) / 100)).toFixed(0)} <span className="text-[10px] uppercase tracking-wider ml-0.5 text-emerald-600/70">total</span>
                      </span>
                    )}
                  </div>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-b-lg transition disabled:opacity-50 text-sm uppercase tracking-wider"
                  >
                    {isSubmitting ? 'Processing...' : userBid ? 'Update Bid' : 'Submit Bid'}
                  </button>
                </div>
              </form>
            )}
          </div>
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
                          {bid.freeDelivery && <span className="text-[10px] font-bold bg-green-50 text-green-700 border border-green-200 px-2 py-0.5 rounded">Free Delivery</span>}
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
