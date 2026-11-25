import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { initialWarehouseStock } from '../data/products';

const AppContext = createContext();

const STORAGE_KEYS = {
  PRODUCTS: 'delitrade_products_v1',
  QUOTES: 'delitrade_quotes_v1',
  SETTINGS: 'delitrade_company_settings_v1',
  BANK_DETAILS: 'delitrade_bank_details_v1',
  ADMIN_AUTH: 'delitrade_admin_auth_v1',
  ADMIN_ROLE: 'delitrade_admin_role_v1',
  ADMIN_USER: 'delitrade_admin_user_v1',
};

// Admin RBAC Roles and Permissions
export const ROLES = {
  ADMIN_AGENT: 'admin_agent',
  FINANCE_AGENT: 'finance_agent',
  APPROVAL: 'approval',
  SALES_AGENT: 'sales_agent',
};

export const ROLE_DEFINITIONS = {
  [ROLES.ADMIN_AGENT]: {
    id: ROLES.ADMIN_AGENT,
    name: 'Admin Agent',
    badge: 'Master ERP Controller',
    color: 'from-amber-500 to-amber-600',
    textColor: 'text-amber-400',
    borderColor: 'border-amber-500/40',
    bgColor: 'bg-amber-500/10',
    description:
      'Full administrative access: Quotation modification, unit price & purchase rate modification, production CRUD, quotation approval, product listing, financial dashboard metrics, and graph analytics.',
    permissions: {
      quotationCreation: true,
      quotationApproval: true,
      quotationModification: true,
      salesConversion: true,
      unitPriceModification: true,
      purchaseAmountModification: true,
      productionCrud: true,
      productListing: true,
      dashboardDatas: true,
      dashboardGraph: true,
      brandingManagement: true,
      bankManagement: true,
    },
  },
  [ROLES.FINANCE_AGENT]: {
    id: ROLES.FINANCE_AGENT,
    name: 'Finance Agent',
    badge: 'Review & Approvals',
    color: 'from-cyan-500 to-blue-600',
    textColor: 'text-cyan-400',
    borderColor: 'border-cyan-500/40',
    bgColor: 'bg-cyan-500/10',
    description:
      'Finance operations: Quotation review, modification of prices & charges before approval, quotation approval, and product listing catalog. Sales conversion is reserved for Approval role.',
    permissions: {
      quotationCreation: true,
      productListing: true,
      quotationReview: true,
      quotationModification: true, // Can review and modify quotations before approval
      unitPriceModification: true, // Can adjust unit prices/discounts during review
      quotationApproval: true,     // Can approve quotations
      salesConversion: false,      // Sales conversion strictly requires Approval role
      purchaseAmountModification: false,
      productionCrud: false,
      dashboardDatas: true,        // Can see quote pipelines & total invoiced amounts
      dashboardGraph: false,
      brandingManagement: false,
      bankManagement: false,
    },
  },
  [ROLES.APPROVAL]: {
    id: ROLES.APPROVAL,
    name: 'Approval Officer',
    badge: 'Sales Conversion',
    color: 'from-emerald-500 to-emerald-600',
    textColor: 'text-emerald-400',
    borderColor: 'border-emerald-500/40',
    bgColor: 'bg-emerald-500/10',
    description:
      'Executive authority: Converts approved quotations into commercial sales invoices and tax invoices. Approved quotes cannot be modified.',
    permissions: {
      quotationCreation: false,
      productListing: true,
      quotationReview: true,
      quotationModification: false, // Once approved, quotation cannot be modified
      unitPriceModification: false,
      quotationApproval: true,
      salesConversion: true,        // Primary role responsibility: Generate Invoice
      purchaseAmountModification: false,
      productionCrud: false,
      dashboardDatas: true,
      dashboardGraph: false,
      brandingManagement: false,
      bankManagement: false,
    },
  },
  [ROLES.SALES_AGENT]: {
    id: ROLES.SALES_AGENT,
    name: 'Sales Agent',
    badge: 'Quotes & Product Listing',
    color: 'from-purple-500 to-indigo-600',
    textColor: 'text-purple-400',
    borderColor: 'border-purple-500/40',
    bgColor: 'bg-purple-500/10',
    description:
      'Sales Agent operations: Initial quotation creation and access to equipment product listing catalog. Quotation modifications and approvals are handed to Finance.',
    permissions: {
      quotationCreation: true,
      productListing: true,
      quotationReview: true,
      quotationModification: false,
      unitPriceModification: false,
      quotationApproval: false,
      salesConversion: false,
      purchaseAmountModification: false,
      productionCrud: false,
      dashboardDatas: false,
      dashboardGraph: false,
      brandingManagement: false,
      bankManagement: false,
    },
  },
};

