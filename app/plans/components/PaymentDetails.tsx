"use client";

import { useState } from "react";
import { Copy } from "lucide-react";
import { toast } from "sonner";

const PaymentDetails = () => {
  const [copied, setCopied] = useState<string>("");

  const paymentDetails = {
    bank: {
      name: "FIROJ MONDAL",
      bankName: "PUNJAB NATIONAL BANK",
      accountNo: "033001020395",
      ifscCode: "PUNB0033020",
      phone: "8972319894",
      googlePay: "8972319894",
    },
    crypto: {
      trx: {
        network: "TRON (TRC20)",
        address: "TTHPFAjnpPHZKujeAymbRkeBFPq1GB4SDU",
      },
      bnb: {
        network: "BNB smart chain (BEP20)",
        address: "0x1d2E14A94ac59749D3A6AF5465125ab168A3612a",
      },
    },
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopied(label);
    toast.success(`${label} copied to clipboard!`);
    setTimeout(() => setCopied(""), 2000);
  };

  const DetailRow = ({
    label,
    value,
    copyable = true,
  }: {
    label: string;
    value: string;
    copyable?: boolean;
  }) => (
    <div className="flex items-center justify-between py-2 border-b border-gray-200">
      <span className="font-medium text-gray-700">{label}:</span>
      <div className="flex items-center gap-2">
        <span className="text-gray-600">{value}</span>
        {copyable && (
          <button
            onClick={() => copyToClipboard(value, label)}
            className="p-1 hover:bg-gray-100 rounded-md transition-colors"
          >
            <Copy
              className={`h-4 w-4 ${
                copied === label ? "text-green-500" : "text-gray-500"
              }`}
            />
          </button>
        )}
      </div>
    </div>
  );

  return (
    <div className="w-full max-w-2xl mx-auto bg-white rounded-lg shadow-md p-6">
      <h2 className="text-2xl font-bold text-center mb-6">Payment Details</h2>

      {/* Bank Details Section */}
      <div className="mb-8">
        <h3 className="text-xl font-semibold mb-4">Bank Details</h3>
        <div className="space-y-2">
          <DetailRow label="Account Name" value={paymentDetails.bank.name} />
          <DetailRow label="Bank Name" value={paymentDetails.bank.bankName} />
          <DetailRow
            label="Account Number"
            value={paymentDetails.bank.accountNo}
          />
          <DetailRow label="IFSC Code" value={paymentDetails.bank.ifscCode} />
          <DetailRow label="Phone" value={paymentDetails.bank.phone} />
          <DetailRow label="Google Pay" value={paymentDetails.bank.googlePay} />
        </div>
      </div>

      {/* Crypto Details Section */}
      <div>
        <h3 className="text-xl font-semibold mb-4">Crypto Currency</h3>
        <div className="space-y-6">
          {/* TRX Details */}
          <div>
            <h4 className="font-medium mb-2">DEPOSIT NETWORK (TRX)</h4>
            <DetailRow
              label="Network"
              value={paymentDetails.crypto.trx.network}
              copyable={false}
            />
            <DetailRow
              label="Address"
              value={paymentDetails.crypto.trx.address}
            />
          </div>

          {/* BNB Details */}
          <div>
            <h4 className="font-medium mb-2">DEPOSIT NETWORK (BNB)</h4>
            <DetailRow
              label="Network"
              value={paymentDetails.crypto.bnb.network}
              copyable={false}
            />
            <DetailRow
              label="Address"
              value={paymentDetails.crypto.bnb.address}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentDetails;
