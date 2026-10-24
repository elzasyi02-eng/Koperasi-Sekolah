import React, { useState } from 'react';
import { useCooperative } from '../../context/CooperativeContext';
import { WaserdaProduct } from '../../types';
import { formatRupiah, formatDate } from '../../utils/formatters';
import { PrintReceiptModal } from '../common/PrintReceiptModal';
import { 
  ShoppingCart, 
  Package, 
  History, 
  Plus, 
  Trash2, 
  Search, 
  Receipt, 
  Check, 
  ShoppingBag,
  TrendingUp,
  CreditCard,
  Banknote
} from 'lucide-react';

export const WaserdaView: React.FC = () => {
  const { 
    currentUser, 
    products, 
    addProduct, 
    updateProduct, 
    deleteProduct, 
    members, 
    waserdaTransactions, 
    createWaserdaTransaction 
  } = useCooperative();

  const isStaffOrAdmin = currentUser.role === 'pengelola' || currentUser.role === 'pegawai';
  const isAdmin = currentUser.role === 'pengelola';

  const [activeTab, setActiveTab] = useState<'pos' | 'products' | 'history'>('pos');
  
  // POS State
  const [cart, setCart] = useState<{ product: WaserdaProduct; quantity: number }[]>([]);
  const [selectedMemberId, setSelectedMemberId] = useState<string>('');
  const [paymentMethod, setPaymentMethod] = useState<'tunai' | 'potong_gaji' | 'transfer'>('tunai');
  const [posNotes, setPosNotes] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  
  // Product Form Modal State
  const [showProductModal, setShowProductModal] = useState(false);
  const [editingProductId, setEditingProductId] = useState<string | null>(null);
  const [prodForm, setProdForm] = useState({
    name: '',
    category: 'ATK' as WaserdaProduct['category'],
    costPrice: 0,
    sellPrice: 0,
    stock: 10,
    unit: 'pcs',
  });

  // Receipt Modal State
  const [receiptData, setReceiptData] = useState<any | null>(null);

  // Cart operations
  const addToCart = (product: WaserdaProduct) => {
    if (product.stock <= 0) return;
    setCart((prev) => {
      const existing = prev.find((item) => item.product.id === product.id);
      if (existing) {
        if (existing.quantity >= product.stock) return prev;
        return prev.map((item) =>
          item.product.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prev, { product, quantity: 1 }];
    });
  };

  const updateCartQty = (productId: string, qty: number) => {
    if (qty <= 0) {
      removeFromCart(productId);
      return;
    }
    const product = products.find((p) => p.id === productId);
    if (product && qty > product.stock) return;

    setCart((prev) =>
      prev.map((item) => (item.product.id === productId ? { ...item, quantity: qty } : item))
    );
  };

  const removeFromCart = (productId: string) => {
    setCart((prev) => prev.filter((item) => item.product.id !== productId));
  };

  const cartTotal = cart.reduce((acc, curr) => acc + curr.product.sellPrice * curr.quantity, 0);

  const handleCheckout = (e: React.FormEvent) => {
    e.preventDefault();
    if (cart.length === 0) return;

    const tx = createWaserdaTransaction(
      cart,
      paymentMethod,
      selectedMemberId ? selectedMemberId : undefined,
      posNotes
    );

    // Buka struk cetak
    const member = members.find((m) => m.id === selectedMemberId);
    setReceiptData({
      title: 'Struk Belanja Waserda',
      receiptNo: tx.receiptNo,
      date: tx.date,
      memberName: member ? member.name : 'Pelanggan Umum',
      memberNo: member ? member.memberNo : undefined,
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

    // Reset Form
    setCart([]);
    setSelectedMemberId('');
    setPosNotes('');
  };

  // Product CRUD
  const handleSaveProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!prodForm.name || prodForm.sellPrice <= 0) return;

    if (editingProductId) {
      updateProduct(editingProductId, prodForm);
    } else {
      addProduct(prodForm);
    }

    setShowProductModal(false);
    setEditingProductId(null);
    setProdForm({
      name: '',
      category: 'ATK',
      costPrice: 0,
      sellPrice: 0,
      stock: 10,
      unit: 'pcs',
    });
  };

  const openEditProduct = (p: WaserdaProduct) => {
    setEditingProductId(p.id);
    setProdForm({
      name: p.name,
      category: p.category,
      costPrice: p.costPrice,
      sellPrice: p.sellPrice,
      stock: p.stock,
      unit: p.unit,
    });
    setShowProductModal(true);
  };

  const filteredProducts = products.filter((p) => {
    const matchSearch =
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.code.toLowerCase().includes(searchTerm.toLowerCase());
    const matchCat = selectedCategory === 'all' || p.category === selectedCategory;
    return matchSearch && matchCat;
  });

  const totalOmzetWaserda = waserdaTransactions.reduce((acc, t) => acc + t.totalAmount, 0);
  const totalLabaWaserda = waserdaTransactions.reduce((acc, t) => acc + t.totalProfit, 0);

  return (
    <div className="space-y-6">
      
      {/* Header & Stats Banner */}
      <div className="bg-white rounded-xl border border-stone-200 p-5 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-2 rounded-lg bg-emerald-100 text-emerald-800">
                <ShoppingBag className="w-5 h-5" />
              </span>
              <div>
                <h1 className="text-xl font-bold text-stone-900">1. Waserda (Warung Serba Ada)</h1>
                <p className="text-xs text-stone-500">
                  Pusat belanja kebutuhan sekolah, ATK, seragam guru/siswa, dan sembako anggota koperasi.
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4 text-xs font-mono">
            <div className="bg-stone-50 border border-stone-200 rounded-lg p-2.5 px-3">
              <span className="text-stone-500 block text-[10px] font-sans">Total Penjualan (Omzet)</span>
              <span className="text-stone-900 font-bold">{formatRupiah(totalOmzetWaserda)}</span>
            </div>
            <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-2.5 px-3">
              <span className="text-emerald-700 block text-[10px] font-sans">Keuntungan / Laba Kotor</span>
              <span className="text-emerald-900 font-bold">{formatRupiah(totalLabaWaserda)}</span>
            </div>
          </div>
        </div>

        {/* Tab Controls */}
        <div className="flex items-center gap-1.5 mt-5 border-t border-stone-100 pt-3">
          <button
            onClick={() => setActiveTab('pos')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 cursor-pointer transition-colors ${
              activeTab === 'pos'
                ? 'bg-emerald-800 text-white shadow-xs'
                : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100'
            }`}
          >
            <ShoppingCart className="w-4 h-4" />
            <span>Kasir / Penjualan (POS)</span>
          </button>
          
          <button
            onClick={() => setActiveTab('products')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 cursor-pointer transition-colors ${
              activeTab === 'products'
                ? 'bg-emerald-800 text-white shadow-xs'
                : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100'
            }`}
          >
            <Package className="w-4 h-4" />
            <span>Katalog & Stok ({products.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('history')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 cursor-pointer transition-colors ${
              activeTab === 'history'
                ? 'bg-emerald-800 text-white shadow-xs'
                : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100'
            }`}
          >
            <History className="w-4 h-4" />
            <span>Riwayat Transaksi ({waserdaTransactions.length})</span>
          </button>
        </div>
      </div>

      {/* TAB 1: POS / KASIR PENJUALAN */}
      {activeTab === 'pos' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Left: Product Catalog Selection (Col 7) */}
          <div className="lg:col-span-7 space-y-4">
            <div className="bg-white rounded-xl border border-stone-200 p-4 shadow-xs">
              
              {/* Search & Filter */}
              <div className="flex flex-col sm:flex-row gap-2 mb-4">
                <div className="relative flex-1">
                  <Search className="w-4 h-4 text-stone-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    placeholder="Cari nama barang atau kode ATK/sembako..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full text-xs pl-9 pr-3 py-2 bg-stone-50 border border-stone-300 rounded-lg focus:outline-emerald-800 focus:bg-white"
                  />
                </div>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="text-xs px-3 py-2 bg-stone-50 border border-stone-300 rounded-lg text-stone-700 focus:outline-emerald-800"
                >
                  <option value="all">Semua Kategori</option>
                  <option value="ATK">ATK & Kertas</option>
                  <option value="Seragam">Seragam & Atribut</option>
                  <option value="Sembako">Sembako</option>
                  <option value="Konsumsi">Konsumsi</option>
                </select>
              </div>

              {/* Product Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 max-h-[520px] overflow-y-auto pr-1">
                {filteredProducts.map((p) => {
                  const inCartItem = cart.find((i) => i.product.id === p.id);
                  const isOutOfStock = p.stock <= 0;

                  return (
                    <button
                      key={p.id}
                      type="button"
                      disabled={isOutOfStock}
                      onClick={() => addToCart(p)}
                      className={`text-left p-3 rounded-xl border transition-all relative flex flex-col justify-between cursor-pointer ${
                        isOutOfStock
                          ? 'opacity-50 bg-stone-100 border-stone-200 cursor-not-allowed'
                          : inCartItem
                          ? 'border-emerald-700 bg-emerald-50/50 shadow-xs'
                          : 'border-stone-200 bg-white hover:border-emerald-600 hover:shadow-xs'
                      }`}
                    >
                      {inCartItem && (
                        <span className="absolute top-2 right-2 w-5 h-5 bg-emerald-800 text-white rounded-full text-[10px] font-bold flex items-center justify-center">
                          {inCartItem.quantity}
                        </span>
                      )}

                      <div>
                        <div className="text-[10px] text-stone-400 font-mono">{p.code}</div>
                        <h4 className="text-xs font-semibold text-stone-900 mt-1 line-clamp-2 leading-snug">
                          {p.name}
                        </h4>
                      </div>

                      <div className="mt-3 pt-2 border-t border-stone-100 flex items-center justify-between">
                        <span className="text-xs font-bold font-mono text-emerald-800">
                          {formatRupiah(p.sellPrice)}
                        </span>
                        <span className="text-[10px] text-stone-500">
                          Stok: <strong className={p.stock < 5 ? 'text-red-600' : 'text-stone-700'}>{p.stock}</strong> {p.unit}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>

            </div>
          </div>

          {/* Right: Cart & Checkout Form (Col 5) */}
          <div className="lg:col-span-5">
            <div className="bg-white rounded-xl border border-stone-200 p-5 shadow-xs sticky top-24">
              <div className="flex items-center justify-between pb-3 border-b border-stone-200">
                <div className="flex items-center gap-2">
                  <ShoppingCart className="w-5 h-5 text-emerald-800" />
                  <h3 className="font-bold text-sm text-stone-900">Keranjang Kasir</h3>
                </div>
                {cart.length > 0 && (
                  <button
                    onClick={() => setCart([])}
                    className="text-[11px] text-stone-500 hover:text-red-600 cursor-pointer"
                  >
                    Kosongkan
                  </button>
                )}
              </div>

              {/* Items in Cart */}
              <div className="mt-3 space-y-2 max-h-[220px] overflow-y-auto pr-1">
                {cart.length === 0 ? (
                  <div className="py-8 text-center text-stone-400 text-xs">
                    Keranjang masih kosong. Klik barang di katalog sebelah kiri untuk menambahkan.
                  </div>
                ) : (
                  cart.map((item) => (
                    <div
                      key={item.product.id}
                      className="p-2.5 rounded-lg bg-stone-50 border border-stone-200 flex items-center justify-between gap-2"
                    >
                      <div className="flex-1 min-w-0">
                        <div className="text-xs font-medium text-stone-900 truncate">
                          {item.product.name}
                        </div>
                        <div className="text-[11px] text-stone-500 font-mono">
                          {formatRupiah(item.product.sellPrice)} / {item.product.unit}
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => updateCartQty(item.product.id, item.quantity - 1)}
                          className="w-6 h-6 rounded bg-white border border-stone-300 text-stone-700 text-xs font-bold hover:bg-stone-100 flex items-center justify-center cursor-pointer"
                        >
                          -
                        </button>
                        <span className="w-7 text-center text-xs font-bold font-mono">
                          {item.quantity}
                        </span>
                        <button
                          type="button"
                          onClick={() => updateCartQty(item.product.id, item.quantity + 1)}
                          className="w-6 h-6 rounded bg-white border border-stone-300 text-stone-700 text-xs font-bold hover:bg-stone-100 flex items-center justify-center cursor-pointer"
                        >
                          +
                        </button>
                        <button
                          type="button"
                          onClick={() => removeFromCart(item.product.id)}
                          className="p-1 text-stone-400 hover:text-red-600 rounded ml-1 cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Checkout Form */}
              <form onSubmit={handleCheckout} className="mt-4 pt-3 border-t border-stone-200 space-y-3">
                
                {/* Total Display */}
                <div className="bg-stone-50 p-3 rounded-lg flex items-center justify-between">
                  <span className="text-xs font-bold text-stone-700">TOTAL BELANJA</span>
                  <span className="text-base font-bold font-mono text-emerald-800">
                    {formatRupiah(cartTotal)}
                  </span>
                </div>

                {/* Pilih Anggota Pembeli */}
                <div>
                  <label className="block text-[11px] font-semibold text-stone-700 mb-1">
                    Anggota Koperasi (Opsional jika Pelanggan Umum)
                  </label>
                  <select
                    value={selectedMemberId}
                    onChange={(e) => setSelectedMemberId(e.target.value)}
                    className="w-full text-xs p-2 bg-stone-50 border border-stone-300 rounded-lg text-stone-800 focus:outline-emerald-800"
                  >
                    <option value="">-- Pembeli Non-Anggota (Umum) --</option>
                    {members.map((m) => (
                      <option key={m.id} value={m.id}>
                        {m.memberNo} - {m.name} ({m.employmentStatus})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Metode Pembayaran */}
                <div>
                  <label className="block text-[11px] font-semibold text-stone-700 mb-1">
                    Metode Pembayaran
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    <button
                      type="button"
                      onClick={() => setPaymentMethod('tunai')}
                      className={`p-2 rounded-lg border text-xs font-medium text-center flex flex-col items-center gap-1 cursor-pointer ${
                        paymentMethod === 'tunai'
                          ? 'border-emerald-700 bg-emerald-50 text-emerald-900 font-bold'
                          : 'border-stone-200 text-stone-600 hover:bg-stone-50'
                      }`}
                    >
                      <Banknote className="w-4 h-4" />
                      <span>Tunai / Kas</span>
                    </button>
                    <button
                      type="button"
                      disabled={!selectedMemberId}
                      onClick={() => setPaymentMethod('potong_gaji')}
                      className={`p-2 rounded-lg border text-xs font-medium text-center flex flex-col items-center gap-1 cursor-pointer ${
                        !selectedMemberId
                          ? 'opacity-40 cursor-not-allowed border-stone-200'
                          : paymentMethod === 'potong_gaji'
                          ? 'border-emerald-700 bg-emerald-50 text-emerald-900 font-bold'
                          : 'border-stone-200 text-stone-600 hover:bg-stone-50'
                      }`}
                    >
                      <CreditCard className="w-4 h-4" />
                      <span>Potong Gaji</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setPaymentMethod('transfer')}
                      className={`p-2 rounded-lg border text-xs font-medium text-center flex flex-col items-center gap-1 cursor-pointer ${
                        paymentMethod === 'transfer'
                          ? 'border-emerald-700 bg-emerald-50 text-emerald-900 font-bold'
                          : 'border-stone-200 text-stone-600 hover:bg-stone-50'
                      }`}
                    >
                      <TrendingUp className="w-4 h-4" />
                      <span>Transfer Bank</span>
                    </button>
                  </div>
                </div>

                {/* Catatan Transaksi */}
                <div>
                  <input
                    type="text"
                    placeholder="Catatan belanja (misal: keperluan ujian/rapat guru)..."
                    value={posNotes}
                    onChange={(e) => setPosNotes(e.target.value)}
                    className="w-full text-xs p-2 bg-stone-50 border border-stone-300 rounded-lg text-stone-800 focus:outline-emerald-800"
                  />
                </div>

                {/* Submit Checkout Button */}
                <button
                  type="submit"
                  disabled={cart.length === 0}
                  className="w-full py-2.5 px-4 bg-emerald-800 hover:bg-emerald-900 disabled:opacity-40 disabled:cursor-not-allowed text-white font-semibold rounded-lg text-xs flex items-center justify-center gap-2 cursor-pointer shadow-xs transition-colors"
                >
                  <Receipt className="w-4 h-4" />
                  <span>Selesaikan & Cetak Struk</span>
                </button>

              </form>
            </div>
          </div>

        </div>
      )}

      {/* TAB 2: PRODUCT MANAGEMENT & STOCK */}
      {activeTab === 'products' && (
        <div className="bg-white rounded-xl border border-stone-200 p-5 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="font-bold text-sm text-stone-900">Manajemen Inventori & Harga Waserda</h3>
              <p className="text-xs text-stone-500">Kelola stok barang, harga modal (HPP), dan harga jual anggota.</p>
            </div>

            {isAdmin && (
              <button
                onClick={() => {
                  setEditingProductId(null);
                  setProdForm({
                    name: '',
                    category: 'ATK',
                    costPrice: 0,
                    sellPrice: 0,
                    stock: 10,
                    unit: 'pcs',
                  });
                  setShowProductModal(true);
                }}
                className="px-3.5 py-2 bg-emerald-800 hover:bg-emerald-900 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 cursor-pointer self-start"
              >
                <Plus className="w-4 h-4" />
                <span>Tambah Produk Baru</span>
              </button>
            )}
          </div>

          {/* Table */}
          <div className="overflow-x-auto border border-stone-200 rounded-lg">
            <table className="w-full text-xs text-left text-stone-700">
              <thead className="bg-stone-50 border-b border-stone-200 font-semibold text-stone-900 uppercase text-[10px]">
                <tr>
                  <th className="px-4 py-3">Kode</th>
                  <th className="px-4 py-3">Nama Barang</th>
                  <th className="px-4 py-3">Kategori</th>
                  <th className="px-4 py-3 text-right">Harga Pokok (HPP)</th>
                  <th className="px-4 py-3 text-right">Harga Jual</th>
                  <th className="px-4 py-3 text-right">Margin / Unit</th>
                  <th className="px-4 py-3 text-center">Stok</th>
                  {isAdmin && <th className="px-4 py-3 text-center">Aksi</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {products.map((p) => {
                  const margin = p.sellPrice - p.costPrice;
                  return (
                    <tr key={p.id} className="hover:bg-stone-50/70 transition-colors">
                      <td className="px-4 py-3 font-mono font-medium text-stone-900">{p.code}</td>
                      <td className="px-4 py-3 font-medium text-stone-900">{p.name}</td>
                      <td className="px-4 py-3">
                        <span className="text-[11px] text-stone-600 font-medium">
                          {p.category}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right font-mono text-stone-500">
                        {formatRupiah(p.costPrice)}
                      </td>
                      <td className="px-4 py-3 text-right font-mono font-semibold text-emerald-800">
                        {formatRupiah(p.sellPrice)}
                      </td>
                      <td className="px-4 py-3 text-right font-mono text-stone-600">
                        +{formatRupiah(margin)}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className={`font-mono font-bold ${p.stock < 5 ? 'text-red-600' : 'text-stone-900'}`}>
                          {p.stock}
                        </span>{' '}
                        <span className="text-[10px] text-stone-400">{p.unit}</span>
                      </td>
                      {isAdmin && (
                        <td className="px-4 py-3 text-center">
                          <div className="flex items-center justify-center gap-1.5">
                            <button
                              onClick={() => openEditProduct(p)}
                              className="px-2 py-1 text-[11px] text-emerald-800 hover:bg-emerald-50 rounded font-medium cursor-pointer"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => {
                                if (confirm(`Hapus produk "${p.name}"?`)) {
                                  deleteProduct(p.id);
                                }
                              }}
                              className="p-1 text-stone-400 hover:text-red-600 rounded cursor-pointer"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
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

      {/* TAB 3: TRANSACTION HISTORY */}
      {activeTab === 'history' && (
        <div className="bg-white rounded-xl border border-stone-200 p-5 shadow-xs space-y-4">
          <div>
            <h3 className="font-bold text-sm text-stone-900">Riwayat Penjualan Waserda</h3>
            <p className="text-xs text-stone-500">Daftar transaksi kasir, metode pembayaran, dan cetak ulang nota.</p>
          </div>

          <div className="overflow-x-auto border border-stone-200 rounded-lg">
            <table className="w-full text-xs text-left text-stone-700">
              <thead className="bg-stone-50 border-b border-stone-200 font-semibold text-stone-900 uppercase text-[10px]">
                <tr>
                  <th className="px-4 py-3">No. Nota</th>
                  <th className="px-4 py-3">Tanggal</th>
                  <th className="px-4 py-3">Pembeli</th>
                  <th className="px-4 py-3">Item Barang</th>
                  <th className="px-4 py-3">Metode Bayar</th>
                  <th className="px-4 py-3 text-right">Total Belanja</th>
                  <th className="px-4 py-3 text-right">Laba Kotor</th>
                  <th className="px-4 py-3 text-center">Struk</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {waserdaTransactions.map((tx) => (
                  <tr key={tx.id} className="hover:bg-stone-50/70 transition-colors">
                    <td className="px-4 py-3 font-mono font-bold text-stone-900">{tx.receiptNo}</td>
                    <td className="px-4 py-3 text-stone-500">{formatDate(tx.date)}</td>
                    <td className="px-4 py-3 font-medium text-stone-900">{tx.memberName}</td>
                    <td className="px-4 py-3">
                      <span className="text-[11px] text-stone-600">
                        {tx.items.length} macam ({tx.items.map((i) => `${i.productName} (${i.quantity})`).join(', ')})
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
                    <td className="px-4 py-3 text-right font-mono text-emerald-800 font-semibold">
                      +{formatRupiah(tx.totalProfit)}
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
                        <span>Lihat Struk</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Product Add/Edit Modal */}
      {showProductModal && (
        <div className="fixed inset-0 bg-stone-900/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-stone-200">
            <h3 className="text-base font-bold text-stone-900 mb-4">
              {editingProductId ? 'Edit Data Produk Waserda' : 'Tambah Produk Waserda Baru'}
            </h3>

            <form onSubmit={handleSaveProduct} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Nama Barang / Produk
                </label>
                <input
                  type="text"
                  required
                  value={prodForm.name}
                  onChange={(e) => setProdForm({ ...prodForm, name: e.target.value })}
                  placeholder="Misal: Kertas Folio Bergaris..."
                  className="w-full text-xs p-2 bg-stone-50 border border-stone-300 rounded-lg focus:outline-emerald-800"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    Kategori
                  </label>
                  <select
                    value={prodForm.category}
                    onChange={(e) =>
                      setProdForm({ ...prodForm, category: e.target.value as any })
                    }
                    className="w-full text-xs p-2 bg-stone-50 border border-stone-300 rounded-lg focus:outline-emerald-800"
                  >
                    <option value="ATK">ATK & Kertas</option>
                    <option value="Seragam">Seragam & Atribut</option>
                    <option value="Sembako">Sembako</option>
                    <option value="Konsumsi">Konsumsi</option>
                    <option value="Lainnya">Lainnya</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    Satuan
                  </label>
                  <input
                    type="text"
                    value={prodForm.unit}
                    onChange={(e) => setProdForm({ ...prodForm, unit: e.target.value })}
                    placeholder="pcs, rim, kg, pack"
                    className="w-full text-xs p-2 bg-stone-50 border border-stone-300 rounded-lg focus:outline-emerald-800"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    Harga Modal / Beli (HPP)
                  </label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={prodForm.costPrice}
                    onChange={(e) =>
                      setProdForm({ ...prodForm, costPrice: Number(e.target.value) })
                    }
                    className="w-full text-xs p-2 bg-stone-50 border border-stone-300 rounded-lg focus:outline-emerald-800 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    Harga Jual Anggota
                  </label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={prodForm.sellPrice}
                    onChange={(e) =>
                      setProdForm({ ...prodForm, sellPrice: Number(e.target.value) })
                    }
                    className="w-full text-xs p-2 bg-stone-50 border border-stone-300 rounded-lg focus:outline-emerald-800 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Stok Awal
                </label>
                <input
                  type="number"
                  min="0"
                  required
                  value={prodForm.stock}
                  onChange={(e) =>
                    setProdForm({ ...prodForm, stock: Number(e.target.value) })
                  }
                  className="w-full text-xs p-2 bg-stone-50 border border-stone-300 rounded-lg focus:outline-emerald-800 font-mono"
                />
              </div>

              <div className="mt-5 flex items-center justify-end gap-2 pt-3 border-t border-stone-200">
                <button
                  type="button"
                  onClick={() => setShowProductModal(false)}
                  className="px-4 py-2 text-xs font-medium text-stone-600 hover:bg-stone-100 rounded-lg cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-semibold bg-emerald-800 hover:bg-emerald-900 text-white rounded-lg cursor-pointer"
                >
                  Simpan Produk
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Printable Receipt Modal */}
      <PrintReceiptModal data={receiptData} onClose={() => setReceiptData(null)} />

    </div>
  );
};
