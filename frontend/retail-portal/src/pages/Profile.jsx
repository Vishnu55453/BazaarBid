import { useEffect, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import api from '../services/api'
import { toast } from 'react-hot-toast'
import ReviewsModal from '../components/ReviewsModal'

function ProfileSection({ title, children }) {
  return (
    <div className="bg-white border border-slate-200 rounded-[24px] p-6 shadow-sm space-y-4">
      <h2 className="text-sm font-black text-slate-700 uppercase tracking-wider">{title}</h2>
      {children}
    </div>
  )
}

function InfoRow({ label, value, badge }) {
  return (
    <div className="flex items-center justify-between py-2.5 border-b border-slate-50 last:border-0">
      <span className="text-xs text-slate-400 font-semibold">{label}</span>
      <div className="flex items-center gap-2">
        {badge && <span className="text-[9px] font-extrabold bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full uppercase">{badge}</span>}
        <span className="text-xs font-bold text-slate-800 text-right max-w-[180px] truncate">{value || '—'}</span>
      </div>
    </div>
  )
}

function AddressesTab({ profile, setProfile }) {
  const [addresses, setAddresses] = useState(profile?.kiranaProfile?.asBuyer?.deliveryAddresses || [])
  const [adding, setAdding] = useState(false)
  const [form, setForm] = useState({ shopName: '', area: '', city: '', pincode: '', isDefault: false })

  const handleAdd = async (e) => {
    e.preventDefault()
    try {
      const res = await api.post('/api/premium/addresses', form)
      if (res.success) {
        setAddresses(res.addresses)
        setProfile(p => ({
          ...p,
          kiranaProfile: {
            ...p.kiranaProfile,
            asBuyer: { ...p.kiranaProfile.asBuyer, deliveryAddresses: res.addresses }
          }
        }))
        setAdding(false)
        setForm({ shopName: '', area: '', city: '', pincode: '', isDefault: false })
        toast.success('Address added successfully')
      }
    } catch (err) {
      toast.error(err.response?.data?.message || err.message || 'Failed to add address')
    }
  }

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this address?')) return
    try {
      const res = await api.delete(`/api/premium/addresses/${id}`)
      if (res.success) {
        setAddresses(res.addresses)
        setProfile(p => ({
          ...p,
          kiranaProfile: {
            ...p.kiranaProfile,
            asBuyer: { ...p.kiranaProfile.asBuyer, deliveryAddresses: res.addresses }
          }
        }))
        toast.success('Address deleted')
      }
    } catch (err) {
      toast.error(err.response?.data?.message || err.message || 'Failed to delete')
    }
  }

  const handleSetDefault = async (id) => {
    try {
      const res = await api.put(`/api/premium/addresses/${id}/default`)
      if (res.success) {
        setAddresses(res.addresses)
        setProfile(p => ({
          ...p,
          kiranaProfile: {
            ...p.kiranaProfile,
            asBuyer: { ...p.kiranaProfile.asBuyer, deliveryAddresses: res.addresses }
          }
        }))
        toast.success('Default address updated')
      }
    } catch (err) {
      toast.error('Failed to set default')
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-bold">Delivery Branches</h2>
        <button onClick={() => setAdding(!adding)} className="bg-indigo-600 text-white px-4 py-2 rounded-xl text-xs font-bold">
          {adding ? 'Cancel' : '+ Add Address'}
        </button>
      </div>

      {adding && (
        <form onSubmit={handleAdd} className="bg-white p-4 border rounded-2xl space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <input placeholder="Branch / Shop Name" required className="border p-2 rounded-xl text-sm w-full" value={form.shopName} onChange={e => setForm(p => ({...p, shopName: e.target.value}))} />
            <input placeholder="Area / Locality" required className="border p-2 rounded-xl text-sm w-full" value={form.area} onChange={e => setForm(p => ({...p, area: e.target.value}))} />
            <input placeholder="City" required className="border p-2 rounded-xl text-sm w-full" value={form.city} onChange={e => setForm(p => ({...p, city: e.target.value}))} />
            <input placeholder="Pincode" maxLength={6} required className="border p-2 rounded-xl text-sm w-full" value={form.pincode} onChange={e => setForm(p => ({...p, pincode: e.target.value}))} />
          </div>
          <div className="flex items-center gap-2">
            <input type="checkbox" checked={form.isDefault} onChange={e => setForm(p => ({...p, isDefault: e.target.checked}))} />
            <label className="text-xs font-bold text-slate-600">Set as default</label>
          </div>
          <button type="submit" className="bg-emerald-600 text-white px-4 py-2 rounded-xl text-xs font-bold w-full">Save Address</button>
        </form>
      )}

      <div className="grid gap-4">
        {addresses.map(addr => (
          <div key={addr._id || addr.area} className={`p-4 border rounded-2xl flex justify-between items-center ${addr.isDefault ? 'border-indigo-400 bg-indigo-50' : 'bg-white'}`}>
            <div>
              <div className="flex items-center gap-2">
                <p className="font-bold">{addr.shopName}</p>
                {addr.isDefault && <span className="bg-indigo-600 text-white text-[10px] px-2 py-0.5 rounded-full">Default</span>}
              </div>
              <p className="text-sm text-slate-500">{addr.area}, {addr.city} - {addr.pincode}</p>
            </div>
            <div className="flex gap-2">
              {!addr.isDefault && (
                <button onClick={() => handleSetDefault(addr._id)} className="text-xs font-bold text-indigo-600 bg-indigo-100 px-3 py-1.5 rounded-lg">Set Default</button>
              )}
              <button onClick={() => handleDelete(addr._id)} className="text-xs font-bold text-red-600 bg-red-100 px-3 py-1.5 rounded-lg">Delete</button>
            </div>
          </div>
        ))}
        {addresses.length === 0 && <p className="text-sm text-slate-500">No addresses saved.</p>}
      </div>
    </div>
  )
}

function StaffTab({ profile }) {
  const [staff, setStaff] = useState([])
  const [loading, setLoading] = useState(true)
  const [adding, setAdding] = useState(false)
  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '' })

  const fetchStaff = async () => {
    try {
      const res = await api.get('/api/premium/staff')
      if (res.success) setStaff(res.staff)
    } catch (err) {
      toast.error('Failed to load staff')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchStaff() }, [])

  const handleAdd = async (e) => {
    e.preventDefault()
    try {
      const res = await api.post('/api/premium/staff', form)
      if (res.success) {
        toast.success('Staff added')
        setAdding(false)
        setForm({ name: '', email: '', phone: '', password: '' })
        fetchStaff()
      }
    } catch (err) {
      toast.error(err.response?.data?.message || err.message || 'Failed to add staff')
    }
  }

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to remove this staff member?')) return
    try {
      const res = await api.delete(`/api/premium/staff/${id}`)
      if (res.success) {
        toast.success('Staff removed')
        fetchStaff()
      }
    } catch (err) {
      toast.error('Failed to remove staff')
    }
  }

  if (loading) return <div>Loading...</div>

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-bold">Staff Management</h2>
        <button onClick={() => setAdding(!adding)} className="bg-indigo-600 text-white px-4 py-2 rounded-xl text-xs font-bold">
          {adding ? 'Cancel' : '+ Add Staff'}
        </button>
      </div>

      {adding && (
        <form onSubmit={handleAdd} className="bg-white p-4 border rounded-2xl space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <input placeholder="Staff Name" required className="border p-2 rounded-xl text-sm w-full" value={form.name} onChange={e => setForm(p => ({...p, name: e.target.value}))} />
            <input placeholder="Staff Email" required type="email" className="border p-2 rounded-xl text-sm w-full" value={form.email} onChange={e => setForm(p => ({...p, email: e.target.value}))} />
            <input placeholder="Phone" required maxLength={10} className="border p-2 rounded-xl text-sm w-full" value={form.phone} onChange={e => setForm(p => ({...p, phone: e.target.value}))} />
            <input placeholder="Password" required minLength={6} type="password" className="border p-2 rounded-xl text-sm w-full" value={form.password} onChange={e => setForm(p => ({...p, password: e.target.value}))} />
          </div>
          <button type="submit" className="bg-emerald-600 text-white px-4 py-2 rounded-xl text-xs font-bold w-full">Create Staff Account</button>
        </form>
      )}

      <div className="grid gap-4">
        {staff.map(s => (
          <div key={s._id} className="p-4 border rounded-2xl flex justify-between items-center bg-white">
            <div>
              <p className="font-bold">{s.name}</p>
              <p className="text-sm text-slate-500">{s.email} • {s.phone}</p>
            </div>
            <button onClick={() => handleDelete(s._id)} className="text-xs font-bold text-red-600 bg-red-100 px-3 py-1.5 rounded-lg">Remove</button>
          </div>
        ))}
        {staff.length === 0 && <p className="text-sm text-slate-500">No staff accounts found.</p>}
      </div>
    </div>
  )
}

