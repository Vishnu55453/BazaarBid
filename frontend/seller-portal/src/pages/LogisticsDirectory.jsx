import { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { Truck, Phone, Search, MapPin, Weight } from 'lucide-react';
import api from '../services/api';
import Loader from '../components/common/Loader';

const LogisticsDirectory = () => {
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    minCapacity: '',
    city: ''
  });

  const fetchDirectory = async () => {
    setLoading(true);
    try {
      const query = new URLSearchParams();
      if (filters.minCapacity) query.append('minCapacity', filters.minCapacity);
      if (filters.city) query.append('city', filters.city);

      const res = await api.get(`/api/logistics/directory?${query.toString()}`);
      setVehicles(res.vehicles || []);
    } catch (err) {
      toast.error('Failed to load logistics directory');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDirectory();
  }, [filters]);

  const handleFilterChange = (e) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  };

  return (
    <div className="space-y-6 pb-12">
      <div>
        <p className="text-[11px] font-bold uppercase tracking-widest text-indigo-500 mb-1">Fleet Directory</p>
        <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">Find Logistics Partners</h1>
        <p className="text-gray-500 text-sm mt-1">
          Search and contact verified delivery partners to ship your bulk orders.
        </p>
      </div>

      {/* Search Filters */}
      <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-sm flex flex-col sm:flex-row gap-4">
        <div className="flex-1 relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Weight size={18} className="text-gray-400" />
          </div>
          <input
            type="number"
            name="minCapacity"
            placeholder="Min Capacity (KG)"
            value={filters.minCapacity}
            onChange={handleFilterChange}
            className="block w-full pl-10 pr-3 py-2 border border-gray-200 rounded-xl text-sm focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>
        <div className="flex-1 relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <MapPin size={18} className="text-gray-400" />
          </div>
          <input
            type="text"
            name="city"
            placeholder="Operating City"
            value={filters.city}
            onChange={handleFilterChange}
            className="block w-full pl-10 pr-3 py-2 border border-gray-200 rounded-xl text-sm focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>
      </div>

      {/* Results */}
      {loading ? (
        <Loader text="Searching fleet..." />
      ) : vehicles.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl shadow-sm border border-gray-100">
          <div className="w-16 h-16 bg-indigo-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <Search className="text-indigo-400" size={32} />
          </div>
          <h3 className="text-base font-bold text-gray-900">No vehicles found</h3>
          <p className="text-gray-400 text-xs mt-1">Try adjusting your capacity or city filters.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {vehicles.map((v) => (
            <div key={v.vehicleId} className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm hover:shadow-md transition">
              <div className="flex items-start gap-4 mb-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-100 text-indigo-600 shrink-0">
                  <Truck size={24} />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 text-base">{v.vehicleType}</h3>
                  <p className="text-xs text-gray-500 mt-0.5">Operated by <span className="font-semibold text-gray-700">{v.driverName}</span></p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-5 p-3 bg-gray-50 rounded-xl">
                <div>
                  <p className="text-[10px] font-bold uppercase text-gray-400">Load Capacity</p>
                  <p className="font-bold text-gray-800 text-sm mt-0.5">{v.capacityKg} KG</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase text-gray-400">City</p>
                  <p className="font-bold text-gray-800 text-sm mt-0.5">{v.city}</p>
                </div>
              </div>

              <a
                href={`tel:${v.driverPhone}`}
                className="flex items-center justify-center w-full gap-2 bg-indigo-600 hover:bg-indigo-700 text-white py-2.5 rounded-xl font-bold text-sm shadow-sm transition"
              >
                <Phone size={16} /> Call Driver
              </a>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default LogisticsDirectory;
