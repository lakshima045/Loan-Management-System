import React, { useState } from 'react';
import { 
  LayoutDashboard, 
  FileText, 
  Send, 
  Receipt, 
  BarChart3, 
  LogOut, 
  Users,
  MessageSquare,
  Settings,
  ExternalLink,
  Database
} from 'lucide-react';
import { useLoanContext } from '../../context/LoanContext';
import { AdminLogin } from './AdminLogin';
import { AdminDashboard } from './AdminDashboard';
import { ApplicationManagement } from './ApplicationManagement';
import { DisbursementsManager } from './DisbursementsManager';
import { RepaymentsManager } from './RepaymentsManager';
import { ReportsManager } from './ReportsManager';
import { CustomerManagement } from './CustomerManagement';
import { InquiriesManagement } from './InquiriesManagement';
import { SystemSettingsManager } from './SystemSettingsManager';
import { DatabaseViewer } from './DatabaseViewer';

interface AdminPortalProps {
  onBackToCustomer: () => void;
}

export type AdminTab = 
  | 'dashboard' 
  | 'applications' 
  | 'disbursements' 
  | 'repayments' 
  | 'customers'
  | 'inquiries'
  | 'reports'
  | 'database'
  | 'settings';

export const AdminPortal: React.FC<AdminPortalProps> = ({ onBackToCustomer }) => {
  const { isAdminLoggedIn, adminLogout, applications, inquiries } = useLoanContext();
  const [activeTab, setActiveTab] = useState<AdminTab>('dashboard');

  if (!isAdminLoggedIn) {
    return <AdminLogin onBackToCustomer={onBackToCustomer} />;
  }

  const pendingCount = applications.filter(a => a.status === 'pending' || a.status === 'under_review').length;
  const approvedAwaitingDisbCount = applications.filter(a => a.status === 'approved').length;
  const newInquiriesCount = inquiries.filter(i => i.status === 'new').length;

  return (
    <div className="min-h-screen bg-slate-50/70 pb-16">
      {/* Forest Green Admin Top Header */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between py-3.5 gap-3 border-b border-slate-100">
            <div className="flex items-center gap-3">
              <span className="px-3 py-1 rounded-md bg-[#244F40] text-emerald-100 font-mono font-extrabold text-xs uppercase tracking-wider">
                LoanFlow Admin Console
              </span>
              <span className="text-xs text-slate-500">
                Logged in as <strong className="text-slate-800">Underwriting & Treasury Desk (admin@loanflow.lk)</strong>
              </span>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={onBackToCustomer}
                className="text-xs text-[#1769E0] hover:text-[#0B4DBB] font-bold flex items-center gap-1 cursor-pointer"
              >
                <span>Go to Customer Website</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </button>
              <span className="text-slate-200">|</span>
              <button
                onClick={adminLogout}
                className="flex items-center gap-1.5 text-xs text-rose-600 hover:text-rose-700 font-bold cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Sign Out</span>
              </button>
            </div>
          </div>

          {/* Forest Green Tab Navigation */}
          <div className="flex items-center gap-1.5 overflow-x-auto py-2.5">
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                activeTab === 'dashboard'
                  ? 'bg-[#244F40] text-white shadow-xs'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <LayoutDashboard className="w-4 h-4" />
              <span>Dashboard</span>
            </button>

            <button
              onClick={() => setActiveTab('applications')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                activeTab === 'applications'
                  ? 'bg-[#244F40] text-white shadow-xs'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <FileText className="w-4 h-4" />
              <span>Applications</span>
              {pendingCount > 0 && (
                <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                  activeTab === 'applications' ? 'bg-[#1C3E32] text-white' : 'bg-amber-100 text-amber-800'
                }`}>
                  {pendingCount}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab('disbursements')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                activeTab === 'disbursements'
                  ? 'bg-[#244F40] text-white shadow-xs'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <Send className="w-4 h-4" />
              <span>Disbursements & Loans</span>
              {approvedAwaitingDisbCount > 0 && (
                <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                  activeTab === 'disbursements' ? 'bg-[#1C3E32] text-white' : 'bg-emerald-100 text-emerald-800'
                }`}>
                  {approvedAwaitingDisbCount}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab('repayments')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                activeTab === 'repayments'
                  ? 'bg-[#244F40] text-white shadow-xs'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <Receipt className="w-4 h-4" />
              <span>Repayments Ledger</span>
            </button>

            <button
              onClick={() => setActiveTab('customers')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                activeTab === 'customers'
                  ? 'bg-[#244F40] text-white shadow-xs'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <Users className="w-4 h-4" />
              <span>Customers</span>
            </button>

            <button
              onClick={() => setActiveTab('inquiries')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                activeTab === 'inquiries'
                  ? 'bg-[#244F40] text-white shadow-xs'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <MessageSquare className="w-4 h-4" />
              <span>Inquiries</span>
              {newInquiriesCount > 0 && (
                <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                  activeTab === 'inquiries' ? 'bg-[#1C3E32] text-white' : 'bg-blue-100 text-blue-800'
                }`}>
                  {newInquiriesCount}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab('reports')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                activeTab === 'reports'
                  ? 'bg-[#244F40] text-white shadow-xs'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <BarChart3 className="w-4 h-4" />
              <span>Reports & CSV</span>
            </button>

            <button
              onClick={() => setActiveTab('database')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                activeTab === 'database'
                  ? 'bg-[#244F40] text-white shadow-xs'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <Database className="w-4 h-4" />
              <span>Database Tables</span>
            </button>

            <button
              onClick={() => setActiveTab('settings')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                activeTab === 'settings'
                  ? 'bg-[#244F40] text-white shadow-xs'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <Settings className="w-4 h-4" />
              <span>Settings</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Admin Tab Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        {activeTab === 'dashboard' && <AdminDashboard onNavigateTab={setActiveTab as any} />}
        {activeTab === 'applications' && <ApplicationManagement />}
        {activeTab === 'disbursements' && <DisbursementsManager />}
        {activeTab === 'repayments' && <RepaymentsManager />}
        {activeTab === 'customers' && <CustomerManagement />}
        {activeTab === 'inquiries' && <InquiriesManagement />}
        {activeTab === 'reports' && <ReportsManager />}
        {activeTab === 'database' && <DatabaseViewer />}
        {activeTab === 'settings' && <SystemSettingsManager />}
      </main>
    </div>
  );
};
