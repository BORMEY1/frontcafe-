import React from 'react';
import { Minus, Plus, Trash2, ShoppingBag, Percent, Truck } from 'lucide-react';
import { useCart } from '../context/CartContext';

const CartSidebar = ({ onCheckout }) => {
  const { 
    cartItems, 
    removeFromCart, 
    updateQuantity, 
    itemsTotal, 
    discountPercent, 
    setDiscountPercent, 
    discountAmount,
    serviceFee, 
    setServiceFee, 
    tax, 
    total 
  } = useCart();

  if (cartItems.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 px-6 text-center animate-in fade-in duration-500">
        <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mb-6 border border-white/5">
           <ShoppingBag size={32} className="text-gray-600" />
        </div>
        <h3 className="text-lg font-bold text-gray-400 mb-1 uppercase tracking-tighter">Your cart is empty</h3>
        <p className="text-xs text-gray-500 max-w-[200px] leading-relaxed font-medium">Add some delicious flavors to your order to get started!</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <div className="flex-grow overflow-y-auto pr-2 space-y-4 custom-scrollbar">
        {cartItems.map((item) => (
          <div key={item._id} className="flex gap-4 p-3 bg-white/5 rounded-2xl border border-white/5 group hover:border-white/10 transition-all">
            <img src={item.image} alt={item.name} className="w-16 h-16 rounded-xl object-cover" />
            <div className="flex-grow">
              <div className="flex justify-between items-start mb-1">
                <h4 className="font-semibold text-white line-clamp-1">{item.name}</h4>
                <button onClick={() => removeFromCart(item._id)} className="text-gray-500 hover:text-red-500 transition-colors">
                  <Trash2 size={16} />
                </button>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-primary-500 font-bold">${(item.price * item.quantity).toFixed(2)}</span>
                <div className="flex items-center gap-3 bg-dark-900 rounded-lg p-1">
                  <button onClick={() => updateQuantity(item._id, -1)} className="p-1 hover:text-primary-500 transition-colors active:scale-75">
                    <Minus size={14} />
                  </button>
                  <span className="text-sm font-bold w-4 text-center">{item.quantity}</span>
                  <button onClick={() => updateQuantity(item._id, 1)} className="p-1 hover:text-primary-500 transition-colors active:scale-75">
                    <Plus size={14} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 space-y-3 pt-6 border-t border-white/10">
        <div className="grid grid-cols-2 gap-2 mb-4">
           <div className="relative">
              <Percent size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
              <input 
                type="number" 
                placeholder="Discount %" 
                className="w-full bg-dark-900 border border-white/5 rounded-xl py-2 pl-9 pr-2 text-sm focus:border-primary-500 outline-none transition-all"
                value={discountPercent || ''}
                onChange={(e) => setDiscountPercent(Number(e.target.value))}
              />
           </div>
           <div className="relative">
              <Truck size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
              <input 
                type="number" 
                placeholder="Fee" 
                className="w-full bg-dark-900 border border-white/5 rounded-xl py-2 pl-9 pr-2 text-sm focus:border-primary-500 outline-none transition-all"
                value={serviceFee || ''}
                onChange={(e) => setServiceFee(Number(e.target.value))}
              />
           </div>
        </div>

        <div className="flex justify-between text-gray-400 text-sm">
          <span>Items Total</span>
          <span>${itemsTotal.toFixed(2)}</span>
        </div>
        {discountPercent > 0 && (
          <div className="flex justify-between text-red-500 text-sm">
            <span>Discount ({discountPercent}%)</span>
            <span>-${discountAmount.toFixed(2)}</span>
          </div>
        )}
        <div className="flex justify-between text-gray-400 text-sm">
          <span>Tax (10%)</span>
          <span>${tax.toFixed(2)}</span>
        </div>
        {serviceFee > 0 && (
          <div className="flex justify-between text-gray-400 text-sm">
            <span>Service Fee</span>
            <span>${serviceFee.toFixed(2)}</span>
          </div>
        )}
        <div className="flex justify-between text-xl font-bold text-white pt-2 border-t border-white/5">
          <span>Total</span>
          <span className="text-primary-500">${total.toFixed(2)}</span>
        </div>
        <button 
          onClick={onCheckout}
          className="w-full bg-primary-600 hover:bg-primary-500 text-white font-bold py-4 rounded-2xl mt-4 transition-all shadow-lg shadow-primary-600/20 active:scale-95 text-lg"
        >
          Proceed to Checkout
        </button>
      </div>
    </div>
  );
};

export default CartSidebar;
