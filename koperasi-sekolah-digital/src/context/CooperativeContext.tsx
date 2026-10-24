import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  UserAccount,
  Member,
  WaserdaProduct,
  WaserdaTransaction,
  USPLoan,
  GoodsCredit,
  SimpananRecord,
  CashTransaction,
  CooperativeConfig,
  EmploymentStatus,
} from '../types';
import {
  INITIAL_CONFIG,
  INITIAL_USERS,
  INITIAL_MEMBERS,
  INITIAL_PRODUCTS,
  INITIAL_WASERDA_TX,
  INITIAL_USP_LOANS,
  INITIAL_CREDITS,
  INITIAL_SIMPANAN,
  INITIAL_CASH_FLOW,
} from '../data/mockData';
import { calculateUSPSchedule, calculateCreditSchedule } from '../utils/formatters';

interface CooperativeContextType {
  currentUser: UserAccount;
  setCurrentUser: (user: UserAccount) => void;
  users: UserAccount[];
  config: CooperativeConfig;
  updateConfig: (newConfig: Partial<CooperativeConfig>) => void;
  
  // Anggota
  members: Member[];
  addMember: (memberData: Omit<Member, 'id' | 'memberNo' | 'monthlyWajibAmount'>) => Member;
  updateMember: (id: string, memberData: Partial<Member>) => void;
  getMemberById: (id: string) => Member | undefined;
  
  // Waserda
  products: WaserdaProduct[];
  addProduct: (product: Omit<WaserdaProduct, 'id' | 'code'>) => void;
  updateProduct: (id: string, product: Partial<WaserdaProduct>) => void;
  deleteProduct: (id: string) => void;
  waserdaTransactions: WaserdaTransaction[];
  createWaserdaTransaction: (
    items: { product: WaserdaProduct; quantity: number }[],
    paymentMethod: 'tunai' | 'potong_gaji' | 'transfer',
    memberId?: string,
    notes?: string
  ) => WaserdaTransaction;
  
  // USP (3% Menurun)
  uspLoans: USPLoan[];
  applyUSPLoan: (
    memberId: string,
    amount: number,
    tenorMonths: number,
    purpose: string
  ) => USPLoan;
  approveUSPLoan: (loanId: string) => void;
  rejectUSPLoan: (loanId: string) => void;
  payUSPInstallment: (loanId: string, installmentNumber: number) => void;
  
  // Kredit Barang (Margin 5%)
  credits: GoodsCredit[];
  applyGoodsCredit: (
    memberId: string,
    goodsName: string,
    basePrice: number,
    tenorMonths: number,
    vendorName: string,
    goodsDescription?: string
  ) => GoodsCredit;
  approveGoodsCredit: (creditId: string) => void;
  rejectGoodsCredit: (creditId: string) => void;
  payCreditInstallment: (creditId: string, installmentNumber: number) => void;
  
  // Simpanan Wajib & Sukarela
  simpananRecords: SimpananRecord[];
  depositSimpananWajib: (memberId: string, periodMonth: string, amount?: number, notes?: string) => void;
  depositSimpananSukarela: (memberId: string, amount: number, notes?: string) => void;
  withdrawSimpananSukarela: (memberId: string, amount: number, notes?: string) => boolean;
  
  // Kas Umum
  cashTransactions: CashTransaction[];
  addManualCashTransaction: (
    type: 'in' | 'out',
    category: any,
    amount: number,
    title: string,
    description: string
  ) => void;
  getCurrentCashBalance: () => number;
  
  // Helper Anggota
  getMemberSimpananWajibTotal: (memberId: string) => number;
  getMemberSimpananSukarelaTotal: (memberId: string) => number;
  getMemberActiveLoans: (memberId: string) => USPLoan[];
  getMemberActiveCredits: (memberId: string) => GoodsCredit[];
  getMemberWaserdaHistory: (memberId: string) => WaserdaTransaction[];
  getMemberSimpananRecords: (memberId: string) => SimpananRecord[];
  
  // System Tools
  resetToDefault: () => void;
  exportDatabaseJSON: () => string;
  importDatabaseJSON: (jsonStr: string) => boolean;
}

