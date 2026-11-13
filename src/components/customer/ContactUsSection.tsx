import React, { useState } from 'react';
import { 
  Phone, 
  Mail, 
  MapPin, 
  Clock, 
  Send, 
  CheckCircle2, 
  AlertCircle, 
  MessageSquare
} from 'lucide-react';
import { useLoanContext } from '../../context/LoanContext';

export const ContactUsSection: React.FC = () => {
  const { submitInquiry, settings } = useLoanContext();

  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    subject: '',
    applicationReference: '',
    message: '',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;
    setErrorMsg(null);

    const fullName = formData.fullName.trim();
    const email = formData.email.trim();
    const phone = formData.phone.trim();
    const subject = formData.subject.trim();
    const message = formData.message.trim();
    const appRef = formData.applicationReference.trim().toUpperCase();

    if (!fullName || !email || !subject || !message) {
      setErrorMsg('Please complete all required fields (Full Name, Email, Subject, and Message).');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setErrorMsg('Please enter a valid email address.');
      return;
    }

    if (phone && !/^[+0-9\s-]{7,16}$/.test(phone)) {
      setErrorMsg('Please enter a valid contact phone number.');
      return;
    }

    setIsSubmitting(true);
    try {
      await submitInquiry({
        fullName,
        email,
        phone: phone || undefined,
        subject,
        applicationReference: appRef || undefined,
        message,
      });

      setSubmitted(true);
      setFormData({
        fullName: '',
        email: '',
        phone: '',
        subject: '',
        applicationReference: '',
        message: '',
      });
    } catch (err: any) {
      setErrorMsg('Unable to submit inquiry. Please check your connection and try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-12 pb-16">
      {/* Header */}
      <div className="text-center space-y-3">
        <span className="text-xs font-bold uppercase tracking-wider text-[#1769E0] block">
          Help & Support
        </span>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-[#102A56] tracking-tight">
          Need Help? Talk to Us
        </h1>
        <p className="text-sm text-slate-600 max-w-xl mx-auto">
          Have a question about a loan, your documents, or a monthly payment? Send us a message and our friendly team will help you.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Contact Information Cards (5 Cols) */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-[#102A56] rounded-3xl p-8 text-white space-y-6 shadow-md">
            <div className="space-y-2">
              <span className="text-xs font-bold uppercase tracking-wider text-blue-300">Head Office</span>
              <h3 className="text-xl font-bold text-white">{settings.companyName || 'LoanFlow'} Help Desk</h3>
              <p className="text-xs text-blue-100/80 leading-relaxed">
                Call, email, or visit us during office hours.
              </p>
            </div>

            <div className="space-y-4 text-xs pt-2">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center shrink-0">
                  <MapPin className="w-4 h-4 text-blue-300" />
                </div>
                <div>
                  <span className="font-semibold block text-white">Office Address</span>
                  <span className="text-blue-100/80 leading-relaxed">{settings.headOfficeAddress}</span>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center shrink-0">
                  <Phone className="w-4 h-4 text-blue-300" />
                </div>
                <div>
                  <span className="font-semibold block text-white">Phone Number</span>
                  <a 
                    href={`tel:${settings.supportPhone.replace(/\s+/g, '')}`} 
                    className="text-blue-200 hover:text-white font-mono-numbers transition-colors underline decoration-blue-400"
                  >
                    {settings.supportPhone}
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center shrink-0">
                  <Mail className="w-4 h-4 text-blue-300" />
                </div>
                <div>
                  <span className="font-semibold block text-white">Email</span>
                  <a 
                    href={`mailto:${settings.supportEmail}`} 
                    className="text-blue-200 hover:text-white font-mono transition-colors underline decoration-blue-400"
                  >
                    {settings.supportEmail}
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center shrink-0">
                  <Clock className="w-4 h-4 text-blue-300" />
                </div>
                <div>
                  <span className="font-semibold block text-white">Open Hours</span>
                  <span className="text-blue-100/80">Monday – Friday: 8:30 AM – 5:00 PM</span>
                  <span className="text-blue-100/80 block">Saturday: 9:00 AM – 1:00 PM</span>
                </div>
              </div>
            </div>
          </div>

          <div className="p-6 rounded-2xl bg-white border border-slate-200 space-y-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800">Fast Support</h4>
            <p className="text-xs text-slate-600 leading-relaxed">
              Every message you send here goes straight to our staff inbox in the database so we can reply quickly.
            </p>
          </div>
        </div>

        {/* Contact Form (7 Cols) */}
        <div className="lg:col-span-7 bg-white rounded-3xl border border-slate-200 p-8 sm:p-10 shadow-xs space-y-6">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-4">
            <div className="w-9 h-9 rounded-xl bg-blue-50 text-[#1769E0] flex items-center justify-center">
              <MessageSquare className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-[#102A56]">Send Us a Message</h3>
              <p className="text-xs text-slate-500">Fill in your details below and we will get back to you soon.</p>
            </div>
          </div>

          {submitted && (
            <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs space-y-1 animate-in fade-in">
              <span className="font-bold flex items-center gap-1.5 text-emerald-800">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                Message Sent!
              </span>
              <p>
                Thank you for writing to us. Your message is saved, and our support officer will review it shortly.
              </p>
              <button
                type="button"
                onClick={() => setSubmitted(false)}
                className="mt-2 text-emerald-700 font-bold hover:underline cursor-pointer block"
              >
                Send another message
              </button>
            </div>
          )}

          {errorMsg && (
            <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="font-semibold text-slate-700">Full Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Kasun Fernando"
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-[#1769E0]"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-semibold text-slate-700">Email Address *</label>
                <input
                  type="email"
                  required
                  placeholder="e.g. kasun@example.lk"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-[#1769E0]"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="font-semibold text-slate-700">Contact Phone Number</label>
                <input
                  type="tel"
                  placeholder="e.g. +94 77 123 4567"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-[#1769E0]"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-semibold text-slate-700">
                  Application Reference ID <span className="font-normal text-slate-400">(Optional)</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. LN-2026-XXXXX"
                  value={formData.applicationReference}
                  onChange={(e) => setFormData({ ...formData, applicationReference: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-[#1769E0] font-mono uppercase"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="font-semibold text-slate-700">Subject / Category *</label>
              <input
                type="text"
                required
                placeholder="e.g. Inquiry regarding loan document status"
                value={formData.subject}
                onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-[#1769E0]"
              />
            </div>

            <div className="space-y-1.5">
              <label className="font-semibold text-slate-700">Your Message *</label>
              <textarea
                rows={5}
                required
                placeholder="Describe your inquiry, question, or loan requirement in detail..."
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-[#1769E0] resize-y"
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 px-4 rounded-xl bg-[#1769E0] hover:bg-[#0B4DBB] disabled:opacity-50 text-white text-xs font-bold flex items-center justify-center gap-2 shadow-md shadow-blue-500/20 transition-all cursor-pointer"
            >
              <Send className="w-4 h-4" />
              <span>{isSubmitting ? 'Submitting Message...' : 'Submit Message'}</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
