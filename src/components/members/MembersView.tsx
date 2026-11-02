import React, { useState, useMemo } from 'react';
import {
  Search,
  Plus,
  Filter,
  User,
  Phone,
  Mail,
  CreditCard,
  Edit2,
  Trash2,
  Eye,
  CheckCircle2,
  Clock,
  AlertCircle,
  FileText,
  Printer,
  ChevronDown,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Member, MemberClassification, PaymentMethod } from '../../types';
import { formatCurrency, calculateMemberDividend, MONTH_NAMES } from '../../utils/calculations';
import { Modal } from '../common/Modal';

interface MembersViewProps {
  initialAction?: string | null;
  onActionHandled?: () => void;
}

export const MembersView: React.FC<MembersViewProps> = ({
  initialAction,
  onActionHandled,
}) => {
  const {
    members,
    contributions,
    loans,
    settings,
    currentUser,
    addMember,
    updateMember,
    deleteMember,
    financialSummary,
  } = useApp();

  const [searchTerm, setSearchTerm] = useState('');
  const [classificationFilter, setClassificationFilter] = useState<'all' | 'member' | 'non_member_borrower'>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');

  // Modal states
  const [isAddEditModalOpen, setIsAddEditModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);
  const [isEditing, setIsEditing] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    address: '',
    classification: 'member' as MemberClassification,
    slots: 1,
    paymentMethod: 'GCash' as PaymentMethod,
    accountName: '',
    accountNumber: '',
    bankName: '',
    notes: '',
  });

  // Filtered members list
  const filteredMembers = useMemo(() => {
    return members.filter(m => {
      const matchSearch =
        m.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        m.memberCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
        m.phone.toLowerCase().includes(searchTerm.toLowerCase()) ||
        m.email.toLowerCase().includes(searchTerm.toLowerCase());

      const matchClass = classificationFilter === 'all' || m.classification === classificationFilter;
      const matchStatus = statusFilter === 'all' || m.status === statusFilter;

      return matchSearch && matchClass && matchStatus;
    });
  }, [members, searchTerm, classificationFilter, statusFilter]);

  const openAddModal = () => {
    setIsEditing(false);
    setSelectedMember(null);
    setFormData({
      fullName: '',
      email: '',
      phone: '',
      address: '',
      classification: 'member',
      slots: 1,
      paymentMethod: 'GCash',
      accountName: '',
      accountNumber: '',
      bankName: '',
      notes: '',
    });
    setIsAddEditModalOpen(true);
  };

  React.useEffect(() => {
    if (initialAction === 'new_member') {
      openAddModal();
      onActionHandled?.();
    }
  }, [initialAction]);

  const openEditModal = (member: Member) => {
    setIsEditing(true);
    setSelectedMember(member);
    setFormData({
      fullName: member.fullName,
      email: member.email,
      phone: member.phone,
      address: member.address || '',
      classification: member.classification,
      slots: member.slots,
      paymentMethod: member.paymentDetails.method,
      accountName: member.paymentDetails.accountName || '',
      accountNumber: member.paymentDetails.accountNumber || '',
      bankName: member.paymentDetails.bankName || '',
      notes: member.notes || '',
    });
    setIsAddEditModalOpen(true);
  };

  const openDetailModal = (member: Member) => {
    setSelectedMember(member);
    setIsDetailModalOpen(true);
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.fullName.trim()) return;

    const paymentDetails = {
      method: formData.paymentMethod,
      accountName: formData.accountName || formData.fullName,
      accountNumber: formData.accountNumber,
      bankName: formData.paymentMethod === 'Bank Transfer' ? formData.bankName : undefined,
    };

    if (isEditing && selectedMember) {
      updateMember(selectedMember.id, {
        fullName: formData.fullName,
        email: formData.email,
        phone: formData.phone,
        address: formData.address,
        classification: formData.classification,
        slots: formData.classification === 'member' ? Number(formData.slots) : 0,
        paymentDetails,
        notes: formData.notes,
      });
    } else {
      addMember({
        fullName: formData.fullName,
        email: formData.email,
        phone: formData.phone,
        address: formData.address,
        classification: formData.classification,
        slots: formData.classification === 'member' ? Number(formData.slots) : 0,
        paymentDetails,
        status: 'active',
        notes: formData.notes,
      });
    }

    setIsAddEditModalOpen(false);
  };

  const handleDeleteMember = (member: Member) => {
    if (confirm(`Are you sure you want to delete member ${member.fullName}?`)) {
      deleteMember(member.id);
      if (isDetailModalOpen) setIsDetailModalOpen(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Controls & Search Bar */}
      <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            placeholder="Search by name, member code, phone, or email..."
            className="w-full pl-9 pr-4 py-2 text-xs sm:text-sm bg-[#F8FAFC] border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#56A0D3]/30 focus:border-[#56A0D3] transition-all"
          />
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Classification Filter Tabs */}
          <div className="flex items-center p-1 bg-slate-100 rounded-lg text-xs font-medium">
            <button
              onClick={() => setClassificationFilter('all')}
              className={`px-3 py-1.5 rounded-md transition-colors cursor-pointer ${
                classificationFilter === 'all'
                  ? 'bg-white text-slate-900 shadow-xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              All ({members.length})
            </button>
            <button
              onClick={() => setClassificationFilter('member')}
              className={`px-3 py-1.5 rounded-md transition-colors cursor-pointer ${
                classificationFilter === 'member'
                  ? 'bg-white text-[#2b72a8] shadow-xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Paluwagan Members ({members.filter(m => m.classification === 'member').length})
            </button>
            <button
              onClick={() => setClassificationFilter('non_member_borrower')}
              className={`px-3 py-1.5 rounded-md transition-colors cursor-pointer ${
                classificationFilter === 'non_member_borrower'
                  ? 'bg-white text-slate-900 shadow-xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Borrowers Only ({members.filter(m => m.classification === 'non_member_borrower').length})
            </button>
          </div>

          <button
            onClick={openAddModal}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs sm:text-sm font-semibold rounded-lg bg-[#56A0D3] text-white hover:bg-[#438bc0] transition-colors shadow-xs cursor-pointer"
          >
            <Plus className="h-4 w-4" />
            <span>Add Member</span>
          </button>
        </div>
      </div>

      {/* Members Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm border-collapse">
            <thead>
              <tr className="border-b border-slate-200 bg-[#F8FAFC] text-slate-600 font-semibold">
                <th className="py-3 px-4">Member Info</th>
                <th className="py-3 px-4">Classification</th>
                <th className="py-3 px-4 text-center">Paluwagan Slots</th>
                <th className="py-3 px-4 text-right">Monthly Commitment</th>
                <th className="py-3 px-4">Payment Channel</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredMembers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-500 text-sm">
                    No members found matching your filter criteria.
                  </td>
                </tr>
              ) : (
                filteredMembers.map(member => {
                  const monthlyCommitment = member.slots * settings.contributionPerSlot;

                  return (
                    <tr
                      key={member.id}
                      className="hover:bg-slate-50/80 transition-colors group"
                    >
                      {/* Name & Contact */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <div className="h-9 w-9 rounded-full bg-[#56A0D3]/15 text-[#2b72a8] font-bold flex items-center justify-center shrink-0">
                            {member.fullName
                              .split(' ')
                              .map(n => n[0])
                              .join('')
                              .substring(0, 2)}
                          </div>
                          <div>
                            <button
                              onClick={() => openDetailModal(member)}
                              className="font-bold text-slate-900 hover:text-[#2b72a8] text-left transition-colors cursor-pointer"
                            >
                              {member.fullName}
                            </button>
                            <div className="flex items-center gap-2 text-xs text-slate-500 mt-0.5">
                              <span className="font-mono text-slate-600">{member.memberCode}</span>
                              <span aria-hidden="true">·</span>
                              <span>{member.phone}</span>
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Classification */}
                      <td className="py-3.5 px-4">
                        {member.classification === 'member' ? (
                          <span className="text-slate-800 font-medium">
                            Paluwagan Member
                          </span>
                        ) : (
                          <span className="text-purple-800 font-medium">
                            Non-Member Borrower
                          </span>
                        )}
                      </td>

                      {/* Slots */}
                      <td className="py-3.5 px-4 text-center">
                        {member.classification === 'member' ? (
                          <span className="inline-flex items-center justify-center px-2.5 py-1 rounded-md bg-[#56A0D3]/10 text-[#2b72a8] font-bold tabular-nums text-xs">
                            {member.slots} {member.slots === 1 ? 'Slot' : 'Slots'}
                          </span>
                        ) : (
                          <span className="text-slate-400 text-xs">—</span>
                        )}
                      </td>

                      {/* Monthly Commitment */}
                      <td className="py-3.5 px-4 text-right">
                        {member.classification === 'member' ? (
                          <span className="font-bold text-slate-900 tabular-nums">
                            {formatCurrency(monthlyCommitment)}
                          </span>
                        ) : (
                          <span className="text-slate-400 text-xs">—</span>
                        )}
                      </td>

                      {/* Payment Channel */}
                      <td className="py-3.5 px-4">
                        <div className="text-xs">
                          <span className="font-medium text-slate-800 block">
                            {member.paymentDetails.method}
                          </span>
                          <span className="text-slate-500 text-[11px] truncate max-w-[150px] block">
                            {member.paymentDetails.accountNumber || member.paymentDetails.bankName || 'In Person'}
                          </span>
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => openDetailModal(member)}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors cursor-pointer"
                            title="View Member Details & Ledger"
                          >
                            <Eye className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => openEditModal(member)}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors cursor-pointer"
                            title="Edit Member"
                          >
                            <Edit2 className="h-4 w-4" />
                          </button>
                          {currentUser.role === 'admin' && (
                            <button
                              onClick={() => handleDeleteMember(member)}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                              title="Delete Member"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Footer Summary */}
        <div className="px-6 py-3.5 border-t border-slate-200 bg-[#F8FAFC] flex flex-col sm:flex-row sm:items-center justify-between text-xs text-slate-500 gap-2">
          <div>
            Showing <span className="font-semibold text-slate-800">{filteredMembers.length}</span> of{' '}
            <span className="font-semibold text-slate-800">{members.length}</span> total records
          </div>
          <div className="flex items-center gap-4">
            <span>
              Total Active Slots:{' '}
              <strong className="text-slate-900 font-mono">
                {filteredMembers.filter(m => m.classification === 'member').reduce((s, m) => s + m.slots, 0)}
              </strong>
            </span>
            <span aria-hidden="true">·</span>
            <span>
              Monthly Commitment:{' '}
              <strong className="text-slate-900 font-mono">
                {formatCurrency(
                  filteredMembers
                    .filter(m => m.classification === 'member')
                    .reduce((s, m) => s + m.slots * settings.contributionPerSlot, 0)
                )}
              </strong>
            </span>
          </div>
        </div>
      </div>

      {/* Add / Edit Member Modal */}
      <Modal
        isOpen={isAddEditModalOpen}
        onClose={() => setIsAddEditModalOpen(false)}
        title={isEditing ? 'Edit Member Profile' : 'Register New Member / Borrower'}
        subtitle="Manage personal info, Paluwagan slots, and repayment accounts"
        maxWidth="lg"
      >
        <form onSubmit={handleFormSubmit} className="space-y-4">
          {/* Classification Radio */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Account Classification
            </label>
            <div className="grid grid-cols-2 gap-3">
              <label
                className={`p-3 rounded-xl border flex flex-col cursor-pointer transition-all ${
                  formData.classification === 'member'
                    ? 'border-[#56A0D3] bg-[#56A0D3]/5 ring-1 ring-[#56A0D3]'
                    : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-900">Paluwagan Member</span>
                  <input
                    type="radio"
                    name="classification"
                    value="member"
                    checked={formData.classification === 'member'}
                    onChange={() => setFormData({ ...formData, classification: 'member', slots: Math.max(1, formData.slots) })}
                    className="text-[#56A0D3]"
                  />
                </div>
                <p className="text-[11px] text-slate-500 mt-1">
                  Participates in monthly pool & year-end dividend profit share.
                </p>
              </label>

              <label
                className={`p-3 rounded-xl border flex flex-col cursor-pointer transition-all ${
                  formData.classification === 'non_member_borrower'
                    ? 'border-purple-500 bg-purple-50/50 ring-1 ring-purple-500'
                    : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-purple-900">Non-Member Borrower</span>
                  <input
                    type="radio"
                    name="classification"
                    value="non_member_borrower"
                    checked={formData.classification === 'non_member_borrower'}
                    onChange={() => setFormData({ ...formData, classification: 'non_member_borrower', slots: 0 })}
                    className="text-purple-600"
                  />
                </div>
                <p className="text-[11px] text-slate-500 mt-1">
                  External borrower only. Requires co-maker guarantor or collateral.
                </p>
              </label>
            </div>
          </div>

          {/* Full Name & Phone */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Full Legal Name *
              </label>
              <input
                type="text"
                required
                value={formData.fullName}
                onChange={e => setFormData({ ...formData, fullName: e.target.value })}
                placeholder="e.g. Maria Elena Santos"
                className="w-full px-3 py-2 text-xs sm:text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#56A0D3]/30 focus:border-[#56A0D3]"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Phone Number *
              </label>
              <input
                type="text"
                required
                value={formData.phone}
                onChange={e => setFormData({ ...formData, phone: e.target.value })}
                placeholder="e.g. +63 917 123 4567"
                className="w-full px-3 py-2 text-xs sm:text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#56A0D3]/30 focus:border-[#56A0D3]"
              />
            </div>
          </div>

          {/* Email & Address */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Email Address
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={e => setFormData({ ...formData, email: e.target.value })}
                placeholder="name@email.com"
                className="w-full px-3 py-2 text-xs sm:text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#56A0D3]/30 focus:border-[#56A0D3]"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Home / Business Address
              </label>
              <input
                type="text"
                value={formData.address}
                onChange={e => setFormData({ ...formData, address: e.target.value })}
                placeholder="e.g. Pasig City, Metro Manila"
                className="w-full px-3 py-2 text-xs sm:text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#56A0D3]/30 focus:border-[#56A0D3]"
              />
            </div>
          </div>

          {/* Slots Configuration (only for regular members) */}
          {formData.classification === 'member' && (
            <div className="p-4 rounded-xl bg-[#56A0D3]/8 border border-[#56A0D3]/20 space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-900 mb-1">
                  Number of Paluwagan Slots (Manual Input) *
                </label>
                <p className="text-[11px] text-slate-500 mb-2">
                  Input any number of slots. Each slot equals ₱{settings.contributionPerSlot.toLocaleString()} per month.
                </p>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, slots: Math.max(1, (Number(prev.slots) || 1) - 1) }))}
                    className="h-10 w-10 flex items-center justify-center rounded-lg bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 font-bold text-base cursor-pointer shadow-xs transition-colors"
                  >
                    -
                  </button>
                  <input
                    type="number"
                    min={1}
                    step={1}
                    required
                    value={formData.slots}
                    onChange={e => {
                      const val = parseInt(e.target.value, 10);
                      setFormData(prev => ({ ...prev, slots: isNaN(val) ? (e.target.value as any) : Math.max(1, val) }));
                    }}
                    placeholder="Enter number of slots"
                    className="flex-1 px-3 py-2 text-base font-bold text-slate-900 tabular-nums bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#56A0D3]/30 focus:border-[#56A0D3] text-center"
                  />
                  <button
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, slots: (Number(prev.slots) || 1) + 1 }))}
                    className="h-10 w-10 flex items-center justify-center rounded-lg bg-[#56A0D3] text-white hover:bg-[#438bc0] font-bold text-base cursor-pointer shadow-xs transition-colors"
                  >
                    +
                  </button>
                </div>

                {/* Quick Presets for convenience */}
                <div className="flex flex-wrap items-center gap-1.5 mt-2.5">
                  <span className="text-[11px] text-slate-400 mr-1">Presets:</span>
                  {[1, 2, 3, 5, 10, 15, 20].map(s => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, slots: s }))}
                      className={`px-2.5 py-1 rounded-md text-xs font-semibold tabular-nums cursor-pointer transition-colors ${
                        Number(formData.slots) === s
                          ? 'bg-[#56A0D3] text-white shadow-xs'
                          : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      {s} {s === 1 ? 'Slot' : 'Slots'}
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-2 border-t border-[#56A0D3]/15 flex items-center justify-between text-xs font-semibold">
                <span className="text-slate-600">Calculated Monthly Contribution:</span>
                <span className="text-slate-900 font-bold tabular-nums text-sm">
                  ₱{((Number(formData.slots) || 0) * settings.contributionPerSlot).toLocaleString()} / month
                </span>
              </div>
            </div>
          )}

          {/* Payment & Disbursement Account Details */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              Disbursement & Payment Details
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                  Primary Method
                </label>
                <select
                  value={formData.paymentMethod}
                  onChange={e => setFormData({ ...formData, paymentMethod: e.target.value as PaymentMethod })}
                  className="w-full px-2.5 py-1.5 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none"
                >
                  <option value="GCash">GCash</option>
                  <option value="Bank Transfer">Bank Transfer</option>
                  <option value="Cash">Cash (In-Person)</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                  Account Name
                </label>
                <input
                  type="text"
                  value={formData.accountName}
                  onChange={e => setFormData({ ...formData, accountName: e.target.value })}
                  placeholder={formData.fullName || 'Account Name'}
                  className="w-full px-2.5 py-1.5 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                  Account Number / Mobile
                </label>
                <input
                  type="text"
                  value={formData.accountNumber}
                  onChange={e => setFormData({ ...formData, accountNumber: e.target.value })}
                  placeholder="0917... or Bank Acct#"
                  className="w-full px-2.5 py-1.5 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none"
                />
              </div>
            </div>

            {formData.paymentMethod === 'Bank Transfer' && (
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                  Bank Name
                </label>
                <input
                  type="text"
                  value={formData.bankName}
                  onChange={e => setFormData({ ...formData, bankName: e.target.value })}
                  placeholder="e.g. BPI, BDO, UnionBank, Metrobank"
                  className="w-full px-2.5 py-1.5 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none"
                />
              </div>
            )}
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Internal Notes / Background
            </label>
            <textarea
              rows={2}
              value={formData.notes}
              onChange={e => setFormData({ ...formData, notes: e.target.value })}
              placeholder="e.g. Founding member, business owner, reliable payer..."
              className="w-full px-3 py-2 text-xs sm:text-sm border border-slate-200 rounded-lg focus:outline-none"
            />
          </div>

          {/* Modal Action Buttons */}
          <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={() => setIsAddEditModalOpen(false)}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-bold text-white bg-[#56A0D3] hover:bg-[#438bc0] rounded-lg shadow-xs transition-colors cursor-pointer"
            >
              {isEditing ? 'Save Changes' : 'Register Member'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Member Details & Statement Modal */}
      {selectedMember && (
        <Modal
          isOpen={isDetailModalOpen}
          onClose={() => setIsDetailModalOpen(false)}
          title={`Member Profile: ${selectedMember.fullName}`}
          subtitle={`${selectedMember.memberCode} · ${selectedMember.classification === 'member' ? `${selectedMember.slots} Paluwagan Slot(s)` : 'Non-Member Borrower'}`}
          maxWidth="2xl"
        >
          <div className="space-y-6">
            {/* Top Quick Info Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                <span className="text-[11px] text-slate-500 block">Contact Info</span>
                <span className="text-xs font-bold text-slate-900 block mt-1">{selectedMember.phone}</span>
                <span className="text-[11px] text-slate-500 block truncate">{selectedMember.email || 'No email'}</span>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                <span className="text-[11px] text-slate-500 block">Payment Account</span>
                <span className="text-xs font-bold text-slate-900 block mt-1">
                  {selectedMember.paymentDetails.method}
                </span>
                <span className="text-[11px] text-slate-500 block truncate font-mono">
                  {selectedMember.paymentDetails.accountNumber || selectedMember.paymentDetails.bankName || 'Cash OTC'}
                </span>
              </div>

              <div className="p-3.5 rounded-xl bg-[#56A0D3]/8 border border-[#56A0D3]/20">
                <span className="text-[11px] text-slate-500 block">Member Classification</span>
                <span className="text-xs font-bold text-[#2b72a8] block mt-1">
                  {selectedMember.classification === 'member'
                    ? `${selectedMember.slots} Slot(s) · ₱${(selectedMember.slots * settings.contributionPerSlot).toLocaleString()}/mo`
                    : 'Borrower (0 Slots)'}
                </span>
                <span className="text-[11px] text-slate-500 block">Joined {selectedMember.joinedDate}</span>
              </div>
            </div>

            {/* 12-Month Contribution Checklist (if regular member) */}
            {selectedMember.classification === 'member' && (
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                    {settings.cycleYear} Monthly Paluwagan Payment Checklist
                  </h4>
                  <span className="text-xs text-slate-500">
                    Paid YTD:{' '}
                    <strong className="text-emerald-700 font-mono">
                      {formatCurrency(
                        contributions
                          .filter(
                            c =>
                              c.memberId === selectedMember.id &&
                              c.year === settings.cycleYear &&
                              (c.status === 'paid' || c.status === 'late')
                          )
                          .reduce((s, c) => s + c.paidAmount, 0)
                      )}
                    </strong>
                  </span>
                </div>

                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2">
                  {Array.from({ length: 12 }, (_, i) => {
                    const month = i + 1;
                    const p = contributions.find(
                      c => c.memberId === selectedMember.id && c.month === month && c.year === settings.cycleYear
                    );
                    const isPaid = p?.status === 'paid' || p?.status === 'late';
                    const isLate = p?.status === 'late';

                    return (
                      <div
                        key={month}
                        className={`p-2.5 rounded-lg border text-center transition-colors ${
                          isPaid
                            ? isLate
                              ? 'bg-amber-50 border-amber-200 text-amber-800'
                              : 'bg-emerald-50 border-emerald-200 text-emerald-800'
                            : 'bg-slate-50 border-slate-200 text-slate-400'
                        }`}
                      >
                        <span className="block text-[11px] font-bold">{MONTH_NAMES[i].slice(0, 3)}</span>
                        <span className="block text-[10px] mt-0.5 font-medium">
                          {isPaid ? (isLate ? 'Late' : 'Paid') : 'Unpaid'}
                        </span>
                        {isPaid && (
                          <span className="block text-[9px] font-mono mt-0.5">
                            ₱{p?.paidAmount.toLocaleString()}
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Loans History / Active Loans */}
            <div>
              <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2">
                Loans Associated With Member
              </h4>
              {loans.filter(l => l.borrowerId === selectedMember.id || l.guarantorMemberId === selectedMember.id).length === 0 ? (
                <div className="p-4 rounded-lg bg-slate-50 border border-slate-200 text-center text-xs text-slate-500">
                  No active or past loans on record for this member.
                </div>
              ) : (
                <div className="space-y-2">
                  {loans
                    .filter(l => l.borrowerId === selectedMember.id || l.guarantorMemberId === selectedMember.id)
                    .map(loan => {
                      const isBorrower = loan.borrowerId === selectedMember.id;
                      const principalRepaid = (loan.repayments || []).reduce((s, r) => s + r.principalPaid, 0);
                      const balance = Math.max(0, loan.principalAmount - principalRepaid);

                      return (
                        <div
                          key={loan.id}
                          className="p-3 rounded-lg border border-slate-200 bg-white flex items-center justify-between text-xs"
                        >
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-slate-900">{loan.loanCode}</span>
                              <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-100 text-slate-600">
                                {isBorrower ? 'Direct Borrower' : 'Co-Maker Guarantor'}
                              </span>
                              <span className="text-[10px] uppercase font-semibold text-slate-500">
                                {loan.status}
                              </span>
                            </div>
                            <p className="text-[11px] text-slate-500 mt-0.5">
                              Principal: ₱{loan.principalAmount.toLocaleString()} · Due: {loan.dueDate} · {loan.purpose}
                            </p>
                          </div>

                          <div className="text-right">
                            <span className="font-mono font-bold text-slate-900 block">
                              Bal: {formatCurrency(balance)}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                </div>
              )}
            </div>

            {/* Projected Year-End Dividend Calculation Box */}
            {selectedMember.classification === 'member' && (
              <div className="p-4 rounded-xl bg-purple-50/70 border border-purple-200">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-xs font-bold text-purple-900 uppercase tracking-wider">
                    Projected Year-End Dividend Calculation
                  </h4>
                  <span className="text-xs text-purple-700 font-mono">
                    Formula: (Slots ÷ Total Slots) × Interest
                  </span>
                </div>

                {(() => {
                  const memberTotalPaid = contributions
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
                    memberTotalPaid
                  );

                  return (
                    <div className="grid grid-cols-3 gap-3 text-xs pt-1">
                      <div className="bg-white p-2.5 rounded-lg border border-purple-100">
                        <span className="text-slate-500 block text-[11px]">Total Contributions</span>
                        <span className="font-mono font-bold text-slate-900 mt-0.5 block">
                          {formatCurrency(memberTotalPaid)}
                        </span>
                      </div>
                      <div className="bg-white p-2.5 rounded-lg border border-purple-100">
                        <span className="text-slate-500 block text-[11px]">
                          Dividend ({slotSharePercentage.toFixed(1)}% share)
                        </span>
                        <span className="font-mono font-bold text-purple-700 mt-0.5 block">
                          +{formatCurrency(dividendEarned)}
                        </span>
                      </div>
                      <div className="bg-white p-2.5 rounded-lg border border-purple-100">
                        <span className="text-slate-500 block text-[11px]">Projected Final Payout</span>
                        <span className="font-mono font-bold text-emerald-700 mt-0.5 block">
                          {formatCurrency(finalPayout)}
                        </span>
                      </div>
                    </div>
                  );
                })()}
              </div>
            )}

            {/* Modal Actions */}
            <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
              <button
                onClick={() => {
                  setIsDetailModalOpen(false);
                  openEditModal(selectedMember);
                }}
                className="px-3.5 py-2 text-xs font-semibold rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 transition-colors cursor-pointer"
              >
                Edit Profile
              </button>

              <button
                onClick={() => window.print()}
                className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-lg bg-[#56A0D3] text-white hover:bg-[#438bc0] transition-colors cursor-pointer"
              >
                <Printer className="h-3.5 w-3.5" />
                <span>Print Member Statement</span>
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
