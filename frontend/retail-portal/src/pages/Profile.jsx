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

      <ReviewsModal 
        isOpen={reviewsModalOpen}
        onClose={() => setReviewsModalOpen(false)}
        userId={profile?._id || profile?.id}
        userName={profile?.name || 'You'}
      />
    </div>
  )
}
