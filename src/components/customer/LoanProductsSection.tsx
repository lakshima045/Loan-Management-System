import React, { useState } from 'react';
import { motion } from 'motion/react';
import { 
  CheckCircle2, 
  ArrowRight, 
  Calculator, 
  ShieldCheck, 
  Clock, 
  Percent,
  UserCheck,
  Briefcase,
  GraduationCap,
  HeartHandshake,
  Car,
  Zap,
  X,
  FileCheck2,
  Info
} from 'lucide-react';
import { LOAN_PRODUCTS } from '../../data/loanProducts';
import { LOAN_PRODUCT_IMAGES } from '../../data/loanImages';
import { LoanProduct } from '../../types/loan';
import { formatCurrency } from '../../utils/loanCalculations';

interface LoanProductsSectionProps {
  onSelectProduct: (product: LoanProduct, action: 'apply' | 'calculate') => void;
}

const EASE_SMOOTH: [number, number, number, number] = [0.16, 1, 0.3, 1];

export const LoanProductsSection: React.FC<LoanProductsSectionProps> = ({ onSelectProduct }) => {
  const [selectedDetailsProduct, setSelectedDetailsProduct] = useState<LoanProduct | null>(null);

  const getProductIcon = (iconName: string) => {
    switch (iconName) {
      case 'Briefcase':
        return <Briefcase className="w-5 h-5 text-[#1769E0]" />;
      case 'GraduationCap':
        return <GraduationCap className="w-5 h-5 text-[#1769E0]" />;
      case 'HeartHandshake':
        return <HeartHandshake className="w-5 h-5 text-[#1769E0]" />;
      case 'Car':
        return <Car className="w-5 h-5 text-[#1769E0]" />;
      case 'Zap':
        return <Zap className="w-5 h-5 text-[#1769E0]" />;
      default:
        return <UserCheck className="w-5 h-5 text-[#1769E0]" />;
    }
  };

  return (
    <div className="space-y-12 pb-16">
      {/* Hero Welcome Banner */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease: EASE_SMOOTH }}
        className="relative rounded-3xl bg-gradient-to-br from-[#102A56] via-[#0B4DBB] to-[#1769E0] text-white p-8 sm:p-12 overflow-hidden shadow-xl"
      >
        <div className="relative z-10 max-w-3xl space-y-5">
          <div className="text-xs font-semibold text-blue-200">
            <span>Online Loan Services</span>
            <span className="mx-2 text-blue-300/60" aria-hidden="true">·</span>
            <span>All amounts in Sri Lankan Rupees (Rs.)</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white leading-tight text-balance">
            Find the Right Loan for Your Needs
          </h1>

          <p className="text-blue-100 text-base sm:text-lg leading-relaxed">
            Compare our 6 loan plans for personal family goals, education, small businesses, vehicles, and urgent cash needs.
          </p>

          <div className="pt-2 flex flex-wrap items-center gap-4">
            <button
              onClick={() => onSelectProduct(LOAN_PRODUCTS[0], 'apply')}
              className="flex items-center gap-2 px-6 py-3 rounded-xl bg-white text-[#1769E0] font-bold hover:bg-blue-50 transition-all shadow-md text-xs cursor-pointer whitespace-nowrap"
            >
              <span>Apply for a Loan</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              onClick={() => onSelectProduct(LOAN_PRODUCTS[0], 'calculate')}
              className="flex items-center gap-2 px-6 py-3 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold backdrop-blur-xs transition-all border border-white/20 text-xs cursor-pointer whitespace-nowrap"
            >
              <Calculator className="w-4 h-4 text-blue-200" />
              <span>Check Monthly Payment</span>
            </button>
          </div>

          <div className="pt-6 border-t border-white/20 grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs text-blue-100">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-blue-300 shrink-0" />
              <span>Quick Review Process</span>
            </div>
            <div className="flex items-center gap-2">
              <Percent className="w-4 h-4 text-emerald-300 shrink-0" />
              <span>Clear Interest Rates</span>
            </div>
            <div className="flex items-center gap-2">
              <FileCheck2 className="w-4 h-4 text-blue-300 shrink-0" />
              <span>Upload Docs Online</span>
            </div>
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-amber-300 shrink-0" />
              <span>Safe Record Storage</span>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Facilities Heading */}
      <div className="text-center max-w-2xl mx-auto space-y-2">
        <span className="text-xs font-bold uppercase tracking-wider text-[#1769E0]">
          Loan Options
        </span>
        <h2 className="text-2xl sm:text-3xl font-bold text-[#102A56] tracking-tight">
          All Available Loan Plans
        </h2>
        <p className="text-slate-600 text-xs sm:text-sm">
          Pick a loan plan to see minimum and maximum amounts in Rs., payback period, who can apply, and required documents.
        </p>
      </div>

      {/* Product Cards Grid with Images */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {LOAN_PRODUCTS.map((product, idx) => (
          <motion.div
            key={product.id}
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.12 }}
            transition={{ duration: 0.4, delay: (idx % 3) * 0.06, ease: EASE_SMOOTH }}
            className="group relative bg-white rounded-3xl border border-slate-200 shadow-xs hover:shadow-xl hover:border-blue-200 transition-all flex flex-col justify-between overflow-hidden"
          >
            <div>
              {/* Product Image Banner */}
              <div className="relative aspect-[4/3] w-full overflow-hidden bg-slate-100">
                <img
                  src={LOAN_PRODUCT_IMAGES[product.id]}
                  alt={product.name}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/60 via-slate-900/10 to-transparent" />
                <div className="absolute bottom-3 left-4 right-4 flex items-end justify-between">
                  <div className="w-10 h-10 rounded-xl bg-white/95 flex items-center justify-center shadow-sm">
                    {getProductIcon(product.icon)}
                  </div>
                  <div className="text-right text-white">
                    <span className="text-[10px] font-semibold uppercase tracking-wider text-blue-200 block">Interest Rate</span>
                    <p className="text-base font-extrabold font-mono-numbers">
                      {product.defaultAnnualRate}% <span className="text-[10px] font-normal text-blue-100">/ year</span>
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-6 space-y-4">
                <div>
                  <h3 className="text-base font-bold text-[#102A56] group-hover:text-[#1769E0] transition-colors">
                    {product.name}
                  </h3>
                  <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                    {product.tagline}
                  </p>
                </div>

                {/* Loan Limits & Tenure in Rs. */}
                <div className="grid grid-cols-2 gap-2 p-3.5 rounded-2xl bg-slate-50 border border-slate-100 text-xs">
                  <div>
                    <span className="text-slate-500 block text-[11px]">Max Loan Limit</span>
                    <span className="font-extrabold text-slate-800 font-mono-numbers block truncate" title={`${formatCurrency(product.minAmount)} - ${formatCurrency(product.maxAmount)}`}>
                      {formatCurrency(product.maxAmount)}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[11px]">Pay Back Time</span>
                    <span className="font-extrabold text-slate-800 font-mono-numbers block">
                      Up to {product.maxTenureMonths} Mos
                    </span>
                  </div>
                </div>

                {/* Key Features */}
                <div className="space-y-2">
                  <span className="text-xs font-bold text-slate-700 uppercase tracking-wide">Key Benefits</span>
                  <ul className="space-y-1.5 text-xs text-slate-600">
                    {product.features.slice(0, 3).map((f, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                        <span>{f}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Required Documents preview */}
                <div className="pt-2 border-t border-slate-100 text-[11px] text-slate-500">
                  <span className="font-semibold text-slate-700">Needed Docs: </span>
                  {product.requiredDocs.slice(0, 2).join(', ')}
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center gap-2">
              <button
                type="button"
                onClick={() => setSelectedDetailsProduct(product)}
                className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-white border border-slate-200 text-xs font-bold text-slate-700 hover:text-[#1769E0] hover:border-blue-300 transition-all cursor-pointer shadow-2xs whitespace-nowrap"
              >
                <Info className="w-3.5 h-3.5" />
                <span>View Details</span>
              </button>
              <button
                type="button"
                onClick={() => onSelectProduct(product, 'apply')}
                className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-[#1769E0] text-white text-xs font-bold hover:bg-[#0B4DBB] transition-all cursor-pointer shadow-xs whitespace-nowrap"
              >
                <span>Apply Now</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </motion.div>
        ))}
      </div>

      {/* DETAILED MODAL VIEW FOR SELECTED PRODUCT */}
      {selectedDetailsProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="relative bg-white rounded-3xl max-w-2xl w-full border border-slate-200 shadow-2xl p-6 sm:p-8 space-y-6 my-8 animate-in fade-in zoom-in-95 duration-150">
            {/* Header */}
            <div className="flex items-start justify-between border-b border-slate-100 pb-4">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#1769E0]">
                  Loan Plan Details
                </span>
                <h3 className="text-xl font-extrabold text-[#102A56] mt-0.5">
                  {selectedDetailsProduct.name}
                </h3>
                <p className="text-xs text-slate-500">{selectedDetailsProduct.tagline}</p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedDetailsProduct(null)}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-800 hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Quick Metrics Strip */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100">
                <span className="text-slate-500 block text-[11px]">Smallest Loan</span>
                <span className="font-extrabold text-slate-800 font-mono-numbers">
                  {formatCurrency(selectedDetailsProduct.minAmount)}
                </span>
              </div>
              <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100">
                <span className="text-slate-500 block text-[11px]">Highest Loan</span>
                <span className="font-extrabold text-[#1769E0] font-mono-numbers">
                  {formatCurrency(selectedDetailsProduct.maxAmount)}
                </span>
              </div>
              <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100">
                <span className="text-slate-500 block text-[11px]">Yearly Interest</span>
                <span className="font-extrabold text-emerald-700 font-mono-numbers">
                  {selectedDetailsProduct.defaultAnnualRate}% / yr
                </span>
              </div>
              <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100">
                <span className="text-slate-500 block text-[11px]">Pay Back Time</span>
                <span className="font-extrabold text-slate-800 font-mono-numbers">
                  {selectedDetailsProduct.minTenureMonths} - {selectedDetailsProduct.maxTenureMonths} Mos
                </span>
              </div>
            </div>

            {/* Eligibility Requirements */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wide">
                Who Can Apply
              </h4>
              <ul className="space-y-1.5 text-xs text-slate-600 bg-slate-50/70 p-3.5 rounded-2xl border border-slate-100">
                {selectedDetailsProduct.eligibility.map((item, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Required Documents */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wide">
                Documents Needed
              </h4>
              <ul className="space-y-1.5 text-xs text-slate-600 bg-slate-50/70 p-3.5 rounded-2xl border border-slate-100">
                {selectedDetailsProduct.requiredDocs.map((doc, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#1769E0] shrink-0 mt-0.5" />
                    <span>{doc}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Modal Actions */}
            <div className="pt-2 flex items-center justify-end gap-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => {
                  const prod = selectedDetailsProduct;
                  setSelectedDetailsProduct(null);
                  onSelectProduct(prod, 'calculate');
                }}
                className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50 cursor-pointer whitespace-nowrap"
              >
                Calculate Payment
              </button>
              <button
                type="button"
                onClick={() => {
                  const prod = selectedDetailsProduct;
                  setSelectedDetailsProduct(null);
                  onSelectProduct(prod, 'apply');
                }}
                className="px-5 py-2 rounded-xl bg-[#1769E0] hover:bg-[#0B4DBB] text-white text-xs font-bold shadow-md cursor-pointer flex items-center gap-1.5 whitespace-nowrap"
              >
                <span>Apply for This Loan</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
