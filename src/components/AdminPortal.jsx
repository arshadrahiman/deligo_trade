import React, { useState, useEffect, useMemo } from 'react';
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
  Calendar,
  TrendingUp,
  BarChart3,
  LineChart,
  Shield,
  Crown,
  Briefcase,
  CheckCircle2,
  User,
  Key,
  ChevronDown,
  Info,
  Sparkles,
  Tag,
  Clock,
  Save,
  ArrowUpDown,
  Sliders,
  Users,
} from 'lucide-react';
import { useApp, sanitizeInput } from '../context/AppContext';
import { formatCurrency, numberToWords } from '../utils/numberToWords';
import { generateInvoicePdf } from '../utils/pdfGenerator';
import Pagination from './Pagination';
import FinancialDashboardGraph from './FinancialDashboardGraph';
import LoginPage from './LoginPage';
import CreateQuotationTab from './CreateQuotationTab';
import SystemConfigTab from './SystemConfigTab';

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
    adminLogout,
    currentRole,
    currentAdminUser,
    currentPermissions,
    ROLES,
    ROLE_DEFINITIONS,
    SYSTEM_ACCOUNTS,
    quotesRecords,
    updateQuoteRecord,
    approveQuoteRecord,
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

  // Active sub-tab based on logged-in role ('dashboard' | 'create_quote' | 'quotes' | 'products' | 'branding' | 'banks')
  const [activeTab, setActiveTab] = useState(() => {
    if (currentRole === ROLES.SALES_AGENT) return 'create_quote';
    if (currentRole === ROLES.FINANCE_AGENT) return 'quotes';
    return 'dashboard';
  });

  // Search in Quotes
  const [quoteSearch, setQuoteSearch] = useState('');
  const [quoteFilter, setQuoteFilter] = useState('ALL'); // 'ALL' | 'quotation' | 'sales_invoice'

  // Calendar Date Range Selection State
  const [dateRangePreset, setDateRangePreset] = useState('ALL'); // 'ALL' | 'TODAY' | 'THIS_WEEK' | 'THIS_MONTH' | 'LAST_30_DAYS' | 'CUSTOM'
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const handleApplyPreset = (preset) => {
    setDateRangePreset(preset);
    const now = new Date();
    const formatDate = (d) => {
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    };

    if (preset === 'ALL') {
      setStartDate('');
      setEndDate('');
    } else if (preset === 'TODAY') {
      const todayStr = formatDate(now);
      setStartDate(todayStr);
      setEndDate(todayStr);
    } else if (preset === 'THIS_WEEK') {
      const start = new Date(now.getTime() - 6 * 86400000);
      setStartDate(formatDate(start));
      setEndDate(formatDate(now));
    } else if (preset === 'THIS_MONTH') {
      const start = new Date(now.getFullYear(), now.getMonth(), 1);
      setStartDate(formatDate(start));
      setEndDate(formatDate(now));
    } else if (preset === 'LAST_30_DAYS') {
      const start = new Date(now.getTime() - 29 * 86400000);
      setStartDate(formatDate(start));
      setEndDate(formatDate(now));
    }
  };

  const handleCustomDateChange = (field, value) => {
    setDateRangePreset('CUSTOM');
    if (field === 'start') {
      setStartDate(value);
      // Auto-adjust reverse date range so start <= end
      if (value && endDate && value > endDate) {
        setEndDate(value);
      }
    } else {
      setEndDate(value);
      // Auto-adjust reverse date range so start <= end
      if (value && startDate && value < startDate) {
        setStartDate(value);
      }
    }
  };

  const handleResetDateRange = () => {
    setDateRangePreset('ALL');
    setStartDate('');
    setEndDate('');
  };

  // Auto-normalized date range (safeguards against reverse date selection)
  const effectiveDateRange = useMemo(() => {
    if (!startDate && !endDate) {
      return { effectiveStart: null, effectiveEnd: null, effectiveStartStr: '', effectiveEndStr: '', isReversed: false };
    }
    let s = startDate;
    let e = endDate;
    let isReversed = false;
    if (s && e && s > e) {
      isReversed = true;
      [s, e] = [e, s];
    }
    return {
      effectiveStart: s ? new Date(s + 'T00:00:00') : null,
      effectiveEnd: e ? new Date(e + 'T23:59:59.999') : null,
      effectiveStartStr: s,
      effectiveEndStr: e,
      isReversed,
    };
  }, [startDate, endDate]);

  const parseRecordDate = (record) => {
    if (!record) return null;
    if (record.createdAt && typeof record.createdAt === 'number') {
      const d = new Date(record.createdAt);
      if (!isNaN(d.getTime())) return d;
    }
    const dateStr = record.invoiceDate || record.date;
    if (dateStr) {
      const clean = String(dateStr).trim().replace(/-/g, ' ');
      const parsed = Date.parse(clean);
      if (!isNaN(parsed)) return new Date(parsed);
      const direct = Date.parse(dateStr);
      if (!isNaN(direct)) return new Date(direct);
    }
    return null;
  };

  // Search, Sorting & Pagination in Products
  const [prodSearch, setProdSearch] = useState('');
  const [prodCategoryFilter, setProdCategoryFilter] = useState('ALL');
  const [prodSort, setProdSort] = useState('default');
  const [prodPage, setProdPage] = useState(1);
  const [prodPerPage, setProdPerPage] = useState(10);

  // Reset product page when category, search or sort changes
  useEffect(() => {
    setProdPage(1);
  }, [prodCategoryFilter, prodSearch, prodSort]);

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

  // Quotation Review & Modification Workspace State (Finance Agent & Admin Agent)
  const [reviewingQuote, setReviewingQuote] = useState(null);
  const [reviewItems, setReviewItems] = useState([]);
  const [reviewCharges, setReviewCharges] = useState([]);
  const [reviewCustomerName, setReviewCustomerName] = useState('');
  const [reviewContactNumber, setReviewContactNumber] = useState('');
  const [reviewCustomerDetails, setReviewCustomerDetails] = useState('');
  const [reviewSaveMsg, setReviewSaveMsg] = useState('');

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

  // -------------------------------------------------------------
  // REVIEW & UPDATE WORKSPACE (Before Approval: Finance & Admin)
  // -------------------------------------------------------------
  const openReviewModal = (quote) => {
    setReviewingQuote(quote);
    setReviewSaveMsg('');
    setReviewCustomerName(quote.customerName || '');
    setReviewContactNumber(quote.contactNumber || '');
    setReviewCustomerDetails(quote.customerDetails || '');
    setReviewItems(
      (quote.items || []).map((it) => ({
        product: { ...it.product },
        quantity: it.quantity || 1,
        unitPrice: it.unitPrice !== undefined ? it.unitPrice : it.product?.price || 0,
        originalPrice: it.originalPrice || it.product?.price || it.unitPrice || 0,
        purchaseRate:
          it.purchaseRate !== undefined
            ? Number(it.purchaseRate)
            : it.product?.purchaseRate !== undefined
            ? Number(it.product.purchaseRate)
            : Math.round(Number(it.unitPrice || it.product?.price || 0) * 0.65),
      }))
    );
    setReviewCharges(
      Array.isArray(quote.additionalCharges)
        ? quote.additionalCharges
            .filter((c) => c && typeof c === 'object' && Number(c.amount) > 0)
            .map((c) => ({
              id: c.id || 'ch-rev-' + Math.random().toString(36).substring(2, 7),
              description: String(c.description || 'Logistics & Assembly Delivery').trim(),
              amount: Math.round(Number(c.amount) * 100) / 100,
            }))
        : []
    );
  };

  const handleReviewItemPriceChange = (index, newPrice) => {
    setReviewItems((prev) =>
      prev.map((it, idx) =>
        idx === index ? { ...it, unitPrice: parseFloat(newPrice) || 0 } : it
      )
    );
  };

  const handleReviewItemQuantityChange = (index, newQty) => {
    setReviewItems((prev) =>
      prev.map((it, idx) =>
        idx === index ? { ...it, quantity: Math.max(1, parseInt(newQty, 10) || 1) } : it
      )
    );
  };

  const handleAddReviewCharge = () => {
    const newCharge = {
      id: 'ch-rev-' + Date.now() + Math.random().toString(36).substr(2, 4),
      description: 'Logistics, Offloading & Rigging',
      amount: 500,
    };
    setReviewCharges((prev) => [...prev, newCharge]);
  };

  const handleUpdateReviewCharge = (id, field, val) => {
    setReviewCharges((prev) =>
      prev.map((c) => (c.id === id ? { ...c, [field]: val } : c))
    );
  };

  const handleRemoveReviewCharge = (id) => {
    setReviewCharges((prev) => prev.filter((c) => c.id !== id));
  };

  const handleSaveReviewChanges = () => {
    if (!reviewingQuote) return;
    const ok = updateQuoteRecord(reviewingQuote.id, {
      customerName: reviewCustomerName.trim(),
      contactNumber: reviewContactNumber.trim(),
      customerDetails: reviewCustomerDetails.trim(),
      items: reviewItems,
      additionalCharges: reviewCharges,
    });
    if (ok) {
      setReviewSaveMsg('Quotation pricing, line items, and charges updated successfully.');
      setTimeout(() => setReviewSaveMsg(''), 4000);
    }
  };

  const handleApproveFromReview = () => {
    if (!reviewingQuote) return;
    // Auto-save changes first if modified
    updateQuoteRecord(reviewingQuote.id, {
      customerName: reviewCustomerName.trim(),
      contactNumber: reviewContactNumber.trim(),
      customerDetails: reviewCustomerDetails.trim(),
      items: reviewItems,
      additionalCharges: reviewCharges,
    });
    const approved = approveQuoteRecord(reviewingQuote.id);
    if (approved) {
      alert(`Quotation #${reviewingQuote.id} has been Approved and locked! It is now ready for Invoice Generation.`);
      setReviewingQuote(null);
    }
  };

  const reviewItemsSum = useMemo(() => {
    return reviewItems.reduce(
      (sum, it) => sum + (Number(it.unitPrice) || 0) * (Number(it.quantity) || 1),
      0
    );
  }, [reviewItems]);

  const reviewChargesSum = useMemo(() => {
    return reviewCharges.reduce((sum, ch) => sum + (parseFloat(ch.amount) || 0), 0);
  }, [reviewCharges]);

  const reviewSubtotal = reviewItemsSum + reviewChargesSum;
  const reviewVat = reviewSubtotal * 0.05;
  const reviewGrandTotal = reviewSubtotal + reviewVat;

  // -------------------------------------------------------------
  // INVOICE GENERATOR (Stage 2: Approved Quotes Only)
  // -------------------------------------------------------------
  const openInvoicePreview = (quote) => {
    if (quote.type !== 'sales_invoice' && quote.status !== 'Approved') {
      alert('Cannot Generate Invoice: Quotation must be Reviewed and Approved by Finance first.');
      return;
    }
    setPreviewingQuote(quote);
    setSelectedTermsTemplateId(quote.selectedTerms?.id || 'tmpl-commercial-50-50');
    setTermsValidationError('');
    setEditingTemplateId(null);
    setEditingTemplateForm(null);
    // Line items and unit prices are locked to approved quote values ("once approved its cannot modify")
    setOverrideItems(
      (quote.items || []).map((it) => ({
        product: { ...it.product },
        quantity: it.quantity,
        unitPrice: it.unitPrice || it.product.price,
        originalPrice: it.originalPrice || it.product.price,
        purchaseRate:
          it.purchaseRate !== undefined
            ? Number(it.purchaseRate)
            : it.product?.purchaseRate !== undefined
            ? Number(it.product.purchaseRate)
            : Math.round(Number(it.unitPrice || it.product?.price || 0) * 0.65),
      }))
    );
    // clone additional charges
    setOverrideCharges(
      Array.isArray(quote.additionalCharges)
        ? quote.additionalCharges
            .filter((c) => c && typeof c === 'object' && Number(c.amount) > 0)
            .map((c) => ({
              id: c.id || 'ch-' + Math.random().toString(36).substring(2, 7),
              description: String(c.description || 'Logistics & Assembly Delivery').trim(),
              amount: Math.round(Number(c.amount) * 100) / 100,
            }))
        : []
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
  // If NOT Logged In: Render Unified Single Login Page
  // -------------------------------------------------------------
  if (!isAdminLoggedIn) {
    return <LoginPage />;
  }

  // -------------------------------------------------------------
  // Filtered Data (Calendar Date Range + Search + Type)
  // -------------------------------------------------------------
  const dateFilteredQuotes = useMemo(() => {
    const { effectiveStart, effectiveEnd } = effectiveDateRange;
    return quotesRecords
      .filter((record) => {
        if (!effectiveStart && !effectiveEnd) return true;
        const recDate = parseRecordDate(record);
        if (!recDate) return true;

        if (effectiveStart && recDate < effectiveStart) return false;
        if (effectiveEnd && recDate > effectiveEnd) return false;
        return true;
      })
      .sort((a, b) => {
        // Chronological order: newest transactions on top
        const timeA = a.createdAt || (parseRecordDate(a)?.getTime() || 0);
        const timeB = b.createdAt || (parseRecordDate(b)?.getTime() || 0);
        return timeB - timeA;
      });
  }, [quotesRecords, effectiveDateRange]);

  // Quotation Workflow Pipeline Segmentation
  const pendingQuotes = useMemo(() => {
    return dateFilteredQuotes.filter((q) => q.type !== 'sales_invoice' && q.status !== 'Approved');
  }, [dateFilteredQuotes]);

  const approvedQuotes = useMemo(() => {
    return dateFilteredQuotes.filter((q) => q.type !== 'sales_invoice' && q.status === 'Approved');
  }, [dateFilteredQuotes]);

  const salesInvoices = useMemo(() => {
    return dateFilteredQuotes.filter((q) => q.type === 'sales_invoice');
  }, [dateFilteredQuotes]);

  const filteredQuotes = dateFilteredQuotes.filter((q) => {
    let matchesFilter = true;
    if (quoteFilter === 'pending') {
      matchesFilter = q.type !== 'sales_invoice' && q.status !== 'Approved';
    } else if (quoteFilter === 'approved') {
      matchesFilter = q.type !== 'sales_invoice' && q.status === 'Approved';
    } else if (quoteFilter === 'sales_invoice') {
      matchesFilter = q.type === 'sales_invoice';
    } else if (quoteFilter === 'quotation') {
      matchesFilter = q.type !== 'sales_invoice';
    }
    const matchesSearch =
      quoteSearch.trim() === '' ||
      q.customerName.toLowerCase().includes(quoteSearch.toLowerCase()) ||
      q.id.toLowerCase().includes(quoteSearch.toLowerCase()) ||
      (q.invoiceNumber && q.invoiceNumber.toLowerCase().includes(quoteSearch.toLowerCase())) ||
      q.contactNumber.includes(quoteSearch);
    return matchesFilter && matchesSearch;
  });

  const totalSalesAmount = useMemo(() => {
    return salesInvoices.reduce((sum, q) => sum + (Number(q.grandTotal) || 0), 0);
  }, [salesInvoices]);

  const totalCostAmount = useMemo(() => {
    return salesInvoices.reduce((sum, q) => {
      const itemsCost = (q.items || []).reduce((itemSum, it) => {
        const itemCost = Number(
          it.purchaseRate !== undefined
            ? it.purchaseRate
            : it.product?.purchaseRate !== undefined
            ? it.product.purchaseRate
            : products.find((p) => p.code === (it.product?.code || it.code))?.purchaseRate ||
              Math.round((it.unitPrice || it.product?.price || 0) * 0.65)
        );
        const qty = Number(it.quantity || 1);
        return itemSum + itemCost * qty;
      }, 0);
      return sum + itemsCost;
    }, 0);
  }, [salesInvoices, products]);

  const totalProfitAmount = useMemo(() => {
    return totalSalesAmount - totalCostAmount;
  }, [totalSalesAmount, totalCostAmount]);

  const profitMarginPct = useMemo(() => {
    return totalSalesAmount > 0
      ? ((totalProfitAmount / totalSalesAmount) * 100).toFixed(1)
      : '0.0';
  }, [totalSalesAmount, totalProfitAmount]);

  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      let matchesCategory = true;
      if (prodCategoryFilter !== 'ALL') {
        const cat = (p.category || '').toLowerCase();
        const filter = prodCategoryFilter.toLowerCase();
        if (filter === 'cardio') {
          matchesCategory = cat.includes('cardio');
        } else if (filter === 'strength') {
          matchesCategory = cat.includes('strength') || cat.includes('cable') || cat.includes('plate');
        } else if (filter === 'plate loaded') {
          matchesCategory = cat.includes('plate');
        } else if (filter === 'strength & cables') {
          matchesCategory = cat.includes('cable') || (cat.includes('strength') && !cat.includes('plate'));
        } else if (filter === 'free weights' || filter === 'free weights & benches') {
          matchesCategory = cat.includes('weight') || cat.includes('bench');
        } else if (filter === 'accessories' || filter === 'core & specialty') {
          matchesCategory = cat.includes('core') || cat.includes('specialty') || cat.includes('accessor');
        } else {
          matchesCategory = p.category === prodCategoryFilter;
        }
      }

      const q = prodSearch.toLowerCase().trim();
      const matchesSearch =
        !q ||
        (p.name && p.name.toLowerCase().includes(q)) ||
        (p.code && p.code.toLowerCase().includes(q)) ||
        (p.category && p.category.toLowerCase().includes(q)) ||
        (p.description && p.description.toLowerCase().includes(q)) ||
        String(p.price || '').includes(q);

      return matchesCategory && matchesSearch;
    });
  }, [products, prodCategoryFilter, prodSearch]);

  const sortedAdminProducts = useMemo(() => {
    const list = [...filteredProducts];
    switch (prodSort) {
      case 'price_asc':
        return list.sort((a, b) => Number(a.price || 0) - Number(b.price || 0));
      case 'price_desc':
        return list.sort((a, b) => Number(b.price || 0) - Number(a.price || 0));
      case 'stock_desc':
        return list.sort((a, b) => Number(b.stockQty || 0) - Number(a.stockQty || 0));
      case 'stock_asc':
        return list.sort((a, b) => Number(a.stockQty || 0) - Number(b.stockQty || 0));
      case 'name_asc':
        return list.sort((a, b) => (a.name || '').localeCompare(b.name || ''));
      case 'name_desc':
        return list.sort((a, b) => (b.name || '').localeCompare(a.name || ''));
      case 'code_asc':
        return list.sort((a, b) => (a.code || '').localeCompare(b.code || ''));
      default:
        return list;
    }
  }, [filteredProducts, prodSort]);

  const totalProdPages = Math.max(1, Math.ceil(sortedAdminProducts.length / prodPerPage));
  const validProdPage = Math.min(prodPage, totalProdPages);
  const startProdIndex = (validProdPage - 1) * prodPerPage;
  const paginatedAdminProducts = sortedAdminProducts.slice(
    startProdIndex,
    startProdIndex + prodPerPage
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6 animate-fadeIn">
      {/* Admin Top Navigation & Header */}
      <div className="p-4 sm:p-5 rounded-2xl bg-surface border border-white/10 flex flex-wrap items-center justify-between gap-4 shadow-xl">
        <div className="flex items-center gap-3">
          <div
            className={`w-11 h-11 rounded-xl flex items-center justify-center font-bold shadow-md border ${
              currentRole === ROLES.SUPER_ADMIN
                ? 'bg-gradient-to-br from-red-500/20 to-amber-600/10 border-red-500/40 text-red-400 shadow-red-500/20'
                : currentRole === ROLES.ADMIN_AGENT
                ? 'bg-gradient-to-br from-amber-500/20 to-amber-600/10 border-amber-500/40 text-amber-400 shadow-amber-500/20'
                : currentRole === ROLES.FINANCE_AGENT
                ? 'bg-gradient-to-br from-cyan-500/20 to-cyan-600/10 border-cyan-500/40 text-cyan-400 shadow-cyan-500/20'
                : 'bg-gradient-to-br from-purple-500/20 to-indigo-600/10 border-purple-500/40 text-purple-400 shadow-purple-500/20'
            }`}
          >
            {currentRole === ROLES.SUPER_ADMIN && <Sparkles className="w-5 h-5 text-red-400" />}
            {currentRole === ROLES.ADMIN_AGENT && <Crown className="w-5 h-5" />}
            {currentRole === ROLES.FINANCE_AGENT && <Briefcase className="w-5 h-5" />}
            {currentRole === ROLES.SALES_AGENT && <Tag className="w-5 h-5" />}
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-lg sm:text-xl font-bold text-white tracking-tight leading-none uppercase">
                DELITRADE • COMMERCIAL GYM EQUIPMENT & MACHINERY ERP
              </h1>
              <span
                className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider border ${
                  currentRole === ROLES.SUPER_ADMIN
                    ? 'bg-red-500/15 text-red-400 border-red-500/30'
                    : currentRole === ROLES.ADMIN_AGENT
                    ? 'bg-amber-500/15 text-amber-400 border-amber-500/30'
                    : currentRole === ROLES.FINANCE_AGENT
                    ? 'bg-cyan-500/15 text-cyan-300 border-cyan-500/30'
                    : 'bg-purple-500/15 text-purple-300 border-purple-500/30'
                }`}
              >
                {ROLE_DEFINITIONS[currentRole]?.name || currentRole}
              </span>
            </div>
            <p className="text-slate-400 text-xs mt-1.5 flex flex-wrap items-center gap-2">
              <span className="font-semibold text-slate-200">
                {currentAdminUser?.name || 'Terminal Officer'}
              </span>
              <span className="text-slate-600 hidden sm:inline">•</span>
              <span className="text-amber-400/90 font-mono text-[11px]">
                {ROLE_DEFINITIONS[currentRole]?.description}
              </span>
            </p>
          </div>
        </div>

        {/* Authenticated Session Badge & Secure Logout */}
        <div className="flex items-center gap-3">
          <div className="hidden sm:flex flex-col items-end text-right">
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-xs font-bold text-white">
                {currentAdminUser?.name || 'Authorized Officer'}
              </span>
            </div>
            <span className="text-[10px] font-mono text-emerald-400/90 mt-0.5">
              Active Session • {ROLE_DEFINITIONS[currentRole]?.name}
            </span>
          </div>

          <button
            onClick={adminLogout}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-red-500/15 border border-red-500/30 text-xs font-bold font-mono text-red-400 hover:bg-red-500/25 hover:border-red-500/50 transition-all shadow-sm active:scale-95"
            title="Secure Sign Out from Enterprise Portal"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out</span>
          </button>
        </div>
      </div>

      {/* Unified Portal Navigation Tabs (Role & Permission Based) */}
      <div className="flex items-center gap-2 border-b border-white/10 pb-3 overflow-x-auto no-scrollbar sm:flex-wrap">
        {/* Tab 1: Dashboard & Analytics (Admin Agent & Super Admin) */}
        {currentPermissions.dashboardDatas && (
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all ${
              activeTab === 'dashboard'
                ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 font-bold shadow-md shadow-amber-500/20'
                : 'bg-surface text-slate-300 border border-white/10 hover:bg-[#070A12] hover:text-white'
            }`}
          >
            <LayoutDashboard className="w-4 h-4" />
            <span>Dashboard & Analytics</span>
          </button>
        )}

        {/* Tab 2: Create Quotation (Sales, Finance, Admin, Super Admin) */}
        {currentPermissions.quotationCreation && (
          <button
            onClick={() => setActiveTab('create_quote')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all ${
              activeTab === 'create_quote'
                ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 font-bold shadow-md shadow-amber-500/20'
                : 'bg-surface text-slate-300 border border-white/10 hover:bg-[#070A12] hover:text-white'
            }`}
          >
            <Plus className="w-4 h-4" />
            <span>Create Quotation</span>
          </button>
        )}

        {/* Tab 3: Created Quotes & Invoices */}
        <button
          onClick={() => setActiveTab('quotes')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all ${
            activeTab === 'quotes'
              ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 font-bold shadow-md shadow-amber-500/20'
              : 'bg-surface text-slate-300 border border-white/10 hover:bg-[#070A12] hover:text-white'
          }`}
        >
          <Receipt className="w-4 h-4" />
          <span>
            {currentRole === ROLES.SALES_AGENT
              ? `My Quotations (${quotesRecords.length})`
              : `Quotes & Invoices (${quotesRecords.length})`}
          </span>
        </button>

        {/* Tab 4: Products & Stock */}
        {currentPermissions.productListing && (
          <button
            onClick={() => setActiveTab('products')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all ${
              activeTab === 'products'
                ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 font-bold shadow-md shadow-amber-500/20'
                : 'bg-surface text-slate-300 border border-white/10 hover:bg-[#070A12] hover:text-white'
            }`}
          >
            <Package className="w-4 h-4" />
            <span>
              Products & Stock ({products.length})
              {!currentPermissions.productionCrud && ' [Listing Only]'}
            </span>
          </button>
        )}

        {/* Tab 5: Branding (Admin & Super Admin) */}
        {currentPermissions.brandingManagement && (
          <button
            onClick={() => setActiveTab('branding')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all ${
              activeTab === 'branding'
                ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 font-bold shadow-md shadow-amber-500/20'
                : 'bg-surface text-slate-300 border border-white/10 hover:bg-[#070A12] hover:text-white'
            }`}
          >
            <Building className="w-4 h-4" />
            <span>Edit Logo & Brand Info</span>
          </button>
        )}

        {/* Tab 6: Bank Accounts (Admin & Super Admin) */}
        {currentPermissions.bankManagement && (
          <button
            onClick={() => setActiveTab('banks')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all ${
              activeTab === 'banks'
                ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 font-bold shadow-md shadow-amber-500/20'
                : 'bg-surface text-slate-300 border border-white/10 hover:bg-[#070A12] hover:text-white'
            }`}
          >
            <CreditCard className="w-4 h-4" />
            <span>Bank Details ({bankAccounts.length})</span>
          </button>
        )}

        {/* Tab 7: System & Access Config (Super Admin Only) */}
        {currentRole === ROLES.SUPER_ADMIN && (
          <button
            onClick={() => setActiveTab('system_config')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all ${
              activeTab === 'system_config'
                ? 'bg-gradient-to-r from-red-500 to-amber-600 text-slate-950 font-bold shadow-md shadow-red-500/20'
                : 'bg-surface text-slate-300 border border-white/10 hover:bg-[#070A12] hover:text-white'
            }`}
          >
            <Sliders className="w-4 h-4 text-amber-400" />
            <span>Access & System Config</span>
          </button>
        )}
      </div>

      {/* ========================================================= */}
      {/* TAB 0: EXECUTIVE DASHBOARD & FINANCIAL ANALYTICS          */}
      {/* ========================================================= */}
      {activeTab === 'dashboard' && (
        <div className="space-y-4">
          {/* Calendar Range Selection Toolbar */}
          <div className="p-4 rounded-xl bg-surface border border-white/10 space-y-3 shadow-lg">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
                  <Calendar className="w-4 h-4" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-white">
                      CALENDAR TIME HORIZON & DATE RANGE
                    </h3>
                    {(startDate || endDate) && (
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                    )}
                  </div>
                  <p className="text-[11px] text-slate-400">
                    Filter dashboard KPI metrics and transaction records based on calendar range
                  </p>
                </div>
              </div>

              {/* Quick Presets */}
              <div className="flex flex-wrap items-center gap-1.5 text-xs font-mono">
                {[
                  { id: 'ALL', label: 'All Time' },
                  { id: 'TODAY', label: 'Today' },
                  { id: 'THIS_WEEK', label: 'Last 7 Days' },
                  { id: 'THIS_MONTH', label: 'This Month' },
                  { id: 'LAST_30_DAYS', label: 'Last 30 Days' },
                ].map((preset) => {
                  const isActive = dateRangePreset === preset.id;
                  return (
                    <button
                      key={preset.id}
                      onClick={() => handleApplyPreset(preset.id)}
                      className={`px-2.5 py-1 rounded-md text-[11px] font-semibold transition-all ${
                        isActive
                          ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 font-bold shadow-sm shadow-amber-500/20'
                          : 'bg-[#070A12] border border-white/10 text-slate-300 hover:text-white hover:border-white/20'
                      }`}
                    >
                      {preset.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Date Pickers Row */}
            <div className="pt-2 border-t border-white/5 flex flex-wrap items-center justify-between gap-3 text-xs">
              <div className="flex flex-wrap items-center gap-2.5">
                <div className="flex items-center gap-1.5">
                  <span className="text-slate-400 text-[11px] font-mono uppercase">From:</span>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => handleCustomDateChange('start', e.target.value)}
                    className="bg-[#070A12] border border-white/10 rounded-lg px-2.5 py-1 text-xs text-white focus:outline-none focus:border-amber-500/60 font-mono"
                  />
                </div>

                <div className="flex items-center gap-1.5">
                  <span className="text-slate-400 text-[11px] font-mono uppercase">To:</span>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => handleCustomDateChange('end', e.target.value)}
                    className="bg-[#070A12] border border-white/10 rounded-lg px-2.5 py-1 text-xs text-white focus:outline-none focus:border-amber-500/60 font-mono"
                  />
                </div>

                {(startDate || endDate) && (
                  <button
                    onClick={handleResetDateRange}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 text-xs font-mono transition-colors"
                  >
                    <RotateCcw className="w-3 h-3" />
                    <span>Reset Range</span>
                  </button>
                )}
              </div>

              {/* Status Indicator */}
              <div className="text-[11px] font-mono text-slate-400 flex items-center gap-2">
                {startDate || endDate ? (
                  <span className="text-amber-400 font-medium flex items-center gap-1.5 flex-wrap">
                    <span>
                      Range Filter Active: {effectiveDateRange.effectiveStartStr || 'Start'} → {effectiveDateRange.effectiveEndStr || 'End'} ({dateFilteredQuotes.length} records in range)
                    </span>
                    {effectiveDateRange.isReversed && (
                      <span className="text-cyan-400 text-[10px] bg-cyan-500/10 px-1.5 py-0.5 rounded border border-cyan-500/30">
                        (Auto-Normalized Range)
                      </span>
                    )}
                  </span>
                ) : (
                  <span className="text-slate-500">
                    Displaying All-Time Cumulative Analytics ({quotesRecords.length} records)
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Quotes & Financial KPI Summary (Filtered by Calendar Selection & Role Access) */}
          <div
            className={`grid gap-2.5 sm:gap-3 ${
              currentRole === ROLES.ADMIN_AGENT || currentRole === ROLES.SUPER_ADMIN
                ? 'grid-cols-2 md:grid-cols-3 lg:grid-cols-5'
                : currentPermissions.dashboardDatas
                ? 'grid-cols-2 md:grid-cols-3 lg:grid-cols-5'
                : 'grid-cols-2 sm:grid-cols-4'
            }`}
          >
            {/* 1. Total Quotations */}
            <div
              onClick={() => setQuoteFilter('ALL')}
              className={`p-4 rounded-xl bg-surface border transition-all cursor-pointer ${
                quoteFilter === 'ALL' ? 'border-white/40 ring-1 ring-white/20' : 'border-white/10 hover:border-white/30'
              }`}
              title="Click to view all quotations and sales orders"
            >
              <span className="text-[10px] uppercase font-bold text-slate-400 block">
                Total Quotations
              </span>
              <span className="text-2xl font-mono font-bold text-white">
                {dateFilteredQuotes.length}
              </span>
              <span className="text-[10px] text-slate-500 block mt-1">
                In active calendar window
              </span>
            </div>

            {/* 2. Pending Review (Finance Stage) */}
            <div
              onClick={() => setQuoteFilter(quoteFilter === 'pending' ? 'ALL' : 'pending')}
              className={`p-4 rounded-xl bg-surface border transition-all cursor-pointer ${
                quoteFilter === 'pending'
                  ? 'border-amber-500 bg-amber-500/10 ring-1 ring-amber-500/40'
                  : 'border-white/10 hover:border-amber-500/40'
              }`}
              title="Click to filter Pending Review quotations"
            >
              <div className="flex items-center justify-between">
                <span className="text-[10px] uppercase font-bold text-amber-400">
                  Pending Review
                </span>
                {pendingQuotes.length > 0 && (
                  <span className="px-1.5 py-0.2 rounded text-[9px] font-mono font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                    Review
                  </span>
                )}
              </div>
              <span className="text-2xl font-mono font-bold text-amber-300">
                {pendingQuotes.length}
              </span>
              <span className="text-[10px] text-slate-500 block mt-1">
                Awaiting Finance review
              </span>
            </div>

            {/* 3. Approved Quotes (Ready for Invoicing) */}
            <div
              onClick={() => setQuoteFilter(quoteFilter === 'approved' ? 'ALL' : 'approved')}
              className={`p-4 rounded-xl bg-surface border transition-all cursor-pointer ${
                quoteFilter === 'approved'
                  ? 'border-cyan-500 bg-cyan-500/10 ring-1 ring-cyan-500/40'
                  : 'border-white/10 hover:border-cyan-500/40'
              }`}
              title="Click to filter Approved quotations ready for invoice generation"
            >
              <div className="flex items-center justify-between">
                <span className="text-[10px] uppercase font-bold text-cyan-400">
                  Approved Quotes
                </span>
                {approvedQuotes.length > 0 && (
                  <span className="px-1.5 py-0.2 rounded text-[9px] font-mono font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                    Ready to Invoice
                  </span>
                )}
              </div>
              <span className="text-2xl font-mono font-bold text-cyan-300">
                {approvedQuotes.length}
              </span>
              <span className="text-[10px] text-slate-500 block mt-1">
                Approved & locked
              </span>
            </div>

            {/* 4. Converted Sales Invoices */}
            <div
              onClick={() => setQuoteFilter(quoteFilter === 'sales_invoice' ? 'ALL' : 'sales_invoice')}
              className={`p-4 rounded-xl bg-surface border transition-all cursor-pointer ${
                quoteFilter === 'sales_invoice'
                  ? 'border-emerald-500 bg-emerald-500/10 ring-1 ring-emerald-500/40'
                  : 'border-white/10 hover:border-emerald-500/40'
              }`}
              title="Click to filter Converted Sales Invoices"
            >
              <span className="text-[10px] uppercase font-bold text-emerald-400 block">
                Converted to Invoices
              </span>
              <span className="text-2xl font-mono font-bold text-emerald-400">
                {salesInvoices.length}
              </span>
              <span className="text-[10px] text-slate-500 block mt-1">
                Official commercial invoices
              </span>
            </div>

            {/* 5. Total Sales Value (Authorized Roles: Finance, Approval, Admin) */}
            {currentPermissions.dashboardDatas && (
              <div className="p-4 rounded-xl bg-surface border border-white/10">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">
                  Total Sale Amount (AED)
                </span>
                <span className="text-2xl font-mono font-bold text-emerald-400">
                  AED {formatCurrency(totalSalesAmount)}
                </span>
                <span className="text-[10px] text-slate-500 block mt-1">
                  Sum of invoice grand totals
                </span>
              </div>
            )}

            {/* 6. Total Profit (Super Admin & Admin Agent Only) */}
            {(currentRole === ROLES.ADMIN_AGENT || currentRole === ROLES.SUPER_ADMIN) && (
              <div className="p-4 rounded-xl bg-gradient-to-br from-emerald-500/15 via-surface to-cyan-500/10 border border-emerald-500/40 relative overflow-hidden shadow-lg shadow-emerald-500/5 col-span-2 sm:col-span-1">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] uppercase font-bold text-emerald-400 flex items-center gap-1">
                    <TrendingUp className="w-3.5 h-3.5" />
                    Total Profit (AED)
                  </span>
                  <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/30">
                    +{profitMarginPct}%
                  </span>
                </div>
                <span className="text-2xl font-mono font-black text-cyan-300 block mt-1">
                  AED {formatCurrency(totalProfitAmount)}
                </span>
                <span
                  className="text-[10px] text-emerald-400/80 font-mono block mt-1 truncate"
                  title="Sales Invoices - Item Purchase Costs"
                >
                  Sales − Purchase Cost (COGS)
                </span>
              </div>
            )}
          </div>

          {/* Dynamic Financial Performance & Profit Analytics Graph (Admin Agent Role Only) */}
          {currentPermissions.dashboardGraph ? (
            <FinancialDashboardGraph
              salesInvoices={salesInvoices}
              allFilteredQuotes={dateFilteredQuotes}
              onResetDateRange={handleResetDateRange}
              dateRangeLabel={
                startDate || endDate
                  ? `${startDate || 'Start'} to ${endDate || 'End'}`
                  : 'All Time'
              }
            />
          ) : (
            <div className="p-3.5 sm:p-4 rounded-xl bg-[#070A12] border border-white/10 flex items-center gap-2.5 text-xs">
              <div className="w-8 h-8 rounded-lg bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 flex-shrink-0">
                <Info className="w-4 h-4" />
              </div>
              <div>
                <span className="font-bold text-white block">
                  Operational View Active ({ROLE_DEFINITIONS[currentRole]?.name})
                </span>
                <span className="text-[11px] text-slate-400">
                  Real-time net profit analytics, acquisition wholesale rates, and financial trend curves are restricted to authenticated Admin Agent sessions.
                </span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ========================================================= */}
      {/* TAB 1: CREATED QUOTES & INVOICES RECORDS                  */}
      {/* ========================================================= */}
      {activeTab === 'quotes' && (
        <div className="space-y-4">
          {/* Search & Actions Toolbar */}
          <div className="p-3 rounded-xl bg-surface border border-white/10 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 sm:gap-3 text-xs">
            <div className="flex items-center gap-2 flex-1 w-full sm:w-auto">
              <Search className="w-4 h-4 text-slate-400 ml-1 flex-shrink-0" />
              <input
                type="text"
                value={quoteSearch}
                onChange={(e) => setQuoteSearch(e.target.value)}
                placeholder="Search quotes by client, quote #, invoice #, phone..."
                className="w-full bg-[#070A12] border border-white/10 rounded-lg px-3 py-1.5 text-white focus:outline-none focus:border-amber-500/60"
              />
            </div>

            {/* Quotation Creation Action */}
            {currentPermissions.quotationCreation && (
              <button
                onClick={() => setActiveTab('create_quote')}
                className="px-3.5 py-1.5 rounded-lg bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 font-bold font-black uppercase text-xs flex items-center justify-center gap-1.5 hover:brightness-110 shadow-sm shadow-amber-500/20 whitespace-nowrap active:scale-95"
                title="Create a new quotation"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>+ Create Quotation</span>
              </button>
            )}

            <div className="flex flex-wrap items-center gap-1.5">
              <span className="text-slate-400 font-bold">Filter:</span>
              <button
                onClick={() => setQuoteFilter('ALL')}
                className={`px-2.5 py-1 rounded text-xs font-bold transition-all ${
                  quoteFilter === 'ALL'
                    ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 font-bold shadow-sm'
                    : 'bg-[#070A12] text-slate-300 hover:text-white'
                }`}
              >
                All ({dateFilteredQuotes.length})
              </button>
              <button
                onClick={() => setQuoteFilter('pending')}
                className={`px-2.5 py-1 rounded text-xs font-bold transition-all ${
                  quoteFilter === 'pending'
                    ? 'bg-amber-400 text-black shadow-sm font-bold'
                    : 'bg-[#070A12] text-amber-300/80 hover:text-amber-300'
                }`}
              >
                Pending Review ({pendingQuotes.length})
              </button>
              <button
                onClick={() => setQuoteFilter('approved')}
                className={`px-2.5 py-1 rounded text-xs font-bold transition-all ${
                  quoteFilter === 'approved'
                    ? 'bg-cyan-400 text-black shadow-sm font-bold'
                    : 'bg-[#070A12] text-cyan-300/80 hover:text-cyan-300'
                }`}
              >
                Approved ({approvedQuotes.length})
              </button>
              <button
                onClick={() => setQuoteFilter('sales_invoice')}
                className={`px-2.5 py-1 rounded text-xs font-bold transition-all ${
                  quoteFilter === 'sales_invoice'
                    ? 'bg-emerald-500 text-black shadow-sm font-bold'
                    : 'bg-[#070A12] text-emerald-300/80 hover:text-emerald-300'
                }`}
              >
                Sales Invoices ({salesInvoices.length})
              </button>
            </div>
          </div>

          {/* Mobile Quotes & Invoices Cards (sm:hidden) */}
          <div className="sm:hidden space-y-3">
            {filteredQuotes.length === 0 ? (
              <div className="p-6 rounded-xl bg-surface border border-white/10 text-center text-slate-400 text-xs">
                No quotation or sales invoice records found.
              </div>
            ) : (
              filteredQuotes.map((rec) => {
                const isInvoice = rec.type === 'sales_invoice';
                const isApproved = !isInvoice && rec.status === 'Approved';
                const isPending = !isInvoice && rec.status !== 'Approved';
                return (
                  <div
                    key={rec.id}
                    className="p-3.5 rounded-xl bg-surface border border-white/10 space-y-2.5 shadow-lg"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="font-mono font-bold text-white text-xs">
                          {isInvoice ? rec.invoiceNumber || rec.id : rec.id}
                        </div>
                        <div className="flex items-center gap-1.5 mt-1">
                          <span
                            className={`inline-block px-2 py-0.5 rounded text-[9.5px] font-bold uppercase ${
                              isInvoice
                                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                                : isApproved
                                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                                : 'bg-amber-500/20 text-amber-400 border border-amber-500/40'
                            }`}
                          >
                            {isInvoice
                              ? 'SALES INVOICE'
                              : isApproved
                              ? 'APPROVED'
                              : 'PENDING REVIEW'}
                          </span>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-mono font-black text-amber-400 text-sm">
                          AED {formatCurrency(rec.grandTotal)}
                        </div>
                        <span className="text-[9.5px] text-slate-400 block">(Inc. 5% VAT)</span>
                      </div>
                    </div>

                    <div className="p-2.5 rounded-lg bg-[#070A12] border border-white/10 text-xs space-y-1">
                      <div className="text-white font-bold">{rec.customerName}</div>
                      <div className="text-slate-400 text-[11px] truncate">
                        {rec.contactNumber} • {rec.customerDetails}
                      </div>
                      <div className="text-slate-400 text-[10.5px] pt-1 border-t border-white/10 flex justify-between">
                        <span>Date: {isInvoice && rec.invoiceDate ? rec.invoiceDate : rec.date}</span>
                        <span>{rec.items?.length || 0} machines {rec.additionalCharges?.length > 0 ? `+${rec.additionalCharges.length} charges` : ''}</span>
                      </div>
                      {isInvoice && rec.selectedTerms && (
                        <div className="pt-1 flex items-center gap-1 text-[10.5px] text-amber-300">
                          <FileText className="w-3 h-3 text-amber-400 flex-shrink-0" />
                          <span className="truncate">{rec.selectedTerms.name}</span>
                        </div>
                      )}
                    </div>

                    <div className="flex flex-wrap items-center gap-2 pt-1">
                      {/* If Pending: Review & Update button */}
                      {isPending && (
                        <button
                          onClick={() => openReviewModal(rec)}
                          className="py-1.5 px-2.5 rounded-lg bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/40 text-amber-300 font-bold text-xs uppercase tracking-wider flex items-center gap-1"
                          title="Review & Update Quotation"
                        >
                          <FileText className="w-3.5 h-3.5 text-amber-400" />
                          <span>Review & Update</span>
                        </button>
                      )}

                      {/* If Pending & quotationApproval: Quick Approve */}
                      {isPending && currentPermissions.quotationApproval && (
                        <button
                          onClick={() => {
                            approveQuoteRecord(rec.id);
                            alert(`Quotation #${rec.id} has been Approved and locked! It is now ready for Invoice Generation.`);
                          }}
                          className="py-1.5 px-2.5 rounded-lg bg-cyan-500/15 hover:bg-cyan-500/25 border border-cyan-500/30 text-cyan-300 font-bold text-xs uppercase tracking-wider flex items-center gap-1"
                          title="Approve Quotation"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400" />
                          <span>Approve</span>
                        </button>
                      )}

                      {/* If Pending: Needs Approval indicator */}
                      {isPending && (
                        <span className="flex-1 py-1.5 px-2.5 rounded-lg bg-[#070A12] border border-white/10 text-slate-500 text-[10px] font-mono flex items-center justify-center gap-1 cursor-not-allowed" title="Quotation must be Approved by Finance before generating Invoice">
                          <Clock className="w-3 h-3 text-amber-400/70" />
                          <span>Needs Approval</span>
                        </span>
                      )}

                      {/* If Approved: View Quote (read-only) */}
                      {isApproved && (
                        <button
                          onClick={() => openReviewModal(rec)}
                          className="py-1.5 px-2.5 rounded-lg bg-surface hover:bg-[#1E2839] border border-white/10 text-slate-300 hover:text-white font-bold text-xs flex items-center gap-1"
                          title="View Approved Quotation (Locked)"
                        >
                          <FileText className="w-3.5 h-3.5 text-cyan-400" />
                          <span>View Quote</span>
                        </button>
                      )}

                      {/* If Approved: Button changes to Generate Invoice! */}
                      {isApproved && (
                        currentPermissions.salesConversion ? (
                          <button
                            onClick={() => openInvoicePreview(rec)}
                            className="flex-1 py-1.5 px-2.5 rounded-lg bg-gradient-to-r from-emerald-500 to-emerald-600 hover:brightness-110 text-slate-950 font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 shadow-md shadow-emerald-500/20 active:scale-95"
                            title="Generate Official Sales Invoice"
                          >
                            <Percent className="w-3.5 h-3.5" />
                            <span>Generate Invoice</span>
                          </button>
                        ) : (
                          <span className="flex-1 py-1.5 px-2.5 rounded-lg bg-[#070A12] border border-white/10 text-slate-500 text-[10px] font-mono flex items-center justify-center gap-1 cursor-not-allowed" title="Generating Sales Invoice requires Approval Role">
                            <Lock className="w-3 h-3 text-slate-500" />
                            <span>Generate Invoice (Approval Required)</span>
                          </span>
                        )
                      )}

                      {/* If Invoice: Invoice Active */}
                      {isInvoice && (
                        <div className="flex-1 py-1.5 px-2.5 rounded-lg bg-emerald-900/30 border border-emerald-500/30 text-emerald-300 text-xs font-bold flex items-center justify-center gap-1.5">
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

                      {currentPermissions.productionCrud && (
                        <button
                          onClick={() => {
                            if (confirm(`Delete record ${rec.id}?`)) {
                              deleteQuoteRecord(rec.id);
                            }
                          }}
                          className="p-2 rounded-lg bg-[#1E2839] hover:bg-red-600 text-slate-400 hover:text-white"
                          title="Delete Record (Admin / Dev Team)"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Records Table (Desktop / Tablet) */}
          <div className="hidden sm:block overflow-x-auto rounded-xl border border-white/10 bg-surface">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-[#0A0D14] text-slate-400 font-bold uppercase border-b border-white/10 text-[11px]">
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
                    const isApproved = !isInvoice && rec.status === 'Approved';
                    const isPending = !isInvoice && rec.status !== 'Approved';
                    return (
                      <tr key={rec.id} className="hover:bg-[#070A12] transition-colors">
                        {/* Doc ID & Type */}
                        <td className="p-3">
                          <div className="font-mono font-bold text-white text-xs">
                            {isInvoice ? rec.invoiceNumber || rec.id : rec.id}
                          </div>
                          <span
                            className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase mt-1 ${
                              isInvoice
                                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                                : isApproved
                                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                                : 'bg-amber-500/20 text-amber-400 border border-amber-500/40'
                            }`}
                          >
                            {isInvoice
                              ? 'SALES INVOICE'
                              : isApproved
                              ? 'APPROVED'
                              : 'PENDING REVIEW'}
                          </span>
                          {isInvoice && rec.selectedTerms && (
                            <div className="mt-1 flex items-center gap-1 max-w-[190px]" title={rec.selectedTerms.name}>
                              <FileText className="w-3 h-3 text-amber-400 flex-shrink-0" />
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
                            {/* If Pending: Review & Update button */}
                            {isPending && (
                              <button
                                onClick={() => openReviewModal(rec)}
                                className="px-2.5 py-1 rounded bg-amber-500/15 hover:bg-amber-500/25 text-amber-300 border border-amber-500/40 font-bold text-[11px] flex items-center gap-1 shadow-sm transition-all"
                                title="Review and update quotation details and prices before approval"
                              >
                                <FileText className="w-3.5 h-3.5 text-amber-400" />
                                <span>Review & Update</span>
                              </button>
                            )}

                            {/* If Pending: Quick Approve button */}
                            {isPending && currentPermissions.quotationApproval && (
                              <button
                                onClick={() => {
                                  approveQuoteRecord(rec.id);
                                  alert(`Quotation #${rec.id} has been Approved and locked! It is now ready for Invoice Generation.`);
                                }}
                                className="px-2 py-1 rounded bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/40 font-bold text-[11px] flex items-center gap-1 shadow-sm transition-all"
                                title="Approve Quotation"
                              >
                                <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400" />
                                <span>Approve</span>
                              </button>
                            )}

                            {/* If Pending: Disabled Invoice indicator */}
                            {isPending && (
                              <span
                                className="px-2 py-1 rounded bg-[#070A12] border border-white/10 text-slate-500 font-semibold text-[10px] flex items-center gap-1 cursor-not-allowed"
                                title="Quotation must be Approved by Finance before generating Sales Invoice"
                              >
                                <Clock className="w-3 h-3 text-amber-400/60" />
                                <span>Needs Approval</span>
                              </span>
                            )}

                            {/* If Approved: View Quote (read-only) */}
                            {isApproved && (
                              <button
                                onClick={() => openReviewModal(rec)}
                                className="px-2 py-1 rounded bg-[#070A12] hover:bg-[#1E2839] text-slate-300 hover:text-white border border-white/10 font-bold text-[11px] flex items-center gap-1 shadow-sm transition-all"
                                title="View Approved Quotation (Locked)"
                              >
                                <FileText className="w-3.5 h-3.5 text-cyan-400" />
                                <span>View Quote</span>
                              </button>
                            )}

                            {/* If Approved: Button changes to Generate Invoice! */}
                            {isApproved && (
                              currentPermissions.salesConversion ? (
                                <button
                                  onClick={() => openInvoicePreview(rec)}
                                  className="px-2.5 py-1 rounded bg-gradient-to-r from-emerald-500 to-emerald-600 hover:brightness-110 text-slate-950 font-bold text-[11px] uppercase tracking-wider flex items-center gap-1 shadow-sm transition-all active:scale-95"
                                  title="Approved: Click to select terms and generate Sales Invoice"
                                >
                                  <Percent className="w-3.5 h-3.5" />
                                  <span>Generate Invoice</span>
                                </button>
                              ) : (
                                <span
                                  className="px-2 py-1 rounded bg-[#070A12] border border-white/10 text-slate-500 font-semibold text-[10px] flex items-center gap-1 cursor-not-allowed"
                                  title="Generating Sales Invoice requires Approval Officer role"
                                >
                                  <Lock className="w-3 h-3 text-slate-500" />
                                  <span>Approval Required</span>
                                </span>
                              )
                            )}

                            {/* If Sales Invoice: Invoice Active */}
                            {isInvoice && (
                              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-900/40 text-emerald-300 flex items-center gap-1">
                                <CheckCircle className="w-3 h-3 text-emerald-400" />
                                <span>Invoice Active</span>
                              </span>
                            )}

                            {/* Download PDF */}
                            <button
                              onClick={() => handleDownloadInvoicePdf(rec)}
                              className="p-1.5 rounded bg-[#1E2839] hover:bg-blue-600 text-slate-200 hover:text-white transition-colors"
                              title="Download PDF"
                            >
                              <Download className="w-3.5 h-3.5" />
                            </button>

                            {/* Delete Quote (Admin Agent Only) */}
                            {currentPermissions.productionCrud && (
                              <button
                                onClick={() => {
                                  if (confirm(`Delete record ${rec.id}?`)) {
                                    deleteQuoteRecord(rec.id);
                                  }
                                }}
                                className="p-1.5 rounded bg-[#1E2839] hover:bg-red-600 text-slate-400 hover:text-white transition-colors"
                                title="Delete Record (Admin Agent Only)"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            )}
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
      {/* TAB: CREATE QUOTATION TERMINAL                           */}
      {/* ========================================================= */}
      {activeTab === 'create_quote' && (
        <CreateQuotationTab onQuotationCreated={() => setActiveTab('quotes')} />
      )}

      {/* ========================================================= */}
      {/* TAB 2: PRODUCTS CATALOG & STOCK QTY (CRUD)                */}
      {/* ========================================================= */}
      {activeTab === 'products' && (
        <div className="space-y-4">
          <div className="p-3.5 sm:p-4 rounded-xl bg-surface border border-white/10 flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-2.5 sm:gap-3 text-xs">
            {/* Search Input with Clear Button */}
            <div className="relative flex-1 w-full lg:w-auto">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={prodSearch}
                onChange={(e) => setProdSearch(e.target.value)}
                placeholder="Search products by model code, name, category, or price..."
                className="w-full bg-[#070A12] border border-white/10 rounded-lg pl-9 pr-8 py-1.5 text-white focus:outline-none focus:border-amber-500/60"
              />
              {prodSearch && (
                <button
                  onClick={() => setProdSearch('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-white font-mono"
                  title="Clear search"
                >
                  ✕
                </button>
              )}
            </div>

            {/* Category Filter, Sort & Action Controls */}
            <div className="flex flex-wrap items-center gap-2 w-full lg:w-auto justify-between lg:justify-start">
              {/* Category Dropdown */}
              <select
                value={prodCategoryFilter}
                onChange={(e) => setProdCategoryFilter(e.target.value)}
                className="bg-[#070A12] border border-white/10 rounded-lg px-2.5 py-1.5 text-white text-xs focus:outline-none focus:border-amber-500/60 flex-1 sm:flex-initial"
              >
                <option value="ALL">All Categories ({products.length})</option>
                <option value="Cardio">Cardio</option>
                <option value="Strength">All Strength (49)</option>
                <option value="Plate Loaded">Plate Loaded</option>
                <option value="Strength & Cables">Strength & Cables</option>
                <option value="Free Weights & Benches">Free Weights & Benches</option>
                <option value="Core & Specialty">Core & Specialty / Accessories</option>
              </select>

              {/* Sort Dropdown */}
              <div className="flex items-center gap-1 bg-[#070A12] border border-white/10 rounded-lg px-2 py-1 text-xs text-slate-300">
                <ArrowUpDown className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" />
                <select
                  value={prodSort}
                  onChange={(e) => setProdSort(e.target.value)}
                  className="bg-transparent text-xs text-white focus:outline-none cursor-pointer pr-1"
                >
                  <option value="default" className="bg-slate-900 text-white">Default Sort</option>
                  <option value="price_asc" className="bg-slate-900 text-white">Price: Low to High (AED ↑)</option>
                  <option value="price_desc" className="bg-slate-900 text-white">Price: High to Low (AED ↓)</option>
                  <option value="stock_desc" className="bg-slate-900 text-white">Stock: High to Low</option>
                  <option value="stock_asc" className="bg-slate-900 text-white">Stock: Low to High</option>
                  <option value="name_asc" className="bg-slate-900 text-white">Name: A → Z</option>
                  <option value="code_asc" className="bg-slate-900 text-white">Model Code: A → Z</option>
                </select>
              </div>

              {currentPermissions.productionCrud ? (
                <button
                  onClick={() => {
                    setEditingProduct(null);
                    setIsAddProductOpen(true);
                  }}
                  className="px-3.5 py-1.5 sm:py-2 rounded-lg bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 font-bold font-black uppercase text-xs flex items-center gap-1.5 hover:brightness-110 whitespace-nowrap flex-shrink-0"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Product</span>
                </button>
              ) : (
                <div className="px-3 py-1.5 sm:py-2 rounded-lg bg-slate-800/80 border border-white/10 text-slate-400 text-xs font-semibold flex items-center gap-1.5 whitespace-nowrap flex-shrink-0">
                  <ShieldCheck className="w-3.5 h-3.5 text-slate-500" />
                  <span>Catalog View Only</span>
                </div>
              )}
            </div>
          </div>

          {/* Mobile Products Cards (sm:hidden) */}
          <div className="sm:hidden space-y-3">
            {paginatedAdminProducts.map((p) => (
              <div
                key={p.code}
                className="p-3.5 rounded-xl bg-surface border border-white/10 space-y-3 shadow-lg"
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
                      <span className="font-mono font-bold text-amber-400 text-xs">
                        #{p.code}
                      </span>
                      <span className="text-[9.5px] px-1.5 py-0.5 rounded bg-[#070A12] border border-white/10 text-slate-300 uppercase">
                        {p.category}
                      </span>
                    </div>
                    <h4 className="font-bold text-white text-xs mt-1 truncate">{p.name}</h4>
                    <div className="font-mono font-bold text-white text-xs mt-0.5">
                      AED {formatCurrency(p.price)}
                    </div>
                    {/* Admin Only: Cost & Margin */}
                    {currentPermissions.purchaseAmountModification && (
                      <div className="flex flex-wrap items-center gap-2 mt-1 text-[11px] font-mono">
                        <span className="text-amber-400 bg-amber-500/10 px-1.5 py-0.5 rounded border border-amber-500/20">
                          Cost: AED {formatCurrency(p.purchaseRate !== undefined ? p.purchaseRate : Math.round(p.price * 0.65))}
                        </span>
                        <span className="text-emerald-400 font-bold">
                          Margin: +AED {formatCurrency((p.price || 0) - (p.purchaseRate !== undefined ? p.purchaseRate : Math.round(p.price * 0.65)))}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-white/10">
                  {currentPermissions.productionCrud ? (
                    <>
                      <div className="flex items-center gap-1 bg-[#070A12] border border-white/10 rounded-lg p-1">
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
                          className="w-7 h-7 rounded bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 font-bold hover:brightness-110 flex items-center justify-center font-bold"
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
                    </>
                  ) : (
                    <div className="w-full flex items-center justify-between text-xs">
                      <span className="text-slate-400">Stock Available:</span>
                      <span className="font-mono font-bold text-slate-200">
                        {p.stockQty !== undefined ? p.stockQty : 10} units
                      </span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Products Table (Desktop / Tablet) */}
          <div className="hidden sm:block overflow-x-auto rounded-xl border border-white/10 bg-surface">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-[#0A0D14] text-slate-400 font-bold uppercase border-b border-white/10 text-[11px]">
                  <th className="p-3 w-16">Image</th>
                  <th className="p-3">Code / Category</th>
                  <th className="p-3">Product Name & Specifications</th>
                  <th className="p-3 text-right">Selling Price (AED)</th>
                  {currentPermissions.purchaseAmountModification && (
                    <>
                      <th className="p-3 text-right">
                        <div className="inline-flex items-center gap-1.5 justify-end">
                          <span>Purchase Rate (AED)</span>
                          <span className="text-[9px] font-mono px-1 py-0.2 rounded bg-amber-500/20 text-amber-400 border border-amber-500/30">
                            Admin Only
                          </span>
                        </div>
                      </th>
                      <th className="p-3 text-right">Gross Margin</th>
                    </>
                  )}
                  <th className="p-3 text-center w-36">Warehouse Stock (Qty)</th>
                  <th className="p-3 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1E2839]">
                {paginatedAdminProducts.map((p) => {
                  const cost = Number(p.purchaseRate !== undefined ? p.purchaseRate : Math.round(p.price * 0.65));
                  const marginAed = (p.price || 0) - cost;
                  const marginPct = p.price > 0 ? ((marginAed / p.price) * 100).toFixed(1) : '0.0';

                  return (
                    <tr key={p.code} className="hover:bg-[#070A12] transition-colors">
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
                        <span className="font-mono font-bold text-amber-400 text-xs block">
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

                      {/* Purchase Rate & Margin (Admin Agent Only) */}
                      {currentPermissions.purchaseAmountModification && (
                        <>
                          <td className="p-3 text-right font-mono text-amber-400 font-bold">
                            AED {formatCurrency(cost)}
                          </td>
                          <td className="p-3 text-right font-mono">
                            <span className="text-emerald-400 font-bold block text-xs">
                              +AED {formatCurrency(marginAed)}
                            </span>
                            <span className="text-[10px] text-emerald-400/80 font-mono">
                              ({marginPct}%)
                            </span>
                          </td>
                        </>
                      )}

                      {/* Stock Qty Modifier */}
                      <td className="p-3 text-center">
                        {currentPermissions.productionCrud ? (
                          <div className="inline-flex items-center gap-1.5 bg-[#070A12] border border-white/10 rounded-lg p-1">
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
                              className="w-6 h-6 rounded bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 font-bold hover:brightness-110 flex items-center justify-center font-bold"
                            >
                              +
                            </button>
                          </div>
                        ) : (
                          <span className="font-mono font-bold text-slate-300 text-xs px-2 py-1 rounded bg-[#070A12] border border-white/10">
                            {p.stockQty !== undefined ? p.stockQty : 10} units
                          </span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="p-3 text-center">
                        {currentPermissions.productionCrud ? (
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
                        ) : (
                          <span className="text-slate-500 text-[11px] italic">Read-only</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Products Pagination Bar */}
          <div className="pt-4 border-t border-white/10">
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
        <div className="max-w-3xl mx-auto p-6 rounded-2xl bg-surface border border-white/10 space-y-6">
          <div>
            <h2 className="font-oswald text-xl font-bold text-white uppercase tracking-wider">
              EDIT COMPANY LOGO & CORPORATE BRANDING
            </h2>
            <p className="text-slate-400 text-xs mt-1">
              Changes reflect immediately on storefront headers, footers, PDF quotations, and commercial tax invoices.
            </p>
          </div>

          {/* Logo Customizer */}
          <div className="p-4 rounded-xl bg-[#070A12] border border-white/10 space-y-4">
            <label className="text-xs font-bold text-amber-400 uppercase tracking-wider block">
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
                  className="accent-amber-500"
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
                  className="accent-amber-500"
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
                    className="w-full text-xs text-slate-300 file:mr-3 file:py-1.5 file:px-3 file:rounded-md file:border-0 file:text-xs file:font-bold file:bg-amber-500 file:text-slate-950 font-bold cursor-pointer"
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
                    className="w-full bg-surface border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-amber-500/60"
                  />
                </div>

                {/* Preview */}
                {companySettings.customLogoUrl && (
                  <div className="p-3 bg-[#0A0D14] rounded-lg border border-white/10 flex items-center gap-3">
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
                className="w-full bg-[#070A12] border border-white/10 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-amber-500/60"
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
                className="w-full bg-[#070A12] border border-white/10 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-amber-500/60"
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
                className="w-full bg-[#070A12] border border-white/10 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-amber-500/60"
              />
            </div>

            <div>
              <label className="text-slate-300 font-bold block mb-1">TRN / VAT Number</label>
              <input
                type="text"
                value={companySettings.trn || ''}
                onChange={(e) =>
                  setCompanySettings((prev) => ({ ...prev, trn: e.target.value }))
                }
                className="w-full bg-[#070A12] border border-white/10 rounded-lg px-3 py-2 text-white font-mono focus:outline-none focus:border-amber-500/60"
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
                className="w-full bg-[#070A12] border border-white/10 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-amber-500/60"
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
                className="w-full bg-[#070A12] border border-white/10 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-amber-500/60"
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
                className="w-full bg-[#070A12] border border-white/10 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-amber-500/60"
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
                className="w-full bg-[#070A12] border border-white/10 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-amber-500/60"
              />
            </div>
          </div>

          <div className="pt-2">
            <button
              onClick={() => alert('Brand & Logo settings saved and persisted successfully!')}
              className="px-6 py-2.5 rounded-lg bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 font-bold font-black uppercase text-xs hover:brightness-110 shadow-md shadow-amber-500/20"
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
          <div className="p-4 rounded-xl bg-surface border border-white/10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
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
              className="px-3.5 py-2 rounded-lg bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 font-bold font-black uppercase text-xs flex items-center gap-1.5 hover:brightness-110"
            >
              <Plus className="w-4 h-4" />
              <span>Add Bank Account</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {bankAccounts.map((b) => (
              <div
                key={b.id}
                className="p-5 rounded-xl bg-surface border border-white/10 space-y-3 relative group"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CreditCard className="w-5 h-5 text-amber-400" />
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
                  <p className="text-amber-400">
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
      {/* TAB 7: SYSTEM & ACCESS CONFIG (Super Admin Only)          */}
      {/* ========================================================= */}
      {activeTab === 'system_config' && currentRole === ROLES.SUPER_ADMIN && (
        <SystemConfigTab />
      )}

      {/* ========================================================= */}
      {/* MODAL: QUOTATION REVIEW & UPDATE (Finance & Admin)        */}
      {/* Story flow stage 2: Finance review, modify prices, and    */}
      {/* approve. Once approved, locked against further changes.   */}
      {/* ========================================================= */}
      {reviewingQuote && (() => {
        const isApproved = reviewingQuote.status === 'Approved' || reviewingQuote.type === 'sales_invoice';
        const isPending = !isApproved;
        const canModify = isPending && currentPermissions.quotationModification;
        const canApprove = isPending && currentPermissions.quotationApproval;

        return (
          <div className="fixed inset-0 z-50 overflow-y-auto bg-black/80 backdrop-blur-sm p-2 sm:p-6 flex items-center justify-center">
            <div
              className={`w-full max-w-5xl bg-surface border-2 ${
                isApproved ? 'border-cyan-500/40' : 'border-amber-500/40'
              } rounded-xl sm:rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[96vh] sm:max-h-[92vh]`}
            >
              {/* Modal Header */}
              <div className="p-4 sm:p-5 bg-[#0A0D14] border-b border-white/10 flex items-center justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <div
                    className={`p-2 rounded-lg font-bold font-black ${
                      isApproved
                        ? 'bg-gradient-to-r from-cyan-500 to-cyan-600 text-slate-950'
                        : 'bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950'
                    }`}
                  >
                    {isApproved ? <ShieldCheck className="w-5 h-5" /> : <FileText className="w-5 h-5" />}
                  </div>
                  <div>
                    <h3 className="font-oswald text-lg sm:text-xl font-black text-white tracking-wide uppercase">
                      {isApproved
                        ? `QUOTATION #${reviewingQuote.id} (APPROVED & LOCKED)`
                        : `FINANCE REVIEW & QUOTATION UPDATE: #${reviewingQuote.id}`}
                    </h3>
                    <p className="text-slate-400 text-xs">
                      {isApproved
                        ? 'This quotation is officially approved. Equipment prices, quantities, and additional charges are locked.'
                        : 'Review line items, adjust unit prices and quantities, add logistics charges, and grant official approval.'}
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => setReviewingQuote(null)}
                  className="text-slate-400 hover:text-white p-1 text-sm font-bold"
                >
                  ✕
                </button>
              </div>

              {/* Status Banner */}
              <div className="px-5 pt-4">
                {isApproved ? (
                  <div className="p-3 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-between gap-3 text-xs">
                    <div className="flex items-center gap-2">
                      <ShieldCheck className="w-4 h-4 text-cyan-400 flex-shrink-0" />
                      <span className="text-cyan-300 font-semibold">
                        Quotation is Approved & Locked: Unit prices and line items are locked per governance policy. It is now ready for Invoice Generation.
                      </span>
                    </div>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold font-mono bg-cyan-500/20 text-cyan-200 border border-cyan-500/40 uppercase whitespace-nowrap">
                      APPROVED
                    </span>
                  </div>
                ) : (
                  <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-between gap-3 text-xs">
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-amber-400 flex-shrink-0" />
                      <span className="text-amber-300 font-semibold">
                        Stage 2 Review: Finance Agents and Administrators can modify line item unit prices, quantities, client details, and additional charges below prior to granting approval.
                      </span>
                    </div>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold font-mono bg-amber-500/20 text-amber-200 border border-amber-500/40 uppercase whitespace-nowrap">
                      PENDING REVIEW
                    </span>
                  </div>
                )}

                {reviewSaveMsg && (
                  <div className="mt-2.5 p-2.5 rounded-lg bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-semibold flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                    <span>{reviewSaveMsg}</span>
                  </div>
                )}
              </div>

              {/* Modal Body */}
              <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6">
                {/* Customer Details */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-4 rounded-xl bg-[#070A12] border border-white/10 text-xs">
                  <div>
                    <label className="text-slate-400 block font-bold mb-1">Client / Gym Name</label>
                    {canModify ? (
                      <input
                        type="text"
                        value={reviewCustomerName}
                        onChange={(e) => setReviewCustomerName(e.target.value)}
                        className="w-full bg-surface border border-white/10 rounded px-2.5 py-1 text-white font-semibold focus:outline-none focus:border-amber-500/60"
                      />
                    ) : (
                      <div className="text-white font-bold text-sm">{reviewCustomerName}</div>
                    )}
                  </div>

                  <div>
                    <label className="text-slate-400 block font-bold mb-1">Contact Number</label>
                    {canModify ? (
                      <input
                        type="text"
                        value={reviewContactNumber}
                        onChange={(e) => setReviewContactNumber(e.target.value)}
                        className="w-full bg-surface border border-white/10 rounded px-2.5 py-1 text-white font-semibold focus:outline-none focus:border-amber-500/60"
                      />
                    ) : (
                      <div className="text-slate-300 font-medium">{reviewContactNumber}</div>
                    )}
                  </div>

                  <div>
                    <label className="text-slate-400 block font-bold mb-1">Delivery / Warehouse Address</label>
                    {canModify ? (
                      <input
                        type="text"
                        value={reviewCustomerDetails}
                        onChange={(e) => setReviewCustomerDetails(e.target.value)}
                        className="w-full bg-surface border border-white/10 rounded px-2.5 py-1 text-white font-semibold focus:outline-none focus:border-amber-500/60"
                      />
                    ) : (
                      <div className="text-slate-300 font-medium">{reviewCustomerDetails}</div>
                    )}
                  </div>
                </div>

                {/* Line Items Table */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <h4 className="font-oswald text-sm font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                      <Package className="w-4 h-4 text-amber-400" />
                      <span>
                        EQUIPMENT LINE ITEMS {isApproved ? '(LOCKED)' : '(FINANCE PRICING & QUANTITY CONTROL)'}
                      </span>
                    </h4>
                    <span className="text-[11px] text-amber-400 font-semibold">
                      {isApproved
                        ? 'Confirmed quotation line items (Locked)'
                        : canModify
                        ? '* Adjust unit prices & quantities below; totals recalculate automatically'
                        : 'Quotation line items'}
                    </span>
                  </div>

                  {/* Mobile Item Cards for Review (sm:hidden) */}
                  <div className="sm:hidden space-y-3">
                    {reviewItems.map((item, idx) => {
                      const original = Number(item.originalPrice || item.product?.price || 0);
                      const current = Number(item.unitPrice);
                      const isModified = current !== original;

                      return (
                        <div
                          key={idx}
                          className="p-3.5 rounded-xl bg-[#0A0D14] border border-white/10 space-y-2.5"
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex-1 min-w-0">
                              <span className="font-mono font-bold text-xs text-amber-400">
                                #{idx + 1} • {item.product?.code || `ITEM-${idx + 1}`}
                              </span>
                              <h5 className="font-bold text-white text-xs mt-0.5 leading-snug truncate">
                                {item.product?.name || 'Equipment Station'}
                              </h5>
                              <span className="text-[10px] text-slate-400 block mt-0.5">
                                {item.product?.category}
                              </span>
                            </div>
                            <div className="text-right flex-shrink-0">
                              <span className="text-[10px] text-slate-400 block">Catalog</span>
                              <span className="text-xs font-mono text-slate-400">
                                AED {formatCurrency(original)}
                              </span>
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-2 pt-2 border-t border-white/10">
                            <div>
                              <label className="text-[10px] font-bold text-amber-400 uppercase block mb-1">
                                Unit Price (AED)
                              </label>
                              {canModify && currentPermissions.unitPriceModification ? (
                                <div className="flex items-center gap-1 bg-[#070A12] border border-amber-500/40 rounded-lg px-2 py-1.5">
                                  <span className="text-[10px] text-amber-400 font-bold">AED</span>
                                  <input
                                    type="number"
                                    value={item.unitPrice}
                                    onChange={(e) => handleReviewItemPriceChange(idx, e.target.value)}
                                    className="w-full text-right bg-transparent text-white font-mono font-bold text-xs focus:outline-none"
                                  />
                                </div>
                              ) : (
                                <div className="flex items-center gap-1 bg-[#070A12] border border-white/10 rounded-lg px-2 py-1.5">
                                  <span className="text-[10px] text-slate-400">AED</span>
                                  <span className="w-full text-right text-white font-mono font-bold text-xs">
                                    {formatCurrency(item.unitPrice)}
                                  </span>
                                </div>
                              )}
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
                              {canModify ? (
                                <input
                                  type="number"
                                  min={1}
                                  value={item.quantity}
                                  onChange={(e) => handleReviewItemQuantityChange(idx, e.target.value)}
                                  className="w-full bg-[#070A12] border border-white/10 rounded-lg py-1.5 px-2 text-center text-white font-bold text-xs focus:outline-none focus:border-amber-500/60"
                                />
                              ) : (
                                <div className="w-full bg-[#070A12] border border-white/10 rounded-lg py-1.5 px-2 text-center text-white font-bold text-xs font-mono">
                                  {item.quantity}
                                </div>
                              )}
                            </div>
                          </div>

                          <div className="flex justify-between items-center pt-2 border-t border-white/10 text-xs">
                            <span className="text-slate-400 text-[11px]">Line Total:</span>
                            <span className="font-mono font-black text-white text-sm">
                              AED {formatCurrency(item.unitPrice * item.quantity)}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Desktop Table for Review Items */}
                  <div className="hidden sm:block overflow-x-auto rounded-xl border border-white/10 bg-[#0A0D14]">
                    <table className="w-full text-xs text-left min-w-[580px]">
                      <thead>
                        <tr className="bg-[#070A12] text-slate-400 font-bold border-b border-white/10 text-[11px]">
                          <th className="p-3">#</th>
                          <th className="p-3">Equipment Product</th>
                          <th className="p-3 text-right">Catalog Price</th>
                          <th className="p-3 text-right text-amber-400">
                            {canModify && currentPermissions.unitPriceModification
                              ? 'Unit Price (AED) *'
                              : 'Unit Price (AED)'}
                          </th>
                          <th className="p-3 text-center">Qty</th>
                          <th className="p-3 text-right">Line Total (AED)</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#1E2839]">
                        {reviewItems.map((item, idx) => {
                          const original = Number(item.originalPrice || item.product?.price || 0);
                          const current = Number(item.unitPrice);
                          const isModified = current !== original;

                          return (
                            <tr key={idx} className="hover:bg-[#070A12]/50">
                              <td className="p-3 font-bold text-slate-400">{idx + 1}</td>
                              <td className="p-3">
                                <div className="font-bold text-white text-xs">
                                  {item.product?.name || 'Equipment'}
                                </div>
                                <span className="font-mono text-[10px] text-slate-400">
                                  #{item.product?.code} • {item.product?.category}
                                </span>
                              </td>
                              <td className="p-3 text-right font-mono text-slate-400">
                                AED {formatCurrency(original)}
                              </td>
                              <td className="p-3 text-right">
                                {canModify && currentPermissions.unitPriceModification ? (
                                  <>
                                    <div className="inline-flex items-center gap-1 bg-surface border border-amber-500/40 rounded-lg px-2 py-1">
                                      <span className="text-[10px] text-amber-400 font-bold">AED</span>
                                      <input
                                        type="number"
                                        value={item.unitPrice}
                                        onChange={(e) => handleReviewItemPriceChange(idx, e.target.value)}
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
                                  </>
                                ) : (
                                  <span className="font-mono font-bold text-white text-xs">
                                    AED {formatCurrency(item.unitPrice)}
                                  </span>
                                )}
                              </td>
                              <td className="p-3 text-center">
                                {canModify ? (
                                  <input
                                    type="number"
                                    min={1}
                                    value={item.quantity}
                                    onChange={(e) => handleReviewItemQuantityChange(idx, e.target.value)}
                                    className="w-14 text-center bg-surface border border-white/10 rounded py-1 text-white font-bold"
                                  />
                                ) : (
                                  <span className="font-mono font-bold text-white text-xs">
                                    {item.quantity}
                                  </span>
                                )}
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
                <div className="space-y-3 p-4 rounded-xl bg-[#070A12] border border-white/10">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-oswald text-xs font-bold text-white uppercase tracking-wider">
                        ADDITIONAL CHARGES (LOGISTICS, ASSEMBLY, RIGGING)
                      </h4>
                      <p className="text-[11px] text-slate-400">
                        {canModify
                          ? 'Add or adjust custom logistics, assembly, rubber flooring, or rigging surcharges.'
                          : 'Confirmed additional charges attached to this quotation.'}
                      </p>
                    </div>

                    {canModify && (
                      <button
                        type="button"
                        onClick={handleAddReviewCharge}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 font-bold font-black text-xs uppercase hover:brightness-110"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>+ Add Charge</span>
                      </button>
                    )}
                  </div>

                  {reviewCharges.length === 0 ? (
                    <p className="text-xs text-slate-500 italic">
                      {canModify
                        ? 'No additional charges added. Click "+ Add Charge" to attach delivery or installation fees.'
                        : 'No additional charges attached to this quotation.'}
                    </p>
                  ) : (
                    <div className="space-y-2 pt-1">
                      {reviewCharges.map((ch) => (
                        <div
                          key={ch.id}
                          className="flex items-center gap-2 bg-surface p-2 rounded-lg border border-white/10"
                        >
                          {canModify ? (
                            <>
                              <input
                                type="text"
                                value={ch.description}
                                onChange={(e) =>
                                  handleUpdateReviewCharge(ch.id, 'description', e.target.value)
                                }
                                placeholder="Charge Description (e.g. Delivery & Rigging across Dubai)"
                                className="flex-1 bg-[#070A12] border border-white/10 rounded px-3 py-1.5 text-xs text-white focus:outline-none focus:border-amber-500/60"
                              />
                              <div className="flex items-center gap-1">
                                <span className="text-xs font-bold text-amber-400">AED</span>
                                <input
                                  type="number"
                                  value={ch.amount}
                                  onChange={(e) =>
                                    handleUpdateReviewCharge(ch.id, 'amount', e.target.value)
                                  }
                                  placeholder="500"
                                  className="w-24 bg-[#070A12] border border-white/10 rounded px-2 py-1.5 text-xs text-white focus:outline-none focus:border-amber-500/60"
                                />
                              </div>
                              <button
                                type="button"
                                onClick={() => handleRemoveReviewCharge(ch.id)}
                                className="p-1.5 text-slate-400 hover:text-red-400"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </>
                          ) : (
                            <div className="flex-1 flex items-center justify-between text-xs px-2 py-1">
                              <span className="text-slate-200">{ch.description}</span>
                              <span className="font-mono font-bold text-amber-400">
                                AED {formatCurrency(ch.amount)}
                              </span>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Calculated Totals */}
                <div className="p-4 rounded-xl bg-[#0A0D14] border border-white/10 space-y-2 text-xs">
                  <div className="flex justify-between text-slate-300">
                    <span>Equipment Subtotal:</span>
                    <span className="font-mono text-white">AED {formatCurrency(reviewItemsSum)}</span>
                  </div>
                  {reviewChargesSum > 0 && (
                    <div className="flex justify-between text-amber-400">
                      <span>Additional Charges Total:</span>
                      <span className="font-mono">AED {formatCurrency(reviewChargesSum)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-slate-300">
                    <span>VAT (5%):</span>
                    <span className="font-mono text-white">AED {formatCurrency(reviewVat)}</span>
                  </div>
                  <div className="flex justify-between text-base font-black text-white pt-2 border-t border-white/10">
                    <span className="font-oswald tracking-wide">CONFIRMED QUOTATION GRAND TOTAL (AED):</span>
                    <span className="text-amber-400 font-mono text-lg">
                      AED {formatCurrency(reviewGrandTotal)}
                    </span>
                  </div>
                  <div className="text-[11px] font-serif italic text-slate-400 pt-1">
                    Amount in Words: {numberToWords(reviewGrandTotal)}
                  </div>
                </div>
              </div>

              {/* Modal Footer Actions */}
              <div className="p-3 sm:p-5 bg-[#0A0D14] border-t border-white/10 flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-between gap-2.5">
                <button
                  type="button"
                  onClick={() => setReviewingQuote(null)}
                  className="w-full sm:w-auto px-4 py-2.5 rounded-lg bg-[#070A12] border border-white/10 text-xs font-bold text-slate-300 hover:text-white text-center"
                >
                  Close
                </button>

                <div className="flex flex-wrap items-center gap-2">
                  {/* Save changes button (before approval) */}
                  {canModify && (
                    <button
                      type="button"
                      onClick={handleSaveReviewChanges}
                      className="px-4 py-2.5 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/50 text-amber-300 font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 active:scale-95"
                    >
                      <Save className="w-4 h-4 text-amber-400" />
                      <span>Save Changes</span>
                    </button>
                  )}

                  {/* Approve Quotation button (before approval) */}
                  {canApprove && (
                    <button
                      type="button"
                      onClick={handleApproveFromReview}
                      className="px-5 py-2.5 rounded-lg bg-gradient-to-r from-cyan-500 to-cyan-600 hover:brightness-110 text-slate-950 font-black text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 shadow-md shadow-cyan-500/20 active:scale-95"
                      title="Approve and Lock Quotation"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Approve Quotation</span>
                    </button>
                  )}

                  {/* Proceed to invoice generation (if already approved) */}
                  {isApproved && (
                    currentPermissions.salesConversion ? (
                      <button
                        type="button"
                        onClick={() => {
                          const q = reviewingQuote;
                          setReviewingQuote(null);
                          openInvoicePreview(q);
                        }}
                        className="px-5 py-2.5 rounded-lg bg-gradient-to-r from-emerald-500 to-emerald-600 hover:brightness-110 text-slate-950 font-black text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 shadow-md shadow-emerald-500/20 active:scale-95"
                      >
                        <Percent className="w-4 h-4" />
                        <span>Proceed to Generate Invoice →</span>
                      </button>
                    ) : (
                      <div className="px-4 py-2.5 rounded-lg bg-[#070A12] border border-white/10 text-slate-400 text-xs font-semibold flex items-center gap-1.5">
                        <Lock className="w-4 h-4 text-slate-500" />
                        <span>Ready for Invoice Generation (Approval Role)</span>
                      </div>
                    )
                  )}
                </div>
              </div>
            </div>
          </div>
        );
      })()}

      {/* ========================================================= */}
      {/* MODAL: OFFICIAL SALES INVOICE GENERATOR                   */}
      {/* (Stage 3: Approved quotations converted to official sales  */}
      {/* invoices. Pricing is locked as confirmed in Stage 2)      */}
      {/* ========================================================= */}
      {previewingQuote && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/80 backdrop-blur-sm p-2 sm:p-6 flex items-center justify-center">
          <div className="w-full max-w-5xl bg-surface border-2 border-emerald-500/40 rounded-xl sm:rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[96vh] sm:max-h-[92vh]">
            {/* Modal Header */}
            <div className="p-4 sm:p-5 bg-[#0A0D14] border-b border-white/10 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-lg bg-gradient-to-r from-emerald-500 to-emerald-600 text-slate-950 font-bold font-black">
                  <Percent className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-oswald text-lg sm:text-xl font-black text-white tracking-wide uppercase">
                    OFFICIAL SALES INVOICE GENERATOR
                  </h3>
                  <p className="text-slate-400 text-xs">
                    Converting Approved Quotation #{previewingQuote.id} to Sales Invoice • Pricing and items are confirmed & locked.
                  </p>
                </div>
              </div>

              <button
                onClick={() => setPreviewingQuote(null)}
                className="text-slate-400 hover:text-white p-1 text-sm font-bold"
              >
                ✕
              </button>
            </div>

            {/* Modal Scrollable Body */}
            <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6">
              {/* Status Banner */}
              <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center gap-2 text-xs">
                <ShieldCheck className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                <span className="text-emerald-300 font-semibold">
                  Approved Quotation Locked: Equipment unit prices, quantities, and additional charges were finalized during Finance Approval. Please choose the mandatory Terms & Conditions template and verify the sales invoice date.
                </span>
              </div>

              {/* Customer & Invoice Metadata */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-4 rounded-xl bg-[#070A12] border border-white/10 text-xs">
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
                    className="w-full bg-surface border border-white/10 rounded px-2.5 py-1 text-white font-semibold focus:outline-none focus:border-amber-500/60"
                  />
                </div>
              </div>

              {/* Line Items Table with Confirmed Approved Price */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="font-oswald text-sm font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-emerald-400" />
                    <span>EQUIPMENT LINE ITEMS (APPROVED & LOCKED)</span>
                  </h4>
                  <span className="text-[11px] text-emerald-400 font-semibold">
                    * Confirmed quotation line items and approved unit prices
                  </span>
                </div>

                {/* Mobile Item Cards (sm:hidden) */}
                <div className="sm:hidden space-y-3">
                  {overrideItems.map((item, idx) => {
                    const original = Number(item.originalPrice || item.product.price);
                    const current = Number(item.unitPrice);
                    const isModified = current !== original;

                    return (
                      <div
                        key={idx}
                        className="p-3.5 rounded-xl bg-[#0A0D14] border border-white/10 space-y-2.5"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1 min-w-0">
                            <span className="font-mono font-bold text-xs text-amber-400">
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
                            <span className="text-xs font-mono text-slate-400">
                              AED {formatCurrency(original)}
                            </span>
                          </div>
                        </div>

                        {/* Confirmed Price & Qty on Mobile */}
                        <div className="grid grid-cols-2 gap-2 pt-2 border-t border-white/10">
                          <div>
                            <label className="text-[10px] font-bold text-amber-400 uppercase block mb-1">
                              Approved Unit Price
                            </label>
                            <div className="flex items-center gap-1 bg-[#070A12] border border-white/10 rounded-lg px-2 py-1.5">
                              <span className="text-[10px] text-slate-400">AED</span>
                              <span className="w-full text-right text-white font-mono font-bold text-xs">
                                {formatCurrency(item.unitPrice)}
                              </span>
                            </div>
                            {isModified && (
                              <span className="block text-[9.5px] text-amber-400 font-bold mt-0.5">
                                {current < original
                                  ? `-${Math.round(((original - current) / original) * 100)}% Discount`
                                  : `+${Math.round(((current - original) / original) * 100)}% Adjusted`}
                              </span>
                            )}
                          </div>

                          <div>
                            <label className="text-[10px] font-bold text-slate-300 uppercase block mb-1">
                              Quantity
                            </label>
                            <div className="w-full bg-[#070A12] border border-white/10 rounded-lg py-1.5 px-2 text-center text-white font-bold text-xs font-mono">
                              {item.quantity}
                            </div>
                          </div>
                        </div>

                        <div className="flex justify-between items-center pt-2 border-t border-white/10 text-xs">
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
                <div className="hidden sm:block overflow-x-auto rounded-xl border border-white/10 bg-[#0A0D14]">
                  <table className="w-full text-xs text-left min-w-[580px]">
                    <thead>
                      <tr className="bg-[#070A12] text-slate-400 font-bold border-b border-white/10 text-[11px]">
                        <th className="p-3">#</th>
                        <th className="p-3">Product Station</th>
                        <th className="p-3 text-right">Catalog Price</th>
                        <th className="p-3 text-right text-amber-400">
                          Approved Unit Price (AED)
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
                          <tr key={idx} className="hover:bg-[#070A12]/50">
                            <td className="p-3 font-bold text-slate-400">{idx + 1}</td>
                            <td className="p-3">
                              <div className="font-bold text-white text-xs">
                                {item.product.name}
                              </div>
                              <span className="font-mono text-[10px] text-slate-400">
                                #{item.product.code} • {item.product.category}
                              </span>
                            </td>
                            <td className="p-3 text-right font-mono text-slate-400">
                              AED {formatCurrency(original)}
                            </td>
                            <td className="p-3 text-right">
                              <span className="font-mono font-bold text-white text-xs">
                                AED {formatCurrency(item.unitPrice)}
                              </span>
                              {isModified && (
                                <span className="block text-[10px] text-amber-400 font-bold mt-0.5">
                                  {current < original
                                    ? `-${Math.round(((original - current) / original) * 100)}% Discount`
                                    : `+${Math.round(((current - original) / original) * 100)}% Adjusted`}
                                </span>
                              )}
                            </td>
                            <td className="p-3 text-center">
                              <span className="font-mono font-bold text-white text-xs">
                                {item.quantity}
                              </span>
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
              <div className="space-y-3 p-4 rounded-xl bg-[#070A12] border border-white/10">
                <div>
                  <h4 className="font-oswald text-xs font-bold text-white uppercase tracking-wider">
                    CONFIRMED ADDITIONAL CHARGES (LOGISTICS, ASSEMBLY, RIGGING)
                  </h4>
                  <p className="text-[11px] text-slate-400">
                    Additional charges finalized on approved quotation.
                  </p>
                </div>

                {overrideCharges.length === 0 ? (
                  <p className="text-xs text-slate-500 italic">
                    No additional charges attached to this quotation.
                  </p>
                ) : (
                  <div className="space-y-2 pt-1">
                    {overrideCharges.map((ch) => (
                      <div
                        key={ch.id}
                        className="flex items-center justify-between bg-surface p-2.5 rounded-lg border border-white/10 text-xs"
                      >
                        <span className="text-slate-200">{ch.description}</span>
                        <span className="font-mono font-bold text-amber-400">
                          AED {formatCurrency(ch.amount)}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Mandatory Terms & Conditions Template Selection */}
              <div className="space-y-4 p-4 sm:p-5 rounded-xl bg-[#070A12] border border-white/10">
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/10 pb-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-oswald text-sm sm:text-base font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                        <FileText className="w-4 h-4 text-amber-400" />
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
                    className="text-[11px] text-slate-400 hover:text-slate-200 flex items-center gap-1.5 transition-colors px-2.5 py-1 rounded bg-surface border border-white/10"
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
                          className="p-4 rounded-xl bg-[#0A0D14] border-2 border-amber-500/40 space-y-3 shadow-lg shadow-amber-500/10"
                        >
                          <div className="flex items-center justify-between border-b border-white/10 pb-2">
                            <span className="text-xs font-bold text-amber-400 uppercase flex items-center gap-1">
                              <Edit2 className="w-3.5 h-3.5" />
                              <span>Editing Template #{tIdx + 1}</span>
                            </span>
                            <div className="flex items-center gap-2">
                              <button
                                type="button"
                                onClick={handleCancelEditTemplate}
                                className="px-2.5 py-1 rounded bg-[#070A12] border border-white/10 text-[10px] font-bold text-slate-300 hover:text-white"
                              >
                                Cancel
                              </button>
                              <button
                                type="button"
                                onClick={handleSaveEditedTemplate}
                                className="px-3 py-1 rounded bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 font-bold font-black text-[10px] uppercase hover:brightness-110 shadow-sm"
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
                              className="w-full bg-[#070A12] border border-white/10 rounded px-2.5 py-1 text-xs text-white focus:outline-none focus:border-amber-500/60"
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
                                className="w-full bg-[#070A12] border border-white/10 rounded px-2 py-1 text-xs text-white focus:outline-none focus:border-amber-500/60"
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
                                className="w-full bg-[#070A12] border border-white/10 rounded px-2 py-1 text-xs text-white focus:outline-none focus:border-amber-500/60"
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
                                className="text-[10px] text-amber-400 hover:underline font-bold flex items-center gap-0.5"
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
                                    className="flex-1 bg-[#070A12] border border-white/10 rounded px-2 py-1 text-xs text-white focus:outline-none focus:border-amber-500/60"
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
                            ? 'bg-amber-500/10 border-amber-500/40 shadow-lg shadow-amber-500/10 ring-1 ring-amber-500/50'
                            : 'bg-[#0A0D14] border-white/10 hover:border-slate-500'
                        }`}
                      >
                        <div className="space-y-2.5">
                          {/* Card Header */}
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-[#1E2839] text-amber-400 border border-white/10">
                                {template.badge || `Template #${tIdx + 1}`}
                              </span>
                              <h5 className="font-oswald text-sm font-bold text-white uppercase tracking-wide mt-1.5">
                                {template.name}
                              </h5>
                              <p className="text-[11px] text-slate-400 leading-tight">
                                {template.description}
                              </p>
                            </div>

                            {currentPermissions.quotationModification && (
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleStartEditTemplate(template);
                                }}
                                className="p-1.5 rounded-lg bg-[#070A12] border border-white/10 text-slate-400 hover:text-white hover:border-amber-500/40 transition-colors"
                                title="Edit this template clauses"
                              >
                                <Edit2 className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>

                          {/* Clauses List */}
                          <div className="p-2.5 rounded-lg bg-surface border border-white/10 space-y-1.5 text-[11px]">
                            {template.terms.map((term, idx) => (
                              <div key={idx} className="flex items-start gap-1.5 text-slate-300">
                                <span className="text-amber-400 font-bold mt-0.5">•</span>
                                <span className="leading-tight">{term}</span>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Selection indicator & Action */}
                        <div className="pt-3 mt-3 border-t border-white/10 flex items-center justify-between">
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
                                ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 font-bold shadow-md shadow-amber-500/20'
                                : 'bg-[#070A12] border border-white/10 text-slate-300 hover:text-white hover:border-amber-500/40'
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
              <div className="p-4 rounded-xl bg-[#0A0D14] border border-white/10 space-y-2 text-xs">
                <div className="flex justify-between text-slate-300">
                  <span>Subtotal:</span>
                  <span className="font-mono text-white">AED {formatCurrency(previewItemsSum)}</span>
                </div>
                {previewChargesSum > 0 && (
                  <div className="flex justify-between text-amber-400">
                    <span>Additional Charges Total:</span>
                    <span className="font-mono">AED {formatCurrency(previewChargesSum)}</span>
                  </div>
                )}
                <div className="flex justify-between text-slate-300">
                  <span>VAT (5%):</span>
                  <span className="font-mono text-white">AED {formatCurrency(previewVat)}</span>
                </div>
                <div className="flex justify-between text-base font-black text-white pt-2 border-t border-white/10">
                  <span className="font-oswald tracking-wide">FINAL SALES INVOICE GRAND TOTAL (AED):</span>
                  <span className="text-amber-400 font-mono text-lg">
                    AED {formatCurrency(previewGrandTotal)}
                  </span>
                </div>
                <div className="text-[11px] font-serif italic text-slate-400 pt-1">
                  Amount in Words: {numberToWords(previewGrandTotal)}
                </div>
              </div>
            </div>

            {/* Modal Footer Actions */}
            <div className="p-3 sm:p-5 bg-[#0A0D14] border-t border-white/10 flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-between gap-2.5">
              <button
                type="button"
                onClick={() => setPreviewingQuote(null)}
                className="w-full sm:w-auto px-4 py-2.5 rounded-lg bg-[#070A12] border border-white/10 text-xs font-bold text-slate-300 hover:text-white text-center"
              >
                Cancel
              </button>

              {currentPermissions.salesConversion ? (
                <button
                  type="button"
                  onClick={handleConfirmSalesInvoice}
                  className="w-full sm:w-auto px-6 py-2.5 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-black font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 active:scale-95"
                >
                  <CheckCircle className="w-4 h-4 text-black" />
                  <span>Confirm & Generate Official Sales Invoice</span>
                </button>
              ) : (
                <div className="px-4 py-2.5 rounded-lg bg-slate-800 border border-white/10 text-slate-400 text-xs font-semibold flex items-center gap-2">
                  <Lock className="w-4 h-4 text-slate-500" />
                  <span>Sales Conversion Restricted (Approval Role Required)</span>
                </div>
              )}
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
  const { currentPermissions } = useApp();
  const [code, setCode] = useState(product?.code || '');
  const [name, setName] = useState(product?.name || '');
  const [category, setCategory] = useState(product?.category || 'Plate Loaded');
  const [price, setPrice] = useState(product?.price || 5500);
  const [purchaseRate, setPurchaseRate] = useState(
    product?.purchaseRate !== undefined
      ? product.purchaseRate
      : Math.round((product?.price || 5500) * 0.65)
  );
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
      purchaseRate: parseFloat(purchaseRate) || 0,
      stockQty: parseInt(stockQty, 10) || 0,
      imagePath: imagePath.trim(),
      description: description.trim(),
    });
  };

  const calculatedMargin = (parseFloat(price) || 0) - (parseFloat(purchaseRate) || 0);
  const calculatedMarginPct =
    parseFloat(price) > 0 ? ((calculatedMargin / parseFloat(price)) * 100).toFixed(1) : '0.0';

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm p-3 sm:p-4 flex items-center justify-center overflow-y-auto">
      <div className="w-full max-w-lg bg-surface border border-white/10 rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-2xl space-y-4 max-h-[92vh] overflow-y-auto">
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
                className="w-full bg-[#070A12] border border-white/10 rounded px-3 py-2 text-white font-mono"
              />
            </div>

            <div>
              <label className="text-slate-300 font-bold block mb-1">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full bg-[#070A12] border border-white/10 rounded px-3 py-2 text-white"
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
              className="w-full bg-[#070A12] border border-white/10 rounded px-3 py-2 text-white"
            />
          </div>

          {/* Pricing, Admin Purchase Rate & Stock */}
          <div className={`grid grid-cols-1 ${currentPermissions?.purchaseAmountModification ? 'sm:grid-cols-3' : 'sm:grid-cols-2'} gap-3`}>
            <div>
              <label className="text-slate-300 font-bold block mb-1">Selling Price (AED) *</label>
              <input
                type="number"
                required
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                className="w-full bg-[#070A12] border border-white/10 rounded px-3 py-2 text-white font-mono"
              />
            </div>

            {/* Purchase Rate (Admin Only) */}
            {currentPermissions?.purchaseAmountModification && (
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-slate-300 font-bold block truncate">Purchase Rate *</label>
                  <span className="text-[9px] font-mono px-1 py-0.2 rounded bg-amber-500/20 text-amber-400 border border-amber-500/30">
                    Admin
                  </span>
                </div>
                <input
                  type="number"
                  required
                  value={purchaseRate}
                  onChange={(e) => setPurchaseRate(e.target.value)}
                  placeholder="e.g. 3500"
                  className="w-full bg-[#070A12] border border-white/10 rounded px-3 py-2 text-amber-400 font-mono font-bold"
                />
              </div>
            )}

            <div>
              <label className="text-slate-300 font-bold block mb-1">Warehouse Stock (Qty)</label>
              <input
                type="number"
                value={stockQty}
                onChange={(e) => setStockQty(e.target.value)}
                className="w-full bg-[#070A12] border border-white/10 rounded px-3 py-2 text-white font-mono"
              />
            </div>
          </div>

          {/* Admin Margin Calculation Indicator */}
          {currentPermissions?.purchaseAmountModification && (
            <div className="p-2.5 rounded-lg bg-[#070A12] border border-white/10 flex items-center justify-between text-[11px] font-mono">
              <span className="text-slate-400">Unit Profit Margin (Admin View):</span>
              <div className="flex items-center gap-2">
                <span className={calculatedMargin >= 0 ? 'text-emerald-400 font-bold' : 'text-red-400 font-bold'}>
                  {calculatedMargin >= 0 ? '+' : ''}AED {formatCurrency(calculatedMargin)}
                </span>
                <span className="px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 font-bold">
                  {calculatedMarginPct}%
                </span>
              </div>
            </div>
          )}

          <div>
            <label className="text-slate-300 font-bold block mb-1">Image Path / URL</label>
            <input
              type="text"
              value={imagePath}
              onChange={(e) => setImagePath(e.target.value)}
              placeholder="/assets/products/prod_1.png"
              className="w-full bg-[#070A12] border border-white/10 rounded px-3 py-2 text-white font-mono text-[11px]"
            />
          </div>

          <div>
            <label className="text-slate-300 font-bold block mb-1">Description & Specifications</label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Weight: 260kg | Size: 2400×1610×1480mm | Heavy plate loaded sled with linear bearings..."
              className="w-full bg-[#070A12] border border-white/10 rounded px-3 py-2 text-white"
            />
          </div>

          <div className="pt-2 flex flex-col-reverse sm:flex-row justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="w-full sm:w-auto px-4 py-2.5 rounded bg-[#070A12] text-slate-300 font-bold text-xs hover:text-white"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="w-full sm:w-auto px-5 py-2.5 rounded bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 font-bold font-black uppercase text-xs hover:brightness-110"
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
      <div className="w-full max-w-md bg-surface border border-white/10 rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-2xl space-y-4 max-h-[92vh] overflow-y-auto">
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
              className="w-full bg-[#070A12] border border-white/10 rounded px-3 py-2 text-white"
            />
          </div>

          <div>
            <label className="text-slate-300 font-bold block mb-1">Account Title / Beneficiary</label>
            <input
              type="text"
              value={accountTitle}
              onChange={(e) => setAccountTitle(e.target.value)}
              placeholder="e.g. EMMA GYM AND EKAVEERA KALARI LLC SPC"
              className="w-full bg-[#070A12] border border-white/10 rounded px-3 py-2 text-white"
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
              className="w-full bg-[#070A12] border border-white/10 rounded px-3 py-2 text-white font-mono"
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
              className="w-full bg-[#070A12] border border-white/10 rounded px-3 py-2 text-white font-mono"
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
                className="w-full bg-[#070A12] border border-white/10 rounded px-3 py-2 text-white font-mono"
              />
            </div>
            <div>
              <label className="text-slate-300 font-bold block mb-1">Branch</label>
              <input
                type="text"
                value={branch}
                onChange={(e) => setBranch(e.target.value)}
                placeholder="Dubai Main Branch"
                className="w-full bg-[#070A12] border border-white/10 rounded px-3 py-2 text-white"
              />
            </div>
          </div>

          <div className="pt-2 flex flex-col-reverse sm:flex-row justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="w-full sm:w-auto px-4 py-2.5 rounded bg-[#070A12] text-slate-300 font-bold text-xs hover:text-white"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="w-full sm:w-auto px-5 py-2.5 rounded bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 font-bold font-black uppercase text-xs hover:brightness-110"
            >
              Save Bank
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

