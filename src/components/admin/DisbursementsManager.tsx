import React, { useState } from 'react';
import { 
  DollarSign, 
  Send, 
  CheckCircle2, 
  Calendar, 
  CreditCard, 
  Building, 
  ArrowRight, 
  AlertCircle,
  TrendingUp,
  Clock,
  Check
} from 'lucide-react';
import { useLoanContext } from '../../context/LoanContext';
import { LoanApplication } from '../../types/loan';
import { formatCurrency, generateTxnReference } from '../../utils/loanCalculations';

export const DisbursementsManager: React.FC = () => {
  const { applications, disburseLoan } = useLoanContext();

  const [activeTab, setActiveTab] = useState<'pending' | 'active' | 'completed'>('pending');
  const [selectedForDisbursement, setSelectedForDisbursement] = useState<LoanApplication | null>(null);

  // Form State for Disbursement Modal
  const [paymentMethod, setPaymentMethod] = useState<'bank_transfer' | 'cheque' | 'direct_deposit'>('bank_transfer');
  const [txnRef, setTxnRef] = useState<string>(generateTxnReference());
  const [disbursedBy, setDisbursedBy] = useState<string>('Treasury & Disbursements Desk');

  const pendingDisbursement = applications.filter(a => a.status === 'approved');
  const activeLoans = applications.filter(a => a.status === 'disbursed');
  const completedLoans = applications.filter(a => a.status === 'completed');

  const handleOpenDisburseModal = (app: LoanApplication) => {
    setSelectedForDisbursement(app);
    setTxnRef(generateTxnReference() + '-DISB');
  };

  const handleConfirmDisbursement = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedForDisbursement) return;

    disburseLoan(selectedForDisbursement.id, {
      paymentMethod,
      transactionReference: txnRef,
      disbursedAmount: selectedForDisbursement.approval?.approvedAmount || selectedForDisbursement.loan.requestedAmount,
      disbursedBy,
    });

    setSelectedForDisbursement(null);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">
            Disbursements & Active Loan Portfolio
          </h2>
          <p className="text-xs text-slate-500">
            Release sanctioned loan capital, track active repayment schedules, and manage settled facilities
          </p>
        </div>

        {/* Tab selection */}
        <div className="flex items-center gap-1 bg-white p-1 rounded-xl border border-slate-200">
          <button
            onClick={() => setActiveTab('pending')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'pending'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <span>Awaiting Disbursement</span>
            <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${
              activeTab === 'pending' ? 'bg-blue-800 text-white' : 'bg-slate-100 text-slate-600'
            }`}>
              {pendingDisbursement.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('active')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'active'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <span>Active Loans</span>
            <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${
              activeTab === 'active' ? 'bg-blue-800 text-white' : 'bg-slate-100 text-slate-600'
            }`}>
              {activeLoans.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('completed')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'completed'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <span>Settled & Closed</span>
            <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${
              activeTab === 'completed' ? 'bg-blue-800 text-white' : 'bg-slate-100 text-slate-600'
            }`}>
              {completedLoans.length}
            </span>
          </button>
        </div>
      </div>

      {/* PENDING DISBURSEMENT TAB */}
      {activeTab === 'pending' && (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
          {pendingDisbursement.length === 0 ? (
            <div className="p-12 text-center space-y-3">
              <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto" />
              <p className="text-sm font-semibold text-slate-700">No approved loans waiting for disbursement.</p>
              <p className="text-xs text-slate-400">All sanctioned facilities have been disbursed or are currently in review.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200 uppercase text-[10px]">
                  <tr>
                    <th className="py-3 px-4">Ref Number</th>
                    <th className="py-3 px-4">Borrower</th>
                    <th className="py-3 px-4">Disbursement Bank</th>
                    <th className="py-3 px-4">Sanctioned Capital</th>
                    <th className="py-3 px-4">Rate & Tenure</th>
                    <th className="py-3 px-4">Approval Date</th>
                    <th className="py-3 px-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {pendingDisbursement.map((app) => (
                    <tr key={app.id} className="hover:bg-slate-50/80">
                      <td className="py-3.5 px-4 font-mono font-bold text-blue-700">{app.referenceNumber}</td>
                      <td className="py-3.5 px-4">
                        <span className="font-semibold text-slate-900 block">{app.personal.fullName}</span>
                        <span className="text-[10px] text-slate-400">NIC: {app.personal.nicNumber}</span>
                      </td>
                      <td className="py-3.5 px-4 text-slate-700">
                        <span className="font-medium block">{app.employment.bankName || 'Direct Account Wire'}</span>
                        <span className="text-[10px] font-mono text-slate-400">{app.employment.accountNumber || 'Acc. verified'}</span>
                      </td>
                      <td className="py-3.5 px-4 font-bold text-emerald-700 font-mono-numbers">
                        {formatCurrency(app.approval?.approvedAmount || app.loan.requestedAmount)}
                      </td>
                      <td className="py-3.5 px-4 text-slate-700">
                        <span className="font-medium">{app.approval?.approvedRate || 9.5}% p.a.</span>
                        <span className="text-[10px] text-slate-400 block">{app.approval?.approvedTenureMonths} Months</span>
                      </td>
                      <td className="py-3.5 px-4 text-slate-500 font-mono-numbers">
                        {app.approval?.approvalDate ? new Date(app.approval.approvalDate).toLocaleDateString() : 'Recent'}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <button
                          onClick={() => handleOpenDisburseModal(app)}
                          className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-xs transition-colors flex items-center gap-1.5 ml-auto cursor-pointer"
                        >
                          <Send className="w-3.5 h-3.5" />
                          <span>Release Funds</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* ACTIVE LOANS TAB */}
      {activeTab === 'active' && (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
          {activeLoans.length === 0 ? (
            <div className="p-12 text-center space-y-3">
              <Clock className="w-12 h-12 text-slate-300 mx-auto" />
              <p className="text-sm font-semibold text-slate-700">No active loans currently in repayment.</p>
              <p className="text-xs text-slate-400">Disburse an approved loan to monitor its repayment progress.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200 uppercase text-[10px]">
                  <tr>
                    <th className="py-3 px-4">Loan Ref</th>
                    <th className="py-3 px-4">Borrower</th>
                    <th className="py-3 px-4">Outstanding Balance</th>
                    <th className="py-3 px-4">Principal Repaid</th>
                    <th className="py-3 px-4">Progress</th>
                    <th className="py-3 px-4">Next Due Date</th>
                    <th className="py-3 px-4 text-right">Disbursement Details</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {activeLoans.map((app) => {
                    const originalPrincipal = app.approval?.approvedAmount || app.loan.requestedAmount;
                    const percentRepaid = originalPrincipal > 0 
                      ? Math.min(100, (app.totalPrincipalPaid / originalPrincipal) * 100) 
                      : 0;

                    return (
                      <tr key={app.id} className="hover:bg-slate-50/80">
                        <td className="py-3.5 px-4 font-mono font-bold text-blue-700">{app.referenceNumber}</td>
                        <td className="py-3.5 px-4">
                          <span className="font-semibold text-slate-900 block">{app.personal.fullName}</span>
                          <span className="text-[10px] text-slate-400">{app.contact.phone}</span>
                        </td>
                        <td className="py-3.5 px-4 font-bold text-slate-900 font-mono-numbers">
                          {formatCurrency(app.currentOutstandingBalance)}
                          <span className="text-[10px] text-slate-400 font-normal block">of {formatCurrency(originalPrincipal)}</span>
                        </td>
                        <td className="py-3.5 px-4 font-bold text-emerald-700 font-mono-numbers">
                          {formatCurrency(app.totalPrincipalPaid)}
                          <span className="text-[10px] text-amber-600 block">+{formatCurrency(app.totalInterestPaid)} interest</span>
                        </td>
                        <td className="py-3.5 px-4 w-40">
                          <div className="space-y-1">
                            <div className="flex justify-between text-[10px] text-slate-500 font-mono-numbers">
                              <span>{Math.round(percentRepaid)}%</span>
                            </div>
                            <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                              <div
                                style={{ width: `${percentRepaid}%` }}
                                className="bg-emerald-500 h-full rounded-full transition-all"
                              />
                            </div>
                          </div>
                        </td>
                        <td className="py-3.5 px-4">
                          <span className="px-2 py-0.5 rounded text-[11px] font-mono font-semibold bg-blue-50 text-blue-800 border border-blue-200">
                            {app.nextPaymentDueDate || 'Calculated'}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-right text-slate-500">
                          <span className="font-mono text-[11px] block">{app.disbursement?.transactionReference}</span>
                          <span className="text-[10px] capitalize text-slate-400">{app.disbursement?.paymentMethod.replace('_', ' ')}</span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* COMPLETED LOANS TAB */}
      {activeTab === 'completed' && (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
          {completedLoans.length === 0 ? (
            <div className="p-12 text-center space-y-3">
              <Check className="w-12 h-12 text-slate-300 mx-auto" />
              <p className="text-sm font-semibold text-slate-700">No completed loans yet.</p>
              <p className="text-xs text-slate-400">When an active loan's outstanding balance reaches zero, it automatically completes.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200 uppercase text-[10px]">
                  <tr>
                    <th className="py-3 px-4">Loan Ref</th>
                    <th className="py-3 px-4">Borrower</th>
                    <th className="py-3 px-4">Total Principal Settled</th>
                    <th className="py-3 px-4">Total Interest Paid</th>
                    <th className="py-3 px-4">Installments Made</th>
                    <th className="py-3 px-4 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-mono-numbers">
                  {completedLoans.map((app) => (
                    <tr key={app.id} className="hover:bg-slate-50/80">
                      <td className="py-3.5 px-4 font-mono font-bold text-blue-700">{app.referenceNumber}</td>
                      <td className="py-3.5 px-4 font-sans font-semibold text-slate-900">{app.personal.fullName}</td>
                      <td className="py-3.5 px-4 font-bold text-slate-900">{formatCurrency(app.totalPrincipalPaid)}</td>
                      <td className="py-3.5 px-4 text-amber-700">{formatCurrency(app.totalInterestPaid)}</td>
                      <td className="py-3.5 px-4 text-slate-600">{app.repayments.length} Payments</td>
                      <td className="py-3.5 px-4 text-right font-sans">
                        <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-teal-100 text-teal-800">
                          100% Repaid
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* DISBURSEMENT CONFIRMATION MODAL */}
      {selectedForDisbursement && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 space-y-6 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <h3 className="text-lg font-bold text-slate-900">Execute Loan Capital Disbursement</h3>
                <p className="text-xs text-slate-500">Facility Ref: <span className="font-mono font-bold text-blue-700">{selectedForDisbursement.referenceNumber}</span></p>
              </div>
              <button
                onClick={() => setSelectedForDisbursement(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-800 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleConfirmDisbursement} className="space-y-4 text-xs">
              <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 space-y-1">
                <span className="text-slate-600 block text-[11px]">Net Capital to Disburse</span>
                <p className="text-2xl font-extrabold text-emerald-800 font-mono-numbers">
                  {formatCurrency(selectedForDisbursement.approval?.approvedAmount || selectedForDisbursement.loan.requestedAmount)}
                </p>
                <p className="text-[11px] text-slate-600">
                  Beneficiary: <span className="font-bold text-slate-800">{selectedForDisbursement.personal.fullName}</span> ({selectedForDisbursement.employment.bankName})
                </p>
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-semibold text-slate-700">Payment Channel</label>
                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value as any)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs font-semibold focus:outline-blue-600"
                >
                  <option value="bank_transfer">Direct Electronic Bank Wire (ACH/RTGS)</option>
                  <option value="cheque">Banker's Certified Cheque</option>
                  <option value="direct_deposit">Real-Time Core Banking Deposit</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-semibold text-slate-700">Treasury Transaction Reference</label>
                <input
                  type="text"
                  required
                  value={txnRef}
                  onChange={(e) => setTxnRef(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white font-mono text-xs focus:outline-blue-600"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-semibold text-slate-700">Authorized Treasury Officer</label>
                <input
                  type="text"
                  required
                  value={disbursedBy}
                  onChange={(e) => setDisbursedBy(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs focus:outline-blue-600"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setSelectedForDisbursement(null)}
                  className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 font-semibold text-xs hover:bg-slate-200 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md shadow-emerald-600/30 cursor-pointer flex items-center gap-1.5"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Confirm & Disburse Capital</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