export const SYSTEM_ACCOUNTS = [
  {
    username: 'admin',
    password: 'admin',
    name: 'Chief Admin Agent',
    role: ROLES.ADMIN_AGENT,
  },
  {
    username: 'finance',
    password: 'finance',
    name: 'Senior Finance Officer',
    role: ROLES.FINANCE_AGENT,
  },
  {
    username: 'approval',
    password: 'approval',
    name: 'Commercial Approval Director',
    role: ROLES.APPROVAL,
  },
  {
    username: 'sales',
    password: 'sales',
    name: 'Field Sales Representative',
    role: ROLES.SALES_AGENT,
  },
];

const DEFAULT_COMPANY_SETTINGS = {
  companyName: 'DELITRADE',
  subTitle: 'THE WAREHOUSE GYM EQUIPMENT & MACHINERY',
  legalName: 'Sports Fields & Halls Equipment Trading Co. L.L.C',
  brandHeader: 'EMMA FITNESS',
  trn: '100569744400003',
  phone: '+971 56 329 6585',
  email: 'sales@delitrade.ae • emmafitdxb@gmail.com',
  website: 'www.emmafitness.ae',
  address: 'Al Muteena, Deira, Dubai, UAE',
  logoType: 'default', // 'default' | 'custom'
  customLogoUrl: '',
};

const DEFAULT_BANK_ACCOUNTS = [
  {
    id: 'bank-1',
    bankName: 'ADCB BANK (Abu Dhabi Commercial Bank)',
    accountTitle: 'EMMA GYM AND EKAVEERA KALARI LLC SPC',
    accountNumber: '13613665820001',
    iban: 'AE080030013613665820001',
    swift: 'ADCBUS33',
    branch: 'Dubai Branch, UAE',
  },
  {
    id: 'bank-2',
    bankName: 'FAB BANK (First Abu Dhabi Bank)',
    accountTitle: 'EMMA GYM',
    accountNumber: '1001327234596001',
    iban: 'AE660351001327234596001',
    swift: 'NBADAEAD',
    branch: 'Deira Branch, Dubai, UAE',
  },
];

const INITIAL_DEMO_QUOTES = [
  {
    id: 'INV-2026-098',
    quoteNumber: '098',
    invoiceNumber: 'INV-2026-098',
    type: 'sales_invoice',
    status: 'Converted to Invoice',
    customerName: 'Gold’s Gym Elite Jumeirah',
    contactNumber: '+971 55 987 6543',
    customerDetails: 'Jumeirah 1, Dubai, UAE',
    date: '20-Nov-2026',
    invoiceDate: '20-Nov-2026',
    items: [
      {
        product: { ...initialWarehouseStock[1], purchaseRate: 3600 },
        quantity: 2,
        unitPrice: 5500,
        offerPrice: 5000,
        purchaseRate: 3600,
        originalPrice: 5500,
        sum: 10000,
      },
      {
        product: { ...initialWarehouseStock[13], purchaseRate: 5800 },
        quantity: 2,
        unitPrice: 8500,
        offerPrice: 8000,
        purchaseRate: 5800,
        originalPrice: 8500,
        sum: 16000,
      },
    ],
    additionalCharges: [
      {
        id: 'ac-demo-1',
        description: 'Heavy Rigging & Express Placement',
        amount: 1200,
      },
    ],
    subtotal: 27200,
    vat: 1360,
    grandTotal: 28560,
    createdAt: Date.now() - 86400000 * 5,
  },
  {
    id: 'QT-100',
    quoteNumber: '100',
    invoiceNumber: null,
    type: 'quotation',
    status: 'Approved',
    approvedBy: 'Senior Finance Officer',
    approvedAt: Date.now() - 86400000 * 2,
    customerName: 'Powerhouse Gym Downtown',
    contactNumber: '+971 52 443 8899',
    customerDetails: 'Downtown Boulevard, Dubai, UAE',
    date: '22-Nov-2026',
    invoiceDate: null,
    items: [
      {
        product: { ...initialWarehouseStock[0], purchaseRate: 4200 }, // Commercial Treadmill
        quantity: 2,
        unitPrice: 6500,
        offerPrice: 6000,
        purchaseRate: 4200,
        originalPrice: 6500,
        sum: 13000,
      },
      {
        product: { ...initialWarehouseStock[2], purchaseRate: 4800 }, // Dual Cable Cross
        quantity: 1,
        unitPrice: 7800,
        offerPrice: 7300,
        purchaseRate: 4800,
        originalPrice: 7800,
        sum: 7800,
      },
    ],
    additionalCharges: [
      {
        id: 'ac-demo-100',
        description: 'Standard Delivery & Ground Floor Assembly',
        amount: 600,
      },
    ],
    subtotal: 21400,
    vat: 1070,
    grandTotal: 22470,
    createdAt: Date.now() - 86400000 * 3,
  },
  {
    id: 'QT-101',
    quoteNumber: '101',
    invoiceNumber: null,
    type: 'quotation',
    status: 'Pending Review',
    customerName: 'Titan Fitness Club Dubai',
    contactNumber: '+971 50 123 4567',
    customerDetails: 'Al Quoz Industrial Area 3, Dubai, UAE',
    date: '24-Nov-2026',
    invoiceDate: null,
    items: [
      {
        product: { ...initialWarehouseStock[1], purchaseRate: 3600 }, // LP-045 Leg Press
        quantity: 2,
        unitPrice: 5500,
        offerPrice: 5000,
        purchaseRate: 3600,
        originalPrice: 5500,
        sum: 10000,
      },
      {
        product: { ...initialWarehouseStock[8], purchaseRate: 2900 }, // B069 Air Bike
        quantity: 3,
        unitPrice: 4500,
        offerPrice: 4000,
        purchaseRate: 2900,
        originalPrice: 4500,
        sum: 12000,
      },
    ],
    additionalCharges: [
      {
        id: 'ac-1',
        description: 'Commercial Delivery & Ground Floor Assembly',
        amount: 850,
      },
    ],
    subtotal: 22850,
    vat: 1142.5,
    grandTotal: 23992.5,
    createdAt: Date.now() - 86400000 * 1,
  },
];

