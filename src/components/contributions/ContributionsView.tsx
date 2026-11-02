import React, { useState, useMemo } from 'react';
import {
  Search,
  Filter,
  Plus,
  Coins,
  CheckCircle2,
  Clock,
  AlertCircle,
  FileSpreadsheet,
  Calendar,
  CreditCard,
  Printer,
  ChevronRight,
  FileText,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { ContributionPayment, ContributionStatus, PaymentMethod } from '../../types';
import { formatCurrency, MONTH_NAMES, MONTH_SHORT_NAMES } from '../../utils/calculations';
import { exportContributionsToExcel } from '../../utils/exportReports';
import { Modal } from '../common/Modal';

interface ContributionsViewProps {
  initialAction?: string | null;
  onActionHandled?: () => void;
}

export const ContributionsView: React.FC<ContributionsViewProps> = ({
  initialAction,
  onActionHandled,
}) => {
  const {
    members,
    contributions,
    settings,
    currentUser,
    recordContribution,
    batchMarkContributions,
    financialSummary,
  } = useApp();

  const [activeViewMode, setActiveViewMode] = useState<'matrix' | 'list'>('matrix');
  const [selectedMonth, setSelectedMonth] = useState<number>(11); // Default November
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'paid' | 'unpaid' | 'late'>('all');
  const [methodFilter, setMethodFilter] = useState<'all' | 'GCash' | 'Bank Transfer' | 'Cash'>('all');

  // Record Payment Modal
  const [isRecordModalOpen, setIsRecordModalOpen] = useState(false);
  const [selectedMemberId, setSelectedMemberId] = useState('');
  const [recordMonth, setRecordMonth] = useState(11);
  const [paymentAmount, setPaymentAmount] = useState(1000);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('GCash');
  const [referenceNo, setReferenceNo] = useState('');
  const [notes, setNotes] = useState('');

  // Receipt Modal
  const [isReceiptModalOpen, setIsReceiptModalOpen] = useState(false);
  const [selectedPaymentForReceipt, setSelectedPaymentForReceipt] = useState<ContributionPayment | null>(null);

  // Paluwagan members only
  const paluwaganMembers = useMemo(() => {
    return members.filter(m => m.classification === 'member' && m.status === 'active');
  }, [members]);

  // Open Record Modal for specific member & month
  const handleOpenRecordModal = (memberId: string, month: number) => {
    const member = members.find(m => m.id === memberId);
    if (!member) return;

    setSelectedMemberId(memberId);
    setRecordMonth(month);
    setPaymentAmount(member.slots * settings.contributionPerSlot);
    setPaymentMethod(member.paymentDetails.method || 'GCash');
    setReferenceNo('');
    setNotes('');
    setIsRecordModalOpen(true);
  };

  React.useEffect(() => {
    if (initialAction === 'record_contrib') {
      if (paluwaganMembers.length > 0) {
        handleOpenRecordModal(paluwaganMembers[0].id, 11);
      }
      onActionHandled?.();
    }
  }, [initialAction, paluwaganMembers]);

  const handleRecordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMemberId) return;

    recordContribution({
      memberId: selectedMemberId,
      month: recordMonth,
      year: settings.cycleYear,
      paidAmount: Number(paymentAmount),
      method: paymentMethod,
      refNo: referenceNo,
      notes,
    });

    setIsRecordModalOpen(false);
  };

  // Filtered payments for List View
  const filteredListPayments = useMemo(() => {
    return contributions.filter(c => {
      const member = members.find(m => m.id === c.memberId);
      if (!member) return false;

      const matchSearch =
        member.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        member.memberCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (c.receiptNo && c.receiptNo.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (c.referenceNo && c.referenceNo.toLowerCase().includes(searchTerm.toLowerCase()));

      const matchMonth = selectedMonth === 0 || c.month === selectedMonth;
      const matchStatus = statusFilter === 'all' || c.status === statusFilter;
      const matchMethod = methodFilter === 'all' || c.paymentMethod === methodFilter;

      return matchSearch && matchMonth && matchStatus && matchMethod && c.year === settings.cycleYear;
    });
  }, [contributions, members, searchTerm, selectedMonth, statusFilter, methodFilter, settings.cycleYear]);

  // View Receipt
  const openReceipt = (payment: ContributionPayment) => {
    setSelectedPaymentForReceipt(payment);
    setIsReceiptModalOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-medium text-slate-500 uppercase tracking-wider block">
              Total Collections YTD
            </span>
            <span className="text-2xl font-bold tracking-tight text-slate-900 tabular-nums mt-1 block">
              {formatCurrency(financialSummary.totalContributionsCollected)}
            </span>
          </div>
          <div className="h-9 w-9 rounded-xl bg-[#56A0D3]/12 text-[#2b72a8] flex items-center justify-center font-bold">
            <Coins className="h-4.5 w-4.5" />
          </div>
        </div>

        <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-medium text-slate-500 uppercase tracking-wider block">
              Monthly Commitment
            </span>
            <span className="text-2xl font-bold tracking-tight text-slate-900 tabular-nums mt-1 block">
              {formatCurrency(financialSummary.totalActiveSlots * settings.contributionPerSlot)}
            </span>
          </div>
          <div className="h-9 w-9 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
            <Calendar className="h-4.5 w-4.5" />
          </div>
        </div>

        <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-medium text-slate-500 uppercase tracking-wider block">
              Unpaid Dues
            </span>
            <span className="text-2xl font-bold tracking-tight text-amber-700 tabular-nums mt-1 block">
              {formatCurrency(financialSummary.totalUnpaidContributionsAmount)}
            </span>
          </div>
          <div className="h-9 w-9 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center font-bold">
            <Clock className="h-4.5 w-4.5" />
          </div>
        </div>
      </div>

      {/* View Switcher, Month Filter & Actions Bar */}
      <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Left: View Mode Segmented Control */}
        <div className="flex items-center gap-3">
          <div className="flex items-center p-1 bg-slate-100 rounded-lg text-xs font-medium">
            <button
              onClick={() => setActiveViewMode('matrix')}
              className={`px-3 py-1.5 rounded-md transition-colors cursor-pointer ${
                activeViewMode === 'matrix'
                  ? 'bg-white text-slate-900 shadow-xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              12-Month Matrix
            </button>
            <button
              onClick={() => setActiveViewMode('list')}
              className={`px-3 py-1.5 rounded-md transition-colors cursor-pointer ${
                activeViewMode === 'list'
                  ? 'bg-white text-slate-900 shadow-xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Transactions List
            </button>
          </div>

          {activeViewMode === 'list' && (
            <select
              value={selectedMonth}
              onChange={e => setSelectedMonth(Number(e.target.value))}
              className="px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none"
            >
              <option value={0}>All Months ({settings.cycleYear})</option>
              {MONTH_NAMES.map((name, i) => (
                <option key={i + 1} value={i + 1}>
                  {name}
                </option>
              ))}
            </select>
          )}
        </div>

        {/* Right: Actions */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => exportContributionsToExcel(members, contributions, settings.cycleYear)}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 transition-colors cursor-pointer"
          >
            <FileSpreadsheet className="h-4 w-4 text-emerald-600" />
            <span>Export Excel (.xlsx)</span>
          </button>

          {currentUser.role === 'admin' && (
            <button
              onClick={() => {
                if (confirm(`Mark all member contributions for November ${settings.cycleYear} as PAID?`)) {
                  batchMarkContributions(11, settings.cycleYear, 'paid');
                }
              }}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 transition-colors cursor-pointer"
            >
              <CheckCircle2 className="h-4 w-4" />
              <span>Batch Collect Nov</span>
            </button>
          )}

          <button
            onClick={() => {
              if (paluwaganMembers.length > 0) {
                handleOpenRecordModal(paluwaganMembers[0].id, 11);
              }
            }}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs sm:text-sm font-semibold rounded-lg bg-[#56A0D3] text-white hover:bg-[#438bc0] transition-colors shadow-xs cursor-pointer"
          >
            <Plus className="h-4 w-4" />
            <span>Record Payment</span>
          </button>
        </div>
      </div>

      {/* VIEW 1: 12-Month Matrix View */}
      {activeViewMode === 'matrix' && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 bg-[#F8FAFC] flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                Paluwagan Contributions – {settings.cycleYear}
              </h3>
            </div>
            <div className="flex items-center gap-3 text-xs text-slate-500">
              <span className="inline-flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-emerald-500" /> Paid
              </span>
              <span className="inline-flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-amber-500" /> Late
              </span>
              <span className="inline-flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-slate-300" /> Unpaid
              </span>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-200 bg-[#F8FAFC] text-slate-600 font-semibold">
                  <th className="py-3 px-4 min-w-[200px] sticky left-0 bg-[#F8FAFC] z-10 shadow-xs">
                    Member Name & Code
                  </th>
                  <th className="py-3 px-3 text-center min-w-[70px]">Slots</th>
                  <th className="py-3 px-3 text-right min-w-[90px]">Rate/Mo</th>
                  {MONTH_SHORT_NAMES.map((m) => (
                    <th key={m} className="py-3 px-2 text-center min-w-[70px]">
                      {m}
                    </th>
                  ))}
                  <th className="py-3 px-4 text-right min-w-[100px] font-bold">Total Paid</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {paluwaganMembers.map(member => {
                  let memberTotalPaid = 0;
                  const monthlyRate = member.slots * settings.contributionPerSlot;

                  return (
                    <tr key={member.id} className="hover:bg-slate-50/70 transition-colors">
                      {/* Member Info Sticky */}
                      <td className="py-3 px-4 sticky left-0 bg-white group-hover:bg-slate-50 z-10 shadow-xs">
                        <div className="font-semibold text-slate-900">{member.fullName}</div>
                        <div className="text-[11px] text-slate-500 flex items-center gap-1.5 mt-0.5">
                          <span className="tabular-nums text-slate-600">{member.memberCode}</span>
                          <span aria-hidden="true">·</span>
                          <span>{member.paymentDetails.method}</span>
                        </div>
                      </td>

                      {/* Slots */}
                      <td className="py-3 px-3 text-center font-bold tabular-nums text-[#2b72a8]">
                        {member.slots}
                      </td>

                      {/* Rate */}
                      <td className="py-3 px-3 text-right font-medium tabular-nums text-slate-700">
                        ₱{monthlyRate.toLocaleString()}
                      </td>

                      {/* 12 Months Cells */}
                      {Array.from({ length: 12 }, (_, i) => {
                        const month = i + 1;
                        const p = contributions.find(
                          c => c.memberId === member.id && c.month === month && c.year === settings.cycleYear
                        );

                        if (p && (p.status === 'paid' || p.status === 'late')) {
                          memberTotalPaid += p.paidAmount;
                        }

                        const isPaid = p?.status === 'paid';
                        const isLate = p?.status === 'late';

                        return (
                          <td key={month} className="py-2 px-1 text-center">
                            <button
                              onClick={() => {
                                if (p && (isPaid || isLate)) {
                                  openReceipt(p);
                                } else {
                                  handleOpenRecordModal(member.id, month);
                                }
                              }}
                              title={
                                isPaid
                                  ? `Paid: ₱${p.paidAmount.toLocaleString()} on ${p.paymentDate} (${p.paymentMethod})`
                                  : isLate
                                  ? `Late Paid: ₱${p.paidAmount.toLocaleString()} on ${p.paymentDate}`
                                  : `Click to record month ${month} payment`
                              }
                              className={`w-full py-1.5 px-1 rounded text-[11px] font-semibold tabular-nums transition-all cursor-pointer ${
                                isPaid
                                  ? 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100 border border-emerald-200'
                                  : isLate
                                  ? 'bg-amber-50 text-amber-800 hover:bg-amber-100 border border-amber-200'
                                  : 'bg-slate-50 text-slate-400 hover:bg-[#56A0D3]/15 hover:text-[#2b72a8] border border-dashed border-slate-200'
                              }`}
                            >
                              {isPaid ? 'PAID' : isLate ? 'LATE' : '—'}
                            </button>
                          </td>
                        );
                      })}

                      {/* Total Paid YTD */}
                      <td className="py-3 px-4 text-right font-bold tabular-nums text-slate-900">
                        {formatCurrency(memberTotalPaid)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* VIEW 2: Transactions List View */}
      {activeViewMode === 'list' && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
          {/* Filters Bar */}
          <div className="p-4 border-b border-slate-100 bg-[#F8FAFC] flex flex-wrap items-center justify-between gap-3">
            <div className="relative flex-1 min-w-[240px] max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                placeholder="Search member, receipt#, or reference#..."
                className="w-full pl-9 pr-4 py-1.5 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none"
              />
            </div>

            <div className="flex items-center gap-2">
              <select
                value={statusFilter}
                onChange={e => setStatusFilter(e.target.value as any)}
                className="px-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none"
              >
                <option value="all">All Statuses</option>
                <option value="paid">Paid</option>
                <option value="late">Late</option>
                <option value="unpaid">Unpaid</option>
              </select>

              <select
                value={methodFilter}
                onChange={e => setMethodFilter(e.target.value as any)}
                className="px-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none"
              >
                <option value="all">All Methods</option>
                <option value="GCash">GCash</option>
                <option value="Bank Transfer">Bank Transfer</option>
                <option value="Cash">Cash</option>
              </select>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm border-collapse">
              <thead>
                <tr className="border-b border-slate-200 bg-[#F8FAFC] text-slate-600 font-semibold">
                  <th className="py-3 px-4">Receipt / Date</th>
                  <th className="py-3 px-4">Member Name</th>
                  <th className="py-3 px-4">Period</th>
                  <th className="py-3 px-4 text-right">Amount</th>
                  <th className="py-3 px-4">Payment Method</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredListPayments.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-10 text-center text-slate-500 text-xs">
                      No contribution records found.
                    </td>
                  </tr>
                ) : (
                  filteredListPayments.map(p => {
                    const member = members.find(m => m.id === p.memberId);
                    const isPaid = p.status === 'paid' || p.status === 'late';

                    return (
                      <tr key={p.id} className="hover:bg-slate-50/70 transition-colors">
                        <td className="py-3 px-4">
                          <span className="font-medium text-slate-900 block tabular-nums">
                            {p.receiptNo || 'Pending'}
                          </span>
                          <span className="text-slate-400 text-xs block">
                            {p.paymentDate || 'Not paid'}
                          </span>
                        </td>

                        <td className="py-3 px-4">
                          <span className="font-semibold text-slate-900 block">
                            {member?.fullName}
                          </span>
                          <span className="text-slate-500 text-xs tabular-nums">
                            {member?.memberCode} ({member?.slots} Slots)
                          </span>
                        </td>

                        <td className="py-3 px-4">
                          <span className="font-medium text-slate-800">
                            {MONTH_NAMES[p.month - 1]} {p.year}
                          </span>
                        </td>

                        <td className="py-3 px-4 text-right">
                          <span className="font-bold tabular-nums text-slate-900">
                            {formatCurrency(p.paidAmount || p.expectedAmount)}
                          </span>
                        </td>

                        <td className="py-3 px-4">
                          {p.paymentMethod ? (
                            <div>
                              <span className="font-medium text-slate-800 block">
                                {p.paymentMethod}
                              </span>
                              {p.referenceNo && (
                                <span className="text-[11px] font-mono text-slate-400">
                                  {p.referenceNo}
                                </span>
                              )}
                            </div>
                          ) : (
                            <span className="text-slate-400 text-xs">—</span>
                          )}
                        </td>

                        <td className="py-3 px-4">
                          <span
                            className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold ${
                              p.status === 'paid'
                                ? 'bg-emerald-50 text-emerald-800'
                                : p.status === 'late'
                                ? 'bg-amber-50 text-amber-800'
                                : 'bg-slate-100 text-slate-600'
                            }`}
                          >
                            {p.status.toUpperCase()}
                          </span>
                        </td>

                        <td className="py-3 px-4 text-right">
                          {isPaid ? (
                            <button
                              onClick={() => openReceipt(p)}
                              className="px-2.5 py-1 text-xs font-semibold rounded bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors cursor-pointer"
                            >
                              View Receipt
                            </button>
                          ) : (
                            <button
                              onClick={() => handleOpenRecordModal(p.memberId, p.month)}
                              className="px-2.5 py-1 text-xs font-semibold rounded bg-[#56A0D3] hover:bg-[#438bc0] text-white transition-colors cursor-pointer"
                            >
                              Collect
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Record Contribution Modal */}
      <Modal
        isOpen={isRecordModalOpen}
        onClose={() => setIsRecordModalOpen(false)}
        title="Record Monthly Paluwagan Payment"
        subtitle="Process member contribution and issue an official payment receipt"
        maxWidth="md"
      >
        <form onSubmit={handleRecordSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Select Paluwagan Member *
            </label>
            <select
              required
              value={selectedMemberId}
              onChange={e => {
                const mid = e.target.value;
                setSelectedMemberId(mid);
                const mem = members.find(m => m.id === mid);
                if (mem) {
                  setPaymentAmount(mem.slots * settings.contributionPerSlot);
                  setPaymentMethod(mem.paymentDetails.method || 'GCash');
                }
              }}
              className="w-full px-3 py-2 text-xs sm:text-sm bg-white border border-slate-200 rounded-lg focus:outline-none"
            >
              <option value="">Choose a member...</option>
              {paluwaganMembers.map(m => (
                <option key={m.id} value={m.id}>
                  {m.fullName} ({m.memberCode}) — {m.slots} Slot(s) (₱{(m.slots * settings.contributionPerSlot).toLocaleString()})
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Month *
              </label>
              <select
                value={recordMonth}
                onChange={e => setRecordMonth(Number(e.target.value))}
                className="w-full px-3 py-2 text-xs sm:text-sm bg-white border border-slate-200 rounded-lg focus:outline-none"
              >
                {MONTH_NAMES.map((name, idx) => (
                  <option key={idx + 1} value={idx + 1}>
                    {name} ({settings.cycleYear})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Amount Paid (₱) *
              </label>
              <input
                type="number"
                required
                min={1}
                value={paymentAmount}
                onChange={e => setPaymentAmount(Number(e.target.value))}
                className="w-full px-3 py-2 text-xs sm:text-sm border border-slate-200 rounded-lg font-mono focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Payment Channel *
              </label>
              <select
                value={paymentMethod}
                onChange={e => setPaymentMethod(e.target.value as PaymentMethod)}
                className="w-full px-3 py-2 text-xs sm:text-sm bg-white border border-slate-200 rounded-lg focus:outline-none"
              >
                <option value="GCash">GCash</option>
                <option value="Bank Transfer">Bank Transfer (BDO, BPI, etc.)</option>
                <option value="Cash">Cash (Over-the-Counter)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Reference / Trx No.
              </label>
              <input
                type="text"
                value={referenceNo}
                onChange={e => setReferenceNo(e.target.value)}
                placeholder="e.g. 100293481"
                className="w-full px-3 py-2 text-xs sm:text-sm border border-slate-200 rounded-lg focus:outline-none font-mono"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Collector Notes
            </label>
            <input
              type="text"
              value={notes}
              onChange={e => setNotes(e.target.value)}
              placeholder="e.g. Remitted on time, verified GCash screenshot"
              className="w-full px-3 py-2 text-xs sm:text-sm border border-slate-200 rounded-lg focus:outline-none"
            />
          </div>

          <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={() => setIsRecordModalOpen(false)}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-bold text-white bg-[#56A0D3] hover:bg-[#438bc0] rounded-lg shadow-xs transition-colors cursor-pointer"
            >
              Confirm & Issue Receipt
            </button>
          </div>
        </form>
      </Modal>

      {/* Official Payment Receipt Modal */}
      {selectedPaymentForReceipt && (
        <Modal
          isOpen={isReceiptModalOpen}
          onClose={() => setIsReceiptModalOpen(false)}
          title="Official Contribution Receipt"
          subtitle={selectedPaymentForReceipt.receiptNo || 'Official Receipt'}
          maxWidth="md"
        >
          {(() => {
            const member = members.find(m => m.id === selectedPaymentForReceipt.memberId);

            return (
              <div className="space-y-4">
                {/* Printable receipt card */}
                <div className="p-5 rounded-xl border border-slate-200 bg-[#F8FAFC] space-y-4 font-sans text-xs">
                  <div className="text-center pb-3 border-b border-slate-200">
                    <h3 className="font-extrabold text-sm text-slate-900 tracking-tight">
                      PLEND PALUWAGAN & LENDING
                    </h3>
                    <p className="text-[11px] text-slate-500">Official Collection Receipt Voucher</p>
                    <span className="inline-block mt-1 text-[11px] font-mono font-bold text-[#2b72a8]">
                      Receipt No: {selectedPaymentForReceipt.receiptNo || 'OR-SAMPLE'}
                    </span>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-slate-500">Member:</span>
                      <span className="font-bold text-slate-900">{member?.fullName} ({member?.memberCode})</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Cycle / Month:</span>
                      <span className="font-semibold text-slate-800">
                        {MONTH_NAMES[selectedPaymentForReceipt.month - 1]} {selectedPaymentForReceipt.year}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Paluwagan Slots:</span>
                      <span className="font-semibold text-slate-800">{member?.slots} Slots</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Payment Date:</span>
                      <span className="font-semibold text-slate-800">{selectedPaymentForReceipt.paymentDate}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Method / Channel:</span>
                      <span className="font-semibold text-slate-800">{selectedPaymentForReceipt.paymentMethod}</span>
                    </div>
                    {selectedPaymentForReceipt.referenceNo && (
                      <div className="flex justify-between">
                        <span className="text-slate-500">Ref / Trx No:</span>
                        <span className="font-mono text-slate-800">{selectedPaymentForReceipt.referenceNo}</span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span className="text-slate-500">Collected By:</span>
                      <span className="text-slate-700">{selectedPaymentForReceipt.recordedBy}</span>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-slate-200 flex justify-between items-center text-sm">
                    <span className="font-bold text-slate-900">Total Paid Amount:</span>
                    <span className="font-extrabold text-slate-900 font-mono text-base">
                      {formatCurrency(selectedPaymentForReceipt.paidAmount)}
                    </span>
                  </div>
                </div>

                <div className="pt-2 flex items-center justify-end gap-2">
                  <button
                    onClick={() => setIsReceiptModalOpen(false)}
                    className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 transition-colors cursor-pointer"
                  >
                    Close
                  </button>
                  <button
                    onClick={() => window.print()}
                    className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-[#56A0D3] hover:bg-[#438bc0] rounded-lg shadow-xs transition-colors cursor-pointer"
                  >
                    <Printer className="h-3.5 w-3.5" />
                    <span>Print Receipt</span>
                  </button>
                </div>
              </div>
            );
          })()}
        </Modal>
      )}
    </div>
  );
};
