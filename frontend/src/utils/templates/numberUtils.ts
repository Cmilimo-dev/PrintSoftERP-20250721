
// Function to convert number to words
export const numberToWords = (num: number): string => {
  if (num === 0) return 'Zero';
  
  const ones = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine'];
  const teens = ['Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
  const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];
  const thousands = ['', 'Thousand', 'Million', 'Billion'];

  const convertHundreds = (n: number): string => {
    let result = '';
    if (n >= 100) {
      result += ones[Math.floor(n / 100)] + ' Hundred ';
      n %= 100;
    }
    if (n >= 20) {
      result += tens[Math.floor(n / 10)] + ' ';
      n %= 10;
    } else if (n >= 10) {
      result += teens[n - 10] + ' ';
      return result;
    }
    if (n > 0) {
      result += ones[n] + ' ';
    }
    return result;
  };

  const [wholePart, decimalPart] = num.toFixed(2).split('.');
  let wholeNum = parseInt(wholePart);
  let result = '';
  let thousandIndex = 0;

  while (wholeNum > 0) {
    const chunk = wholeNum % 1000;
    if (chunk !== 0) {
      result = convertHundreds(chunk) + thousands[thousandIndex] + ' ' + result;
    }
    wholeNum = Math.floor(wholeNum / 1000);
    thousandIndex++;
  }

  result = result.trim();
  if (decimalPart && parseInt(decimalPart) > 0) {
    result += ' and ' + parseInt(decimalPart) + '/100';
  }

  return result || 'Zero';
};

// Enhanced tax calculation for Kenya tax system
export const calculateTax = (subtotal: number, taxSettings: any) => {
  const taxRate = taxSettings.defaultRate || 16; // Default Kenya VAT rate is 16%
  let taxAmount = 0;
  
  switch (taxSettings.type) {
    case 'inclusive':
      // Tax is included in the price
      taxAmount = (subtotal * taxRate) / (100 + taxRate);
      break;
    case 'exclusive':
      // Tax is added to the price
      taxAmount = subtotal * (taxRate / 100);
      break;
    case 'overall':
      // Tax applied to total
      taxAmount = subtotal * (taxRate / 100);
      break;
    case 'per_item':
      // Tax calculated per item (handled in item calculation)
      taxAmount = subtotal * (taxRate / 100);
      break;
    default:
      taxAmount = subtotal * (taxRate / 100);
  }
  
  return taxAmount;
};

// Calculate withholding tax (common in Kenya)
export const calculateWithholdingTax = (amount: number, rate: number = 5) => {
  return amount * (rate / 100);
};

export const generateQRCode = (data: string) => {
  return `https://api.qrserver.com/v1/create-qr-code/?size=80x80&data=${encodeURIComponent(data)}`;
};
