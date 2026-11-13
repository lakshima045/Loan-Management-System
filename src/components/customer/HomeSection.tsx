import React from 'react';
import { motion } from 'motion/react';
import { 
  FileText, 
  Search, 
  ShieldCheck, 
  Calculator, 
  ArrowRight, 
  Wallet, 
  Briefcase, 
  GraduationCap, 
  HeartHandshake, 
  TrendingUp,
  CheckCircle2,
  XCircle,
  Clock
} from 'lucide-react';
import { CustomerTab } from '../common/Navbar';
import { LOAN_PRODUCTS } from '../../data/loanProducts';
import { HERO_BANNER_IMAGE, LOAN_PRODUCT_IMAGES } from '../../data/loanImages';
import { LoanProduct } from '../../types/loan';
import { formatCurrency } from '../../utils/loanCalculations';

interface HomeSectionProps {
  onNavigateTab: (tab: CustomerTab) => void;
  onSelectProductForApply: (product: LoanProduct) => void;
}

const EASE_SMOOTH: [number, number, number, number] = [0.16, 1, 0.3, 1];

export const HomeSection: React.FC<HomeSectionProps> = ({
  onNavigateTab,
  onSelectProductForApply,
}) => {
  return (
    <div className="space-y-24 pb-16">
      {/* 1. Hero Section — Balanced 2-Column Split */}
      <section className="relative pt-4 sm:pt-8 pb-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-stretch">
          {/* Left Content Column */}
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: EASE_SMOOTH }}
            className="lg:col-span-6 flex flex-col justify-center space-y-6"
          >
            <div className="text-xs font-bold uppercase tracking-wider text-[#1769E0]">
              <span>Online Loan Management</span>
              <span className="mx-2 text-slate-300" aria-hidden="true">·</span>
              <span className="text-slate-500 font-semibold normal-case tracking-normal">Sri Lankan Rupees (Rs.)</span>
            </div>

            <h1 className="text-3xl sm:text-5xl font-extrabold text-[#102A56] tracking-tight leading-[1.15] text-balance">
              Smart Loan Management for a{' '}
              <span className="text-[#1769E0]">Better Tomorrow</span>
            </h1>

            <p className="text-base sm:text-lg text-slate-600 leading-relaxed max-w-xl">
              Apply for a loan online, check if your request is approved, and manage your monthly payments easily. LoanFlow keeps everything clear, simple, and organized in one place.
            </p>

            <div className="flex flex-wrap items-center gap-3.5 pt-2">
              <button
                onClick={() => onNavigateTab('apply')}
                className="px-6 py-3 rounded-xl bg-[#1769E0] hover:bg-[#0B4DBB] text-white text-sm font-bold shadow-lg shadow-blue-500/25 transition-all hover:-translate-y-0.5 cursor-pointer flex items-center gap-2 whitespace-nowrap"
              >
                <span>Apply for a Loan</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                onClick={() => onNavigateTab('track')}
                className="px-6 py-3 rounded-xl bg-white border border-[#1769E0] text-[#1769E0] hover:bg-blue-50 text-sm font-bold transition-all hover:-translate-y-0.5 cursor-pointer flex items-center gap-2 whitespace-nowrap"
              >
                <Search className="w-4 h-4" />
                <span>Track My Application</span>
              </button>
            </div>

            <div className="pt-4 border-t border-slate-200 grid grid-cols-3 gap-4 max-w-lg text-xs">
              <div>
                <span className="font-extrabold text-[#102A56] block text-sm">4 Easy Steps</span>
                <span className="text-slate-500">Simple online form</span>
              </div>
              <div>
                <span className="font-extrabold text-[#102A56] block text-sm">Live Tracking</span>
                <span className="text-slate-500">See approval updates</span>
              </div>
              <div>
                <span className="font-extrabold text-[#102A56] block text-sm">Clear Receipts</span>
                <span className="text-slate-500">Every payment in Rs.</span>
              </div>
            </div>
          </motion.div>

          {/* Right Visual Column — Covers Empty Space Cleanly */}
          <motion.div
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.55, delay: 0.08, ease: EASE_SMOOTH }}
            className="lg:col-span-6 relative min-h-[340px] lg:min-h-[440px]"
          >
            <div className="relative h-full w-full rounded-3xl overflow-hidden border border-slate-200 bg-gradient-to-br from-[#EAF3FF] to-[#DBEAFE] shadow-xl">
              <img
                src={HERO_BANNER_IMAGE}
                alt="Couple reviewing a clear digital loan plan with an advisor"
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover object-center"
              />
              {/* Measured Contrast Scrim */}
              <div className="absolute inset-0 bg-gradient-to-t from-[#071B3A]/85 via-[#071B3A]/20 to-transparent pointer-events-none" />

              {/* Clean Informative Overlay at Bottom */}
              <div className="absolute bottom-0 inset-x-0 p-6 sm:p-7 text-white space-y-2">
                <p className="text-sm sm:text-base font-bold leading-snug text-white">
                  From Online Application to Monthly Repayment
                </p>
                <p className="text-xs text-blue-100/90 leading-relaxed max-w-md">
                  Upload your documents safely, follow our officer's approval or review decision, and pay monthly installments online in Sri Lankan Rupees.
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* 2. Loan Services Section with Visual Cards */}
      <section className="space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div className="space-y-1.5">
            <span className="text-xs font-bold uppercase tracking-wider text-[#1769E0]">Our Loan Types</span>
            <h2 className="text-2xl sm:text-3xl font-bold text-[#102A56]">Choose the Right Loan for You</h2>
            <p className="text-xs sm:text-sm text-slate-600 max-w-xl">
              We offer simple loan options for personal family needs, small businesses, education fees, and urgent expenses.
            </p>
          </div>
          <button
            onClick={() => onNavigateTab('services')}
            className="text-xs font-bold text-[#1769E0] hover:text-[#0B4DBB] flex items-center gap-1 cursor-pointer whitespace-nowrap shrink-0"
          >
            <span>See All 6 Loan Types</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {LOAN_PRODUCTS.slice(0, 4).map((product, idx) => {
            const getIcon = () => {
              if (product.id === 'personal') return <Wallet className="w-4 h-4" />;
              if (product.id === 'business') return <Briefcase className="w-4 h-4" />;
              if (product.id === 'education') return <GraduationCap className="w-4 h-4" />;
              return <HeartHandshake className="w-4 h-4" />;
            };

            const productImage = LOAN_PRODUCT_IMAGES[product.id];

            return (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.15 }}
                transition={{ duration: 0.4, delay: idx * 0.06, ease: EASE_SMOOTH }}
                className="group bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs flex flex-col justify-between hover:border-blue-300 hover:shadow-lg transition-all duration-200"
              >
                <div>
                  {/* Product Photo Header */}
                  <div className="relative aspect-[4/3] w-full overflow-hidden bg-slate-100">
                    <img
                      src={productImage}
                      alt={product.name}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900/40 via-transparent to-transparent" />
                    <div className="absolute bottom-3 left-3 w-8 h-8 rounded-lg bg-white/95 text-[#1769E0] flex items-center justify-center shadow-sm">
                      {getIcon()}
                    </div>
                  </div>

                  {/* Card Details */}
                  <div className="p-5 space-y-3">
                    <div>
                      <h3 className="text-base font-bold text-[#102A56] group-hover:text-[#1769E0] transition-colors">
                        {product.name}
                      </h3>
                      <p className="text-xs text-slate-600 mt-1 line-clamp-2 leading-relaxed">{product.tagline}</p>
                    </div>
                    <div className="pt-2.5 border-t border-slate-100 space-y-1.5 text-xs font-mono-numbers">
                      <div className="flex justify-between items-center">
                        <span className="text-slate-500 font-sans">Max Loan:</span>
                        <span className="font-bold text-slate-800">Up to {formatCurrency(product.maxAmount)}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-slate-500 font-sans">Interest Rate:</span>
                        <span className="font-bold text-[#1769E0]">{product.defaultAnnualRate}% per year</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="px-5 pb-5 pt-1 space-y-2">
                  <button
                    onClick={() => onSelectProductForApply(product)}
                    className="w-full py-2 px-4 rounded-xl bg-[#1769E0] hover:bg-[#0B4DBB] text-white text-xs font-bold transition-colors cursor-pointer"
                  >
                    Apply Now
                  </button>
                  <button
                    onClick={() => onNavigateTab('services')}
                    className="w-full py-1.5 px-4 rounded-lg text-slate-600 hover:text-[#102A56] hover:bg-slate-50 text-xs font-semibold cursor-pointer transition-colors"
                  >
                    More Details
                  </button>
                </div>
              </motion.div>
            );
          })}
        </div>
      </section>

      {/* 3. Calculator Teaser Section */}
      <motion.section
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.2 }}
        transition={{ duration: 0.45, ease: EASE_SMOOTH }}
        className="bg-[#EDF5FF] rounded-3xl p-8 sm:p-12 border border-blue-200"
      >
        <div className="max-w-2xl space-y-4">
          <span className="text-xs font-bold uppercase tracking-wider text-[#1769E0]">Easy Calculator</span>
          <h2 className="text-2xl sm:text-3xl font-bold text-[#102A56]">
            Check Your Monthly Payment Before You Apply
          </h2>
          <p className="text-sm text-slate-600 leading-relaxed">
            See how much you will pay each month before sending your request. You can test both <strong>Reducing Balance</strong> (interest drops as you pay back) and <strong>Flat Rate</strong> (fixed interest on the full loan) in Sri Lankan Rupees.
          </p>
          <div className="pt-2">
            <button
              onClick={() => onNavigateTab('calculator')}
              className="px-6 py-2.5 rounded-xl bg-[#1769E0] hover:bg-[#0B4DBB] text-white text-xs font-bold shadow-md shadow-blue-500/20 transition-all cursor-pointer flex items-center gap-2 whitespace-nowrap"
            >
              <Calculator className="w-4 h-4" />
              <span>Open Loan Calculator</span>
            </button>
          </div>
        </div>
      </motion.section>

      {/* 4. How It Works Section — Taking a Loan, Admin Decision & Paying Back */}
      <section className="space-y-10">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <span className="text-xs font-bold uppercase tracking-wider text-[#1769E0]">Step-by-Step Guide</span>
          <h2 className="text-2xl sm:text-3xl font-bold text-[#102A56]">How Taking &amp; Paying Back a Loan Works</h2>
          <p className="text-xs sm:text-sm text-slate-600">
            Follow every step from submitting your form to seeing the admin&apos;s approval decision and completing repayments.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[
            {
              step: '01',
              title: 'Apply Online',
              desc: 'Fill out the 4-step loan form, upload your NIC and income proof, and receive your Tracking Reference Number.',
            },
            {
              step: '02',
              title: 'Admin Checks Details',
              desc: 'Our staff reviews your personal details, uploaded documents, and monthly income to verify eligibility.',
            },
            {
              step: '03',
              title: 'Approved or Declined',
              desc: 'Admin approves your loan with monthly terms or explains why it was declined. You can see this clearly in the Tracker.',
            },
            {
              step: '04',
              title: 'Get Money & Pay Back',
              desc: 'Once sent to your bank, pay monthly installments online, track your remaining balance, and print official receipts.',
            },
          ].map((item, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.4, delay: idx * 0.07, ease: EASE_SMOOTH }}
              className="bg-white p-6 rounded-2xl border border-slate-200 space-y-3 hover:border-blue-300 transition-colors"
            >
              <span className="w-8 h-8 rounded-full bg-[#1769E0] text-white flex items-center justify-center text-xs font-bold font-mono">
                {item.step}
              </span>
              <h4 className="text-sm font-bold text-[#102A56]">{item.title}</h4>
              <p className="text-xs text-slate-600 leading-relaxed">{item.desc}</p>
            </motion.div>
          ))}
        </div>

        {/* Clear Guide: How Admin Approval & Rejection Appear to Customers */}
        <div className="bg-slate-50 rounded-3xl p-6 sm:p-8 border border-slate-200 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h3 className="text-base sm:text-lg font-bold text-[#102A56]">
                What You See in &ldquo;Track My Application&rdquo;
              </h3>
              <p className="text-xs text-slate-600">
                When an administrator reviews your loan request, your status updates clearly in real time:
              </p>
            </div>
            <button
              onClick={() => onNavigateTab('track')}
              className="text-xs font-bold text-[#1769E0] hover:text-[#0B4DBB] flex items-center gap-1 cursor-pointer whitespace-nowrap shrink-0"
            >
              <span>Go to Tracker</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <div className="bg-white p-5 rounded-2xl border border-slate-200 space-y-2">
              <div className="flex items-center gap-2 text-amber-700 font-bold text-xs">
                <Clock className="w-4 h-4 shrink-0" />
                <span>1. Under Review</span>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                Your form is safely saved. An officer is checking your NIC copy, salary slip, and existing monthly commitments.
              </p>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-emerald-200 space-y-2">
              <div className="flex items-center gap-2 text-emerald-700 font-bold text-xs">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>2. Approved (With Terms)</span>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                You see your approved amount in Rs., yearly interest rate, payback months, and monthly payment. Once money is sent, you can make repayments here.
              </p>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-rose-200 space-y-2">
              <div className="flex items-center gap-2 text-rose-700 font-bold text-xs">
                <XCircle className="w-4 h-4 shrink-0" />
                <span>3. Not Approved (With Reason)</span>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                If a request cannot be approved, the Tracker shows the exact reason (such as unclear documents or income limit) and helpful staff notes.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 5. Why Choose LoanFlow (4 Cards) */}
      <section className="space-y-8">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <span className="text-xs font-bold uppercase tracking-wider text-[#1769E0]">Why LoanFlow</span>
          <h2 className="text-2xl sm:text-3xl font-bold text-[#102A56]">Simple, Clear, and Organized</h2>
          <p className="text-xs sm:text-sm text-slate-600">Everything you need to apply for a loan and follow your payments without confusion.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            {
              icon: FileText,
              title: 'Easy Online Form',
              desc: 'Apply step by step in a few minutes without complex paperwork or long bank queues.',
            },
            {
              icon: Search,
              title: 'Clear Status Updates',
              desc: 'Check if your application is under review, approved, or needs changes using your Reference Number.',
            },
            {
              icon: ShieldCheck,
              title: 'Safe Document Storage',
              desc: 'Your NIC and income documents are safely stored and viewed only by authorized loan officers.',
            },
            {
              icon: TrendingUp,
              title: 'Full Payment History',
              desc: 'See every installment paid, your remaining balance in Rs., and download official receipts anytime.',
            },
          ].map((card, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 14 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.4, delay: idx * 0.06, ease: EASE_SMOOTH }}
              className="p-6 rounded-2xl bg-white border border-slate-200 space-y-2.5 hover:border-blue-300 transition-colors"
            >
              <div className="w-10 h-10 rounded-xl bg-blue-50 text-[#1769E0] flex items-center justify-center">
                <card.icon className="w-5 h-5" />
              </div>
              <h4 className="text-sm font-bold text-slate-900">{card.title}</h4>
              <p className="text-xs text-slate-600 leading-relaxed">{card.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>
    </div>
  );
};
