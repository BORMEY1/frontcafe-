import React, { useState, useEffect } from 'react';
import axios from 'axios';
import API_BASE_URL from '../apiConfig';
import { LayoutDashboard, ShoppingBag, DollarSign, TrendingUp, Calendar, ArrowLeft, Plus, Trash2, Edit2, Package, Image as ImageIcon, Tag, Store, MapPin, Phone, Save, X, Printer, Eye, Coffee, Utensils, GlassWater, IceCream, LayoutGrid } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useProducts } from '../context/ProductContext';
import ReceiptModal from '../components/ReceiptModal';

const Admin = () => {
  const location = useLocation();
  const [activeTab, setActiveTab] = useState(location.state?.tab || 'orders'); 
  const [orders, setOrders] = useState([]);
  const { products, refreshProducts, loading: productsLoading } = useProducts();
  const [stats, setStats] = useState({ totalRevenue: 0, totalOrders: 0, dailyStats: {} });
  const [loading, setLoading] = useState(true);
  const [isReceiptOpen, setIsReceiptOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);

  const [newProduct, setNewProduct] = useState({ name: '', price: '', category: 'Coffee', image: '' });
  const [editingId, setEditingId] = useState(null);
  
  const [shopSettings, setShopSettings] = useState(() => {
    const saved = localStorage.getItem('shopSettings');
    return saved ? JSON.parse(saved) : {
      name: 'MEY ASTRA CAFE',
      subtitle: '(ASTRA BREW)',
      address: 'Takhmao, Kandal, Cambodia',
      phone: '(855) 87 574 018'
    };
  });

  const fetchData = async () => {
    try {
      const [ordersRes, statsRes] = await Promise.all([
        axios.get(`${API_BASE_URL}/api/orders`),
        axios.get(`${API_BASE_URL}/api/stats`)
      ]);
      setOrders(ordersRes.data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)));
      setStats(statsRes.data);
    } catch (err) {
      console.error('Error fetching admin data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (location.state?.tab) {
      setActiveTab(location.state.tab);
    }
  }, [location.state]);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setNewProduct({ ...newProduct, image: reader.result });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAddProduct = async (e) => {
    e.preventDefault();
    if (!newProduct.image) {
      toast.error('Please upload or enter an image URL');
      return;
    }
    try {
      if (editingId) {
        await axios.put(`http://localhost:5000/api/products/${editingId}`, {
          ...newProduct,
          price: parseFloat(newProduct.price)
        });
        toast.success('Product updated successfully!');
      } else {
        await axios.post('http://localhost:5000/api/products', {
          ...newProduct,
          price: parseFloat(newProduct.price)
        });
        toast.success('Product added successfully!');
      }
      setNewProduct({ name: '', price: '', category: 'Coffee', image: '' });
      setEditingId(null);
      refreshProducts();
    } catch (err) {
      toast.error(editingId ? 'Failed to update product' : 'Failed to add product');
    }
  };

  const handleEditClick = (product) => {
    setNewProduct({
      name: product.name,
      price: product.price.toString(),
      category: product.category,
      image: product.image
    });
    setEditingId(product._id);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDeleteProduct = async (id) => {
    if (!window.confirm('Are you sure you want to remove this product?')) return;
    try {
      await axios.delete(`http://localhost:5000/api/products/${id}`);
      toast.success('Product removed');
      refreshProducts();
    } catch (err) {
      toast.error('Failed to remove product');
    }
  };

  const handleSaveSettings = (e) => {
    e.preventDefault();
    localStorage.setItem('shopSettings', JSON.stringify(shopSettings));
    toast.success('Shop settings updated!');
  };

  const openReceipt = (order) => {
    setSelectedOrder(order);
    setIsReceiptOpen(true);
  };

  const getCategoryIcon = (cat) => {
    switch (cat) {
      case 'Coffee': return <Coffee size={14} />;
      case 'Food': return <Utensils size={14} />;
      case 'Smoothie': return <GlassWater size={14} />;
      case 'Tea': return <IceCream size={14} />;
      default: return <LayoutGrid size={14} />;
    }
  };

  if (loading || productsLoading) return <div className="flex items-center justify-center h-screen bg-dark-900 text-white">Loading Admin Center...</div>;

  return (
    <div className="min-h-screen bg-dark-900 text-gray-100 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <header className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-6 mb-10">
          <div className="flex items-center gap-4">
            <Link to="/" className="p-2 bg-dark-800 rounded-xl hover:bg-white/5 transition-all">
              <ArrowLeft size={24} />
            </Link>
            <div>
              <h1 className="text-3xl font-bold flex items-center gap-3">
                <LayoutDashboard className="text-primary-500" />
                Admin Center
              </h1>
              <p className="text-xs text-gray-500 mt-1 uppercase tracking-widest font-bold">Store Management & Control</p>
            </div>
          </div>
          
          <div className="flex flex-wrap bg-dark-800 p-1.5 rounded-2xl border border-white/5 shadow-inner">
             {[
               { id: 'orders', label: 'Sales & Orders', icon: <ShoppingBag size={16} /> },
               { id: 'products', label: 'Menu Manager', icon: <Package size={16} /> },
               { id: 'settings', label: 'Shop Setup', icon: <Store size={16} /> }
             ].map(tab => (
               <button 
                 key={tab.id}
                 onClick={() => setActiveTab(tab.id)}
                 className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${activeTab === tab.id ? 'bg-primary-600 text-white shadow-lg' : 'text-gray-500 hover:text-gray-300'}`}
               >
                 {tab.icon}
                 {tab.label}
               </button>
             ))}
          </div>
        </header>

        {activeTab === 'orders' && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
              <div className="glass-card p-6 rounded-3xl relative overflow-hidden border border-white/5">
                 <div className="absolute top-0 right-0 p-4 opacity-10"><DollarSign size={80} /></div>
                 <p className="text-gray-400 text-sm mb-1 uppercase tracking-wider font-bold">Total Revenue</p>
                 <h2 className="text-4xl font-bold text-primary-500">${stats.totalRevenue.toFixed(2)}</h2>
                 <div className="mt-4 flex items-center gap-2 text-green-500 text-xs font-bold bg-green-500/10 px-2 py-1 rounded-lg w-fit">
                    <TrendingUp size={14} /> ACTIVE GROWTH
                 </div>
              </div>
              <div className="glass-card p-6 rounded-3xl relative overflow-hidden border border-white/5">
                 <div className="absolute top-0 right-0 p-4 opacity-10"><ShoppingBag size={80} /></div>
                 <p className="text-gray-400 text-sm mb-1 uppercase tracking-wider font-bold">Total Orders</p>
                 <h2 className="text-4xl font-bold">{stats.totalOrders}</h2>
                 <p className="mt-4 text-gray-500 text-xs font-bold">SUCCESSFUL SALES</p>
              </div>
              <div className="glass-card p-6 rounded-3xl relative overflow-hidden border border-white/5">
                 <div className="absolute top-0 right-0 p-4 opacity-10"><Calendar size={80} /></div>
                 <p className="text-gray-400 text-sm mb-1 uppercase tracking-wider font-bold">Daily Stats</p>
                 <h2 className="text-4xl font-bold">{Object.keys(stats.dailyStats).length} Days</h2>
                 <p className="mt-4 text-gray-500 text-xs font-bold">STORE OPERATION</p>
              </div>
            </div>

            <div className="glass-card rounded-3xl overflow-hidden border border-white/5 shadow-2xl">
              <div className="p-6 border-b border-white/5 flex justify-between items-center bg-white/[0.02]">
                 <h3 className="text-xl font-bold">Transaction History</h3>
                 <button onClick={fetchData} className="text-primary-500 text-sm font-bold hover:underline">Refresh</button>
              </div>
              
              {/* Desktop Table View */}
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="bg-white/5 text-gray-400 text-xs uppercase tracking-widest">
                      <th className="px-6 py-5">Order ID</th>
                      <th className="px-6 py-5">Items</th>
                      <th className="px-6 py-5">Total</th>
                      <th className="px-6 py-5">Method</th>
                      <th className="px-6 py-5">Date</th>
                      <th className="px-6 py-5">Status</th>
                      <th className="px-6 py-5 text-right">Receipt</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {orders.map((order) => (
                      <tr key={order._id} className="hover:bg-white/[0.02] transition-colors group">
                        <td className="px-6 py-4 font-mono text-xs text-gray-500 group-hover:text-primary-400 transition-colors">#{order._id.substring(order._id.length - 6).toUpperCase()}</td>
                        <td className="px-6 py-4">
                          <div className="flex flex-col">
                            <span className="text-sm font-bold text-gray-200">{order.items.length} items</span>
                            <span className="text-[10px] text-gray-500 truncate max-w-[200px]">
                              {order.items.map(i => i.name).join(', ')}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 font-bold text-primary-500">${(order.totalAmount || 0).toFixed(2)}</td>
                        <td className="px-6 py-4">
                           <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                             order.paymentMethod === 'Cash' ? 'bg-green-500/10 text-green-500' :
                             'bg-purple-500/10 text-purple-500'
                           }`}>
                             {order.paymentMethod}
                           </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-400 font-medium">{new Date(order.createdAt).toLocaleString()}</td>
                        <td className="px-6 py-4">
                           <span className={`flex items-center gap-2 text-[10px] font-bold uppercase tracking-tighter ${order.status === 'confirmed' ? 'text-green-500' : 'text-amber-500'}`}>
                              <span className={`w-2 h-2 rounded-full ${order.status === 'confirmed' ? 'bg-green-500' : 'bg-amber-500 animate-pulse'}`}></span>
                              {order.status || 'Done'}
                           </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                           <button 
                             onClick={() => openReceipt(order)}
                             className="p-2 bg-primary-500/10 hover:bg-primary-500 text-primary-500 hover:text-white rounded-xl transition-all active:scale-90"
                           >
                             <Printer size={16} />
                           </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile Card View */}
              <div className="md:hidden divide-y divide-white/5">
                 {orders.map((order) => (
                    <div key={order._id} className="p-5 flex flex-col gap-4 active:bg-white/[0.02] transition-colors">
                       <div className="flex justify-between items-center">
                          <span className="font-mono text-xs text-gray-500 font-bold tracking-widest">#{order._id.substring(order._id.length - 6).toUpperCase()}</span>
                          <span className={`px-2 py-0.5 rounded-md text-[10px] font-black uppercase ${
                             order.status === 'confirmed' ? 'bg-green-500/10 text-green-500' : 'bg-amber-500/10 text-amber-500'
                          }`}>
                             {order.status || 'Done'}
                          </span>
                       </div>
                       
                       <div className="flex justify-between items-end">
                          <div>
                             <p className="text-sm font-bold text-white mb-1">{order.items.length} Items Ordered</p>
                             <p className="text-[10px] text-gray-500 uppercase font-medium">{new Date(order.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})} • {order.paymentMethod}</p>
                          </div>
                          <div className="text-right">
                             <p className="text-lg font-black text-primary-500 leading-none mb-1">${(order.totalAmount || 0).toFixed(2)}</p>
                             <button 
                               onClick={() => openReceipt(order)}
                               className="flex items-center gap-1.5 text-[10px] font-bold text-primary-500 uppercase bg-primary-500/10 px-2 py-1 rounded-lg ml-auto"
                             >
                                <Printer size={12} />
                                Receipt
                             </button>
                          </div>
                       </div>
                    </div>
                 ))}
              </div>
            </div>
          </>
        )}

        {activeTab === 'products' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-in fade-in duration-300">
            {/* Product Form - Mobile: Top, Desktop: Left Column */}
            <div className="lg:col-span-1">
              <div className="glass-card p-6 rounded-[2.5rem] border border-white/5 sticky top-8">
                <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                   {editingId ? <Edit2 className="text-primary-500" size={24} /> : <Plus className="text-primary-500" size={24} />}
                   {editingId ? 'Edit Product' : 'Add New Item'}
                </h3>
                <form onSubmit={handleAddProduct} className="space-y-5">
                   <div className="space-y-1.5">
                      <label className="text-[10px] font-black text-gray-500 uppercase ml-1 tracking-widest">Product Name</label>
                      <input 
                        type="text" 
                        placeholder="e.g. Iced Latte"
                        className="w-full bg-dark-900 border border-white/10 rounded-2xl py-4 px-5 text-sm outline-none focus:border-primary-500 transition-all"
                        value={newProduct.name}
                        onChange={e => setNewProduct({...newProduct, name: e.target.value})}
                        required
                      />
                   </div>
                   
                   <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                         <label className="text-[10px] font-black text-gray-500 uppercase ml-1 tracking-widest">Price ($)</label>
                         <input 
                           type="number" 
                           step="0.01"
                           placeholder="0.00"
                           className="w-full bg-dark-900 border border-white/10 rounded-2xl py-4 px-5 text-sm outline-none focus:border-primary-500 transition-all font-mono"
                           value={newProduct.price}
                           onChange={e => setNewProduct({...newProduct, price: e.target.value})}
                           required
                         />
                      </div>
                      <div className="space-y-1.5">
                         <label className="text-[10px] font-black text-gray-500 uppercase ml-1 tracking-widest">Category</label>
                         <select 
                           className="w-full bg-dark-900 border border-white/10 rounded-2xl py-4 px-5 text-sm outline-none focus:border-primary-500 appearance-none transition-all font-bold"
                           value={newProduct.category}
                           onChange={e => setNewProduct({...newProduct, category: e.target.value})}
                         >
                            <option>Coffee</option>
                            <option>Tea</option>
                            <option>Smoothie</option>
                            <option>Food</option>
                         </select>
                      </div>
                   </div>

                   <div className="space-y-1.5">
                      <label className="text-[10px] font-black text-gray-500 uppercase ml-1 tracking-widest">Product Image</label>
                      <div className="flex flex-col gap-4">
                         {newProduct.image ? (
                           <div className="relative w-full aspect-video rounded-3xl overflow-hidden border-2 border-primary-500/30">
                              <img src={newProduct.image} className="w-full h-full object-cover" alt="Preview" />
                              <button 
                                type="button"
                                onClick={() => setNewProduct({...newProduct, image: ''})}
                                className="absolute top-2 right-2 p-2 bg-red-500 rounded-full text-white shadow-xl"
                              >
                                <X size={16} />
                              </button>
                           </div>
                         ) : (
                           <label className="w-full h-32 cursor-pointer bg-dark-800 border-2 border-dashed border-white/10 hover:border-primary-500/50 rounded-3xl flex flex-col items-center justify-center transition-all group active:scale-95">
                              <input type="file" className="hidden" accept="image/*" onChange={handleImageChange} />
                              <ImageIcon size={32} className="text-gray-600 group-hover:text-primary-500 mb-2" />
                              <span className="text-[10px] font-black text-gray-600 uppercase tracking-widest">Upload Photo</span>
                           </label>
                         )}
                      </div>
                   </div>

                   <div className="flex flex-col gap-3 pt-2">
                     <button 
                       type="submit"
                       className="w-full bg-primary-600 hover:bg-primary-500 text-white font-black py-4.5 rounded-2xl transition-all shadow-xl active:scale-95 flex items-center justify-center gap-2 uppercase tracking-widest"
                     >
                        {editingId ? <Save size={20} /> : <Plus size={20} />}
                        {editingId ? 'Update Product' : 'Add to Menu'}
                     </button>
                     {editingId && (
                       <button 
                         type="button"
                         onClick={() => {
                           setEditingId(null);
                           setNewProduct({ name: '', price: '', category: 'Coffee', image: '' });
                         }}
                         className="w-full bg-white/5 hover:bg-white/10 text-gray-400 font-bold py-4 rounded-2xl transition-all flex items-center justify-center gap-2"
                       >
                          <X size={18} />
                          Cancel
                       </button>
                     )}
                   </div>
                </form>
              </div>
            </div>

            {/* Product List - Mobile: Bottom, Desktop: Right 2 Columns */}
            <div className="lg:col-span-2">
              <div className="glass-card rounded-[2.5rem] border border-white/5 overflow-hidden">
                <div className="p-6 border-b border-white/5 bg-white/[0.02] flex justify-between items-center">
                   <h3 className="text-xl font-bold">Active Menu <span className="text-primary-500 ml-1">({products.length})</span></h3>
                </div>
                
                {/* Responsive Grid for Menu Items */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-px bg-white/5">
                   {products.map(product => (
                     <div key={product._id} className="p-4 bg-dark-900 flex items-center justify-between hover:bg-white/[0.02] transition-all group">
                        <div className="flex items-center gap-4">
                           <div className="relative">
                              <img src={product.image} className="w-16 h-16 rounded-2xl object-cover shadow-lg border border-white/10" alt={product.name} />
                              <div className="absolute -top-1 -right-1 bg-dark-800 border border-white/10 text-primary-500 p-1 rounded-lg">
                                 {getCategoryIcon(product.category)}
                              </div>
                           </div>
                           <div>
                              <h4 className="font-bold text-gray-100 group-hover:text-primary-500 transition-colors">{product.name}</h4>
                              <p className="text-[10px] text-gray-500 uppercase font-black tracking-widest">{product.category}</p>
                           </div>
                        </div>
                        <div className="flex flex-col items-end gap-2">
                           <span className="font-mono font-black text-primary-500 text-lg">${product.price.toFixed(2)}</span>
                           <div className="flex gap-2">
                              <button 
                                onClick={() => handleEditClick(product)}
                                className="p-3 bg-white/5 text-gray-400 rounded-xl hover:bg-primary-500 hover:text-white transition-all active:scale-75 sm:opacity-0 group-hover:opacity-100"
                              >
                                 <Edit2 size={16} />
                              </button>
                              <button 
                                onClick={() => handleDeleteProduct(product._id)}
                                className="p-3 bg-white/5 text-gray-400 rounded-xl hover:bg-red-500 hover:text-white transition-all active:scale-75 sm:opacity-0 group-hover:opacity-100"
                              >
                                 <Trash2 size={16} />
                              </button>
                           </div>
                        </div>
                     </div>
                   ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'settings' && (
          <div className="max-w-2xl mx-auto animate-in fade-in duration-300">
             <div className="glass-card p-8 rounded-[3rem] border border-white/5">
                <h3 className="text-2xl font-bold mb-8 flex items-center gap-3">
                   <Store className="text-primary-500" />
                   Shop Configuration
                </h3>
                
                <form onSubmit={handleSaveSettings} className="space-y-6">
                   <div className="space-y-2">
                      <label className="text-xs font-bold text-gray-500 uppercase ml-1 tracking-widest">Shop Name</label>
                      <input 
                        type="text" 
                        value={shopSettings.name}
                        onChange={e => setShopSettings({...shopSettings, name: e.target.value})}
                        className="w-full bg-dark-900 border border-white/10 rounded-2xl py-4 px-6 focus:border-primary-500 outline-none"
                      />
                   </div>

                   <div className="space-y-2">
                      <label className="text-xs font-bold text-gray-500 uppercase ml-1 tracking-widest">Subtitle / Tagline</label>
                      <input 
                        type="text" 
                        value={shopSettings.subtitle}
                        onChange={e => setShopSettings({...shopSettings, subtitle: e.target.value})}
                        className="w-full bg-dark-900 border border-white/10 rounded-2xl py-4 px-6 focus:border-primary-500 outline-none"
                      />
                   </div>

                   <div className="space-y-2">
                      <label className="text-xs font-bold text-gray-500 uppercase ml-1 tracking-widest">Location Address</label>
                      <div className="relative">
                         <MapPin className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                         <input 
                           type="text" 
                           value={shopSettings.address}
                           onChange={e => setShopSettings({...shopSettings, address: e.target.value})}
                           className="w-full bg-dark-900 border border-white/10 rounded-2xl py-4 pl-14 pr-6 focus:border-primary-500 outline-none"
                         />
                      </div>
                   </div>

                   <div className="space-y-2">
                      <label className="text-xs font-bold text-gray-500 uppercase ml-1 tracking-widest">Phone Number</label>
                      <div className="relative">
                         <Phone className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                         <input 
                           type="text" 
                           value={shopSettings.phone}
                           onChange={e => setShopSettings({...shopSettings, phone: e.target.value})}
                           className="w-full bg-dark-900 border border-white/10 rounded-2xl py-4 pl-14 pr-6 focus:border-primary-500 outline-none"
                         />
                      </div>
                   </div>

                   <button 
                     type="submit"
                     className="w-full bg-primary-600 hover:bg-primary-500 text-white font-bold py-5 rounded-[2rem] mt-4 shadow-xl flex items-center justify-center gap-3 active:scale-95 transition-all"
                   >
                      <Save size={20} />
                      Save All Settings
                   </button>
                </form>
             </div>
          </div>
        )}
      </div>

      <ReceiptModal 
        isOpen={isReceiptOpen} 
        order={selectedOrder} 
        onClose={() => setIsReceiptOpen(false)} 
      />
    </div>
  );
};

export default Admin;
