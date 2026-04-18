import React, { createContext, useContext, useState, useEffect } from 'react';
import useSound from 'use-sound';
import toast from 'react-hot-toast';

const CartContext = createContext();

export const useCart = () => useContext(CartContext);

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);
  const [discountPercent, setDiscountPercent] = useState(0);
  const [serviceFee, setServiceFee] = useState(0);
  
  // Fixed: Using reliable online URL for cart sound
  const [playAdd] = useSound('https://cdn.pixabay.com/audio/2022/03/10/audio_c8c8a73053.mp3', { volume: 0.5 });

  const addToCart = (product) => {
    try {
      setCartItems(prev => {
        const existingItem = prev.find(item => item._id === product._id);
        if (existingItem) {
          return prev.map(item =>
            item._id === product._id ? { ...item, quantity: item.quantity + 1 } : item
          );
        }
        
        // Only try to play sound if it loaded successfully
        if (playAdd) playAdd();
        
        toast.success(`${product.name} added to cart!`);
        return [...prev, { ...product, quantity: 1 }];
      });
    } catch (err) {
      console.error('Error adding to cart:', err);
    }
  };

  const removeFromCart = (productId) => {
    setCartItems(prev => prev.filter(item => item._id !== productId));
  };

  const updateQuantity = (productId, amount) => {
    setCartItems(prev => prev.map(item => {
      if (item._id === productId) {
        const newQty = Math.max(1, item.quantity + amount);
        return { ...item, quantity: newQty };
      }
      return item;
    }));
  };

  const clearCart = () => {
    setCartItems([]);
    setDiscountPercent(0);
    setServiceFee(0);
  };

  const itemsTotal = cartItems.reduce((acc, item) => acc + (item.price * item.quantity), 0);
  const discountAmount = (itemsTotal * (discountPercent / 100));
  const subtotalAfterDiscount = Math.max(0, itemsTotal - discountAmount);
  const tax = subtotalAfterDiscount * 0.1; // 10% tax
  const finalTotal = subtotalAfterDiscount + tax + serviceFee;

  return (
    <CartContext.Provider value={{
      cartItems,
      addToCart,
      removeFromCart,
      updateQuantity,
      clearCart,
      itemsTotal,
      discountPercent,
      setDiscountPercent,
      discountAmount,
      serviceFee,
      setServiceFee,
      tax,
      total: finalTotal
    }}>
      {children}
    </CartContext.Provider>
  );
};
