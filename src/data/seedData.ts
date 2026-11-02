import {
  AuditLog,
  AuthAccount,
  ContributionPayment,
  Loan,
  Member,
  Payout,
  SystemSettings,
  UserSession,
} from '../types';

export const initialSettings: SystemSettings = {
  orgName: 'PLEND – Paluwagan & Lending Circle',
  cycleYear: 2026,
  contributionPerSlot: 1000,
  defaultMemberInterestRate: 3.0, // 3% monthly
  defaultNonMemberInterestRate: 5.0, // 5% monthly
  penaltyPerMonthLate: 50,
  payoutMonth: 12,
  currencySymbol: '₱',
};

export const initialAuthAccounts: AuthAccount[] = [
  {
    id: 'usr-admin-01',
    username: 'admin',
    email: 'admin@plend.coop',
    name: 'Rica Oliquino',
    role: 'admin',
    passwordHash: 'Password123!',
    securityQuestion: 'What is the name of your cooperative system?',
    securityAnswer: 'plend',
  },
  {
    id: 'usr-staff-01',
    username: 'staff',
    email: 'staff@plend.coop',
    name: 'Danilo Morales',
    role: 'staff',
    passwordHash: 'Password123!',
    securityQuestion: 'What city is PLEND based in?',
    securityAnswer: 'pasig',
  },
];

export const initialUserSession: UserSession = {
  id: 'usr-admin-01',
  name: 'Rica Oliquino',
  username: 'admin',
  role: 'admin',
  email: 'admin@plend.coop',
  lastLogin: '2026-11-01 09:00 AM',
  rememberMe: true,
};

