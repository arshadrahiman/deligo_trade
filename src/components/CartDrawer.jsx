import React from 'react';
import { X, Trash2, Plus, Minus, ArrowRight, ShieldCheck, Dumbbell, Receipt, Building2, Phone, MapPin, Layers } from 'lucide-react';
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
        className="absolute inset-0 bg-black/80 backdrop-blur-sm transition-opacity"
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-0 sm:pl-10">
        <div className="w-screen max-w-md bg-[#0A0E17] border-l border-white/10 flex flex-col justify-between shadow-2xl">
          {/* Header */}
          <div className="px-5 py-4 border-b border-white/10 flex items-center justify-between bg-[#080B12]">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
                <Receipt className="w-4 h-4" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-xs font-mono font-bold tracking-widest text-white uppercase">
                    POS ORDER REGISTER
                  </h2>
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                </div>
                <p className="text-[11px] font-mono text-slate-400">
                  {cartCount} {cartCount === 1 ? 'UNIT ALLOCATED' : 'UNITS ALLOCATED'}
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 border border-transparent hover:border-white/10 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Cart Items List */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
            {cartItemsList.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-3">
                <div className="w-16 h-16 rounded-2xl bg-surface border border-white/10 flex items-center justify-center text-slate-500">
                  <Layers className="w-7 h-7 stroke-1" />
                </div>
                <h3 className="text-sm font-semibold text-white">
                  Terminal Register is Empty
                </h3>
                <p className="text-slate-400 text-xs max-w-xs leading-relaxed">
                  Select commercial gym equipment from the machinery terminal to allocate stock into this quotation ledger.
                </p>
                <button
                  onClick={onClose}
                  className="px-4 py-2 rounded-lg bg-surface border border-white/10 hover:border-amber-500/40 text-amber-400 font-mono text-xs uppercase transition-colors"
                >
                  Browse Terminal Stock
                </button>
              </div>
            ) : (
              <>
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between text-[10px] font-mono uppercase tracking-wider text-slate-400 pb-1">
                    <span>Item Details & Quantity</span>
                    <span>Line Total (AED)</span>
                  </div>

                  {cartItemsList.map(({ product, quantity }) => (
                    <div
                      key={product.code}
                      className="p-3 rounded-xl bg-surface/80 border border-white/5 hover:border-white/10 transition-colors flex items-center gap-3"
                    >
                      <div className="w-14 h-14 bg-white/95 rounded-lg p-1 flex-shrink-0 flex items-center justify-center border border-slate-700/60 shadow-sm">
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
                          <span className="text-[10px] font-mono font-bold text-amber-400/90">
                            #{product.code}
                          </span>
                          <span className="text-xs font-mono font-bold text-white">
                            AED {formatCurrency(product.price * quantity)}
                          </span>
                        </div>

                        <h4 className="text-xs font-medium text-slate-200 truncate mt-0.5">
                          {product.name}
                        </h4>

                        <div className="flex items-center justify-between mt-2 pt-1 border-t border-white/5">
                          <span className="text-[10px] font-mono text-slate-400">
                            AED {formatCurrency(product.price)} / ea
                          </span>

                          <div className="flex items-center gap-1.5 bg-[#070A12] border border-white/10 rounded-md px-1.5 py-0.5">
                            <button
                              onClick={() => removeFromCart(product.code)}
                              className="text-slate-400 hover:text-white p-0.5"
                              title="Decrease Quantity"
                            >
                              <Minus className="w-3 h-3" />
                            </button>
                            <span className="text-xs font-mono font-bold text-white px-1.5 min-w-[20px] text-center">
                              {quantity}
                            </span>
                            <button
                              onClick={() => addToCart(product)}
                              className="text-amber-400 hover:text-amber-300 p-0.5"
                              title="Increase Quantity"
                            >
                              <Plus className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Quick Client CRM Details */}
                <div className="mt-5 p-3.5 rounded-xl bg-surface/60 border border-white/10 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono font-bold text-amber-400 uppercase tracking-widest flex items-center gap-1.5">
                      <Building2 className="w-3 h-3" />
                      Client CRM & Dispatch Profile
                    </span>
                    <span className="text-[9px] font-mono text-slate-500 uppercase">Optional for bill</span>
                  </div>

                  <div>
                    <label className="text-[10px] font-medium text-slate-400 block mb-1">
                      Customer / Gym Organization
                    </label>
                    <input
                      type="text"
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      placeholder="e.g. Metroflex Fitness UAE"
                      className="w-full bg-[#070A12] border border-white/10 rounded-lg px-2.5 py-1.5 text-xs text-white placeholder:text-slate-600 focus:outline-none focus:border-amber-500/60 font-sans"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-[10px] font-medium text-slate-400 block mb-1 flex items-center gap-1">
                        <Phone className="w-2.5 h-2.5" />
                        Contact Phone
                      </label>
                      <input
                        type="text"
                        value={contactNumber}
                        onChange={(e) => setContactNumber(e.target.value)}
                        placeholder="+971 50 000 0000"
                        className="w-full bg-[#070A12] border border-white/10 rounded-lg px-2.5 py-1.5 text-xs text-white placeholder:text-slate-600 focus:outline-none focus:border-amber-500/60 font-mono"
                      />
                    </div>

                    <div>
                      <label className="text-[10px] font-medium text-slate-400 block mb-1 flex items-center gap-1">
                        <MapPin className="w-2.5 h-2.5" />
                        Delivery Location
                      </label>
                      <input
                        type="text"
                        value={customerDetails}
                        onChange={(e) => setCustomerDetails(e.target.value)}
                        placeholder="Dubai / Abu Dhabi"
                        className="w-full bg-[#070A12] border border-white/10 rounded-lg px-2.5 py-1.5 text-xs text-white placeholder:text-slate-600 focus:outline-none focus:border-amber-500/60 font-sans"
                      />
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Footer Totals & Checkout */}
          {cartItemsList.length > 0 && (
            <div className="p-4 sm:p-5 border-t border-white/10 bg-[#080B12] space-y-3">
              <div className="space-y-1.5 text-xs font-mono">
                <div className="flex justify-between text-slate-400">
                  <span>Subtotal:</span>
                  <span className="text-slate-200">AED {formatCurrency(cartItemsSubtotal)}</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span className="flex items-center gap-1">
                    <span>VAT (5%):</span>
                  </span>
                  <span className="text-emerald-400">AED {formatCurrency(totalVat)}</span>
                </div>
                <div className="flex justify-between items-baseline text-sm font-bold text-white pt-2 border-t border-white/10">
                  <span className="tracking-wide text-xs uppercase text-slate-300">Grand Total (AED):</span>
                  <span className="text-amber-400 font-mono text-base font-black">
                    AED {formatCurrency(grandTotal)}
                  </span>
                </div>
              </div>

              <div className="pt-2 flex gap-2">
                <button
                  onClick={clearCart}
                  className="p-2.5 rounded-lg bg-surface border border-white/10 text-slate-400 hover:text-red-400 hover:border-red-500/40 transition-colors"
                  title="Clear Register Ledger"
                >
                  <Trash2 className="w-4 h-4" />
                </button>

                <button
                  onClick={handleProceedToInvoice}
                  className="flex-1 py-3 px-4 rounded-lg bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 font-bold text-xs uppercase tracking-wider hover:brightness-110 flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20 active:scale-98 transition-all"
                >
                  <span>Generate Quotation & Tax Invoice</span>
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
