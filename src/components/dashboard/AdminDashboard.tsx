import React from 'react';
import { useCooperative } from '../../context/CooperativeContext';
import { formatRupiah, formatNumber } from '../../utils/formatters';
import { 
  ShieldCheck, 
  Wallet, 
  Coins, 
  Laptop, 
  ShoppingBag, 
  PiggyBank, 
  Users, 
  Clock, 
  TrendingUp, 
  Scale, 
  CheckCircle2,
  ChevronRight
} from 'lucide-react';

interface AdminDashboardProps {
  onNavigateTab: (tab: string) => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ onNavigateTab }) => {
  const { 
    currentUser, 
    getCurrentCashBalance, 
    members, 
    products, 
    waserdaTransactions, 
    uspLoans, 
    credits, 
    getMemberSimpananWajibTotal, 
    getMemberSimpananSukarelaTotal,
    cashTransactions,
    config
  } = useCooperative();

  const cashBalance = getCurrentCashBalance();

  // Piutang USP & Kredit
  const totalPiutangUSP = uspLoans
    .filter((l) => l.status === 'active')
    .reduce((acc, l) => acc + l.remainingPrincipal, 0);

  const totalPiutangKredit = credits
    .filter((c) => c.status === 'active')
    .reduce((acc, c) => acc + c.remainingAmount, 0);

  // Nilai Persediaan Waserda (HPP * stok)
  const totalNilaiStokWaserda = products.reduce((acc, p) => acc + p.costPrice * p.stock, 0);

  // TOTAL ASET KOPERASI
  const totalAsetKoperasi = cashBalance + totalPiutangUSP + totalPiutangKredit + totalNilaiStokWaserda;

  // TOTAL SIMPANAN ANGGOTA (Kewajiban Koperasi ke Anggota)
  const totalSimpananWajib = members.reduce((acc, m) => acc + getMemberSimpananWajibTotal(m.id), 0);
  const totalSimpananSukarela = members.reduce((acc, m) => acc + getMemberSimpananSukarelaTotal(m.id), 0);
  const totalKewajibanSimpanan = totalSimpananWajib + totalSimpananSukarela;

  // PENDAPATAN & LABA (SHU)
  const labaWaserda = waserdaTransactions.reduce((acc, t) => acc + t.totalProfit, 0);
  const pendapatanBungaUSP = uspLoans.reduce((acc, l) => acc + l.totalInterestPaid, 0);
  const labaMarginKredit = credits.reduce((acc, c) => acc + c.marginAmount, 0);
  const bebanOperasional = cashTransactions
    .filter((t) => t.category === 'operasional')
    .reduce((acc, t) => acc + t.amount, 0);

  const totalSHUBerjalan = (labaWaserda + pendapatanBungaUSP + labaMarginKredit) - bebanOperasional;

  // Pending Approvals
  const pendingUSP = uspLoans.filter((l) => l.status === 'pending_approval');
  const pendingCredits = credits.filter((c) => c.status === 'pending_approval');
  const totalPending = pendingUSP.length + pendingCredits.length;

  return (
    <div className="space-y-6">
      
      {/* Welcome Banner */}
      <div className="bg-white rounded-xl border border-stone-200 p-5 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-emerald-800 text-white flex items-center justify-center font-bold shadow-xs">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold text-stone-900">
                  Panel Eksekutif Pengelola Koperasi
                </h1>
                <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
                  Fungsi & Hak Mutlak
                </span>
              </div>
              <p className="text-xs text-stone-500 mt-0.5">
                Ketua / Pengelola: <strong>{currentUser.name}</strong> · Pengawasan menyeluruh kebijakan, permodalan, dan SHU koperasi sekolah.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => onNavigateTab('laporan')}
              className="px-3.5 py-2 bg-emerald-800 hover:bg-emerald-900 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 cursor-pointer shadow-xs transition-colors"
            >
              <Scale className="w-4 h-4" />
              <span>Buka Laporan Keuangan & SHU</span>
            </button>
          </div>
        </div>
      </div>

      {/* Pending Approval Notice if any */}
      {totalPending > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-amber-950">
          <div className="flex items-center gap-2.5">
            <Clock className="w-5 h-5 text-amber-700 shrink-0" />
            <div>
              <h4 className="font-bold text-xs">Persetujuan Pencairan Dana Menunggu Konfirmasi ({totalPending})</h4>
              <p className="text-[11px] text-amber-800">
                Terdapat {pendingUSP.length} pengajuan USP dan {pendingCredits.length} talangan kredit barang yang memerlukan persetujuan mutlak pengelola.
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            {pendingUSP.length > 0 && (
              <button
                onClick={() => onNavigateTab('usp')}
                className="px-3 py-1 bg-amber-700 hover:bg-amber-800 text-white text-xs font-medium rounded-lg cursor-pointer"
              >
                Persetujuan USP ({pendingUSP.length})
              </button>
            )}
            {pendingCredits.length > 0 && (
              <button
                onClick={() => onNavigateTab('kredit')}
                className="px-3 py-1 bg-amber-700 hover:bg-amber-800 text-white text-xs font-medium rounded-lg cursor-pointer"
              >
                Persetujuan Kredit ({pendingCredits.length})
              </button>
            )}
          </div>
        </div>
      )}

      {/* Top 4 Financial Pillars Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Total Aset */}
        <div className="bg-white rounded-xl border border-stone-200 p-4 shadow-xs">
          <div className="flex justify-between items-center text-stone-500 text-[11px] font-semibold uppercase tracking-wider">
            <span>Total Aset Koperasi</span>
            <Wallet className="w-4 h-4 text-emerald-700" />
          </div>
          <div className="text-xl font-bold font-mono text-emerald-900 mt-1">
            {formatRupiah(totalAsetKoperasi)}
          </div>
          <p className="text-[10px] text-stone-500 mt-2">
            Kas {formatRupiah(cashBalance)} + Piutang + Stok
          </p>
        </div>

        {/* Kas Tunai */}
        <div className="bg-white rounded-xl border border-stone-200 p-4 shadow-xs">
          <div className="flex justify-between items-center text-stone-500 text-[11px] font-semibold uppercase tracking-wider">
            <span>Kas Tunai / Bank</span>
            <TrendingUp className="w-4 h-4 text-emerald-700" />
          </div>
          <div className="text-xl font-bold font-mono text-stone-900 mt-1">
            {formatRupiah(cashBalance)}
          </div>
          <p className="text-[10px] text-stone-500 mt-2">
            Likuiditas siap operasional & pinjaman
          </p>
        </div>

        {/* Total Simpanan Anggota */}
        <div className="bg-white rounded-xl border border-stone-200 p-4 shadow-xs">
          <div className="flex justify-between items-center text-stone-500 text-[11px] font-semibold uppercase tracking-wider">
            <span>Dana Simpanan Anggota</span>
            <PiggyBank className="w-4 h-4 text-emerald-700" />
          </div>
          <div className="text-xl font-bold font-mono text-stone-900 mt-1">
            {formatRupiah(totalKewajibanSimpanan)}
          </div>
          <p className="text-[10px] text-stone-500 mt-2">
            Wajib: {formatRupiah(totalSimpananWajib)} · Sukarela: {formatRupiah(totalSimpananSukarela)}
          </p>
        </div>

        {/* Laba Bersih / SHU Berjalan */}
        <div className="bg-white rounded-xl border border-stone-200 p-4 shadow-xs">
          <div className="flex justify-between items-center text-stone-500 text-[11px] font-semibold uppercase tracking-wider">
            <span>Sisa Hasil Usaha (SHU)</span>
            <Scale className="w-4 h-4 text-emerald-700" />
          </div>
          <div className="text-xl font-bold font-mono text-emerald-800 mt-1">
            {formatRupiah(totalSHUBerjalan)}
          </div>
          <p className="text-[10px] text-emerald-700 mt-2 font-medium">
            Akumulasi laba bersih tahun berjalan
          </p>
        </div>

      </div>

      {/* Grid of 5 Modules Operations */}
      <div>
        <h2 className="text-xs font-bold uppercase tracking-wider text-stone-500 mb-3">
          Status 5 Pilar Keuangan Anggota Koperasi
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          
          {/* 1. Waserda */}
          <div className="bg-white rounded-xl border border-stone-200 p-4 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="p-1.5 rounded-lg bg-emerald-100 text-emerald-800">
                  <ShoppingBag className="w-4 h-4" />
                </span>
                <h3 className="font-bold text-sm text-stone-900">1. Waserda</h3>
              </div>
              <button
                onClick={() => onNavigateTab('waserda')}
                className="text-[11px] text-emerald-800 hover:underline font-semibold cursor-pointer"
              >
                Kelola →
              </button>
            </div>
            <div className="text-xs space-y-1 font-mono">
              <div className="flex justify-between">
                <span className="text-stone-500 font-sans">Jumlah Produk:</span>
                <span className="font-bold">{products.length} item barang</span>
              </div>
              <div className="flex justify-between">
                <span className="text-stone-500 font-sans">Nilai Stok (HPP):</span>
                <span>{formatRupiah(totalNilaiStokWaserda)}</span>
              </div>
              <div className="flex justify-between text-emerald-800 font-bold">
                <span className="font-sans">Laba Waserda:</span>
                <span>+{formatRupiah(labaWaserda)}</span>
              </div>
            </div>
          </div>

          {/* 2. USP Bunga 3% Menurun */}
          <div className="bg-white rounded-xl border border-stone-200 p-4 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="p-1.5 rounded-lg bg-emerald-100 text-emerald-800">
                  <Coins className="w-4 h-4" />
                </span>
                <h3 className="font-bold text-sm text-stone-900">2. USP (Bunga 3% Menurun)</h3>
              </div>
              <button
                onClick={() => onNavigateTab('usp')}
                className="text-[11px] text-emerald-800 hover:underline font-semibold cursor-pointer"
              >
                Kelola →
              </button>
            </div>
            <div className="text-xs space-y-1 font-mono">
              <div className="flex justify-between">
                <span className="text-stone-500 font-sans">Pinjaman Aktif:</span>
                <span className="font-bold">{uspLoans.filter((l) => l.status === 'active').length} peminjam</span>
              </div>
              <div className="flex justify-between">
                <span className="text-stone-500 font-sans">Sisa Pokok Piutang:</span>
                <span>{formatRupiah(totalPiutangUSP)}</span>
              </div>
              <div className="flex justify-between text-emerald-800 font-bold">
                <span className="font-sans">Pendapatan Bunga 3%:</span>
                <span>+{formatRupiah(pendapatanBungaUSP)}</span>
              </div>
            </div>
          </div>

          {/* 3. Kredit Barang Margin 5% */}
          <div className="bg-white rounded-xl border border-stone-200 p-4 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="p-1.5 rounded-lg bg-emerald-100 text-emerald-800">
                  <Laptop className="w-4 h-4" />
                </span>
                <h3 className="font-bold text-sm text-stone-900">3. Kredit Barang (Margin 5%)</h3>
              </div>
              <button
                onClick={() => onNavigateTab('kredit')}
                className="text-[11px] text-emerald-800 hover:underline font-semibold cursor-pointer"
              >
                Kelola →
              </button>
            </div>
            <div className="text-xs space-y-1 font-mono">
              <div className="flex justify-between">
                <span className="text-stone-500 font-sans">Kredit Aktif:</span>
                <span className="font-bold">{credits.filter((c) => c.status === 'active').length} barang</span>
              </div>
              <div className="flex justify-between">
                <span className="text-stone-500 font-sans">Sisa Piutang Kredit:</span>
                <span>{formatRupiah(totalPiutangKredit)}</span>
              </div>
              <div className="flex justify-between text-emerald-800 font-bold">
                <span className="font-sans">Margin Keuntungan 5%:</span>
                <span>+{formatRupiah(labaMarginKredit)}</span>
              </div>
            </div>
          </div>

          {/* 4. Simpanan Wajib */}
          <div className="bg-white rounded-xl border border-stone-200 p-4 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="p-1.5 rounded-lg bg-emerald-100 text-emerald-800">
                  <PiggyBank className="w-4 h-4" />
                </span>
                <h3 className="font-bold text-sm text-stone-900">4. Simpanan Wajib</h3>
              </div>
              <button
                onClick={() => onNavigateTab('simpanan')}
                className="text-[11px] text-emerald-800 hover:underline font-semibold cursor-pointer"
              >
                Kelola →
              </button>
            </div>
            <div className="text-xs space-y-1 font-mono">
              <div className="flex justify-between">
                <span className="text-stone-500 font-sans">PNS & PPPK:</span>
                <span className="font-bold">{formatRupiah(config.wajibPnsPppk)} / bln</span>
              </div>
              <div className="flex justify-between">
                <span className="text-stone-500 font-sans">Honorer / Paruh Waktu:</span>
                <span className="font-bold">{formatRupiah(config.wajibHonorer)} / bln</span>
              </div>
              <div className="flex justify-between text-emerald-800 font-bold">
                <span className="font-sans">Total Terkumpul:</span>
                <span>{formatRupiah(totalSimpananWajib)}</span>
              </div>
            </div>
          </div>

          {/* 5. Simpanan Sukarela */}
          <div className="bg-white rounded-xl border border-stone-200 p-4 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="p-1.5 rounded-lg bg-emerald-100 text-emerald-800">
                  <Wallet className="w-4 h-4" />
                </span>
                <h3 className="font-bold text-sm text-stone-900">5. Simpanan Sukarela</h3>
              </div>
              <button
                onClick={() => onNavigateTab('simpanan')}
                className="text-[11px] text-emerald-800 hover:underline font-semibold cursor-pointer"
              >
                Kelola →
              </button>
            </div>
            <div className="text-xs space-y-1 font-mono">
              <div className="flex justify-between">
                <span className="text-stone-500 font-sans">Ketentuan:</span>
                <span className="font-bold font-sans">Bebas Minimal / Maks</span>
              </div>
              <div className="flex justify-between">
                <span className="text-stone-500 font-sans">Penarikan:</span>
                <span className="font-sans">Bisa Ditarik Sewaktu-waktu</span>
              </div>
              <div className="flex justify-between text-emerald-800 font-bold">
                <span className="font-sans">Total Saldo Sukarela:</span>
                <span>{formatRupiah(totalSimpananSukarela)}</span>
              </div>
            </div>
          </div>

          {/* Keanggotaan Sekolah */}
          <div className="bg-white rounded-xl border border-stone-200 p-4 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="p-1.5 rounded-lg bg-emerald-100 text-emerald-800">
                  <Users className="w-4 h-4" />
                </span>
                <h3 className="font-bold text-sm text-stone-900">Keanggotaan Guru & Staf</h3>
              </div>
              <button
                onClick={() => onNavigateTab('anggota')}
                className="text-[11px] text-emerald-800 hover:underline font-semibold cursor-pointer"
              >
                Data Anggota →
              </button>
            </div>
            <div className="text-xs space-y-1 font-mono">
              <div className="flex justify-between">
                <span className="text-stone-500 font-sans">PNS & PPPK:</span>
                <span className="font-bold">{members.filter((m) => m.employmentStatus === 'PNS' || m.employmentStatus === 'PPPK').length} orang</span>
              </div>
              <div className="flex justify-between">
                <span className="text-stone-500 font-sans">Honorer & Paruh Waktu:</span>
                <span className="font-bold">{members.filter((m) => m.employmentStatus === 'HONORER' || m.employmentStatus === 'PPPK_PARUH_WAKTU').length} orang</span>
              </div>
              <div className="flex justify-between text-emerald-800 font-bold">
                <span className="font-sans">Total Anggota Terdaftar:</span>
                <span>{members.length} guru / staf</span>
              </div>
            </div>
          </div>

        </div>
      </div>

    </div>
  );
};
