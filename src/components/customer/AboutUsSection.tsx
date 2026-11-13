import React from 'react';
import { motion } from 'motion/react';
import { 
  FileText, 
  ShieldCheck, 
  Calculator, 
  Search, 
  CheckCircle2, 
  ArrowRight, 
  Compass,
  Award,
  Layers
} from 'lucide-react';
import { CustomerTab } from '../common/Navbar';

interface AboutUsSectionProps {
  onNavigateTab: (tab: CustomerTab) => void;
}

export const AboutUsSection: React.FC<AboutUsSectionProps> = ({ onNavigateTab }) => {
  return (
    <div className="space-y-16 pb-16">
      {/* 1. Hero Section */}
      <motion.section
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45 }}
        className="relative overflow-hidden pt-6 pb-8"
      >
        <div className="max-w-3xl space-y-5">
          <span className="text-xs font-bold uppercase tracking-wider text-[#1769E0] block">
            About LoanFlow
          </span>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-[#102A56] tracking-tight leading-tight">
            Making Loans <span className="text-[#1769E0]">Simple and Clear</span> for Everyone
          </h1>
          <p className="text-base text-slate-600 leading-relaxed">
            LoanFlow is an easy online loan system. It helps you apply for a loan, check your monthly payments, and follow every step from start to finish without complicated bank paperwork.
          </p>
          <p className="text-sm text-slate-600 leading-relaxed">
            Customers can see clear interest rates and track their approval status in Sri Lankan Rupees (Rs.). At the same time, our loan staff can review your forms, approve or explain decisions, send funds, and record every repayment in one safe place.
          </p>
          <div className="flex flex-wrap items-center gap-3 pt-2">
            <button
              onClick={() => onNavigateTab('services')}
              className="px-5 py-2.5 rounded-xl bg-[#1769E0] hover:bg-[#0B4DBB] text-white text-xs font-bold shadow-md shadow-blue-500/20 transition-all cursor-pointer flex items-center gap-2"
            >
              <span>See Loan Types</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              onClick={() => onNavigateTab('apply')}
              className="px-5 py-2.5 rounded-xl bg-white border border-[#1769E0] text-[#1769E0] hover:bg-blue-50 text-xs font-bold transition-all cursor-pointer"
            >
              Apply for a Loan
            </button>
          </div>
        </div>
      </motion.section>

      {/* 2. Who We Are Section */}
      <section className="bg-[#F5F8FD] rounded-3xl p-8 sm:p-12 border border-[#E4EAF3] space-y-4">
        <div className="max-w-3xl space-y-3">
          <span className="text-xs font-bold uppercase tracking-wider text-[#1769E0]">Who We Are</span>
          <h2 className="text-2xl sm:text-3xl font-bold text-[#102A56]">How LoanFlow Helps You</h2>
          <p className="text-sm text-slate-600 leading-relaxed">
            LoanFlow brings customers and loan officers together in one simple online system. You do not need to visit an office with piles of paper or wait without knowing what is happening to your request.
          </p>
          <p className="text-sm text-slate-600 leading-relaxed">
            Everything stays organized—from your first application and document check to receiving your money and getting receipts for each monthly payment in Rs.
          </p>
        </div>
      </section>

      {/* 3. Mission & Vision */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Mission */}
        <div className="bg-[#EDF5FF] rounded-3xl p-8 sm:p-10 border border-blue-100 flex flex-col justify-between space-y-6">
          <div className="space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-[#1769E0] flex items-center justify-center text-white shadow-md">
              <Compass className="w-6 h-6" />
            </div>
            <h3 className="text-2xl font-bold text-[#102A56]">Our Mission</h3>
            <p className="text-base font-semibold text-blue-900 leading-snug">
              "To make applying for a loan and paying it back easy, honest, and stress-free for every customer."
            </p>
            <p className="text-xs text-slate-600 leading-relaxed">
              We want to remove confusing words and slow manual paperwork so anyone can apply, understand their exact monthly cost, and track their loan easily.
            </p>
          </div>
        </div>

        {/* Vision */}
        <div className="bg-white rounded-3xl p-8 sm:p-10 border border-slate-200 flex flex-col justify-between space-y-6">
          <div className="space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-[#102A56] flex items-center justify-center text-white shadow-md">
              <Award className="w-6 h-6" />
            </div>
            <h3 className="text-2xl font-bold text-[#102A56]">Our Vision</h3>
            <p className="text-base font-semibold text-slate-900 leading-snug">
              "To be the simplest and most trusted online loan platform in Sri Lanka."
            </p>
            <p className="text-xs text-slate-600 leading-relaxed">
              We aim to give customers clear control over their loans while helping staff verify details, approve fair terms, and keep every payment record safe.
            </p>
          </div>
        </div>
      </section>

      {/* 4. What LoanFlow Offers (6 Cards) */}
      <section className="space-y-8">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <span className="text-xs font-bold uppercase tracking-wider text-[#1769E0]">What We Offer</span>
          <h2 className="text-2xl sm:text-3xl font-bold text-[#102A56]">Helpful Features for You</h2>
          <p className="text-xs text-slate-600">Everything you need from choosing a loan to paying your final installment.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[
            {
              icon: FileText,
              title: '01. Easy Online Application',
              desc: 'Fill out a simple step-by-step form online. No account or password is needed to apply.',
            },
            {
              icon: Layers,
              title: '02. Clear Loan Choices',
              desc: 'Pick from Personal, Business, Education, Emergency, Vehicle, or Small Trader loans in Sri Lankan Rupees (Rs.).',
            },
            {
              icon: Calculator,
              title: '03. Monthly Payment Calculator',
              desc: 'Check how much you will pay each month before applying, and view your full month-by-month payment plan.',
            },
            {
              icon: Search,
              title: '04. Live Status Tracking',
              desc: 'Use your Reference Number and NIC to see if your loan is under review, approved, or rejected with reasons.',
            },
            {
              icon: ShieldCheck,
              title: '05. Safe Document Upload',
              desc: 'Attach photos or PDFs of your NIC and salary slip so our staff can check and verify them quickly.',
            },
            {
              icon: CheckCircle2,
              title: '06. Easy Repayments & Receipts',
              desc: 'Once you receive your loan money, pay monthly installments online and download or print your official Rs. receipt.',
            },
          ].map((item, idx) => (
            <motion.div
              key={idx}
              whileHover={{ y: -3 }}
              className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-3 hover:border-blue-300 transition-colors"
            >
              <div className="w-10 h-10 rounded-xl bg-[#EAF3FF] text-[#1769E0] flex items-center justify-center">
                <item.icon className="w-5 h-5" />
              </div>
              <h4 className="text-sm font-bold text-[#102A56]">{item.title}</h4>
              <p className="text-xs text-slate-600 leading-relaxed">{item.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* 5. How LoanFlow Works (4 Steps) */}
      <section className="bg-[#F5F8FD] rounded-3xl p-8 sm:p-12 border border-slate-200 space-y-8">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <span className="text-xs font-bold uppercase tracking-wider text-[#1769E0]">How It Works</span>
          <h2 className="text-2xl sm:text-3xl font-bold text-[#102A56]">4 Simple Steps</h2>
          <p className="text-xs text-slate-600">From sending your form to getting your money and paying it back.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[
            { step: '01', title: 'Send Your Form', desc: 'Fill in your personal and job details, upload your ID and income proof, and get a Reference Number.' },
            { step: '02', title: 'Staff Check', desc: 'Our loan officer checks your form, documents, and monthly income in our central database.' },
            { step: '03', title: 'Approve or Decline', desc: 'You see the decision clearly in Track Application—with exact loan terms if approved, or the clear reason if declined.' },
            { step: '04', title: 'Get Money & Pay Back', desc: 'We send money to your bank account. Then you pay monthly installments and see your balance drop in real time.' },
          ].map((s, idx) => (
            <div key={idx} className="bg-white p-6 rounded-2xl border border-slate-200 space-y-3 relative">
              <span className="w-9 h-9 rounded-full bg-[#1769E0] text-white flex items-center justify-center text-xs font-extrabold font-mono">
                {s.step}
              </span>
              <h4 className="text-sm font-bold text-[#102A56]">{s.title}</h4>
              <p className="text-xs text-slate-600 leading-relaxed">{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* 6. Our Commitment Section */}
      <section className="bg-[#102A56] rounded-3xl p-8 sm:p-12 text-white space-y-8">
        <div className="max-w-2xl">
          <span className="text-xs font-bold uppercase tracking-wider text-blue-300">Our Promise</span>
          <h2 className="text-2xl sm:text-3xl font-bold text-white mt-1">What We Care About Most</h2>
          <p className="text-xs text-blue-100/80 mt-2 leading-relaxed">
            LoanFlow is built to keep things simple, honest, and safe for every borrower.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
          <div className="p-6 rounded-2xl bg-white/5 border border-white/10 space-y-2">
            <h4 className="text-sm font-bold text-blue-300">1. Easy to Understand</h4>
            <p className="text-xs text-slate-300 leading-relaxed">
              Plain English words, clear Rs. numbers, and zero hidden charges so anyone can follow along.
            </p>
          </div>
          <div className="p-6 rounded-2xl bg-white/5 border border-white/10 space-y-2">
            <h4 className="text-sm font-bold text-blue-300">2. Clear Tracking</h4>
            <p className="text-xs text-slate-300 leading-relaxed">
              Every application, approval note, bank transfer, and payment receipt is saved neatly in one system.
            </p>
          </div>
          <div className="p-6 rounded-2xl bg-white/5 border border-white/10 space-y-2">
            <h4 className="text-sm font-bold text-blue-300">3. Safe Details</h4>
            <p className="text-xs text-slate-300 leading-relaxed">
              Your NIC, salary slips, and loan status are protected by a verification code before anyone can view them.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};
