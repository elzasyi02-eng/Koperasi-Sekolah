import React, { useState } from 'react';
import { useCooperative } from '../../context/CooperativeContext';
import { CashTransaction, CashCategory } from '../../types';
import { formatRupiah, formatDate, formatDateFull } from '../../utils/formatters';
import { 
  BookOpen, 
  ArrowDownLeft, 
  ArrowUpRight, 
  Plus, 
  Search, 
  Filter, 
  DollarSign,
  TrendingUp,
  TrendingDown,
  Building
} from 'lucide-react';

export const BukuKasView: React.FC = () => {
  const { 
    currentUser, 
    cashTransactions, 
    getCurrentCashBalance, 
    addManualCashTransaction 
  } = useCooperative();

  const isStaffOrAdmin = currentUser.role === 'pengelola' || currentUser.role === 'pegawai';

  const [filterType, setFilterType] = useState<'all' | 'in' | 'out'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);

  // Form State Manual Kas
  const [txType, setTxType] = useState<'in' | 'out'>('out');
  const [category, setCategory] = useState<CashCategory>('operasional');
  const [amount, setAmount] = useState(250000);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');

  const currentBalance = getCurrentCashBalance();

  const totalIn = cashTransactions
    .filter((t) => t.type === 'in')
    .reduce((acc, t) => acc + t.amount, 0);

  const totalOut = cashTransactions
    .filter((t) => t.type === 'out')
    .reduce((acc, t) => acc + t.amount, 0);

  const filteredTransactions = cashTransactions.filter((t) => {
    const matchType = filterType === 'all' || t.type === filterType;
    const matchSearch =
      t.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.refNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (t.memberName && t.memberName.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchType && matchSearch;
  });

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || amount <= 0) return;

    addManualCashTransaction(txType, category, amount, title, description);
    setShowAddModal(false);
    setTitle('');
    setDescription('');
    setAmount(250000);
  };

  return (
    <div className="space-y-6">
      
      {/* Banner & Saldo Kas */}
      <div className="bg-white rounded-xl border border-stone-200 p-5 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-2 rounded-lg bg-emerald-100 text-emerald-800">
                <BookOpen className="w-5 h-5" />
              </span>
              <div>
                <h1 className="text-xl font-bold text-stone-900">
                  Buku Kas Umum (Arus Kas Masuk & Keluar)
                </h1>
                <p className="text-xs text-stone-500">
                  Pencatatan real-time seluruh peredaran uang tunai dan rekening koperasi sekolah.
                </p>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3 text-xs font-mono">
            <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-2.5 px-3">
              <span className="text-emerald-700 block text-[10px] font-sans flex items-center gap-1">
                <TrendingUp className="w-3 h-3" /> Total Kas Masuk
              </span>
              <span className="text-emerald-950 font-bold">{formatRupiah(totalIn)}</span>
            </div>
            <div className="bg-red-50 border border-red-200 rounded-lg p-2.5 px-3">
              <span className="text-red-700 block text-[10px] font-sans flex items-center gap-1">
                <TrendingDown className="w-3 h-3" /> Total Kas Keluar
              </span>
              <span className="text-red-950 font-bold">{formatRupiah(totalOut)}</span>
            </div>
            <div className="bg-stone-900 text-white rounded-lg p-2.5 px-4">
              <span className="text-stone-400 block text-[10px] font-sans">Saldo Kas Terkini</span>
              <span className="text-emerald-400 font-bold text-sm">{formatRupiah(currentBalance)}</span>
            </div>
          </div>
        </div>

        {/* Action Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mt-5 border-t border-stone-100 pt-3">
          <div className="flex items-center gap-2">
            <div className="flex bg-stone-100 p-1 rounded-lg">
              <button
                onClick={() => setFilterType('all')}
                className={`px-3 py-1 rounded text-xs font-medium cursor-pointer ${
                  filterType === 'all' ? 'bg-white text-stone-900 shadow-xs' : 'text-stone-600'
                }`}
              >
                Semua ({cashTransactions.length})
              </button>
              <button
                onClick={() => setFilterType('in')}
                className={`px-3 py-1 rounded text-xs font-medium cursor-pointer ${
                  filterType === 'in' ? 'bg-white text-emerald-800 shadow-xs' : 'text-stone-600'
                }`}
              >
                Uang Masuk
              </button>
              <button
                onClick={() => setFilterType('out')}
                className={`px-3 py-1 rounded text-xs font-medium cursor-pointer ${
                  filterType === 'out' ? 'bg-white text-red-700 shadow-xs' : 'text-stone-600'
                }`}
              >
                Uang Keluar
              </button>
            </div>

            <div className="relative">
              <Search className="w-3.5 h-3.5 text-stone-400 absolute left-2.5 top-2.5" />
              <input
                type="text"
                placeholder="Cari transaksi..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="text-xs pl-8 pr-3 py-1.5 bg-stone-50 border border-stone-300 rounded-lg focus:outline-emerald-800"
              />
            </div>
          </div>

          {isStaffOrAdmin && (
            <button
              onClick={() => setShowAddModal(true)}
              className="px-3.5 py-1.5 bg-emerald-800 hover:bg-emerald-900 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 cursor-pointer shadow-xs self-start"
            >
              <Plus className="w-4 h-4" />
              <span>Input Kas Masuk / Keluar Manual</span>
            </button>
          )}
        </div>
      </div>

      {/* Table Arus Kas */}
      <div className="bg-white rounded-xl border border-stone-200 p-5 shadow-xs space-y-4">
        <div className="overflow-x-auto border border-stone-200 rounded-lg">
          <table className="w-full text-xs text-left text-stone-700 font-mono">
            <thead className="bg-stone-50 border-b border-stone-200 font-semibold text-stone-900 uppercase text-[10px] font-sans">
              <tr>
                <th className="px-4 py-3">No. Referensi</th>
                <th className="px-4 py-3">Tanggal</th>
                <th className="px-4 py-3">Kategori</th>
                <th className="px-4 py-3">Uraian & Keterangan</th>
                <th className="px-4 py-3 text-right">Masuk (Debit)</th>
                <th className="px-4 py-3 text-right">Keluar (Kredit)</th>
                <th className="px-4 py-3 text-right">Saldo Berjalan</th>
                <th className="px-4 py-3 font-sans">Petugas</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {filteredTransactions
                .slice()
                .reverse()
                .map((t) => (
                  <tr key={t.id} className="hover:bg-stone-50/70 transition-colors">
                    <td className="px-4 py-3 font-bold text-stone-900">{t.refNo}</td>
                    <td className="px-4 py-3 text-stone-500 font-sans">{formatDate(t.date)}</td>
                    <td className="px-4 py-3 font-sans">
                      <span className="text-[11px] font-medium text-stone-600 uppercase">
                        {t.category.replace(/_/g, ' ')}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-sans">
                      <div className="font-semibold text-stone-900">{t.title}</div>
                      <div className="text-[10px] text-stone-500">{t.description}</div>
                    </td>
                    <td className="px-4 py-3 text-right font-bold text-emerald-800">
                      {t.type === 'in' ? `+${formatRupiah(t.amount)}` : '-'}
                    </td>
                    <td className="px-4 py-3 text-right font-bold text-red-600">
                      {t.type === 'out' ? `-${formatRupiah(t.amount)}` : '-'}
                    </td>
                    <td className="px-4 py-3 text-right font-bold text-stone-900">
                      {formatRupiah(t.balanceAfter)}
                    </td>
                    <td className="px-4 py-3 font-sans text-stone-600 text-[11px]">
                      {t.cashierName}
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Input Kas Manual */}
      {showAddModal && (
        <div className="fixed inset-0 bg-stone-900/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-stone-200">
            <h3 className="text-base font-bold text-stone-900 mb-2">Pencatatan Kas Manual</h3>
            <p className="text-xs text-stone-500 mb-4">
              Catat uang masuk atau keluar operasional (pengadaan ATK kantor, listrik, kulakan, dsb).
            </p>

            <form onSubmit={handleAddSubmit} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Jenis Arus Kas
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setTxType('in');
                      setCategory('lainnya');
                    }}
                    className={`py-2 text-xs font-semibold rounded-lg border cursor-pointer ${
                      txType === 'in'
                        ? 'border-emerald-700 bg-emerald-50 text-emerald-900'
                        : 'border-stone-200 text-stone-600'
                    }`}
                  >
                    + Uang Masuk (Debit)
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setTxType('out');
                      setCategory('operasional');
                    }}
                    className={`py-2 text-xs font-semibold rounded-lg border cursor-pointer ${
                      txType === 'out'
                        ? 'border-red-700 bg-red-50 text-red-900'
                        : 'border-stone-200 text-stone-600'
                    }`}
                  >
                    - Uang Keluar (Kredit)
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Kategori Kas
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as any)}
                  className="w-full text-xs p-2.5 bg-stone-50 border border-stone-300 rounded-lg text-stone-800 focus:outline-emerald-800"
                >
                  {txType === 'out' ? (
                    <>
                      <option value="operasional">Biaya Operasional Koperasi</option>
                      <option value="waserda_kulakan">Kulakan / Belanja Stok Waserda</option>
                      <option value="lainnya">Pengeluaran Lain-lain</option>
                    </>
                  ) : (
                    <>
                      <option value="modal_awal">Tambahan Modal / Hibah</option>
                      <option value="lainnya">Pendapatan Lain-lain</option>
                    </>
                  )}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Jumlah Nominal (Rp)
                </label>
                <input
                  type="number"
                  min="1000"
                  step="1000"
                  required
                  value={amount}
                  onChange={(e) => setAmount(Number(e.target.value))}
                  className="w-full text-xs font-mono p-2.5 bg-stone-50 border border-stone-300 rounded-lg focus:outline-emerald-800"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Judul Transaksi
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Misal: Beli Kertas Kwitansi & Tinta Stempel"
                  className="w-full text-xs p-2.5 bg-stone-50 border border-stone-300 rounded-lg focus:outline-emerald-800"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Keterangan Lengkap
                </label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Keterangan pendukung atau nomor nota toko..."
                  className="w-full text-xs p-2.5 bg-stone-50 border border-stone-300 rounded-lg focus:outline-emerald-800"
                />
              </div>

              <div className="mt-5 flex items-center justify-end gap-2 pt-3 border-t border-stone-200">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 text-xs font-medium text-stone-600 hover:bg-stone-100 rounded-lg cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-semibold bg-emerald-800 hover:bg-emerald-900 text-white rounded-lg cursor-pointer"
                >
                  Simpan ke Buku Kas
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
