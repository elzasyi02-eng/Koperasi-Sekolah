import React, { useState } from 'react';
import { useCooperative } from '../../context/CooperativeContext';
import { formatRupiah } from '../../utils/formatters';
import { 
  Settings, 
  Save, 
  RotateCcw, 
  Download, 
  Upload, 
  ShieldCheck, 
  Building2, 
  Percent, 
  DollarSign,
  CheckCircle2
} from 'lucide-react';

export const PengaturanView: React.FC = () => {
  const { 
    config, 
    updateConfig, 
    resetToDefault, 
    exportDatabaseJSON, 
    importDatabaseJSON,
    currentUser
  } = useCooperative();

  const isPengelola = currentUser.role === 'pengelola';

  const [formData, setFormData] = useState({ ...config });
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [jsonText, setJsonText] = useState('');
  const [importStatus, setImportStatus] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateConfig(formData);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2000);
  };

  const handleExport = () => {
    setJsonText(exportDatabaseJSON());
  };

  const handleImport = () => {
    if (!jsonText) return;
    const ok = importDatabaseJSON(jsonText);
    if (ok) {
      setImportStatus('Database berhasil dipulihkan!');
      setTimeout(() => setImportStatus(null), 2500);
    } else {
      setImportStatus('Format JSON tidak valid!');
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="bg-white rounded-xl border border-stone-200 p-5 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-800 text-white flex items-center justify-center font-bold">
            <Settings className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-stone-900">
              Pengaturan Sistem & Kebijakan Koperasi
            </h1>
            <p className="text-xs text-stone-500">
              Konfigurasi persentase suku bunga USP (3% menurun), margin kredit barang (5%), dan tarif simpanan wajib.
            </p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        
        {/* Kebijakan Finansial */}
        <div className="bg-white rounded-xl border border-stone-200 p-5 shadow-xs space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-stone-100">
            <Percent className="w-4 h-4 text-emerald-800" />
            <h3 className="font-bold text-sm text-stone-900">Parameter Perhitungan Keuangan</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            {/* Suku Bunga USP */}
            <div className="p-4 rounded-xl border border-stone-200 bg-stone-50 space-y-2">
              <label className="block text-xs font-bold text-stone-900">
                Suku Bunga USP (Bunga Menurun / Declining)
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  step="0.005"
                  min="0.01"
                  max="0.10"
                  disabled={!isPengelola}
                  value={formData.uspInterestRate}
                  onChange={(e) =>
                    setFormData({ ...formData, uspInterestRate: Number(e.target.value) })
                  }
                  className="w-32 text-xs font-mono font-bold p-2 bg-white border border-stone-300 rounded-lg focus:outline-emerald-800"
                />
                <span className="text-xs font-mono font-bold text-emerald-800">
                  = {(formData.uspInterestRate * 100).toFixed(1)}% per bulan menurun
                </span>
              </div>
              <p className="text-[11px] text-stone-500">
                Sesuai AD/ART: Bunga 3% menurun dihitung dari sisa pokok pinjaman setiap bulan.
              </p>
            </div>

            {/* Margin Kredit Barang */}
            <div className="p-4 rounded-xl border border-stone-200 bg-stone-50 space-y-2">
              <label className="block text-xs font-bold text-stone-900">
                Margin Keuntungan Kredit Barang
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  step="0.005"
                  min="0.01"
                  max="0.20"
                  disabled={!isPengelola}
                  value={formData.creditMarginRate}
                  onChange={(e) =>
                    setFormData({ ...formData, creditMarginRate: Number(e.target.value) })
                  }
                  className="w-32 text-xs font-mono font-bold p-2 bg-white border border-stone-300 rounded-lg focus:outline-emerald-800"
                />
                <span className="text-xs font-mono font-bold text-emerald-800">
                  = {(formData.creditMarginRate * 100).toFixed(1)}% flat
                </span>
              </div>
              <p className="text-[11px] text-stone-500">
                Keuntungan 5% dari harga asli barang yang ditalangi koperasi.
              </p>
            </div>

            {/* Simpanan Wajib PNS/PPPK */}
            <div className="p-4 rounded-xl border border-stone-200 bg-stone-50 space-y-2">
              <label className="block text-xs font-bold text-stone-900">
                Tarif Simpanan Wajib: PNS & PPPK Penuh Waktu (Rp)
              </label>
              <input
                type="number"
                step="10000"
                min="10000"
                disabled={!isPengelola}
                value={formData.wajibPnsPppk}
                onChange={(e) =>
                  setFormData({ ...formData, wajibPnsPppk: Number(e.target.value) })
                }
                className="w-full text-xs font-mono font-bold p-2 bg-white border border-stone-300 rounded-lg focus:outline-emerald-800"
              />
              <p className="text-[11px] text-stone-500">
                Standar: <strong>Rp 100.000 / bulan</strong> per anggota PNS/PPPK.
              </p>
            </div>

            {/* Simpanan Wajib Honorer */}
            <div className="p-4 rounded-xl border border-stone-200 bg-stone-50 space-y-2">
              <label className="block text-xs font-bold text-stone-900">
                Tarif Simpanan Wajib: PPPK Paruh Waktu & Honorer (Rp)
              </label>
              <input
                type="number"
                step="10000"
                min="10000"
                disabled={!isPengelola}
                value={formData.wajibHonorer}
                onChange={(e) =>
                  setFormData({ ...formData, wajibHonorer: Number(e.target.value) })
                }
                className="w-full text-xs font-mono font-bold p-2 bg-white border border-stone-300 rounded-lg focus:outline-emerald-800"
              />
              <p className="text-[11px] text-stone-500">
                Standar: <strong>Rp 50.000 / bulan</strong> per anggota Honorer/Paruh Waktu.
              </p>
            </div>

          </div>
        </div>

        {/* Profil Identitas Koperasi */}
        <div className="bg-white rounded-xl border border-stone-200 p-5 shadow-xs space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-stone-100">
            <Building2 className="w-4 h-4 text-emerald-800" />
            <h3 className="font-bold text-sm text-stone-900">Identitas & Pengurus Sekolah</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                Nama Koperasi
              </label>
              <input
                type="text"
                disabled={!isPengelola}
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full text-xs p-2.5 bg-stone-50 border border-stone-300 rounded-lg focus:outline-emerald-800"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                Nama Sekolah / Instansi Induk
              </label>
              <input
                type="text"
                disabled={!isPengelola}
                value={formData.schoolName}
                onChange={(e) => setFormData({ ...formData, schoolName: e.target.value })}
                className="w-full text-xs p-2.5 bg-stone-50 border border-stone-300 rounded-lg focus:outline-emerald-800"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                Alamat Lengkap
              </label>
              <input
                type="text"
                disabled={!isPengelola}
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                className="w-full text-xs p-2.5 bg-stone-50 border border-stone-300 rounded-lg focus:outline-emerald-800"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                Kontak / No. Telepon
              </label>
              <input
                type="text"
                disabled={!isPengelola}
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full text-xs p-2.5 bg-stone-50 border border-stone-300 rounded-lg focus:outline-emerald-800"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                Ketua Koperasi (Pengelola Mutlak)
              </label>
              <input
                type="text"
                disabled={!isPengelola}
                value={formData.leaderName}
                onChange={(e) => setFormData({ ...formData, leaderName: e.target.value })}
                className="w-full text-xs p-2.5 bg-stone-50 border border-stone-300 rounded-lg focus:outline-emerald-800"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                Bendahara Koperasi
              </label>
              <input
                type="text"
                disabled={!isPengelola}
                value={formData.treasurerName}
                onChange={(e) => setFormData({ ...formData, treasurerName: e.target.value })}
                className="w-full text-xs p-2.5 bg-stone-50 border border-stone-300 rounded-lg focus:outline-emerald-800"
              />
            </div>
          </div>

          {isPengelola && (
            <div className="flex items-center justify-between pt-3 border-t border-stone-200">
              {saveSuccess && (
                <div className="text-xs text-emerald-800 font-semibold flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Pengaturan berhasil disimpan!</span>
                </div>
              )}
              <div className="ml-auto">
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-800 hover:bg-emerald-900 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 cursor-pointer shadow-xs"
                >
                  <Save className="w-4 h-4" />
                  <span>Simpan Perubahan</span>
                </button>
              </div>
            </div>
          )}
        </div>

      </form>

      {/* Database Management & Backup */}
      <div className="bg-white rounded-xl border border-stone-200 p-5 shadow-xs space-y-4">
        <h3 className="font-bold text-sm text-stone-900 flex items-center gap-2">
          <Download className="w-4 h-4 text-stone-600" />
          Pencadangan & Pemulihan Data Koperasi (JSON)
        </h3>
        <p className="text-xs text-stone-500">
          Seluruh data (anggota, simpanan, pinjaman USP, kredit barang, waserda, kas) dapat diexport atau dipulihkan kembali sewaktu-waktu.
        </p>

        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={handleExport}
            className="px-3.5 py-2 bg-stone-100 hover:bg-stone-200 text-stone-800 rounded-lg text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
          >
            <Download className="w-4 h-4" />
            <span>Tampilkan Data JSON</span>
          </button>

          {isPengelola && (
            <button
              type="button"
              onClick={() => {
                if (confirm('Apakah Anda yakin ingin mereset seluruh data koperasi ke kondisi awal simulasi bawaan sistem?')) {
                  resetToDefault();
                  alert('Data berhasil direset ke bawaan sistem.');
                }
              }}
              className="px-3.5 py-2 bg-red-50 hover:bg-red-100 text-red-700 rounded-lg text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Reset Data Bawaan</span>
            </button>
          )}
        </div>

        {jsonText && (
          <div className="space-y-2 pt-2">
            <textarea
              value={jsonText}
              onChange={(e) => setJsonText(e.target.value)}
              rows={8}
              className="w-full text-xs font-mono p-3 bg-stone-50 border border-stone-300 rounded-lg focus:outline-emerald-800"
            />
            {importStatus && (
              <div className="text-xs font-medium text-emerald-800 bg-emerald-50 p-2 rounded">
                {importStatus}
              </div>
            )}
            {isPengelola && (
              <button
                type="button"
                onClick={handleImport}
                className="px-3.5 py-1.5 bg-emerald-800 hover:bg-emerald-900 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
              >
                <Upload className="w-4 h-4" />
                <span>Pulihkan Database dari Teks JSON di Atas</span>
              </button>
            )}
          </div>
        )}
      </div>

    </div>
  );
};
