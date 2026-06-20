import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { toast } from 'react-hot-toast';

const Invoice = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

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

  if (isLoading) return (
    <div className="flex flex-col items-center justify-center min-h-[400px]">
      <div className="w-12 h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mb-4"></div>
      <p className="text-slate-500 font-medium">Generating Invoice...</p>
    </div>
  );
  if (!order) return <div className="p-8 text-center text-slate-500">Invoice not found.</div>;

  const buyer = order.buyerId;
  const seller = order.sellerId;
  
  // For Kirana Seller to End Consumer
  const sellerName = seller?.kiranaProfile?.asSeller?.shopName || seller?.name || 'Retailer';
  const buyerName = buyer?.name || 'Customer';

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12">
      {/* Action Bar (hidden in print) */}
      <div className="flex items-center justify-between print:hidden">
        <button 
          onClick={() => navigate(-1)}
          className="flex items-center text-slate-600 hover:text-slate-900 transition-colors font-medium text-sm"
        >
          <span className="mr-2">←</span> Back
        </button>
        <div className="flex items-center gap-3">
          <button 
            onClick={handlePrint}
            className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg font-medium text-sm hover:bg-indigo-700 transition shadow-sm"
          >
            <span className="mr-2">🖨️</span> Print Bill
          </button>
        </div>
      </div>

      {/* Invoice Document */}
      <div className="bg-white border border-slate-200 shadow-lg rounded-xl overflow-hidden print:shadow-none print:border-none print:m-0">
        
        {/* Header */}
        <div className="p-8 md:p-10 border-b border-slate-200 bg-slate-50 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div>
            <h1 className="text-3xl font-black text-indigo-900 tracking-tight uppercase">Retail Bill</h1>
            <p className="text-slate-500 text-sm mt-1 font-medium">BazaarBid Local Shopping</p>
          </div>
          <div className="text-left md:text-right">
            <p className="text-sm text-slate-500 mb-1">Order Number</p>
            <p className="text-lg font-bold text-slate-900">{order.orderNumber || order._id?.slice(-6).toUpperCase()}</p>
            <div className="mt-3 flex gap-6 text-sm">
              <div>
                <span className="text-slate-500 block text-xs">Date of Issue</span>
                <span className="font-semibold text-slate-800">{new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
              </div>
              <div>
                <span className="text-slate-500 block text-xs">Payment</span>
                <span className="font-semibold text-slate-800 uppercase">{order.paymentDetails?.method || 'Pending'}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Addresses */}
        <div className="p-8 md:p-10 grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12">
          {/* Billed By */}
          <div className="space-y-4">
            <div className="inline-flex items-center px-3 py-1 bg-indigo-50 text-indigo-700 text-xs font-bold uppercase tracking-wider rounded">
              Billed By (Shop)
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <span className="text-xl">🏪</span> {sellerName}
              </h3>
              <div className="mt-3 space-y-2 text-sm text-slate-600 pl-7">
                <p className="flex items-start gap-2">
                  <span className="text-slate-400 mt-0.5">📍</span>
                  <span>{seller?.location?.area || 'Area'}, {seller?.location?.city || 'City'}</span>
                </p>
                <p className="flex items-center gap-2">
                  <span className="text-slate-400">📞</span>
                  {seller?.phone || 'N/A'}
                </p>
              </div>
            </div>
          </div>

          {/* Billed To */}
          <div className="space-y-4">
            <div className="inline-flex items-center px-3 py-1 bg-emerald-50 text-emerald-700 text-xs font-bold uppercase tracking-wider rounded">
              Billed To (Customer)
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <span className="text-xl">👤</span> {buyerName}
              </h3>
              <div className="mt-3 space-y-2 text-sm text-slate-600 pl-7">
                <p className="flex items-start gap-2">
                  <span className="text-slate-400 mt-0.5">📍</span>
                  <span>
                    {order.deliveryAddress?.addressLine1 && `${order.deliveryAddress.addressLine1}, `}
                    {order.deliveryAddress?.area && `${order.deliveryAddress.area}, `}
                    {order.deliveryAddress?.city} - {order.deliveryAddress?.pincode}
                  </span>
                </p>
                <p className="flex items-center gap-2">
                  <span className="text-slate-400">📞</span>
                  {buyer?.phone || 'N/A'}
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
                      <p className="font-bold text-slate-900">{item.productName || item.productId?.name}</p>
                    </td>
                    <td className="px-4 py-4 text-right font-medium text-slate-700">
                      {item.quantity} {item.unit}
                    </td>
                    <td className="px-4 py-4 text-right font-medium text-slate-700">
                      ₹{item.pricePerUnit?.toFixed(2) || (item.totalPrice / item.quantity).toFixed(2)}
                    </td>
                    <td className="px-4 py-4 text-right font-bold text-slate-900">
                      ₹{(item.totalPrice || (item.quantity * item.pricePerUnit)).toFixed(2)}
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
              <span>Platform Fee</span>
              <span className="font-medium">₹{(order.platformCommission || 0).toFixed(2)}</span>
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

        {/* Footer */}
        <div className="bg-slate-50 p-6 md:p-8 border-t border-slate-200 text-center md:text-left flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-slate-500">
          <p>Thank you for shopping local on BazaarBid!</p>
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
