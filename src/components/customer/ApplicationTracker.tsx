import React, { useState, useEffect } from 'react';
import { 
  Search, 
  ShieldCheck, 
  AlertCircle, 
  CheckCircle2, 
  Clock, 
  XCircle, 
  CreditCard, 
  Printer, 
  TrendingUp, 
  Receipt, 
  ArrowRight, 
  KeyRound, 
  RotateCcw, 
  Lock, 
  Smartphone, 
  Mail, 
  FileCheck 
} from 'lucide-react';
import { useLoanContext } from '../../context/LoanContext';
import { LoanApplication, RepaymentRecord } from '../../types/loan';
import { formatCurrency } from '../../utils/loanCalculations';
import { ReceiptModal } from '../common/ReceiptModal';

interface ApplicationTrackerProps {
  initialReference?: string;
  initialNIC?: string;
}

export const ApplicationTracker: React.FC<ApplicationTrackerProps> = ({
  initialReference = '',
  initialNIC = '',
}) => {
  const { requestTrackingOTP, verifyTrackingOTP, recordCustomerPayment, applications } = useLoanContext();

  // Step 1: Credentials
  const [referenceInput, setReferenceInput] = useState<string>(initialReference);
  const [verificationInput, setVerificationInput] = useState<string>(initialNIC);
  const [isRequestingOTP, setIsRequestingOTP] = useState<boolean>(false);

  // Step 2: OTP Challenge state
  const [otpStage, setOtpStage] = useState<'credentials' | 'otp_challenge' | 'verified'>('credentials');
  const [otpInput, setOtpInput] = useState<string>('');
  const [isVerifyingOTP, setIsVerifyingOTP] = useState<boolean>(false);
  const [activeChallengeData, setActiveChallengeData] = useState<{
    referenceNumber: string;
    maskedPhone: string;
    maskedEmail: string;
  } | null>(null);

  // Verified application data
  const [currentApp, setCurrentApp] = useState<LoanApplication | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Self-serve repayment state
  const [paymentAmount, setPaymentAmount] = useState<number>(0);
  const [paymentMethod, setPaymentMethod] = useState<'online' | 'bank_transfer'>('bank_transfer');
  const [isPaying, setIsPaying] = useState<boolean>(false);
  const [paymentSuccessMsg, setPaymentSuccessMsg] = useState<string | null>(null);

  // Selected receipt voucher modal
  const [selectedRepayment, setSelectedRepayment] = useState<RepaymentRecord | null>(null);

  // Keep verified app synced with context updates
  useEffect(() => {
    if (currentApp) {
      const refreshed = applications.find(a => a.id === currentApp.id);
      if (refreshed) setCurrentApp(refreshed);
    }
  }, [applications]);

  // Step 1: Submit Reference ID + NIC/Phone to initiate OTP
  const handleInitiateVerification = async () => {
    setErrorMsg(null);
    setPaymentSuccessMsg(null);

    const ref = referenceInput.trim().toUpperCase();
    const verif = verificationInput.trim();

    if (!ref) {
      setErrorMsg('Please enter your Application Reference Number (e.g. LN-2026-XXXXX).');
      return;
    }
    if (!verif) {
      setErrorMsg('Please enter your matching NIC number or Phone number for identity verification.');
      return;
    }

    setIsRequestingOTP(true);
    try {
      const res = await requestTrackingOTP(ref, verif);
      if (!res.success || !res.challenge) {
        setErrorMsg(res.error || 'Verification failed. Please check your reference number.');
        setOtpStage('credentials');
        setCurrentApp(null);
      } else {
        setActiveChallengeData({
          referenceNumber: res.challenge.referenceNumber,
          maskedPhone: res.challenge.maskedPhone,
          maskedEmail: res.challenge.maskedEmail,
        });
        setOtpStage('otp_challenge');
        setOtpInput('');
      }
    } catch (err: any) {
      setErrorMsg('Failed to communicate with verification service.');
    } finally {
      setIsRequestingOTP(false);
    }
  };

  // Step 2: Submit 6-digit OTP
  const handleVerifyOTP = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!activeChallengeData) return;

    setErrorMsg(null);
    const cleanOTP = otpInput.trim();

    if (cleanOTP.length !== 6 || !/^\d{6}$/.test(cleanOTP)) {
      setErrorMsg('Please enter a valid 6-digit numeric verification code.');
      return;
    }

    setIsVerifyingOTP(true);
    try {
      const res = await verifyTrackingOTP(activeChallengeData.referenceNumber, cleanOTP);

      if (!res.success || !res.application) {
        setErrorMsg(res.error || 'Invalid 6-digit verification code. Please check your code and try again.');
      } else {
        setCurrentApp(res.application);
        setOtpStage('verified');
        if (res.application.approval?.monthlyInstallment) {
          setPaymentAmount(res.application.approval.monthlyInstallment);
        }
      }
    } catch (err: any) {
      setErrorMsg('Verification service error. Please try again.');
    } finally {
      setIsVerifyingOTP(false);
    }
  };

  const handleMakePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentApp || isPaying) return;
    setErrorMsg(null);
    setPaymentSuccessMsg(null);

    const amount = Number(paymentAmount);

    if (isNaN(amount) || amount <= 0) {
      setErrorMsg('Please enter a valid payment amount greater than zero.');
      return;
    }

    if (amount > currentApp.currentOutstandingBalance) {
      setErrorMsg(
        `Payment amount (${formatCurrency(amount)}) exceeds the current outstanding balance of ${formatCurrency(
          currentApp.currentOutstandingBalance
        )}.`
      );
      return;
    }

    setIsPaying(true);
    try {
      const res = await recordCustomerPayment(
        currentApp.id, 
        amount, 
        paymentMethod, 
        `Payment recorded via ${paymentMethod === 'online' ? 'Online Gateway' : 'Bank Transfer'}`
      );
      if (res.success && res.repayment) {
        setPaymentSuccessMsg(`Payment of ${formatCurrency(amount)} successfully confirmed and recorded!`);
        setSelectedRepayment(res.repayment);
      } else {
        setErrorMsg(res.error || 'Failed to process payment with backend.');
      }
    } catch (err: any) {
      setErrorMsg('Network error submitting payment. Please try again.');
    } finally {
      setIsPaying(false);
    }
  };

  const getStatusBadge = (status: LoanApplication['status']) => {
    switch (status) {
      case 'approved':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold border border-emerald-200">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            Approved · Ready to Send Money
          </span>
        );
      case 'disbursed':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-100 text-blue-800 text-xs font-bold border border-blue-200">
            <TrendingUp className="w-3.5 h-3.5 text-[#1769E0]" />
            Active Loan · Paying Back
          </span>
        );
      case 'completed':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-100 text-teal-800 text-xs font-bold border border-teal-200">
            <CheckCircle2 className="w-3.5 h-3.5 text-teal-600" />
            Fully Paid &amp; Closed
          </span>
        );
      case 'rejected':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-100 text-rose-800 text-xs font-bold border border-rose-200">
            <XCircle className="w-3.5 h-3.5 text-rose-600" />
            Not Approved
          </span>
        );
      case 'under_review':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100 text-amber-800 text-xs font-bold border border-amber-200">
            <Clock className="w-3.5 h-3.5 text-amber-600" />
            Checking Your Details
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 text-slate-800 text-xs font-bold border border-slate-200">
            <Clock className="w-3.5 h-3.5 text-slate-500" />
            Submitted · Waiting for Review
          </span>
        );
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-16">
      {/* Tracker Heading */}
      <div className="text-center space-y-2">
        <div className="text-xs font-bold uppercase tracking-wider text-[#1769E0]">
          <span>Check Your Loan</span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-bold text-[#102A56] tracking-tight">
          Track Your Loan Application &amp; Payments
        </h2>
        <p className="text-slate-600 text-xs sm:text-sm max-w-xl mx-auto">
          To keep your details private, enter your Reference Number and NIC or Phone Number below to view your loan status and make payments.
        </p>
      </div>

      {/* STEP 1: CREDENTIALS INPUT CARD */}
      {otpStage === 'credentials' && (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 sm:p-8 space-y-6">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
            <span className="w-6 h-6 rounded-full bg-[#1769E0] text-white flex items-center justify-center font-bold text-xs">
              1
            </span>
            <h3 className="text-sm font-bold text-[#102A56]">Step 1: Enter Application Identification</h3>
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleInitiateVerification();
            }}
            className="grid grid-cols-1 sm:grid-cols-12 gap-4 items-end"
          >
            <div className="sm:col-span-5 space-y-1.5">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wide">
                Application Reference ID *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. LN-2026-XXXXX"
                value={referenceInput}
                onChange={(e) => setReferenceInput(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-sm text-slate-900 focus:bg-white focus:outline-[#1769E0] font-mono uppercase"
              />
            </div>

            <div className="sm:col-span-5 space-y-1.5">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wide flex items-center justify-between">
                <span>NIC or Phone Number *</span>
                <span className="text-[10px] text-slate-400 font-normal">Security check</span>
              </label>
              <input
                type="text"
                required
                placeholder="Enter matching NIC or Phone..."
                value={verificationInput}
                onChange={(e) => setVerificationInput(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-sm text-slate-900 focus:bg-white focus:outline-[#1769E0] font-mono"
              />
            </div>

            <div className="sm:col-span-2">
              <button
                type="submit"
                disabled={isRequestingOTP}
                className="w-full py-2.5 px-4 rounded-xl bg-[#1769E0] hover:bg-[#0B4DBB] disabled:opacity-50 text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-md shadow-blue-500/20 transition-all cursor-pointer h-[42px]"
              >
                <span>{isRequestingOTP ? 'Checking...' : 'Request OTP'}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </form>

          {errorMsg && (
            <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2.5 animate-in fade-in">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}
        </div>
      )}

      {/* STEP 2: 6-DIGIT OTP VERIFICATION CHALLENGE CARD */}
      {otpStage === 'otp_challenge' && activeChallengeData && (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 sm:p-8 space-y-6 animate-in fade-in zoom-in-95 duration-200">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold text-xs">
                2
              </span>
              <h3 className="text-sm font-bold text-[#102A56]">Step 2: Enter 6-Digit Verification Code</h3>
            </div>
            <button
              type="button"
              onClick={() => {
                setOtpStage('credentials');
                setErrorMsg(null);
              }}
              className="text-xs text-slate-500 hover:text-slate-800 flex items-center gap-1 cursor-pointer"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Change Reference</span>
            </button>
          </div>

          {/* Delivery notice */}
          <div className="p-4 rounded-2xl bg-blue-50/70 border border-blue-200 text-xs text-slate-700 space-y-2">
            <div className="flex items-center gap-2 font-bold text-[#102A56]">
              <KeyRound className="w-4 h-4 text-[#1769E0]" />
              <span>Security Verification Code Dispatched</span>
            </div>
            <p className="text-slate-600">
              A 6-digit OTP has been issued for Application Reference <strong className="text-[#102A56] font-mono">{activeChallengeData.referenceNumber}</strong> to:
            </p>
            <div className="flex flex-wrap gap-4 text-slate-800 font-mono text-[11px]">
              <span className="flex items-center gap-1.5"><Smartphone className="w-3.5 h-3.5 text-[#1769E0]" /> {activeChallengeData.maskedPhone}</span>
              <span className="flex items-center gap-1.5"><Mail className="w-3.5 h-3.5 text-[#1769E0]" /> {activeChallengeData.maskedEmail}</span>
            </div>
          </div>

          <form onSubmit={handleVerifyOTP} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wide">
                Enter 6-Digit OTP Code *
              </label>
              <input
                type="text"
                maxLength={6}
                autoFocus
                placeholder="• • • • • •"
                value={otpInput}
                onChange={(e) => setOtpInput(e.target.value.replace(/\D/g, ''))}
                className="w-full sm:w-64 px-4 py-3 rounded-xl border border-slate-300 bg-slate-50 text-center text-xl font-extrabold text-[#102A56] tracking-widest focus:bg-white focus:outline-[#1769E0] font-mono"
              />
            </div>

            {errorMsg && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            <div className="flex items-center gap-3 pt-2">
              <button
                type="submit"
                disabled={otpInput.length < 6 || isVerifyingOTP}
                className="py-2.5 px-6 rounded-xl bg-[#1769E0] hover:bg-[#0B4DBB] disabled:opacity-50 text-white text-xs font-bold shadow-md shadow-blue-500/20 transition-all cursor-pointer flex items-center gap-2"
              >
                <Lock className="w-3.5 h-3.5" />
                <span>{isVerifyingOTP ? 'Verifying Code...' : 'Verify & Unlock Application'}</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* VERIFIED STAGE: FULL APPLICATION DETAILS & REPAYMENTS */}
      {otpStage === 'verified' && currentApp && (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-3 duration-300">
          {/* Main Status Header Card */}
          <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                    Reference ID:
                  </span>
                  <span className="text-xl sm:text-2xl font-extrabold text-[#1769E0] font-mono">
                    {currentApp.referenceNumber}
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-1">
                  Submitted on {new Date(currentApp.createdAt).toLocaleDateString()} for <strong className="text-slate-800 capitalize">{currentApp.personal.fullName}</strong>
                </p>
              </div>

              <div className="flex items-center gap-3">
                {getStatusBadge(currentApp.status)}
                <button
                  type="button"
                  onClick={() => {
                    setOtpStage('credentials');
                    setCurrentApp(null);
                  }}
                  className="px-2.5 py-1 text-[11px] font-semibold text-slate-500 hover:text-slate-800 bg-slate-100 rounded-lg cursor-pointer"
                  title="Lock and track another application"
                >
                  Close Session
                </button>
              </div>
            </div>

            {/* Stepper Timeline */}
            <div className="py-2">
              <span className="text-xs font-bold text-slate-700 uppercase tracking-wide block mb-3">
                Loan Progress Steps
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-center text-xs">
                {[
                  { key: 'submitted', label: '1. Form Sent', active: true, done: true },
                  { key: 'review', label: '2. Checking Details', active: currentApp.status !== 'pending', done: currentApp.status !== 'pending' },
                  { 
                    key: 'decision', 
                    label: currentApp.status === 'rejected' ? '3. Not Approved' : '3. Approved', 
                    active: ['approved', 'disbursed', 'completed', 'rejected'].includes(currentApp.status), 
                    done: ['approved', 'disbursed', 'completed', 'rejected'].includes(currentApp.status) 
                  },
                  { key: 'disbursed', label: '4. Money Sent', active: ['disbursed', 'completed'].includes(currentApp.status), done: ['disbursed', 'completed'].includes(currentApp.status) },
                  { key: 'closed', label: '5. Fully Paid', active: currentApp.status === 'completed', done: currentApp.status === 'completed' },
                ].map((step) => (
                  <div
                    key={step.key}
                    className={`p-3 rounded-xl border transition-all ${
                      step.done
                        ? currentApp.status === 'rejected' && step.key === 'decision'
                          ? 'bg-rose-50 border-rose-200 text-rose-700 font-bold'
                          : 'bg-blue-50 border-blue-200 text-[#1769E0] font-bold'
                        : 'bg-slate-50 border-slate-200 text-slate-400'
                    }`}
                  >
                    <span>{step.label}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Pending / Under Review Friendly Message */}
            {(currentApp.status === 'pending' || currentApp.status === 'under_review') && (
              <div className="p-5 rounded-2xl bg-blue-50/70 border border-blue-200 space-y-2 text-xs">
                <span className="font-bold text-[#102A56] flex items-center gap-1.5 text-sm">
                  <Clock className="w-4 h-4 text-[#1769E0]" />
                  {currentApp.status === 'pending'
                    ? 'Your application is waiting in queue for review'
                    : 'Our loan officer is checking your documents now'}
                </span>
                <p className="text-slate-600 leading-relaxed">
                  We have received your loan request for <strong className="text-slate-900">{formatCurrency(currentApp.loan.requestedAmount)}</strong>. Once the admin reviews your NIC and income details, your approval terms or message will appear right here.
                </p>
              </div>
            )}

            {/* Approved Details Display (Shows Approved Amount, Rate, Monthly EMI & Notes!) */}
            {(currentApp.status === 'approved' || currentApp.status === 'disbursed' || currentApp.status === 'completed') && currentApp.approval && (
              <div className="p-5 rounded-2xl bg-emerald-50 border border-emerald-200 space-y-4 text-xs">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <span className="font-bold text-emerald-900 flex items-center gap-1.5 text-sm">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    {currentApp.status === 'approved'
                      ? 'Good News! Your Loan Has Been Approved'
                      : 'Approved Loan Terms'}
                  </span>
                  <span className="text-[11px] font-semibold text-emerald-700">
                    Approved on {new Date(currentApp.approval.approvalDate).toLocaleDateString()}
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="bg-white p-3 rounded-xl border border-emerald-100">
                    <span className="text-[11px] text-slate-500 block">Approved Amount</span>
                    <span className="font-extrabold text-emerald-800 text-sm font-mono-numbers">
                      {formatCurrency(currentApp.approval.approvedAmount)}
                    </span>
                  </div>
                  <div className="bg-white p-3 rounded-xl border border-emerald-100">
                    <span className="text-[11px] text-slate-500 block">Interest Rate</span>
                    <span className="font-extrabold text-slate-900 text-sm font-mono-numbers">
                      {currentApp.approval.approvedRate}% / year
                    </span>
                  </div>
                  <div className="bg-white p-3 rounded-xl border border-emerald-100">
                    <span className="text-[11px] text-slate-500 block">Pay Back Time</span>
                    <span className="font-extrabold text-slate-900 text-sm font-mono-numbers">
                      {currentApp.approval.approvedTenureMonths} Months
                    </span>
                  </div>
                  <div className="bg-white p-3 rounded-xl border border-emerald-100">
                    <span className="text-[11px] text-slate-500 block">Monthly Payment</span>
                    <span className="font-extrabold text-[#1769E0] text-sm font-mono-numbers">
                      {formatCurrency(currentApp.approval.monthlyInstallment)}
                    </span>
                  </div>
                </div>

                {currentApp.approval.notes && (
                  <p className="text-emerald-900 bg-white/70 p-3 rounded-xl border border-emerald-100">
                    <strong>Note from Officer: </strong> {currentApp.approval.notes}
                  </p>
                )}

                {currentApp.status === 'approved' && (
                  <p className="text-emerald-800 font-medium">
                    Next step: Our finance team is preparing to send the approved money to your bank account ({currentApp.employment.bankName || 'registered bank'}).
                  </p>
                )}
              </div>
            )}

            {/* Rejection Details Display */}
            {currentApp.status === 'rejected' && currentApp.rejection && (
              <div className="p-5 rounded-2xl bg-rose-50 border border-rose-200 space-y-2 text-xs">
                <span className="font-bold text-rose-900 flex items-center gap-1.5 text-sm">
                  <XCircle className="w-4 h-4 text-rose-600" />
                  Loan Request Not Approved
                </span>
                <p className="text-rose-800">
                  <strong>Main Reason: </strong> {currentApp.rejection.rejectionReason}
                </p>
                {currentApp.rejection.notes && (
                  <p className="text-rose-800 bg-white/70 p-3 rounded-xl border border-rose-100">
                    <strong>Officer&apos;s Note: </strong> {currentApp.rejection.notes}
                  </p>
                )}
                <p className="text-rose-700 pt-1">
                  You can contact our support team or submit a new application with updated details.
                </p>
              </div>
            )}
          </div>

          {/* ACTIVE LOAN & REPAYMENTS MODULE */}
          {(currentApp.status === 'disbursed' || currentApp.status === 'completed') && (
            <div className="space-y-6">
              <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
                  <div>
                    <h3 className="text-lg font-bold text-[#102A56]">
                      {currentApp.status === 'completed'
                        ? 'Loan Fully Paid Off!'
                        : 'Monthly Payments & Remaining Balance'}
                    </h3>
                    <p className="text-xs text-slate-500">
                      {currentApp.status === 'completed'
                        ? 'Thank you! Your loan balance is Rs. 0.00. You can still view and print your receipts below.'
                        : 'Pay your monthly installment online and download your receipt right away.'}
                    </p>
                  </div>
                  <span className="text-xs font-mono bg-blue-50 text-[#1769E0] px-3 py-1 rounded-full border border-blue-200 font-semibold">
                    {currentApp.status === 'completed' ? 'Loan Completed' : `Next Payment Due: ${currentApp.nextPaymentDueDate || 'Scheduled'}`}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="p-5 rounded-2xl bg-[#102A56] text-white space-y-1">
                    <span className="text-xs uppercase tracking-wider text-blue-200 font-medium">
                      Remaining to Pay
                    </span>
                    <p className="text-2xl sm:text-3xl font-extrabold text-amber-400 font-mono-numbers">
                      {formatCurrency(currentApp.currentOutstandingBalance)}
                    </p>
                  </div>

                  <div className="p-5 rounded-2xl bg-emerald-50 border border-emerald-200 space-y-1">
                    <span className="text-xs uppercase tracking-wider text-emerald-800 font-medium">
                      Loan Amount Paid
                    </span>
                    <p className="text-2xl sm:text-3xl font-extrabold text-emerald-700 font-mono-numbers">
                      {formatCurrency(currentApp.totalPrincipalPaid)}
                    </p>
                  </div>

                  <div className="p-5 rounded-2xl bg-blue-50 border border-blue-200 space-y-1">
                    <span className="text-xs uppercase tracking-wider text-[#1769E0] font-medium">
                      Interest Paid
                    </span>
                    <p className="text-2xl sm:text-3xl font-extrabold text-[#1769E0] font-mono-numbers">
                      {formatCurrency(currentApp.totalInterestPaid)}
                    </p>
                  </div>
                </div>

                {/* ONLINE INSTALLMENT PAYMENT FORM */}
                {currentApp.currentOutstandingBalance > 0 && (
                  <div className="p-6 rounded-2xl bg-gradient-to-br from-slate-50 to-blue-50/40 border border-slate-200 space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-800 uppercase tracking-wide flex items-center gap-1.5">
                        <CreditCard className="w-4 h-4 text-[#1769E0]" />
                        Pay Your Loan Installment (Rs.)
                      </span>
                      <span className="text-[11px] text-slate-500 font-mono-numbers">
                        Usual Monthly Payment: {formatCurrency(currentApp.approval?.monthlyInstallment || 0)}
                      </span>
                    </div>

                    {paymentSuccessMsg && (
                      <div className="p-3 rounded-xl bg-emerald-100 text-emerald-900 text-xs font-medium flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-700" />
                        <span>{paymentSuccessMsg}</span>
                      </div>
                    )}

                    {errorMsg && (
                      <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
                        <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                        <span>{errorMsg}</span>
                      </div>
                    )}

                    <form onSubmit={handleMakePayment} className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-end">
                      <div className="sm:col-span-5 space-y-1">
                        <label className="text-[11px] font-semibold text-slate-700">Amount to Pay (Rs.)</label>
                        <input
                          type="number"
                          step={100}
                          min={1}
                          max={currentApp.currentOutstandingBalance}
                          value={paymentAmount}
                          onChange={(e) => setPaymentAmount(Number(e.target.value))}
                          className="w-full px-3.5 py-2 rounded-xl border border-slate-200 bg-white text-sm font-bold font-mono-numbers focus:outline-[#1769E0]"
                        />
                      </div>

                      <div className="sm:col-span-4 space-y-1">
                        <label className="text-[11px] font-semibold text-slate-700">How You Pay</label>
                        <select
                          value={paymentMethod}
                          onChange={(e) => setPaymentMethod(e.target.value as any)}
                          className="w-full px-3.5 py-2 rounded-xl border border-slate-200 bg-white text-xs font-semibold focus:outline-[#1769E0]"
                        >
                          <option value="bank_transfer">Bank Transfer</option>
                          <option value="online">Debit / Credit Card</option>
                        </select>
                      </div>

                      <div className="sm:col-span-3">
                        <button
                          type="submit"
                          disabled={isPaying || currentApp.currentOutstandingBalance <= 0}
                          className="w-full py-2 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white text-xs font-bold shadow-md shadow-emerald-600/25 transition-all cursor-pointer h-[38px] flex items-center justify-center gap-1.5"
                        >
                          <span>{isPaying ? 'Saving...' : 'Pay Now'}</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </form>
                  </div>
                )}

                {/* Repayments History Table */}
                <div className="space-y-3 pt-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-800 uppercase tracking-wide">
                      Your Payment Receipts ({currentApp.repayments.length})
                    </span>
                  </div>

                  {currentApp.repayments.length === 0 ? (
                    <div className="text-center py-6 text-xs text-slate-400 bg-slate-50 rounded-xl border border-slate-100">
                      No payments recorded yet for this loan.
                    </div>
                  ) : (
                    <div className="overflow-x-auto border border-slate-200 rounded-2xl">
                      <table className="w-full text-xs text-left">
                        <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                          <tr>
                            <th className="py-2.5 px-3">Receipt No</th>
                            <th className="py-2.5 px-3">Date</th>
                            <th className="py-2.5 px-3">Amount Paid</th>
                            <th className="py-2.5 px-3">Principal</th>
                            <th className="py-2.5 px-3">Interest</th>
                            <th className="py-2.5 px-3">Channel</th>
                            <th className="py-2.5 px-3 text-right">Voucher</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {currentApp.repayments.map((rep) => (
                            <tr key={rep.id} className="hover:bg-slate-50 transition-colors">
                              <td className="py-2.5 px-3 font-mono font-bold text-slate-800">{rep.referenceNo}</td>
                              <td className="py-2.5 px-3 text-slate-600">{rep.paymentDate}</td>
                              <td className="py-2.5 px-3 font-mono font-bold text-emerald-700">{formatCurrency(rep.amount)}</td>
                              <td className="py-2.5 px-3 font-mono text-slate-600">{formatCurrency(rep.principalPortion)}</td>
                              <td className="py-2.5 px-3 font-mono text-slate-600">{formatCurrency(rep.interestPortion)}</td>
                              <td className="py-2.5 px-3 capitalize text-slate-500">{rep.paymentMethod.replace('_', ' ')}</td>
                              <td className="py-2.5 px-3 text-right">
                                <button
                                  type="button"
                                  onClick={() => setSelectedRepayment(rep)}
                                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-blue-50 text-[#1769E0] hover:bg-blue-100 font-semibold text-[11px] cursor-pointer"
                                >
                                  <Receipt className="w-3 h-3" />
                                  <span>View</span>
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* APPLICATION RECORD SNAPSHOT */}
          <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <h3 className="text-base font-bold text-[#102A56] flex items-center gap-2">
                <FileCheck className="w-4 h-4 text-[#1769E0]" />
                Application Record Snapshot
              </h3>
              <button
                type="button"
                onClick={() => window.print()}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-semibold cursor-pointer"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print Record</span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-xs">
              <div className="space-y-1.5">
                <span className="font-bold text-slate-400 uppercase tracking-wider text-[10px]">Applicant Details</span>
                <p className="font-semibold text-slate-900">{currentApp.personal.fullName}</p>
                <p className="text-slate-600">NIC: {currentApp.personal.nicNumber}</p>
                <p className="text-slate-600">{currentApp.contact.phone}</p>
                <p className="text-slate-600">{currentApp.contact.city}</p>
              </div>

              <div className="space-y-1.5">
                <span className="font-bold text-slate-400 uppercase tracking-wider text-[10px]">Employment & Income</span>
                <p className="font-semibold text-slate-900 capitalize">{currentApp.employment.employmentType.replace('_', ' ')}</p>
                <p className="text-slate-600">{currentApp.employment.employerName || 'Self-Employed'}</p>
                <p className="text-slate-600">Gross Income: {formatCurrency(currentApp.employment.monthlyGrossIncome)}/mo</p>
                <p className="text-slate-600">Bank: {currentApp.employment.bankName}</p>
              </div>

              <div className="space-y-1.5">
                <span className="font-bold text-slate-400 uppercase tracking-wider text-[10px]">Facility & Terms</span>
                <p className="font-semibold text-slate-900 capitalize">{currentApp.loan.loanType} Loan Facility</p>
                <p className="text-slate-600">Requested: {formatCurrency(currentApp.loan.requestedAmount)} ({currentApp.loan.tenureMonths} Months)</p>
                <p className="text-slate-600">Calculation Method: {currentApp.loan.interestMethod}</p>
                <p className="text-slate-600">Purpose: {currentApp.loan.purpose}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* RECEIPT MODAL */}
      {selectedRepayment && currentApp && (
        <ReceiptModal
          isOpen={true}
          repayment={selectedRepayment}
          application={currentApp}
          onClose={() => setSelectedRepayment(null)}
        />
      )}
    </div>
  );
};