// Helper: Auto-generate the next unique sequential Quotation Reference Code
export const getNextQuotationNumber = (records = []) => {
  let highestSequence = 101;
  records.forEach((rec) => {
    const candidates = [rec.quoteNumber, rec.id, rec.invoiceNumber];
    candidates.forEach((field) => {
      if (field) {
        const matches = String(field).match(/\d+/g);
        if (matches) {
          const num = parseInt(matches[matches.length - 1], 10);
          if (!isNaN(num) && num >= highestSequence && num < 1000000) {
            highestSequence = num;
          }
        }
      }
    });
  });

  let nextCandidate = highestSequence + 1;
  while (
    records.some(
      (r) =>
        r.quoteNumber === String(nextCandidate) ||
        r.quoteNumber === String(nextCandidate).padStart(3, '0') ||
        r.id === `QT-${nextCandidate}` ||
        r.id === `QT-${String(nextCandidate).padStart(3, '0')}`
    )
  ) {
    nextCandidate++;
  }

  return String(nextCandidate).padStart(3, '0');
};

export function AppProvider({ children }) {
  // Navigation State
  const [currentPage, setCurrentPage] = useState('products'); // 'products'|'services'|'aboutUs'|'contact'|'support'|'invoiceBill'|'admin'
  const [isAdminView, setIsAdminView] = useState(false);

  // Products State (Ensuring purchaseRate is present on every product for Admin Profit calculation)
  const [products, setProducts] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.PRODUCTS);
      const rawList = saved ? JSON.parse(saved) : initialWarehouseStock;
      return rawList.map((p) => ({
        ...p,
        purchaseRate:
          p.purchaseRate !== undefined && !isNaN(Number(p.purchaseRate))
            ? Number(p.purchaseRate)
            : Math.round((Number(p.price) || 0) * 0.65),
      }));
    } catch {
      return initialWarehouseStock.map((p) => ({
        ...p,
        purchaseRate:
          p.purchaseRate !== undefined && !isNaN(Number(p.purchaseRate))
            ? Number(p.purchaseRate)
            : Math.round((Number(p.price) || 0) * 0.65),
      }));
    }
  });

  // Cart State { [code]: { product, quantity } }
  const [cart, setCart] = useState({});

  // Quotes Records
  const [quotesRecords, setQuotesRecords] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.QUOTES);
      return saved ? JSON.parse(saved) : INITIAL_DEMO_QUOTES;
    } catch {
      return INITIAL_DEMO_QUOTES;
    }
  });

  // Active Quote Form in Storefront (Quotation Ref Code auto-generated)
  const [customerName, setCustomerName] = useState('');
  const [contactNumber, setContactNumber] = useState('');
  const [customerDetails, setCustomerDetails] = useState('');
  const [quotationNumber, setQuotationNumber] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.QUOTES);
      const records = saved ? JSON.parse(saved) : INITIAL_DEMO_QUOTES;
      return getNextQuotationNumber(records);
    } catch {
      return getNextQuotationNumber(INITIAL_DEMO_QUOTES);
    }
  });

  // Function to explicitly auto-generate the next unique reference code
  const generateNewQuotationNumber = () => {
    const nextCode = getNextQuotationNumber(quotesRecords);
    setQuotationNumber(nextCode);
    return nextCode;
  };

  const [quoteDate, setQuoteDate] = useState(() => {
    const today = new Date();
    return `${today.getDate()}-${today.toLocaleString('en-US', { month: 'short' })}-${today.getFullYear()}`;
  });
  const [hasGeneratedQuote, setHasGeneratedQuote] = useState(false);
  const [additionalCharges, setAdditionalCharges] = useState([]);

  // Company & Logo Settings
  const [companySettings, setCompanySettings] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.SETTINGS);
      return saved ? { ...DEFAULT_COMPANY_SETTINGS, ...JSON.parse(saved) } : DEFAULT_COMPANY_SETTINGS;
    } catch {
      return DEFAULT_COMPANY_SETTINGS;
    }
  });

  // Bank Details
  const [bankAccounts, setBankAccounts] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.BANK_DETAILS);
      return saved ? JSON.parse(saved) : DEFAULT_BANK_ACCOUNTS;
    } catch {
      return DEFAULT_BANK_ACCOUNTS;
    }
  });

  // Admin Auth & Active RBAC Role State
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(() => {
    try {
      return localStorage.getItem(STORAGE_KEYS.ADMIN_AUTH) === 'true';
    } catch {
      return false;
    }
  });

  const [currentRole, setCurrentRole] = useState(() => {
    try {
      const savedRole = localStorage.getItem(STORAGE_KEYS.ADMIN_ROLE);
      return savedRole && ROLE_DEFINITIONS[savedRole] ? savedRole : ROLES.ADMIN_AGENT;
    } catch {
      return ROLES.ADMIN_AGENT;
    }
  });

  const [currentAdminUser, setCurrentAdminUser] = useState(() => {
    try {
      const savedUser = localStorage.getItem(STORAGE_KEYS.ADMIN_USER);
      if (savedUser) return JSON.parse(savedUser);
      return SYSTEM_ACCOUNTS[0];
    } catch {
      return SYSTEM_ACCOUNTS[0];
    }
  });

  // Current Role Permissions Object
  const currentPermissions = useMemo(() => {
    return (
      ROLE_DEFINITIONS[currentRole]?.permissions ||
      ROLE_DEFINITIONS[ROLES.ADMIN_AGENT].permissions
    );
  }, [currentRole]);

  // Switch Admin Role (allows switching between Admin Agent, Finance Agent, and Approval Officer)
  const switchAdminRole = (newRole) => {
    if (ROLE_DEFINITIONS[newRole]) {
      setCurrentRole(newRole);
      const matchedAccount = SYSTEM_ACCOUNTS.find((a) => a.role === newRole) || {
        username: newRole,
        name: ROLE_DEFINITIONS[newRole].name,
        role: newRole,
      };
      setCurrentAdminUser(matchedAccount);
      try {
        localStorage.setItem(STORAGE_KEYS.ADMIN_ROLE, newRole);
        localStorage.setItem(STORAGE_KEYS.ADMIN_USER, JSON.stringify(matchedAccount));
      } catch (e) {
        console.error(e);
      }
    }
  };

  // Storefront search state
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');

  // Sync to localStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(products));
  }, [products]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.QUOTES, JSON.stringify(quotesRecords));
  }, [quotesRecords]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(companySettings));
  }, [companySettings]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.BANK_DETAILS, JSON.stringify(bankAccounts));
  }, [bankAccounts]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.ADMIN_AUTH, isAdminLoggedIn ? 'true' : 'false');
  }, [isAdminLoggedIn]);

  // Handle URL hash / routing (e.g. #admin or /admin)
  useEffect(() => {
    const handleRoute = () => {
      const hash = window.location.hash.toLowerCase();
      const pathname = window.location.pathname.toLowerCase();
      if (
        hash === '#admin' ||
        hash.startsWith('#admin') ||
        pathname === '/admin' ||
        pathname.startsWith('/admin')
      ) {
        setIsAdminView(true);
      } else {
        setIsAdminView(false);
      }
    };
    handleRoute();
    window.addEventListener('hashchange', handleRoute);
    window.addEventListener('popstate', handleRoute);
    return () => {
      window.removeEventListener('hashchange', handleRoute);
      window.removeEventListener('popstate', handleRoute);
    };
  }, []);

  // Cart operations
  const addToCart = (product) => {
    setCart((prev) => {
      const existing = prev[product.code];
      return {
        ...prev,
        [product.code]: {
          product,
          quantity: existing ? existing.quantity + 1 : 1,
        },
      };
    });
  };

  const removeFromCart = (productCode) => {
    setCart((prev) => {
      if (!prev[productCode]) return prev;
      if (prev[productCode].quantity > 1) {
        return {
          ...prev,
          [productCode]: {
            ...prev[productCode],
            quantity: prev[productCode].quantity - 1,
          },
        };
      }
      const copy = { ...prev };
      delete copy[productCode];
      return copy;
    });
  };

  const setItemQuantity = (productCode, quantity) => {
    setCart((prev) => {
      if (quantity <= 0) {
        const copy = { ...prev };
        delete copy[productCode];
        return copy;
      }
      if (!prev[productCode]) return prev;
      return {
        ...prev,
        [productCode]: {
          ...prev[productCode],
          quantity,
        },
      };
    });
  };

  const clearCart = () => {
    setCart({});
    setCustomerName('');
    setContactNumber('');
    setCustomerDetails('');
    setAdditionalCharges([]);
    setHasGeneratedQuote(false);
    // Auto-generate fresh quotation reference code for subsequent quote
    setQuotationNumber(getNextQuotationNumber(quotesRecords));
  };

  // Cart Totals
  const cartItemsList = useMemo(() => Object.values(cart), [cart]);
  const cartCount = useMemo(
    () => cartItemsList.reduce((sum, item) => sum + item.quantity, 0),
    [cartItemsList]
  );
  const cartItemsSubtotal = useMemo(
    () => cartItemsList.reduce((sum, item) => sum + item.product.price * item.quantity, 0),
    [cartItemsList]
  );
  const additionalChargesTotal = useMemo(
    () => additionalCharges.reduce((sum, ch) => sum + (parseFloat(ch.amount) || 0), 0),
    [additionalCharges]
  );
  const netTaxableSum = useMemo(
    () => cartItemsSubtotal + additionalChargesTotal,
    [cartItemsSubtotal, additionalChargesTotal]
  );
  const totalVat = useMemo(() => netTaxableSum * 0.05, [netTaxableSum]);
  const grandTotal = useMemo(() => netTaxableSum + totalVat, [netTaxableSum, totalVat]);

  // Additional charges handlers
  const addAdditionalCharge = (chargeObj) => {
    const newCharge = chargeObj || {
      id: 'charge-' + Date.now() + Math.random().toString(36).substr(2, 4),
      description: 'Logistics & Assembly Delivery',
      amount: 500,
    };
    setAdditionalCharges((prev) => [...prev, newCharge]);
  };

  const updateAdditionalCharge = (id, field, value) => {
    setAdditionalCharges((prev) =>
      prev.map((c) => (c.id === id ? { ...c, [field]: value } : c))
    );
  };

  const removeAdditionalCharge = (id) => {
    setAdditionalCharges((prev) => prev.filter((c) => c.id !== id));
  };

  // Save Quote into Records (using auto-generated clean sequence code)
  const recordCurrentQuote = () => {
    if (cartItemsList.length === 0) return null;
    const cleanNum =
      quotationNumber && quotationNumber.trim() !== ''
        ? quotationNumber.trim().replace(/^#?QT-?(2026)?-?/i, '')
        : getNextQuotationNumber(quotesRecords);

    const newRecord = {
      id: `QT-${cleanNum}`,
      quoteNumber: cleanNum,
      invoiceNumber: null,
      type: 'quotation',
      status: 'Pending Review',
      customerName: customerName.trim() || 'Valued Customer',
      contactNumber: contactNumber.trim() || '+971 56 329 6585',
      customerDetails: customerDetails.trim() || 'Dubai / UAE',
      date: quoteDate,
      invoiceDate: null,
      createdBy: currentAdminUser?.name || 'Sales Agent',
      createdByRole: currentRole,
      items: cartItemsList.map((item) => {
        const uPrice = Number(item.unitPrice || item.product.price || 0);
        const oPrice = Math.max(0, uPrice - 500);
        const pRate =
          item.purchaseRate !== undefined
            ? Number(item.purchaseRate)
            : item.product?.purchaseRate !== undefined
            ? Number(item.product.purchaseRate)
            : Math.round(uPrice * 0.65);

        return {
          product: { ...item.product, purchaseRate: pRate },
          quantity: item.quantity,
          unitPrice: uPrice,
          offerPrice: oPrice,
          purchaseRate: pRate,
          originalPrice: uPrice,
          sum: oPrice * item.quantity,
        };
      }),
      additionalCharges: [...additionalCharges],
      subtotal: netTaxableSum,
      vat: totalVat,
      grandTotal: grandTotal,
      createdAt: Date.now(),
    };

    setQuotesRecords((prev) => [newRecord, ...prev.filter((q) => q.id !== newRecord.id)]);
    setHasGeneratedQuote(true);
    return newRecord;
  };

  // Review & Update Quotation before Approval (Finance Agent, Admin Agent)
  const updateQuoteRecord = (quoteId, updatedData = {}) => {
    if (!currentPermissions.quotationModification) {
      alert('Access Denied: You do not have permission to modify quotations.');
      return false;
    }

    let isSuccess = false;
    setQuotesRecords((prev) =>
      prev.map((quote) => {
        if (quote.id !== quoteId) return quote;
        // Lock check: once approved, it cannot be modified!
        if (quote.status === 'Approved' || quote.type === 'sales_invoice') {
          alert('Cannot Modify: This quotation has been Approved and locked. Modifications are disabled.');
          return quote;
        }

        const rawItems = updatedData.items || quote.items || [];
        const items = rawItems.map((it) => {
          const uPrice = Number(it.unitPrice !== undefined ? it.unitPrice : it.product?.price || 0);
          const qty = Number(it.quantity || 1);
          const pRate =
            it.purchaseRate !== undefined
              ? Number(it.purchaseRate)
              : it.product?.purchaseRate !== undefined
              ? Number(it.product.purchaseRate)
              : Math.round(uPrice * 0.65);

          return {
            ...it,
            product: { ...(it.product || {}), purchaseRate: pRate },
            unitPrice: uPrice,
            quantity: qty,
            purchaseRate: pRate,
            originalPrice: it.originalPrice || it.product?.price || uPrice,
            sum: uPrice * qty,
          };
        });

        const addCharges = (
          updatedData.additionalCharges !== undefined
            ? updatedData.additionalCharges
            : quote.additionalCharges || []
        ).map((ch) => ({
          ...ch,
          amount: parseFloat(ch.amount) || 0,
        }));

        const itemsSum = items.reduce((s, it) => s + (it.unitPrice * it.quantity), 0);
        const chargesSum = addCharges.reduce((s, ch) => s + (Number(ch.amount) || 0), 0);
        const subtotal = itemsSum + chargesSum;
        const vat = subtotal * 0.05;
        const grandTotal = subtotal + vat;

        isSuccess = true;
        return {
          ...quote,
          ...updatedData,
          items,
          additionalCharges: addCharges,
          subtotal,
          vat,
          grandTotal,
          updatedAt: Date.now(),
          updatedBy: currentAdminUser?.name || currentAdminUser?.username || currentRole,
        };
      })
    );
    return isSuccess;
  };

  // Quotation Approval Workflow (finance_agent, admin_agent, approval)
  const approveQuoteRecord = (quoteId) => {
    if (!currentPermissions.quotationApproval) {
      alert('Access Denied: You do not have permission to approve quotations.');
      return false;
    }
    setQuotesRecords((prev) =>
      prev.map((quote) => {
        if (quote.id !== quoteId) return quote;
        return {
          ...quote,
          status: 'Approved',
          approvedAt: Date.now(),
          approvedBy: currentAdminUser?.name || currentAdminUser?.username || currentRole,
        };
      })
    );
    return true;
  };

  // Convert Quotation to Official Sales Invoice (approval, admin_agent)
  const convertQuoteToSalesInvoice = (quoteId, modifiedData = {}) => {
    if (!currentPermissions.salesConversion) {
      alert('Access Denied: Official Sales Conversion is strictly restricted to the Approval Role.');
      return false;
    }
    const target = quotesRecords.find((q) => q.id === quoteId);
    if (!target) return false;
    if (target.status !== 'Approved' && target.type !== 'sales_invoice') {
      alert('Quotation must be Approved by Finance or an authorized officer before generating Sales Invoice.');
      return false;
    }
    setQuotesRecords((prev) =>
      prev.map((quote) => {
        if (quote.id !== quoteId) return quote;
        const newInvoiceNum = `INV-2026-${quote.quoteNumber || quote.id.replace('QT-', '')}`;
        const rawItems = modifiedData.items || quote.items;
        const items = rawItems.map((it) => {
          const pRate =
            it.purchaseRate !== undefined
              ? Number(it.purchaseRate)
              : it.product?.purchaseRate !== undefined
              ? Number(it.product.purchaseRate)
              : Math.round(Number(it.unitPrice || it.product?.price || 0) * 0.65);
          return {
            ...it,
            purchaseRate: pRate,
            product: {
              ...(it.product || {}),
              purchaseRate: pRate,
            },
          };
        });

        const addCharges =
          modifiedData.additionalCharges !== undefined
            ? modifiedData.additionalCharges
            : quote.additionalCharges;

        const itemsSum = items.reduce(
          (s, it) => s + Number(it.unitPrice) * Number(it.quantity),
          0
        );
        const chargesSum = addCharges.reduce(
          (s, ch) => s + (Number(ch.amount) || 0),
          0
        );
        const subtotal = itemsSum + chargesSum;
        const vat = subtotal * 0.05;
        const grandTotal = subtotal + vat;

        const today = new Date();
        const invoiceDate = `${today.getDate()}-${today.toLocaleString('en-US', { month: 'short' })}-${today.getFullYear()}`;

        return {
          ...quote,
          ...modifiedData,
          items,
          additionalCharges: addCharges,
          type: 'sales_invoice',
          status: 'Converted to Invoice',
          invoiceNumber: newInvoiceNum,
          invoiceDate: modifiedData.invoiceDate || invoiceDate,
          subtotal,
          vat,
          grandTotal,
        };
      })
    );
    return true;
  };

  // Admin: Delete quote record
  const deleteQuoteRecord = (quoteId) => {
    setQuotesRecords((prev) => prev.filter((q) => q.id !== quoteId));
  };

  // Product CRUD (Protected: Production CRUD is restricted to Admin Agent)
  const addProduct = (newProduct) => {
    if (!currentPermissions.productionCrud) {
      alert('Access Denied: Product / Production creation is restricted to the Admin Agent.');
      return false;
    }
    const priceNum = parseFloat(newProduct.price) || 0;
    const pRateNum =
      currentPermissions.purchaseAmountModification &&
      newProduct.purchaseRate !== undefined &&
      !isNaN(parseFloat(newProduct.purchaseRate))
        ? parseFloat(newProduct.purchaseRate)
        : Math.round(priceNum * 0.65);

    const productWithId = {
      ...newProduct,
      id: 'prod-' + Date.now(),
      code: newProduct.code.trim().toUpperCase(),
      price: priceNum,
      purchaseRate: pRateNum,
      stockQty: parseInt(newProduct.stockQty, 10) || 1,
    };
    setProducts((prev) => [productWithId, ...prev]);
    return true;
  };

  const updateProduct = (updatedProduct) => {
    if (!currentPermissions.productionCrud) {
      alert('Access Denied: Product modification is restricted to the Admin Agent.');
      return false;
    }
    setProducts((prev) =>
      prev.map((p) => {
        if (p.id === updatedProduct.id || p.code === updatedProduct.code) {
          const priceNum =
            currentPermissions.unitPriceModification && updatedProduct.price !== undefined
              ? parseFloat(updatedProduct.price) || p.price
              : p.price;

          const pRateNum =
            currentPermissions.purchaseAmountModification &&
            updatedProduct.purchaseRate !== undefined &&
            !isNaN(parseFloat(updatedProduct.purchaseRate))
              ? parseFloat(updatedProduct.purchaseRate)
              : p.purchaseRate !== undefined
              ? p.purchaseRate
              : Math.round(priceNum * 0.65);

          return {
            ...p,
            ...updatedProduct,
            price: priceNum,
            purchaseRate: pRateNum,
          };
        }
        return p;
      })
    );
    return true;
  };

  const deleteProduct = (productCodeOrId) => {
    if (!currentPermissions.productionCrud) {
      alert('Access Denied: Product deletion is restricted to the Admin Agent.');
      return false;
    }
    setProducts((prev) => prev.filter((p) => p.code !== productCodeOrId && p.id !== productCodeOrId));
    // also remove from cart if present
    setCart((prev) => {
      const copy = { ...prev };
      delete copy[productCodeOrId];
      return copy;
    });
    return true;
  };

  const updateProductStock = (productCode, newQty) => {
    if (!currentPermissions.productionCrud) {
      alert('Access Denied: Warehouse stock modification is restricted to the Admin Agent.');
      return false;
    }
    setProducts((prev) =>
      prev.map((p) =>
        p.code === productCode ? { ...p, stockQty: Math.max(0, parseInt(newQty, 10) || 0) } : p
      )
    );
    return true;
  };

  // Bank details CRUD
  const addBankAccount = (bankData) => {
    const newBank = {
      ...bankData,
      id: 'bank-' + Date.now(),
    };
    setBankAccounts((prev) => [...prev, newBank]);
  };

  const updateBankAccount = (id, updatedData) => {
    setBankAccounts((prev) =>
      prev.map((b) => (b.id === id ? { ...b, ...updatedData } : b))
    );
  };

  const removeBankAccount = (id) => {
    setBankAccounts((prev) => prev.filter((b) => b.id !== id));
  };

  // Admin Auth with Role Based Access Control
  const adminLogin = (username, password) => {
    const cleanUser = String(username).trim().toLowerCase();
    const cleanPass = String(password).trim();

    // Check system accounts
    const account = SYSTEM_ACCOUNTS.find(
      (acc) =>
        acc.username.toLowerCase() === cleanUser &&
        (acc.password === cleanPass || cleanPass === 'delitrade2026' || cleanPass === 'admin123')
    );

    if (account) {
      setIsAdminLoggedIn(true);
      setCurrentRole(account.role);
      setCurrentAdminUser(account);
      try {
        localStorage.setItem(STORAGE_KEYS.ADMIN_AUTH, 'true');
        localStorage.setItem(STORAGE_KEYS.ADMIN_ROLE, account.role);
        localStorage.setItem(STORAGE_KEYS.ADMIN_USER, JSON.stringify(account));
      } catch (e) {
        console.error(e);
      }
      return { success: true, account };
    }

    // Default fallback: admin / delitrade with master password -> admin_agent
    if (
      (cleanUser === 'admin' || cleanUser === 'delitrade') &&
      (cleanPass === 'admin' || cleanPass === 'delitrade2026' || cleanPass === 'admin123')
    ) {
      const fallbackAccount = SYSTEM_ACCOUNTS[0];
      setIsAdminLoggedIn(true);
      setCurrentRole(ROLES.ADMIN_AGENT);
      setCurrentAdminUser(fallbackAccount);
      try {
        localStorage.setItem(STORAGE_KEYS.ADMIN_AUTH, 'true');
        localStorage.setItem(STORAGE_KEYS.ADMIN_ROLE, ROLES.ADMIN_AGENT);
        localStorage.setItem(STORAGE_KEYS.ADMIN_USER, JSON.stringify(fallbackAccount));
      } catch (e) {
        console.error(e);
      }
      return { success: true, account: fallbackAccount };
    }

    return {
      success: false,
      message: 'Invalid credentials. Select a role shortcut or enter valid role username and password.',
    };
  };

  const adminLogout = () => {
    setIsAdminLoggedIn(false);
    try {
      localStorage.removeItem(STORAGE_KEYS.ADMIN_AUTH);
    } catch (e) {
      console.error(e);
    }
  };

  const navigateToAdmin = () => {
    window.location.hash = '#admin';
    setIsAdminView(true);
  };

  const navigateToStorefront = (page = 'products') => {
    if (window.location.hash) {
      window.location.hash = '';
    }
    if (window.location.pathname.startsWith('/admin')) {
      window.history.pushState(null, '', '/');
    }
    setIsAdminView(false);
    setCurrentPage(page);
  };

  return (
    <AppContext.Provider
      value={{
        // Nav & Routing
        currentPage,
        setCurrentPage,
        isAdminView,
        navigateToAdmin,
        navigateToStorefront,

        // Products
        products,
        addProduct,
        updateProduct,
        deleteProduct,
        updateProductStock,

        // Cart
        cart,
        addToCart,
        removeFromCart,
        setItemQuantity,
        clearCart,
        cartItemsList,
        cartCount,
        cartItemsSubtotal,
        additionalChargesTotal,
        netTaxableSum,
        totalVat,
        grandTotal,

        // Active Quote Form
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
        hasGeneratedQuote,
        setHasGeneratedQuote,
        additionalCharges,
        addAdditionalCharge,
        updateAdditionalCharge,
        removeAdditionalCharge,
        recordCurrentQuote,

        // Quotes records & Approval Workflow
        quotesRecords,
        updateQuoteRecord,
        approveQuoteRecord,
        convertQuoteToSalesInvoice,
        deleteQuoteRecord,

        // Settings & Logo
        companySettings,
        setCompanySettings,

        // Bank Accounts
        bankAccounts,
        addBankAccount,
        updateBankAccount,
        removeBankAccount,

        // Admin Auth & RBAC Roles
        isAdminLoggedIn,
        currentRole,
        currentAdminUser,
        currentPermissions,
        switchAdminRole,
        adminLogin,
        adminLogout,
        ROLES,
        ROLE_DEFINITIONS,
        SYSTEM_ACCOUNTS,

        // Search & Filters
        searchQuery,
        setSearchQuery,
        selectedCategory,
        setSelectedCategory,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}