export default function Profile() {
  const { user, setUser } = useAuth()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [profile, setProfile] = useState(null)
  const [editing, setEditing] = useState(false)
  const [form, setForm] = useState({
    shopName: '',
    description: '',
    city: '',
    area: '',
    pincode: '',
    deliveryRadius: 5,
    gstNumber: ''
  })
  const [reviewsModalOpen, setReviewsModalOpen] = useState(false)
  const [activeTab, setActiveTab] = useState('profile')

  const fetchProfile = async () => {
    try {
      setLoading(true)
      const res = await api.get('/api/auth/me')
      if (res.success) {
        const u = res.user
        setProfile(u)
        setForm({
          shopName: u.kiranaProfile?.asSeller?.shopName || '',
          description: u.kiranaProfile?.asSeller?.description || '',
          city: u.location?.city || '',
          area: u.location?.area || '',
          pincode: u.location?.pincode || '',
          deliveryRadius: u.kiranaProfile?.asSeller?.deliveryRadius || 5,
          gstNumber: u.kiranaProfile?.asBuyer?.gstNumber || ''
        })
      }
    } catch {
      toast.error('Could not load profile')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchProfile() }, [])

  const handleSave = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      const payload = {
        location: { city: form.city, area: form.area, pincode: form.pincode },
        kiranaProfile: {
          asSeller: {
            shopName: form.shopName,
            description: form.description,
            deliveryRadius: Number(form.deliveryRadius)
          },
          asBuyer: {
            gstNumber: form.gstNumber || undefined
          }
        }
      }
      const res = await api.put('/api/auth/profile', payload)
      if (res.success) {
        setProfile(res.user)
        setUser(res.user)
        toast.success('Profile updated successfully!')
        setEditing(false)
      }
    } catch (err) {
      toast.error(err.message || 'Failed to update profile')
    } finally {
      setSaving(false)
    }
  }

  const inputClass = 'w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm outline-none transition focus:border-indigo-400 focus:bg-white focus:ring-2 focus:ring-indigo-100'
  const labelClass = 'block text-[11px] font-bold uppercase tracking-widest text-slate-400 mb-1.5'

  if (loading) {
    return (
      <div className="space-y-4 w-full">
        {[1, 2, 3].map(i => <div key={i} className="h-48 bg-slate-100 rounded-[24px] animate-pulse" />)}
      </div>
    )
  }

  const shopName = profile?.kiranaProfile?.asSeller?.shopName || 'My Kirana Shop'
  const initials = profile?.name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || 'K'
  const walletBal = profile?.walletBalance ?? 0
  const totalSales = profile?.totalSales ?? 0

  return (
    <div className="space-y-6 pb-12 w-full">
      {/* Header */}
      <div>
        <p className="text-[11px] font-bold uppercase tracking-widest text-slate-400 mb-1">Account</p>
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Shop Profile</h1>
      </div>

      {/* Identity Card */}
      <div className="relative overflow-hidden bg-gradient-to-br from-indigo-600 via-indigo-600 to-violet-700 rounded-[28px] p-6 text-white shadow-xl shadow-indigo-200/50">
        <div className="absolute -right-8 -top-8 w-32 h-32 bg-white/10 rounded-full blur-2xl" />
        <div className="absolute -left-4 -bottom-4 w-24 h-24 bg-white/10 rounded-full blur-xl" />
        <div className="relative z-10 flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center text-2xl font-black border border-white/30 flex-shrink-0">
            {initials}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-lg font-extrabold tracking-tight truncate">{shopName}</p>
            <p className="text-indigo-200 text-sm font-medium">{profile?.name}</p>
            <p className="text-indigo-300 text-xs mt-0.5">{profile?.email}</p>
          </div>
          <div className="text-right flex-shrink-0 hidden sm:block">
            <span className="text-[10px] font-bold bg-white/20 px-2.5 py-1 rounded-full uppercase tracking-wider block mb-2">
              Kirana Merchant
            </span>
            <button 
              onClick={() => setReviewsModalOpen(true)}
              className="flex items-center gap-1.5 ml-auto text-xs font-bold text-white hover:text-yellow-200 transition"
            >
              <span className="text-yellow-400">★</span> 
              {profile?.rating?.average || 0} ({profile?.rating?.count || 0} Reviews)
            </button>
          </div>
        </div>
        <div className="relative z-10 grid grid-cols-3 gap-4 mt-5 pt-5 border-t border-white/20">
          <div>
            <p className="text-2xl font-black">₹{walletBal}</p>
            <p className="text-indigo-200 text-xs font-medium mt-0.5">Wallet Balance</p>
          </div>
          <div>
            <p className="text-2xl font-black">₹{totalSales}</p>
            <p className="text-indigo-200 text-xs font-medium mt-0.5">Total Sales</p>
          </div>
          <div>
            <p className="text-2xl font-black">{profile?.kiranaProfile?.inventory?.length ?? 0}</p>
            <p className="text-indigo-200 text-xs font-medium mt-0.5">Stock Items</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 gap-6">
        <button className={`pb-2 text-sm font-bold border-b-2 transition ${activeTab === 'profile' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-400 hover:text-slate-600'}`} onClick={() => setActiveTab('profile')}>Shop Profile</button>
        <button className={`pb-2 text-sm font-bold border-b-2 transition ${activeTab === 'addresses' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-400 hover:text-slate-600'}`} onClick={() => setActiveTab('addresses')}>Delivery Branches</button>
        {profile?.subscription?.planCode === 'premium_buyer' && !profile?.isStaff && (
          <button className={`pb-2 text-sm font-bold border-b-2 transition ${activeTab === 'staff' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-400 hover:text-slate-600'}`} onClick={() => setActiveTab('staff')}>Staff Management</button>
        )}
      </div>

      {/* Render active tab */}
      {activeTab === 'profile' && (
        <div className="space-y-6">
          {/* Subscription & Billing (Read-Only) */}
      {!editing && profile?.subscription && (
        <div className={`rounded-[28px] shadow-sm border p-6 ${
          profile.subscription.planCode === 'premium_buyer' 
            ? 'bg-gradient-to-r from-amber-50 to-orange-50 border-amber-200'
            : 'bg-white border-slate-200'
        }`}>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center">
              <svg className={`w-5 h-5 mr-3 ${
                profile.subscription.planCode === 'premium_buyer' ? 'text-amber-500' : 'text-slate-400'
              }`} fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 2a1 1 0 011 1v1.323l3.954 1.582 1.599-.8a1 1 0 01.894 1.79l-1.233.616 1.738 5.42a1 1 0 01-.285 1.05A3.989 3.989 0 0115 15a3.989 3.989 0 01-2.667-1.019 1 1 0 01-.285-1.05l1.715-5.349L11 6.477V16h2a1 1 0 110 2H7a1 1 0 110-2h2V6.477L6.237 7.582l1.715 5.349a1 1 0 01-.285 1.05A3.989 3.989 0 015 15a3.989 3.989 0 01-2.667-1.019 1 1 0 01-.285-1.05l1.738-5.42-1.233-.617a1 1 0 01.894-1.788l1.599.799L9 4.323V3a1 1 0 011-1z" clipRule="evenodd" />
              </svg>
              <h3 className="font-bold text-slate-900">Subscription Plan</h3>
            </div>
            {profile.subscription.planCode === 'free_buyer' && (
              <button className="px-4 py-2 bg-gradient-to-r from-amber-500 to-orange-500 text-white font-bold text-xs rounded-full shadow-md hover:from-amber-600 hover:to-orange-600 transition">
                Upgrade to Premium
              </button>
            )}
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-0.5">Current Plan</p>
              <p className={`font-bold ${
                profile.subscription.planCode === 'premium_buyer' ? 'text-amber-600' : 'text-slate-800'
              }`}>
                {profile.subscription.planCode === 'premium_buyer' ? 'Premium Retailer' : 'Free Retailer'}
              </p>
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-0.5">Auctions Published</p>
              <p className="font-bold text-slate-800">
                {profile.usageMetrics?.auctionsThisMonth || 0}
                {profile.subscription.planCode === 'free_buyer' && ' / 2'}
              </p>
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-0.5">Billing Cycle</p>
              <p className="font-bold text-slate-800">
                {new Date(profile.subscription.billingCycleStart).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' })}
              </p>
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-0.5">Status</p>
              <p className="font-bold text-emerald-600">Active</p>
            </div>
          </div>
        </div>
      )}

      {/* Edit toggle */}
      <div className="flex justify-end">
        <button
          onClick={() => setEditing(!editing)}
          className={`flex items-center gap-2 rounded-2xl text-xs font-bold px-4 py-2.5 transition-all
            ${editing ? 'bg-slate-100 text-slate-600 hover:bg-slate-200' : 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-md shadow-indigo-100'}`}>
          {editing ? (
            <>
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
              Cancel Editing
            </>
          ) : (
            <>
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
              </svg>
              Edit Profile
            </>
          )}
        </button>
      </div>

      {editing ? (
        <form onSubmit={handleSave} className="space-y-5">
          <ProfileSection title="Shop Information">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <label className={labelClass}>Shop Name</label>
                <input className={inputClass} value={form.shopName} onChange={e => setForm(p => ({ ...p, shopName: e.target.value }))} />
              </div>
              <div className="sm:col-span-2">
                <label className={labelClass}>Shop Description</label>
                <textarea rows={3} className={inputClass} placeholder="Briefly describe your shop and what you sell..."
                  value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} />
              </div>
            </div>
          </ProfileSection>

          <ProfileSection title="Location & Delivery">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>City</label>
                <input className={inputClass} value={form.city} onChange={e => setForm(p => ({ ...p, city: e.target.value }))} />
              </div>
              <div>
                <label className={labelClass}>Locality/Area</label>
                <input className={inputClass} value={form.area} onChange={e => setForm(p => ({ ...p, area: e.target.value }))} />
              </div>
              <div>
                <label className={labelClass}>Pincode</label>
                <input className={inputClass} maxLength={6} value={form.pincode} onChange={e => setForm(p => ({ ...p, pincode: e.target.value }))} />
              </div>
              <div className="sm:col-span-2">
                <label className={labelClass}>Delivery Radius: {form.deliveryRadius} km</label>
                <input type="range" min="1" max="25" step="1" className="w-full accent-indigo-600"
                  value={form.deliveryRadius} onChange={e => setForm(p => ({ ...p, deliveryRadius: e.target.value }))} />
                <div className="flex justify-between text-[10px] text-slate-400 font-medium mt-1">
                  <span>1 km</span><span>25 km</span>
                </div>
              </div>
            </div>
          </ProfileSection>

          <ProfileSection title="GST & Business">
            <div>
              <label className={labelClass}>GST Number (Optional)</label>
              <input className={`${inputClass} uppercase`} placeholder="22AAAAA0000A1Z5"
                value={form.gstNumber} onChange={e => setForm(p => ({ ...p, gstNumber: e.target.value }))} />
              <p className="text-[11px] text-slate-400 mt-1 font-medium">Required for bulk purchase tax benefits</p>
            </div>
          </ProfileSection>

          <div className="flex gap-3">
            <button type="button" onClick={() => setEditing(false)}
              className="flex-1 rounded-2xl border-2 border-slate-200 text-slate-600 font-bold text-sm py-3 hover:bg-slate-50 transition">
              Cancel
            </button>
            <button type="submit" disabled={saving}
              className="flex-1 rounded-2xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white font-bold text-sm py-3 transition shadow-lg shadow-indigo-200 disabled:opacity-50">
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      ) : (
        <div className="space-y-5">
          <ProfileSection title="Shop Information">
            <InfoRow label="Shop Name" value={profile?.kiranaProfile?.asSeller?.shopName} />
            <InfoRow label="Owner Name" value={profile?.name} />
            <InfoRow label="Email" value={profile?.email} />
            <InfoRow label="Phone" value={profile?.phone} />
            {profile?.kiranaProfile?.asSeller?.description && (
              <div className="pt-2">
                <p className="text-[11px] font-bold uppercase tracking-widest text-slate-400 mb-1.5">About Shop</p>
                <p className="text-xs text-slate-600 leading-relaxed">{profile.kiranaProfile.asSeller.description}</p>
              </div>
            )}
          </ProfileSection>

          <ProfileSection title="Location & Delivery">
            <InfoRow label="City" value={profile?.location?.city} />
            <InfoRow label="Locality/Area" value={profile?.location?.area} />
            <InfoRow label="Pincode" value={profile?.location?.pincode} />
            <InfoRow label="Delivery Radius" value={profile?.kiranaProfile?.asSeller?.deliveryRadius ? `${profile.kiranaProfile.asSeller.deliveryRadius} km` : '5 km (default)'} />
          </ProfileSection>

          <ProfileSection title="GST & Business">
            <InfoRow label="GST Number"
              value={profile?.kiranaProfile?.asBuyer?.gstNumber || 'Not provided'}
              badge={profile?.kiranaProfile?.asBuyer?.gstNumber ? 'verified' : undefined} />
            <InfoRow label="Role" value="Kirana Merchant (Dual Role)" />
            <InfoRow label="Account Status" value="Active" badge="active" />
            <InfoRow label="Member Since" value={profile?.createdAt ? new Date(profile.createdAt).toLocaleDateString('en-IN', { month: 'long', year: 'numeric' }) : '—'} />
          </ProfileSection>

          <ProfileSection title="Auction Permissions">
            <div className="flex items-center gap-3 py-2">
              <div className="w-8 h-8 bg-indigo-100 rounded-xl flex items-center justify-center flex-shrink-0">
                <svg className="w-4 h-4 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <p className="text-xs font-bold text-slate-800">Bulk Auction Buyer</p>
                <p className="text-[11px] text-slate-400">Can create bulk purchase auctions from wholesale markets</p>
              </div>
            </div>
            <div className="flex items-center gap-3 py-2">
              <div className="w-8 h-8 bg-emerald-100 rounded-xl flex items-center justify-center flex-shrink-0">
                <svg className="w-4 h-4 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <p className="text-xs font-bold text-slate-800">Local Retail Seller</p>
                <p className="text-[11px] text-slate-400">Can list products and receive retail orders from neighbors</p>
              </div>
            </div>
          </ProfileSection>
        </div>
      )}
      </div>
      )}

      {activeTab === 'addresses' && (
        <AddressesTab profile={profile} setProfile={setProfile} />
      )}

      {activeTab === 'staff' && profile?.subscription?.planCode === 'premium_buyer' && !profile?.isStaff && (
        <StaffTab profile={profile} />
      )}

      <ReviewsModal 
        isOpen={reviewsModalOpen}
        onClose={() => setReviewsModalOpen(false)}
        userId={profile?._id || profile?.id}
        userName={profile?.name || 'You'}
      />
    </div>
  )
}
