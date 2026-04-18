import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { ProductProvider } from './context/ProductContext';
import { CartProvider } from './context/CartContext';
import POS from './pages/POS';
import Admin from './pages/Admin';
import OnlineMenu from './pages/OnlineMenu';
import Login from './pages/Login';

// Component to protect routes
const ProtectedRoute = ({ children, roleRequired }) => {
  const userStr = localStorage.getItem('user');
  
  if (!userStr) return <Navigate to="/login" />;
  
  const user = JSON.parse(userStr);
  const userRole = user.role?.toLowerCase();

  // If page needs Admin, only let 'admin' role in
  if (roleRequired === 'admin' && userRole !== 'admin') {
    return <Navigate to="/" />;
  }
  
  // If user is a customer (guest), they only belong in /menu
  if (userRole === 'guest' && roleRequired !== 'guest') {
    return <Navigate to="/menu" />;
  }
  
  return children;
};

function App() {
  return (
    <ProductProvider>
      <CartProvider>
        <Router>
          <Toaster 
            position="top-right"
            toastOptions={{
              className: 'glass-card border border-white/10 text-white font-bold py-4 px-6 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] backdrop-blur-2xl',
              style: {
                background: 'rgba(23, 23, 23, 0.8)',
                color: '#fff',
                fontSize: '14px',
                border: '1px solid rgba(255,255,255,0.1)',
              },
              success: {
                iconTheme: { primary: '#eab308', secondary: '#000' },
                style: { borderBottom: '3px solid #eab308' }
              },
              error: {
                iconTheme: { primary: '#ef4444', secondary: '#000' },
                style: { borderBottom: '3px solid #ef4444' }
              }
            }}
          />
          <Routes>
            <Route path="/login" element={<Login />} />
            
            {/* POS is for Admin & Staff */}
            <Route path="/" element={
              <ProtectedRoute roleRequired="staff">
                <POS />
              </ProtectedRoute>
            } />

            {/* Dashboard is ONLY for Admin */}
            <Route path="/admin" element={
              <ProtectedRoute roleRequired="admin">
                <Admin />
              </ProtectedRoute>
            } />

            {/* Guest Menu for everyone (Public) */}
            <Route path="/menu" element={<OnlineMenu />} />

            {/* Catch all */}
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </Router>
      </CartProvider>
    </ProductProvider>
  );
}

export default App;
