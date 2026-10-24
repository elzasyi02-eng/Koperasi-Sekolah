import React from 'react';
import { useCooperative } from '../../context/CooperativeContext';
import { formatRupiah, formatDate, formatDateFull } from '../../utils/formatters';
import { Printer, X, CheckCircle2 } from 'lucide-react';

interface ReceiptData {
  title: string;
  receiptNo: string;
  date: string;
  memberName?: string;
  memberNo?: string;
  cashierName: string;
  category: string;
  items?: { name: string; qty: number; price: number; subtotal: number }[];
  breakdown?: { label: string; value: string | number; isBold?: boolean }[];
  totalAmount: number;
  paymentMethod?: string;
  notes?: string;
}

interface PrintReceiptModalProps {
  data: ReceiptData | null;
  onClose: () => void;
}

export const PrintReceiptModal: React.FC<PrintReceiptModalProps> = ({ data, onClose }) => {
  const { config } = useCooperative();

  if (!data) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 bg-stone-900/60 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-stone-200 overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header Actions */}
        <div className="no-print p-4 bg-stone-50 border-b border-stone-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-600" />
            <span className="font-semibold text-sm text-stone-900">Bukti Transaksi Resmi</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-3 py-1.5 bg-emerald-800 text-white hover:bg-emerald-900 rounded-lg text-xs font-medium flex items-center gap-1.5 cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Cetak / PDF</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-stone-400 hover:text-stone-700 hover:bg-stone-100 rounded-lg cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Receipt Paper */}
        <div className="p-6 overflow-y-auto print:p-0 print:m-0 print-card font-mono text-xs text-stone-900">
          
          {/* Header Toko/Koperasi */}
          <div className="text-center border-b border-dashed border-stone-300 pb-4 mb-4">
            <h2 className="font-bold text-sm tracking-tight font-sans">{config.name}</h2>
            <p className="text-[11px] text-stone-600 font-sans mt-0.5">{config.schoolName}</p>
            <p className="text-[10px] text-stone-500 font-sans">{config.address}</p>
            <p className="text-[10px] text-stone-500 font-sans">Telp: {config.phone}</p>
            
            <div className="mt-3 inline-block px-3 py-1 bg-stone-100 rounded text-[11px] font-semibold uppercase tracking-wider font-sans">
              {data.title}
            </div>
          </div>

          {/* Meta Info */}
          <div className="space-y-1.5 border-b border-dashed border-stone-300 pb-3 mb-3 text-[11px]">
            <div className="flex justify-between">
              <span className="text-stone-500">No. Bukti</span>
              <span className="font-bold">{data.receiptNo}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-stone-500">Waktu</span>
              <span>{formatDateFull(data.date)}</span>
            </div>
            {data.memberName && (
              <div className="flex justify-between">
                <span className="text-stone-500">Anggota</span>
                <span className="font-semibold">{data.memberName} {data.memberNo ? `(${data.memberNo})` : ''}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-stone-500">Petugas / Kasir</span>
              <span>{data.cashierName}</span>
            </div>
            {data.paymentMethod && (
              <div className="flex justify-between">
                <span className="text-stone-500">Metode Bayar</span>
                <span className="uppercase font-semibold">{data.paymentMethod}</span>
              </div>
            )}
          </div>

          {/* Waserda Items if any */}
          {data.items && data.items.length > 0 && (
            <div className="border-b border-dashed border-stone-300 pb-3 mb-3">
              <div className="text-stone-500 mb-1.5 text-[11px]">Rincian Barang:</div>
              <div className="space-y-1.5">
                {data.items.map((item, idx) => (
                  <div key={idx} className="flex justify-between items-start text-[11px]">
                    <div className="max-w-[200px]">
                      <div className="font-sans font-medium text-stone-900">{item.name}</div>
                      <div className="text-[10px] text-stone-500">{item.qty} x {formatRupiah(item.price)}</div>
                    </div>
                    <div className="font-semibold">{formatRupiah(item.subtotal)}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Breakdown Rows if any (e.g. Pokok + Bunga Menurun) */}
          {data.breakdown && data.breakdown.length > 0 && (
            <div className="border-b border-dashed border-stone-300 pb-3 mb-3 space-y-1.5 text-[11px]">
              {data.breakdown.map((row, idx) => (
                <div key={idx} className="flex justify-between">
                  <span className={row.isBold ? 'font-bold font-sans' : 'text-stone-500'}>{row.label}</span>
                  <span className={row.isBold ? 'font-bold' : ''}>
                    {typeof row.value === 'number' ? formatRupiah(row.value) : row.value}
                  </span>
                </div>
              ))}
            </div>
          )}

          {/* Total */}
          <div className="flex justify-between items-center py-2 border-b border-dashed border-stone-300 text-sm font-bold">
            <span>TOTAL DIBAYAR</span>
            <span className="text-base text-emerald-800">{formatRupiah(data.totalAmount)}</span>
          </div>

          {data.notes && (
            <div className="mt-3 text-[10px] text-stone-500 italic">
              Catatan: {data.notes}
            </div>
          )}

          {/* Signatures */}
          <div className="mt-6 pt-2 grid grid-cols-2 text-center text-[10px] font-sans">
            <div>
              <p className="text-stone-500 mb-8">Penyetor / Anggota,</p>
              <p className="font-semibold text-stone-900">{data.memberName || '(...........................)'}</p>
            </div>
            <div>
              <p className="text-stone-500 mb-8">Petugas Koperasi,</p>
              <p className="font-semibold text-stone-900">{data.cashierName}</p>
            </div>
          </div>

          <div className="mt-6 text-center text-[10px] text-stone-400 font-sans border-t border-stone-100 pt-2">
            Simpan bukti ini sebagai tanda pembayaran yang sah. Terima kasih.
          </div>

        </div>

      </div>
    </div>
  );
};
