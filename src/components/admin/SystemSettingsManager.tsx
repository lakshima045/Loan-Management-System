import React, { useState } from 'react';
import { 
  Settings, 
  Building2, 
  Phone, 
  Mail, 
  MapPin, 
  Percent, 
  Save, 
  CheckCircle2, 
  RotateCcw,
  ShieldAlert,
  KeyRound,
  Lock,
  AlertCircle
} from 'lucide-react';
import { useLoanContext } from '../../context/LoanContext';
import { InterestMethod } from '../../types/loan';

export const SystemSettingsManager: React.FC = () => {
  const { settings, updateSettings, resetDatabase, adminEmail, changeAdminPassword } = useLoanContext();

  const [companyName, setCompanyName] = useState(settings.companyName);
  const [tagline, setTagline] = useState(settings.tagline);
  const [supportPhone, setSupportPhone] = useState(settings.supportPhone);
  const [supportEmail, setSupportEmail] = useState(settings.supportEmail);
  const [headOfficeAddress, setHeadOfficeAddress] = useState(settings.headOfficeAddress);
  const [defaultMethod, setDefaultMethod] = useState<InterestMethod>(settings.defaultInterestMethod);
  const [savedMsg, setSavedMsg] = useState(false);

  // Security Credentials state
  const [newEmailInput, setNewEmailInput] = useState(adminEmail || 'admin@loanflow.lk');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [securitySuccess, setSecuritySuccess] = useState<string | null>(null);
  const [securityError, setSecurityError] = useState<string | null>(null);
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateSettings({
      companyName,
      tagline,
      supportPhone,
      supportEmail,
      headOfficeAddress,
      defaultInterestMethod: defaultMethod,
    });
    setSavedMsg(true);
    setTimeout(() => setSavedMsg(false), 3000);
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setSecuritySuccess(null);
    setSecurityError(null);

    if (!currentPassword) {
      setSecurityError('Please enter your current administrator password.');
      return;
    }

    if (newPassword.length < 5) {
      setSecurityError('New password must be at least 5 characters long.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setSecurityError('New password and confirmation password do not match.');
      return;
    }

    setIsChangingPassword(true);
    try {
      const res = await changeAdminPassword(currentPassword, newPassword, newEmailInput);
      if (res.success) {
        setSecuritySuccess(res.message || 'Password successfully changed and saved to central database!');
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
      } else {
        setSecurityError(res.error || 'Failed to change administrator password.');
      }
    } catch (err: any) {
      setSecurityError('Network error connecting to security server.');
    } finally {
      setIsChangingPassword(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900">System & Lending Configuration</h2>
          <p className="text-xs text-slate-500">
            Configure institutional branding, contact details, currency symbol, default interest calculation formulas, and administrator credentials
          </p>
        </div>
      </div>

      {savedMsg && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-700" />
          <span>System configuration updated successfully and propagated to customer portals!</span>
        </div>
      )}

      {/* Main Settings Form */}
      <form onSubmit={handleSave} className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-6">
        <div className="border-b border-slate-100 pb-4 flex items-center gap-2">
          <Building2 className="w-5 h-5 text-[#244F40]" />
          <h3 className="text-sm font-bold text-slate-900">Institution Identity & Branding</h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div className="space-y-1.5">
            <label className="font-bold text-slate-700">Platform Brand Name</label>
            <input
              type="text"
              required
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-[#244F40]"
            />
          </div>

          <div className="space-y-1.5">
            <label className="font-bold text-slate-700">Official Brand Tagline</label>
            <input
              type="text"
              required
              value={tagline}
              onChange={(e) => setTagline(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-[#244F40]"
            />
          </div>

          <div className="space-y-1.5">
            <label className="font-bold text-slate-700">Colombo Support Phone</label>
            <input
              type="text"
              required
              value={supportPhone}
              onChange={(e) => setSupportPhone(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-[#244F40]"
            />
          </div>

          <div className="space-y-1.5">
            <label className="font-bold text-slate-700">Official Support Email</label>
            <input
              type="email"
              required
              value={supportEmail}
              onChange={(e) => setSupportEmail(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-[#244F40]"
            />
          </div>

          <div className="sm:col-span-2 space-y-1.5">
            <label className="font-bold text-slate-700">Head Office Physical Address</label>
            <input
              type="text"
              required
              value={headOfficeAddress}
              onChange={(e) => setHeadOfficeAddress(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-[#244F40]"
            />
          </div>
        </div>

        {/* Financial Rules */}
        <div className="border-t border-slate-100 pt-6 space-y-4">
          <div className="flex items-center gap-2">
            <Percent className="w-5 h-5 text-[#244F40]" />
            <h3 className="text-sm font-bold text-slate-900">Underwriting & Calculation Defaults</h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="space-y-1.5">
              <label className="font-bold text-slate-700">Default Interest Calculation Method</label>
              <select
                value={defaultMethod}
                onChange={(e) => setDefaultMethod(e.target.value as any)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 font-semibold focus:bg-white focus:outline-[#244F40]"
              >
                <option value="Reducing Balance">Reducing Balance (Standard Compound EMI)</option>
                <option value="Flat Rate">Flat Rate (P × R × T Simple Amortization)</option>
              </select>
              <p className="text-[11px] text-slate-500">
                Determines default amortization formulas applied in loan approvals and customer estimator.
              </p>
            </div>

            <div className="space-y-1.5">
              <label className="font-bold text-slate-700">Standard Operational Currency</label>
              <input
                type="text"
                disabled
                value="Sri Lankan Rupees (Rs. / LKR)"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-100 text-slate-600 font-bold font-mono cursor-not-allowed"
              />
              <p className="text-[11px] text-slate-500">
                System currency is locked to Sri Lankan Rupees as mandated by specification.
              </p>
            </div>
          </div>
        </div>

        <div className="pt-4 border-t border-slate-100 flex justify-end">
          <button
            type="submit"
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#244F40] hover:bg-[#1C3E32] text-white text-xs font-bold shadow-md cursor-pointer"
          >
            <Save className="w-4 h-4" />
            <span>Save Configuration</span>
          </button>
        </div>
      </form>

      {/* Administrator Security & Password Management Card */}
      <form onSubmit={handlePasswordChange} className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-6">
        <div className="border-b border-slate-100 pb-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Lock className="w-5 h-5 text-[#244F40]" />
            <h3 className="text-sm font-bold text-slate-900">Administrator Security & Password</h3>
          </div>
          <span className="text-[11px] px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-800 font-bold border border-emerald-200">
            Active Session Protected
          </span>
        </div>

        <p className="text-xs text-slate-600">
          Change your administrator login email and confidential password. Once updated, only personnel with the new credentials can log in to the administrator portal.
        </p>

        {securitySuccess && (
          <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />
            <span>{securitySuccess}</span>
          </div>
        )}

        {securityError && (
          <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{securityError}</span>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div className="sm:col-span-2 space-y-1.5">
            <label className="font-bold text-slate-700">Administrator Login Email</label>
            <input
              type="email"
              required
              value={newEmailInput}
              onChange={(e) => setNewEmailInput(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-[#244F40]"
            />
          </div>

          <div className="space-y-1.5">
            <label className="font-bold text-slate-700">Current Administrator Password</label>
            <input
              type="password"
              required
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              placeholder="Enter current password..."
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-[#244F40]"
            />
          </div>

          <div className="space-y-1.5">
            <label className="font-bold text-slate-700">New Password (Min. 5 characters)</label>
            <input
              type="password"
              required
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Enter new password..."
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-[#244F40]"
            />
          </div>

          <div className="sm:col-span-2 space-y-1.5">
            <label className="font-bold text-slate-700">Confirm New Password</label>
            <input
              type="password"
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Re-enter new password..."
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-[#244F40]"
            />
          </div>
        </div>

        <div className="pt-4 border-t border-slate-100 flex justify-end">
          <button
            type="submit"
            disabled={isChangingPassword}
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold shadow-md cursor-pointer disabled:opacity-50"
          >
            <KeyRound className="w-4 h-4" />
            <span>{isChangingPassword ? 'Updating...' : 'Update Admin Credentials'}</span>
          </button>
        </div>
      </form>

      {/* Database Maintenance Card */}
      <div className="bg-white rounded-3xl border border-rose-200 p-6 sm:p-8 space-y-4 shadow-xs">
        <div className="flex items-center gap-2 text-rose-800">
          <ShieldAlert className="w-5 h-5" />
          <h3 className="text-sm font-bold">Central Database Reset & Seed Reload</h3>
        </div>
        <p className="text-xs text-slate-600 leading-relaxed">
          Restore the centralized database to clean sample loan applications, approved active loans, and customer inquiries with valid Sri Lankan Rupees test accounts.
        </p>
        <button
          type="button"
          onClick={() => {
            if (window.confirm('Reset all applications, repayment ledgers, and inquiries to default clean state?')) {
              resetDatabase();
              window.location.reload();
            }
          }}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-rose-50 text-rose-700 border border-rose-200 hover:bg-rose-100 text-xs font-bold cursor-pointer"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Reload Sample Central Database</span>
        </button>
      </div>
    </div>
  );
};
