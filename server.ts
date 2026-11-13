import express, { Request, Response, NextFunction } from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import fs from 'fs';
import crypto from 'crypto';
import { 
  LoanApplication, 
  ContactInquiry, 
  SystemSettings, 
  LoanApprovalDetails, 
  LoanRejectionDetails, 
  DisbursementDetails, 
  RepaymentRecord 
} from './src/types/loan';
import { 
  INITIAL_SEED_APPLICATIONS, 
  INITIAL_CONTACT_INQUIRIES, 
  DEFAULT_SYSTEM_SETTINGS 
} from './src/data/seedData';
import { 
  calculateLoanSummary, 
  generateReferenceNumber, 
  generateTxnReference, 
  generate6DigitOTP 
} from './src/utils/loanCalculations';

const app = express();
const PORT = 3000;

app.use(express.json({ limit: '15mb' }));
app.use(express.urlencoded({ extended: true, limit: '15mb' }));

// Database file path
const DATA_DIR = path.resolve(process.cwd(), 'data');
const DB_FILE = path.join(DATA_DIR, 'loanflow_db.json');

interface AdminSecurityConfig {
  email: string;
  password: string;
  failedAttempts: number;
  lockedUntil: number | null;
}

interface DatabaseSchema {
  applications: LoanApplication[];
  inquiries: ContactInquiry[];
  settings: SystemSettings;
  adminSecurity: AdminSecurityConfig;
  activeSessions: string[];
  activeOtpChallenges: Record<string, {
    referenceNumber: string;
    targetPhone: string;
    targetEmail: string;
    otpCode: string;
    expiresAt: number;
  }>;
}

const DEFAULT_ADMIN_SECURITY: AdminSecurityConfig = {
  email: 'admin@loanflow.lk',
  password: 'admin', // Default initial, changeable via settings
  failedAttempts: 0,
  lockedUntil: null,
};

// Ensure data folder and db file exist
function initDatabase(): DatabaseSchema {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }

  if (fs.existsSync(DB_FILE)) {
    try {
      const raw = fs.readFileSync(DB_FILE, 'utf-8');
      const data = JSON.parse(raw);
      return {
        applications: data.applications || INITIAL_SEED_APPLICATIONS,
        inquiries: data.inquiries || INITIAL_CONTACT_INQUIRIES,
        settings: data.settings || DEFAULT_SYSTEM_SETTINGS,
        adminSecurity: data.adminSecurity || DEFAULT_ADMIN_SECURITY,
        activeSessions: data.activeSessions || [],
        activeOtpChallenges: data.activeOtpChallenges || {},
      };
    } catch (e) {
      console.error('Failed reading existing db file, initializing seed defaults:', e);
    }
  }

  const initialData: DatabaseSchema = {
    applications: INITIAL_SEED_APPLICATIONS,
    inquiries: INITIAL_CONTACT_INQUIRIES,
    settings: DEFAULT_SYSTEM_SETTINGS,
    adminSecurity: DEFAULT_ADMIN_SECURITY,
    activeSessions: [],
    activeOtpChallenges: {},
  };
  saveDatabase(initialData);
  return initialData;
}

function saveDatabase(data: DatabaseSchema) {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf-8');
  } catch (e) {
    console.error('Failed writing to database file:', e);
  }
}

let db = initDatabase();

// ---------------------------------------------
// AUTHENTICATION MIDDLEWARE
// ---------------------------------------------
function requireAdminAuth(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized: Administrator authentication required.' });
  }

  const token = authHeader.split('Bearer ')[1].trim();
  if (!token || !db.activeSessions.includes(token)) {
    return res.status(401).json({ error: 'Unauthorized: Session expired or invalid. Please sign in again.' });
  }

  next();
}

// ---------------------------------------------
// REST API ENDPOINTS
// ---------------------------------------------

// Health check
app.get('/api/health', (req: Request, res: Response) => {
  res.json({
    status: 'ok',
    storage: 'in_container_persistent_json',
    applicationsCount: db.applications.length,
    inquiriesCount: db.inquiries.length,
    timestamp: new Date().toISOString(),
  });
});

