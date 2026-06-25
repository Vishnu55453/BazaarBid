import { useState, useEffect } from 'react';
import {
  User, Phone, Mail, MapPin, Store, ShieldCheck,
  Building2, Edit3, Save, X, FileText, Hash, Crown
} from 'lucide-react';
import api from '../services/api';
import Loader from '../components/common/Loader';
import { toast } from 'react-hot-toast';
import ReviewsModal from '../components/ReviewsModal';

const MARKET_OPTIONS = [
  { value: 'vashi_fruit', label: 'Vashi Fruit Market' },
  { value: 'vashi_veg', label: 'Vashi Vegetable Market' },
  { value: 'byculla_fruit', label: 'Byculla Fruit Market' },
  { value: 'vashi_dry_fruit', label: 'Vashi Dry Fruit Market' },
];
const MARKET_LABELS = Object.fromEntries(MARKET_OPTIONS.map(o => [o.value, o.label]));

const GST_REGEX = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;

// ─── Reusable read-only field ─────────────────────────────────────────────────
const InfoRow = ({ label, value, mono }) => (
  <div>
    <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-0.5">{label}</p>
    <p className={`font-semibold text-gray-800 text-sm ${mono ? 'font-mono tracking-widest' : ''}`}>
      {value || <span className="text-gray-300 italic font-normal">Not provided</span>}
    </p>
  </div>
);

// ─── Reusable input field ─────────────────────────────────────────────────────
const Field = ({ label, name, value, onChange, type = 'text', required, readOnly, mono, placeholder, maxLength, children }) => (
  <div>
    <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-1">
      {label}{required && <span className="text-red-400 ml-0.5">*</span>}
    </label>
    {children || (
      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        required={required}
        readOnly={readOnly}
        maxLength={maxLength}
        placeholder={placeholder}
        className={`w-full rounded-xl border border-gray-200 px-3 py-2 text-sm outline-none transition
          ${readOnly ? 'bg-gray-50 text-gray-400 cursor-not-allowed' : 'bg-white focus:border-blue-400 focus:ring-2 focus:ring-blue-50'}
          ${mono ? 'font-mono tracking-widest' : ''}`}
      />
    )}
  </div>
);

