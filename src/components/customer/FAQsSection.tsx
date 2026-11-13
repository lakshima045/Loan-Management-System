import React, { useState } from 'react';
import { HelpCircle, ChevronDown, ChevronUp, Search, FileText, ArrowRight } from 'lucide-react';
import { CustomerTab } from '../common/Navbar';

interface FAQsSectionProps {
  onNavigateTab: (tab: CustomerTab) => void;
}

interface FAQItem {
  id: string;
  category: 'general' | 'services' | 'application' | 'documents' | 'tracking' | 'repayments';
  question: string;
  answer: string;
}

const FAQS_DATA: FAQItem[] = [
  {
    id: 'faq-1',
    category: 'general',
    question: 'How do I apply for a loan?',
    answer: 'Click "Apply Loan" at the top. Pick your loan type, fill in your personal, contact, and job details step by step, attach clear photos or PDFs of your NIC and salary slip, and click Submit. You do not need to create an account or password.',
  },
  {
    id: 'faq-2',
    category: 'general',
    question: 'Do I need to create an account or remember a password?',
    answer: 'No. As soon as you submit your form, we give you a unique Reference Number (like LN-2026-84920). Keep this number safe. Whenever you want to check your loan or make a payment, just enter your Reference Number, NIC, and a 6-digit security code.',
  },
  {
    id: 'faq-3',
    category: 'services',
    question: 'What types of loans can I get?',
    answer: 'We offer 6 simple loans in Sri Lankan Rupees (Rs.): Personal Loan (up to Rs. 1,500,000), Business Loan (up to Rs. 5,000,000), Education Loan (up to Rs. 2,500,000), Fast Emergency Loan (up to Rs. 350,000), Vehicle Loan (up to Rs. 6,000,000), and Small Shop & Trader Loan (up to Rs. 500,000).',
  },
  {
    id: 'faq-4',
    category: 'services',
    question: 'What money currency do you use?',
    answer: 'All loans, interest rates, monthly payments, and receipts on LoanFlow are strictly in Sri Lankan Rupees (Rs. / LKR).',
  },
  {
    id: 'faq-5',
    category: 'documents',
    question: 'What documents do I need to upload?',
    answer: 'Most loans need clear photos or PDFs of your NIC (front and back) plus your recent salary slip or 3-month bank statement. For Business loans, please add your Business Registration (BR). For Education loans, add your school or university admission letter.',
  },
  {
    id: 'faq-6',
    category: 'tracking',
    question: 'How do I check if my loan was approved or rejected?',
    answer: 'Click "Track Application" at the top. Enter your Reference Number and NIC, then enter the 6-digit code shown. You will immediately see your current stage: Checking Your Details, Approved (with your exact monthly payment and rate), or Not Approved (with the clear reason from our officer).',
  },
  {
    id: 'faq-7',
    category: 'application',
    question: 'How fast does the staff check my loan?',
    answer: 'Our loan officer normally checks new applications within 1 to 2 working days. Emergency loans are checked first so you get help quickly.',
  },
  {
    id: 'faq-8',
    category: 'repayments',
    question: 'How is my monthly payment calculated?',
    answer: 'We mainly use the Reducing Balance method, which means your interest goes down each month as you pay back the loan. You can test exact numbers anytime in our Loan Calculator before applying.',
  },
  {
    id: 'faq-9',
    category: 'repayments',
    question: 'How do I pay back my loan and get a receipt?',
    answer: 'After our team approves your loan and sends the money to your bank account, open "Track Application". There you will see your "Make a Monthly Payment" button. After every payment, your balance drops immediately and you can print or save an official Rs. receipt.',
  },
  {
    id: 'faq-10',
    category: 'application',
    question: 'Can I apply if I already have another loan?',
    answer: 'Yes, you can still apply. Our officer will check your monthly income and existing monthly loan payments to make sure the new installment fits comfortably within your budget.',
  },
];

