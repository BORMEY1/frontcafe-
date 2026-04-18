import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Search, ShoppingBag, Coffee, Utensils, GlassWater, IceCream, LayoutGrid, ArrowLeft, CheckCircle, Clock, UtensilsCrossed, History, X, Globe, User, LogOut } from 'lucide-react';
import { useProducts } from '../context/ProductContext';
import { useCart } from '../context/CartContext';
import ProductCard from '../components/ProductCard';
import PaymentModal from '../components/PaymentModal';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import useSound from 'use-sound';
import API_BASE_URL from '../apiConfig';

const OnlineMenu = () => {
  const { products, categories, loading } = useProducts();
  const { cartItems, total, clearCart } = useCart();
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [isPaymentOpen, setIsPaymentOpen] = useState(false);
  const [isSuccessOpen, setIsSuccessOpen] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [showStatusPopup, setShowStatusPopup] = useState(false);
  const [myOrders, setMyOrders] = useState([]);
  const prevOrdersRef = useRef([]);
  const navigate = useNavigate();

  const shopSettings = JSON.parse(localStorage.getItem('shopSettings') || '{"name": "MEY ASTRA CAFE", "subtitle": "(ASTRA BREW)", "address": "Takhmao, Kandal, Cambodia"}');
  const [playSuccess] = useSound('https://cdn.pixabay.com/audio/2022/03/10/audio_c8c8a73053.mp3', { volume: 0.7 });
  const [playNotify] = useSound('https://cdn.pixabay.com/audio/2022/03/15/audio_78391032aa.mp3', { volume: 0.7 });

  const filteredProducts = useMemo(() => {
    return products.filter(p => {
      const matchesCategory = selectedCategory === 'All' || p.category === selectedCategory;
      const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [products, selectedCategory, searchQuery]);

  const fetchMyOrders = async () => {
    const savedOrderIds = JSON.parse(localStorage.getItem('myOrderIds') || '[]');
    if (savedOrderIds.length === 0) return;
    try {
      const res = await axios.get(`${API_BASE_URL}/api/orders`);
      const filtered = res.data.filter(o => savedOrderIds.includes(o._id));
      if (JSON.stringify(filtered) !== JSON.stringify(prevOrdersRef.current)) {
        const newlyConfirmed = filtered.find(order => 
          order.status === 'confirmed' && 
          prevOrdersRef.current.some(prev => prev._id === order._id && prev.status === 'pending')
        );
        if (newlyConfirmed) {
          playNotify();
          setShowStatusPopup(true);
          setIsSuccessOpen(false);
          setTimeout(() => setShowStatusPopup(false), 3000);
        }
        prevOrdersRef.current = filtered;
        setMyOrders(filtered);
      }
    } catch (err) {
      console.error('Error fetching my orders:', err);
    }
  };

  useEffect(() => {
    fetchMyOrders();
    const interval = setInterval(fetchMyOrders, 15000);
    return () => clearInterval(interval);
  }, []);

  const handlePaymentSuccess = (order) => {
    const savedOrderIds = JSON.parse(localStorage.getItem('myOrderIds') || '[]');
    localStorage.setItem('myOrderIds', JSON.stringify([order._id, ...savedOrderIds]));
    playSuccess();
    setIsPaymentOpen(false);
    setIsSuccessOpen(true);
    clearCart();
    fetchMyOrders();
    setTimeout(() => setIsSuccessOpen(false), 8000);
  };

  useEffect(() => {
    if (isPaymentOpen || isSuccessOpen || isHistoryOpen || showStatusPopup) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => { document.body.style.overflow = 'unset'; };
  }, [isPaymentOpen, isSuccessOpen, isHistoryOpen, showStatusPopup]);

  const getCategoryIcon = (cat) => {
    switch (cat) {
      case 'Coffee': return <Coffee size={18} />;
      case 'Food': return <Utensils size={18} />;
      case 'Smoothie': return <GlassWater size={18} />;
      case 'Tea': return <IceCream size={18} />;
      default: return <LayoutGrid size={18} />;
    }
  };

  return (
    <div className="min-h-screen bg-dark-900 text-gray-100 flex flex-col relative overflow-x-hidden">
      {!isPaymentOpen && (
        <>
          <div className="sticky top-0 z-[100] bg-dark-900/80 backdrop-blur-2xl border-b border-white/5">
             <div className="flex items-center justify-between px-4 py-2.5 border-b border-white/[0.03]">
                <div className="flex items-center gap-2.5">
                   <div className="w-7 h-7 bg-primary-600 rounded-lg flex items-center justify-center shadow-lg shadow-primary-600/20 active:scale-90 transition-all"><Coffee size={16} className="text-white" /></div>
                   <span className="text-[11px] font-black uppercase tracking-[0.25em] text-white/90">MEY ASTRAA</span>
                </div>
                <button onClick={() => setIsHistoryOpen(true)} className="relative w-10 h-10 bg-white/5 border border-white/5 flex items-center justify-center rounded-xl active:scale-90 transition-all hover:bg-white/10"><History size={20} className="text-gray-400" />{myOrders.some(o => o.status === 'pending') && (<span className="absolute -top-1 -right-1 w-3 h-3 bg-primary-500 rounded-full border-2 border-dark-900 animate-pulse"></span>)}</button>
             </div>
             <div className="p-3.5"><div className="relative max-w-2xl mx-auto"><Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600" size={18} /><input type="text" placeholder="Search flavors..." className="w-full bg-dark-800 border border-white/10 rounded-2xl py-3.5 pl-12 pr-5 text-sm outline-none focus:border-primary-500 transition-all placeholder:text-gray-700 shadow-inner" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} /></div></div>
          </div>
          <div className="bg-dark-900/40 border-b border-white/5 overflow-x-auto no-scrollbar sticky top-[108px] z-40 backdrop-blur-md">
            <div className="max-w-screen-2xl mx-auto flex px-4 py-4 gap-3">
              <button onClick={() => setSelectedCategory('All')} className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-[10px] font-black transition-all whitespace-nowrap border uppercase tracking-widest active:scale-90 ${selectedCategory === 'All' ? 'bg-primary-600 border-primary-500 text-white shadow-lg' : 'bg-dark-800 border-white/5 text-gray-500'}`}>All Items</button>
              {categories.map((cat) => (
                <button key={cat} onClick={() => setSelectedCategory(cat)} className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-[10px] font-black transition-all whitespace-nowrap border uppercase tracking-widest active:scale-90 ${selectedCategory === cat ? 'bg-primary-600 border-primary-500 text-white shadow-lg' : 'bg-dark-800 border-white/5 text-gray-500'}`}>{cat}</button>
              ))}
            </div>
          </div>
        </>
      )}

      <main className="max-w-7xl mx-auto w-full p-4">
        {loading ? (
          <div className="flex items-center justify-center py-20"><div className="w-10 h-10 border-2 border-primary-600 border-t-transparent rounded-full animate-spin"></div></div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-6 pb-24">
            {filteredProducts.map((product) => (<ProductCard key={product._id} product={product} />))}
          </div>
        )}
      </main>

      {!isPaymentOpen && (
        <footer className="p-10 pb-32 text-center border-t border-white/5 bg-dark-800/20">
           <h2 className="text-xl font-bold mb-1 tracking-tighter uppercase">{shopSettings.name}</h2>
           <p className="text-gray-600 text-[9px] uppercase font-black tracking-[0.4em]">Mey Astra Astra POS</p>
        </footer>
      )}

      {(cartItems.length > 0 && !isPaymentOpen) && (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 w-[92%] max-w-md z-50 animate-in slide-in-from-bottom-10 duration-500 hidden sm:block">
           <button onClick={() => setIsPaymentOpen(true)} className="w-full bg-primary-600 hover:bg-primary-500 text-white py-5 px-8 rounded-[2.5rem] shadow-2xl flex items-center justify-center gap-4 border border-primary-400/20 font-black uppercase tracking-widest active:scale-95 transition-all"><ShoppingBag size={24} /><span>Checkout • ${total.toFixed(2)}</span></button>
        </div>
      )}

      <PaymentModal isOpen={isPaymentOpen} onClose={() => setIsPaymentOpen(false)} onPaymentSuccess={handlePaymentSuccess} isGuest={true} />

      {isSuccessOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-in fade-in duration-300">
           <div className="glass-card max-w-sm w-full p-10 rounded-[3.5rem] text-center border border-primary-500/30">
              <div className="w-20 h-20 bg-green-500/20 text-green-500 rounded-full flex items-center justify-center mx-auto mb-8 animate-bounce"><CheckCircle size={44} strokeWidth={3} /></div>
              <h2 className="text-2xl font-black mb-3 uppercase tracking-tighter italic text-white">Order Sent!</h2>
              <button onClick={() => {setIsSuccessOpen(false); setIsHistoryOpen(true);}} className="w-full py-5 bg-primary-600 hover:bg-primary-500 text-white rounded-[2rem] text-xs font-black uppercase tracking-[0.2em] transition-all">Track Order</button>
           </div>
        </div>
      )}

      {showStatusPopup && (
        <div className="fixed inset-0 z-[220] flex items-center justify-center p-4 animate-in zoom-in fade-in duration-500">
           <div className="absolute inset-0 bg-black/50 backdrop-blur-3xl"></div>
           <div className="glass-card max-w-sm w-full p-12 rounded-[4rem] text-center border border-primary-500/50 relative z-10 overflow-hidden">
              <div className="relative mb-10"><div className="w-28 h-24 bg-primary-500 text-white rounded-[2.5rem] flex items-center justify-center mx-auto animate-bounce relative z-20"><CheckCircle size={56} strokeWidth={3} /></div></div>
              <h3 className="text-4xl font-black text-white tracking-tighter uppercase italic">Confirmed!</h3>
           </div>
        </div>
      )}

      {isHistoryOpen && (
        <div className="fixed inset-0 z-[250] flex justify-end">
           <div className="absolute inset-0 bg-black/70 backdrop-blur-md" onClick={() => setIsHistoryOpen(false)}></div>
           <div className="relative w-full sm:max-w-sm bg-dark-800 h-full shadow-2xl animate-in slide-in-from-right duration-300 flex flex-col border-l border-white/5">
              <div className="p-7 border-b border-white/5 flex items-center justify-between">
                 <h3 className="text-2xl font-black uppercase italic tracking-tighter flex items-center gap-3"><History size={28} className="text-primary-500" /> My Orders</h3>
                 <button onClick={() => setIsHistoryOpen(false)} className="w-12 h-12 bg-white/5 border border-white/5 flex items-center justify-center rounded-2xl active:scale-75 transition-all"><X size={28} /></button>
              </div>
              <div className="flex-grow overflow-y-auto p-5 space-y-5 custom-scrollbar">
                 {myOrders.length === 0 ? (<div className="h-full flex flex-col items-center justify-center opacity-30 text-[10px] font-black uppercase tracking-[0.3em]">No orders yet</div>) : myOrders.map(order => (
                     <div key={order._id} className="bg-white/5 border border-white/5 rounded-[2rem] p-5 animate-in fade-in slide-in-from-bottom-2 duration-300">
                        <div className="flex justify-between items-start mb-4">
                           <div><p className="text-[11px] font-black text-primary-500 uppercase tracking-widest">Order #{order._id.substring(order._id.length-4)}</p></div>
                           <div className="flex flex-col items-end gap-1.5"><span className={`px-3 py-1 rounded-xl text-[10px] font-black uppercase ${order.status === 'confirmed' ? 'bg-green-500/10 text-green-500' : 'bg-amber-500/10 text-amber-500 animate-pulse'}`}>{order.status === 'confirmed' ? 'Confirmed' : 'Pending'}</span><p className="text-[8px] font-black text-gray-500 italic opacity-80">{order.status === 'confirmed' ? '5-8 MIN WAIT' : 'PLEASE WAIT...'}</p></div>
                        </div>
                        <div className="space-y-1.5 bg-dark-900/40 p-4 rounded-2xl">{order.items.map((it, i) => (<div key={i} className="flex justify-between text-xs text-gray-400 font-bold"><span>{it.quantity}x {it.name}</span><span>${(it.price * it.quantity).toFixed(2)}</span></div>))}</div>
                        <div className="mt-4 pt-4 border-t border-white/5 flex justify-between items-center"><span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">{order.orderType}</span><span className="text-xl font-black text-white font-mono tracking-tighter">${order.totalAmount.toFixed(2)}</span></div>
                     </div>
                   ))}
              </div>
           </div>
        </div>
      )}

      {/* Mobile Bottom Navigation - Highly Compact Version */}
      {!isPaymentOpen && (
        <div className="fixed bottom-0 left-0 right-0 z-[120] sm:hidden bg-dark-800/95 backdrop-blur-2xl border-t border-white/5 px-6 py-3 flex items-center justify-between shadow-[0_-15px_50px_rgba(0,0,0,0.8)] no-print">
           {/* Small Menu Button */}
           <button onClick={() => {setSelectedCategory('All'); window.scrollTo({top: 0, behavior: 'smooth'});}} className={`flex flex-col items-center gap-0.5 active:scale-75 transition-all ${selectedCategory === 'All' ? 'text-primary-500' : 'text-gray-600'}`}><LayoutGrid size={18} strokeWidth={2.5} /><span className="text-[8px] font-black uppercase tracking-tighter">Menu</span></button>

           {/* Small Orders Button */}
           <button onClick={() => setIsHistoryOpen(true)} className={`flex flex-col items-center gap-0.5 relative active:scale-75 transition-all ${isHistoryOpen ? 'text-primary-500' : 'text-gray-600'}`}><History size={18} strokeWidth={2.5} />{myOrders.some(o => o.status === 'pending') && (<span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-primary-500 rounded-full border border-dark-800 animate-pulse"></span>)}<span className="text-[8px] font-black uppercase tracking-tighter">Orders</span></button>

           {/* Compact Center Payment Button */}
           <div className="relative -mt-10"><button onClick={() => cartItems.length > 0 && setIsPaymentOpen(true)} className={`w-13 h-13 rounded-2xl flex items-center justify-center shadow-[0_8px_25px_rgba(234,179,8,0.3)] active:scale-[0.85] transition-all border ${cartItems.length > 0 ? 'bg-primary-600 border-primary-400 text-white' : 'bg-dark-900 border-white/5 text-gray-800'}`}><ShoppingBag size={22} strokeWidth={2.5} /></button></div>

           {/* MEY ASTRAA Button (With Logo & Color) */}
           <button 
             onClick={() => {setSelectedCategory('All'); window.scrollTo({top: 0, behavior: 'smooth'});}} 
             className="flex items-center gap-2 px-3 py-2 bg-primary-500/10 border border-primary-500/30 rounded-xl active:scale-90 transition-all text-primary-500 shadow-[0_0_15px_rgba(234,179,8,0.1)]"
           >
              <div className="w-5 h-5 bg-primary-600 rounded-md flex items-center justify-center shadow-lg shadow-primary-600/20">
                 <Coffee size={12} className="text-white" />
              </div>
              <span className="text-[8px] font-black uppercase tracking-widest leading-none">MEY ASTRAA</span>
           </button>
        </div>
      )}
    </div>
  );
};

export default OnlineMenu;
