import React from 'react';
import { 
  CheckCircle2, 
  Printer, 
  X, 
  Building2, 
  ShieldCheck, 
  Calendar, 
  CreditCard, 
  Download 
} from 'lucide-react';
import { RepaymentRecord, LoanApplication } from '../../types/loan';
import { formatCurrency } from '../../utils/loanCalculations';

interface ReceiptModalProps {
  isOpen: boolean;
  onClose: () => void;
  repayment: RepaymentRecord;
  application: LoanApplication;
}

export const ReceiptModal: React.FC<ReceiptModalProps> = ({
  isOpen,
  onClose,
  repayment,
  application,
}) => {
  if (!isOpen) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden">
        {/* Modal Actions (Hidden in print) */}
        <div className="no-print flex items-center justify-between p-4 bg-slate-50 border-b border-slate-200">
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-700">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Official Transaction Receipt</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600 text-white text-xs font-semibold hover:bg-blue-700 transition-colors cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print Receipt</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Printable Receipt Body */}
        <div className="p-8 space-y-6">
          {/* Header */}
          <div className="text-center space-y-1.5 pb-4 border-b border-dashed border-slate-200">
            <div className="inline-flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-[#1769E0] text-white flex items-center justify-center font-bold">
                <Building2 className="w-4 h-4" />
              </div>
              <span className="text-lg font-extrabold tracking-tight text-[#102A56]">
                Loan<span className="text-[#1769E0]">Flow</span> Lending Systems
              </span>
            </div>
            <p className="text-[11px] text-slate-400">Licensed Financial Service Provider · Centralized Loan Registry (Colombo)</p>
            <div className="pt-2">
              <span className="inline-block px-3 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-xs font-bold border border-emerald-200">
                PAYMENT CONFIRMED
              </span>
            </div>
          </div>

          {/* Amount Callout */}
          <div className="text-center bg-slate-50 rounded-2xl p-5 border border-slate-100">
            <span className="text-xs uppercase tracking-wider text-slate-500 font-semibold block">
              Amount Paid
            </span>
            <span className="text-3xl font-extrabold text-slate-900 font-mono-numbers">
              {formatCurrency(repayment.amount)}
            </span>
            <p className="text-[11px] text-slate-500 mt-1">
              Method: <span className="capitalize font-medium text-slate-700">{repayment.paymentMethod.replace('_', ' ')}</span>
            </p>
          </div>

          {/* Transaction Metadata Table */}
          <div className="space-y-2.5 text-xs">
            <div className="flex justify-between py-1 border-b border-slate-100">
              <span className="text-slate-500">Receipt Reference</span>
              <span className="font-bold text-slate-900 font-mono">{repayment.referenceNo}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-100">
              <span className="text-slate-500">Loan Application Ref</span>
              <span className="font-bold text-blue-700 font-mono">{application.referenceNumber}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-100">
              <span className="text-slate-500">Borrower Full Name</span>
              <span className="font-semibold text-slate-800">{application.personal.fullName}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-100">
              <span className="text-slate-500">Borrower NIC / ID</span>
              <span className="font-mono text-slate-800">{application.personal.nicNumber}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-100">
              <span className="text-slate-500">Payment Date</span>
              <span className="font-medium text-slate-800 font-mono-numbers">{repayment.paymentDate}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-100">
              <span className="text-slate-500">Transaction ID</span>
              <span className="font-mono text-slate-600">{repayment.transactionReference}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-100">
              <span className="text-slate-500">Principal Portion Reduced</span>
              <span className="font-semibold text-emerald-600 font-mono-numbers">+{formatCurrency(repayment.principalPortion)}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-100">
              <span className="text-slate-500">Interest Portion Paid</span>
              <span className="font-semibold text-amber-600 font-mono-numbers">{formatCurrency(repayment.interestPortion)}</span>
            </div>
            <div className="flex justify-between py-1 pt-2 font-bold text-slate-900">
              <span>Remaining Loan Balance</span>
              <span className="text-blue-700 font-mono-numbers">{formatCurrency(application.currentOutstandingBalance)}</span>
            </div>
          </div>

          {/* Footer note */}
          <div className="pt-2 text-center text-[10px] text-slate-400 space-y-1">
            <p>Authorized Digital Audit Trail: {repayment.recordedBy}</p>
            <p>This is a computer-generated voucher and does not require a physical signature.</p>
          </div>
        </div>
      </div>
    </div>
  );
};