const CooperativeContext = createContext<CooperativeContextType | undefined>(undefined);

const STORAGE_KEY = 'koperasi_sekolah_db_v2';

export const CooperativeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Load state from LocalStorage or Fallback
  const [isLoaded, setIsLoaded] = useState(false);
  const [currentUser, setCurrentUser] = useState<UserAccount>(INITIAL_USERS[0]); // default Pengelola
  const [users, setUsers] = useState<UserAccount[]>(INITIAL_USERS);
  const [config, setConfig] = useState<CooperativeConfig>(INITIAL_CONFIG);
  const [members, setMembers] = useState<Member[]>(INITIAL_MEMBERS);
  const [products, setProducts] = useState<WaserdaProduct[]>(INITIAL_PRODUCTS);
  const [waserdaTransactions, setWaserdaTransactions] = useState<WaserdaTransaction[]>(INITIAL_WASERDA_TX);
  const [uspLoans, setUspLoans] = useState<USPLoan[]>(INITIAL_USP_LOANS);
  const [credits, setCredits] = useState<GoodsCredit[]>(INITIAL_CREDITS);
  const [simpananRecords, setSimpananRecords] = useState<SimpananRecord[]>(INITIAL_SIMPANAN);
  const [cashTransactions, setCashTransactions] = useState<CashTransaction[]>(INITIAL_CASH_FLOW);

  // Initialize from LocalStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.config) setConfig(parsed.config);
        if (parsed.members) setMembers(parsed.members);
        if (parsed.products) setProducts(parsed.products);
        if (parsed.waserdaTransactions) setWaserdaTransactions(parsed.waserdaTransactions);
        if (parsed.uspLoans) setUspLoans(parsed.uspLoans);
        if (parsed.credits) setCredits(parsed.credits);
        if (parsed.simpananRecords) setSimpananRecords(parsed.simpananRecords);
        if (parsed.cashTransactions) setCashTransactions(parsed.cashTransactions);
        if (parsed.users) setUsers(parsed.users);
      }
    } catch (e) {
      console.error('Failed to load local storage state:', e);
    }
    setIsLoaded(true);
  }, []);

  // Save to LocalStorage on changes
  useEffect(() => {
    if (!isLoaded) return;
    try {
      const stateToSave = {
        config,
        members,
        products,
        waserdaTransactions,
        uspLoans,
        credits,
        simpananRecords,
        cashTransactions,
        users,
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(stateToSave));
    } catch (e) {
      console.error('Failed to save to local storage:', e);
    }
  }, [
    isLoaded,
    config,
    members,
    products,
    waserdaTransactions,
    uspLoans,
    credits,
    simpananRecords,
    cashTransactions,
    users,
  ]);

  const updateConfig = (newConfig: Partial<CooperativeConfig>) => {
    setConfig((prev) => ({ ...prev, ...newConfig }));
  };

  const getCurrentCashBalance = () => {
    if (cashTransactions.length === 0) return 0;
    return cashTransactions[cashTransactions.length - 1].balanceAfter;
  };

  const getMemberById = (id: string) => members.find((m) => m.id === id);

  // Auto add to cashflow
  const recordCashFlow = (
    type: 'in' | 'out',
    category: any,
    amount: number,
    title: string,
    description: string,
    memberId?: string,
    memberName?: string
  ) => {
    const prevBalance = getCurrentCashBalance();
    const newBalance = type === 'in' ? prevBalance + amount : prevBalance - amount;
    const newTx: CashTransaction = {
      id: `csh-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      refNo: `KAS-${new Date().getFullYear()}${String(new Date().getMonth() + 1).padStart(2, '0')}-${String(cashTransactions.length + 1).padStart(3, '0')}`,
      date: new Date().toISOString(),
      type,
      category,
      amount,
      title,
      description,
      memberId,
      memberName,
      cashierName: currentUser.name,
      balanceAfter: newBalance,
    };
    setCashTransactions((prev) => [...prev, newTx]);
  };

  // Add Member
  const addMember = (data: Omit<Member, 'id' | 'memberNo' | 'monthlyWajibAmount'>): Member => {
    const nextNum = members.length + 1;
    const memberNo = `KOP-${String(nextNum).padStart(3, '0')}`;
    const monthlyWajibAmount =
      data.employmentStatus === 'PNS' || data.employmentStatus === 'PPPK'
        ? config.wajibPnsPppk
        : config.wajibHonorer;

    const newMember: Member = {
      ...data,
      id: `mem-${Date.now()}`,
      memberNo,
      monthlyWajibAmount,
    };

    setMembers((prev) => [...prev, newMember]);

    // Tambah akun anggota baru
    const newUser: UserAccount = {
      id: `usr-${Date.now()}`,
      username: memberNo.toLowerCase().replace('-', ''),
      name: newMember.name,
      role: 'anggota',
      memberId: newMember.id,
      email: newMember.email,
      phone: newMember.phone,
    };
    setUsers((prev) => [...prev, newUser]);

    return newMember;
  };

  const updateMember = (id: string, memberData: Partial<Member>) => {
    setMembers((prev) =>
      prev.map((m) => {
        if (m.id !== id) return m;
        const updated = { ...m, ...memberData };
        if (memberData.employmentStatus) {
          updated.monthlyWajibAmount =
            memberData.employmentStatus === 'PNS' || memberData.employmentStatus === 'PPPK'
              ? config.wajibPnsPppk
              : config.wajibHonorer;
        }
        return updated;
      })
    );
  };

  // Waserda
  const addProduct = (p: Omit<WaserdaProduct, 'id' | 'code'>) => {
    const catCode = p.category.substring(0, 3).toUpperCase();
    const count = products.filter((prod) => prod.category === p.category).length + 1;
    const code = `${catCode}-${String(count).padStart(3, '0')}`;
    const newProd: WaserdaProduct = {
      ...p,
      id: `prod-${Date.now()}`,
      code,
    };
    setProducts((prev) => [...prev, newProd]);
  };

  const updateProduct = (id: string, product: Partial<WaserdaProduct>) => {
    setProducts((prev) => prev.map((p) => (p.id === id ? { ...p, ...product } : p)));
  };

  const deleteProduct = (id: string) => {
    setProducts((prev) => prev.filter((p) => p.id !== id));
  };

  const createWaserdaTransaction = (
    items: { product: WaserdaProduct; quantity: number }[],
    paymentMethod: 'tunai' | 'potong_gaji' | 'transfer',
    memberId?: string,
    notes?: string
  ): WaserdaTransaction => {
    let totalAmount = 0;
    let totalCost = 0;

    const txItems = items.map((i) => {
      const subtotal = i.product.sellPrice * i.quantity;
      const subcost = i.product.costPrice * i.quantity;
      totalAmount += subtotal;
      totalCost += subcost;
      return {
        productId: i.product.id,
        productName: i.product.name,
        quantity: i.quantity,
        unitPrice: i.product.sellPrice,
        costPrice: i.product.costPrice,
        subtotal,
      };
    });

    const member = memberId ? getMemberById(memberId) : undefined;
    const memberName = member ? member.name : 'Pelanggan Umum';

    const tx: WaserdaTransaction = {
      id: `tx-was-${Date.now()}`,
      receiptNo: `WSR-${new Date().getFullYear()}${String(new Date().getMonth() + 1).padStart(2, '0')}-${String(waserdaTransactions.length + 1).padStart(3, '0')}`,
      date: new Date().toISOString(),
      memberId,
      memberName,
      items: txItems,
      totalAmount,
      totalProfit: totalAmount - totalCost,
      paymentMethod,
      cashierName: currentUser.name,
      notes,
    };

    // Update Product Stock
    setProducts((prev) =>
      prev.map((prod) => {
        const item = items.find((i) => i.product.id === prod.id);
        if (item) {
          return { ...prod, stock: Math.max(0, prod.stock - item.quantity) };
        }
        return prod;
      })
    );

    setWaserdaTransactions((prev) => [tx, ...prev]);

    // Jika pembayaran tunai atau transfer langsung, masuk kas koperasi
    if (paymentMethod === 'tunai' || paymentMethod === 'transfer') {
      recordCashFlow(
        'in',
        'waserda_penjualan',
        totalAmount,
        `Penjualan Waserda ${tx.receiptNo} (${paymentMethod.toUpperCase()})`,
        `Pembelian oleh ${memberName} sebanyak ${txItems.length} item`,
        memberId,
        memberName
      );
    }

    return tx;
  };

  // USP (Pinjaman 3% Menurun)
  const applyUSPLoan = (
    memberId: string,
    amount: number,
    tenorMonths: number,
    purpose: string
  ): USPLoan => {
    const member = getMemberById(memberId);
    const memberName = member ? member.name : 'Anggota';
    const calculation = calculateUSPSchedule(amount, tenorMonths, config.uspInterestRate);

    const isAutoApprove = currentUser.role === 'pengelola';

    const newLoan: USPLoan = {
      id: `usp-${Date.now()}`,
      loanNo: `USP-${new Date().getFullYear()}-${String(uspLoans.length + 1).padStart(3, '0')}`,
      memberId,
      memberName,
      amount,
      tenorMonths,
      monthlyInterestRate: config.uspInterestRate,
      startDate: new Date().toISOString().split('T')[0],
      purpose,
      status: isAutoApprove ? 'active' : 'pending_approval',
      approvedBy: isAutoApprove ? currentUser.name : undefined,
      approvedDate: isAutoApprove ? new Date().toISOString() : undefined,
      schedule: calculation.schedule,
      totalInterestProjected: calculation.totalInterest,
      totalInterestPaid: 0,
      remainingPrincipal: amount,
    };

    setUspLoans((prev) => [newLoan, ...prev]);

    // Jika disetujui langsung oleh pengelola, cairkan dana dari kas
    if (isAutoApprove) {
      recordCashFlow(
        'out',
        'usp_pencairan',
        amount,
        `Pencairan Pinjaman USP #${newLoan.loanNo}`,
        `Pencairan pinjaman ${memberName} sebesar ${amount} tenor ${tenorMonths} bulan`,
        memberId,
        memberName
      );
    }

    return newLoan;
  };

  const approveUSPLoan = (loanId: string) => {
    setUspLoans((prev) =>
      prev.map((l) => {
        if (l.id !== loanId) return l;
        recordCashFlow(
          'out',
          'usp_pencairan',
          l.amount,
          `Pencairan Pinjaman USP #${l.loanNo}`,
          `Pencairan pinjaman ${l.memberName} tenor ${l.tenorMonths} bulan`,
          l.memberId,
          l.memberName
        );
        return {
          ...l,
          status: 'active',
          approvedBy: currentUser.name,
          approvedDate: new Date().toISOString(),
        };
      })
    );
  };

  const rejectUSPLoan = (loanId: string) => {
    setUspLoans((prev) =>
      prev.map((l) => (l.id === loanId ? { ...l, status: 'rejected' } : l))
    );
  };

  const payUSPInstallment = (loanId: string, installmentNumber: number) => {
    setUspLoans((prev) =>
      prev.map((loan) => {
        if (loan.id !== loanId) return loan;

        let paidPokok = 0;
        let paidBunga = 0;
        let totalPaid = 0;

        const updatedSchedule = loan.schedule.map((item) => {
          if (item.installmentNumber === installmentNumber && item.status !== 'paid') {
            paidPokok = item.pokokAmount;
            paidBunga = item.interestAmount;
            totalPaid = item.totalAmount;
            return {
              ...item,
              status: 'paid' as const,
              paidDate: new Date().toISOString().split('T')[0],
              paidAmount: item.totalAmount,
              cashierName: currentUser.name,
            };
          }
          return item;
        });

        if (totalPaid > 0) {
          // Record kas masuk
          recordCashFlow(
            'in',
            'usp_angsuran_pokok',
            totalPaid,
            `Angsuran ke-${installmentNumber} Pinjaman USP #${loan.loanNo}`,
            `Pokok: ${paidPokok}, Bunga Menurun: ${paidBunga} (${loan.memberName})`,
            loan.memberId,
            loan.memberName
          );
        }

        const remainingPrincipal = Math.max(0, loan.remainingPrincipal - paidPokok);
        const totalInterestPaid = loan.totalInterestPaid + paidBunga;
        const allPaid = updatedSchedule.every((s) => s.status === 'paid');

        return {
          ...loan,
          schedule: updatedSchedule,
          remainingPrincipal,
          totalInterestPaid,
          status: allPaid ? 'completed' : 'active',
        };
      })
    );
  };

  // Kredit Barang (5% Flat)
  const applyGoodsCredit = (
    memberId: string,
    goodsName: string,
    basePrice: number,
    tenorMonths: number,
    vendorName: string,
    goodsDescription?: string
  ): GoodsCredit => {
    const member = getMemberById(memberId);
    const memberName = member ? member.name : 'Anggota';
    const calculation = calculateCreditSchedule(basePrice, config.creditMarginRate, tenorMonths);

    const isAutoApprove = currentUser.role === 'pengelola';

    const newCredit: GoodsCredit = {
      id: `crd-${Date.now()}`,
      creditNo: `KRD-${new Date().getFullYear()}-${String(credits.length + 1).padStart(3, '0')}`,
      memberId,
      memberName,
      goodsName,
      goodsDescription,
      vendorName,
      basePrice,
      marginRate: config.creditMarginRate,
      marginAmount: calculation.marginAmount,
      totalPayable: calculation.totalPayable,
      tenorMonths,
      monthlyInstallment: calculation.monthlyInstallment,
      startDate: new Date().toISOString().split('T')[0],
      status: isAutoApprove ? 'active' : 'pending_approval',
      approvedBy: isAutoApprove ? currentUser.name : undefined,
      approvedDate: isAutoApprove ? new Date().toISOString() : undefined,
      schedule: calculation.schedule,
      remainingAmount: calculation.totalPayable,
    };

    setCredits((prev) => [newCredit, ...prev]);

    // Jika disetujui, kas keluar untuk talangan beli barang ke toko
    if (isAutoApprove) {
      recordCashFlow(
        'out',
        'kredit_pembelian_barang',
        basePrice,
        `Talangan Pembelian Barang #${newCredit.creditNo}`,
        `Beli ${goodsName} di ${vendorName} untuk ${memberName}`,
        memberId,
        memberName
      );
    }

    return newCredit;
  };

  const approveGoodsCredit = (creditId: string) => {
    setCredits((prev) =>
      prev.map((c) => {
        if (c.id !== creditId) return c;
        recordCashFlow(
          'out',
          'kredit_pembelian_barang',
          c.basePrice,
          `Talangan Pembelian Barang #${c.creditNo}`,
          `Beli ${c.goodsName} di ${c.vendorName} untuk ${c.memberName}`,
          c.memberId,
          c.memberName
        );
        return {
          ...c,
          status: 'active',
          approvedBy: currentUser.name,
          approvedDate: new Date().toISOString(),
        };
      })
    );
  };

  const rejectGoodsCredit = (creditId: string) => {
    setCredits((prev) =>
      prev.map((c) => (c.id === creditId ? { ...c, status: 'rejected' } : c))
    );
  };

  const payCreditInstallment = (creditId: string, installmentNumber: number) => {
    setCredits((prev) =>
      prev.map((c) => {
        if (c.id !== creditId) return c;

        let paidAmount = 0;
        const updatedSchedule = c.schedule.map((item) => {
          if (item.installmentNumber === installmentNumber && item.status !== 'paid') {
            paidAmount = item.amount;
            return {
              ...item,
              status: 'paid' as const,
              paidDate: new Date().toISOString().split('T')[0],
              paidAmount: item.amount,
              cashierName: currentUser.name,
            };
          }
          return item;
        });

        if (paidAmount > 0) {
          recordCashFlow(
            'in',
            'kredit_angsuran',
            paidAmount,
            `Angsuran ke-${installmentNumber} Kredit Barang #${c.creditNo}`,
            `Cicilan ${c.goodsName} (${c.memberName})`,
            c.memberId,
            c.memberName
          );
        }

        const remainingAmount = Math.max(0, c.remainingAmount - paidAmount);
        const allPaid = updatedSchedule.every((s) => s.status === 'paid');

        return {
          ...c,
          schedule: updatedSchedule,
          remainingAmount,
          status: allPaid ? 'completed' : 'active',
        };
      })
    );
  };

  // Simpanan Wajib & Sukarela
  const getMemberSimpananWajibTotal = (memberId: string) => {
    return simpananRecords
      .filter((s) => s.memberId === memberId && s.type === 'wajib')
      .reduce((acc, curr) => (curr.action === 'setor' ? acc + curr.amount : acc - curr.amount), 0);
  };

  const getMemberSimpananSukarelaTotal = (memberId: string) => {
    return simpananRecords
      .filter((s) => s.memberId === memberId && s.type === 'sukarela')
      .reduce((acc, curr) => (curr.action === 'setor' ? acc + curr.amount : acc - curr.amount), 0);
  };

  const depositSimpananWajib = (
    memberId: string,
    periodMonth: string,
    amount?: number,
    notes?: string
  ) => {
    const member = getMemberById(memberId);
    if (!member) return;

    const actualAmount = amount || member.monthlyWajibAmount;
    const currentWajibTotal = getMemberSimpananWajibTotal(memberId);
    const balanceAfter = currentWajibTotal + actualAmount;

    const record: SimpananRecord = {
      id: `smp-w-${Date.now()}`,
      transactionNo: `SW-${Date.now().toString().slice(-6)}`,
      date: new Date().toISOString(),
      memberId,
      memberName: member.name,
      type: 'wajib',
      action: 'setor',
      amount: actualAmount,
      periodMonth,
      cashierName: currentUser.name,
      notes: notes || `Setoran Simpanan Wajib Periode ${periodMonth}`,
      balanceAfter,
    };

    setSimpananRecords((prev) => [record, ...prev]);

    recordCashFlow(
      'in',
      'simpanan_wajib',
      actualAmount,
      `Simpanan Wajib ${member.name} (${periodMonth})`,
      `Setoran simpanan wajib bulanan ${member.employmentStatus}`,
      memberId,
      member.name
    );
  };

  const depositSimpananSukarela = (memberId: string, amount: number, notes?: string) => {
    const member = getMemberById(memberId);
    if (!member) return;

    const currentTotal = getMemberSimpananSukarelaTotal(memberId);
    const balanceAfter = currentTotal + amount;

    const record: SimpananRecord = {
      id: `smp-s-${Date.now()}`,
      transactionNo: `SS-${Date.now().toString().slice(-6)}`,
      date: new Date().toISOString(),
      memberId,
      memberName: member.name,
      type: 'sukarela',
      action: 'setor',
      amount,
      cashierName: currentUser.name,
      notes: notes || 'Setoran Simpanan Sukarela',
      balanceAfter,
    };

    setSimpananRecords((prev) => [record, ...prev]);

    recordCashFlow(
      'in',
      'simpanan_sukarela_setor',
      amount,
      `Setoran Simpanan Sukarela ${member.name}`,
      `Penambahan saldo tabungan sukarela anggota`,
      memberId,
      member.name
    );
  };

  const withdrawSimpananSukarela = (
    memberId: string,
    amount: number,
    notes?: string
  ): boolean => {
    const member = getMemberById(memberId);
    if (!member) return false;

    const currentTotal = getMemberSimpananSukarelaTotal(memberId);
    if (currentTotal < amount) {
      return false; // Saldo tidak cukup
    }

    const balanceAfter = currentTotal - amount;
    const record: SimpananRecord = {
      id: `smp-s-w-${Date.now()}`,
      transactionNo: `TS-${Date.now().toString().slice(-6)}`,
      date: new Date().toISOString(),
      memberId,
      memberName: member.name,
      type: 'sukarela',
      action: 'tarik',
      amount,
      cashierName: currentUser.name,
      notes: notes || 'Penarikan Simpanan Sukarela',
      balanceAfter,
    };

    setSimpananRecords((prev) => [record, ...prev]);

    recordCashFlow(
      'out',
      'simpanan_sukarela_tarik',
      amount,
      `Penarikan Simpanan Sukarela ${member.name}`,
      `Penarikan dana tabungan sukarela oleh anggota`,
      memberId,
      member.name
    );

    return true;
  };

  const addManualCashTransaction = (
    type: 'in' | 'out',
    category: any,
    amount: number,
    title: string,
    description: string
  ) => {
    recordCashFlow(type, category, amount, title, description);
  };

  // Queries for Member
  const getMemberActiveLoans = (memberId: string) => {
    return uspLoans.filter((l) => l.memberId === memberId);
  };

  const getMemberActiveCredits = (memberId: string) => {
    return credits.filter((c) => c.memberId === memberId);
  };

  const getMemberWaserdaHistory = (memberId: string) => {
    return waserdaTransactions.filter((w) => w.memberId === memberId);
  };

  const getMemberSimpananRecords = (memberId: string) => {
    return simpananRecords.filter((s) => s.memberId === memberId);
  };

  // Tools
  const resetToDefault = () => {
    setConfig(INITIAL_CONFIG);
    setUsers(INITIAL_USERS);
    setMembers(INITIAL_MEMBERS);
    setProducts(INITIAL_PRODUCTS);
    setWaserdaTransactions(INITIAL_WASERDA_TX);
    setUspLoans(INITIAL_USP_LOANS);
    setCredits(INITIAL_CREDITS);
    setSimpananRecords(INITIAL_SIMPANAN);
    setCashTransactions(INITIAL_CASH_FLOW);
    setCurrentUser(INITIAL_USERS[0]);
    localStorage.removeItem(STORAGE_KEY);
  };

  const exportDatabaseJSON = () => {
    return JSON.stringify(
      {
        config,
        users,
        members,
        products,
        waserdaTransactions,
        uspLoans,
        credits,
        simpananRecords,
        cashTransactions,
        exportedAt: new Date().toISOString(),
      },
      null,
      2
    );
  };

  const importDatabaseJSON = (jsonStr: string): boolean => {
    try {
      const data = JSON.parse(jsonStr);
      if (data.members && data.products) {
        if (data.config) setConfig(data.config);
        if (data.users) setUsers(data.users);
        if (data.members) setMembers(data.members);
        if (data.products) setProducts(data.products);
        if (data.waserdaTransactions) setWaserdaTransactions(data.waserdaTransactions);
        if (data.uspLoans) setUspLoans(data.uspLoans);
        if (data.credits) setCredits(data.credits);
        if (data.simpananRecords) setSimpananRecords(data.simpananRecords);
        if (data.cashTransactions) setCashTransactions(data.cashTransactions);
        return true;
      }
      return false;
    } catch {
      return false;
    }
  };

  return (
    <CooperativeContext.Provider
      value={{
        currentUser,
        setCurrentUser,
        users,
        config,
        updateConfig,
        members,
        addMember,
        updateMember,
        getMemberById,
        products,
        addProduct,
        updateProduct,
        deleteProduct,
        waserdaTransactions,
        createWaserdaTransaction,
        uspLoans,
        applyUSPLoan,
        approveUSPLoan,
        rejectUSPLoan,
        payUSPInstallment,
        credits,
        applyGoodsCredit,
        approveGoodsCredit,
        rejectGoodsCredit,
        payCreditInstallment,
        simpananRecords,
        depositSimpananWajib,
        depositSimpananSukarela,
        withdrawSimpananSukarela,
        cashTransactions,
        addManualCashTransaction,
        getCurrentCashBalance,
        getMemberSimpananWajibTotal,
        getMemberSimpananSukarelaTotal,
        getMemberActiveLoans,
        getMemberActiveCredits,
        getMemberWaserdaHistory,
        getMemberSimpananRecords,
        resetToDefault,
        exportDatabaseJSON,
        importDatabaseJSON,
      }}
    >
      {children}
    </CooperativeContext.Provider>
  );
};

export const useCooperative = () => {
  const context = useContext(CooperativeContext);
  if (!context) {
    throw new Error('useCooperative must be used within a CooperativeProvider');
  }
  return context;
};
