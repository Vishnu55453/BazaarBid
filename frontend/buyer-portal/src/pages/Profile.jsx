import { useEffect, useState } from 'react'
import { toast } from 'react-hot-toast'
import { FiPlus, FiTrash2 } from 'react-icons/fi'
import Loader from '../components/common/Loader'
import { useAuth } from '../context/AuthContext'
import api from '../services/api'

const Profile = () => {
  const { user, setUser } = useAuth()
  const [loading, setLoading] = useState(true)
  const [profile, setProfile] = useState({ name: '', email: '', phone: '', city: '', area: '', pincode: '' })
  const [passwords, setPasswords] = useState({ currentPassword: '', newPassword: '' })
  const [savingProfile, setSavingProfile] = useState(false)
  const [savingPassword, setSavingPassword] = useState(false)

  const [savedAddresses, setSavedAddresses] = useState([])
  const [showAddressForm, setShowAddressForm] = useState(false)
  const [newAddress, setNewAddress] = useState({ label: 'Home', recipientName: '', phone: '', flatOrShopNumber: '', buildingName: '', streetName: '', area: '', city: '', pincode: '', landmark: '' })
  const [savingAddress, setSavingAddress] = useState(false)

  useEffect(() => {
    const load = async () => {
      try {
        const response = await api.get('/api/auth/me')
        const current = response.user
        setProfile({
          name: current.name || '',
          email: current.email || '',
          phone: current.phone || '',
          city: current.location?.city || '',
          area: current.location?.area || '',
          pincode: current.location?.pincode || ''
        })
        setSavedAddresses(current.savedAddresses || [])
      } catch (error) {
        toast.error(error.message)
      } finally {
        setLoading(false)
      }
    }

    load()
  }, [])

  const handleProfileSave = async (event) => {
    event.preventDefault()
    setSavingProfile(true)

    try {
      const response = await api.put('/api/auth/profile', {
        name: profile.name,
        phone: profile.phone,
        location: {
          city: profile.city,
          area: profile.area,
          pincode: profile.pincode
        }
      })

      setUser({
        ...user,
        name: profile.name,
        phone: profile.phone,
        location: {
          city: profile.city,
          area: profile.area,
          pincode: profile.pincode
        }
      })
      toast.success(response.message || 'Profile updated')
    } catch (error) {
      toast.error(error.message)
    } finally {
      setSavingProfile(false)
    }
  }

  const handlePasswordSave = async (event) => {
    event.preventDefault()
    setSavingPassword(true)

    try {
      const response = await api.put('/api/auth/change-password', passwords)
      toast.success(response.message || 'Password updated')
      setPasswords({ currentPassword: '', newPassword: '' })
    } catch (error) {
      toast.error(error.message)
    } finally {
      setSavingPassword(false)
    }
  }

  const handleAddAddress = async (e) => {
    e.preventDefault()
    setSavingAddress(true)
    try {
      const updatedAddresses = [...savedAddresses, newAddress]
      const response = await api.put('/api/auth/profile', { savedAddresses: updatedAddresses })
      setSavedAddresses(response.user.savedAddresses || updatedAddresses)
      setUser({ ...user, savedAddresses: response.user.savedAddresses || updatedAddresses })
      toast.success('Address added successfully')
      setShowAddressForm(false)
      setNewAddress({ label: 'Home', recipientName: '', phone: '', flatOrShopNumber: '', buildingName: '', streetName: '', area: '', city: '', pincode: '', landmark: '' })
    } catch (error) {
      toast.error(error.message)
    } finally {
      setSavingAddress(false)
    }
  }

  const handleDeleteAddress = async (indexToRemove) => {
    try {
      const updatedAddresses = savedAddresses.filter((_, idx) => idx !== indexToRemove)
      const response = await api.put('/api/auth/profile', { savedAddresses: updatedAddresses })
      setSavedAddresses(response.user.savedAddresses || updatedAddresses)
      setUser({ ...user, savedAddresses: response.user.savedAddresses || updatedAddresses })
      toast.success('Address removed')
    } catch (error) {
      toast.error(error.message)
    }
  }

  if (loading) {
    return (
      <div className="rounded-[24px] border border-slate-200 bg-white p-6 shadow-sm">
        <Loader className="h-64" />
      </div>
    )
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[1fr_0.8fr]">
      <div className="rounded-[24px] border border-slate-200 bg-white p-6 shadow-sm">
        <p className="text-sm font-semibold uppercase tracking-[0.3em] text-indigo-600">Profile</p>
        <h1 className="mt-3 text-3xl font-semibold text-slate-900">Your account</h1>

        <form onSubmit={handleProfileSave} className="mt-6 space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block">
              <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Name</span>
              <input value={profile.name} onChange={(event) => setProfile((current) => ({ ...current, name: event.target.value }))} className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3" />
            </label>
            <label className="block">
              <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Email</span>
              <input value={profile.email} disabled className="w-full rounded-2xl border border-slate-200 bg-slate-100 px-4 py-3" />
            </label>
          </div>

          <label className="block">
            <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Phone</span>
            <input value={profile.phone} onChange={(event) => setProfile((current) => ({ ...current, phone: event.target.value }))} className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3" />
          </label>

          <div className="grid gap-4 sm:grid-cols-3">
            <label className="block">
              <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">City</span>
              <input value={profile.city} onChange={(event) => setProfile((current) => ({ ...current, city: event.target.value }))} className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3" />
            </label>
            <label className="block">
              <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Area</span>
              <input value={profile.area} onChange={(event) => setProfile((current) => ({ ...current, area: event.target.value }))} className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3" />
            </label>
            <label className="block">
              <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Pincode</span>
              <input value={profile.pincode} onChange={(event) => setProfile((current) => ({ ...current, pincode: event.target.value }))} className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3" />
            </label>
          </div>

          <button type="submit" disabled={savingProfile} className="rounded-2xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white">
            {savingProfile ? 'Saving...' : 'Save profile'}
          </button>
        </form>
      </div>

      <div className="rounded-[24px] border border-slate-200 bg-white p-6 shadow-sm col-span-full">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-indigo-600">Address Book</p>
            <h2 className="mt-3 text-2xl font-semibold text-slate-900">Saved Addresses</h2>
          </div>
          {!showAddressForm && (
            <button onClick={() => setShowAddressForm(true)} className="flex items-center gap-2 rounded-2xl bg-indigo-50 px-4 py-2 text-sm font-semibold text-indigo-600 hover:bg-indigo-100">
              <FiPlus /> Add new address
            </button>
          )}
        </div>

        {showAddressForm && (
          <form onSubmit={handleAddAddress} className="mt-6 rounded-2xl border border-slate-200 bg-slate-50 p-6 space-y-4">
            <h3 className="font-semibold text-slate-900">Add new address</h3>
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block">
                <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Label</span>
                <select value={newAddress.label} onChange={e => setNewAddress({...newAddress, label: e.target.value})} className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3">
                  <option value="Home">Home</option>
                  <option value="Office">Office</option>
                  <option value="Hotel">Hotel</option>
                  <option value="Other">Other</option>
                </select>
              </label>
              <label className="block">
                <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Recipient Name</span>
                <input required value={newAddress.recipientName} onChange={e => setNewAddress({...newAddress, recipientName: e.target.value})} className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3" />
              </label>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block">
                <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Phone Number</span>
                <input required value={newAddress.phone} onChange={e => setNewAddress({...newAddress, phone: e.target.value})} className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3" />
              </label>
              <label className="block">
                <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Flat / Shop No.</span>
                <input required value={newAddress.flatOrShopNumber} onChange={e => setNewAddress({...newAddress, flatOrShopNumber: e.target.value})} className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3" />
              </label>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block">
                <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Building Name</span>
                <input required value={newAddress.buildingName} onChange={e => setNewAddress({...newAddress, buildingName: e.target.value})} className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3" />
              </label>
              <label className="block">
                <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Street Name</span>
                <input required value={newAddress.streetName} onChange={e => setNewAddress({...newAddress, streetName: e.target.value})} className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3" />
              </label>
            </div>
            <div className="grid gap-4 sm:grid-cols-3">
              <label className="block">
                <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Area / Locality</span>
                <input required value={newAddress.area} onChange={e => setNewAddress({...newAddress, area: e.target.value})} className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3" />
              </label>
              <label className="block">
                <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">City</span>
                <input required value={newAddress.city} onChange={e => setNewAddress({...newAddress, city: e.target.value})} className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3" />
              </label>
              <label className="block">
                <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Pincode</span>
                <input required value={newAddress.pincode} onChange={e => setNewAddress({...newAddress, pincode: e.target.value})} className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3" />
              </label>
            </div>
            <div className="flex justify-end gap-3 pt-4">
              <button type="button" onClick={() => setShowAddressForm(false)} className="rounded-2xl px-5 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-200">Cancel</button>
              <button type="submit" disabled={savingAddress} className="rounded-2xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700">{savingAddress ? 'Saving...' : 'Save Address'}</button>
            </div>
          </form>
        )}

        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {savedAddresses.map((addr, idx) => (
            <div key={idx} className="relative rounded-2xl border border-slate-200 p-5 shadow-sm">
              <div className="flex items-center justify-between mb-3">
                <span className="inline-flex items-center rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-semibold text-slate-800">{addr.label}</span>
                <button type="button" onClick={() => handleDeleteAddress(idx)} className="text-slate-400 hover:text-rose-500 transition-colors"><FiTrash2 className="w-4 h-4" /></button>
              </div>
              <p className="font-semibold text-slate-900">{addr.recipientName}</p>
              <p className="text-sm text-slate-500 mt-1">{addr.flatOrShopNumber}, {addr.buildingName}</p>
              <p className="text-sm text-slate-500">{addr.streetName}, {addr.area}</p>
              <p className="text-sm text-slate-500">{addr.city} - {addr.pincode}</p>
              <p className="text-sm text-slate-500 mt-2 font-medium">📞 {addr.phone}</p>
            </div>
          ))}
          {savedAddresses.length === 0 && !showAddressForm && (
            <div className="col-span-full rounded-2xl border border-dashed border-slate-300 p-8 text-center text-slate-500">
              No addresses saved yet. Add one to checkout faster!
            </div>
          )}
        </div>
      </div>

      <div className="rounded-[24px] border border-slate-200 bg-white p-6 shadow-sm">
        <p className="text-sm font-semibold uppercase tracking-[0.3em] text-indigo-600">Security</p>
        <h2 className="mt-3 text-2xl font-semibold text-slate-900">Change password</h2>

        <form onSubmit={handlePasswordSave} className="mt-6 space-y-4">
          <label className="block">
            <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Current password</span>
            <input type="password" value={passwords.currentPassword} onChange={(event) => setPasswords((current) => ({ ...current, currentPassword: event.target.value }))} className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3" />
          </label>
          <label className="block">
            <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">New password</span>
            <input type="password" value={passwords.newPassword} onChange={(event) => setPasswords((current) => ({ ...current, newPassword: event.target.value }))} className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3" />
          </label>
          <button type="submit" disabled={savingPassword} className="rounded-2xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white">
            {savingPassword ? 'Updating...' : 'Update password'}
          </button>
        </form>
      </div>
    </div>
  )
}

export default Profile
