import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { AuthProvider } from './context/AuthContext'
import { SocketProvider } from './context/SocketContext'
import ProtectedRoute from './components/ProtectedRoute'
import Layout from './components/Layout'

// Pages
import AuthPage from './pages/AuthPage'
import Dashboard from './pages/Dashboard'
import CreateAuction from './pages/buyer/CreateAuction'
import MyAuctions from './pages/buyer/MyAuctions'
import AuctionDetail from './pages/buyer/AuctionDetail'
import Invoice from './pages/buyer/Invoice'
import MarketInsights from './pages/buyer/MarketInsights'
import Inventory from './pages/seller/Inventory'
import AddProduct from './pages/seller/AddProduct'
import MyProducts from './pages/seller/MyProducts'
import OrdersReceived from './pages/seller/OrdersReceived'
import Analytics from './pages/seller/Analytics'
import Profile from './pages/Profile'

export default function App() {
  return (
    <AuthProvider>
      <SocketProvider>
        <BrowserRouter>
          <Toaster position="top-center" />
          <Routes>
            {/* Auth Route */}
            <Route path="/auth" element={<AuthPage />} />

            {/* Secure Routes for Kirana User role */}
            <Route element={<ProtectedRoute />}>
              <Route element={<Layout />}>
                {/* Home / Dashboard */}
                <Route path="/" element={<Dashboard />} />
                
                {/* Buyer specific routes */}
                <Route path="/buyer/create-auction" element={<CreateAuction />} />
                <Route path="/buyer/auctions" element={<MyAuctions />} />
                <Route path="/buyer/auctions/:id" element={<AuctionDetail />} />
                <Route path="/buyer/insights" element={<MarketInsights />} />
                <Route path="/orders/:id/invoice" element={<Invoice />} />
                
                {/* Seller specific routes */}
                <Route path="/seller/inventory" element={<Inventory />} />
                <Route path="/seller/add-product" element={<AddProduct />} />
                <Route path="/seller/products" element={<MyProducts />} />
                <Route path="/seller/orders" element={<OrdersReceived />} />
                <Route path="/seller/analytics" element={<Analytics />} />
                
                {/* Merchant Shop profile */}
                <Route path="/profile" element={<Profile />} />

                {/* Fallback route */}
                <Route path="*" element={<Navigate to="/" replace />} />
              </Route>
            </Route>
          </Routes>
        </BrowserRouter>
      </SocketProvider>
    </AuthProvider>
  )
}
