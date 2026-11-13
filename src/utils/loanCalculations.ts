import { AmortizationScheduleItem, InterestMethod } from '../types/loan';

/**
 * Calculate Monthly EMI using Reducing Balance Method (Compound Amortization)
 * EMI = P * r * (1 + r)^n / ((1 + r)^n - 1)
 */
export function calculateReducingBalanceEMI(principal: number, annualRatePercent: number, tenureMonths: number): number {
  if (principal <= 0 || tenureMonths <= 0) return 0;
  if (annualRatePercent <= 0) return principal / tenureMonths;

  const monthlyRate = annualRatePercent / 12 / 100;
  const factor = Math.pow(1 + monthlyRate, tenureMonths);
  const emi = (principal * monthlyRate * factor) / (factor - 1);
  return isNaN(emi) ? 0 : Math.round(emi * 100) / 100;
}

/**
 * Calculate Monthly Payment using Flat Rate Method
 * Total Interest = P * (R / 100) * (T in years)
 * Total Repayment = P + Total Interest
 * Monthly Installment = Total Repayment / n
 */
export function calculateFlatRateInstallment(principal: number, annualRatePercent: number, tenureMonths: number): {
  monthlyInstallment: number;
  totalInterest: number;
  totalPayable: number;
} {
  if (principal <= 0 || tenureMonths <= 0) {
    return { monthlyInstallment: 0, totalInterest: 0, totalPayable: 0 };
  }
  const timeInYears = tenureMonths / 12;
  const totalInterest = Math.round(principal * (annualRatePercent / 100) * timeInYears * 100) / 100;
  const totalPayable = Math.round((principal + totalInterest) * 100) / 100;
  const monthlyInstallment = Math.round((totalPayable / tenureMonths) * 100) / 100;

  return {
    monthlyInstallment,
    totalInterest,
    totalPayable,
  };
}

/**
 * Unified loan summary helper used across Calculator, Application Form, Admin Approval, and Server
 */
export function calculateLoanSummary(
  principal: number,
  annualRatePercent: number,
  tenureMonths: number,
  method: InterestMethod = 'Reducing Balance'
): {
  monthlyInstallment: number;
  totalInterest: number;
  totalPayable: number;
} {
  if (principal <= 0 || tenureMonths <= 0) {
    return { monthlyInstallment: 0, totalInterest: 0, totalPayable: 0 };
  }

  if (method === 'Flat Rate') {
    return calculateFlatRateInstallment(principal, annualRatePercent, tenureMonths);
  }

  const monthlyInstallment = calculateReducingBalanceEMI(principal, annualRatePercent, tenureMonths);
  const totalPayable = Math.round(monthlyInstallment * tenureMonths * 100) / 100;
  const totalInterest = Math.round(Math.max(0, totalPayable - principal) * 100) / 100;

  return {
    monthlyInstallment,
    totalInterest,
    totalPayable,
  };
}

/**
 * General Monthly Installment calculation supporting both calculation methods
 */
export function calculateEMI(
  principal: number, 
  annualRatePercent: number, 
  tenureMonths: number,
  method: InterestMethod = 'Reducing Balance'
): number {
  if (method === 'Flat Rate') {
    return calculateFlatRateInstallment(principal, annualRatePercent, tenureMonths).monthlyInstallment;
  }
  return calculateReducingBalanceEMI(principal, annualRatePercent, tenureMonths);
}

/**
 * Generate full month-by-month Amortization Schedule
 */
