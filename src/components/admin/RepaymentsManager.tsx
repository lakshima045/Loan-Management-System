import React, { useState } from 'react';
import { 
  Plus, 
  Receipt, 
  DollarSign, 
  Calendar, 
  CreditCard, 
  Search, 
  Filter, 
  CheckCircle2, 
  ArrowRight,
  TrendingDown,
  Printer
} from 'lucide-react';
import { useLoanContext } from '../../context/LoanContext';
import { LoanApplication, RepaymentRecord } from '../../types/loan';
import { formatCurrency, generateTxnReference } from '../../utils/loanCalculations';
import { ReceiptModal } from '../common/ReceiptModal';

export const RepaymentsManager: React.FC = () => {
  const { applications, recordAdminRepayment } = useLoanContext();

  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isRecordModalOpen, setIsRecordModalOpen] = useState<boolean>(false);
  const [selectedReceipt, setSelectedReceipt] = useState<{ repayment: RepaymentRecord; application: LoanApplication } | null>(null);

  // Form State
  const [selectedLoanId, setSelectedLoanId] = useState<string>('');
  const [amount, setAmount] = useState<number>(0);
  const [paymentMethod, setPaymentMethod] = useState<'online' | 'bank_transfer' | 'cheque' | 'cash'>('bank_transfer');
  const [txnRef, setTxnRef] = useState<string>('');
  const [notes, setNotes] = useState<string>('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Active loans available for repayment
  const activeLoans = applications.filter(a => a.status === 'disbursed' && a.currentOutstandingBalance > 0);

  // Flatten all repayments from all applications
  const allRepayments: { repayment: RepaymentRecord; application: LoanApplication }[] = [];
  applications.forEach(app => {
    app.repayments.forEach(rep => {
      allRepayments.push({ repayment: rep, application: app });
    });
  });

  // Sort by latest payment first
  allRepayments.sort((a, b) => new Date(b.repayment.paymentDate).getTime() - new Date(a.repayment.paymentDate).getTime());

  const filteredRepayments = allRepayments.filter(({ repayment, application }) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase().trim();
    return (
      repayment.referenceNo.toLowerCase().includes(q) ||
      repayment.transactionReference.toLowerCase().includes(q) ||
      application.referenceNumber.toLowerCase().includes(q) ||
      application.personal.fullName.toLowerCase().includes(q)
    );
  });

  const handleOpenRecordModal = () => {
    if (activeLoans.length > 0) {
      setSelectedLoanId(activeLoans[0].id);
      setAmount(activeLoans[0].approval?.monthlyInstallment || 500);
      setTxnRef(generateTxnReference());
    }
    setErrorMsg(null);
    setIsRecordModalOpen(true);
  };

  const handleLoanSelectionChange = (loanId: string) => {
    setSelectedLoanId(loanId);
    const chosen = applications.find(a => a.id === loanId);
    if (chosen) {
      setAmount(chosen.approval?.monthlyInstallment || chosen.currentOutstandingBalance);
    }
  };

  const handleRecordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!selectedLoanId) {
      setErrorMsg('Please select an active loan account.');
      return;
    }
    if (amount <= 0) {
      setErrorMsg('Repayment amount must be greater than zero.');
      return;
    }

    const res = await recordAdminRepayment(selectedLoanId, {
      amount,
      paymentMethod,
      transactionReference: txnRef || generateTxnReference(),
      notes,
    });

    if (res.success && res.repayment) {
      const app = applications.find(a => a.id === selectedLoanId);
      if (app) {
        setSelectedReceipt({ repayment: res.repayment, application: app });
      }
      setIsRecordModalOpen(false);
    } else {
      setErrorMsg(res.error || 'Failed to record repayment.');
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">
            Repayment Operations & Collection Ledger
          </h2>
          <p className="text-xs text-slate-500">
            Log installment remittances, monitor interest/principal amortization, and issue receipts
          </p>
        </div>

        <button
          onClick={handleOpenRecordModal}
          disabled={activeLoans.length === 0}
          className={`flex items-center gap-1.5 px-4 py-2.5 rounded-xl font-bold text-xs shadow-md transition-all ${
            activeLoans.length > 0
              ? 'bg-blue-600 hover:bg-blue-500 text-white shadow-blue-600/30 cursor-pointer'
              : 'bg-slate-200 text-slate-400 cursor-not-allowed'
          }`}
        >
          <Plus className="w-4 h-4" />
          <span>Record Customer Repayment</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs flex items-center justify-between gap-4">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by Receipt No, Loan Ref, Borrower Name, Txn ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-200 bg-slate-50 text-xs focus:bg-white focus:outline-blue-600 font-medium"
          />
        </div>

        <span className="text-xs text-slate-500 whitespace-nowrap">
          Total Repayment Transactions: <strong className="font-mono-numbers text-slate-800">{allRepayments.length}</strong>
        </span>
      </div>

      {/* Repayments Table */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        {filteredRepayments.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <Receipt className="w-12 h-12 text-slate-300 mx-auto" />
            <p className="text-sm font-semibold text-slate-700">No repayment entries found.</p>
            <p className="text-xs text-slate-400">Click "Record Customer Repayment" to log a payment against an active loan.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200 uppercase text-[10px]">
                <tr>
                  <th className="py-3 px-4">Receipt Ref</th>
                  <th className="py-3 px-4">Loan Ref</th>
                  <th className="py-3 px-4">Borrower</th>
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4">Amount Paid</th>
                  <th className="py-3 px-4">Principal Paid</th>
                  <th className="py-3 px-4">Interest Paid</th>
                  <th className="py-3 px-4">Payment Method</th>
                  <th className="py-3 px-4 text-right">Receipt Voucher</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-mono-numbers">
                {filteredRepayments.map(({ repayment, application }) => (
                  <tr key={repayment.id} className="hover:bg-slate-50/80">
                    <td className="py-3.5 px-4 font-bold text-slate-900">{repayment.referenceNo}</td>
                    <td className="py-3.5 px-4 font-bold text-blue-700">{application.referenceNumber}</td>
                    <td className="py-3.5 px-4 font-sans font-semibold text-slate-800">
                      {application.personal.fullName}
                    </td>
                    <td className="py-3.5 px-4 text-slate-500">{repayment.paymentDate}</td>
                    <td className="py-3.5 px-4 font-bold text-blue-700">{formatCurrency(repayment.amount)}</td>
                    <td className="py-3.5 px-4 text-emerald-600">+{formatCurrency(repayment.principalPortion)}</td>
                    <td className="py-3.5 px-4 text-amber-600">{formatCurrency(repayment.interestPortion)}</td>
                    <td className="py-3.5 px-4 font-sans text-slate-600 capitalize">
                      {repayment.paymentMethod.replace('_', ' ')}
                    </td>
                    <td className="py-3.5 px-4 text-right font-sans">
                      <button
                        onClick={() => setSelectedReceipt({ repayment, application })}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-blue-50 text-blue-700 hover:bg-blue-100 font-semibold text-xs transition-colors cursor-pointer"
                      >
                        <Printer className="w-3.5 h-3.5" />
                        <span>Print Receipt</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* RECORD REPAYMENT MODAL */}
      {isRecordModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 space-y-6 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <h3 className="text-lg font-bold text-slate-900">Record Loan Repayment</h3>
                <p className="text-xs text-slate-500">Credit repayment against active loan portfolio balance</p>
              </div>
              <button
                onClick={() => setIsRecordModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-800 cursor-pointer"
              >
                ✕
              </button>
            </div>

            {errorMsg && (
              <div className="p-3 rounded-xl bg-rose-50 text-rose-800 border border-rose-200 text-xs">
                {errorMsg}
              </div>
            )}

            <form onSubmit={handleRecordSubmit} className="space-y-4 text-xs">
              <div className="space-y-1.5">
                <label className="text-[11px] font-semibold text-slate-700">Select Active Loan Account *</label>
                <select
                  value={selectedLoanId}
                  onChange={(e) => handleLoanSelectionChange(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-white text-xs font-semibold focus:outline-blue-600"
                >
                  {activeLoans.map((app) => (
                    <option key={app.id} value={app.id}>
                      {app.referenceNumber} - {app.personal.fullName} (Balance: {formatCurrency(app.currentOutstandingBalance)})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-[11px] font-semibold text-slate-700">Payment Amount (Rs.) *</label>
                  <input
                    type="number"
                    step={10}
                    min={1}
                    required
                    value={amount}
                    onChange={(e) => setAmount(Number(e.target.value) || 0)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white font-mono-numbers font-bold text-xs focus:outline-blue-600"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[11px] font-semibold text-slate-700">Payment Channel</label>
                  <select
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs font-medium focus:outline-blue-600"
                  >
                    <option value="bank_transfer">Direct Bank Wire (ACH/NEFT)</option>
                    <option value="online">Online Credit / Debit Card</option>
                    <option value="cheque">Banker's Cheque</option>
                    <option value="cash">Over-The-Counter Cash</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-semibold text-slate-700">Transaction Reference No</label>
                <input
                  type="text"
                  required
                  value={txnRef}
                  onChange={(e) => setTxnRef(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white font-mono text-xs focus:outline-blue-600"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-semibold text-slate-700">Remarks / Ledger Notes</label>
                <textarea
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="e.g. Regular monthly installment received on schedule..."
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs focus:outline-blue-600"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsRecordModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 font-semibold text-xs hover:bg-slate-200 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-md shadow-blue-600/30 cursor-pointer flex items-center gap-1.5"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Confirm Repayment</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* RECEIPT MODAL */}
      {selectedReceipt && (
        <ReceiptModal
          isOpen={!!selectedReceipt}
          onClose={() => setSelectedReceipt(null)}
          repayment={selectedReceipt.repayment}
          application={selectedReceipt.application}
        />
      )}
    </div>
  );
};
