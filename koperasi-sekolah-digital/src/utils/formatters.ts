import { USPAngsuran, CreditAngsuran, EmploymentStatus } from '../types';

export function formatRupiah(amount: number): string {
  if (isNaN(amount) || amount === null || amount === undefined) return 'Rp 0';
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
    minimumFractionDigits: 0,
  }).format(Math.round(amount));
}

export function formatNumber(amount: number): string {
  if (isNaN(amount) || amount === null || amount === undefined) return '0';
  return new Intl.NumberFormat('id-ID').format(Math.round(amount));
}

export function formatDate(dateStr: string): string {
  if (!dateStr) return '-';
  try {
    const d = new Date(dateStr);
    return new Intl.DateTimeFormat('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    }).format(d);
  } catch {
    return dateStr;
  }
}

export function formatDateFull(dateStr: string): string {
  if (!dateStr) return '-';
  try {
    const d = new Date(dateStr);
    return new Intl.DateTimeFormat('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    }).format(d);
  } catch {
    return dateStr;
  }
}

export function getEmploymentLabel(status: EmploymentStatus): { label: string; badgeClass: string; wajib: number } {
  switch (status) {
    case 'PNS':
      return {
        label: 'PNS',
        badgeClass: 'text-emerald-800 bg-emerald-50 border border-emerald-200',
        wajib: 100000,
      };
    case 'PPPK':
      return {
        label: 'PPPK Penuh Waktu',
        badgeClass: 'text-teal-800 bg-teal-50 border border-teal-200',
        wajib: 100000,
      };
    case 'PPPK_PARUH_WAKTU':
      return {
        label: 'PPPK Paruh Waktu',
        badgeClass: 'text-amber-800 bg-amber-50 border border-amber-200',
        wajib: 50000,
      };
    case 'HONORER':
      return {
        label: 'Honorer / GTT / PTT',
        badgeClass: 'text-stone-800 bg-stone-100 border border-stone-200',
        wajib: 50000,
      };
    default:
      return {
        label: status,
        badgeClass: 'text-stone-800 bg-stone-100 border border-stone-200',
        wajib: 50000,
      };
  }
}

/**
 * USP (Usaha Simpan Pinjam) dengan bunga 3% MENURUN (Declining Balance).
 * Contoh: Pinjam 10 juta tenor 10 bulan:
 * Pokok tetap = 1.000.000 / bulan
 * Bulan 1: Sisa pokok 10.000.000 -> Bunga = 3% * 10jt = 300.000 -> Cicilan = 1.300.000
 * Bulan 2: Sisa pokok 9.000.000 -> Bunga = 3% * 9jt = 270.000 -> Cicilan = 1.270.000
 * Bulan 3: Sisa pokok 8.000.000 -> Bunga = 3% * 8jt = 240.000 -> Cicilan = 1.240.000, dst.
 */
export function calculateUSPSchedule(
  principal: number,
  tenorMonths: number,
  monthlyRate: number = 0.03,
  startDateStr: string = new Date().toISOString()
): { schedule: USPAngsuran[]; totalInterest: number; totalPayment: number } {
  const schedule: USPAngsuran[] = [];
  const pokokPerMonth = Math.round(principal / tenorMonths);
  let currentSisaPokok = principal;
  let totalInterest = 0;
  let totalPayment = 0;

  const startDate = new Date(startDateStr);

  for (let i = 1; i <= tenorMonths; i++) {
    // Tanggal jatuh tempo per bulan berikutnya
    const dueDate = new Date(startDate);
    dueDate.setMonth(startDate.getMonth() + i);

    // Bulan terakhir sesuaikan pokok agar sisa habis tepat nol
    const actualPokok = i === tenorMonths ? currentSisaPokok : pokokPerMonth;
    const interest = Math.round(currentSisaPokok * monthlyRate);
    const totalMonth = actualPokok + interest;
    const sisaAkhir = Math.max(0, currentSisaPokok - actualPokok);

    schedule.push({
      installmentNumber: i,
      dueDate: dueDate.toISOString().split('T')[0],
      sisaPokokAwal: currentSisaPokok,
      pokokAmount: actualPokok,
      interestRate: monthlyRate,
      interestAmount: interest,
      totalAmount: totalMonth,
      sisaPokokAkhir: sisaAkhir,
      status: 'pending',
    });

    totalInterest += interest;
    totalPayment += totalMonth;
    currentSisaPokok = sisaAkhir;
  }

  return { schedule, totalInterest, totalPayment };
}

/**
 * KREDIT BARANG: Koperasi menalangi pembelian barang,
 * Margin keuntungan koperasi flat 5% dari harga barang.
 * Contoh: Harga barang 10 juta -> Margin 500rb -> Total bayar 10.5 juta.
 */
export function calculateCreditSchedule(
  basePrice: number,
  marginRate: number = 0.05,
  tenorMonths: number = 10,
  startDateStr: string = new Date().toISOString()
): {
  marginAmount: number;
  totalPayable: number;
  monthlyInstallment: number;
  schedule: CreditAngsuran[];
} {
  const marginAmount = Math.round(basePrice * marginRate);
  const totalPayable = basePrice + marginAmount;
  const monthlyInstallment = Math.round(totalPayable / tenorMonths);

  const schedule: CreditAngsuran[] = [];
  const startDate = new Date(startDateStr);
  let accumulated = 0;

  for (let i = 1; i <= tenorMonths; i++) {
    const dueDate = new Date(startDate);
    dueDate.setMonth(startDate.getMonth() + i);

    // Penyesuaian bulan terakhir agar genap persis
    const amount = i === tenorMonths ? totalPayable - accumulated : monthlyInstallment;
    accumulated += amount;

    schedule.push({
      installmentNumber: i,
      dueDate: dueDate.toISOString().split('T')[0],
      amount,
      status: 'pending',
    });
  }

  return { marginAmount, totalPayable, monthlyInstallment, schedule };
}
