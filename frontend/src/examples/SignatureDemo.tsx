import React from 'react';
import { DocumentSignature } from '@/components/documents/DocumentSignature';
import { AuthorizedSignature, SignatureSettings } from '@/modules/system-settings/types/signatureTypes';

const SignatureDemo: React.FC = () => {
  // Example signature data matching your image
  const sampleSignature: AuthorizedSignature = {
    id: 'sig_001',
    name: 'John Smith',
    title: 'Sales Manager',
    department: 'Sales',
    signatureImageUrl: '', // Can be empty to show text signature
    signatureText: 'J. Smith', // This will be styled as handwritten
    isDefault: true,
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  const sampleSignatureSettings: SignatureSettings = {
    enabled: true,
    showOnDocuments: true,
    signaturePosition: 'bottom-right',
    showTitle: true,
    showName: true,
    showDate: true,
    customText: 'Authorized by:'
  };

  return (
    <div className="max-w-4xl mx-auto p-8">
      <h1 className="text-2xl font-bold mb-8">Signature Format Demo</h1>
      
      {/* Document-like container */}
      <div className="bg-white border border-gray-200 shadow-lg p-8 min-h-[600px]">
        {/* Sample document header */}
        <div className="flex justify-between items-start mb-8">
          <div>
            <div className="flex items-center mb-4">
              <div className="w-16 h-16 bg-yellow-400 rounded-full flex items-center justify-center mr-4">
                <span className="text-2xl">☀️</span>
              </div>
              <div>
                <h2 className="text-2xl font-bold text-blue-600">EnerTek</h2>
                <p className="text-sm text-gray-600">solar services</p>
              </div>
            </div>
            <div className="text-sm text-gray-600">
              <p>Jowin business arcade off eastern bypass - Utawala Nairobi, Nairobi,</p>
              <p>00100</p>
              <p>Tel: -</p>
              <p>Email: info@enerteksolarservices.com</p>
              <p>VAT Number: P052216152Z</p>
            </div>
          </div>
          <div className="text-right">
            <h3 className="text-2xl font-bold text-blue-600 mb-2">SALES ORDER</h3>
            <div className="text-sm space-y-1">
              <p><strong>SO Number:</strong> SO-2024-001</p>
              <p><strong>Order Date:</strong> 30/06/2025</p>
              <p><strong>Status:</strong> INVOICED</p>
              <p><strong>Currency:</strong> KES</p>
              <p><strong>Print Date:</strong> 01/07/2025</p>
            </div>
          </div>
        </div>

        {/* Customer Information */}
        <div className="mb-8">
          <h3 className="text-lg font-semibold mb-3 bg-gray-100 p-2">Customer Information</h3>
          <div>
            <p className="font-medium">Test Customer</p>
            <p className="text-sm text-gray-600">Email: test@example.com</p>
          </div>
        </div>

        {/* Sample table */}
        <div className="mb-8">
          <table className="w-full">
            <thead className="bg-gray-600 text-white">
              <tr>
                <th className="text-left p-3">LN</th>
                <th className="text-left p-3">PART DESCRIPTION</th>
                <th className="text-center p-3">QUANTITY</th>
                <th className="text-right p-3">UNIT PRICE</th>
                <th className="text-right p-3">TOTAL PRICE</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b">
                <td className="p-3">1</td>
                <td className="p-3">
                  <span className="bg-gray-100 px-2 py-1 rounded text-sm mr-2">TEST-001</span>
                  Test Product
                </td>
                <td className="text-center p-3">1.00 ea</td>
                <td className="text-right p-3">KSh 1,500.00</td>
                <td className="text-right p-3">KSh 1,500.00</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Payment Terms */}
        <div className="mb-8 text-sm">
          <h4 className="font-semibold text-red-600 mb-2">🏷️ Payment Terms</h4>
          <p className="mb-1">Standard Terms Apply</p>
          <ul className="text-gray-600 space-y-1">
            <li>• Goods belong to Enertek Solar until completion of payments</li>
            <li>• Payment due on delivery</li>
            <li>• 5yrs warranty on Tanks and Panels.</li>
          </ul>
        </div>

        {/* Payment Information */}
        <div className="grid grid-cols-2 gap-4 mb-8 text-sm">
          <div className="bg-blue-50 p-3 rounded">
            <h4 className="font-semibold text-blue-600 mb-2">🏦 Bank Transfer</h4>
            <p><strong>Bank:</strong> KCB bank Kenya</p>
            <p><strong>Account Name:</strong> Enertek Solar Services</p>
            <p><strong>Account No:</strong> 1302467751</p>
          </div>
          <div className="bg-green-50 p-3 rounded">
            <h4 className="font-semibold text-green-600 mb-2">📱 M-Pesa Payment</h4>
            <p><strong>Pay Bill:</strong> 522522</p>
            <p><strong>Account Reference:</strong> 6000946</p>
            <p><strong>Business Name:</strong> Enertek Solar Services</p>
          </div>
        </div>

        {/* Totals */}
        <div className="flex justify-end mb-8">
          <div className="w-1/3 space-y-2 text-sm">
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span>KSh 1,290.52</span>
            </div>
            <div className="flex justify-between">
              <span>VAT (16%)</span>
              <span>KSh 240.00</span>
            </div>
            <div className="flex justify-between bg-blue-600 text-white p-2 rounded font-semibold">
              <span>TOTAL (KES)</span>
              <span>KSh 1,500.00</span>
            </div>
          </div>
        </div>

        {/* The signature - exactly as shown in your image */}
        <DocumentSignature
          signature={sampleSignature}
          signatureSettings={sampleSignatureSettings}
          customDate="01/07/2025"
          className="mb-8"
        />

        {/* Footer */}
        <div className="text-center text-xs text-gray-500 border-t pt-4">
          <p>Generated on 7/1/2025, 6:18:47 PM</p>
          <p>This is a computer-generated document and does not require a signature unless specified.</p>
        </div>
      </div>
    </div>
  );
};

export default SignatureDemo;
