import React, { useState, useRef, useEffect, useMemo } from 'react';
import { Search, ShoppingCart, LayoutGrid, Coffee, Utensils, GlassWater, IceCream, ChevronDown, LayoutDashboard, Settings, LogOut, User, ClipboardList, Globe, Bell, CheckCircle2, Clock, X, Package } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import { useProducts } from '../context/ProductContext';
import { useCart } from '../context/CartContext';
import ProductCard from '../components/ProductCard';
import CartSidebar from '../components/CartSidebar';
import PaymentModal from '../components/PaymentModal';
import ReceiptModal from '../components/ReceiptModal';
import axios from 'axios';
import toast from 'react-hot-toast';
import useSound from 'use-sound';
import API_BASE_URL from '../apiConfig';

const POS = () => {
  const navigate = useNavigate();
  const { products, categories, loading } = useProducts();
  const { cartItems, clearCart } = useCart();
  const user = JSON.parse(localStorage.getItem('user') || '{"username": "Admin", "role": "admin"}');
  
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [isPaymentOpen, setIsPaymentOpen] = useState(false);
  const [isReceiptOpen, setIsReceiptOpen] = useState(false);
  const [completedOrder, setCompletedOrder] = useState(null);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isOrdersOpen, setIsOrdersOpen] = useState(false);
  const [pendingOrders, setPendingOrders] = useState([]);
  
  const lastOrderIdRef = useRef(null);
  const [playNotify] = useSound('https://cdn.pixabay.com/audio/2021/08/04/audio_0625c1539c.mp3', { volume: 0.7 });
  const menuRef = useRef(null);

  const fetchPendingOrders = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/api/orders`);
      const pending = res.data.filter(o => o.status === 'pending');
      if (pending.length > 0) {
        const newestOrder = pending[0];
        if (newestOrder._id !== lastOrderIdRef.current) {
          lastOrderIdRef.current = newestOrder._id;
          playNotify();
          setIsOrdersOpen(true);
          const isCash = newestOrder.paymentMethod === 'Cash';
          const alertMsg = isCash ? `NEW CASH ORDER: $${newestOrder.totalAmount.toFixed(2)} (Pay at Counter)` : `NEW QR ORDER: $${newestOrder.totalAmount.toFixed(2)}`;
          toast(alertMsg, { icon: isCash ? '💵' : '📱', style: { borderRadius: '20px', background: isCash ? '#eab308' : '#171717', color: isCash ? '#000' : '#fff', fontWeight: '900' }, duration: 7000 });
        }
      }
      setPendingOrders(pending);
    } catch (err) {
      console.error('Error fetching orders:', err);
    }
  };

  useEffect(() => {
    fetchPendingOrders();
    const interval = setInterval(fetchPendingOrders, 10000);
    return () => clearInterval(interval);
  }, []);

  const filteredProducts = useMemo(() => {
    return products.filter(p => {
      const matchesCategory = selectedCategory === 'All' || p.category === selectedCategory;
      const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [products, selectedCategory, searchQuery]);

  const handlePaymentSuccess = (order) => {
    setCompletedOrder(order);
    setIsPaymentOpen(false);
    setIsReceiptOpen(true);
    clearCart();
    fetchPendingOrders();
  };

  const confirmOrder = async (order) => {
    try {
      await axios.patch(`${API_BASE_URL}/api/orders/${order._id}/status`, { status: 'confirmed' });
      toast.success('Confirmed! Opening Receipt...');
      setIsOrdersOpen(false); 
      setCompletedOrder(order);
      setIsReceiptOpen(true);
      fetchPendingOrders();
    } catch (err) {
      toast.error('Failed to confirm order');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('user');
    navigate('/login');
  };

  useEffect(() => {
    if (isPaymentOpen || isReceiptOpen || isOrdersOpen || isUserMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => { document.body.style.overflow = 'unset'; };
  }, [isPaymentOpen, isReceiptOpen, isOrdersOpen, isUserMenuOpen]);

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
          <header className="sticky top-0 z-[100] bg-dark-800/80 backdrop-blur-xl border-b border-white/5 p-4 md:px-8">
            <div className="max-w-screen-2xl mx-auto flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                 <div className="w-10 h-10 bg-primary-600 rounded-xl flex items-center justify-center shadow-lg"><Coffee size={20} className="text-white" /></div>
                 <div className="hidden sm:block"><h1 className="text-lg font-black tracking-tighter uppercase">Mey Astra <span className="text-primary-500 font-medium ml-1 text-xs">POS</span></h1></div>
              </div>
              <div className="flex-1 max-w-md relative"><Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={16} /><input type="text" placeholder="Search..." className="w-full bg-dark-900 border border-white/10 rounded-full py-2.5 pl-10 pr-4 text-xs outline-none focus:border-primary-500 transition-all" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} /></div>
              <div className="flex items-center gap-2 sm:gap-4">
                <button onClick={() => setIsOrdersOpen(!isOrdersOpen)} className="relative p-2.5 bg-dark-900 border border-white/10 rounded-xl hover:bg-white/5 transition-all">
                  <Bell size={20} className={pendingOrders.length > 0 ? 'text-primary-500 animate-swing' : 'text-gray-400'} />
                  {pendingOrders.length > 0 && <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center border-2 border-dark-800">{pendingOrders.length}</span>}
                </button>
                <div className="relative"><button onClick={() => setIsUserMenuOpen(!isUserMenuOpen)} className="w-10 h-10 sm:w-auto sm:px-3 sm:py-1.5 bg-dark-900 border border-white/10 rounded-xl flex items-center gap-2"><User size={14} className="text-white" /><span className="hidden sm:block text-xs font-bold uppercase">{user.username}</span></button>
                  {isUserMenuOpen && (
                    <div className="absolute right-0 top-full mt-2 w-56 bg-dark-800 border border-white/10 rounded-2xl shadow-2xl overflow-hidden z-[110]">
                      <div className="p-2 space-y-1">
                        {user.role === 'admin' && (
                          <>
                            <Link to="/admin" state={{tab: 'orders'}} onClick={() => setIsUserMenuOpen(false)} className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold text-gray-300 hover:bg-primary-500/10"><LayoutDashboard size={16} className="text-primary-500" /> Admin Dashboard</Link>
                            <Link to="/admin" state={{tab: 'products'}} onClick={() => setIsUserMenuOpen(false)} className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold text-amber-500 hover:bg-amber-500/10"><Package size={16} /> Menu Manager</Link>
                          </>
                        )}
                        <Link to="/menu" onClick={() => setIsUserMenuOpen(false)} className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold text-blue-400 hover:bg-blue-500/10"><Globe size={16} /> Online Menu</Link>
                        <button onClick={handleLogout} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold text-red-500 hover:bg-red-500/10"><LogOut size={16} /> Sign Out</button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </header>
          <div className="bg-dark-800/30 border-b border-white/5 overflow-x-auto no-scrollbar sticky top-[73px] z-40 backdrop-blur-md">
            <div className="max-w-screen-2xl mx-auto flex p-4 gap-3">
              <button onClick={() => setSelectedCategory('All')} className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-black transition-all border uppercase tracking-widest ${selectedCategory === 'All' ? 'bg-primary-600 border-primary-500 text-white' : 'bg-white/5 border-white/5 text-gray-400'}`}>All</button>
              {categories.map((cat) => (<button key={cat} onClick={() => setSelectedCategory(cat)} className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-black transition-all border uppercase tracking-widest ${selectedCategory === cat ? 'bg-primary-600 border-primary-500 text-white' : 'bg-white/5 border-white/5 text-gray-400'}`}>{cat}</button>))}
            </div>
          </div>
        </>
      )}

      <div className="flex-grow flex flex-col md:flex-row max-w-screen-2xl mx-auto w-full relative">
        <main className="flex-grow p-4 md:p-8 overflow-y-auto custom-scrollbar no-print">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6 pb-32">
            {filteredProducts.map((product) => <ProductCard key={product._id} product={product} />)}
          </div>
        </main>
        <aside className="hidden xl:flex w-[400px] bg-dark-800/50 border-l border-white/5 flex-col p-6 no-print">
          <CartSidebar onCheckout={() => setIsPaymentOpen(true)} />
        </aside>
        {cartItems.length > 0 && !isPaymentOpen && (
           <div className="xl:hidden fixed bottom-8 left-1/2 -translate-x-1/2 w-[92%] z-[90] animate-in slide-in-from-bottom-10 duration-500">
              <button onClick={() => setIsPaymentOpen(true)} className="w-full bg-primary-600 text-white py-5 px-8 rounded-[2.5rem] shadow-[0_20px_50px_rgba(234,179,8,0.4)] flex items-center justify-between font-black uppercase tracking-widest active:scale-95 border border-primary-400/20"><div className="flex items-center gap-3"><ShoppingCart size={22} /><span className="text-xs">Process Order</span></div><span className="text-xl font-mono">${cartItems.reduce((acc, item) => acc + (item.price * item.quantity), 0).toFixed(2)}</span></button>
           </div>
        )}
      </div>

      {isOrdersOpen && (
        <div className="fixed inset-0 z-[150] flex justify-end">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsOrdersOpen(false)}></div>
          <div className="relative w-full sm:max-w-md bg-dark-800 h-full shadow-2xl flex flex-col">
             <div className="p-6 border-b border-white/10 flex items-center justify-between"><h3 className="text-xl font-black uppercase italic tracking-tighter flex items-center gap-2"><Clock size={20} className="text-primary-500" /> Incoming Orders</h3><button onClick={() => setIsOrdersOpen(false)} className="p-3 bg-white/5 hover:bg-white/10 rounded-2xl"><X size={24} /></button></div>
             <div className="flex-grow overflow-y-auto p-4 space-y-4 custom-scrollbar">
                {pendingOrders.length === 0 ? <p className="text-center text-gray-500 py-10 uppercase font-black text-xs">No pending orders</p> : pendingOrders.map((order) => (
                    <div key={order._id} className="bg-white/5 border border-white/10 rounded-[2rem] p-5">
                       <div className="flex justify-between items-start mb-4"><p className="text-[10px] font-black text-primary-500 uppercase">Order #{order._id.substring(order._id.length-4)}</p><span className="bg-blue-500/20 text-blue-400 px-2.5 py-1 rounded-lg text-[10px] font-black uppercase">{order.orderType}</span></div>
                       <div className="flex justify-between items-center pt-3 border-t border-white/5"><span className="font-black text-2xl text-white font-mono">${order.totalAmount.toFixed(2)}</span><button onClick={() => confirmOrder(order)} className="bg-primary-600 hover:bg-primary-500 text-white px-6 py-3 rounded-2xl text-xs font-black uppercase transition-all shadow-lg active:scale-90 flex items-center gap-2"><CheckCircle2 size={16} /> Confirm</button></div>
                    </div>
                ))}
             </div>
          </div>
        </div>
      )}
      <PaymentModal isOpen={isPaymentOpen} onClose={() => setIsPaymentOpen(false)} onPaymentSuccess={handlePaymentSuccess} isGuest={false} />
      <ReceiptModal isOpen={isReceiptOpen} order={completedOrder} onClose={() => setIsReceiptOpen(false)} />
    </div>
  );
};

export default POS;
