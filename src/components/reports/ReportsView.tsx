import React, { useState } from 'react';
import {
  FileSpreadsheet,
  Download,
  Printer,
  ShieldCheck,
  Calendar,
  Filter,
  Search,
  CheckCircle2,
  FileText,
  User,
  ArrowUpRight,
  Sparkles,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { AuditModule, Member } from '../../types';
import {
  formatCurrency,
  calculateLoanBalance,
  calculateMemberDividend,
  MONTH_NAMES,
} from '../../utils/calculations';
import {
  exportContributionsToExcel,
  exportDividendsToExcel,
  exportFinancialSummaryToExcel,
  exportLoansToExcel,
} from '../../utils/exportReports';
import { Modal } from '../common/Modal';

export const ReportsView: React.FC = () => {
  const {
    members,
    contributions,
    loans,
    payouts,
    auditLogs,
    settings,
    financialSummary,
  } = useApp();

  const [activeTab, setActiveTab] = useState<'exports' | 'statement' | 'audit'>('exports');
  const [selectedMemberId, setSelectedMemberId] = useState<string>(members[0]?.id || '');
  const [auditModuleFilter, setAuditModuleFilter] = useState<'all' | AuditModule>('all');
  const [auditSearch, setAuditSearch] = useState('');

  const selectedMember = members.find(m => m.id === selectedMemberId);

  // Filtered audit logs
  const filteredAuditLogs = auditLogs.filter(log => {
    const matchModule = auditModuleFilter === 'all' || log.module === auditModuleFilter;
    const matchSearch =
      log.details.toLowerCase().includes(auditSearch.toLowerCase()) ||
      log.action.toLowerCase().includes(auditSearch.toLowerCase()) ||
      log.userName.toLowerCase().includes(auditSearch.toLowerCase());
    return matchModule && matchSearch;
  });

  return (
    <div className="space-y-6">
      {/* Tab Navigation */}
      <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center p-1 bg-slate-100 rounded-lg text-xs font-medium">
          <button
            onClick={() => setActiveTab('exports')}
            className={`px-3 py-1.5 rounded-md transition-colors cursor-pointer ${
              activeTab === 'exports'
                ? 'bg-white text-slate-900 shadow-xs font-semibold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Financial Reports & Excel
          </button>
          <button
            onClick={() => setActiveTab('statement')}
            className={`px-3 py-1.5 rounded-md transition-colors cursor-pointer ${
              activeTab === 'statement'
                ? 'bg-white text-slate-900 shadow-xs font-semibold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Member Statement of Account
          </button>
          <button
            onClick={() => setActiveTab('audit')}
            className={`px-3 py-1.5 rounded-md transition-colors cursor-pointer ${
              activeTab === 'audit'
                ? 'bg-white text-slate-900 shadow-xs font-semibold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            System Audit Trail ({auditLogs.length})
          </button>
        </div>

        {activeTab === 'statement' && (
          <div className="flex items-center gap-2">
            <select
              value={selectedMemberId}
              onChange={e => setSelectedMemberId(e.target.value)}
              className="px-3 py-1.5 text-xs bg-[#F8FAFC] border border-slate-200 rounded-lg focus:outline-none"
            >
              {members.map(m => (
                <option key={m.id} value={m.id}>
                  {m.fullName} ({m.memberCode})
                </option>
              ))}
            </select>
            <button
              onClick={() => window.print()}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-[#56A0D3] text-white hover:bg-[#438bc0] transition-colors cursor-pointer"
            >
              <Printer className="h-3.5 w-3.5" />
              <span>Print Statement</span>
            </button>
          </div>
        )}
      </div>

      {/* TAB 1: Financial Reports & Downloads */}
      {activeTab === 'exports' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Card 1: Contributions Ledger */}
            <div className="p-5 rounded-xl bg-white border border-slate-200 shadow-xs flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                    Paluwagan Contributions Ledger
                  </span>
                  <div className="h-8 w-8 rounded-lg bg-[#56A0D3]/12 text-[#2b72a8] flex items-center justify-center">
                    <FileSpreadsheet className="h-4 w-4" />
                  </div>
                </div>
                <p className="text-xs text-slate-500">
                  Full 12-month matrix breakdown for all members, including slots, monthly paid amounts, late payments, and YTD balances.
                </p>
                <div className="mt-4 pt-3 border-t border-slate-100 text-xs flex justify-between text-slate-600">
                  <span>Total Collected:</span>
                  <span className="font-bold tabular-nums text-slate-900">
                    {formatCurrency(financialSummary.totalContributionsCollected)}
                  </span>
                </div>
              </div>

              <button
                onClick={() => exportContributionsToExcel(members, contributions, settings.cycleYear)}
                className="mt-5 w-full inline-flex items-center justify-center gap-2 py-2 px-4 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs shadow-xs transition-colors cursor-pointer"
              >
                <Download className="h-4 w-4" />
                <span>Download Contributions Excel (.xlsx)</span>
              </button>
            </div>

            {/* Card 2: Loan Portfolio & Repayments */}
            <div className="p-5 rounded-xl bg-white border border-slate-200 shadow-xs flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                    Loan Portfolio & Repayments
                  </span>
                  <div className="h-8 w-8 rounded-lg bg-purple-100 text-purple-700 flex items-center justify-center">
                    <FileSpreadsheet className="h-4 w-4" />
                  </div>
                </div>
                <p className="text-xs text-slate-500">
                  Register of all cash loans issued, principal disbursed, repaid principal, and interest earned.
                </p>
                <div className="mt-4 pt-3 border-t border-slate-100 text-xs flex justify-between text-slate-600">
                  <span>Interest Income Earned:</span>
                  <span className="font-bold tabular-nums text-purple-700">
                    {formatCurrency(financialSummary.totalInterestEarned)}
                  </span>
                </div>
              </div>

              <button
                onClick={() => exportLoansToExcel(loans, members)}
                className="mt-5 w-full inline-flex items-center justify-center gap-2 py-2 px-4 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs shadow-xs transition-colors cursor-pointer"
              >
                <Download className="h-4 w-4" />
                <span>Download Loan Portfolio Excel (.xlsx)</span>
              </button>
            </div>

            {/* Card 3: Year-End Dividend Distribution */}
            <div className="p-5 rounded-xl bg-white border border-slate-200 shadow-xs flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                    Year-End Dividend & Payout Sheet
                  </span>
                  <div className="h-8 w-8 rounded-lg bg-[#FAD2E1]/60 text-slate-700 flex items-center justify-center">
                    <FileSpreadsheet className="h-4 w-4" />
                  </div>
                </div>
                <p className="text-xs text-slate-500">
                  Profit-sharing calculations, member slot percentages, dividend earnings, and disbursement records.
                </p>
                <div className="mt-4 pt-3 border-t border-slate-100 text-xs flex justify-between text-slate-600">
                  <span>Total Dividend Pool:</span>
                  <span className="font-bold tabular-nums text-emerald-700">
                    {formatCurrency(financialSummary.totalRevenue)}
                  </span>
                </div>
              </div>

              <button
                onClick={() => exportDividendsToExcel(payouts, members, settings.cycleYear)}
                className="mt-5 w-full inline-flex items-center justify-center gap-2 py-2 px-4 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs shadow-xs transition-colors cursor-pointer"
              >
                <Download className="h-4 w-4" />
                <span>Download Dividend Sheet (.xlsx)</span>
              </button>
            </div>

            {/* Card 4: Financial Summary & Cash Flow */}
            <div className="p-5 rounded-xl bg-white border border-slate-200 shadow-xs flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                    Executive Financial Summary
                  </span>
                  <div className="h-8 w-8 rounded-lg bg-amber-100 text-amber-800 flex items-center justify-center">
                    <FileSpreadsheet className="h-4 w-4" />
                  </div>
                </div>
                <p className="text-xs text-slate-500">
                  Financial KPI sheet, liquid capital status, principal recovery rate, and cooperative solvency.
                </p>
                <div className="mt-4 pt-3 border-t border-slate-100 text-xs flex justify-between text-slate-600">
                  <span>Available Lending Capital:</span>
                  <span className="font-bold tabular-nums text-[#2b72a8]">
                    {formatCurrency(financialSummary.availableLendingCapital)}
                  </span>
                </div>
              </div>

              <button
                onClick={() =>
                  exportFinancialSummaryToExcel(
                    members,
                    contributions,
                    loans,
                    payouts,
                    settings
                  )
                }
                className="mt-5 w-full inline-flex items-center justify-center gap-2 py-2 px-4 rounded-lg bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs shadow-xs transition-colors cursor-pointer"
              >
                <Download className="h-4 w-4" />
                <span>Download Executive Summary (.xlsx)</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: Printable Statement of Account */}
      {activeTab === 'statement' && selectedMember && (
        <div className="bg-white rounded-2xl p-8 border border-slate-200 shadow-xs max-w-4xl mx-auto space-y-6">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-slate-200 gap-4">
            <div>
              <img
                src="/assets/aistudio/image_7d56f63b.png"
                alt="PLEND Paluwagan & Lending System"
                className="h-12 w-auto object-contain mb-2"
              />
              <h2 className="text-base font-bold text-slate-900">
                Official Statement of Account
              </h2>
              <p className="text-xs text-slate-500">
                Paluwagan Contributions, Credit Balance, and Dividend Entitlement
              </p>
            </div>

            <div className="text-right text-xs">
              <span className="text-slate-500 block">Statement Date:</span>
              <span className="font-semibold text-slate-900 tabular-nums">
                {new Date().toISOString().split('T')[0]}
              </span>
              <span className="text-slate-500 block mt-1">Cycle Year:</span>
              <span className="font-bold text-slate-900 tabular-nums">{settings.cycleYear}</span>
            </div>
          </div>

          {/* Member Details Strip */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 rounded-xl bg-[#F8FAFC] border border-slate-200 text-xs">
            <div>
              <span className="text-slate-500 block">Member Name:</span>
              <span className="font-bold text-slate-900 text-sm block mt-0.5">
                {selectedMember.fullName}
              </span>
              <span className="text-slate-500 block tabular-nums">{selectedMember.memberCode}</span>
            </div>

            <div>
              <span className="text-slate-500 block">Contact:</span>
              <span className="text-slate-800 font-medium block mt-0.5">
                {selectedMember.phone}
              </span>
              <span className="text-slate-500 block truncate">{selectedMember.address || 'Pasig City'}</span>
            </div>

            <div>
              <span className="text-slate-500 block">Account Classification:</span>
              <span className="font-bold text-[#2b72a8] block mt-0.5">
                {selectedMember.classification === 'member'
                  ? `Paluwagan Member (${selectedMember.slots} Slots)`
                  : 'Non-Member Borrower'}
              </span>
              <span className="text-slate-500 block tabular-nums">
                {selectedMember.paymentDetails.method}: {selectedMember.paymentDetails.accountNumber || 'OTC'}
              </span>
            </div>
          </div>

          {/* Contributions Summary */}
          {selectedMember.classification === 'member' && (
            <div>
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2">
                1. Monthly Paluwagan Contributions History ({settings.cycleYear})
              </h3>

              <div className="border border-slate-200 rounded-xl overflow-hidden">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200 font-semibold text-slate-600">
                      <th className="py-2.5 px-3">Month</th>
                      <th className="py-2.5 px-3 text-right">Expected</th>
                      <th className="py-2.5 px-3 text-right">Paid Amount</th>
                      <th className="py-2.5 px-3">Payment Date</th>
                      <th className="py-2.5 px-3">Method / Ref</th>
                      <th className="py-2.5 px-3 text-center">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {Array.from({ length: 12 }, (_, i) => {
                      const month = i + 1;
                      const p = contributions.find(
                        c =>
                          c.memberId === selectedMember.id &&
                          c.month === month &&
                          c.year === settings.cycleYear
                      );
                      const isPaid = p?.status === 'paid' || p?.status === 'late';

                      return (
                        <tr key={month}>
                          <td className="py-2 px-3 font-medium text-slate-800">
                            {MONTH_NAMES[i]}
                          </td>
                          <td className="py-2 px-3 text-right tabular-nums text-slate-600">
                            ₱{(selectedMember.slots * settings.contributionPerSlot).toLocaleString()}
                          </td>
                          <td className="py-2 px-3 text-right tabular-nums font-bold text-slate-900">
                            {isPaid ? `₱${p.paidAmount.toLocaleString()}` : '₱0'}
                          </td>
                          <td className="py-2 px-3 text-slate-600">
                            {p?.paymentDate || '—'}
                          </td>
                          <td className="py-2 px-3 text-slate-600">
                            {p?.paymentMethod || '—'}
                          </td>
                          <td className="py-2 px-3 text-center">
                            <span
                              className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                p?.status === 'paid'
                                  ? 'bg-emerald-50 text-emerald-800'
                                  : p?.status === 'late'
                                  ? 'bg-amber-50 text-amber-800'
                                  : 'bg-slate-100 text-slate-500'
                              }`}
                            >
                              {(p?.status || 'UNPAID').toUpperCase()}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Active Loans & Repayments */}
          <div>
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2">
              2. Loan & Credit History
            </h3>
            {loans.filter(l => l.borrowerId === selectedMember.id).length === 0 ? (
              <p className="text-xs text-slate-500 italic p-3 bg-slate-50 rounded-lg">
                No active or past loans on record for this member.
              </p>
            ) : (
              <div className="space-y-3">
                {loans
                  .filter(l => l.borrowerId === selectedMember.id)
                  .map(loan => {
                    const { principalRepaid, interestRepaid, principalBalance } = calculateLoanBalance(loan);

                    return (
                      <div key={loan.id} className="p-4 rounded-xl border border-slate-200 bg-white text-xs">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <span className="font-bold text-slate-900 tabular-nums text-sm">
                              {loan.loanCode}
                            </span>
                            <span className="text-slate-500 block tabular-nums">
                              Principal: ₱{loan.principalAmount.toLocaleString()} @ {loan.interestRateMonthly}%/mo · Due: {loan.dueDate}
                            </span>
                          </div>
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-slate-100 text-slate-800">
                            {loan.status}
                          </span>
                        </div>

                        <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-100 tabular-nums">
                          <div>
                            <span className="text-slate-400 block text-[10px]">Repaid Principal:</span>
                            <span className="text-emerald-700 font-bold">₱{principalRepaid.toLocaleString()}</span>
                          </div>
                          <div>
                            <span className="text-slate-400 block text-[10px]">Interest Paid:</span>
                            <span className="text-purple-700 font-bold">₱{interestRepaid.toLocaleString()}</span>
                          </div>
                          <div>
                            <span className="text-slate-400 block text-[10px]">Remaining Balance:</span>
                            <span className="text-slate-900 font-bold">₱{principalBalance.toLocaleString()}</span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
              </div>
            )}
          </div>

          {/* Projected Year-End Payout Total */}
          {selectedMember.classification === 'member' && (
            <div className="p-5 rounded-xl bg-purple-50/70 border border-purple-200">
              {(() => {
                const totalPaidContribs = contributions
                  .filter(
                    c =>
                      c.memberId === selectedMember.id &&
                      c.year === settings.cycleYear &&
                      (c.status === 'paid' || c.status === 'late')
                  )
                  .reduce((s, c) => s + c.paidAmount, 0);

                const { dividendEarned, finalPayout, slotSharePercentage } = calculateMemberDividend(
                  selectedMember,
                  financialSummary.totalActiveSlots,
                  financialSummary.totalRevenue,
                  totalPaidContribs
                );

                return (
                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between">
                      <span className="text-slate-600">Total Paluwagan Contributions Paid:</span>
                      <span className="tabular-nums font-bold text-slate-900">
                        {formatCurrency(totalPaidContribs)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-600">
                        Earned Dividend ({slotSharePercentage.toFixed(1)}% Share of Interest):
                      </span>
                      <span className="tabular-nums font-bold text-purple-700">
                        +{formatCurrency(dividendEarned)}
                      </span>
                    </div>
                    <div className="pt-2 border-t border-purple-200 flex justify-between text-sm font-bold">
                      <span className="text-slate-900">Total Year-End Final Payout Entitlement:</span>
                      <span className="tabular-nums font-extrabold text-emerald-800 text-base">
                        {formatCurrency(finalPayout)}
                      </span>
                    </div>
                  </div>
                );
              })()}
            </div>
          )}

          {/* Footer signatures for official certification */}
          <div className="pt-8 grid grid-cols-2 gap-8 text-center text-xs text-slate-500">
            <div>
              <div className="h-10 border-b border-slate-300 mb-1" />
              <span>Certified Correct: Administrator / Treasurer</span>
            </div>
            <div>
              <div className="h-10 border-b border-slate-300 mb-1" />
              <span>Conforme: Member Signature</span>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: Audit Trail & Activity Logs */}
      {activeTab === 'audit' && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
          {/* Filter Bar */}
          <div className="p-4 border-b border-slate-100 bg-[#F8FAFC] flex flex-wrap items-center justify-between gap-3">
            <div className="relative flex-1 min-w-[240px] max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
              <input
                type="text"
                value={auditSearch}
                onChange={e => setAuditSearch(e.target.value)}
                placeholder="Search audit trail..."
                className="w-full pl-8 pr-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none"
              />
            </div>

            <div className="flex items-center gap-2">
              <select
                value={auditModuleFilter}
                onChange={e => setAuditModuleFilter(e.target.value as any)}
                className="px-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none"
              >
                <option value="all">All Modules</option>
                <option value="members">Members</option>
                <option value="contributions">Contributions</option>
                <option value="loans">Loans</option>
                <option value="payouts">Payouts</option>
                <option value="system">System</option>
              </select>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-200 bg-[#F8FAFC] text-slate-600 font-semibold">
                  <th className="py-3 px-4">Timestamp</th>
                  <th className="py-3 px-4">Operator & Role</th>
                  <th className="py-3 px-4">Module</th>
                  <th className="py-3 px-4">Action</th>
                  <th className="py-3 px-4">Details & Audit Record</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredAuditLogs.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-10 text-center text-slate-500 text-xs">
                      No audit records found matching your filters.
                    </td>
                  </tr>
                ) : (
                  filteredAuditLogs.map(log => (
                    <tr key={log.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3 px-4 font-mono text-slate-500 text-[11px] whitespace-nowrap">
                        {new Date(log.timestamp).toLocaleString()}
                      </td>

                      <td className="py-3 px-4">
                        <span className="font-semibold text-slate-900 block">{log.userName}</span>
                        <span className="text-[10px] text-slate-500 uppercase">{log.userRole}</span>
                      </td>

                      <td className="py-3 px-4">
                        <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-100 text-slate-700 uppercase">
                          {log.module}
                        </span>
                      </td>

                      <td className="py-3 px-4 font-bold text-slate-900 whitespace-nowrap">
                        {log.action}
                      </td>

                      <td className="py-3 px-4 text-slate-600 font-sans max-w-md">
                        {log.details}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
