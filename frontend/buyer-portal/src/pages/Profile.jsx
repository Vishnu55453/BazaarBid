import { useEffect, useState } from 'react'
import { toast } from 'react-hot-toast'
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