export const initialMembers: Member[] = [
  {
    id: 'mem-001',
    memberCode: 'PL-001',
    fullName: 'Maria Elena Santos',
    email: 'maria.santos@gmail.com',
    phone: '+63 917 823 4410',
    address: 'Block 4 Lot 12, San Antonio, Pasig City',
    classification: 'member',
    slots: 2,
    joinedDate: '2026-01-05',
    paymentDetails: {
      method: 'GCash',
      accountName: 'Maria Elena Santos',
      accountNumber: '09178234410',
    },
    status: 'active',
    notes: 'Founding Paluwagan member. Excellent payment history.',
  },
  {
    id: 'mem-002',
    memberCode: 'PL-002',
    fullName: 'Juan Carlo Dela Cruz',
    email: 'juan.delacruz@yahoo.com',
    phone: '+63 928 554 1192',
    address: '142 Rizal St., Mandaluyong City',
    classification: 'member',
    slots: 3,
    joinedDate: '2026-01-05',
    paymentDetails: {
      method: 'Bank Transfer',
      bankName: 'BDO Unibank',
      accountName: 'Juan Carlo Dela Cruz',
      accountNumber: '0041 8820 9132',
    },
    status: 'active',
    notes: 'Hardware store owner. 3 slots contributor.',
  },
  {
    id: 'mem-003',
    memberCode: 'PL-003',
    fullName: 'Carmela Joy Reyes',
    email: 'carmela.reyes@outlook.com',
    phone: '+63 905 442 8819',
    address: 'Unit 302 Greenview Residences, Quezon City',
    classification: 'member',
    slots: 1,
    joinedDate: '2026-01-08',
    paymentDetails: {
      method: 'GCash',
      accountName: 'Carmela Reyes',
      accountNumber: '09054428819',
    },
    status: 'active',
    notes: 'High school teacher, prompt payer.',
  },
  {
    id: 'mem-004',
    memberCode: 'PL-004',
    fullName: 'Benjamin Tan Jr.',
    email: 'benjamin.tan@gmail.com',
    phone: '+63 918 332 9901',
    address: '77 Jupiter St., Makati City',
    classification: 'member',
    slots: 2,
    joinedDate: '2026-01-10',
    paymentDetails: {
      method: 'Bank Transfer',
      bankName: 'BPI',
      accountName: 'Benjamin Tan Jr.',
      accountNumber: '2849 1044 02',
    },
    status: 'active',
    notes: 'Bakery supplier and loan borrower.',
  },
  {
    id: 'mem-005',
    memberCode: 'PL-005',
    fullName: 'Annalyn D. Bautista',
    email: 'annalyn.bautista@gmail.com',
    phone: '+63 927 619 4402',
    address: 'Phase 2 Maybunga, Pasig City',
    classification: 'member',
    slots: 1,
    joinedDate: '2026-01-12',
    paymentDetails: {
      method: 'GCash',
      accountName: 'Annalyn Bautista',
      accountNumber: '09276194402',
    },
    status: 'active',
    notes: 'Sari-sari store entrepreneur.',
  },
  {
    id: 'mem-006',
    memberCode: 'PL-006',
    fullName: 'Eduardo M. Morales',
    email: 'eduardo.morales@gmail.com',
    phone: '+63 915 722 8831',
    address: '28 Pinaglabanan, San Juan City',
    classification: 'member',
    slots: 2,
    joinedDate: '2026-01-15',
    paymentDetails: {
      method: 'Cash',
      accountName: 'Eduardo Morales',
    },
    status: 'active',
    notes: 'Over-the-counter cash remitter.',
  },
  {
    id: 'mem-007',
    memberCode: 'PL-007',
    fullName: 'Patricia Anne Lim',
    email: 'patricia.lim@gmail.com',
    phone: '+63 919 401 2290',
    address: '88 Mabini St., Taguig City',
    classification: 'member',
    slots: 3,
    joinedDate: '2026-01-18',
    paymentDetails: {
      method: 'Bank Transfer',
      bankName: 'UnionBank',
      accountName: 'Patricia Anne Lim',
      accountNumber: '1094 8831 2291',
    },
    status: 'active',
    notes: 'E-commerce seller, holding 3 slots.',
  },
  {
    id: 'mem-008',
    memberCode: 'PL-008',
    fullName: 'Roberto Silva',
    email: 'roberto.silva@gmail.com',
    phone: '+63 908 199 5543',
    address: '15 Diamond St., Marikina City',
    classification: 'member',
    slots: 1,
    joinedDate: '2026-02-01',
    paymentDetails: {
      method: 'GCash',
      accountName: 'Roberto Silva',
      accountNumber: '09081995543',
    },
    status: 'active',
  },
  {
    id: 'mem-009',
    memberCode: 'PL-009',
    fullName: 'Kristine Mae Garcia',
    email: 'kristine.garcia@gmail.com',
    phone: '+63 917 551 9022',
    address: '34 Kalayaan Ave, Quezon City',
    classification: 'member',
    slots: 2,
    joinedDate: '2026-02-05',
    paymentDetails: {
      method: 'GCash',
      accountName: 'Kristine Mae Garcia',
      accountNumber: '09175519022',
    },
    status: 'active',
  },
  {
    id: 'mem-010',
    memberCode: 'PL-010',
    fullName: 'Dexter James Navarro',
    email: 'dexter.navarro@gmail.com',
    phone: '+63 922 884 1033',
    address: 'Unit 12 Sunshine Townhomes, Pasig City',
    classification: 'member',
    slots: 1,
    joinedDate: '2026-02-10',
    paymentDetails: {
      method: 'Bank Transfer',
      bankName: 'BPI',
      accountName: 'Dexter James Navarro',
      accountNumber: '3310 9942 11',
    },
    status: 'active',
  },
  // Non-member borrowers
  {
    id: 'mem-011',
    memberCode: 'NMB-001',
    fullName: 'Rodrigo "Digs" Alcantara',
    email: 'rodrigo.alcantara@gmail.com',
    phone: '+63 917 992 4110',
    address: 'Barangay Kapitolyo, Pasig City',
    classification: 'non_member_borrower',
    slots: 0,
    joinedDate: '2026-03-01',
    paymentDetails: {
      method: 'GCash',
      accountName: 'Rodrigo Alcantara',
      accountNumber: '09179924110',
    },
    status: 'active',
    notes: 'Non-member borrower. Co-maker: Maria Elena Santos (PL-001).',
  },
  {
    id: 'mem-012',
    memberCode: 'NMB-002',
    fullName: 'Leonora M. Vicente',
    email: 'leonora.vicente@gmail.com',
    phone: '+63 928 331 7740',
    address: 'Cainta, Rizal',
    classification: 'non_member_borrower',
    slots: 0,
    joinedDate: '2026-04-15',
    paymentDetails: {
      method: 'Bank Transfer',
      bankName: 'Metrobank',
      accountName: 'Leonora Vicente',
      accountNumber: '5520 1993 0041',
    },
    status: 'active',
    notes: 'Non-member borrower with jewelry collateral (18K gold ring valued at ₱35,000).',
  },
];

