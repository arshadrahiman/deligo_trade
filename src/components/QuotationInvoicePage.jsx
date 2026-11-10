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
  const [saveSuccess, setSaveSuccess] = useState(false);

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
        customerName: customerName.trim() || 'Valued Customer',
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
      `Client: ${customerName || 'Valued Customer'}\n` +
      `Date: ${quoteDate}\n` +
      `---------------------------\n` +
      cartItemsList
        .map(
          (it, i) =>
            `${i + 1}. ${it.product.name} (${it.product.code}) x${it.quantity} = AED ${formatCurrency(it.product.price * it.quantity)}`
        )
        .join('\n') +
      (additionalCharges.length > 0
        ? `\nAdditional Charges:\n` +
          additionalCharges
            .map((c) => `- ${c.description}: AED ${formatCurrency(c.amount)}`)
            .join('\n')
        : '') +
      `\n---------------------------\n` +
      `Subtotal: AED ${formatCurrency(netTaxableSum)}\n` +
      `VAT (5%): AED ${formatCurrency(totalVat)}\n` +
      `*Grand Total: AED ${formatCurrency(grandTotal)}*\n` +
      `Amount in words: ${numberToWords(grandTotal)}\n\n` +
      `View official catalog: ${companySettings.website || 'www.emmafitness.ae'}`;

    const phone = (companySettings.phone || '971563296585').replace(/[^0-9]/g, '');
    window.open(`https://wa.me/${phone}?text=${encodeURIComponent(summary)}`, '_blank');
  };

  if (cartItemsList.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center space-y-4">
        <div className="w-20 h-20 rounded-2xl bg-[#0F1420] border border-[#26334D] flex items-center justify-center mx-auto text-slate-500">
          <Receipt className="w-10 h-10" />
        </div>
        <h2 className="font-oswald text-2xl font-black text-white">
          No Invoice / Quote Generated Yet
        </h2>
        <p className="text-slate-400 text-sm max-w-md mx-auto">
          Please browse our commercial gym machinery catalog, add items to cart, and click "Generate Quote" to view your commercial invoice bill.
        </p>
        <button
          onClick={() => setCurrentPage('products')}
          className="px-6 py-3 rounded-lg bg-[#FED430] text-black font-black text-xs uppercase tracking-wider hover:bg-[#e5be2b] shadow-lg shadow-[#FED430]/20 inline-flex items-center gap-2"
        >
          <Dumbbell className="w-4 h-4" />
          <span>Browse Warehouse Equipment</span>
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-2 sm:px-4 lg:px-6 py-6 space-y-6">
      {/* 1. Top Action Bar (Hidden in Print) */}
      <div className="print:hidden p-4 rounded-xl bg-[#0F1420] border border-[#26334D] flex flex-wrap items-center justify-between gap-3 shadow-xl">
        <div className="flex items-center gap-2">
          <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/40">
            OFFICIAL QUOTATION GENERATED
          </span>
          <span className="text-sm font-bold text-white hidden sm:inline">
            #QT-2026-{quotationNumber || '102'} {customerName ? `• ${customerName}` : ''}
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setCurrentPage('products')}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-[#141A26] border border-[#26334D] text-xs font-bold text-slate-300 hover:text-white hover:bg-[#1E2839]"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Catalog</span>
          </button>

          <button
            onClick={() => {
              if (confirm('Clear active quote and start a fresh quote?')) {
                clearCart();
                setCurrentPage('products');
              }
            }}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-[#FED430]/60 text-xs font-bold text-[#FED430] hover:bg-[#FED430]/10"
          >
            <RefreshCw className="w-4 h-4" />
            <span>New Quote</span>
          </button>

          <button
            onClick={handlePrint}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-[#FED430] text-black text-xs font-black uppercase hover:bg-[#e5be2b] shadow-md shadow-[#FED430]/20"
          >
            <Printer className="w-4 h-4" />
            <span>Print PDF</span>
          </button>

          <button
            onClick={handleDownloadPdf}
            disabled={isExporting}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-md shadow-blue-600/20"
          >
            <Download className="w-4 h-4" />
            <span>{isExporting ? 'Generating...' : 'Download PDF'}</span>
          </button>

          <button
            onClick={handleShareWhatsApp}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-[#25D366] hover:bg-[#20bd5a] text-white text-xs font-bold shadow-md shadow-[#25D366]/20"
          >
            <Share2 className="w-4 h-4" />
            <span>Share (WhatsApp)</span>
          </button>
        </div>
      </div>

      {/* 2. Client Quick Editor Banner (Hidden in Print) */}
      <div className="print:hidden p-4 rounded-xl bg-[#0F1420] border border-[#1E2839] space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-[#FED430]">
            Customize Quotation Details & Additional Charges
          </span>
          <span className="text-[11px] text-slate-400">
            Real-time update on document below
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
          <div>
            <label className="text-slate-400 block mb-1 font-semibold">Customer / Gym Name</label>
            <input
              type="text"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              placeholder="e.g. Metroflex Fitness UAE"
              className="w-full bg-[#141A26] border border-[#26334D] rounded px-3 py-1.5 text-white focus:outline-none focus:border-[#FED430]"
            />
          </div>

          <div>
            <label className="text-slate-400 block mb-1 font-semibold">Contact Phone / Mobile</label>
            <input
              type="text"
              value={contactNumber}
              onChange={(e) => setContactNumber(e.target.value)}
              placeholder="e.g. +971 50 123 4567"
              className="w-full bg-[#141A26] border border-[#26334D] rounded px-3 py-1.5 text-white focus:outline-none focus:border-[#FED430]"
            />
          </div>

          <div>
            <label className="text-slate-400 block mb-1 font-semibold">Quote Number</label>
            <input
              type="text"
              value={quotationNumber}
              onChange={(e) => setQuotationNumber(e.target.value)}
              placeholder="102"
              className="w-full bg-[#141A26] border border-[#26334D] rounded px-3 py-1.5 text-white focus:outline-none focus:border-[#FED430]"
            />
          </div>

          <div>
            <label className="text-slate-400 block mb-1 font-semibold">Billing Address / City</label>
            <input
              type="text"
              value={customerDetails}
              onChange={(e) => setCustomerDetails(e.target.value)}
              placeholder="Dubai, UAE"
              className="w-full bg-[#141A26] border border-[#26334D] rounded px-3 py-1.5 text-white focus:outline-none focus:border-[#FED430]"
            />
          </div>
        </div>

        {/* Additional Charges Section */}
        <div className="pt-2 border-t border-[#1E2839] flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-300">
              Additional Charges ({additionalCharges.length}):
            </span>
            <button
              onClick={() => addAdditionalCharge()}
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded bg-[#FED430]/15 border border-[#FED430]/40 text-[#FED430] hover:bg-[#FED430]/25 text-xs font-bold transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>+ Add Additional Charge</span>
            </button>
          </div>

          {additionalCharges.length > 0 && (
            <span className="text-xs text-slate-400">
              Total Additional: AED{' '}
              {formatCurrency(
                additionalCharges.reduce((s, c) => s + (parseFloat(c.amount) || 0), 0)
              )}
            </span>
          )}
        </div>

        {/* List of Additional Charge inputs */}
        {additionalCharges.length > 0 && (
          <div className="space-y-2 pt-2">
            {additionalCharges.map((charge) => (
              <div
                key={charge.id}
                className="flex items-center gap-2 bg-[#141A26] p-2 rounded-lg border border-[#26334D]"
              >
                <input
                  type="text"
                  value={charge.description}
                  onChange={(e) => updateAdditionalCharge(charge.id, 'description', e.target.value)}
                  placeholder="Charge Description (e.g. Delivery & Assembly, Rubber Flooring)"
                  className="flex-1 bg-[#0F1420] border border-[#26334D] rounded px-3 py-1.5 text-xs text-white focus:outline-none focus:border-[#FED430]"
                />
                <div className="flex items-center gap-1">
                  <span className="text-xs font-bold text-[#FED430]">AED</span>
                  <input
                    type="number"
                    value={charge.amount}
                    onChange={(e) => updateAdditionalCharge(charge.id, 'amount', e.target.value)}
                    placeholder="500"
                    className="w-24 bg-[#0F1420] border border-[#26334D] rounded px-2 py-1.5 text-xs text-white focus:outline-none focus:border-[#FED430]"
                  />
                </div>
                <button
                  onClick={() => removeAdditionalCharge(charge.id)}
                  className="p-1.5 rounded text-slate-400 hover:text-red-400 hover:bg-white/5"
                  title="Remove charge"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 3. Fully Responsive Printable Commercial Invoice Document */}
      <div className="w-full max-w-full pb-6">
        <div
          id="printable-commercial-invoice"
          className="w-full max-w-[900px] mx-auto bg-white text-slate-900 rounded-xl p-3.5 sm:p-8 border border-slate-300 shadow-2xl print:shadow-none print:border-none print:m-0 print:p-0 print:max-w-none"
        >
          {/* Top Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start gap-3 sm:gap-4 pb-3 sm:pb-4 border-b border-slate-200 sm:border-b-0">
            {/* Left Brand */}
            <div className="flex items-center gap-2.5 sm:gap-3">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded bg-[#E63946] flex items-center justify-center text-white font-oswald text-xl sm:text-2xl font-black flex-shrink-0 shadow-sm">
                EF
              </div>
              <div>
                <h1 className="font-oswald text-xl sm:text-2xl font-black text-[#08203E] tracking-wider leading-none">
                  {companySettings.brandHeader || 'EMMA FITNESS'}
                </h1>
                <p className="text-[9px] sm:text-[10px] font-bold text-slate-600 tracking-wider uppercase mt-1">
                  {companySettings.legalName ||
                    'SPORTS FIELDS & HALLS EQUIPMENT TRADING CO. L.L.C'}
                </p>
              </div>
            </div>

            {/* Right TRN & Contacts */}
            <div className="w-full sm:w-auto text-left sm:text-right space-y-0.5 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100">
              <div className="inline-block px-2.5 py-0.5 rounded bg-[#E63946] text-white text-[10px] sm:text-[11px] font-mono font-bold tracking-wider mb-1">
                TRN: {companySettings.trn || '100569744400003'}
              </div>
              <p className="text-[10px] sm:text-[10.5px] font-semibold text-slate-700">
                Phone: {companySettings.phone || '0563296585'}
              </p>
              <p className="text-[10px] sm:text-[10.5px] text-slate-700">
                Website: {companySettings.website || 'www.emmafitness.ae'}
              </p>
              <p className="text-[10px] sm:text-[10.5px] text-slate-700">
                Email: {companySettings.email || 'emmafitdxb@gmail.com'}
              </p>
              <p className="text-[9.5px] sm:text-[10px] text-slate-500">
                Location: {companySettings.address || 'Al Muteena, Deira, Dubai, UAE'}
              </p>
            </div>
          </div>

          {/* Title Bar */}
          <div className="w-full bg-[#0D3B66] text-white text-center py-1.5 sm:py-2 font-oswald text-xs sm:text-sm font-black tracking-widest uppercase my-2 rounded-md sm:rounded-none">
            QUOTATION / COMMERCIAL TAX INVOICE
          </div>

          {/* Desktop/Print Customer Details Table */}
          <table className="hidden sm:table print:table w-full border-collapse border border-[#0D3B66] text-[11px] my-3">
            <tbody>
              <tr className="border-b border-[#0D3B66]">
                <td className="w-32 bg-slate-100 p-2 font-bold text-slate-800 border-r border-[#0D3B66]">
                  Customer Name
                </td>
                <td className="p-2 border-r border-[#0D3B66] font-semibold">
                  {customerName.trim() || 'Valued Customer'}
                </td>
                <td className="w-32 bg-slate-100 p-2 font-bold text-slate-800 border-r border-[#0D3B66]">
                  Quotation Number
                </td>
                <td className="p-2 font-mono font-bold">
                  {quotationNumber.trim() || '102'}
                </td>
              </tr>
              <tr className="border-b border-[#0D3B66]">
                <td className="bg-slate-100 p-2 font-bold text-slate-800 border-r border-[#0D3B66]">
                  TRN Number
                </td>
                <td className="p-2 border-r border-[#0D3B66] font-mono">
                  {companySettings.trn || '100569744400003'}
                </td>
                <td className="bg-slate-100 p-2 font-bold text-slate-800 border-r border-[#0D3B66]">
                  Contact Number
                </td>
                <td className="p-2 font-mono">
                  {contactNumber.trim() || '0563296585'}
                </td>
              </tr>
              <tr className="border-b border-[#0D3B66]">
                <td className="bg-slate-100 p-2 font-bold text-slate-800 border-r border-[#0D3B66]">
                  Billing Address
                </td>
                <td className="p-2 border-r border-[#0D3B66]">
                  {customerDetails.trim() || 'Dubai / UAE'}
                </td>
                <td className="bg-slate-100 p-2 font-bold text-slate-800 border-r border-[#0D3B66]">
                  Quotation Date
                </td>
                <td className="p-2 font-semibold">
                  {quoteDate}
                </td>
              </tr>
              <tr>
                <td className="bg-slate-100 p-2 font-bold text-slate-800 border-r border-[#0D3B66]">
                  Customer Details
                </td>
                <td className="p-2 border-r border-[#0D3B66]">
                  {customerDetails.trim() || 'United Arab Emirates'}
                </td>
                <td className="bg-slate-100 p-2 font-bold text-slate-800 border-r border-[#0D3B66]">
                  Payment Terms
                </td>
                <td className="p-2 font-semibold text-emerald-800">
                  50% Advance Booking, 50% Before Delivery
                </td>
              </tr>
            </tbody>
          </table>

          {/* Mobile Customer Details (Stacked Responsive Card) */}
          <div className="sm:hidden print:hidden border border-[#0D3B66] rounded-lg text-xs my-2.5 bg-slate-50 overflow-hidden divide-y divide-[#0D3B66]/20">
            <div className="flex justify-between p-2">
              <span className="font-bold text-slate-600 text-[11px]">Customer:</span>
              <span className="font-bold text-slate-900 text-right">{customerName.trim() || 'Valued Customer'}</span>
            </div>
            <div className="flex justify-between p-2">
              <span className="font-bold text-slate-600 text-[11px]">Quotation #:</span>
              <span className="font-mono font-bold text-[#0D3B66]">{quotationNumber.trim() || '102'}</span>
            </div>
            <div className="flex justify-between p-2">
              <span className="font-bold text-slate-600 text-[11px]">Date:</span>
              <span className="font-semibold text-slate-800">{quoteDate}</span>
            </div>
            <div className="flex justify-between p-2">
              <span className="font-bold text-slate-600 text-[11px]">Contact:</span>
              <span className="font-mono text-slate-800">{contactNumber.trim() || '0563296585'}</span>
            </div>
            <div className="flex justify-between p-2">
              <span className="font-bold text-slate-600 text-[11px]">Billing:</span>
              <span className="text-slate-800 text-right">{customerDetails.trim() || 'Dubai, UAE'}</span>
            </div>
            <div className="flex justify-between p-2 bg-emerald-50/70">
              <span className="font-bold text-emerald-800 text-[11px]">Payment Terms:</span>
              <span className="font-semibold text-emerald-950 text-right text-[11px]">50% Advance, 50% Before Delivery</span>
            </div>
          </div>

          {/* Desktop/Print Products & Line Items Table */}
          <table className="hidden sm:table print:table w-full border-collapse border border-slate-900 text-xs my-2">
            <thead>
              <tr className="bg-[#0D3B66] text-white text-[11px] font-bold">
                <th className="border border-slate-900 p-2 text-center w-10">SL NO</th>
                <th className="border border-slate-900 p-2 text-left">PRODUCT / MODEL & CODE</th>
                <th className="border border-slate-900 p-2 text-center w-16">IMAGE</th>
                <th className="border border-slate-900 p-2 text-right w-24">UNIT PRICE (AED)</th>
                <th className="border border-slate-900 p-2 text-right w-24">DISCOUNT PRICE</th>
                <th className="border border-slate-900 p-2 text-center w-12">QTY</th>
                <th className="border border-slate-900 p-2 text-right w-28">TOTAL (AED)</th>
              </tr>
            </thead>
            <tbody>
              {cartItemsList.map((item, idx) => (
                <tr key={item.product.code} className="border-b border-slate-300">
                  <td className="border border-slate-900 p-2 text-center font-bold">
                    {idx + 1}
                  </td>
                  <td className="border border-slate-900 p-2">
                    <div className="font-bold text-slate-900 text-xs">
                      {item.product.name}
                    </div>
                    <div className="text-[10px] font-mono font-bold text-slate-500">
                      Code: {item.product.code} • {item.product.category}
                    </div>
                  </td>
                  <td className="border border-slate-900 p-1 text-center">
                    <div className="w-12 h-12 mx-auto border border-slate-200 rounded p-0.5 flex items-center justify-center bg-white">
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
                  <td className="border border-slate-900 p-2 text-right font-mono">
                    {formatCurrency(item.product.price)}
                  </td>
                  <td className="border border-slate-900 p-2 text-right font-mono">
                    {formatCurrency(item.product.price)}
                  </td>
                  <td className="border border-slate-900 p-2 text-center font-bold">
                    {item.quantity}
                  </td>
                  <td className="border border-slate-900 p-2 text-right font-mono font-bold">
                    {formatCurrency(item.product.price * item.quantity)}
                  </td>
                </tr>
              ))}

              {/* Additional Charges as Line Items */}
              {additionalCharges.map((ch, idx) => (
                <tr key={ch.id} className="border-b border-slate-300 bg-amber-50/40">
                  <td className="border border-slate-900 p-2 text-center font-bold text-amber-800">
                    {cartItemsList.length + idx + 1}
                  </td>
                  <td colSpan={2} className="border border-slate-900 p-2 font-bold text-slate-800">
                    <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-amber-200 text-amber-900 mr-2">
                      SERVICE / SURCHARGE
                    </span>
                    {ch.description || 'Logistics & Assembly Charge'}
                  </td>
                  <td className="border border-slate-900 p-2 text-right font-mono">
                    {formatCurrency(ch.amount)}
                  </td>
                  <td className="border border-slate-900 p-2 text-right font-mono">
                    {formatCurrency(ch.amount)}
                  </td>
                  <td className="border border-slate-900 p-2 text-center font-bold">1</td>
                  <td className="border border-slate-900 p-2 text-right font-mono font-bold text-amber-900">
                    {formatCurrency(ch.amount)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Mobile Equipment Items (Responsive Touch Cards) */}
          <div className="sm:hidden print:hidden border border-slate-900 rounded-lg overflow-hidden my-2.5 divide-y divide-slate-200">
            <div className="bg-[#0D3B66] text-white text-[11px] font-bold px-3 py-2 uppercase flex justify-between items-center">
              <span>Equipment Units ({cartItemsList.length})</span>
              <span>Total Amount</span>
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
                    <span className="font-mono text-[10px] text-slate-500 block">Code: {item.product.code} • {item.product.category}</span>
                  </div>
                </div>
                <div className="flex justify-between items-center text-xs bg-slate-50 p-2 rounded border border-slate-100">
                  <span className="text-slate-600 font-mono text-[11px]">
                    Qty: <strong className="text-slate-900 font-bold">{item.quantity}</strong> × AED {formatCurrency(item.product.price)}
                  </span>
                  <span className="font-mono font-black text-slate-900 text-xs">
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
                  <span className="text-[9.5px] font-mono font-bold uppercase px-1.5 py-0.2 rounded bg-amber-200 text-amber-900">SERVICE</span>
                  <span className="font-bold text-slate-900 text-xs truncate">{ch.description || 'Logistics Charge'}</span>
                </div>
                <div className="flex justify-between items-center text-xs pt-0.5">
                  <span className="text-slate-500 font-mono text-[11px]">Qty: 1</span>
                  <span className="font-mono font-bold text-amber-950 text-xs">AED {formatCurrency(ch.amount)}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Totals Section */}
          <div className="border border-slate-900 border-t-0 sm:border-t text-xs rounded-b-lg overflow-hidden">
            {/* Sub Total */}
            <div className="flex justify-between items-center px-3 sm:px-4 py-2 border-b border-slate-900">
              <span className="font-bold text-slate-700">Sub Total</span>
              <span className="font-mono font-bold text-xs sm:text-sm">
                AED {formatCurrency(netTaxableSum)}
              </span>
            </div>

            {/* VAT 5% */}
            <div className="flex justify-between items-center px-3 sm:px-4 py-2 border-b border-slate-900 bg-slate-50">
              <span className="font-semibold text-slate-700">UAE VAT (5%)</span>
              <span className="font-mono font-bold text-xs sm:text-sm">
                AED {formatCurrency(totalVat)}
              </span>
            </div>

            {/* Amount in Words */}
            <div className="px-3 sm:px-4 py-2 border-b border-slate-900 bg-slate-50 text-[10.5px] sm:text-[11px] font-serif italic text-slate-800">
              Amount in Words:{' '}
              <strong className="not-italic font-sans text-slate-900 font-bold block sm:inline mt-0.5 sm:mt-0">
                {numberToWords(grandTotal)}
              </strong>
            </div>

            {/* Grand Total */}
            <div className="flex justify-between items-center px-3 sm:px-4 py-2.5 bg-slate-100 text-[#0D3B66]">
              <span className="font-oswald text-xs sm:text-sm font-black uppercase tracking-wider">
                Grand Total (AED)
              </span>
              <span className="font-mono font-black text-sm sm:text-base text-[#0D3B66]">
                AED {formatCurrency(grandTotal)}
              </span>
            </div>
          </div>

          {/* BANK DETAILS Section */}
          <div className="mt-4">
            <div className="w-full bg-[#0D3B66] text-white px-3 py-1 font-bold text-[10.5px] sm:text-[11px] tracking-wider uppercase rounded-t-sm">
              BANK DETAILS FOR WIRE TRANSFER
            </div>
            <div className="p-2.5 sm:p-3 bg-slate-50 border border-slate-300 text-[10px] sm:text-[11px] font-mono space-y-1.5 break-words">
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
            <div className="w-full bg-[#0D3B66] text-white px-3 py-1 font-bold text-[10.5px] sm:text-[11px] tracking-wider uppercase rounded-t-sm">
              TERMS & CONDITIONS
            </div>
            <div className="p-2.5 sm:p-3 bg-slate-50 border border-slate-300 text-[10px] sm:text-[10.5px] text-slate-700 space-y-1 leading-relaxed">
              <p>• Customer shall approve the quotation along with the signed purchase order.</p>
              <p>• Quotation validity: 7 calendar days from the date of issuance.</p>
              <p>• Payment: 50% advance booking deposit, balance 50% at least 1 day prior to warehouse delivery.</p>
              <p>• Delivery & turnkey installation performed across Dubai, Abu Dhabi & Northern Emirates.</p>
              <p>• Includes 1-Year Comprehensive Structural Frame & AC Motor Warranty.</p>
            </div>
          </div>

          {/* Document Footer */}
          <div className="mt-5 sm:mt-6 pt-3 border-t border-slate-300 flex flex-col sm:flex-row justify-between items-center gap-1 text-[9.5px] sm:text-[10px] text-slate-500">
            <span>
              {companySettings.brandHeader || 'Emma Fitness'} • Phone: {companySettings.phone || '0563296585'} • {companySettings.website || 'www.emmafitness.ae'}
            </span>
            <span>Commercial Document • Page 1 of 1</span>
          </div>
        </div>
      </div>
    </div>
  );
}

