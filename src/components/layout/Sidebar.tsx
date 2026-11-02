import React from 'react';
import {
  LayoutDashboard,
  Users,
  Coins,
  HandCoins,
  PieChart,
  FileSpreadsheet,
  Settings,
  ShieldCheck,
  UserCheck,
  ChevronRight,
  Sparkles,
  LogOut,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

export type ActiveTab =
  | 'dashboard'
  | 'members'
  | 'contributions'
  | 'loans'
  | 'dividends'
  | 'reports'
  | 'settings';

interface SidebarProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  isOpenMobile: boolean;
  setIsOpenMobile: (open: boolean) => void;
  onOpenLogoutModal?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
  isOpenMobile,
  setIsOpenMobile,
  onOpenLogoutModal,
}) => {
  const { currentUser, switchRole, financialSummary, settings } = useApp();

  const navItems = [
    {
      id: 'dashboard' as ActiveTab,
      label: 'Dashboard',
      icon: LayoutDashboard,
      badge: null,
    },
    {
      id: 'members' as ActiveTab,
      label: 'Members & Slots',
      icon: Users,
      badge: `${financialSummary.activePaluwaganMembers + financialSummary.nonMemberBorrowers}`,
    },
    {
      id: 'contributions' as ActiveTab,
      label: 'Contributions',
      icon: Coins,
      badge: financialSummary.totalUnpaidContributionsAmount > 0 ? 'Due' : null,
      badgeColor: 'bg-amber-100 text-amber-800',
    },
    {
      id: 'loans' as ActiveTab,
      label: 'Lending & Loans',
      icon: HandCoins,
      badge: financialSummary.pendingLoansCount > 0
        ? `${financialSummary.pendingLoansCount} pending`
        : financialSummary.overdueLoansCount > 0
        ? `${financialSummary.overdueLoansCount} overdue`
        : null,
      badgeColor: financialSummary.overdueLoansCount > 0 ? 'bg-rose-100 text-rose-800' : 'bg-blue-100 text-blue-800',
    },
    {
      id: 'dividends' as ActiveTab,
      label: 'Dividends & Payout',
      icon: PieChart,
      badge: null,
    },
    {
      id: 'reports' as ActiveTab,
      label: 'Reports & Audit',
      icon: FileSpreadsheet,
      badge: null,
    },
    {
      id: 'settings' as ActiveTab,
      label: 'System Settings',
      icon: Settings,
      badge: null,
    },
  ];

  const handleNavClick = (tab: ActiveTab) => {
    setActiveTab(tab);
    setIsOpenMobile(false);
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpenMobile && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/30 backdrop-blur-xs lg:hidden"
          onClick={() => setIsOpenMobile(false)}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 flex w-72 flex-col bg-white border-r border-slate-200 transition-transform duration-200 lg:static lg:translate-x-0 ${
          isOpenMobile ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand Header */}
        <div className="flex h-20 items-center px-5 border-b border-slate-100 bg-white">
          <img
            src="/assets/aistudio/image_7d56f63b.png"
            alt="PLEND Paluwagan & Lending System"
            className="h-13 w-auto object-contain max-w-[210px]"
          />
        </div>

        {/* Navigation List */}
        <div className="flex-1 overflow-y-auto px-4 py-5 space-y-1.5">

          {navItems.map(item => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-lg text-sm font-medium transition-colors cursor-pointer ${
                  isActive
                    ? 'bg-[#56A0D3]/12 text-[#2b72a8] font-semibold'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon
                    className={`h-4.5 w-4.5 shrink-0 ${
                      isActive ? 'text-[#56A0D3]' : 'text-slate-400 group-hover:text-slate-600'
                    }`}
                  />
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span
                    className={`text-[11px] font-medium px-2 py-0.5 rounded-full ${
                      item.badgeColor || 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Quick Summary in Sidebar */}
        <div className="px-4 py-3.5 mx-4 mb-3 rounded-xl bg-slate-50 border border-slate-200">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs font-semibold text-slate-600">Available Capital</span>
            <span className="text-xs font-extrabold text-[#2b72a8] tabular-nums">
              ₱{financialSummary.availableLendingCapital.toLocaleString('en-PH', { maximumFractionDigits: 0 })}
            </span>
          </div>
          <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
            <div
              className="bg-[#56A0D3] h-full rounded-full transition-all duration-500"
              style={{
                width: `${Math.min(
                  100,
                  (financialSummary.availableLendingCapital / (financialSummary.totalCashIn || 1)) * 100
                )}%`,
              }}
            />
          </div>
          <div className="flex items-center justify-between mt-2 text-[11px] text-slate-500">
            <span>Interest Pool</span>
            <span className="font-bold text-emerald-700 tabular-nums">
              +₱{financialSummary.totalInterestEarned.toLocaleString()}
            </span>
          </div>
        </div>

        {/* Role Switcher & Current User Profile */}
        <div className="p-4 border-t border-slate-200 bg-[#F8FAFC]">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="h-9 w-9 shrink-0 rounded-full bg-[#56A0D3]/20 flex items-center justify-center text-xs font-bold text-[#2b72a8]">
                {currentUser.name
                  .split(' ')
                  .map(n => n[0])
                  .join('')
                  .substring(0, 2)}
              </div>
              <div className="min-w-0">
                <p className="text-xs font-semibold text-slate-900 truncate">{currentUser.name}</p>
                <div className="flex items-center gap-1.5 text-[11px] text-slate-500">
                  {currentUser.role === 'admin' ? (
                    <span className="inline-flex items-center gap-1 text-emerald-700 font-medium">
                      <ShieldCheck className="h-3 w-3" /> Admin
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-blue-700 font-medium">
                      <UserCheck className="h-3 w-3" /> Staff
                    </span>
                  )}
                  <span>·</span>
                  <span className="truncate">{currentUser.email}</span>
                </div>
              </div>
            </div>

            {onOpenLogoutModal && (
              <button
                type="button"
                onClick={onOpenLogoutModal}
                title="Log Out of PLEND"
                className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                aria-label="Log Out"
              >
                <LogOut className="h-4 w-4" />
              </button>
            )}
          </div>

          {/* Interactive Role Switcher Toggle */}
          <div className="flex items-center p-1 bg-slate-200/80 rounded-lg text-xs font-medium">
            <button
              onClick={() => switchRole('admin')}
              className={`flex-1 py-1.5 px-2 rounded-md transition-colors text-center cursor-pointer ${
                currentUser.role === 'admin'
                  ? 'bg-white text-slate-900 shadow-xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Administrator
            </button>
            <button
              onClick={() => switchRole('staff')}
              className={`flex-1 py-1.5 px-2 rounded-md transition-colors text-center cursor-pointer ${
                currentUser.role === 'staff'
                  ? 'bg-white text-slate-900 shadow-xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Staff / Collector
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};
