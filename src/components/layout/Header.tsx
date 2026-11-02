import React, { useState } from 'react';
import { Menu, Plus, RefreshCw, Download, Calendar, Shield, LogOut, User, ShieldCheck, ChevronDown } from 'lucide-react';
import { ActiveTab } from './Sidebar';
import { useApp } from '../../context/AppContext';

interface HeaderProps {
  activeTab: ActiveTab;
  onOpenMobileNav: () => void;
  onQuickAction: (action: 'new_member' | 'record_contrib' | 'new_loan' | 'generate_payouts') => void;
  onOpenLogoutModal?: () => void;
}

const TAB_TITLES: Record<ActiveTab, { title: string; subtitle: string }> = {
  dashboard: {
    title: 'Financial Overview',
    subtitle: 'Real-time metrics, liquidity balance, and lending operations',
  },
  members: {
    title: 'Member Directory',
    subtitle: 'Manage Paluwagan slots, member profiles, and non-member borrowers',
  },
  contributions: {
    title: 'Contribution Tracking',
    subtitle: 'Monthly payment collection matrix, records, and receipts',
  },
  loans: {
    title: 'Lending Operations',
    subtitle: 'Loan applications, interest management, and repayment ledger',
  },
  dividends: {
    title: 'Dividend & Payouts',
    subtitle: 'Paluwagan year-end interest share calculations and distributions',
  },
  reports: {
    title: 'Reports & Audit Logs',
    subtitle: 'Downloadable spreadsheets, statements of account, and transaction trail',
  },
  settings: {
    title: 'System Settings',
    subtitle: 'Cooperative rules, interest rates, penalty configurations, and backup',
  },
};

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  onOpenMobileNav,
  onQuickAction,
  onOpenLogoutModal,
}) => {
  const { currentUser, settings } = useApp();
  const currentTabInfo = TAB_TITLES[activeTab];
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-30 flex h-18 items-center justify-between border-b border-slate-200 bg-white/90 px-4 sm:px-8 backdrop-blur-md">
      {/* Left: Mobile Toggle + Breadcrumb & Title */}
      <div className="flex items-center gap-3">
        <button
          onClick={onOpenMobileNav}
          className="rounded-lg p-2 text-slate-600 hover:bg-slate-100 lg:hidden cursor-pointer"
          aria-label="Open navigation menu"
        >
          <Menu className="h-5 w-5" />
        </button>

        <div>
          <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
            <span>PLEND</span>
            <span aria-hidden="true">/</span>
            <span className="capitalize">{activeTab}</span>
            <span aria-hidden="true">·</span>
            <span className="text-slate-600">Cycle {settings.cycleYear}</span>
          </div>
          <h1 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">
            {currentTabInfo.title}
          </h1>
        </div>
      </div>

      {/* Right: Actions & User Profile Menu */}
      <div className="flex items-center gap-2 sm:gap-3">
        {activeTab === 'members' && (
          <button
            onClick={() => onQuickAction('new_member')}
            className="inline-flex items-center gap-1.5 rounded-lg bg-[#56A0D3] px-3.5 py-2 text-xs sm:text-sm font-semibold text-white shadow-xs hover:bg-[#438bc0] transition-colors cursor-pointer"
          >
            <Plus className="h-4 w-4" />
            <span className="hidden sm:inline">Add Member</span>
            <span className="sm:hidden">Add</span>
          </button>
        )}

        {activeTab === 'contributions' && (
          <button
            onClick={() => onQuickAction('record_contrib')}
            className="inline-flex items-center gap-1.5 rounded-lg bg-[#56A0D3] px-3.5 py-2 text-xs sm:text-sm font-semibold text-white shadow-xs hover:bg-[#438bc0] transition-colors cursor-pointer"
          >
            <Plus className="h-4 w-4" />
            <span className="hidden sm:inline">Record Payment</span>
            <span className="sm:hidden">Pay</span>
          </button>
        )}

        {activeTab === 'loans' && (
          <button
            onClick={() => onQuickAction('new_loan')}
            className="inline-flex items-center gap-1.5 rounded-lg bg-[#56A0D3] px-3.5 py-2 text-xs sm:text-sm font-semibold text-white shadow-xs hover:bg-[#438bc0] transition-colors cursor-pointer"
          >
            <Plus className="h-4 w-4" />
            <span className="hidden sm:inline">New Loan Application</span>
            <span className="sm:hidden">New Loan</span>
          </button>
        )}

        {activeTab === 'dividends' && (
          <button
            onClick={() => onQuickAction('generate_payouts')}
            className="inline-flex items-center gap-1.5 rounded-lg bg-[#56A0D3] px-3.5 py-2 text-xs sm:text-sm font-semibold text-white shadow-xs hover:bg-[#438bc0] transition-colors cursor-pointer"
          >
            <RefreshCw className="h-4 w-4" />
            <span className="hidden sm:inline">Calculate Year-End Payouts</span>
            <span className="sm:hidden">Recalculate</span>
          </button>
        )}

        {activeTab === 'dashboard' && (
          <div className="flex items-center gap-2">
            <button
              onClick={() => onQuickAction('record_contrib')}
              className="inline-flex items-center gap-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 px-3 py-2 text-xs sm:text-sm font-medium text-slate-700 transition-colors cursor-pointer"
            >
              <Plus className="h-4 w-4" />
              <span className="hidden md:inline">Record Payment</span>
              <span className="md:hidden">Payment</span>
            </button>
            <button
              onClick={() => onQuickAction('new_loan')}
              className="inline-flex items-center gap-1.5 rounded-lg bg-[#56A0D3] px-3 py-2 text-xs sm:text-sm font-semibold text-white shadow-xs hover:bg-[#438bc0] transition-colors cursor-pointer"
            >
              <Plus className="h-4 w-4" />
              <span>New Loan</span>
            </button>
          </div>
        )}

        {/* User Profile & Logout Menu */}
        <div className="relative pl-2 sm:pl-3 border-l border-slate-200">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
              className="flex items-center gap-2 p-1.5 sm:px-2.5 sm:py-1.5 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer"
            >
              <div className="h-8 w-8 rounded-full bg-[#56A0D3]/20 flex items-center justify-center text-xs font-bold text-[#2b72a8]">
                {currentUser.name
                  .split(' ')
                  .map(n => n[0])
                  .join('')
                  .substring(0, 2)}
              </div>
              <div className="hidden md:block text-left text-xs">
                <span className="font-semibold text-slate-900 block truncate max-w-[120px]">
                  {currentUser.name}
                </span>
                <span className="text-[11px] text-slate-500 capitalize">
                  {currentUser.role === 'admin' ? 'Administrator' : 'Staff / Collector'}
                </span>
              </div>
              <ChevronDown className="h-3.5 w-3.5 text-slate-400 hidden sm:block" />
            </button>

            {onOpenLogoutModal && (
              <button
                type="button"
                onClick={onOpenLogoutModal}
                title="Log Out of PLEND"
                className="hidden sm:inline-flex p-2 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                aria-label="Log Out"
              >
                <LogOut className="h-4 w-4" />
              </button>
            )}
          </div>

          {/* Profile Dropdown Menu */}
          {isProfileMenuOpen && (
            <>
              <div
                className="fixed inset-0 z-30"
                onClick={() => setIsProfileMenuOpen(false)}
              />
              <div className="absolute right-0 mt-2 w-64 rounded-xl bg-white border border-slate-200 shadow-lg py-2 z-40 space-y-1">
                <div className="px-4 py-2 border-b border-slate-100">
                  <p className="text-xs font-bold text-slate-900">{currentUser.name}</p>
                  <p className="text-[11px] text-slate-500 truncate">{currentUser.email}</p>
                  <div className="mt-1.5">
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#56A0D3]/15 text-[#2b72a8]">
                      <ShieldCheck className="h-3 w-3" />
                      {currentUser.role === 'admin' ? 'Cooperative Administrator' : 'Staff Access'}
                    </span>
                  </div>
                  {currentUser.lastLogin && (
                    <p className="text-[10px] text-slate-400 mt-1">
                      Logged in: {currentUser.lastLogin}
                    </p>
                  )}
                </div>

                <div className="px-2 pt-1">
                  <button
                    onClick={() => {
                      setIsProfileMenuOpen(false);
                      onOpenLogoutModal?.();
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer text-left"
                  >
                    <LogOut className="h-4 w-4" />
                    <span>Log Out from PLEND</span>
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
};
