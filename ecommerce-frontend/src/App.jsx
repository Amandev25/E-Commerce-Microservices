import { Routes, Route } from 'react-router-dom';
import Layout from './components/Layout.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';

import Home from './pages/Home.jsx';
import Products from './pages/Products.jsx';
import ProductDetail from './pages/ProductDetail.jsx';
import Cart from './pages/Cart.jsx';
import Checkout from './pages/Checkout.jsx';
import Orders from './pages/Orders.jsx';
import Wishlist from './pages/Wishlist.jsx';
import Login from './pages/Login.jsx';
import Register from './pages/Register.jsx';
import NotFound from './pages/NotFound.jsx';

// Every route is listed here. Pages inside <Layout> get the navbar + footer.
// Pages inside <ProtectedRoute> require the user to be logged in.
export default function App() {
  return (
    <Routes>
      {/* Public store pages */}
      <Route path="/" element={<Layout><Home /></Layout>} />
      <Route path="/products" element={<Layout><Products /></Layout>} />
      <Route path="/products/:id" element={<Layout><ProductDetail /></Layout>} />
      <Route path="/cart" element={<Layout><Cart /></Layout>} />

      {/* Login required */}
      <Route
        path="/wishlist"
        element={<ProtectedRoute><Layout><Wishlist /></Layout></ProtectedRoute>}
      />
      <Route
        path="/checkout"
        element={<ProtectedRoute><Layout><Checkout /></Layout></ProtectedRoute>}
      />
      <Route
        path="/orders"
        element={<ProtectedRoute><Layout><Orders /></Layout></ProtectedRoute>}
      />

      {/* Auth pages have their own full-screen layout (no navbar) */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      {/* Anything else */}
      <Route path="*" element={<Layout><NotFound /></Layout>} />
    </Routes>
  );
}