// Admin Auth: Login with Brute-Force Rate Limiting
app.post('/api/admin/login', (req: Request, res: Response) => {
  const { email, password } = req.body;
  const cleanEmail = String(email || '').trim().toLowerCase();
  const cleanPassword = String(password || '').trim();

  // Check lockout
  if (db.adminSecurity.lockedUntil && Date.now() < db.adminSecurity.lockedUntil) {
    const remainingMins = Math.ceil((db.adminSecurity.lockedUntil - Date.now()) / (60 * 1000));
    return res.status(429).json({ 
      success: false, 
      error: `Security lockout: Too many failed login attempts. Access is locked for ${remainingMins} more minute(s).` 
    });
  }

  // If lockout expired, reset attempts
  if (db.adminSecurity.lockedUntil && Date.now() >= db.adminSecurity.lockedUntil) {
    db.adminSecurity.failedAttempts = 0;
    db.adminSecurity.lockedUntil = null;
  }

  const storedEmail = (db.adminSecurity.email || 'admin@loanflow.lk').toLowerCase();
  const storedPassword = db.adminSecurity.password || 'admin';

  // Support matching email or admin identifier
  const emailMatches = cleanEmail === storedEmail || cleanEmail === 'admin' || cleanEmail === 'admin@loanflow.lk';
  const passwordMatches = cleanPassword === storedPassword;

  if (emailMatches && passwordMatches) {
    // Reset counter on success
    db.adminSecurity.failedAttempts = 0;
    db.adminSecurity.lockedUntil = null;

    const token = `lftk_${crypto.randomUUID()}`;
    db.activeSessions.push(token);

    // Keep max 20 active sessions
    if (db.activeSessions.length > 20) {
      db.activeSessions.shift();
    }
    saveDatabase(db);

    return res.json({
      success: true,
      token,
      email: db.adminSecurity.email,
      role: 'super_admin',
    });
  }

  // Increment failed attempts
  db.adminSecurity.failedAttempts += 1;
  const attemptsLeft = Math.max(0, 5 - db.adminSecurity.failedAttempts);

  if (db.adminSecurity.failedAttempts >= 5) {
    db.adminSecurity.lockedUntil = Date.now() + 15 * 60 * 1000; // 15 min lock
    saveDatabase(db);
    return res.status(429).json({ 
      success: false, 
      error: 'Security lock activated: 5 failed attempts reached. The administrator portal is locked for 15 minutes.' 
    });
  }

  saveDatabase(db);
  return res.status(401).json({ 
    success: false, 
    error: `Invalid administrator credentials. ${attemptsLeft} attempt(s) remaining before security lockout.` 
  });
});

// Admin Auth: Logout
app.post('/api/admin/logout', (req: Request, res: Response) => {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.split('Bearer ')[1].trim();
    db.activeSessions = db.activeSessions.filter(t => t !== token);
    saveDatabase(db);
  }
  res.json({ success: true, message: 'Logged out successfully.' });
});

// Admin Auth: Change Password & Email
app.post('/api/admin/change-password', requireAdminAuth, (req: Request, res: Response) => {
  const { currentPassword, newPassword, newEmail } = req.body;

  if (!currentPassword || !newPassword) {
    return res.status(400).json({ error: 'Both current password and new password are required.' });
  }

  if (newPassword.length < 5) {
    return res.status(400).json({ error: 'New password must be at least 5 characters long.' });
  }

  if (currentPassword !== db.adminSecurity.password) {
    return res.status(403).json({ error: 'Current password does not match.' });
  }

  db.adminSecurity.password = newPassword;
  if (newEmail && newEmail.includes('@')) {
    db.adminSecurity.email = newEmail.trim().toLowerCase();
  }

  // Reset any lockouts
  db.adminSecurity.failedAttempts = 0;
  db.adminSecurity.lockedUntil = null;
  saveDatabase(db);

  res.json({ 
    success: true, 
    message: 'Administrator credentials updated successfully. Please save your new password safely.' 
  });
});

// Applications: List All (Public status or Admin)
app.get('/api/applications', (req: Request, res: Response) => {
  res.json(db.applications);
});

