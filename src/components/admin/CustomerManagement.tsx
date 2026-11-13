import React, { useState } from 'react';
import { 
  Users, 
  Search, 
  Filter, 
  FileText, 
  Phone, 
  Mail, 
  MapPin, 
  ChevronRight, 
  Building2,
  DollarSign,
  TrendingUp,
  CreditCard
} from 'lucide-react';
import { useLoanContext, CustomerSummary } from '../../context/LoanContext';
import { formatCurrency } from '../../utils/loanCalculations';

export const CustomerManagement: React.FC = () => {
  const { getCustomerSummaries } = useLoanContext();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState<CustomerSummary | null>(null);

  const customers = getCustomerSummaries();

  const filteredCustomers = customers.filter(c => {
    const q = searchQuery.toLowerCase();
    return (
      c.fullName.toLowerCase().includes(q) ||
      c.nicNumber.toLowerCase().includes(q) ||
      c.phone.includes(q) ||
      c.city.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Customer Directory</h2>
          <p className="text-xs text-slate-500">
            Consolidated borrower records grouped by National Identity Card (NIC) with active loan exposure
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
            Total Borrowers: {customers.length}
          </span>
        </div>
      </div>

      {/* Search Bar */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs flex items-center gap-3">
        <Search className="w-4 h-4 text-slate-400 shrink-0" />
        <input
          type="text"
          placeholder="Search by customer name, NIC number, phone, or city..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full text-xs text-slate-800 focus:outline-none"
        />
      </div>

      {/* Grid of Customers & Drawer */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Customer List (7 or 12 cols) */}
        <div className={`${selectedCustomer ? 'lg:col-span-7' : 'lg:col-span-12'} space-y-3`}>
          {filteredCustomers.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-2xl border border-slate-200 p-6 space-y-2">
              <Users className="w-8 h-8 text-slate-300 mx-auto" />
              <p className="text-sm font-semibold text-slate-700">No customer records found</p>
              <p className="text-xs text-slate-500">Try adjusting your search query.</p>
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left">
                  <thead className="bg-[#244F40]/5 text-slate-700 font-semibold border-b border-slate-200">
                    <tr>
                      <th className="py-3 px-4">Applicant / NIC</th>
                      <th className="py-3 px-4">Contact</th>
                      <th className="py-3 px-4 text-center">Applications</th>
                      <th className="py-3 px-4 text-center">Active Loans</th>
                      <th className="py-3 px-4 text-right">Total Borrowed</th>
                      <th className="py-3 px-4 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredCustomers.map((cust) => {
                      const isSelected = selectedCustomer?.nicNumber === cust.nicNumber;
                      return (
                        <tr
                          key={cust.nicNumber}
                          className={`hover:bg-slate-50 transition-colors cursor-pointer ${
                            isSelected ? 'bg-emerald-50/50' : ''
                          }`}
                          onClick={() => setSelectedCustomer(cust)}
                        >
                          <td className="py-3 px-4">
                            <span className="font-bold text-slate-900 block">{cust.fullName}</span>
                            <span className="text-[11px] font-mono text-slate-500">{cust.nicNumber}</span>
                          </td>
                          <td className="py-3 px-4 text-slate-600">
                            <span>{cust.phone}</span>
                            <span className="text-[11px] text-slate-400 block">{cust.city}</span>
                          </td>
                          <td className="py-3 px-4 text-center">
                            <span className="px-2 py-0.5 rounded-full bg-slate-100 font-bold font-mono-numbers text-[11px]">
                              {cust.applicationsCount}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-center">
                            {cust.activeLoansCount > 0 ? (
                              <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold font-mono-numbers text-[11px]">
                                {cust.activeLoansCount} Active
                              </span>
                            ) : (
                              <span className="text-slate-400 text-[11px]">0 Active</span>
                            )}
                          </td>
                          <td className="py-3 px-4 text-right font-extrabold font-mono-numbers text-[#244F40]">
                            {formatCurrency(cust.totalBorrowedRs)}
                          </td>
                          <td className="py-3 px-4 text-right">
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedCustomer(cust);
                              }}
                              className="px-2.5 py-1 rounded-lg bg-emerald-50 text-[#244F40] font-bold text-[11px] hover:bg-emerald-100 transition-colors cursor-pointer"
                            >
                              Inspect Profile
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* Selected Customer Profile Drawer (5 cols) */}
        {selectedCustomer && (
          <div className="lg:col-span-5 bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-5 animate-in fade-in duration-150">
            <div className="flex items-start justify-between border-b border-slate-100 pb-3">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700">Borrower Dossier</span>
                <h3 className="text-base font-bold text-slate-900">{selectedCustomer.fullName}</h3>
                <p className="text-xs font-mono text-slate-500">NIC: {selectedCustomer.nicNumber}</p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedCustomer(null)}
                className="text-slate-400 hover:text-slate-700 text-xs cursor-pointer"
              >
                Close
              </button>
            </div>

            {/* Financial Exposure KPI Strip in Rs. */}
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                <span className="text-slate-500 block text-[11px]">Total Outstanding</span>
                <span className="text-base font-extrabold text-amber-700 font-mono-numbers">
                  {formatCurrency(selectedCustomer.totalOutstandingRs)}
                </span>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                <span className="text-slate-500 block text-[11px]">Total Disbursed</span>
                <span className="text-base font-extrabold text-emerald-800 font-mono-numbers">
                  {formatCurrency(selectedCustomer.totalBorrowedRs)}
                </span>
              </div>
            </div>

            {/* Contact details */}
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 space-y-1.5 text-xs text-slate-600">
              <div className="flex items-center gap-2">
                <Phone className="w-3.5 h-3.5 text-slate-400" />
                <span>{selectedCustomer.phone}</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-3.5 h-3.5 text-slate-400" />
                <span>{selectedCustomer.email}</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="w-3.5 h-3.5 text-slate-400" />
                <span>{selectedCustomer.city}</span>
              </div>
            </div>

            {/* Associated Application History */}
            <div className="space-y-2">
              <span className="text-xs font-bold text-slate-800 uppercase tracking-wide block">
                Associated Applications ({selectedCustomer.applications.length})
              </span>
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {selectedCustomer.applications.map((app) => (
                  <div key={app.id} className="p-3 rounded-xl border border-slate-100 bg-slate-50/50 space-y-1 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="font-mono font-bold text-slate-800">{app.referenceNumber}</span>
                      <span className="capitalize px-2 py-0.5 rounded text-[10px] font-bold bg-white border border-slate-200">
                        {app.status.replace('_', ' ')}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-[11px] text-slate-500 font-mono-numbers">
                      <span>{app.loan.loanType} Loan</span>
                      <span>Requested: {formatCurrency(app.loan.requestedAmount)}</span>
                    </div>
                    {app.currentOutstandingBalance > 0 && (
                      <div className="text-[11px] font-semibold text-amber-700">
                        Outstanding: {formatCurrency(app.currentOutstandingBalance)}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
