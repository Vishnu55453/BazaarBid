import { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import { Truck, Plus, Trash2, LogOut } from 'lucide-react';
import api from '../services/api';

const VEHICLE_TYPES = ['Mini Truck (Tata Ace)', 'Pickup (Bolero)', 'Tempo (407)', 'Truck (6-Wheeler)', 'Heavy Truck (10+ Wheeler)', 'Refrigerated Truck'];

const Dashboard = () => {
  const { user, logout } = useAuth();
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  
  const [form, setForm] = useState({
    vehicleType: VEHICLE_TYPES[0],
    registrationNumber: '',
    capacityKg: '',
    city: ''
  });

  const fetchVehicles = async () => {
    try {
      const res = await api.get('/api/logistics/vehicles');
      setVehicles(res.vehicles || []);
    } catch (err) {
      toast.error('Failed to load vehicles');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchVehicles(); }, []);

  const handleAdd = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post('/api/logistics/vehicles', {
        ...form,
        capacityKg: Number(form.capacityKg)
      });
      setVehicles(res.vehicles);
      setShowAdd(false);
      toast.success('Vehicle added');
    } catch (err) {
      toast.error(err.message || 'Failed to add vehicle');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Remove this vehicle?')) return;
    try {
      const res = await api.delete(`/api/logistics/vehicles/${id}`);
      setVehicles(res.vehicles);
      toast.success('Vehicle removed');
    } catch (err) {
      toast.error('Failed to remove vehicle');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <nav className="bg-white border-b border-slate-200">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 flex h-16 justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-600 text-white">
              <Truck size={20} />
            </div>
            <span className="text-xl font-bold text-slate-900 tracking-tight">Delivery Portal</span>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm font-semibold text-slate-600 hidden sm:block">{user?.name}</span>
            <button onClick={logout} className="text-slate-500 hover:text-rose-600 p-2 rounded-lg hover:bg-rose-50 transition">
              <LogOut size={20} />
            </button>
          </div>
        </div>
      </nav>

      <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">My Fleet</h1>
            <p className="text-sm text-slate-500 mt-1">Manage your vehicles available for booking</p>
          </div>
          <button 
            onClick={() => setShowAdd(!showAdd)} 
            className="flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white px-4 py-2 rounded-xl font-bold text-sm shadow-md transition"
          >
            {showAdd ? 'Cancel' : <><Plus size={18} /> Add Vehicle</>}
          </button>
        </div>

        {showAdd && (
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 mb-8 max-w-3xl">
            <h2 className="text-lg font-bold text-slate-900 mb-4">Add New Vehicle</h2>
            <form onSubmit={handleAdd} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Vehicle Type</label>
                <select 
                  className="w-full rounded-xl border-slate-200 bg-slate-50 py-2.5 text-sm font-medium focus:ring-indigo-500 focus:border-indigo-500"
                  value={form.vehicleType}
                  onChange={e => setForm({...form, vehicleType: e.target.value})}
                >
                  {VEHICLE_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Registration Plate</label>
                <input required placeholder="MH-04-AB-1234" className="w-full rounded-xl border-slate-200 bg-slate-50 py-2.5 text-sm font-medium focus:ring-indigo-500 focus:border-indigo-500" value={form.registrationNumber} onChange={e => setForm({...form, registrationNumber: e.target.value})} />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Capacity (KG)</label>
                <input required type="number" placeholder="e.g. 1500" className="w-full rounded-xl border-slate-200 bg-slate-50 py-2.5 text-sm font-medium focus:ring-indigo-500 focus:border-indigo-500" value={form.capacityKg} onChange={e => setForm({...form, capacityKg: e.target.value})} />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Operating City</label>
                <input required placeholder="e.g. Mumbai" className="w-full rounded-xl border-slate-200 bg-slate-50 py-2.5 text-sm font-medium focus:ring-indigo-500 focus:border-indigo-500" value={form.city} onChange={e => setForm({...form, city: e.target.value})} />
              </div>
              <div className="sm:col-span-2 pt-2">
                <button type="submit" className="w-full sm:w-auto bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2.5 px-6 rounded-xl shadow-md transition">
                  Save Vehicle
                </button>
              </div>
            </form>
          </div>
        )}

        {loading ? (
          <div className="text-center py-12 text-slate-500 font-medium">Loading fleet...</div>
        ) : vehicles.length === 0 ? (
          <div className="bg-white border border-slate-200 rounded-3xl p-12 text-center shadow-sm">
            <div className="mx-auto w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4">
              <Truck size={32} className="text-slate-400" />
            </div>
            <h3 className="text-lg font-bold text-slate-900">No vehicles added yet</h3>
            <p className="text-slate-500 mt-2 max-w-sm mx-auto text-sm">Add your trucks and tempos here so sellers can find you and book you for deliveries.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {vehicles.map(v => (
              <div key={v._id} className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm hover:shadow-md transition group relative overflow-hidden">
                <div className="absolute top-0 right-0 w-16 h-16 bg-indigo-50 rounded-bl-full -mr-8 -mt-8 transition-transform group-hover:scale-110" />
                
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="font-bold text-slate-900">{v.vehicleType}</h3>
                    <p className="text-xs font-mono font-bold text-indigo-600 bg-indigo-50 px-2 py-1 rounded-md inline-block mt-1 uppercase">
                      {v.registrationNumber}
                    </p>
                  </div>
                  <button onClick={() => handleDelete(v._id)} className="text-slate-400 hover:text-rose-500 hover:bg-rose-50 p-2 rounded-lg transition relative z-10">
                    <Trash2 size={18} />
                  </button>
                </div>
                
                <div className="grid grid-cols-2 gap-4 mt-6 pt-4 border-t border-slate-100">
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Capacity</p>
                    <p className="font-bold text-slate-800 text-sm mt-0.5">{v.capacityKg} KG</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">City</p>
                    <p className="font-bold text-slate-800 text-sm mt-0.5">{v.city}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default Dashboard;
