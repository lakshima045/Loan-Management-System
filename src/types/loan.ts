export type LoanCategory = 
  | 'personal'
  | 'business'
  | 'education'
  | 'emergency'
  | 'vehicle'
  | 'microfinance';

export type InterestMethod = 'Reducing Balance' | 'Flat Rate';

export type ApplicationStatus = 
  | 'pending'
  | 'under_review'
  | 'approved'
  | 'rejected'
  | 'disbursed'
  | 'completed';

export interface LoanProduct {
  id: LoanCategory;
  name: string;
  tagline: string;
  minAmount: number;
  maxAmount: number;
  minTenureMonths: number;
  maxTenureMonths: number;
  defaultAnnualRate: number;
  defaultMethod: InterestMethod;
  icon: string;
  features: string[];
  eligibility: string[];
  requiredDocs: string[];
}

export interface CustomerPersonalDetails {
  fullName: string;
  nicNumber: string; // National Identity Card / Passport
  dateOfBirth: string;
  gender: 'male' | 'female' | 'other';
  maritalStatus: 'single' | 'married' | 'divorced' | 'widowed';
}

export interface CustomerContactDetails {
  phone: string;
  email: string;
  address: string;
  city: string;
  postalCode: string;
  residenceStatus: 'owned' | 'rented' | 'family';
}

export interface CustomerEmploymentDetails {
  employmentType: 'salaried' | 'self_employed' | 'business_owner' | 'freelancer';
  employerName: string;
  designation: string;
  monthlyGrossIncome: number;
  monthlyExpenses: number;
  existingLoanCommitments: number;
  bankName: string;
  accountNumber: string;
}

export interface CustomerLoanDetails {
  loanType: LoanCategory;
  requestedAmount: number;
  tenureMonths: number;
  purpose: string;
  interestMethod?: InterestMethod;
}

export interface UploadedDocument {
  id: string;
  type: 'nic_front' | 'nic_back' | 'payslip' | 'bank_statement' | 'utility_bill';
  title: string;
  fileName: string;
  fileSize: string;
  uploadDate: string;
  previewUrl?: string;
  verified?: boolean;
}

export interface LoanApprovalDetails {
  approvedAmount: number;
  approvedRate: number;
  approvedTenureMonths: number;
  monthlyInstallment: number;
  totalPayable: number;
  interestMethod?: InterestMethod;
  approvedBy: string;
  approvalDate: string;
  notes?: string;
}

export interface LoanRejectionDetails {
  rejectionReason: string;
  rejectedBy: string;
  rejectionDate: string;
  notes?: string;
}

export interface DisbursementDetails {
  disbursementDate: string;
  paymentMethod: 'bank_transfer' | 'cheque' | 'direct_deposit';
  transactionReference: string;
  disbursedAmount: number;
  disbursedBy: string;
}

export interface RepaymentRecord {
  id: string;
  loanId: string;
  referenceNo: string;
  paymentDate: string;
  amount: number;
  principalPortion: number;
  interestPortion: number;
  paymentMethod: 'online' | 'bank_transfer' | 'cheque' | 'cash';
  transactionReference: string;
  notes?: string;
  recordedBy: string;
}

export interface LoanApplication {
  id: string;
  referenceNumber: string; // e.g. LN-2026-84920
  createdAt: string;
  updatedAt: string;
  status: ApplicationStatus;
  personal: CustomerPersonalDetails;
  contact: CustomerContactDetails;
  employment: CustomerEmploymentDetails;
  loan: CustomerLoanDetails;
  documents: UploadedDocument[];
  
  // Admin workflow additions
  approval?: LoanApprovalDetails;
  rejection?: LoanRejectionDetails;
  disbursement?: DisbursementDetails;
  
  // Financial Tracking
  currentOutstandingBalance: number;
  totalPrincipalPaid: number;
  totalInterestPaid: number;
  nextPaymentDueDate?: string;
  repayments: RepaymentRecord[];
  
  adminNotes?: string;
  isDuplicateFlag?: boolean;
}

export interface AmortizationScheduleItem {
  month: number;
  dueDate: string;
  beginningBalance: number;
  monthlyPayment: number;
  principal: number;
  interest: number;
  endingBalance: number;
}

export interface ContactInquiry {
  id: string;
  fullName: string;
  email: string;
  phone?: string;
  subject: string;
  applicationReference?: string;
  message: string;
  createdAt: string;
  status: 'new' | 'in_progress' | 'resolved';
  adminNotes?: string;
}

export interface OTPVerificationChallenge {
  referenceNumber: string;
  targetPhone: string;
  targetEmail: string;
  otpCode: string;
  expiresAt: number;
}

export interface SystemSettings {
  companyName: string;
  tagline: string;
  supportPhone: string;
  supportEmail: string;
  headOfficeAddress: string;
  currencySymbol: string;
  defaultInterestMethod: InterestMethod;
  maintenanceMode: boolean;
}
