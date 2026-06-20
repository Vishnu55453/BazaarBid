import { useEffect, useMemo, useState } from 'react'

const STORAGE_KEY = 'bb_cart'

const parseCart = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

export const useCart = () => {
  const [cartItems, setCartItems] = useState(parseCart)

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(cartItems))
  }, [cartItems])

  const addToCart = (product, quantity = 1) => {
    setCartItems((current) => {
      const existing = current.find((item) => item.productId === product._id)

      if (existing) {
        return current.map((item) =>
          item.productId === product._id
            ? { ...item, quantity: item.quantity + quantity }
            : item
        )
      }

      return [
        ...current,
        {
          productId: product._id,
          name: product.name,
          price: Number(product.pricePerUnit),
          unit: product.unit,
          quantity,
          image: product.images?.[0]?.url || '/placeholder.png',
          sellerName: product.sellerShopName || product.sellerId?.name,
          sellerType: product.sellerType
        }
      ]
    })
  }

  const updateQuantity = (productId, quantity) => {
    setCartItems((current) =>
      current
        .map((item) =>
          item.productId === productId ? { ...item, quantity: Math.max(1, quantity) } : item
        )
        .filter((item) => item.quantity > 0)
    )
  }

  const removeFromCart = (productId) => {
    setCartItems((current) => current.filter((item) => item.productId !== productId))
  }

  const clearCart = () => setCartItems([])

  const subtotal = useMemo(
    () => cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0),
    [cartItems]
  )

  const deliveryCharges = useMemo(() => (cartItems.length > 0 ? 40 : 0), [cartItems])
  const total = subtotal + deliveryCharges

  return {
    cartItems,
    subtotal,
    deliveryCharges,
    total,
    cartCount: cartItems.reduce((sum, item) => sum + item.quantity, 0),
    addToCart,
    updateQuantity,
    removeFromCart,
    clearCart
  }
}
