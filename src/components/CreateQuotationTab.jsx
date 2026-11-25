import React, { useState, useMemo } from 'react';
import {
  FileText,
  Plus,
  Minus,
  Trash2,
  Search,
  CheckCircle,
  RefreshCw,
  Printer,
  Download,
  AlertCircle,
  Send,
  Building,
  Phone,
  MapPin,
  Layers,
  Sparkles,
  RotateCcw,
  Tag,
  ShieldCheck,
  Check,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { formatCurrency, numberToWords } from '../utils/numberToWords';
import { generateInvoicePdf } from '../utils/pdfGenerator';

export default function CreateQuotationTab({ onQuotationCreated }) {
  const {
    products,
    cart,
    cartItemsList,
    addToCart,
    removeFromCart,
    clearCart,
    customerName,
    setCustomerName,
    contactNumber,
    setContactNumber,
    customerDetails,
    setCustomerDetails,
    quotationNumber,
    setQuotationNumber,
    generateNewQuotationNumber,
    quoteDate,
    setQuoteDate,
    additionalCharges,
    addAdditionalCharge,
    removeAdditionalCharge,
    recordCurrentQuote,
    companySettings,
    currentRole,
    currentAdminUser,
    ROLE_DEFINITIONS,
    ROLES,
  } = useApp();

  // Search & Category filter for equipment catalog
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [customChargeDesc, setCustomChargeDesc] = useState('');
  const [customChargeAmount, setCustomChargeAmount] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successBanner, setSuccessBanner] = useState(null);
  const [validationError, setValidationError] = useState('');

  // Clean quotation reference number (e.g. "102")
  const cleanQuotationNumber =
    (quotationNumber || '').replace(/^#?QT-?(2026)?-?/i, '') || '102';

  // Filtered equipment from warehouse stock
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const matchesCategory =
        selectedCategory === 'ALL' || p.category === selectedCategory;
      const matchesSearch =
        searchQuery.trim() === '' ||
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (p.category && p.category.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (p.description && p.description.toLowerCase().includes(searchQuery.toLowerCase()));

      return matchesCategory && matchesSearch;
    });
  }, [products, selectedCategory, searchQuery]);

  const categories = ['ALL', 'CARDIO', 'STRENGTH', 'FREE WEIGHTS', 'ACCESSORIES'];

  // Financial calculations
  const quoteItemsSubtotal = useMemo(() => {
    return cartItemsList.reduce((sum, item) => {
      const unitPrice = Number(item.unitPrice || item.product?.price || 0);
      const offerPrice = Math.max(0, unitPrice - 500);
      return sum + offerPrice * item.quantity;
    }, 0);
  }, [cartItemsList]);

  const quoteAdditionalTotal = useMemo(() => {
    return additionalCharges.reduce(
      (sum, c) => sum + (parseFloat(c.amount) || 0),
      0
    );
  }, [additionalCharges]);

  const quoteNetTaxableSum = quoteItemsSubtotal + quoteAdditionalTotal;
  const quoteTotalVat = quoteNetTaxableSum * 0.05;
  const quoteGrandTotal = quoteNetTaxableSum + quoteTotalVat;

  // Handle adding custom charge
  const handleAddCustomCharge = (e) => {
    e.preventDefault();
    if (!customChargeDesc.trim() || !customChargeAmount || isNaN(customChargeAmount)) {
      return;
    }
    addAdditionalCharge(customChargeDesc.trim(), parseFloat(customChargeAmount));
    setCustomChargeDesc('');
    setCustomChargeAmount('');
  };

  // Quick preset charges
  const handleAddPresetCharge = (desc, amount) => {
    addAdditionalCharge(desc, amount);
  };

  // Submit Quotation for Review (Story flow step 1)
  const handleSubmitQuotation = () => {
    setValidationError('');
    if (cartItemsList.length === 0) {
      setValidationError('Please add at least one commercial equipment item to the quotation draft.');
      return;
    }
    if (!customerName.trim()) {
      setValidationError('Please enter the customer / client name.');
      return;
    }

    setIsSubmitting(true);
    const recorded = recordCurrentQuote();

    if (recorded) {
      const savedCode = recorded.id || `QT-${cleanQuotationNumber}`;
      setSuccessBanner({
        quoteId: savedCode,
        message: `Quotation ${savedCode} has been successfully created and submitted with status "Pending Review". Awaiting Finance review.`,
      });

      // Clear draft form
      clearCart();
      setCustomerName('');
      setContactNumber('');
      setCustomerDetails('');
      generateNewQuotationNumber();

      setIsSubmitting(false);

      // Scroll to top and optionally notify parent
      window.scrollTo({ top: 0, behavior: 'smooth' });

      // After 2.5s or via button, user can jump to Quotes Hub
    } else {
      setIsSubmitting(false);
      setValidationError('Failed to record quotation. Please try again.');
    }
  };

  // Handle PDF Export
  const handleDownloadPdf = async () => {
    if (cartItemsList.length === 0) {
      setValidationError('Add at least one item before generating PDF.');
      return;
    }
    try {
      const doc = await generateInvoicePdf({
        type: 'QUOTATION',
        documentNumber: cleanQuotationNumber,
        date: quoteDate,
        customerName: customerName.trim() || 'Valued Commercial Client',
        contactNumber: contactNumber.trim() || companySettings.phone,
        customerDetails: customerDetails.trim() || 'Dubai / UAE',
        items: cartItemsList.map((it) => {
          const uPrice = Number(it.unitPrice || it.product.price || 0);
          const oPrice = Math.max(0, uPrice - 500);
          return {
            product: it.product,
            quantity: it.quantity,
            unitPrice: uPrice,
            offerPrice: oPrice,
            sum: oPrice * it.quantity,
          };
        }),
        additionalCharges: [...additionalCharges],
        subtotal: quoteNetTaxableSum,
        vat: quoteTotalVat,
        grandTotal: quoteGrandTotal,
        settings: companySettings,
      });
      doc.save(`Delitrade_Quotation_QT-${cleanQuotationNumber}.pdf`);
    } catch (err) {
      console.error(err);
      alert('Failed to generate PDF. Please try again.');
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header Banner */}
      <div className="p-4 sm:p-5 rounded-2xl bg-surface border border-white/10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xl">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400 flex-shrink-0">
            <FileText className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-white uppercase tracking-tight">
                Create Commercial Quotation
              </h2>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-500/10 text-amber-300 border border-amber-500/20 font-bold">
                Auto-Sequence Active
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Select warehouse stock, specify client particulars, and submit for Finance review & approval.
            </p>
          </div>
        </div>

        {/* Reference Code & Agent Info */}
        <div className="flex flex-wrap items-center gap-2.5">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#070A12] border border-white/10 text-xs font-mono">
            <span className="text-slate-400">Ref Code:</span>
            <span className="text-amber-400 font-bold">QT-2026-{cleanQuotationNumber}</span>
            <button
              onClick={generateNewQuotationNumber}
              className="p-1 rounded text-slate-400 hover:text-white hover:bg-white/10 transition-colors ml-1"
              title="Auto-generate next unique sequential code"
            >
              <RefreshCw className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#070A12] border border-white/10 text-xs font-mono">
            <span className="text-slate-400">Agent:</span>
            <span className="text-emerald-400 font-bold">
              {currentAdminUser?.name || 'Sales Representative'}
            </span>
          </div>
        </div>
      </div>

      {/* Success Banner */}
      {successBanner && (
        <div className="p-4 rounded-xl bg-emerald-500/15 border border-emerald-500/40 text-emerald-300 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-lg">
          <div className="flex items-center gap-2.5">
            <CheckCircle className="w-5 h-5 text-emerald-400 flex-shrink-0" />
            <div>
              <p className="text-xs font-bold text-white">Quotation Created Successfully!</p>
              <p className="text-xs text-emerald-300/90">{successBanner.message}</p>
            </div>
          </div>
          <div className="flex items-center gap-2 w-full sm:w-auto">
            {onQuotationCreated && (
              <button
                onClick={onQuotationCreated}
                className="w-full sm:w-auto px-3.5 py-1.5 rounded-lg bg-emerald-500 text-slate-950 font-bold text-xs uppercase tracking-wider hover:brightness-110 transition-all font-mono"
              >
                View in Quotations Hub →
              </button>
            )}
            <button
              onClick={() => setSuccessBanner(null)}
              className="px-2.5 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-400 text-xs font-mono"
            >
              Dismiss
            </button>
          </div>
        </div>
      )}

      {/* Validation Error Banner */}
      {validationError && (
        <div className="p-3.5 rounded-xl bg-red-500/15 border border-red-500/40 text-red-300 flex items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
            <span>{validationError}</span>
          </div>
          <button
            onClick={() => setValidationError('')}
            className="text-red-400 hover:text-white font-mono text-[11px]"
          >
            ✕
          </button>
        </div>
      )}

      {/* Main 2-Column Responsive Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* LEFT COLUMN: Warehouse Equipment Catalog & Selection (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="p-4 rounded-2xl bg-surface border border-white/10 space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <Layers className="w-4 h-4 text-amber-400" />
                <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-white">
                  Warehouse Stock Catalog ({filteredProducts.length} Equipment Available)
                </h3>
              </div>
              <span className="text-[11px] font-mono text-emerald-400">
                UAE Warehouse Stock • 5% VAT Included
              </span>
            </div>

            {/* Search Input */}
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search machinery by name, model code, category..."
                className="w-full bg-[#070A12] border border-white/10 rounded-xl pl-9 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500/60"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-white font-mono"
                >
                  ✕
                </button>
              )}
            </div>

            {/* Category Filter Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1">
              {categories.map((cat) => {
                const isActive = selectedCategory === cat;
                return (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-3 py-1 rounded-lg text-[11px] font-mono font-bold whitespace-nowrap transition-all ${
                      isActive
                        ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 shadow-sm'
                        : 'bg-[#070A12] border border-white/10 text-slate-400 hover:text-white'
                    }`}
                  >
                    {cat}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Product Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[640px] overflow-y-auto pr-1">
            {filteredProducts.map((p) => {
              const inCartQty = cart[p.code]?.quantity || 0;
              const unitPrice = Number(p.price || 0);
              const offerPrice = Math.max(0, unitPrice - 500);

              return (
                <div
                  key={p.code}
                  className={`p-3.5 rounded-xl border transition-all flex flex-col justify-between ${
                    inCartQty > 0
                      ? 'bg-amber-500/10 border-amber-500/50 shadow-lg shadow-amber-500/5'
                      : 'bg-surface border-white/10 hover:border-white/20'
                  }`}
                >
                  <div>
                    {/* Header: Code & Category */}
                    <div className="flex items-center justify-between gap-1 text-[10px] font-mono mb-1.5">
                      <span className="font-bold text-amber-400 bg-[#070A12] px-2 py-0.5 rounded border border-white/10">
                        {p.code}
                      </span>
                      <span className="text-slate-400 uppercase truncate max-w-[120px]">
                        {p.category}
                      </span>
                    </div>

                    {/* Image & Title */}
                    <div className="flex gap-2.5 items-start mt-2">
                      <div className="w-14 h-14 rounded-lg bg-[#070A12] border border-white/10 flex-shrink-0 overflow-hidden flex items-center justify-center p-1">
                        {p.image ? (
                          <img
                            src={p.image}
                            alt={p.name}
                            className="w-full h-full object-contain"
                          />
                        ) : (
                          <Layers className="w-6 h-6 text-slate-600" />
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <h4 className="text-xs font-bold text-white line-clamp-2 leading-tight">
                          {p.name}
                        </h4>
                        <p className="text-[11px] text-slate-400 mt-0.5 line-clamp-1">
                          {p.description || 'Heavy-duty commercial construction'}
                        </p>
                      </div>
                    </div>

                    {/* Stock & Pricing */}
                    <div className="mt-3 pt-2 border-t border-white/5 flex items-center justify-between">
                      <div>
                        <span className="text-[10px] text-slate-500 line-through block font-mono">
                          AED {formatCurrency(unitPrice)}
                        </span>
                        <span className="text-xs font-bold text-emerald-400 font-mono">
                          AED {formatCurrency(offerPrice)}
                        </span>
                      </div>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                        {p.stockQty || 5} In Stock
                      </span>
                    </div>
                  </div>

                  {/* Quantity & Add Action */}
                  <div className="mt-3 pt-2">
                    {inCartQty > 0 ? (
                      <div className="flex items-center justify-between bg-[#070A12] border border-amber-500/40 rounded-lg p-1">
                        <button
                          onClick={() => removeFromCart(p.code)}
                          className="w-7 h-7 rounded bg-white/5 hover:bg-white/15 text-slate-300 flex items-center justify-center transition-colors"
                          title="Decrease quantity"
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                        <span className="text-xs font-mono font-bold text-amber-400 px-3">
                          {inCartQty} in quote
                        </span>
                        <button
                          onClick={() => addToCart(p)}
                          className="w-7 h-7 rounded bg-amber-500 text-slate-950 flex items-center justify-center font-bold hover:brightness-110 transition-colors"
                          title="Increase quantity"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => addToCart(p)}
                        className="w-full py-2 rounded-lg bg-[#070A12] hover:bg-amber-500 hover:text-slate-950 text-slate-200 border border-white/10 hover:border-amber-500 text-xs font-mono font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Add to Quote</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* RIGHT COLUMN: Active Quotation Ledger & Client Particulars (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="p-4 sm:p-5 rounded-2xl bg-surface border border-white/10 space-y-4 shadow-xl">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-amber-400" />
                <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-white">
                  Quotation Ledger
                </h3>
              </div>
              <span className="text-xs font-mono font-bold text-amber-400 bg-[#070A12] px-2 py-0.5 rounded border border-white/10">
                #QT-2026-{cleanQuotationNumber}
              </span>
            </div>

            {/* Client Particulars Form */}
            <div className="space-y-2.5">
              <label className="text-[11px] font-mono uppercase text-slate-400 font-bold block">
                Client Information
              </label>

              <div>
                <input
                  type="text"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder="Customer / Gym / Company Name *"
                  className="w-full bg-[#070A12] border border-white/10 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500/60 font-medium"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <input
                  type="text"
                  value={contactNumber}
                  onChange={(e) => setContactNumber(e.target.value)}
                  placeholder="Contact Phone (+971 ...)"
                  className="w-full bg-[#070A12] border border-white/10 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500/60 font-mono"
                />
                <input
                  type="text"
                  value={customerDetails}
                  onChange={(e) => setCustomerDetails(e.target.value)}
                  placeholder="Location (e.g. Dubai, UAE)"
                  className="w-full bg-[#070A12] border border-white/10 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500/60 font-medium"
                />
              </div>
            </div>

            {/* Selected Items List */}
            <div className="space-y-2 pt-2 border-t border-white/10">
              <div className="flex items-center justify-between text-[11px] font-mono text-slate-400">
                <span>Selected Equipment ({cartItemsList.length} items)</span>
                {cartItemsList.length > 0 && (
                  <button
                    onClick={clearCart}
                    className="text-red-400 hover:text-red-300 text-[10px] font-bold"
                  >
                    Clear All
                  </button>
                )}
              </div>

              {cartItemsList.length === 0 ? (
                <div className="py-8 text-center rounded-xl bg-[#070A12] border border-dashed border-white/10 space-y-2">
                  <Layers className="w-8 h-8 text-slate-600 mx-auto" />
                  <p className="text-xs text-slate-400">Quotation ledger is empty.</p>
                  <p className="text-[11px] text-slate-500">
                    Click "+ Add to Quote" on equipment to build the proposal.
                  </p>
                </div>
              ) : (
                <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                  {cartItemsList.map((item) => {
                    const unitPrice = Number(item.unitPrice || item.product?.price || 0);
                    const offerPrice = Math.max(0, unitPrice - 500);
                    const lineSum = offerPrice * item.quantity;

                    return (
                      <div
                        key={item.product.code}
                        className="p-2.5 rounded-xl bg-[#070A12] border border-white/10 flex items-center justify-between gap-2 text-xs"
                      >
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-1.5 font-mono">
                            <span className="text-[10px] font-bold text-amber-400">
                              {item.product.code}
                            </span>
                            <span className="text-slate-400">•</span>
                            <span className="text-white font-bold truncate">
                              {item.product.name}
                            </span>
                          </div>
                          <div className="text-[11px] font-mono text-slate-400 mt-0.5">
                            {item.quantity} × AED {formatCurrency(offerPrice)} ={' '}
                            <span className="text-emerald-400 font-bold">
                              AED {formatCurrency(lineSum)}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-1 flex-shrink-0">
                          <button
                            onClick={() => removeFromCart(item.product.code)}
                            className="p-1 rounded bg-white/5 hover:bg-white/15 text-slate-300 transition-colors"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="font-mono text-xs font-bold text-white px-1.5">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => addToCart(item.product)}
                            className="p-1 rounded bg-white/5 hover:bg-white/15 text-slate-300 transition-colors"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Additional Charges Section */}
            <div className="space-y-2 pt-2 border-t border-white/10">
              <label className="text-[11px] font-mono uppercase text-slate-400 font-bold block">
                Additional Services & Delivery
              </label>

              {/* Preset buttons */}
              <div className="flex flex-wrap gap-1.5">
                {[
                  { desc: 'Commercial Delivery & Ground Floor Assembly', amount: 850 },
                  { desc: 'Heavy Rigging & Express Placement', amount: 1200 },
                  { desc: 'Preventative AMC 6-Month Inspection', amount: 1500 },
                ].map((preset, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleAddPresetCharge(preset.desc, preset.amount)}
                    className="px-2 py-1 rounded bg-[#070A12] border border-white/10 hover:border-amber-500/40 text-[10px] font-mono text-slate-300 hover:text-white transition-colors"
                  >
                    + {preset.desc.split('&')[0]} (AED {preset.amount})
                  </button>
                ))}
              </div>

              {/* Added charges list */}
              {additionalCharges.length > 0 && (
                <div className="space-y-1.5 pt-1">
                  {additionalCharges.map((ch) => (
                    <div
                      key={ch.id}
                      className="px-2.5 py-1.5 rounded-lg bg-[#070A12] border border-white/10 flex items-center justify-between text-xs font-mono"
                    >
                      <span className="text-slate-300 text-[11px] truncate">{ch.description}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-amber-400 font-bold">
                          AED {formatCurrency(ch.amount)}
                        </span>
                        <button
                          onClick={() => removeAdditionalCharge(ch.id)}
                          className="text-slate-400 hover:text-red-400"
                        >
                          ✕
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Custom charge input */}
              <form onSubmit={handleAddCustomCharge} className="flex gap-2 pt-1">
                <input
                  type="text"
                  value={customChargeDesc}
                  onChange={(e) => setCustomChargeDesc(e.target.value)}
                  placeholder="Custom service description..."
                  className="flex-1 bg-[#070A12] border border-white/10 rounded-lg px-2.5 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500/60"
                />
                <input
                  type="number"
                  value={customChargeAmount}
                  onChange={(e) => setCustomChargeAmount(e.target.value)}
                  placeholder="AED"
                  className="w-20 bg-[#070A12] border border-white/10 rounded-lg px-2.5 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500/60 font-mono"
                />
                <button
                  type="submit"
                  className="px-3 py-1.5 rounded-lg bg-surface border border-white/10 hover:border-amber-500/40 text-amber-400 text-xs font-mono font-bold"
                >
                  Add
                </button>
              </form>
            </div>

            {/* Financial Summary Box */}
            <div className="p-3.5 rounded-xl bg-[#070A12] border border-white/10 space-y-2 font-mono text-xs">
              <div className="flex justify-between text-slate-400 text-[11px]">
                <span>Equipment Subtotal:</span>
                <span className="text-white">AED {formatCurrency(quoteItemsSubtotal)}</span>
              </div>
              {quoteAdditionalTotal > 0 && (
                <div className="flex justify-between text-slate-400 text-[11px]">
                  <span>Additional Services:</span>
                  <span className="text-white">AED {formatCurrency(quoteAdditionalTotal)}</span>
                </div>
              )}
              <div className="flex justify-between text-slate-400 text-[11px] pt-1 border-t border-white/5">
                <span>Net Taxable Amount:</span>
                <span className="text-white font-bold">AED {formatCurrency(quoteNetTaxableSum)}</span>
              </div>
              <div className="flex justify-between text-slate-400 text-[11px]">
                <span>UAE VAT (5%):</span>
                <span className="text-amber-400 font-bold">AED {formatCurrency(quoteTotalVat)}</span>
              </div>
              <div className="flex justify-between text-base font-bold text-emerald-400 pt-2 border-t border-white/10">
                <span>Grand Total:</span>
                <span>AED {formatCurrency(quoteGrandTotal)}</span>
              </div>
              <div className="text-[10px] text-slate-500 italic text-right">
                {numberToWords(quoteGrandTotal)}
              </div>
            </div>

            {/* Action Buttons: Submit & PDF */}
            <div className="space-y-2 pt-2">
              <button
                type="button"
                onClick={handleSubmitQuotation}
                disabled={isSubmitting || cartItemsList.length === 0}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-amber-500 via-amber-600 to-amber-500 text-slate-950 font-black font-mono text-xs uppercase tracking-wider shadow-lg shadow-amber-500/20 hover:brightness-110 active:scale-98 transition-all flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <Send className="w-4 h-4" />
                <span>
                  {isSubmitting ? 'Recording Proposal...' : 'Submit Quotation for Review'}
                </span>
              </button>

              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={handleDownloadPdf}
                  disabled={cartItemsList.length === 0}
                  className="py-2 rounded-xl bg-[#070A12] border border-white/10 hover:border-white/20 text-slate-300 font-mono text-xs font-bold flex items-center justify-center gap-1.5 transition-colors disabled:opacity-40"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download PDF</span>
                </button>
                <button
                  type="button"
                  onClick={clearCart}
                  disabled={cartItemsList.length === 0}
                  className="py-2 rounded-xl bg-[#070A12] border border-white/10 hover:border-red-500/40 text-slate-400 hover:text-red-400 font-mono text-xs transition-colors disabled:opacity-40"
                >
                  Reset Draft
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
