import React, { useState, useEffect } from 'react';
import { X, Banknote, QrCode, ShoppingBag, Utensils, CheckCircle, Truck } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { useCart } from '../context/CartContext';
import axios from 'axios';
import toast from 'react-hot-toast';
import API_BASE_URL from '../apiConfig';

const PaymentModal = ({ isOpen, onClose, onPaymentSuccess, isGuest = false }) => {
  const { total, itemsTotal, discountAmount, discountPercent, serviceFee, tax, cartItems } = useCart();
  const [method, setMethod] = useState('Cash');
  const [orderType, setOrderType] = useState('Take Away');
  const [tableNumber, setTableNumber] = useState('');
  const [cashInput, setCashInput] = useState('');
  const [change, setChange] = useState(0);

  const finalTotal = total;

  useEffect(() => {
    if (isOpen && method === 'Cash' && !cashInput) {
      setCashInput(finalTotal.toFixed(2));
    }
  }, [isOpen, method, finalTotal, cashInput]);

  useEffect(() => {
    if (method === 'Cash' && cashInput) {
      const val = parseFloat(cashInput) - finalTotal;
      setChange(val > 0 ? val : 0);
    } else {
      setChange(0);
    }
  }, [cashInput, finalTotal, method]);

  const handlePayment = async () => {
    if (method === 'Cash' && !isGuest) {
      const cashValue = parseFloat(cashInput);
      if (!cashInput || isNaN(cashValue) || cashValue < finalTotal) {
        toast.error('Please enter valid cash (min $' + finalTotal.toFixed(2) + ')');
        return;
      }
    }

    const orderData = {
      _id: Date.now().toString(),
      items: cartItems.map(item => ({
        productId: item._id,
        name: item.name,
        price: item.price,
        quantity: item.quantity
      })),
      itemsTotal,
      discount: discountAmount,
      discountPercent,
      serviceFee,
      tax, 
      totalAmount: finalTotal,
      paymentMethod: method,
      cashReceived: method === 'Cash' ? parseFloat(cashInput) : null,
      changeAmount: method === 'Cash' ? change : null,
      status: isGuest ? 'pending' : 'confirmed',
      orderType,
      tableNumber: orderType === 'Eat In' ? tableNumber : null,
      createdAt: new Date().toISOString()
    };

    try {
      const res = await axios.post(`${API_BASE_URL}/api/orders`, orderData);
      toast.success(isGuest ? 'Order confirmed! 5-8 minutes wait.' : 'Payment successful!');
      onPaymentSuccess(res.data);
    } catch (err) {
      // Fallback: Save to Mobile Memory if Server is Offline
      const localOrders = JSON.parse(localStorage.getItem('local_orders') || '[]');
      localStorage.setItem('local_orders', JSON.stringify([orderData, ...localOrders]));
      
      toast.success('Order Saved to Mobile Memory!', {
        icon: '📱',
        duration: 4000
      });
      
      onPaymentSuccess(orderData);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[300] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="glass-card w-full max-w-lg p-6 rounded-[2.5rem] relative overflow-hidden flex flex-col max-h-[90vh] border border-white/10 shadow-2xl">
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-500 hover:text-white transition-colors z-10"><X size={24} /></button>
        <div className="overflow-y-auto pr-2 custom-scrollbar">
          <h2 className="text-2xl font-black mb-6 tracking-tighter uppercase italic text-white/90">Order Checkout</h2>
          <div className="space-y-6 mb-8">
             <div>
                <label className="block text-gray-400 text-[10px] font-black uppercase tracking-[0.2em] mb-3 ml-1">1. Service Type</label>
                <div className="grid grid-cols-3 gap-2">
                   {[{ id: 'Eat In', icon: <Utensils size={18} /> }, { id: 'Take Away', icon: <ShoppingBag size={18} /> }, { id: 'Delivery', icon: <Truck size={18} /> }].map(item => (
                     <button key={item.id} onClick={() => setOrderType(item.id)} className={`py-4 px-2 rounded-2xl border font-bold transition-all flex flex-col items-center justify-center gap-2 ${orderType === item.id ? 'bg-primary-600 border-primary-400 text-white shadow-lg' : 'bg-dark-900 border-white/5 text-gray-500 hover:border-white/10'}`}>{item.icon}<span className="text-[9px] uppercase tracking-tighter">{item.id}</span></button>
                   ))}
                </div>
             </div>
             {orderType === 'Eat In' && (
                <div className="animate-in slide-in-from-top-2 duration-300">
                   <label className="block text-gray-400 text-[10px] font-black uppercase tracking-[0.2em] mb-3 ml-1">2. Select Table</label>
                   <div className="grid grid-cols-5 gap-2">
                      {[1,2,3,4,5,6,7,8,9,10].map(num => (
                        <button key={num} onClick={() => setTableNumber(num.toString())} className={`py-3 rounded-xl border font-bold transition-all ${tableNumber === num.toString() ? 'bg-primary-500 border-primary-500 text-white shadow-lg' : 'bg-dark-900 border-white/5 text-gray-400'}`}>{num}</button>
                      ))}
                   </div>
                </div>
             )}
          </div>
          <div className="border-t border-white/5 pt-6">
             <label className="block text-gray-400 text-[10px] font-black uppercase tracking-[0.2em] mb-3 ml-1">3. Select Payment</label>
             <div className="flex gap-2 mb-6 bg-dark-900/50 p-1 rounded-2xl">
               {['Cash', 'QR'].map((m) => (
                 <button key={m} onClick={() => setMethod(m)} className={`flex-1 flex items-center justify-center gap-2 py-3.5 rounded-xl transition-all font-bold ${method === m ? 'bg-primary-600 text-white shadow-lg' : 'text-gray-500 hover:text-gray-300'}`}>{m === 'Cash' ? <Banknote size={18} /> : <QrCode size={18} />}{m}</button>
               ))}
             </div>
          </div>
          <div className="bg-white/5 rounded-2xl p-5 border border-white/5 space-y-2 mb-6">
             <div className="flex justify-between pt-3 border-t border-white/10"><span className="text-primary-500 font-black uppercase tracking-tighter text-sm italic text-white/50">Grand Total</span><span className="text-3xl font-black text-primary-500 font-mono">${finalTotal.toFixed(2)}</span></div>
          </div>
          <div className="min-h-[140px]">
            {method === 'Cash' && (
              <div className="space-y-6 animate-in fade-in zoom-in duration-300">
                {isGuest ? (
                  <div className="bg-primary-600/10 border border-primary-500/20 rounded-3xl p-6 text-center">
                    <h3 className="text-lg font-black text-white uppercase mb-1">{orderType === 'Delivery' ? 'Pay with Delivery' : 'Pay on Pickup'}</h3>
                    <p className="text-gray-400 text-[11px] font-medium leading-relaxed uppercase tracking-tighter">Please pay <span className="text-primary-500 font-black">${finalTotal.toFixed(2)}</span> in cash upon arrival.</p>
                  </div>
                ) : (
                  <>
                    <input type="number" value={cashInput} onChange={(e) => setCashInput(e.target.value)} placeholder="0.00" className="w-full bg-dark-900 border border-white/10 rounded-2xl px-5 py-5 text-4xl font-black text-white focus:border-primary-500 outline-none" autoFocus />
                    <div className="flex justify-between items-center p-5 bg-green-500/10 rounded-2xl border border-green-500/20"><span className="text-green-500 font-bold uppercase tracking-widest text-[10px]">Return Change</span><span className="text-4xl font-black text-green-500 font-mono">${change.toFixed(2)}</span></div>
                  </>
                )}
              </div>
            )}
            {method === 'QR' && (
              <div className="flex flex-col items-center justify-center space-y-4 py-4 animate-in zoom-in duration-500">
                <div className="p-5 bg-white rounded-3xl border-4 border-primary-500/20"><QRCodeSVG value={`KHQR-${finalTotal.toFixed(2)}`} size={180} /></div>
                <p className="text-gray-400 text-xs font-black uppercase tracking-[0.2em]">Scan to pay ${finalTotal.toFixed(2)}</p>
              </div>
            )}
          </div>
        </div>
        <div className={`mt-6 pt-4 flex ${isGuest ? 'justify-end' : ''}`}>
           <button onClick={handlePayment} className={`${isGuest ? 'w-auto px-12 py-4' : 'w-full py-5'} bg-primary-600 hover:bg-primary-500 text-white font-black rounded-full transition-all shadow-[0_0_30px_rgba(234,179,8,0.3)] active:scale-90 text-sm uppercase tracking-widest flex items-center justify-center gap-3 relative overflow-hidden group`}><div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:animate-[scan_2s_linear_infinite]"></div><CheckCircle size={20} strokeWidth={3} /><span>{isGuest ? 'Confirm' : 'Confirm Order'}</span></button>
        </div>
      </div>
    </div>
  );
};

export default PaymentModal;
