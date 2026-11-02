import React from 'react';
import {
  Coins,
  HandCoins,
  TrendingUp,
  AlertTriangle,
  Clock,
  CreditCard,
  Percent,
  CheckCircle2,
  Calendar,
  Users,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { formatCurrency, calculateLoanBalance, MONTH_SHORT_NAMES } from '../../utils/calculations';
import { ActiveTab } from '../layout/Sidebar';

interface DashboardViewProps {
  setActiveTab: (tab: ActiveTab) => void;
  onOpenQuickAction: (action: 'new_member' | 'record_contrib' | 'new_loan' | 'generate_payouts') => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  setActiveTab,
  onOpenQuickAction,
}) => {
  const { financialSummary, loans, contributions, members, settings } = useApp();

  // Find overdue loans
  const overdueLoanItems = loans.filter(l => {
    if (l.status === 'overdue') return true;
    if (l.status === 'active') {
      const { isOverdue } = calculateLoanBalance(l);
      return isOverdue;
    }
    return false;
  });

  // Calculate monthly stats for 12 months chart
  const monthlyStats = Array.from({ length: 12 }, (_, i) => {
    const month = i + 1;
    const contribs = contributions
      .filter(c => c.month === month && c.year === settings.cycleYear && (c.status === 'paid' || c.status === 'late'))
      .reduce((sum, c) => sum + c.paidAmount, 0);

    const disbursed = loans
      .filter(l => {
        if (!l.startDate) return false;
        const d = new Date(l.startDate);
        return d.getMonth() + 1 === month && d.getFullYear() === settings.cycleYear && (l.status === 'active' || l.status === 'fully_paid' || l.status === 'overdue');
      })
      .reduce((sum, l) => sum + l.principalAmount, 0);

    let repayments = 0;
    loans.forEach(l => {
      (l.repayments || []).forEach(r => {
        const d = new Date(r.paymentDate);
        if (d.getMonth() + 1 === month && d.getFullYear() === settings.cycleYear) {
          repayments += r.totalPaid;
        }
      });
    });

    return {
      monthName: MONTH_SHORT_NAMES[i],
      month,
      contribs,
      disbursed,
      repayments,
    };
  });

  const maxChartVal = Math.max(
    ...monthlyStats.map(s => Math.max(s.contribs, s.disbursed, s.repayments)),
    40000
  );

  return (
    <div className="space-y-6">
      {/* Alert Banners if any pending approvals or overdue loans */}
      {(financialSummary.pendingLoansCount > 0 || financialSummary.overdueLoansCount > 0) && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {financialSummary.pendingLoansCount > 0 && (
            <div className="flex items-center justify-between p-4 rounded-xl bg-amber-50/80 border border-amber-200">
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 rounded-lg bg-amber-100 flex items-center justify-center text-amber-800 shrink-0">
                  <Clock className="h-4 w-4" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-amber-900">
                    {financialSummary.pendingLoansCount} Pending Loan Application{financialSummary.pendingLoansCount > 1 ? 's' : ''}
                  </h4>
                  <p className="text-xs text-amber-700">Awaiting credit review</p>
                </div>
              </div>
              <button
                onClick={() => setActiveTab('loans')}
                className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-amber-600 text-white hover:bg-amber-700 transition-colors shrink-0 cursor-pointer"
              >
                Review
              </button>
            </div>
          )}

          {financialSummary.overdueLoansCount > 0 && (
            <div className="flex items-center justify-between p-4 rounded-xl bg-rose-50/80 border border-rose-200">
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 rounded-lg bg-rose-100 flex items-center justify-center text-rose-800 shrink-0">
                  <AlertTriangle className="h-4 w-4" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-rose-900">
                    {financialSummary.overdueLoansCount} Overdue Account{financialSummary.overdueLoansCount > 1 ? 's' : ''}
                  </h4>
                  <p className="text-xs text-rose-700 tabular-nums">
                    Overdue: {formatCurrency(financialSummary.totalOverdueLoanBalance)}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setActiveTab('loans')}
                className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-rose-600 text-white hover:bg-rose-700 transition-colors shrink-0 cursor-pointer"
              >
                View
              </button>
            </div>
          )}
        </div>
      )}

      {/* KPI Cards: Core Financial Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Collections */}
        <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">
                Total Collections
              </span>
              <div className="h-8 w-8 rounded-lg bg-[#56A0D3]/12 text-[#2b72a8] flex items-center justify-center">
                <Coins className="h-4 w-4" />
              </div>
            </div>
            <div className="mt-2 text-2xl font-bold tracking-tight text-slate-900 tabular-nums">
              {formatCurrency(financialSummary.totalContributionsCollected)}
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
            <span className="text-slate-500">Collection Rate</span>
            <span className="font-semibold text-emerald-700 tabular-nums">
              {financialSummary.contributionCollectionRate.toFixed(1)}%
            </span>
          </div>
        </div>

        {/* Available Lending Capital */}
        <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">
                Available Capital
              </span>
              <div className="h-8 w-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center">
                <CreditCard className="h-4 w-4" />
              </div>
            </div>
            <div className="mt-2 text-2xl font-bold tracking-tight text-[#2b72a8] tabular-nums">
              {formatCurrency(financialSummary.availableLendingCapital)}
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
            <span className="text-slate-500">Liquid Reserve</span>
            <span className="font-semibold text-slate-700 tabular-nums">
              {financialSummary.totalCashIn > 0
                ? `${((financialSummary.availableLendingCapital / financialSummary.totalCashIn) * 100).toFixed(0)}% Inflow`
                : '100%'}
            </span>
          </div>
        </div>

        {/* Outstanding Principal */}
        <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">
                Outstanding Principal
              </span>
              <div className="h-8 w-8 rounded-lg bg-[#FAD2E1]/60 text-slate-700 flex items-center justify-center">
                <HandCoins className="h-4 w-4" />
              </div>
            </div>
            <div className="mt-2 text-2xl font-bold tracking-tight text-slate-900 tabular-nums">
              {formatCurrency(financialSummary.totalOutstandingPrincipal)}
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
            <span className="text-slate-500">Active Loans</span>
            <span className="font-semibold text-slate-700 tabular-nums">
              {financialSummary.activeLoansCount} Accounts
            </span>
          </div>
        </div>

        {/* Total Interest Income (Dividend Pool) */}
        <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">
                Total Interest Income
              </span>
              <div className="h-8 w-8 rounded-lg bg-purple-100 text-purple-700 flex items-center justify-center">
                <TrendingUp className="h-4 w-4" />
              </div>
            </div>
            <div className="mt-2 text-2xl font-bold tracking-tight text-purple-900 tabular-nums">
              {formatCurrency(financialSummary.totalRevenue)}
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
            <span className="text-slate-500">Projected Pool</span>
            <span className="font-semibold text-purple-800 tabular-nums">
              ₱{financialSummary.projectedDividendPerSlot.toFixed(0)} / slot
            </span>
          </div>
        </div>
      </div>

      {/* Secondary Quick Metrics Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-xs">
          <span className="text-xs text-slate-500 block">Active Slots</span>
          <span className="text-xl font-bold tracking-tight text-slate-900 tabular-nums mt-1 block">
            {financialSummary.totalActiveSlots} Slots
          </span>
        </div>

        <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-xs">
          <span className="text-xs text-slate-500 block">Principal Repaid</span>
          <span className="text-xl font-bold tracking-tight text-emerald-700 tabular-nums mt-1 block">
            {formatCurrency(financialSummary.totalPrincipalRepaid)}
          </span>
        </div>

        <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-xs">
          <span className="text-xs text-slate-500 block">External Borrowers</span>
          <span className="text-xl font-bold tracking-tight text-slate-900 tabular-nums mt-1 block">
            {financialSummary.nonMemberBorrowers} Accounts
          </span>
        </div>

        <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-xs">
          <span className="text-xs text-slate-500 block">Uncollected Dues</span>
          <span className="text-xl font-bold tracking-tight text-amber-700 tabular-nums mt-1 block">
            {formatCurrency(financialSummary.totalUnpaidContributionsAmount)}
          </span>
        </div>
      </div>

      {/* Charts & Fund Structure Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Monthly Financial Trend Chart */}
        <div className="lg:col-span-2 bg-white rounded-xl p-6 border border-slate-200 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 gap-2">
            <h3 className="text-sm font-bold text-slate-900">
              Monthly Cash Flow ({settings.cycleYear})
            </h3>
            <div className="flex items-center gap-4 text-xs">
              <div className="flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 rounded-full bg-[#56A0D3]" />
                <span className="text-slate-600">Contributions</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 rounded-full bg-[#FAD2E1]" />
                <span className="text-slate-600">Disbursed</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
                <span className="text-slate-600">Repayments</span>
              </div>
            </div>
          </div>

          {/* Bar Chart */}
          <div className="pt-6">
            <div className="h-64 flex items-end gap-2 sm:gap-3 px-1">
              {monthlyStats.map((stat, idx) => {
                const contribHeight = Math.max(4, (stat.contribs / maxChartVal) * 220);
                const disbursedHeight = Math.max(0, (stat.disbursed / maxChartVal) * 220);
                const repaymentHeight = Math.max(0, (stat.repayments / maxChartVal) * 220);

                return (
                  <div key={idx} className="flex-1 flex flex-col items-center h-full justify-end group relative">
                    <div className="absolute -top-12 opacity-0 group-hover:opacity-100 transition-opacity bg-slate-900 text-white text-[10px] rounded px-2 py-1 pointer-events-none z-20 whitespace-nowrap shadow-md tabular-nums">
                      <span>{stat.monthName}: ₱{stat.contribs.toLocaleString()}</span>
                    </div>

                    <div className="w-full flex items-end justify-center gap-1 h-56">
                      <div
                        className="w-2 sm:w-2.5 bg-[#56A0D3] rounded-t-sm transition-all duration-300"
                        style={{ height: `${contribHeight}px` }}
                      />
                      {stat.disbursed > 0 && (
                        <div
                          className="w-2 sm:w-2.5 bg-[#F8C8DC] rounded-t-sm transition-all duration-300"
                          style={{ height: `${disbursedHeight}px` }}
                        />
                      )}
                      {stat.repayments > 0 && (
                        <div
                          className="w-2 sm:w-2.5 bg-emerald-500 rounded-t-sm transition-all duration-300"
                          style={{ height: `${repaymentHeight}px` }}
                        />
                      )}
                    </div>
                    <span className="text-[10px] text-slate-500 mt-2 font-medium">
                      {stat.monthName}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="mt-4 pt-4 border-t border-slate-100 grid grid-cols-3 gap-3 text-center text-xs">
            <div className="p-2.5 rounded-lg bg-slate-50">
              <span className="text-slate-500 block text-[11px]">Total Inflow</span>
              <span className="font-bold tracking-tight text-slate-900 tabular-nums mt-0.5 block">
                {formatCurrency(financialSummary.totalCashIn)}
              </span>
            </div>
            <div className="p-2.5 rounded-lg bg-slate-50">
              <span className="text-slate-500 block text-[11px]">Total Outflow</span>
              <span className="font-bold tracking-tight text-slate-900 tabular-nums mt-0.5 block">
                {formatCurrency(financialSummary.totalCashOut)}
              </span>
            </div>
            <div className="p-2.5 rounded-lg bg-slate-50">
              <span className="text-slate-500 block text-[11px]">Net Available</span>
              <span className="font-bold tracking-tight text-[#2b72a8] tabular-nums mt-0.5 block">
                {formatCurrency(financialSummary.availableLendingCapital)}
              </span>
            </div>
          </div>
        </div>

        {/* Capital Allocation & Separation */}
        <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-xs flex flex-col justify-between">
          <div>
            <div className="pb-4 border-b border-slate-100">
              <h3 className="text-sm font-bold text-slate-900">
                Capital Allocation
              </h3>
            </div>

            <div className="mt-5 space-y-4">
              {/* Contributions Portion */}
              <div>
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="text-slate-600">Member Contributions</span>
                  <span className="font-bold text-slate-900 tabular-nums">
                    {formatCurrency(financialSummary.totalContributionsCollected)}
                  </span>
                </div>
                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-[#56A0D3] h-full rounded-full"
                    style={{
                      width: `${financialSummary.totalCashIn > 0 ? (financialSummary.totalContributionsCollected / financialSummary.totalCashIn) * 100 : 0}%`,
                    }}
                  />
                </div>
              </div>

              {/* Principal Repayments */}
              <div>
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="text-slate-600">Principal Repaid</span>
                  <span className="font-bold text-emerald-700 tabular-nums">
                    {formatCurrency(financialSummary.totalPrincipalRepaid)}
                  </span>
                </div>
                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-emerald-500 h-full rounded-full"
                    style={{
                      width: `${financialSummary.totalCashIn > 0 ? (financialSummary.totalPrincipalRepaid / financialSummary.totalCashIn) * 100 : 0}%`,
                    }}
                  />
                </div>
              </div>

              {/* Interest Income Reserve */}
              <div>
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="text-slate-600">Interest Earned</span>
                  <span className="font-bold text-purple-700 tabular-nums">
                    {formatCurrency(financialSummary.totalRevenue)}
                  </span>
                </div>
                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-purple-500 h-full rounded-full"
                    style={{
                      width: `${financialSummary.totalCashIn > 0 ? (financialSummary.totalRevenue / financialSummary.totalCashIn) * 100 : 0}%`,
                    }}
                  />
                </div>
              </div>

              {/* Active Loans Outstanding */}
              <div>
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="text-slate-600">Outstanding Loans</span>
                  <span className="font-bold text-amber-700 tabular-nums">
                    {formatCurrency(financialSummary.totalOutstandingPrincipal)}
                  </span>
                </div>
                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-amber-400 h-full rounded-full"
                    style={{
                      width: `${financialSummary.totalPrincipalDisbursed > 0 ? (financialSummary.totalOutstandingPrincipal / financialSummary.totalPrincipalDisbursed) * 100 : 0}%`,
                    }}
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6 p-4 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between text-xs">
            <span className="text-slate-600">Standard Slot Rate</span>
            <span className="font-bold text-slate-900 tabular-nums">
              ₱{settings.contributionPerSlot.toLocaleString()} / month
            </span>
          </div>
        </div>
      </div>

      {/* Paluwagan Members & Active Loans Watchlist */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Members Strip */}
        <div className="lg:col-span-2 bg-white rounded-xl p-6 border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <h3 className="text-sm font-bold text-slate-900">
              Paluwagan Member Slots
            </h3>
            <button
              onClick={() => setActiveTab('members')}
              className="text-xs font-semibold text-[#2b72a8] hover:underline cursor-pointer"
            >
              View All ({members.length}) →
            </button>
          </div>

          <div className="mt-2 divide-y divide-slate-100">
            {members
              .filter(m => m.classification === 'member')
              .slice(0, 5)
              .map(member => {
                const memberPaid = contributions
                  .filter(c => c.memberId === member.id && c.year === settings.cycleYear && (c.status === 'paid' || c.status === 'late'))
                  .reduce((sum, c) => sum + c.paidAmount, 0);

                return (
                  <div key={member.id} className="py-3 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded-full bg-[#56A0D3]/15 text-[#2b72a8] flex items-center justify-center font-bold text-xs tabular-nums">
                        {member.slots}S
                      </div>
                      <div>
                        <span className="text-sm font-semibold text-slate-900 block">
                          {member.fullName}
                        </span>
                        <div className="flex items-center gap-2 text-xs text-slate-500">
                          <span className="font-medium text-slate-600">{member.memberCode}</span>
                          <span aria-hidden="true">·</span>
                          <span className="tabular-nums">₱{(member.slots * settings.contributionPerSlot).toLocaleString()}/mo</span>
                        </div>
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="text-sm font-bold tracking-tight text-slate-900 tabular-nums block">
                        {formatCurrency(memberPaid)}
                      </span>
                    </div>
                  </div>
                );
              })}
          </div>
        </div>

        {/* Active Loans */}
        <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <h3 className="text-sm font-bold text-slate-900">
                Active Loans
              </h3>
              <button
                onClick={() => setActiveTab('loans')}
                className="text-xs font-semibold text-[#2b72a8] hover:underline cursor-pointer"
              >
                Loans ({loans.length}) →
              </button>
            </div>

            <div className="mt-3 space-y-2.5">
              {loans.slice(0, 4).map(loan => {
                const borrower = members.find(m => m.id === loan.borrowerId);
                const { principalBalance, isOverdue } = calculateLoanBalance(loan);

                return (
                  <div
                    key={loan.id}
                    className="p-3 rounded-lg border border-slate-100 bg-slate-50/60 flex items-center justify-between text-xs"
                  >
                    <div>
                      <span className="font-semibold text-slate-900 block">
                        {borrower?.fullName || 'Borrower'}
                      </span>
                      <div className="text-slate-500 text-[11px] mt-0.5 tabular-nums">
                        {loan.loanCode} · Due {loan.dueDate}
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="font-bold tracking-tight text-slate-900 tabular-nums block">
                        {formatCurrency(principalBalance)}
                      </span>
                      {isOverdue ? (
                        <span className="text-[10px] font-bold text-rose-600">OVERDUE</span>
                      ) : loan.status === 'fully_paid' ? (
                        <span className="text-[10px] font-bold text-emerald-600">PAID</span>
                      ) : (
                        <span className="text-[10px] font-medium text-slate-500">Active</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="mt-5 pt-4 border-t border-slate-100 flex gap-2">
            <button
              onClick={() => onOpenQuickAction('record_contrib')}
              className="flex-1 py-2 px-3 rounded-lg bg-slate-100 hover:bg-slate-200 text-xs font-semibold text-slate-800 transition-colors text-center cursor-pointer"
            >
              + Record Payment
            </button>
            <button
              onClick={() => onOpenQuickAction('new_loan')}
              className="flex-1 py-2 px-3 rounded-lg bg-[#56A0D3] hover:bg-[#438bc0] text-xs font-semibold text-white transition-colors text-center cursor-pointer"
            >
              + New Loan
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