export function generateAmortizationSchedule(
  principal: number,
  annualRatePercent: number,
  tenureMonths: number,
  method: InterestMethod = 'Reducing Balance',
  startDate: Date = new Date()
): AmortizationScheduleItem[] {
  const schedule: AmortizationScheduleItem[] = [];
  if (principal <= 0 || tenureMonths <= 0) return schedule;

  if (method === 'Flat Rate') {
    const flat = calculateFlatRateInstallment(principal, annualRatePercent, tenureMonths);
    const monthlyPrincipal = Math.round((principal / tenureMonths) * 100) / 100;
    const monthlyInterest = Math.round((flat.totalInterest / tenureMonths) * 100) / 100;
    let currentBalance = principal;
    let accumulatedInterest = 0;

    for (let month = 1; month <= tenureMonths; month++) {
      const isLastMonth = month === tenureMonths;
      const principalPaid = isLastMonth
        ? Math.round(currentBalance * 100) / 100
        : Math.min(monthlyPrincipal, Math.round(currentBalance * 100) / 100);
      const interestPaid = isLastMonth
        ? Math.round(Math.max(0, flat.totalInterest - accumulatedInterest) * 100) / 100
        : monthlyInterest;
      const rowPayment = Math.round((principalPaid + interestPaid) * 100) / 100;
      const endingBalance = isLastMonth
        ? 0
        : Math.max(0, Math.round((currentBalance - principalPaid) * 100) / 100);

      const dueDate = new Date(startDate);
      dueDate.setMonth(dueDate.getMonth() + month);

      schedule.push({
        month,
        dueDate: dueDate.toISOString().split('T')[0],
        beginningBalance: Math.round(currentBalance * 100) / 100,
        monthlyPayment: rowPayment,
        principal: principalPaid,
        interest: interestPaid,
        endingBalance,
      });

      accumulatedInterest = Math.round((accumulatedInterest + interestPaid) * 100) / 100;
      currentBalance = endingBalance;
      if (currentBalance <= 0) break;
    }

    return schedule;
  }

  // Reducing Balance
  const monthlyRate = annualRatePercent / 12 / 100;
  const monthlyPayment = calculateReducingBalanceEMI(principal, annualRatePercent, tenureMonths);
  let currentBalance = principal;

  for (let month = 1; month <= tenureMonths; month++) {
    const interest = Math.round(currentBalance * monthlyRate * 100) / 100;
    const isLastMonth = month === tenureMonths;
    let principalPaid = Math.round((monthlyPayment - interest) * 100) / 100;

    if (isLastMonth || principalPaid >= currentBalance) {
      principalPaid = Math.round(currentBalance * 100) / 100;
    }

    const rowPayment = Math.round((principalPaid + interest) * 100) / 100;
    const endingBalance = Math.max(0, Math.round((currentBalance - principalPaid) * 100) / 100);

    const dueDate = new Date(startDate);
    dueDate.setMonth(dueDate.getMonth() + month);

    schedule.push({
      month,
      dueDate: dueDate.toISOString().split('T')[0],
      beginningBalance: Math.round(currentBalance * 100) / 100,
      monthlyPayment: rowPayment,
      principal: Math.round(principalPaid * 100) / 100,
      interest: Math.round(interest * 100) / 100,
      endingBalance,
    });

    currentBalance = endingBalance;
    if (currentBalance <= 0) break;
  }

  return schedule;
}

/**
 * Format currency with Rs. symbol and standard comma separation
 * Example: Rs. 500,000.00
 */
export function formatCurrency(amount: number): string {
  const numeric = amount || 0;
  const formatted = numeric.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  return `Rs. ${formatted}`;
}

/**
 * Format currency compact (e.g. Rs. 250K, Rs. 1.5M)
 */
export function formatCurrencyCompact(amount: number): string {
  const numeric = amount || 0;
  if (numeric >= 1_000_000) {
    return `Rs. ${(numeric / 1_000_000).toFixed(1)}M`;
  }
  if (numeric >= 1_000) {
    return `Rs. ${(numeric / 1_000).toFixed(0)}K`;
  }
  return `Rs. ${numeric.toFixed(0)}`;
}

/**
 * Calculate Debt-To-Income (DTI) Ratio
 */
export function calculateDTI(
  monthlyIncome: number,
  existingCommitments: number,
  newMonthlyPayment: number
): { ratio: number; risk: 'low' | 'moderate' | 'high' } {
  if (monthlyIncome <= 0) return { ratio: 100, risk: 'high' };
  const totalDebtService = existingCommitments + newMonthlyPayment;
  const ratio = (totalDebtService / monthlyIncome) * 100;

  let risk: 'low' | 'moderate' | 'high' = 'low';
  if (ratio > 50) {
    risk = 'high';
  } else if (ratio > 35) {
    risk = 'moderate';
  }

  return {
    ratio: Math.round(ratio * 10) / 10,
    risk,
  };
}

/**
 * Generate unique application reference number
 * Example: LN-2026-48192
 */
export function generateReferenceNumber(): string {
  const year = new Date().getFullYear();
  const randomFiveDigits = Math.floor(10000 + Math.random() * 90000);
  return `LN-${year}-${randomFiveDigits}`;
}

/**
 * Generate unique transaction reference number
 * Example: TXN-892147
 */
export function generateTxnReference(): string {
  const randomNum = Math.floor(100000 + Math.random() * 900000);
  return `TXN-${randomNum}`;
}

/**
 * Generate 6-digit OTP code for secure customer verification
 */
export function generate6DigitOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}
