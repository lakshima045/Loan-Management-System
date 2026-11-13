import React, { useState, useMemo } from 'react';
import {
  Database,
  Table as TableIcon,
  Search,
  Code2,
  ChevronDown,
  ChevronUp,
  CheckCircle2,
  HardDrive,
  FileText,
  Receipt,
  MessageSquare,
  Layers,
  Settings as SettingsIcon,
  Copy,
  Check
} from 'lucide-react';
import { useLoanContext } from '../../context/LoanContext';
import { LOAN_PRODUCTS } from '../../data/loanProducts';
import { formatCurrency } from '../../utils/loanCalculations';

type DbTableKey = 'applications' | 'repayments' | 'inquiries' | 'loan_plans' | 'settings' | 'raw_json';

export const DatabaseViewer: React.FC = () => {
  const { applications, inquiries, settings, isServerConnected } = useLoanContext();
  const [activeTable, setActiveTable] = useState<DbTableKey>('applications');
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedRowId, setExpandedRowId] = useState<string | null>(null);
  const [copiedJson, setCopiedJson] = useState(false);

  // Flatten all repayments across applications so we have a clean relational-style table
  const allRepayments = useMemo(() => {
    return applications.flatMap((app) =>
      (app.repayments || []).map((rep) => ({
        ...rep,
        applicantName: app.personal.fullName,
        applicationRef: app.referenceNumber,
        loanType: app.loan.loanType,
      }))
    );
  }, [applications]);

  const filteredApplications = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();
    if (!q) return applications;
    return applications.filter(
      (a) =>
        a.referenceNumber.toLowerCase().includes(q) ||
        a.personal.fullName.toLowerCase().includes(q) ||
        a.personal.nicNumber.toLowerCase().includes(q) ||
        a.status.toLowerCase().includes(q) ||
        a.loan.loanType.toLowerCase().includes(q)
    );
  }, [applications, searchTerm]);

  const filteredRepayments = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();
    if (!q) return allRepayments;
    return allRepayments.filter(
      (r) =>
        r.applicationRef.toLowerCase().includes(q) ||
        r.applicantName.toLowerCase().includes(q) ||
        r.transactionReference.toLowerCase().includes(q) ||
        r.paymentMethod.toLowerCase().includes(q)
    );
  }, [allRepayments, searchTerm]);

  const filteredInquiries = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();
    if (!q) return inquiries;
    return inquiries.filter(
      (i) =>
        i.fullName.toLowerCase().includes(q) ||
        i.email.toLowerCase().includes(q) ||
        i.subject.toLowerCase().includes(q) ||
        (i.applicationReference || '').toLowerCase().includes(q)
    );
  }, [inquiries, searchTerm]);

  const databaseSnapshot = useMemo(
    () => ({
      storageEngine: 'Central JSON File Database (/data/loanflow_db.json) + Express API',
      tables: {
        applications_count: applications.length,
        repayments_count: allRepayments.length,
        inquiries_count: inquiries.length,
        loan_plans_count: LOAN_PRODUCTS.length,
      },
      applications,
      inquiries,
      settings,
    }),
    [applications, allRepayments.length, inquiries, settings]
  );

  const handleCopyJson = () => {
    navigator.clipboard.writeText(JSON.stringify(databaseSnapshot, null, 2));
    setCopiedJson(true);
    setTimeout(() => setCopiedJson(false), 2000);
  };

  const tabs: { key: DbTableKey; label: string; count: number; icon: React.ComponentType<{ className?: string }> }[] = [
    { key: 'applications', label: 'applications', count: applications.length, icon: FileText },
    { key: 'repayments', label: 'repayments', count: allRepayments.length, icon: Receipt },
    { key: 'inquiries', label: 'inquiries', count: inquiries.length, icon: MessageSquare },
    { key: 'loan_plans', label: 'loan_plans', count: LOAN_PRODUCTS.length, icon: Layers },
    { key: 'settings', label: 'settings', count: 1, icon: SettingsIcon },
    { key: 'raw_json', label: 'raw_json', count: applications.length + inquiries.length, icon: Code2 },
  ];

  return (
    <div className="space-y-6">
      {/* Header & Storage Location Summary */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-5">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-start gap-3.5">
            <div className="w-11 h-11 rounded-2xl bg-[#244F40] text-white flex items-center justify-center shrink-0 shadow-sm">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900">Central Database &amp; Tables Inspector</h2>
              <p className="text-xs text-slate-600 mt-0.5">
                Live view of all customer forms, repayments, inquiries, and settings stored on the backend server.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 text-xs">
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 font-semibold">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              {isServerConnected ? 'Server Database Synced' : 'Local Cache Mode'}
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 border border-slate-200 text-slate-700 font-mono text-[11px]">
              <HardDrive className="w-3.5 h-3.5 text-slate-500" />
              data/loanflow_db.json
            </span>
          </div>
        </div>

        {/* Quick Flow Explainer */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-1">
          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs space-y-1">
            <span className="font-bold text-[#244F40] block">1. Customer Submits Form</span>
            <p className="text-slate-600 leading-relaxed">
              Browser sends form data to <code className="font-mono text-[11px] bg-white px-1 rounded border border-slate-200">POST /api/applications</code>.
            </p>
          </div>
          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs space-y-1">
            <span className="font-bold text-[#244F40] block">2. Saved to Disk File</span>
            <p className="text-slate-600 leading-relaxed">
              Express server assigns a Reference ID and writes the record into <code className="font-mono text-[11px] bg-white px-1 rounded border border-slate-200">data/loanflow_db.json</code>.
            </p>
          </div>
          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs space-y-1">
            <span className="font-bold text-[#244F40] block">3. Admin &amp; Tracker Update</span>
            <p className="text-slate-600 leading-relaxed">
              New rows appear immediately in the <strong>applications</strong> table below and in the Customer Tracker.
            </p>
          </div>
        </div>
      </div>

      {/* Table Selector & Search */}
      <div className="bg-white rounded-3xl border border-slate-200 p-5 sm:p-6 shadow-xs space-y-5">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          {/* Table Tabs */}
          <div className="flex flex-wrap items-center gap-1.5">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTable === tab.key;
              return (
                <button
                  key={tab.key}
                  onClick={() => {
                    setActiveTable(tab.key);
                    setExpandedRowId(null);
                  }}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-mono font-bold transition-all cursor-pointer ${
                    isActive
                      ? 'bg-[#244F40] text-white shadow-xs'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200/70'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{tab.label}</span>
                  <span
                    className={`px-1.5 py-0.5 rounded-full text-[10px] ${
                      isActive ? 'bg-white/20 text-white' : 'bg-white text-slate-600'
                    }`}
                  >
                    {tab.count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Search Bar */}
          {activeTable !== 'settings' && activeTable !== 'raw_json' && (
            <div className="relative w-full lg:w-72">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search rows by ID, name, NIC..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 bg-slate-50 text-xs focus:bg-white focus:outline-[#244F40]"
              />
            </div>
          )}
        </div>

        {/* TABLE 1: APPLICATIONS */}
        {activeTable === 'applications' && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs text-slate-500">
              <span className="flex items-center gap-1.5 font-semibold text-slate-700">
                <TableIcon className="w-3.5 h-3.5 text-[#244F40]" />
                Table: <code className="font-mono">applications</code> ({filteredApplications.length} rows)
              </span>
              <span>Click &ldquo;Inspect JSON&rdquo; on any row to see nested objects (documents, approval, repayments)</span>
            </div>

            <div className="overflow-x-auto border border-slate-200 rounded-2xl">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                  <tr>
                    <th className="py-2.5 px-3 font-mono">referenceNumber</th>
                    <th className="py-2.5 px-3 font-mono">fullName</th>
                    <th className="py-2.5 px-3 font-mono">nicNumber</th>
                    <th className="py-2.5 px-3 font-mono">loanType</th>
                    <th className="py-2.5 px-3 font-mono">requestedAmount</th>
                    <th className="py-2.5 px-3 font-mono">status</th>
                    <th className="py-2.5 px-3 font-mono">outstanding</th>
                    <th className="py-2.5 px-3 font-mono">createdAt</th>
                    <th className="py-2.5 px-3 text-right">Row Data</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredApplications.map((app) => {
                    const isExpanded = expandedRowId === app.id;
                    return (
                      <React.Fragment key={app.id}>
                        <tr className="hover:bg-slate-50/80">
                          <td className="py-2.5 px-3 font-mono font-bold text-[#244F40]">{app.referenceNumber}</td>
                          <td className="py-2.5 px-3 font-semibold text-slate-800">{app.personal.fullName}</td>
                          <td className="py-2.5 px-3 font-mono text-slate-600">{app.personal.nicNumber}</td>
                          <td className="py-2.5 px-3 capitalize text-slate-700">{app.loan.loanType}</td>
                          <td className="py-2.5 px-3 font-mono-numbers font-semibold text-slate-800">
                            {formatCurrency(app.loan.requestedAmount)}
                          </td>
                          <td className="py-2.5 px-3">
                            <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-slate-100 text-slate-700 font-mono">
                              {app.status}
                            </span>
                          </td>
                          <td className="py-2.5 px-3 font-mono-numbers text-slate-700">
                            {formatCurrency(app.currentOutstandingBalance)}
                          </td>
                          <td className="py-2.5 px-3 font-mono text-slate-500">
                            {app.createdAt.split('T')[0]}
                          </td>
                          <td className="py-2.5 px-3 text-right">
                            <button
                              onClick={() => setExpandedRowId(isExpanded ? null : app.id)}
                              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold cursor-pointer"
                            >
                              <span>Inspect JSON</span>
                              {isExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                            </button>
                          </td>
                        </tr>
                        {isExpanded && (
                          <tr>
                            <td colSpan={9} className="bg-slate-900 text-emerald-200 p-4 font-mono text-[11px]">
                              <pre className="overflow-x-auto max-h-80">{JSON.stringify(app, null, 2)}</pre>
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                    );
                  })}
                  {filteredApplications.length === 0 && (
                    <tr>
                      <td colSpan={9} className="py-8 text-center text-slate-500">
                        No matching rows found in applications table.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TABLE 2: REPAYMENTS */}
        {activeTable === 'repayments' && (
          <div className="space-y-2">
            <div className="text-xs text-slate-500 font-semibold">
              Table: <code className="font-mono text-slate-800">repayments</code> ({filteredRepayments.length} rows)
            </div>
            <div className="overflow-x-auto border border-slate-200 rounded-2xl">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                  <tr>
                    <th className="py-2.5 px-3 font-mono">transactionReference</th>
                    <th className="py-2.5 px-3 font-mono">applicationRef</th>
                    <th className="py-2.5 px-3 font-mono">applicantName</th>
                    <th className="py-2.5 px-3 font-mono">paymentDate</th>
                    <th className="py-2.5 px-3 font-mono">amount</th>
                    <th className="py-2.5 px-3 font-mono">principalPortion</th>
                    <th className="py-2.5 px-3 font-mono">interestPortion</th>
                    <th className="py-2.5 px-3 font-mono">paymentMethod</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredRepayments.map((rep) => (
                    <tr key={rep.id} className="hover:bg-slate-50/80">
                      <td className="py-2.5 px-3 font-mono font-bold text-[#244F40]">{rep.transactionReference}</td>
                      <td className="py-2.5 px-3 font-mono text-slate-700">{rep.applicationRef}</td>
                      <td className="py-2.5 px-3 font-semibold text-slate-800">{rep.applicantName}</td>
                      <td className="py-2.5 px-3 font-mono text-slate-500">{rep.paymentDate}</td>
                      <td className="py-2.5 px-3 font-mono-numbers font-bold text-emerald-700">{formatCurrency(rep.amount)}</td>
                      <td className="py-2.5 px-3 font-mono-numbers text-slate-700">{formatCurrency(rep.principalPortion)}</td>
                      <td className="py-2.5 px-3 font-mono-numbers text-slate-700">{formatCurrency(rep.interestPortion)}</td>
                      <td className="py-2.5 px-3 font-mono text-slate-600">{rep.paymentMethod}</td>
                    </tr>
                  ))}
                  {filteredRepayments.length === 0 && (
                    <tr>
                      <td colSpan={8} className="py-8 text-center text-slate-500">
                        No repayment rows found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TABLE 3: INQUIRIES */}
        {activeTable === 'inquiries' && (
          <div className="space-y-2">
            <div className="text-xs text-slate-500 font-semibold">
              Table: <code className="font-mono text-slate-800">inquiries</code> ({filteredInquiries.length} rows)
            </div>
            <div className="overflow-x-auto border border-slate-200 rounded-2xl">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                  <tr>
                    <th className="py-2.5 px-3 font-mono">id</th>
                    <th className="py-2.5 px-3 font-mono">fullName</th>
                    <th className="py-2.5 px-3 font-mono">email</th>
                    <th className="py-2.5 px-3 font-mono">subject</th>
                    <th className="py-2.5 px-3 font-mono">applicationReference</th>
                    <th className="py-2.5 px-3 font-mono">status</th>
                    <th className="py-2.5 px-3 font-mono">createdAt</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredInquiries.map((inq) => (
                    <tr key={inq.id} className="hover:bg-slate-50/80">
                      <td className="py-2.5 px-3 font-mono text-slate-500">{inq.id}</td>
                      <td className="py-2.5 px-3 font-semibold text-slate-800">{inq.fullName}</td>
                      <td className="py-2.5 px-3 font-mono text-slate-600">{inq.email}</td>
                      <td className="py-2.5 px-3 text-slate-800">{inq.subject}</td>
                      <td className="py-2.5 px-3 font-mono text-slate-600">{inq.applicationReference || '—'}</td>
                      <td className="py-2.5 px-3 font-mono font-bold text-slate-700">{inq.status}</td>
                      <td className="py-2.5 px-3 font-mono text-slate-500">{inq.createdAt.split('T')[0]}</td>
                    </tr>
                  ))}
                  {filteredInquiries.length === 0 && (
                    <tr>
                      <td colSpan={7} className="py-8 text-center text-slate-500">
                        No inquiry rows found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TABLE 4: LOAN PLANS */}
        {activeTable === 'loan_plans' && (
          <div className="space-y-2">
            <div className="text-xs text-slate-500 font-semibold">
              Table: <code className="font-mono text-slate-800">loan_plans</code> ({LOAN_PRODUCTS.length} rows)
            </div>
            <div className="overflow-x-auto border border-slate-200 rounded-2xl">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                  <tr>
                    <th className="py-2.5 px-3 font-mono">id</th>
                    <th className="py-2.5 px-3 font-mono">name</th>
                    <th className="py-2.5 px-3 font-mono">minAmount</th>
                    <th className="py-2.5 px-3 font-mono">maxAmount</th>
                    <th className="py-2.5 px-3 font-mono">tenureMonths</th>
                    <th className="py-2.5 px-3 font-mono">defaultAnnualRate</th>
                    <th className="py-2.5 px-3 font-mono">defaultMethod</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {LOAN_PRODUCTS.map((p) => (
                    <tr key={p.id} className="hover:bg-slate-50/80">
                      <td className="py-2.5 px-3 font-mono font-bold text-[#244F40]">{p.id}</td>
                      <td className="py-2.5 px-3 font-semibold text-slate-800">{p.name}</td>
                      <td className="py-2.5 px-3 font-mono-numbers">{formatCurrency(p.minAmount)}</td>
                      <td className="py-2.5 px-3 font-mono-numbers">{formatCurrency(p.maxAmount)}</td>
                      <td className="py-2.5 px-3 font-mono">{p.minTenureMonths} – {p.maxTenureMonths} mo</td>
                      <td className="py-2.5 px-3 font-mono">{p.defaultAnnualRate}%</td>
                      <td className="py-2.5 px-3 font-mono text-slate-600">{p.defaultMethod}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TABLE 5: SETTINGS */}
        {activeTable === 'settings' && (
          <div className="space-y-2">
            <div className="text-xs text-slate-500 font-semibold">
              Table: <code className="font-mono text-slate-800">settings</code> (1 active config record)
            </div>
            <div className="overflow-x-auto border border-slate-200 rounded-2xl">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                  <tr>
                    <th className="py-2.5 px-4 font-mono">Key</th>
                    <th className="py-2.5 px-4 font-mono">Value</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {Object.entries(settings).map(([k, v]) => (
                    <tr key={k} className="hover:bg-slate-50/80">
                      <td className="py-2.5 px-4 font-mono font-bold text-[#244F40]">{k}</td>
                      <td className="py-2.5 px-4 font-mono text-slate-700">{String(v)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TABLE 6: RAW JSON */}
        {activeTable === 'raw_json' && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-700">
                Full Central Database Snapshot (<code className="font-mono">data/loanflow_db.json</code>)
              </span>
              <button
                onClick={handleCopyJson}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold cursor-pointer"
              >
                {copiedJson ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedJson ? 'Copied JSON' : 'Copy All JSON'}</span>
              </button>
            </div>
            <div className="rounded-2xl bg-slate-900 text-emerald-200 p-4 font-mono text-[11px] overflow-x-auto max-h-[520px]">
              <pre>{JSON.stringify(databaseSnapshot, null, 2)}</pre>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
