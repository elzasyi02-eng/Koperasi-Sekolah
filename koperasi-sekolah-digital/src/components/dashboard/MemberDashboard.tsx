import React, { useState } from 'react';
import { useCooperative } from '../../context/CooperativeContext';
import { 
  formatRupiah, 
  formatDate, 
  getEmploymentLabel, 
  calculateUSPSchedule, 
  calculateCreditSchedule 
} from '../../utils/formatters';
import { PrintReceiptModal } from '../common/PrintReceiptModal';
import { 
  User, 
  PiggyBank, 
  Coins, 
  Laptop, 
  ShoppingBag, 
  Calculator, 
  Printer, 
  Plus, 
  FileText, 
  Receipt,
  CheckCircle2,
  AlertCircle,
  Clock,
  ShieldCheck
} from 'lucide-react';

export const MemberDashboard: React.FC = () => {
  const { 
    currentUser, 
    members, 
    products,
    getMemberSimpananWajibTotal, 
    getMemberSimpananSukarelaTotal,
    getMemberActiveLoans, 
    getMemberActiveCredits, 
    getMemberWaserdaHistory, 
    getMemberSimpananRecords,
    applyUSPLoan,
    applyGoodsCredit,
    config
  } = useCooperative();

  // Find linked member profile
  const member = members.find((m) => m.id === currentUser.memberId) || members[0];
  const empInfo = getEmploymentLabel(member.employmentStatus);

  const [activeTab, setActiveTab] = useState<'overview' | 'simpanan' | 'usp' | 'kredit' | 'waserda' | 'calculator'>('overview');

  // Member Loan Application Form Modal
  const [showLoanModal, setShowLoanModal] = useState(false);
  const [loanAmount, setLoanAmount] = useState(5000000);
  const [loanTenor, setLoanTenor] = useState(10);
  const [loanPurpose, setLoanPurpose] = useState('Keperluan Pendidikan Anak');

  // Member Credit Application Form Modal
  const [showCreditModal, setShowCreditModal] = useState(false);
  const [creditGoodsName, setCreditGoodsName] = useState('Smartphone Android Samsung / Xiaomi');
  const [creditPrice, setCreditPrice] = useState(4000000);
  const [creditTenor, setCreditTenor] = useState(6);
  const [creditVendor, setCreditVendor] = useState('Erafone Mall');
  const [creditDesc, setCreditDesc] = useState('Penunjang komunikasi guru');

  // Receipt Modal
  const [receiptData, setReceiptData] = useState<any | null>(null);

  // Queries for this member only
  const simpananWajibTotal = getMemberSimpananWajibTotal(member.id);
  const simpananSukarelaTotal = getMemberSimpananSukarelaTotal(member.id);
  const totalSimpanan = simpananWajibTotal + simpananSukarelaTotal;

  const myLoans = getMemberActiveLoans(member.id);
  const myCredits = getMemberActiveCredits(member.id);
  const myWaserda = getMemberWaserdaHistory(member.id);
  const mySimpananRecords = getMemberSimpananRecords(member.id);

  const totalSisaPokokUSP = myLoans
    .filter((l) => l.status === 'active')
    .reduce((acc, l) => acc + l.remainingPrincipal, 0);

  const totalSisaKredit = myCredits
    .filter((c) => c.status === 'active')
    .reduce((acc, c) => acc + c.remainingAmount, 0);

  const totalKewajiban = totalSisaPokokUSP + totalSisaKredit;

  const handleApplyLoan = (e: React.FormEvent) => {
    e.preventDefault();
    applyUSPLoan(member.id, loanAmount, loanTenor, loanPurpose);
    setShowLoanModal(false);
    alert('Permohonan pinjaman berhasil dikirim! Menunggu persetujuan pengelola koperasi.');
  };

  const handleApplyCredit = (e: React.FormEvent) => {
    e.preventDefault();
    applyGoodsCredit(member.id, creditGoodsName, creditPrice, creditTenor, creditVendor, creditDesc);
    setShowCreditModal(false);
    alert('Permohonan kredit barang berhasil dikirim! Menunggu persetujuan pengelola koperasi.');
  };

  return (
    <div className="space-y-6">
      
      {/* Profile & Privacy Guarantee Header */}
      <div className="bg-white rounded-xl border border-stone-200 p-5 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start sm:items-center gap-3.5">
            <div className="w-12 h-12 rounded-xl bg-emerald-800 text-white flex items-center justify-center font-bold text-lg shrink-0 shadow-xs">
              {member.name.slice(0, 2).toUpperCase()}
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-xl font-bold text-stone-900">{member.name}</h1>
                <span className={`px-2.5 py-0.5 rounded text-[11px] font-semibold ${empInfo.badgeClass}`}>
                  {empInfo.label}
                </span>
                <span className="text-xs font-mono font-medium text-stone-500">
                  {member.memberNo}
                </span>
              </div>
              <p className="text-xs text-stone-500 mt-0.5">
                NIP/NIK: {member.nip || '-'} · Unit: {member.department} · Iuran Wajib: <strong className="text-emerald-800 font-mono">{formatRupiah(member.monthlyWajibAmount)}/bulan</strong>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="px-3 py-2 bg-stone-50 border border-stone-200 rounded-lg text-right">
              <span className="text-[10px] text-stone-400 block uppercase font-bold tracking-wider">Akses Akun</span>
              <span className="text-xs font-semibold text-stone-700 flex items-center gap-1 justify-end">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-700" />
                Data Pribadi Anggota
              </span>
            </div>
            <button
              onClick={() => window.print()}
              className="p-2.5 border border-stone-300 hover:bg-stone-50 rounded-lg text-stone-700 text-xs font-medium flex items-center gap-1.5 cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span className="hidden sm:inline">Cetak Buku Tabungan</span>
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-1.5 mt-5 border-t border-stone-100 pt-3 overflow-x-auto">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 cursor-pointer shrink-0 transition-colors ${
              activeTab === 'overview'
                ? 'bg-emerald-800 text-white shadow-xs'
                : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100'
            }`}
          >
            <PiggyBank className="w-4 h-4" />
            <span>Ringkasan Keuangan</span>
          </button>

          <button
            onClick={() => setActiveTab('simpanan')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 cursor-pointer shrink-0 transition-colors ${
              activeTab === 'simpanan'
                ? 'bg-emerald-800 text-white shadow-xs'
                : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>Simpanan Wajib & Sukarela</span>
          </button>

          <button
            onClick={() => setActiveTab('usp')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 cursor-pointer shrink-0 transition-colors ${
              activeTab === 'usp'
                ? 'bg-emerald-800 text-white shadow-xs'
                : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100'
            }`}
          >
            <Coins className="w-4 h-4" />
            <span>Pinjaman USP (3% Menurun)</span>
          </button>

          <button
            onClick={() => setActiveTab('kredit')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 cursor-pointer shrink-0 transition-colors ${
              activeTab === 'kredit'
                ? 'bg-emerald-800 text-white shadow-xs'
                : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100'
            }`}
          >
            <Laptop className="w-4 h-4" />
            <span>Kredit Barang (5%)</span>
          </button>

          <button
            onClick={() => setActiveTab('waserda')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 cursor-pointer shrink-0 transition-colors ${
              activeTab === 'waserda'
                ? 'bg-emerald-800 text-white shadow-xs'
                : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100'
            }`}
          >
            <ShoppingBag className="w-4 h-4" />
            <span>Belanja Waserda ({myWaserda.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('calculator')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 cursor-pointer shrink-0 transition-colors ${
              activeTab === 'calculator'
                ? 'bg-emerald-800 text-white shadow-xs'
                : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100'
            }`}
          >
            <Calculator className="w-4 h-4" />
            <span>Kalkulator Simulasi</span>
          </button>
        </div>
      </div>

      {/* TAB 1: RINGKASAN KEUANGAN SAYA */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          
          {/* 4 Cards Summary */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            
            {/* Simpanan Wajib */}
            <div className="bg-white rounded-xl border border-stone-200 p-4 shadow-xs">
              <span className="text-[11px] font-semibold text-stone-500 uppercase tracking-wider block">
                Simpanan Wajib Anda
              </span>
              <div className="text-xl font-bold font-mono text-emerald-800 mt-1">
                {formatRupiah(simpananWajibTotal)}
              </div>
              <p className="text-[11px] text-stone-500 mt-2">
                Tarif bulanan: <strong className="text-stone-800 font-mono">{formatRupiah(member.monthlyWajibAmount)}</strong>
              </p>
            </div>

            {/* Simpanan Sukarela */}
            <div className="bg-white rounded-xl border border-stone-200 p-4 shadow-xs">
              <span className="text-[11px] font-semibold text-stone-500 uppercase tracking-wider block">
                Simpanan Sukarela Anda
              </span>
              <div className="text-xl font-bold font-mono text-emerald-800 mt-1">
                {formatRupiah(simpananSukarelaTotal)}
              </div>
              <p className="text-[11px] text-stone-500 mt-2">
                Dapat ditarik sewaktu-waktu tanpa batas minimal
              </p>
            </div>

            {/* Sisa Pinjaman USP */}
            <div className="bg-white rounded-xl border border-stone-200 p-4 shadow-xs">
              <span className="text-[11px] font-semibold text-stone-500 uppercase tracking-wider block">
                Sisa Pokok USP (3% Menurun)
              </span>
              <div className="text-xl font-bold font-mono text-stone-900 mt-1">
                {formatRupiah(totalSisaPokokUSP)}
              </div>
              <p className="text-[11px] text-stone-500 mt-2">
                {myLoans.filter((l) => l.status === 'active').length} pinjaman aktif berjalan
              </p>
            </div>

            {/* Sisa Kredit Barang */}
            <div className="bg-white rounded-xl border border-stone-200 p-4 shadow-xs">
              <span className="text-[11px] font-semibold text-stone-500 uppercase tracking-wider block">
                Sisa Kredit Barang (5%)
              </span>
              <div className="text-xl font-bold font-mono text-stone-900 mt-1">
                {formatRupiah(totalSisaKredit)}
              </div>
              <p className="text-[11px] text-stone-500 mt-2">
                {myCredits.filter((c) => c.status === 'active').length} pengadaan barang aktif
              </p>
            </div>

          </div>

          {/* Quick Apply Banner */}
          <div className="bg-emerald-950 text-white rounded-xl p-5 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="font-bold text-base">Butuh Pinjaman Dana atau Pengadaan Barang?</h3>
              <p className="text-xs text-emerald-200 mt-1">
                Nikmati fasilitas USP dengan suku bunga 3% menurun atau kredit pengadaan barang sekolah dengan keuntungan 5%.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowLoanModal(true)}
                className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition-colors"
              >
                <Coins className="w-4 h-4" />
                <span>Ajukan USP</span>
              </button>
              <button
                onClick={() => setShowCreditModal(true)}
                className="px-3.5 py-2 bg-white text-emerald-950 hover:bg-emerald-50 rounded-lg text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition-colors"
              >
                <Laptop className="w-4 h-4" />
                <span>Ajukan Kredit Barang</span>
              </button>
            </div>
          </div>

          {/* Recent Activity by this Member */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* USP Active Preview */}
            <div className="bg-white rounded-xl border border-stone-200 p-5 shadow-xs space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-sm text-stone-900">Pinjaman USP Saya (3% Menurun)</h3>
                <button
                  onClick={() => setActiveTab('usp')}
                  className="text-xs text-emerald-800 hover:underline font-medium cursor-pointer"
                >
                  Lihat Semua
                </button>
              </div>

              {myLoans.length === 0 ? (
                <div className="py-6 text-center text-xs text-stone-400">
                  Anda belum memiliki pinjaman USP aktif.
                </div>
              ) : (
                myLoans.map((loan) => (
                  <div key={loan.id} className="p-3.5 rounded-lg border border-stone-200 bg-stone-50 space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="font-mono font-bold text-xs text-stone-900">#{loan.loanNo}</span>
                      <span className="text-[11px] font-semibold text-emerald-800">
                        {loan.status === 'completed' ? 'LUNAS' : 'SEDANG DICICIL'}
                      </span>
                    </div>
                    <div className="text-xs text-stone-600">
                      Plafon: <strong className="font-mono">{formatRupiah(loan.amount)}</strong> · Tenor: <strong>{loan.tenorMonths} bulan</strong>
                    </div>
                    <div className="flex justify-between text-xs pt-1 border-t border-stone-200">
                      <span className="text-stone-500">Sisa Pokok:</span>
                      <span className="font-mono font-bold text-stone-900">{formatRupiah(loan.remainingPrincipal)}</span>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Goods Credit Preview */}
            <div className="bg-white rounded-xl border border-stone-200 p-5 shadow-xs space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-sm text-stone-900">Kredit Barang Saya (Margin 5%)</h3>
                <button
                  onClick={() => setActiveTab('kredit')}
                  className="text-xs text-emerald-800 hover:underline font-medium cursor-pointer"
                >
                  Lihat Semua
                </button>
              </div>

              {myCredits.length === 0 ? (
                <div className="py-6 text-center text-xs text-stone-400">
                  Anda belum memiliki kredit barang berjalan.
                </div>
              ) : (
                myCredits.map((c) => (
                  <div key={c.id} className="p-3.5 rounded-lg border border-stone-200 bg-stone-50 space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="font-medium text-xs text-stone-900">{c.goodsName}</span>
                      <span className="text-[11px] font-semibold text-emerald-800">
                        {c.status === 'completed' ? 'LUNAS' : 'SEDANG DICICIL'}
                      </span>
                    </div>
                    <div className="text-xs text-stone-600">
                      Harga Asli: <strong className="font-mono">{formatRupiah(c.basePrice)}</strong> · Total + 5%: <strong className="font-mono text-emerald-800">{formatRupiah(c.totalPayable)}</strong>
                    </div>
                    <div className="flex justify-between text-xs pt-1 border-t border-stone-200">
                      <span className="text-stone-500">Cicilan / bln:</span>
                      <span className="font-mono font-bold text-stone-900">{formatRupiah(c.monthlyInstallment)}</span>
                    </div>
                  </div>
                ))
              )}
            </div>

          </div>

        </div>
      )}

      {/* TAB 2: SIMPANAN PRIBADI SAYA */}
      {activeTab === 'simpanan' && (
        <div className="bg-white rounded-xl border border-stone-200 p-5 shadow-xs space-y-5">
          <div>
            <h3 className="font-bold text-base text-stone-900">Buku Tabungan Simpanan Saya</h3>
            <p className="text-xs text-stone-500">
              Catatan resmi seluruh simpanan wajib dan sukarela yang Anda miliki di koperasi sekolah.
            </p>
          </div>

          {/* 2 Balance Boxes */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-4 rounded-xl border border-stone-200 bg-stone-50">
              <div className="text-xs font-semibold text-stone-500">SIMPANAN WAJIB (BULANAN)</div>
              <div className="text-2xl font-bold font-mono text-emerald-800 mt-1">
                {formatRupiah(simpananWajibTotal)}
              </div>
              <div className="text-xs text-stone-600 mt-2">
                Tarif status {empInfo.label}: <strong className="font-mono">{formatRupiah(member.monthlyWajibAmount)} / bulan</strong>
              </div>
            </div>

            <div className="p-4 rounded-xl border border-stone-200 bg-stone-50">
              <div className="text-xs font-semibold text-stone-500">SIMPANAN SUKARELA (TABUNGAN BEBAS)</div>
              <div className="text-2xl font-bold font-mono text-emerald-800 mt-1">
                {formatRupiah(simpananSukarelaTotal)}
              </div>
              <div className="text-xs text-stone-600 mt-2">
                Dapat disetor dan diambil sewaktu-waktu melalui loket pegawai koperasi.
              </div>
            </div>
          </div>

          {/* Table Mutasi */}
          <div className="space-y-2">
            <h4 className="font-bold text-xs uppercase tracking-wider text-stone-500">
              Riwayat Mutasi Simpanan
            </h4>
            <div className="overflow-x-auto border border-stone-200 rounded-lg">
              <table className="w-full text-xs text-left text-stone-700 font-mono">
                <thead className="bg-stone-50 border-b border-stone-200 font-semibold text-stone-900 uppercase text-[10px] font-sans">
                  <tr>
                    <th className="px-4 py-3">No. Bukti</th>
                    <th className="px-4 py-3">Tanggal</th>
                    <th className="px-4 py-3">Jenis Simpanan</th>
                    <th className="px-4 py-3">Uraian / Keterangan</th>
                    <th className="px-4 py-3 text-right">Nominal</th>
                    <th className="px-4 py-3 text-right">Saldo Berjalan</th>
                    <th className="px-4 py-3 text-center font-sans">Struk</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                  {mySimpananRecords.map((r) => (
                    <tr key={r.id} className="hover:bg-stone-50/70">
                      <td className="px-4 py-3 font-bold text-stone-900">{r.transactionNo}</td>
                      <td className="px-4 py-3 text-stone-500 font-sans">{formatDate(r.date)}</td>
                      <td className="px-4 py-3 font-sans uppercase font-medium text-stone-700">
                        {r.type} ({r.action})
                      </td>
                      <td className="px-4 py-3 font-sans text-stone-600">{r.notes}</td>
                      <td className={`px-4 py-3 text-right font-bold ${r.action === 'setor' ? 'text-emerald-800' : 'text-red-600'}`}>
                        {r.action === 'setor' ? '+' : '-'}{formatRupiah(r.amount)}
                      </td>
                      <td className="px-4 py-3 text-right font-bold text-stone-900">
                        {formatRupiah(r.balanceAfter)}
                      </td>
                      <td className="px-4 py-3 text-center font-sans">
                        <button
                          onClick={() => {
                            setReceiptData({
                              title: `Bukti Simpanan ${r.type.toUpperCase()}`,
                              receiptNo: r.transactionNo,
                              date: r.date,
                              memberName: member.name,
                              memberNo: member.memberNo,
                              cashierName: r.cashierName,
                              category: `Simpanan ${r.type}`,
                              breakdown: [
                                { label: 'Jenis Simpanan', value: r.type.toUpperCase() },
                                { label: 'Aksi', value: r.action.toUpperCase() },
                                { label: 'Nominal', value: formatRupiah(r.amount), isBold: true },
                                { label: 'Saldo Berjalan', value: formatRupiah(r.balanceAfter) },
                              ],
                              totalAmount: r.amount,
                              notes: r.notes,
                            });
                          }}
                          className="px-2 py-0.5 text-[10px] bg-stone-100 hover:bg-stone-200 text-stone-700 rounded cursor-pointer"
                        >
                          Lihat
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      )}

      {/* TAB 3: PINJAMAN USP SAYA (3% MENURUN) */}
      {activeTab === 'usp' && (
        <div className="bg-white rounded-xl border border-stone-200 p-5 shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="font-bold text-base text-stone-900">Pinjaman USP Saya (Bunga 3% Menurun)</h3>
              <p className="text-xs text-stone-500">
                Tabel jadwal angsuran bulan per bulan dengan perhitungan bunga menurun dari sisa pokok.
              </p>
            </div>
            <button
              onClick={() => setShowLoanModal(true)}
              className="px-3.5 py-1.5 bg-emerald-800 hover:bg-emerald-900 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 cursor-pointer self-start"
            >
              <Plus className="w-4 h-4" />
              <span>Ajukan Pinjaman Baru</span>
            </button>
          </div>

          {myLoans.length === 0 ? (
            <div className="py-12 text-center text-xs text-stone-400">
              Anda tidak memiliki pinjaman aktif di Usaha Simpan Pinjam.
            </div>
          ) : (
            myLoans.map((loan) => (
              <div key={loan.id} className="border border-stone-200 rounded-xl p-4 bg-stone-50/50 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-stone-200">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-stone-900 font-mono">#{loan.loanNo}</span>
                      <span className="text-xs text-stone-500">· {loan.purpose}</span>
                    </div>
                    <div className="text-xs text-stone-600 mt-1">
                      Plafon: <strong className="font-mono text-stone-900">{formatRupiah(loan.amount)}</strong> · Tenor: <strong>{loan.tenorMonths} bulan</strong> · Bunga: <strong className="font-mono text-emerald-800">3% per bulan menurun</strong>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] text-stone-400 block font-sans">Sisa Pokok Pinjaman</span>
                    <span className="text-base font-bold font-mono text-emerald-900">
                      {formatRupiah(loan.remainingPrincipal)}
                    </span>
                  </div>
                </div>

                {/* Table Breakdown Month-by-month */}
                <div className="overflow-x-auto border border-stone-200 rounded-lg bg-white">
                  <table className="w-full text-xs text-left text-stone-700 font-mono">
                    <thead className="bg-stone-50 border-b border-stone-200 font-semibold text-stone-900 uppercase text-[10px] font-sans">
                      <tr>
                        <th className="px-3 py-2 text-center">Bulan</th>
                        <th className="px-3 py-2 text-right">Sisa Pokok Awal</th>
                        <th className="px-3 py-2 text-right">Cicilan Pokok</th>
                        <th className="px-3 py-2 text-right">Bunga 3% Menurun</th>
                        <th className="px-3 py-2 text-right font-bold text-emerald-900">Total Cicilan</th>
                        <th className="px-3 py-2 text-right">Sisa Pokok Akhir</th>
                        <th className="px-3 py-2 text-center font-sans">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-stone-100">
                      {loan.schedule.map((item) => (
                        <tr key={item.installmentNumber} className={item.status === 'paid' ? 'bg-emerald-50/20' : ''}>
                          <td className="px-3 py-2 text-center font-sans font-medium">Bulan {item.installmentNumber}</td>
                          <td className="px-3 py-2 text-right text-stone-500">{formatRupiah(item.sisaPokokAwal)}</td>
                          <td className="px-3 py-2 text-right text-stone-900">{formatRupiah(item.pokokAmount)}</td>
                          <td className="px-3 py-2 text-right text-emerald-700">{formatRupiah(item.interestAmount)}</td>
                          <td className="px-3 py-2 text-right font-bold text-emerald-900 bg-emerald-50/30">
                            {formatRupiah(item.totalAmount)}
                          </td>
                          <td className="px-3 py-2 text-right text-stone-400">{formatRupiah(item.sisaPokokAkhir)}</td>
                          <td className="px-3 py-2 text-center font-sans">
                            {item.status === 'paid' ? (
                              <span className="text-[10px] text-emerald-800 font-semibold inline-flex items-center gap-1">
                                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                                Lunas ({formatDate(item.paidDate || '')})
                              </span>
                            ) : (
                              <span className="text-[10px] text-amber-700 font-medium">
                                Belum Bayar
                              </span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* TAB 4: KREDIT BARANG SAYA (MARGIN 5%) */}
      {activeTab === 'kredit' && (
        <div className="bg-white rounded-xl border border-stone-200 p-5 shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="font-bold text-base text-stone-900">Kredit Barang Saya (Margin 5%)</h3>
              <p className="text-xs text-stone-500">
                Pengadaan barang ditalangi koperasi dengan margin tetap 5% dan cicilan merata.
              </p>
            </div>
            <button
              onClick={() => setShowCreditModal(true)}
              className="px-3.5 py-1.5 bg-emerald-800 hover:bg-emerald-900 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 cursor-pointer self-start"
            >
              <Plus className="w-4 h-4" />
              <span>Ajukan Pengadaan Barang</span>
            </button>
          </div>

          {myCredits.length === 0 ? (
            <div className="py-12 text-center text-xs text-stone-400">
              Anda tidak memiliki kredit barang aktif.
            </div>
          ) : (
            myCredits.map((c) => (
              <div key={c.id} className="border border-stone-200 rounded-xl p-4 bg-stone-50/50 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-stone-200">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-stone-900">{c.goodsName}</span>
                      <span className="text-xs font-mono text-stone-500">#{c.creditNo}</span>
                    </div>
                    <div className="text-xs text-stone-600 mt-1">
                      Toko: <strong>{c.vendorName}</strong> · Harga Toko: <strong className="font-mono">{formatRupiah(c.basePrice)}</strong> · Margin 5%: <strong className="font-mono text-emerald-800">+{formatRupiah(c.marginAmount)}</strong>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] text-stone-400 block font-sans">Sisa Kewajiban</span>
                    <span className="text-base font-bold font-mono text-emerald-900">
                      {formatRupiah(c.remainingAmount)}
                    </span>
                  </div>
                </div>

                <div className="overflow-x-auto border border-stone-200 rounded-lg bg-white">
                  <table className="w-full text-xs text-left text-stone-700 font-mono">
                    <thead className="bg-stone-50 border-b border-stone-200 font-semibold text-stone-900 uppercase text-[10px] font-sans">
                      <tr>
                        <th className="px-3 py-2 text-center">Bulan</th>
                        <th className="px-3 py-2">Estimasi Jatuh Tempo</th>
                        <th className="px-3 py-2 text-right">Besaran Angsuran</th>
                        <th className="px-3 py-2 text-center font-sans">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-stone-100">
                      {c.schedule.map((item) => (
                        <tr key={item.installmentNumber} className={item.status === 'paid' ? 'bg-emerald-50/20' : ''}>
                          <td className="px-3 py-2 text-center font-sans font-medium">Bulan {item.installmentNumber}</td>
                          <td className="px-3 py-2 text-stone-500 font-sans">{formatDate(item.dueDate)}</td>
                          <td className="px-3 py-2 text-right font-bold text-emerald-900">{formatRupiah(item.amount)}</td>
                          <td className="px-3 py-2 text-center font-sans">
                            {item.status === 'paid' ? (
                              <span className="text-[10px] text-emerald-800 font-semibold inline-flex items-center gap-1">
                                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                                Lunas ({formatDate(item.paidDate || '')})
                              </span>
                            ) : (
                              <span className="text-[10px] text-amber-700 font-medium">Belum Bayar</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* TAB 5: BELANJA WASERDA SAYA */}
      {activeTab === 'waserda' && (
        <div className="bg-white rounded-xl border border-stone-200 p-5 shadow-xs space-y-4">
          <div>
            <h3 className="font-bold text-base text-stone-900">Riwayat Belanja Waserda Saya</h3>
            <p className="text-xs text-stone-500">
              Daftar pembelian ATK, seragam, sembako, dan konsumsi Anda di koperasi.
            </p>
          </div>

          {myWaserda.length === 0 ? (
            <div className="py-12 text-center text-xs text-stone-400">
              Belum ada riwayat pembelian waserda atas nama Anda.
            </div>
          ) : (
            <div className="overflow-x-auto border border-stone-200 rounded-lg">
              <table className="w-full text-xs text-left text-stone-700">
                <thead className="bg-stone-50 border-b border-stone-200 font-semibold text-stone-900 uppercase text-[10px]">
                  <tr>
                    <th className="px-4 py-3">No. Nota</th>
                    <th className="px-4 py-3">Tanggal</th>
                    <th className="px-4 py-3">Daftar Barang</th>
                    <th className="px-4 py-3">Metode Bayar</th>
                    <th className="px-4 py-3 text-right">Total Belanja</th>
                    <th className="px-4 py-3 text-center">Struk</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                  {myWaserda.map((tx) => (
                    <tr key={tx.id} className="hover:bg-stone-50/70">
                      <td className="px-4 py-3 font-mono font-bold text-stone-900">{tx.receiptNo}</td>
                      <td className="px-4 py-3 text-stone-500">{formatDate(tx.date)}</td>
                      <td className="px-4 py-3">
                        <span className="text-[11px] text-stone-600">
                          {tx.items.map((i) => `${i.productName} (${i.quantity}x)`).join(', ')}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-[11px] font-medium uppercase text-stone-700">
                          {tx.paymentMethod.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right font-mono font-bold text-stone-900">
                        {formatRupiah(tx.totalAmount)}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <button
                          onClick={() => {
                            setReceiptData({
                              title: 'Struk Belanja Waserda',
                              receiptNo: tx.receiptNo,
                              date: tx.date,
                              memberName: tx.memberName,
                              cashierName: tx.cashierName,
                              category: 'Waserda',
                              items: tx.items.map((i) => ({
                                name: i.productName,
                                qty: i.quantity,
                                price: i.unitPrice,
                                subtotal: i.subtotal,
                              })),
                              totalAmount: tx.totalAmount,
                              paymentMethod: tx.paymentMethod,
                              notes: tx.notes,
                            });
                          }}
                          className="px-2.5 py-1 text-[11px] bg-stone-100 hover:bg-stone-200 rounded text-stone-700 font-medium inline-flex items-center gap-1 cursor-pointer"
                        >
                          <Receipt className="w-3.5 h-3.5" />
                          <span>Struk</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* TAB 6: SIMULATOR KALKULATOR PRIBADI */}
      {activeTab === 'calculator' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* Simulator USP */}
          <div className="bg-white rounded-xl border border-stone-200 p-5 shadow-xs space-y-4">
            <h3 className="font-bold text-sm text-stone-900 flex items-center gap-2">
              <Coins className="w-4 h-4 text-emerald-800" />
              Kalkulator Mandiri USP (Bunga 3% Menurun)
            </h3>
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">Plafon Pinjaman</label>
              <input
                type="number"
                step="500000"
                value={loanAmount}
                onChange={(e) => setLoanAmount(Number(e.target.value))}
                className="w-full text-xs font-mono p-2 bg-stone-50 border border-stone-300 rounded-lg"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">Tenor (Bulan)</label>
              <select
                value={loanTenor}
                onChange={(e) => setLoanTenor(Number(e.target.value))}
                className="w-full text-xs p-2 bg-stone-50 border border-stone-300 rounded-lg"
              >
                <option value={6}>6 Bulan</option>
                <option value={10}>10 Bulan</option>
                <option value={12}>12 Bulan</option>
                <option value={24}>24 Bulan</option>
              </select>
            </div>
            {(() => {
              const res = calculateUSPSchedule(loanAmount, loanTenor, 0.03);
              return (
                <div className="p-3 bg-stone-50 rounded-lg border border-stone-200 text-xs space-y-1.5 font-mono">
                  <div className="flex justify-between">
                    <span className="text-stone-500 font-sans">Pokok per Bulan:</span>
                    <span className="font-bold text-stone-900">{formatRupiah(Math.round(loanAmount / loanTenor))}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-stone-500 font-sans">Cicilan Bulan 1:</span>
                    <span className="font-bold text-emerald-800">{formatRupiah(res.schedule[0]?.totalAmount || 0)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-stone-500 font-sans">Cicilan Bulan Terakhir:</span>
                    <span className="font-bold text-emerald-800">{formatRupiah(res.schedule[res.schedule.length - 1]?.totalAmount || 0)}</span>
                  </div>
                </div>
              );
            })()}
          </div>

          {/* Simulator Kredit 5% */}
          <div className="bg-white rounded-xl border border-stone-200 p-5 shadow-xs space-y-4">
            <h3 className="font-bold text-sm text-stone-900 flex items-center gap-2">
              <Laptop className="w-4 h-4 text-emerald-800" />
              Kalkulator Mandiri Kredit Barang (Margin 5%)
            </h3>
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">Harga Toko / Vendor</label>
              <input
                type="number"
                step="500000"
                value={creditPrice}
                onChange={(e) => setCreditPrice(Number(e.target.value))}
                className="w-full text-xs font-mono p-2 bg-stone-50 border border-stone-300 rounded-lg"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">Tenor (Bulan)</label>
              <select
                value={creditTenor}
                onChange={(e) => setCreditTenor(Number(e.target.value))}
                className="w-full text-xs p-2 bg-stone-50 border border-stone-300 rounded-lg"
              >
                <option value={3}>3 Bulan</option>
                <option value={6}>6 Bulan</option>
                <option value={10}>10 Bulan</option>
                <option value={12}>12 Bulan</option>
              </select>
            </div>
            {(() => {
              const res = calculateCreditSchedule(creditPrice, 0.05, creditTenor);
              return (
                <div className="p-3 bg-stone-50 rounded-lg border border-stone-200 text-xs space-y-1.5 font-mono">
                  <div className="flex justify-between">
                    <span className="text-stone-500 font-sans">Margin Koperasi 5%:</span>
                    <span className="text-emerald-800">+{formatRupiah(res.marginAmount)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-stone-500 font-sans">Total Dicicil:</span>
                    <span className="font-bold text-stone-900">{formatRupiah(res.totalPayable)}</span>
                  </div>
                  <div className="flex justify-between font-bold text-emerald-900">
                    <span className="font-sans">Cicilan Flat / Bulan:</span>
                    <span>{formatRupiah(res.monthlyInstallment)} / bln</span>
                  </div>
                </div>
              );
            })()}
          </div>

        </div>
      )}

      {/* MODAL PENGAJUAN PINJAMAN USP */}
      {showLoanModal && (
        <div className="fixed inset-0 bg-stone-900/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-stone-200">
            <h3 className="text-base font-bold text-stone-900 mb-2">Formulir Pengajuan Pinjaman USP</h3>
            <p className="text-xs text-stone-500 mb-4">
              Pengajuan pinjaman dana tunai dengan suku bunga 3% menurun.
            </p>
            <form onSubmit={handleApplyLoan} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">Nominal Pinjaman (Rp)</label>
                <input
                  type="number"
                  min="500000"
                  step="500000"
                  required
                  value={loanAmount}
                  onChange={(e) => setLoanAmount(Number(e.target.value))}
                  className="w-full text-xs font-mono p-2.5 bg-stone-50 border border-stone-300 rounded-lg focus:outline-emerald-800"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">Tenor (Bulan)</label>
                <select
                  value={loanTenor}
                  onChange={(e) => setLoanTenor(Number(e.target.value))}
                  className="w-full text-xs p-2.5 bg-stone-50 border border-stone-300 rounded-lg"
                >
                  <option value={3}>3 Bulan</option>
                  <option value={6}>6 Bulan</option>
                  <option value={10}>10 Bulan</option>
                  <option value={12}>12 Bulan</option>
                  <option value={24}>24 Bulan</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">Tujuan / Keperluan Pinjaman</label>
                <textarea
                  required
                  rows={2}
                  value={loanPurpose}
                  onChange={(e) => setLoanPurpose(e.target.value)}
                  className="w-full text-xs p-2.5 bg-stone-50 border border-stone-300 rounded-lg"
                />
              </div>
              <div className="mt-4 flex justify-end gap-2 pt-3 border-t border-stone-200">
                <button
                  type="button"
                  onClick={() => setShowLoanModal(false)}
                  className="px-4 py-2 text-xs text-stone-600 hover:bg-stone-100 rounded-lg cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-semibold bg-emerald-800 hover:bg-emerald-900 text-white rounded-lg cursor-pointer"
                >
                  Kirim Permohonan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL PENGAJUAN KREDIT BARANG */}
      {showCreditModal && (
        <div className="fixed inset-0 bg-stone-900/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-stone-200">
            <h3 className="text-base font-bold text-stone-900 mb-2">Formulir Pengajuan Kredit Barang</h3>
            <p className="text-xs text-stone-500 mb-4">
              Koperasi menalangi pengadaan barang dengan margin 5%.
            </p>
            <form onSubmit={handleApplyCredit} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">Nama Barang / Elektronik</label>
                <input
                  type="text"
                  required
                  value={creditGoodsName}
                  onChange={(e) => setCreditGoodsName(e.target.value)}
                  className="w-full text-xs p-2.5 bg-stone-50 border border-stone-300 rounded-lg"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">Toko / Mitra Vendor</label>
                <input
                  type="text"
                  required
                  value={creditVendor}
                  onChange={(e) => setCreditVendor(e.target.value)}
                  className="w-full text-xs p-2.5 bg-stone-50 border border-stone-300 rounded-lg"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">Harga Toko (Rp)</label>
                  <input
                    type="number"
                    min="100000"
                    step="100000"
                    required
                    value={creditPrice}
                    onChange={(e) => setCreditPrice(Number(e.target.value))}
                    className="w-full text-xs font-mono p-2.5 bg-stone-50 border border-stone-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">Tenor (Bulan)</label>
                  <select
                    value={creditTenor}
                    onChange={(e) => setCreditTenor(Number(e.target.value))}
                    className="w-full text-xs p-2.5 bg-stone-50 border border-stone-300 rounded-lg"
                  >
                    <option value={3}>3 Bulan</option>
                    <option value={6}>6 Bulan</option>
                    <option value={10}>10 Bulan</option>
                    <option value={12}>12 Bulan</option>
                  </select>
                </div>
              </div>
              <div className="mt-4 flex justify-end gap-2 pt-3 border-t border-stone-200">
                <button
                  type="button"
                  onClick={() => setShowCreditModal(false)}
                  className="px-4 py-2 text-xs text-stone-600 hover:bg-stone-100 rounded-lg cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-semibold bg-emerald-800 hover:bg-emerald-900 text-white rounded-lg cursor-pointer"
                >
                  Kirim Permohonan
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
