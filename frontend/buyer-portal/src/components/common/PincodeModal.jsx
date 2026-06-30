import { useState, useEffect } from 'react'
import { useAuth } from '../../context/AuthContext'

const PincodeModal = ({ isOpen, onClose, isDismissible = true }) => {
  const { activePincode, setActivePincode } = useAuth()
  const [pincode, setPincode] = useState(activePincode || '')
  const [error, setError] = useState('')

  useEffect(() => {
    if (isOpen) {
      setPincode(activePincode || '')
      setError('')
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [isOpen, activePincode])

  const handleSubmit = (e) => {
    e.preventDefault()
    
    if (!/^[1-9][0-9]{5}$/.test(pincode)) {
      setError('Please enter a valid 6-digit Indian pincode')
      return
    }
    
    setActivePincode(pincode)
    onClose()
  }

  if (!isOpen) return null

  return (
    <div className="relative z-50">
      <div 
        className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm" 
        onClick={() => isDismissible ? onClose() : null}
      />
      
      <div className="fixed inset-0 flex w-screen items-center justify-center p-4 pointer-events-none">
        <div className="mx-auto w-full max-w-md rounded-[24px] bg-white p-8 shadow-2xl pointer-events-auto">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-indigo-50 mb-6">
            <span className="text-3xl">📍</span>
          </div>
          
          <h2 className="text-center text-2xl font-bold text-slate-900">
            Set your delivery location
          </h2>
          <p className="mt-3 text-center text-sm text-slate-500">
            Enter your pincode to see fresh products from trusted local Kirana stores right in your neighborhood.
          </p>

          <form onSubmit={handleSubmit} className="mt-8">
            <div className="relative">
              <input
                type="text"
                value={pincode}
                onChange={(e) => setPincode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                placeholder="Enter 6-digit pincode"
                className="w-full rounded-2xl border-2 border-slate-200 bg-slate-50 px-5 py-4 text-center text-xl font-bold tracking-widest text-slate-900 transition focus:border-indigo-600 focus:bg-white focus:outline-none focus:ring-4 focus:ring-indigo-600/10"
              />
            </div>
            
            {error && (
              <p className="mt-3 text-center text-sm font-medium text-rose-600">{error}</p>
            )}

            <button
              type="submit"
              className="mt-6 w-full rounded-2xl bg-indigo-600 px-5 py-4 text-base font-semibold text-white shadow-lg shadow-indigo-600/20 transition hover:bg-indigo-700 active:scale-[0.98]"
            >
              Start shopping locally
            </button>
            
            {isDismissible && (
              <button
                type="button"
                onClick={onClose}
                className="mt-4 w-full text-sm font-semibold text-slate-500 hover:text-slate-800"
              >
                Cancel
              </button>
            )}
          </form>
        </div>
      </div>
    </div>
  )
}

export default PincodeModal