// Generate initial contributions for 2026
// Total 10 paluwagan members with 18 total slots
// Slots: 2 + 3 + 1 + 2 + 1 + 2 + 3 + 1 + 2 + 1 = 18 slots
// Monthly expected collection = 18 * ₱1000 = ₱18,000/month
export const generateInitialContributions = (): ContributionPayment[] => {
  const contributions: ContributionPayment[] = [];
  const currentMonth = 11; // November 2026

  initialMembers.forEach((member) => {
    if (member.classification !== 'member' || member.slots <= 0) return;

    const expected = member.slots * 1000;

    for (let month = 1; month <= 12; month++) {
      const id = `contrib-${member.id}-m${month}`;

      if (month < currentMonth) {
        // Past months: Mostly paid, occasional late
        const isLate = (month === 4 && member.id === 'mem-006') || (month === 7 && member.id === 'mem-008');
        contributions.push({
          id,
          memberId: member.id,
          month,
          year: 2026,
          expectedAmount: expected,
          paidAmount: expected,
          status: isLate ? 'late' : 'paid',
          paymentDate: `2026-${String(month).padStart(2, '0')}-${isLate ? '22' : '05'}`,
          paymentMethod: member.paymentDetails.method,
          referenceNo: `REF-2026${String(month).padStart(2, '0')}-${member.memberCode}`,
          receiptNo: `OR-26${String(month).padStart(2, '0')}${member.memberCode.replace('-', '')}`,
          recordedBy: 'Rica Oliquino (Admin)',
        });
      } else if (month === currentMonth) {
        // November 2026 (Current month): Mix of paid, unpaid, and late
        if (member.id === 'mem-001' || member.id === 'mem-002' || member.id === 'mem-003' || member.id === 'mem-007') {
          contributions.push({
            id,
            memberId: member.id,
            month,
            year: 2026,
            expectedAmount: expected,
            paidAmount: expected,
            status: 'paid',
            paymentDate: '2026-11-01',
            paymentMethod: member.paymentDetails.method,
            referenceNo: `REF-202611-${member.memberCode}`,
            receiptNo: `OR-2611${member.memberCode.replace('-', '')}`,
            recordedBy: 'Rica Oliquino (Admin)',
          });
        } else if (member.id === 'mem-004' || member.id === 'mem-005') {
          contributions.push({
            id,
            memberId: member.id,
            month,
            year: 2026,
            expectedAmount: expected,
            paidAmount: 0,
            status: 'unpaid',
            recordedBy: 'System Schedule',
          });
        } else {
          contributions.push({
            id,
            memberId: member.id,
            month,
            year: 2026,
            expectedAmount: expected,
            paidAmount: 0,
            status: 'unpaid',
            recordedBy: 'System Schedule',
          });
        }
      } else {
        // December (future): Scheduled unpaid
        contributions.push({
          id,
          memberId: member.id,
          month,
          year: 2026,
          expectedAmount: expected,
          paidAmount: 0,
          status: 'unpaid',
          recordedBy: 'System Schedule',
        });
      }
    }
  });

  return contributions;
};

