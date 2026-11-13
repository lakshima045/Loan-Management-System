import React, { useState, useEffect } from 'react';
import { 
  Calculator, 
  ArrowRight, 
  RotateCcw,
  Clock, 
  Table, 
  ChevronDown, 
  ChevronUp,
  Percent,
  HelpCircle
} from 'lucide-react';
import { 
  calculateLoanSummary,
  generateAmortizationSchedule, 
  formatCurrency 
} from '../../utils/loanCalculations';
import { LoanCategory, InterestMethod } from '../../types/loan';
import { LOAN_PRODUCTS } from '../../data/loanProducts';

interface LoanCalculatorProps {
  initialAmount?: number;
  initialRate?: number;
  initialTenure?: number;
  initialCategory?: LoanCategory;
  initialMethod?: InterestMethod;
  onApplyWithCalculation: (calc: { amount: number; rate: number; tenure: number; category: LoanCategory; method: InterestMethod }) => void;
}

export const LoanCalculator: React.FC<LoanCalculatorProps> = ({
  initialAmount = 500000,
  initialRate = 11.5,
  initialTenure = 24,
  initialCategory = 'personal',
  initialMethod = 'Reducing Balance',
  onApplyWithCalculation,
}) => {
  const [category, setCategory] = useState<LoanCategory>(initialCategory);
  const [amount, setAmount] = useState<number>(initialAmount);
  const [rate, setRate] = useState<number>(initialRate);
  const [tenureMonths, setTenureMonths] = useState<number>(initialTenure);
  const [method, setMethod] = useState<InterestMethod>(initialMethod);
  const [showSchedule, setShowSchedule] = useState<boolean>(false);

  // Sync if user navigates from Loan Services with specific product parameters
  useEffect(() => {
    setCategory(initialCategory);
    setAmount(initialAmount);
    setRate(initialRate);
    setTenureMonths(initialTenure);
    setMethod(initialMethod);
  }, [initialCategory, initialAmount, initialRate, initialTenure, initialMethod]);

  // Selected product boundaries
  const currentProduct = LOAN_PRODUCTS.find(p => p.id === category) || LOAN_PRODUCTS[0];

  const clampAmount = (val: number) =>
    Math.min(currentProduct.maxAmount, Math.max(currentProduct.minAmount, Math.round(val)));
  const clampTenure = (val: number) =>
    Math.min(currentProduct.maxTenureMonths, Math.max(currentProduct.minTenureMonths, Math.round(val)));
  const clampRate = (val: number) =>
    Math.min(30, Math.max(1, Math.round(val * 10) / 10));

  const safeAmount = clampAmount(amount || currentProduct.minAmount);
  const safeTenure = clampTenure(tenureMonths || currentProduct.minTenureMonths);
  const safeRate = clampRate(rate || currentProduct.defaultAnnualRate);

  const handleCategoryChange = (newCategory: LoanCategory) => {
    setCategory(newCategory);
    const prod = LOAN_PRODUCTS.find(p => p.id === newCategory);
    if (prod) {
      setRate(prod.defaultAnnualRate);
      setMethod(prod.defaultMethod);
      if (amount < prod.minAmount) setAmount(prod.minAmount);
      if (amount > prod.maxAmount) setAmount(prod.maxAmount);
      if (tenureMonths < prod.minTenureMonths) setTenureMonths(prod.minTenureMonths);
      if (tenureMonths > prod.maxTenureMonths) setTenureMonths(prod.maxTenureMonths);
    }
  };

  const handleReset = () => {
    const prod = LOAN_PRODUCTS.find(p => p.id === 'personal') || LOAN_PRODUCTS[0];
    setCategory('personal');
    setAmount(500000);
    setRate(prod.defaultAnnualRate);
    setTenureMonths(24);
    setMethod(prod.defaultMethod);
    setShowSchedule(false);
  };

  // Calculations (using unified calculator helper)
  const { monthlyInstallment, totalInterest, totalPayable } = calculateLoanSummary(
    safeAmount,
    safeRate,
    safeTenure,
    method
  );
  const interestPercentage = totalPayable > 0 ? (totalInterest / totalPayable) * 100 : 0;
  const principalPercentage = Math.max(0, 100 - interestPercentage);

  const amortizationSchedule = generateAmortizationSchedule(safeAmount, safeRate, safeTenure, method);

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-16">
      {/* Header */}
      <div className="text-center space-y-2">
        <span className="text-xs font-bold uppercase tracking-wider text-[#1769E0] block">
          Loan Payment Calculator
        </span>
        <h2 className="text-2xl sm:text-3xl font-bold text-[#102A56] tracking-tight">
          Check Your Monthly Loan Payment
        </h2>
        <p className="text-slate-600 text-xs sm:text-sm max-w-xl mx-auto">
          Pick a loan type, choose how much you want to borrow, and see your monthly payment in Sri Lankan Rupees (Rs.) right away.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Controls Card */}
        <div className="lg:col-span-7 bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-6">
          {/* Facility Selector — All 6 Loan Types */}
          <div className="space-y-2">
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide">
              1. Pick a Loan Type
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {LOAN_PRODUCTS.map((prod) => (
                <button
                  key={prod.id}
                  type="button"
                  onClick={() => handleCategoryChange(prod.id)}
                  className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                    category === prod.id
                      ? 'border-[#1769E0] bg-blue-50/70 text-[#102A56] font-bold shadow-xs'
                      : 'border-slate-200 hover:border-slate-300 text-slate-700'
                  }`}
                >
                  <p className="text-xs truncate">{prod.name}</p>
                  <p className="text-[11px] text-slate-500 font-mono-numbers">
                    {prod.defaultAnnualRate}% · {prod.defaultMethod === 'Flat Rate' ? 'Flat' : 'Reducing'}
                  </p>
                </button>
              ))}
            </div>
          </div>

          {/* Interest Method Selector */}
          <div className="space-y-2 pt-1">
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide flex flex-wrap items-center justify-between gap-1">
              <span>2. How Interest Is Counted</span>
              <span className="text-[10px] text-slate-500 font-normal normal-case">
                {method === 'Reducing Balance'
                  ? 'Interest drops every month as you pay back'
                  : 'Fixed interest counted on full loan amount'}
              </span>
            </label>
            <div className="grid grid-cols-2 gap-2 p-1 bg-slate-100 rounded-xl">
              <button
                type="button"
                onClick={() => setMethod('Reducing Balance')}
                className={`py-2 px-3 rounded-lg text-xs font-semibold transition-all cursor-pointer text-center ${
                  method === 'Reducing Balance'
                    ? 'bg-white text-[#1769E0] shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Reducing Balance (Lower Interest)
              </button>
              <button
                type="button"
                onClick={() => setMethod('Flat Rate')}
                className={`py-2 px-3 rounded-lg text-xs font-semibold transition-all cursor-pointer text-center ${
                  method === 'Flat Rate'
                    ? 'bg-white text-[#1769E0] shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Flat Rate (Fixed Interest)
              </button>
            </div>
          </div>

          {/* Loan Amount Slider & Input */}
          <div className="space-y-3 pt-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wide">
                3. How Much Do You Need?
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-semibold text-xs">Rs.</span>
                <input
                  type="number"
                  min={currentProduct.minAmount}
                  max={currentProduct.maxAmount}
                  step={10000}
                  value={amount || ''}
                  onChange={(e) => setAmount(e.target.value === '' ? 0 : Number(e.target.value))}
                  onBlur={() => setAmount(safeAmount)}
                  className="w-40 pl-9 pr-3 py-1.5 text-right font-extrabold text-[#102A56] bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-[#1769E0] font-mono-numbers"
                />
              </div>
            </div>

            <input
              type="range"
              min={currentProduct.minAmount}
              max={currentProduct.maxAmount}
              step={5000}
              value={safeAmount}
              onChange={(e) => setAmount(Number(e.target.value))}
              className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-[#1769E0]"
            />

            <div className="flex justify-between text-[11px] text-slate-400 font-mono-numbers">
              <span>Min: {formatCurrency(currentProduct.minAmount)}</span>
              <span>Max: {formatCurrency(currentProduct.maxAmount)}</span>
            </div>
          </div>

          {/* Tenure Slider & Input */}
          <div className="space-y-3 pt-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wide flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-[#1769E0]" />
                <span>4. Pay Back Time (Months)</span>
              </label>
              <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5">
                <input
                  type="number"
                  min={currentProduct.minTenureMonths}
                  max={currentProduct.maxTenureMonths}
                  value={tenureMonths || ''}
                  onChange={(e) => setTenureMonths(e.target.value === '' ? 0 : Number(e.target.value))}
                  onBlur={() => setTenureMonths(safeTenure)}
                  className="w-12 text-right font-bold text-[#102A56] bg-transparent focus:outline-none text-sm font-mono-numbers"
                />
                <span className="text-xs text-slate-500 font-medium">Months</span>
              </div>
            </div>

            <input
              type="range"
              min={currentProduct.minTenureMonths}
              max={currentProduct.maxTenureMonths}
              value={safeTenure}
              onChange={(e) => setTenureMonths(Number(e.target.value))}
              className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-[#1769E0]"
            />

            <div className="flex justify-between text-[11px] text-slate-400 font-mono-numbers">
              <span>{currentProduct.minTenureMonths} Months ({Math.round((currentProduct.minTenureMonths / 12) * 10) / 10} yr)</span>
              <span>{currentProduct.maxTenureMonths} Months ({Math.round(currentProduct.maxTenureMonths / 12)} yrs)</span>
            </div>
          </div>

          {/* Annual Interest Rate */}
          <div className="space-y-3 pt-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wide flex items-center gap-1.5">
                <Percent className="w-3.5 h-3.5 text-[#1769E0]" />
                <span>5. Yearly Interest Rate (%)</span>
              </label>
              <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5">
                <input
                  type="number"
                  step="0.1"
                  min={1}
                  max={30}
                  value={rate || ''}
                  onChange={(e) => setRate(e.target.value === '' ? 0 : Number(e.target.value))}
                  onBlur={() => setRate(safeRate)}
                  className="w-14 text-right font-bold text-[#102A56] bg-transparent focus:outline-none text-sm font-mono-numbers"
                />
                <span className="text-xs text-slate-500 font-medium">%</span>
              </div>
            </div>

            <input
              type="range"
              min={1}
              max={30}
              step={0.1}
              value={safeRate}
              onChange={(e) => setRate(Number(e.target.value))}
              className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-[#1769E0]"
            />

            <div className="flex justify-between text-[11px] text-slate-400 font-mono-numbers">
              <span>1%</span>
              <span>Default for {currentProduct.name}: {currentProduct.defaultAnnualRate}%</span>
              <span>30%</span>
            </div>
          </div>

          <div className="pt-2 flex justify-end">
            <button
              type="button"
              onClick={handleReset}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset Numbers</span>
            </button>
          </div>
        </div>

        {/* Results Summary Card */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-gradient-to-br from-[#102A56] via-[#071B3A] to-[#102A56] rounded-3xl text-white p-7 sm:p-8 shadow-xl border border-slate-800 space-y-6">
            <div>
              <span className="text-xs uppercase tracking-wider text-blue-300 font-semibold block">
                Your Monthly Payment (Est.)
              </span>
              <div className="mt-2 flex items-baseline gap-2">
                <span className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white font-mono-numbers">
                  {formatCurrency(monthlyInstallment)}
                </span>
                <span className="text-xs text-slate-400">/ month</span>
              </div>
              <p className="text-xs text-blue-200/80 mt-1">
                Paid every month for {safeTenure} months ({method}) at {safeRate}% yearly
              </p>
            </div>

            {/* Proportion Bar */}
            <div className="space-y-2 pt-2 border-t border-slate-800">
              <div className="flex justify-between text-xs font-medium">
                <span className="text-blue-300">Loan Amount: {Math.round(principalPercentage)}%</span>
                <span className="text-amber-300">Interest: {Math.round(interestPercentage)}%</span>
              </div>
              <div className="w-full h-3 bg-slate-800 rounded-full overflow-hidden flex">
                <div
                  style={{ width: `${principalPercentage}%` }}
                  className="bg-[#1769E0] h-full transition-all duration-300"
                  title={`Loan Amount: ${formatCurrency(safeAmount)}`}
                />
                <div
                  style={{ width: `${interestPercentage}%` }}
                  className="bg-amber-400 h-full transition-all duration-300"
                  title={`Total Interest: ${formatCurrency(totalInterest)}`}
                />
              </div>
            </div>

            {/* Breakdown List */}
            <div className="space-y-3 pt-2 text-xs border-t border-slate-800">
              <div className="flex justify-between py-1 border-b border-slate-800/60">
                <span className="text-slate-400">Amount You Borrow</span>
                <span className="font-semibold text-slate-200 font-mono-numbers">{formatCurrency(safeAmount)}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-800/60">
                <span className="text-slate-400">Total Interest Cost</span>
                <span className="font-semibold text-amber-300 font-mono-numbers">{formatCurrency(totalInterest)}</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-slate-300 font-medium">Total You Will Pay Back</span>
                <span className="font-bold text-white text-sm font-mono-numbers">{formatCurrency(totalPayable)}</span>
              </div>
            </div>

            {/* Simple explanation box for Reducing vs Flat */}
            <div className="p-3 rounded-xl bg-white/5 border border-white/10 text-[11px] text-blue-100/90 leading-relaxed flex items-start gap-2">
              <HelpCircle className="w-3.5 h-3.5 text-blue-300 shrink-0 mt-0.5" />
              <span>
                {method === 'Reducing Balance' ? (
                  <>
                    <strong>Why is interest lower?</strong> With Reducing Balance, you only pay {safeRate}% interest on the unpaid balance left each month—not on the full {formatCurrency(safeAmount)}.
                  </>
                ) : (
                  <>
                    <strong>Flat Rate formula:</strong> {formatCurrency(safeAmount)} × {safeRate}% × {(safeTenure / 12).toFixed(2).replace(/\.00$/, '')} yr = {formatCurrency(totalInterest)} total interest.
                  </>
                )}
              </span>
            </div>

            {/* Small note */}
            <p className="text-[11px] text-slate-400 italic leading-normal">
              * This is an estimate to help you plan. Final numbers will be confirmed when our officer approves your loan.
            </p>

            {/* Action Buttons */}
            <div className="pt-2 space-y-2.5">
              <button
                type="button"
                onClick={() => onApplyWithCalculation({ amount: safeAmount, rate: safeRate, tenure: safeTenure, category, method })}
                className="w-full py-3 px-4 rounded-xl bg-[#1769E0] hover:bg-[#0B4DBB] text-white font-bold flex items-center justify-center gap-2 transition-all shadow-lg shadow-blue-500/25 text-xs cursor-pointer"
              >
                <span>Apply for This Loan</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                type="button"
                onClick={() => setShowSchedule(!showSchedule)}
                className="w-full py-2 px-3 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 text-xs font-semibold flex items-center justify-center gap-1.5 transition-all border border-white/10 cursor-pointer"
              >
                <Table className="w-3.5 h-3.5 text-blue-400" />
                <span>{showSchedule ? 'Hide Month-by-Month Plan' : 'See Month-by-Month Payment Plan'}</span>
                {showSchedule ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Expandable Amortization Schedule */}
      {showSchedule && (
        <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-4 animate-in fade-in slide-in-from-top-4 duration-200">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h3 className="text-base font-bold text-[#102A56]">
                Month-by-Month Payment Plan ({method})
              </h3>
              <p className="text-xs text-slate-500">
                See how each monthly payment lowers your loan balance in Sri Lankan Rupees (Rs.)
              </p>
            </div>
            <span className="text-xs bg-blue-50 text-[#1769E0] px-3 py-1 rounded-full font-mono-numbers font-semibold">
              {amortizationSchedule.length} Months Total
            </span>
          </div>

          <div className="overflow-x-auto max-h-96 border border-slate-200 rounded-2xl">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-50 text-slate-600 font-semibold sticky top-0 border-b border-slate-200">
                <tr>
                  <th className="py-2.5 px-3">Month #</th>
                  <th className="py-2.5 px-3">Due Date</th>
                  <th className="py-2.5 px-3">Start Balance</th>
                  <th className="py-2.5 px-3 text-[#1769E0]">Monthly Payment</th>
                  <th className="py-2.5 px-3 text-emerald-700">Goes to Loan</th>
                  <th className="py-2.5 px-3 text-amber-700">Goes to Interest</th>
                  <th className="py-2.5 px-3 text-right">Balance Left</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-mono-numbers">
                {amortizationSchedule.map((row) => (
                  <tr key={row.month} className="hover:bg-slate-50/70">
                    <td className="py-2 px-3 font-semibold text-slate-800">{row.month}</td>
                    <td className="py-2 px-3 text-slate-500">{row.dueDate}</td>
                    <td className="py-2 px-3 text-slate-600">{formatCurrency(row.beginningBalance)}</td>
                    <td className="py-2 px-3 font-bold text-[#1769E0]">{formatCurrency(row.monthlyPayment)}</td>
                    <td className="py-2 px-3 text-emerald-600">+{formatCurrency(row.principal)}</td>
                    <td className="py-2 px-3 text-amber-600">{formatCurrency(row.interest)}</td>
                    <td className="py-2 px-3 text-right font-semibold text-slate-900">{formatCurrency(row.endingBalance)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
