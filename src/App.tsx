import React, { useState } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Sidebar, ActiveTab } from './components/layout/Sidebar';
import { Header } from './components/layout/Header';
import { LoginView } from './components/auth/LoginView';
import { DashboardView } from './components/dashboard/DashboardView';
import { MembersView } from './components/members/MembersView';
import { ContributionsView } from './components/contributions/ContributionsView';
import { LoansView } from './components/loans/LoansView';
import { DividendsView } from './components/dividends/DividendsView';
import { ReportsView } from './components/reports/ReportsView';
import { SettingsView } from './components/settings/SettingsView';
import { Modal } from './components/common/Modal';
import { LogOut, AlertTriangle } from 'lucide-react';

const MainLayout: React.FC = () => {
  const { isAuthenticated, logout, currentUser } = useApp();
  const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard');
  const [isOpenMobile, setIsOpenMobile] = useState(false);
  const [pendingAction, setPendingAction] = useState<string | null>(null);
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);

  // Protected Gatekeeper: If user is not authenticated, show professional Login page immediately
  if (!isAuthenticated) {
    return <LoginView />;
  }

  // Quick Action handler from Header or Dashboard
  const handleQuickAction = (action: 'new_member' | 'record_contrib' | 'new_loan' | 'generate_payouts') => {
    if (action === 'new_member') {
      setActiveTab('members');
      setPendingAction('new_member');
    } else if (action === 'record_contrib') {
      setActiveTab('contributions');
      setPendingAction('record_contrib');
    } else if (action === 'new_loan') {
      setActiveTab('loans');
      setPendingAction('new_loan');
    } else if (action === 'generate_payouts') {
      setActiveTab('dividends');
    }
  };

  const handleConfirmLogout = () => {
    setIsLogoutModalOpen(false);
    logout('User confirmed sign out');
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col lg:flex-row antialiased text-slate-800">
      {/* Sidebar */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        isOpenMobile={isOpenMobile}
        setIsOpenMobile={setIsOpenMobile}
        onOpenLogoutModal={() => setIsLogoutModalOpen(true)}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        <Header
          activeTab={activeTab}
          onOpenMobileNav={() => setIsOpenMobile(true)}
          onQuickAction={handleQuickAction}
          onOpenLogoutModal={() => setIsLogoutModalOpen(true)}
        />

        <main className="flex-1 p-4 sm:p-8 max-w-7xl w-full mx-auto">
          {activeTab === 'dashboard' && (
            <DashboardView
              setActiveTab={setActiveTab}
              onOpenQuickAction={handleQuickAction}
            />
          )}

          {activeTab === 'members' && (
            <MembersView
              initialAction={pendingAction}
              onActionHandled={() => setPendingAction(null)}
            />
          )}

          {activeTab === 'contributions' && (
            <ContributionsView
              initialAction={pendingAction}
              onActionHandled={() => setPendingAction(null)}
            />
          )}

          {activeTab === 'loans' && (
            <LoansView
              initialAction={pendingAction}
              onActionHandled={() => setPendingAction(null)}
            />
          )}

          {activeTab === 'dividends' && <DividendsView />}

          {activeTab === 'reports' && <ReportsView />}

          {activeTab === 'settings' && <SettingsView />}
        </main>
      </div>

      {/* Logout Confirmation Modal */}
      <Modal
        isOpen={isLogoutModalOpen}
        onClose={() => setIsLogoutModalOpen(false)}
        title="Confirm Sign Out"
        subtitle="You will be returned to the PLEND login screen"
        maxWidth="sm"
      >
        <div className="space-y-4">
          <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-900 flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold block">Are you sure you want to log out?</span>
              <span className="text-amber-800/90 block mt-0.5">
                Active session for <strong>{currentUser.name}</strong> will be securely closed. Your financial entries remain saved.
              </span>
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setIsLogoutModalOpen(false)}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleConfirmLogout}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-lg shadow-xs transition-colors cursor-pointer"
            >
              <LogOut className="h-3.5 w-3.5" />
              <span>Yes, Sign Out</span>
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <MainLayout />
    </AppProvider>
  );
}
