import React from 'react';
import { X, Trash2, Plus, Minus, ArrowRight, ShieldCheck, Dumbbell, Receipt } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { formatCurrency } from '../utils/numberToWords';

export default function CartDrawer({ isOpen, onClose }) {
  const {
    cartItemsList,
    cartCount,
    cartItemsSubtotal,
    netTaxableSum,
    totalVat,
    grandTotal,
    addToCart,
    removeFromCart,
    clearCart,
    customerName,
    setCustomerName,
    contactNumber,
    setContactNumber,
    customerDetails,
    setCustomerDetails,
    setCurrentPage,
    recordCurrentQuote,
  } = useApp();

  if (!isOpen) return null;

  const handleProceedToInvoice = () => {
    recordCurrentQuote();
    setCurrentPage('invoiceBill');
    onClose();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="absolute inset-0 bg-black/75 backdrop-blur-sm transition-opacity"
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-0 sm:pl-10">
        <div className="w-screen max-w-md bg-[#0F131D] border-l border-[#1E2839] flex flex-col justify-between shadow-2xl">
          {/* Header */}
          <div className="px-5 py-4 border-b border-[#1E2839] flex items-center justify-between bg-[#0A0D14]">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-[#FED430] flex items-center justify-center text-black font-black">
                <Dumbbell className="w-4 h-4" />
              </div>
              <div>
                <h2 className="font-oswald text-base font-black text-white tracking-wider">
                  COMMERCIAL QUOTE CART
                </h2>
                <p className="text-slate-400 text-xs">
                  {cartCount} {cartCount === 1 ? 'station' : 'stations'} selected
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Cart Items List */}
          <div className="flex-1 overflow-y-auto p-5 space-y-4">
            {cartItemsList.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-3">
                <div className="w-16 h-16 rounded-full bg-[#141A26] border border-[#26334D] flex items-center justify-center text-slate-500">
                  <Receipt className="w-8 h-8 stroke-1" />
                </div>
                <h3 className="font-oswald text-lg font-bold text-white">
                  Your Quote Cart is Empty
                </h3>
                <p className="text-slate-400 text-xs max-w-xs">
                  Browse our certified Life Fitness & Hammer Strength catalog to select equipment stations for your commercial quote.
                </p>
                <button
                  onClick={onClose}
                  className="px-4 py-2 rounded-lg bg-[#FED430] text-black font-bold text-xs uppercase"
                >
                  Browse Catalog
                </button>
              </div>
            ) : (
              <>
                <div className="space-y-3">
                  {cartItemsList.map(({ product, quantity }) => (
                    <div
                      key={product.code}
                      className="p-3 rounded-xl bg-[#0F1420] border border-[#1E2839] flex items-center gap-3"
                    >
                      <div className="w-16 h-16 bg-white rounded-lg p-1 flex-shrink-0 flex items-center justify-center border border-slate-700">
                        <img
                          src={product.imagePath}
                          alt={product.name}
                          className="max-h-full max-w-full object-contain"
                          onError={(e) => {
                            e.target.style.display = 'none';
                          }}
                        />
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-1">
                          <span className="text-[10px] font-mono font-bold text-[#FED430]">
                            #{product.code}
                          </span>
                          <span className="text-xs font-bold text-slate-300">
                            AED {formatCurrency(product.price * quantity)}
                          </span>
                        </div>

                        <h4 className="text-xs font-bold text-white truncate">
                          {product.name}
                        </h4>

                        <div className="flex items-center justify-between mt-2">
                          <span className="text-[10px] text-slate-400">
                            AED {formatCurrency(product.price)} / unit
                          </span>

                          <div className="flex items-center gap-2 bg-[#141A26] border border-[#26334D] rounded-lg px-2 py-0.5">
                            <button
                              onClick={() => removeFromCart(product.code)}
                              className="text-slate-400 hover:text-white"
                            >
                              <Minus className="w-3 h-3" />
                            </button>
                            <span className="text-xs font-bold text-white px-1">
                              {quantity}
                            </span>
                            <button
                              onClick={() => addToCart(product)}
                              className="text-[#FED430] hover:text-[#e5be2b]"
                            >
                              <Plus className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Quick Client Details */}
                <div className="mt-6 p-4 rounded-xl bg-[#141A26]/80 border border-[#26334D] space-y-3">
                  <span className="text-[11px] font-bold text-[#FED430] uppercase tracking-wider block">
                    Client Details for Quote Header
                  </span>

                  <div>
                    <label className="text-[10px] font-bold text-slate-400 block mb-1">
                      Customer / Gym Name
                    </label>
                    <input
                      type="text"
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      placeholder="e.g. Metroflex Fitness UAE"
                      className="w-full bg-[#0F1420] border border-[#26334D] rounded-lg px-3 py-1.5 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-[#FED430]"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] font-bold text-slate-400 block mb-1">
                      Contact / WhatsApp Phone
                    </label>
                    <input
                      type="text"
                      value={contactNumber}
                      onChange={(e) => setContactNumber(e.target.value)}
                      placeholder="e.g. +971 50 123 4567"
                      className="w-full bg-[#0F1420] border border-[#26334D] rounded-lg px-3 py-1.5 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-[#FED430]"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] font-bold text-slate-400 block mb-1">
                      Delivery Location / City
                    </label>
                    <input
                      type="text"
                      value={customerDetails}
                      onChange={(e) => setCustomerDetails(e.target.value)}
                      placeholder="e.g. Al Quoz 3, Dubai, UAE"
                      className="w-full bg-[#0F1420] border border-[#26334D] rounded-lg px-3 py-1.5 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-[#FED430]"
                    />
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Footer Totals & Checkout */}
          {cartItemsList.length > 0 && (
            <div className="p-5 border-t border-[#1E2839] bg-[#0A0D14] space-y-3">
              <div className="space-y-1.5 text-xs">
                <div className="flex justify-between text-slate-400">
                  <span>Taxable Subtotal:</span>
                  <span className="font-mono text-white">AED {formatCurrency(cartItemsSubtotal)}</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>UAE VAT (5%):</span>
                  <span className="font-mono text-white">AED {formatCurrency(totalVat)}</span>
                </div>
                <div className="flex justify-between text-sm font-black text-white pt-2 border-t border-[#1E2839]">
                  <span className="font-oswald tracking-wide">GRAND TOTAL (AED):</span>
                  <span className="text-[#FED430] font-mono text-base">
                    AED {formatCurrency(grandTotal)}
                  </span>
                </div>
              </div>

              <div className="pt-2 flex gap-2">
                <button
                  onClick={clearCart}
                  className="p-2.5 rounded-lg bg-[#141A26] border border-[#26334D] text-slate-400 hover:text-red-400 hover:border-red-500/40"
                  title="Clear Cart"
                >
                  <Trash2 className="w-4 h-4" />
                </button>

                <button
                  onClick={handleProceedToInvoice}
                  className="flex-1 py-3 px-4 rounded-lg bg-[#FED430] text-black font-black text-xs uppercase tracking-wider hover:bg-[#e5be2b] flex items-center justify-center gap-2 shadow-lg shadow-[#FED430]/20 active:scale-98 transition-all"
                >
                  <span>Proceed to Commercial Invoice Bill</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