export const initialLoans: Loan[] = [
  {
    id: 'loan-001',
    loanCode: 'LN-2026-001',
    borrowerId: 'mem-004', // Benjamin Tan Jr. (Member)
    borrowerType: 'member',
    principalAmount: 25000,
    interestRateMonthly: 3.0, // 3% per month
    termMonths: 4,
    startDate: '2026-02-15',
    dueDate: '2026-06-15',
    guarantorMemberId: 'mem-002', // Juan Dela Cruz
    purpose: 'Bakery ingredient wholesale bulk purchase',
    status: 'fully_paid',
    approvedDate: '2026-02-14',
    approvedBy: 'Rica Oliquino (Admin)',
    createdAt: '2026-02-12',
    repayments: [
      {
        id: 'rep-001-1',
        loanId: 'loan-001',
        paymentDate: '2026-03-15',
        principalPaid: 6250,
        interestPaid: 750, // 25,000 * 3%
        penaltyPaid: 0,
        totalPaid: 7000,
        paymentMethod: 'Bank Transfer',
        referenceNo: 'BPI-TRX-994012',
        receiptNo: 'LR-202603-01',
        recordedBy: 'Rica Oliquino',
      },
      {
        id: 'rep-001-2',
        loanId: 'loan-001',
        paymentDate: '2026-04-15',
        principalPaid: 6250,
        interestPaid: 562.5, // 18,750 * 3%
        penaltyPaid: 0,
        totalPaid: 6812.5,
        paymentMethod: 'Bank Transfer',
        referenceNo: 'BPI-TRX-998811',
        receiptNo: 'LR-202604-01',
        recordedBy: 'Rica Oliquino',
      },
      {
        id: 'rep-001-3',
        loanId: 'loan-001',
        paymentDate: '2026-05-15',
        principalPaid: 6250,
        interestPaid: 375, // 12,500 * 3%
        penaltyPaid: 0,
        totalPaid: 6625,
        paymentMethod: 'Bank Transfer',
        referenceNo: 'BPI-TRX-100234',
        receiptNo: 'LR-202605-01',
        recordedBy: 'Rica Oliquino',
      },
      {
        id: 'rep-001-4',
        loanId: 'loan-001',
        paymentDate: '2026-06-14',
        principalPaid: 6250,
        interestPaid: 187.5, // 6,250 * 3%
        penaltyPaid: 0,
        totalPaid: 6437.5,
        paymentMethod: 'Bank Transfer',
        referenceNo: 'BPI-TRX-101902',
        receiptNo: 'LR-202606-01',
        recordedBy: 'Rica Oliquino',
      },
    ],
  },
  {
    id: 'loan-002',
    loanCode: 'LN-2026-002',
    borrowerId: 'mem-011', // Rodrigo Alcantara (Non-member)
    borrowerType: 'non_member_borrower',
    principalAmount: 30000,
    interestRateMonthly: 5.0, // 5% per month for non-member
    termMonths: 6,
    startDate: '2026-05-01',
    dueDate: '2026-11-01',
    guarantorMemberId: 'mem-001', // Maria Elena Santos
    purpose: 'Transport service maintenance & tire replacement',
    status: 'active',
    approvedDate: '2026-04-30',
    approvedBy: 'Rica Oliquino (Admin)',
    createdAt: '2026-04-28',
    repayments: [
      {
        id: 'rep-002-1',
        loanId: 'loan-002',
        paymentDate: '2026-06-01',
        principalPaid: 5000,
        interestPaid: 1500, // 30,000 * 5%
        penaltyPaid: 0,
        totalPaid: 6500,
        paymentMethod: 'GCash',
        referenceNo: 'GCASH-991044',
        receiptNo: 'LR-202606-02',
        recordedBy: 'Rica Oliquino',
      },
      {
        id: 'rep-002-2',
        loanId: 'loan-002',
        paymentDate: '2026-07-01',
        principalPaid: 5000,
        interestPaid: 1250, // 25,000 * 5%
        penaltyPaid: 0,
        totalPaid: 6250,
        paymentMethod: 'GCash',
        referenceNo: 'GCASH-998823',
        receiptNo: 'LR-202607-02',
        recordedBy: 'Rica Oliquino',
      },
      {
        id: 'rep-002-3',
        loanId: 'loan-002',
        paymentDate: '2026-08-01',
        principalPaid: 5000,
        interestPaid: 1000, // 20,000 * 5%
        penaltyPaid: 0,
        totalPaid: 6000,
        paymentMethod: 'GCash',
        referenceNo: 'GCASH-100291',
        receiptNo: 'LR-202608-02',
        recordedBy: 'Rica Oliquino',
      },
      {
        id: 'rep-002-4',
        loanId: 'loan-002',
        paymentDate: '2026-09-02',
        principalPaid: 5000,
        interestPaid: 750, // 15,000 * 5%
        penaltyPaid: 0,
        totalPaid: 5750,
        paymentMethod: 'GCash',
        referenceNo: 'GCASH-101183',
        receiptNo: 'LR-202609-02',
        recordedBy: 'Rica Oliquino',
      },
      {
        id: 'rep-002-5',
        loanId: 'loan-002',
        paymentDate: '2026-10-02',
        principalPaid: 5000,
        interestPaid: 500, // 10,000 * 5%
        penaltyPaid: 0,
        totalPaid: 5500,
        paymentMethod: 'GCash',
        referenceNo: 'GCASH-103390',
        receiptNo: 'LR-202610-02',
        recordedBy: 'Rica Oliquino',
      },
    ],
  },
  {
    id: 'loan-003',
    loanCode: 'LN-2026-003',
    borrowerId: 'mem-005', // Annalyn Bautista (Member)
    borrowerType: 'member',
    principalAmount: 15000,
    interestRateMonthly: 3.0,
    termMonths: 3,
    startDate: '2026-07-15',
    dueDate: '2026-10-15', // Past due!
    guarantorMemberId: 'mem-001',
    purpose: 'Store seasonal inventory restocking',
    status: 'overdue',
    approvedDate: '2026-07-14',
    approvedBy: 'Rica Oliquino (Admin)',
    createdAt: '2026-07-10',
    repayments: [
      {
        id: 'rep-003-1',
        loanId: 'loan-003',
        paymentDate: '2026-08-15',
        principalPaid: 5000,
        interestPaid: 450,
        penaltyPaid: 0,
        totalPaid: 5450,
        paymentMethod: 'GCash',
        referenceNo: 'GC-88401',
        receiptNo: 'LR-202608-05',
        recordedBy: 'Rica Oliquino',
      },
      {
        id: 'rep-003-2',
        loanId: 'loan-003',
        paymentDate: '2026-09-15',
        principalPaid: 5000,
        interestPaid: 300,
        penaltyPaid: 0,
        totalPaid: 5300,
        paymentMethod: 'GCash',
        referenceNo: 'GC-89022',
        receiptNo: 'LR-202609-05',
        recordedBy: 'Rica Oliquino',
      },
    ],
  },
  {
    id: 'loan-004',
    loanCode: 'LN-2026-004',
    borrowerId: 'mem-007', // Patricia Anne Lim (Member)
    borrowerType: 'member',
    principalAmount: 40000,
    interestRateMonthly: 3.0,
    termMonths: 4,
    startDate: '2026-09-10',
    dueDate: '2027-01-10',
    guarantorMemberId: 'mem-004',
    purpose: 'Holiday inventory warehouse advance',
    status: 'active',
    approvedDate: '2026-09-09',
    approvedBy: 'Rica Oliquino (Admin)',
    createdAt: '2026-09-08',
    repayments: [
      {
        id: 'rep-004-1',
        loanId: 'loan-004',
        paymentDate: '2026-10-10',
        principalPaid: 10000,
        interestPaid: 1200, // 40,000 * 3%
        penaltyPaid: 0,
        totalPaid: 11200,
        paymentMethod: 'Bank Transfer',
        referenceNo: 'UBP-TRX-330129',
        receiptNo: 'LR-202610-07',
        recordedBy: 'Rica Oliquino',
      },
    ],
  },
  {
    id: 'loan-005',
    loanCode: 'LN-2026-005',
    borrowerId: 'mem-012', // Leonora Vicente (Non-member)
    borrowerType: 'non_member_borrower',
    principalAmount: 20000,
    interestRateMonthly: 5.0,
    termMonths: 3,
    startDate: '2026-11-05',
    dueDate: '2027-02-05',
    guarantorMemberId: 'mem-003', // Carmela Reyes
    purpose: 'Medical emergency and hospitalization expense',
    status: 'pending',
    createdAt: '2026-10-30',
    repayments: [],
  },
];

