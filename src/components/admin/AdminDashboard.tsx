import React from 'react';
import { 
  Users, 
  Clock, 
  CheckCircle2, 
  TrendingUp, 
  DollarSign, 
  AlertTriangle, 
  ArrowUpRight, 
  FileText, 
  ChevronRight,
  ShieldCheck,
  Building2,
  PieChart
} from 'lucide-react';
import { useLoanContext } from '../../context/LoanContext';
import { formatCurrency, formatCurrencyCompact } from '../../utils/loanCalculations';
import { LOAN_PRODUCTS } from '../../data/loanProducts';

interface AdminDashboardProps {
  onNavigateTab: (tab: 'applications' | 'disbursements' | 'repayments' | 'reports') => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ onNavigateTab }) => {
  const { applications, checkDuplicateApplications } = useLoanContext();

  const totalApps = applications.length;
  const pendingApps = applications.filter(a => a.status === 'pending' || a.status === 'under_review').length;
  const approvedApps = applications.filter(a => a.status === 'approved').length;
  const activeLoans = applications.filter(a => a.status === 'disbursed').length;
  const completedLoans = applications.filter(a => a.status === 'completed').length;
  const rejectedApps = applications.filter(a => a.status === 'rejected').length;

  // Financial aggregates
  const totalDisbursedCapital = applications
    .filter(a => a.disbursement)
    .reduce((sum, a) => sum + (a.disbursement?.disbursedAmount || 0), 0);

  const totalRepaymentsCollected = applications.reduce((sum, a) => {
    const loanTotal = a.repayments.reduce((s, r) => s + r.amount, 0);
    return sum + loanTotal;
  }, 0);

  const totalOutstandingBalance = applications
    .filter(a => a.status === 'disbursed')
    .reduce((sum, a) => sum + a.currentOutstandingBalance, 0);

  // Duplicates count
  const duplicateCount = applications.filter(app => {
    const dups = checkDuplicateApplications(app.personal.nicNumber, app.contact.phone, app.id);
    return dups.length > 0;
  }).length;

  // Product distribution
  const productCounts = LOAN_PRODUCTS.map(prod => {
    const count = applications.filter(a => a.loan.loanType === prod.id).length;
    return {
      product: prod,
      count,
      percent: totalApps > 0 ? (count / totalApps) * 100 : 0,
    };
  });

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900 p-6 sm:p-8 rounded-3xl text-white shadow-lg border border-slate-800">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 text-xs font-semibold border border-blue-400/20">
            <ShieldCheck className="w-3.5 h-3.5 text-blue-400" />
            <span>Central Administrator Operations Console</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Portfolio Health & Underwriting Overview
          </h2>
          <p className="text-xs sm:text-sm text-slate-300">
            Real-time synchronization with customer web applications, automated DTI analysis, and treasury balance monitoring.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => onNavigateTab('applications')}
            className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-md shadow-blue-600/30 transition-all cursor-pointer flex items-center gap-1.5"
          >
            <span>Review Applications</span>
            <ArrowUpRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Applications */}
        <div 
          onClick={() => onNavigateTab('applications')}
          className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs hover:border-blue-300 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Applications</span>
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center group-hover:scale-105 transition-transform">
              <FileText className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="text-3xl font-extrabold text-slate-900 font-mono-numbers">{totalApps}</span>
            <span className="text-xs text-blue-600 font-semibold flex items-center">
              View all <ChevronRight className="w-3.5 h-3.5" />
            </span>
          </div>
          <div className="mt-2 text-[11px] text-slate-400">
            {pendingApps} pending underwriting review
          </div>
        </div>

        {/* Capital Disbursed */}
        <div 
          onClick={() => onNavigateTab('disbursements')}
          className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs hover:border-emerald-300 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Disbursed Capital</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center group-hover:scale-105 transition-transform">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="text-3xl font-extrabold text-emerald-700 font-mono-numbers">
              {formatCurrencyCompact(totalDisbursedCapital)}
            </span>
            <span className="text-xs text-emerald-600 font-semibold font-mono-numbers">
              {activeLoans + completedLoans} Loans
            </span>
          </div>
          <div className="mt-2 text-[11px] text-slate-400">
            Exact: {formatCurrency(totalDisbursedCapital)}
          </div>
        </div>

        {/* Repayments Collected */}
        <div 
          onClick={() => onNavigateTab('repayments')}
          className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs hover:border-indigo-300 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Repayments Collected</span>
            <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center group-hover:scale-105 transition-transform">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="text-3xl font-extrabold text-indigo-700 font-mono-numbers">
              {formatCurrencyCompact(totalRepaymentsCollected)}
            </span>
            <span className="text-xs text-indigo-600 font-semibold">Ledger live</span>
          </div>
          <div className="mt-2 text-[11px] text-slate-400">
            Exact: {formatCurrency(totalRepaymentsCollected)}
          </div>
        </div>

        {/* Outstanding Portfolio */}
        <div 
          onClick={() => onNavigateTab('disbursements')}
          className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs hover:border-amber-300 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Active Balance Due</span>
            <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center group-hover:scale-105 transition-transform">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="text-3xl font-extrabold text-slate-900 font-mono-numbers">
              {formatCurrencyCompact(totalOutstandingBalance)}
            </span>
            <span className="text-xs text-amber-700 font-semibold font-mono-numbers">{activeLoans} Active</span>
          </div>
          <div className="mt-2 text-[11px] text-slate-400">
            Across active amortizing facilities
          </div>
        </div>
      </div>

      {/* Priority Alerts Bar */}
      {(pendingApps > 0 || duplicateCount > 0) && (
        <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2.5 text-amber-900">
            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
            <div>
              <span className="font-bold">Administrative Alerts: </span>
              <span>{pendingApps} application(s) require review decision.</span>
              {duplicateCount > 0 && (
                <span className="ml-1 text-amber-800">
                  • {duplicateCount} candidate duplicate submission(s) identified.
                </span>
              )}
            </div>
          </div>

          <button
            onClick={() => onNavigateTab('applications')}
            className="px-3.5 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-700 text-white font-bold transition-colors cursor-pointer self-start sm:self-auto"
          >
            Open Queue
          </button>
        </div>
      )}

      {/* Analytics Breakdown & Recent Submissions Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Status Distribution */}
        <div className="lg:col-span-5 bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-5">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-slate-900 text-sm">Application Pipeline Breakdown</h3>
            <span className="text-xs text-slate-400 font-mono-numbers">{totalApps} Total</span>
          </div>

          <div className="space-y-3 text-xs">
            {[
              { label: 'Pending Review', count: applications.filter(a => a.status === 'pending').length, color: 'bg-slate-400' },
              { label: 'Under Review', count: applications.filter(a => a.status === 'under_review').length, color: 'bg-amber-500' },
              { label: 'Sanctioned / Approved', count: approvedApps, color: 'bg-emerald-500' },
              { label: 'Disbursed (Active)', count: activeLoans, color: 'bg-blue-600' },
              { label: 'Settled & Completed', count: completedLoans, color: 'bg-teal-600' },
              { label: 'Declined', count: rejectedApps, color: 'bg-rose-500' },
            ].map(item => {
              const pct = totalApps > 0 ? (item.count / totalApps) * 100 : 0;
              return (
                <div key={item.label} className="space-y-1">
                  <div className="flex justify-between font-medium">
                    <span className="text-slate-600">{item.label}</span>
                    <span className="text-slate-900 font-mono-numbers">{item.count} ({Math.round(pct)}%)</span>
                  </div>
                  <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      style={{ width: `${pct}%` }}
                      className={`h-full ${item.color} rounded-full transition-all`}
                    />
                  </div>
                </div>
              );
            })}
          </div>

          {/* Product Distribution */}
          <div className="pt-4 border-t border-slate-100 space-y-3">
            <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider text-slate-400">
              Distribution by Loan Product
            </h4>
            <div className="grid grid-cols-2 gap-2 text-xs">
              {productCounts.map(({ product, count, percent }) => (
                <div key={product.id} className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                  <span className="text-slate-500 block text-[11px] truncate">{product.name}</span>
                  <div className="flex justify-between items-baseline mt-1 font-mono-numbers">
                    <span className="font-bold text-slate-800">{count} apps</span>
                    <span className="text-[10px] text-slate-400">{Math.round(percent)}%</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Recent Applications Feed */}
        <div className="lg:col-span-7 bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-5">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-slate-900 text-sm">Recent Incoming Applications</h3>
            <button
              onClick={() => onNavigateTab('applications')}
              className="text-xs text-blue-600 font-semibold hover:underline flex items-center gap-0.5 cursor-pointer"
            >
              <span>View Table</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-2.5">
            {applications.slice(0, 5).map((app) => (
              <div
                key={app.id}
                onClick={() => onNavigateTab('applications')}
                className="p-3.5 rounded-2xl bg-slate-50 hover:bg-blue-50/50 border border-slate-200/80 transition-all flex items-center justify-between cursor-pointer group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-white border border-slate-200 flex items-center justify-center font-bold text-blue-700 font-mono text-xs shadow-2xs">
                    {app.referenceNumber.slice(-3)}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-slate-900 text-xs">{app.personal.fullName}</span>
                      <span className="font-mono text-[10px] text-slate-400">{app.referenceNumber}</span>
                    </div>
                    <span className="text-[11px] text-slate-500 capitalize">
                      {app.loan.loanType} Loan • Requested {formatCurrency(app.loan.requestedAmount)}
                    </span>
                  </div>
                </div>

                <div className="text-right">
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold capitalize ${
                    app.status === 'approved' ? 'bg-emerald-100 text-emerald-800' :
                    app.status === 'disbursed' ? 'bg-blue-100 text-blue-800' :
                    app.status === 'rejected' ? 'bg-rose-100 text-rose-800' :
                    'bg-amber-100 text-amber-800'
                  }`}>
                    {app.status.replace('_', ' ')}
                  </span>
                  <span className="text-[10px] text-slate-400 block mt-0.5 font-mono-numbers">
                    {new Date(app.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
};
