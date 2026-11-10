import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { initialWarehouseStock } from '../data/products';

const AppContext = createContext();

const STORAGE_KEYS = {
  PRODUCTS: 'delitrade_products_v1',
  QUOTES: 'delitrade_quotes_v1',
  SETTINGS: 'delitrade_company_settings_v1',
  BANK_DETAILS: 'delitrade_bank_details_v1',
  ADMIN_AUTH: 'delitrade_admin_auth_v1',
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

const INITIAL_DEMO_QUOTES = [
  {
    id: 'QT-101',
    quoteNumber: '101',
    invoiceNumber: null,
    type: 'quotation',
    status: 'Pending Quote',
    customerName: 'Titan Fitness Club Dubai',
    contactNumber: '+971 50 123 4567',
    customerDetails: 'Al Quoz Industrial Area 3, Dubai, UAE',
    date: '28-Oct-2026',
    invoiceDate: null,
    items: [
      {
        product: initialWarehouseStock[1], // LP-045 Leg Press
        quantity: 2,
        unitPrice: 5500,
        originalPrice: 5500,
        sum: 11000,
      },
      {
        product: initialWarehouseStock[8], // B069 Air Bike
        quantity: 3,
        unitPrice: 4500,
        originalPrice: 4500,
        sum: 13500,
      },
    ],
    additionalCharges: [
      {
        id: 'ac-1',
        description: 'Commercial Delivery & Ground Floor Assembly',
        amount: 850,
      },
    ],
    subtotal: 25350,
    vat: 1267.5,
    grandTotal: 26617.5,
    createdAt: Date.now() - 86400000 * 2,
  },
];

export function AppProvider({ children }) {
  // Navigation State
  const [currentPage, setCurrentPage] = useState('products'); // 'products'|'services'|'aboutUs'|'contact'|'support'|'invoiceBill'|'admin'
  const [isAdminView, setIsAdminView] = useState(false);

  // Products State
  const [products, setProducts] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.PRODUCTS);
      return saved ? JSON.parse(saved) : initialWarehouseStock;
    } catch {
      return initialWarehouseStock;
    }
  });

  // Cart State { [code]: { product, quantity } }
  const [cart, setCart] = useState({});

  // Active Quote Form in Storefront
  const [customerName, setCustomerName] = useState('');
  const [contactNumber, setContactNumber] = useState('');
  const [customerDetails, setCustomerDetails] = useState('');
  const [quotationNumber, setQuotationNumber] = useState('102');
  const [quoteDate, setQuoteDate] = useState(() => {
    const today = new Date();
    return `${today.getDate()}-${today.toLocaleString('en-US', { month: 'short' })}-${today.getFullYear()}`;
  });
  const [hasGeneratedQuote, setHasGeneratedQuote] = useState(false);
  const [additionalCharges, setAdditionalCharges] = useState([]);

  // Quotes Records
  const [quotesRecords, setQuotesRecords] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.QUOTES);
      return saved ? JSON.parse(saved) : INITIAL_DEMO_QUOTES;
    } catch {
      return INITIAL_DEMO_QUOTES;
    }
  });

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

  // Admin Auth State
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(() => {
    try {
      return localStorage.getItem(STORAGE_KEYS.ADMIN_AUTH) === 'true';
    } catch {
      return false;
    }
  });

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

  // Save Quote into Records
  const recordCurrentQuote = () => {
    if (cartItemsList.length === 0) return null;
    const newRecord = {
      id: `QT-${quotationNumber || Date.now().toString().slice(-4)}`,
      quoteNumber: quotationNumber || '102',
      invoiceNumber: null,
      type: 'quotation',
      status: 'Pending Quote',
      customerName: customerName.trim() || 'Valued Customer',
      contactNumber: contactNumber.trim() || '+971 56 329 6585',
      customerDetails: customerDetails.trim() || 'Dubai / UAE',
      date: quoteDate,
      invoiceDate: null,
      items: cartItemsList.map((item) => ({
        product: { ...item.product },
        quantity: item.quantity,
        unitPrice: item.product.price,
        originalPrice: item.product.price,
        sum: item.product.price * item.quantity,
      })),
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

  // Admin: Convert Quotation to Sales Invoice
  const convertQuoteToSalesInvoice = (quoteId, modifiedData = {}) => {
    setQuotesRecords((prev) =>
      prev.map((quote) => {
        if (quote.id !== quoteId) return quote;
        const newInvoiceNum = `INV-2026-${quote.quoteNumber || quote.id.replace('QT-', '')}`;
        const items = modifiedData.items || quote.items;
        const addCharges = modifiedData.additionalCharges !== undefined ? modifiedData.additionalCharges : quote.additionalCharges;
        
        const itemsSum = items.reduce((s, it) => s + (Number(it.unitPrice) * Number(it.quantity)), 0);
        const chargesSum = addCharges.reduce((s, ch) => s + (Number(ch.amount) || 0), 0);
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
  };

  // Admin: Delete quote record
  const deleteQuoteRecord = (quoteId) => {
    setQuotesRecords((prev) => prev.filter((q) => q.id !== quoteId));
  };

  // Product CRUD
  const addProduct = (newProduct) => {
    const productWithId = {
      ...newProduct,
      id: 'prod-' + Date.now(),
      code: newProduct.code.trim().toUpperCase(),
      price: parseFloat(newProduct.price) || 0,
      stockQty: parseInt(newProduct.stockQty, 10) || 1,
    };
    setProducts((prev) => [productWithId, ...prev]);
  };

  const updateProduct = (updatedProduct) => {
    setProducts((prev) =>
      prev.map((p) => (p.id === updatedProduct.id || p.code === updatedProduct.code ? updatedProduct : p))
    );
  };

  const deleteProduct = (productCodeOrId) => {
    setProducts((prev) => prev.filter((p) => p.code !== productCodeOrId && p.id !== productCodeOrId));
    // also remove from cart if present
    setCart((prev) => {
      const copy = { ...prev };
      delete copy[productCodeOrId];
      return copy;
    });
  };

  const updateProductStock = (productCode, newQty) => {
    setProducts((prev) =>
      prev.map((p) =>
        p.code === productCode ? { ...p, stockQty: Math.max(0, parseInt(newQty, 10) || 0) } : p
      )
    );
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

  // Admin Auth
  const adminLogin = (username, password) => {
    // Default admin credentials: username: admin, password: admin or delitrade2026
    if (
      (username === 'admin' || username === 'delitrade') &&
      (password === 'admin' || password === 'admin123' || password === 'delitrade2026')
    ) {
      setIsAdminLoggedIn(true);
      return { success: true };
    }
    return { success: false, message: 'Invalid username or password' };
  };

  const adminLogout = () => {
    setIsAdminLoggedIn(false);
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
        quoteDate,
        setQuoteDate,
        hasGeneratedQuote,
        setHasGeneratedQuote,
        additionalCharges,
        addAdditionalCharge,
        updateAdditionalCharge,
        removeAdditionalCharge,
        recordCurrentQuote,

        // Quotes records
        quotesRecords,
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

        // Admin Auth
        isAdminLoggedIn,
        adminLogin,
        adminLogout,

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

