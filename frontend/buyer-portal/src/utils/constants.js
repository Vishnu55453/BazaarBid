export const categories = [
  { value: '', label: 'All categories' },
  { value: 'fresh_fruits', label: 'Fresh Fruits' },
  { value: 'vegetables', label: 'Vegetables' },
  { value: 'grocery', label: 'Grocery' },
  { value: 'spices', label: 'Spices' },
  { value: 'bakery', label: 'Bakery' },
  { value: 'dairy', label: 'Dairy' },
  { value: 'organic', label: 'Organic' }
]

export const sellerTypes = [
  { value: '', label: 'All sellers' },
  { value: 'kirana_user', label: 'Kirana' },
  { value: 'big_market_seller', label: 'Big Market' }
]

export const sortOptions = [
  { value: 'createdAt-desc', label: 'Newest' },
  { value: 'pricePerUnit-asc', label: 'Price: Low to High' },
  { value: 'pricePerUnit-desc', label: 'Price: High to Low' }
]

export const statusSteps = ['pending', 'confirmed', 'processing', 'shipped', 'out_for_delivery', 'delivered']
