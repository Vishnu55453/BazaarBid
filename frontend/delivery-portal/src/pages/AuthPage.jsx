import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import { Truck } from 'lucide-react';

const AuthPage = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const { login, register } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    licenseNumber: ''
  });

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (isLogin) {
        await login({ email: form.email, password: form.password });
        navigate('/');
      } else {
        const payload = { ...form, role: 'delivery_partner', deliveryProfile: { licenseNumber: form.licenseNumber } };
        await register(payload);
        toast.success('Registration successful. Awaiting admin verification.');
        setIsLogin(true);
      }
    } catch (err) {
      toast.error(err.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-slate-50">
      <div className="flex w-full flex-col justify-center px-4 sm:px-6 lg:flex-none lg:w-1/2 lg:px-20 xl:px-24">
        <div className="mx-auto w-full max-w-sm lg:w-96">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-600 text-white shadow-lg">
              <Truck size={24} />
            </div>
            <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">Delivery Portal</h2>
          </div>
          <h2 className="mt-8 text-2xl font-bold leading-9 tracking-tight text-gray-900">
            {isLogin ? 'Sign in to your account' : 'Register as a partner'}
          </h2>

          <div className="mt-10">
            <form onSubmit={handleSubmit} className="space-y-6">
              {!isLogin && (
                <>
                  <div>
                    <label className="block text-sm font-bold text-gray-700">Full Name</label>
                    <input name="name" type="text" required onChange={handleChange} className="mt-2 block w-full rounded-xl border-0 py-2.5 px-3 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-indigo-600 sm:text-sm sm:leading-6" />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700">Phone Number</label>
                    <input name="phone" type="tel" required onChange={handleChange} className="mt-2 block w-full rounded-xl border-0 py-2.5 px-3 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-indigo-600 sm:text-sm sm:leading-6" />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700">Driving License Number</label>
                    <input name="licenseNumber" type="text" required onChange={handleChange} className="mt-2 block w-full rounded-xl border-0 py-2.5 px-3 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-indigo-600 sm:text-sm sm:leading-6" />
                  </div>
                </>
              )}
              
              <div>
                <label className="block text-sm font-bold text-gray-700">Email address</label>
                <input name="email" type="email" required onChange={handleChange} className="mt-2 block w-full rounded-xl border-0 py-2.5 px-3 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-indigo-600 sm:text-sm sm:leading-6" />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700">Password</label>
                <input name="password" type="password" required onChange={handleChange} className="mt-2 block w-full rounded-xl border-0 py-2.5 px-3 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-indigo-600 sm:text-sm sm:leading-6" />
              </div>

              <button type="submit" disabled={loading} className="flex w-full justify-center rounded-xl bg-indigo-600 px-3 py-3 text-sm font-bold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:opacity-50">
                {loading ? 'Processing...' : (isLogin ? 'Sign in' : 'Register')}
              </button>
            </form>

            <div className="mt-8 text-center text-sm">
              <span className="text-gray-500">
                {isLogin ? "Don't have an account?" : "Already have an account?"}
              </span>{' '}
              <button onClick={() => setIsLogin(!isLogin)} className="font-bold text-indigo-600 hover:text-indigo-500">
                {isLogin ? 'Register now' : 'Sign in'}
              </button>
            </div>
          </div>
        </div>
      </div>
      <div className="relative hidden w-0 flex-1 lg:block bg-slate-900">
        <div className="absolute inset-0 h-full w-full object-cover opacity-20 bg-[url('https://images.unsplash.com/photo-1519003722824-194d4455a60c?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80')]" />
        <div className="absolute inset-0 flex flex-col justify-center px-20">
            <h2 className="text-5xl font-black text-white leading-tight">Deliver wholesale<br/>agricultural goods.</h2>
            <p className="text-xl text-slate-300 mt-6 max-w-lg">Join BazaarBid's logistics network. Add your vehicles, manage your availability, and get direct bookings from Big Market Sellers.</p>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;
