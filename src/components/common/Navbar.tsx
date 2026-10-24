import React, { useState } from 'react';
import { useCooperative } from '../../context/CooperativeContext';
import { 
  Building2, 
  UserCheck, 
  ShieldCheck, 
  User, 
  Printer, 
  RotateCcw, 
  Download, 
  Upload,
  ChevronDown
} from 'lucide-react';

export const Navbar: React.FC = () => {
  const { 
    currentUser, 
    setCurrentUser, 
    users, 
    config, 
    resetToDefault, 
    exportDatabaseJSON, 
    importDatabaseJSON 
  } = useCooperative();

  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [showBackupModal, setShowBackupModal] = useState(false);
  const [backupJson, setBackupJson] = useState('');
  const [importStatus, setImportStatus] = useState<string | null>(null);

  const handlePrint = () => {
    window.print();
  };

  const openBackup = () => {
    setBackupJson(exportDatabaseJSON());
    setImportStatus(null);
    setShowBackupModal(true);
  };

  const handleImport = () => {
    if (!backupJson) return;
    const ok = importDatabaseJSON(backupJson);
    if (ok) {
      setImportStatus('Berhasil memulihkan data database!');
      setTimeout(() => setShowBackupModal(false), 1200);
    } else {
      setImportStatus('Format data JSON tidak valid!');
    }
  };

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'pengelola':
        return {
          title: 'Pengelola Koperasi (Hak Mutlak)',
          badge: 'bg-emerald-800 text-white',
          desc: 'Akses Penuh Seluruh Modul & Kebijakan',
        };
      case 'pegawai':
        return {
          title: 'Pegawai Koperasi (Input Kas)',
          badge: 'bg-teal-700 text-white',
          desc: 'Akses Input Uang Masuk & Uang Keluar',
        };
      case 'anggota':
        return {
          title: 'Anggota Koperasi',
          badge: 'bg-stone-700 text-white',
          desc: 'Hanya Melihat Data Keuangan Pribadi',
        };
      default:
        return { title: role, badge: 'bg-stone-600 text-white', desc: '' };
    }
  };

  const currentRoleInfo = getRoleBadge(currentUser.role);

  return (
    <>
      <header className="no-print bg-white border-b border-stone-200 sticky top-0 z-30 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            
            {/* Logo & School Header */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-emerald-800 text-white flex items-center justify-center font-bold shadow-xs">
                <Building2 className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-stone-900 tracking-tight text-base sm:text-lg">
                    {config.name}
                  </span>
                </div>
                <p className="text-xs text-stone-500 font-medium">
                  {config.schoolName}
                </p>
              </div>
            </div>

            {/* Right Side: Role Selector & Utilities */}
            <div className="flex items-center gap-2 sm:gap-3">
              
              {/* Quick Actions */}
              <div className="hidden md:flex items-center gap-1 border-r border-stone-200 pr-3 mr-1">
                <button
                  onClick={handlePrint}
                  title="Cetak Halaman Ini"
                  className="p-2 text-stone-600 hover:text-stone-900 hover:bg-stone-100 rounded-lg transition-colors flex items-center gap-1.5 text-xs font-medium cursor-pointer"
                >
                  <Printer className="w-4 h-4" />
                  <span>Cetak</span>
                </button>
                <button
                  onClick={openBackup}
                  title="Cadangkan / Pulihkan Data"
                  className="p-2 text-stone-600 hover:text-stone-900 hover:bg-stone-100 rounded-lg transition-colors flex items-center gap-1.5 text-xs font-medium cursor-pointer"
                >
                  <Download className="w-4 h-4" />
                  <span>Backup Data</span>
                </button>
              </div>

              {/* Role Switcher Selector */}
              <div className="relative">
                <button
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className="flex items-center gap-2.5 p-1.5 sm:px-3 sm:py-2 rounded-lg border border-stone-300 hover:border-stone-400 bg-stone-50 hover:bg-stone-100/80 transition-all text-left cursor-pointer"
                >
                  <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-900 flex items-center justify-center font-bold text-sm shrink-0">
                    {currentUser.role === 'pengelola' ? (
                      <ShieldCheck className="w-4 h-4 text-emerald-800" />
                    ) : currentUser.role === 'pegawai' ? (
                      <UserCheck className="w-4 h-4 text-teal-800" />
                    ) : (
                      <User className="w-4 h-4 text-stone-700" />
                    )}
                  </div>
                  
                  <div className="hidden sm:block leading-tight pr-1">
                    <div className="text-xs font-semibold text-stone-900 truncate max-w-[150px]">
                      {currentUser.name}
                    </div>
                    <div className="text-[11px] text-stone-500 font-medium">
                      {currentUser.role === 'pengelola' && '👑 Pengelola (Mutlak)'}
                      {currentUser.role === 'pegawai' && '💼 Pegawai (Input Kas)'}
                      {currentUser.role === 'anggota' && '👤 Anggota (Pribadi)'}
                    </div>
                  </div>
                  <ChevronDown className="w-4 h-4 text-stone-500" />
                </button>

                {/* Dropdown Menu for 3 Account Levels */}
                {isUserMenuOpen && (
                  <>
                    <div 
                      className="fixed inset-0 z-40" 
                      onClick={() => setIsUserMenuOpen(false)} 
                    />
                    <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-xl border border-stone-200 z-50 p-2 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-150">
                      <div className="px-3 py-2 border-b border-stone-100 mb-1">
                        <div className="text-xs font-semibold uppercase tracking-wider text-stone-400">
                          Ganti Tingkat Akun (3 Level)
                        </div>
                        <div className="text-xs text-stone-600 mt-0.5">
                          Pilih akun untuk menguji wewenang dan pembatasan akses sistem:
                        </div>
                      </div>

                      {/* 1. Pengelola Koperasi */}
                      <div className="mb-2">
                        <div className="text-[11px] font-bold text-emerald-900 px-3 py-1 flex items-center gap-1.5">
                          <ShieldCheck className="w-3.5 h-3.5 text-emerald-700" />
                          1. AKUN PENGELOLA (Fungsi Mutlak)
                        </div>
                        {users
                          .filter((u) => u.role === 'pengelola')
                          .map((u) => (
                            <button
                              key={u.id}
                              onClick={() => {
                                setCurrentUser(u);
                                setIsUserMenuOpen(false);
                              }}
                              className={`w-full text-left px-3 py-2 rounded-lg text-xs flex items-center justify-between cursor-pointer transition-colors ${
                                currentUser.id === u.id
                                  ? 'bg-emerald-50 text-emerald-950 font-semibold'
                                  : 'hover:bg-stone-100 text-stone-700'
                              }`}
                            >
                              <div>
                                <div className="font-medium">{u.name}</div>
                                <div className="text-[11px] text-stone-500">Semua wewenang, persetujuan & laporan</div>
                              </div>
                              {currentUser.id === u.id && (
                                <span className="w-2 h-2 rounded-full bg-emerald-600" />
                              )}
                            </button>
                          ))}
                      </div>

                      {/* 2. Pegawai Koperasi */}
                      <div className="mb-2 border-t border-stone-100 pt-1.5">
                        <div className="text-[11px] font-bold text-teal-900 px-3 py-1 flex items-center gap-1.5">
                          <UserCheck className="w-3.5 h-3.5 text-teal-700" />
                          2. AKUN PEGAWAI (Hak Input Uang Masuk & Keluar)
                        </div>
                        {users
                          .filter((u) => u.role === 'pegawai')
                          .map((u) => (
                            <button
                              key={u.id}
                              onClick={() => {
                                setCurrentUser(u);
                                setIsUserMenuOpen(false);
                              }}
                              className={`w-full text-left px-3 py-2 rounded-lg text-xs flex items-center justify-between cursor-pointer transition-colors ${
                                currentUser.id === u.id
                                  ? 'bg-teal-50 text-teal-950 font-semibold'
                                  : 'hover:bg-stone-100 text-stone-700'
                              }`}
                            >
                              <div>
                                <div className="font-medium">{u.name}</div>
                                <div className="text-[11px] text-stone-500">Kasir waserda, input angsuran, simpanan & kas</div>
                              </div>
                              {currentUser.id === u.id && (
                                <span className="w-2 h-2 rounded-full bg-teal-600" />
                              )}
                            </button>
                          ))}
                      </div>

                      {/* 3. Anggota Koperasi */}
                      <div className="border-t border-stone-100 pt-1.5">
                        <div className="text-[11px] font-bold text-stone-800 px-3 py-1 flex items-center gap-1.5">
                          <User className="w-3.5 h-3.5 text-stone-600" />
                          3. AKUN ANGGOTA (Hanya Melihat Data Sendiri)
                        </div>
                        <div className="max-h-48 overflow-y-auto space-y-1">
                          {users
                            .filter((u) => u.role === 'anggota')
                            .map((u) => (
                              <button
                                key={u.id}
                                onClick={() => {
                                  setCurrentUser(u);
                                  setIsUserMenuOpen(false);
                                }}
                                className={`w-full text-left px-3 py-2 rounded-lg text-xs flex items-center justify-between cursor-pointer transition-colors ${
                                  currentUser.id === u.id
                                    ? 'bg-stone-100 text-stone-900 font-semibold'
                                    : 'hover:bg-stone-50 text-stone-700'
                                }`}
                              >
                                <div>
                                  <div className="font-medium">{u.name}</div>
                                  <div className="text-[11px] text-stone-500">
                                    Lihat simpanan, USP bunga 3%, kredit barang & waserda
                                  </div>
                                </div>
                                {currentUser.id === u.id && (
                                  <span className="w-2 h-2 rounded-full bg-stone-700" />
                                )}
                              </button>
                            ))}
                        </div>
                      </div>

                      <div className="mt-2 pt-2 border-t border-stone-100 flex items-center justify-between px-1">
                        <button
                          onClick={() => {
                            if (confirm('Kembalikan data simulasi ke awal bawaan sistem?')) {
                              resetToDefault();
                              setIsUserMenuOpen(false);
                            }
                          }}
                          className="text-[11px] text-red-600 hover:text-red-700 flex items-center gap-1 p-1 hover:bg-red-50 rounded cursor-pointer"
                        >
                          <RotateCcw className="w-3 h-3" />
                          <span>Reset Data Simulasi</span>
                        </button>
                      </div>

                    </div>
                  </>
                )}
              </div>

            </div>
          </div>
        </div>

        {/* Role Banner Indicator */}
        <div className="bg-stone-900 text-stone-200 text-xs py-1.5 px-4 sm:px-6">
          <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <span className={`px-2 py-0.5 rounded text-[11px] font-semibold tracking-wide uppercase ${currentRoleInfo.badge}`}>
                Level: {currentUser.role}
              </span>
              <span className="text-stone-300 font-medium">
                {currentRoleInfo.title}
              </span>
              <span className="hidden sm:inline text-stone-400">·</span>
              <span className="hidden sm:inline text-stone-400 text-[11px]">
                {currentRoleInfo.desc}
              </span>
            </div>
            <div className="text-[11px] text-stone-400 flex items-center gap-2">
              <span>Bunga USP: <strong className="text-stone-200 font-mono">3% Menurun</strong></span>
              <span>·</span>
              <span>Kredit: <strong className="text-stone-200 font-mono">5% Margin</strong></span>
              <span>·</span>
              <span>Simpanan Wajib: <strong className="text-stone-200 font-mono">Rp 100rb / Rp 50rb</strong></span>
            </div>
          </div>
        </div>
      </header>

      {/* Backup & Restore Modal */}
      {showBackupModal && (
        <div className="fixed inset-0 bg-stone-900/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-2xl border border-stone-200">
            <h3 className="text-lg font-bold text-stone-900 mb-2 flex items-center gap-2">
              <Download className="w-5 h-5 text-emerald-800" />
              Cadangkan & Pulihkan Database
            </h3>
            <p className="text-xs text-stone-600 mb-4">
              Anda dapat menyalin data JSON berikut untuk dicadangkan (backup) atau menempelkan data cadangan untuk dipulihkan kembali ke sistem.
            </p>

            <textarea
              value={backupJson}
              onChange={(e) => setBackupJson(e.target.value)}
              rows={10}
              className="w-full text-xs font-mono p-3 bg-stone-50 border border-stone-300 rounded-lg focus:outline-emerald-800 focus:ring-1 focus:ring-emerald-800"
              placeholder="Salin atau tempel JSON data koperasi di sini..."
            />

            {importStatus && (
              <div className={`mt-2 p-2 rounded text-xs font-medium ${
                importStatus.includes('Berhasil') ? 'bg-emerald-50 text-emerald-800' : 'bg-red-50 text-red-800'
              }`}>
                {importStatus}
              </div>
            )}

            <div className="mt-4 flex items-center justify-between">
              <button
                onClick={() => {
                  navigator.clipboard.writeText(backupJson);
                  alert('Data JSON berhasil disalin ke clipboard!');
                }}
                className="px-3 py-1.5 text-xs font-medium border border-stone-300 rounded-lg text-stone-700 hover:bg-stone-50 cursor-pointer"
              >
                Salin ke Clipboard
              </button>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowBackupModal(false)}
                  className="px-4 py-2 text-xs font-medium text-stone-600 hover:bg-stone-100 rounded-lg cursor-pointer"
                >
                  Tutup
                </button>
                <button
                  onClick={handleImport}
                  className="px-4 py-2 text-xs font-medium bg-emerald-800 hover:bg-emerald-900 text-white rounded-lg flex items-center gap-1.5 cursor-pointer"
                >
                  <Upload className="w-4 h-4" />
                  Pulihkan (Restore)
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
