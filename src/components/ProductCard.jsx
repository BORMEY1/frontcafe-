import React from 'react';
import { Plus, Minus } from 'lucide-react';
import { useCart } from '../context/CartContext';

const ProductCard = ({ product }) => {
  const { cartItems, addToCart, updateQuantity, removeFromCart } = useCart();
  
  const cartItem = cartItems.find(item => item._id === product._id);
  const quantity = cartItem ? cartItem.quantity : 0;

  const handleAdd = (e) => {
    e.stopPropagation();
    addToCart(product);
  };

  const handleIncrease = (e) => {
    e.stopPropagation();
    updateQuantity(product._id, 1);
  };

  const handleDecrease = (e) => {
    e.stopPropagation();
    if (quantity === 1) {
      removeFromCart(product._id);
    } else {
      updateQuantity(product._id, -1);
    }
  };

  return (
    <div className={`glass-card p-3 rounded-2xl flex flex-col group cursor-pointer border transition-all duration-300 ${
      quantity > 0 ? 'border-primary-500 shadow-lg shadow-primary-600/10' : 'border-white/5 hover:border-primary-500/50'
    }`} 
         onClick={quantity > 0 ? null : handleAdd}>
      <div className="relative overflow-hidden rounded-xl h-32 mb-3">
        <img src={product.image} alt={product.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
        {quantity > 0 && (
          <div className="absolute top-2 right-2 bg-primary-600 text-white w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs shadow-lg animate-in zoom-in">
            {quantity}
          </div>
        )}
        <div className={`absolute inset-0 bg-black/20 group-hover:bg-black/0 transition-all ${quantity > 0 ? 'opacity-0' : ''}`}></div>
      </div>
      <div className="flex flex-col flex-grow">
        <span className="text-gray-400 text-[10px] font-bold uppercase tracking-widest mb-1">{product.category}</span>
        <h3 className="text-white font-semibold mb-2 group-hover:text-primary-500 transition-colors line-clamp-1">{product.name}</h3>
        <div className="mt-auto flex justify-between items-center">
          <span className="text-primary-500 font-bold text-lg">${product.price.toFixed(2)}</span>
          
          {quantity > 0 ? (
            <div className="flex items-center gap-2 bg-dark-900/80 backdrop-blur-sm rounded-xl p-1 border border-white/10">
              <button 
                onClick={handleDecrease}
                className="p-1.5 hover:bg-white/10 rounded-lg text-gray-400 hover:text-white transition-all active:scale-75"
              >
                <Minus size={16} />
              </button>
              <span className="text-sm font-bold w-4 text-center text-white">{quantity}</span>
              <button 
                onClick={handleIncrease}
                className="p-1.5 hover:bg-primary-600 rounded-lg text-primary-500 hover:text-white transition-all active:scale-75"
              >
                <Plus size={16} />
              </button>
            </div>
          ) : (
            <button 
              onClick={handleAdd}
              className="bg-primary-600 hover:bg-primary-500 text-white p-2.5 rounded-xl transition-all shadow-lg active:scale-90"
            >
              <Plus size={18} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
