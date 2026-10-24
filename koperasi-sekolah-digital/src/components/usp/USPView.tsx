import React, { useState } from 'react';
import { useCooperative } from '../../context/CooperativeContext';
import { USPLoan, USPAngsuran } from '../../types';
import { formatRupiah, formatDate, calculateUSPSchedule } from '../../utils/formatters';
import { PrintReceiptModal } from '../common/PrintReceiptModal';
import { 
  Calculator, 
  Coins, 
  Calendar, 
  CheckCircle2, 
  Clock, 
  Plus, 
  FileText, 
  ShieldAlert, 
  Receipt,
  ChevronRight,
  Info
} from 'lucide-react';

export const USPView: React.FC = () => {
  const { 
    currentUser, 
    uspLoans, 
    members, 
    applyUSPLoan, 
    approveUSPLoan, 
    rejectUSPLoan, 
    payUSPInstallment,
    config
  } = useCooperative();

  const isPengelola = currentUser.role === 'pengelola';
  const isStaffOrAdmin = currentUser.role === 'pengelola' || currentUser.role === 'pegawai';

  const [activeTab, setActiveTab] = useState<'loans' | 'simulator' | 'pending'>('loans');
  
  // Selected Loan for Detail Schedule Modal
  const [selectedLoan, setSelectedLoan] = useState<USPLoan | null>(null);

  // New Loan Form State
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [applyMemberId, setApplyMemberId] = useState('');
  const [applyAmount, setApplyAmount] = useState(10000000); // 10 juta default
  const [applyTenor, setApplyTenor] = useState(10); // 10 bulan default
  const [applyPurpose, setApplyPurpose] = useState('Keperluan Pendidikan & Keluarga');

  // Simulator State
  const [simAmount, setSimAmount] = useState(10000000);
  const [simTenor, setSimTenor] = useState(10);
  const simResult = calculateUSPSchedule(simAmount, simTenor, config.uspInterestRate);

  // Receipt Modal
  const [receiptData, setReceiptData] = useState<any | null>(null);

  const handleApplySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!applyMemberId || applyAmount <= 0 || applyTenor <= 0) return;

    applyUSPLoan(applyMemberId, applyAmount, applyTenor, applyPurpose);
    setShowApplyModal(false);
    setApplyMemberId('');
    setApplyAmount(10000000);
    setApplyTenor(10);
  };

  const handlePay = (loan: USPLoan, installment: USPAngsuran) => {
    if (confirm(`Konfirmasi pembayaran angsuran ke-${installment.installmentNumber} sebesar ${formatRupiah(installment.totalAmount)} untuk ${loan.memberName}?`)) {
      payUSPInstallment(loan.id, installment.installmentNumber);

      // Buka bukti pembayaran
      setReceiptData({
        title: 'Bukti Pembayaran Angsuran USP',
        receiptNo: `KW-USP-${Date.now().toString().slice(-6)}`,
        date: new Date().toISOString(),
        memberName: loan.memberName,
        cashierName: currentUser.name,
        category: 'USP Bunga Menurun 3%',
        breakdown: [
          { label: 'Nomor Pinjaman', value: loan.loanNo, isBold: false },
          { label: 'Angsuran Bulan Ke', value: `${installment.installmentNumber} dari ${loan.tenorMonths} bulan`, isBold: false },
          { label: 'Cicilan Pokok', value: formatRupiah(installment.pokokAmount), isBold: false },
          { label: `Bunga Menurun 3% (dari sisa ${formatRupiah(installment.sisaPokokAwal)})`, value: formatRupiah(installment.interestAmount), isBold: false },
          { label: 'Sisa Pokok Setelah Bayar', value: formatRupiah(installment.sisaPokokAkhir), isBold: true },
        ],
        totalAmount: installment.totalAmount,
        notes: `Pembayaran cicilan USP ke-${installment.installmentNumber}`,
      });

      // Update selectedLoan view modal jika sedang dibuka
      setSelectedLoan((prev) => {
        if (!prev || prev.id !== loan.id) return prev;
        const updated = uspLoans.find((l) => l.id === loan.id);
        return updated || null;
      });
    }
  };

  const totalPlafonUSP = uspLoans.reduce((acc, l) => acc + l.amount, 0);
  const totalSisaPokokUSP = uspLoans
    .filter((l) => l.status === 'active')
    .reduce((acc, l) => acc + l.remainingPrincipal, 0);
  const totalBungaTerbayar = uspLoans.reduce((acc, l) => acc + l.totalInterestPaid, 0);

  const pendingLoans = uspLoans.filter((l) => l.status === 'pending_approval');
  const activeLoans = uspLoans.filter((l) => l.status === 'active' || l.status === 'completed');

  return (
    <div className="space-y-6">
      
      {/* Banner & Information */}
      <div className="bg-white rounded-xl border border-stone-200 p-5 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-2 rounded-lg bg-emerald-100 text-emerald-800">
                <Coins className="w-5 h-5" />
              </span>
              <div>
                <h1 className="text-xl font-bold text-stone-900">
                  2. USP (Usaha Simpan Pinjam)
                </h1>
                <p className="text-xs text-stone-500">
                  Layanan pinjaman anggota dengan suku bunga <strong className="text-emerald-800 font-mono">3% Menurun (Declining Balance)</strong>. Bunga dihitung dari sisa pokok tiap bulan.
                </p>
              </div>
            </div>
          </div>

          {/* Quick Metrics */}
          <div className="flex flex-wrap items-center gap-3 text-xs font-mono">
            <div className="bg-stone-50 border border-stone-200 rounded-lg p-2.5 px-3">
              <span className="text-stone-500 block text-[10px] font-sans">Total Sisa Piutang Pokok</span>
              <span className="text-stone-900 font-bold">{formatRupiah(totalSisaPokokUSP)}</span>
            </div>
            <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-2.5 px-3">
              <span className="text-emerald-700 block text-[10px] font-sans">Pendapatan Bunga 3% Terbayar</span>
              <span className="text-emerald-900 font-bold">{formatRupiah(totalBungaTerbayar)}</span>
            </div>
          </div>
        </div>

        {/* Formula Explanation Callout */}
        <div className="mt-4 bg-stone-50 rounded-xl p-3.5 border border-stone-200 text-xs text-stone-700 flex items-start gap-2.5">
          <Info className="w-4 h-4 text-emerald-800 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <div className="font-semibold text-stone-900">
              Prinsip Perhitungan Suku Bunga 3% Menurun:
            </div>
            <p className="text-[11px] text-stone-600 leading-relaxed">
              Misal pinjaman <strong>Rp 10.000.000</strong> tenor <strong>10 bulan</strong> (Pokok tetap Rp 1.000.000/bln):
              <br />
              • Bulan 1: Sisa pokok Rp 10.000.000 → Bunga 3% = Rp 300.000 → Cicilan: <strong className="text-emerald-800 font-mono">Rp 1.300.000</strong> (Sisa pokok jadi Rp 9.000.000)
              <br />
              • Bulan 2: Sisa pokok Rp 9.000.000 → Bunga 3% = Rp 270.000 → Cicilan: <strong className="text-emerald-800 font-mono">Rp 1.270.000</strong> (Sisa pokok jadi Rp 8.000.000)
              <br />
              • Bulan 3: Sisa pokok Rp 8.000.000 → Bunga 3% = Rp 240.000 → Cicilan: <strong className="text-emerald-800 font-mono">Rp 1.240.000</strong> dan seterusnya makin mengecil setiap bulan.
            </p>
          </div>
        </div>

        {/* Tab Buttons */}
        <div className="flex items-center justify-between mt-5 border-t border-stone-100 pt-3">
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setActiveTab('loans')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 cursor-pointer transition-colors ${
                activeTab === 'loans'
                  ? 'bg-emerald-800 text-white shadow-xs'
                  : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100'
              }`}
            >
              <FileText className="w-4 h-4" />
              <span>Daftar Pinjaman ({activeLoans.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('simulator')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 cursor-pointer transition-colors ${
                activeTab === 'simulator'
                  ? 'bg-emerald-800 text-white shadow-xs'
                  : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100'
              }`}
            >
              <Calculator className="w-4 h-4" />
              <span>Simulasi & Tabel Angsuran 3%</span>
            </button>

            {isPengelola && pendingLoans.length > 0 && (
              <button
                onClick={() => setActiveTab('pending')}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 cursor-pointer transition-colors ${
                  activeTab === 'pending'
                    ? 'bg-amber-700 text-white shadow-xs'
                    : 'text-amber-800 bg-amber-50 hover:bg-amber-100'
                }`}
              >
                <Clock className="w-4 h-4" />
                <span>Persetujuan ({pendingLoans.length})</span>
              </button>
            )}
          </div>

          {isStaffOrAdmin && (
            <button
              onClick={() => setShowApplyModal(true)}
              className="px-3.5 py-1.5 bg-emerald-800 hover:bg-emerald-900 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 cursor-pointer shadow-xs"
            >
              <Plus className="w-4 h-4" />
              <span>Ajukan Pinjaman USP</span>
            </button>
          )}
        </div>
      </div>

      {/* TAB 1: DAFTAR PINJAMAN AKTIF & SELESAI */}
      {activeTab === 'loans' && (
        <div className="bg-white rounded-xl border border-stone-200 p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-sm text-stone-900">Pinjaman Berjalan & Riwayat USP</h3>
            <span className="text-xs text-stone-500">Klik "Rincian Angsuran" untuk jadwal bulanan dan pembayaran cicilan</span>
          </div>

          <div className="overflow-x-auto border border-stone-200 rounded-lg">
            <table className="w-full text-xs text-left text-stone-700">
              <thead className="bg-stone-50 border-b border-stone-200 font-semibold text-stone-900 uppercase text-[10px]">
                <tr>
                  <th className="px-4 py-3">No. Pinjaman</th>
                  <th className="px-4 py-3">Nama Anggota</th>
                  <th className="px-4 py-3">Plafon Pinjaman</th>
                  <th className="px-4 py-3 text-center">Tenor</th>
                  <th className="px-4 py-3">Sisa Pokok</th>
                  <th className="px-4 py-3">Bunga 3% Terbayar</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3 text-center">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {activeLoans.map((loan) => {
                  const paidCount = loan.schedule.filter((s) => s.status === 'paid').length;
                  return (
                    <tr key={loan.id} className="hover:bg-stone-50/70 transition-colors">
                      <td className="px-4 py-3 font-mono font-bold text-stone-900">{loan.loanNo}</td>
                      <td className="px-4 py-3">
                        <div className="font-medium text-stone-900">{loan.memberName}</div>
                        <div className="text-[10px] text-stone-400">{loan.purpose}</div>
                      </td>
                      <td className="px-4 py-3 font-mono font-semibold text-stone-900">
                        {formatRupiah(loan.amount)}
                      </td>
                      <td className="px-4 py-3 text-center font-mono">
                        {paidCount}/{loan.tenorMonths} bln
                      </td>
                      <td className="px-4 py-3 font-mono font-bold text-stone-900">
                        {formatRupiah(loan.remainingPrincipal)}
                      </td>
                      <td className="px-4 py-3 font-mono text-emerald-800 font-semibold">
                        {formatRupiah(loan.totalInterestPaid)}
                      </td>
                      <td className="px-4 py-3">
                        {loan.status === 'completed' ? (
                          <span className="text-[11px] font-semibold text-emerald-800">
                            LUNAS
                          </span>
                        ) : (
                          <span className="text-[11px] font-semibold text-teal-800">
                            Aktif ({loan.tenorMonths - paidCount} bln lagi)
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <button
                          onClick={() => setSelectedLoan(loan)}
                          className="px-3 py-1.5 bg-stone-100 hover:bg-emerald-50 hover:text-emerald-900 text-stone-700 rounded-lg font-medium text-[11px] inline-flex items-center gap-1 cursor-pointer transition-colors"
                        >
                          <span>Rincian Angsuran</span>
                          <ChevronRight className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 2: SIMULATOR & TABEL ANGSURAN 3% MENURUN */}
      {activeTab === 'simulator' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Controls (Col 4) */}
          <div className="lg:col-span-4">
            <div className="bg-white rounded-xl border border-stone-200 p-5 shadow-xs space-y-4">
              <h3 className="font-bold text-sm text-stone-900 flex items-center gap-2">
                <Calculator className="w-4 h-4 text-emerald-800" />
                Simulasi Bunga 3% Menurun
              </h3>
              <p className="text-xs text-stone-500">
                Ubah nominal dan jangka waktu untuk melihat penurunan nilai cicilan setiap bulannya.
              </p>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Plafon Pinjaman (Rp)
                </label>
                <input
                  type="number"
                  step="500000"
                  min="500000"
                  value={simAmount}
                  onChange={(e) => setSimAmount(Number(e.target.value))}
                  className="w-full text-xs font-mono p-2.5 bg-stone-50 border border-stone-300 rounded-lg focus:outline-emerald-800"
                />
                <div className="flex gap-2 mt-1.5">
                  {[5000000, 10000000, 15000000].map((val) => (
                    <button
                      key={val}
                      type="button"
                      onClick={() => setSimAmount(val)}
                      className="px-2 py-1 text-[10px] font-mono bg-stone-100 hover:bg-stone-200 rounded text-stone-700 cursor-pointer"
                    >
                      {formatRupiah(val)}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Jangka Waktu (Tenor Bulan)
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {[6, 10, 12, 24].map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setSimTenor(t)}
                      className={`py-2 text-xs font-mono font-medium rounded-lg border cursor-pointer ${
                        simTenor === t
                          ? 'border-emerald-700 bg-emerald-50 text-emerald-900 font-bold'
                          : 'border-stone-200 text-stone-600 hover:bg-stone-50'
                      }`}
                    >
                      {t} bln
                    </button>
                  ))}
                </div>
              </div>

              <div className="p-3 bg-stone-50 rounded-lg border border-stone-200 space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-stone-500">Pokok per Bulan (Tetap):</span>
                  <span className="font-mono font-bold text-stone-900">
                    {formatRupiah(Math.round(simAmount / simTenor))}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-stone-500">Angsuran Bulan Pertama:</span>
                  <span className="font-mono font-bold text-emerald-800">
                    {formatRupiah(simResult.schedule[0]?.totalAmount || 0)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-stone-500">Angsuran Bulan Terakhir:</span>
                  <span className="font-mono font-bold text-emerald-800">
                    {formatRupiah(simResult.schedule[simResult.schedule.length - 1]?.totalAmount || 0)}
                  </span>
                </div>
                <div className="flex justify-between border-t border-stone-200 pt-2 font-semibold">
                  <span className="text-stone-700">Total Bunga 3% Terproyeksi:</span>
                  <span className="font-mono text-emerald-900">
                    {formatRupiah(simResult.totalInterest)}
                  </span>
                </div>
              </div>

            </div>
          </div>

          {/* Table (Col 8) */}
          <div className="lg:col-span-8">
            <div className="bg-white rounded-xl border border-stone-200 p-5 shadow-xs space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-sm text-stone-900">
                    Tabel Jadwal Angsuran Bunga 3% Menurun
                  </h3>
                  <p className="text-xs text-stone-500">
                    Pinjaman {formatRupiah(simAmount)} selama {simTenor} bulan (3% per bulan dari sisa pokok)
                  </p>
                </div>
              </div>

              <div className="overflow-x-auto border border-stone-200 rounded-lg">
                <table className="w-full text-xs text-left text-stone-700">
                  <thead className="bg-stone-50 border-b border-stone-200 font-semibold text-stone-900 uppercase text-[10px]">
                    <tr>
                      <th className="px-3 py-2.5 text-center">Bulan</th>
                      <th className="px-3 py-2.5 text-right">Sisa Pokok Awal</th>
                      <th className="px-3 py-2.5 text-right">Cicilan Pokok</th>
                      <th className="px-3 py-2.5 text-right">Bunga 3%</th>
                      <th className="px-3 py-2.5 text-right font-bold text-emerald-900">Total Angsuran</th>
                      <th className="px-3 py-2.5 text-right">Sisa Pokok Akhir</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-100 font-mono">
                    {simResult.schedule.map((item) => (
                      <tr key={item.installmentNumber} className="hover:bg-stone-50/70">
                        <td className="px-3 py-2 text-center font-bold font-sans">
                          Ke-{item.installmentNumber}
                        </td>
                        <td className="px-3 py-2 text-right text-stone-500">
                          {formatRupiah(item.sisaPokokAwal)}
                        </td>
                        <td className="px-3 py-2 text-right text-stone-900">
                          {formatRupiah(item.pokokAmount)}
                        </td>
                        <td className="px-3 py-2 text-right text-emerald-700 font-medium">
                          {formatRupiah(item.interestAmount)}
                        </td>
                        <td className="px-3 py-2 text-right font-bold text-emerald-900 bg-emerald-50/30">
                          {formatRupiah(item.totalAmount)}
                        </td>
                        <td className="px-3 py-2 text-right text-stone-400">
                          {formatRupiah(item.sisaPokokAkhir)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot className="bg-stone-100 font-mono font-bold text-stone-900 text-xs">
                    <tr>
                      <td colSpan={2} className="px-3 py-2.5 font-sans">TOTAL KESELURUHAN</td>
                      <td className="px-3 py-2.5 text-right">{formatRupiah(simAmount)}</td>
                      <td className="px-3 py-2.5 text-right text-emerald-800">{formatRupiah(simResult.totalInterest)}</td>
                      <td className="px-3 py-2.5 text-right text-emerald-900">{formatRupiah(simResult.totalPayment)}</td>
                      <td className="px-3 py-2.5 text-right">Rp 0</td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>
          </div>

        </div>
      )}

      {/* TAB 3: PERSETUJUAN PINJAMAN (KHUSUS PENGELOLA) */}
      {activeTab === 'pending' && isPengelola && (
        <div className="bg-white rounded-xl border border-stone-200 p-5 shadow-xs space-y-4">
          <div>
            <h3 className="font-bold text-sm text-stone-900">Permohonan Pinjaman Menunggu Persetujuan</h3>
            <p className="text-xs text-stone-500">Wewenang mutlak pengelola untuk menyetujui atau menolak pencairan dana koperasi.</p>
          </div>

          <div className="space-y-3">
            {pendingLoans.map((loan) => (
              <div
                key={loan.id}
                className="p-4 rounded-xl border border-amber-200 bg-amber-50/40 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-stone-900 text-sm">{loan.memberName}</span>
                    <span className="text-[11px] font-mono text-stone-500">#{loan.loanNo}</span>
                  </div>
                  <div className="text-xs text-stone-600 mt-1">
                    Tujuan: <strong>{loan.purpose}</strong> · Tenor: <strong>{loan.tenorMonths} bulan</strong>
                  </div>
                  <div className="text-xs font-mono font-bold text-emerald-800 mt-1">
                    Plafon: {formatRupiah(loan.amount)}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      if (confirm(`Tolak permohonan pinjaman ${loan.memberName}?`)) {
                        rejectUSPLoan(loan.id);
                      }
                    }}
                    className="px-3 py-1.5 text-xs font-medium text-stone-700 bg-white border border-stone-300 hover:bg-stone-100 rounded-lg cursor-pointer"
                  >
                    Tolak
                  </button>
                  <button
                    onClick={() => {
                      if (confirm(`Setujui & cairkan pinjaman ${loan.memberName} sebesar ${formatRupiah(loan.amount)} dari kas koperasi?`)) {
                        approveUSPLoan(loan.id);
                      }
                    }}
                    className="px-4 py-1.5 text-xs font-semibold text-white bg-emerald-800 hover:bg-emerald-900 rounded-lg cursor-pointer"
                  >
                    Setujui & Cairkan Dana
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* DETAIL SCHEDULE MODAL FOR A LOAN */}
      {selectedLoan && (
        <div className="fixed inset-0 bg-stone-900/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-3xl w-full p-6 shadow-2xl border border-stone-200 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-stone-200">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-bold text-stone-900">
                    Jadwal Angsuran Bunga Menurun 3% - {selectedLoan.memberName}
                  </h3>
                  <span className="text-xs font-mono text-stone-500">#{selectedLoan.loanNo}</span>
                </div>
                <p className="text-xs text-stone-500">
                  Plafon: {formatRupiah(selectedLoan.amount)} · Tenor: {selectedLoan.tenorMonths} bulan · Sisa Pokok: {formatRupiah(selectedLoan.remainingPrincipal)}
                </p>
              </div>
              <button
                onClick={() => setSelectedLoan(null)}
                className="px-3 py-1.5 text-xs text-stone-500 hover:text-stone-800 hover:bg-stone-100 rounded-lg cursor-pointer"
              >
                Tutup
              </button>
            </div>

            {/* Table */}
            <div className="mt-4 overflow-x-auto border border-stone-200 rounded-lg">
              <table className="w-full text-xs text-left text-stone-700 font-mono">
                <thead className="bg-stone-50 border-b border-stone-200 font-semibold text-stone-900 uppercase text-[10px]">
                  <tr>
                    <th className="px-3 py-2.5 text-center font-sans">Bulan</th>
                    <th className="px-3 py-2.5 text-right">Sisa Pokok Awal</th>
                    <th className="px-3 py-2.5 text-right">Pokok</th>
                    <th className="px-3 py-2.5 text-right">Bunga 3%</th>
                    <th className="px-3 py-2.5 text-right font-bold text-emerald-900">Total Angsuran</th>
                    <th className="px-3 py-2.5 text-right">Sisa Pokok</th>
                    <th className="px-3 py-2.5 text-center font-sans">Status</th>
                    {isStaffOrAdmin && <th className="px-3 py-2.5 text-center font-sans">Input Kasir</th>}
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                  {selectedLoan.schedule.map((item) => (
                    <tr key={item.installmentNumber} className={item.status === 'paid' ? 'bg-emerald-50/20' : ''}>
                      <td className="px-3 py-2 text-center font-sans font-medium">Ke-{item.installmentNumber}</td>
                      <td className="px-3 py-2 text-right text-stone-500">{formatRupiah(item.sisaPokokAwal)}</td>
                      <td className="px-3 py-2 text-right text-stone-900">{formatRupiah(item.pokokAmount)}</td>
                      <td className="px-3 py-2 text-right text-emerald-700">{formatRupiah(item.interestAmount)}</td>
                      <td className="px-3 py-2 text-right font-bold text-emerald-900">{formatRupiah(item.totalAmount)}</td>
                      <td className="px-3 py-2 text-right text-stone-500">{formatRupiah(item.sisaPokokAkhir)}</td>
                      <td className="px-3 py-2 text-center font-sans">
                        {item.status === 'paid' ? (
                          <span className="text-[10px] font-semibold text-emerald-800">
                            Lunas ({formatDate(item.paidDate || '')})
                          </span>
                        ) : (
                          <span className="text-[10px] font-medium text-amber-700">Belum Bayar</span>
                        )}
                      </td>
                      {isStaffOrAdmin && (
                        <td className="px-3 py-2 text-center font-sans">
                          {item.status === 'paid' ? (
                            <button
                              onClick={() => {
                                setReceiptData({
                                  title: 'Bukti Pembayaran Angsuran USP',
                                  receiptNo: `KW-USP-${item.installmentNumber}`,
                                  date: item.paidDate || new Date().toISOString(),
                                  memberName: selectedLoan.memberName,
                                  cashierName: item.cashierName || currentUser.name,
                                  category: 'USP Bunga Menurun 3%',
                                  breakdown: [
                                    { label: 'Nomor Pinjaman', value: selectedLoan.loanNo },
                                    { label: 'Angsuran Bulan Ke', value: `${item.installmentNumber} dari ${selectedLoan.tenorMonths} bulan` },
                                    { label: 'Pokok', value: formatRupiah(item.pokokAmount) },
                                    { label: 'Bunga 3% Menurun', value: formatRupiah(item.interestAmount) },
                                  ],
                                  totalAmount: item.totalAmount,
                                });
                              }}
                              className="px-2 py-0.5 text-[10px] bg-stone-100 hover:bg-stone-200 text-stone-700 rounded cursor-pointer"
                            >
                              Struk
                            </button>
                          ) : (
                            <button
                              onClick={() => handlePay(selectedLoan, item)}
                              className="px-2.5 py-1 text-[11px] bg-emerald-800 hover:bg-emerald-900 text-white rounded font-medium cursor-pointer"
                            >
                              Bayar
                            </button>
                          )}
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

          </div>
        </div>
      )}

      {/* NEW LOAN APPLICATION MODAL */}
      {showApplyModal && (
        <div className="fixed inset-0 bg-stone-900/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-stone-200">
            <h3 className="text-base font-bold text-stone-900 mb-2">Form Pengajuan Pinjaman USP</h3>
            <p className="text-xs text-stone-500 mb-4">
              Pinjaman dengan sistem perhitungan bunga menurun 3% per bulan.
            </p>

            <form onSubmit={handleApplySubmit} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Pilih Anggota Peminjam
                </label>
                <select
                  required
                  value={applyMemberId}
                  onChange={(e) => setApplyMemberId(e.target.value)}
                  className="w-full text-xs p-2.5 bg-stone-50 border border-stone-300 rounded-lg text-stone-800 focus:outline-emerald-800"
                >
                  <option value="">-- Pilih Anggota --</option>
                  {members.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.memberNo} - {m.name} ({m.employmentStatus})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Jumlah Pinjaman (Rp)
                </label>
                <input
                  type="number"
                  min="500000"
                  step="500000"
                  required
                  value={applyAmount}
                  onChange={(e) => setApplyAmount(Number(e.target.value))}
                  className="w-full text-xs font-mono p-2.5 bg-stone-50 border border-stone-300 rounded-lg focus:outline-emerald-800"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Jangka Waktu (Tenor Bulan)
                </label>
                <select
                  value={applyTenor}
                  onChange={(e) => setApplyTenor(Number(e.target.value))}
                  className="w-full text-xs p-2.5 bg-stone-50 border border-stone-300 rounded-lg text-stone-800 focus:outline-emerald-800"
                >
                  <option value={3}>3 Bulan</option>
                  <option value={6}>6 Bulan</option>
                  <option value={10}>10 Bulan (Rekomendasi)</option>
                  <option value={12}>12 Bulan (1 Tahun)</option>
                  <option value={18}>18 Bulan</option>
                  <option value={24}>24 Bulan (2 Tahun)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Keperluan / Alasan Pinjaman
                </label>
                <textarea
                  required
                  rows={2}
                  value={applyPurpose}
                  onChange={(e) => setApplyPurpose(e.target.value)}
                  placeholder="Misal: Biaya pendidikan anak, renovasi rumah..."
                  className="w-full text-xs p-2.5 bg-stone-50 border border-stone-300 rounded-lg text-stone-800 focus:outline-emerald-800"
                />
              </div>

              {/* Preview Ringkasan */}
              <div className="p-3 bg-stone-50 rounded-lg border border-stone-200 text-[11px] space-y-1 font-mono">
                <div className="flex justify-between">
                  <span className="text-stone-500 font-sans">Pokok Bulanan:</span>
                  <span>{formatRupiah(Math.round(applyAmount / applyTenor))}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-stone-500 font-sans">Bunga Bulan 1 (3%):</span>
                  <span className="text-emerald-800">{formatRupiah(applyAmount * 0.03)}</span>
                </div>
                <div className="flex justify-between font-bold pt-1 border-t border-stone-200">
                  <span className="text-stone-700 font-sans">Cicilan Bulan 1:</span>
                  <span className="text-emerald-900">{formatRupiah(Math.round(applyAmount / applyTenor) + (applyAmount * 0.03))}</span>
                </div>
              </div>

              <div className="mt-5 flex items-center justify-end gap-2 pt-3 border-t border-stone-200">
                <button
                  type="button"
                  onClick={() => setShowApplyModal(false)}
                  className="px-4 py-2 text-xs font-medium text-stone-600 hover:bg-stone-100 rounded-lg cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-semibold bg-emerald-800 hover:bg-emerald-900 text-white rounded-lg cursor-pointer"
                >
                  {isPengelola ? 'Setujui & Terbitkan' : 'Kirim Pengajuan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Printable Receipt */}
      <PrintReceiptModal data={receiptData} onClose={() => setReceiptData(null)} />

    </div>
  );
};
