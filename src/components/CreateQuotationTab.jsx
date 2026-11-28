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
  ArrowUpDown,
  SlidersHorizontal,
  Lock,
  Copy,
} from 'lucide-react';
import { useApp, sanitizeInput } from '../context/AppContext';
import { formatCurrency, numberToWords } from '../utils/numberToWords';
import CompanyLogo from './CompanyLogo';

// Robust category matching for gym equipment families
export const matchProductCategory = (pCategory, selectedCategory) => {
  if (!selectedCategory || selectedCategory === 'ALL') return true;
  const cat = (pCategory || '').toLowerCase().trim();
  const sel = selectedCategory.toLowerCase().trim();

  if (sel === 'cardio') {
    return cat.includes('cardio');
  }
  if (sel === 'strength') {
    return cat.includes('strength') || cat.includes('cable') || cat.includes('plate');
  }
  if (sel === 'plate loaded') {
    return cat.includes('plate');
  }
  if (sel === 'free weights' || sel === 'free weights & benches') {
    return cat.includes('weight') || cat.includes('bench');
  }
  if (sel === 'accessories' || sel === 'core & specialty') {
    return cat.includes('core') || cat.includes('specialty') || cat.includes('accessor');
  }
  return cat === sel || cat.includes(sel);
};

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
    toggleAdditionalCharge,
    removeAdditionalCharge,
    recordCurrentQuote,
    companySettings,
    currentRole,
    currentAdminUser,
    ROLE_DEFINITIONS,
    ROLES,
  } = useApp();

  // Search, Category filter & Sorting for warehouse equipment catalog
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [strengthSubFilter, setStrengthSubFilter] = useState('ALL'); // 'ALL' | 'PLATE' | 'CABLE'
  const [sortBy, setSortBy] = useState('default'); // 'default' | 'price_asc' | 'price_desc' | 'name_asc' | 'name_desc' | 'stock_desc' | 'code_asc'

  const [customChargeDesc, setCustomChargeDesc] = useState('');
  const [customChargeAmount, setCustomChargeAmount] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successBanner, setSuccessBanner] = useState(null);
  const [validationError, setValidationError] = useState('');

  // Clean quotation reference number (e.g. "102")
  const cleanQuotationNumber =
    (quotationNumber || '').replace(/^#?QT-?(2026)?-?/i, '') || '102';

  const [copiedRef, setCopiedRef] = useState(false);

  const handleCopyRefCode = (codeToCopy, e) => {
    if (e) e.stopPropagation();
    const code = codeToCopy || `QT-2026-${cleanQuotationNumber}`;
    if (navigator?.clipboard?.writeText) {
      navigator.clipboard
        .writeText(code)
        .then(() => {
          setCopiedRef(true);
          setTimeout(() => setCopiedRef(false), 2000);
        })
        .catch(() => {
          fallbackCopyRef(code);
        });
    } else {
      fallbackCopyRef(code);
    }
  };

  const fallbackCopyRef = (text) => {
    try {
      const ta = document.createElement('textarea');
      ta.value = text;
      ta.style.position = 'fixed';
      ta.style.opacity = '0';
      document.body.appendChild(ta);
      ta.focus();
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
      setCopiedRef(true);
      setTimeout(() => setCopiedRef(false), 2000);
    } catch (e) {
      console.warn('Copy failed', e);
    }
  };

  const categories = ['ALL', 'CARDIO', 'STRENGTH', 'FREE WEIGHTS', 'ACCESSORIES'];

  // Dynamic Category equipment counts
  const categoryCounts = useMemo(() => {
    const counts = {
      ALL: products.length,
      CARDIO: 0,
      STRENGTH: 0,
      'FREE WEIGHTS': 0,
      ACCESSORIES: 0,
    };
    products.forEach((p) => {
      const cat = (p.category || '').toLowerCase();
      if (cat.includes('cardio')) {
        counts.CARDIO++;
      } else if (cat.includes('strength') || cat.includes('cable') || cat.includes('plate')) {
        counts.STRENGTH++;
      } else if (cat.includes('weight') || cat.includes('bench')) {
        counts['FREE WEIGHTS']++;
      } else if (cat.includes('core') || cat.includes('specialty') || cat.includes('accessor')) {
        counts.ACCESSORIES++;
      }
    });
    return counts;
  }, [products]);

  const strengthSubCounts = useMemo(() => {
    let plate = 0;
    let cable = 0;
    products.forEach((p) => {
      const cat = (p.category || '').toLowerCase();
      if (cat.includes('plate')) plate++;
      else if (cat.includes('cable') || cat.includes('strength')) cable++;
    });
    return { plate, cable };
  }, [products]);

  // Filtered equipment from warehouse stock based on category and search
  const filteredProducts = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    return products.filter((p) => {
      let matchesCategory = matchProductCategory(p.category, selectedCategory);
      if (selectedCategory === 'STRENGTH' && strengthSubFilter !== 'ALL') {
        const cat = (p.category || '').toLowerCase();
        if (strengthSubFilter === 'PLATE') {
          matchesCategory = cat.includes('plate');
        } else if (strengthSubFilter === 'CABLE') {
          matchesCategory = cat.includes('cable') || cat.includes('strength');
        }
      }

      const matchesSearch =
        !q ||
        (p.name && p.name.toLowerCase().includes(q)) ||
        (p.code && p.code.toLowerCase().includes(q)) ||
        (p.category && p.category.toLowerCase().includes(q)) ||
        (p.description && p.description.toLowerCase().includes(q)) ||
        String(p.price || '').includes(q);

      return matchesCategory && matchesSearch;
    });
  }, [products, selectedCategory, strengthSubFilter, searchQuery]);

  // Sorted equipment
  const sortedProducts = useMemo(() => {
    const list = [...filteredProducts];
    switch (sortBy) {
      case 'price_asc':
        return list.sort((a, b) => Number(a.price || 0) - Number(b.price || 0));
      case 'price_desc':
        return list.sort((a, b) => Number(b.price || 0) - Number(a.price || 0));
      case 'name_asc':
        return list.sort((a, b) => (a.name || '').localeCompare(b.name || ''));
      case 'name_desc':
        return list.sort((a, b) => (b.name || '').localeCompare(a.name || ''));
      case 'stock_desc':
        return list.sort((a, b) => Number(b.stockQty || 0) - Number(a.stockQty || 0));
      case 'code_asc':
        return list.sort((a, b) => (a.code || '').localeCompare(b.code || ''));
      default:
        return list;
    }
  }, [filteredProducts, sortBy]);

  // Preset commercial services
  const PRESET_CHARGES = useMemo(
    () => [
      {
        id: 'preset-delivery',
        desc: 'Commercial Delivery & Ground Floor Assembly',
        label: 'Commercial Delivery',
        amount: 850,
      },
      {
        id: 'preset-rigging',
        desc: 'Heavy Rigging & Express Placement',
        label: 'Heavy Rigging',
        amount: 1200,
      },
      {
        id: 'preset-amc',
        desc: 'Preventative AMC 6-Month Inspection',
        label: 'Preventative AMC (6-Mo)',
        amount: 1500,
      },
      {
        id: 'preset-turnkey',
        desc: 'Turnkey Club Installation & Calibration',
        label: 'Turnkey Installation',
        amount: 2500,
      },
    ],
    []
  );

  // Financial calculations
  const quoteItemsSubtotal = useMemo(() => {
    return cartItemsList.reduce((sum, item) => {
      const unitPrice = Number(item.unitPrice || item.product?.price || 0);
      const offerPrice = Math.max(0, unitPrice - 500);
      return sum + offerPrice * (Number(item.quantity) || 1);
    }, 0);
  }, [cartItemsList]);

  const validAdditionalCharges = useMemo(() => {
    return additionalCharges.filter(
      (c) => c && c.description && !isNaN(Number(c.amount)) && Number(c.amount) > 0
    );
  }, [additionalCharges]);

  const quoteAdditionalTotal = useMemo(() => {
    return validAdditionalCharges.reduce(
      (sum, c) => sum + Number(c.amount),
      0
    );
  }, [validAdditionalCharges]);

  const quoteNetTaxableSum = useMemo(() => {
    return Math.round((quoteItemsSubtotal + quoteAdditionalTotal) * 100) / 100;
  }, [quoteItemsSubtotal, quoteAdditionalTotal]);

  const quoteTotalVat = useMemo(() => {
    return Math.round(quoteNetTaxableSum * 0.05 * 100) / 100;
  }, [quoteNetTaxableSum]);

  const quoteGrandTotal = useMemo(() => {
    return Math.round((quoteNetTaxableSum + quoteTotalVat) * 100) / 100;
  }, [quoteNetTaxableSum, quoteTotalVat]);

  // Handle adding custom charge
  const handleAddCustomCharge = (e) => {
    e.preventDefault();
    const cleanDesc = sanitizeInput(customChargeDesc).trim();
    const amt = parseFloat(customChargeAmount);
    if (!cleanDesc || isNaN(amt) || amt <= 0) {
      return;
    }
    addAdditionalCharge(cleanDesc, Math.round(amt * 100) / 100);
    setCustomChargeDesc('');
    setCustomChargeAmount('');
  };

  // Quick preset charge toggle
  const handleTogglePresetCharge = (preset) => {
    toggleAdditionalCharge(preset.desc, preset.amount);
  };

  // Submit Quotation for Review (Story flow step 1)
  const handleSubmitQuotation = () => {
    setValidationError('');
    const cleanCustomer = sanitizeInput(customerName);
    const cleanContact = sanitizeInput(contactNumber);
    const cleanLocation = sanitizeInput(customerDetails);

    setCustomerName(cleanCustomer);
    setContactNumber(cleanContact);
    setCustomerDetails(cleanLocation);

    if (cartItemsList.length === 0) {
      setValidationError('Please add at least one commercial equipment item to the quotation draft.');
      return;
    }
    if (!cleanCustomer) {
      setValidationError('Please enter the customer / client name.');
      return;
    }

    setIsSubmitting(true);
    const recorded = recordCurrentQuote();

    if (recorded) {
      const savedCode = recorded.id || `QT-${cleanQuotationNumber}`;
      setSuccessBanner({
        quoteId: savedCode,
        message: `Quotation ${savedCode} has been successfully created with status "Pending Review".`,
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

  return (
    <div className="space-y-6">
      {/* Top Header Banner */}
      <div className="p-4 sm:p-5 rounded-2xl bg-surface border border-white/10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xl">
        <div className="flex items-start sm:items-center gap-3 min-w-0 flex-1">
          <CompanyLogo size="md" showText={false} className="flex-shrink-0 mt-0.5" />
          <div className="min-w-0 flex-1">
            <h2 className="text-sm sm:text-base font-bold text-white uppercase tracking-tight truncate">
              Create Commercial Quotation
            </h2>
            <p className="text-xs text-slate-400 mt-0.5 line-clamp-2 sm:line-clamp-1">
              Select warehouse stock, specify client particulars, and submit for Finance review & approval.
            </p>
          </div>
        </div>

        {/* Reference Code & Agent Info */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Ref Code Badge with On-Hover Copy to Clipboard */}
          <div
            onClick={(e) => handleCopyRefCode(`QT-2026-${cleanQuotationNumber}`, e)}
            className="group relative flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#070A12] border border-white/10 hover:border-amber-400/60 text-xs font-mono cursor-pointer transition-all active:scale-95 shadow-inner"
            title="Click to copy Ref Code to clipboard"
          >
            <span className="text-slate-400">Ref Code:</span>
            <span className="text-amber-400 font-bold tracking-wider">
              QT-2026-{cleanQuotationNumber}
            </span>

            {/* Copy / Copied Visual Feedback */}
            <span className="ml-1 p-0.5 rounded text-slate-400 group-hover:text-amber-300 transition-colors flex items-center">
              {copiedRef ? (
                <span className="flex items-center gap-1 text-[10px] text-emerald-400 font-bold">
                  <Check className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
                  <span className="animate-fadeIn font-sans">Copied!</span>
                </span>
              ) : (
                <Copy className="w-3.5 h-3.5 opacity-60 group-hover:opacity-100 group-hover:scale-110 transition-all text-amber-400/80" />
              )}
            </span>

            {/* Auto-generate Next Sequential Code */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                generateNewQuotationNumber();
              }}
              className="p-1 rounded text-slate-400 hover:text-white hover:bg-white/10 transition-colors ml-0.5"
              title="Auto-generate next unique sequential code"
            >
              <RefreshCw className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#070A12] border border-white/10 text-xs font-mono">
            <span className="text-slate-400">User:</span>
            <span className="text-emerald-400 font-bold">
              {currentAdminUser?.name || 'Authorized Officer'}
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
                  Warehouse Stock Catalog ({sortedProducts.length} Equipment Available)
                </h3>
              </div>
              <span className="text-[11px] font-mono text-emerald-400">
                UAE Warehouse Stock • 5% VAT Included
              </span>
            </div>

            {/* Search Input & Sort Controls */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search machinery by name, model code, category, price..."
                  className="w-full bg-[#070A12] border border-white/10 rounded-xl pl-9 pr-8 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500/60"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-white font-mono"
                    title="Clear search"
                  >
                    ✕
                  </button>
                )}
              </div>

              {/* Sort Dropdown */}
              <div className="flex items-center gap-1.5 bg-[#070A12] border border-white/10 rounded-xl px-2.5 py-1.5 text-xs text-slate-300">
                <ArrowUpDown className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" />
                <span className="text-[11px] text-slate-500 font-mono hidden sm:inline">Sort:</span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="bg-transparent text-xs text-white focus:outline-none cursor-pointer pr-1"
                >
                  <option value="default" className="bg-slate-900 text-white">Catalog Default</option>
                  <option value="price_asc" className="bg-slate-900 text-white">Price: Low to High (AED ↑)</option>
                  <option value="price_desc" className="bg-slate-900 text-white">Price: High to Low (AED ↓)</option>
                  <option value="stock_desc" className="bg-slate-900 text-white">Stock: Highest First</option>
                  <option value="name_asc" className="bg-slate-900 text-white">Name: A → Z</option>
                  <option value="name_desc" className="bg-slate-900 text-white">Name: Z → A</option>
                  <option value="code_asc" className="bg-slate-900 text-white">Model Code: A → Z</option>
                </select>
              </div>
            </div>

            {/* Category Filter Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1">
              {categories.map((cat) => {
                const isActive = selectedCategory === cat;
                const count = categoryCounts[cat] || 0;
                return (
                  <button
                    key={cat}
                    onClick={() => {
                      setSelectedCategory(cat);
                      setStrengthSubFilter('ALL');
                    }}
                    className={`px-3 py-1.5 rounded-lg text-[11px] font-mono font-bold whitespace-nowrap transition-all flex items-center gap-1.5 ${
                      isActive
                        ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 shadow-sm'
                        : 'bg-[#070A12] border border-white/10 text-slate-400 hover:text-white hover:border-white/20'
                    }`}
                  >
                    <span>{cat}</span>
                    <span
                      className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                        isActive
                          ? 'bg-black/20 text-slate-950 font-bold'
                          : 'bg-white/10 text-slate-400'
                      }`}
                    >
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Strength Sub-Categories */}
            {selectedCategory === 'STRENGTH' && (
              <div className="flex items-center gap-1.5 pt-1 text-[11px] font-mono animate-fadeIn">
                <span className="text-slate-500 text-[10px] uppercase">Strength Type:</span>
                <button
                  onClick={() => setStrengthSubFilter('ALL')}
                  className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                    strengthSubFilter === 'ALL'
                      ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                      : 'bg-[#070A12] text-slate-400 border border-white/10 hover:text-white'
                  }`}
                >
                  All ({categoryCounts.STRENGTH})
                </button>
                <button
                  onClick={() => setStrengthSubFilter('PLATE')}
                  className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                    strengthSubFilter === 'PLATE'
                      ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                      : 'bg-[#070A12] text-slate-400 border border-white/10 hover:text-white'
                  }`}
                >
                  Plate Loaded ({strengthSubCounts.plate})
                </button>
                <button
                  onClick={() => setStrengthSubFilter('CABLE')}
                  className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                    strengthSubFilter === 'CABLE'
                      ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                      : 'bg-[#070A12] text-slate-400 border border-white/10 hover:text-white'
                  }`}
                >
                  Strength & Cables ({strengthSubCounts.cable})
                </button>
              </div>
            )}
          </div>

          {/* Empty State or Product Cards Grid */}
          {sortedProducts.length === 0 ? (
            <div className="p-8 rounded-2xl bg-surface border border-white/10 text-center space-y-3">
              <Layers className="w-10 h-10 text-slate-600 mx-auto" />
              <p className="text-sm font-bold text-white">No Equipment Found</p>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                No warehouse machinery matches category &quot;{selectedCategory}&quot; {searchQuery ? `with search "${searchQuery}"` : ''}.
              </p>
              <button
                onClick={() => {
                  setSearchQuery('');
                  setSelectedCategory('ALL');
                  setStrengthSubFilter('ALL');
                  setSortBy('default');
                }}
                className="px-3.5 py-1.5 rounded-lg bg-amber-500 text-slate-950 font-bold text-xs font-mono uppercase tracking-wider hover:brightness-110"
              >
                Reset Filters & View All ({products.length})
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[640px] overflow-y-auto pr-1">
              {sortedProducts.map((p) => {
                const inCartQty = cart[p.code]?.quantity || 0;
                const unitPrice = Number(p.price || 0);
                const offerPrice = Math.max(0, unitPrice - 500);
                const imgSrc = p.image || p.imagePath;

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
                          {imgSrc ? (
                            <img
                              src={imgSrc}
                              alt={p.name}
                              className="w-full h-full object-contain"
                              onError={(e) => {
                                e.target.style.display = 'none';
                              }}
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
          )}
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

            {/* Additional Services & Delivery Section */}
            <div className="space-y-2.5 pt-2 border-t border-white/10">
              <div className="flex items-center justify-between">
                <label className="text-[11px] font-mono uppercase text-slate-400 font-bold flex items-center gap-1.5">
                  <span>Additional Services & Delivery</span>
                  {validAdditionalCharges.length > 0 && (
                    <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                      {validAdditionalCharges.length} active
                    </span>
                  )}
                </label>
                {quoteAdditionalTotal > 0 && (
                  <span className="text-[11px] font-mono text-amber-400 font-bold">
                    + AED {formatCurrency(quoteAdditionalTotal)}
                  </span>
                )}
              </div>

              {/* Preset Quick-Toggle Buttons */}
              <div className="flex flex-wrap gap-1.5">
                {PRESET_CHARGES.map((preset) => {
                  const isSelected = additionalCharges.some(
                    (c) =>
                      c &&
                      c.description &&
                      (c.description.toLowerCase() === preset.desc.toLowerCase() ||
                        c.description.toLowerCase().includes(preset.label.toLowerCase()))
                  );
                  return (
                    <button
                      key={preset.id}
                      type="button"
                      onClick={() => handleTogglePresetCharge(preset)}
                      title={isSelected ? `Click to remove ${preset.label}` : `Click to add ${preset.label}`}
                      className={`px-2.5 py-1.5 rounded-lg border text-[11px] font-mono transition-all flex items-center gap-1.5 ${
                        isSelected
                          ? 'bg-amber-500/20 border-amber-500/60 text-amber-300 font-bold shadow-sm shadow-amber-500/20'
                          : 'bg-[#070A12] border-white/10 hover:border-amber-500/40 text-slate-300 hover:text-white'
                      }`}
                    >
                      <span className={isSelected ? 'text-amber-400 font-black' : 'text-slate-500'}>
                        {isSelected ? '✓' : '+'}
                      </span>
                      <span>{preset.label}</span>
                      <span className={isSelected ? 'text-amber-200 font-semibold' : 'text-slate-400'}>
                        (AED {formatCurrency(preset.amount)})
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Added charges list */}
              {validAdditionalCharges.length > 0 && (
                <div className="space-y-1.5 pt-1">
                  {validAdditionalCharges.map((ch) => (
                    <div
                      key={ch.id}
                      className="px-2.5 py-1.5 rounded-lg bg-[#070A12] border border-white/10 flex items-center justify-between text-xs font-mono group hover:border-white/20 transition-all"
                    >
                      <div className="flex items-center gap-2 min-w-0 pr-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-400 flex-shrink-0" />
                        <span className="text-slate-200 text-[11px] truncate">{ch.description}</span>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <span className="text-amber-400 font-bold text-xs">
                          AED {formatCurrency(ch.amount)}
                        </span>
                        <button
                          type="button"
                          onClick={() => removeAdditionalCharge(ch.id)}
                          title="Remove service"
                          className="w-5 h-5 rounded flex items-center justify-center text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-colors"
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
                  placeholder="Custom service description (e.g. Staircase Logistics)..."
                  className="flex-1 bg-[#070A12] border border-white/10 rounded-lg px-2.5 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500/60"
                />
                <div className="relative w-28 flex-shrink-0">
                  <span className="absolute left-2.5 top-1.5 text-[11px] font-mono text-slate-500 pointer-events-none">
                    AED
                  </span>
                  <input
                    type="number"
                    min="1"
                    step="any"
                    value={customChargeAmount}
                    onChange={(e) => setCustomChargeAmount(e.target.value)}
                    placeholder="0.00"
                    className="w-full bg-[#070A12] border border-white/10 rounded-lg pl-9 pr-2 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500/60 font-mono text-right"
                  />
                </div>
                <button
                  type="submit"
                  disabled={!customChargeDesc.trim() || !customChargeAmount || Number(customChargeAmount) <= 0}
                  className="px-3.5 py-1.5 rounded-lg bg-surface border border-white/10 hover:border-amber-500/40 text-amber-400 text-xs font-mono font-bold transition-all disabled:opacity-30 disabled:cursor-not-allowed hover:bg-amber-500/10 flex-shrink-0"
                >
                  Add
                </button>
              </form>
            </div>

            {/* Financial Summary Box */}
            <div className="p-3.5 rounded-xl bg-[#070A12] border border-white/10 space-y-2 font-mono text-xs">
              <div className="flex justify-between text-slate-400 text-[11px]">
                <span>Equipment Subtotal:</span>
                <span className="text-white font-medium">AED {formatCurrency(quoteItemsSubtotal)}</span>
              </div>
              {quoteAdditionalTotal > 0 && (
                <div className="flex justify-between text-slate-400 text-[11px]">
                  <span className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-400 inline-block" />
                    Additional Services:
                  </span>
                  <span className="text-amber-400 font-bold">+ AED {formatCurrency(quoteAdditionalTotal)}</span>
                </div>
              )}
              <div className="flex justify-between text-slate-400 text-[11px] pt-1.5 border-t border-white/5">
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
              <div className="text-[10px] text-slate-500 italic text-right pt-0.5">
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

              <button
                type="button"
                onClick={clearCart}
                disabled={cartItemsList.length === 0}
                className="w-full py-2.5 rounded-xl bg-[#070A12] border border-white/10 hover:border-red-500/40 text-slate-400 hover:text-red-400 font-mono text-xs transition-colors disabled:opacity-40 flex items-center justify-center gap-1.5"
              >
                Reset Draft
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
