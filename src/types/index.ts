export type UserRole = 'pengelola' | 'pegawai' | 'anggota';

export type EmploymentStatus = 'PNS' | 'PPPK' | 'PPPK_PARUH_WAKTU' | 'HONORER';

export interface UserAccount {
  id: string;
  username: string;
  name: string;
  role: UserRole;
  memberId?: string; // Tautan ke ID Anggota jika rolenya anggota
  avatarUrl?: string;
  email?: string;
  phone?: string;
}

export interface Member {
  id: string;
  memberNo: string; // Nomor Anggota Koperasi (e.g., KOP-001)
  nip?: string;     // NIP / NUPTK / NIK
  name: string;
  employmentStatus: EmploymentStatus;
  monthlyWajibAmount: number; // 100.000 untuk PNS/PPPK, 50.000 untuk Paruh Waktu/Honorer
  phone: string;
  email: string;
  department: string; // misal: Guru Matematika, Tenaga Administrasi, Guru PJOK
  joinDate: string;
  status: 'active' | 'inactive';
}

// 1. WASERDA (Warung Serba Ada)
export interface WaserdaProduct {
  id: string;
  code: string;
  name: string;
  category: 'ATK' | 'Seragam' | 'Konsumsi' | 'Sembako' | 'Lainnya';
  costPrice: number; // Harga beli/modal (HPP)
  sellPrice: number; // Harga jual
  stock: number;
  unit: string; // pcs, rim, stel, pack
}

export interface WaserdaCartItem {
  product: WaserdaProduct;
  quantity: number;
  subtotal: number;
}

export interface WaserdaTransaction {
  id: string;
  receiptNo: string;
  date: string;
  memberId?: string; // Null jika pembeli umum / non-anggota
  memberName: string;
  items: {
    productId: string;
    productName: string;
    quantity: number;
    unitPrice: number;
    costPrice: number;
    subtotal: number;
  }[];
  totalAmount: number;
  totalProfit: number;
  paymentMethod: 'tunai' | 'potong_gaji' | 'transfer';
  cashierName: string;
  notes?: string;
}

// 2. USP (Usaha Simpan Pinjam) - Bunga 3% Menurun
export interface USPAngsuran {
  installmentNumber: number; // Bulan ke-1, 2, ..., N
  dueDate: string;
  pokokAmount: number;       // Pinjaman / Tenor (tetap)
  sisaPokokAwal: number;     // Sisa pokok sebelum angsuran ini
  interestRate: number;      // 3% (0.03)
  interestAmount: number;    // sisaPokokAwal * 3%
  totalAmount: number;       // pokokAmount + interestAmount
  sisaPokokAkhir: number;    // sisaPokokAwal - pokokAmount
  status: 'pending' | 'paid' | 'overdue';
  paidDate?: string;
  paidAmount?: number;
  cashierName?: string;
}

export interface USPLoan {
  id: string;
  loanNo: string;
  memberId: string;
  memberName: string;
  amount: number;            // Pokok pinjaman (misal 10.000.000)
  tenorMonths: number;       // Tenor (misal 10 bulan)
  monthlyInterestRate: number; // 0.03 (3% per bulan menurun)
  startDate: string;
  purpose: string;
  status: 'pending_approval' | 'active' | 'completed' | 'rejected';
  approvedBy?: string;
  approvedDate?: string;
  schedule: USPAngsuran[];
  totalInterestProjected: number;
  totalInterestPaid: number;
  remainingPrincipal: number;
}

// 3. KREDIT BARANG (Margin Koperasi 5%)
export interface CreditAngsuran {
  installmentNumber: number;
  dueDate: string;
  amount: number; // Total / Tenor
  status: 'pending' | 'paid' | 'overdue';
  paidDate?: string;
  paidAmount?: number;
  cashierName?: string;
}

export interface GoodsCredit {
  id: string;
  creditNo: string;
  memberId: string;
  memberName: string;
  goodsName: string;
  goodsDescription?: string;
  vendorName: string;
  basePrice: number;         // Harga barang asli (misal 10.000.000)
  marginRate: number;        // 0.05 (5%)
  marginAmount: number;      // basePrice * 0.05 (misal 500.000)
  totalPayable: number;      // basePrice + marginAmount (misal 10.500.000)
  tenorMonths: number;       // Jumlah bulan angsuran
  monthlyInstallment: number;// totalPayable / tenorMonths (misal 1.050.000)
  startDate: string;
  status: 'pending_approval' | 'active' | 'completed' | 'rejected';
  approvedBy?: string;
  approvedDate?: string;
  schedule: CreditAngsuran[];
  remainingAmount: number;
}

// 4 & 5. SIMPANAN (Wajib & Sukarela)
export interface SimpananRecord {
  id: string;
  transactionNo: string;
  date: string;
  memberId: string;
  memberName: string;
  type: 'wajib' | 'sukarela';
  action: 'setor' | 'tarik';
  amount: number;
  periodMonth?: string; // "2026-10" untuk simpanan wajib
  cashierName: string;
  notes?: string;
  balanceAfter: number; // Saldo simpanan jenis tersebut setelah transaksi
}

// 6. BUKU KAS UMUM (Arus Kas Masuk & Keluar)
export type CashFlowType = 'in' | 'out';

export type CashCategory = 
  | 'simpanan_wajib' 
  | 'simpanan_sukarela_setor' 
  | 'simpanan_sukarela_tarik' 
  | 'usp_pencairan' 
  | 'usp_angsuran_pokok' 
  | 'usp_bunga' 
  | 'kredit_pembelian_barang' 
  | 'kredit_angsuran' 
  | 'waserda_penjualan' 
  | 'waserda_kulakan' 
  | 'operasional' 
  | 'modal_awal' 
  | 'lainnya';

export interface CashTransaction {
  id: string;
  refNo: string;
  date: string;
  type: CashFlowType;
  category: CashCategory;
  amount: number;
  title: string;
  description: string;
  memberId?: string;
  memberName?: string;
  cashierName: string;
  balanceAfter: number;
}

// PENGATURAN KOPERASI
export interface CooperativeConfig {
  name: string;
  schoolName: string;
  address: string;
  phone: string;
  leaderName: string;
  treasurerName: string;
  secretaryName: string;
  uspInterestRate: number; // default 0.03 (3%)
  creditMarginRate: number; // default 0.05 (5%)
  wajibPnsPppk: number; // default 100.000
  wajibHonorer: number; // default 50.000
}
