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
    window.dispatchEvent(new Event('bb_cart_updated'))
  }, [cartItems])

  useEffect(() => {
    const syncCart = () => {
      const raw = localStorage.getItem(STORAGE_KEY)
      setCartItems(prev => {
        const prevRaw = JSON.stringify(prev)
        if (raw !== prevRaw) return parseCart()
        return prev
      })
    }
    
    window.addEventListener('bb_cart_updated', syncCart)
    window.addEventListener('storage', syncCart)
    
    return () => {
      window.removeEventListener('bb_cart_updated', syncCart)
      window.removeEventListener('storage', syncCart)
    }
  }, [])

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
          sellerType: product.sellerType,
          sellerId: typeof product.sellerId === 'object' ? product.sellerId?._id : product.sellerId,
          deliveryAvailable: product.deliveryAvailable !== false,
          deliveryCharges: product.deliveryCharges || 0,
          freeDeliveryAbove: product.freeDeliveryAbove || null
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

  const deliveryCharges = useMemo(() => {
    if (cartItems.length === 0) return 0;
    
    const sellers = {};
    cartItems.forEach(item => {
      const sellerKey = item.sellerId || item.sellerName || 'unknown';
      if (!sellers[sellerKey]) {
        sellers[sellerKey] = { subtotal: 0, delivery: 0, freeAbove: Infinity };
      }
      sellers[sellerKey].subtotal += (item.price * item.quantity);
      
      const itemDelivery = item.deliveryCharges || 0;
      if (itemDelivery > sellers[sellerKey].delivery) {
        sellers[sellerKey].delivery = itemDelivery;
      }
      
      if (item.freeDeliveryAbove && item.freeDeliveryAbove < sellers[sellerKey].freeAbove) {
        sellers[sellerKey].freeAbove = item.freeDeliveryAbove;
      }
    });

    let totalDelivery = 0;
    Object.values(sellers).forEach(seller => {
      if (seller.subtotal >= seller.freeAbove) {
        // Free delivery threshold met for this seller
      } else {
        totalDelivery += seller.delivery;
      }
    });

    return totalDelivery;
  }, [cartItems]);
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