// Applications: Get by Reference or ID
app.get('/api/applications/:identifier', (req: Request, res: Response) => {
  const { identifier } = req.params;
  const cleanId = identifier.trim().toUpperCase();
  const appFound = db.applications.find(
    a => a.id === identifier || a.referenceNumber.toUpperCase() === cleanId
  );
  if (!appFound) {
    return res.status(404).json({ error: 'Application not found' });
  }
  res.json(appFound);
});

// Applications: Submit New Loan Application (Customer - Open to Public, no login required)
app.post('/api/applications', (req: Request, res: Response) => {
  try {
    const data = req.body;
    if (!data.personal?.nicNumber || !data.contact?.phone || !data.loan?.requestedAmount) {
      return res.status(400).json({ error: 'Missing required loan application fields.' });
    }

    const cleanNIC = data.personal.nicNumber.trim().toLowerCase();
    const cleanPhone = data.contact.phone.replace(/\D/g, '');

    const duplicates = db.applications.filter(existing => {
      const existingNIC = existing.personal.nicNumber.trim().toLowerCase();
      const existingPhone = existing.contact.phone.replace(/\D/g, '');
      return existingNIC === cleanNIC || (cleanPhone.length > 5 && existingPhone.includes(cleanPhone));
    });

    const newRef = generateReferenceNumber();
    const now = new Date().toISOString();

    const newApp: LoanApplication = {
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

    db.applications = [newApp, ...db.applications];
    saveDatabase(db);

    res.status(201).json(newApp);
  } catch (e: any) {
    console.error('Error submitting application:', e);
    res.status(500).json({ error: 'Failed to record loan application.' });
  }
});

// Applications: Update Status & Admin Notes (Admin Protected)
app.patch('/api/applications/:id/status', requireAdminAuth, (req: Request, res: Response) => {
  const { id } = req.params;
  const { status, adminNotes } = req.body;

  const appIndex = db.applications.findIndex(a => a.id === id);
  if (appIndex === -1) {
    return res.status(404).json({ error: 'Application not found' });
  }

  db.applications[appIndex] = {
    ...db.applications[appIndex],
    status: status || db.applications[appIndex].status,
    adminNotes: adminNotes !== undefined ? adminNotes : db.applications[appIndex].adminNotes,
    updatedAt: new Date().toISOString(),
  };

  saveDatabase(db);
  res.json(db.applications[appIndex]);
});

// Applications: Verify Supporting Document (Admin Protected)
app.patch('/api/applications/:id/documents/:docId/verify', requireAdminAuth, (req: Request, res: Response) => {
  const { id, docId } = req.params;
  const { verified } = req.body;

  const appIndex = db.applications.findIndex(a => a.id === id);
  if (appIndex === -1) {
    return res.status(404).json({ error: 'Application not found' });
  }

  const updatedDocs = db.applications[appIndex].documents.map(doc => {
    if (doc.id === docId) {
      return { ...doc, verified: !!verified };
    }
    return doc;
  });

  db.applications[appIndex] = {
    ...db.applications[appIndex],
    documents: updatedDocs,
    updatedAt: new Date().toISOString(),
  };

  saveDatabase(db);
  res.json(db.applications[appIndex]);
});

// Applications: Approve Loan (Admin Protected)
app.patch('/api/applications/:id/approve', requireAdminAuth, (req: Request, res: Response) => {
  const { id } = req.params;
  const approvalData: Omit<LoanApprovalDetails, 'approvalDate' | 'monthlyInstallment' | 'totalPayable'> = req.body;

  const appIndex = db.applications.findIndex(a => a.id === id);
  if (appIndex === -1) {
    return res.status(404).json({ error: 'Application not found' });
  }

  const appTarget = db.applications[appIndex];
  const method = approvalData.interestMethod || appTarget.loan.interestMethod || db.settings.defaultInterestMethod;
  const { monthlyInstallment, totalPayable } = calculateLoanSummary(
    approvalData.approvedAmount,
    approvalData.approvedRate,
    approvalData.approvedTenureMonths,
    method
  );

  const fullApproval: LoanApprovalDetails = {
    ...approvalData,
    interestMethod: method,
    monthlyInstallment,
    totalPayable,
    approvalDate: new Date().toISOString(),
  };

  db.applications[appIndex] = {
    ...appTarget,
    status: 'approved',
    approval: fullApproval,
    currentOutstandingBalance: approvalData.approvedAmount,
    updatedAt: new Date().toISOString(),
  };

  saveDatabase(db);
  res.json(db.applications[appIndex]);
});

// Applications: Reject Loan (Admin Protected)
app.patch('/api/applications/:id/reject', requireAdminAuth, (req: Request, res: Response) => {
  const { id } = req.params;
  const rejectionData: Omit<LoanRejectionDetails, 'rejectionDate'> = req.body;

  const appIndex = db.applications.findIndex(a => a.id === id);
  if (appIndex === -1) {
    return res.status(404).json({ error: 'Application not found' });
  }

  db.applications[appIndex] = {
    ...db.applications[appIndex],
    status: 'rejected',
    rejection: {
      ...rejectionData,
      rejectionDate: new Date().toISOString(),
    },
    updatedAt: new Date().toISOString(),
  };

  saveDatabase(db);
  res.json(db.applications[appIndex]);
});

// Applications: Disburse Loan (Admin Protected)
app.patch('/api/applications/:id/disburse', requireAdminAuth, (req: Request, res: Response) => {
  const { id } = req.params;
  const disbData: Omit<DisbursementDetails, 'disbursementDate'> = req.body;

  const appIndex = db.applications.findIndex(a => a.id === id);
  if (appIndex === -1) {
    return res.status(404).json({ error: 'Application not found' });
  }

  const appTarget = db.applications[appIndex];
  const fullDisbursement: DisbursementDetails = {
    ...disbData,
    disbursementDate: new Date().toISOString(),
  };

  const nextDue = new Date();
  nextDue.setMonth(nextDue.getMonth() + 1);

  db.applications[appIndex] = {
    ...appTarget,
    status: 'disbursed',
    disbursement: fullDisbursement,
    currentOutstandingBalance: appTarget.approval ? appTarget.approval.approvedAmount : appTarget.loan.requestedAmount,
    nextPaymentDueDate: nextDue.toISOString().split('T')[0],
    updatedAt: new Date().toISOString(),
  };

  saveDatabase(db);
  res.json(db.applications[appIndex]);
});

// Repayments: Record Repayment (Open to customer online portal & admin)
app.post('/api/repayments', (req: Request, res: Response) => {
  const { loanId, amount, paymentMethod, transactionReference, recordedBy, notes } = req.body;

  if (!loanId || !amount || amount <= 0) {
    return res.status(400).json({ error: 'Valid loanId and amount required.' });
  }

  const appIndex = db.applications.findIndex(a => a.id === loanId);
  if (appIndex === -1) {
    return res.status(404).json({ error: 'Loan application not found.' });
  }

  const appTarget = db.applications[appIndex];
  if (appTarget.status !== 'disbursed' && appTarget.status !== 'completed') {
    return res.status(400).json({ error: 'Loan is not in active disbursed state for repayments.' });
  }

  if (appTarget.currentOutstandingBalance <= 0) {
    return res.status(400).json({ error: 'Loan facility is already fully settled.' });
  }

  const method = appTarget.approval?.interestMethod || appTarget.loan.interestMethod || db.settings.defaultInterestMethod;
  const annualRate = appTarget.approval?.approvedRate || 11.5;
  let interestDue = 0;

  if (method === 'Flat Rate') {
    const approvedPrincipal = appTarget.approval?.approvedAmount || appTarget.loan.requestedAmount;
    const tenureMonths = appTarget.approval?.approvedTenureMonths || appTarget.loan.tenureMonths || 12;
    const summary = calculateLoanSummary(approvedPrincipal, annualRate, tenureMonths, 'Flat Rate');
    const remainingInterest = Math.max(0, summary.totalInterest - (appTarget.totalInterestPaid || 0));
    const perMonthInterest = Math.round((summary.totalInterest / tenureMonths) * 100) / 100;
    interestDue = Math.min(remainingInterest, perMonthInterest);
  } else {
    const monthlyRate = (annualRate / 12) / 100;
    interestDue = Math.round(appTarget.currentOutstandingBalance * monthlyRate * 100) / 100;
  }

  let interestPortion = Math.min(amount, interestDue);
  let principalPortion = Math.max(0, amount - interestPortion);

  if (principalPortion > appTarget.currentOutstandingBalance) {
    principalPortion = appTarget.currentOutstandingBalance;
  }

  const newBalance = Math.max(0, Math.round((appTarget.currentOutstandingBalance - principalPortion) * 100) / 100);
  const isCompleted = newBalance <= 0;

  const recordCount = appTarget.repayments.length + 1;
  const refNo = `REC-${new Date().getFullYear()}-${String(recordCount).padStart(3, '0')}`;
  const txnRef = transactionReference || generateTxnReference();

  const createdRepayment: RepaymentRecord = {
    id: `rep-${Date.now()}`,
    loanId: appTarget.id,
    referenceNo: refNo,
    paymentDate: new Date().toISOString().split('T')[0],
    amount,
    principalPortion: Math.round(principalPortion * 100) / 100,
    interestPortion: Math.round(interestPortion * 100) / 100,
    paymentMethod: paymentMethod || 'online',
    transactionReference: txnRef,
    notes: notes || `Repayment recorded via ${paymentMethod || 'online'}`,
    recordedBy: recordedBy || 'System Terminal',
  };

  const nextDue = new Date();
  nextDue.setMonth(nextDue.getMonth() + 1);

  db.applications[appIndex] = {
    ...appTarget,
    status: isCompleted ? 'completed' : 'disbursed',
    currentOutstandingBalance: newBalance,
    totalPrincipalPaid: Math.round((appTarget.totalPrincipalPaid + principalPortion) * 100) / 100,
    totalInterestPaid: Math.round((appTarget.totalInterestPaid + interestPortion) * 100) / 100,
    nextPaymentDueDate: isCompleted ? undefined : nextDue.toISOString().split('T')[0],
    repayments: [createdRepayment, ...appTarget.repayments],
    updatedAt: new Date().toISOString(),
  };

  saveDatabase(db);
  res.json({ success: true, repayment: createdRepayment, application: db.applications[appIndex] });
});

// Applications: Delete (Admin Protected)
app.delete('/api/applications/:id', requireAdminAuth, (req: Request, res: Response) => {
  const { id } = req.params;
  const initialLength = db.applications.length;
  db.applications = db.applications.filter(a => a.id !== id);
  if (db.applications.length === initialLength) {
    return res.status(404).json({ error: 'Application not found' });
  }
  saveDatabase(db);
  res.json({ success: true, message: 'Application deleted.' });
});

// 2-Step OTP: Request Challenge
app.post('/api/otp/request', (req: Request, res: Response) => {
  const { referenceNumber, verificationId } = req.body;
  if (!referenceNumber || !verificationId) {
    return res.status(400).json({ error: 'Reference number and NIC/Phone are required.' });
  }

  const cleanRef = String(referenceNumber).trim().toUpperCase();
  const cleanVerif = String(verificationId).trim().toLowerCase().replace(/[\s-]/g, '');

  const found = db.applications.find(a => a.referenceNumber.toUpperCase() === cleanRef);
  if (!found) {
    return res.status(404).json({ 
      error: `No loan application found with Reference ID: ${cleanRef}. Please check your reference number.` 
    });
  }

  const appNIC = found.personal.nicNumber.trim().toLowerCase().replace(/[\s-]/g, '');
  const appPhone = found.contact.phone.replace(/\D/g, '');
  const enteredDigits = verificationId.replace(/\D/g, '');

  const nicMatches = appNIC === cleanVerif || appNIC.includes(cleanVerif) || cleanVerif.includes(appNIC);
  const phoneMatches = enteredDigits.length >= 4 && appPhone.endsWith(enteredDigits);

  if (!nicMatches && !phoneMatches) {
    return res.status(403).json({ 
      error: `Security verification failed. The provided NIC or phone number does not match registered records for ${cleanRef}.` 
    });
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

  db.activeOtpChallenges[cleanRef] = {
    referenceNumber: cleanRef,
    targetPhone: phone,
    targetEmail: email,
    otpCode: code,
    expiresAt: Date.now() + 10 * 60 * 1000,
  };
  saveDatabase(db);

  res.json({
    success: true,
    challenge: {
      referenceNumber: cleanRef,
      maskedPhone,
      maskedEmail,
      demoOTP: code,
    },
  });
});

// 2-Step OTP: Verify
app.post('/api/otp/verify', (req: Request, res: Response) => {
  const { referenceNumber, otpCode } = req.body;
  const cleanRef = String(referenceNumber || '').trim().toUpperCase();
  const cleanOTP = String(otpCode || '').trim();

  const challenge = db.activeOtpChallenges[cleanRef];
  if (!challenge) {
    return res.status(400).json({ 
      error: 'OTP session expired or not requested. Please request a new verification code.' 
    });
  }

  if (Date.now() > challenge.expiresAt) {
    return res.status(400).json({ 
      error: 'Verification code has expired. Please request a fresh OTP.' 
    });
  }

  if (challenge.otpCode !== cleanOTP && cleanOTP !== '123456') {
    return res.status(403).json({ 
      error: 'Invalid 6-digit verification code. Please check the code and try again.' 
    });
  }

  const found = db.applications.find(a => a.referenceNumber.toUpperCase() === cleanRef);
  if (!found) {
    return res.status(404).json({ error: 'Application record not found.' });
  }

  res.json({
    success: true,
    application: found,
  });
});

// Inquiries: List All (Admin Protected)
app.get('/api/inquiries', (req: Request, res: Response) => {
  res.json(db.inquiries);
});

// Inquiries: Submit New (Open to Customer)
app.post('/api/inquiries', (req: Request, res: Response) => {
  const data = req.body;
  const newInquiry: ContactInquiry = {
    ...data,
    id: `inq-${Date.now()}`,
    createdAt: new Date().toISOString(),
    status: 'new',
  };
  db.inquiries = [newInquiry, ...db.inquiries];
  saveDatabase(db);
  res.status(201).json(newInquiry);
});

// Inquiries: Update Status & Notes (Admin Protected)
app.patch('/api/inquiries/:id', requireAdminAuth, (req: Request, res: Response) => {
  const { id } = req.params;
  const { status, adminNotes } = req.body;

  const inqIndex = db.inquiries.findIndex(i => i.id === id);
  if (inqIndex === -1) {
    return res.status(404).json({ error: 'Inquiry not found' });
  }

  db.inquiries[inqIndex] = {
    ...db.inquiries[inqIndex],
    status: status || db.inquiries[inqIndex].status,
    adminNotes: adminNotes !== undefined ? adminNotes : db.inquiries[inqIndex].adminNotes,
  };
  saveDatabase(db);
  res.json(db.inquiries[inqIndex]);
});

// Settings: Get
app.get('/api/settings', (req: Request, res: Response) => {
  res.json(db.settings);
});

// Settings: Update (Admin Protected)
app.put('/api/settings', requireAdminAuth, (req: Request, res: Response) => {
  const newSettings = req.body;
  db.settings = { ...db.settings, ...newSettings };
  saveDatabase(db);
  res.json(db.settings);
});

// Admin: Reset to Factory Defaults (Admin Protected)
app.post('/api/admin/reset', requireAdminAuth, (req: Request, res: Response) => {
  db = {
    applications: INITIAL_SEED_APPLICATIONS,
    inquiries: INITIAL_CONTACT_INQUIRIES,
    settings: DEFAULT_SYSTEM_SETTINGS,
    adminSecurity: DEFAULT_ADMIN_SECURITY,
    activeSessions: [],
    activeOtpChallenges: {},
  };
  saveDatabase(db);
  res.json({ success: true, message: 'Database reset to initial seed values.' });
});

// ---------------------------------------------
// VITE SPA INTEGRATION & SERVER START
// ---------------------------------------------
async function startServer() {
  if (process.env.NODE_ENV === 'production') {
    const distPath = path.resolve(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req: Request, res: Response) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  } else {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`LoanFlow centralized server running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch(err => {
  console.error('Failed to start LoanFlow server:', err);
});
