import { useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { TrendingUp, Wallet, IndianRupee } from 'lucide-react';
import api from '../../services/api';
import { toast } from 'react-hot-toast';

export default function Analytics() {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchAnalytics = async () => {
            try {
                const res = await api.get('/api/analytics/retailer');
                setData(res);
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
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
            </div>
        );
    }

    if (!data) return null;

    const profit = data.totalSalesRevenue - data.totalSourcingCost;
    const profitMargin = data.totalSalesRevenue > 0 
        ? ((profit / data.totalSalesRevenue) * 100).toFixed(1) 
        : 0;

    return (
        <div className="space-y-6 pb-12">
            <div>
                <p className="text-[11px] font-bold uppercase tracking-widest text-indigo-500 mb-1">Business Overview</p>
                <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Analytics & Profitability</h1>
                <p className="text-slate-500 text-sm mt-1">Track your sourcing costs from auctions versus retail sales.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 flex items-center gap-4">
                    <div className="p-4 bg-emerald-50 text-emerald-600 rounded-xl">
                        <IndianRupee className="w-6 h-6" />
                    </div>
                    <div>
                        <p className="text-sm font-medium text-slate-500">Retail Revenue</p>
                        <p className="text-2xl font-bold text-slate-900">₹{data.totalSalesRevenue?.toLocaleString('en-IN')}</p>
                    </div>
                </div>

                <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 flex items-center gap-4">
                    <div className="p-4 bg-rose-50 text-rose-600 rounded-xl">
                        <Wallet className="w-6 h-6" />
                    </div>
                    <div>
                        <p className="text-sm font-medium text-slate-500">Wholesale Costs</p>
                        <p className="text-2xl font-bold text-slate-900">₹{data.totalSourcingCost?.toLocaleString('en-IN')}</p>
                    </div>
                </div>

                <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 flex items-center gap-4">
                    <div className="p-4 bg-indigo-50 text-indigo-600 rounded-xl">
                        <TrendingUp className="w-6 h-6" />
                    </div>
                    <div>
                        <p className="text-sm font-medium text-slate-500">Profit Margin</p>
                        <p className="text-2xl font-bold text-slate-900">{profitMargin}%</p>
                        <p className="text-xs text-indigo-500 font-bold mt-1">₹{profit.toLocaleString('en-IN')} net</p>
                    </div>
                </div>
            </div>

            {/* Profit Margin Chart */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
                <h3 className="text-lg font-bold text-slate-900 mb-6">Revenue vs Costs (Last 7 Days)</h3>
                <div className="h-[400px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={data.chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                            <XAxis dataKey="date" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                            <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `₹${value}`} />
                            <Tooltip 
                                contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                cursor={{ fill: '#f8fafc' }}
                                formatter={(value) => [`₹${value}`]}
                            />
                            <Legend wrapperStyle={{ paddingTop: '20px' }} />
                            <Bar dataKey="salesRevenue" name="Sales Revenue" fill="#10b981" radius={[4, 4, 0, 0]} barSize={20} />
                            <Bar dataKey="sourcingCost" name="Sourcing Costs" fill="#f43f5e" radius={[4, 4, 0, 0]} barSize={20} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>
    );
}
