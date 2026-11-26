'use client';
import { useEffect, useState } from 'react';

export default function Dashboard() {
  const [priceData, setPriceData] = useState<any>(null);
  const [demandData, setDemandData] = useState<any>(null);
  const [overview, setOverview] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'forecasting' | 'inventory' | 'production' | 'partners'>('overview');

  // Form states
  const [newStockName, setNewStockName] = useState('');
  const [newStockCategory, setNewStockCategory] = useState('GREEN_BEAN');
  const [newStockQty, setNewStockQty] = useState('');
  const [newStockMin, setNewStockMin] = useState('');
  const [newStockUnit, setNewStockUnit] = useState('kg');

  const [prodProduct, setProdProduct] = useState('Kopi Bubuk Halus 250g');
  const [prodQty, setProdQty] = useState('');

  const loadData = () => {
    fetch('/api/forecasting?type=price').then(res => res.json()).then(setPriceData);
    fetch('/api/forecasting?type=demand').then(res => res.json()).then(setDemandData);
    fetch('/api/forecasting?type=overview').then(res => res.json()).then(setOverview);
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleAddStock = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch('/api/forecasting', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'add_stock',
        name: newStockName,
        category: newStockCategory,
        quantity: newStockQty,
        minLimit: newStockMin,
        unit: newStockUnit,
      })
    });
    if (res.ok) {
      setNewStockName('');
      setNewStockQty('');
      setNewStockMin('');
      loadData();
      alert('Stok berhasil ditambahkan!');
    }
  };

  const handleUpdateQty = async (id: string, currentQty: number, delta: number) => {
    const newQty = Math.max(0, currentQty + delta);
    const res = await fetch('/api/forecasting', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'update_stock',
        id,
        quantity: newQty,
      })
    });
    if (res.ok) {
      loadData();
    }
  };

  const handleAddProduction = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch('/api/forecasting', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'add_production',
        product: prodProduct,
        quantity: prodQty,
      })
    });
    if (res.ok) {
      setProdQty('');
      loadData();
      alert('Perintah produksi berhasil dibuat!');
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      {/* Header */}
      <header className="border-b border-slate-800 bg-slate-900/80 backdrop-blur sticky top-0 z-50 px-6 py-4 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="bg-amber-600 text-white p-2 rounded-xl font-bold shadow-lg shadow-amber-900/45">☕</div>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-white">SCM & Forecasting — UD. Tunas Jaya</h1>
            <p className="text-xs text-slate-400">Sesuai Standar PRD (Single Exponential Smoothing & Moving Average)</p>
          </div>
        </div>
        <div className="flex items-center gap-2 bg-emerald-950/60 border border-emerald-800/60 px-3 py-1.5 rounded-full text-emerald-400 text-xs font-medium">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          Neon Postgres Live Connected
        </div>
      </header>

      {/* Navigation Tabs */}
      <div className="bg-slate-900 border-b border-slate-800 px-6 flex gap-2 overflow-x-auto">
        {[
          { id: 'overview', label: '📊 Ringkasan Eksekutif' },
          { id: 'forecasting', label: '📈 Peramalan Akurasi MAPE' },
          { id: 'inventory', label: '📦 Manajemen & Kontrol Stok' },
          { id: 'production', label: '⚙️ Perencanaan Produksi' },
          { id: 'partners', label: '🤝 Mitra & Rantai Pasok' },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`px-4 py-3 text-sm font-medium border-b-2 transition whitespace-nowrap ${
              activeTab === tab.id
                ? 'border-amber-500 text-amber-400 bg-amber-500/10'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Main Content */}
      <main className="flex-1 p-6 max-w-7xl mx-auto w-full">
        {activeTab === 'overview' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl shadow-xl">
                <p className="text-sm text-slate-400">Total Unit Stok</p>
                <h3 className="text-3xl font-bold mt-2 text-white">
                  {overview ? overview.stock.reduce((acc: number, s: any) => acc + s.quantity, 0).toLocaleString() : '...'}
                </h3>
                <span className="text-xs text-emerald-400 mt-2 inline-block">🟢 Stok Gudang Aktif</span>
              </div>
              <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl shadow-xl">
                <p className="text-sm text-slate-400">Prediksi Harga Green Bean (SES)</p>
                <h3 className="text-3xl font-bold mt-2 text-amber-400">
                  {priceData ? `Rp ${priceData.nextForecast.toLocaleString()}` : '...'}
                </h3>
                <span className="text-xs text-slate-400 mt-2 inline-block">MAPE: {priceData?.mape.toFixed(1)}% (&lt;10% Sangat Baik)</span>
              </div>
              <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl shadow-xl">
                <p className="text-sm text-slate-400">Prediksi Permintaan (Moving Avg)</p>
                <h3 className="text-3xl font-bold mt-2 text-indigo-400">
                  {demandData ? `${demandData.nextForecast.toFixed(0)} Kg` : '...'}
                </h3>
                <span className="text-xs text-slate-400 mt-2 inline-block">MAPE: {demandData?.mape.toFixed(1)}% (&lt;10% Sangat Baik)</span>
              </div>
              <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl shadow-xl">
                <p className="text-sm text-slate-400">Mitra SCM Terdaftar</p>
                <h3 className="text-3xl font-bold mt-2 text-emerald-400">
                  {overview ? overview.partners.length : '...'} Mitra
                </h3>
                <span className="text-xs text-slate-400 mt-2 inline-block">⭐ Rata-rata Rating 4.8</span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-xl">
                <h3 className="text-lg font-bold mb-4">📦 Status Stok Gudang</h3>
                <div className="space-y-3">
                  {overview?.stock.map((s: any) => (
                    <div key={s.id} className="flex justify-between items-center bg-slate-800/50 p-3 rounded-xl border border-slate-800">
                      <div>
                        <p className="font-semibold text-sm">{s.name}</p>
                        <p className="text-xs text-slate-400">{s.category}</p>
                      </div>
                      <div className="text-right">
                        <span className="font-bold text-amber-400">{s.quantity} {s.unit}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-xl">
                <h3 className="text-lg font-bold mb-4">⚙️ Status Produksi Terkini</h3>
                <div className="space-y-3">
                  {overview?.production.map((p: any) => (
                    <div key={p.id} className="flex justify-between items-center bg-slate-800/50 p-3 rounded-xl border border-slate-800">
                      <div>
                        <p className="font-semibold text-sm">{p.orderNo} — {p.product}</p>
                        <p className="text-xs text-slate-400">Jumlah: {p.quantity} Kg</p>
                      </div>
                      <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                        p.status === 'COMPLETED' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                      }`}>
                        {p.status}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'forecasting' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-xl">
              <h2 className="text-xl font-bold mb-2">Peramalan Harga Green Bean (SES)</h2>
              <p className="text-xs text-slate-400 mb-6">Metode Single Exponential Smoothing sesuai PRD untuk estimasi harga biji kopi.</p>
              {priceData ? (
                <div className="space-y-4">
                  <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-800">
                    <p className="text-sm text-slate-400">Prediksi Harga Periode Berikutnya</p>
                    <p className="text-3xl font-extrabold text-amber-400 mt-1">Rp {priceData.nextForecast.toLocaleString()}</p>
                  </div>
                  <div className="flex justify-between items-center bg-slate-800/50 p-4 rounded-xl border border-slate-800">
                    <div>
                      <p className="text-sm font-semibold">Evaluasi Akurasi MAPE</p>
                      <p className="text-xs text-slate-400">Target Sangat Baik (&lt;10%)</p>
                    </div>
                    <span className="text-xl font-bold text-emerald-400">{priceData.mape.toFixed(2)}%</span>
                  </div>
                  <div className="text-xs text-emerald-400 bg-emerald-950/40 border border-emerald-800/50 p-3 rounded-lg">
                    Status: {priceData.status === 'EXCELLENT' ? 'Sangat Baik (<10%)' : 'Perlu Evaluasi'}
                  </div>
                </div>
              ) : <p className="text-slate-400">Memuat...</p>}
            </div>

            <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-xl">
              <h2 className="text-xl font-bold mb-2">Peramalan Permintaan Kopi Bubuk (Moving Average)</h2>
              <p className="text-xs text-slate-400 mb-6">Metode Moving Average sesuai PRD untuk estimasi volume permintaan pasar.</p>
              {demandData ? (
                <div className="space-y-4">
                  <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-800">
                    <p className="text-sm text-slate-400">Prediksi Permintaan Periode Berikutnya</p>
                    <p className="text-3xl font-extrabold text-indigo-400 mt-1">{demandData.nextForecast.toFixed(2)} Kg</p>
                  </div>
                  <div className="flex justify-between items-center bg-slate-800/50 p-4 rounded-xl border border-slate-800">
                    <div>
                      <p className="text-sm font-semibold">Evaluasi Akurasi MAPE</p>
                      <p className="text-xs text-slate-400">Target Sangat Baik (&lt;10%)</p>
                    </div>
                    <span className="text-xl font-bold text-emerald-400">{demandData.mape.toFixed(2)}%</span>
                  </div>
                  <div className="text-xs text-emerald-400 bg-emerald-950/40 border border-emerald-800/50 p-3 rounded-lg">
                    Status: {demandData.status === 'EXCELLENT' ? 'Sangat Baik (<10%)' : 'Perlu Evaluasi'}
                  </div>
                </div>
              ) : <p className="text-slate-400">Memuat...</p>}
            </div>
          </div>
        )}

        {activeTab === 'inventory' && (
          <div className="space-y-6">
            <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-xl">
              <h2 className="text-xl font-bold mb-4">➕ Tambah Barang / Stok Baru</h2>
              <form onSubmit={handleAddStock} className="grid grid-cols-1 md:grid-cols-5 gap-4">
                <input
                  type="text"
                  placeholder="Nama Barang"
                  value={newStockName}
                  onChange={e => setNewStockName(e.target.value)}
                  required
                  className="bg-slate-800 border border-slate-700 rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:border-amber-500"
                />
                <select
                  value={newStockCategory}
                  onChange={e => setNewStockCategory(e.target.value)}
                  className="bg-slate-800 border border-slate-700 rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:border-amber-500"
                >
                  <option value="GREEN_BEAN">Green Bean</option>
                  <option value="BUBUK">Kopi Bubuk</option>
                  <option value="KEMASAN">Kemasan</option>
                </select>
                <input
                  type="number"
                  placeholder="Jumlah Stok"
                  value={newStockQty}
                  onChange={e => setNewStockQty(e.target.value)}
                  required
                  className="bg-slate-800 border border-slate-700 rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:border-amber-500"
                />
                <input
                  type="number"
                  placeholder="Batas Minimum"
                  value={newStockMin}
                  onChange={e => setNewStockMin(e.target.value)}
                  required
                  className="bg-slate-800 border border-slate-700 rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:border-amber-500"
                />
                <button
                  type="submit"
                  className="bg-amber-600 hover:bg-amber-500 text-white font-bold rounded-xl px-4 py-2 text-sm transition shadow-lg shadow-amber-900/40"
                >
                  Simpan Stok
                </button>
              </form>
            </div>

            <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-xl">
              <h2 className="text-xl font-bold mb-4">📦 Daftar & Kontrol Inventaris Gudang</h2>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="border-b border-slate-800 text-slate-400">
                    <tr>
                      <th className="pb-3 font-semibold">Nama Barang</th>
                      <th className="pb-3 font-semibold">Kategori</th>
                      <th className="pb-3 font-semibold">Jumlah Stok</th>
                      <th className="pb-3 font-semibold">Batas Minimum</th>
                      <th className="pb-3 font-semibold">Aksi Pengaturan Stok</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800">
                    {overview?.stock.map((s: any) => (
                      <tr key={s.id} className="hover:bg-slate-800/40">
                        <td className="py-3 font-medium text-white">{s.name}</td>
                        <td className="py-3 text-slate-400">{s.category}</td>
                        <td className="py-3 font-bold text-amber-400">{s.quantity} {s.unit}</td>
                        <td className="py-3 text-slate-400">{s.minLimit} {s.unit}</td>
                        <td className="py-3 flex items-center gap-2">
                          <button
                            onClick={() => handleUpdateQty(s.id, s.quantity, -10)}
                            className="bg-rose-600/80 hover:bg-rose-600 text-white px-3 py-1 rounded-lg text-xs font-bold transition"
                          >
                            - 10
                          </button>
                          <button
                            onClick={() => handleUpdateQty(s.id, s.quantity, 10)}
                            className="bg-emerald-600/80 hover:bg-emerald-600 text-white px-3 py-1 rounded-lg text-xs font-bold transition"
                          >
                            + 10
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

        {activeTab === 'production' && (
          <div className="space-y-6">
            <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-xl">
              <h2 className="text-xl font-bold mb-4">⚙️ Buat Perintah Produksi Baru</h2>
              <form onSubmit={handleAddProduction} className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <input
                  type="text"
                  placeholder="Nama Produk (cth: Kopi Bubuk 250g)"
                  value={prodProduct}
                  onChange={e => setProdProduct(e.target.value)}
                  required
                  className="bg-slate-800 border border-slate-700 rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:border-amber-500"
                />
                <input
                  type="number"
                  placeholder="Jumlah Produksi (Kg)"
                  value={prodQty}
                  onChange={e => setProdQty(e.target.value)}
                  required
                  className="bg-slate-800 border border-slate-700 rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:border-amber-500"
                />
                <button
                  type="submit"
                  className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl px-4 py-2 text-sm transition shadow-lg shadow-indigo-900/40"
                >
                  Buat Perintah Produksi
                </button>
              </form>
            </div>

            <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-xl">
              <h2 className="text-xl font-bold mb-4">📋 Daftar Perintah Produksi</h2>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="border-b border-slate-800 text-slate-400">
                    <tr>
                      <th className="pb-3 font-semibold">No. Order</th>
                      <th className="pb-3 font-semibold">Produk</th>
                      <th className="pb-3 font-semibold">Jumlah</th>
                      <th className="pb-3 font-semibold">Tanggal Target</th>
                      <th className="pb-3 font-semibold">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800">
                    {overview?.production.map((p: any) => (
                      <tr key={p.id} className="hover:bg-slate-800/40">
                        <td className="py-3 font-medium text-white">{p.orderNo}</td>
                        <td className="py-3 text-slate-300">{p.product}</td>
                        <td className="py-3 font-bold text-indigo-400">{p.quantity} Kg</td>
                        <td className="py-3 text-slate-400">{new Date(p.targetDate).toLocaleDateString()}</td>
                        <td className="py-3">
                          <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                            p.status === 'COMPLETED' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                          }`}>
                            {p.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'partners' && (
          <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-xl">
            <h2 className="text-xl font-bold mb-4">🤝 Mitra Rantai Pasok (Petani, Supplier, Distributor)</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {overview?.partners.map((pt: any) => (
                <div key={pt.id} className="bg-slate-800/50 border border-slate-800 p-4 rounded-xl space-y-2">
                  <div className="flex justify-between items-start">
                    <h3 className="font-bold text-white">{pt.name}</h3>
                    <span className="text-xs bg-amber-500/20 text-amber-400 border border-amber-500/30 px-2 py-0.5 rounded-full font-semibold">{pt.role}</span>
                  </div>
                  <p className="text-xs text-slate-400">Komoditas: {pt.material}</p>
                  <p className="text-xs text-slate-400">Kontak: {pt.contact}</p>
                  <div className="pt-2 flex justify-between items-center text-xs border-t border-slate-700/50">
                    <span className="text-slate-400">Rating Kinerja</span>
                    <span className="font-bold text-emerald-400">⭐ {pt.rating} / 5.0</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>

      <footer className="border-t border-slate-800 text-center py-4 text-xs text-slate-500">
        UD. Tunas Jaya SCM System &copy; 2026 &mdash; Sesuai PRD & Terhubung ke Neon Postgres
      </footer>
    </div>
  );
}
