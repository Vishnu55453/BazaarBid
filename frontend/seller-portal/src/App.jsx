import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import { SocketProvider } from './context/SocketContext';
import DashboardLayout from './components/layout/DashboardLayout';
import Dashboard from './pages/Dashboard';
import Analytics from './pages/Analytics';
import AuthPage from './pages/AuthPage';
import OpenAuctions from './pages/auctions/OpenAuctions';
import AuctionDetail from './pages/auctions/AuctionDetail';
import MyBids from './pages/bids/MyBids';
import WonAuctions from './pages/bids/WonAuctions';
import BulkOrders from './pages/orders/BulkOrders';
import Profile from './pages/Profile';
import Invoice from './pages/orders/Invoice';

function App() {
  return (
    <AuthProvider>
      <SocketProvider>
        <Router>
          <Toaster position="top-center" />
          <Routes>
            <Route path="/auth" element={<AuthPage />} />
            <Route element={<DashboardLayout />}>
              <Route path="/" element={<Dashboard />} />
              <Route path="/analytics" element={<Analytics />} />
              <Route path="/auctions" element={<OpenAuctions />} />
              <Route path="/auctions/:id" element={<AuctionDetail />} />
              <Route path="/bids" element={<MyBids />} />
              <Route path="/won-auctions" element={<WonAuctions />} />
              <Route path="/orders" element={<BulkOrders />} />
              <Route path="/orders/:id/invoice" element={<Invoice />} />
              <Route path="/profile" element={<Profile />} />
            </Route>
          </Routes>
        </Router>
      </SocketProvider>
    </AuthProvider>
  );
}

export default App;
