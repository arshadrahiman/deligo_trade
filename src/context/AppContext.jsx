import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { initialWarehouseStock } from '../data/products';
import { updateDynamicFavicon } from '../utils/favicon';

const AppContext = createContext();

const STORAGE_KEYS = {
  PRODUCTS: 'delitrade_products_v1',
  QUOTES: 'delitrade_quotes_v1',
  SETTINGS: 'delitrade_company_settings_v1',
  BANK_DETAILS: 'delitrade_bank_details_v1',
  ADMIN_AUTH: 'delitrade_admin_auth_v1',
  ADMIN_ROLE: 'delitrade_admin_role_v1',
  ADMIN_USER: 'delitrade_admin_user_v1',
  SESSION_TIMESTAMP: 'delitrade_session_ts_v1',
  FAILED_ATTEMPTS: 'delitrade_auth_failed_v1',
  LOCKOUT_UNTIL: 'delitrade_auth_lockout_v1',
  SYSTEM_ACCOUNTS: 'delitrade_accounts_v2',
  ROLE_PERMISSIONS: 'delitrade_role_perms_v2',
  SYSTEM_CONFIG: 'delitrade_sys_config_v2',
  THEME: 'delitrade_theme_mode_v1',
};

// Input sanitization to prevent XSS / script injection attacks
export const sanitizeInput = (val) => {
  if (typeof val !== 'string') return val;
  return val
    .replace(/[<>]/g, '')
    .replace(/javascript:/gi, '')
    .trim();
};

const SESSION_MAX_AGE_MS = 4 * 60 * 60 * 1000; // 4 hours maximum session lifetime

// Admin RBAC Roles and Permissions
export const ROLES = {
  SALES_AGENT: 'sales_agent',
  FINANCE_AGENT: 'finance_agent',
  ADMIN_AGENT: 'admin_agent',
  SUPER_ADMIN: 'super_admin',
};

