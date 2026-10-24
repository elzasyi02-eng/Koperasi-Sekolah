import React, { useState } from 'react';
import { useCooperative } from '../../context/CooperativeContext';
import { Member, SimpananRecord } from '../../types';
import { formatRupiah, formatDate, getEmploymentLabel } from '../../utils/formatters';
import { PrintReceiptModal } from '../common/PrintReceiptModal';
import { 
  PiggyBank, 
  Wallet, 
  ArrowDownLeft, 
  ArrowUpRight, 
  Calendar, 
  CheckCircle2, 
  AlertCircle,
  Plus, 
  Receipt,
  FileSpreadsheet,
  Info
} from 'lucide-react';

export const SimpananView: React.FC = () => {
  const { 
    currentUser, 
    members, 
    simpananRecords, 
    depositSimpananWajib, 
    depositSimpananSukarela, 
    withdrawSimpananSukarela,
    getMemberSimpananWajibTotal,
    getMemberSimpananSukarelaTotal,
    config
  } = useCooperative();

  const isStaffOrAdmin = currentUser.role === 'pengelola' || currentUser.role === 'pegawai';

  const [activeTab, setActiveTab] = useState<'wajib' | 'sukarela' | 'records'>('wajib');

  // Modal Setor Wajib State
  const [showWajibModal, setShowWajibModal] = useState(false);
  const [wajibMemberId, setWajibMemberId] = useState('');
  const [wajibMonth, setWajibMonth] = useState('2026-10'); // Default Oktober 2026

  // Modal Setor/Tarik Sukarela State
  const [showSukarelaModal, setShowSukarelaModal] = useState(false);
  const [sukarelaAction, setSukarelaAction] = useState<'setor' | 'tarik'>('setor');
  const [sukarelaMemberId, setSukarelaMemberId] = useState('');
  const [sukarelaAmount, setSukarelaAmount] = useState(500000);
  const [sukarelaNotes, setSukarelaNotes] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Receipt Modal
  const [receiptData, setReceiptData] = useState<any | null>(null);

  // Filter Records
  const [filterType, setFilterType] = useState<'all' | 'wajib' | 'sukarela'>('all');

  const totalSimpananWajibKoperasi = members.reduce(
    (acc, m) => acc + getMemberSimpananWajibTotal(m.id),
    0
  );

  const totalSimpananSukarelaKoperasi = members.reduce(
    (acc, m) => acc + getMemberSimpananSukarelaTotal(m.id),
    0
  );

  const totalSemuaSimpanan = totalSimpananWajibKoperasi + totalSimpananSukarelaKoperasi;

  // Handle Setor Wajib
  const handleWajibSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!wajibMemberId) return;

    const member = members.find((m) => m.id === wajibMemberId);
    if (!member) return;

    const amount = member.monthlyWajibAmount;
    depositSimpananWajib(wajibMemberId, wajibMonth, amount);

    setShowWajibModal(false);

    setReceiptData({
      title: 'Bukti Setoran Simpanan Wajib',
      receiptNo: `SW-${Date.now().toString().slice(-6)}`,
      date: new Date().toISOString(),
      memberName: member.name,
      memberNo: member.memberNo,
      cashierName: currentUser.name,
      category: 'Simpanan Wajib',
      breakdown: [
        { label: 'Status Kepegawaian', value: member.employmentStatus },
        { label: 'Periode Bulan', value: wajibMonth },
        { label: 'Nominal Wajib', value: formatRupiah(amount), isBold: true },
        { label: 'Total Simpanan Wajib Terkumpul', value: formatRupiah(getMemberSimpananWajibTotal(member.id) + amount) },
      ],
      totalAmount: amount,
      notes: `Setoran simpanan wajib periode ${wajibMonth}`,
    });

    setWajibMemberId('');
  };

  // Handle Sukarela (Setor / Tarik)
  const handleSukarelaSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    if (!sukarelaMemberId || sukarelaAmount <= 0) return;

    const member = members.find((m) => m.id === sukarelaMemberId);
    if (!member) return;

    if (sukarelaAction === 'setor') {
      depositSimpananSukarela(sukarelaMemberId, sukarelaAmount, sukarelaNotes);
      setShowSukarelaModal(false);

      setReceiptData({
        title: 'Bukti Setor Simpanan Sukarela',
        receiptNo: `SS-${Date.now().toString().slice(-6)}`,
        date: new Date().toISOString(),
        memberName: member.name,
        memberNo: member.memberNo,
        cashierName: currentUser.name,
        category: 'Simpanan Sukarela',
        breakdown: [
          { label: 'Jenis Transaksi', value: 'Setor Tabungan Sukarela' },
          { label: 'Jumlah Setoran', value: formatRupiah(sukarelaAmount), isBold: true },
          { label: 'Saldo Sukarela Baru', value: formatRupiah(getMemberSimpananSukarelaTotal(member.id) + sukarelaAmount) },
        ],
        totalAmount: sukarelaAmount,
        notes: sukarelaNotes || 'Setoran tabungan sukarela tanpa batas',
      });
    } else {
      const ok = withdrawSimpananSukarela(sukarelaMemberId, sukarelaAmount, sukarelaNotes);
      if (!ok) {
        setErrorMsg('Saldo Simpanan Sukarela anggota tidak mencukupi untuk penarikan ini!');
        return;
      }
      setShowSukarelaModal(false);

      setReceiptData({
        title: 'Bukti Penarikan Simpanan Sukarela',
        receiptNo: `TS-${Date.now().toString().slice(-6)}`,
        date: new Date().toISOString(),
        memberName: member.name,
        memberNo: member.memberNo,
        cashierName: currentUser.name,
        category: 'Simpanan Sukarela',
        breakdown: [
          { label: 'Jenis Transaksi', value: 'Penarikan Tabungan Sukarela' },
          { label: 'Jumlah Ditarik', value: formatRupiah(sukarelaAmount), isBold: true },
          { label: 'Sisa Saldo Sukarela', value: formatRupiah(getMemberSimpananSukarelaTotal(member.id) - sukarelaAmount) },
        ],
        totalAmount: sukarelaAmount,
        notes: sukarelaNotes || 'Penarikan tabungan sukarela oleh anggota',
      });
    }

    setSukarelaMemberId('');
    setSukarelaNotes('');
  };

  const filteredRecords = simpananRecords.filter((r) => {
    if (filterType === 'all') return true;
    return r.type === filterType;
  });

  return (
    <div className="space-y-6">
      
      {/* Header & Stats Banner */}
      <div className="bg-white rounded-xl border border-stone-200 p-5 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-2 rounded-lg bg-emerald-100 text-emerald-800">
                <PiggyBank className="w-5 h-5" />
              </span>
              <div>
                <h1 className="text-xl font-bold text-stone-900">
                  4 & 5. Pengelolaan Simpanan Anggota
                </h1>
                <p className="text-xs text-stone-500">
                  Simpanan Wajib (PNS/PPPK: Rp 100.000 · Honorer: Rp 50.000) dan Simpanan Sukarela (Bebas nominal).
                </p>
              </div>
            </div>
          </div>

          {/* Quick Metrics */}
          <div className="flex flex-wrap items-center gap-3 text-xs font-mono">
            <div className="bg-stone-50 border border-stone-200 rounded-lg p-2.5 px-3">
              <span className="text-stone-500 block text-[10px] font-sans">Total Simpanan Wajib</span>
              <span className="text-stone-900 font-bold">{formatRupiah(totalSimpananWajibKoperasi)}</span>
            </div>
            <div className="bg-stone-50 border border-stone-200 rounded-lg p-2.5 px-3">
              <span className="text-stone-500 block text-[10px] font-sans">Total Simpanan Sukarela</span>
              <span className="text-stone-900 font-bold">{formatRupiah(totalSimpananSukarelaKoperasi)}</span>
            </div>
            <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-2.5 px-3">
              <span className="text-emerald-700 block text-[10px] font-sans">Total Tabungan Koperasi</span>
              <span className="text-emerald-900 font-bold">{formatRupiah(totalSemuaSimpanan)}</span>
            </div>
          </div>
        </div>

        {/* Rule Highlight Card */}
        <div className="mt-4 bg-stone-50 rounded-xl p-3.5 border border-stone-200 text-xs text-stone-700 flex items-start gap-2.5">
          <Info className="w-4 h-4 text-emerald-800 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <div className="font-semibold text-stone-900">
              Ketentuan Simpanan Koperasi Sekolah:
            </div>
            <p className="text-[11px] text-stone-600 leading-relaxed">
              • <strong>4. Simpanan Wajib</strong>: Wajib disetor setiap bulan oleh anggota. Tarif untuk <strong>PNS dan PPPK</strong> adalah <strong className="text-emerald-800 font-mono">Rp 100.000 / bulan</strong>, sedangkan untuk <strong>PPPK Paruh Waktu dan Honorer</strong> adalah <strong className="text-emerald-800 font-mono">Rp 50.000 / bulan</strong>.
              <br />
              • <strong>5. Simpanan Sukarela</strong>: Tabungan sukarela anggota di luar simpanan wajib, <strong>tanpa batas minimal maupun maksimal</strong>, dan dapat diambil/ditarik sewaktu-waktu sesuai saldo.
            </p>
          </div>
        </div>

        {/* Tab Buttons */}
        <div className="flex items-center justify-between mt-5 border-t border-stone-100 pt-3">
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setActiveTab('wajib')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 cursor-pointer transition-colors ${
                activeTab === 'wajib'
                  ? 'bg-emerald-800 text-white shadow-xs'
                  : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100'
              }`}
            >
              <Calendar className="w-4 h-4" />
              <span>4. Simpanan Wajib (Bulanan)</span>
            </button>

            <button
              onClick={() => setActiveTab('sukarela')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 cursor-pointer transition-colors ${
                activeTab === 'sukarela'
                  ? 'bg-emerald-800 text-white shadow-xs'
                  : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100'
              }`}
            >
              <Wallet className="w-4 h-4" />
              <span>5. Simpanan Sukarela (Bebas)</span>
            </button>

            <button
              onClick={() => setActiveTab('records')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 cursor-pointer transition-colors ${
                activeTab === 'records'
                  ? 'bg-emerald-800 text-white shadow-xs'
                  : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100'
              }`}
            >
              <FileSpreadsheet className="w-4 h-4" />
              <span>Mutasi Buku Kas Simpanan</span>
            </button>
          </div>

          {isStaffOrAdmin && (
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  setSukarelaAction('setor');
                  setShowSukarelaModal(true);
                }}
                className="px-3 py-1.5 bg-stone-100 hover:bg-stone-200 text-stone-800 rounded-lg text-xs font-semibold flex items-center gap-1 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Setor Sukarela</span>
              </button>

              <button
                onClick={() => setShowWajibModal(true)}
                className="px-3.5 py-1.5 bg-emerald-800 hover:bg-emerald-900 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 cursor-pointer shadow-xs"
              >
                <Plus className="w-4 h-4" />
                <span>Setor Simpanan Wajib</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* TAB 1: SIMPANAN WAJIB (PNS 100K vs HONORER 50K) */}
      {activeTab === 'wajib' && (
        <div className="bg-white rounded-xl border border-stone-200 p-5 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h3 className="font-bold text-sm text-stone-900">Rekapitulasi Simpanan Wajib Seluruh Anggota</h3>
              <p className="text-xs text-stone-500">
                PNS & PPPK: Rp 100.000/bln · PPPK Paruh Waktu & Honorer: Rp 50.000/bln
              </p>
            </div>
          </div>

          <div className="overflow-x-auto border border-stone-200 rounded-lg">
            <table className="w-full text-xs text-left text-stone-700">
              <thead className="bg-stone-50 border-b border-stone-200 font-semibold text-stone-900 uppercase text-[10px]">
                <tr>
                  <th className="px-4 py-3">No. Anggota</th>
                  <th className="px-4 py-3">Nama Anggota</th>
                  <th className="px-4 py-3">Status Pegawai</th>
                  <th className="px-4 py-3 text-right">Tarif Wajib / Bln</th>
                  <th className="px-4 py-3 text-center">Status Okt 2026</th>
                  <th className="px-4 py-3 text-right">Total Wajib Terkumpul</th>
                  {isStaffOrAdmin && <th className="px-4 py-3 text-center">Aksi Setor</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {members.map((m) => {
                  const empInfo = getEmploymentLabel(m.employmentStatus);
                  const totalWajib = getMemberSimpananWajibTotal(m.id);
                  // Cek apakah sudah setor di bulan Oktober 2026
                  const hasPaidOct = simpananRecords.some(
                    (r) => r.memberId === m.id && r.type === 'wajib' && r.periodMonth === '2026-10'
                  );

                  return (
                    <tr key={m.id} className="hover:bg-stone-50/70 transition-colors">
                      <td className="px-4 py-3 font-mono font-bold text-stone-900">{m.memberNo}</td>
                      <td className="px-4 py-3">
                        <div className="font-medium text-stone-900">{m.name}</div>
                        <div className="text-[10px] text-stone-400">{m.department}</div>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-[11px] font-medium text-stone-700">
                          {empInfo.label}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right font-mono font-bold text-stone-900">
                        {formatRupiah(m.monthlyWajibAmount)}
                      </td>
                      <td className="px-4 py-3 text-center">
                        {hasPaidOct ? (
                          <span className="text-[11px] text-emerald-800 font-semibold inline-flex items-center gap-1">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                            Lunas Okt
                          </span>
                        ) : (
                          <span className="text-[11px] text-amber-700 font-medium inline-flex items-center gap-1">
                            <AlertCircle className="w-3.5 h-3.5 text-amber-500" />
                            Belum Setor
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-right font-mono font-bold text-emerald-900">
                        {formatRupiah(totalWajib)}
                      </td>
                      {isStaffOrAdmin && (
                        <td className="px-4 py-3 text-center">
                          <button
                            onClick={() => {
                              setWajibMemberId(m.id);
                              setShowWajibModal(true);
                            }}
                            className="px-2.5 py-1 text-[11px] bg-emerald-50 text-emerald-800 hover:bg-emerald-100 rounded font-medium cursor-pointer"
                          >
                            + Setor Wajib
                          </button>
                        </td>
                      )}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 2: SIMPANAN SUKARELA (TANPA BATAS MINIMAL/MAKSIMAL) */}
      {activeTab === 'sukarela' && (
        <div className="bg-white rounded-xl border border-stone-200 p-5 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h3 className="font-bold text-sm text-stone-900">Saldo Simpanan Sukarela Anggota</h3>
              <p className="text-xs text-stone-500">
                Tabungan bebas yang dapat disetor maupun ditarik sewaktu-waktu oleh anggota.
              </p>
            </div>

            {isStaffOrAdmin && (
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    setSukarelaAction('tarik');
                    setShowSukarelaModal(true);
                  }}
                  className="px-3 py-1.5 bg-stone-100 hover:bg-stone-200 text-stone-800 rounded-lg text-xs font-semibold flex items-center gap-1 cursor-pointer"
                >
                  <ArrowDownLeft className="w-3.5 h-3.5 text-red-600" />
                  <span>Tarik Sukarela</span>
                </button>
                <button
                  onClick={() => {
                    setSukarelaAction('setor');
                    setShowSukarelaModal(true);
                  }}
                  className="px-3 py-1.5 bg-emerald-800 hover:bg-emerald-900 text-white rounded-lg text-xs font-semibold flex items-center gap-1 cursor-pointer"
                >
                  <ArrowUpRight className="w-3.5 h-3.5" />
                  <span>Setor Sukarela</span>
                </button>
              </div>
            )}
          </div>

          <div className="overflow-x-auto border border-stone-200 rounded-lg">
            <table className="w-full text-xs text-left text-stone-700">
              <thead className="bg-stone-50 border-b border-stone-200 font-semibold text-stone-900 uppercase text-[10px]">
                <tr>
                  <th className="px-4 py-3">No. Anggota</th>
                  <th className="px-4 py-3">Nama Anggota</th>
                  <th className="px-4 py-3">Unit Kerja</th>
                  <th className="px-4 py-3 text-right">Saldo Tabungan Sukarela</th>
                  <th className="px-4 py-3 text-center">Status Rekening</th>
                  {isStaffOrAdmin && <th className="px-4 py-3 text-center">Aksi Kasir</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {members.map((m) => {
                  const saldoSukarela = getMemberSimpananSukarelaTotal(m.id);
                  return (
                    <tr key={m.id} className="hover:bg-stone-50/70 transition-colors">
                      <td className="px-4 py-3 font-mono font-bold text-stone-900">{m.memberNo}</td>
                      <td className="px-4 py-3 font-medium text-stone-900">{m.name}</td>
                      <td className="px-4 py-3 text-stone-500">{m.department}</td>
                      <td className="px-4 py-3 text-right font-mono font-bold text-emerald-900 text-sm">
                        {formatRupiah(saldoSukarela)}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className="text-[11px] text-stone-600 font-medium">
                          {saldoSukarela > 0 ? 'Aktif Menabung' : 'Belum Ada Saldo'}
                        </span>
                      </td>
                      {isStaffOrAdmin && (
                        <td className="px-4 py-3 text-center">
                          <div className="flex items-center justify-center gap-1">
                            <button
                              onClick={() => {
                                setSukarelaMemberId(m.id);
                                setSukarelaAction('setor');
                                setShowSukarelaModal(true);
                              }}
                              className="px-2 py-1 text-[11px] bg-emerald-50 text-emerald-800 hover:bg-emerald-100 rounded font-medium cursor-pointer"
                            >
                              Setor
                            </button>
                            <button
                              disabled={saldoSukarela <= 0}
                              onClick={() => {
                                setSukarelaMemberId(m.id);
                                setSukarelaAction('tarik');
                                setShowSukarelaModal(true);
                              }}
                              className="px-2 py-1 text-[11px] bg-stone-100 text-stone-700 hover:bg-stone-200 disabled:opacity-40 rounded font-medium cursor-pointer"
                            >
                              Tarik
                            </button>
                          </div>
                        </td>
                      )}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: MUTASI TRANSAKSI SIMPANAN */}
      {activeTab === 'records' && (
        <div className="bg-white rounded-xl border border-stone-200 p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-sm text-stone-900">Buku Mutasi Kas Simpanan</h3>
            <div className="flex gap-1.5">
              <button
                onClick={() => setFilterType('all')}
                className={`px-3 py-1 rounded text-xs font-medium cursor-pointer ${
                  filterType === 'all' ? 'bg-stone-900 text-white' : 'bg-stone-100 text-stone-600'
                }`}
              >
                Semua
              </button>
              <button
                onClick={() => setFilterType('wajib')}
                className={`px-3 py-1 rounded text-xs font-medium cursor-pointer ${
                  filterType === 'wajib' ? 'bg-emerald-800 text-white' : 'bg-stone-100 text-stone-600'
                }`}
              >
                Simpanan Wajib
              </button>
              <button
                onClick={() => setFilterType('sukarela')}
                className={`px-3 py-1 rounded text-xs font-medium cursor-pointer ${
                  filterType === 'sukarela' ? 'bg-emerald-800 text-white' : 'bg-stone-100 text-stone-600'
                }`}
              >
                Simpanan Sukarela
              </button>
            </div>
          </div>

          <div className="overflow-x-auto border border-stone-200 rounded-lg">
            <table className="w-full text-xs text-left text-stone-700">
              <thead className="bg-stone-50 border-b border-stone-200 font-semibold text-stone-900 uppercase text-[10px]">
                <tr>
                  <th className="px-4 py-3">No. Bukti</th>
                  <th className="px-4 py-3">Tanggal</th>
                  <th className="px-4 py-3">Nama Anggota</th>
                  <th className="px-4 py-3">Jenis Simpanan</th>
                  <th className="px-4 py-3">Keterangan</th>
                  <th className="px-4 py-3 text-right">Nominal</th>
                  <th className="px-4 py-3 text-right">Saldo Akhir</th>
                  <th className="px-4 py-3 text-center">Struk</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100 font-mono">
                {filteredRecords.map((r) => (
                  <tr key={r.id} className="hover:bg-stone-50/70">
                    <td className="px-4 py-3 font-bold text-stone-900">{r.transactionNo}</td>
                    <td className="px-4 py-3 text-stone-500 font-sans">{formatDate(r.date)}</td>
                    <td className="px-4 py-3 font-sans font-medium text-stone-900">{r.memberName}</td>
                    <td className="px-4 py-3 font-sans">
                      <span className="font-semibold uppercase text-stone-800 text-[11px]">
                        {r.type} {r.action === 'tarik' ? '(Penarikan)' : '(Setor)'}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-sans text-stone-600 text-[11px]">{r.notes}</td>
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
                            title: `Bukti ${r.action === 'setor' ? 'Setoran' : 'Penarikan'} Simpanan ${r.type.toUpperCase()}`,
                            receiptNo: r.transactionNo,
                            date: r.date,
                            memberName: r.memberName,
                            cashierName: r.cashierName,
                            category: `Simpanan ${r.type}`,
                            breakdown: [
                              { label: 'Jenis Transaksi', value: `${r.action === 'setor' ? 'Setoran' : 'Penarikan'} Simpanan ${r.type}` },
                              { label: 'Jumlah', value: formatRupiah(r.amount), isBold: true },
                              { label: 'Saldo Akhir', value: formatRupiah(r.balanceAfter) },
                            ],
                            totalAmount: r.amount,
                            notes: r.notes,
                          });
                        }}
                        className="px-2 py-0.5 text-[10px] bg-stone-100 hover:bg-stone-200 text-stone-700 rounded cursor-pointer"
                      >
                        Struk
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* MODAL SETOR SIMPANAN WAJIB */}
      {showWajibModal && (
        <div className="fixed inset-0 bg-stone-900/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-stone-200">
            <h3 className="text-base font-bold text-stone-900 mb-2">Input Setoran Simpanan Wajib</h3>
            <p className="text-xs text-stone-500 mb-4">
              Tarif: PNS/PPPK Rp 100.000 · PPPK Paruh Waktu/Honorer Rp 50.000
            </p>

            <form onSubmit={handleWajibSubmit} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Pilih Anggota
                </label>
                <select
                  required
                  value={wajibMemberId}
                  onChange={(e) => setWajibMemberId(e.target.value)}
                  className="w-full text-xs p-2.5 bg-stone-50 border border-stone-300 rounded-lg text-stone-800 focus:outline-emerald-800"
                >
                  <option value="">-- Pilih Anggota --</option>
                  {members.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.memberNo} - {m.name} ({m.employmentStatus} · {formatRupiah(m.monthlyWajibAmount)})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Periode Bulan & Tahun
                </label>
                <input
                  type="month"
                  required
                  value={wajibMonth}
                  onChange={(e) => setWajibMonth(e.target.value)}
                  className="w-full text-xs p-2.5 bg-stone-50 border border-stone-300 rounded-lg focus:outline-emerald-800 font-mono"
                />
              </div>

              {wajibMemberId && (
                <div className="p-3 bg-emerald-50 rounded-lg border border-emerald-200 text-xs text-emerald-950 font-mono">
                  {(() => {
                    const m = members.find((x) => x.id === wajibMemberId);
                    if (!m) return null;
                    return (
                      <div className="flex justify-between items-center">
                        <span className="font-sans">Nominal Wajib Disetor:</span>
                        <span className="font-bold text-base text-emerald-800">
                          {formatRupiah(m.monthlyWajibAmount)}
                        </span>
                      </div>
                    );
                  })()}
                </div>
              )}

              <div className="mt-5 flex items-center justify-end gap-2 pt-3 border-t border-stone-200">
                <button
                  type="button"
                  onClick={() => setShowWajibModal(false)}
                  className="px-4 py-2 text-xs font-medium text-stone-600 hover:bg-stone-100 rounded-lg cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={!wajibMemberId}
                  className="px-4 py-2 text-xs font-semibold bg-emerald-800 hover:bg-emerald-900 text-white rounded-lg cursor-pointer"
                >
                  Catat Setoran & Cetak Struk
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL SETOR / TARIK SIMPANAN SUKARELA */}
      {showSukarelaModal && (
        <div className="fixed inset-0 bg-stone-900/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-stone-200">
            <h3 className="text-base font-bold text-stone-900 mb-2">
              {sukarelaAction === 'setor' ? 'Input Setor Simpanan Sukarela' : 'Input Penarikan Simpanan Sukarela'}
            </h3>
            <p className="text-xs text-stone-500 mb-4">
              Tabungan sukarela tanpa batas minimal atau maksimal.
            </p>

            <form onSubmit={handleSukarelaSubmit} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Pilih Anggota
                </label>
                <select
                  required
                  value={sukarelaMemberId}
                  onChange={(e) => setSukarelaMemberId(e.target.value)}
                  className="w-full text-xs p-2.5 bg-stone-50 border border-stone-300 rounded-lg text-stone-800 focus:outline-emerald-800"
                >
                  <option value="">-- Pilih Anggota --</option>
                  {members.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.memberNo} - {m.name} (Saldo: {formatRupiah(getMemberSimpananSukarelaTotal(m.id))})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Jumlah {sukarelaAction === 'setor' ? 'Setoran' : 'Penarikan'} (Rp)
                </label>
                <input
                  type="number"
                  min="10000"
                  step="50000"
                  required
                  value={sukarelaAmount}
                  onChange={(e) => setSukarelaAmount(Number(e.target.value))}
                  className="w-full text-xs font-mono p-2.5 bg-stone-50 border border-stone-300 rounded-lg focus:outline-emerald-800"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Keterangan / Keperluan
                </label>
                <input
                  type="text"
                  value={sukarelaNotes}
                  onChange={(e) => setSukarelaNotes(e.target.value)}
                  placeholder="Misal: Tabungan kurban, dana talangan pribadi..."
                  className="w-full text-xs p-2.5 bg-stone-50 border border-stone-300 rounded-lg focus:outline-emerald-800"
                />
              </div>

              {errorMsg && (
                <div className="p-2.5 bg-red-50 border border-red-200 text-red-800 rounded-lg text-xs font-medium">
                  {errorMsg}
                </div>
              )}

              <div className="mt-5 flex items-center justify-end gap-2 pt-3 border-t border-stone-200">
                <button
                  type="button"
                  onClick={() => setShowSukarelaModal(false)}
                  className="px-4 py-2 text-xs font-medium text-stone-600 hover:bg-stone-100 rounded-lg cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={!sukarelaMemberId || sukarelaAmount <= 0}
                  className={`px-4 py-2 text-xs font-semibold text-white rounded-lg cursor-pointer ${
                    sukarelaAction === 'setor'
                      ? 'bg-emerald-800 hover:bg-emerald-900'
                      : 'bg-red-700 hover:bg-red-800'
                  }`}
                >
                  {sukarelaAction === 'setor' ? 'Simpan Setoran' : 'Proses Penarikan'}
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
