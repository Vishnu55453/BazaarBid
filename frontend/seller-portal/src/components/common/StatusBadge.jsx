const StatusBadge = ({ status }) => {
  const getStatusStyles = (s) => {
    switch (s?.toLowerCase()) {
      // Auction Statuses
      case 'open':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'closed':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      case 'won':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'completed':
        return 'bg-green-100 text-green-800 border-green-200';
      
      // Order Statuses
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'confirmed':
        return 'bg-indigo-100 text-indigo-800 border-indigo-200';
      case 'processing':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'shipped':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'out_for_delivery':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'delivered':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'cancelled':
        return 'bg-red-100 text-red-800 border-red-200';
        
      // Bid Statuses
      case 'active':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'lost':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      case 'withdrawn':
        return 'bg-red-100 text-red-800 border-red-200';

      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const formatStatus = (s) => {
    if (!s) return 'Unknown';
    return s.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
  };

  return (
    <span className={`px-2.5 py-1 rounded-full text-xs font-medium border ${getStatusStyles(status)}`}>
      {formatStatus(status)}
    </span>
  );
};

export default StatusBadge;