export const FAQsSection: React.FC<FAQsSectionProps> = ({ onNavigateTab }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [expandedId, setExpandedId] = useState<string | null>('faq-1');

  const filteredFaqs = FAQS_DATA.filter((faq) => {
    const matchesCategory = selectedCategory === 'all' || faq.category === selectedCategory;
    const matchesQuery = 
      faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesQuery;
  });

  return (
    <div className="max-w-4xl mx-auto space-y-10 pb-16">
      {/* Header */}
      <div className="text-center space-y-3">
        <span className="text-xs font-bold uppercase tracking-wider text-[#1769E0] block">
          Common Questions
        </span>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-[#102A56] tracking-tight">
          Simple Answers to Your Questions
        </h1>
        <p className="text-sm text-slate-600 max-w-xl mx-auto">
          Everything you need to know about applying, getting approved, receiving money, and paying back in Rs.
        </p>
      </div>

      {/* Search & Category Filter */}
      <div className="space-y-4">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search questions by keyword (e.g. documents, OTP, calculator, interest, approval)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-11 pr-4 py-3 rounded-2xl bg-white border border-slate-200 text-sm focus:outline-[#1769E0] shadow-xs"
          />
        </div>

        {/* Categories Segmented Control */}
        <div className="flex flex-wrap items-center gap-1.5 p-1 bg-slate-100 rounded-xl">
          {[
            { id: 'all', label: 'All Questions' },
            { id: 'general', label: 'General' },
            { id: 'services', label: 'Loan Services' },
            { id: 'application', label: 'Application' },
            { id: 'documents', label: 'Documents' },
            { id: 'tracking', label: 'Tracking & OTP' },
            { id: 'repayments', label: 'Repayments' },
          ].map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                selectedCategory === cat.id
                  ? 'bg-white text-[#1769E0] shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Accordion List */}
      <div className="space-y-3">
        {filteredFaqs.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-2xl border border-slate-200 p-6 space-y-2">
            <HelpCircle className="w-8 h-8 text-slate-300 mx-auto" />
            <p className="text-sm font-semibold text-slate-700">No matching questions found</p>
            <p className="text-xs text-slate-500">Try searching for a different keyword or contact our Colombo helpdesk.</p>
          </div>
        ) : (
          filteredFaqs.map((faq) => {
            const isExpanded = expandedId === faq.id;
            return (
              <div
                key={faq.id}
                className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden transition-colors"
              >
                <button
                  type="button"
                  onClick={() => setExpandedId(isExpanded ? null : faq.id)}
                  className="w-full px-6 py-4.5 text-left flex items-center justify-between gap-4 cursor-pointer hover:bg-slate-50/70"
                >
                  <span className="text-sm font-bold text-[#102A56] leading-snug">
                    {faq.question}
                  </span>
                  <span className="w-7 h-7 rounded-full bg-blue-50 text-[#1769E0] flex items-center justify-center shrink-0">
                    {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </span>
                </button>
                {isExpanded && (
                  <div className="px-6 pb-5 pt-1 text-xs text-slate-600 leading-relaxed border-t border-slate-100/80 bg-slate-50/30 animate-in fade-in duration-150">
                    {faq.answer}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Bottom Still Have Questions Card */}
      <div className="bg-[#EAF3FF] rounded-3xl p-8 border border-blue-200 flex flex-col sm:flex-row items-center justify-between gap-6">
        <div>
          <h3 className="text-base font-bold text-[#102A56]">Still have questions or need personalized guidance?</h3>
          <p className="text-xs text-slate-600 mt-1">
            Our loan advisory team in Colombo is available to assist you with document requirements and application queries.
          </p>
        </div>
        <button
          onClick={() => onNavigateTab('contact')}
          className="px-5 py-2.5 rounded-xl bg-[#1769E0] hover:bg-[#0B4DBB] text-white text-xs font-bold transition-all shadow-sm cursor-pointer whitespace-nowrap shrink-0 flex items-center gap-2"
        >
          <span>Send Us an Inquiry</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
