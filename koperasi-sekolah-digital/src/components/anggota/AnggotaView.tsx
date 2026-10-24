import React, { useState } from 'react';
import { useCooperative } from '../../context/CooperativeContext';
import { Member, EmploymentStatus } from '../../types';
import { formatRupiah, formatDate, getEmploymentLabel } from '../../utils/formatters';
import { 
  Users, 
  UserPlus, 
  Search, 
  Filter, 
  CreditCard, 
  PiggyBank, 
  Coins, 
  Laptop, 
  ShoppingBag,
  Eye,
  CheckCircle2,
  X
} from 'lucide-react';

export const AnggotaView: React.FC = () => {
  const { 
    currentUser, 
    members, 
    addMember, 
    updateMember,
    getMemberSimpananWajibTotal,
    getMemberSimpananSukarelaTotal,
    getMemberActiveLoans,
    getMemberActiveCredits,
    getMemberWaserdaHistory,
    config
  } = useCooperative();

  const isPengelola = currentUser.role === 'pengelola';

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  
  // New Member Modal
  const [showAddModal, setShowAddModal] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    nip: '',
    employmentStatus: 'PNS' as EmploymentStatus,
    department: 'Guru Mata Pelajaran',
    phone: '',
    email: '',
    joinDate: new Date().toISOString().split('T')[0],
    status: 'active' as const,
  });

  // Detail Modal
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);

  const filteredMembers = members.filter((m) => {
    const matchSearch =
      m.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.memberNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (m.nip && m.nip.includes(searchTerm)) ||
      m.department.toLowerCase().includes(searchTerm.toLowerCase());
    const matchStatus = statusFilter === 'all' || m.employmentStatus === statusFilter;
    return matchSearch && matchStatus;
  });

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name) return;

    addMember(formData);
    setShowAddModal(false);
    setFormData({
      name: '',
      nip: '',
      employmentStatus: 'PNS',
      department: 'Guru Mata Pelajaran',
      phone: '',
      email: '',
      joinDate: new Date().toISOString().split('T')[0],
      status: 'active',
    });
  };

  return (
    <div className="space-y-6">
      
      {/* Header Banner */}
      <div className="bg-white rounded-xl border border-stone-200 p-5 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-2 rounded-lg bg-emerald-100 text-emerald-800">
                <Users className="w-5 h-5" />
              </span>
              <div>
                <h1 className="text-xl font-bold text-stone-900">
                  Data Master Anggota Koperasi
                </h1>
                <p className="text-xs text-stone-500">
                  Daftar guru, tenaga kependidikan, dan pegawai sekolah anggota koperasi.
                </p>
              </div>
            </div>
          </div>

          {isPengelola && (
            <button
              onClick={() => setShowAddModal(true)}
              className="px-3.5 py-2 bg-emerald-800 hover:bg-emerald-900 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 cursor-pointer shadow-xs self-start sm:self-auto"
            >
              <UserPlus className="w-4 h-4" />
              <span>Daftarkan Anggota Baru</span>
            </button>
          )}
        </div>

        {/* Filter Controls */}
        <div className="flex flex-col sm:flex-row gap-2 mt-5 border-t border-stone-100 pt-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-stone-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Cari nama anggota, nomor anggota, NIP, atau mata pelajaran..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full text-xs pl-9 pr-3 py-2 bg-stone-50 border border-stone-300 rounded-lg focus:outline-emerald-800"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="text-xs px-3 py-2 bg-stone-50 border border-stone-300 rounded-lg text-stone-700 focus:outline-emerald-800"
          >
            <option value="all">Semua Status Pegawai</option>
            <option value="PNS">PNS (Wajib Rp 100.000)</option>
            <option value="PPPK">PPPK (Wajib Rp 100.000)</option>
            <option value="PPPK_PARUH_WAKTU">PPPK Paruh Waktu (Wajib Rp 50.000)</option>
            <option value="HONORER">Honorer (Wajib Rp 50.000)</option>
          </select>
        </div>
      </div>

      {/* Table Members */}
      <div className="bg-white rounded-xl border border-stone-200 p-5 shadow-xs space-y-4">
        <div className="overflow-x-auto border border-stone-200 rounded-lg">
          <table className="w-full text-xs text-left text-stone-700">
            <thead className="bg-stone-50 border-b border-stone-200 font-semibold text-stone-900 uppercase text-[10px]">
              <tr>
                <th className="px-4 py-3">No. Anggota</th>
                <th className="px-4 py-3">Nama Lengkap & NIP</th>
                <th className="px-4 py-3">Status Kepegawaian</th>
                <th className="px-4 py-3 text-right">Tarif Iuran Wajib</th>
                <th className="px-4 py-3">Unit / Mata Pelajaran</th>
                <th className="px-4 py-3">Bergabung</th>
                <th className="px-4 py-3 text-center">Buku Keuangan</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {filteredMembers.map((m) => {
                const empInfo = getEmploymentLabel(m.employmentStatus);
                return (
                  <tr key={m.id} className="hover:bg-stone-50/70 transition-colors">
                    <td className="px-4 py-3 font-mono font-bold text-stone-900">{m.memberNo}</td>
                    <td className="px-4 py-3">
                      <div className="font-semibold text-stone-900">{m.name}</div>
                      <div className="text-[10px] text-stone-400 font-mono">NIP: {m.nip || '-'}</div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded text-[11px] font-semibold ${empInfo.badgeClass}`}>
                        {empInfo.label}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right font-mono font-bold text-emerald-800">
                      {formatRupiah(m.monthlyWajibAmount)} / bln
                    </td>
                    <td className="px-4 py-3 text-stone-600">{m.department}</td>
                    <td className="px-4 py-3 text-stone-500">{formatDate(m.joinDate)}</td>
                    <td className="px-4 py-3 text-center">
                      <button
                        onClick={() => setSelectedMember(m)}
                        className="px-2.5 py-1 bg-stone-100 hover:bg-emerald-50 hover:text-emerald-900 rounded font-medium text-[11px] inline-flex items-center gap-1 cursor-pointer"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Lihat Profil</span>
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL DETAIL KEUANGAN ANGGOTA */}
      {selectedMember && (
        <div className="fixed inset-0 bg-stone-900/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl border border-stone-200 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-stone-200">
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-stone-900">
                  Kartu Keuangan: {selectedMember.name}
                </h3>
                <span className="font-mono text-xs text-stone-500">({selectedMember.memberNo})</span>
              </div>
              <button
                onClick={() => setSelectedMember(null)}
                className="p-1.5 text-stone-400 hover:text-stone-700 rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="mt-4 space-y-4">
              {/* Profile Card */}
              <div className="p-3 bg-stone-50 rounded-xl border border-stone-200 text-xs grid grid-cols-2 gap-2">
                <div>
                  <span className="text-stone-500 block">Status Kepegawaian</span>
                  <span className="font-semibold text-stone-900">{getEmploymentLabel(selectedMember.employmentStatus).label}</span>
                </div>
                <div>
                  <span className="text-stone-500 block">Unit Kerja / Mapel</span>
                  <span className="font-semibold text-stone-900">{selectedMember.department}</span>
                </div>
                <div>
                  <span className="text-stone-500 block">Nomor Telepon</span>
                  <span className="font-semibold text-stone-900">{selectedMember.phone}</span>
                </div>
                <div>
                  <span className="text-stone-500 block">Tarif Simpanan Wajib</span>
                  <span className="font-mono font-bold text-emerald-800">{formatRupiah(selectedMember.monthlyWajibAmount)} / bulan</span>
                </div>
              </div>

              {/* 4 Financial Balances */}
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-3 border border-stone-200 rounded-lg bg-emerald-50/30">
                  <span className="text-stone-500 block text-[11px]">Total Simpanan Wajib</span>
                  <span className="text-base font-bold font-mono text-emerald-900">
                    {formatRupiah(getMemberSimpananWajibTotal(selectedMember.id))}
                  </span>
                </div>
                <div className="p-3 border border-stone-200 rounded-lg bg-emerald-50/30">
                  <span className="text-stone-500 block text-[11px]">Total Simpanan Sukarela</span>
                  <span className="text-base font-bold font-mono text-emerald-900">
                    {formatRupiah(getMemberSimpananSukarelaTotal(selectedMember.id))}
                  </span>
                </div>
                <div className="p-3 border border-stone-200 rounded-lg bg-stone-50">
                  <span className="text-stone-500 block text-[11px]">Sisa Pinjaman USP (3% Menurun)</span>
                  <span className="text-base font-bold font-mono text-stone-900">
                    {formatRupiah(
                      getMemberActiveLoans(selectedMember.id)
                        .filter((l) => l.status === 'active')
                        .reduce((acc, l) => acc + l.remainingPrincipal, 0)
                    )}
                  </span>
                </div>
                <div className="p-3 border border-stone-200 rounded-lg bg-stone-50">
                  <span className="text-stone-500 block text-[11px]">Sisa Kredit Barang (5%)</span>
                  <span className="text-base font-bold font-mono text-stone-900">
                    {formatRupiah(
                      getMemberActiveCredits(selectedMember.id)
                        .filter((c) => c.status === 'active')
                        .reduce((acc, c) => acc + c.remainingAmount, 0)
                    )}
                  </span>
                </div>
              </div>

              {/* Activity Summary */}
              <div className="text-xs text-stone-600 bg-stone-50 p-3 rounded-lg border border-stone-200 space-y-1">
                <div>• Total Transaksi Belanja Waserda: <strong>{getMemberWaserdaHistory(selectedMember.id).length} kali</strong></div>
                <div>• Pinjaman USP Terdaftar: <strong>{getMemberActiveLoans(selectedMember.id).length} pengajuan</strong></div>
                <div>• Kredit Barang Terdaftar: <strong>{getMemberActiveCredits(selectedMember.id).length} pengajuan</strong></div>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  onClick={() => setSelectedMember(null)}
                  className="px-4 py-2 text-xs font-semibold bg-stone-800 text-white rounded-lg cursor-pointer"
                >
                  Tutup
                </button>
              </div>

            </div>
          </div>
        </div>
      )}

      {/* MODAL REGISTRASI ANGGOTA BARU */}
      {showAddModal && (
        <div className="fixed inset-0 bg-stone-900/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-stone-200">
            <h3 className="text-base font-bold text-stone-900 mb-2">Registrasi Anggota Koperasi Baru</h3>
            <p className="text-xs text-stone-500 mb-4">
              Iuran wajib disesuaikan otomatis dengan status PNS/PPPK (100rb) atau Honorer (50rb).
            </p>

            <form onSubmit={handleAddSubmit} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Nama Lengkap & Gelar
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Misal: Budi Handoko, S.Pd"
                  className="w-full text-xs p-2.5 bg-stone-50 border border-stone-300 rounded-lg focus:outline-emerald-800"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    NIP / NUPTK / NIK
                  </label>
                  <input
                    type="text"
                    value={formData.nip}
                    onChange={(e) => setFormData({ ...formData, nip: e.target.value })}
                    placeholder="1980xxxx..."
                    className="w-full text-xs p-2.5 bg-stone-50 border border-stone-300 rounded-lg font-mono focus:outline-emerald-800"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    Status Kepegawaian
                  </label>
                  <select
                    value={formData.employmentStatus}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        employmentStatus: e.target.value as EmploymentStatus,
                      })
                    }
                    className="w-full text-xs p-2.5 bg-stone-50 border border-stone-300 rounded-lg focus:outline-emerald-800"
                  >
                    <option value="PNS">PNS (Wajib Rp 100.000)</option>
                    <option value="PPPK">PPPK (Wajib Rp 100.000)</option>
                    <option value="PPPK_PARUH_WAKTU">PPPK Paruh Waktu (Wajib Rp 50.000)</option>
                    <option value="HONORER">Honorer (Wajib Rp 50.000)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Unit Kerja / Guru Mapel / Jabatan
                </label>
                <input
                  type="text"
                  required
                  value={formData.department}
                  onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                  placeholder="Misal: Guru Matematika / Staf Tata Usaha"
                  className="w-full text-xs p-2.5 bg-stone-50 border border-stone-300 rounded-lg focus:outline-emerald-800"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    No. Handphone / WA
                  </label>
                  <input
                    type="text"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="0812xxxx..."
                    className="w-full text-xs p-2.5 bg-stone-50 border border-stone-300 rounded-lg focus:outline-emerald-800"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="nama@sekolah.sch.id"
                    className="w-full text-xs p-2.5 bg-stone-50 border border-stone-300 rounded-lg focus:outline-emerald-800"
                  />
                </div>
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
                  Daftarkan Anggota
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
