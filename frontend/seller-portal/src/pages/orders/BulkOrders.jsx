import { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import Loader from '../../components/common/Loader';
import StatusBadge from '../../components/common/StatusBadge';

// ─── Status flow definition ──────────────────────────────────────────────────
const STATUS_FLOW = ['pending', 'confirmed', 'processing', 'shipped', 'out_for_delivery', 'delivered'];
const STATUS_FILTERS = ['all', 'pending', 'confirmed', 'processing', 'shipped', 'out_for_delivery', 'delivered', 'cancelled'];

const STATUS_NEXT = {
  pending:          { label: 'Confirm Order',       next: 'confirmed',        color: 'indigo' },
  confirmed:        { label: 'Start Processing',     next: 'processing',       color: 'violet' },
  processing:       { label: 'Mark as Shipped',      next: 'shipped',          color: 'amber' },
  shipped:          { label: 'Out for Delivery',     next: 'out_for_delivery', color: 'orange' },
  out_for_delivery: { label: 'Mark Delivered',       next: 'delivered',        color: 'emerald' },
};

const STEP_LABELS = ['Pending', 'Confirmed', 'Processing', 'Shipped', 'Out for Delivery', 'Delivered'];

const BTN_COLORS = {
  indigo:  'bg-indigo-600 hover:bg-indigo-700 shadow-indigo-100',
  violet:  'bg-violet-600 hover:bg-violet-700 shadow-violet-100',
  amber:   'bg-amber-500 hover:bg-amber-600 shadow-amber-100',
  orange:  'bg-orange-500 hover:bg-orange-600 shadow-orange-100',
  emerald: 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-100',
};

// ─── Single order card ────────────────────────────────────────────────────────
function OrderCard({ order, onStatusUpdate, onCancelOrder }) {
  const [updating, setUpdating] = useState(false);
  const navigate = useNavigate();
  const nextStatus = STATUS_NEXT[order.status];
  const progressIdx = STATUS_FLOW.indexOf(order.status);

  const handleNext = async () => {
    if (!nextStatus) return;

    if (order.status === 'pending') {
      const msg = "Confirm this order?\n\nThis will officially accept the wholesale auction contract, generate the Tax Invoice (Bill) with your GST, and notify the Kirana Retailer.";
      if (!window.confirm(msg)) return;
    } else {
      if (!window.confirm(`Move order to "${nextStatus.next.replace(/_/g, ' ')}"?`)) return;
    }

    setUpdating(true);
    try {
      await onStatusUpdate(order._id, nextStatus.next);
    } finally {
      setUpdating(false);
    }
  };

  const handleCancel = async () => {
    const reason = window.prompt("Reason for rejecting/cancelling this order:");
    if (!reason) return;
    
    setUpdating(true);
    try {
      await onCancelOrder(order._id, reason);
    } finally {
      setUpdating(false);
    }
  };

  const borderColor =
    order.status === 'pending'   ? 'border-amber-200 bg-amber-50/30' :
    order.status === 'cancelled' ? 'border-rose-100 opacity-70'      :
    order.status === 'delivered' ? 'border-emerald-100'              :
                                   'border-slate-200';

  return (
    <div className={`bg-white border rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all ${borderColor}`}>
      {/* Card header */}
      <div className="p-5 pb-0">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 mb-4">
          <div>
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <p className="text-sm font-black text-gray-900">
                {order.buyerId?.name || 'Kirana Shop'}
              </p>
              <span className="text-[10px] font-bold text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full font-mono">
                #{order._id?.slice(-6).toUpperCase()}
              </span>
              <StatusBadge status={order.status} />
            </div>
            <p className="text-xs text-gray-500">
              {order.buyerId?.phone && `📞 ${order.buyerId.phone} · `}
              {new Date(order.createdAt).toLocaleDateString('en-IN', {
                day: 'numeric', month: 'short', year: 'numeric',
                hour: '2-digit', minute: '2-digit'
              })}
            </p>
          </div>
          <div className="text-right flex-shrink-0">
            <p className="text-2xl font-black text-gray-900">₹{(order.totalAmount || 0).toLocaleString('en-IN')}</p>
            <p className={`text-[10px] font-extrabold uppercase mt-0.5 ${
              order.paymentMethod === 'cod' ? 'text-amber-600' : 'text-emerald-600'
            }`}>
              {order.paymentMethod === 'cod' ? '💵 COD' : '✅ Bank Transfer'}
            </p>
          </div>
        </div>

        {/* Progress bar */}
        {order.status !== 'cancelled' && (
          <div className="mb-4">
            <div className="flex items-center gap-0.5">
              {STATUS_FLOW.map((s, i) => (
                <div key={s} className="flex items-center flex-1 min-w-0">
                  <div className={`h-1.5 w-full rounded-full transition-all duration-500 ${
                    i <= progressIdx ? 'bg-blue-500' : 'bg-gray-100'
                  }`} />
                </div>
              ))}
            </div>
            <div className="flex justify-between mt-1">
              {STEP_LABELS.map((label, i) => (
                <span key={label} className={`text-[9px] font-bold ${
                  i === progressIdx ? 'text-blue-600' : i < progressIdx ? 'text-gray-400' : 'text-gray-200'
                }`} style={{ width: `${100 / STEP_LABELS.length}%`, textAlign: i === 0 ? 'left' : i === STEP_LABELS.length - 1 ? 'right' : 'center' }}>
                  {label}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Items */}
        <div className="bg-gray-50 rounded-xl p-3 space-y-2 mb-4">
          {(order.items || []).map((item, idx) => (
            <div key={idx} className="flex items-center justify-between text-xs">
              <span className="text-gray-700 font-semibold truncate flex-1 mr-2">
                {item.productName || item.name || 'Product'}
              </span>
              <span className="text-gray-500 flex-shrink-0">
                {item.quantity} {item.unit} × ₹{item.pricePerUnit}
              </span>
              <span className="font-bold text-gray-900 ml-3 flex-shrink-0">
                ₹{item.totalPrice || (item.quantity * item.pricePerUnit)}
              </span>
            </div>
          ))}
          <div className="border-t border-gray-200 pt-2 flex justify-between text-xs">
            <span className="text-gray-400 font-medium">Delivery charges</span>
            <span className="font-semibold text-gray-600">₹{order.deliveryCharges || 0}</span>
          </div>
        </div>

        {/* Delivery Address */}
        {order.deliveryAddress && (
          <div className="flex items-start gap-2 text-xs text-gray-500 mb-4">
            <svg className="w-3.5 h-3.5 text-gray-400 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <span>
              {[
                order.deliveryAddress.recipientName,
                order.deliveryAddress.fullAddress || order.deliveryAddress.area,
                order.deliveryAddress.city,
                order.deliveryAddress.pincode,
              ].filter(Boolean).join(', ')}
            </span>
          </div>
        )}
      </div>

      {/* Action footer */}
      <div className="px-5 pb-5">
        <div className="flex items-center gap-3">
          {order.status === 'pending' && (
            <button
              onClick={handleCancel}
              disabled={updating}
              className="flex-1 rounded-xl font-bold text-sm py-2.5 text-rose-600 bg-rose-50 hover:bg-rose-100 border border-rose-200 transition disabled:opacity-40"
            >
              Reject Order
            </button>
          )}

          {nextStatus && order.status !== 'cancelled' && (
            <button
              onClick={handleNext}
              disabled={updating}
              className={`flex-[2] rounded-xl font-bold text-sm py-2.5 text-white transition shadow-md disabled:opacity-40 ${BTN_COLORS[nextStatus.color]}`}
            >
              {updating ? 'Updating...' : `→ ${nextStatus.label}`}
            </button>
          )}

          {/* Show the Bill/Invoice button as soon as the order is confirmed */}
          {['confirmed', 'processing', 'shipped', 'out_for_delivery', 'delivered'].includes(order.status) && (
            <button
              onClick={() => navigate(`/orders/${order._id}/invoice`)}
              className="flex-shrink-0 text-xs font-bold text-indigo-600 hover:text-indigo-800 py-2.5 px-4 border border-indigo-200 rounded-xl hover:bg-indigo-50 transition bg-white"
            >
              View Bill
            </button>
          )}
        </div>

        {order.status === 'delivered' && (
          <div className="mt-3 text-center text-xs text-emerald-600 font-bold py-2 bg-emerald-50 rounded-xl">
            ✅ Order Delivered Successfully
          </div>
        )}
        
        {order.status === 'cancelled' && (
          <div className="mt-3 text-center text-xs text-rose-500 font-bold py-2 bg-rose-50 rounded-xl">
            ✕ Order Cancelled
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
const BulkOrders = () => {
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('all');

  const fetchOrders = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const res = await api.get('/api/orders/seller-orders');
      setOrders(res.orders || []);
    } catch (err) {
      setError(err.message || 'Failed to load orders');
      toast.error('Could not load orders');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { fetchOrders(); }, []);

  const handleStatusUpdate = async (orderId, newStatus) => {
    try {
      await api.put(`/api/orders/${orderId}/status`, { status: newStatus });
      setOrders(prev => prev.map(o => o._id === orderId ? { ...o, status: newStatus } : o));
      toast.success(`Order marked as ${newStatus.replace(/_/g, ' ')}`);
    } catch (err) {
      toast.error(err.message || 'Failed to update status');
    }
  };

  const handleCancelOrder = async (orderId, reason) => {
    try {
      await api.put(`/api/orders/${orderId}/cancel`, { reason });
      setOrders(prev => prev.map(o => o._id === orderId ? { ...o, status: 'cancelled' } : o));
      toast.success('Order cancelled successfully');
    } catch (err) {
      toast.error(err.message || 'Failed to cancel order');
    }
  };

  const filtered = filter === 'all' ? orders : orders.filter(o => o.status === filter);

  const stats = {
    pending:   orders.filter(o => o.status === 'pending').length,
    active:    orders.filter(o => ['confirmed', 'processing', 'shipped', 'out_for_delivery'].includes(o.status)).length,
    delivered: orders.filter(o => o.status === 'delivered').length,
    earnings:  orders.filter(o => o.status === 'delivered').reduce((s, o) => s + (o.sellerEarnings || o.totalAmount || 0), 0),
  };

  if (isLoading) return <Loader text="Loading bulk orders..." />;

  return (
    <div className="space-y-6 pb-12">
      {/* Page header */}
      <div>
        <p className="text-[11px] font-bold uppercase tracking-widest text-blue-500 mb-1">Big Market Seller</p>
        <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">Bulk Orders</h1>
        <p className="text-gray-500 text-sm mt-1">
          Confirm → Process → Ship → Deliver wholesale orders to Kirana shops.
        </p>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: 'Awaiting Confirmation', value: stats.pending,   accent: 'text-amber-600',   bg: 'bg-amber-50'   },
          { label: 'In Progress',           value: stats.active,    accent: 'text-indigo-600',  bg: 'bg-indigo-50'  },
          { label: 'Delivered',             value: stats.delivered, accent: 'text-emerald-600', bg: 'bg-emerald-50' },
          { label: 'Net Earnings',          value: `₹${stats.earnings.toLocaleString('en-IN')}`, accent: 'text-gray-900', bg: 'bg-gray-50' },
        ].map(s => (
          <div key={s.label} className={`${s.bg} border border-gray-200 rounded-2xl px-4 py-4`}>
            <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">{s.label}</p>
            <p className={`text-2xl font-black mt-1 ${s.accent}`}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2 flex-wrap">
        {STATUS_FILTERS.map(f => {
          const count = f === 'all' ? orders.length : orders.filter(o => o.status === f).length;
          return (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1.5 rounded-full text-xs font-bold capitalize transition-all ${
                filter === f
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-200'
                  : 'bg-white border border-gray-200 text-gray-500 hover:border-gray-300'
              }`}
            >
              {f.replace(/_/g, ' ')} {count > 0 && <span className="ml-0.5 opacity-70">({count})</span>}
            </button>
          );
        })}
        <button
          onClick={fetchOrders}
          className="ml-auto px-3 py-1.5 rounded-full text-xs font-bold bg-white border border-gray-200 text-gray-500 hover:border-blue-300 hover:text-blue-600 transition"
        >
          ↻ Refresh
        </button>
      </div>

      {/* Error */}
      {error && (
        <div className="bg-red-50 text-red-600 p-4 rounded-xl border border-red-200 text-sm">{error}</div>
      )}

      {/* Order list */}
      {filtered.length === 0 && !isLoading ? (
        <div className="text-center py-16 bg-white rounded-2xl shadow-sm border border-gray-100">
          <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-7 h-7 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
            </svg>
          </div>
          <h3 className="text-base font-bold text-gray-900">
            {filter !== 'all' ? `No ${filter.replace(/_/g, ' ')} orders` : 'No orders yet'}
          </h3>
          <p className="text-gray-400 text-xs mt-1">
            {filter !== 'all'
              ? 'Try a different filter above.'
              : 'Orders from Kirana shops will appear here once you win auctions.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {filtered.map(order => (
            <OrderCard key={order._id} order={order} onStatusUpdate={handleStatusUpdate} onCancelOrder={handleCancelOrder} />
          ))}
        </div>
      )}
    </div>
  );
};

export default BulkOrders;
