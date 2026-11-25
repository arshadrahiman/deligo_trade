import React, { useState, useEffect } from 'react';
import {
  ArrowLeft,
  RefreshCw,
  Printer,
  Download,
  Share2,
  Plus,
  Trash2,
  CheckCircle,
  Dumbbell,
  Receipt,
  Building,
  CreditCard,
  FileCheck2,
  ShieldCheck,
  Send,
  SlidersHorizontal,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { numberToWords, formatCurrency } from '../utils/numberToWords';
import { generateInvoicePdf } from '../utils/pdfGenerator';

export default function QuotationInvoicePage() {
  const {
    cartItemsList,
    cartItemsSubtotal,
    netTaxableSum,
    totalVat,
    grandTotal,
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
    additionalCharges,
    addAdditionalCharge,
    updateAdditionalCharge,
    removeAdditionalCharge,
    clearCart,
    setCurrentPage,
    recordCurrentQuote,
    companySettings,
    bankAccounts,
  } = useApp();

  const [isExporting, setIsExporting] = useState(false);

  // Automatically record this quote into quotesRecords when viewed
  useEffect(() => {
    if (cartItemsList.length > 0) {
      recordCurrentQuote();
    }
  }, [customerName, contactNumber, customerDetails, additionalCharges, cartItemsList]);

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPdf = async () => {
    setIsExporting(true);
    try {
      const doc = await generateInvoicePdf({
        type: 'QUOTATION',
        documentNumber: quotationNumber || '102',
        date: quoteDate,
        customerName: customerName.trim() || 'Valued Commercial Client',
        contactNumber: contactNumber.trim() || companySettings.phone,
        customerDetails: customerDetails.trim() || 'Dubai / UAE',
        items: cartItemsList.map((it) => ({
          product: it.product,
          quantity: it.quantity,
          unitPrice: it.product.price,
        })),
        additionalCharges,
        subtotal: netTaxableSum,
        vat: totalVat,
        grandTotal,
        companySettings,
        bankAccounts,
      });

      doc.save(`Delitrade_Quotation_${quotationNumber || '102'}.pdf`);
    } catch (err) {
      console.error('PDF export error:', err);
      alert('Unable to generate PDF document. Falling back to print.');
      window.print();
    } finally {
      setIsExporting(false);
    }
  };

  const handleShareWhatsApp = () => {
    const summary =
      `*DELITRADE COMMERCIAL QUOTATION #QT-${quotationNumber || '102'}*\n` +
      `Client: ${customerName || 'Valued Commercial Client'}\n` +
      `Date: ${quoteDate}\n` +
      `---------------------------\n` +
      cartItemsList
        .map(
          (it, i) =>
            `${i + 1}. ${it.product.name} (${it.product.code}) x${it.quantity} = AED ${formatCurrency(it.product.price * it.quantity)}`
        )
        .join('\n') +
      (additionalCharges.length > 0
        ? `\nAdditional Services / Charges:\n` +
          additionalCharges
            .map((c) => `- ${c.description}: AED ${formatCurrency(c.amount)}`)
            .join('\n')
        : '') +
      `\n---------------------------\n` +
      `Net Subtotal: AED ${formatCurrency(netTaxableSum)}\n` +
      `UAE FTA VAT (5%): AED ${formatCurrency(totalVat)}\n` +
      `*Grand Total: AED ${formatCurrency(grandTotal)}*\n` +
      `Amount in words: ${numberToWords(grandTotal)}\n\n` +
      `Trading Facility: ${companySettings.website || 'www.emmafitness.ae'}`;

    const phone = (companySettings.phone || '971563296585').replace(/[^0-9]/g, '');
    window.open(`https://wa.me/${phone}?text=${encodeURIComponent(summary)}`, '_blank');
  };

  if (cartItemsList.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center space-y-4">
        <div className="w-16 h-16 rounded-2xl bg-surface border border-white/10 flex items-center justify-center mx-auto text-slate-500 shadow-xl">
          <Receipt className="w-8 h-8" />
        </div>
        <h2 className="text-xl sm:text-2xl font-bold text-white">
          No Commercial Invoice / Quote Generated Yet
        </h2>
        <p className="text-slate-400 text-xs sm:text-sm max-w-md mx-auto leading-relaxed">
          Select equipment units from our certified commercial machinery terminal to compile a real-time quotation and tax invoice bill.
        </p>
        <button
          onClick={() => setCurrentPage('products')}
          className="px-5 py-2.5 rounded-lg bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 font-bold text-xs uppercase tracking-wider hover:brightness-110 shadow-lg shadow-amber-500/20 inline-flex items-center gap-2 transition-all"
        >
          <Dumbbell className="w-4 h-4" />
          <span>Browse Machinery Terminal</span>
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-2 sm:px-4 lg:px-6 py-6 space-y-5">
      {/* 1. Top Enterprise Action Bar (Hidden in Print) */}
      <div className="print:hidden p-3.5 sm:p-4 rounded-xl bg-surface/90 border border-white/10 flex flex-wrap items-center justify-between gap-3 shadow-2xl backdrop-blur-md">
        <div className="flex items-center gap-2.5">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-mono font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
            OFFICIAL B2B QUOTATION READY
          </span>
          <span className="text-xs font-mono font-bold text-slate-200 hidden sm:inline">
            #QT-2026-{quotationNumber || '102'} {customerName ? `• ${customerName}` : ''}
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setCurrentPage('products')}
            className="flex items-center gap-1.5 px-3 py-1.5 sm:py-2 rounded-lg bg-surface border border-white/10 text-xs font-semibold text-slate-300 hover:text-white hover:bg-white/5 transition-all"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Terminal</span>
          </button>

          <button
            onClick={() => {
              if (confirm('Clear active quote and start a fresh quotation ledger?')) {
                clearCart();
                setCurrentPage('products');
              }
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 sm:py-2 rounded-lg border border-white/10 text-xs font-semibold text-slate-400 hover:text-white hover:bg-white/5 transition-all"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Reset</span>
          </button>

          <button
            onClick={handlePrint}
            className="flex items-center gap-1.5 px-3.5 py-1.5 sm:py-2 rounded-lg bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 text-xs font-bold uppercase tracking-wider hover:brightness-110 shadow-md shadow-amber-500/20 active:scale-95 transition-all"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print PDF</span>
          </button>

          <button
            onClick={handleDownloadPdf}
            disabled={isExporting}
            className="flex items-center gap-1.5 px-3.5 py-1.5 sm:py-2 rounded-lg bg-surface border border-white/10 hover:border-amber-500/40 text-white text-xs font-semibold transition-all shadow-sm"
          >
            <Download className="w-3.5 h-3.5 text-amber-400" />
            <span>{isExporting ? 'Generating...' : 'Export PDF'}</span>
          </button>

          <button
            onClick={handleShareWhatsApp}
            className="flex items-center gap-1.5 px-3.5 py-1.5 sm:py-2 rounded-lg bg-[#25D366] hover:bg-[#20bd5a] text-slate-950 text-xs font-bold transition-all shadow-sm shadow-[#25D366]/20"
          >
            <Share2 className="w-3.5 h-3.5" />
            <span>Share (WhatsApp)</span>
          </button>
        </div>
      </div>

      {/* 2. Client Quick Editor Banner (Hidden in Print) */}
      <div className="print:hidden p-4 rounded-xl bg-surface/70 border border-white/10 space-y-3.5 shadow-xl">
        <div className="flex items-center justify-between">
          <span className="text-xs font-mono font-bold uppercase tracking-widest text-amber-400 flex items-center gap-1.5">
            <SlidersHorizontal className="w-3.5 h-3.5" />
            Quotation Parameters & Dispatch Surcharges
          </span>
          <span className="text-[10px] font-mono text-slate-400">
            Real-time synchronization with document below
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 text-xs">
          <div>
            <label className="text-slate-400 block mb-1 font-medium text-[11px]">Customer / Gym Entity</label>
            <input
              type="text"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              placeholder="e.g. Metroflex Fitness UAE"
              className="w-full bg-[#070A12] border border-white/10 rounded-lg px-2.5 py-1.5 text-white placeholder:text-slate-600 focus:outline-none focus:border-amber-500/60 font-sans"
            />
          </div>

          <div>
            <label className="text-slate-400 block mb-1 font-medium text-[11px]">Contact / WhatsApp Phone</label>
            <input
              type="text"
              value={contactNumber}
              onChange={(e) => setContactNumber(e.target.value)}
              placeholder="e.g. +971 50 123 4567"
              className="w-full bg-[#070A12] border border-white/10 rounded-lg px-2.5 py-1.5 text-white placeholder:text-slate-600 focus:outline-none focus:border-amber-500/60 font-mono"
            />
          </div>

          <div>
            <label className="text-slate-400 block mb-1 font-medium text-[11px]">Quotation Ref Code</label>
            <input
              type="text"
              value={quotationNumber}
              onChange={(e) => setQuotationNumber(e.target.value)}
              placeholder="102"
              className="w-full bg-[#070A12] border border-white/10 rounded-lg px-2.5 py-1.5 text-white placeholder:text-slate-600 focus:outline-none focus:border-amber-500/60 font-mono"
            />
          </div>

          <div>
            <label className="text-slate-400 block mb-1 font-medium text-[11px]">Dispatch Location / Emirate</label>
            <input
              type="text"
              value={customerDetails}
              onChange={(e) => setCustomerDetails(e.target.value)}
              placeholder="Dubai, UAE"
              className="w-full bg-[#070A12] border border-white/10 rounded-lg px-2.5 py-1.5 text-white placeholder:text-slate-600 focus:outline-none focus:border-amber-500/60 font-sans"
            />
          </div>
        </div>

        {/* Additional Charges Section */}
        <div className="pt-2 border-t border-white/5 flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-300">
              Additional Services / Surcharges ({additionalCharges.length}):
            </span>
            <button
              onClick={() => addAdditionalCharge()}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-amber-500/10 border border-amber-500/30 text-amber-400 hover:bg-amber-500/20 text-xs font-medium transition-colors"
            >
              <Plus className="w-3 h-3" />
              <span>+ Add Service Line</span>
            </button>
          </div>

          {additionalCharges.length > 0 && (
            <span className="text-xs font-mono text-slate-400">
              Total Additional: AED{' '}
              {formatCurrency(
                additionalCharges.reduce((s, c) => s + (parseFloat(c.amount) || 0), 0)
              )}
            </span>
          )}
        </div>

        {/* List of Additional Charge inputs */}
        {additionalCharges.length > 0 && (
          <div className="space-y-2 pt-1">
            {additionalCharges.map((charge) => (
              <div
                key={charge.id}
                className="flex items-center gap-2 bg-[#070A12] p-2 rounded-lg border border-white/10"
              >
                <input
                  type="text"
                  value={charge.description}
                  onChange={(e) => updateAdditionalCharge(charge.id, 'description', e.target.value)}
                  placeholder="Charge Description (e.g. Turnkey Rigging & Delivery, Rubber Flooring Installation)"
                  className="flex-1 bg-transparent border-0 rounded px-2 py-1 text-xs text-white focus:outline-none"
                />
                <div className="flex items-center gap-1.5 bg-surface px-2 py-1 rounded border border-white/5">
                  <span className="text-[10px] font-mono text-amber-400">AED</span>
                  <input
                    type="number"
                    value={charge.amount}
                    onChange={(e) => updateAdditionalCharge(charge.id, 'amount', e.target.value)}
                    placeholder="500"
                    className="w-20 bg-transparent border-0 text-xs text-white focus:outline-none font-mono"
                  />
                </div>
                <button
                  onClick={() => removeAdditionalCharge(charge.id)}
                  className="p-1.5 rounded text-slate-400 hover:text-red-400 hover:bg-white/5 transition-colors"
                  title="Remove charge"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 3. Fully Responsive Printable Commercial Invoice Document */}
      <div className="w-full max-w-full pb-8">
        <div
          id="printable-commercial-invoice"
          className="w-full max-w-[900px] mx-auto bg-white text-slate-900 rounded-xl p-4 sm:p-8 border border-slate-300 shadow-2xl print:shadow-none print:border-none print:m-0 print:p-0 print:max-w-none"
        >
          {/* Top Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start gap-4 pb-4 border-b border-slate-200">
            {/* Left Brand */}
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-lg bg-slate-900 flex items-center justify-center text-amber-400 font-mono text-lg sm:text-xl font-black flex-shrink-0 shadow-sm border border-slate-800">
                DT
              </div>
              <div>
                <h1 className="text-lg sm:text-xl font-black text-slate-950 tracking-tight leading-none uppercase">
                  {companySettings.brandHeader || 'DELITRADE • EMMA FITNESS'}
                </h1>
                <p className="text-[9px] sm:text-[10px] font-semibold text-slate-600 tracking-wider uppercase mt-1">
                  {companySettings.legalName ||
                    'SPORTS FIELDS & HALLS EQUIPMENT TRADING CO. L.L.C'}
                </p>
                <p className="text-[9px] text-slate-500 font-mono">
                  COMMERCIAL GYM MACHINERY DIVISION • DUBAI WH-1
                </p>
              </div>
            </div>

            {/* Right TRN & Contacts */}
            <div className="w-full sm:w-auto text-left sm:text-right space-y-0.5 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100">
              <div className="inline-block px-2.5 py-0.5 rounded bg-slate-900 text-amber-400 text-[10px] sm:text-[11px] font-mono font-bold tracking-wider mb-1 border border-slate-800">
                TRN: {companySettings.trn || '100569744400003'}
              </div>
              <p className="text-[10px] sm:text-[10.5px] font-semibold text-slate-800">
                Phone: {companySettings.phone || '+971 56 329 6585'}
              </p>
              <p className="text-[10px] sm:text-[10.5px] text-slate-600">
                Website: {companySettings.website || 'www.emmafitness.ae'}
              </p>
              <p className="text-[10px] sm:text-[10.5px] text-slate-600">
                Email: {companySettings.email || 'emmafitdxb@gmail.com'}
              </p>
              <p className="text-[9.5px] sm:text-[10px] text-slate-500">
                Facility: {companySettings.address || 'Al Muteena, Deira, Dubai, UAE'}
              </p>
            </div>
          </div>

          {/* Title Bar */}
          <div className="w-full bg-slate-900 text-white text-center py-2 font-mono text-xs sm:text-sm font-bold tracking-widest uppercase my-3 rounded-md border border-slate-800 flex items-center justify-center gap-2">
            <span>OFFICIAL COMMERCIAL QUOTATION / TAX INVOICE</span>
          </div>

          {/* Desktop/Print Customer Details Table */}
          <table className="hidden sm:table print:table w-full border-collapse border border-slate-300 text-[11px] my-3">
            <tbody>
              <tr className="border-b border-slate-300">
                <td className="w-32 bg-slate-100 p-2 font-bold text-slate-800 border-r border-slate-300">
                  Customer Entity
                </td>
                <td className="p-2 border-r border-slate-300 font-semibold text-slate-900">
                  {customerName.trim() || 'Valued Commercial Client'}
                </td>
                <td className="w-32 bg-slate-100 p-2 font-bold text-slate-800 border-r border-slate-300">
                  Document Reference
                </td>
                <td className="p-2 font-mono font-bold text-slate-900">
                  #QT-2026-{quotationNumber.trim() || '102'}
                </td>
              </tr>
              <tr className="border-b border-slate-300">
                <td className="bg-slate-100 p-2 font-bold text-slate-800 border-r border-slate-300">
                  TRN Reference
                </td>
                <td className="p-2 border-r border-slate-300 font-mono text-slate-800">
                  {companySettings.trn || '100569744400003'}
                </td>
                <td className="bg-slate-100 p-2 font-bold text-slate-800 border-r border-slate-300">
                  Contact Number
                </td>
                <td className="p-2 font-mono text-slate-800">
                  {contactNumber.trim() || '+971 56 329 6585'}
                </td>
              </tr>
              <tr className="border-b border-slate-300">
                <td className="bg-slate-100 p-2 font-bold text-slate-800 border-r border-slate-300">
                  Dispatch Location
                </td>
                <td className="p-2 border-r border-slate-300 text-slate-800">
                  {customerDetails.trim() || 'Dubai / UAE'}
                </td>
                <td className="bg-slate-100 p-2 font-bold text-slate-800 border-r border-slate-300">
                  Issuance Date
                </td>
                <td className="p-2 font-semibold text-slate-800">
                  {quoteDate}
                </td>
              </tr>
              <tr>
                <td className="bg-slate-100 p-2 font-bold text-slate-800 border-r border-slate-300">
                  Tax Status
                </td>
                <td className="p-2 border-r border-slate-300 text-slate-800">
                  Standard Rated (5% UAE FTA VAT Included)
                </td>
                <td className="bg-slate-100 p-2 font-bold text-slate-800 border-r border-slate-300">
                  Payment Terms
                </td>
                <td className="p-2 font-semibold text-emerald-800">
                  50% Advance Booking, 50% Prior to Dispatch
                </td>
              </tr>
            </tbody>
          </table>

          {/* Mobile Customer Details (Stacked Responsive Card) */}
          <div className="sm:hidden print:hidden border border-slate-300 rounded-lg text-xs my-2.5 bg-slate-50 overflow-hidden divide-y divide-slate-200">
            <div className="flex justify-between p-2">
              <span className="font-semibold text-slate-600 text-[11px]">Customer:</span>
              <span className="font-bold text-slate-900 text-right">{customerName.trim() || 'Valued Commercial Client'}</span>
            </div>
            <div className="flex justify-between p-2">
              <span className="font-semibold text-slate-600 text-[11px]">Quotation #:</span>
              <span className="font-mono font-bold text-slate-900">#QT-2026-{quotationNumber.trim() || '102'}</span>
            </div>
            <div className="flex justify-between p-2">
              <span className="font-semibold text-slate-600 text-[11px]">Issuance Date:</span>
              <span className="font-medium text-slate-800">{quoteDate}</span>
            </div>
            <div className="flex justify-between p-2">
              <span className="font-semibold text-slate-600 text-[11px]">Contact:</span>
              <span className="font-mono text-slate-800">{contactNumber.trim() || '+971 56 329 6585'}</span>
            </div>
            <div className="flex justify-between p-2">
              <span className="font-semibold text-slate-600 text-[11px]">Location:</span>
              <span className="text-slate-800 text-right">{customerDetails.trim() || 'Dubai, UAE'}</span>
            </div>
            <div className="flex justify-between p-2 bg-emerald-50/70">
              <span className="font-semibold text-emerald-800 text-[11px]">Payment Terms:</span>
              <span className="font-semibold text-emerald-950 text-right text-[11px]">50% Advance, 50% Prior to Delivery</span>
            </div>
          </div>

          {/* Desktop/Print Products & Line Items Table */}
          <table className="hidden sm:table print:table w-full border-collapse border border-slate-300 text-xs my-2">
            <thead>
              <tr className="bg-slate-900 text-white text-[11px] font-bold">
                <th className="border border-slate-300 p-2 text-center w-10">#</th>
                <th className="border border-slate-300 p-2 text-left">EQUIPMENT MODEL & SPECIFICATION</th>
                <th className="border border-slate-300 p-2 text-center w-16">IMAGE</th>
                <th className="border border-slate-300 p-2 text-right w-24">UNIT (AED)</th>
                <th className="border border-slate-300 p-2 text-center w-12">QTY</th>
                <th className="border border-slate-300 p-2 text-right w-28">LINE TOTAL (AED)</th>
              </tr>
            </thead>
            <tbody>
              {cartItemsList.map((item, idx) => (
                <tr key={item.product.code} className="border-b border-slate-200">
                  <td className="border border-slate-300 p-2 text-center font-mono font-bold text-slate-600">
                    {idx + 1}
                  </td>
                  <td className="border border-slate-300 p-2">
                    <div className="font-bold text-slate-900 text-xs">
                      {item.product.name}
                    </div>
                    <div className="text-[10px] font-mono text-slate-500 mt-0.5">
                      CODE: {item.product.code} • DIVISION: {item.product.category}
                    </div>
                  </td>
                  <td className="border border-slate-300 p-1 text-center">
                    <div className="w-12 h-12 mx-auto border border-slate-200 rounded p-0.5 flex items-center justify-center bg-white shadow-xs">
                      <img
                        src={item.product.imagePath}
                        alt={item.product.name}
                        className="max-h-full max-w-full object-contain"
                        onError={(e) => {
                          e.target.style.display = 'none';
                        }}
                      />
                    </div>
                  </td>
                  <td className="border border-slate-300 p-2 text-right font-mono text-slate-800">
                    {formatCurrency(item.product.price)}
                  </td>
                  <td className="border border-slate-300 p-2 text-center font-mono font-bold text-slate-900">
                    {item.quantity}
                  </td>
                  <td className="border border-slate-300 p-2 text-right font-mono font-bold text-slate-950">
                    {formatCurrency(item.product.price * item.quantity)}
                  </td>
                </tr>
              ))}

              {/* Additional Charges as Line Items */}
              {additionalCharges.map((ch, idx) => (
                <tr key={ch.id} className="border-b border-slate-200 bg-amber-50/40">
                  <td className="border border-slate-300 p-2 text-center font-mono font-bold text-amber-800">
                    {cartItemsList.length + idx + 1}
                  </td>
                  <td colSpan={2} className="border border-slate-300 p-2 font-medium text-slate-900">
                    <span className="text-[9.5px] font-mono px-1.5 py-0.5 rounded bg-amber-200/80 text-amber-900 font-bold mr-2">
                      LOGISTICS / SERVICE
                    </span>
                    {ch.description || 'Turnkey Delivery & Assembly'}
                  </td>
                  <td className="border border-slate-300 p-2 text-right font-mono text-slate-800">
                    {formatCurrency(ch.amount)}
                  </td>
                  <td className="border border-slate-300 p-2 text-center font-mono font-bold text-slate-900">1</td>
                  <td className="border border-slate-300 p-2 text-right font-mono font-bold text-amber-900">
                    {formatCurrency(ch.amount)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Mobile Equipment Items (Responsive Touch Cards) */}
          <div className="sm:hidden print:hidden border border-slate-300 rounded-lg overflow-hidden my-2.5 divide-y divide-slate-200">
            <div className="bg-slate-900 text-white text-[11px] font-mono font-bold px-3 py-2 uppercase flex justify-between items-center">
              <span>Equipment Units ({cartItemsList.length})</span>
              <span>Line Total</span>
            </div>
            {cartItemsList.map((item, idx) => (
              <div key={item.product.code} className="p-3 bg-white space-y-2">
                <div className="flex items-start gap-2.5">
                  <span className="font-mono font-bold text-xs text-slate-400 mt-0.5">#{idx + 1}</span>
                  <div className="w-12 h-12 bg-white rounded border border-slate-200 p-0.5 flex-shrink-0 flex items-center justify-center">
                    <img
                      src={item.product.imagePath}
                      alt={item.product.name}
                      className="max-h-full max-w-full object-contain"
                      onError={(e) => { e.target.style.display = 'none'; }}
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-bold text-slate-900 text-xs leading-snug">{item.product.name}</h4>
                    <span className="font-mono text-[10px] text-slate-500 block">CODE: {item.product.code} • {item.product.category}</span>
                  </div>
                </div>
                <div className="flex justify-between items-center text-xs bg-slate-50 p-2 rounded border border-slate-100">
                  <span className="text-slate-600 font-mono text-[11px]">
                    Qty: <strong className="text-slate-900 font-bold">{item.quantity}</strong> × AED {formatCurrency(item.product.price)}
                  </span>
                  <span className="font-mono font-bold text-slate-950 text-xs">
                    AED {formatCurrency(item.product.price * item.quantity)}
                  </span>
                </div>
              </div>
            ))}

            {/* Additional Charges on Mobile */}
            {additionalCharges.map((ch, idx) => (
              <div key={ch.id} className="p-2.5 bg-amber-50/70 space-y-1">
                <div className="flex items-center gap-1.5">
                  <span className="font-mono font-bold text-xs text-amber-800">#{cartItemsList.length + idx + 1}</span>
                  <span className="text-[9px] font-mono font-bold uppercase px-1.5 py-0.2 rounded bg-amber-200 text-amber-900">SERVICE</span>
                  <span className="font-semibold text-slate-900 text-xs truncate">{ch.description || 'Logistics Charge'}</span>
                </div>
                <div className="flex justify-between items-center text-xs pt-0.5">
                  <span className="text-slate-500 font-mono text-[11px]">Qty: 1</span>
                  <span className="font-mono font-bold text-amber-950 text-xs">AED {formatCurrency(ch.amount)}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Totals Section */}
          <div className="border border-slate-300 text-xs rounded-b-lg overflow-hidden mt-1">
            {/* Sub Total */}
            <div className="flex justify-between items-center px-3 sm:px-4 py-2 border-b border-slate-200 bg-white">
              <span className="font-semibold text-slate-600">Net Taxable Subtotal</span>
              <span className="font-mono font-bold text-xs sm:text-sm text-slate-900">
                AED {formatCurrency(netTaxableSum)}
              </span>
            </div>

            {/* VAT 5% */}
            <div className="flex justify-between items-center px-3 sm:px-4 py-2 border-b border-slate-200 bg-slate-50/70">
              <span className="font-semibold text-slate-600">UAE FTA VAT (5%)</span>
              <span className="font-mono font-bold text-xs sm:text-sm text-emerald-700">
                AED {formatCurrency(totalVat)}
              </span>
            </div>

            {/* Amount in Words */}
            <div className="px-3 sm:px-4 py-2 border-b border-slate-200 bg-slate-50 text-[10.5px] sm:text-[11px] font-mono text-slate-700">
              AMOUNT IN WORDS:{' '}
              <strong className="font-sans text-slate-950 font-bold block sm:inline mt-0.5 sm:mt-0">
                {numberToWords(grandTotal)}
              </strong>
            </div>

            {/* Grand Total */}
            <div className="flex justify-between items-center px-3 sm:px-4 py-2.5 bg-slate-900 text-white">
              <span className="font-mono text-xs sm:text-sm font-bold uppercase tracking-wider text-amber-400">
                Grand Total (AED)
              </span>
              <span className="font-mono font-black text-sm sm:text-base text-amber-400">
                AED {formatCurrency(grandTotal)}
              </span>
            </div>
          </div>

          {/* BANK DETAILS Section */}
          <div className="mt-4">
            <div className="w-full bg-slate-900 text-white px-3 py-1 font-mono font-bold text-[10px] sm:text-[11px] tracking-wider uppercase rounded-t-sm flex items-center justify-between">
              <span>OFFICIAL WIRE TRANSFER & BANK SETTLEMENT</span>
              <span className="text-[9px] text-amber-400">FTA COMPLIANT</span>
            </div>
            <div className="p-3 bg-slate-50 border border-slate-300 text-[10px] sm:text-[11px] font-mono space-y-1.5 break-words">
              {bankAccounts.length > 0 ? (
                bankAccounts.map((b) => (
                  <div key={b.id} className="text-slate-800 leading-relaxed">
                    • <strong>{b.accountTitle}</strong> | {b.bankName} | A/C:{' '}
                    <strong>{b.accountNumber}</strong> | IBAN: <strong className="break-all">{b.iban}</strong>{' '}
                    {b.swift ? `(SWIFT: ${b.swift})` : ''}
                  </div>
                ))
              ) : (
                <>
                  <div className="text-slate-800 leading-relaxed">
                    • <strong>EMMA GYM AND EKAVEERA KALARI LLC SPC</strong> | ADCB BANK | A/C:{' '}
                    <strong>13613665820001</strong> | IBAN:{' '}
                    <strong className="break-all">AE080030013613665820001</strong>
                  </div>
                  <div className="text-slate-800 leading-relaxed">
                    • <strong>EMMA GYM</strong> | FAB BANK | A/C:{' '}
                    <strong>1001327234596001</strong> | IBAN:{' '}
                    <strong className="break-all">AE660351001327234596001</strong>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* TERMS & CONDITIONS Section */}
          <div className="mt-3">
            <div className="w-full bg-slate-900 text-white px-3 py-1 font-mono font-bold text-[10px] sm:text-[11px] tracking-wider uppercase rounded-t-sm">
              COMMERCIAL TRADING TERMS & WARRANTY
            </div>
            <div className="p-3 bg-slate-50 border border-slate-300 text-[10px] sm:text-[10.5px] text-slate-700 space-y-1 leading-relaxed">
              <p>• Commercial validity: 7 calendar days from issuance. Factory direct inventory subject to prior allocation.</p>
              <p>• Milestone Payment: 50% advance booking deposit; balance 50% prior to warehouse dispatch or site delivery.</p>
              <p>• Turnkey delivery & positioning handled across Dubai, Abu Dhabi, Sharjah, Ajman, and Northern Emirates.</p>
              <p>• Includes 1-Year Comprehensive Structural Frame & AC Motor Commercial Refurbishment Warranty.</p>
            </div>
          </div>

          {/* Authorized Signature & Stamp Section */}
          <div className="mt-6 pt-4 border-t border-slate-200 grid grid-cols-2 gap-4 text-[10px] text-slate-600">
            <div>
              <p className="font-semibold text-slate-900 uppercase">Prepared By Operations Desk</p>
              <p className="text-slate-500 font-mono mt-1">Delitrade Dubai Commercial Hub</p>
            </div>
            <div className="text-right">
              <p className="font-semibold text-slate-900 uppercase">Authorized Corporate Stamp</p>
              <p className="text-slate-400 italic text-[9px] mt-1">Certified B2B Transaction Record</p>
            </div>
          </div>

          {/* Document Footer */}
          <div className="mt-4 pt-3 border-t border-slate-200 flex flex-col sm:flex-row justify-between items-center gap-1 text-[9px] sm:text-[9.5px] text-slate-500 font-mono">
            <span>
              {companySettings.brandHeader || 'DELITRADE'} • PHONE: {companySettings.phone || '+971 56 329 6585'} • {companySettings.website || 'WWW.EMMAFITNESS.AE'}
            </span>
            <span>OFFICIAL TRANSACTION DOCUMENT • PAGE 1 OF 1</span>
          </div>
        </div>
      </div>
    </div>
  );
}
