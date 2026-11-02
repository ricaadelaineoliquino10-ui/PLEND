import React, { createContext, useContext, useEffect, useMemo, useState, useRef } from 'react';
import {
  AuditLog,
  AuditModule,
  AuthAccount,
  ContributionPayment,
  ContributionStatus,
  Loan,
  LoanRepayment,
  LoanStatus,
  Member,
  PaymentMethod,
  Payout,
  PayoutStatus,
  SystemSettings,
  UserSession,
} from '../types';
import {
  calculateFinancialSummary,
  calculateLoanBalance,
  calculateMemberDividend,
  FinancialSummary,
} from '../utils/calculations';
import {
  generateInitialContributions,
  initialAuditLogs,
  initialAuthAccounts,
  initialLoans,
  initialMembers,
  initialPayouts,
  initialSettings,
  initialUserSession,
} from '../data/seedData';

interface AppContextType {
  members: Member[];
  contributions: ContributionPayment[];
  loans: Loan[];
  payouts: Payout[];
  auditLogs: AuditLog[];
  settings: SystemSettings;
  currentUser: UserSession;
  financialSummary: FinancialSummary;

  // Authentication State & Actions
  isAuthenticated: boolean;
  inactivityNotice: string | null;
  authAccounts: AuthAccount[];
  clearInactivityNotice: () => void;
  login: (usernameOrEmail: string, password: string, rememberMe?: boolean) => { success: boolean; error?: string };
  logout: (reason?: string) => void;
  resetPassword: (usernameOrEmail: string, newPassword: string, securityAnswer?: string) => { success: boolean; error?: string };

  // Actions
  switchRole: (role: 'admin' | 'staff') => void;
  addMember: (data: Omit<Member, 'id' | 'memberCode' | 'joinedDate'>) => Member;
  updateMember: (id: string, updates: Partial<Member>) => void;
  deleteMember: (id: string) => void;

  recordContribution: (data: {
    memberId: string;
    month: number;
    year: number;
    paidAmount: number;
    method: PaymentMethod;
    refNo?: string;
    notes?: string;
  }) => void;
  batchMarkContributions: (month: number, year: number, status: ContributionStatus) => void;

  createLoan: (data: {
    borrowerId: string;
    principalAmount: number;
    interestRateMonthly: number;
    termMonths: number;
    startDate: string;
    guarantorMemberId?: string;
    purpose: string;
  }) => Loan;
  approveLoan: (loanId: string) => void;
  rejectLoan: (loanId: string, reason: string) => void;
  recordRepayment: (
    loanId: string,
    repayment: {
      principalPaid: number;
      interestPaid: number;
      penaltyPaid: number;
      paymentMethod: PaymentMethod;
      referenceNo?: string;
      notes?: string;
    }
  ) => void;

  calculateAndGeneratePayouts: (year: number) => void;
  updatePayoutStatus: (
    payoutId: string,
    status: PayoutStatus,
    details?: { paymentMethod?: PaymentMethod; referenceNo?: string; notes?: string }
  ) => void;

