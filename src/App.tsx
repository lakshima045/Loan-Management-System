/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { MotionConfig } from 'motion/react';
import { LoanProvider } from './context/LoanContext';
import { Navbar, CustomerTab } from './components/common/Navbar';
import { CustomerPortal } from './components/customer/CustomerPortal';
import { AdminPortal } from './components/admin/AdminPortal';

export default function App() {
  const [currentView, setCurrentView] = useState<'customer' | 'admin'>('customer');
  const [activeCustomerTab, setActiveCustomerTab] = useState<CustomerTab>('home');

  return (
    <MotionConfig reducedMotion="user">
      <LoanProvider>
        <div className="min-h-screen bg-white flex flex-col selection:bg-[#1769E0] selection:text-white">
          {/* Navigation Bar */}
          <Navbar
            currentView={currentView}
            setCurrentView={setCurrentView}
            activeCustomerTab={activeCustomerTab}
            setActiveCustomerTab={setActiveCustomerTab}
          />

          {/* Main Content Area */}
          <main className="flex-1">
            {currentView === 'customer' ? (
              <CustomerPortal
                activeTab={activeCustomerTab}
                setActiveTab={setActiveCustomerTab}
                onOpenAdmin={() => setCurrentView('admin')}
              />
            ) : (
              <AdminPortal
                onBackToCustomer={() => {
                  setCurrentView('customer');
                  setActiveCustomerTab('home');
                }}
              />
            )}
          </main>
        </div>
      </LoanProvider>
    </MotionConfig>
  );
}