export const DEFAULT_ROLE_DEFINITIONS = {
  [ROLES.SALES_AGENT]: {
    id: ROLES.SALES_AGENT,
    name: 'Sales Agent',
    badge: 'Quotes & Catalog',
    color: 'from-purple-500 to-indigo-600',
    textColor: 'text-purple-400',
    borderColor: 'border-purple-500/40',
    bgColor: 'bg-purple-500/10',
    description: '',
    permissions: {
      quotationCreation: true,
      productListing: true,
      quotationReview: true, // Can review quotes in read-only mode
      quotationModification: false,
      unitPriceModification: false,
      purchaseAmountModification: false,
      productionCrud: false,
      quotationApproval: false,
      salesConversion: true, // Once approved, any agent can generate invoice
      dashboardDatas: false,
      dashboardGraph: false,
      brandingManagement: false,
      bankManagement: false,
      systemConfig: false,
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
    description: '',
    permissions: {
      quotationCreation: true,
      productListing: true,
      quotationReview: true,
      quotationModification: true, // Can review and modify quotations before approval
      unitPriceModification: true, // Can adjust unit prices/discounts during review
      purchaseAmountModification: false,
      productionCrud: false,
      quotationApproval: true,     // Can approve quotations
      salesConversion: true,       // Once approved, button changes to generate invoice
      dashboardDatas: true,        // Can see quote pipelines & total invoiced sales amount
      dashboardGraph: false,
      brandingManagement: false,
      bankManagement: true,
      systemConfig: false,
    },
  },
  [ROLES.ADMIN_AGENT]: {
    id: ROLES.ADMIN_AGENT,
    name: 'Admin Agent',
    badge: 'Management & Pricing',
    color: 'from-amber-500 to-amber-600',
    textColor: 'text-amber-400',
    borderColor: 'border-amber-500/40',
    bgColor: 'bg-amber-500/10',
    description: '',
    permissions: {
      quotationCreation: true,
      productListing: true,
      quotationReview: true,
      quotationModification: true,
      unitPriceModification: true,
      purchaseAmountModification: true, // Modify unit prices & purchase wholesale costs
      productionCrud: true,             // Production CRUD operations (add/edit/delete products)
      quotationApproval: true,
      salesConversion: true,
      dashboardDatas: true,             // Total Sale amount, profit, pipelines
      dashboardGraph: true,             // Financial performance & profit graphs
      brandingManagement: true,
      bankManagement: true,
      systemConfig: false,
    },
  },
  [ROLES.SUPER_ADMIN]: {
    id: ROLES.SUPER_ADMIN,
    name: 'Super Admin Agent',
    badge: 'Developer Team',
    color: 'from-red-500 via-amber-500 to-yellow-500',
    textColor: 'text-red-400',
    borderColor: 'border-red-500/40',
    bgColor: 'bg-red-500/10',
    description: '',
    permissions: {
      quotationCreation: true,
      productListing: true,
      quotationReview: true,
      quotationModification: true,
      unitPriceModification: true,
      purchaseAmountModification: true,
      productionCrud: true,
      quotationApproval: true,
      salesConversion: true,
      dashboardDatas: true,
      dashboardGraph: true,
      brandingManagement: true,
      bankManagement: true,
      systemConfig: true,
    },
  },
};

export const ROLE_DEFINITIONS = DEFAULT_ROLE_DEFINITIONS;

export const DEFAULT_SYSTEM_ACCOUNTS = [
  {
    id: 'acc-sales',
    username: 'sales',
    password: 'sales',
    name: 'Commercial Equipment Sales Agent',
    role: ROLES.SALES_AGENT,
    status: 'active',
    createdAt: '2026-01-01',
  },
  {
    id: 'acc-finance',
    username: 'finance',
    password: 'finance',
    name: 'Finance & Invoicing Officer',
    role: ROLES.FINANCE_AGENT,
    status: 'active',
    createdAt: '2026-01-01',
  },
  {
    id: 'acc-admin',
    username: 'admin',
    password: 'admin',
    name: 'Equipment Inventory & Operations Admin',
    role: ROLES.ADMIN_AGENT,
    status: 'active',
    createdAt: '2026-01-01',
  },
  {
    id: 'acc-superadmin',
    username: 'superadmin',
    password: 'superadmin',
    name: 'Enterprise Machinery Systems Admin',
    role: ROLES.SUPER_ADMIN,
    status: 'active',
    createdAt: '2026-01-01',
  },
  {
    id: 'acc-dev',
    username: 'dev',
    password: 'dev',
    name: 'Enterprise Machinery Systems Admin',
    role: ROLES.SUPER_ADMIN,
    status: 'active',
    createdAt: '2026-01-01',
  },
];

export const SYSTEM_ACCOUNTS = DEFAULT_SYSTEM_ACCOUNTS;

export const DEFAULT_SYSTEM_CONFIG = {
  sessionTimeoutHours: 4,
  maxFailedAttempts: 5,
  lockoutDurationSeconds: 300,
  quotationPrefix: 'QT-2026-',
  invoicePrefix: 'INV-2026-',
  vatRatePercentage: 5,
  currencySymbol: 'AED',
};

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

const nowTs = Date.now();
const getDemoDate = (daysAgo) => {
  const d = new Date(nowTs - daysAgo * 86400000);
  return `${d.getDate()}-${d.toLocaleString('en-US', { month: 'short' })}-${d.getFullYear()}`;
};

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
    date: getDemoDate(5),
    invoiceDate: getDemoDate(5),
    createdBy: 'Arshad Rahiman',
    createdByRole: 'sales_agent',
    approvedBy: 'Senior Finance Officer',
    approvedByRole: 'finance_agent',
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
    createdAt: nowTs - 86400000 * 5,
  },
  {
    id: 'QT-100',
    quoteNumber: '100',
    invoiceNumber: null,
    type: 'quotation',
    status: 'Approved',
    approvedBy: 'Senior Finance Officer',
    approvedByRole: 'finance_agent',
    approvedAt: nowTs - 86400000 * 2,
    createdBy: 'Tariq Mansoor',
    createdByRole: 'sales_agent',
    customerName: 'Powerhouse Gym Downtown',
    contactNumber: '+971 52 443 8899',
    customerDetails: 'Downtown Boulevard, Dubai, UAE',
    date: getDemoDate(2),
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
    createdAt: nowTs - 86400000 * 2,
  },
  {
    id: 'QT-101',
    quoteNumber: '101',
    invoiceNumber: null,
    type: 'quotation',
    status: 'Pending Review',
    createdBy: 'Zayd Al-Maktoum',
    createdByRole: 'sales_agent',
    approvedBy: null,
    approvedByRole: null,
    customerName: 'Titan Fitness Club Dubai',
    contactNumber: '+971 50 123 4567',
    customerDetails: 'Al Quoz Industrial Area 3, Dubai, UAE',
    date: getDemoDate(0),
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
    createdAt: nowTs,
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
  // Theme Settings ('system' | 'light' | 'dark' - System as default)
  const [theme, setThemeState] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.THEME);
      return saved === 'light' || saved === 'dark' || saved === 'system' ? saved : 'system';
    } catch {
      return 'system';
    }
  });

  const [resolvedTheme, setResolvedTheme] = useState(() => {
    if (typeof window === 'undefined') return 'dark';
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.THEME) || 'system';
      if (saved === 'dark') return 'dark';
      if (saved === 'light') return 'light';
      return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches
        ? 'dark'
        : 'light';
    } catch {
      return 'dark';
    }
  });

  const setTheme = (newTheme) => {
    const val =
      newTheme === 'light' || newTheme === 'dark' || newTheme === 'system' ? newTheme : 'system';
    setThemeState(val);
    try {
      localStorage.setItem(STORAGE_KEYS.THEME, val);
    } catch (e) {
      console.warn('Could not save theme preference:', e);
    }
  };

  useEffect(() => {
    const applyTheme = () => {
      let active = theme;
      if (theme === 'system') {
        const isSystemDark =
          typeof window !== 'undefined' &&
          window.matchMedia &&
          window.matchMedia('(prefers-color-scheme: dark)').matches;
        active = isSystemDark ? 'dark' : 'light';
      }
      setResolvedTheme(active);

      if (typeof document !== 'undefined') {
        const root = document.documentElement;
        if (active === 'dark') {
          root.classList.add('dark');
          root.classList.remove('light');
          root.setAttribute('data-theme', 'dark');
          root.style.colorScheme = 'dark';
        } else {
          root.classList.add('light');
          root.classList.remove('dark');
          root.setAttribute('data-theme', 'light');
          root.style.colorScheme = 'light';
        }
      }
    };

    applyTheme();

    if (theme === 'system' && typeof window !== 'undefined' && window.matchMedia) {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      const handleChange = () => applyTheme();
      if (mediaQuery.addEventListener) {
        mediaQuery.addEventListener('change', handleChange);
        return () => mediaQuery.removeEventListener('change', handleChange);
      } else if (mediaQuery.addListener) {
        mediaQuery.addListener(handleChange);
        return () => mediaQuery.removeListener(handleChange);
      }
    }
  }, [theme]);

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

  // Super Admin Configurable Roles & Permissions State
  const [roleDefinitions, setRoleDefinitions] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.ROLE_PERMISSIONS);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed[ROLES.SALES_AGENT]?.permissions) {
          parsed[ROLES.SALES_AGENT].permissions.salesConversion = true;
        }
        return parsed;
      }
      return DEFAULT_ROLE_DEFINITIONS;
    } catch {
      return DEFAULT_ROLE_DEFINITIONS;
    }
  });

  // Super Admin Configurable System Accounts State
  const [accounts, setAccounts] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.SYSTEM_ACCOUNTS);
      return saved ? JSON.parse(saved) : DEFAULT_SYSTEM_ACCOUNTS;
    } catch {
      return DEFAULT_SYSTEM_ACCOUNTS;
    }
  });

  // Super Admin Configurable Operational & Security Parameters State
  const [systemConfig, setSystemConfig] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.SYSTEM_CONFIG);
      return saved ? JSON.parse(saved) : DEFAULT_SYSTEM_CONFIG;
    } catch {
      return DEFAULT_SYSTEM_CONFIG;
    }
  });

  // Admin Auth & Active RBAC Role State (with session expiry & role integrity verification)
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(() => {
    try {
      const isAuth = localStorage.getItem(STORAGE_KEYS.ADMIN_AUTH) === 'true';
      if (!isAuth) return false;

      // Check session expiry against configured session hours
      const sessionTs = parseInt(localStorage.getItem(STORAGE_KEYS.SESSION_TIMESTAMP) || '0', 10);
      const maxAgeMs = (systemConfig?.sessionTimeoutHours || 4) * 60 * 60 * 1000;
      if (!sessionTs || Date.now() - sessionTs > maxAgeMs) {
        localStorage.removeItem(STORAGE_KEYS.ADMIN_AUTH);
        localStorage.removeItem(STORAGE_KEYS.ADMIN_ROLE);
        localStorage.removeItem(STORAGE_KEYS.ADMIN_USER);
        localStorage.removeItem(STORAGE_KEYS.SESSION_TIMESTAMP);
        return false;
      }

      // Check role integrity against system roles
      const savedRole = localStorage.getItem(STORAGE_KEYS.ADMIN_ROLE);
      if (!savedRole || !roleDefinitions[savedRole]) {
        return false;
      }

      return true;
    } catch {
      return false;
    }
  });

  const [currentRole, setCurrentRole] = useState(() => {
    try {
      const savedRole = localStorage.getItem(STORAGE_KEYS.ADMIN_ROLE);
      return savedRole && roleDefinitions[savedRole] ? savedRole : ROLES.ADMIN_AGENT;
    } catch {
      return ROLES.ADMIN_AGENT;
    }
  });

  const [currentAdminUser, setCurrentAdminUser] = useState(() => {
    try {
      const savedUser = localStorage.getItem(STORAGE_KEYS.ADMIN_USER);
      if (savedUser) {
        const parsed = JSON.parse(savedUser);
        const matched = accounts.find((acc) => acc.username === parsed.username);
        if (matched) return matched;
      }
      return accounts[0] || DEFAULT_SYSTEM_ACCOUNTS[0];
    } catch {
      return DEFAULT_SYSTEM_ACCOUNTS[0];
    }
  });

  // Current Role Permissions Object (Strictly bound to authenticated role)
  const currentPermissions = useMemo(() => {
    return (
      roleDefinitions[currentRole]?.permissions ||
      DEFAULT_ROLE_DEFINITIONS[currentRole]?.permissions ||
      DEFAULT_ROLE_DEFINITIONS[ROLES.ADMIN_AGENT].permissions
    );
  }, [roleDefinitions, currentRole]);

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
    updateDynamicFavicon(companySettings);
  }, [companySettings]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.BANK_DETAILS, JSON.stringify(bankAccounts));
  }, [bankAccounts]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.ADMIN_AUTH, isAdminLoggedIn ? 'true' : 'false');
  }, [isAdminLoggedIn]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.SYSTEM_ACCOUNTS, JSON.stringify(accounts));
  }, [accounts]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.ROLE_PERMISSIONS, JSON.stringify(roleDefinitions));
  }, [roleDefinitions]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.SYSTEM_CONFIG, JSON.stringify(systemConfig));
  }, [systemConfig]);

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
    () =>
      cartItemsList.reduce((sum, item) => {
        const uPrice = Number(item.unitPrice || item.product?.price || 0);
        const oPrice = Math.max(0, uPrice - 500);
        return sum + oPrice * (Number(item.quantity) || 1);
      }, 0),
    [cartItemsList]
  );
  const additionalChargesTotal = useMemo(
    () =>
      additionalCharges.reduce((sum, ch) => {
        const amt = Number(ch && ch.amount);
        return sum + (amt > 0 ? amt : 0);
      }, 0),
    [additionalCharges]
  );
  const netTaxableSum = useMemo(
    () => Math.round((cartItemsSubtotal + additionalChargesTotal) * 100) / 100,
    [cartItemsSubtotal, additionalChargesTotal]
  );
  const totalVat = useMemo(
    () => Math.round(netTaxableSum * 0.05 * 100) / 100,
    [netTaxableSum]
  );
  const grandTotal = useMemo(
    () => Math.round((netTaxableSum + totalVat) * 100) / 100,
    [netTaxableSum, totalVat]
  );

  // Additional charges handlers
  const addAdditionalCharge = (chargeOrDesc, maybeAmount) => {
    let desc = '';
    let amt = 0;
    let customId = null;

    if (chargeOrDesc && typeof chargeOrDesc === 'object') {
      desc = (chargeOrDesc.description || chargeOrDesc.desc || '').trim();
      amt = Number(chargeOrDesc.amount) || 0;
      customId = chargeOrDesc.id || null;
    } else {
      desc = (chargeOrDesc ? String(chargeOrDesc) : '').trim();
      amt = Number(maybeAmount) || 0;
    }

    if (!desc || isNaN(amt) || amt <= 0) {
      return null;
    }

    const newCharge = {
      id: customId || `charge-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      description: desc,
      amount: Math.round(amt * 100) / 100,
    };

    setAdditionalCharges((prev) => [
      ...prev.filter((c) => c && c.id !== newCharge.id && c.description !== newCharge.description),
      newCharge,
    ]);
    return newCharge;
  };

  const toggleAdditionalCharge = (desc, amount) => {
    const cleanDesc = (desc ? String(desc) : '').trim();
    const cleanAmt = Number(amount) || 0;
    if (!cleanDesc || cleanAmt <= 0 || isNaN(cleanAmt)) return;

    setAdditionalCharges((prev) => {
      const exists = prev.some(
        (c) => c && c.description && c.description.toLowerCase() === cleanDesc.toLowerCase()
      );
      if (exists) {
        return prev.filter(
          (c) => !(c && c.description && c.description.toLowerCase() === cleanDesc.toLowerCase())
        );
      } else {
        const newCharge = {
          id: `charge-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
          description: cleanDesc,
          amount: Math.round(cleanAmt * 100) / 100,
        };
        return [...prev, newCharge];
      }
    });
  };

  const updateAdditionalCharge = (id, field, value) => {
    setAdditionalCharges((prev) =>
      prev.map((c) => (c.id === id ? { ...c, [field]: value } : c))
    );
  };

  const removeAdditionalCharge = (id) => {
    setAdditionalCharges((prev) => prev.filter((c) => c && c.id !== id));
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
      createdBy: currentAdminUser?.name || currentAdminUser?.username || 'Sales Agent',
      createdByRole: currentRole || 'sales_agent',
      approvedBy: null,
      approvedByRole: null,
      approvedAt: null,
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
      additionalCharges: additionalCharges
        .filter((c) => c && c.description && Number(c.amount) > 0)
        .map((c) => ({
          id: c.id,
          description: c.description,
          amount: Math.round(Number(c.amount) * 100) / 100,
        })),
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
          approvedBy: currentAdminUser?.name || currentAdminUser?.username || 'Finance Officer',
          approvedByRole: currentRole || 'finance_agent',
        };
      })
    );
    return true;
  };

  // Convert Quotation to Official Sales Invoice (once approved, any agent can generate invoice)
  const convertQuoteToSalesInvoice = (quoteId, modifiedData = {}) => {
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
          approvedBy: quote.approvedBy || currentAdminUser?.name || 'Finance Officer',
          approvedByRole: quote.approvedByRole || currentRole || 'finance_agent',
          invoiceGeneratedBy: currentAdminUser?.name || currentAdminUser?.username || currentRole,
          invoiceGeneratedByRole: currentRole,
          invoiceGeneratedAt: Date.now(),
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
            stockQty:
              updatedProduct.stockQty !== undefined
                ? Math.max(0, parseInt(updatedProduct.stockQty, 10) || 0)
                : p.stockQty !== undefined
                ? p.stockQty
                : 10,
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

  const updateProductStock = (productCode, newQty, securityPass = null) => {
    if (!currentPermissions.productionCrud) {
      alert('Access Denied: Warehouse stock modification is restricted to the Admin Agent.');
      return false;
    }
    if (securityPass && !verifySecurityPassword(securityPass)) {
      alert('Security Verification Failed: Valid password required to modify warehouse stock.');
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

  // Security: Check if login is currently rate-limited/locked out
  const checkLockout = () => {
    try {
      const lockoutTime = parseInt(localStorage.getItem(STORAGE_KEYS.LOCKOUT_UNTIL) || '0', 10);
      if (lockoutTime && Date.now() < lockoutTime) {
        return {
          isLocked: true,
          remainingSeconds: Math.ceil((lockoutTime - Date.now()) / 1000),
        };
      }
      return { isLocked: false, remainingSeconds: 0 };
    } catch {
      return { isLocked: false, remainingSeconds: 0 };
    }
  };

  const getFailedAttempts = () => {
    try {
      return parseInt(localStorage.getItem(STORAGE_KEYS.FAILED_ATTEMPTS) || '0', 10);
    } catch {
      return 0;
    }
  };

  // Secure Enterprise Authentication with Rate Limiting & Zero Backdoors
  const adminLogin = (username, password) => {
    const cleanUser = sanitizeInput(String(username || '')).toLowerCase();
    const cleanPass = String(password || '').trim();

    // 1. Check rate-limit lockout
    const lockout = checkLockout();
    if (lockout.isLocked) {
      return {
        success: false,
        isLocked: true,
        remainingSeconds: lockout.remainingSeconds,
        message: `Security Lockout Active: Terminal temporarily disabled. Please retry in ${lockout.remainingSeconds}s.`,
      };
    }

    if (!cleanUser || !cleanPass) {
      return {
        success: false,
        message: 'Username and password are required for enterprise authentication.',
      };
    }

    // 2. Strict Credential Verification against Authorized System Accounts (Zero Backdoors)
    const account = accounts.find(
      (acc) => acc.username.toLowerCase() === cleanUser && acc.password === cleanPass
    );

    if (account) {
      if (account.status === 'suspended' || account.status === 'inactive') {
        return {
          success: false,
          message: 'Account Suspended: This agent account has been disabled by the Super Admin.',
        };
      }

      try {
        localStorage.removeItem(STORAGE_KEYS.FAILED_ATTEMPTS);
        localStorage.removeItem(STORAGE_KEYS.LOCKOUT_UNTIL);
        localStorage.setItem(STORAGE_KEYS.ADMIN_AUTH, 'true');
        localStorage.setItem(STORAGE_KEYS.ADMIN_ROLE, account.role);
        localStorage.setItem(STORAGE_KEYS.ADMIN_USER, JSON.stringify(account));
        localStorage.setItem(STORAGE_KEYS.SESSION_TIMESTAMP, String(Date.now()));
      } catch (e) {
        console.error(e);
      }

      setIsAdminLoggedIn(true);
      setCurrentRole(account.role);
      setCurrentAdminUser(account);
      return { success: true, account };
    }

    // 3. Track Failed Login Attempts & Activate Rate-Limit Lockout
    const attempts = getFailedAttempts() + 1;
    const maxAttempts = systemConfig?.maxFailedAttempts || 5;
    const lockoutSecs = systemConfig?.lockoutDurationSeconds || 300;

    try {
      localStorage.setItem(STORAGE_KEYS.FAILED_ATTEMPTS, String(attempts));
    } catch (e) {
      console.error(e);
    }

    if (attempts >= maxAttempts) {
      const lockoutUntil = Date.now() + lockoutSecs * 1000;
      try {
        localStorage.setItem(STORAGE_KEYS.LOCKOUT_UNTIL, String(lockoutUntil));
      } catch (e) {
        console.error(e);
      }
      return {
        success: false,
        isLocked: true,
        remainingSeconds: lockoutSecs,
        message: `Security Alert: ${maxAttempts} consecutive failed login attempts detected. Terminal locked for ${lockoutSecs} seconds.`,
      };
    }

    return {
      success: false,
      isLocked: false,
      attemptsLeft: maxAttempts - attempts,
      message: `Authentication failed: Invalid credentials. (${maxAttempts - attempts} attempts remaining before temporary lockout)`,
    };
  };

  const adminLogout = () => {
    setIsAdminLoggedIn(false);
    try {
      localStorage.removeItem(STORAGE_KEYS.ADMIN_AUTH);
      localStorage.removeItem(STORAGE_KEYS.ADMIN_ROLE);
      localStorage.removeItem(STORAGE_KEYS.ADMIN_USER);
      localStorage.removeItem(STORAGE_KEYS.SESSION_TIMESTAMP);
    } catch (e) {
      console.error(e);
    }
  };

  // Security Verification Helper: verify entered security or login password for critical modifications
  const verifySecurityPassword = (enteredPassword) => {
    if (!enteredPassword) return false;
    const cleanPass = String(enteredPassword).trim();
    if (!cleanPass) return false;

    // 1. Check against currently logged in user's password
    if (currentAdminUser && currentAdminUser.password === cleanPass) {
      return true;
    }

    // 2. Check against any active administrator or superadmin account password
    const match = accounts.find(
      (acc) =>
        acc.status === 'active' &&
        (acc.role === ROLES.SUPER_ADMIN ||
          acc.role === ROLES.ADMIN_AGENT ||
          acc.username.toLowerCase() === currentAdminUser?.username?.toLowerCase()) &&
        acc.password === cleanPass
    );

    return Boolean(match);
  };

  // Super Admin: Account Creation & Management CRUD
  const createAccount = (newAccData) => {
    if (currentRole !== ROLES.SUPER_ADMIN) {
      alert('Access Denied: Only Super Admin Agent can create accounts.');
      return { success: false, message: 'Unauthorized' };
    }
    const cleanUsername = sanitizeInput(String(newAccData.username || '')).toLowerCase().trim();
    const cleanName = sanitizeInput(String(newAccData.name || '')).trim();
    const cleanPassword = String(newAccData.password || '').trim();
    const assignedRole = newAccData.role || ROLES.SALES_AGENT;

    if (!cleanUsername || cleanUsername.length < 3) {
      return { success: false, message: 'Username must be at least 3 characters.' };
    }
    if (accounts.some((a) => a.username.toLowerCase() === cleanUsername)) {
      return { success: false, message: `Username "${cleanUsername}" is already in use.` };
    }
    if (!cleanPassword || cleanPassword.length < 3) {
      return { success: false, message: 'Password must be at least 3 characters.' };
    }
    if (!roleDefinitions[assignedRole]) {
      return { success: false, message: 'Invalid agent role selected.' };
    }

    const newAccount = {
      id: 'acc-' + Date.now(),
      username: cleanUsername,
      password: cleanPassword,
      name: cleanName || cleanUsername,
      role: assignedRole,
      status: newAccData.status || 'active',
      createdAt: new Date().toISOString().split('T')[0],
    };

    setAccounts((prev) => [...prev, newAccount]);
    return { success: true, account: newAccount };
  };

  const updateAccount = (accountId, updatedData) => {
    if (currentRole !== ROLES.SUPER_ADMIN) {
      alert('Access Denied: Only Super Admin Agent can modify accounts.');
      return { success: false, message: 'Unauthorized' };
    }
    setAccounts((prev) =>
      prev.map((acc) => {
        if (acc.id === accountId || acc.username === accountId) {
          const updated = {
            ...acc,
            ...(updatedData.name ? { name: sanitizeInput(updatedData.name) } : {}),
            ...(updatedData.password ? { password: String(updatedData.password).trim() } : {}),
            ...(updatedData.role ? { role: updatedData.role } : {}),
            ...(updatedData.status ? { status: updatedData.status } : {}),
          };
          if (currentAdminUser?.username === acc.username) {
            setCurrentAdminUser(updated);
            localStorage.setItem(STORAGE_KEYS.ADMIN_USER, JSON.stringify(updated));
          }
          return updated;
        }
        return acc;
      })
    );
    return { success: true };
  };

  const deleteAccount = (accountId) => {
    if (currentRole !== ROLES.SUPER_ADMIN) {
      alert('Access Denied: Only Super Admin Agent can delete accounts.');
      return { success: false, message: 'Unauthorized' };
    }
    const target = accounts.find((a) => a.id === accountId || a.username === accountId);
    if (!target) return { success: false, message: 'Account not found.' };

    if (target.username.toLowerCase() === currentAdminUser?.username?.toLowerCase()) {
      return { success: false, message: 'Security Policy: You cannot delete your currently active Super Admin account.' };
    }
    const superAdminCount = accounts.filter((a) => a.role === ROLES.SUPER_ADMIN).length;
    if (target.role === ROLES.SUPER_ADMIN && superAdminCount <= 1) {
      return { success: false, message: 'Security Policy: System requires at least one Super Admin account.' };
    }

    setAccounts((prev) => prev.filter((a) => a.id !== accountId && a.username !== accountId));
    return { success: true };
  };

  // Super Admin: Role & Permissions Configuration
  const updateRolePermission = (roleId, permissionKey, isEnabled) => {
    if (currentRole !== ROLES.SUPER_ADMIN) {
      alert('Access Denied: Only Super Admin Agent can configure role permissions.');
      return false;
    }
    setRoleDefinitions((prev) => ({
      ...prev,
      [roleId]: {
        ...prev[roleId],
        permissions: {
          ...prev[roleId].permissions,
          [permissionKey]: Boolean(isEnabled),
        },
      },
    }));
    return true;
  };

  const updateRoleInfo = (roleId, info) => {
    if (currentRole !== ROLES.SUPER_ADMIN) {
      alert('Access Denied: Only Super Admin Agent can configure role metadata.');
      return false;
    }
    setRoleDefinitions((prev) => ({
      ...prev,
      [roleId]: {
        ...prev[roleId],
        ...(info.name ? { name: sanitizeInput(info.name) } : {}),
        ...(info.badge ? { badge: sanitizeInput(info.badge) } : {}),
        ...(info.description ? { description: sanitizeInput(info.description) } : {}),
      },
    }));
    return true;
  };

  const resetRolesToDefault = () => {
    if (currentRole !== ROLES.SUPER_ADMIN) {
      alert('Access Denied: Only Super Admin Agent can reset role permissions.');
      return false;
    }
    setRoleDefinitions(DEFAULT_ROLE_DEFINITIONS);
    return true;
  };

  // Super Admin: System Configuration Management
  const updateSystemConfig = (newCfg) => {
    if (currentRole !== ROLES.SUPER_ADMIN) {
      alert('Access Denied: Only Super Admin Agent can modify system parameters.');
      return false;
    }
    setSystemConfig((prev) => ({
      ...prev,
      ...newCfg,
    }));
    return true;
  };

  const resetSystemConfig = () => {
    if (currentRole !== ROLES.SUPER_ADMIN) return false;
    setSystemConfig(DEFAULT_SYSTEM_CONFIG);
    return true;
  };

  return (
    <AppContext.Provider
      value={{
        checkLockout,

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
        toggleAdditionalCharge,
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

        // Admin Auth & RBAC Roles & System Accounts
        isAdminLoggedIn,
        currentRole,
        currentAdminUser,
        currentPermissions,
        adminLogin,
        adminLogout,
        verifySecurityPassword,
        ROLES,
        ROLE_DEFINITIONS: roleDefinitions,
        roleDefinitions,
        accounts,
        SYSTEM_ACCOUNTS: accounts,
        createAccount,
        updateAccount,
        deleteAccount,
        updateRolePermission,
        updateRoleInfo,
        resetRolesToDefault,
        systemConfig,
        updateSystemConfig,
        resetSystemConfig,

        // Search & Filters
        searchQuery,
        setSearchQuery,
        selectedCategory,
        setSelectedCategory,

        // Theme Settings (Light, Dark, System)
        theme,
        resolvedTheme,
        setTheme,
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

