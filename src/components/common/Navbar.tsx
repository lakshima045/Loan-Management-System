import React, { useState } from 'react';
import { 
  Building2, 
  Calculator, 
  FileText, 
  Search, 
  Lock, 
  RotateCcw,
  Menu,
  X,
  HelpCircle,
  PhoneCall,
  Info,
  Layers,
  ArrowRight
} from 'lucide-react';
import { useLoanContext } from '../../context/LoanContext';

export type CustomerTab = 
  | 'home' 
  | 'about' 
  | 'services' 
  | 'calculator' 
  | 'apply' 
  | 'track' 
  | 'faqs' 
  | 'contact';

interface NavbarProps {
  currentView: 'customer' | 'admin';
  setCurrentView: (view: 'customer' | 'admin') => void;
  activeCustomerTab: CustomerTab;
  setActiveCustomerTab: (tab: CustomerTab) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentView,
  setCurrentView,
  activeCustomerTab,
  setActiveCustomerTab,
}) => {
  const { applications, inquiries, resetDatabase } = useLoanContext();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const pendingCount = applications.filter(a => a.status === 'pending' || a.status === 'under_review').length;
  const newInquiriesCount = inquiries.filter(i => i.status === 'new').length;

  const handleNavClick = (tab: CustomerTab) => {
    setCurrentView('customer');
    setActiveCustomerTab(tab);
    setMobileMenuOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-slate-200 shadow-xs">
      {/* Top Banner Notice */}
      <div className="bg-[#102A56] text-slate-300 text-xs py-1.5 px-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-white">LoanFlow LMS</span>
            <span className="hidden sm:inline text-blue-200/80">| Dynamic Web-Based Loan Management System (All amounts in Rs.)</span>
          </div>
          <div className="flex items-center gap-4">
            <span className="hidden md:inline text-slate-300 text-[11px]">Colombo Support: +94 11 234 5678</span>
            <span className="hidden sm:inline text-slate-600">|</span>
            <button
              onClick={() => setCurrentView('admin')}
              className="flex items-center gap-1 text-slate-300 hover:text-emerald-300 transition-colors text-[11px] font-semibold cursor-pointer"
              title="Restricted Staff & Administrator Access"
            >
              <Lock className="w-3 h-3 text-emerald-400" />
              <span>Staff Portal</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Navbar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-18">
          {/* Brand Logo */}
          <div 
            onClick={() => handleNavClick('home')}
            className="flex items-center gap-3 cursor-pointer group shrink-0"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#0B4DBB] via-[#1769E0] to-sky-400 flex items-center justify-center text-white shadow-md shadow-blue-500/20 group-hover:scale-105 transition-transform">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-xl font-extrabold tracking-tight text-[#102A56]">
                  Loan<span className="text-[#1769E0]">Flow</span>
                </span>
                <span className="px-1.5 py-0.5 text-[9px] font-bold tracking-wider uppercase bg-blue-50 text-blue-700 rounded border border-blue-200/60">
                  LMS
                </span>
              </div>
              <p className="text-[10px] text-slate-500 hidden sm:block -mt-0.5">Loans Made Simple.</p>
            </div>
          </div>

          {/* Desktop Navigation Links */}
          {currentView === 'customer' ? (
            <nav className="hidden lg:flex items-center gap-6 text-sm font-medium text-slate-600">
              <button
                onClick={() => handleNavClick('home')}
                className={`transition-colors whitespace-nowrap cursor-pointer ${
                  activeCustomerTab === 'home' ? 'text-[#1769E0] font-bold' : 'hover:text-[#102A56]'
                }`}
              >
                Home
              </button>
              <button
                onClick={() => handleNavClick('about')}
                className={`transition-colors whitespace-nowrap cursor-pointer ${
                  activeCustomerTab === 'about' ? 'text-[#1769E0] font-bold' : 'hover:text-[#102A56]'
                }`}
              >
                About Us
              </button>
              <button
                onClick={() => handleNavClick('services')}
                className={`transition-colors whitespace-nowrap cursor-pointer ${
                  activeCustomerTab === 'services' ? 'text-[#1769E0] font-bold' : 'hover:text-[#102A56]'
                }`}
              >
                Loan Services
              </button>
              <button
                onClick={() => handleNavClick('calculator')}
                className={`transition-colors whitespace-nowrap cursor-pointer ${
                  activeCustomerTab === 'calculator' ? 'text-[#1769E0] font-bold' : 'hover:text-[#102A56]'
                }`}
              >
                Loan Calculator
              </button>
              <button
                onClick={() => handleNavClick('faqs')}
                className={`transition-colors whitespace-nowrap cursor-pointer ${
                  activeCustomerTab === 'faqs' ? 'text-[#1769E0] font-bold' : 'hover:text-[#102A56]'
                }`}
              >
                FAQs
              </button>
              <button
                onClick={() => handleNavClick('contact')}
                className={`transition-colors whitespace-nowrap cursor-pointer ${
                  activeCustomerTab === 'contact' ? 'text-[#1769E0] font-bold' : 'hover:text-[#102A56]'
                }`}
              >
                Contact Us
              </button>
            </nav>
          ) : (
            <div className="hidden lg:flex items-center gap-2 text-xs text-slate-500 font-medium">
              <span className="font-semibold text-slate-800">Admin Control Environment</span>
              <span>·</span>
              <span>Centralized Database v2</span>
            </div>
          )}

          {/* Right Action Buttons */}
          <div className="flex items-center gap-3">
            {currentView === 'customer' ? (
              <>
                <button
                  onClick={() => handleNavClick('track')}
                  className={`hidden sm:inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold rounded-lg border transition-all cursor-pointer ${
                    activeCustomerTab === 'track'
                      ? 'border-[#1769E0] bg-blue-50 text-[#1769E0]'
                      : 'border-slate-200 text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <Search className="w-3.5 h-3.5 text-[#1769E0]" />
                  <span>Track Application</span>
                </button>

                <button
                  onClick={() => handleNavClick('apply')}
                  className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-lg bg-[#1769E0] hover:bg-[#0B4DBB] text-white shadow-sm transition-all cursor-pointer whitespace-nowrap"
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>Apply Loan</span>
                </button>
              </>
            ) : (
              <button
                onClick={() => setCurrentView('customer')}
                className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-lg bg-blue-50 text-[#1769E0] border border-blue-200 hover:bg-blue-100 transition-all cursor-pointer"
              >
                <span>Go to Customer Website</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}

            {/* Mobile Hamburger Menu Toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-lg text-slate-600 hover:bg-slate-100 cursor-pointer"
              aria-label="Toggle Navigation Menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-slate-200 bg-white px-4 py-3 space-y-2 shadow-lg animate-in slide-in-from-top-2 duration-150">
          <div className="grid grid-cols-2 gap-2 text-xs font-semibold">
            <button
              onClick={() => handleNavClick('home')}
              className={`p-2.5 rounded-lg text-left ${activeCustomerTab === 'home' ? 'bg-blue-50 text-[#1769E0]' : 'text-slate-700'}`}
            >
              Home
            </button>
            <button
              onClick={() => handleNavClick('about')}
              className={`p-2.5 rounded-lg text-left ${activeCustomerTab === 'about' ? 'bg-blue-50 text-[#1769E0]' : 'text-slate-700'}`}
            >
              About Us
            </button>
            <button
              onClick={() => handleNavClick('services')}
              className={`p-2.5 rounded-lg text-left ${activeCustomerTab === 'services' ? 'bg-blue-50 text-[#1769E0]' : 'text-slate-700'}`}
            >
              Loan Services
            </button>
            <button
              onClick={() => handleNavClick('calculator')}
              className={`p-2.5 rounded-lg text-left ${activeCustomerTab === 'calculator' ? 'bg-blue-50 text-[#1769E0]' : 'text-slate-700'}`}
            >
              Calculator
            </button>
            <button
              onClick={() => handleNavClick('faqs')}
              className={`p-2.5 rounded-lg text-left ${activeCustomerTab === 'faqs' ? 'bg-blue-50 text-[#1769E0]' : 'text-slate-700'}`}
            >
              FAQs
            </button>
            <button
              onClick={() => handleNavClick('contact')}
              className={`p-2.5 rounded-lg text-left ${activeCustomerTab === 'contact' ? 'bg-blue-50 text-[#1769E0]' : 'text-slate-700'}`}
            >
              Contact Us
            </button>
          </div>

          <div className="pt-2 border-t border-slate-100 flex gap-2">
            <button
              onClick={() => handleNavClick('track')}
              className="flex-1 py-2 text-center text-xs font-bold rounded-lg border border-slate-200 text-slate-800"
            >
              Track Application
            </button>
            <button
              onClick={() => handleNavClick('apply')}
              className="flex-1 py-2 text-center text-xs font-bold rounded-lg bg-[#1769E0] text-white"
            >
              Apply Online
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
