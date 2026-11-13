import React, { useState } from 'react';
import { 
  FileText, 
  Download, 
  Printer, 
  Calendar, 
  TrendingUp, 
  DollarSign, 
  CheckCircle2, 
  Filter,
  Building2,
  PieChart
} from 'lucide-react';
import { useLoanContext } from '../../context/LoanContext';
import { formatCurrency } from '../../utils/loanCalculations';

export const ReportsManager: React.FC = () => {
  const { applications } = useLoanContext();

  const [reportType, setReportType] = useState<'applications' | 'disbursements' | 'repayments' | 'outstanding'>('applications');
  const [selectedProduct, setSelectedProduct] = useState<string>('all');

  // Filter applications by selected product
  const filteredApps = applications.filter(a => {
    if (selectedProduct !== 'all' && a.loan.loanType !== selectedProduct) return false;
    return true;
  });

  // Calculate Aggregates
  const totalRequested = filteredApps.reduce((s, a) => s + a.loan.requestedAmount, 0);
  const totalApprovedCapital = filteredApps.reduce((s, a) => s + (a.approval?.approvedAmount || 0), 0);
  const totalDisbursed = filteredApps.reduce((s, a) => s + (a.disbursement?.disbursedAmount || 0), 0);
  
  const allRepayments: any[] = [];
  filteredApps.forEach(a => {
    a.repayments.forEach(r => {
      allRepayments.push({ ...r, borrower: a.personal.fullName, loanRef: a.referenceNumber, facility: a.loan.loanType });
    });
  });

  const totalCollected = allRepayments.reduce((s, r) => s + r.amount, 0);
  const totalPrincipalCollected = allRepayments.reduce((s, r) => s + r.principalPortion, 0);
  const totalInterestCollected = allRepayments.reduce((s, r) => s + r.interestPortion, 0);
  const totalOutstanding = filteredApps
    .filter(a => a.status === 'disbursed')
    .reduce((s, a) => s + a.currentOutstandingBalance, 0);

  // Export to CSV function
  const handleExportCSV = () => {
    let csvContent = 'data:text/csv;charset=utf-8,';

    if (reportType === 'applications') {
      csvContent += 'Reference,Applicant,NIC,Phone,Facility,Requested Amount,Tenure Months,Status,Date\n';
      filteredApps.forEach(a => {
        csvContent += `"${a.referenceNumber}","${a.personal.fullName}","${a.personal.nicNumber}","${a.contact.phone}","${a.loan.loanType}",${a.loan.requestedAmount},${a.loan.tenureMonths},"${a.status}","${a.createdAt.split('T')[0]}"\n`;
      });
    } else if (reportType === 'disbursements') {
      csvContent += 'Reference,Borrower,Disbursed Amount,Rate %,Tenure,Payment Method,Txn Reference,Disbursement Date\n';
      filteredApps.filter(a => a.disbursement).forEach(a => {
        csvContent += `"${a.referenceNumber}","${a.personal.fullName}",${a.disbursement?.disbursedAmount},${a.approval?.approvedRate},${a.approval?.approvedTenureMonths},"${a.disbursement?.paymentMethod}","${a.disbursement?.transactionReference}","${a.disbursement?.disbursementDate.split('T')[0]}"\n`;
      });
    } else if (reportType === 'repayments') {
      csvContent += 'Receipt No,Loan Ref,Borrower,Payment Date,Total Amount,Principal Portion,Interest Portion,Method,Txn Ref\n';
      allRepayments.forEach(r => {
        csvContent += `"${r.referenceNo}","${r.loanRef}","${r.borrower}","${r.paymentDate}",${r.amount},${r.principalPortion},${r.interestPortion},"${r.paymentMethod}","${r.transactionReference}"\n`;
      });
    } else {
      csvContent += 'Loan Ref,Borrower,Facility,Sanctioned Capital,Principal Repaid,Interest Paid,Current Outstanding,Next Due Date\n';
      filteredApps.filter(a => a.status === 'disbursed').forEach(a => {
        csvContent += `"${a.referenceNumber}","${a.personal.fullName}","${a.loan.loanType}",${a.approval?.approvedAmount},${a.totalPrincipalPaid},${a.totalInterestPaid},${a.currentOutstandingBalance},"${a.nextPaymentDueDate || ''}"\n`;
      });
    }

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `LoanFlow_${reportType}_report_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Controls & Export Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">
            Financial & Regulatory Reports
          </h2>
          <p className="text-xs text-slate-500">
            Generate and export structured management reports for audit, credit analytics, and treasury reconciliation
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => window.print()}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer"
          >
            <Printer className="w-3.5 h-3.5 text-slate-500" />
            <span>Print Report</span>
          </button>
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-md shadow-blue-600/30 transition-all cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export to CSV</span>
          </button>
        </div>
      </div>

      {/* Filter and Report Selection Toolbar */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Report Category Pills */}
        <div className="flex items-center gap-1 overflow-x-auto pb-1 md:pb-0">
          {[
            { id: 'applications', label: '1. Application Pipeline' },
            { id: 'disbursements', label: '2. Capital Disbursements' },
            { id: 'repayments', label: '3. Repayment Collections' },
            { id: 'outstanding', label: '4. Outstanding Balances' },
          ].map(r => (
            <button
              key={r.id}
              onClick={() => setReportType(r.id as any)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                reportType === r.id
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
              }`}
            >
              {r.label}
            </button>
          ))}
        </div>

        {/* Product Filter */}
        <div className="flex items-center gap-2 text-xs">
          <span className="text-slate-500 font-medium">Facility:</span>
          <select
            value={selectedProduct}
            onChange={(e) => setSelectedProduct(e.target.value)}
            className="px-3 py-1.5 rounded-lg border border-slate-200 bg-slate-50 text-xs font-semibold text-slate-800 focus:outline-blue-600"
          >
            <option value="all">All Loan Products</option>
            <option value="personal">Personal Loan</option>
            <option value="business">Business Loan</option>
            <option value="education">Education Loan</option>
            <option value="vehicle">Vehicle Loan</option>
            <option value="microfinance">Microfinance</option>
          </select>
        </div>
      </div>

      {/* Executive Financial Metrics Banner */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-1">
          <span className="text-slate-400 block text-[11px] uppercase tracking-wider font-semibold">Total Requested</span>
          <p className="text-xl font-extrabold text-slate-900 font-mono-numbers">{formatCurrency(totalRequested)}</p>
          <span className="text-[10px] text-slate-400">{filteredApps.length} applications</span>
        </div>
        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-1">
          <span className="text-slate-400 block text-[11px] uppercase tracking-wider font-semibold">Total Disbursed</span>
          <p className="text-xl font-extrabold text-emerald-700 font-mono-numbers">{formatCurrency(totalDisbursed)}</p>
          <span className="text-[10px] text-slate-400">Sanctioned capital released</span>
        </div>
        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-1">
          <span className="text-slate-400 block text-[11px] uppercase tracking-wider font-semibold">Total Collected</span>
          <p className="text-xl font-extrabold text-indigo-700 font-mono-numbers">{formatCurrency(totalCollected)}</p>
          <span className="text-[10px] text-emerald-600 font-mono-numbers">{formatCurrency(totalPrincipalCollected)} principal</span>
        </div>
        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-1">
          <span className="text-slate-400 block text-[11px] uppercase tracking-wider font-semibold">Outstanding Portfolio</span>
          <p className="text-xl font-extrabold text-amber-700 font-mono-numbers">{formatCurrency(totalOutstanding)}</p>
          <span className="text-[10px] text-slate-400">Active portfolio risk</span>
        </div>
      </div>

      {/* Report Data Table */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        
        {/* REPORT 1: APPLICATIONS */}
        {reportType === 'applications' && (
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200 uppercase text-[10px]">
                <tr>
                  <th className="py-3 px-4">Ref Code</th>
                  <th className="py-3 px-4">Applicant Legal Name</th>
                  <th className="py-3 px-4">NIC Number</th>
                  <th className="py-3 px-4">Loan Facility</th>
                  <th className="py-3 px-4">Requested</th>
                  <th className="py-3 px-4">Tenure</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Filing Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-mono-numbers">
                {filteredApps.map(a => (
                  <tr key={a.id} className="hover:bg-slate-50/80">
                    <td className="py-3 px-4 font-bold text-blue-700">{a.referenceNumber}</td>
                    <td className="py-3 px-4 font-sans font-semibold text-slate-900">{a.personal.fullName}</td>
                    <td className="py-3 px-4 text-slate-600">{a.personal.nicNumber}</td>
                    <td className="py-3 px-4 font-sans capitalize text-slate-700">{a.loan.loanType}</td>
                    <td className="py-3 px-4 font-bold text-slate-900">{formatCurrency(a.loan.requestedAmount)}</td>
                    <td className="py-3 px-4 text-slate-600">{a.loan.tenureMonths} Mos</td>
                    <td className="py-3 px-4 font-sans">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-slate-100 text-slate-800">
                        {a.status.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right text-slate-500">{a.createdAt.split('T')[0]}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* REPORT 2: DISBURSEMENTS */}
        {reportType === 'disbursements' && (
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200 uppercase text-[10px]">
                <tr>
                  <th className="py-3 px-4">Loan Ref</th>
                  <th className="py-3 px-4">Beneficiary</th>
                  <th className="py-3 px-4">Disbursed Capital</th>
                  <th className="py-3 px-4">Rate & Tenure</th>
                  <th className="py-3 px-4">Channel</th>
                  <th className="py-3 px-4">Txn Reference</th>
                  <th className="py-3 px-4 text-right">Release Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-mono-numbers">
                {filteredApps.filter(a => a.disbursement).map(a => (
                  <tr key={a.id} className="hover:bg-slate-50/80">
                    <td className="py-3 px-4 font-bold text-blue-700">{a.referenceNumber}</td>
                    <td className="py-3 px-4 font-sans font-semibold text-slate-900">{a.personal.fullName}</td>
                    <td className="py-3 px-4 font-bold text-emerald-700">{formatCurrency(a.disbursement?.disbursedAmount || 0)}</td>
                    <td className="py-3 px-4 text-slate-700">{a.approval?.approvedRate}% / {a.approval?.approvedTenureMonths} Mos</td>
                    <td className="py-3 px-4 font-sans capitalize text-slate-600">{a.disbursement?.paymentMethod.replace('_', ' ')}</td>
                    <td className="py-3 px-4 text-slate-600 font-mono text-[11px]">{a.disbursement?.transactionReference}</td>
                    <td className="py-3 px-4 text-right text-slate-500">{a.disbursement?.disbursementDate.split('T')[0]}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* REPORT 3: REPAYMENTS */}
        {reportType === 'repayments' && (
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200 uppercase text-[10px]">
                <tr>
                  <th className="py-3 px-4">Receipt Ref</th>
                  <th className="py-3 px-4">Loan Ref</th>
                  <th className="py-3 px-4">Borrower</th>
                  <th className="py-3 px-4">Total Received</th>
                  <th className="py-3 px-4">Principal Credit</th>
                  <th className="py-3 px-4">Interest Revenue</th>
                  <th className="py-3 px-4">Channel</th>
                  <th className="py-3 px-4 text-right">Payment Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-mono-numbers">
                {allRepayments.map(r => (
                  <tr key={r.id} className="hover:bg-slate-50/80">
                    <td className="py-3 px-4 font-bold text-slate-900">{r.referenceNo}</td>
                    <td className="py-3 px-4 font-bold text-blue-700">{r.loanRef}</td>
                    <td className="py-3 px-4 font-sans font-semibold text-slate-800">{r.borrower}</td>
                    <td className="py-3 px-4 font-bold text-blue-700">{formatCurrency(r.amount)}</td>
                    <td className="py-3 px-4 text-emerald-600">+{formatCurrency(r.principalPortion)}</td>
                    <td className="py-3 px-4 text-amber-600">+{formatCurrency(r.interestPortion)}</td>
                    <td className="py-3 px-4 font-sans capitalize text-slate-600">{r.paymentMethod.replace('_', ' ')}</td>
                    <td className="py-3 px-4 text-right text-slate-500">{r.paymentDate}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* REPORT 4: OUTSTANDING PORTFOLIO */}
        {reportType === 'outstanding' && (
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200 uppercase text-[10px]">
                <tr>
                  <th className="py-3 px-4">Loan Ref</th>
                  <th className="py-3 px-4">Borrower</th>
                  <th className="py-3 px-4">Sanctioned Amount</th>
                  <th className="py-3 px-4">Total Repaid</th>
                  <th className="py-3 px-4">Current Outstanding</th>
                  <th className="py-3 px-4">Next Due Date</th>
                  <th className="py-3 px-4 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-mono-numbers">
                {filteredApps.filter(a => a.status === 'disbursed').map(a => (
                  <tr key={a.id} className="hover:bg-slate-50/80">
                    <td className="py-3 px-4 font-bold text-blue-700">{a.referenceNumber}</td>
                    <td className="py-3 px-4 font-sans font-semibold text-slate-900">{a.personal.fullName}</td>
                    <td className="py-3 px-4 text-slate-700">{formatCurrency(a.approval?.approvedAmount || 0)}</td>
                    <td className="py-3 px-4 text-emerald-600 font-bold">{formatCurrency(a.totalPrincipalPaid)}</td>
                    <td className="py-3 px-4 font-bold text-amber-700">{formatCurrency(a.currentOutstandingBalance)}</td>
                    <td className="py-3 px-4 text-slate-600">{a.nextPaymentDueDate || 'Calculated'}</td>
                    <td className="py-3 px-4 text-right font-sans">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-100 text-blue-800">
                        Amortizing
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

      </div>
    </div>
  );
};
