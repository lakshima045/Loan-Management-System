import React, { useState } from 'react';
import { 
  MessageSquare, 
  Search, 
  Filter, 
  CheckCircle2, 
  Clock, 
  Mail, 
  Phone, 
  Calendar,
  X,
  Send,
  AlertCircle
} from 'lucide-react';
import { useLoanContext } from '../../context/LoanContext';
import { ContactInquiry } from '../../types/loan';

export const InquiriesManagement: React.FC = () => {
  const { inquiries, updateInquiryStatus } = useLoanContext();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | ContactInquiry['status']>('all');
  const [selectedInquiry, setSelectedInquiry] = useState<ContactInquiry | null>(null);
  const [adminNotesInput, setAdminNotesInput] = useState('');

  const filteredInquiries = inquiries.filter(inq => {
    const matchesStatus = statusFilter === 'all' || inq.status === statusFilter;
    const q = searchQuery.toLowerCase();
    const matchesSearch = 
      inq.fullName.toLowerCase().includes(q) ||
      inq.email.toLowerCase().includes(q) ||
      inq.subject.toLowerCase().includes(q) ||
      (inq.applicationReference && inq.applicationReference.toLowerCase().includes(q));
    return matchesStatus && matchesSearch;
  });

  const handleOpenDetail = (inquiry: ContactInquiry) => {
    setSelectedInquiry(inquiry);
    setAdminNotesInput(inquiry.adminNotes || '');
  };

  const handleSaveStatus = (newStatus: ContactInquiry['status']) => {
    if (!selectedInquiry) return;
    updateInquiryStatus(selectedInquiry.id, newStatus, adminNotesInput.trim() || undefined);
    setSelectedInquiry({
      ...selectedInquiry,
      status: newStatus,
      adminNotes: adminNotesInput.trim() || undefined,
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Customer Inquiries Desk</h2>
          <p className="text-xs text-slate-500">
            Messages and inquiries submitted by customers through the public Contact Us portal
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold px-3 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
            Total Inquiries: {inquiries.length}
          </span>
          <span className="text-xs font-semibold px-3 py-1 rounded-full bg-amber-50 text-amber-700 border border-amber-200">
            New: {inquiries.filter(i => i.status === 'new').length}
          </span>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by name, email, subject, or ref..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs text-slate-800 bg-slate-50 rounded-xl border border-slate-200 focus:bg-white focus:outline-none"
          />
        </div>

        <div className="flex items-center gap-1.5 w-full sm:w-auto overflow-x-auto">
          {[
            { id: 'all', label: 'All Inquiries' },
            { id: 'new', label: 'New / Unread' },
            { id: 'in_progress', label: 'In Progress' },
            { id: 'resolved', label: 'Resolved' },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setStatusFilter(tab.id as any)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap cursor-pointer ${
                statusFilter === tab.id
                  ? 'bg-[#244F40] text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:text-slate-900'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Inquiries Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        {filteredInquiries.length === 0 ? (
          <div className="text-center py-12 p-6 space-y-2">
            <MessageSquare className="w-8 h-8 text-slate-300 mx-auto" />
            <p className="text-sm font-semibold text-slate-700">No inquiries found</p>
            <p className="text-xs text-slate-500">There are currently no customer inquiries matching this criteria.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-[#244F40]/5 text-slate-700 font-semibold border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4">Sender</th>
                  <th className="py-3 px-4">Subject</th>
                  <th className="py-3 px-4">Application Ref</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredInquiries.map((inq) => (
                  <tr key={inq.id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-3 px-4 text-slate-500 whitespace-nowrap">
                      {new Date(inq.createdAt).toLocaleDateString()}
                    </td>
                    <td className="py-3 px-4">
                      <span className="font-bold text-slate-900 block">{inq.fullName}</span>
                      <span className="text-[11px] text-slate-500 font-mono">{inq.email}</span>
                    </td>
                    <td className="py-3 px-4 max-w-xs truncate font-medium text-slate-800">
                      {inq.subject}
                    </td>
                    <td className="py-3 px-4 font-mono font-bold text-blue-700">
                      {inq.applicationReference || <span className="text-slate-400 font-normal">—</span>}
                    </td>
                    <td className="py-3 px-4">
                      {inq.status === 'new' && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800">
                          New
                        </span>
                      )}
                      {inq.status === 'in_progress' && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-800">
                          In Progress
                        </span>
                      )}
                      {inq.status === 'resolved' && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                          Resolved
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => handleOpenDetail(inq)}
                        className="px-3 py-1 rounded-lg bg-emerald-50 text-[#244F40] font-bold hover:bg-emerald-100 transition-colors cursor-pointer text-[11px]"
                      >
                        Inspect & Reply
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Inquiry Detail Modal */}
      {selectedInquiry && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-xs p-4">
          <div className="relative bg-white rounded-3xl max-w-lg w-full border border-slate-200 shadow-2xl p-6 sm:p-7 space-y-5 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-start justify-between border-b border-slate-100 pb-3">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800">Inquiry Message</span>
                <h3 className="text-base font-bold text-slate-900 mt-0.5">{selectedInquiry.subject}</h3>
                <p className="text-xs text-slate-500">From {selectedInquiry.fullName} · {selectedInquiry.email}</p>
              </div>
              <button
                onClick={() => setSelectedInquiry(null)}
                className="text-slate-400 hover:text-slate-700 cursor-pointer p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Inquiry Content Box */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 text-xs text-slate-700 space-y-2">
              <span className="font-bold text-slate-500 block uppercase text-[10px]">Message Body</span>
              <p className="leading-relaxed whitespace-pre-wrap">{selectedInquiry.message}</p>
              {selectedInquiry.phone && (
                <p className="text-[11px] text-slate-500 pt-1">Phone: {selectedInquiry.phone}</p>
              )}
              {selectedInquiry.applicationReference && (
                <p className="text-[11px] text-blue-700 font-mono font-semibold pt-1">
                  Attached Reference: {selectedInquiry.applicationReference}
                </p>
              )}
            </div>

            {/* Officer Internal Notes */}
            <div className="space-y-1.5 text-xs">
              <label className="font-bold text-slate-700">Internal Action Notes</label>
              <textarea
                rows={3}
                placeholder="Record resolution notes, phone call summaries, or customer response details..."
                value={adminNotesInput}
                onChange={(e) => setAdminNotesInput(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-[#244F40]"
              />
            </div>

            {/* Status Change Buttons */}
            <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs">
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => handleSaveStatus('new')}
                  className={`px-2.5 py-1 rounded-lg font-bold cursor-pointer ${
                    selectedInquiry.status === 'new' ? 'bg-amber-600 text-white' : 'bg-slate-100 text-slate-700'
                  }`}
                >
                  Mark New
                </button>
                <button
                  type="button"
                  onClick={() => handleSaveStatus('in_progress')}
                  className={`px-2.5 py-1 rounded-lg font-bold cursor-pointer ${
                    selectedInquiry.status === 'in_progress' ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-700'
                  }`}
                >
                  In Progress
                </button>
                <button
                  type="button"
                  onClick={() => handleSaveStatus('resolved')}
                  className={`px-2.5 py-1 rounded-lg font-bold cursor-pointer ${
                    selectedInquiry.status === 'resolved' ? 'bg-emerald-700 text-white' : 'bg-slate-100 text-slate-700'
                  }`}
                >
                  Resolved
                </button>
              </div>

              <button
                type="button"
                onClick={() => setSelectedInquiry(null)}
                className="px-4 py-1.5 rounded-lg border border-slate-200 text-slate-700 font-bold hover:bg-slate-50 cursor-pointer"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
