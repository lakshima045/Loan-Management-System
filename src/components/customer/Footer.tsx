import React from 'react';
import { Building2, Phone, Mail, MapPin, ShieldCheck, ExternalLink } from 'lucide-react';
import { CustomerTab } from '../common/Navbar';
import { useLoanContext } from '../../context/LoanContext';

interface FooterProps {
  onNavigateTab: (tab: CustomerTab) => void;
  onOpenAdmin: () => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigateTab, onOpenAdmin }) => {
  const { settings } = useLoanContext();

  const phone = settings?.supportPhone || '+94 11 234 5678';
  const email = settings?.supportEmail || 'support@loanflow.lk';
  const address = settings?.headOfficeAddress || 'Level 18, World Trade Center, Echelon Square, Colombo 00100, Sri Lanka';

  return (
    <footer className="bg-[#071B3A] text-slate-300 pt-16 pb-12 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 pb-12 border-b border-slate-800">
          {/* Column 1: Brand */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#0B4DBB] to-[#1769E0] flex items-center justify-center text-white shadow-md">
                <Building2 className="w-5 h-5" />
              </div>
              <span className="text-xl font-extrabold text-white tracking-tight">
                Loan<span className="text-[#1769E0]">Flow</span>
              </span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Easy online loans in Sri Lankan Rupees (Rs.). Apply in minutes, check your status live, and pay back with clear monthly receipts.
            </p>
            <div className="space-y-2 text-xs text-slate-400 pt-1">
              <div className="flex items-start gap-2">
                <MapPin className="w-3.5 h-3.5 text-blue-400 shrink-0 mt-0.5" />
                <span>{address}</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                <a href={`tel:${phone.replace(/\s+/g, '')}`} className="hover:text-white transition-colors underline-offset-2 hover:underline">
                  {phone}
                </a>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                <a href={`mailto:${email}`} className="hover:text-white transition-colors underline-offset-2 hover:underline">
                  {email}
                </a>
              </div>
            </div>
          </div>

          {/* Column 2: Quick Links */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-white">Pages</h4>
            <ul className="space-y-2 text-xs">
              <li>
                <button
                  onClick={() => onNavigateTab('home')}
                  className="hover:text-white transition-colors cursor-pointer text-slate-400 hover:underline"
                >
                  Home
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigateTab('about')}
                  className="hover:text-white transition-colors cursor-pointer text-slate-400 hover:underline"
                >
                  About Us
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigateTab('services')}
                  className="hover:text-white transition-colors cursor-pointer text-slate-400 hover:underline"
                >
                  Loan Types
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigateTab('calculator')}
                  className="hover:text-white transition-colors cursor-pointer text-slate-400 hover:underline"
                >
                  Payment Calculator
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigateTab('faqs')}
                  className="hover:text-white transition-colors cursor-pointer text-slate-400 hover:underline"
                >
                  Common Questions
                </button>
              </li>
            </ul>
          </div>

          {/* Column 3: Customer Support & Actions */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-white">Customer Help</h4>
            <ul className="space-y-2 text-xs">
              <li>
                <button
                  onClick={() => onNavigateTab('apply')}
                  className="hover:text-white transition-colors cursor-pointer text-blue-400 font-semibold hover:underline"
                >
                  Apply for a Loan
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigateTab('track')}
                  className="hover:text-white transition-colors cursor-pointer text-slate-400 hover:underline"
                >
                  Track My Application
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigateTab('contact')}
                  className="hover:text-white transition-colors cursor-pointer text-slate-400 hover:underline"
                >
                  Contact Support
                </button>
              </li>
              <li>
                <button
                  onClick={onOpenAdmin}
                  className="hover:text-emerald-300 transition-colors cursor-pointer text-emerald-400 font-semibold flex items-center gap-1 mt-3"
                >
                  <span>Staff & Admin Portal</span>
                  <ExternalLink className="w-3 h-3" />
                </button>
              </li>
            </ul>
          </div>

          {/* Column 4: Security & Compliance */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-white">Safe & Private</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Your personal info, NIC, and payment records are saved safely in our database and protected with a security code.
            </p>
            <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 space-y-1 text-[11px] text-slate-300">
              <span className="font-semibold text-emerald-400 flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5" />
                Protected Customer Data
              </span>
              <span>Only verified applicants and authorized staff can view loan records.</span>
            </div>
          </div>
        </div>

        {/* Bottom copyright */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <p>© {new Date().getFullYear()} LoanFlow. All Rights Reserved. Simple Online Loan System.</p>
          <div className="flex items-center gap-4 text-slate-400">
            <span>Privacy Policy</span>
            <span>·</span>
            <span>Terms & Conditions</span>
            <span>·</span>
            <span>Responsible Lending</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