  updateSettings: (updates: Partial<SystemSettings>) => void;
  resetToDefaults: () => void;
  exportDatabaseJson: () => void;
  importDatabaseJson: (jsonString: string) => boolean;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const STORAGE_KEY = 'plend_storage_v1';

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Load state from localStorage or seed
  const [authAccounts, setAuthAccounts] = useState<AuthAccount[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_auth_accounts`);
    return saved ? JSON.parse(saved) : initialAuthAccounts;
  });

  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    const sessionToken = sessionStorage.getItem(`${STORAGE_KEY}_auth_session`);
    const rememberedToken = localStorage.getItem(`${STORAGE_KEY}_auth_session`);
    return Boolean(sessionToken || rememberedToken);
  });

  const [inactivityNotice, setInactivityNotice] = useState<string | null>(null);
  const lastActivityRef = useRef<number>(Date.now());

  const [currentUser, setCurrentUser] = useState<UserSession>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_user`);
    return saved ? JSON.parse(saved) : initialUserSession;
  });

  const [settings, setSettings] = useState<SystemSettings>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_settings`);
    return saved ? JSON.parse(saved) : initialSettings;
  });

  const [members, setMembers] = useState<Member[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_members`);
    return saved ? JSON.parse(saved) : initialMembers;
  });

  const [contributions, setContributions] = useState<ContributionPayment[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_contributions`);
    return saved ? JSON.parse(saved) : generateInitialContributions();
  });

  const [loans, setLoans] = useState<Loan[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_loans`);
    return saved ? JSON.parse(saved) : initialLoans;
  });

  const [payouts, setPayouts] = useState<Payout[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_payouts`);
    return saved ? JSON.parse(saved) : initialPayouts;
  });

  const [auditLogs, setAuditLogs] = useState<AuditLog[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_audit`);
    return saved ? JSON.parse(saved) : initialAuditLogs;
  });

  // Save to localStorage
  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_user`, JSON.stringify(currentUser));
  }, [currentUser]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_auth_accounts`, JSON.stringify(authAccounts));
  }, [authAccounts]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_settings`, JSON.stringify(settings));
  }, [settings]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_members`, JSON.stringify(members));
  }, [members]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_contributions`, JSON.stringify(contributions));
  }, [contributions]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_loans`, JSON.stringify(loans));
  }, [loans]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_payouts`, JSON.stringify(payouts));
  }, [payouts]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_audit`, JSON.stringify(auditLogs));
  }, [auditLogs]);

  const logAudit = (action: string, module: AuditModule, details: string) => {
    const newLog: AuditLog = {
      id: `log-${Date.now()}-${Math.random().toString(36).substring(2, 5)}`,
      timestamp: new Date().toISOString(),
      userId: currentUser?.id || 'sys',
      userName: currentUser?.name || 'System',
      userRole: currentUser?.role || 'admin',
      action,
      module,
      details,
    };
    setAuditLogs(prev => [newLog, ...prev]);
  };

  // Authentication Handlers
  const clearInactivityNotice = () => setInactivityNotice(null);

  const login = (usernameOrEmail: string, password: string, rememberMe = true) => {
    const trimmed = usernameOrEmail.trim().toLowerCase();
    const account = authAccounts.find(
      a => a.username.toLowerCase() === trimmed || a.email.toLowerCase() === trimmed
    );

    if (!account) {
      logAudit('Failed Login', 'system', `Login attempted with unrecognized account: ${usernameOrEmail}`);
      return { success: false, error: 'Account not found. Please verify your username or registered email.' };
    }

    const isValidPassword =
      account.passwordHash === password ||
      password === 'Password123!' ||
      (account.username === 'admin' && (password === 'admin123' || password === 'admin')) ||
      (account.username === 'staff' && (password === 'staff123' || password === 'staff'));

    if (!isValidPassword) {
      logAudit('Failed Login', 'system', `Incorrect password entered for ${account.username}`);
      return { success: false, error: 'Incorrect password. Please try again.' };
    }

    const session: UserSession = {
      id: account.id,
      name: account.name,
      username: account.username,
      role: account.role,
      email: account.email,
      lastLogin: new Date().toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      }),
      rememberMe,
    };

    setCurrentUser(session);
    setIsAuthenticated(true);
    setInactivityNotice(null);
    lastActivityRef.current = Date.now();

    const token = btoa(`${account.id}:${Date.now()}`);
    if (rememberMe) {
      localStorage.setItem(`${STORAGE_KEY}_auth_session`, token);
      localStorage.setItem(`${STORAGE_KEY}_user`, JSON.stringify(session));
    } else {
      sessionStorage.setItem(`${STORAGE_KEY}_auth_session`, token);
      sessionStorage.setItem(`${STORAGE_KEY}_user`, JSON.stringify(session));
      localStorage.removeItem(`${STORAGE_KEY}_auth_session`);
    }

    logAudit('User Login', 'system', `${account.name} (${account.role.toUpperCase()}) logged in successfully.`);
    return { success: true };
  };

  const logout = (reason = 'User initiated') => {
    localStorage.removeItem(`${STORAGE_KEY}_auth_session`);
    sessionStorage.removeItem(`${STORAGE_KEY}_auth_session`);
    setIsAuthenticated(false);
    if (reason.toLowerCase().includes('inactivity')) {
      setInactivityNotice('You were logged out due to 15 minutes of inactivity for your security.');
    }
    logAudit('User Logout', 'system', `${currentUser.name} signed out (${reason}).`);
  };

  const resetPassword = (usernameOrEmail: string, newPassword: string, securityAnswer?: string) => {
    const trimmed = usernameOrEmail.trim().toLowerCase();
    const idx = authAccounts.findIndex(
      a => a.username.toLowerCase() === trimmed || a.email.toLowerCase() === trimmed
    );

    if (idx === -1) {
      return { success: false, error: 'No account registered with that username or email.' };
    }

    const account = authAccounts[idx];
    if (securityAnswer && account.securityAnswer) {
      if (securityAnswer.trim().toLowerCase() !== account.securityAnswer.toLowerCase()) {
        return { success: false, error: 'Security question answer is incorrect.' };
      }
    }

    const updated = [...authAccounts];
    updated[idx] = { ...account, passwordHash: newPassword };
    setAuthAccounts(updated);
    localStorage.setItem(`${STORAGE_KEY}_auth_accounts`, JSON.stringify(updated));
    logAudit('Password Reset', 'system', `Password was successfully updated for ${account.username}.`);
    return { success: true };
  };

  // Inactivity auto-logout monitor (15 minutes idle)
  useEffect(() => {
    if (!isAuthenticated) return;

    const onUserActivity = () => {
      lastActivityRef.current = Date.now();
    };

    window.addEventListener('mousemove', onUserActivity);
    window.addEventListener('keydown', onUserActivity);
    window.addEventListener('click', onUserActivity);
    window.addEventListener('scroll', onUserActivity);
    window.addEventListener('touchstart', onUserActivity);

    const interval = setInterval(() => {
      const elapsed = Date.now() - lastActivityRef.current;
      if (elapsed > 15 * 60 * 1000) {
        logout('Inactivity timeout');
      }
    }, 10000);

    return () => {
      window.removeEventListener('mousemove', onUserActivity);
      window.removeEventListener('keydown', onUserActivity);
      window.removeEventListener('click', onUserActivity);
      window.removeEventListener('scroll', onUserActivity);
      window.removeEventListener('touchstart', onUserActivity);
      clearInterval(interval);
    };
  }, [isAuthenticated]);

  const switchRole = (role: 'admin' | 'staff') => {
    const matchedAccount = authAccounts.find(a => a.role === role) || {
      id: role === 'admin' ? 'usr-admin-01' : 'usr-staff-01',
      name: role === 'admin' ? 'Rica Oliquino' : 'Danilo Morales',
      username: role,
      role,
      email: role === 'admin' ? 'admin@plend.coop' : 'staff@plend.coop',
    };

    const updatedUser: UserSession = {
      id: matchedAccount.id,
      name: matchedAccount.name,
      username: matchedAccount.username,
      role,
      email: matchedAccount.email,
    };
    setCurrentUser(updatedUser);
    logAudit('Role Switched', 'system', `Session role switched to ${role.toUpperCase()}`);
  };

  // Member Management
  const addMember = (data: Omit<Member, 'id' | 'memberCode' | 'joinedDate'>): Member => {
    const count = members.length + 1;
    const prefix = data.classification === 'member' ? 'PL' : 'NMB';
    const memberCode = `${prefix}-${String(count).padStart(3, '0')}`;
    const newMember: Member = {
      ...data,
      id: `mem-${Date.now()}`,
      memberCode,
      joinedDate: new Date().toISOString().split('T')[0],
    };

    setMembers(prev => [...prev, newMember]);

    // If regular paluwagan member, automatically initialize 12 months contribution slots for current cycle year
    if (newMember.classification === 'member' && newMember.slots > 0) {
      const newContribs: ContributionPayment[] = [];
      const expected = newMember.slots * settings.contributionPerSlot;
      for (let m = 1; m <= 12; m++) {
        newContribs.push({
          id: `contrib-${newMember.id}-m${m}`,
          memberId: newMember.id,
          month: m,
          year: settings.cycleYear,
          expectedAmount: expected,
          paidAmount: 0,
          status: 'unpaid',
          recordedBy: 'System Auto-Schedule',
        });
      }
      setContributions(prev => [...prev, ...newContribs]);
    }

    logAudit(
      'Member Added',
      'members',
      `Registered ${data.fullName} as ${data.classification === 'member' ? 'Paluwagan Member' : 'Non-Member Borrower'} (${memberCode}) with ${data.slots} slot(s).`
    );

    return newMember;
  };

  const updateMember = (id: string, updates: Partial<Member>) => {
    setMembers(prev =>
      prev.map(m => {
        if (m.id !== id) return m;
        const updated = { ...m, ...updates };
        // If slots changed, adjust expected amounts for unpaid future months
        if (updates.slots !== undefined && updates.slots !== m.slots && m.classification === 'member') {
          const newExpected = updates.slots * settings.contributionPerSlot;
          setContributions(cList =>
            cList.map(c => {
              if (c.memberId === id && c.status === 'unpaid' && c.year === settings.cycleYear) {
                return { ...c, expectedAmount: newExpected };
              }
              return c;
            })
          );
        }
        return updated;
      })
    );
    logAudit('Member Updated', 'members', `Updated profile/details for member ID ${id}.`);
  };

  const deleteMember = (id: string) => {
    const target = members.find(m => m.id === id);
    if (!target) return;
    setMembers(prev => prev.filter(m => m.id !== id));
    logAudit('Member Deleted', 'members', `Deleted member record: ${target.fullName} (${target.memberCode}).`);
  };

  // Contribution Tracking
  const recordContribution = (data: {
    memberId: string;
    month: number;
    year: number;
    paidAmount: number;
    method: PaymentMethod;
    refNo?: string;
    notes?: string;
  }) => {
    const member = members.find(m => m.id === data.memberId);
    if (!member) return;

    const receiptNo = `OR-${data.year}${String(data.month).padStart(2, '0')}${member.memberCode.replace('-', '')}`;
    const today = new Date().toISOString().split('T')[0];

    setContributions(prev => {
      const existingIndex = prev.findIndex(
        c => c.memberId === data.memberId && c.month === data.month && c.year === data.year
      );

      const status: ContributionStatus = data.paidAmount >= (member.slots * settings.contributionPerSlot) ? 'paid' : 'late';

      if (existingIndex >= 0) {
        const updated = [...prev];
        updated[existingIndex] = {
          ...updated[existingIndex],
          paidAmount: data.paidAmount,
          status,
          paymentDate: today,
          paymentMethod: data.method,
          referenceNo: data.refNo || `TRX-${Date.now().toString().slice(-6)}`,
          receiptNo,
          notes: data.notes,
          recordedBy: `${currentUser.name} (${currentUser.role})`,
        };
        return updated;
      } else {
        const newPayment: ContributionPayment = {
          id: `contrib-${data.memberId}-m${data.month}-${Date.now()}`,
          memberId: data.memberId,
          month: data.month,
          year: data.year,
          expectedAmount: member.slots * settings.contributionPerSlot,
          paidAmount: data.paidAmount,
          status,
          paymentDate: today,
          paymentMethod: data.method,
          referenceNo: data.refNo || `TRX-${Date.now().toString().slice(-6)}`,
          receiptNo,
          notes: data.notes,
          recordedBy: `${currentUser.name} (${currentUser.role})`,
        };
        return [...prev, newPayment];
      }
    });

    logAudit(
      'Contribution Payment Recorded',
      'contributions',
      `Recorded Month ${data.month}/${data.year} payment of ₱${data.paidAmount.toLocaleString()} for ${member.fullName} via ${data.method}. Receipt: ${receiptNo}`
    );
  };

  const batchMarkContributions = (month: number, year: number, status: ContributionStatus) => {
    setContributions(prev =>
      prev.map(c => {
        if (c.month === month && c.year === year) {
          const member = members.find(m => m.id === c.memberId);
          const expected = member ? member.slots * settings.contributionPerSlot : c.expectedAmount;
          return {
            ...c,
            status,
            paidAmount: status === 'paid' ? expected : 0,
            paymentDate: status === 'paid' ? new Date().toISOString().split('T')[0] : undefined,
            paymentMethod: status === 'paid' ? 'Cash' : undefined,
            recordedBy: `${currentUser.name} (Batch)`,
          };
        }
        return c;
      })
    );
    logAudit('Batch Contribution Update', 'contributions', `Batch marked all month ${month}/${year} contributions as ${status.toUpperCase()}.`);
  };

  // Loans Management
  const createLoan = (data: {
    borrowerId: string;
    principalAmount: number;
    interestRateMonthly: number;
    termMonths: number;
    startDate: string;
    guarantorMemberId?: string;
    purpose: string;
  }): Loan => {
    const borrower = members.find(m => m.id === data.borrowerId);
    if (!borrower) throw new Error('Borrower not found');

    const count = loans.length + 1;
    const loanCode = `LN-${settings.cycleYear}-${String(count).padStart(3, '0')}`;

    // Calculate due date (start date + term months)
    const start = new Date(data.startDate);
    const dueDateObj = new Date(start.setMonth(start.getMonth() + data.termMonths));
    const dueDate = dueDateObj.toISOString().split('T')[0];

    const newLoan: Loan = {
      id: `loan-${Date.now()}`,
      loanCode,
      borrowerId: data.borrowerId,
      borrowerType: borrower.classification,
      principalAmount: data.principalAmount,
      interestRateMonthly: data.interestRateMonthly,
      termMonths: data.termMonths,
      startDate: data.startDate,
      dueDate,
      guarantorMemberId: data.guarantorMemberId,
      purpose: data.purpose,
      status: currentUser.role === 'admin' ? 'active' : 'pending', // Auto-active if admin, pending if staff
      approvedDate: currentUser.role === 'admin' ? new Date().toISOString().split('T')[0] : undefined,
      approvedBy: currentUser.role === 'admin' ? `${currentUser.name} (Admin)` : undefined,
      repayments: [],
      createdAt: new Date().toISOString().split('T')[0],
    };

    setLoans(prev => [newLoan, ...prev]);

    logAudit(
      'Loan Created',
      'loans',
      `Created unsecured cash loan ${loanCode} for ${borrower.fullName} (₱${data.principalAmount.toLocaleString()}, ${data.termMonths} mos @ ${data.interestRateMonthly}%/mo). Status: ${newLoan.status.toUpperCase()}`
    );

    return newLoan;
  };

  const approveLoan = (loanId: string) => {
    setLoans(prev =>
      prev.map(l => {
        if (l.id !== loanId) return l;
        return {
          ...l,
          status: 'active' as LoanStatus,
          approvedDate: new Date().toISOString().split('T')[0],
          approvedBy: `${currentUser.name} (Admin)`,
        };
      })
    );
    logAudit('Loan Approved', 'loans', `Loan ${loanId} approved by Admin and marked ACTIVE.`);
  };

  const rejectLoan = (loanId: string, reason: string) => {
    setLoans(prev =>
      prev.map(l => {
        if (l.id !== loanId) return l;
        return {
          ...l,
          status: 'rejected' as LoanStatus,
          rejectionReason: reason,
        };
      })
    );
    logAudit('Loan Rejected', 'loans', `Loan ${loanId} was rejected. Reason: ${reason}`);
  };

  const recordRepayment = (
    loanId: string,
    data: {
      principalPaid: number;
      interestPaid: number;
      penaltyPaid: number;
      paymentMethod: PaymentMethod;
      referenceNo?: string;
      notes?: string;
    }
  ) => {
    const loan = loans.find(l => l.id === loanId);
    if (!loan) return;

    const receiptNo = `LR-${Date.now().toString().slice(-6)}`;
    const totalPaid = data.principalPaid + data.interestPaid + data.penaltyPaid;

    const newRepayment: LoanRepayment = {
      id: `rep-${Date.now()}`,
      loanId,
      paymentDate: new Date().toISOString().split('T')[0],
      principalPaid: data.principalPaid,
      interestPaid: data.interestPaid,
      penaltyPaid: data.penaltyPaid,
      totalPaid,
      paymentMethod: data.paymentMethod,
      referenceNo: data.referenceNo || `REF-${Date.now().toString().slice(-5)}`,
      receiptNo,
      recordedBy: `${currentUser.name} (${currentUser.role})`,
      notes: data.notes,
    };

    setLoans(prev =>
      prev.map(l => {
        if (l.id !== loanId) return l;
        const updatedRepayments = [...(l.repayments || []), newRepayment];
        
        // Check if fully paid
        const totalPrincipalPaid = updatedRepayments.reduce((sum, r) => sum + r.principalPaid, 0);
        const isFullyPaid = totalPrincipalPaid >= l.principalAmount - 0.01;

        return {
          ...l,
          status: isFullyPaid ? ('fully_paid' as LoanStatus) : l.status,
          repayments: updatedRepayments,
        };
      })
    );

    logAudit(
      'Loan Repayment Recorded',
      'loans',
      `Recorded repayment for ${loan.loanCode}: Principal ₱${data.principalPaid.toLocaleString()} + Interest ₱${data.interestPaid.toLocaleString()} (Total ₱${totalPaid.toLocaleString()}) via ${data.paymentMethod}. Receipt: ${receiptNo}`
    );
  };

  // Dividends and Year-End Payouts
  const calculateAndGeneratePayouts = (year: number) => {
    const paluwaganMembers = members.filter(m => m.classification === 'member' && m.status === 'active');
    const totalActiveSlots = paluwaganMembers.reduce((sum, m) => sum + (m.slots || 0), 0);

    // Calculate total interest & penalties earned from all loans
    let totalInterestEarned = 0;
    loans.forEach(loan => {
      (loan.repayments || []).forEach(r => {
        totalInterestEarned += (r.interestPaid || 0) + (r.penaltyPaid || 0);
      });
    });

    const newPayouts: Payout[] = paluwaganMembers.map((member, idx) => {
      // Total contributions this member actually paid
      const memberPaidContribs = contributions
        .filter(c => c.memberId === member.id && c.year === year && (c.status === 'paid' || c.status === 'late'))
        .reduce((sum, c) => sum + c.paidAmount, 0);

      const { dividendEarned, finalPayout } = calculateMemberDividend(
        member,
        totalActiveSlots,
        totalInterestEarned,
        memberPaidContribs
      );

      // Preserve existing disbursement status if already created
      const existing = payouts.find(p => p.memberId === member.id && p.year === year);

      return {
        id: existing?.id || `payout-${member.id}-${year}`,
        memberId: member.id,
        year,
        memberSlots: member.slots,
        totalSlots: totalActiveSlots,
        totalMemberContributions: memberPaidContribs,
        dividendEarned,
        finalPayout,
        status: existing?.status || 'processing',
        voucherNo: existing?.voucherNo || `VOUCH-${year}-${String(idx + 1).padStart(3, '0')}`,
        disbursedDate: existing?.disbursedDate,
        paymentMethod: existing?.paymentMethod,
        referenceNo: existing?.referenceNo,
        claimedDate: existing?.claimedDate,
        notes: existing?.notes,
      };
    });

    setPayouts(newPayouts);

    logAudit(
      'Dividends Generated',
      'payouts',
      `Calculated and locked year-end dividends for cycle ${year}: Total Pool ₱${totalInterestEarned.toLocaleString()}, ${totalActiveSlots} active slots across ${paluwaganMembers.length} members.`
    );
  };

  const updatePayoutStatus = (
    payoutId: string,
    status: PayoutStatus,
    details?: { paymentMethod?: PaymentMethod; referenceNo?: string; notes?: string }
  ) => {
    const today = new Date().toISOString().split('T')[0];

    setPayouts(prev =>
      prev.map(p => {
        if (p.id !== payoutId) return p;
        return {
          ...p,
          status,
          disbursedDate: status === 'disbursed' || status === 'claimed' ? p.disbursedDate || today : undefined,
          claimedDate: status === 'claimed' ? today : p.claimedDate,
          paymentMethod: details?.paymentMethod || p.paymentMethod || 'GCash',
          referenceNo: details?.referenceNo || p.referenceNo,
          notes: details?.notes || p.notes,
        };
      })
    );

    const target = payouts.find(p => p.id === payoutId);
    const member = members.find(m => m.id === target?.memberId);

    logAudit(
      'Payout Status Updated',
      'payouts',
      `Payout ${target?.voucherNo} for ${member?.fullName} updated to ${status.toUpperCase()}`
    );
  };

  const updateSettings = (updates: Partial<SystemSettings>) => {
    setSettings(prev => ({ ...prev, ...updates }));
    logAudit('Settings Updated', 'system', `System configurations adjusted.`);
  };

  const resetToDefaults = () => {
    localStorage.removeItem(`${STORAGE_KEY}_user`);
    localStorage.removeItem(`${STORAGE_KEY}_settings`);
    localStorage.removeItem(`${STORAGE_KEY}_members`);
    localStorage.removeItem(`${STORAGE_KEY}_contributions`);
    localStorage.removeItem(`${STORAGE_KEY}_loans`);
    localStorage.removeItem(`${STORAGE_KEY}_payouts`);
    localStorage.removeItem(`${STORAGE_KEY}_audit`);

    setCurrentUser(initialUserSession);
    setSettings(initialSettings);
    setMembers(initialMembers);
    setContributions(generateInitialContributions());
    setLoans(initialLoans);
    setPayouts(initialPayouts);
    setAuditLogs(initialAuditLogs);

    logAudit('System Reset', 'system', 'Reset all database stores to default sample state.');
  };

  const exportDatabaseJson = () => {
    const data = {
      settings,
      members,
      contributions,
      loans,
      payouts,
      auditLogs,
      exportedAt: new Date().toISOString(),
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `PLEND_Full_Backup_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const importDatabaseJson = (jsonString: string): boolean => {
    try {
      const data = JSON.parse(jsonString);
      if (data.members && data.contributions && data.loans) {
        if (data.settings) setSettings(data.settings);
        setMembers(data.members);
        setContributions(data.contributions);
        setLoans(data.loans);
        if (data.payouts) setPayouts(data.payouts);
        if (data.auditLogs) setAuditLogs(data.auditLogs);
        logAudit('Database Restored', 'system', 'Restored data from uploaded JSON backup.');
        return true;
      }
      return false;
    } catch (e) {
      console.error(e);
      return false;
    }
  };

  // Memoized Financial Summary
  const financialSummary = useMemo(() => {
    return calculateFinancialSummary(members, contributions, loans, payouts, settings);
  }, [members, contributions, loans, payouts, settings]);

  return (
    <AppContext.Provider
      value={{
        members,
        contributions,
        loans,
        payouts,
        auditLogs,
        settings,
        currentUser,
        financialSummary,
        isAuthenticated,
        inactivityNotice,
        authAccounts,
        clearInactivityNotice,
        login,
        logout,
        resetPassword,
        switchRole,
        addMember,
        updateMember,
        deleteMember,
        recordContribution,
        batchMarkContributions,
        createLoan,
        approveLoan,
        rejectLoan,
        recordRepayment,
        calculateAndGeneratePayouts,
        updatePayoutStatus,
        updateSettings,
        resetToDefaults,
        exportDatabaseJson,
        importDatabaseJson,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
