import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { numberToWords, formatCurrency } from './numberToWords';

export async function generateInvoicePdf({
  type = 'QUOTATION', // 'QUOTATION' | 'SALES INVOICE'
  documentNumber = '101',
  date = '28-Oct-2026',
  customerName = 'Valued Customer',
  contactNumber = '+971 56 329 6585',
  customerDetails = 'Dubai / UAE',
  paymentTerms = '50% Advance Booking, 50% Before Delivery',
  items = [],
  additionalCharges = [],
  subtotal = 0,
  vat = 0,
  grandTotal = 0,
  companySettings = {},
  bankAccounts = [],
  terms = null,
}) {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 14;

  // Header Colors
  const navyColor = [13, 59, 102];
  const redColor = [230, 57, 70];
  const darkGray = [30, 41, 59];
  const lightGray = [248, 250, 252];

  // 1. Company Brand Header Left
  doc.setFillColor(...redColor);
  doc.roundedRect(margin, 12, 12, 12, 2, 2, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.text('EF', margin + 3.2, 20);

  doc.setTextColor(8, 32, 62);
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text(companySettings.brandHeader || 'EMMA FITNESS', margin + 16, 18);

  doc.setTextColor(71, 85, 105);
  doc.setFontSize(7.5);
  doc.setFont('helvetica', 'bold');
  doc.text(
    (companySettings.legalName || 'SPORTS FIELDS & HALLS EQUIPMENT TRADING CO. L.L.C').toUpperCase(),
    margin + 16,
    23
  );

  // 2. TRN & Contact Details Right
  const rightX = pageWidth - margin;
  doc.setFillColor(...redColor);
  doc.roundedRect(rightX - 52, 11, 52, 6, 1, 1, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(8.5);
  doc.setFont('courier', 'bold');
  doc.text(`TRN: ${companySettings.trn || '100569744400003'}`, rightX - 50, 15.2);

  doc.setTextColor(51, 65, 85);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.text(`Phone: ${companySettings.phone || '0563296585'}`, rightX, 21, { align: 'right' });
  doc.text(`Website: ${companySettings.website || 'www.emmafitness.ae'}`, rightX, 24.5, { align: 'right' });
  doc.text(`Email: ${companySettings.email || 'sales@delitrade.ae'}`, rightX, 28, { align: 'right' });
  doc.text(`Location: ${companySettings.address || 'Al Muteena, Deira, Dubai, UAE'}`, rightX, 31.5, { align: 'right' });

  // 3. Document Title Bar
  const titleY = 35;
  doc.setFillColor(...navyColor);
  doc.rect(margin, titleY, pageWidth - margin * 2, 8, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  const titleText =
    type === 'SALES INVOICE'
      ? 'OFFICIAL COMMERCIAL TAX INVOICE'
      : 'OFFICIAL COMMERCIAL QUOTATION';
  doc.text(titleText, pageWidth / 2, titleY + 5.5, { align: 'center' });

  // 4. Customer Info Grid
  const clientInfoY = titleY + 10;
  autoTable(doc, {
    startY: clientInfoY,
    margin: { left: margin, right: margin },
    theme: 'plain',
    styles: {
      fontSize: 8,
      cellPadding: 2,
      lineColor: [13, 59, 102],
      lineWidth: 0.3,
    },
    tableLineColor: [13, 59, 102],
    tableLineWidth: 0.3,
    head: [],
    body: [
      [
        { content: 'Customer Name', styles: { fontStyle: 'bold', fillColor: [241, 245, 249], textColor: [15, 23, 42] } },
        { content: customerName || 'Valued Customer' },
        { content: type === 'SALES INVOICE' ? 'Invoice Number' : 'Quotation Number', styles: { fontStyle: 'bold', fillColor: [241, 245, 249], textColor: [15, 23, 42] } },
        { content: documentNumber, styles: { fontStyle: 'bold' } },
      ],
      [
        { content: 'Billing Address', styles: { fontStyle: 'bold', fillColor: [241, 245, 249], textColor: [15, 23, 42] } },
        { content: customerDetails || 'Dubai, United Arab Emirates' },
        { content: 'Contact Number', styles: { fontStyle: 'bold', fillColor: [241, 245, 249], textColor: [15, 23, 42] } },
        { content: contactNumber || '+971 56 329 6585' },
      ],
      [
        { content: 'Date of Issue', styles: { fontStyle: 'bold', fillColor: [241, 245, 249], textColor: [15, 23, 42] } },
        { content: date },
        { content: 'Payment Terms', styles: { fontStyle: 'bold', fillColor: [241, 245, 249], textColor: [15, 23, 42] } },
        { content: paymentTerms },
      ],
    ],
  });

  // 5. Products Line Items Table
  const tableData = items.map((item, index) => {
    const qty = item.quantity || 1;
    const price = Number(item.unitPrice || item.product?.price || 0);
    const lineTotal = price * qty;
    return [
      index + 1,
      `${item.product?.name || 'Commercial Equipment'}\nCode: ${item.product?.code || 'N/A'}\n${item.product?.category || ''}`,
      formatCurrency(price),
      qty,
      formatCurrency(lineTotal),
    ];
  });

  // Include Additional Charges
  additionalCharges.forEach((ch, idx) => {
    tableData.push([
      items.length + idx + 1,
      `[ADDITIONAL CHARGE] ${ch.description || 'Special Service / Logistics'}`,
      formatCurrency(ch.amount),
      1,
      formatCurrency(ch.amount),
    ]);
  });

  autoTable(doc, {
    startY: doc.lastAutoTable.finalY + 3,
    margin: { left: margin, right: margin },
    theme: 'grid',
    headStyles: {
      fillColor: navyColor,
      textColor: 255,
      fontSize: 8.5,
      fontStyle: 'bold',
      halign: 'left',
    },
    styles: {
      fontSize: 8,
      cellPadding: 2.5,
      lineColor: [203, 213, 225],
      lineWidth: 0.2,
      textColor: [15, 23, 42],
    },
    columnStyles: {
      0: { cellWidth: 12, halign: 'center' },
      1: { cellWidth: 'auto' },
      2: { cellWidth: 26, halign: 'right' },
      3: { cellWidth: 16, halign: 'center' },
      4: { cellWidth: 28, halign: 'right' },
    },
    head: [['SL', 'Product / Model & Specification', 'Unit Price (AED)', 'Qty', 'Total (AED)']],
    body: tableData,
  });

  // 6. Totals Box
  const totalsY = doc.lastAutoTable.finalY;
  autoTable(doc, {
    startY: totalsY,
    margin: { left: margin, right: margin },
    theme: 'grid',
    styles: {
      fontSize: 8.5,
      cellPadding: 2.2,
      lineColor: [203, 213, 225],
      lineWidth: 0.2,
    },
    body: [
      [
        { content: 'Amount in Words:', styles: { fontStyle: 'bold', textColor: [100, 116, 139] } },
        { content: numberToWords(grandTotal), styles: { fontStyle: 'italic', textColor: [15, 23, 42] } },
        { content: 'Sub Total', styles: { fontStyle: 'bold', halign: 'right' } },
        { content: `AED ${formatCurrency(subtotal)}`, styles: { fontStyle: 'bold', halign: 'right' } },
      ],
      [
        { content: '', colSpan: 2, styles: { fillColor: [255, 255, 255] } },
        { content: 'VAT 5%', styles: { halign: 'right' } },
        { content: `AED ${formatCurrency(vat)}`, styles: { halign: 'right' } },
      ],
      [
        { content: '', colSpan: 2, styles: { fillColor: [248, 250, 252] } },
        { content: 'Grand Total (AED)', styles: { fontStyle: 'bold', fillColor: [241, 245, 249], textColor: [13, 59, 102], halign: 'right' } },
        { content: `AED ${formatCurrency(grandTotal)}`, styles: { fontStyle: 'bold', fillColor: [241, 245, 249], textColor: [13, 59, 102], halign: 'right', fontSize: 10 } },
      ],
    ],
  });

  // 7. Bank Details Section
  let currentY = doc.lastAutoTable.finalY + 4;
  if (currentY + 30 > pageHeight - 20) {
    doc.addPage();
    currentY = 16;
  }

  doc.setFillColor(...navyColor);
  doc.rect(margin, currentY, pageWidth - margin * 2, 5.5, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  doc.text('OFFICIAL WIRE TRANSFER & BANK DETAILS', margin + 3, currentY + 3.8);

  currentY += 5.5;
  const bankLines =
    bankAccounts.length > 0
      ? bankAccounts.map(
          (b) => `• ${b.accountTitle} | ${b.bankName} | A/C: ${b.accountNumber} | IBAN: ${b.iban} (SWIFT: ${b.swift || 'N/A'})`
        )
      : [
          '• EMMA GYM AND EKAVEERA KALARI LLC SPC | ADCB BANK | A/C: 13613665820001 | IBAN: AE080030013613665820001',
          '• EMMA GYM | FAB BANK | A/C: 1001327234596001 | IBAN: AE660351001327234596001',
        ];

  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(203, 213, 225);
  doc.rect(margin, currentY, pageWidth - margin * 2, 4 + bankLines.length * 4.5, 'FD');

  doc.setTextColor(30, 41, 59);
  doc.setFont('courier', 'bold');
  doc.setFontSize(7.5);
  bankLines.forEach((line, i) => {
    doc.text(line, margin + 3, currentY + 4 + i * 4.5);
  });

  currentY += 6 + bankLines.length * 4.5;

  // 8. Terms & Conditions
  if (currentY + 28 > pageHeight - 16) {
    doc.addPage();
    currentY = 16;
  }

  doc.setFillColor(...navyColor);
  doc.rect(margin, currentY, pageWidth - margin * 2, 5.5, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.text('TERMS & COMMERCIAL CONDITIONS', margin + 3, currentY + 3.8);

  currentY += 5.5;
  const activeTerms = Array.isArray(terms) && terms.length > 0
    ? terms.map((t) => (t.startsWith('•') ? t : `• ${t}`))
    : [
        '• Customer shall approve this document along with signed purchase order.',
        '• Validity: 7 calendar days from issuance. Factory direct stock subject to prior sales.',
        '• Payment Terms: 50% advance booking deposit; balance 50% prior to dispatch.',
        '• Delivery & installation performed by Delitrade technicians across Dubai & UAE.',
        '• Includes standard 1-Year Structural Frame & AC Motor Commercial Warranty.',
      ];

  doc.setFillColor(248, 250, 252);
  doc.rect(margin, currentY, pageWidth - margin * 2, 4 + activeTerms.length * 3.8, 'FD');

  doc.setTextColor(71, 85, 105);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  activeTerms.forEach((term, i) => {
    doc.text(term, margin + 3, currentY + 3.5 + i * 3.8);
  });

  // Footer on all pages
  const totalPages = doc.internal.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setFontSize(7);
    doc.setTextColor(148, 163, 184);
    doc.text(
      `${companySettings.brandHeader || 'Emma Fitness'} • ${companySettings.phone || '0563296585'} • ${companySettings.website || 'www.emmafitness.ae'}`,
      margin,
      pageHeight - 6
    );
    doc.text(`Page ${i} of ${totalPages}`, pageWidth - margin, pageHeight - 6, { align: 'right' });
  }

  return doc;
}

