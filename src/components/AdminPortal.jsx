import React, { useState, useEffect } from 'react';
import {
  Lock,
  LogOut,
  ArrowLeft,
  LayoutDashboard,
  Package,
  Receipt,
  Building,
  CreditCard,
  Plus,
  Trash2,
  Edit2,
  CheckCircle,
  AlertTriangle,
  Printer,
  Download,
  Search,
  Eye,
  FileCheck,
  ShieldCheck,
  Percent,
  FileText,
  Check,
  RotateCcw,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { formatCurrency, numberToWords } from '../utils/numberToWords';
import { generateInvoicePdf } from '../utils/pdfGenerator';
import Pagination from './Pagination';

export const DEFAULT_TERMS_TEMPLATES = [
  {
    id: 'tmpl-commercial-50-50',
    name: 'Standard Commercial Terms (50/50 Deposit)',
    badge: 'Standard Gym Supply',
    description: 'Fast fulfillment commercial warranty for standard warehouse machinery supply.',
    terms: [
      'Customer shall approve this document along with signed purchase order or official transfer proof.',
      'Validity: 7 calendar days from issuance. Factory direct warehouse stock subject to prior sales.',
      'Payment Terms: 50% advance booking deposit; balance 50% prior to dispatch & site delivery.',
      'Delivery & professional assembly performed by Delitrade technicians across Dubai & UAE.',
      'Includes standard 1-Year Heavy-Duty Structural Frame & Motor Commercial Warranty.',
    ],
  },
  {
    id: 'tmpl-turnkey-70-30',
    name: 'Turnkey Project & Extended Installation Terms',
    badge: 'Turnkey Facility & Club',
    description: 'Milestone structure with extended cover and preventative maintenance for comprehensive setups.',
    terms: [
      'Turnkey project agreement valid for 14 calendar days from official invoice generation.',
      'Milestone Payment: 70% advance mobilization deposit; balance 30% upon final site handover & testing.',
      'Site readiness, civil clearance, and freight elevator/stair access to be arranged prior to rigging.',
      'Includes 2-Year Extended Frame Warranty and complimentary 6-Month Preventative AMC Service.',
      'Custom imported orders are non-cancellable; warranty serviced directly by certified Delitrade engineers.',
    ],
  },
];

export default function AdminPortal() {
  const {
    isAdminLoggedIn,
    adminLogin,
    adminLogout,
    navigateToStorefront,
    quotesRecords,
    convertQuoteToSalesInvoice,
    deleteQuoteRecord,
    products,
    addProduct,
    updateProduct,
    deleteProduct,
    updateProductStock,
    companySettings,
    setCompanySettings,
    bankAccounts,
    addBankAccount,
    updateBankAccount,
    removeBankAccount,
  } = useApp();

  // Admin active sub-tab
  const [activeTab, setActiveTab] = useState('quotes'); // 'quotes' | 'products' | 'branding' | 'banks'

  // Admin Login Form State
  const [loginUsername, setLoginUsername] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginError, setLoginError] = useState('');

  // Search in Quotes
  const [quoteSearch, setQuoteSearch] = useState('');
  const [quoteFilter, setQuoteFilter] = useState('ALL'); // 'ALL' | 'quotation' | 'sales_invoice'

  // Search & Pagination in Products
  const [prodSearch, setProdSearch] = useState('');
  const [prodCategoryFilter, setProdCategoryFilter] = useState('ALL');
  const [prodPage, setProdPage] = useState(1);
  const [prodPerPage, setProdPerPage] = useState(10);

  // Reset product page when category or search changes
  useEffect(() => {
    setProdPage(1);
  }, [prodCategoryFilter, prodSearch]);

  // Modals
  const [isAddProductOpen, setIsAddProductOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);

  const [isAddBankOpen, setIsAddBankOpen] = useState(false);
  const [editingBank, setEditingBank] = useState(null);

  // Sales Invoice Preview & Price Override Modal State
  const [previewingQuote, setPreviewingQuote] = useState(null);
  const [overrideItems, setOverrideItems] = useState([]);
  const [overrideCharges, setOverrideCharges] = useState([]);
  const [overrideInvoiceDate, setOverrideInvoiceDate] = useState('');

  // Terms & Conditions Templates State (2 configurable templates)
  const [termsTemplates, setTermsTemplates] = useState(() => {
    try {
      const saved = localStorage.getItem('delitrade_terms_templates_v1');
      return saved ? JSON.parse(saved) : DEFAULT_TERMS_TEMPLATES;
    } catch {
      return DEFAULT_TERMS_TEMPLATES;
    }
  });
  const [selectedTermsTemplateId, setSelectedTermsTemplateId] = useState(null);
  const [editingTemplateId, setEditingTemplateId] = useState(null);
  const [editingTemplateForm, setEditingTemplateForm] = useState(null);
  const [termsValidationError, setTermsValidationError] = useState('');

  // Handle Terms Templates Inline Editing
  const handleStartEditTemplate = (template) => {
    setEditingTemplateId(template.id);
    setEditingTemplateForm({
      id: template.id,
      name: template.name,
      badge: template.badge || '',
      description: template.description || '',
      terms: [...template.terms],
    });
  };

  const handleSaveEditedTemplate = () => {
    if (!editingTemplateForm) return;
    const updated = termsTemplates.map((t) =>
      t.id === editingTemplateForm.id ? { ...editingTemplateForm } : t
    );
    setTermsTemplates(updated);
    try {
      localStorage.setItem('delitrade_terms_templates_v1', JSON.stringify(updated));
    } catch (e) {
      console.error(e);
    }
    setEditingTemplateId(null);
    setEditingTemplateForm(null);
  };

  const handleCancelEditTemplate = () => {
    setEditingTemplateId(null);
    setEditingTemplateForm(null);
  };

  const handleResetTermsToDefaults = () => {
    if (confirm('Reset both Terms & Conditions templates back to factory default clauses?')) {
      setTermsTemplates(DEFAULT_TERMS_TEMPLATES);
      try {
        localStorage.setItem('delitrade_terms_templates_v1', JSON.stringify(DEFAULT_TERMS_TEMPLATES));
      } catch (e) {
        console.error(e);
      }
      setEditingTemplateId(null);
      setEditingTemplateForm(null);
    }
  };

  const handleUpdateEditClause = (index, value) => {
    setEditingTemplateForm((prev) => {
      const terms = [...prev.terms];
      terms[index] = value;
      return { ...prev, terms };
    });
  };

  const handleAddEditClause = () => {
    setEditingTemplateForm((prev) => ({
      ...prev,
      terms: [...prev.terms, 'New custom condition or warranty clause.'],
    }));
  };

  const handleRemoveEditClause = (index) => {
    setEditingTemplateForm((prev) => ({
      ...prev,
      terms: prev.terms.filter((_, i) => i !== index),
    }));
  };

  // Handle Login
  const handleLoginSubmit = (e) => {
    e.preventDefault();
    setLoginError('');
    const res = adminLogin(loginUsername.trim(), loginPassword.trim());
    if (!res.success) {
      setLoginError(res.message || 'Invalid username or password');
    }
  };

  // Open Sales Invoice Preview & Price Override
  const openInvoicePreview = (quote) => {
    setPreviewingQuote(quote);
    setSelectedTermsTemplateId(quote.selectedTerms?.id || null);
    setTermsValidationError('');
    setEditingTemplateId(null);
    setEditingTemplateForm(null);
    // clone items with custom unitPrice
    setOverrideItems(
      quote.items.map((it) => ({
        product: { ...it.product },
        quantity: it.quantity,
        unitPrice: it.unitPrice || it.product.price,
        originalPrice: it.originalPrice || it.product.price,
      }))
    );
    // clone additional charges
    setOverrideCharges(
      quote.additionalCharges ? quote.additionalCharges.map((c) => ({ ...c })) : []
    );
    const today = new Date();
    setOverrideInvoiceDate(
      `${today.getDate()}-${today.toLocaleString('en-US', { month: 'short' })}-${today.getFullYear()}`
    );
  };

  // Handlers for Price Overrides inside Preview
  const handleItemPriceChange = (index, newPrice) => {
    setOverrideItems((prev) =>
      prev.map((it, idx) =>
        idx === index ? { ...it, unitPrice: parseFloat(newPrice) || 0 } : it
      )
    );
  };

  const handleItemQuantityChange = (index, newQty) => {
    setOverrideItems((prev) =>
      prev.map((it, idx) =>
        idx === index ? { ...it, quantity: Math.max(1, parseInt(newQty, 10) || 1) } : it
      )
    );
  };

  const handleAddPreviewCharge = () => {
    const newCharge = {
      id: 'ch-' + Date.now() + Math.random().toString(36).substr(2, 4),
      description: 'Logistics, Offloading & Installation',
      amount: 500,
    };
    setOverrideCharges((prev) => [...prev, newCharge]);
  };

  const handleUpdatePreviewCharge = (id, field, val) => {
    setOverrideCharges((prev) =>
      prev.map((c) => (c.id === id ? { ...c, [field]: val } : c))
    );
  };

  const handleRemovePreviewCharge = (id) => {
    setOverrideCharges((prev) => prev.filter((c) => c.id !== id));
  };

  // Preview Totals
  const previewItemsSum = overrideItems.reduce(
    (sum, it) => sum + (Number(it.unitPrice) || 0) * (Number(it.quantity) || 1),
    0
  );
  const previewChargesSum = overrideCharges.reduce(
    (sum, ch) => sum + (parseFloat(ch.amount) || 0),
    0
  );
  const previewSubtotal = previewItemsSum + previewChargesSum;
  const previewVat = previewSubtotal * 0.05;
  const previewGrandTotal = previewSubtotal + previewVat;

  // Confirm Convert to Sales Invoice (MANDATORY TERMS CHECK)
  const handleConfirmSalesInvoice = () => {
    if (!previewingQuote) return;
    if (!selectedTermsTemplateId) {
      setTermsValidationError(
        'Mandatory Requirement: Please select 1 of the 2 Terms & Conditions templates below before generating the official Sales Invoice.'
      );
      alert('Mandatory Requirement: Please select 1 of the 2 Terms & Conditions templates before confirming the Sales Invoice.');
      return;
    }

    const chosenTemplate = termsTemplates.find((t) => t.id === selectedTermsTemplateId);
    if (!chosenTemplate) {
      setTermsValidationError('Selected template could not be found. Please choose a template.');
      return;
    }

    convertQuoteToSalesInvoice(previewingQuote.id, {
      items: overrideItems,
      additionalCharges: overrideCharges,
      invoiceDate: overrideInvoiceDate,
      selectedTerms: chosenTemplate,
      terms: chosenTemplate.terms,
    });
    alert(`Success! Quotation #${previewingQuote.id} has been converted into an official Sales Invoice with selected terms: "${chosenTemplate.name}".`);
    setPreviewingQuote(null);
    setSelectedTermsTemplateId(null);
    setTermsValidationError('');
  };

  // Download PDF from Admin
  const handleDownloadInvoicePdf = async (quoteOrInvoice) => {
    const isInvoice = quoteOrInvoice.type === 'sales_invoice';
    const doc = await generateInvoicePdf({
      type: isInvoice ? 'SALES INVOICE' : 'QUOTATION',
      documentNumber:
        quoteOrInvoice.invoiceNumber || quoteOrInvoice.quoteNumber || quoteOrInvoice.id,
      date: quoteOrInvoice.invoiceDate || quoteOrInvoice.date,
      customerName: quoteOrInvoice.customerName,
      contactNumber: quoteOrInvoice.contactNumber,
      customerDetails: quoteOrInvoice.customerDetails,
      items: quoteOrInvoice.items,
      additionalCharges: quoteOrInvoice.additionalCharges || [],
      subtotal: quoteOrInvoice.subtotal,
      vat: quoteOrInvoice.vat,
      grandTotal: quoteOrInvoice.grandTotal,
      companySettings,
      bankAccounts,
      terms: quoteOrInvoice.selectedTerms?.terms || quoteOrInvoice.terms || null,
    });
    doc.save(`Delitrade_${isInvoice ? 'Sales_Invoice' : 'Quotation'}_${quoteOrInvoice.id}.pdf`);
  };

  // -------------------------------------------------------------
  // If NOT Logged In: Dedicated Standalone Admin Login View (No Header / No Nav)
  // -------------------------------------------------------------
  if (!isAdminLoggedIn) {
    return (
      <div className="min-h-screen w-full bg-[#07090E] flex flex-col items-center justify-center px-4 py-12 relative overflow-hidden select-none">
        {/* Subtle background glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-[#FED430]/5 rounded-full blur-3xl pointer-events-none" />

        <div className="w-full max-w-md bg-[#0F1420] border border-[#26334D] rounded-2xl p-7 sm:p-9 shadow-2xl shadow-black relative z-10 space-y-6">
          <div className="text-center space-y-2">
            <div className="w-14 h-14 rounded-2xl bg-[#FED430] text-black flex items-center justify-center mx-auto shadow-lg shadow-[#FED430]/20">
              <Lock className="w-7 h-7" />
            </div>
            <h1 className="font-oswald text-2xl font-black text-white tracking-wider uppercase pt-1">
              ADMINISTRATOR LOGIN
            </h1>
            <p className="text-slate-400 text-xs">
              Delitrade Commercial Gym Equipment & Warehouse Management
            </p>
          </div>

          {loginError && (
            <div className="p-3 rounded-lg bg-red-500/15 border border-red-500/30 text-red-400 text-xs flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 flex-shrink-0" />
              <span>{loginError}</span>
            </div>
          )}

          <form onSubmit={handleLoginSubmit} className="space-y-4 text-xs">
            <div>
              <label className="text-slate-300 font-bold block mb-1">
                Admin Username
              </label>
              <input
                type="text"
                required
                value={loginUsername}
                onChange={(e) => setLoginUsername(e.target.value)}
                placeholder="Enter username"
                className="w-full bg-[#141A26] border border-[#26334D] rounded-lg px-3.5 py-2.5 text-white focus:outline-none focus:border-[#FED430] text-sm"
              />
            </div>

            <div>
              <label className="text-slate-300 font-bold block mb-1">
                Admin Password
              </label>
              <input
                type="password"
                required
                value={loginPassword}
                onChange={(e) => setLoginPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full bg-[#141A26] border border-[#26334D] rounded-lg px-3.5 py-2.5 text-white focus:outline-none focus:border-[#FED430] text-sm"
              />
            </div>

            <button
              type="submit"
              className="w-full py-3.5 rounded-lg bg-[#FED430] text-black font-black uppercase tracking-wider hover:bg-[#e5be2b] shadow-lg shadow-[#FED430]/20 transition-all text-xs active:scale-98"
            >
              Sign In to Admin Portal
            </button>
          </form>

          <div className="pt-2 border-t border-[#1E2839] flex items-center justify-between text-xs text-slate-400">
            <button
              onClick={() => navigateToStorefront('products')}
              className="flex items-center gap-1.5 text-slate-400 hover:text-[#FED430] transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Return to Storefront</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // -------------------------------------------------------------
  // Filtered Data
  // -------------------------------------------------------------
  const filteredQuotes = quotesRecords.filter((q) => {
    const matchesFilter =
      quoteFilter === 'ALL' ? true : q.type === quoteFilter;
    const matchesSearch =
      quoteSearch.trim() === '' ||
      q.customerName.toLowerCase().includes(quoteSearch.toLowerCase()) ||
      q.id.toLowerCase().includes(quoteSearch.toLowerCase()) ||
      (q.invoiceNumber && q.invoiceNumber.toLowerCase().includes(quoteSearch.toLowerCase())) ||
      q.contactNumber.includes(quoteSearch);
    return matchesFilter && matchesSearch;
  });

  const filteredProducts = products.filter((p) => {
    const matchesCategory =
      prodCategoryFilter === 'ALL' ? true : p.category === prodCategoryFilter;
    const matchesSearch =
      prodSearch.trim() === '' ||
      p.name.toLowerCase().includes(prodSearch.toLowerCase()) ||
      p.code.toLowerCase().includes(prodSearch.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const totalProdPages = Math.max(1, Math.ceil(filteredProducts.length / prodPerPage));
  const validProdPage = Math.min(prodPage, totalProdPages);
  const startProdIndex = (validProdPage - 1) * prodPerPage;
  const paginatedAdminProducts = filteredProducts.slice(
    startProdIndex,
    startProdIndex + prodPerPage
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6 animate-fadeIn">
      {/* Admin Top Navigation & Header */}
      <div className="p-4 sm:p-5 rounded-2xl bg-[#0F1420] border border-[#26334D] flex flex-wrap items-center justify-between gap-4 shadow-xl">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#FED430] flex items-center justify-center text-black font-black shadow-md shadow-[#FED430]/20">
            <Lock className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-oswald text-xl sm:text-2xl font-black text-white tracking-wider leading-none">
                DELITRADE ADMIN DASHBOARD
              </h1>
            </div>
            <p className="text-slate-400 text-xs mt-1">
              Commercial Operations • Quotes, Sales Invoices, Machinery Catalog & Stock
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          <button
            onClick={() => navigateToStorefront('products')}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-[#141A26] border border-[#26334D] text-xs font-bold text-slate-300 hover:text-white"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Storefront</span>
          </button>

          <button
            onClick={adminLogout}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-red-500/15 border border-red-500/30 text-xs font-bold text-red-400 hover:bg-red-500/25"
          >
            <LogOut className="w-4 h-4" />
            <span>Logout</span>
          </button>
        </div>
      </div>

      {/* Admin Tabs */}
      <div className="flex items-center gap-2 border-b border-[#1E2839] pb-3 overflow-x-auto no-scrollbar sm:flex-wrap">
        <button
          onClick={() => setActiveTab('quotes')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all ${
            activeTab === 'quotes'
              ? 'bg-[#FED430] text-black shadow-md shadow-[#FED430]/20'
              : 'bg-[#0F1420] text-slate-300 border border-[#1E2839] hover:bg-[#141A26] hover:text-white'
          }`}
        >
          <Receipt className="w-4 h-4" />
          <span>Created Quotes & Invoices ({quotesRecords.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('products')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all ${
            activeTab === 'products'
              ? 'bg-[#FED430] text-black shadow-md shadow-[#FED430]/20'
              : 'bg-[#0F1420] text-slate-300 border border-[#1E2839] hover:bg-[#141A26] hover:text-white'
          }`}
        >
          <Package className="w-4 h-4" />
          <span>Products & Stock ({products.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('branding')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all ${
            activeTab === 'branding'
              ? 'bg-[#FED430] text-black shadow-md shadow-[#FED430]/20'
              : 'bg-[#0F1420] text-slate-300 border border-[#1E2839] hover:bg-[#141A26] hover:text-white'
          }`}
        >
          <Building className="w-4 h-4" />
          <span>Edit Logo & Brand Info</span>
        </button>

        <button
          onClick={() => setActiveTab('banks')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all ${
            activeTab === 'banks'
              ? 'bg-[#FED430] text-black shadow-md shadow-[#FED430]/20'
              : 'bg-[#0F1420] text-slate-300 border border-[#1E2839] hover:bg-[#141A26] hover:text-white'
          }`}
        >
          <CreditCard className="w-4 h-4" />
          <span>Bank Details ({bankAccounts.length})</span>
        </button>
      </div>

      {/* ========================================================= */}
      {/* TAB 1: CREATED QUOTES & INVOICES RECORDS                  */}
      {/* ========================================================= */}
      {activeTab === 'quotes' && (
        <div className="space-y-4">
          {/* Quotes KPI Summary */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-3">
            <div className="p-4 rounded-xl bg-[#0F1420] border border-[#1E2839]">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">
                Total Quotes Logged
              </span>
              <span className="font-oswald text-2xl font-black text-white">
                {quotesRecords.length}
              </span>
            </div>
            <div className="p-4 rounded-xl bg-[#0F1420] border border-[#1E2839]">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">
                Converted to Sales Invoices
              </span>
              <span className="font-oswald text-2xl font-black text-emerald-400">
                {quotesRecords.filter((q) => q.type === 'sales_invoice').length}
              </span>
            </div>
            <div className="p-4 rounded-xl bg-[#0F1420] border border-[#1E2839]">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">
                Pending Quotations
              </span>
              <span className="font-oswald text-2xl font-black text-amber-400">
                {quotesRecords.filter((q) => q.type !== 'sales_invoice').length}
              </span>
            </div>
            <div className="p-4 rounded-xl bg-[#0F1420] border border-[#1E2839]">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">
                Total Pipeline Value (AED)
              </span>
              <span className="font-oswald text-2xl font-black text-[#FED430]">
                AED{' '}
                {formatCurrency(
                  quotesRecords.reduce((sum, q) => sum + (q.grandTotal || 0), 0)
                )}
              </span>
            </div>
          </div>

          {/* Search & Filters */}
          <div className="p-3 rounded-xl bg-[#0F1420] border border-[#1E2839] flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 sm:gap-3 text-xs">
            <div className="flex items-center gap-2 flex-1 w-full sm:w-auto">
              <Search className="w-4 h-4 text-slate-400 ml-1 flex-shrink-0" />
              <input
                type="text"
                value={quoteSearch}
                onChange={(e) => setQuoteSearch(e.target.value)}
                placeholder="Search quotes by client, quote #, invoice #, phone..."
                className="w-full bg-[#141A26] border border-[#26334D] rounded-lg px-3 py-1.5 text-white focus:outline-none focus:border-[#FED430]"
              />
            </div>

            <div className="flex flex-wrap items-center gap-1.5">
              <span className="text-slate-400 font-bold">Type:</span>
              <button
                onClick={() => setQuoteFilter('ALL')}
                className={`px-2.5 py-1 rounded text-xs font-bold ${
                  quoteFilter === 'ALL'
                    ? 'bg-[#FED430] text-black'
                    : 'bg-[#141A26] text-slate-300'
                }`}
              >
                All
              </button>
              <button
                onClick={() => setQuoteFilter('quotation')}
                className={`px-2.5 py-1 rounded text-xs font-bold ${
                  quoteFilter === 'quotation'
                    ? 'bg-amber-400 text-black'
                    : 'bg-[#141A26] text-slate-300'
                }`}
              >
                Quotations Only
              </button>
              <button
                onClick={() => setQuoteFilter('sales_invoice')}
                className={`px-2.5 py-1 rounded text-xs font-bold ${
                  quoteFilter === 'sales_invoice'
                    ? 'bg-emerald-500 text-black'
                    : 'bg-[#141A26] text-slate-300'
                }`}
              >
                Sales Invoices
              </button>
            </div>
          </div>

          {/* Mobile Quotes & Invoices Cards (sm:hidden) */}
          <div className="sm:hidden space-y-3">
            {filteredQuotes.length === 0 ? (
              <div className="p-6 rounded-xl bg-[#0F1420] border border-[#1E2839] text-center text-slate-400 text-xs">
                No quotation or sales invoice records found.
              </div>
            ) : (
              filteredQuotes.map((rec) => {
                const isInvoice = rec.type === 'sales_invoice';
                return (
                  <div
                    key={rec.id}
                    className="p-3.5 rounded-xl bg-[#0F1420] border border-[#1E2839] space-y-2.5 shadow-lg"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="font-mono font-bold text-white text-xs">
                          {isInvoice ? rec.invoiceNumber || rec.id : rec.id}
                        </div>
                        <span
                          className={`inline-block px-2 py-0.5 rounded text-[9.5px] font-bold uppercase mt-1 ${
                            isInvoice
                              ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                              : 'bg-amber-500/20 text-amber-400 border border-amber-500/40'
                          }`}
                        >
                          {isInvoice ? 'SALES INVOICE' : 'QUOTATION'}
                        </span>
                      </div>
                      <div className="text-right">
                        <div className="font-mono font-black text-[#FED430] text-sm">
                          AED {formatCurrency(rec.grandTotal)}
                        </div>
                        <span className="text-[9.5px] text-slate-400 block">(Inc. 5% VAT)</span>
                      </div>
                    </div>

                    <div className="p-2.5 rounded-lg bg-[#141A26] border border-[#26334D] text-xs space-y-1">
                      <div className="text-white font-bold">{rec.customerName}</div>
                      <div className="text-slate-400 text-[11px] truncate">
                        {rec.contactNumber} • {rec.customerDetails}
                      </div>
                      <div className="text-slate-400 text-[10.5px] pt-1 border-t border-[#1E2839] flex justify-between">
                        <span>Date: {isInvoice && rec.invoiceDate ? rec.invoiceDate : rec.date}</span>
                        <span>{rec.items?.length || 0} machines {rec.additionalCharges?.length > 0 ? `+${rec.additionalCharges.length} charges` : ''}</span>
                      </div>
                      {isInvoice && rec.selectedTerms && (
                        <div className="pt-1 flex items-center gap-1 text-[10.5px] text-amber-300">
                          <FileText className="w-3 h-3 text-[#FED430] flex-shrink-0" />
                          <span className="truncate">{rec.selectedTerms.name}</span>
                        </div>
                      )}
                    </div>

                    <div className="flex items-center gap-2 pt-1">
                      {!isInvoice ? (
                        <button
                          onClick={() => openInvoicePreview(rec)}
                          className="flex-1 py-2 px-3 rounded-lg bg-[#FED430] hover:bg-[#e5be2b] text-black font-black text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 shadow-md shadow-[#FED430]/20 active:scale-95"
                        >
                          <Percent className="w-3.5 h-3.5" />
                          <span>Convert to Invoice</span>
                        </button>
                      ) : (
                        <div className="flex-1 py-2 px-3 rounded-lg bg-emerald-900/30 border border-emerald-500/30 text-emerald-300 text-xs font-bold flex items-center justify-center gap-1.5">
                          <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
                          <span>Invoice Active</span>
                        </div>
                      )}

                      <button
                        onClick={() => handleDownloadInvoicePdf(rec)}
                        className="p-2 rounded-lg bg-[#1E2839] hover:bg-blue-600 text-slate-200 hover:text-white"
                        title="Download PDF"
                      >
                        <Download className="w-4 h-4" />
                      </button>

                      <button
                        onClick={() => {
                          if (confirm(`Delete record ${rec.id}?`)) {
                            deleteQuoteRecord(rec.id);
                          }
                        }}
                        className="p-2 rounded-lg bg-[#1E2839] hover:bg-red-600 text-slate-400 hover:text-white"
                        title="Delete Record"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Records Table (Desktop / Tablet) */}
          <div className="hidden sm:block overflow-x-auto rounded-xl border border-[#1E2839] bg-[#0F1420]">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-[#0A0D14] text-slate-400 font-bold uppercase border-b border-[#1E2839] text-[11px]">
                  <th className="p-3">Doc ID / Status</th>
                  <th className="p-3">Customer & Contact</th>
                  <th className="p-3">Date</th>
                  <th className="p-3">Selected Items</th>
                  <th className="p-3 text-right">Grand Total (AED)</th>
                  <th className="p-3 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1E2839]">
                {filteredQuotes.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-slate-400">
                      No quotation or sales invoice records found matching your criteria.
                    </td>
                  </tr>
                ) : (
                  filteredQuotes.map((rec) => {
                    const isInvoice = rec.type === 'sales_invoice';
                    return (
                      <tr key={rec.id} className="hover:bg-[#141A26] transition-colors">
                        {/* Doc ID & Type */}
                        <td className="p-3">
                          <div className="font-mono font-bold text-white text-xs">
                            {isInvoice ? rec.invoiceNumber || rec.id : rec.id}
                          </div>
                          <span
                            className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase mt-1 ${
                              isInvoice
                                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                                : 'bg-amber-500/20 text-amber-400 border border-amber-500/40'
                            }`}
                          >
                            {isInvoice ? 'SALES INVOICE' : 'QUOTATION'}
                          </span>
                          {isInvoice && rec.selectedTerms && (
                            <div className="mt-1 flex items-center gap-1 max-w-[190px]" title={rec.selectedTerms.name}>
                              <FileText className="w-3 h-3 text-[#FED430] flex-shrink-0" />
                              <span className="text-[10px] text-amber-300 font-semibold truncate">
                                {rec.selectedTerms.name}
                              </span>
                            </div>
                          )}
                        </td>

                        {/* Customer */}
                        <td className="p-3">
                          <div className="font-bold text-white text-xs">
                            {rec.customerName}
                          </div>
                          <div className="text-slate-400 text-[11px]">
                            {rec.contactNumber} • {rec.customerDetails}
                          </div>
                        </td>

                        {/* Date */}
                        <td className="p-3 text-slate-300 font-medium">
                          {isInvoice && rec.invoiceDate ? (
                            <div>
                              <span>{rec.invoiceDate}</span>
                              <span className="block text-[10px] text-slate-500">
                                Quote: {rec.date}
                              </span>
                            </div>
                          ) : (
                            rec.date
                          )}
                        </td>

                        {/* Items */}
                        <td className="p-3 text-slate-300">
                          <span className="font-bold text-white">
                            {rec.items?.length || 0} machines
                          </span>
                          {rec.additionalCharges?.length > 0 && (
                            <span className="text-[10px] text-amber-400 block">
                              +{rec.additionalCharges.length} additional charges
                            </span>
                          )}
                        </td>

                        {/* Grand Total */}
                        <td className="p-3 text-right">
                          <div className="font-mono font-black text-white text-sm">
                            AED {formatCurrency(rec.grandTotal)}
                          </div>
                          <span className="text-[10px] text-slate-400">
                            (Inc. 5% VAT)
                          </span>
                        </td>

                        {/* Actions */}
                        <td className="p-3 text-center">
                          <div className="flex items-center justify-center gap-1.5">
                            {/* Convert to Sales Invoice button */}
                            {!isInvoice ? (
                              <button
                                onClick={() => openInvoicePreview(rec)}
                                className="px-2.5 py-1 rounded bg-[#FED430] hover:bg-[#e5be2b] text-black font-black text-[11px] uppercase tracking-wider flex items-center gap-1 shadow-sm"
                                title="Preview bill, modify price, and convert to Sales Invoice"
                              >
                                <Percent className="w-3.5 h-3.5" />
                                <span>Convert to Sales Invoice</span>
                              </button>
                            ) : (
                              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-900/40 text-emerald-300 flex items-center gap-1">
                                <CheckCircle className="w-3 h-3 text-emerald-400" />
                                <span>Invoice Active</span>
                              </span>
                            )}

                            {/* Download PDF */}
                            <button
                              onClick={() => handleDownloadInvoicePdf(rec)}
                              className="p-1.5 rounded bg-[#1E2839] hover:bg-blue-600 text-slate-200 hover:text-white"
                              title="Download PDF"
                            >
                              <Download className="w-3.5 h-3.5" />
                            </button>

                            {/* Delete Quote */}
                            <button
                              onClick={() => {
                                if (confirm(`Delete record ${rec.id}?`)) {
                                  deleteQuoteRecord(rec.id);
                                }
                              }}
                              className="p-1.5 rounded bg-[#1E2839] hover:bg-red-600 text-slate-400 hover:text-white"
                              title="Delete Record"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* TAB 2: PRODUCTS CATALOG & STOCK QTY (CRUD)                */}
      {/* ========================================================= */}
      {activeTab === 'products' && (
        <div className="space-y-4">
          <div className="p-3.5 sm:p-4 rounded-xl bg-[#0F1420] border border-[#1E2839] flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 sm:gap-3 text-xs">
            <div className="flex items-center gap-2.5 flex-1 w-full sm:w-auto">
              <Search className="w-4 h-4 text-slate-400 flex-shrink-0 ml-1" />
              <input
                type="text"
                value={prodSearch}
                onChange={(e) => setProdSearch(e.target.value)}
                placeholder="Search products by model code or equipment name..."
                className="w-full bg-[#141A26] border border-[#26334D] rounded-lg px-3 py-1.5 text-white focus:outline-none focus:border-[#FED430]"
              />
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-start">
              <select
                value={prodCategoryFilter}
                onChange={(e) => setProdCategoryFilter(e.target.value)}
                className="bg-[#141A26] border border-[#26334D] rounded-lg px-3 py-1.5 text-white flex-1 sm:flex-initial"
              >
                <option value="ALL">All Categories</option>
                <option value="Plate Loaded">Plate Loaded</option>
                <option value="Strength & Cables">Strength & Cables</option>
                <option value="Cardio">Cardio</option>
                <option value="Free Weights & Benches">Free Weights & Benches</option>
                <option value="Core & Specialty">Core & Specialty</option>
              </select>

              <button
                onClick={() => {
                  setEditingProduct(null);
                  setIsAddProductOpen(true);
                }}
                className="px-3.5 py-1.5 sm:py-2 rounded-lg bg-[#FED430] text-black font-black uppercase text-xs flex items-center gap-1.5 hover:bg-[#e5be2b] whitespace-nowrap flex-shrink-0"
              >
                <Plus className="w-4 h-4" />
                <span>Add Product</span>
              </button>
            </div>
          </div>

          {/* Mobile Products Cards (sm:hidden) */}
          <div className="sm:hidden space-y-3">
            {paginatedAdminProducts.map((p) => (
              <div
                key={p.code}
                className="p-3.5 rounded-xl bg-[#0F1420] border border-[#1E2839] space-y-3 shadow-lg"
              >
                <div className="flex items-start gap-3">
                  <div className="w-14 h-14 bg-white rounded-lg p-1 border border-slate-700 flex items-center justify-center flex-shrink-0">
                    <img
                      src={p.imagePath}
                      alt={p.name}
                      className="max-h-full max-w-full object-contain"
                      onError={(e) => (e.target.style.display = 'none')}
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="font-mono font-bold text-[#FED430] text-xs">
                        #{p.code}
                      </span>
                      <span className="text-[9.5px] px-1.5 py-0.5 rounded bg-[#141A26] border border-[#26334D] text-slate-300 uppercase">
                        {p.category}
                      </span>
                    </div>
                    <h4 className="font-bold text-white text-xs mt-1 truncate">{p.name}</h4>
                    <div className="font-mono font-bold text-white text-xs mt-0.5">
                      AED {formatCurrency(p.price)}
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-[#1E2839]">
                  <div className="flex items-center gap-1 bg-[#141A26] border border-[#26334D] rounded-lg p-1">
                    <button
                      onClick={() => updateProductStock(p.code, (p.stockQty || 0) - 1)}
                      className="w-7 h-7 rounded bg-[#1E2839] hover:bg-red-500 hover:text-white text-slate-200 flex items-center justify-center font-bold"
                    >
                      -
                    </button>
                    <span className="w-10 text-center font-mono font-bold text-xs text-white">
                      {p.stockQty !== undefined ? p.stockQty : 10}
                    </span>
                    <button
                      onClick={() => updateProductStock(p.code, (p.stockQty || 0) + 1)}
                      className="w-7 h-7 rounded bg-[#FED430] text-black hover:bg-[#e5be2b] flex items-center justify-center font-bold"
                    >
                      +
                    </button>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        setEditingProduct({ ...p });
                        setIsAddProductOpen(true);
                      }}
                      className="p-2 rounded-lg bg-[#1E2839] hover:bg-amber-500 hover:text-black text-slate-300"
                      title="Edit Product"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>

                    <button
                      onClick={() => {
                        if (confirm(`Delete product ${p.name} (${p.code})?`)) {
                          deleteProduct(p.code);
                        }
                      }}
                      className="p-2 rounded-lg bg-[#1E2839] hover:bg-red-600 text-slate-400 hover:text-white"
                      title="Delete Product"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Products Table (Desktop / Tablet) */}
          <div className="hidden sm:block overflow-x-auto rounded-xl border border-[#1E2839] bg-[#0F1420]">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-[#0A0D14] text-slate-400 font-bold uppercase border-b border-[#1E2839] text-[11px]">
                  <th className="p-3 w-16">Image</th>
                  <th className="p-3">Code / Category</th>
                  <th className="p-3">Product Name & Specifications</th>
                  <th className="p-3 text-right">Unit Price (AED)</th>
                  <th className="p-3 text-center w-36">Warehouse Stock (Qty)</th>
                  <th className="p-3 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1E2839]">
                {paginatedAdminProducts.map((p) => (
                  <tr key={p.code} className="hover:bg-[#141A26] transition-colors">
                    <td className="p-3">
                      <div className="w-12 h-12 bg-white rounded p-1 border border-slate-700 flex items-center justify-center">
                        <img
                          src={p.imagePath}
                          alt={p.name}
                          className="max-h-full max-w-full object-contain"
                          onError={(e) => (e.target.style.display = 'none')}
                        />
                      </div>
                    </td>

                    <td className="p-3">
                      <span className="font-mono font-bold text-[#FED430] text-xs block">
                        #{p.code}
                      </span>
                      <span className="text-[10px] text-slate-400 uppercase font-semibold">
                        {p.category}
                      </span>
                    </td>

                    <td className="p-3">
                      <div className="font-bold text-white text-xs">
                        {p.name}
                      </div>
                      <div className="text-slate-400 text-[11px] line-clamp-1">
                        {p.description}
                      </div>
                    </td>

                    <td className="p-3 text-right font-mono font-bold text-white">
                      AED {formatCurrency(p.price)}
                    </td>

                    {/* Stock Qty Modifier */}
                    <td className="p-3 text-center">
                      <div className="inline-flex items-center gap-1.5 bg-[#141A26] border border-[#26334D] rounded-lg p-1">
                        <button
                          onClick={() => updateProductStock(p.code, (p.stockQty || 0) - 1)}
                          className="w-6 h-6 rounded bg-[#1E2839] hover:bg-red-500 hover:text-white text-slate-200 flex items-center justify-center font-bold"
                        >
                          -
                        </button>
                        <input
                          type="number"
                          value={p.stockQty !== undefined ? p.stockQty : 10}
                          onChange={(e) => updateProductStock(p.code, e.target.value)}
                          className="w-12 text-center bg-transparent text-white font-mono font-bold text-xs focus:outline-none"
                        />
                        <button
                          onClick={() => updateProductStock(p.code, (p.stockQty || 0) + 1)}
                          className="w-6 h-6 rounded bg-[#FED430] text-black hover:bg-[#e5be2b] flex items-center justify-center font-bold"
                        >
                          +
                        </button>
                      </div>
                    </td>

                    {/* Actions */}
                    <td className="p-3 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          onClick={() => {
                            setEditingProduct({ ...p });
                            setIsAddProductOpen(true);
                          }}
                          className="p-1.5 rounded bg-[#1E2839] hover:bg-amber-500 hover:text-black text-slate-300"
                          title="Edit Product"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>

                        <button
                          onClick={() => {
                            if (confirm(`Delete product ${p.name} (${p.code})?`)) {
                              deleteProduct(p.code);
                            }
                          }}
                          className="p-1.5 rounded bg-[#1E2839] hover:bg-red-600 text-slate-400 hover:text-white"
                          title="Delete Product"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Products Pagination Bar */}
          <div className="pt-4 border-t border-[#1E2839]">
            <Pagination
              currentPage={validProdPage}
              totalItems={filteredProducts.length}
              itemsPerPage={prodPerPage}
              onPageChange={(page) => setProdPage(page)}
              onItemsPerPageChange={(limit) => setProdPerPage(limit)}
              perPageOptions={[10, 20, 50]}
              itemLabel="equipment products"
            />
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* TAB 3: EDIT LOGO & BRANDING SETTINGS                      */}
      {/* ========================================================= */}
      {activeTab === 'branding' && (
        <div className="max-w-3xl mx-auto p-6 rounded-2xl bg-[#0F1420] border border-[#26334D] space-y-6">
          <div>
            <h2 className="font-oswald text-xl font-bold text-white uppercase tracking-wider">
              EDIT COMPANY LOGO & CORPORATE BRANDING
            </h2>
            <p className="text-slate-400 text-xs mt-1">
              Changes reflect immediately on storefront headers, footers, PDF quotations, and commercial tax invoices.
            </p>
          </div>

          {/* Logo Customizer */}
          <div className="p-4 rounded-xl bg-[#141A26] border border-[#26334D] space-y-4">
            <label className="text-xs font-bold text-[#FED430] uppercase tracking-wider block">
              Logo Configuration
            </label>

            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4">
              <label className="flex items-center gap-2 text-xs text-white cursor-pointer">
                <input
                  type="radio"
                  name="logoType"
                  value="default"
                  checked={companySettings.logoType === 'default'}
                  onChange={() => setCompanySettings((prev) => ({ ...prev, logoType: 'default' }))}
                  className="accent-[#FED430]"
                />
                <span>Default Stylized Typography Logo (DELITRADE)</span>
              </label>

              <label className="flex items-center gap-2 text-xs text-white cursor-pointer">
                <input
                  type="radio"
                  name="logoType"
                  value="custom"
                  checked={companySettings.logoType === 'custom'}
                  onChange={() => setCompanySettings((prev) => ({ ...prev, logoType: 'custom' }))}
                  className="accent-[#FED430]"
                />
                <span>Custom Image Logo</span>
              </label>
            </div>

            {/* Custom Logo Upload / URL */}
            {companySettings.logoType === 'custom' && (
              <div className="space-y-3 pt-2">
                <div>
                  <label className="text-[11px] font-bold text-slate-300 block mb-1">
                    Upload Logo File (PNG / JPG / SVG)
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        const reader = new FileReader();
                        reader.onload = (ev) => {
                          setCompanySettings((prev) => ({
                            ...prev,
                            customLogoUrl: ev.target.result,
                          }));
                        };
                        reader.readAsDataURL(file);
                      }
                    }}
                    className="w-full text-xs text-slate-300 file:mr-3 file:py-1.5 file:px-3 file:rounded-md file:border-0 file:text-xs file:font-bold file:bg-[#FED430] file:text-black cursor-pointer"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-300 block mb-1">
                    Or Enter Image URL
                  </label>
                  <input
                    type="text"
                    value={companySettings.customLogoUrl || ''}
                    onChange={(e) =>
                      setCompanySettings((prev) => ({
                        ...prev,
                        customLogoUrl: e.target.value,
                      }))
                    }
                    placeholder="https://example.com/logo.png"
                    className="w-full bg-[#0F1420] border border-[#26334D] rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-[#FED430]"
                  />
                </div>

                {/* Preview */}
                {companySettings.customLogoUrl && (
                  <div className="p-3 bg-[#0A0D14] rounded-lg border border-[#26334D] flex items-center gap-3">
                    <span className="text-[11px] text-slate-400">Current Logo Preview:</span>
                    <img
                      src={companySettings.customLogoUrl}
                      alt="Logo Preview"
                      className="h-10 w-auto object-contain bg-white/10 p-1 rounded"
                    />
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Company Text Details */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="text-slate-300 font-bold block mb-1">Company Display Name</label>
              <input
                type="text"
                value={companySettings.companyName || ''}
                onChange={(e) =>
                  setCompanySettings((prev) => ({ ...prev, companyName: e.target.value }))
                }
                className="w-full bg-[#141A26] border border-[#26334D] rounded-lg px-3 py-2 text-white focus:outline-none focus:border-[#FED430]"
              />
            </div>

            <div>
              <label className="text-slate-300 font-bold block mb-1">Header Brand Slogan</label>
              <input
                type="text"
                value={companySettings.brandHeader || ''}
                onChange={(e) =>
                  setCompanySettings((prev) => ({ ...prev, brandHeader: e.target.value }))
                }
                className="w-full bg-[#141A26] border border-[#26334D] rounded-lg px-3 py-2 text-white focus:outline-none focus:border-[#FED430]"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="text-slate-300 font-bold block mb-1">Legal Registered Name (UAE)</label>
              <input
                type="text"
                value={companySettings.legalName || ''}
                onChange={(e) =>
                  setCompanySettings((prev) => ({ ...prev, legalName: e.target.value }))
                }
                className="w-full bg-[#141A26] border border-[#26334D] rounded-lg px-3 py-2 text-white focus:outline-none focus:border-[#FED430]"
              />
            </div>

            <div>
              <label className="text-slate-300 font-bold block mb-1">FTA TRN Number</label>
              <input
                type="text"
                value={companySettings.trn || ''}
                onChange={(e) =>
                  setCompanySettings((prev) => ({ ...prev, trn: e.target.value }))
                }
                className="w-full bg-[#141A26] border border-[#26334D] rounded-lg px-3 py-2 text-white font-mono focus:outline-none focus:border-[#FED430]"
              />
            </div>

            <div>
              <label className="text-slate-300 font-bold block mb-1">Contact Phone / Hotline</label>
              <input
                type="text"
                value={companySettings.phone || ''}
                onChange={(e) =>
                  setCompanySettings((prev) => ({ ...prev, phone: e.target.value }))
                }
                className="w-full bg-[#141A26] border border-[#26334D] rounded-lg px-3 py-2 text-white focus:outline-none focus:border-[#FED430]"
              />
            </div>

            <div>
              <label className="text-slate-300 font-bold block mb-1">Official Website</label>
              <input
                type="text"
                value={companySettings.website || ''}
                onChange={(e) =>
                  setCompanySettings((prev) => ({ ...prev, website: e.target.value }))
                }
                className="w-full bg-[#141A26] border border-[#26334D] rounded-lg px-3 py-2 text-white focus:outline-none focus:border-[#FED430]"
              />
            </div>

            <div>
              <label className="text-slate-300 font-bold block mb-1">Official Email</label>
              <input
                type="text"
                value={companySettings.email || ''}
                onChange={(e) =>
                  setCompanySettings((prev) => ({ ...prev, email: e.target.value }))
                }
                className="w-full bg-[#141A26] border border-[#26334D] rounded-lg px-3 py-2 text-white focus:outline-none focus:border-[#FED430]"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="text-slate-300 font-bold block mb-1">Warehouse Location Address</label>
              <input
                type="text"
                value={companySettings.address || ''}
                onChange={(e) =>
                  setCompanySettings((prev) => ({ ...prev, address: e.target.value }))
                }
                className="w-full bg-[#141A26] border border-[#26334D] rounded-lg px-3 py-2 text-white focus:outline-none focus:border-[#FED430]"
              />
            </div>
          </div>

          <div className="pt-2">
            <button
              onClick={() => alert('Brand & Logo settings saved and persisted successfully!')}
              className="px-6 py-2.5 rounded-lg bg-[#FED430] text-black font-black uppercase text-xs hover:bg-[#e5be2b] shadow-md shadow-[#FED430]/20"
            >
              Save Branding Settings
            </button>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* TAB 4: BANK DETAILS MANAGER                               */}
      {/* ========================================================= */}
      {activeTab === 'banks' && (
        <div className="space-y-4">
          <div className="p-4 rounded-xl bg-[#0F1420] border border-[#1E2839] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div>
              <h2 className="font-oswald text-lg font-bold text-white uppercase tracking-wider">
                COMPANY BANK ACCOUNTS FOR INVOICE WIRE TRANSFERS
              </h2>
              <p className="text-slate-400 text-xs">
                These bank accounts automatically display on client Quotations and Sales Invoices for direct telegraphic transfer / wire deposits.
              </p>
            </div>

            <button
              onClick={() => {
                setEditingBank(null);
                setIsAddBankOpen(true);
              }}
              className="px-3.5 py-2 rounded-lg bg-[#FED430] text-black font-black uppercase text-xs flex items-center gap-1.5 hover:bg-[#e5be2b]"
            >
              <Plus className="w-4 h-4" />
              <span>Add Bank Account</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {bankAccounts.map((b) => (
              <div
                key={b.id}
                className="p-5 rounded-xl bg-[#0F1420] border border-[#1E2839] space-y-3 relative group"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CreditCard className="w-5 h-5 text-[#FED430]" />
                    <h3 className="font-bold text-white text-sm">{b.bankName}</h3>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => {
                        setEditingBank({ ...b });
                        setIsAddBankOpen(true);
                      }}
                      className="p-1 rounded text-slate-400 hover:text-white"
                      title="Edit Bank"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => {
                        if (confirm(`Remove bank ${b.bankName}?`)) {
                          removeBankAccount(b.id);
                        }
                      }}
                      className="p-1 rounded text-slate-400 hover:text-red-400"
                      title="Delete Bank"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <div className="space-y-1 text-xs font-mono">
                  <p className="text-slate-300">
                    <span className="text-slate-500 font-sans">Account Title:</span>{' '}
                    <strong>{b.accountTitle}</strong>
                  </p>
                  <p className="text-slate-300">
                    <span className="text-slate-500 font-sans">Account No:</span>{' '}
                    <strong>{b.accountNumber}</strong>
                  </p>
                  <p className="text-[#FED430]">
                    <span className="text-slate-500 font-sans">IBAN:</span>{' '}
                    <strong>{b.iban}</strong>
                  </p>
                  {b.swift && (
                    <p className="text-slate-400">
                      <span className="text-slate-500 font-sans">SWIFT:</span> {b.swift}
                    </p>
                  )}
                  {b.branch && (
                    <p className="text-slate-400">
                      <span className="text-slate-500 font-sans">Branch:</span> {b.branch}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL: SALES INVOICE PREVIEW & PRICE OVERRIDE             */}
      {/* (Requirement: before creating sales invoice need to       */}
      {/* preview the bill and manually admins only able to modify  */}
      {/* the price, plus add additional charge button)            */}
      {/* ========================================================= */}
      {previewingQuote && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/80 backdrop-blur-sm p-2 sm:p-6 flex items-center justify-center">
          <div className="w-full max-w-5xl bg-[#0F1420] border-2 border-[#FED430] rounded-xl sm:rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[96vh] sm:max-h-[92vh]">
            {/* Modal Header */}
            <div className="p-4 sm:p-5 bg-[#0A0D14] border-b border-[#1E2839] flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-lg bg-[#FED430] text-black font-black">
                  <Percent className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-oswald text-lg sm:text-xl font-black text-white tracking-wide uppercase">
                    SALES INVOICE PREVIEW & ADMIN PRICE OVERRIDE
                  </h3>
                  <p className="text-slate-400 text-xs">
                    Converting #{previewingQuote.id} to Sales Invoice • Only Administrators can manually modify unit prices & add custom charges.
                  </p>
                </div>
              </div>

              <button
                onClick={() => setPreviewingQuote(null)}
                className="text-slate-400 hover:text-white p-1"
              >
                ✕
              </button>
            </div>

            {/* Modal Scrollable Body */}
            <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6">
              {/* Customer & Invoice Metadata */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-4 rounded-xl bg-[#141A26] border border-[#26334D] text-xs">
                <div>
                  <span className="text-slate-400 block font-bold">Client / Gym Name</span>
                  <span className="text-white font-bold text-sm">
                    {previewingQuote.customerName}
                  </span>
                  <span className="text-slate-400 block text-[11px]">
                    {previewingQuote.contactNumber}
                  </span>
                </div>

                <div>
                  <span className="text-slate-400 block font-bold">Delivery Address</span>
                  <span className="text-slate-200">
                    {previewingQuote.customerDetails}
                  </span>
                </div>

                <div>
                  <span className="text-slate-400 block font-bold">Sales Invoice Date</span>
                  <input
                    type="text"
                    value={overrideInvoiceDate}
                    onChange={(e) => setOverrideInvoiceDate(e.target.value)}
                    className="w-full bg-[#0F1420] border border-[#26334D] rounded px-2.5 py-1 text-white font-semibold focus:outline-none focus:border-[#FED430]"
                  />
                </div>
              </div>

              {/* Line Items Table with Admin Editable Price */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="font-oswald text-sm font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-[#FED430]" />
                    <span>EQUIPMENT LINE ITEMS (ADMIN PRICING CONTROL)</span>
                  </h4>
                  <span className="text-[11px] text-amber-400 font-semibold">
                    * Edit unit prices directly to give negotiated or custom package rates
                  </span>
                </div>

                {/* Mobile Item Cards for Price Overrides (sm:hidden) */}
                <div className="sm:hidden space-y-3">
                  {overrideItems.map((item, idx) => {
                    const original = Number(item.originalPrice || item.product.price);
                    const current = Number(item.unitPrice);
                    const isModified = current !== original;

                    return (
                      <div
                        key={idx}
                        className="p-3.5 rounded-xl bg-[#0A0D14] border border-[#26334D] space-y-2.5"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1 min-w-0">
                            <span className="font-mono font-bold text-xs text-[#FED430]">
                              #{idx + 1} • {item.product.code}
                            </span>
                            <h5 className="font-bold text-white text-xs mt-0.5 leading-snug truncate">
                              {item.product.name}
                            </h5>
                            <span className="text-[10px] text-slate-400 block mt-0.5">
                              {item.product.category}
                            </span>
                          </div>
                          <div className="text-right flex-shrink-0">
                            <span className="text-[10px] text-slate-400 block">Catalog</span>
                            <span className="text-xs font-mono text-slate-400 line-through">
                              AED {formatCurrency(original)}
                            </span>
                          </div>
                        </div>

                        {/* Price Override Input & Qty on Mobile */}
                        <div className="grid grid-cols-2 gap-2 pt-2 border-t border-[#1E2839]">
                          <div>
                            <label className="text-[10px] font-bold text-[#FED430] uppercase block mb-1">
                              Unit Price (AED) *
                            </label>
                            <div className="flex items-center gap-1 bg-[#141A26] border border-[#FED430] rounded-lg px-2 py-1.5">
                              <span className="text-[10px] text-[#FED430] font-bold">AED</span>
                              <input
                                type="number"
                                value={item.unitPrice}
                                onChange={(e) => handleItemPriceChange(idx, e.target.value)}
                                className="w-full text-right bg-transparent text-white font-mono font-bold text-xs focus:outline-none"
                              />
                            </div>
                            {isModified && (
                              <span className="block text-[9.5px] text-amber-400 font-bold mt-0.5">
                                {current < original
                                  ? `-${Math.round(((original - current) / original) * 100)}% Discount`
                                  : `+${Math.round(((current - original) / original) * 100)}% Override`}
                              </span>
                            )}
                          </div>

                          <div>
                            <label className="text-[10px] font-bold text-slate-300 uppercase block mb-1">
                              Quantity
                            </label>
                            <input
                              type="number"
                              min={1}
                              value={item.quantity}
                              onChange={(e) => handleItemQuantityChange(idx, e.target.value)}
                              className="w-full bg-[#141A26] border border-[#26334D] rounded-lg py-1.5 px-2 text-center text-white font-bold text-xs focus:outline-none focus:border-[#FED430]"
                            />
                          </div>
                        </div>

                        <div className="flex justify-between items-center pt-2 border-t border-[#1E2839] text-xs">
                          <span className="text-slate-400 text-[11px]">Line Total:</span>
                          <span className="font-mono font-black text-white text-sm">
                            AED {formatCurrency(item.unitPrice * item.quantity)}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Desktop Table (hidden sm:block) */}
                <div className="hidden sm:block overflow-x-auto rounded-xl border border-[#26334D] bg-[#0A0D14]">
                  <table className="w-full text-xs text-left min-w-[580px]">
                    <thead>
                      <tr className="bg-[#141A26] text-slate-400 font-bold border-b border-[#26334D] text-[11px]">
                        <th className="p-3">#</th>
                        <th className="p-3">Product Station</th>
                        <th className="p-3 text-right">Catalog Price</th>
                        <th className="p-3 text-right text-[#FED430]">
                          Admin Unit Price (AED) *
                        </th>
                        <th className="p-3 text-center">Qty</th>
                        <th className="p-3 text-right">Line Total (AED)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#1E2839]">
                      {overrideItems.map((item, idx) => {
                        const original = Number(item.originalPrice || item.product.price);
                        const current = Number(item.unitPrice);
                        const isModified = current !== original;

                        return (
                          <tr key={idx} className="hover:bg-[#141A26]/50">
                            <td className="p-3 font-bold text-slate-400">{idx + 1}</td>
                            <td className="p-3">
                              <div className="font-bold text-white text-xs">
                                {item.product.name}
                              </div>
                              <span className="font-mono text-[10px] text-slate-400">
                                #{item.product.code} • {item.product.category}
                              </span>
                            </td>
                            <td className="p-3 text-right font-mono text-slate-400 line-through">
                              AED {formatCurrency(original)}
                            </td>
                            <td className="p-3 text-right">
                              <div className="inline-flex items-center gap-1 bg-[#0F1420] border border-[#FED430] rounded-lg px-2 py-1">
                                <span className="text-[10px] text-[#FED430] font-bold">AED</span>
                                <input
                                  type="number"
                                  value={item.unitPrice}
                                  onChange={(e) => handleItemPriceChange(idx, e.target.value)}
                                  className="w-24 text-right bg-transparent text-white font-mono font-bold text-xs focus:outline-none"
                                />
                              </div>
                              {isModified && (
                                <span className="block text-[10px] text-amber-400 font-bold mt-0.5">
                                  {current < original
                                    ? `-${Math.round(((original - current) / original) * 100)}% Discount`
                                    : `+${Math.round(((current - original) / original) * 100)}% Override`}
                                </span>
                              )}
                            </td>
                            <td className="p-3 text-center">
                              <input
                                type="number"
                                min={1}
                                value={item.quantity}
                                onChange={(e) => handleItemQuantityChange(idx, e.target.value)}
                                className="w-14 text-center bg-[#0F1420] border border-[#26334D] rounded py-1 text-white font-bold"
                              />
                            </td>
                            <td className="p-3 text-right font-mono font-bold text-white">
                              AED {formatCurrency(item.unitPrice * item.quantity)}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Additional Charges Section */}
              <div className="space-y-3 p-4 rounded-xl bg-[#141A26] border border-[#26334D]">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-oswald text-xs font-bold text-white uppercase tracking-wider">
                      ADDITIONAL CHARGES (LOGISTICS, ASSEMBLY, FLOORING)
                    </h4>
                    <p className="text-[11px] text-slate-400">
                      Add any custom freight, assembly, rubber flooring, or testing surcharge.
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={handleAddPreviewCharge}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#FED430] text-black font-black text-xs uppercase hover:bg-[#e5be2b]"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>+ Add Additional Charge</span>
                  </button>
                </div>

                {overrideCharges.length === 0 ? (
                  <p className="text-xs text-slate-500 italic">
                    No additional charges added. Click "+ Add Additional Charge" above to add delivery or service fees.
                  </p>
                ) : (
                  <div className="space-y-2 pt-1">
                    {overrideCharges.map((ch) => (
                      <div
                        key={ch.id}
                        className="flex items-center gap-2 bg-[#0F1420] p-2 rounded-lg border border-[#26334D]"
                      >
                        <input
                          type="text"
                          value={ch.description}
                          onChange={(e) =>
                            handleUpdatePreviewCharge(ch.id, 'description', e.target.value)
                          }
                          placeholder="Charge Description (e.g. Delivery & Rigging across Dubai)"
                          className="flex-1 bg-[#141A26] border border-[#26334D] rounded px-3 py-1.5 text-xs text-white focus:outline-none focus:border-[#FED430]"
                        />
                        <div className="flex items-center gap-1">
                          <span className="text-xs font-bold text-[#FED430]">AED</span>
                          <input
                            type="number"
                            value={ch.amount}
                            onChange={(e) =>
                              handleUpdatePreviewCharge(ch.id, 'amount', e.target.value)
                            }
                            placeholder="500"
                            className="w-24 bg-[#141A26] border border-[#26334D] rounded px-2 py-1.5 text-xs text-white focus:outline-none focus:border-[#FED430]"
                          />
                        </div>
                        <button
                          type="button"
                          onClick={() => handleRemovePreviewCharge(ch.id)}
                          className="p-1.5 text-slate-400 hover:text-red-400"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Mandatory Terms & Conditions Template Selection */}
              <div className="space-y-4 p-4 sm:p-5 rounded-xl bg-[#141A26] border border-[#26334D]">
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#1E2839] pb-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-oswald text-sm sm:text-base font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                        <FileText className="w-4 h-4 text-[#FED430]" />
                        <span>SELECT TERMS & CONDITIONS TEMPLATE</span>
                      </h4>
                      <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider bg-red-500/20 text-red-400 border border-red-500/40">
                        MANDATORY *
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      Select 1 of the 2 commercial terms templates below for this Sales Invoice. You can edit and modify the template clauses.
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={handleResetTermsToDefaults}
                    className="text-[11px] text-slate-400 hover:text-slate-200 flex items-center gap-1.5 transition-colors px-2.5 py-1 rounded bg-[#0F1420] border border-[#26334D]"
                    title="Reset templates to factory defaults"
                  >
                    <RotateCcw className="w-3 h-3 text-slate-400" />
                    <span>Reset Defaults</span>
                  </button>
                </div>

                {/* Validation Error Alert */}
                {termsValidationError && (
                  <div className="p-3 rounded-lg bg-red-500/15 border border-red-500/40 text-red-300 text-xs flex items-center gap-2.5">
                    <AlertTriangle className="w-4 h-4 text-red-400 flex-shrink-0" />
                    <span className="font-bold">{termsValidationError}</span>
                  </div>
                )}

                {/* 2 Template Cards Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  {termsTemplates.map((template, tIdx) => {
                    const isSelected = selectedTermsTemplateId === template.id;
                    const isEditing = editingTemplateId === template.id;

                    if (isEditing && editingTemplateForm) {
                      return (
                        <div
                          key={template.id}
                          className="p-4 rounded-xl bg-[#0A0D14] border-2 border-[#FED430] space-y-3 shadow-lg shadow-[#FED430]/10"
                        >
                          <div className="flex items-center justify-between border-b border-[#26334D] pb-2">
                            <span className="text-xs font-bold text-[#FED430] uppercase flex items-center gap-1">
                              <Edit2 className="w-3.5 h-3.5" />
                              <span>Editing Template #{tIdx + 1}</span>
                            </span>
                            <div className="flex items-center gap-2">
                              <button
                                type="button"
                                onClick={handleCancelEditTemplate}
                                className="px-2.5 py-1 rounded bg-[#141A26] border border-[#26334D] text-[10px] font-bold text-slate-300 hover:text-white"
                              >
                                Cancel
                              </button>
                              <button
                                type="button"
                                onClick={handleSaveEditedTemplate}
                                className="px-3 py-1 rounded bg-[#FED430] text-black font-black text-[10px] uppercase hover:bg-[#e5be2b] shadow-sm"
                              >
                                Save Template
                              </button>
                            </div>
                          </div>

                          <div>
                            <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1">
                              Template Name
                            </label>
                            <input
                              type="text"
                              value={editingTemplateForm.name}
                              onChange={(e) =>
                                setEditingTemplateForm({ ...editingTemplateForm, name: e.target.value })
                              }
                              className="w-full bg-[#141A26] border border-[#26334D] rounded px-2.5 py-1 text-xs text-white focus:outline-none focus:border-[#FED430]"
                            />
                          </div>

                          <div className="grid grid-cols-2 gap-2">
                            <div>
                              <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1">
                                Category Badge
                              </label>
                              <input
                                type="text"
                                value={editingTemplateForm.badge}
                                onChange={(e) =>
                                  setEditingTemplateForm({ ...editingTemplateForm, badge: e.target.value })
                                }
                                className="w-full bg-[#141A26] border border-[#26334D] rounded px-2 py-1 text-xs text-white focus:outline-none focus:border-[#FED430]"
                              />
                            </div>
                            <div>
                              <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1">
                                Brief Subtitle
                              </label>
                              <input
                                type="text"
                                value={editingTemplateForm.description}
                                onChange={(e) =>
                                  setEditingTemplateForm({
                                    ...editingTemplateForm,
                                    description: e.target.value,
                                  })
                                }
                                className="w-full bg-[#141A26] border border-[#26334D] rounded px-2 py-1 text-xs text-white focus:outline-none focus:border-[#FED430]"
                              />
                            </div>
                          </div>

                          <div className="space-y-1.5">
                            <div className="flex items-center justify-between">
                              <label className="text-[10px] uppercase font-bold text-slate-400">
                                Terms & Conditions Clauses
                              </label>
                              <button
                                type="button"
                                onClick={handleAddEditClause}
                                className="text-[10px] text-[#FED430] hover:underline font-bold flex items-center gap-0.5"
                              >
                                <Plus className="w-3 h-3" />
                                <span>Add Clause</span>
                              </button>
                            </div>

                            <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                              {editingTemplateForm.terms.map((clause, cIdx) => (
                                <div key={cIdx} className="flex items-center gap-1.5">
                                  <span className="text-[10px] font-mono text-slate-500 w-4 text-right">
                                    {cIdx + 1}.
                                  </span>
                                  <input
                                    type="text"
                                    value={clause}
                                    onChange={(e) => handleUpdateEditClause(cIdx, e.target.value)}
                                    className="flex-1 bg-[#141A26] border border-[#26334D] rounded px-2 py-1 text-xs text-white focus:outline-none focus:border-[#FED430]"
                                  />
                                  <button
                                    type="button"
                                    onClick={() => handleRemoveEditClause(cIdx)}
                                    className="p-1 text-slate-500 hover:text-red-400"
                                    title="Remove clause"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      );
                    }

                    return (
                      <div
                        key={template.id}
                        onClick={() => {
                          setSelectedTermsTemplateId(template.id);
                          setTermsValidationError('');
                        }}
                        className={`cursor-pointer rounded-xl p-4 transition-all flex flex-col justify-between relative border-2 ${
                          isSelected
                            ? 'bg-[#FED430]/10 border-[#FED430] shadow-lg shadow-[#FED430]/10 ring-2 ring-[#FED430]/40'
                            : 'bg-[#0A0D14] border-[#26334D] hover:border-slate-500'
                        }`}
                      >
                        <div className="space-y-2.5">
                          {/* Card Header */}
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-[#1E2839] text-[#FED430] border border-[#26334D]">
                                {template.badge || `Template #${tIdx + 1}`}
                              </span>
                              <h5 className="font-oswald text-sm font-bold text-white uppercase tracking-wide mt-1.5">
                                {template.name}
                              </h5>
                              <p className="text-[11px] text-slate-400 leading-tight">
                                {template.description}
                              </p>
                            </div>

                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleStartEditTemplate(template);
                              }}
                              className="p-1.5 rounded-lg bg-[#141A26] border border-[#26334D] text-slate-400 hover:text-white hover:border-[#FED430] transition-colors"
                              title="Edit this template clauses"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                          </div>

                          {/* Clauses List */}
                          <div className="p-2.5 rounded-lg bg-[#0F1420] border border-[#1E2839] space-y-1.5 text-[11px]">
                            {template.terms.map((term, idx) => (
                              <div key={idx} className="flex items-start gap-1.5 text-slate-300">
                                <span className="text-[#FED430] font-bold mt-0.5">•</span>
                                <span className="leading-tight">{term}</span>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Selection indicator & Action */}
                        <div className="pt-3 mt-3 border-t border-[#1E2839] flex items-center justify-between">
                          <span className="text-[11px] font-bold text-slate-400">
                            {template.terms.length} clauses
                          </span>

                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedTermsTemplateId(template.id);
                              setTermsValidationError('');
                            }}
                            className={`px-3 py-1.5 rounded-lg text-xs font-black uppercase tracking-wider flex items-center gap-1.5 transition-all ${
                              isSelected
                                ? 'bg-[#FED430] text-black shadow-md shadow-[#FED430]/20'
                                : 'bg-[#141A26] border border-[#26334D] text-slate-300 hover:text-white hover:border-[#FED430]'
                            }`}
                          >
                            {isSelected ? (
                              <>
                                <Check className="w-3.5 h-3.5 text-black" />
                                <span>Selected Template</span>
                              </>
                            ) : (
                              <span>Click to Select</span>
                            )}
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Calculated Totals Preview */}
              <div className="p-4 rounded-xl bg-[#0A0D14] border border-[#26334D] space-y-2 text-xs">
                <div className="flex justify-between text-slate-300">
                  <span>Net Taxable Equipment Subtotal:</span>
                  <span className="font-mono text-white">AED {formatCurrency(previewItemsSum)}</span>
                </div>
                {previewChargesSum > 0 && (
                  <div className="flex justify-between text-amber-400">
                    <span>Additional Charges Total:</span>
                    <span className="font-mono">AED {formatCurrency(previewChargesSum)}</span>
                  </div>
                )}
                <div className="flex justify-between text-slate-300">
                  <span>UAE VAT (5%):</span>
                  <span className="font-mono text-white">AED {formatCurrency(previewVat)}</span>
                </div>
                <div className="flex justify-between text-base font-black text-white pt-2 border-t border-[#1E2839]">
                  <span className="font-oswald tracking-wide">FINAL SALES INVOICE GRAND TOTAL (AED):</span>
                  <span className="text-[#FED430] font-mono text-lg">
                    AED {formatCurrency(previewGrandTotal)}
                  </span>
                </div>
                <div className="text-[11px] font-serif italic text-slate-400 pt-1">
                  Amount in Words: {numberToWords(previewGrandTotal)}
                </div>
              </div>
            </div>

            {/* Modal Footer Actions */}
            <div className="p-3 sm:p-5 bg-[#0A0D14] border-t border-[#1E2839] flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-between gap-2.5">
              <button
                type="button"
                onClick={() => setPreviewingQuote(null)}
                className="w-full sm:w-auto px-4 py-2.5 rounded-lg bg-[#141A26] border border-[#26334D] text-xs font-bold text-slate-300 hover:text-white text-center"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleConfirmSalesInvoice}
                className="w-full sm:w-auto px-6 py-2.5 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-black font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 active:scale-95"
              >
                <CheckCircle className="w-4 h-4 text-black" />
                <span>Confirm & Generate Official Sales Invoice</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: ADD / EDIT PRODUCT */}
      {isAddProductOpen && (
        <ProductFormModal
          product={editingProduct}
          onClose={() => setIsAddProductOpen(false)}
          onSave={(prod) => {
            if (editingProduct) {
              updateProduct(prod);
            } else {
              addProduct(prod);
            }
            setIsAddProductOpen(false);
          }}
        />
      )}

      {/* MODAL: ADD / EDIT BANK */}
      {isAddBankOpen && (
        <BankFormModal
          bank={editingBank}
          onClose={() => setIsAddBankOpen(false)}
          onSave={(bankData) => {
            if (editingBank) {
              updateBankAccount(editingBank.id, bankData);
            } else {
              addBankAccount(bankData);
            }
            setIsAddBankOpen(false);
          }}
        />
      )}
    </div>
  );
}

// -------------------------------------------------------------
// Sub-Modal: Add / Edit Product
// -------------------------------------------------------------
function ProductFormModal({ product, onClose, onSave }) {
  const [code, setCode] = useState(product?.code || '');
  const [name, setName] = useState(product?.name || '');
  const [category, setCategory] = useState(product?.category || 'Plate Loaded');
  const [price, setPrice] = useState(product?.price || 5500);
  const [stockQty, setStockQty] = useState(product?.stockQty !== undefined ? product.stockQty : 10);
  const [imagePath, setImagePath] = useState(product?.imagePath || '/assets/products/prod_1.png');
  const [description, setDescription] = useState(product?.description || '');

  const categories = [
    'Plate Loaded',
    'Strength & Cables',
    'Cardio',
    'Free Weights & Benches',
    'Core & Specialty',
  ];

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!code.trim() || !name.trim()) {
      alert('Product code and name are required.');
      return;
    }
    onSave({
      ...(product || {}),
      code: code.trim().toUpperCase(),
      name: name.trim(),
      category,
      price: parseFloat(price) || 0,
      stockQty: parseInt(stockQty, 10) || 0,
      imagePath: imagePath.trim(),
      description: description.trim(),
    });
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm p-3 sm:p-4 flex items-center justify-center overflow-y-auto">
      <div className="w-full max-w-lg bg-[#0F1420] border border-[#26334D] rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-2xl space-y-4 max-h-[92vh] overflow-y-auto">
        <h3 className="font-oswald text-base sm:text-lg font-bold text-white uppercase tracking-wider">
          {product ? 'EDIT PRODUCT EQUIPMENT' : 'ADD NEW COMMERCIAL PRODUCT'}
        </h3>

        <form onSubmit={handleSubmit} className="space-y-3 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-slate-300 font-bold block mb-1">Model Code *</label>
              <input
                type="text"
                required
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="e.g. LP-045"
                className="w-full bg-[#141A26] border border-[#26334D] rounded px-3 py-2 text-white font-mono"
              />
            </div>

            <div>
              <label className="text-slate-300 font-bold block mb-1">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full bg-[#141A26] border border-[#26334D] rounded px-3 py-2 text-white"
              >
                {categories.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="text-slate-300 font-bold block mb-1">Equipment Name *</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. 45-Degree Commercial Leg Press"
              className="w-full bg-[#141A26] border border-[#26334D] rounded px-3 py-2 text-white"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-slate-300 font-bold block mb-1">Price (AED) *</label>
              <input
                type="number"
                required
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                className="w-full bg-[#141A26] border border-[#26334D] rounded px-3 py-2 text-white font-mono"
              />
            </div>

            <div>
              <label className="text-slate-300 font-bold block mb-1">Warehouse Stock (Qty)</label>
              <input
                type="number"
                value={stockQty}
                onChange={(e) => setStockQty(e.target.value)}
                className="w-full bg-[#141A26] border border-[#26334D] rounded px-3 py-2 text-white font-mono"
              />
            </div>
          </div>

          <div>
            <label className="text-slate-300 font-bold block mb-1">Image Path / URL</label>
            <input
              type="text"
              value={imagePath}
              onChange={(e) => setImagePath(e.target.value)}
              placeholder="/assets/products/prod_1.png"
              className="w-full bg-[#141A26] border border-[#26334D] rounded px-3 py-2 text-white font-mono text-[11px]"
            />
          </div>

          <div>
            <label className="text-slate-300 font-bold block mb-1">Description & Specifications</label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Weight: 260kg | Size: 2400×1610×1480mm | Heavy plate loaded sled with linear bearings..."
              className="w-full bg-[#141A26] border border-[#26334D] rounded px-3 py-2 text-white"
            />
          </div>

          <div className="pt-2 flex flex-col-reverse sm:flex-row justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="w-full sm:w-auto px-4 py-2.5 rounded bg-[#141A26] text-slate-300 font-bold text-xs hover:text-white"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="w-full sm:w-auto px-5 py-2.5 rounded bg-[#FED430] text-black font-black uppercase text-xs hover:bg-[#e5be2b]"
            >
              Save Product
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// -------------------------------------------------------------
// Sub-Modal: Add / Edit Bank Account
// -------------------------------------------------------------
function BankFormModal({ bank, onClose, onSave }) {
  const [bankName, setBankName] = useState(bank?.bankName || '');
  const [accountTitle, setAccountTitle] = useState(bank?.accountTitle || '');
  const [accountNumber, setAccountNumber] = useState(bank?.accountNumber || '');
  const [iban, setIban] = useState(bank?.iban || '');
  const [swift, setSwift] = useState(bank?.swift || '');
  const [branch, setBranch] = useState(bank?.branch || '');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!bankName.trim() || !accountNumber.trim() || !iban.trim()) {
      alert('Bank name, account number, and IBAN are required.');
      return;
    }
    onSave({
      bankName: bankName.trim(),
      accountTitle: accountTitle.trim() || 'EMMA FITNESS L.L.C',
      accountNumber: accountNumber.trim(),
      iban: iban.trim().toUpperCase(),
      swift: swift.trim().toUpperCase(),
      branch: branch.trim(),
    });
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm p-3 sm:p-4 flex items-center justify-center overflow-y-auto">
      <div className="w-full max-w-md bg-[#0F1420] border border-[#26334D] rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-2xl space-y-4 max-h-[92vh] overflow-y-auto">
        <h3 className="font-oswald text-base sm:text-lg font-bold text-white uppercase tracking-wider">
          {bank ? 'EDIT BANK ACCOUNT' : 'ADD NEW COMPANY BANK ACCOUNT'}
        </h3>

        <form onSubmit={handleSubmit} className="space-y-3 text-xs">
          <div>
            <label className="text-slate-300 font-bold block mb-1">Bank Name *</label>
            <input
              type="text"
              required
              value={bankName}
              onChange={(e) => setBankName(e.target.value)}
              placeholder="e.g. ADCB Bank / Emirates NBD"
              className="w-full bg-[#141A26] border border-[#26334D] rounded px-3 py-2 text-white"
            />
          </div>

          <div>
            <label className="text-slate-300 font-bold block mb-1">Account Title / Beneficiary</label>
            <input
              type="text"
              value={accountTitle}
              onChange={(e) => setAccountTitle(e.target.value)}
              placeholder="e.g. EMMA GYM AND EKAVEERA KALARI LLC SPC"
              className="w-full bg-[#141A26] border border-[#26334D] rounded px-3 py-2 text-white"
            />
          </div>

          <div>
            <label className="text-slate-300 font-bold block mb-1">Account Number *</label>
            <input
              type="text"
              required
              value={accountNumber}
              onChange={(e) => setAccountNumber(e.target.value)}
              placeholder="e.g. 13613665820001"
              className="w-full bg-[#141A26] border border-[#26334D] rounded px-3 py-2 text-white font-mono"
            />
          </div>

          <div>
            <label className="text-slate-300 font-bold block mb-1">IBAN *</label>
            <input
              type="text"
              required
              value={iban}
              onChange={(e) => setIban(e.target.value)}
              placeholder="e.g. AE080030013613665820001"
              className="w-full bg-[#141A26] border border-[#26334D] rounded px-3 py-2 text-white font-mono"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-slate-300 font-bold block mb-1">SWIFT / BIC Code</label>
              <input
                type="text"
                value={swift}
                onChange={(e) => setSwift(e.target.value)}
                placeholder="ADCBUS33"
                className="w-full bg-[#141A26] border border-[#26334D] rounded px-3 py-2 text-white font-mono"
              />
            </div>
            <div>
              <label className="text-slate-300 font-bold block mb-1">Branch</label>
              <input
                type="text"
                value={branch}
                onChange={(e) => setBranch(e.target.value)}
                placeholder="Dubai Main Branch"
                className="w-full bg-[#141A26] border border-[#26334D] rounded px-3 py-2 text-white"
              />
            </div>
          </div>

          <div className="pt-2 flex flex-col-reverse sm:flex-row justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="w-full sm:w-auto px-4 py-2.5 rounded bg-[#141A26] text-slate-300 font-bold text-xs hover:text-white"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="w-full sm:w-auto px-5 py-2.5 rounded bg-[#FED430] text-black font-black uppercase text-xs hover:bg-[#e5be2b]"
            >
              Save Bank
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

