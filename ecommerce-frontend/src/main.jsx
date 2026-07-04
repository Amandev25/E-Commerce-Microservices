import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App.jsx';
import { AuthProvider } from './context/AuthContext.jsx';
import { CartProvider } from './context/CartContext.jsx';
import { WishlistProvider } from './context/WishlistContext.jsx';
import { ToastProvider } from './context/ToastContext.jsx';
import './index.css';

// This is the root of the app. We wrap <App /> with:
//  - BrowserRouter  → gives us page routing (URLs like /products, /cart)
//  - ToastProvider  → little "Added to cart" pop-ups
//  - AuthProvider   → knows who is logged in
//  - Cart/Wishlist  → shared cart & wishlist state (used by the navbar badges too)
ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <ToastProvider>
        <AuthProvider>
          <WishlistProvider>
            <CartProvider>
              <App />
            </CartProvider>
          </WishlistProvider>
        </AuthProvider>
      </ToastProvider>
    </BrowserRouter>
  </React.StrictMode>
);