export const initialPayouts: Payout[] = [];

export const initialAuditLogs: AuditLog[] = [
  {
    id: 'log-001',
    timestamp: '2026-11-01T08:30:00Z',
    userId: 'usr-admin-01',
    userName: 'Rica Oliquino',
    userRole: 'admin',
    action: 'Payment Recorded',
    module: 'contributions',
    details: 'Recorded November 2026 contribution of ₱2,000 for Maria Elena Santos (PL-001) via GCash.',
  },
  {
    id: 'log-002',
    timestamp: '2026-10-30T14:15:00Z',
    userId: 'usr-admin-01',
    userName: 'Rica Oliquino',
    userRole: 'admin',
    action: 'Loan Application Submitted',
    module: 'loans',
    details: 'Submitted loan LN-2026-005 for Leonora Vicente (₱20,000 at 5% monthly) pending approval.',
  },
  {
    id: 'log-003',
    timestamp: '2026-10-10T11:42:00Z',
    userId: 'usr-admin-01',
    userName: 'Rica Oliquino',
    userRole: 'admin',
    action: 'Repayment Recorded',
    module: 'loans',
    details: 'Recorded repayment for LN-2026-004: Principal ₱10,000 + Interest ₱1,200 via UnionBank.',
  },
  {
    id: 'log-004',
    timestamp: '2026-10-02T16:20:00Z',
    userId: 'usr-admin-01',
    userName: 'Rica Oliquino',
    userRole: 'admin',
    action: 'Repayment Recorded',
    module: 'loans',
    details: 'Recorded repayment for LN-2026-002: Principal ₱5,000 + Interest ₱500 via GCash.',
  },
  {
    id: 'log-005',
    timestamp: '2026-09-09T09:00:00Z',
    userId: 'usr-admin-01',
    userName: 'Rica Oliquino',
    userRole: 'admin',
    action: 'Loan Approved',
    module: 'loans',
    details: 'Approved loan LN-2026-004 for Patricia Anne Lim (₱40,000, 4 months). Disbursed capital.',
  },
];
