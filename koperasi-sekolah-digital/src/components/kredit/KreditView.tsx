import React, { useState } from 'react';
import { useCooperative } from '../../context/CooperativeContext';
import { GoodsCredit, CreditAngsuran } from '../../types';
import { formatRupiah, formatDate, calculateCreditSchedule } from '../../utils/formatters';
import { PrintReceiptModal } from '../common/PrintReceiptModal';
import { 
  Laptop, 
  CheckCircle2, 
  Clock, 
  Plus, 
  Store, 
  Calculator, 
  FileText, 
  Receipt,
  ChevronRight,
  Info
} from 'lucide-react';

export const KreditView: React.FC = () => {
  const { 
    currentUser, 
    credits, 
    members, 
    applyGoodsCredit, 
    approveGoodsCredit, 
    rejectGoodsCredit, 
    payCreditInstallment,
    config
  } = useCooperative();

  const isPengelola = currentUser.role === 'pengelola';
  const isStaffOrAdmin = currentUser.role === 'pengelola' || currentUser.role === 'pegawai';

  const [activeTab, setActiveTab] = useState<'credits' | 'simulator' | 'pending'>('credits');
  
  // Selected Credit for Detail Modal
  const [selectedCredit, setSelectedCredit] = useState<GoodsCredit | null>(null);

  // New Credit Form State
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [applyMemberId, setApplyMemberId] = useState('');
  const [goodsName, setGoodsName] = useState('Laptop Asus Vivobook Core i5');
  const [basePrice, setBasePrice] = useState(10000000);
  const [tenorMonths, setTenorMonths] = useState(10);
  const [vendorName, setVendorName] = useState('Bhinneka Komputer Mangga Dua');
  const [goodsDescription, setGoodsDescription] = useState('Pengadaan laptop penunjang materi pembelajaran digital');

  // Simulator State
  const [simPrice, setSimPrice] = useState(10000000);
  const [simTenor, setSimTenor] = useState(10);
  const simResult = calculateCreditSchedule(simPrice, config.creditMarginRate, simTenor);

  // Receipt Modal
  const [receiptData, setReceiptData] = useState<any | null>(null);

  const handleApplySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!applyMemberId || basePrice <= 0 || !goodsName) return;

    applyGoodsCredit(applyMemberId, goodsName, basePrice, tenorMonths, vendorName, goodsDescription);
    setShowApplyModal(false);
    setApplyMemberId('');
  };

  const handlePay = (credit: GoodsCredit, installment: CreditAngsuran) => {
    if (confirm(`Konfirmasi pembayaran angsuran ke-${installment.installmentNumber} sebesar ${formatRupiah(installment.amount)} untuk ${credit.memberName}?`)) {
      payCreditInstallment(credit.id, installment.installmentNumber);

      setReceiptData({
        title: 'Bukti Pembayaran Kredit Barang',
        receiptNo: `KW-KRD-${Date.now().toString().slice(-6)}`,
        date: new Date().toISOString(),
        memberName: credit.memberName,
        cashierName: currentUser.name,
        category: 'Kredit Barang Margin 5%',
        breakdown: [
          { label: 'Nomor Kredit', value: credit.creditNo },
          { label: 'Nama Barang', value: credit.goodsName },
          { label: 'Toko / Vendor', value: credit.vendorName },
          { label: 'Angsuran Bulan Ke', value: `${installment.installmentNumber} dari ${credit.tenorMonths} bulan` },
          { label: 'Cicilan Bulanan (Flat)', value: formatRupiah(installment.amount) },
          { label: 'Sisa Kewajiban Setelah Bayar', value: formatRupiah(Math.max(0, credit.remainingAmount - installment.amount)), isBold: true },
        ],
        totalAmount: installment.amount,
        notes: `Pembayaran cicilan barang ke-${installment.installmentNumber}`,
      });

      setSelectedCredit((prev) => {
        if (!prev || prev.id !== credit.id) return prev;
        const updated = credits.find((c) => c.id === credit.id);
        return updated || null;
      });
    }
  };

  const totalBaseGoods = credits.reduce((acc, c) => acc + c.basePrice, 0);
  const totalMarginProjected = credits.reduce((acc, c) => acc + c.marginAmount, 0);
  const totalRemainingCredit = credits
    .filter((c) => c.status === 'active')
    .reduce((acc, c) => acc + c.remainingAmount, 0);

  const pendingCredits = credits.filter((c) => c.status === 'pending_approval');
  const activeCredits = credits.filter((c) => c.status === 'active' || c.status === 'completed');

  return (
    <div className="space-y-6">
      
      {/* Banner & Information */}
      <div className="bg-white rounded-xl border border-stone-200 p-5 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-2 rounded-lg bg-emerald-100 text-emerald-800">
                <Laptop className="w-5 h-5" />
              </span>
              <div>
                <h1 className="text-xl font-bold text-stone-900">
                  3. Kredit Barang (Ditalangi Koperasi)
                </h1>
                <p className="text-xs text-stone-500">
                  Koperasi menalangi pembelian barang/elektronik di awal dengan keuntungan flat <strong className="text-emerald-800 font-mono">5% dari harga barang</strong>.
                </p>
              </div>
            </div>
          </div>

          {/* Quick Metrics */}
          <div className="flex flex-wrap items-center gap-3 text-xs font-mono">
            <div className="bg-stone-50 border border-stone-200 rounded-lg p-2.5 px-3">
              <span className="text-stone-500 block text-[10px] font-sans">Sisa Piutang Kredit Barang</span>
              <span className="text-stone-900 font-bold">{formatRupiah(totalRemainingCredit)}</span>
            </div>
            <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-2.5 px-3">
              <span className="text-emerald-700 block text-[10px] font-sans">Total Keuntungan Margin 5%</span>
              <span className="text-emerald-900 font-bold">{formatRupiah(totalMarginProjected)}</span>
            </div>
          </div>
        </div>

        {/* Formula Explanation Callout */}
        <div className="mt-4 bg-stone-50 rounded-xl p-3.5 border border-stone-200 text-xs text-stone-700 flex items-start gap-2.5">
          <Info className="w-4 h-4 text-emerald-800 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <div className="font-semibold text-stone-900">
              Ketentuan Kredit Barang Koperasi:
            </div>
            <p className="text-[11px] text-stone-600 leading-relaxed">
              Koperasi membeli atau menalangi barang yang dibutuhkan anggota (seperti laptop, gawai mengajar, perabotan rumah, kendaraan) langsung ke toko vendor. 
              Anggota membayar kembali dengan margin keuntungan koperasi sebesar <strong>5% dari harga barang</strong>.
              <br />
              Contoh: Harga asli barang <strong>Rp 10.000.000</strong> → Keuntungan koperasi 5% = <strong>Rp 500.000</strong> → Total yang dicicil anggota = <strong className="text-emerald-800 font-mono">Rp 10.500.000</strong>. Jika tenor 10 bulan, maka cicilan tetap sebesar <strong className="text-emerald-800 font-mono">Rp 1.050.000 / bulan</strong>.
            </p>
          </div>
        </div>

        {/* Tab Buttons */}
        <div className="flex items-center justify-between mt-5 border-t border-stone-100 pt-3">
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setActiveTab('credits')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 cursor-pointer transition-colors ${
                activeTab === 'credits'
                  ? 'bg-emerald-800 text-white shadow-xs'
                  : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100'
              }`}
            >
              <FileText className="w-4 h-4" />
              <span>Daftar Kredit Barang ({activeCredits.length})</span>
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
              <span>Simulasi Kredit 5%</span>
            </button>

            {isPengelola && pendingCredits.length > 0 && (
              <button
                onClick={() => setActiveTab('pending')}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 cursor-pointer transition-colors ${
                  activeTab === 'pending'
                    ? 'bg-amber-700 text-white shadow-xs'
                    : 'text-amber-800 bg-amber-50 hover:bg-amber-100'
                }`}
              >
                <Clock className="w-4 h-4" />
                <span>Persetujuan Talangan ({pendingCredits.length})</span>
              </button>
            )}
          </div>

          {isStaffOrAdmin && (
            <button
              onClick={() => setShowApplyModal(true)}
              className="px-3.5 py-1.5 bg-emerald-800 hover:bg-emerald-900 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 cursor-pointer shadow-xs"
            >
              <Plus className="w-4 h-4" />
              <span>Ajukan Kredit Barang</span>
            </button>
          )}
        </div>
      </div>

      {/* TAB 1: DAFTAR KREDIT BARANG */}
      {activeTab === 'credits' && (
        <div className="bg-white rounded-xl border border-stone-200 p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-sm text-stone-900">Daftar Pengadaan Barang Kredit Anggota</h3>
            <span className="text-xs text-stone-500">Klik "Rincian Cicilan" untuk melihat angsuran dan pembayaran</span>
          </div>

          <div className="overflow-x-auto border border-stone-200 rounded-lg">
            <table className="w-full text-xs text-left text-stone-700">
              <thead className="bg-stone-50 border-b border-stone-200 font-semibold text-stone-900 uppercase text-[10px]">
                <tr>
                  <th className="px-4 py-3">No. Kredit</th>
                  <th className="px-4 py-3">Nama Anggota</th>
                  <th className="px-4 py-3">Barang & Vendor Toko</th>
                  <th className="px-4 py-3 text-right">Harga Asli</th>
                  <th className="px-4 py-3 text-right">Margin 5%</th>
                  <th className="px-4 py-3 text-right font-bold text-stone-900">Total Kredit</th>
                  <th className="px-4 py-3 text-center">Tenor</th>
                  <th className="px-4 py-3 text-right">Sisa Tagihan</th>
                  <th className="px-4 py-3 text-center">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {activeCredits.map((c) => {
                  const paidCount = c.schedule.filter((s) => s.status === 'paid').length;
                  return (
                    <tr key={c.id} className="hover:bg-stone-50/70 transition-colors">
                      <td className="px-4 py-3 font-mono font-bold text-stone-900">{c.creditNo}</td>
                      <td className="px-4 py-3 font-medium text-stone-900">{c.memberName}</td>
                      <td className="px-4 py-3">
                        <div className="font-medium text-stone-900">{c.goodsName}</div>
                        <div className="text-[10px] text-stone-400 flex items-center gap-1">
                          <Store className="w-3 h-3" />
                          <span>{c.vendorName}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-right font-mono text-stone-500">
                        {formatRupiah(c.basePrice)}
                      </td>
                      <td className="px-4 py-3 text-right font-mono text-emerald-700 font-semibold">
                        +{formatRupiah(c.marginAmount)}
                      </td>
                      <td className="px-4 py-3 text-right font-mono font-bold text-stone-900">
                        {formatRupiah(c.totalPayable)}
                      </td>
                      <td className="px-4 py-3 text-center font-mono">
                        {paidCount}/{c.tenorMonths} bln
                      </td>
                      <td className="px-4 py-3 text-right font-mono font-bold text-stone-900">
                        {formatRupiah(c.remainingAmount)}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <button
                          onClick={() => setSelectedCredit(c)}
                          className="px-3 py-1.5 bg-stone-100 hover:bg-emerald-50 hover:text-emerald-900 text-stone-700 rounded-lg font-medium text-[11px] inline-flex items-center gap-1 cursor-pointer transition-colors"
                        >
                          <span>Rincian Cicilan</span>
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

      {/* TAB 2: SIMULATOR KREDIT 5% */}
      {activeTab === 'simulator' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-4">
            <div className="bg-white rounded-xl border border-stone-200 p-5 shadow-xs space-y-4">
              <h3 className="font-bold text-sm text-stone-900 flex items-center gap-2">
                <Calculator className="w-4 h-4 text-emerald-800" />
                Simulasi Kredit Barang (5%)
              </h3>
              <p className="text-xs text-stone-500">
                Hitung otomatis margin 5% dari harga barang asli dan cicilan per bulannya.
              </p>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Harga Asli Barang / Nota Toko (Rp)
                </label>
                <input
                  type="number"
                  min="500000"
                  step="500000"
                  value={simPrice}
                  onChange={(e) => setSimPrice(Number(e.target.value))}
                  className="w-full text-xs font-mono p-2.5 bg-stone-50 border border-stone-300 rounded-lg focus:outline-emerald-800"
                />
                <div className="flex gap-2 mt-1.5">
                  {[5000000, 10000000, 15000000].map((val) => (
                    <button
                      key={val}
                      type="button"
                      onClick={() => setSimPrice(val)}
                      className="px-2 py-1 text-[10px] font-mono bg-stone-100 hover:bg-stone-200 rounded text-stone-700 cursor-pointer"
                    >
                      {formatRupiah(val)}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Jangka Waktu Cicilan (Tenor Bulan)
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {[3, 6, 10, 12].map((t) => (
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

              {/* Result Summary */}
              <div className="p-3 bg-stone-50 rounded-lg border border-stone-200 space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-stone-500">Harga Pokok Barang:</span>
                  <span className="font-mono text-stone-900">{formatRupiah(simPrice)}</span>
                </div>
                <div className="flex justify-between text-emerald-800 font-medium">
                  <span>Keuntungan Koperasi (5%):</span>
                  <span className="font-mono">+{formatRupiah(simResult.marginAmount)}</span>
                </div>
                <div className="flex justify-between border-t border-stone-200 pt-2 font-bold text-stone-900">
                  <span>Total yang Dibayar Anggota:</span>
                  <span className="font-mono">{formatRupiah(simResult.totalPayable)}</span>
                </div>
                <div className="flex justify-between bg-emerald-100/60 p-2 rounded text-emerald-900 font-bold">
                  <span>Cicilan per Bulan:</span>
                  <span className="font-mono">{formatRupiah(simResult.monthlyInstallment)} / bln</span>
                </div>
              </div>

            </div>
          </div>

          <div className="lg:col-span-8">
            <div className="bg-white rounded-xl border border-stone-200 p-5 shadow-xs space-y-3">
              <h3 className="font-bold text-sm text-stone-900">Tabel Angsuran Flat per Bulan</h3>
              <p className="text-xs text-stone-500">
                Total kewajiban {formatRupiah(simResult.totalPayable)} dicicil merata selama {simTenor} bulan.
              </p>

              <div className="overflow-x-auto border border-stone-200 rounded-lg">
                <table className="w-full text-xs text-left text-stone-700 font-mono">
                  <thead className="bg-stone-50 border-b border-stone-200 font-semibold text-stone-900 uppercase text-[10px]">
                    <tr>
                      <th className="px-4 py-2.5 text-center font-sans">Bulan Ke</th>
                      <th className="px-4 py-2.5">Estimasi Jatuh Tempo</th>
                      <th className="px-4 py-2.5 text-right font-bold text-emerald-900">Jumlah Angsuran</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-100">
                    {simResult.schedule.map((item) => (
                      <tr key={item.installmentNumber} className="hover:bg-stone-50/70">
                        <td className="px-4 py-2 text-center font-sans font-medium">
                          Bulan ke-{item.installmentNumber}
                        </td>
                        <td className="px-4 py-2 text-stone-500">{formatDate(item.dueDate)}</td>
                        <td className="px-4 py-2 text-right font-bold text-emerald-900">
                          {formatRupiah(item.amount)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot className="bg-stone-100 font-bold text-stone-900 text-xs">
                    <tr>
                      <td colSpan={2} className="px-4 py-2.5 font-sans">TOTAL PELUNASAN KREDIT</td>
                      <td className="px-4 py-2.5 text-right font-mono text-emerald-900">
                        {formatRupiah(simResult.totalPayable)}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: PERSETUJUAN TALANGAN BARANG (PENGELOLA) */}
      {activeTab === 'pending' && isPengelola && (
        <div className="bg-white rounded-xl border border-stone-200 p-5 shadow-xs space-y-4">
          <div>
            <h3 className="font-bold text-sm text-stone-900">Pengajuan Kredit Menunggu Persetujuan Talangan Kas</h3>
            <p className="text-xs text-stone-500">Persetujuan pengelola untuk mengeluarkan kas koperasi menalangi belanja barang.</p>
          </div>

          <div className="space-y-3">
            {pendingCredits.map((c) => (
              <div
                key={c.id}
                className="p-4 rounded-xl border border-amber-200 bg-amber-50/40 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-stone-900 text-sm">{c.memberName}</span>
                    <span className="text-[11px] font-mono text-stone-500">#{c.creditNo}</span>
                  </div>
                  <div className="text-xs text-stone-800 font-semibold mt-1">
                    {c.goodsName} (Vendor: {c.vendorName})
                  </div>
                  <div className="text-xs text-stone-600 mt-0.5">
                    Harga Asli: <strong className="font-mono">{formatRupiah(c.basePrice)}</strong> · Margin 5%: <strong className="font-mono text-emerald-800">+{formatRupiah(c.marginAmount)}</strong> · Tenor: <strong>{c.tenorMonths} bulan</strong>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      if (confirm(`Tolak pengajuan kredit ${c.memberName}?`)) {
                        rejectGoodsCredit(c.id);
                      }
                    }}
                    className="px-3 py-1.5 text-xs font-medium text-stone-700 bg-white border border-stone-300 hover:bg-stone-100 rounded-lg cursor-pointer"
                  >
                    Tolak
                  </button>
                  <button
                    onClick={() => {
                      if (confirm(`Setujui talangan barang ${c.goodsName} sebesar ${formatRupiah(c.basePrice)} dari kas koperasi?`)) {
                        approveGoodsCredit(c.id);
                      }
                    }}
                    className="px-4 py-1.5 text-xs font-semibold text-white bg-emerald-800 hover:bg-emerald-900 rounded-lg cursor-pointer"
                  >
                    Setujui & Talangi Dana
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* DETAIL MODAL FOR A CREDIT */}
      {selectedCredit && (
        <div className="fixed inset-0 bg-stone-900/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl border border-stone-200 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-stone-200">
              <div>
                <h3 className="text-base font-bold text-stone-900">
                  Rincian Kredit: {selectedCredit.goodsName}
                </h3>
                <p className="text-xs text-stone-500">
                  Peminjam: {selectedCredit.memberName} · Vendor: {selectedCredit.vendorName} · Total: {formatRupiah(selectedCredit.totalPayable)}
                </p>
              </div>
              <button
                onClick={() => setSelectedCredit(null)}
                className="px-3 py-1.5 text-xs text-stone-500 hover:text-stone-800 hover:bg-stone-100 rounded-lg cursor-pointer"
              >
                Tutup
              </button>
            </div>

            <div className="mt-4 overflow-x-auto border border-stone-200 rounded-lg">
              <table className="w-full text-xs text-left text-stone-700 font-mono">
                <thead className="bg-stone-50 border-b border-stone-200 font-semibold text-stone-900 uppercase text-[10px]">
                  <tr>
                    <th className="px-3 py-2.5 text-center font-sans">Bulan</th>
                    <th className="px-3 py-2.5">Jatuh Tempo</th>
                    <th className="px-3 py-2.5 text-right">Angsuran</th>
                    <th className="px-3 py-2.5 text-center font-sans">Status</th>
                    {isStaffOrAdmin && <th className="px-3 py-2.5 text-center font-sans">Aksi Kasir</th>}
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                  {selectedCredit.schedule.map((item) => (
                    <tr key={item.installmentNumber} className={item.status === 'paid' ? 'bg-emerald-50/20' : ''}>
                      <td className="px-3 py-2 text-center font-sans font-medium">Bulan ke-{item.installmentNumber}</td>
                      <td className="px-3 py-2 text-stone-500">{formatDate(item.dueDate)}</td>
                      <td className="px-3 py-2 text-right font-bold text-emerald-900">{formatRupiah(item.amount)}</td>
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
                                  title: 'Bukti Pembayaran Kredit Barang',
                                  receiptNo: `KW-KRD-${item.installmentNumber}`,
                                  date: item.paidDate || new Date().toISOString(),
                                  memberName: selectedCredit.memberName,
                                  cashierName: item.cashierName || currentUser.name,
                                  category: 'Kredit Barang',
                                  breakdown: [
                                    { label: 'Nomor Kredit', value: selectedCredit.creditNo },
                                    { label: 'Barang', value: selectedCredit.goodsName },
                                    { label: 'Angsuran Bulan Ke', value: `${item.installmentNumber} dari ${selectedCredit.tenorMonths} bulan` },
                                  ],
                                  totalAmount: item.amount,
                                });
                              }}
                              className="px-2 py-0.5 text-[10px] bg-stone-100 hover:bg-stone-200 text-stone-700 rounded cursor-pointer"
                            >
                              Struk
                            </button>
                          ) : (
                            <button
                              onClick={() => handlePay(selectedCredit, item)}
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

      {/* NEW CREDIT FORM MODAL */}
      {showApplyModal && (
        <div className="fixed inset-0 bg-stone-900/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-stone-200">
            <h3 className="text-base font-bold text-stone-900 mb-2">Form Pengajuan Kredit Barang</h3>
            <p className="text-xs text-stone-500 mb-4">
              Koperasi menalangi pembelian barang dengan keuntungan flat 5%.
            </p>

            <form onSubmit={handleApplySubmit} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Pilih Anggota Pemohon
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
                  Nama Barang & Spesifikasi
                </label>
                <input
                  type="text"
                  required
                  value={goodsName}
                  onChange={(e) => setGoodsName(e.target.value)}
                  placeholder="Misal: Laptop Asus Vivobook / Motor Honda Beat..."
                  className="w-full text-xs p-2.5 bg-stone-50 border border-stone-300 rounded-lg focus:outline-emerald-800"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Nama Toko / Mitra Vendor Pengadaan
                </label>
                <input
                  type="text"
                  required
                  value={vendorName}
                  onChange={(e) => setVendorName(e.target.value)}
                  placeholder="Misal: Toko Komputer Megah, Dealer Motor..."
                  className="w-full text-xs p-2.5 bg-stone-50 border border-stone-300 rounded-lg focus:outline-emerald-800"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    Harga Asli Barang (Rp)
                  </label>
                  <input
                    type="number"
                    min="100000"
                    step="100000"
                    required
                    value={basePrice}
                    onChange={(e) => setBasePrice(Number(e.target.value))}
                    className="w-full text-xs font-mono p-2.5 bg-stone-50 border border-stone-300 rounded-lg focus:outline-emerald-800"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    Tenor (Bulan)
                  </label>
                  <select
                    value={tenorMonths}
                    onChange={(e) => setTenorMonths(Number(e.target.value))}
                    className="w-full text-xs p-2.5 bg-stone-50 border border-stone-300 rounded-lg focus:outline-emerald-800"
                  >
                    <option value={3}>3 Bulan</option>
                    <option value={6}>6 Bulan</option>
                    <option value={10}>10 Bulan</option>
                    <option value={12}>12 Bulan</option>
                  </select>
                </div>
              </div>

              {/* Calculation Preview */}
              <div className="p-3 bg-stone-50 rounded-lg border border-stone-200 text-[11px] space-y-1 font-mono">
                <div className="flex justify-between">
                  <span className="text-stone-500 font-sans">Margin Koperasi 5%:</span>
                  <span className="text-emerald-800 font-semibold">+{formatRupiah(basePrice * 0.05)}</span>
                </div>
                <div className="flex justify-between font-bold pt-1 border-t border-stone-200 text-stone-900">
                  <span className="font-sans">Total Dicicil Anggota:</span>
                  <span>{formatRupiah(basePrice * 1.05)}</span>
                </div>
                <div className="flex justify-between font-bold text-emerald-900">
                  <span className="font-sans">Cicilan per Bulan:</span>
                  <span>{formatRupiah(Math.round((basePrice * 1.05) / tenorMonths))} / bln</span>
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
                  {isPengelola ? 'Setujui & Talangi Langsung' : 'Kirim Pengajuan'}
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
