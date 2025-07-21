
import { BaseDocument } from '@/types/businessDocuments';
import { numberToWords } from './numberUtils';

export const generateAmountInWords = (document: BaseDocument, documentType: string, defaultCurrency: string) => {
  if (documentType !== 'invoice') return '';
  
  return `
    <div style="margin: 20px 0 30px 0; padding: 12px; background-color: #f8fafc; border: 1px solid #e2e8f0; border-left: 4px solid #3b82f6;">
      <div style="font-weight: bold; font-size: 12px; color: #2d3748; margin-bottom: 6px;">
        Amount in Words:
      </div>
      <div style="font-size: 11px; color: #4a5568; font-style: italic;">
        ${numberToWords(document.total)} ${defaultCurrency} Only
      </div>
    </div>
  `;
};

export const generateSignatureSection = (document: BaseDocument, documentType: string) => {
  if (['financial-report', 'payment-receipt', 'delivery-note'].includes(documentType)) return '';
  
  return `
    <div style="display: flex; justify-content: space-between; gap: 20px; margin: 30px 0 20px 0; position: relative;">
      <div style="flex: 1;">
        <div style="font-weight: bold; font-size: 12px; color: #2d3748; margin-bottom: 8px;">
          Terms & Conditions:
        </div>
        <div style="font-size: 10px; color: #4a5568; line-height: 1.4; white-space: pre-line;">
          ${document.terms || ''}
        </div>
      </div>
      <div style="flex: 1; position: relative;">
        <div style="font-weight: bold; margin-bottom: 8px; font-size: 12px; color: #2d3748;">
          Authorized By:
        </div>
        <div style="position: relative;">
          <div style="border-top: 1px solid #2d3748; padding-top: 4px; font-size: 12px; width: 180px; margin-top: 40px;">
            <div style="margin-bottom: 4px;">Sincerely,</div>
            <div style="font-weight: 600;">${document.company.name}</div>
          </div>
          <div style="position: absolute; top: 20px; left: 30px; transform: rotate(12deg); font-size: 20px; font-weight: bold; color: rgba(0,0,0,0.08); font-family: Arial, sans-serif; letter-spacing: 1px; white-space: nowrap; pointer-events: none; user-select: none;">
            APPROVED
          </div>
        </div>
      </div>
    </div>
  `;
};
