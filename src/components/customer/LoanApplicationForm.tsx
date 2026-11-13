import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import { 
  FileText, 
  User, 
  Phone, 
  Briefcase, 
  DollarSign, 
  UploadCloud, 
  CheckCircle2, 
  ArrowRight, 
  ArrowLeft, 
  ShieldCheck, 
  AlertCircle,
  Copy,
  Check,
  FileCheck2,
  Trash2,
  Eye,
  Info
} from 'lucide-react';
import { useLoanContext } from '../../context/LoanContext';
import { 
  CustomerPersonalDetails, 
  CustomerContactDetails, 
  CustomerEmploymentDetails, 
  CustomerLoanDetails, 
  UploadedDocument, 
  LoanCategory,
  LoanApplication,
  InterestMethod
} from '../../types/loan';
import { LOAN_PRODUCTS } from '../../data/loanProducts';
import { calculateLoanSummary, calculateDTI, formatCurrency } from '../../utils/loanCalculations';

interface LoanApplicationFormProps {
  initialValues?: {
    category?: LoanCategory;
    amount?: number;
    tenure?: number;
    method?: InterestMethod;
    rate?: number;
  };
  onApplicationSubmitted: (referenceNumber: string, nic: string) => void;
}

export const LoanApplicationForm: React.FC<LoanApplicationFormProps> = ({
  initialValues,
  onApplicationSubmitted,
}) => {
  const { submitApplication } = useLoanContext();

  const [currentStep, setCurrentStep] = useState<number>(1);
  const [copied, setCopied] = useState<boolean>(false);
  const [submittedApp, setSubmittedApp] = useState<LoanApplication | null>(null);

  // Form State
  const [personal, setPersonal] = useState<CustomerPersonalDetails>({
    fullName: '',
    nicNumber: '',
    dateOfBirth: '1995-05-15',
    gender: 'male',
    maritalStatus: 'single',
  });

  const [contact, setContact] = useState<CustomerContactDetails>({
    phone: '',
    email: '',
    address: '',
    city: '',
    postalCode: '',
    residenceStatus: 'owned',
  });

  const [employment, setEmployment] = useState<CustomerEmploymentDetails>({
    employmentType: 'salaried',
    employerName: '',
    designation: '',
    monthlyGrossIncome: 145000,
    monthlyExpenses: 45000,
    existingLoanCommitments: 0,
    bankName: '',
    accountNumber: '',
  });

  const initialCategory = initialValues?.category || 'personal';
  const initialProd = LOAN_PRODUCTS.find(p => p.id === initialCategory) || LOAN_PRODUCTS[0];

  const [loan, setLoan] = useState<CustomerLoanDetails>({
    loanType: initialCategory,
    requestedAmount: initialValues?.amount || 500000,
    tenureMonths: initialValues?.tenure || Math.max(initialProd.minTenureMonths, 24),
    purpose: '',
    interestMethod: initialValues?.method || initialProd.defaultMethod,
  });

  const [documents, setDocuments] = useState<UploadedDocument[]>([
    {
      id: 'doc-nic-f',
      type: 'nic_front',
      title: 'NIC / Identity Card (Front View)',
      fileName: 'NIC_Front_Scan.jpg',
      fileSize: '1.4 MB',
      uploadDate: new Date().toISOString().split('T')[0],
      verified: false,
    },
    {
      id: 'doc-nic-b',
      type: 'nic_back',
      title: 'NIC / Identity Card (Back View)',
      fileName: 'NIC_Back_Scan.jpg',
      fileSize: '1.2 MB',
      uploadDate: new Date().toISOString().split('T')[0],
      verified: false,
    },
    {
      id: 'doc-pay',
      type: 'payslip',
      title: 'Recent Salary Slip / Proof of Income',
      fileName: 'Payslip_Recent.pdf',
      fileSize: '750 KB',
      uploadDate: new Date().toISOString().split('T')[0],
      verified: false,
    },
  ]);

  const [declarationAccepted, setDeclarationAccepted] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const selectedProduct = LOAN_PRODUCTS.find(p => p.id === loan.loanType) || LOAN_PRODUCTS[0];
  const effectiveInterestMethod: InterestMethod = loan.interestMethod || selectedProduct.defaultMethod;
  const loanSummary = calculateLoanSummary(
    loan.requestedAmount,
    selectedProduct.defaultAnnualRate,
    loan.tenureMonths,
    effectiveInterestMethod
  );
  const estimatedEMI = loanSummary.monthlyInstallment;
  const dtiAnalysis = calculateDTI(employment.monthlyGrossIncome, employment.existingLoanCommitments, estimatedEMI);

  // File Upload Simulator
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, docType: UploadedDocument['type']) => {
    const files = e.target.files;
    if (files && files[0]) {
      const file = files[0];
      const newDoc: UploadedDocument = {
        id: `doc-${Date.now()}`,
        type: docType,
        title: file.name.replace(/\.[^/.]+$/, ''),
        fileName: file.name,
        fileSize: `${(file.size / (1024 * 1024)).toFixed(1)} MB`,
        uploadDate: new Date().toISOString().split('T')[0],
        verified: false,
      };

      setDocuments(prev => [...prev.filter(d => d.type !== docType), newDoc]);
    }
  };

  const removeDoc = (docId: string) => {
    setDocuments(prev => prev.filter(d => d.id !== docId));
  };

  const validateStep = (step: number): boolean => {
    setErrorMsg(null);
    if (step === 1) {
      if (!personal.fullName.trim()) {
        setErrorMsg('Please enter your full legal name as per your ID.');
        return false;
      }
      if (!personal.nicNumber.trim()) {
        setErrorMsg('Please enter your National Identity Card (NIC) or Passport number.');
        return false;
      }
    } else if (step === 2) {
      if (!contact.phone.trim()) {
        setErrorMsg('Please provide a valid primary contact phone number.');
        return false;
      }
      if (!contact.email.trim() || !contact.email.includes('@')) {
        setErrorMsg('Please provide a valid email address.');
        return false;
      }
      if (!contact.address.trim()) {
        setErrorMsg('Please enter your residential street address.');
        return false;
      }
    } else if (step === 3) {
      if (!employment.employerName.trim()) {
        setErrorMsg('Please enter your employer, business, or organization name.');
        return false;
      }
      if (employment.monthlyGrossIncome <= 0) {
        setErrorMsg('Please enter your verifiable monthly gross income.');
        return false;
      }
    } else if (step === 4) {
      if (loan.requestedAmount < selectedProduct.minAmount || loan.requestedAmount > selectedProduct.maxAmount) {
        setErrorMsg(`Requested amount must be between ${formatCurrency(selectedProduct.minAmount)} and ${formatCurrency(selectedProduct.maxAmount)}.`);
        return false;
      }
      if (loan.tenureMonths < selectedProduct.minTenureMonths || loan.tenureMonths > selectedProduct.maxTenureMonths) {
        setErrorMsg(`Pay back time for ${selectedProduct.name} must be between ${selectedProduct.minTenureMonths} and ${selectedProduct.maxTenureMonths} months.`);
        return false;
      }
      if (!loan.purpose.trim()) {
        setErrorMsg('Please briefly state the primary purpose of the requested loan.');
        return false;
      }
    } else if (step === 5) {
      if (documents.length < 2) {
        setErrorMsg('Please ensure at least your NIC Front and Back (or proof of income) documents are attached.');
        return false;
      }
    }
    return true;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => prev + 1);
      window.scrollTo({ top: 100, behavior: 'smooth' });
    }
  };

  const handleBack = () => {
    setErrorMsg(null);
    setCurrentStep(prev => Math.max(1, prev - 1));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!declarationAccepted) {
      setErrorMsg('Please accept the accuracy declaration and terms before submitting.');
      return;
    }

    const newApp = await submitApplication({
      personal,
      contact,
      employment,
      loan,
      documents,
    });

    setSubmittedApp(newApp);

    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
      });
    } catch (err) {
      // ignore
    }
  };

  const handleCopyRef = () => {
    if (submittedApp) {
      navigator.clipboard.writeText(submittedApp.referenceNumber);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  // SUCCESS SUBMISSION VIEW
  if (submittedApp) {
    return (
      <div className="max-w-2xl mx-auto bg-white rounded-3xl border border-slate-200 p-8 sm:p-12 shadow-xl text-center space-y-8 animate-in fade-in zoom-in-95 duration-300">
        <div className="w-20 h-20 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto ring-8 ring-emerald-50">
          <CheckCircle2 className="w-10 h-10" />
        </div>

        <div className="space-y-3">
          <span className="inline-block px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 text-xs font-bold border border-emerald-200">
            Saved in Database
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Your Loan Application Is Sent!
          </h2>
          <p className="text-slate-600 text-sm max-w-lg mx-auto">
            We gave your request a unique Reference Number and sent it to our loan officer to check.
          </p>
        </div>

        {/* Unique Reference Number Badge */}
        <div className="bg-slate-900 text-white rounded-2xl p-6 sm:p-7 shadow-lg space-y-3 max-w-lg mx-auto">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-widest block">
            Your Reference Number (Save This)
          </span>
          <div className="flex items-center justify-center gap-3">
            <span className="text-3xl sm:text-4xl font-extrabold text-amber-400 font-mono tracking-wider">
              {submittedApp.referenceNumber}
            </span>
            <button
              onClick={handleCopyRef}
              className="p-2.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors cursor-pointer"
              title="Copy Reference ID"
            >
              {copied ? <Check className="w-5 h-5 text-emerald-400" /> : <Copy className="w-5 h-5" />}
            </button>
          </div>
          <p className="text-[12px] text-slate-400">
            Keep this number safe. Use it with your NIC (<span className="text-slate-200 font-mono">{submittedApp.personal.nicNumber}</span>) anytime to check if your loan is approved or make a payment.
          </p>
        </div>

        {/* Key Summary */}
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-5 text-left text-xs space-y-2.5 max-w-lg mx-auto">
          <div className="flex justify-between py-1 border-b border-slate-200/60">
            <span className="text-slate-500">Applicant Name</span>
            <span className="font-semibold text-slate-800">{submittedApp.personal.fullName}</span>
          </div>
          <div className="flex justify-between py-1 border-b border-slate-200/60">
            <span className="text-slate-500">Facility Type</span>
            <span className="font-semibold text-slate-800 capitalize">{submittedApp.loan.loanType} Loan</span>
          </div>
          <div className="flex justify-between py-1 border-b border-slate-200/60">
            <span className="text-slate-500">Requested Amount</span>
            <span className="font-bold text-blue-700 font-mono-numbers">{formatCurrency(submittedApp.loan.requestedAmount)}</span>
          </div>
          <div className="flex justify-between py-1">
            <span className="text-slate-500">Tenure</span>
            <span className="font-semibold text-slate-800">{submittedApp.loan.tenureMonths} Months</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <button
            onClick={() => onApplicationSubmitted(submittedApp.referenceNumber, submittedApp.personal.nicNumber)}
            className="w-full sm:w-auto px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-sm flex items-center justify-center gap-2 shadow-lg shadow-blue-600/30 cursor-pointer"
          >
            <span>Track Application Status Now</span>
            <ArrowRight className="w-4 h-4" />
          </button>
          <button
            onClick={() => {
              setSubmittedApp(null);
              setCurrentStep(1);
            }}
            className="w-full sm:w-auto px-5 py-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-sm transition-colors cursor-pointer"
          >
            Submit Another Application
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Form Header */}
      <div className="text-center space-y-2">
        <span className="text-xs font-bold uppercase tracking-wider text-[#1769E0] block">
          Online Loan Form
        </span>
        <h2 className="text-2xl sm:text-3xl font-bold text-[#102A56] tracking-tight">
          Apply for Your Loan in Simple Steps
        </h2>
        <p className="text-slate-600 text-sm max-w-xl mx-auto">
          No account or password needed. Fill in your details, add your documents, and get your Reference Number right away.
        </p>
      </div>

      {/* Stepper Wizard Indicator */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-2xs">
        <div className="flex items-center justify-between">
          {[
            { step: 1, label: 'About You', icon: User },
            { step: 2, label: 'Contact', icon: Phone },
            { step: 3, label: 'Job & Income', icon: Briefcase },
            { step: 4, label: 'Loan Amount', icon: DollarSign },
            { step: 5, label: 'Documents', icon: UploadCloud },
            { step: 6, label: 'Check & Send', icon: CheckCircle2 },
          ].map((item, idx) => {
            const Icon = item.icon;
            const isDone = currentStep > item.step;
            const isCurrent = currentStep === item.step;
            return (
              <div key={item.step} className="flex-1 flex flex-col items-center relative">
                {idx > 0 && (
                  <div 
                    className={`absolute right-1/2 left-[-50%] top-4 h-0.5 -z-0 transition-all ${
                      isDone ? 'bg-blue-600' : 'bg-slate-200'
                    }`} 
                  />
                )}
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all relative z-10 ${
                    isDone 
                      ? 'bg-blue-600 text-white shadow-xs' 
                      : isCurrent 
                        ? 'bg-blue-100 text-blue-700 border-2 border-blue-600' 
                        : 'bg-slate-100 text-slate-400'
                  }`}
                >
                  {isDone ? <Check className="w-4 h-4" /> : item.step}
                </div>
                <span className={`text-[11px] mt-1.5 font-medium hidden sm:block ${
                  isCurrent ? 'text-blue-700 font-bold' : isDone ? 'text-slate-700' : 'text-slate-400'
                }`}>
                  {item.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Error Alert */}
      {errorMsg && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2.5 animate-in fade-in duration-200">
          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Main Form Body */}
      <form onSubmit={handleSubmit} className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 sm:p-10 space-y-8">
        
        {/* STEP 1: PERSONAL DETAILS */}
        {currentStep === 1 && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div className="border-b border-slate-100 pb-4">
              <h3 className="text-lg font-bold text-slate-900">Step 1: Your Personal Details</h3>
              <p className="text-xs text-slate-500">Enter your full name and NIC number exactly as shown on your ID card</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div className="sm:col-span-2 space-y-1.5">
                <label className="text-xs font-semibold text-slate-700">Full Name (Same as NIC) *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Nimal Perera"
                  value={personal.fullName}
                  onChange={(e) => setPersonal({ ...personal, fullName: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 text-sm text-slate-900 focus:bg-white focus:outline-blue-600"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700">NIC / Passport Number *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 958041289V or 200054812390"
                  value={personal.nicNumber}
                  onChange={(e) => setPersonal({ ...personal, nicNumber: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 text-sm text-slate-900 focus:bg-white focus:outline-blue-600 font-mono"
                />
                <span className="text-[11px] text-slate-400">Used for identity check and status verification</span>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700">Date of Birth *</label>
                <input
                  type="date"
                  required
                  value={personal.dateOfBirth}
                  onChange={(e) => setPersonal({ ...personal, dateOfBirth: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 text-sm text-slate-900 focus:bg-white focus:outline-blue-600"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700">Gender</label>
                <select
                  value={personal.gender}
                  onChange={(e) => setPersonal({ ...personal, gender: e.target.value as any })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 text-sm text-slate-900 focus:bg-white focus:outline-blue-600"
                >
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700">Marital Status</label>
                <select
                  value={personal.maritalStatus}
                  onChange={(e) => setPersonal({ ...personal, maritalStatus: e.target.value as any })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 text-sm text-slate-900 focus:bg-white focus:outline-blue-600"
                >
                  <option value="single">Single</option>
                  <option value="married">Married</option>
                  <option value="divorced">Divorced</option>
                  <option value="widowed">Widowed</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {/* STEP 2: CONTACT & RESIDENCE */}
        {currentStep === 2 && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div className="border-b border-slate-100 pb-4">
              <h3 className="text-lg font-bold text-slate-900">Step 2: Phone, Email & Home Address</h3>
              <p className="text-xs text-slate-500">Where we can reach you and send updates about your loan</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700">Mobile Phone Number *</label>
                <input
                  type="tel"
                  required
                  placeholder="+94 77 123 4567"
                  value={contact.phone}
                  onChange={(e) => setContact({ ...contact, phone: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 text-sm text-slate-900 focus:bg-white focus:outline-blue-600"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700">Email Address *</label>
                <input
                  type="email"
                  required
                  placeholder="name@example.com"
                  value={contact.email}
                  onChange={(e) => setContact({ ...contact, email: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 text-sm text-slate-900 focus:bg-white focus:outline-blue-600"
                />
              </div>

              <div className="sm:col-span-2 space-y-1.5">
                <label className="text-xs font-semibold text-slate-700">Residential Street Address *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 452 Elm Boulevard, Apartment 3"
                  value={contact.address}
                  onChange={(e) => setContact({ ...contact, address: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 text-sm text-slate-900 focus:bg-white focus:outline-blue-600"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700">City / Municipality</label>
                <input
                  type="text"
                  placeholder="e.g. Chicago"
                  value={contact.city}
                  onChange={(e) => setContact({ ...contact, city: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 text-sm text-slate-900 focus:bg-white focus:outline-blue-600"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700">Postal / Zip Code</label>
                <input
                  type="text"
                  placeholder="e.g. 60601"
                  value={contact.postalCode}
                  onChange={(e) => setContact({ ...contact, postalCode: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 text-sm text-slate-900 focus:bg-white focus:outline-blue-600"
                />
              </div>

              <div className="sm:col-span-2 space-y-1.5">
                <label className="text-xs font-semibold text-slate-700">Residential Property Status</label>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { id: 'owned', label: 'Owner Occupied' },
                    { id: 'rented', label: 'Rented' },
                    { id: 'family', label: 'Family Home' },
                  ].map(item => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setContact({ ...contact, residenceStatus: item.id as any })}
                      className={`p-3 rounded-xl border text-xs font-semibold text-center transition-all cursor-pointer ${
                        contact.residenceStatus === item.id
                          ? 'border-blue-600 bg-blue-50 text-blue-700 shadow-2xs'
                          : 'border-slate-200 hover:border-slate-300 text-slate-600'
                      }`}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* STEP 3: EMPLOYMENT & FINANCIALS */}
        {currentStep === 3 && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div className="border-b border-slate-100 pb-4">
              <h3 className="text-lg font-bold text-slate-900">Step 3: Your Job & Monthly Income</h3>
              <p className="text-xs text-slate-500">Helps us check how much monthly payment fits comfortably in your budget</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700">Type of Work</label>
                <select
                  value={employment.employmentType}
                  onChange={(e) => setEmployment({ ...employment, employmentType: e.target.value as any })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 text-sm text-slate-900 focus:bg-white focus:outline-blue-600"
                >
                  <option value="salaried">Monthly Salary Job</option>
                  <option value="business_owner">Business Owner / Shop</option>
                  <option value="self_employed">Self Employed</option>
                  <option value="freelancer">Freelance / Independent Work</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700">Company or Business Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Lanka Holdings / Perera Stores"
                  value={employment.employerName}
                  onChange={(e) => setEmployment({ ...employment, employerName: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 text-sm text-slate-900 focus:bg-white focus:outline-blue-600"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700">Job Title / Role</label>
                <input
                  type="text"
                  placeholder="e.g. Operations Specialist"
                  value={employment.designation}
                  onChange={(e) => setEmployment({ ...employment, designation: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 text-sm text-slate-900 focus:bg-white focus:outline-blue-600"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700">Monthly Gross Income (Rs.) *</label>
                <input
                  type="number"
                  min={15000}
                  step={5000}
                  required
                  value={employment.monthlyGrossIncome}
                  onChange={(e) => setEmployment({ ...employment, monthlyGrossIncome: Number(e.target.value) || 0 })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 text-sm text-slate-900 focus:bg-white focus:outline-blue-600 font-mono-numbers"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700">Monthly Living Expenses (Rs.)</label>
                <input
                  type="number"
                  min={0}
                  step={1000}
                  value={employment.monthlyExpenses}
                  onChange={(e) => setEmployment({ ...employment, monthlyExpenses: Number(e.target.value) || 0 })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 text-sm text-slate-900 focus:bg-white focus:outline-blue-600 font-mono-numbers"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700">Existing Monthly Loan Commitments (Rs.)</label>
                <input
                  type="number"
                  min={0}
                  step={1000}
                  value={employment.existingLoanCommitments}
                  onChange={(e) => setEmployment({ ...employment, existingLoanCommitments: Number(e.target.value) || 0 })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 text-sm text-slate-900 focus:bg-white focus:outline-blue-600 font-mono-numbers"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700">Disbursement Bank Name</label>
                <input
                  type="text"
                  placeholder="e.g. Commercial Bank of Ceylon / HNB / Sampath Bank"
                  value={employment.bankName}
                  onChange={(e) => setEmployment({ ...employment, bankName: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 text-sm text-slate-900 focus:bg-white focus:outline-blue-600"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700">Account Number</label>
                <input
                  type="text"
                  placeholder="e.g. 1029384756"
                  value={employment.accountNumber}
                  onChange={(e) => setEmployment({ ...employment, accountNumber: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 text-sm text-slate-900 focus:bg-white focus:outline-blue-600 font-mono"
                />
              </div>
            </div>
          </div>
        )}

        {/* STEP 4: LOAN DETAILS */}
        {currentStep === 4 && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div className="border-b border-slate-100 pb-4">
              <h3 className="text-lg font-bold text-slate-900">Step 4: Choose Your Loan & Amount</h3>
              <p className="text-xs text-slate-500">Pick how much you want to borrow, for how many months, and why you need it</p>
            </div>

            <div className="space-y-5">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700">Pick Loan Type</label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {LOAN_PRODUCTS.map((prod) => (
                    <button
                      key={prod.id}
                      type="button"
                      onClick={() => {
                        const clampedAmount = Math.min(prod.maxAmount, Math.max(prod.minAmount, loan.requestedAmount));
                        const clampedTenure = Math.min(prod.maxTenureMonths, Math.max(prod.minTenureMonths, loan.tenureMonths));
                        setLoan({
                          ...loan,
                          loanType: prod.id,
                          requestedAmount: clampedAmount,
                          tenureMonths: clampedTenure,
                          interestMethod: prod.defaultMethod,
                        });
                      }}
                      className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                        loan.loanType === prod.id
                          ? 'border-blue-600 bg-blue-50/80 text-blue-900 font-semibold shadow-2xs'
                          : 'border-slate-200 hover:border-slate-300 text-slate-700'
                      }`}
                    >
                      <span className="text-xs block font-bold">{prod.name}</span>
                      <span className="text-[11px] text-slate-500 font-mono-numbers">
                        {prod.defaultAnnualRate}% · {prod.defaultMethod === 'Flat Rate' ? 'Flat' : 'Reducing'}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 pt-2">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-700">Requested Amount (Rs.) *</label>
                  <input
                    type="number"
                    min={selectedProduct.minAmount}
                    max={selectedProduct.maxAmount}
                    step={5000}
                    required
                    value={loan.requestedAmount}
                    onChange={(e) => setLoan({ ...loan, requestedAmount: Number(e.target.value) || 0 })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 text-sm text-slate-900 focus:bg-white focus:outline-blue-600 font-mono-numbers"
                  />
                  <div className="flex justify-between text-[11px] text-slate-400 font-mono-numbers">
                    <span>Min: {formatCurrency(selectedProduct.minAmount)}</span>
                    <span>Max: {formatCurrency(selectedProduct.maxAmount)}</span>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-700">Pay Back Time (Months) *</label>
                  <select
                    value={loan.tenureMonths}
                    onChange={(e) => setLoan({ ...loan, tenureMonths: Number(e.target.value) })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 text-sm text-slate-900 focus:bg-white focus:outline-blue-600 font-mono-numbers"
                  >
                    {Array.from(
                      new Set([
                        selectedProduct.minTenureMonths,
                        ...[3, 6, 9, 12, 18, 24, 36, 48, 60, 72].filter(
                          (m) => m >= selectedProduct.minTenureMonths && m <= selectedProduct.maxTenureMonths
                        ),
                        loan.tenureMonths >= selectedProduct.minTenureMonths && loan.tenureMonths <= selectedProduct.maxTenureMonths
                          ? loan.tenureMonths
                          : selectedProduct.minTenureMonths,
                      ])
                    )
                      .sort((a, b) => a - b)
                      .map((m) => (
                        <option key={m} value={m}>
                          {m} Months ({Math.round((m / 12) * 10) / 10} {m === 12 ? 'Year' : 'Years'})
                        </option>
                      ))}
                  </select>
                </div>

                <div className="sm:col-span-2 space-y-1.5">
                  <label className="text-xs font-semibold text-slate-700">How Interest Is Counted</label>
                  <div className="grid grid-cols-2 gap-2 p-1 bg-slate-100 rounded-xl">
                    {(['Reducing Balance', 'Flat Rate'] as InterestMethod[]).map((m) => (
                      <button
                        key={m}
                        type="button"
                        onClick={() => setLoan({ ...loan, interestMethod: m })}
                        className={`py-2 px-3 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                          effectiveInterestMethod === m
                            ? 'bg-white text-blue-700 shadow-2xs'
                            : 'text-slate-600 hover:text-slate-900'
                        }`}
                      >
                        {m === 'Reducing Balance' ? 'Reducing Balance (Lower Interest)' : 'Flat Rate (Fixed Interest)'}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="sm:col-span-2 space-y-1.5">
                  <label className="text-xs font-semibold text-slate-700">Purpose of Loan *</label>
                  <textarea
                    rows={3}
                    required
                    placeholder="Briefly describe how the loan funds will be utilized..."
                    value={loan.purpose}
                    onChange={(e) => setLoan({ ...loan, purpose: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 text-sm text-slate-900 focus:bg-white focus:outline-blue-600"
                  />
                </div>
              </div>

              {/* Instant calculation preview box */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 grid grid-cols-1 sm:grid-cols-3 gap-3 items-center">
                <div>
                  <span className="text-xs text-slate-500 font-medium">Est. Monthly Payment</span>
                  <p className="text-xl font-bold text-blue-700 font-mono-numbers">{formatCurrency(estimatedEMI)}</p>
                </div>
                <div>
                  <span className="text-xs text-slate-500 font-medium">Total Interest ({effectiveInterestMethod})</span>
                  <p className="text-sm font-bold text-slate-800 font-mono-numbers">{formatCurrency(loanSummary.totalInterest)}</p>
                </div>
                <div className="sm:text-right">
                  <span className="text-xs text-slate-500 font-medium">Total Payback · Rate</span>
                  <p className="text-sm font-bold text-slate-800 font-mono-numbers">
                    {formatCurrency(loanSummary.totalPayable)} ({selectedProduct.defaultAnnualRate}%)
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* STEP 5: DOCUMENT UPLOAD */}
        {currentStep === 5 && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div className="border-b border-slate-100 pb-4">
              <h3 className="text-lg font-bold text-slate-900">Step 5: Add Your Documents</h3>
              <p className="text-xs text-slate-500">Upload clear photos or PDFs of your NIC and salary slip or income proof</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* NIC Front */}
              <div className="p-4 rounded-2xl border-2 border-dashed border-slate-200 hover:border-blue-400 bg-slate-50/50 transition-colors space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-800">NIC Card (Front Side) *</span>
                  <span className="text-[10px] text-blue-600 bg-blue-50 px-2 py-0.5 rounded font-medium">Required</span>
                </div>
                <p className="text-[11px] text-slate-500">Ensure photograph and NIC number are clearly legible.</p>
                <label className="flex items-center justify-center gap-2 p-3 rounded-xl bg-white border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-100 cursor-pointer shadow-2xs">
                  <UploadCloud className="w-4 h-4 text-blue-600" />
                  <span>Choose Front Photo / PDF</span>
                  <input
                    type="file"
                    accept="image/*,.pdf"
                    className="hidden"
                    onChange={(e) => handleFileUpload(e, 'nic_front')}
                  />
                </label>
              </div>

              {/* NIC Back */}
              <div className="p-4 rounded-2xl border-2 border-dashed border-slate-200 hover:border-blue-400 bg-slate-50/50 transition-colors space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-800">NIC Card (Back Side) *</span>
                  <span className="text-[10px] text-blue-600 bg-blue-50 px-2 py-0.5 rounded font-medium">Required</span>
                </div>
                <p className="text-[11px] text-slate-500">Showing barcode or address stamp.</p>
                <label className="flex items-center justify-center gap-2 p-3 rounded-xl bg-white border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-100 cursor-pointer shadow-2xs">
                  <UploadCloud className="w-4 h-4 text-blue-600" />
                  <span>Choose Back Photo / PDF</span>
                  <input
                    type="file"
                    accept="image/*,.pdf"
                    className="hidden"
                    onChange={(e) => handleFileUpload(e, 'nic_back')}
                  />
                </label>
              </div>

              {/* Salary Slip */}
              <div className="p-4 rounded-2xl border-2 border-dashed border-slate-200 hover:border-blue-400 bg-slate-50/50 transition-colors space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-800">Proof of Income / Salary Slip *</span>
                  <span className="text-[10px] text-blue-600 bg-blue-50 px-2 py-0.5 rounded font-medium">Required</span>
                </div>
                <p className="text-[11px] text-slate-500">Last 1 to 3 months paystub, tax return, or trade audit.</p>
                <label className="flex items-center justify-center gap-2 p-3 rounded-xl bg-white border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-100 cursor-pointer shadow-2xs">
                  <UploadCloud className="w-4 h-4 text-blue-600" />
                  <span>Upload Income Proof</span>
                  <input
                    type="file"
                    accept="image/*,.pdf"
                    className="hidden"
                    onChange={(e) => handleFileUpload(e, 'payslip')}
                  />
                </label>
              </div>

              {/* Bank Statement */}
              <div className="p-4 rounded-2xl border-2 border-dashed border-slate-200 hover:border-blue-400 bg-slate-50/50 transition-colors space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-800">Bank Statement / Utility Bill</span>
                  <span className="text-[10px] text-slate-500 bg-slate-100 px-2 py-0.5 rounded font-medium">Optional</span>
                </div>
                <p className="text-[11px] text-slate-500">Shows residency proof and account stability.</p>
                <label className="flex items-center justify-center gap-2 p-3 rounded-xl bg-white border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-100 cursor-pointer shadow-2xs">
                  <UploadCloud className="w-4 h-4 text-blue-600" />
                  <span>Upload Bank / Utility File</span>
                  <input
                    type="file"
                    accept="image/*,.pdf"
                    className="hidden"
                    onChange={(e) => handleFileUpload(e, 'bank_statement')}
                  />
                </label>
              </div>
            </div>

            {/* Currently Attached Documents List */}
            <div className="space-y-3 pt-3">
              <span className="text-xs font-bold text-slate-700 uppercase tracking-wide">
                Attached Supporting Files ({documents.length})
              </span>
              <div className="space-y-2">
                {documents.map((doc) => (
                  <div
                    key={doc.id}
                    className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center">
                        <FileCheck2 className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="font-semibold text-slate-800">{doc.title}</p>
                        <p className="text-[11px] text-slate-500">{doc.fileName} • {doc.fileSize}</p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeDoc(doc.id)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors cursor-pointer"
                      title="Remove file"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* STEP 6: REVIEW & DECLARATION */}
        {currentStep === 6 && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div className="border-b border-slate-100 pb-4">
              <h3 className="text-lg font-bold text-slate-900">Step 6: Check Everything & Send</h3>
              <p className="text-xs text-slate-500">Make sure your details are correct before submitting your application</p>
            </div>

            {/* Review Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              {/* Personal Details */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                <span className="font-bold text-slate-800 uppercase tracking-wider block text-[11px]">
                  Your Details
                </span>
                <div className="space-y-1 text-slate-600">
                  <p><span className="text-slate-400">Name:</span> {personal.fullName}</p>
                  <p><span className="text-slate-400">NIC/ID:</span> <span className="font-mono">{personal.nicNumber}</span></p>
                  <p><span className="text-slate-400">DOB:</span> {personal.dateOfBirth} ({personal.gender})</p>
                  <p><span className="text-slate-400">Phone:</span> {contact.phone}</p>
                  <p><span className="text-slate-400">Email:</span> {contact.email}</p>
                </div>
              </div>

              {/* Loan & Repayment Specs */}
              <div className="p-4 rounded-2xl bg-blue-50/70 border border-blue-200 space-y-2">
                <span className="font-bold text-blue-900 uppercase tracking-wider block text-[11px]">
                  Loan You Asked For
                </span>
                <div className="space-y-1 text-slate-700">
                  <p><span className="text-slate-500">Loan Type:</span> <span className="font-semibold">{selectedProduct.name}</span></p>
                  <p><span className="text-slate-500">Amount:</span> <span className="font-bold font-mono-numbers text-blue-700">{formatCurrency(loan.requestedAmount)}</span></p>
                  <p><span className="text-slate-500">Pay Back Time:</span> {loan.tenureMonths} Months</p>
                  <p><span className="text-slate-500">Interest Method:</span> {effectiveInterestMethod} ({selectedProduct.defaultAnnualRate}% yearly)</p>
                  <p><span className="text-slate-500">Est. Monthly Payment:</span> <span className="font-bold font-mono-numbers">{formatCurrency(estimatedEMI)}/mo</span></p>
                  <p><span className="text-slate-500">Total Payback (Est.):</span> <span className="font-semibold font-mono-numbers">{formatCurrency(loanSummary.totalPayable)}</span></p>
                </div>
              </div>

              {/* Financial & DTI Ratio Analysis */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                <span className="font-bold text-slate-800 uppercase tracking-wider block text-[11px]">
                  Income & Budget Check
                </span>
                <div className="space-y-1 text-slate-600">
                  <p><span className="text-slate-400">Workplace:</span> {employment.employerName}</p>
                  <p><span className="text-slate-400">Monthly Income:</span> {formatCurrency(employment.monthlyGrossIncome)}/mo</p>
                  <p><span className="text-slate-400">Other Loan Payments:</span> {formatCurrency(employment.existingLoanCommitments)}/mo</p>
                  <div className="pt-1 flex items-center gap-2">
                    <span className="text-slate-400">Monthly Debt Share:</span>
                    <span className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                      dtiAnalysis.risk === 'low' 
                        ? 'bg-emerald-100 text-emerald-800' 
                        : dtiAnalysis.risk === 'moderate' 
                          ? 'bg-amber-100 text-amber-800' 
                          : 'bg-rose-100 text-rose-800'
                    }`}>
                      {dtiAnalysis.ratio}% ({dtiAnalysis.risk === 'low' ? 'EASY TO PAY' : dtiAnalysis.risk === 'moderate' ? 'MEDIUM LOAD' : 'HIGH LOAD'})
                    </span>
                  </div>
                </div>
              </div>

              {/* Attached Docs */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                <span className="font-bold text-slate-800 uppercase tracking-wider block text-[11px]">
                  Files Attached
                </span>
                <ul className="space-y-1 text-slate-600">
                  {documents.map(d => (
                    <li key={d.id} className="flex items-center gap-1.5 truncate">
                      <CheckCircle2 className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                      <span>{d.title}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Terms and Declaration */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  required
                  checked={declarationAccepted}
                  onChange={(e) => setDeclarationAccepted(e.target.checked)}
                  className="mt-1 w-4 h-4 rounded text-blue-600 focus:ring-blue-500 border-slate-300"
                />
                <span className="text-xs text-slate-700 leading-relaxed">
                  I confirm that all details and documents I entered above are true and correct. I allow LoanFlow staff to check my application and send me a Reference Number to track my status.
                </span>
              </label>
            </div>
          </div>
        )}

        {/* Navigation & Submit Buttons */}
        <div className="flex items-center justify-between pt-6 border-t border-slate-100">
          {currentStep > 1 ? (
            <button
              type="button"
              onClick={handleBack}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back</span>
            </button>
          ) : <div />}

          {currentStep < 6 ? (
            <button
              type="button"
              onClick={handleNext}
              className="flex items-center gap-1.5 px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-md shadow-blue-600/30 transition-all cursor-pointer"
            >
              <span>Next Step</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              type="submit"
              disabled={!declarationAccepted}
              className={`flex items-center gap-2 px-8 py-3 rounded-xl font-bold text-sm shadow-lg transition-all cursor-pointer ${
                declarationAccepted
                  ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-600/30'
                  : 'bg-slate-200 text-slate-400 cursor-not-allowed'
              }`}
            >
              <ShieldCheck className="w-5 h-5" />
              <span>Send Application Now</span>
            </button>
          )}
        </div>
      </form>
    </div>
  );
};
