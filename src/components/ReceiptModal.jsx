import React from 'react';
import { X, Printer, CheckCircle } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';

const ReceiptModal = ({ isOpen, order, onClose }) => {
  // Lock background scroll when open
  React.useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen || !order) return null;

  const handlePrint = () => {
    window.print();
  };

  const orderIdShort = order._id.substring(order._id.length - 8).toUpperCase();
  const date = new Date(order.createdAt).toLocaleDateString();
  const time = new Date(order.createdAt).toLocaleTimeString();

  // Handle fallback for older orders or newly created ones
  const itemsTotal = order.itemsTotal || (order.totalAmount / 1.1);
  const discount = order.discount || 0;
  const discountPercent = order.discountPercent || 0;
  const tax = order.tax || (order.totalAmount - (order.totalAmount / 1.1));
  const serviceFee = order.serviceFee || 0;

  // Construct detailed QR string
  const qrValue = `
MEY ASTRA CAFE
(ASTRA BREW)
Takhmao, Kandal, Cambodia
Tel: (855) 87 574 018
-----------------------
TAX INVOICE
ORDER ID: ${orderIdShort}
DATE: ${date}
TIME: ${time}
-----------------------
${order.items.map(item => `${item.name} $${(item.price * item.quantity).toFixed(2)}\n${item.quantity} x $${item.price.toFixed(2)}`).join('\n')}
-----------------------
ITEMS TOTAL $${itemsTotal.toFixed(2)}
${discount > 0 ? `DISCOUNT (${discountPercent}%) -$${discount.toFixed(2)}\n` : ''}TAX (10%) $${tax.toFixed(2)}
${serviceFee > 0 ? `SERVICE FEE $${serviceFee.toFixed(2)}\n` : ''}-----------------------
TOTAL $${order.totalAmount.toFixed(2)}
PAYMENT: ${order.paymentMethod.toUpperCase()}
${order.paymentMethod === 'Cash' ? `CASH TENDERED: $${order.cashReceived.toFixed(2)}\nCHANGE: $${order.changeAmount.toFixed(2)}` : ''}
  `.trim();

  return (
    <>
      {/* SCREEN VERSION - Hidden when printing */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm no-print">
        <div className="glass-card w-full max-w-md p-5 rounded-3xl relative max-h-[90vh] overflow-y-auto custom-scrollbar">
          <button onClick={onClose} className="absolute top-4 right-4 text-gray-500 hover:text-white transition-colors">
            <X size={20} />
          </button>

          <div className="text-center mb-4">
            <div className="inline-flex items-center justify-center w-12 h-12 bg-green-500/20 text-green-500 rounded-full mb-2">
              <CheckCircle size={24} />
            </div>
            <h2 className="text-xl font-bold">Order Successful</h2>
            <p className="text-xs text-gray-400">Thank you for your purchase!</p>
          </div>

          <div className="thermal-receipt p-6 rounded-sm font-mono text-[11px] space-y-3 shadow-2xl overflow-hidden relative mx-auto max-w-[280px]">
            {/* Branded Watermark */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-[0.03] rotate-[-35deg] overflow-hidden select-none">
              <div className="flex flex-col items-center">
                <span className="text-3xl font-bold whitespace-nowrap">MEY ASTRA CAFE</span>
                <span className="text-3xl font-bold whitespace-nowrap">MEY ASTRA CAFE</span>
                <span className="text-3xl font-bold whitespace-nowrap">MEY ASTRA CAFE</span>
                <span className="text-3xl font-bold whitespace-nowrap">MEY ASTRA CAFE</span>
                <span className="text-3xl font-bold whitespace-nowrap">MEY ASTRA CAFE</span>
              </div>
            </div>

            <div className="text-center border-b border-dashed border-gray-300 pb-2 relative z-10">
              <h3 className="font-bold text-base uppercase tracking-widest leading-tight">Mey Astra Cafe</h3>
              <p className="text-[9px] italic mb-1">(ASTRA BREW)</p>
              <p className="text-[9px] leading-tight">📍 Takhmao, Kandal, Cambodia</p>
              <p className="text-[9px] leading-tight mb-2">Tel: (855) 87 574 018</p>
              <div className="mt-1 text-[10px] bg-black text-white px-3 py-0.5 inline-block rounded-sm font-bold uppercase tracking-widest">TAX INVOICE</div>
            </div>

            <div className="flex flex-col gap-0.5 text-[9px] border-b border-dashed border-gray-300 pb-2">
              <div className="flex justify-between uppercase">
                <span>Order ID:</span>
                <span className="font-bold">{orderIdShort}</span>
              </div>
              <div className="flex justify-between uppercase">
                <span>Type:</span>
                <span className="font-bold">{order.orderType || 'Take Away'}</span>
              </div>
              {order.tableNumber && (
                <div className="flex justify-between uppercase text-primary-600 font-black">
                  <span>Table:</span>
                  <span>#{order.tableNumber}</span>
                </div>
              )}
              <div className="flex justify-between uppercase">
                <span>Date/Time:</span>
                <span>{date} {new Date(order.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
              </div>
            </div>

            <div className="space-y-1.5 border-b border-dashed border-gray-300 pb-2">
              {order.items.map((item, index) => (
                <div key={index} className="flex flex-col text-[10px]">
                  <div className="flex justify-between font-bold">
                    <span>{item.name}</span>
                    <span>${(item.price * item.quantity).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-[9px] text-gray-600">
                    <span>{item.quantity} x ${item.price.toFixed(2)}</span>
                  </div>
                </div>
              ))}
            </div>

            <div className="space-y-0.5">
              <div className="flex justify-between text-[10px]">
                <span>Items Total</span>
                <span>${itemsTotal.toFixed(2)}</span>
              </div>
              {discount > 0 && (
                <div className="flex justify-between text-[10px] text-red-600">
                  <span>Discount ({discountPercent}%)</span>
                  <span>-${discount.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between text-[10px]">
                <span>Tax (10%)</span>
                <span>${tax.toFixed(2)}</span>
              </div>
              {serviceFee > 0 && (
                <div className="flex justify-between text-[10px]">
                  <span>Service Fee</span>
                  <span>${serviceFee.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between font-bold text-base pt-1 border-t border-gray-900 mt-1">
                <span>TOTAL</span>
                <span>${order.totalAmount.toFixed(2)}</span>
              </div>

              <div className="pt-2 space-y-0.5 text-[9px] uppercase">
                <div className="flex justify-between">
                  <span>Method:</span>
                  <span>{order.paymentMethod}</span>
                </div>
                {order.paymentMethod === 'Cash' && (
                  <>
                    <div className="flex justify-between">
                      <span>Received:</span>
                      <span>${order.cashReceived.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between font-bold border-t border-gray-200 mt-0.5 pt-0.5">
                      <span>Change:</span>
                      <span>${order.changeAmount.toFixed(2)}</span>
                    </div>
                  </>
                )}
              </div>
            </div>

            <div className="text-center pt-4 border-t border-dashed border-gray-300 flex flex-col items-center">
              <p className="text-[10px] uppercase font-bold tracking-[0.2em] mb-2">T H A N K  Y O U !</p>
              
              <div className="bg-white p-2 rounded mb-2">
                <QRCodeSVG value={qrValue} size={64} level="M" />
              </div>
              
              <div className="barcode text-4xl leading-none h-8 overflow-hidden select-none mb-1">
                 *{orderIdShort}*
              </div>
              <p className="text-[8px] font-bold mb-1 tracking-tighter">ORDER NO: {orderIdShort}</p>
              <p className="text-[8px] text-gray-500 italic">Please keep this receipt for your records.</p>
            </div>
          </div>

          <button
            onClick={handlePrint}
            className="w-full bg-white text-dark-900 font-bold py-3 rounded-2xl mt-5 flex items-center justify-center gap-2 hover:bg-gray-100 transition-all active:scale-95"
          >
            <Printer size={18} />
            Print Receipt
          </button>
        </div>
      </div>

      {/* PRINT VERSION - Hidden on screen, visible in PDF/Print */}
      <div className="print-only">
        <div className="thermal-receipt p-8 font-mono text-sm space-y-4 mx-auto">
          <div className="text-center border-b border-dashed border-gray-300 pb-4">
            <h3 className="font-bold text-xl uppercase tracking-widest leading-tight">Mey Astra Cafe</h3>
            <p className="text-[11px] italic mb-1">(ASTRA BREW)</p>
            <p className="text-[11px] leading-tight">📍 Takhmao, Kandal, Cambodia</p>
            <p className="text-[11px] leading-tight mb-3">Tel: (855) 87 574 018</p>
            <div className="mt-2 text-xs bg-black text-white px-4 py-1 inline-block rounded-sm font-bold uppercase tracking-widest">TAX INVOICE</div>
          </div>

          <div className="flex flex-col gap-1 text-[11px] border-b border-dashed border-gray-300 pb-4">
            <div className="flex justify-between uppercase">
              <span>Order ID:</span>
              <span className="font-bold">{orderIdShort}</span>
            </div>
            <div className="flex justify-between uppercase">
              <span>Date:</span>
              <span>{date}</span>
            </div>
            <div className="flex justify-between uppercase">
              <span>Time:</span>
              <span>{time}</span>
            </div>
          </div>

          <div className="space-y-2 border-b border-dashed border-gray-300 pb-4">
            {order.items.map((item, index) => (
              <div key={index} className="flex flex-col text-xs">
                <div className="flex justify-between font-bold">
                  <span>{item.name}</span>
                  <span>${(item.price * item.quantity).toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-[11px] text-gray-600">
                  <span>{item.quantity} x ${item.price.toFixed(2)}</span>
                </div>
              </div>
            ))}
          </div>

          <div className="space-y-1">
            <div className="flex justify-between text-xs">
              <span>Items Total</span>
              <span>${itemsTotal.toFixed(2)}</span>
            </div>
            {discount > 0 && (
              <div className="flex justify-between text-xs text-red-600">
                <span>Discount ({discountPercent}%)</span>
                <span>-${discount.toFixed(2)}</span>
              </div>
            )}
            <div className="flex justify-between text-xs">
              <span>Tax (10%)</span>
              <span>${tax.toFixed(2)}</span>
            </div>
            {serviceFee > 0 && (
              <div className="flex justify-between text-xs">
                <span>Service Fee</span>
                <span>${serviceFee.toFixed(2)}</span>
              </div>
            )}
            <div className="flex justify-between font-bold text-lg pt-2 border-t border-gray-900 mt-2">
              <span>TOTAL</span>
              <span>${order.totalAmount.toFixed(2)}</span>
            </div>
            
            <div className="pt-4 space-y-1 text-[11px] uppercase">
              <div className="flex justify-between">
                <span>Payment:</span>
                <span>{order.paymentMethod}</span>
              </div>
              {order.paymentMethod === 'Cash' && (
                <>
                  <div className="flex justify-between">
                    <span>Cash Tendered:</span>
                    <span>${order.cashReceived.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between font-bold">
                    <span>Change:</span>
                    <span>${order.changeAmount.toFixed(2)}</span>
                  </div>
                </>
              )}
            </div>
          </div>

          <div className="text-center pt-6 border-t border-dashed border-gray-300 flex flex-col items-center">
            <p className="text-base uppercase font-bold tracking-[0.2em] mb-2">T H A N K  Y O U !</p>
            
            <div className="bg-white p-2 rounded mb-4">
              <QRCodeSVG value={qrValue} size={120} level="M" />
            </div>

            <div className="barcode text-6xl leading-none select-none mb-2">
               *{orderIdShort}*
            </div>
            <p className="text-xs font-bold mb-1">ORDER NO: {orderIdShort}</p>
            <p className="text-[10px] text-gray-500 italic">Please keep this receipt for your records.</p>
          </div>
        </div>
      </div>
    </>
  );
};

export default ReceiptModal;
