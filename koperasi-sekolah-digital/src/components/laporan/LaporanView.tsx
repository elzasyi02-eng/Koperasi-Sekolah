import React, { useState } from 'react';
import { useCooperative } from '../../context/CooperativeContext';
import { formatRupiah, formatDateFull } from '../../utils/formatters';
import { 
  FileSpreadsheet, 
  Printer, 
  Scale, 
  TrendingUp, 
  PieChart, 
  CheckCircle2,
  Building2,
  Calendar
} from 'lucide-react';

export const LaporanView: React.FC = () => {
  const { 
    config, 
    getCurrentCashBalance, 
    products, 
    waserdaTransactions, 
    uspLoans, 
    credits, 
    members, 
    getMemberSimpananWajibTotal, 
    getMemberSimpananSukarelaTotal,
    cashTransactions 
  } = useCooperative();

  const [activeTab, setActiveTab] = useState<'shu' | 'neraca' | 'alokasi'>('shu');

  // Arus Kas & Saldo
  const cashBalance = getCurrentCashBalance();

  // Piutang
  const piutangUSP = uspLoans
    .filter((l) => l.status === 'active')
    .reduce((acc, l) => acc + l.remainingPrincipal, 0);

  const piutangKredit = credits
    .filter((c) => c.status === 'active')
    .reduce((acc, c) => acc + c.remainingAmount, 0);

  // Stok Waserda
  const stokWaserda = products.reduce((acc, p) => acc + p.costPrice * p.stock, 0);

  // Total Aktiva
  const totalAktiva = cashBalance + piutangUSP + piutangKredit + stokWaserda;

  // Pasiva - Simpanan
  const totalSimpananWajib = members.reduce((acc, m) => acc + getMemberSimpananWajibTotal(m.id), 0);
  const totalSimpananSukarela = members.reduce((acc, m) => acc + getMemberSimpananSukarelaTotal(m.id), 0);
  const totalKewajibanSimpanan = totalSimpananWajib + totalSimpananSukarela;

  // Pendapatan Koperasi
  const labaWaserda = waserdaTransactions.reduce((acc, t) => acc + t.totalProfit, 0);
  const pendapatanBungaUSP = uspLoans.reduce((acc, l) => acc + l.totalInterestPaid, 0);
  const marginKredit = credits.reduce((acc, c) => acc + c.marginAmount, 0);
  const totalPendapatanKotor = labaWaserda + pendapatanBungaUSP + marginKredit;

  // Beban Operasional
  const bebanOperasional = cashTransactions
    .filter((t) => t.category === 'operasional')
    .reduce((acc, t) => acc + t.amount, 0);

  // Sisa Hasil Usaha (SHU) Bersih
  const shuBersih = Math.max(0, totalPendapatanKotor - bebanOperasional);

  // Modal Sendiri / Ekuitas Seimbang
  const modalSendiri = totalAktiva - (totalKewajibanSimpanan + shuBersih);

  // Rencana Pembagian SHU Sesuai AD/ART Koperasi Sekolah
  const alokasi = {
    cadangan: Math.round(shuBersih * 0.40), // 40% Cadangan Koperasi
    jasaModal: Math.round(shuBersih * 0.25), // 25% Jasa Simpanan/Modal Anggota
    jasaUsaha: Math.round(shuBersih * 0.20), // 20% Jasa Belanja & Pinjaman Anggota
    pengurus: Math.round(shuBersih * 0.10), // 10% Dana Pengurus & Pegawai
    sosialPendidikan: Math.round(shuBersih * 0.05), // 5% Dana Pendidikan & Sosial Sekolah
  };

  return (
    <div className="space-y-6">
      
      {/* Header & Print Control */}
      <div className="bg-white rounded-xl border border-stone-200 p-5 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-2 rounded-lg bg-emerald-100 text-emerald-800">
                <FileSpreadsheet className="w-5 h-5" />
              </span>
              <div>
                <h1 className="text-xl font-bold text-stone-900">
                  Laporan Keuangan & Perhitungan SHU
                </h1>
                <p className="text-xs text-stone-500">
                  Transparansi keuangan resmi koperasi sekolah untuk Rapat Anggota Tahunan (RAT).
                </p>
              </div>
            </div>
          </div>

          <button
            onClick={() => window.print()}
            className="px-3.5 py-2 border border-stone-300 hover:bg-stone-50 rounded-lg text-stone-700 text-xs font-semibold flex items-center gap-1.5 cursor-pointer self-start sm:self-auto"
          >
            <Printer className="w-4 h-4" />
            <span>Cetak Dokumen Laporan</span>
          </button>
        </div>

        {/* Tab Selection */}
        <div className="flex items-center gap-1.5 mt-5 border-t border-stone-100 pt-3">
          <button
            onClick={() => setActiveTab('shu')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 cursor-pointer transition-colors ${
              activeTab === 'shu'
                ? 'bg-emerald-800 text-white shadow-xs'
                : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100'
            }`}
          >
            <TrendingUp className="w-4 h-4" />
            <span>1. Laporan Laba Rugi / SHU</span>
          </button>

          <button
            onClick={() => setActiveTab('neraca')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 cursor-pointer transition-colors ${
              activeTab === 'neraca'
                ? 'bg-emerald-800 text-white shadow-xs'
                : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100'
            }`}
          >
            <Scale className="w-4 h-4" />
            <span>2. Neraca Saldo Koperasi</span>
          </button>

          <button
            onClick={() => setActiveTab('alokasi')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 cursor-pointer transition-colors ${
              activeTab === 'alokasi'
                ? 'bg-emerald-800 text-white shadow-xs'
                : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100'
            }`}
          >
            <PieChart className="w-4 h-4" />
            <span>3. Rencana Alokasi SHU Anggota</span>
          </button>
        </div>
      </div>

      {/* PRINTABLE OFFICIAL REPORT PAPER */}
      <div className="bg-white rounded-xl border border-stone-200 p-6 sm:p-8 shadow-xs print-card space-y-6">
        
        {/* Formal Letterhead */}
        <div className="text-center border-b-2 border-stone-800 pb-4">
          <h2 className="text-base sm:text-lg font-bold tracking-tight uppercase text-stone-900">
            {config.name}
          </h2>
          <h3 className="text-sm font-semibold text-stone-700">{config.schoolName}</h3>
          <p className="text-xs text-stone-500 mt-0.5">{config.address} · Telp: {config.phone}</p>
        </div>

        {/* TAB 1: LAPORAN LABA RUGI / SHU */}
        {activeTab === 'shu' && (
          <div className="space-y-6">
            <div className="text-center">
              <h3 className="text-sm font-bold uppercase tracking-wider text-stone-900">
                Laporan Perhitungan Sisa Hasil Usaha (SHU)
              </h3>
              <p className="text-xs text-stone-500 font-mono">
                Periode Berjalan Tahun Buku 2026
              </p>
            </div>

            {/* Income Statement Table */}
            <div className="border border-stone-300 rounded-lg overflow-hidden text-xs">
              <table className="w-full text-left">
                
                {/* 1. Pendapatan */}
                <thead className="bg-stone-100 border-b border-stone-300 font-bold text-stone-900">
                  <tr>
                    <th className="px-4 py-2.5">I. PENDAPATAN OPERASIONAL KOPERASI</th>
                    <th className="px-4 py-2.5 text-right">JUMLAH (RP)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-200 font-mono">
                  <tr>
                    <td className="px-4 py-2.5 font-sans">
                      <span className="font-semibold text-stone-900">1. Pendapatan Bunga Pinjaman USP</span>
                      <span className="block text-[11px] text-stone-500">Suku bunga 3% menurun dari peminjam anggota</span>
                    </td>
                    <td className="px-4 py-2.5 text-right font-semibold text-stone-900">
                      {formatRupiah(pendapatanBungaUSP)}
                    </td>
                  </tr>
                  <tr>
                    <td className="px-4 py-2.5 font-sans">
                      <span className="font-semibold text-stone-900">2. Keuntungan Margin Kredit Barang</span>
                      <span className="block text-[11px] text-stone-500">Margin flat 5% pengadaan barang ditalangi koperasi</span>
                    </td>
                    <td className="px-4 py-2.5 text-right font-semibold text-stone-900">
                      {formatRupiah(marginKredit)}
                    </td>
                  </tr>
                  <tr>
                    <td className="px-4 py-2.5 font-sans">
                      <span className="font-semibold text-stone-900">3. Keuntungan Laba Waserda (Warung Serba Ada)</span>
                      <span className="block text-[11px] text-stone-500">Hasil penjualan ATK, seragam guru, dan konsumsi (Omzet - HPP)</span>
                    </td>
                    <td className="px-4 py-2.5 text-right font-semibold text-stone-900">
                      {formatRupiah(labaWaserda)}
                    </td>
                  </tr>
                  <tr className="bg-stone-50 font-bold text-emerald-950">
                    <td className="px-4 py-2.5 font-sans">TOTAL PENDAPATAN KOTOR (A)</td>
                    <td className="px-4 py-2.5 text-right">{formatRupiah(totalPendapatanKotor)}</td>
                  </tr>
                </tbody>

                {/* 2. Beban */}
                <thead className="bg-stone-100 border-y border-stone-300 font-bold text-stone-900">
                  <tr>
                    <th className="px-4 py-2.5">II. BEBAN OPERASIONAL KOPERASI</th>
                    <th className="px-4 py-2.5 text-right">JUMLAH (RP)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-200 font-mono">
                  <tr>
                    <td className="px-4 py-2.5 font-sans">
                      <span className="font-semibold text-stone-900">1. Biaya Operasional & ATK Kantor</span>
                      <span className="block text-[11px] text-stone-500">Kebutuhan buku kas, kwitansi, rapat pengurus, administrasi</span>
                    </td>
                    <td className="px-4 py-2.5 text-right text-red-700">
                      {formatRupiah(bebanOperasional)}
                    </td>
                  </tr>
                  <tr className="bg-stone-50 font-bold text-red-950">
                    <td className="px-4 py-2.5 font-sans">TOTAL BEBAN OPERASIONAL (B)</td>
                    <td className="px-4 py-2.5 text-right">{formatRupiah(bebanOperasional)}</td>
                  </tr>
                </tbody>

                {/* 3. SHU Bersih */}
                <tfoot className="bg-emerald-800 text-white font-bold text-sm">
                  <tr>
                    <td className="px-4 py-3 font-sans">SISA HASIL USAHA (SHU) BERSIH (A - B)</td>
                    <td className="px-4 py-3 text-right font-mono">{formatRupiah(shuBersih)}</td>
                  </tr>
                </tfoot>

              </table>
            </div>
          </div>
        )}

        {/* TAB 2: NERACA KOPERASI */}
        {activeTab === 'neraca' && (
          <div className="space-y-6">
            <div className="text-center">
              <h3 className="text-sm font-bold uppercase tracking-wider text-stone-900">
                Neraca Saldo Keuangan Koperasi
              </h3>
              <p className="text-xs text-stone-500 font-mono">
                Posisi Keuangan Per Hari Ini
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
              
              {/* Aktiva (Aset) */}
              <div className="border border-stone-300 rounded-lg overflow-hidden">
                <div className="bg-stone-100 p-3 font-bold border-b border-stone-300 text-stone-900 flex justify-between">
                  <span>AKTIVA (ASET KOPERASI)</span>
                  <span className="font-mono">JUMLAH (RP)</span>
                </div>
                <div className="divide-y divide-stone-200 font-mono">
                  <div className="p-3 flex justify-between">
                    <div>
                      <div className="font-semibold font-sans text-stone-900">1. Kas Tunai & Bank</div>
                      <div className="text-[11px] text-stone-500 font-sans">Likuiditas siap pakai</div>
                    </div>
                    <div className="font-bold text-stone-900">{formatRupiah(cashBalance)}</div>
                  </div>
                  <div className="p-3 flex justify-between">
                    <div>
                      <div className="font-semibold font-sans text-stone-900">2. Piutang Pinjaman USP</div>
                      <div className="text-[11px] text-stone-500 font-sans">Sisa pokok pinjaman anggota</div>
                    </div>
                    <div className="font-bold text-stone-900">{formatRupiah(piutangUSP)}</div>
                  </div>
                  <div className="p-3 flex justify-between">
                    <div>
                      <div className="font-semibold font-sans text-stone-900">3. Piutang Kredit Barang</div>
                      <div className="text-[11px] text-stone-500 font-sans">Sisa cicilan barang anggota</div>
                    </div>
                    <div className="font-bold text-stone-900">{formatRupiah(piutangKredit)}</div>
                  </div>
                  <div className="p-3 flex justify-between">
                    <div>
                      <div className="font-semibold font-sans text-stone-900">4. Persediaan Barang Waserda</div>
                      <div className="text-[11px] text-stone-500 font-sans">Nilai stok ATK & sembako</div>
                    </div>
                    <div className="font-bold text-stone-900">{formatRupiah(stokWaserda)}</div>
                  </div>
                  <div className="p-3 bg-stone-100 flex justify-between font-bold text-stone-900 border-t border-stone-300">
                    <span className="font-sans">TOTAL AKTIVA</span>
                    <span className="text-emerald-900">{formatRupiah(totalAktiva)}</span>
                  </div>
                </div>
              </div>

              {/* Pasiva (Kewajiban & Ekuitas) */}
              <div className="border border-stone-300 rounded-lg overflow-hidden">
                <div className="bg-stone-100 p-3 font-bold border-b border-stone-300 text-stone-900 flex justify-between">
                  <span>PASIVA (KEWAJIBAN & EKUITAS)</span>
                  <span className="font-mono">JUMLAH (RP)</span>
                </div>
                <div className="divide-y divide-stone-200 font-mono">
                  <div className="p-3 flex justify-between">
                    <div>
                      <div className="font-semibold font-sans text-stone-900">1. Simpanan Wajib Anggota</div>
                      <div className="text-[11px] text-stone-500 font-sans">Kewajiban bulanan anggota</div>
                    </div>
                    <div className="font-bold text-stone-900">{formatRupiah(totalSimpananWajib)}</div>
                  </div>
                  <div className="p-3 flex justify-between">
                    <div>
                      <div className="font-semibold font-sans text-stone-900">2. Simpanan Sukarela Anggota</div>
                      <div className="text-[11px] text-stone-500 font-sans">Kewajiban tabungan anggota</div>
                    </div>
                    <div className="font-bold text-stone-900">{formatRupiah(totalSimpananSukarela)}</div>
                  </div>
                  <div className="p-3 flex justify-between">
                    <div>
                      <div className="font-semibold font-sans text-stone-900">3. Modal Cadangan Koperasi</div>
                      <div className="text-[11px] text-stone-500 font-sans">Ekuitas & modal awal sekolah</div>
                    </div>
                    <div className="font-bold text-stone-900">{formatRupiah(modalSendiri)}</div>
                  </div>
                  <div className="p-3 flex justify-between">
                    <div>
                      <div className="font-semibold font-sans text-stone-900">4. SHU Bersih Tahun Berjalan</div>
                      <div className="text-[11px] text-stone-500 font-sans">Laba bersih belum dibagikan</div>
                    </div>
                    <div className="font-bold text-emerald-800">{formatRupiah(shuBersih)}</div>
                  </div>
                  <div className="p-3 bg-stone-100 flex justify-between font-bold text-stone-900 border-t border-stone-300">
                    <span className="font-sans">TOTAL PASIVA</span>
                    <span className="text-emerald-900">{formatRupiah(totalAktiva)}</span>
                  </div>
                </div>
              </div>

            </div>
          </div>
        )}

        {/* TAB 3: ALOKASI SHU */}
        {activeTab === 'alokasi' && (
          <div className="space-y-6">
            <div className="text-center">
              <h3 className="text-sm font-bold uppercase tracking-wider text-stone-900">
                Rencana Pembagian Sisa Hasil Usaha (SHU)
              </h3>
              <p className="text-xs text-stone-500 font-mono">
                Total SHU Bersih: {formatRupiah(shuBersih)}
              </p>
            </div>

            <div className="border border-stone-300 rounded-lg overflow-hidden text-xs">
              <table className="w-full text-left font-mono">
                <thead className="bg-stone-100 border-b border-stone-300 font-bold text-stone-900 font-sans">
                  <tr>
                    <th className="px-4 py-2.5">Pos Alokasi SHU</th>
                    <th className="px-4 py-2.5 text-center">Persentase (%)</th>
                    <th className="px-4 py-2.5 text-right">Nominal (Rp)</th>
                    <th className="px-4 py-2.5 font-sans">Keterangan</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-200">
                  <tr>
                    <td className="px-4 py-2.5 font-sans font-semibold text-stone-900">Cadangan Koperasi</td>
                    <td className="px-4 py-2.5 text-center font-bold">40%</td>
                    <td className="px-4 py-2.5 text-right font-bold text-emerald-800">{formatRupiah(alokasi.cadangan)}</td>
                    <td className="px-4 py-2.5 font-sans text-stone-500">Memperkuat permodalan & investasi koperasi</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-2.5 font-sans font-semibold text-stone-900">Jasa Simpanan / Modal Anggota</td>
                    <td className="px-4 py-2.5 text-center font-bold">25%</td>
                    <td className="px-4 py-2.5 text-right font-bold text-emerald-800">{formatRupiah(alokasi.jasaModal)}</td>
                    <td className="px-4 py-2.5 font-sans text-stone-500">Dibagi sesuai proporsi simpanan wajib & sukarela</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-2.5 font-sans font-semibold text-stone-900">Jasa Usaha / Transaksi Anggota</td>
                    <td className="px-4 py-2.5 text-center font-bold">20%</td>
                    <td className="px-4 py-2.5 text-right font-bold text-emerald-800">{formatRupiah(alokasi.jasaUsaha)}</td>
                    <td className="px-4 py-2.5 font-sans text-stone-500">Dibagi bagi anggota yang aktif belanja & pinjam</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-2.5 font-sans font-semibold text-stone-900">Dana Pengurus & Karyawan</td>
                    <td className="px-4 py-2.5 text-center font-bold">10%</td>
                    <td className="px-4 py-2.5 text-right font-bold text-emerald-800">{formatRupiah(alokasi.pengurus)}</td>
                    <td className="px-4 py-2.5 font-sans text-stone-500">Apresiasi kinerja pegawai kasir dan pengurus</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-2.5 font-sans font-semibold text-stone-900">Dana Sosial & Pendidikan Sekolah</td>
                    <td className="px-4 py-2.5 text-center font-bold">5%</td>
                    <td className="px-4 py-2.5 text-right font-bold text-emerald-800">{formatRupiah(alokasi.sosialPendidikan)}</td>
                    <td className="px-4 py-2.5 font-sans text-stone-500">Bantuan beasiswa siswa / sosial guru</td>
                  </tr>
                </tbody>
                <tfoot className="bg-stone-100 font-bold text-stone-900">
                  <tr>
                    <td className="px-4 py-3 font-sans">TOTAL ALOKASI 100%</td>
                    <td className="px-4 py-3 text-center">100%</td>
                    <td className="px-4 py-3 text-right font-mono text-emerald-900">{formatRupiah(shuBersih)}</td>
                    <td className="px-4 py-3 font-sans">Sesuai AD/ART Koperasi Sekolah</td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
        )}

        {/* Official Signatures */}
        <div className="pt-8 border-t border-stone-300 grid grid-cols-2 text-center text-xs">
          <div>
            <p className="text-stone-500 mb-12">Mengetahui,<br />Ketua Koperasi Sekolah</p>
            <p className="font-bold underline text-stone-900">{config.leaderName}</p>
            <p className="text-[10px] text-stone-400">NIP. 19680315 199303 1 004</p>
          </div>
          <div>
            <p className="text-stone-500 mb-12">Dibuat Oleh,<br />Bendahara Koperasi</p>
            <p className="font-bold underline text-stone-900">{config.treasurerName}</p>
            <p className="text-[10px] text-stone-400">NIP. 19740920 199903 2 002</p>
          </div>
        </div>

      </div>

    </div>
  );
};
