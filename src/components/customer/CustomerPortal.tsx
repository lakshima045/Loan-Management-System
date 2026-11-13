import React, { useState } from 'react';
import { HomeSection } from './HomeSection';
import { AboutUsSection } from './AboutUsSection';
import { LoanProductsSection } from './LoanProductsSection';
import { LoanCalculator } from './LoanCalculator';
import { LoanApplicationForm } from './LoanApplicationForm';
import { ApplicationTracker } from './ApplicationTracker';
import { FAQsSection } from './FAQsSection';
import { ContactUsSection } from './ContactUsSection';
import { Footer } from './Footer';
import { CustomerTab } from '../common/Navbar';
import { LoanProduct, LoanCategory, InterestMethod } from '../../types/loan';

interface CustomerPortalProps {
  activeTab: CustomerTab;
  setActiveTab: (tab: CustomerTab) => void;
  onOpenAdmin: () => void;
}

export const CustomerPortal: React.FC<CustomerPortalProps> = ({
  activeTab,
  setActiveTab,
  onOpenAdmin,
}) => {
  // Pre-fill parameters when transitioning between calculator and application
  const [calcParams, setCalcParams] = useState<{
    category: LoanCategory;
    amount: number;
    rate: number;
    tenure: number;
    method: InterestMethod;
  }>({
    category: 'personal',
    amount: 500000,
    rate: 11.5,
    tenure: 24,
    method: 'Reducing Balance',
  });

  const [trackedCredentials, setTrackedCredentials] = useState<{
    reference: string;
    nic: string;
  }>({
    reference: '',
    nic: '',
  });

  const handleSelectProduct = (product: LoanProduct, action: 'apply' | 'calculate') => {
    const rawAmount = Math.round((product.minAmount + product.maxAmount) / 3 / 10000) * 10000;
    const boundedAmount = Math.min(product.maxAmount, Math.max(product.minAmount, rawAmount));
    const boundedTenure = Math.min(
      product.maxTenureMonths,
      Math.max(product.minTenureMonths, product.minTenureMonths >= 12 ? product.minTenureMonths : 12)
    );

    setCalcParams({
      category: product.id,
      amount: boundedAmount,
      rate: product.defaultAnnualRate,
      tenure: boundedTenure,
      method: product.defaultMethod,
    });

    if (action === 'apply') {
      setActiveTab('apply');
    } else {
      setActiveTab('calculator');
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleApplyWithCalculation = (calc: { 
    amount: number; 
    rate: number; 
    tenure: number; 
    category: LoanCategory;
    method: InterestMethod;
  }) => {
    setCalcParams({
      category: calc.category,
      amount: calc.amount,
      rate: calc.rate,
      tenure: calc.tenure,
      method: calc.method,
    });
    setActiveTab('apply');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleApplicationSubmitted = (refNo: string, nic: string) => {
    setTrackedCredentials({
      reference: refNo,
      nic: nic,
    });
    setActiveTab('track');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="flex flex-col min-h-screen">
      <main className="flex-1 py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
        {activeTab === 'home' && (
          <HomeSection 
            onNavigateTab={setActiveTab} 
            onSelectProductForApply={(prod) => handleSelectProduct(prod, 'apply')}
          />
        )}

        {activeTab === 'about' && (
          <AboutUsSection onNavigateTab={setActiveTab} />
        )}

        {activeTab === 'services' && (
          <LoanProductsSection onSelectProduct={handleSelectProduct} />
        )}

        {activeTab === 'calculator' && (
          <LoanCalculator
            initialAmount={calcParams.amount}
            initialRate={calcParams.rate}
            initialCategory={calcParams.category}
            initialTenure={calcParams.tenure}
            initialMethod={calcParams.method}
            onApplyWithCalculation={handleApplyWithCalculation}
          />
        )}

        {activeTab === 'apply' && (
          <LoanApplicationForm
            initialValues={{
              category: calcParams.category,
              amount: calcParams.amount,
              tenure: calcParams.tenure,
              method: calcParams.method,
              rate: calcParams.rate,
            }}
            onApplicationSubmitted={handleApplicationSubmitted}
          />
        )}

        {activeTab === 'track' && (
          <ApplicationTracker
            initialReference={trackedCredentials.reference}
            initialNIC={trackedCredentials.nic}
          />
        )}

        {activeTab === 'faqs' && (
          <FAQsSection onNavigateTab={setActiveTab} />
        )}

        {activeTab === 'contact' && (
          <ContactUsSection />
        )}
      </main>

      <Footer onNavigateTab={setActiveTab} onOpenAdmin={onOpenAdmin} />
    </div>
  );
};
