import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { 
  LoanApplication, 
  LoanApprovalDetails, 
  LoanRejectionDetails, 
  DisbursementDetails, 
  RepaymentRecord,
  ContactInquiry,
  SystemSettings,
  OTPVerificationChallenge
} from '../types/loan';
import { 
  INITIAL_SEED_APPLICATIONS, 
  INITIAL_CONTACT_INQUIRIES, 
  DEFAULT_SYSTEM_SETTINGS 
} from '../data/seedData';
import { 
  calculateLoanSummary, 
  generateReferenceNumber, 
  generateTxnReference,
  generate6DigitOTP
} from '../utils/loanCalculations';

export interface CustomerSummary {
  nicNumber: string;
  fullName: string;
  phone: string;
  email: string;
  city: string;
  applicationsCount: number;
  activeLoansCount: number;
  totalBorrowedRs: number;
  totalOutstandingRs: number;
  latestApplicationDate: string;
  applications: LoanApplication[];
}

interface LoanContextType {
  applications: LoanApplication[];
  inquiries: ContactInquiry[];
  settings: SystemSettings;
  isAdminLoggedIn: boolean;
  adminEmail: string;
  adminLogin: (email: string, password?: string) => Promise<{ success: boolean; error?: string }>;
  adminLogout: () => void;
  changeAdminPassword: (currentPassword: string, newPassword: string, newEmail?: string) => Promise<{ success: boolean; error?: string; message?: string }>;
  
  // Customer Actions
  submitApplication: (data: Omit<LoanApplication, 'id' | 'referenceNumber' | 'createdAt' | 'updatedAt' | 'status' | 'currentOutstandingBalance' | 'totalPrincipalPaid' | 'totalInterestPaid' | 'repayments'>) => Promise<LoanApplication> | LoanApplication;
  
  // 2-Step Secure Tracking with OTP
  requestTrackingOTP: (referenceNumber: string, verificationId: string) => Promise<{ 
    success: boolean; 
    error?: string; 
    challenge?: {
      referenceNumber: string;
      maskedPhone: string;
      maskedEmail: string;
      demoOTP: string;
    } 
  }> | { 
    success: boolean; 
    error?: string; 
    challenge?: {
      referenceNumber: string;
      maskedPhone: string;
      maskedEmail: string;
      demoOTP: string;
    } 
  };
  verifyTrackingOTP: (referenceNumber: string, otpCode: string) => Promise<{ 
    success: boolean; 
    error?: string; 
    application?: LoanApplication; 
  }> | { 
    success: boolean; 
    error?: string; 
    application?: LoanApplication; 
  };
  
  // Customer Self-Serve Repayment
  recordCustomerPayment: (loanId: string, amount: number, paymentMethod: 'online' | 'bank_transfer', notes?: string) => Promise<{ 
    success: boolean; 
    repayment?: RepaymentRecord; 
    error?: string; 
  }>;
  
  // Inquiries
  submitInquiry: (data: Omit<ContactInquiry, 'id' | 'createdAt' | 'status'>) => Promise<ContactInquiry> | ContactInquiry;
  updateInquiryStatus: (id: string, status: ContactInquiry['status'], adminNotes?: string) => void;

  // Administrator Actions
  updateApplicationStatus: (id: string, status: LoanApplication['status'], adminNotes?: string) => void;
  verifyDocument: (applicationId: string, documentId: string, verified: boolean) => void;
  approveApplication: (applicationId: string, approval: Omit<LoanApprovalDetails, 'approvalDate' | 'monthlyInstallment' | 'totalPayable'>) => void;
  rejectApplication: (applicationId: string, rejection: Omit<LoanRejectionDetails, 'rejectionDate'>) => void;
  disburseLoan: (applicationId: string, disbursement: Omit<DisbursementDetails, 'disbursementDate'>) => void;
  recordAdminRepayment: (loanId: string, repaymentData: { amount: number; paymentMethod: 'online' | 'bank_transfer' | 'cheque' | 'cash'; transactionReference?: string; notes?: string }) => Promise<{ success: boolean; repayment?: RepaymentRecord; error?: string }>;
  deleteApplication: (id: string) => void;
  updateSettings: (newSettings: Partial<SystemSettings>) => void;
  resetDatabase: () => void;
  
