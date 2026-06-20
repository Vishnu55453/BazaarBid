export const formatCurrency = (value = 0) =>
  new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0
  }).format(Number(value) || 0)

export const getStatusClasses = (status = 'pending') => {
  const map = {
    pending: 'bg-amber-100 text-amber-700',
    confirmed: 'bg-blue-100 text-blue-700',
    processing: 'bg-cyan-100 text-cyan-700',
    shipped: 'bg-indigo-100 text-indigo-700',
    out_for_delivery: 'bg-fuchsia-100 text-fuchsia-700',
    delivered: 'bg-emerald-100 text-emerald-700',
    cancelled: 'bg-rose-100 text-rose-700'
  }

  return map[status] || 'bg-slate-100 text-slate-700'
}

export const getInitials = (name = '') =>
  name
    .split(' ')
    .map((part) => part[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()

export const createSlug = (value = '') => value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')

export const comparePrices = (a, b) => Number(a || 0) - Number(b || 0)
