import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Printer, ArrowLeft, Download, Building2, User, Phone, MapPin, Star } from 'lucide-react';
import api from '../../services/api';
import Loader from '../../components/common/Loader';
import { toast } from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';

const Invoice = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [order, setOrder] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Rating state
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [review, setReview] = useState('');
  const [isSubmittingRating, setIsSubmittingRating] = useState(false);

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        setIsLoading(true);
        const res = await api.get(`/api/orders/${id}`);
        if (res.success) {
          setOrder(res.order);
        }
      } catch (error) {
        toast.error('Failed to load invoice details');
      } finally {
        setIsLoading(false);
      }
    };
    fetchOrder();
  }, [id]);

  if (isLoading) return <Loader text="Generating Invoice..." />;
  if (!order) return <div className="p-8 text-center text-slate-500">Invoice not found.</div>;

  const buyer = order.buyerId;
  const seller = order.sellerId;
  const buyerGST = buyer?.kiranaProfile?.asBuyer?.gstNumber || 'N/A';
  const sellerGST = seller?.bigMarketProfile?.gstNumber || 'N/A';
  const sellerName = seller?.bigMarketProfile?.businessName || seller?.name || 'Seller';
  const buyerName = buyer?.kiranaProfile?.asBuyer?.deliveryAddress?.shopName || buyer?.name || 'Buyer';

  const handlePrint = () => {
    window.print();
  };

  const isBuyer = user?.id === buyer?._id || user?._id === buyer?._id;
  const isSeller = user?.id === seller?._id || user?._id === seller?._id;

  const hasRated = isBuyer ? order.buyerRated : (isSeller ? order.sellerRated : false);
  const existingRating = isBuyer ? order.buyerRating : (isSeller ? order.sellerRating : null);
  const targetName = isBuyer ? sellerName : buyerName;

  const submitRating = async () => {
    if (rating === 0) {
      toast.error('Please select a star rating.');
      return;
    }
    setIsSubmittingRating(true);
    try {
      const res = await api.post(`/api/orders/${id}/rate`, { rating, review });
      if (res.success) {
        toast.success('Thank you for rating!');
        setOrder({
          ...order,
          [isBuyer ? 'buyerRated' : 'sellerRated']: true,
          [isBuyer ? 'buyerRating' : 'sellerRating']: res.rating
        });
      }
    } catch (err) {
      toast.error(err.message || 'Failed to submit rating');
    } finally {
      setIsSubmittingRating(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12">
      {/* Action Bar (hidden in print) */}
      <div className="flex items-center justify-between print:hidden">
        <button 
          onClick={() => navigate(-1)}
          className="flex items-center text-slate-600 hover:text-slate-900 transition-colors font-medium text-sm"
        >
          <ArrowLeft className="w-4 h-4 mr-2" /> Back
        </button>
        <div className="flex items-center gap-3">
          <button 
            onClick={handlePrint}
            className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg font-medium text-sm hover:bg-indigo-700 transition shadow-sm"
          >
            <Printer className="w-4 h-4 mr-2" /> Print Bill
          </button>
        </div>
      </div>

      {/* Invoice Document */}
      <div className="bg-white border border-slate-200 shadow-lg rounded-xl overflow-hidden print:shadow-none print:border-none print:m-0">
        
        {/* Header */}
        <div className="p-8 md:p-10 border-b border-slate-200 bg-slate-50 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div>
            <h1 className="text-3xl font-black text-indigo-900 tracking-tight uppercase">Tax Invoice</h1>
            <p className="text-slate-500 text-sm mt-1 font-medium">BazaarBid Wholesale</p>
          </div>
          <div className="text-left md:text-right">
            <p className="text-sm text-slate-500 mb-1">Invoice Number</p>
            <p className="text-lg font-bold text-slate-900">{order.orderNumber}</p>
            <div className="mt-3 flex gap-6 text-sm">
              <div>
                <span className="text-slate-500 block text-xs">Date of Issue</span>
                <span className="font-semibold text-slate-800">{new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
              </div>
              <div>
                <span className="text-slate-500 block text-xs">Payment Method</span>
                <span className="font-semibold text-slate-800 uppercase">{order.paymentMethod ? order.paymentMethod.replace('_', ' ') : 'Pending'}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Addresses */}
        <div className="p-8 md:p-10 grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12">
          {/* Billed By */}
          <div className="space-y-4">
            <div className="inline-flex items-center px-3 py-1 bg-indigo-50 text-indigo-700 text-xs font-bold uppercase tracking-wider rounded">
              Billed By (Seller)
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <Building2 className="w-5 h-5 text-slate-400" /> {sellerName}
              </h3>
              <div className="mt-3 space-y-2 text-sm text-slate-600 pl-7">
                <p className="flex items-start gap-2">
                  <MapPin className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                  <span>{seller?.location?.city || 'City'}, {seller?.location?.pincode || 'Pincode'}</span>
                </p>
                <p className="flex items-center gap-2">
                  <Phone className="w-4 h-4 text-slate-400" />
                  {seller?.phone || 'N/A'}
                </p>
                <p className="flex items-center gap-2">
                  <span className="font-semibold text-slate-400">GST:</span>
                  <span className="font-mono bg-slate-100 px-1.5 py-0.5 rounded text-slate-800">{sellerGST}</span>
                </p>
              </div>
            </div>
          </div>

          {/* Billed To */}
          <div className="space-y-4">
            <div className="inline-flex items-center px-3 py-1 bg-emerald-50 text-emerald-700 text-xs font-bold uppercase tracking-wider rounded">
              Billed To (Buyer)
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <User className="w-5 h-5 text-slate-400" /> {buyerName}
              </h3>
              <div className="mt-3 space-y-2 text-sm text-slate-600 pl-7">
                <p className="flex items-start gap-2">
                  <MapPin className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                  <span>
                    {order.deliveryAddress?.area && `${order.deliveryAddress.area}, `}
                    {order.deliveryAddress?.city} - {order.deliveryAddress?.pincode}
                  </span>
                </p>
                <p className="flex items-center gap-2">
                  <Phone className="w-4 h-4 text-slate-400" />
                  {buyer?.phone || 'N/A'}
                </p>
                <p className="flex items-center gap-2">
                  <span className="font-semibold text-slate-400">GST:</span>
                  <span className="font-mono bg-slate-100 px-1.5 py-0.5 rounded text-slate-800">{buyerGST}</span>
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Items Table */}
        <div className="px-8 md:px-10 pb-8">
          <div className="border border-slate-200 rounded-xl overflow-hidden">
            <table className="w-full text-left">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="px-4 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">Item Description</th>
                  <th className="px-4 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Qty</th>
                  <th className="px-4 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Rate</th>
                  <th className="px-4 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {order.items.map((item, index) => (
                  <tr key={index}>
                    <td className="px-4 py-4">
                      <p className="font-bold text-slate-900">{item.productName}</p>
                      {order.orderType === 'auction_won' && <p className="text-xs text-slate-500 mt-0.5">Auction Awarded</p>}
                    </td>
                    <td className="px-4 py-4 text-right font-medium text-slate-700">
                      {item.quantity} {item.unit}
                    </td>
                    <td className="px-4 py-4 text-right font-medium text-slate-700">
                      ₹{item.pricePerUnit?.toFixed(2) || (item.totalPrice / item.quantity).toFixed(2)}
                    </td>
                    <td className="px-4 py-4 text-right font-bold text-slate-900">
                      ₹{item.totalPrice.toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Totals */}
        <div className="px-8 md:px-10 pb-10 flex justify-end">
          <div className="w-full md:w-1/2 lg:w-1/3 space-y-3">
            <div className="flex justify-between text-sm text-slate-600">
              <span>Subtotal</span>
              <span className="font-medium">₹{order.subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm text-slate-600">
              <span>Delivery Charges</span>
              <span className="font-medium">₹{order.deliveryCharges.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm text-slate-600">
              <span>Platform Fee / Taxes</span>
              <span className="font-medium">₹{(order.platformCommission + order.tax).toFixed(2)}</span>
            </div>
            {order.discount > 0 && (
              <div className="flex justify-between text-sm text-emerald-600">
                <span>Discount</span>
                <span className="font-medium">-₹{order.discount.toFixed(2)}</span>
              </div>
            )}
            <div className="pt-3 border-t border-slate-200 flex justify-between items-center">
              <span className="text-base font-bold text-slate-900 uppercase">Grand Total</span>
              <span className="text-2xl font-black text-indigo-600">₹{order.totalAmount.toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* Rating Section (Only if delivered) */}
        {order.status === 'delivered' && (isBuyer || isSeller) && (
          <div className="px-8 md:px-10 pb-10 print:hidden">
            <div className="bg-gray-50 border border-gray-200 rounded-xl p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">
                {hasRated ? `Your review for ${targetName}` : `Rate your experience with ${targetName}`}
              </h3>
              
              {hasRated ? (
                <div className="space-y-2">
                  <div className="flex gap-1">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className={`w-6 h-6 ${i < existingRating?.score ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`} />
                    ))}
                  </div>
                  {existingRating?.review && (
                    <p className="text-gray-600 italic bg-white p-3 rounded-lg border border-gray-100 shadow-sm mt-3">"{existingRating.review}"</p>
                  )}
                  <p className="text-xs text-green-600 font-bold uppercase tracking-wider mt-2">✓ Review Submitted</p>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex gap-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setRating(star)}
                        onMouseEnter={() => setHoverRating(star)}
                        onMouseLeave={() => setHoverRating(0)}
                        className="transition-transform hover:scale-110 focus:outline-none"
                      >
                        <Star className={`w-8 h-8 ${(hoverRating || rating) >= star ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`} />
                      </button>
                    ))}
                  </div>
                  <textarea
                    rows="3"
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none text-sm"
                    placeholder="Tell us about the product quality, communication, and overall experience... (Optional)"
                    value={review}
                    onChange={(e) => setReview(e.target.value)}
                  ></textarea>
                  <button
                    onClick={submitRating}
                    disabled={isSubmittingRating || rating === 0}
                    className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-bold rounded-xl transition shadow-sm"
                  >
                    {isSubmittingRating ? 'Submitting...' : 'Submit Rating'}
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="bg-slate-50 p-6 md:p-8 border-t border-slate-200 text-center md:text-left flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-slate-500">
          <p>Thank you for doing business on BazaarBid!</p>
          <p className="font-medium">Authorized Signatory</p>
        </div>
      </div>
      
      {/* Print Styles */}
      <style>{`
        @media print {
          body { background-color: white; }
          .print\\:hidden { display: none !important; }
          .print\\:shadow-none { box-shadow: none !important; }
          .print\\:border-none { border: none !important; }
          .print\\:m-0 { margin: 0 !important; }
        }
      `}</style>
    </div>
  );
};

export default Invoice;
