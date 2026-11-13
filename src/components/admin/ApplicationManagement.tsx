import React, { useState } from 'react';
import { 
  Search, 
  Filter, 
  AlertTriangle, 
  Eye, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  DollarSign, 
  Calendar, 
  User, 
  FileText, 
  Trash2,
  TrendingUp,
  Download
} from 'lucide-react';
import { useLoanContext } from '../../context/LoanContext';
import { LoanApplication, ApplicationStatus } from '../../types/loan';
import { formatCurrency } from '../../utils/loanCalculations';
import { ApplicationReviewModal } from './ApplicationReviewModal';

export const ApplicationManagement: React.FC = () => {
  const { applications, deleteApplication, checkDuplicateApplications } = useLoanContext();

  const [searchQuery, setSearchQuery] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedApp, setSelectedApp] = useState<LoanApplication | null>(null);

  // Filtered applications
  const filtered = applications.filter((app) => {
    // Status filter
    if (statusFilter !== 'all' && app.status !== statusFilter) {
      return false;
    }

    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      const matchRef = app.referenceNumber.toLowerCase().includes(q);
      const matchName = app.personal.fullName.toLowerCase().includes(q);
      const matchNIC = app.personal.nicNumber.toLowerCase().includes(q);
      const matchPhone = app.contact.phone.toLowerCase().includes(q);
      const matchType = app.loan.loanType.toLowerCase().includes(q);
      return matchRef || matchName || matchNIC || matchPhone || matchType;
    }

    return true;
  });

  const getStatusBadge = (status: ApplicationStatus) => {
    switch (status) {
      case 'pending':
        return <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-slate-100 text-slate-800 border border-slate-200">Pending Review</span>;
      case 'under_review':
        return <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-100 text-amber-800 border border-amber-200">Under Review</span>;
      case 'approved':
        return <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">Approved</span>;
      case 'disbursed':
        return <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-blue-100 text-blue-800 border border-blue-200">Disbursed (Active)</span>;
      case 'completed':
        return <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-teal-100 text-teal-800 border border-teal-200">Completed</span>;
      case 'rejected':
        return <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-rose-100 text-rose-800 border border-rose-200">Declined</span>;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Controls Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">
            Central Application Registry
          </h2>
          <p className="text-xs text-slate-500">
            Real-time feed of all customer loan applications with document verification & underwriting queue
          </p>
        </div>

        {/* Quick summary stats */}
        <div className="flex items-center gap-2 text-xs">
          <span className="px-3 py-1 rounded-lg bg-white border border-slate-200 font-medium text-slate-700">
            Total Records: <strong className="font-mono-numbers">{applications.length}</strong>
          </span>
          <span className="px-3 py-1 rounded-lg bg-amber-50 border border-amber-200 text-amber-900 font-semibold">
            Action Required: <strong className="font-mono-numbers">{applications.filter(a => a.status === 'pending' || a.status === 'under_review').length}</strong>
          </span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Search Input */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by Reference ID, Applicant Name, NIC Number, Phone..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-200 bg-slate-50 text-xs focus:bg-white focus:outline-blue-600 font-medium text-slate-900"
          />
        </div>

        {/* Status Filter Buttons */}
        <div className="flex items-center gap-1 overflow-x-auto pb-1 md:pb-0">
          {[
            { id: 'all', label: 'All Statuses' },
            { id: 'pending', label: 'Pending' },
            { id: 'under_review', label: 'Reviewing' },
            { id: 'approved', label: 'Approved' },
            { id: 'disbursed', label: 'Disbursed' },
            { id: 'completed', label: 'Completed' },
            { id: 'rejected', label: 'Declined' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setStatusFilter(tab.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                statusFilter === tab.id
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Applications Data Table */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        {filtered.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <FileText className="w-12 h-12 text-slate-300 mx-auto" />
            <p className="text-sm font-semibold text-slate-700">No loan applications match this filter.</p>
            <p className="text-xs text-slate-400">Try adjusting your search query or switching status filters.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200 uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="py-3 px-4">Ref Number</th>
                  <th className="py-3 px-4">Applicant</th>
                  <th className="py-3 px-4">NIC Number</th>
                  <th className="py-3 px-4">Facility Type</th>
                  <th className="py-3 px-4">Requested (Rs.)</th>
                  <th className="py-3 px-4">Monthly Income</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Submitted</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map((app) => {
                  const duplicates = checkDuplicateApplications(app.personal.nicNumber, app.contact.phone, app.id);
                  const isDuplicate = duplicates.length > 0;

                  return (
                    <tr key={app.id} className="hover:bg-slate-50/80 transition-colors">
                      {/* Ref & Duplicate Warning */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-1.5">
                          <span className="font-mono font-bold text-blue-700">{app.referenceNumber}</span>
                          {isDuplicate && (
                            <span 
                              className="w-4 h-4 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center cursor-help"
                              title={`Duplicate match: applicant has applied before (${duplicates.length} records)`}
                            >
                              <AlertTriangle className="w-3 h-3" />
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Applicant */}
                      <td className="py-3.5 px-4 font-semibold text-slate-900">
                        <div>
                          <span>{app.personal.fullName}</span>
                          <span className="text-[10px] text-slate-400 block font-normal">{app.contact.phone}</span>
                        </div>
                      </td>

                      {/* NIC */}
                      <td className="py-3.5 px-4 font-mono text-slate-700">
                        {app.personal.nicNumber}
                      </td>

                      {/* Facility */}
                      <td className="py-3.5 px-4 capitalize text-slate-700 font-medium">
                        {app.loan.loanType}
                      </td>

                      {/* Requested Amount */}
                      <td className="py-3.5 px-4 font-bold text-slate-900 font-mono-numbers">
                        {formatCurrency(app.loan.requestedAmount)}
                        <span className="text-[10px] text-slate-400 font-normal block">{app.loan.tenureMonths} Mos</span>
                      </td>

                      {/* Income */}
                      <td className="py-3.5 px-4 font-mono-numbers text-slate-700">
                        {formatCurrency(app.employment.monthlyGrossIncome)}/mo
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-4">
                        {getStatusBadge(app.status)}
                      </td>

                      {/* Date */}
                      <td className="py-3.5 px-4 text-slate-500 font-mono-numbers">
                        {new Date(app.createdAt).toLocaleDateString()}
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => setSelectedApp(app)}
                            className="px-3 py-1.5 rounded-lg bg-blue-50 text-blue-700 hover:bg-blue-100 font-bold text-xs flex items-center gap-1 transition-colors cursor-pointer"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            <span>Review</span>
                          </button>
                          <button
                            onClick={() => {
                              if (window.confirm(`Delete application ${app.referenceNumber}?`)) {
                                deleteApplication(app.id);
                              }
                            }}
                            className="p-1.5 text-slate-300 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors cursor-pointer"
                            title="Delete Record"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Review Modal */}
      {selectedApp && (
        <ApplicationReviewModal
          isOpen={!!selectedApp}
          onClose={() => setSelectedApp(null)}
          application={selectedApp}
        />
      )}
    </div>
  );
};
