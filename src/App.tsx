import React, { useState } from 'react';
import { CooperativeProvider, useCooperative } from './context/CooperativeContext';
import { Navbar } from './components/common/Navbar';
import { AdminDashboard } from './components/dashboard/AdminDashboard';
import { StaffDashboard } from './components/dashboard/StaffDashboard';
import { MemberDashboard } from './components/dashboard/MemberDashboard';
import { WaserdaView } from './components/waserda/WaserdaView';
import { USPView } from './components/usp/USPView';
import { KreditView } from './components/kredit/KreditView';
import { SimpananView } from './components/simpanan/SimpananView';
import { BukuKasView } from './components/kas/BukuKasView';
import { LaporanView } from './components/laporan/LaporanView';
import { AnggotaView } from './components/anggota/AnggotaView';
import { PengaturanView } from './components/pengaturan/PengaturanView';
import { 
  LayoutDashboard, 
  ShoppingBag, 
  Coins, 
  Laptop, 
  PiggyBank, 
  BookOpen, 
  Scale, 
  Users, 
  Settings,
  Lock,
  UserCheck,
  ShieldCheck,
  User
} from 'lucide-react';

const AppContent: React.FC = () => {
  const { currentUser } = useCooperative();
  const [currentTab, setCurrentTab] = useState<string>('dashboard');

  const role = currentUser.role;

  // Determine available tabs based on role
  const renderNavLinks = () => {
    if (role === 'anggota') {
      // Member only sees their private financial report view
      return null;
    }

    if (role === 'pegawai') {
      // Pegawai: Input uang masuk dan uang keluar
      return (
        <div className="flex items-center gap-1 overflow-x-auto pb-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4">
          <button
            onClick={() => setCurrentTab('dashboard')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 cursor-pointer shrink-0 transition-colors ${
              currentTab === 'dashboard'
                ? 'bg-teal-800 text-white shadow-xs'
                : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100'
            }`}
          >
            <UserCheck className="w-4 h-4" />
            <span>Loket Kasir Pegawai</span>
          </button>

          <button
            onClick={() => setCurrentTab('waserda')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 cursor-pointer shrink-0 transition-colors ${
              currentTab === 'waserda'
                ? 'bg-teal-800 text-white shadow-xs'
                : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100'
            }`}
          >
            <ShoppingBag className="w-4 h-4" />
            <span>1. Kasir Waserda</span>
          </button>

          <button
            onClick={() => setCurrentTab('usp')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 cursor-pointer shrink-0 transition-colors ${
              currentTab === 'usp'
                ? 'bg-teal-800 text-white shadow-xs'
                : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100'
            }`}
          >
            <Coins className="w-4 h-4" />
            <span>2. Angsuran USP (3%)</span>
          </button>

          <button
            onClick={() => setCurrentTab('kredit')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 cursor-pointer shrink-0 transition-colors ${
              currentTab === 'kredit'
                ? 'bg-teal-800 text-white shadow-xs'
                : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100'
            }`}
          >
            <Laptop className="w-4 h-4" />
            <span>3. Angsuran Kredit (5%)</span>
          </button>

          <button
            onClick={() => setCurrentTab('simpanan')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 cursor-pointer shrink-0 transition-colors ${
              currentTab === 'simpanan'
                ? 'bg-teal-800 text-white shadow-xs'
                : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100'
            }`}
          >
            <PiggyBank className="w-4 h-4" />
            <span>4 & 5. Setor/Tarik Simpanan</span>
          </button>

          <button
            onClick={() => setCurrentTab('buku-kas')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 cursor-pointer shrink-0 transition-colors ${
              currentTab === 'buku-kas'
                ? 'bg-teal-800 text-white shadow-xs'
                : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            <span>Buku Kas & Uang Keluar</span>
          </button>

          <button
            onClick={() => setCurrentTab('anggota')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 cursor-pointer shrink-0 transition-colors ${
              currentTab === 'anggota'
                ? 'bg-teal-800 text-white shadow-xs'
                : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Data Anggota</span>
          </button>
        </div>
      );
    }

    // Role Pengelola (Fungsi Mutlak)
    return (
      <div className="flex items-center gap-1 overflow-x-auto pb-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4">
        <button
          onClick={() => setCurrentTab('dashboard')}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 cursor-pointer shrink-0 transition-colors ${
            currentTab === 'dashboard'
              ? 'bg-emerald-800 text-white shadow-xs'
              : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100'
          }`}
        >
          <LayoutDashboard className="w-4 h-4" />
          <span>Ringkasan Pengelola</span>
        </button>

        <button
          onClick={() => setCurrentTab('waserda')}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 cursor-pointer shrink-0 transition-colors ${
            currentTab === 'waserda'
              ? 'bg-emerald-800 text-white shadow-xs'
              : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100'
          }`}
        >
          <ShoppingBag className="w-4 h-4" />
          <span>1. Waserda</span>
        </button>

        <button
          onClick={() => setCurrentTab('usp')}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 cursor-pointer shrink-0 transition-colors ${
            currentTab === 'usp'
              ? 'bg-emerald-800 text-white shadow-xs'
              : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100'
          }`}
        >
          <Coins className="w-4 h-4" />
          <span>2. USP (3% Menurun)</span>
        </button>

        <button
          onClick={() => setCurrentTab('kredit')}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 cursor-pointer shrink-0 transition-colors ${
            currentTab === 'kredit'
              ? 'bg-emerald-800 text-white shadow-xs'
              : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100'
          }`}
        >
          <Laptop className="w-4 h-4" />
          <span>3. Kredit Barang (5%)</span>
        </button>

        <button
          onClick={() => setCurrentTab('simpanan')}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 cursor-pointer shrink-0 transition-colors ${
            currentTab === 'simpanan'
              ? 'bg-emerald-800 text-white shadow-xs'
              : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100'
          }`}
        >
          <PiggyBank className="w-4 h-4" />
          <span>4 & 5. Simpanan Wajib & Sukarela</span>
        </button>

        <button
          onClick={() => setCurrentTab('buku-kas')}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 cursor-pointer shrink-0 transition-colors ${
            currentTab === 'buku-kas'
              ? 'bg-emerald-800 text-white shadow-xs'
              : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100'
          }`}
        >
          <BookOpen className="w-4 h-4" />
          <span>Buku Kas Umum</span>
        </button>

        <button
          onClick={() => setCurrentTab('laporan')}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 cursor-pointer shrink-0 transition-colors ${
            currentTab === 'laporan'
              ? 'bg-emerald-800 text-white shadow-xs'
              : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100'
          }`}
        >
          <Scale className="w-4 h-4" />
          <span>Laporan Keuangan & SHU</span>
        </button>

        <button
          onClick={() => setCurrentTab('anggota')}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 cursor-pointer shrink-0 transition-colors ${
            currentTab === 'anggota'
              ? 'bg-emerald-800 text-white shadow-xs'
              : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Data Anggota</span>
        </button>

        <button
          onClick={() => setCurrentTab('pengaturan')}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 cursor-pointer shrink-0 transition-colors ${
            currentTab === 'pengaturan'
              ? 'bg-emerald-800 text-white shadow-xs'
              : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100'
          }`}
        >
          <Settings className="w-4 h-4" />
          <span>Pengaturan</span>
        </button>
      </div>
    );
  };

  const renderActiveView = () => {
    // 3. Akun Anggota Koperasi: HANYA BISA MELIHAT LAPORAN KEUANGAN TERKAIT DIRINYA SENDIRI
    if (role === 'anggota') {
      return <MemberDashboard />;
    }

    // Role Pegawai / Pengelola
    switch (currentTab) {
      case 'dashboard':
        return role === 'pengelola' ? (
          <AdminDashboard onNavigateTab={setCurrentTab} />
        ) : (
          <StaffDashboard onNavigateTab={setCurrentTab} />
        );
      case 'waserda':
        return <WaserdaView />;
      case 'usp':
        return <USPView />;
      case 'kredit':
        return <KreditView />;
      case 'simpanan':
        return <SimpananView />;
      case 'buku-kas':
        return <BukuKasView />;
      case 'laporan':
        return role === 'pengelola' ? (
          <LaporanView />
        ) : (
          <div className="bg-white p-8 text-center rounded-xl border border-stone-200">
            <Lock className="w-8 h-8 text-stone-400 mx-auto mb-2" />
            <h3 className="font-bold text-sm text-stone-900">Akses Terbatas</h3>
            <p className="text-xs text-stone-500 mt-1">
              Laporan Keuangan & SHU hanya dapat diakses oleh Akun Pengelola Koperasi.
            </p>
          </div>
        );
      case 'anggota':
        return <AnggotaView />;
      case 'pengaturan':
        return <PengaturanView />;
      default:
        return role === 'pengelola' ? (
          <AdminDashboard onNavigateTab={setCurrentTab} />
        ) : (
          <StaffDashboard onNavigateTab={setCurrentTab} />
        );
    }
  };

  return (
    <div className="min-h-screen bg-stone-50 flex flex-col font-sans">
      <Navbar />

      {/* Main Navigation Bar */}
      <nav className="no-print bg-white border-b border-stone-200 shadow-xs">
        {renderNavLinks()}
      </nav>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {renderActiveView()}
      </main>

      {/* Footer */}
      <footer className="no-print bg-white border-t border-stone-200 py-4 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-stone-500">
          <div>
            Koperasi Sekolah Digital · Sistem Keuangan & Layanan Anggota Terpadu
          </div>
          <div className="flex items-center gap-3">
            <span>Level Akun: <strong className="text-stone-700 capitalize">{role}</strong></span>
            <span>·</span>
            <span>USP 3% Menurun</span>
            <span>·</span>
            <span>Kredit 5% Margin</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default function App() {
  return (
    <CooperativeProvider>
      <AppContent />
    </CooperativeProvider>
  );
}
