import React, { useState, useEffect } from 'react';
import axios from 'axios';
import API_BASE_URL from '../apiConfig';
import { LayoutDashboard, ShoppingBag, DollarSign, TrendingUp, Calendar, ArrowLeft, Plus, Trash2, Edit2, Package, Image as ImageIcon, Tag, Store, MapPin, Phone, Save, X, Printer, Eye, Coffee, Utensils, GlassWater, IceCream, LayoutGrid } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useProducts } from '../context/ProductContext';
import ReceiptModal from '../components/ReceiptModal';

const Admin = () => {
  const [activeTab, setActiveTab] = useState('orders'); 
  const [orders, setOrders] = useState([]);
  const { products, refreshProducts, loading: productsLoading } = useProducts();
  const [stats, setStats] = useState({ totalRevenue: 0, totalOrders: 0, dailyStats: {} });
  const [loading, setLoading] = useState(true);
  const [isReceiptOpen, setIsReceiptOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [newProduct, setNewProduct] = useState({ name: '', price: '', category: 'Coffee', image: '' });
  const [editingId, setEditingId] = useState(null);
  const navigate = useNavigate();

  const [shopSettings, setShopSettings] = useState(() => {
    const saved = localStorage.getItem('shopSettings');
    return saved ? JSON.parse(saved) : { name: 'MEY ASTRA CAFE', subtitle: '(ASTRA BREW)', address: 'Cambodia', phone: '(855) 87' };
  });

  const fetchData = async () => {
    try {
      const ordersRes = await axios.get(`${API_BASE_URL}/api/orders`);
      setOrders(ordersRes.data);
    } catch (err) {
      const local = JSON.parse(localStorage.getItem('local_orders') || '[]');
      setOrders(local);
    } finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, []);

  const handleAddProduct = async (e) => {
    e.preventDefault();
    const productData = { ...newProduct, price: parseFloat(newProduct.price), _id: editingId || Date.now().toString() };
    try {
      if (editingId) await axios.put(`${API_BASE_URL}/api/products/${editingId}`, productData);
      else await axios.post(`${API_BASE_URL}/api/products`, productData);
      toast.success('Saved to Server!');
    } catch (err) {
      const current = JSON.parse(localStorage.getItem('local_products') || '[]');
      let updated;
      if (editingId) updated = current.map(p => p._id === editingId ? productData : p);
      else updated = [productData, ...current];
      localStorage.setItem('local_products', JSON.stringify(updated));
      toast.success('Saved to Mobile Memory!');
    }
    setNewProduct({ name: '', price: '', category: 'Coffee', image: '' });
    setEditingId(null);
    refreshProducts();
  };

  const handleEditClick = (p) => {
    setNewProduct({ name: p.name, price: p.price.toString(), category: p.category, image: p.image });
    setEditingId(p._id);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleLogout = () => { localStorage.removeItem('user'); navigate('/login'); };

  const getCategoryIcon = (cat) => {
    switch (cat) {
      case 'Coffee': return <Coffee size={14} />;
      case 'Food': return <Utensils size={14} />;
      case 'Smoothie': return <GlassWater size={14} />;
      case 'Tea': return <IceCream size={14} />;
      default: return <LayoutGrid size={14} />;
    }
  };

  if (loading || productsLoading) return <div className="flex items-center justify-center h-screen bg-dark-900 text-white font-black uppercase italic tracking-widest animate-pulse">MEY ASTRAA Loading...</div>;

  return (
    <div className="min-h-screen bg-dark-900 text-gray-100 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <header className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-6 mb-10">
          <div className="flex items-center gap-4">
            <Link to="/" className="p-3 bg-white/5 rounded-2xl hover:bg-white/10 transition-all active:scale-90"><ArrowLeft size={24} /></Link>
            <h1 className="text-3xl font-black uppercase italic tracking-tighter">Admin <span className="text-primary-500">Center</span></h1>
          </div>
          <div className="flex flex-wrap bg-dark-800 p-2 rounded-2xl border border-white/5">
             {[{ id: 'orders', label: 'Orders', icon: <ShoppingBag size={16} /> }, { id: 'products', label: 'Menu', icon: <Package size={16} /> }].map(tab => (
               <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${activeTab === tab.id ? 'bg-primary-600 text-white shadow-lg' : 'text-gray-500'}`}>{tab.icon} {tab.label}</button>
             ))}
             <button onClick={handleLogout} className="px-6 py-2.5 rounded-xl text-xs font-black uppercase text-red-500">Logout</button>
          </div>
        </header>

        {activeTab === 'orders' && (
          <div className="glass-card rounded-3xl overflow-hidden border border-white/5 shadow-2xl">
              <div className="md:hidden divide-y divide-white/5">
                 {orders.length === 0 ? <p className="p-10 text-center opacity-30 uppercase font-black text-xs">No orders found</p> : orders.map((order) => (
                    <div key={order._id} className="p-5 flex flex-col gap-4">
                       <div className="flex justify-between items-center"><span className="font-mono text-xs text-gray-500 font-bold">#{order._id.substring(order._id.length - 6)}</span><span className="px-2 py-0.5 rounded-md text-[10px] font-black uppercase bg-green-500/10 text-green-500">{order.status || 'Done'}</span></div>
                       <div className="flex justify-between items-end"><div><p className="text-sm font-bold text-white mb-1">{order.items.length} Items</p><p className="text-[10px] text-gray-500 uppercase">{order.paymentMethod}</p></div><p className="text-lg font-black text-primary-500">${(order.totalAmount || 0).toFixed(2)}</p></div>
                    </div>
                 ))}
              </div>
          </div>
        )}

        {activeTab === 'products' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-1">
              <div className="glass-card p-6 rounded-[2.5rem] border border-white/5 sticky top-8">
                <h3 className="text-xl font-black mb-6 uppercase flex items-center gap-2 italic">{editingId ? <Edit2 className="text-primary-500" /> : <Plus className="text-primary-500" />} {editingId ? 'Edit' : 'Add New'}</h3>
                <form onSubmit={handleAddProduct} className="space-y-5">
                   <input type="text" placeholder="Name" className="w-full bg-dark-900 border border-white/10 rounded-2xl py-4 px-5 text-sm outline-none focus:border-primary-500" value={newProduct.name} onChange={e => setNewProduct({...newProduct, name: e.target.value})} required />
                   <div className="grid grid-cols-2 gap-4">
                      <input type="number" step="0.01" placeholder="Price" className="w-full bg-dark-900 border border-white/10 rounded-2xl py-4 px-5 text-sm outline-none focus:border-primary-500 font-mono" value={newProduct.price} onChange={e => setNewProduct({...newProduct, price: e.target.value})} required />
                      <select className="w-full bg-dark-900 border border-white/10 rounded-2xl py-4 px-5 text-sm outline-none focus:border-primary-500 font-bold" value={newProduct.category} onChange={e => setNewProduct({...newProduct, category: e.target.value})}><option>Coffee</option><option>Tea</option><option>Smoothie</option><option>Food</option></select>
                   </div>
                   <input type="file" accept="image/*" onChange={handleImageChange} className="w-full text-xs text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-black file:bg-primary-600 file:text-white hover:file:bg-primary-500 cursor-pointer" />
                   <button type="submit" className="w-full bg-primary-600 text-white font-black py-4.5 rounded-2xl shadow-xl active:scale-95 uppercase tracking-widest">{editingId ? 'Update' : 'Add to Menu'}</button>
                </form>
              </div>
            </div>

            <div className="lg:col-span-2">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                 {products.map(p => (
                   <div key={p._id} className="p-4 bg-dark-800 border border-white/5 rounded-3xl flex items-center justify-between group">
                      <div className="flex items-center gap-3">
                         <img src={p.image} className="w-12 h-12 rounded-xl object-cover" alt="" />
                         <div><h4 className="font-bold text-sm text-gray-100">{p.name}</h4><p className="text-[10px] text-primary-500 font-black uppercase tracking-widest">{p.category}</p></div>
                      </div>
                      <div className="flex items-center gap-3"><span className="font-mono font-black text-sm text-white">${p.price.toFixed(2)}</span><button onClick={() => handleEditClick(p)} className="p-2 bg-white/5 rounded-lg active:scale-75"><Edit2 size={14} /></button></div>
                   </div>
                 ))}
              </div>
            </div>
          </div>
        )}
      </div>
      <ReceiptModal isOpen={isReceiptOpen} order={selectedOrder} onClose={() => setIsReceiptOpen(false)} />
    </div>
  );
};

export default Admin;
