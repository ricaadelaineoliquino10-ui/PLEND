import React, { useState, useMemo } from 'react';
import {
  HandCoins,
  Plus,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  AlertTriangle,
  FileSpreadsheet,
  Calendar,
  CreditCard,
  User,
  ShieldCheck,
  Percent,
  Receipt,
  FileText,
  Printer,
  XCircle,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Loan, LoanRepayment, LoanStatus, Member, PaymentMethod } from '../../types';
import { calculateLoanBalance, formatCurrency } from '../../utils/calculations';
import { exportLoansToExcel } from '../../utils/exportReports';
import { Modal } from '../common/Modal';

interface LoansViewProps {
  initialAction?: string | null;
  onActionHandled?: () => void;
}

export const LoansView: React.FC<LoansViewProps> = ({
  initialAction,
  onActionHandled,
}) => {
  const {
    loans,
    members,
    currentUser,
    settings,
    createLoan,
    approveLoan,
    rejectLoan,
    recordRepayment,
    financialSummary,
  } = useApp();

  const [activeTab, setActiveTab] = useState<'all' | 'active' | 'pending' | 'overdue' | 'fully_paid'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [borrowerTypeFilter, setBorrowerTypeFilter] = useState<'all' | 'member' | 'non_member_borrower'>('all');

  // Modals
  const [isNewLoanModalOpen, setIsNewLoanModalOpen] = useState(false);
  const [isRepaymentModalOpen, setIsRepaymentModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedLoan, setSelectedLoan] = useState<Loan | null>(null);

  // New Loan Form State
  const [newLoanData, setNewLoanData] = useState({
    borrowerId: '',
    principalAmount: 20000,
    interestRateMonthly: 3.0,
    termMonths: 3,
    startDate: new Date().toISOString().split('T')[0],
    guarantorMemberId: '',
    purpose: '',
  });

  // Repayment Form State
  const [repaymentData, setRepaymentData] = useState({
    principalPaid: 0,
    interestPaid: 0,
    penaltyPaid: 0,
    paymentMethod: 'GCash' as PaymentMethod,
    referenceNo: '',
    notes: '',
  });

  // Rejection modal state
  const [rejectReason, setRejectReason] = useState('');
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);

  // Filtered Loans
  const filteredLoans = useMemo(() => {
    return loans.filter(loan => {
      const borrower = members.find(m => m.id === loan.borrowerId);
      const { isOverdue } = calculateLoanBalance(loan);

      const matchSearch =
        loan.loanCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (borrower && borrower.fullName.toLowerCase().includes(searchTerm.toLowerCase())) ||
        loan.purpose.toLowerCase().includes(searchTerm.toLowerCase());

      const matchType = borrowerTypeFilter === 'all' || loan.borrowerType === borrowerTypeFilter;

      let matchTab = true;
      if (activeTab === 'active') matchTab = loan.status === 'active' && !isOverdue;
      else if (activeTab === 'pending') matchTab = loan.status === 'pending';
      else if (activeTab === 'overdue') matchTab = loan.status === 'overdue' || (loan.status === 'active' && isOverdue);
      else if (activeTab === 'fully_paid') matchTab = loan.status === 'fully_paid';

      return matchSearch && matchType && matchTab;
    });
  }, [loans, members, searchTerm, borrowerTypeFilter, activeTab]);

  const openNewLoanModal = () => {
    setNewLoanData({
      borrowerId: members.length > 0 ? members[0].id : '',
      principalAmount: 15000,
      interestRateMonthly: members[0]?.classification === 'member' ? settings.defaultMemberInterestRate : settings.defaultNonMemberInterestRate,
      termMonths: 3,
      startDate: new Date().toISOString().split('T')[0],
      guarantorMemberId: '',
      purpose: '',
    });
    setIsNewLoanModalOpen(true);
  };

  React.useEffect(() => {
    if (initialAction === 'new_loan') {
      openNewLoanModal();
      onActionHandled?.();
    }
  }, [initialAction]);

  const handleBorrowerChange = (borrowerId: string) => {
    const borrower = members.find(m => m.id === borrowerId);
    const defaultRate = borrower?.classification === 'member'
      ? settings.defaultMemberInterestRate
      : settings.defaultNonMemberInterestRate;

    setNewLoanData(prev => ({
      ...prev,
      borrowerId,
      interestRateMonthly: defaultRate,
    }));
  };

  const handleNewLoanSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newLoanData.borrowerId || !newLoanData.purpose) return;

    createLoan({
      borrowerId: newLoanData.borrowerId,
      principalAmount: Number(newLoanData.principalAmount),
      interestRateMonthly: Number(newLoanData.interestRateMonthly),
      termMonths: Number(newLoanData.termMonths),
      startDate: newLoanData.startDate,
      guarantorMemberId: newLoanData.guarantorMemberId || undefined,
      purpose: newLoanData.purpose,
    });

    setIsNewLoanModalOpen(false);
  };

  const openRepaymentModal = (loan: Loan) => {
    setSelectedLoan(loan);
    const { principalBalance, isOverdue } = calculateLoanBalance(loan);

    // Calculate suggested monthly installment
    const suggestedPrincipal = Math.min(principalBalance, Math.round(loan.principalAmount / loan.termMonths));
    const suggestedInterest = Math.round(principalBalance * (loan.interestRateMonthly / 100));
    const suggestedPenalty = isOverdue ? settings.penaltyPerMonthLate : 0;

    setRepaymentData({
      principalPaid: suggestedPrincipal,
      interestPaid: suggestedInterest,
      penaltyPaid: suggestedPenalty,
      paymentMethod: 'GCash',
      referenceNo: '',
      notes: '',
    });
    setIsRepaymentModalOpen(true);
  };

  const handleRepaymentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedLoan) return;

    recordRepayment(selectedLoan.id, {
      principalPaid: Number(repaymentData.principalPaid),
      interestPaid: Number(repaymentData.interestPaid),
      penaltyPaid: Number(repaymentData.penaltyPaid),
      paymentMethod: repaymentData.paymentMethod,
      referenceNo: repaymentData.referenceNo,
      notes: repaymentData.notes,
    });

    setIsRepaymentModalOpen(false);
  };

  const handleApprove = (loanId: string) => {
    approveLoan(loanId);
  };

  const openRejectModal = (loan: Loan) => {
    setSelectedLoan(loan);
    setRejectReason('');
    setIsRejectModalOpen(true);
  };

  const handleRejectSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedLoan && rejectReason) {
      rejectLoan(selectedLoan.id, rejectReason);
      setIsRejectModalOpen(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Lending Metrics Banner */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-medium text-slate-500 uppercase tracking-wider block">
              Disbursed Capital
            </span>
            <span className="text-2xl font-bold tracking-tight text-slate-900 tabular-nums mt-1 block">
              {formatCurrency(financialSummary.totalPrincipalDisbursed)}
            </span>
          </div>
          <div className="h-9 w-9 rounded-xl bg-[#56A0D3]/12 text-[#2b72a8] flex items-center justify-center font-bold">
            <HandCoins className="h-4.5 w-4.5" />
          </div>
        </div>

        <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-medium text-slate-500 uppercase tracking-wider block">
              Outstanding Principal
            </span>
            <span className="text-2xl font-bold tracking-tight text-amber-700 tabular-nums mt-1 block">
              {formatCurrency(financialSummary.totalOutstandingPrincipal)}
            </span>
          </div>
          <div className="h-9 w-9 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center font-bold">
            <CreditCard className="h-4.5 w-4.5" />
          </div>
        </div>

        <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-medium text-slate-500 uppercase tracking-wider block">
              Interest Earned
            </span>
            <span className="text-2xl font-bold tracking-tight text-purple-700 tabular-nums mt-1 block">
              {formatCurrency(financialSummary.totalInterestEarned)}
            </span>
          </div>
          <div className="h-9 w-9 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center font-bold">
            <Percent className="h-4.5 w-4.5" />
          </div>
        </div>

        <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-medium text-slate-500 uppercase tracking-wider block">
              Principal Recovered
            </span>
            <span className="text-2xl font-bold tracking-tight text-emerald-700 tabular-nums mt-1 block">
              {formatCurrency(financialSummary.totalPrincipalRepaid)}
            </span>
          </div>
          <div className="h-9 w-9 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
            <CheckCircle2 className="h-4.5 w-4.5" />
          </div>
        </div>
      </div>

      {/* Control Bar: Tabs, Search, Actions */}
      <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Tabs */}
        <div className="flex flex-wrap items-center p-1 bg-slate-100 rounded-lg text-xs font-medium">
          <button
            onClick={() => setActiveTab('all')}
            className={`px-3 py-1.5 rounded-md transition-colors cursor-pointer ${
              activeTab === 'all'
                ? 'bg-white text-slate-900 shadow-xs font-semibold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            All Loans ({loans.length})
          </button>
          <button
            onClick={() => setActiveTab('active')}
            className={`px-3 py-1.5 rounded-md transition-colors cursor-pointer ${
              activeTab === 'active'
                ? 'bg-white text-[#2b72a8] shadow-xs font-semibold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Active ({loans.filter(l => l.status === 'active').length})
          </button>
          <button
            onClick={() => setActiveTab('pending')}
            className={`px-3 py-1.5 rounded-md transition-colors cursor-pointer ${
              activeTab === 'pending'
                ? 'bg-white text-amber-800 shadow-xs font-semibold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Pending ({loans.filter(l => l.status === 'pending').length})
          </button>
          <button
            onClick={() => setActiveTab('overdue')}
            className={`px-3 py-1.5 rounded-md transition-colors cursor-pointer ${
              activeTab === 'overdue'
                ? 'bg-white text-rose-800 shadow-xs font-semibold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Overdue ({financialSummary.overdueLoansCount})
          </button>
          <button
            onClick={() => setActiveTab('fully_paid')}
            className={`px-3 py-1.5 rounded-md transition-colors cursor-pointer ${
              activeTab === 'fully_paid'
                ? 'bg-white text-emerald-800 shadow-xs font-semibold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Fully Paid ({loans.filter(l => l.status === 'fully_paid').length})
          </button>
        </div>

        {/* Search & New Loan Button */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              placeholder="Search loan code, borrower..."
              className="w-full pl-8 pr-3 py-1.5 text-xs bg-[#F8FAFC] border border-slate-200 rounded-lg focus:outline-none"
            />
          </div>

          <button
            onClick={() => exportLoansToExcel(loans, members)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 transition-colors cursor-pointer"
          >
            <FileSpreadsheet className="h-4 w-4 text-emerald-600" />
            <span className="hidden sm:inline">Export Excel</span>
          </button>

          <button
            onClick={openNewLoanModal}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs sm:text-sm font-semibold rounded-lg bg-[#56A0D3] text-white hover:bg-[#438bc0] transition-colors shadow-xs cursor-pointer"
          >
            <Plus className="h-4 w-4" />
            <span>New Loan Application</span>
          </button>
        </div>
      </div>

      {/* Loans Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm border-collapse">
            <thead>
              <tr className="border-b border-slate-200 bg-[#F8FAFC] text-slate-600 font-semibold">
                <th className="py-3 px-4">Loan Code & Date</th>
                <th className="py-3 px-4">Borrower & Security</th>
                <th className="py-3 px-4 text-right">Principal</th>
                <th className="py-3 px-4 text-center">Rate & Term</th>
                <th className="py-3 px-4 text-right">Principal Balance</th>
                <th className="py-3 px-4 text-center">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredLoans.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-500 text-xs">
                    No loan accounts found in this category.
                  </td>
                </tr>
              ) : (
                filteredLoans.map(loan => {
                  const borrower = members.find(m => m.id === loan.borrowerId);
                  const guarantor = loan.guarantorMemberId ? members.find(m => m.id === loan.guarantorMemberId) : null;
                  const { principalRepaid, interestRepaid, principalBalance, isOverdue, daysOverdue } = calculateLoanBalance(loan);

                  return (
                    <tr key={loan.id} className="hover:bg-slate-50/70 transition-colors">
                      {/* Loan Code & Date */}
                      <td className="py-3.5 px-4">
                        <button
                          onClick={() => {
                            setSelectedLoan(loan);
                            setIsDetailModalOpen(true);
                          }}
                          className="font-bold text-slate-900 hover:text-[#2b72a8] text-left transition-colors font-mono cursor-pointer"
                        >
                          {loan.loanCode}
                        </button>
                        <div className="text-[11px] text-slate-500 mt-0.5">
                          Issued: {loan.startDate} · Due: {loan.dueDate}
                        </div>
                      </td>

                      {/* Borrower & Security */}
                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-slate-900">
                          {borrower?.fullName || 'Borrower'}
                        </div>
                        <div className="text-[11px] text-slate-500 mt-0.5 flex items-center gap-1.5">
                          <span className="capitalize">{loan.borrowerType === 'member' ? 'Member' : 'Non-Member'}</span>
                          {guarantor && (
                            <>
                              <span aria-hidden="true">·</span>
                              <span className="text-slate-600">Co-Maker: {guarantor.fullName}</span>
                            </>
                          )}
                          <span aria-hidden="true">·</span>
                          <span className="text-emerald-700">Cash Loan</span>
                        </div>
                      </td>

                      {/* Principal */}
                      <td className="py-3.5 px-4 text-right">
                        <span className="font-bold tabular-nums text-slate-900 block">
                          {formatCurrency(loan.principalAmount)}
                        </span>
                        <span className="text-[11px] text-slate-500 block">
                          Repaid: ₱{principalRepaid.toLocaleString()}
                        </span>
                      </td>

                      {/* Rate & Term */}
                      <td className="py-3.5 px-4 text-center">
                        <span className="font-bold text-slate-800 block">
                          {loan.interestRateMonthly}% / month
                        </span>
                        <span className="text-[11px] text-slate-500 block">
                          {loan.termMonths} Months
                        </span>
                      </td>

                      {/* Principal Balance */}
                      <td className="py-3.5 px-4 text-right">
                        <span
                          className={`font-extrabold font-mono text-sm block ${
                            isOverdue
                              ? 'text-rose-600'
                              : principalBalance === 0
                              ? 'text-emerald-600'
                              : 'text-slate-900'
                          }`}
                        >
                          {formatCurrency(principalBalance)}
                        </span>
                        {interestRepaid > 0 && (
                          <span className="text-[10px] text-purple-700 block">
                            +₱{interestRepaid.toLocaleString()} interest paid
                          </span>
                        )}
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-4 text-center">
                        {isOverdue ? (
                          <div className="inline-flex flex-col items-center">
                            <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
                              OVERDUE
                            </span>
                            <span className="text-[10px] text-rose-600 mt-0.5 font-medium">
                              {daysOverdue} days late
                            </span>
                          </div>
                        ) : loan.status === 'fully_paid' ? (
                          <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                            FULLY PAID
                          </span>
                        ) : loan.status === 'pending' ? (
                          <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-amber-50 text-amber-800 border border-amber-200">
                            PENDING REVIEW
                          </span>
                        ) : loan.status === 'rejected' ? (
                          <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-slate-100 text-slate-600">
                            REJECTED
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-blue-50 text-blue-800 border border-blue-200">
                            ACTIVE
                          </span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {loan.status === 'pending' && currentUser.role === 'admin' && (
                            <>
                              <button
                                onClick={() => handleApprove(loan.id)}
                                className="px-2.5 py-1 text-xs font-bold rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white transition-colors cursor-pointer"
                              >
                                Approve
                              </button>
                              <button
                                onClick={() => openRejectModal(loan)}
                                className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors cursor-pointer"
                              >
                                Reject
                              </button>
                            </>
                          )}

                          {(loan.status === 'active' || isOverdue) && (
                            <button
                              onClick={() => openRepaymentModal(loan)}
                              className="px-2.5 py-1 text-xs font-bold rounded-lg bg-[#56A0D3] hover:bg-[#438bc0] text-white transition-colors shadow-xs cursor-pointer"
                            >
                              Repay
                            </button>
                          )}

                          <button
                            onClick={() => {
                              setSelectedLoan(loan);
                              setIsDetailModalOpen(true);
                            }}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors cursor-pointer"
                            title="View Loan Details"
                          >
                            <Receipt className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* New Loan Application Modal */}
      <Modal
        isOpen={isNewLoanModalOpen}
        onClose={() => setIsNewLoanModalOpen(false)}
        title="Apply for Paluwagan / Cooperative Loan"
        subtitle="Process credit application with customized interest rate and collateral"
        maxWidth="lg"
      >
        <form onSubmit={handleNewLoanSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Select Borrower *
            </label>
            <select
              required
              value={newLoanData.borrowerId}
              onChange={e => handleBorrowerChange(e.target.value)}
              className="w-full px-3 py-2 text-xs sm:text-sm bg-white border border-slate-200 rounded-lg focus:outline-none"
            >
              <option value="">Choose borrower...</option>
              {members.map(m => (
                <option key={m.id} value={m.id}>
                  {m.fullName} ({m.memberCode}) — {m.classification === 'member' ? `Paluwagan Member (${m.slots} slots)` : 'Non-Member Borrower'}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Principal Amount (₱) *
              </label>
              <input
                type="number"
                required
                min={1000}
                step={500}
                value={newLoanData.principalAmount}
                onChange={e => setNewLoanData({ ...newLoanData, principalAmount: Number(e.target.value) })}
                className="w-full px-3 py-2 text-xs sm:text-sm border border-slate-200 rounded-lg font-mono focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Monthly Interest (%) *
              </label>
              <input
                type="number"
                required
                min={0.5}
                step={0.5}
                value={newLoanData.interestRateMonthly}
                onChange={e => setNewLoanData({ ...newLoanData, interestRateMonthly: Number(e.target.value) })}
                className="w-full px-3 py-2 text-xs sm:text-sm border border-slate-200 rounded-lg font-mono focus:outline-none"
              />
              <span className="text-[10px] text-slate-400 mt-0.5 block">
                Standard: 3% (Members), 5% (External)
              </span>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Term (Months) *
              </label>
              <select
                value={newLoanData.termMonths}
                onChange={e => setNewLoanData({ ...newLoanData, termMonths: Number(e.target.value) })}
                className="w-full px-3 py-2 text-xs sm:text-sm bg-white border border-slate-200 rounded-lg focus:outline-none"
              >
                <option value={1}>1 Month</option>
                <option value={2}>2 Months</option>
                <option value={3}>3 Months</option>
                <option value={4}>4 Months</option>
                <option value={6}>6 Months</option>
                <option value={12}>12 Months</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Start / Release Date *
            </label>
            <input
              type="date"
              required
              value={newLoanData.startDate}
              onChange={e => setNewLoanData({ ...newLoanData, startDate: e.target.value })}
              className="w-full px-3 py-2 text-xs sm:text-sm border border-slate-200 rounded-lg focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Loan Purpose *
            </label>
            <input
              type="text"
              required
              value={newLoanData.purpose}
              onChange={e => setNewLoanData({ ...newLoanData, purpose: e.target.value })}
              placeholder="e.g. Sari-sari store inventory restocking, school tuition..."
              className="w-full px-3 py-2 text-xs sm:text-sm border border-slate-200 rounded-lg focus:outline-none"
            />
          </div>

          {/* Security: Guarantor (Co-Maker) & Cash Lending Policy */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                Loan Security (Co-Maker Guarantor)
              </h4>
              <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                Cash-Only Policy (No Collateral)
              </span>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                Guarantor / Co-Maker (Paluwagan Member)
              </label>
              <select
                value={newLoanData.guarantorMemberId}
                onChange={e => setNewLoanData({ ...newLoanData, guarantorMemberId: e.target.value })}
                className="w-full px-2.5 py-1.5 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none"
              >
                <option value="">None (Optional)</option>
                {members
                  .filter(m => m.classification === 'member' && m.id !== newLoanData.borrowerId)
                  .map(m => (
                    <option key={m.id} value={m.id}>
                      {m.fullName} ({m.memberCode})
                    </option>
                  ))}
              </select>
            </div>

            <div className="text-[11px] text-slate-500 bg-white p-2.5 rounded-lg border border-slate-200 flex items-center gap-2">
              <span className="text-emerald-600 font-bold">✓</span>
              <span>PLEND operates on pure cash disbursements and repayments. No physical collateral required or accepted.</span>
            </div>
          </div>

          {/* Live Amortization & Repayment Preview */}
          <div className="p-4 rounded-xl bg-[#56A0D3]/8 border border-[#56A0D3]/20 space-y-2 text-xs">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-900 uppercase tracking-wider text-[11px]">
                Estimated Amortization & Repayment Schedule
              </span>
              <span className="text-[11px] text-[#2b72a8] font-mono font-semibold">
                {newLoanData.termMonths} Monthly Installment{newLoanData.termMonths > 1 ? 's' : ''}
              </span>
            </div>

            <div className="grid grid-cols-3 gap-2 pt-1 font-mono">
              <div className="bg-white p-2.5 rounded-lg border border-slate-200">
                <span className="text-[10px] text-slate-500 block">Monthly Principal:</span>
                <span className="font-bold text-slate-900 block mt-0.5">
                  ₱{Math.round(newLoanData.principalAmount / (newLoanData.termMonths || 1)).toLocaleString()}
                </span>
              </div>
              <div className="bg-white p-2.5 rounded-lg border border-slate-200">
                <span className="text-[10px] text-slate-500 block">Monthly Interest ({newLoanData.interestRateMonthly}%):</span>
                <span className="font-bold text-purple-700 block mt-0.5">
                  ₱{Math.round(newLoanData.principalAmount * (newLoanData.interestRateMonthly / 100)).toLocaleString()}
                </span>
              </div>
              <div className="bg-white p-2.5 rounded-lg border border-slate-200">
                <span className="text-[10px] text-slate-500 block">Est. Monthly Total:</span>
                <span className="font-bold text-emerald-700 block mt-0.5">
                  ₱{Math.round(
                    (newLoanData.principalAmount / (newLoanData.termMonths || 1)) +
                    (newLoanData.principalAmount * (newLoanData.interestRateMonthly / 100))
                  ).toLocaleString()}
                </span>
              </div>
            </div>

            <div className="pt-2 border-t border-[#56A0D3]/15 flex flex-wrap items-center justify-between text-[11px] text-slate-600 gap-1">
              <span>
                Total Interest Accrued: <strong className="text-purple-700 font-mono">₱{Math.round(newLoanData.principalAmount * (newLoanData.interestRateMonthly / 100) * newLoanData.termMonths).toLocaleString()}</strong>
              </span>
              <span>
                Total Repayment: <strong className="text-slate-900 font-mono">₱{Math.round(newLoanData.principalAmount + (newLoanData.principalAmount * (newLoanData.interestRateMonthly / 100) * newLoanData.termMonths)).toLocaleString()}</strong>
              </span>
            </div>
          </div>


          <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={() => setIsNewLoanModalOpen(false)}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-bold text-white bg-[#56A0D3] hover:bg-[#438bc0] rounded-lg shadow-xs transition-colors cursor-pointer"
            >
              Submit Loan Application
            </button>
          </div>
        </form>
      </Modal>

      {/* Record Repayment Modal (Explicit Principal vs Interest separation!) */}
      {selectedLoan && (
        <Modal
          isOpen={isRepaymentModalOpen}
          onClose={() => setIsRepaymentModalOpen(false)}
          title={`Record Repayment: ${selectedLoan.loanCode}`}
          subtitle="Separate principal repayment from interest earnings to ensure financial accuracy"
          maxWidth="md"
        >
          <form onSubmit={handleRepaymentSubmit} className="space-y-4">
            {/* Quick Balance Status */}
            {(() => {
              const { principalBalance, isOverdue } = calculateLoanBalance(selectedLoan);
              return (
                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between text-xs">
                  <div>
                    <span className="text-slate-500 block">Remaining Principal Balance:</span>
                    <span className="text-base font-extrabold text-slate-900 font-mono">
                      {formatCurrency(principalBalance)}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-slate-500 block">Monthly Interest Rate:</span>
                    <span className="font-bold text-purple-700 font-mono">
                      {selectedLoan.interestRateMonthly}% / month
                    </span>
                  </div>
                </div>
              );
            })()}

            {/* Repayment Breakdown: Principal + Interest + Penalty */}
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  1. Principal Repaid (₱) *
                </label>
                <input
                  type="number"
                  required
                  min={0}
                  value={repaymentData.principalPaid}
                  onChange={e => setRepaymentData({ ...repaymentData, principalPaid: Number(e.target.value) })}
                  className="w-full px-3 py-2 text-xs sm:text-sm border border-slate-200 rounded-lg font-mono focus:outline-none"
                />
                <span className="text-[11px] text-slate-500 mt-0.5 block">
                  Directly reduces borrower principal and returns funds to available lending capital.
                </span>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  2. Interest Income Paid (₱) *
                </label>
                <input
                  type="number"
                  required
                  min={0}
                  value={repaymentData.interestPaid}
                  onChange={e => setRepaymentData({ ...repaymentData, interestPaid: Number(e.target.value) })}
                  className="w-full px-3 py-2 text-xs sm:text-sm border border-slate-200 rounded-lg font-mono focus:outline-none"
                />
                <span className="text-[11px] text-purple-700 mt-0.5 block">
                  Earmarked for the Year-End Member Dividend Pool.
                </span>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  3. Late Penalty / Surcharge (₱)
                </label>
                <input
                  type="number"
                  min={0}
                  value={repaymentData.penaltyPaid}
                  onChange={e => setRepaymentData({ ...repaymentData, penaltyPaid: Number(e.target.value) })}
                  className="w-full px-3 py-2 text-xs sm:text-sm border border-slate-200 rounded-lg font-mono focus:outline-none"
                />
              </div>
            </div>

            {/* Total Payment Summary */}
            <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-200 flex items-center justify-between text-xs">
              <span className="font-bold text-emerald-900">Total Cash Received:</span>
              <span className="font-extrabold text-emerald-900 font-mono text-base">
                {formatCurrency(
                  Number(repaymentData.principalPaid) +
                    Number(repaymentData.interestPaid) +
                    Number(repaymentData.penaltyPaid)
                )}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Payment Method *
                </label>
                <select
                  value={repaymentData.paymentMethod}
                  onChange={e => setRepaymentData({ ...repaymentData, paymentMethod: e.target.value as PaymentMethod })}
                  className="w-full px-2.5 py-1.5 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none"
                >
                  <option value="GCash">GCash</option>
                  <option value="Bank Transfer">Bank Transfer</option>
                  <option value="Cash">Cash</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Reference No.
                </label>
                <input
                  type="text"
                  value={repaymentData.referenceNo}
                  onChange={e => setRepaymentData({ ...repaymentData, referenceNo: e.target.value })}
                  placeholder="e.g. GC-99401"
                  className="w-full px-2.5 py-1.5 text-xs border border-slate-200 rounded-lg font-mono focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Repayment Notes
              </label>
              <input
                type="text"
                value={repaymentData.notes}
                onChange={e => setRepaymentData({ ...repaymentData, notes: e.target.value })}
                placeholder="e.g. Full installment payment for November"
                className="w-full px-3 py-2 text-xs sm:text-sm border border-slate-200 rounded-lg focus:outline-none"
              />
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setIsRepaymentModalOpen(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 text-xs font-bold text-white bg-[#56A0D3] hover:bg-[#438bc0] rounded-lg shadow-xs transition-colors cursor-pointer"
              >
                Post Repayment
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* Loan Details & Statement Modal */}
      {selectedLoan && (
        <Modal
          isOpen={isDetailModalOpen}
          onClose={() => setIsDetailModalOpen(false)}
          title={`Loan Ledger: ${selectedLoan.loanCode}`}
          subtitle={`Borrower: ${members.find(m => m.id === selectedLoan.borrowerId)?.fullName || 'Borrower'}`}
          maxWidth="2xl"
        >
          {(() => {
            const borrower = members.find(m => m.id === selectedLoan.borrowerId);
            const guarantor = selectedLoan.guarantorMemberId ? members.find(m => m.id === selectedLoan.guarantorMemberId) : null;
            const { principalRepaid, interestRepaid, penaltyRepaid, principalBalance, isOverdue } = calculateLoanBalance(selectedLoan);

            return (
              <div className="space-y-6">
                {/* Summary Cards */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                    <span className="text-slate-500 block">Original Principal</span>
                    <span className="font-bold text-slate-900 font-mono text-sm mt-0.5 block">
                      {formatCurrency(selectedLoan.principalAmount)}
                    </span>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                    <span className="text-slate-500 block">Principal Repaid</span>
                    <span className="font-bold text-emerald-700 font-mono text-sm mt-0.5 block">
                      {formatCurrency(principalRepaid)}
                    </span>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                    <span className="text-slate-500 block">Remaining Balance</span>
                    <span className={`font-bold font-mono text-sm mt-0.5 block ${isOverdue ? 'text-rose-600' : 'text-slate-900'}`}>
                      {formatCurrency(principalBalance)}
                    </span>
                  </div>

                  <div className="p-3 rounded-xl bg-purple-50/70 border border-purple-200">
                    <span className="text-purple-700 block">Interest Paid</span>
                    <span className="font-bold text-purple-900 font-mono text-sm mt-0.5 block">
                      {formatCurrency(interestRepaid)}
                    </span>
                  </div>
                </div>

                {/* Terms and Security Details */}
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-2">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <span className="text-slate-500 block">Term & Rate:</span>
                      <span className="font-semibold text-slate-900">
                        {selectedLoan.termMonths} Months @ {selectedLoan.interestRateMonthly}% / month
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-500 block">Start Date & Due Date:</span>
                      <span className="font-semibold text-slate-900">
                        {selectedLoan.startDate} to {selectedLoan.dueDate}
                      </span>
                    </div>
                  </div>

                  <div>
                    <span className="text-slate-500 block">Purpose:</span>
                    <span className="text-slate-900">{selectedLoan.purpose}</span>
                  </div>

                  {guarantor && (
                    <div>
                      <span className="text-slate-500 block">Co-Maker Guarantor:</span>
                      <span className="font-semibold text-[#2b72a8]">
                        {guarantor.fullName} ({guarantor.memberCode})
                      </span>
                    </div>
                  )}

                  <div>
                    <span className="text-slate-500 block">Loan Classification:</span>
                    <span className="font-semibold text-emerald-700">
                      Unsecured Cash Loan (Pure Cash Disbursement & Collection)
                    </span>
                  </div>
                </div>

                {/* Repayments History Ledger */}
                <div>
                  <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2">
                    Repayment History Ledger
                  </h4>

                  {(selectedLoan.repayments || []).length === 0 ? (
                    <div className="p-4 rounded-lg bg-slate-50 border border-slate-200 text-center text-xs text-slate-500">
                      No repayments recorded yet.
                    </div>
                  ) : (
                    <div className="border border-slate-200 rounded-xl overflow-hidden">
                      <table className="w-full text-left text-xs border-collapse">
                        <thead>
                          <tr className="bg-slate-50 border-b border-slate-200 font-semibold text-slate-600">
                            <th className="py-2.5 px-3">Receipt / Date</th>
                            <th className="py-2.5 px-3 text-right">Principal</th>
                            <th className="py-2.5 px-3 text-right">Interest</th>
                            <th className="py-2.5 px-3 text-right">Total</th>
                            <th className="py-2.5 px-3">Method / Ref</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {selectedLoan.repayments.map(r => (
                            <tr key={r.id}>
                              <td className="py-2 px-3">
                                <span className="font-mono font-semibold text-slate-900 block">{r.receiptNo}</span>
                                <span className="text-[11px] text-slate-400 block">{r.paymentDate}</span>
                              </td>
                              <td className="py-2 px-3 text-right font-mono font-medium text-emerald-700">
                                ₱{r.principalPaid.toLocaleString()}
                              </td>
                              <td className="py-2 px-3 text-right font-mono font-medium text-purple-700">
                                ₱{r.interestPaid.toLocaleString()}
                              </td>
                              <td className="py-2 px-3 text-right font-mono font-bold text-slate-900">
                                ₱{r.totalPaid.toLocaleString()}
                              </td>
                              <td className="py-2 px-3">
                                <span className="text-slate-800">{r.paymentMethod}</span>
                                {r.referenceNo && (
                                  <span className="text-[10px] text-slate-400 block font-mono">{r.referenceNo}</span>
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                  <button
                    onClick={() => setIsDetailModalOpen(false)}
                    className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 transition-colors cursor-pointer"
                  >
                    Close
                  </button>

                  <button
                    onClick={() => window.print()}
                    className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-lg bg-[#56A0D3] text-white hover:bg-[#438bc0] transition-colors cursor-pointer"
                  >
                    <Printer className="h-3.5 w-3.5" />
                    <span>Print Loan Voucher</span>
                  </button>
                </div>
              </div>
            );
          })()}
        </Modal>
      )}

      {/* Reject Modal */}
      <Modal
        isOpen={isRejectModalOpen}
        onClose={() => setIsRejectModalOpen(false)}
        title="Reject Loan Application"
        subtitle="Provide reason for rejecting credit application"
        maxWidth="sm"
      >
        <form onSubmit={handleRejectSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Rejection Reason *
            </label>
            <textarea
              required
              rows={3}
              value={rejectReason}
              onChange={e => setRejectReason(e.target.value)}
              placeholder="e.g. Insufficient collateral valuation, credit limits exceeded..."
              className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setIsRejectModalOpen(false)}
              className="px-3 py-1.5 text-xs text-slate-600 hover:text-slate-900 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-lg cursor-pointer"
            >
              Confirm Rejection
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