// ─── Main Component ───────────────────────────────────────────────────────────
const Profile = () => {
  const [profile, setProfile] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState(false);
  const [error, setError] = useState(null);
  const [gstError, setGstError] = useState('');
  const [reviewsModalOpen, setReviewsModalOpen] = useState(false);

  // Flat form state for easy controlled inputs
  const [form, setForm] = useState({
    name: '', phone: '',
    city: '', pincode: '', area: '',
    shopName: '', shopNumber: '', gstNumber: '',
    marketName: '', minOrderQty: 50,
  });

  const fetchProfile = async () => {
    try {
      setIsLoading(true);
      const res = await api.get('/api/auth/me');
      if (res.success) {
        const u = res.user;
        setProfile(u);
        setForm({
          name: u.name || '',
          phone: u.phone || '',
          city: u.location?.city || '',
          pincode: u.location?.pincode || '',
          area: u.location?.area || '',
          shopName: u.bigMarketProfile?.shopName || '',
          shopNumber: u.bigMarketProfile?.shopNumber || '',
          gstNumber: u.bigMarketProfile?.gstNumber || '',
          marketName: u.bigMarketProfile?.marketName || 'vashi_fruit',
          minOrderQty: u.bigMarketProfile?.minOrderQty || 50,
        });
      }
    } catch (err) {
      setError(err.message || 'Failed to load profile');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { fetchProfile(); }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    const val = name === 'gstNumber' ? value.toUpperCase() : value;
    setForm(prev => ({ ...prev, [name]: val }));
    if (name === 'gstNumber') {
      setGstError(val && !GST_REGEX.test(val) ? 'Invalid GST format (e.g. 27AAPFU0939F1ZV)' : '');
    }
  };

  const handleCancel = () => {
    // Reset form back to saved profile values
    const u = profile;
    setForm({
      name: u.name || '',
      phone: u.phone || '',
      city: u.location?.city || '',
      pincode: u.location?.pincode || '',
      area: u.location?.area || '',
      shopName: u.bigMarketProfile?.shopName || '',
      shopNumber: u.bigMarketProfile?.shopNumber || '',
      gstNumber: u.bigMarketProfile?.gstNumber || '',
      marketName: u.bigMarketProfile?.marketName || 'vashi_fruit',
      minOrderQty: u.bigMarketProfile?.minOrderQty || 50,
    });
    setGstError('');
    setEditing(false);
  };

  const handleSave = async () => {
    if (gstError) return toast.error('Fix GST number before saving');
    if (form.gstNumber && !GST_REGEX.test(form.gstNumber)) {
      setGstError('Invalid GST format');
      return;
    }
    // Validate pincode — must be exactly 6 digits if provided
    if (form.pincode && !/^[1-9][0-9]{5}$/.test(form.pincode)) {
      return toast.error('Pincode must be a valid 6-digit number (e.g. 400703)');
    }

    // Build location object — only attach pincode when it is non-empty and valid
    const location = { city: form.city, area: form.area || form.marketName };
    if (form.pincode) location.pincode = form.pincode;

    setSaving(true);
    try {
      await api.put('/api/auth/profile', {
        name: form.name,
        phone: form.phone,
        location,
        bigMarketProfile: {
          shopName: form.shopName,
          shopNumber: form.shopNumber,
          gstNumber: form.gstNumber,
          marketName: form.marketName,
          minOrderQty: Number(form.minOrderQty),
        }
      });
      toast.success('Profile updated successfully!');
      setEditing(false);
      fetchProfile();
    } catch (err) {
      toast.error(err.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  if (isLoading) return <Loader text="Loading your profile..." />;
  if (error || !profile) {
    return (
      <div className="bg-red-50 text-red-600 p-6 rounded-xl border border-red-200">
        <h3 className="font-bold mb-1">Error Loading Profile</h3>
        <p>{error || 'Profile not found.'}</p>
      </div>
    );
  }

  const isVerified = profile.bigMarketProfile?.verified;
  const hasGST = !!(profile.bigMarketProfile?.gstNumber);

  return (
    <div className="space-y-6 max-w-8xl pb-12">

      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-widest text-blue-500 mb-1">Big Market Seller</p>
          <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">My Profile</h1>
          <p className="text-gray-500 text-sm mt-1">Manage your seller account and business details.</p>
        </div>
        {!editing ? (
          <button
            onClick={() => setEditing(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-bold text-xs shadow-md shadow-blue-100 transition"
          >
            <Edit3 className="w-3.5 h-3.5" /> Edit Profile
          </button>
        ) : (
          <div className="flex gap-2">
            <button
              onClick={handleCancel}
              className="flex items-center gap-1.5 px-3 py-2.5 border border-gray-200 text-gray-500 rounded-2xl font-bold text-xs hover:bg-gray-50 transition"
            >
              <X className="w-3.5 h-3.5" /> Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={saving || !!gstError}
              className="flex items-center gap-1.5 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white rounded-2xl font-bold text-xs shadow-md shadow-emerald-100 transition"
            >
              <Save className="w-3.5 h-3.5" /> {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        )}
      </div>

      {/* Hero Banner */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 rounded-2xl p-6 text-white">
        <div className="flex items-start gap-5">
          <div className="w-16 h-16 rounded-2xl bg-white/20 flex items-center justify-center flex-shrink-0">
            <Store className="w-8 h-8 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            {editing ? (
              <input
                name="shopName"
                value={form.shopName}
                onChange={handleChange}
                placeholder="Shop / Business Name"
                className="text-xl font-extrabold bg-white/10 border border-white/30 rounded-xl px-3 py-1.5 text-white placeholder-white/50 outline-none w-full mb-2"
              />
            ) : (
              <h2 className="text-2xl font-extrabold truncate">{profile.bigMarketProfile?.shopName || profile.name}</h2>
            )}
            <p className="text-blue-100 text-sm">{MARKET_LABELS[form.marketName] || 'Big Market Seller'}</p>
            <div className="flex flex-wrap items-center gap-2 mt-3">
              <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold gap-1.5 ${isVerified ? 'bg-green-400/20 text-green-100' : 'bg-yellow-400/20 text-yellow-100'}`}>
                <ShieldCheck className="w-3.5 h-3.5" />
                {isVerified ? 'Verified Seller' : 'Verification Pending'}
              </span>
              {hasGST && !editing && (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-white/10 text-white gap-1.5">
                  <FileText className="w-3.5 h-3.5" /> GST Registered
                </span>
              )}
              {!editing && (
                <button 
                  onClick={() => setReviewsModalOpen(true)}
                  className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-white/10 hover:bg-white/20 text-white gap-1.5 transition ml-auto"
                >
                  <span className="text-yellow-400">★</span> 
                  {profile?.rating?.average || 0} ({profile?.rating?.count || 0} Reviews)
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Subscription & Billing (Read-Only) */}
      {!editing && profile.subscription && (
        <div className={`rounded-2xl shadow-sm border p-5 ${
          profile.subscription.planCode === 'premium_seller' 
            ? 'bg-gradient-to-r from-amber-50 to-orange-50 border-amber-200'
            : 'bg-white border-gray-100'
        }`}>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center">
              <Crown className={`w-5 h-5 mr-3 ${
                profile.subscription.planCode === 'premium_seller' ? 'text-amber-500' : 'text-gray-400'
              }`} />
              <h3 className="font-bold text-gray-900">Subscription Plan</h3>
            </div>
            {profile.subscription.planCode === 'free_seller' && (
              <button className="px-4 py-2 bg-gradient-to-r from-amber-500 to-orange-500 text-white font-bold text-xs rounded-full shadow-md hover:from-amber-600 hover:to-orange-600 transition">
                Upgrade to Premium
              </button>
            )}
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-0.5">Current Plan</p>
              <p className={`font-bold ${
                profile.subscription.planCode === 'premium_seller' ? 'text-amber-600' : 'text-gray-800'
              }`}>
                {profile.subscription.planCode === 'premium_seller' ? 'Premium Supplier' : 'Free Supplier'}
              </p>
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-0.5">Bids Placed</p>
              <p className="font-bold text-gray-800">
                {profile.usageMetrics?.bidsThisMonth || 0}
                {profile.subscription.planCode === 'free_seller' && ' / 5'}
              </p>
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-0.5">Billing Cycle</p>
              <p className="font-bold text-gray-800">
                {new Date(profile.subscription.billingCycleStart).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' })}
              </p>
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-0.5">Status</p>
              <p className="font-bold text-emerald-600">Active</p>
            </div>
          </div>
        </div>
      )}

      {/* ── Details Cards ─────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

        {/* Owner Info */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
          <div className="flex items-center mb-4">
            <User className="w-5 h-5 text-blue-600 mr-3" />
            <h3 className="font-bold text-gray-900">Owner Information</h3>
          </div>
          <div className="space-y-3">
            {editing ? (
              <>
                <Field label="Full Name" name="name" value={form.name} onChange={handleChange} required placeholder="Owner's full name" />
              </>
            ) : (
              <>
                <InfoRow label="Full Name" value={profile.name} />
                <InfoRow label="Registered Role" value={profile.role?.replace(/_/g, ' ')} />
              </>
            )}
          </div>
        </div>

        {/* Contact */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
          <div className="flex items-center mb-4">
            <Mail className="w-5 h-5 text-blue-600 mr-3" />
            <h3 className="font-bold text-gray-900">Contact Details</h3>
          </div>
          <div className="space-y-3">
            {editing ? (
              <>
                <Field label="Email" name="email" value={profile.email} readOnly type="email" />
                <Field label="Phone" name="phone" value={form.phone} onChange={handleChange} type="tel" maxLength={10} placeholder="10-digit number" />
              </>
            ) : (
              <>
                <InfoRow label="Email" value={profile.email} />
                <InfoRow label="Phone" value={profile.phone} />
              </>
            )}
          </div>
        </div>

        {/* Market / Shop Details */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
          <div className="flex items-center mb-4">
            <Building2 className="w-5 h-5 text-blue-600 mr-3" />
            <h3 className="font-bold text-gray-900">Market Details</h3>
          </div>
          <div className="space-y-3">
            {editing ? (
              <>
                <Field label="Market">
                  <select name="marketName" value={form.marketName} onChange={handleChange}
                    className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-50 transition">
                    {MARKET_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                  </select>
                </Field>
                <Field label="Shop / Business Name" name="shopName" value={form.shopName} onChange={handleChange} placeholder="Patil Agro Traders" />
                <Field label="Shop / Stall Number" name="shopNumber" value={form.shopNumber} onChange={handleChange} placeholder="e.g. A-42, Gate 3" />
                <Field label="Min Order Qty (kg)" name="minOrderQty" value={form.minOrderQty} onChange={handleChange} type="number" placeholder="50" />
              </>
            ) : (
              <>
                <InfoRow label="Market" value={MARKET_LABELS[profile.bigMarketProfile?.marketName] || profile.bigMarketProfile?.marketName} />
                <InfoRow label="Shop Name" value={profile.bigMarketProfile?.shopName} />
                <InfoRow label="Shop / Stall Number" value={profile.bigMarketProfile?.shopNumber} />
                <InfoRow label="Min Order Qty" value={profile.bigMarketProfile?.minOrderQty ? `${profile.bigMarketProfile.minOrderQty} kg` : null} />
              </>
            )}
          </div>
        </div>

        {/* GST & Compliance */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
          <div className="flex items-center mb-4">
            <FileText className="w-5 h-5 text-blue-600 mr-3" />
            <h3 className="font-bold text-gray-900">GST & Compliance</h3>
          </div>
          <div className="space-y-3">
            {editing ? (
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-1">
                  GST Number <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  name="gstNumber"
                  value={form.gstNumber}
                  onChange={handleChange}
                  maxLength={15}
                  placeholder="27AAPFU0939F1ZV"
                  className={`w-full rounded-xl border px-3 py-2 text-sm font-mono tracking-widest outline-none transition
                    ${gstError ? 'border-red-300 focus:border-red-400 bg-red-50' : 'border-gray-200 focus:border-blue-400 focus:ring-2 focus:ring-blue-50'}`}
                />
                {gstError && <p className="text-xs text-red-500 mt-1 font-medium">{gstError}</p>}
                {!gstError && form.gstNumber.length === 15 && (
                  <p className="text-xs text-emerald-600 mt-1 font-bold">✓ Valid GST format</p>
                )}
                <p className="text-xs text-gray-400 mt-1.5">Used on invoices and for platform verification.</p>
              </div>
            ) : (
              <>
                <InfoRow label="GST Number" value={profile.bigMarketProfile?.gstNumber} mono />
                {profile.bigMarketProfile?.gstNumber ? (
                  <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-100 rounded-xl px-3 py-2">
                    <ShieldCheck className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                    <p className="text-xs text-emerald-700 font-semibold">GST will appear on all tax invoices</p>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 bg-amber-50 border border-amber-100 rounded-xl px-3 py-2">
                    <Hash className="w-4 h-4 text-amber-500 flex-shrink-0" />
                    <p className="text-xs text-amber-700 font-semibold">Add GST to generate compliant invoices</p>
                  </div>
                )}
              </>
            )}
          </div>
        </div>

        {/* Location */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 sm:col-span-2">
          <div className="flex items-center mb-4">
            <MapPin className="w-5 h-5 text-blue-600 mr-3" />
            <h3 className="font-bold text-gray-900">Location</h3>
          </div>
          <div className={`grid gap-3 ${editing ? 'grid-cols-1 sm:grid-cols-3' : 'grid-cols-3'}`}>
            {editing ? (
              <>
                <Field label="City" name="city" value={form.city} onChange={handleChange} placeholder="Mumbai" />
                <Field label="Pincode" name="pincode" value={form.pincode} onChange={handleChange} maxLength={6} placeholder="400703" />
                <Field label="Area / Locality" name="area" value={form.area} onChange={handleChange} placeholder="Vashi" />
              </>
            ) : (
              <>
                <InfoRow label="City" value={profile.location?.city} />
                <InfoRow label="Pincode" value={profile.location?.pincode} />
                <InfoRow label="Area / Locality" value={profile.location?.area} />
              </>
            )}
          </div>
        </div>

      </div>

      {/* Account meta */}
      {!editing && (
        <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4 flex flex-wrap gap-6 text-xs text-slate-400">
          <span>Account ID: <span className="font-mono text-slate-600">{profile.id || profile._id}</span></span>
          <span>Member since: <span className="font-semibold text-slate-600">{new Date(profile.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</span></span>
          <span>KYC Status: <span className={`font-bold capitalize ${profile.kycStatus === 'verified' ? 'text-emerald-600' : 'text-amber-500'}`}>{profile.kycStatus}</span></span>
        </div>
      )}

      <ReviewsModal 
        isOpen={reviewsModalOpen}
        onClose={() => setReviewsModalOpen(false)}
        userId={profile?._id || profile?.id}
        userName={profile?.name || 'You'}
      />
    </div>
  );
};

export default Profile;
