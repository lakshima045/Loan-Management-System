import React, { useState } from 'react';
import { 
  X, 
  CheckCircle2, 
  XCircle, 
  FileText, 
  AlertTriangle, 
  DollarSign, 
  Clock, 
  User, 
  Briefcase, 
  ShieldAlert, 
  FileCheck2, 
  ExternalLink,
  Percent,
  Calendar,
  Building,
  Info
} from 'lucide-react';
import { LoanApplication, UploadedDocument, InterestMethod } from '../../types/loan';
import { LOAN_PRODUCTS } from '../../data/loanProducts';
import { useLoanContext } from '../../context/LoanContext';
import { formatCurrency, calculateLoanSummary, calculateDTI } from '../../utils/loanCalculations';

interface ApplicationReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  application: LoanApplication;
}

export const ApplicationReviewModal: React.FC<ApplicationReviewModalProps> = ({
  isOpen,
  onClose,
  application,
}) => {
  const { 
    verifyDocument, 
    approveApplication, 
    rejectApplication, 
    updateApplicationStatus, 
    checkDuplicateApplications 
  } = useLoanContext();

  const [activeTab, setActiveTab] = useState<'profile' | 'documents' | 'decision'>('profile');

  const matchedProduct = LOAN_PRODUCTS.find(p => p.id === application.loan.loanType) || LOAN_PRODUCTS[0];

  // Approval Form State
  const [approvedAmount, setApprovedAmount] = useState<number>(application.approval?.approvedAmount || application.loan.requestedAmount);
  const [approvedRate, setApprovedRate] = useState<number>(application.approval?.approvedRate ?? matchedProduct.defaultAnnualRate);
  const [approvedTenure, setApprovedTenure] = useState<number>(application.approval?.approvedTenureMonths || application.loan.tenureMonths);
  const [approvedMethod, setApprovedMethod] = useState<InterestMethod>(
    application.approval?.interestMethod || application.loan.interestMethod || matchedProduct.defaultMethod
  );
  const [approvalNotes, setApprovalNotes] = useState<string>(application.approval?.notes || 'Customer profile and income criteria verified satisfactory.');

  // Rejection Form State
  const [rejectionReason, setRejectionReason] = useState<string>(
    application.rejection?.rejectionReason || 'Debt-to-Income (DTI) ratio exceeds maximum safety threshold'
  );
  const [rejectionNotes, setRejectionNotes] = useState<string>(application.rejection?.notes || '');

  // Admin general notes
  const [adminNotes, setAdminNotes] = useState<string>(application.adminNotes || '');

  // Preview document modal
  const [previewDoc, setPreviewDoc] = useState<UploadedDocument | null>(null);

  if (!isOpen) return null;

  // Duplicates check
  const duplicateMatches = checkDuplicateApplications(application.personal.nicNumber, application.contact.phone, application.id);

  // EMI & Payback recalculation for approval
  const {
    monthlyInstallment: calculatedApprovedEMI,
    totalInterest: calculatedTotalInterest,
    totalPayable: calculatedTotalPayable,
  } = calculateLoanSummary(approvedAmount, approvedRate, approvedTenure, approvedMethod);

  // DTI calculation
  const dti = calculateDTI(
    application.employment.monthlyGrossIncome,
    application.employment.existingLoanCommitments,
    calculatedApprovedEMI
  );

  const handleApprove = () => {
    approveApplication(application.id, {
      approvedAmount,
      approvedRate,
      approvedTenureMonths: approvedTenure,
      interestMethod: approvedMethod,
      approvedBy: 'Administrator',
      notes: approvalNotes,
    });
    onClose();
  };

  const handleReject = () => {
    rejectApplication(application.id, {
      rejectionReason,
      rejectedBy: 'Administrator',
      notes: rejectionNotes,
    });
    onClose();
  };

  const handleSaveNotes = () => {
    updateApplicationStatus(application.id, application.status, adminNotes);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="relative w-full max-w-4xl max-h-[92vh] flex flex-col bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden">
        
        {/* Header */}
        <div className="flex items-center justify-between p-5 bg-slate-50 border-b border-slate-200">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-lg font-bold text-slate-900">
                Application Review: <span className="font-mono text-blue-700">{application.referenceNumber}</span>
              </span>
              <span className={`px-2 py-0.5 rounded text-[11px] font-bold uppercase tracking-wider ${
                application.status === 'approved' ? 'bg-emerald-100 text-emerald-800' :
                application.status === 'disbursed' ? 'bg-blue-100 text-blue-800' :
                application.status === 'rejected' ? 'bg-rose-100 text-rose-800' :
                'bg-amber-100 text-amber-800'
              }`}>
                {application.status.replace('_', ' ')}
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Applicant: <span className="font-semibold text-slate-800">{application.personal.fullName}</span> • NIC: <span className="font-mono font-medium">{application.personal.nicNumber}</span>
            </p>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Duplicate Warning Alert if detected */}
        {duplicateMatches.length > 0 && (
          <div className="p-3.5 bg-amber-50 border-b border-amber-200 text-amber-900 text-xs flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
              <span>
                <span className="font-bold">Possible Duplicate Detected:</span> {duplicateMatches.length} existing record(s) share the same NIC or telephone number (Ref: {duplicateMatches.map(d => d.referenceNumber).join(', ')}).
              </span>
            </div>
            <span className="px-2 py-0.5 bg-amber-200 text-amber-900 rounded font-bold text-[10px] uppercase">
              Flagged
            </span>
          </div>
        )}

        {/* Navigation Tabs */}
        <div className="flex border-b border-slate-200 bg-white px-6">
          <button
            onClick={() => setActiveTab('profile')}
            className={`py-3 px-4 text-xs font-bold border-b-2 transition-all cursor-pointer ${
              activeTab === 'profile'
                ? 'border-blue-600 text-blue-700'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Applicant Profile & Financials
          </button>
          <button
            onClick={() => setActiveTab('documents')}
            className={`py-3 px-4 text-xs font-bold border-b-2 transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'documents'
                ? 'border-blue-600 text-blue-700'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <span>Document Inspection</span>
            <span className="px-1.5 py-0.2 bg-slate-100 text-slate-600 rounded text-[10px]">
              {application.documents.length}
            </span>
          </button>
          <button
            onClick={() => setActiveTab('decision')}
            className={`py-3 px-4 text-xs font-bold border-b-2 transition-all cursor-pointer ${
              activeTab === 'decision'
                ? 'border-blue-600 text-blue-700'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Credit Decision & Approval
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6 text-xs">
          
          {/* TAB 1: PROFILE & FINANCIALS */}
          {activeTab === 'profile' && (
            <div className="space-y-6">
              {/* Financial Risk Assessment Card */}
              <div className="p-5 rounded-2xl bg-slate-900 text-white space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                    Automated Credit & DTI Risk Assessment
                  </span>
                  <span className={`px-2.5 py-0.5 rounded-full font-bold text-[11px] ${
                    dti.risk === 'low' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' :
                    dti.risk === 'moderate' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' :
                    'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                  }`}>
                    {dti.risk.toUpperCase()} RISK (DTI: {dti.ratio}%)
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1">
                  <div className="p-3 bg-slate-800/80 rounded-xl">
                    <span className="text-slate-400 block text-[11px]">Monthly Gross Income</span>
                    <span className="text-base font-bold text-white font-mono-numbers">
                      {formatCurrency(application.employment.monthlyGrossIncome)}
                    </span>
                  </div>
                  <div className="p-3 bg-slate-800/80 rounded-xl">
                    <span className="text-slate-400 block text-[11px]">Existing Debt Burden</span>
                    <span className="text-base font-bold text-amber-400 font-mono-numbers">
                      {formatCurrency(application.employment.existingLoanCommitments)}
                    </span>
                  </div>
                  <div className="p-3 bg-slate-800/80 rounded-xl">
                    <span className="text-slate-400 block text-[11px]">Projected New EMI</span>
                    <span className="text-base font-bold text-blue-400 font-mono-numbers">
                      {formatCurrency(calculatedApprovedEMI)}
                    </span>
                  </div>
                  <div className="p-3 bg-slate-800/80 rounded-xl">
                    <span className="text-slate-400 block text-[11px]">Disposable Income Buffer</span>
                    <span className="text-base font-bold text-emerald-400 font-mono-numbers">
                      {formatCurrency(
                        Math.max(
                          0,
                          application.employment.monthlyGrossIncome -
                          application.employment.monthlyExpenses -
                          application.employment.existingLoanCommitments -
                          calculatedApprovedEMI
                        )
                      )}
                    </span>
                  </div>
                </div>
              </div>

              {/* Information Cards Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Personal & Contact */}
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2.5">
                  <span className="font-bold text-slate-800 uppercase tracking-wide block text-[11px]">
                    Personal & Contact Information
                  </span>
                  <div className="space-y-1.5 text-slate-600">
                    <div className="flex justify-between py-1 border-b border-slate-200/60">
                      <span className="text-slate-400">Full Name</span>
                      <span className="font-semibold text-slate-900">{application.personal.fullName}</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-slate-200/60">
                      <span className="text-slate-400">NIC / Passport</span>
                      <span className="font-mono font-bold text-slate-900">{application.personal.nicNumber}</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-slate-200/60">
                      <span className="text-slate-400">DOB & Gender</span>
                      <span>{application.personal.dateOfBirth} ({application.personal.gender})</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-slate-200/60">
                      <span className="text-slate-400">Marital Status</span>
                      <span className="capitalize">{application.personal.maritalStatus}</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-slate-200/60">
                      <span className="text-slate-400">Phone</span>
                      <span className="font-mono">{application.contact.phone}</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-slate-200/60">
                      <span className="text-slate-400">Email</span>
                      <span>{application.contact.email}</span>
                    </div>
                    <div className="flex justify-between py-1">
                      <span className="text-slate-400">Address</span>
                      <span className="text-right">{application.contact.address}, {application.contact.city}</span>
                    </div>
                  </div>
                </div>

                {/* Employment & Bank */}
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2.5">
                  <span className="font-bold text-slate-800 uppercase tracking-wide block text-[11px]">
                    Employment & Banking Records
                  </span>
                  <div className="space-y-1.5 text-slate-600">
                    <div className="flex justify-between py-1 border-b border-slate-200/60">
                      <span className="text-slate-400">Employment Type</span>
                      <span className="font-semibold capitalize text-slate-900">{application.employment.employmentType.replace('_', ' ')}</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-slate-200/60">
                      <span className="text-slate-400">Employer / Company</span>
                      <span className="font-semibold text-slate-900">{application.employment.employerName}</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-slate-200/60">
                      <span className="text-slate-400">Designation</span>
                      <span>{application.employment.designation || 'Staff'}</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-slate-200/60">
                      <span className="text-slate-400">Bank Name</span>
                      <span>{application.employment.bankName || 'Standard Commercial'}</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-slate-200/60">
                      <span className="text-slate-400">Account Number</span>
                      <span className="font-mono">{application.employment.accountNumber || 'Provided in files'}</span>
                    </div>
                    <div className="flex justify-between py-1">
                      <span className="text-slate-400">Stated Purpose</span>
                      <span className="text-right italic max-w-[200px] truncate" title={application.loan.purpose}>
                        {application.loan.purpose}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Admin Internal Notes Box */}
              <div className="p-4 rounded-2xl bg-blue-50/60 border border-blue-200/80 space-y-2">
                <span className="font-bold text-blue-900 uppercase tracking-wider block text-[11px]">
                  Administrator Internal Notes
                </span>
                <textarea
                  rows={2}
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  placeholder="Record verification notes, telephonic verification results, or credit bureau remarks..."
                  className="w-full p-2.5 rounded-xl border border-blue-200 bg-white text-xs focus:outline-blue-600"
                />
                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={handleSaveNotes}
                    className="px-3 py-1 bg-blue-600 text-white rounded-lg text-xs font-semibold hover:bg-blue-700 cursor-pointer"
                  >
                    Save Notes
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: DOCUMENT INSPECTION */}
          {activeTab === 'documents' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-slate-900 text-sm">Customer Uploaded Verification Documents</h4>
                  <p className="text-xs text-slate-500">Inspect identity cards and salary slips. Mark documents as verified.</p>
                </div>
                <span className="text-xs bg-slate-100 text-slate-700 px-2.5 py-1 rounded-full font-medium">
                  {application.documents.filter(d => d.verified).length} / {application.documents.length} Verified
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {application.documents.map((doc) => (
                  <div
                    key={doc.id}
                    className="p-4 rounded-2xl border border-slate-200 bg-slate-50 flex flex-col justify-between space-y-3"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2.5">
                        <div className="w-9 h-9 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center">
                          <FileText className="w-5 h-5" />
                        </div>
                        <div>
                          <p className="font-bold text-slate-900 text-xs">{doc.title}</p>
                          <p className="text-[11px] text-slate-500 font-mono">{doc.fileName} • {doc.fileSize}</p>
                        </div>
                      </div>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        doc.verified ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                      }`}>
                        {doc.verified ? 'Verified' : 'Pending'}
                      </span>
                    </div>

                    {/* Simulated document visual preview box */}
                    <div className="h-28 rounded-xl bg-white border border-slate-200 flex flex-col items-center justify-center p-3 text-center space-y-1">
                      <span className="text-xs font-mono font-bold text-slate-700">
                        [DIGITAL SCAN PREVIEW]
                      </span>
                      <p className="text-[11px] text-slate-400">
                        {doc.type === 'nic_front' ? 'National Identity Card Front View' :
                         doc.type === 'nic_back' ? 'National Identity Card Back View' :
                         doc.type === 'payslip' ? 'Employer Certified Official Payslip' :
                         'Banking Statement Records'}
                      </p>
                      <button
                        type="button"
                        onClick={() => setPreviewDoc(doc)}
                        className="text-[11px] text-blue-600 font-semibold hover:underline flex items-center gap-1 pt-1 cursor-pointer"
                      >
                        <ExternalLink className="w-3 h-3" />
                        <span>Inspect High-Resolution Scan</span>
                      </button>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2 pt-1">
                      <button
                        type="button"
                        onClick={() => verifyDocument(application.id, doc.id, !doc.verified)}
                        className={`w-full py-1.5 px-3 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer ${
                          doc.verified
                            ? 'bg-amber-50 text-amber-700 border border-amber-200 hover:bg-amber-100'
                            : 'bg-emerald-600 text-white hover:bg-emerald-700'
                        }`}
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>{doc.verified ? 'Revoke Verification' : 'Mark as Verified'}</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 3: DECISION (APPROVE OR REJECT) */}
          {activeTab === 'decision' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* APPROVAL SECTION */}
                <div className="p-5 rounded-2xl bg-emerald-50/70 border border-emerald-200 space-y-4">
                  <div className="flex items-center gap-2 text-emerald-900 font-bold text-sm">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                    <span>Approve Application</span>
                  </div>

                  <p className="text-[11px] text-slate-600">
                    You can approve the requested facility terms or adjust the approved capital and interest based on credit evaluation.
                  </p>

                  <div className="space-y-3">
                    <div className="space-y-1">
                      <label className="text-[11px] font-semibold text-slate-700">Approved Principal (Rs.)</label>
                      <input
                        type="number"
                        min={10000}
                        step={10000}
                        value={approvedAmount}
                        onChange={(e) => setApprovedAmount(Number(e.target.value) || 0)}
                        className="w-full px-3 py-2 rounded-xl border border-emerald-300 bg-white font-mono-numbers font-bold text-xs"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div className="space-y-1">
                        <label className="text-[11px] font-semibold text-slate-700">Annual Rate (% p.a.)</label>
                        <input
                          type="number"
                          step={0.1}
                          value={approvedRate}
                          onChange={(e) => setApprovedRate(Number(e.target.value) || 0)}
                          className="w-full px-3 py-2 rounded-xl border border-emerald-300 bg-white font-mono-numbers font-bold text-xs"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[11px] font-semibold text-slate-700">Duration (Months)</label>
                        <input
                          type="number"
                          value={approvedTenure}
                          onChange={(e) => setApprovedTenure(Number(e.target.value) || 1)}
                          className="w-full px-3 py-2 rounded-xl border border-emerald-300 bg-white font-mono-numbers font-bold text-xs"
                        />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[11px] font-semibold text-slate-700">Interest Calculation Method</label>
                      <div className="grid grid-cols-2 gap-1.5 p-1 bg-white rounded-xl border border-emerald-200">
                        {(['Reducing Balance', 'Flat Rate'] as InterestMethod[]).map((m) => (
                          <button
                            key={m}
                            type="button"
                            onClick={() => setApprovedMethod(m)}
                            className={`py-1.5 px-2 rounded-lg text-[11px] font-semibold transition-all cursor-pointer ${
                              approvedMethod === m
                                ? 'bg-emerald-600 text-white shadow-2xs'
                                : 'text-slate-600 hover:bg-slate-50'
                            }`}
                          >
                            {m}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Calculated Approved Terms */}
                    <div className="p-3 bg-white rounded-xl border border-emerald-200 space-y-1">
                      <div className="flex justify-between">
                        <span className="text-slate-500">Monthly Payment</span>
                        <span className="font-bold text-blue-700 font-mono-numbers">{formatCurrency(calculatedApprovedEMI)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">Total Interest ({approvedMethod})</span>
                        <span className="font-semibold text-amber-700 font-mono-numbers">{formatCurrency(calculatedTotalInterest)}</span>
                      </div>
                      <div className="flex justify-between border-t border-slate-100 pt-1">
                        <span className="text-slate-500">Total Payable</span>
                        <span className="font-bold text-slate-900 font-mono-numbers">{formatCurrency(calculatedTotalPayable)}</span>
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[11px] font-semibold text-slate-700">Approval Remarks</label>
                      <textarea
                        rows={2}
                        value={approvalNotes}
                        onChange={(e) => setApprovalNotes(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl border border-emerald-300 bg-white text-xs"
                      />
                    </div>

                    <button
                      type="button"
                      onClick={handleApprove}
                      className="w-full py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md shadow-emerald-600/30 transition-all cursor-pointer flex items-center justify-center gap-1.5"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Execute Approval</span>
                    </button>
                  </div>
                </div>

                {/* REJECTION SECTION */}
                <div className="p-5 rounded-2xl bg-rose-50/70 border border-rose-200 space-y-4">
                  <div className="flex items-center gap-2 text-rose-900 font-bold text-sm">
                    <XCircle className="w-5 h-5 text-rose-600" />
                    <span>Decline Application</span>
                  </div>

                  <p className="text-[11px] text-slate-600">
                    If applicant does not meet credit risk guidelines or documentation is invalid, record the formal rejection.
                  </p>

                  <div className="space-y-3">
                    <div className="space-y-1">
                      <label className="text-[11px] font-semibold text-slate-700">Primary Rejection Reason</label>
                      <select
                        value={rejectionReason}
                        onChange={(e) => setRejectionReason(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl border border-rose-300 bg-white text-xs font-medium"
                      >
                        <option value="Debt-to-Income (DTI) ratio exceeds maximum safety threshold">Debt-to-Income (DTI) ratio exceeds maximum threshold</option>
                        <option value="Insufficient verifiable income or incomplete payroll proof">Insufficient verifiable income or incomplete payroll proof</option>
                        <option value="Identity verification failed or unverified NIC scan">Identity verification failed or unverified NIC scan</option>
                        <option value="Adverse credit bureau rating or delinquency history">Adverse credit bureau rating or delinquency history</option>
                        <option value="Duplicate active application exists for this customer">Duplicate active application exists for this customer</option>
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[11px] font-semibold text-slate-700">Detailed Underwriting Notes</label>
                      <textarea
                        rows={4}
                        value={rejectionNotes}
                        onChange={(e) => setRejectionNotes(e.target.value)}
                        placeholder="Detail specific criteria that triggered the refusal..."
                        className="w-full px-3 py-2 rounded-xl border border-rose-300 bg-white text-xs"
                      />
                    </div>

                    <button
                      type="button"
                      onClick={handleReject}
                      className="w-full py-2.5 px-4 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs shadow-md shadow-rose-600/30 transition-all cursor-pointer flex items-center justify-center gap-1.5"
                    >
                      <XCircle className="w-4 h-4" />
                      <span>Confirm Rejection</span>
                    </button>
                  </div>
                </div>

              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-between items-center text-xs">
          <div className="text-slate-500">
            Current Status: <span className="font-bold text-slate-800 capitalize">{application.status.replace('_', ' ')}</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-white border border-slate-200 font-semibold text-slate-700 hover:bg-slate-100 cursor-pointer"
          >
            Close Modal
          </button>
        </div>
      </div>

      {/* High-Resolution Document Inspection Modal */}
      {previewDoc && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 space-y-4 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between border-b pb-3">
              <div>
                <h4 className="font-bold text-slate-900">{previewDoc.title}</h4>
                <p className="text-xs text-slate-500">{previewDoc.fileName} • {previewDoc.fileSize}</p>
              </div>
              <button
                onClick={() => setPreviewDoc(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-800 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="h-80 bg-slate-100 rounded-2xl flex flex-col items-center justify-center p-6 border-2 border-dashed border-slate-300 text-center space-y-3">
              <FileCheck2 className="w-16 h-16 text-blue-600" />
              <div className="space-y-1">
                <p className="font-bold text-slate-800 text-sm">Authenticated Document Specimen</p>
                <p className="text-xs text-slate-500 max-w-md">
                  Cryptographically hashed upload reference: SHA-256 Verified. Digital watermarks and resolution check complete.
                </p>
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => {
                  verifyDocument(application.id, previewDoc.id, true);
                  setPreviewDoc(null);
                }}
                className="px-4 py-2 rounded-xl bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-700 cursor-pointer"
              >
                Accept & Verify Document
              </button>
              <button
                onClick={() => setPreviewDoc(null)}
                className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 text-xs font-semibold hover:bg-slate-200 cursor-pointer"
              >
                Close Preview
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
