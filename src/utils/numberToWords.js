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

function convertUnderThousand(n) {
  let s = '';
  if (n >= 100) {
    s += UNITS[Math.floor(n / 100)] + ' Hundred ';
    n %= 100;
  }
  if (n >= 20) {
    s += TENS[Math.floor(n / 10)] + (n % 10 !== 0 ? ' ' + UNITS[n % 10] : '') + ' ';
  } else if (n > 0) {
    s += UNITS[n] + ' ';
  }
  return s.trim();
}

function convertIntegerToWords(n) {
  if (n === 0) return 'Zero';
  let words = '';
  if (n >= 1000000000) {
    words += convertUnderThousand(Math.floor(n / 1000000000)) + ' Billion ';
    n %= 1000000000;
  }
  if (n >= 1000000) {
    words += convertUnderThousand(Math.floor(n / 1000000)) + ' Million ';
    n %= 1000000;
  }
  if (n >= 1000) {
    words += convertUnderThousand(Math.floor(n / 1000)) + ' Thousand ';
    n %= 1000;
  }
  if (n > 0) {
    words += convertUnderThousand(n) + ' ';
  }
  return words.trim();
}

export function numberToWords(amount) {
  if (!amount || isNaN(amount)) return 'Zero Dirhams Only';
  
  const num = Math.abs(Number(amount));
  const intPart = Math.floor(num);
  const decPart = Math.round((num - intPart) * 100);

  if (intPart === 0 && decPart === 0) return 'Zero Dirhams Only';

  const words = convertIntegerToWords(intPart).trim();
  if (decPart > 0) {
    const decWords = convertUnderThousand(decPart).trim();
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

