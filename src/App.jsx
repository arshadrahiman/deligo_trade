import React, { useState, useRef } from 'react';
import { useApp } from './context/AppContext';
import TopTicker from './components/TopTicker';
import Navbar from './components/Navbar';
import Pillars from './components/Pillars';
import SearchBar from './components/SearchBar';
import CategoryTabs from './components/CategoryTabs';
import ProductCard from './components/ProductCard';
import FloatingCartDock from './components/FloatingCartDock';
import CartDrawer from './components/CartDrawer';
import QuotationInvoicePage from './components/QuotationInvoicePage';
import ServicesPage from './components/ServicesPage';
import AboutPage from './components/AboutPage';
import SupportPage from './components/SupportPage';
import Footer from './components/Footer';
import AdminPortal from './components/AdminPortal';

export default function App() {
  const {
    currentPage,
    setCurrentPage,
    isAdminView,
    products,
    selectedCategory,
    searchQuery,
    setSearchQuery,
    cart,
    addToCart,
    removeFromCart,
  } = useApp();

  const [isCartOpen, setIsCartOpen] = useState(false);
  const productsGridRef = useRef(null);

  // Filter products by category and search
  const displayedProducts = products.filter((p) => {
    const matchesCategory =
      selectedCategory === 'ALL' ? true : p.category === selectedCategory;
    const matchesSearch =
      searchQuery.trim() === '' ||
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.description.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesCategory && matchesSearch;
  });

  const handleScrollToProducts = () => {
    if (productsGridRef.current) {
      productsGridRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen bg-[#07090E] text-slate-100 flex flex-col font-sans selection:bg-[#FED430] selection:text-black w-full max-w-full overflow-x-hidden">
      {/* 1. Top Industrial Ticker (Storefront only - Hidden in Admin View) */}
      {!isAdminView && <TopTicker />}

      {/* 2. Warehouse Gym Header Navbar (Storefront only - Hidden in Admin View) */}
      {!isAdminView && <Navbar onOpenCart={() => setIsCartOpen(true)} />}

      {/* 3. Main Content View */}
      <main className="flex-1 flex flex-col w-full max-w-full overflow-x-hidden">
        {isAdminView ? (
          <AdminPortal />
        ) : (
          <>
            {currentPage === 'products' && (
              <div className="w-full max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-4 space-y-4 flex-1">
                {/* 4 Feature Pillars */}
                <Pillars />

                {/* Search Bar with live autocomplete */}
                <div ref={productsGridRef} className="pt-2">
                  <SearchBar
                    onSelectProduct={(item) => {
                      setSearchQuery(item.code);
                      handleScrollToProducts();
                    }}
                  />
                </div>

                {/* Category Tabs */}
                <CategoryTabs />

                {/* Products Count Header */}
                <div className="flex items-center justify-between text-xs text-slate-400 py-1 border-b border-[#1E2839]">
                  <span className="font-bold uppercase tracking-wider text-slate-300">
                    Commercial Warehouse Stock ({displayedProducts.length} Machines)
                  </span>
                  <span>
                    UAE Immediate Dispatch • 5% VAT
                  </span>
                </div>

                {/* Products Grid */}
                {displayedProducts.length === 0 ? (
                  <div className="py-20 text-center space-y-3">
                    <p className="text-slate-400 text-sm">
                      No commercial equipment matched your search or category filter.
                    </p>
                    <button
                      onClick={() => setSearchQuery('')}
                      className="px-4 py-2 rounded-lg bg-[#141A26] border border-[#26334D] text-xs font-bold text-[#FED430]"
                    >
                      Reset Search Filters
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-5 pt-2">
                    {displayedProducts.map((p) => {
                      const inCartQty = cart[p.code]?.quantity || 0;
                      return (
                        <ProductCard
                          key={p.code}
                          product={p}
                          inCartQty={inCartQty}
                          onAdd={() => addToCart(p)}
                          onRemove={() => removeFromCart(p.code)}
                        />
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {currentPage === 'invoiceBill' && <QuotationInvoicePage />}

            {currentPage === 'services' && <ServicesPage />}

            {currentPage === 'aboutUs' && <AboutPage />}

            {currentPage === 'support' && <SupportPage />}
          </>
        )}
      </main>

      {/* Floating Bottom Quick Cart Dock (Storefront only) */}
      {!isAdminView && currentPage !== 'invoiceBill' && (
        <FloatingCartDock onOpenCart={() => setIsCartOpen(true)} />
      )}


      {/* Cart Slide-out Drawer */}
      <CartDrawer isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />

      {/* Global Footer (Storefront only) */}
      {!isAdminView && <Footer />}
    </div>
  );
}
