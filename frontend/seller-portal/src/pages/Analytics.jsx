import { useEffect, useState } from 'react';
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { TrendingUp, Package, IndianRupee, MapPin, Lock } from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-hot-toast';

export default function Analytics() {
    const { user } = useAuth();
    const [data, setData] = useState(null);
    const [heatmapData, setHeatmapData] = useState([]);
    const [loading, setLoading] = useState(true);

    const canViewDemandHeatmaps = user?.features?.canViewDemandHeatmaps;

    useEffect(() => {
        const fetchAnalytics = async () => {
            try {
                const res = await api.get('/api/analytics/seller');
                setData(res);
                
                if (canViewDemandHeatmaps) {
                    const heatmapRes = await api.get('/api/analytics/demand-heatmap');
                    if (heatmapRes.success) {
                        setHeatmapData(heatmapRes.heatmapData);
                    }
                }
            } catch (err) {
                toast.error('Failed to load analytics');
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchAnalytics();
    }, []);

    if (loading) {
        return (
            <div className="flex h-[60vh] items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    if (!data) return null;

    return (
        <div className="space-y-6 pb-12">
            <div>
                <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">Analytics Overview</h1>
                <p className="text-gray-500 text-sm mt-1">Track your wholesale revenue over the last 7 days.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex items-center gap-4">
                    <div className="p-4 bg-emerald-50 text-emerald-600 rounded-xl">
                        <IndianRupee className="w-6 h-6" />
                    </div>
                    <div>
                        <p className="text-sm font-medium text-gray-500">7-Day Revenue</p>
                        <p className="text-2xl font-bold text-gray-900">₹{data.totalRevenueLast7Days?.toLocaleString('en-IN')}</p>
                    </div>
                </div>

                <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex items-center gap-4">
                    <div className="p-4 bg-blue-50 text-blue-600 rounded-xl">
                        <Package className="w-6 h-6" />
                    </div>
                    <div>
                        <p className="text-sm font-medium text-gray-500">7-Day Orders</p>
                        <p className="text-2xl font-bold text-gray-900">{data.totalOrdersLast7Days}</p>
                    </div>
                </div>

                <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex items-center gap-4">
                    <div className="p-4 bg-indigo-50 text-indigo-600 rounded-xl">
                        <TrendingUp className="w-6 h-6" />
                    </div>
                    <div>
                        <p className="text-sm font-medium text-gray-500">Growth Trend</p>
                        <p className="text-2xl font-bold text-gray-900">Active</p>
                    </div>
                </div>
            </div>

            {/* Revenue Chart */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                <h3 className="text-lg font-bold text-gray-900 mb-6">Revenue Trend (Last 7 Days)</h3>
                <div className="h-[400px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={data.chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                            <defs>
                                <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                                </linearGradient>
                            </defs>
                            <XAxis dataKey="date" stroke="#9ca3af" fontSize={12} tickLine={false} axisLine={false} />
                            <YAxis stroke="#9ca3af" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `₹${value}`} />
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                            <Tooltip 
                                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                formatter={(value) => [`₹${value}`, 'Revenue']}
                            />
                            <Area type="monotone" dataKey="revenue" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#colorRevenue)" />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Demand Heatmap Section */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 relative overflow-hidden">
                {!canViewDemandHeatmaps && (
                    <div className="absolute inset-0 z-10 bg-white/70 backdrop-blur-sm flex flex-col items-center justify-center">
                        <div className="bg-white p-8 rounded-3xl shadow-xl text-center max-w-sm border border-amber-100">
                            <div className="w-16 h-16 bg-amber-50 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Lock className="w-8 h-8 text-amber-500" />
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 mb-2">Demand Heatmaps</h3>
                            <p className="text-gray-500 text-sm mb-6">See exactly which cities have the highest active demand for bulk supplies.</p>
                            <button className="bg-gradient-to-r from-amber-500 to-orange-500 text-white font-bold py-2 px-6 rounded-full w-full hover:from-amber-600 hover:to-orange-600 transition shadow-lg shadow-amber-200">
                                Upgrade to Premium
                            </button>
                        </div>
                    </div>
                )}
                
                <div className="flex items-center gap-2 mb-6">
                    <MapPin className="w-5 h-5 text-rose-500" />
                    <h3 className="text-lg font-bold text-gray-900">City Demand Heatmap (Active Auctions)</h3>
                </div>
                
                <div className="h-[350px] w-full">
                    {canViewDemandHeatmaps && heatmapData.length > 0 ? (
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={heatmapData} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f3f4f6" />
                                <XAxis type="number" hide />
                                <YAxis dataKey="location" type="category" axisLine={false} tickLine={false} width={100} tick={{ fill: '#4b5563', fontSize: 13, fontWeight: 500 }} />
                                <Tooltip 
                                    cursor={{ fill: '#f8fafc' }}
                                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                />
                                <Bar dataKey="activeAuctions" name="Active Auctions" fill="#f43f5e" radius={[0, 6, 6, 0]} barSize={24} />
                            </BarChart>
                        </ResponsiveContainer>
                    ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gray-50 rounded-xl border border-dashed border-gray-200">
                            <p className="text-gray-400 font-medium">No active demand data available yet.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
