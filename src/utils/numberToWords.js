/**
 * Converts a numeric amount to UAE standard words format
 * e.g. 5500.50 -> "Five Thousand Five Hundred Dirhams and Fifty Fils Only"
 */

const UNITS = [
  '', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine',
  'Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen',
  'Seventeen', 'Eighteen', 'Nineteen'
];

const TENS = [
  '', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'
];

function convertChunk(n) {
  if (n === 0) return '';
  if (n < 20) return UNITS[n];
  if (n < 100) return `${TENS[Math.floor(n / 10)]} ${UNITS[n % 10]}`.trim();
  if (n < 1000) return `${UNITS[Math.floor(n / 100)]} Hundred ${convertChunk(n % 100)}`.trim();
  if (n < 100000) return `${convertChunk(Math.floor(n / 1000))} Thousand ${convertChunk(n % 1000)}`.trim();
  if (n < 10000000) return `${convertChunk(Math.floor(n / 100000))} Lakh ${convertChunk(n % 100000)}`.trim();
  return `${convertChunk(Math.floor(n / 10000000))} Crore ${convertChunk(n % 10000000)}`.trim();
}

export function numberToWords(amount) {
  if (!amount || isNaN(amount)) return 'Zero Only';
  
  const num = Math.abs(Number(amount));
  const intPart = Math.floor(num);
  const decPart = Math.round((num - intPart) * 100);

  if (intPart === 0 && decPart === 0) return 'Zero Only';

  const words = convertChunk(intPart).trim();
  if (decPart > 0) {
    const decWords = convertChunk(decPart).trim();
    return `${words ? words + ' ' : ''}Dirhams and ${decWords} Fils Only`;
  }
  return `${words} Dirhams Only`;
}

export function formatCurrency(amount) {
  const num = Number(amount) || 0;
  return num.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

