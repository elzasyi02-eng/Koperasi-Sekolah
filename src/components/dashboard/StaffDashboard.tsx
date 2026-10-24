import React, { useState } from 'react';
import { useCooperative } from '../../context/CooperativeContext';
import { formatRupiah, formatDate, formatNumber } from '../../utils/formatters';
import { 
  UserCheck, 
  ShoppingCart, 
  Coins, 
  Laptop, 
  PiggyBank, 
  ArrowUpRight, 
  ArrowDownLeft, 
  Clock, 
  PlusCircle, 
  Receipt,
  BookOpen
} from 'lucide-react';

interface StaffDashboardProps {
  onNavigateTab: (tab: string) => void;
}

export const StaffDashboard: React.FC<StaffDashboardProps> = ({ onNavigateTab }) => {
  const { 
    currentUser, 
    getCurrentCashBalance, 
    waserdaTransactions, 
    uspLoans, 
    credits, 
    members,
    simpananRecords,
    cashTransactions
  } = useCooperative();

  const currentCash = getCurrentCashBalance();

  const pendingUSP = uspLoans.filter((l) => l.status === 'active');
  const pendingCredits = credits.filter((c) => c.status === 'active');

  // Transactions done today or recent
  const todayTransactions = cashTransactions.slice(-5).reverse();

  return (
    <div className="space-y-6">
      
      {/* Staff Welcome Banner */}
      <div className="bg-white rounded-xl border border-stone-200 p-5 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-teal-800 text-white flex items-center justify-center font-bold shadow-xs">
              <UserCheck className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold text-stone-900">
                  Loket Kasir & Administrasi Pegawai
                </h1>
                <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-teal-50 text-teal-800 border border-teal-200">
                  Hak Input Uang Masuk & Keluar
                </span>
              </div>
              <p className="text-xs text-stone-500 mt-0.5">
                Petugas Aktif: <strong>{currentUser.name}</strong> · Akses loket transaksi harian koperasi sekolah.
              </p>
            </div>
          </div>

          <div className="bg-stone-900 text-white rounded-xl p-3 px-4 font-mono text-right">
            <span className="text-[10px] text-stone-400 block font-sans">Saldo Kas Koperasi Saat Ini</span>
            <span className="text-base font-bold text-emerald-400">{formatRupiah(currentCash)}</span>
          </div>
        </div>
      </div>

      {/* Quick Action Cards - "Hak Input Akses Uang Masuk dan Keluar" */}
      <div>
        <h2 className="text-xs font-bold uppercase tracking-wider text-stone-500 mb-3">
          Shortcut Input Transaksi Kasir (Uang Masuk & Keluar)
        </h2>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          
          {/* 1. Kasir Waserda */}
          <button
            onClick={() => onNavigateTab('waserda')}
            className="text-left p-4 rounded-xl border border-stone-200 bg-white hover:border-emerald-600 hover:shadow-xs transition-all flex flex-col justify-between cursor-pointer group"
          >
            <div className="flex items-center justify-between">
              <div className="p-2 rounded-lg bg-emerald-100 text-emerald-800 group-hover:bg-emerald-800 group-hover:text-white transition-colors">
                <ShoppingCart className="w-5 h-5" />
              </div>
              <span className="text-[11px] font-semibold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded">
                Uang Masuk
              </span>
            </div>
            <div className="mt-4">
              <h3 className="font-bold text-sm text-stone-900">1. Kasir Belanja Waserda</h3>
              <p className="text-xs text-stone-500 mt-0.5">
                Input penjualan ATK, seragam & sembako (tunai, transfer, potong gaji).
              </p>
            </div>
            <div className="mt-3 text-xs font-semibold text-emerald-800 flex items-center gap-1">
              <span>Buka Layar Kasir</span>
              <span>→</span>
            </div>
          </button>

          {/* 2. Input Angsuran USP (3% Menurun) */}
          <button
            onClick={() => onNavigateTab('usp')}
            className="text-left p-4 rounded-xl border border-stone-200 bg-white hover:border-emerald-600 hover:shadow-xs transition-all flex flex-col justify-between cursor-pointer group"
          >
            <div className="flex items-center justify-between">
              <div className="p-2 rounded-lg bg-emerald-100 text-emerald-800 group-hover:bg-emerald-800 group-hover:text-white transition-colors">
                <Coins className="w-5 h-5" />
              </div>
              <span className="text-[11px] font-semibold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded">
                Uang Masuk
              </span>
            </div>
            <div className="mt-4">
              <h3 className="font-bold text-sm text-stone-900">2. Input Angsuran USP</h3>
              <p className="text-xs text-stone-500 mt-0.5">
                Penerimaan cicilan pinjaman anggota dengan bunga menurun 3%.
              </p>
            </div>
            <div className="mt-3 text-xs font-semibold text-emerald-800 flex items-center gap-1">
              <span>{pendingUSP.length} Pinjaman Aktif →</span>
            </div>
          </button>

          {/* 3. Input Angsuran Kredit Barang (5%) */}
          <button
            onClick={() => onNavigateTab('kredit')}
            className="text-left p-4 rounded-xl border border-stone-200 bg-white hover:border-emerald-600 hover:shadow-xs transition-all flex flex-col justify-between cursor-pointer group"
          >
            <div className="flex items-center justify-between">
              <div className="p-2 rounded-lg bg-emerald-100 text-emerald-800 group-hover:bg-emerald-800 group-hover:text-white transition-colors">
                <Laptop className="w-5 h-5" />
              </div>
              <span className="text-[11px] font-semibold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded">
                Uang Masuk
              </span>
            </div>
            <div className="mt-4">
              <h3 className="font-bold text-sm text-stone-900">3. Input Angsuran Kredit Barang</h3>
              <p className="text-xs text-stone-500 mt-0.5">
                Penerimaan cicilan pengadaan laptop, barang & elektronik (margin 5%).
              </p>
            </div>
            <div className="mt-3 text-xs font-semibold text-emerald-800 flex items-center gap-1">
              <span>{pendingCredits.length} Kredit Aktif →</span>
            </div>
          </button>

          {/* 4. Setoran Simpanan Wajib */}
          <button
            onClick={() => onNavigateTab('simpanan')}
            className="text-left p-4 rounded-xl border border-stone-200 bg-white hover:border-emerald-600 hover:shadow-xs transition-all flex flex-col justify-between cursor-pointer group"
          >
            <div className="flex items-center justify-between">
              <div className="p-2 rounded-lg bg-emerald-100 text-emerald-800 group-hover:bg-emerald-800 group-hover:text-white transition-colors">
                <PiggyBank className="w-5 h-5" />
              </div>
              <span className="text-[11px] font-semibold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded">
                Uang Masuk
              </span>
            </div>
            <div className="mt-4">
              <h3 className="font-bold text-sm text-stone-900">4. Setoran Simpanan Wajib</h3>
              <p className="text-xs text-stone-500 mt-0.5">
                Input setoran iuran wajib bulanan PNS/PPPK (100rb) dan Honorer (50rb).
              </p>
            </div>
            <div className="mt-3 text-xs font-semibold text-emerald-800 flex items-center gap-1">
              <span>Input Iuran Anggota →</span>
            </div>
          </button>

          {/* 5. Setor & Tarik Simpanan Sukarela */}
          <button
            onClick={() => onNavigateTab('simpanan')}
            className="text-left p-4 rounded-xl border border-stone-200 bg-white hover:border-emerald-600 hover:shadow-xs transition-all flex flex-col justify-between cursor-pointer group"
          >
            <div className="flex items-center justify-between">
              <div className="p-2 rounded-lg bg-emerald-100 text-emerald-800 group-hover:bg-emerald-800 group-hover:text-white transition-colors">
                <ArrowUpRight className="w-5 h-5" />
              </div>
              <span className="text-[11px] font-semibold text-stone-700 bg-stone-100 px-2 py-0.5 rounded">
                Masuk & Keluar
              </span>
            </div>
            <div className="mt-4">
              <h3 className="font-bold text-sm text-stone-900">5. Simpanan Sukarela</h3>
              <p className="text-xs text-stone-500 mt-0.5">
                Input setoran tabungan bebas dan proses penarikan dana sukarela anggota.
              </p>
            </div>
            <div className="mt-3 text-xs font-semibold text-emerald-800 flex items-center gap-1">
              <span>Buka Tabungan Sukarela →</span>
            </div>
          </button>

          {/* 6. Input Kas Keluar Operasional */}
          <button
            onClick={() => onNavigateTab('buku-kas')}
            className="text-left p-4 rounded-xl border border-stone-200 bg-white hover:border-red-600 hover:shadow-xs transition-all flex flex-col justify-between cursor-pointer group"
          >
            <div className="flex items-center justify-between">
              <div className="p-2 rounded-lg bg-red-100 text-red-800 group-hover:bg-red-800 group-hover:text-white transition-colors">
                <ArrowDownLeft className="w-5 h-5" />
              </div>
              <span className="text-[11px] font-semibold text-red-800 bg-red-50 px-2 py-0.5 rounded">
                Uang Keluar
              </span>
            </div>
            <div className="mt-4">
              <h3 className="font-bold text-sm text-stone-900">6. Input Kas Keluar / Operasional</h3>
              <p className="text-xs text-stone-500 mt-0.5">
                Catat belanja operasional, kulakan stok waserda, atau beban kantor.
              </p>
            </div>
            <div className="mt-3 text-xs font-semibold text-red-700 flex items-center gap-1">
              <span>Input Pengeluaran Kas →</span>
            </div>
          </button>

        </div>
      </div>

      {/* Recent Cash Flow Log */}
      <div className="bg-white rounded-xl border border-stone-200 p-5 shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-sm text-stone-900 flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-teal-800" />
            5 Transaksi Terakhir di Kasir
          </h3>
          <button
            onClick={() => onNavigateTab('buku-kas')}
            className="text-xs text-teal-800 hover:underline font-medium cursor-pointer"
          >
            Lihat Buku Kas Umum Selengkapnya
          </button>
        </div>

        <div className="overflow-x-auto border border-stone-200 rounded-lg">
          <table className="w-full text-xs text-left text-stone-700 font-mono">
            <thead className="bg-stone-50 border-b border-stone-200 font-semibold text-stone-900 uppercase text-[10px] font-sans">
              <tr>
                <th className="px-4 py-2.5">No. Ref</th>
                <th className="px-4 py-2.5">Waktu</th>
                <th className="px-4 py-2.5">Kategori</th>
                <th className="px-4 py-2.5">Uraian</th>
                <th className="px-4 py-2.5 text-right">Nominal</th>
                <th className="px-4 py-2.5 text-right">Saldo Kas</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {todayTransactions.map((t) => (
                <tr key={t.id} className="hover:bg-stone-50/70">
                  <td className="px-4 py-2.5 font-bold text-stone-900">{t.refNo}</td>
                  <td className="px-4 py-2.5 text-stone-500 font-sans">{formatDate(t.date)}</td>
                  <td className="px-4 py-2.5 font-sans uppercase text-[11px] text-stone-600">
                    {t.category.replace(/_/g, ' ')}
                  </td>
                  <td className="px-4 py-2.5 font-sans font-medium text-stone-900">{t.title}</td>
                  <td className={`px-4 py-2.5 text-right font-bold ${t.type === 'in' ? 'text-emerald-800' : 'text-red-600'}`}>
                    {t.type === 'in' ? '+' : '-'}{formatRupiah(t.amount)}
                  </td>
                  <td className="px-4 py-2.5 text-right font-bold text-stone-900">
                    {formatRupiah(t.balanceAfter)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};