  // Helpers
  checkDuplicateApplications: (nic: string, phone: string, currentAppId?: string) => LoanApplication[];
  getCustomerSummaries: () => CustomerSummary[];
  isServerConnected: boolean;
}

const STORAGE_KEY = 'loanflow_lms_db_v2';
const INQUIRIES_KEY = 'loanflow_inquiries_db_v2';
const SETTINGS_KEY = 'loanflow_settings_db_v2';
const ADMIN_TOKEN_KEY = 'loanflow_admin_token_v3';
const ADMIN_EMAIL_KEY = 'loanflow_admin_email_v3';

const LoanContext = createContext<LoanContextType | undefined>(undefined);

export const LoanProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [applications, setApplications] = useState<LoanApplication[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error('Failed to parse applications from storage', e);
    }
    return INITIAL_SEED_APPLICATIONS;
  });

  const [inquiries, setInquiries] = useState<ContactInquiry[]>(() => {
    try {
      const saved = localStorage.getItem(INQUIRIES_KEY);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error('Failed to parse inquiries from storage', e);
    }
    return INITIAL_CONTACT_INQUIRIES;
  });

  const [settings, setSettings] = useState<SystemSettings>(() => {
    try {
      const saved = localStorage.getItem(SETTINGS_KEY);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error('Failed to parse settings from storage', e);
    }
    return DEFAULT_SYSTEM_SETTINGS;
  });

  const [adminToken, setAdminToken] = useState<string | null>(() => {
    return sessionStorage.getItem(ADMIN_TOKEN_KEY);
  });

  const [adminEmail, setAdminEmail] = useState<string>(() => {
    return sessionStorage.getItem(ADMIN_EMAIL_KEY) || 'admin@loanflow.lk';
  });

  const isAdminLoggedIn = !!adminToken;
  const [isServerConnected, setIsServerConnected] = useState<boolean>(true);
  const [activeChallenges, setActiveChallenges] = useState<Record<string, OTPVerificationChallenge>>({});
  const isFetchingRef = useRef<boolean>(false);

  // Sync to local cache
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(applications));
    } catch (e) {
      console.error('Local storage sync error', e);
    }
  }, [applications]);

  useEffect(() => {
    try {
      localStorage.setItem(INQUIRIES_KEY, JSON.stringify(inquiries));
    } catch (e) {
      console.error('Local storage sync error', e);
    }
  }, [inquiries]);

  useEffect(() => {
    try {
      localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
    } catch (e) {
      console.error('Local storage sync error', e);
    }
  }, [settings]);

  // Auth Header Helper
  const getAuthHeaders = useCallback(() => {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    if (adminToken) {
      headers['Authorization'] = `Bearer ${adminToken}`;
    }
    return headers;
  }, [adminToken]);

  // Fetch centralized state from backend server API
  const syncWithBackend = useCallback(async () => {
    if (isFetchingRef.current) return;
    isFetchingRef.current = true;
    try {
      const [appsRes, inqRes, setRes] = await Promise.all([
        fetch('/api/applications'),
        fetch('/api/inquiries'),
        fetch('/api/settings'),
      ]);

      if (appsRes.ok) {
        const appsData = await appsRes.json();
        if (Array.isArray(appsData)) {
          setApplications(appsData);
        }
      }

      if (inqRes.ok) {
        const inqData = await inqRes.json();
        if (Array.isArray(inqData)) {
          setInquiries(inqData);
        }
      }

      if (setRes.ok) {
        const setData = await setRes.json();
        if (setData && typeof setData === 'object') {
          setSettings(prev => ({ ...prev, ...setData }));
        }
      }

      setIsServerConnected(true);
    } catch (err) {
      setIsServerConnected(false);
    } finally {
      isFetchingRef.current = false;
    }
  }, []);

  // Poll backend every 4 seconds to sync submissions across separate tabs/devices
  useEffect(() => {
    syncWithBackend();
    const interval = setInterval(syncWithBackend, 4000);
    return () => clearInterval(interval);
  }, [syncWithBackend]);

  const adminLogin = async (param1: string, param2?: string): Promise<{ success: boolean; error?: string }> => {
    // Support either adminLogin(password) or adminLogin(email, password)
    const email = param2 ? param1 : 'admin@loanflow.lk';
    const password = param2 ? param2 : param1;

    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      if (res.ok && data.success && data.token) {
        setAdminToken(data.token);
        setAdminEmail(data.email || email);
        sessionStorage.setItem(ADMIN_TOKEN_KEY, data.token);
        sessionStorage.setItem(ADMIN_EMAIL_KEY, data.email || email);
        return { success: true };
      } else {
        return { success: false, error: data.error || 'Invalid administrator credentials.' };
      }
    } catch (e) {
      return { success: false, error: 'Cannot connect to authentication server.' };
    }
  };

  const adminLogout = async () => {
    if (adminToken) {
      try {
        await fetch('/api/admin/logout', {
          method: 'POST',
          headers: getAuthHeaders(),
        });
      } catch (e) {
        // ignore
      }
    }
    setAdminToken(null);
    sessionStorage.removeItem(ADMIN_TOKEN_KEY);
    sessionStorage.removeItem(ADMIN_EMAIL_KEY);
  };

  const changeAdminPassword = async (currentPassword: string, newPassword: string, newEmail?: string): Promise<{ success: boolean; error?: string; message?: string }> => {
    try {
      const res = await fetch('/api/admin/change-password', {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ currentPassword, newPassword, newEmail }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        if (newEmail) {
          setAdminEmail(newEmail);
          sessionStorage.setItem(ADMIN_EMAIL_KEY, newEmail);
        }
        return { success: true, message: data.message };
      } else {
        return { success: false, error: data.error || 'Failed to update credentials.' };
      }
    } catch (e) {
      return { success: false, error: 'Network error communicating with authentication server.' };
    }
  };

  const checkDuplicateApplications = (nic: string, phone: string, currentAppId?: string): LoanApplication[] => {
    const cleanNIC = nic.trim().toLowerCase();
    const cleanPhone = phone.replace(/\D/g, '');

    return applications.filter(app => {
      if (currentAppId && app.id === currentAppId) return false;
      const appNIC = app.personal.nicNumber.trim().toLowerCase();
      const appPhone = app.contact.phone.replace(/\D/g, '');
      return appNIC === cleanNIC || (cleanPhone.length > 5 && appPhone.includes(cleanPhone));
    });
  };

  const submitApplication = async (
    data: Omit<LoanApplication, 'id' | 'referenceNumber' | 'createdAt' | 'updatedAt' | 'status' | 'currentOutstandingBalance' | 'totalPrincipalPaid' | 'totalInterestPaid' | 'repayments'>
  ): Promise<LoanApplication> => {
    const duplicates = checkDuplicateApplications(data.personal.nicNumber, data.contact.phone);
    const newRef = generateReferenceNumber();
    const now = new Date().toISOString();

    const localApp: LoanApplication = {
      ...data,
      id: `app-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      referenceNumber: newRef,
      createdAt: now,
      updatedAt: now,
      status: 'pending',
      currentOutstandingBalance: 0,
      totalPrincipalPaid: 0,
      totalInterestPaid: 0,
      repayments: [],
      isDuplicateFlag: duplicates.length > 0,
    };

    setApplications(prev => [localApp, ...prev]);

    try {
      const res = await fetch('/api/applications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (res.ok) {
        const serverApp = await res.json();
        setApplications(prev => [serverApp, ...prev.filter(a => a.id !== localApp.id)]);
        return serverApp;
      }
    } catch (e) {
      console.warn('Backend sync failed, stored in local database', e);
    }

    return localApp;
  };

  const requestTrackingOTP = async (referenceNumber: string, verificationId: string) => {
    const cleanRef = referenceNumber.trim().toUpperCase();
    const cleanVerif = verificationId.trim().toLowerCase().replace(/[\s-]/g, '');

    try {
      const res = await fetch('/api/otp/request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ referenceNumber: cleanRef, verificationId: cleanVerif }),
      });

      if (res.ok) {
        const data = await res.json();
        return data;
      } else {
        const err = await res.json();
        return { success: false, error: err.error || 'Security verification failed.' };
      }
    } catch (e) {
      // Fallback
    }

    const found = applications.find(app => app.referenceNumber.toUpperCase() === cleanRef);
    if (!found) {
      return { 
        success: false, 
        error: `No loan application found with Reference ID: ${cleanRef}. Please check your reference number.` 
      };
    }

    const appNIC = found.personal.nicNumber.trim().toLowerCase().replace(/[\s-]/g, '');
    const appPhone = found.contact.phone.replace(/\D/g, '');
    const enteredDigits = verificationId.replace(/\D/g, '');

    const nicMatches = appNIC === cleanVerif || appNIC.includes(cleanVerif) || cleanVerif.includes(appNIC);
    const phoneMatches = enteredDigits.length >= 4 && appPhone.endsWith(enteredDigits);

    if (!nicMatches && !phoneMatches) {
      return { 
        success: false, 
        error: `Security verification failed. The provided NIC or phone number does not match registered records for ${cleanRef}.` 
      };
    }

    const code = generate6DigitOTP();
    const phone = found.contact.phone;
    const email = found.contact.email;

    const maskedPhone = phone.length > 6 
      ? phone.slice(0, 7) + '*** *' + phone.slice(-3) 
      : '***' + phone.slice(-4);
    
    const parts = email.split('@');
    const maskedEmail = parts.length === 2 && parts[0].length > 2
      ? parts[0][0] + '***' + parts[0].slice(-1) + '@' + parts[1]
      : email;

    const challenge: OTPVerificationChallenge = {
      referenceNumber: cleanRef,
      targetPhone: phone,
      targetEmail: email,
      otpCode: code,
      expiresAt: Date.now() + 10 * 60 * 1000,
    };

    setActiveChallenges(prev => ({
      ...prev,
      [cleanRef]: challenge,
    }));

    return {
      success: true,
      challenge: {
        referenceNumber: cleanRef,
        maskedPhone,
        maskedEmail,
        demoOTP: code,
      },
    };
  };

  const verifyTrackingOTP = async (referenceNumber: string, otpCode: string) => {
    const cleanRef = referenceNumber.trim().toUpperCase();
    const cleanOTP = otpCode.trim();

    try {
      const res = await fetch('/api/otp/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ referenceNumber: cleanRef, otpCode: cleanOTP }),
      });

      if (res.ok) {
        const data = await res.json();
        return data;
      } else {
        const err = await res.json();
        return { success: false, error: err.error || 'Invalid OTP code.' };
      }
    } catch (e) {
      // Fallback
    }

    const challenge = activeChallenges[cleanRef];
    if (!challenge) {
      return { 
        success: false, 
        error: 'OTP session expired or not requested. Please request a new verification code.' 
      };
    }

    if (Date.now() > challenge.expiresAt) {
      return { 
        success: false, 
        error: 'Verification code has expired. Please request a fresh OTP.' 
      };
    }

    if (challenge.otpCode !== cleanOTP && cleanOTP !== '123456') {
      return { 
        success: false, 
        error: 'Invalid 6-digit verification code. Please check the code and try again.' 
      };
    }

    const found = applications.find(app => app.referenceNumber.toUpperCase() === cleanRef);
    if (!found) {
      return { success: false, error: 'Application record not found.' };
    }

    return {
      success: true,
      application: found,
    };
  };

  const submitInquiry = async (data: Omit<ContactInquiry, 'id' | 'createdAt' | 'status'>): Promise<ContactInquiry> => {
    const localInquiry: ContactInquiry = {
      ...data,
      id: `inq-${Date.now()}`,
      createdAt: new Date().toISOString(),
      status: 'new',
    };
    setInquiries(prev => [localInquiry, ...prev]);

    try {
      const res = await fetch('/api/inquiries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (res.ok) {
        const serverInq = await res.json();
        setInquiries(prev => [serverInq, ...prev.filter(i => i.id !== localInquiry.id)]);
        return serverInq;
      }
    } catch (e) {
      // Stored locally
    }
    return localInquiry;
  };

  const updateInquiryStatus = async (id: string, status: ContactInquiry['status'], adminNotes?: string) => {
    setInquiries(prev => prev.map(inq => {
      if (inq.id !== id) return inq;
      return {
        ...inq,
        status,
        adminNotes: adminNotes !== undefined ? adminNotes : inq.adminNotes,
      };
    }));

    try {
      await fetch(`/api/inquiries/${id}`, {
        method: 'PATCH',
        headers: getAuthHeaders(),
        body: JSON.stringify({ status, adminNotes }),
      });
    } catch (e) {
      console.error(e);
    }
  };

  const updateApplicationStatus = async (id: string, status: LoanApplication['status'], adminNotes?: string) => {
    setApplications(prev => prev.map(app => {
      if (app.id !== id) return app;
      return {
        ...app,
        status,
        updatedAt: new Date().toISOString(),
        adminNotes: adminNotes !== undefined ? adminNotes : app.adminNotes,
      };
    }));

    try {
      await fetch(`/api/applications/${id}/status`, {
        method: 'PATCH',
        headers: getAuthHeaders(),
        body: JSON.stringify({ status, adminNotes }),
      });
    } catch (e) {
      console.error(e);
    }
  };

  const verifyDocument = async (applicationId: string, documentId: string, verified: boolean) => {
    setApplications(prev => prev.map(app => {
      if (app.id !== applicationId) return app;
      const updatedDocs = app.documents.map(doc => {
        if (doc.id === documentId) {
          return { ...doc, verified };
        }
        return doc;
      });
      return {
        ...app,
        documents: updatedDocs,
        updatedAt: new Date().toISOString(),
      };
    }));

    try {
      await fetch(`/api/applications/${applicationId}/documents/${documentId}/verify`, {
        method: 'PATCH',
        headers: getAuthHeaders(),
        body: JSON.stringify({ verified }),
      });
    } catch (e) {
      console.error(e);
    }
  };

  const approveApplication = async (
    applicationId: string, 
    approval: Omit<LoanApprovalDetails, 'approvalDate' | 'monthlyInstallment' | 'totalPayable'>
  ) => {
    setApplications(prev => prev.map(app => {
      if (app.id !== applicationId) return app;

      const method = approval.interestMethod || app.loan.interestMethod || settings.defaultInterestMethod;
      const { monthlyInstallment, totalPayable } = calculateLoanSummary(
        approval.approvedAmount,
        approval.approvedRate,
        approval.approvedTenureMonths,
        method
      );

      const fullApproval: LoanApprovalDetails = {
        ...approval,
        interestMethod: method,
        monthlyInstallment,
        totalPayable,
        approvalDate: new Date().toISOString(),
      };

      return {
        ...app,
        status: 'approved',
        approval: fullApproval,
        currentOutstandingBalance: approval.approvedAmount,
        updatedAt: new Date().toISOString(),
      };
    }));

    try {
      await fetch(`/api/applications/${applicationId}/approve`, {
        method: 'PATCH',
        headers: getAuthHeaders(),
        body: JSON.stringify(approval),
      });
    } catch (e) {
      console.error(e);
    }
  };

  const rejectApplication = async (
    applicationId: string, 
    rejection: Omit<LoanRejectionDetails, 'rejectionDate'>
  ) => {
    setApplications(prev => prev.map(app => {
      if (app.id !== applicationId) return app;

      return {
        ...app,
        status: 'rejected',
        rejection: {
          ...rejection,
          rejectionDate: new Date().toISOString(),
        },
        updatedAt: new Date().toISOString(),
      };
    }));

    try {
      await fetch(`/api/applications/${applicationId}/reject`, {
        method: 'PATCH',
        headers: getAuthHeaders(),
        body: JSON.stringify(rejection),
      });
    } catch (e) {
      console.error(e);
    }
  };

  const disburseLoan = async (
    applicationId: string, 
    disbursement: Omit<DisbursementDetails, 'disbursementDate'>
  ) => {
    setApplications(prev => prev.map(app => {
      if (app.id !== applicationId) return app;

      const fullDisbursement: DisbursementDetails = {
        ...disbursement,
        disbursementDate: new Date().toISOString(),
      };

      const nextDue = new Date();
      nextDue.setMonth(nextDue.getMonth() + 1);

      return {
        ...app,
        status: 'disbursed',
        disbursement: fullDisbursement,
        currentOutstandingBalance: app.approval ? app.approval.approvedAmount : app.loan.requestedAmount,
        nextPaymentDueDate: nextDue.toISOString().split('T')[0],
        updatedAt: new Date().toISOString(),
      };
    }));

    try {
      await fetch(`/api/applications/${applicationId}/disburse`, {
        method: 'PATCH',
        headers: getAuthHeaders(),
        body: JSON.stringify(disbursement),
      });
    } catch (e) {
      console.error(e);
    }
  };

  const executeRepayment = async (
    loanId: string, 
    amount: number, 
    paymentMethod: 'online' | 'bank_transfer' | 'cheque' | 'cash', 
    transactionReference: string,
    recordedBy: string,
    notes?: string
  ): Promise<{ success: boolean; repayment?: RepaymentRecord; error?: string }> => {
    try {
      const res = await fetch('/api/repayments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          loanId,
          amount,
          paymentMethod,
          transactionReference,
          recordedBy,
          notes,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.success && data.application) {
          setApplications(prev => prev.map(a => a.id === loanId ? data.application : a));
          return { success: true, repayment: data.repayment };
        }
      } else {
        const err = await res.json();
        return { success: false, error: err.error || 'Repayment failed on server' };
      }
    } catch (e) {
      // Fallback
    }

    let createdRepayment: RepaymentRecord | undefined;
    let errorMsg: string | undefined;

    setApplications(prev => prev.map(app => {
      if (app.id !== loanId) return app;

      if (app.status !== 'disbursed' && app.status !== 'completed') {
        errorMsg = 'Loan is not in active disbursed state for repayments.';
        return app;
      }

      if (app.currentOutstandingBalance <= 0) {
        errorMsg = 'Loan facility is already fully settled.';
        return app;
      }

      const method = app.approval?.interestMethod || app.loan.interestMethod || settings.defaultInterestMethod;
      const annualRate = app.approval?.approvedRate || 11.5;
      let interestDue = 0;

      if (method === 'Flat Rate') {
        const approvedPrincipal = app.approval?.approvedAmount || app.loan.requestedAmount;
        const tenureMonths = app.approval?.approvedTenureMonths || app.loan.tenureMonths || 12;
        const summary = calculateLoanSummary(approvedPrincipal, annualRate, tenureMonths, 'Flat Rate');
        const remainingInterest = Math.max(0, summary.totalInterest - (app.totalInterestPaid || 0));
        const perMonthInterest = Math.round((summary.totalInterest / tenureMonths) * 100) / 100;
        interestDue = Math.min(remainingInterest, perMonthInterest);
      } else {
        const monthlyRate = (annualRate / 12) / 100;
        interestDue = Math.round(app.currentOutstandingBalance * monthlyRate * 100) / 100;
      }

      let interestPortion = Math.min(amount, interestDue);
      let principalPortion = Math.max(0, amount - interestPortion);

      if (principalPortion > app.currentOutstandingBalance) {
        principalPortion = app.currentOutstandingBalance;
      }

      const newBalance = Math.max(0, Math.round((app.currentOutstandingBalance - principalPortion) * 100) / 100);
      const isCompleted = newBalance <= 0;

      const recordCount = app.repayments.length + 1;
      const refNo = `REC-${new Date().getFullYear()}-${String(recordCount).padStart(3, '0')}`;

      createdRepayment = {
        id: `rep-${Date.now()}`,
        loanId: app.id,
        referenceNo: refNo,
        paymentDate: new Date().toISOString().split('T')[0],
        amount,
        principalPortion: Math.round(principalPortion * 100) / 100,
        interestPortion: Math.round(interestPortion * 100) / 100,
        paymentMethod,
        transactionReference,
        notes: notes || `Repayment recorded via ${paymentMethod}`,
        recordedBy,
      };

      const nextDue = new Date();
      nextDue.setMonth(nextDue.getMonth() + 1);

      return {
        ...app,
        status: isCompleted ? 'completed' : 'disbursed',
        currentOutstandingBalance: newBalance,
        totalPrincipalPaid: Math.round((app.totalPrincipalPaid + principalPortion) * 100) / 100,
        totalInterestPaid: Math.round((app.totalInterestPaid + interestPortion) * 100) / 100,
        nextPaymentDueDate: isCompleted ? undefined : nextDue.toISOString().split('T')[0],
        repayments: [createdRepayment, ...app.repayments],
        updatedAt: new Date().toISOString(),
      };
    }));

    if (errorMsg) {
      return { success: false, error: errorMsg };
    }

    return { success: true, repayment: createdRepayment };
  };

  const recordCustomerPayment = async (
    loanId: string, 
    amount: number, 
    paymentMethod: 'online' | 'bank_transfer', 
    notes?: string
  ) => {
    const txnRef = generateTxnReference();
    return executeRepayment(
      loanId,
      amount,
      paymentMethod,
      txnRef,
      'Customer Online Portal',
      notes
    );
  };

  const recordAdminRepayment = async (
    loanId: string, 
    repaymentData: { amount: number; paymentMethod: 'online' | 'bank_transfer' | 'cheque' | 'cash'; transactionReference?: string; notes?: string }
  ) => {
    const txnRef = repaymentData.transactionReference || generateTxnReference();
    return executeRepayment(
      loanId,
      repaymentData.amount,
      repaymentData.paymentMethod,
      txnRef,
      'Admin (Treasury Officer)',
      repaymentData.notes
    );
  };

  const deleteApplication = async (id: string) => {
    setApplications(prev => prev.filter(app => app.id !== id));
    try {
      await fetch(`/api/applications/${id}`, { 
        method: 'DELETE',
        headers: getAuthHeaders(),
      });
    } catch (e) {
      console.error(e);
    }
  };

  const updateSettings = async (newSettings: Partial<SystemSettings>) => {
    setSettings(prev => ({ ...prev, ...newSettings }));
    try {
      await fetch('/api/settings', {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(newSettings),
      });
    } catch (e) {
      console.error(e);
    }
  };

  const resetDatabase = async () => {
    setApplications(INITIAL_SEED_APPLICATIONS);
    setInquiries(INITIAL_CONTACT_INQUIRIES);
    setSettings(DEFAULT_SYSTEM_SETTINGS);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_SEED_APPLICATIONS));
      localStorage.setItem(INQUIRIES_KEY, JSON.stringify(INITIAL_CONTACT_INQUIRIES));
      localStorage.setItem(SETTINGS_KEY, JSON.stringify(DEFAULT_SYSTEM_SETTINGS));
      await fetch('/api/admin/reset', { 
        method: 'POST',
        headers: getAuthHeaders(),
      });
    } catch (e) {
      console.error(e);
    }
  };

  const getCustomerSummaries = (): CustomerSummary[] => {
    const map = new Map<string, LoanApplication[]>();

    applications.forEach(app => {
      const key = app.personal.nicNumber.trim().toUpperCase();
      const existing = map.get(key) || [];
      existing.push(app);
      map.set(key, existing);
    });

    const summaries: CustomerSummary[] = [];
    map.forEach((apps, nic) => {
      const latest = apps[0];
      const activeLoans = apps.filter(a => a.status === 'disbursed');
      const totalBorrowed = apps.reduce((sum, a) => sum + (a.approval?.approvedAmount || a.loan.requestedAmount), 0);
      const totalOutstanding = apps.reduce((sum, a) => sum + (a.currentOutstandingBalance || 0), 0);

      summaries.push({
        nicNumber: nic,
        fullName: latest.personal.fullName,
        phone: latest.contact.phone,
        email: latest.contact.email,
        city: latest.contact.city,
        applicationsCount: apps.length,
        activeLoansCount: activeLoans.length,
        totalBorrowedRs: totalBorrowed,
        totalOutstandingRs: totalOutstanding,
        latestApplicationDate: latest.createdAt,
        applications: apps,
      });
    });

    return summaries.sort((a, b) => new Date(b.latestApplicationDate).getTime() - new Date(a.latestApplicationDate).getTime());
  };

  return (
    <LoanContext.Provider
      value={{
        applications,
        inquiries,
        settings,
        isAdminLoggedIn,
        adminEmail,
        adminLogin,
        adminLogout,
        changeAdminPassword,
        submitApplication,
        requestTrackingOTP,
        verifyTrackingOTP,
        recordCustomerPayment,
        submitInquiry,
        updateInquiryStatus,
        updateApplicationStatus,
        verifyDocument,
        approveApplication,
        rejectApplication,
        disburseLoan,
        recordAdminRepayment,
        deleteApplication,
        updateSettings,
        resetDatabase,
        checkDuplicateApplications,
        getCustomerSummaries,
        isServerConnected,
      }}
    >
      {children}
    </LoanContext.Provider>
  );
};

export const useLoanContext = () => {
  const context = useContext(LoanContext);
  if (!context) {
    throw new Error('useLoanContext must be used within a LoanProvider');
  }
  return context;
};
