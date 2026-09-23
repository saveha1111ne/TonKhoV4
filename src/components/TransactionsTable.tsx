import React, { useState } from 'react';
import {
  ArrowUpRight,
  ArrowDownRight,
  Edit2,
  Trash2,
  Search,
  Calendar,
  MapPin,
  Filter,
  Plus,
} from 'lucide-react';
import { InventoryTransaction, TransactionType, Branch } from '../types/inventory';

interface TransactionsTableProps {
  type: TransactionType;
  transactions: InventoryTransaction[];
  branches: Branch[];
  months: string[];
  selectedMonth: string;
  onOpenCreateModal: () => void;
  onEditTransaction: (tx: InventoryTransaction) => void;
  onDeleteTransaction: (tx: InventoryTransaction) => void;
}

export const TransactionsTable: React.FC<TransactionsTableProps> = ({
  type,
  transactions,
  branches,
  months,
  selectedMonth,
  onOpenCreateModal,
  onEditTransaction,
  onDeleteTransaction,
}) => {
  const [filterMonth, setFilterMonth] = useState(selectedMonth);
  const [filterBranch, setFilterBranch] = useState('ALL');
  const [search, setSearch] = useState('');

  const isOut = type === 'OUT';

  // Filter transactions
  const filtered = transactions.filter((t) => {
    if (t.type !== type) return false;
    if (filterMonth !== 'ALL' && t.month !== filterMonth) return false;
    if (filterBranch !== 'ALL' && t.branchId !== filterBranch) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      const matchCode = t.itemCode.toLowerCase().includes(q);
      const matchName = t.itemName.toLowerCase().includes(q);
      const matchNote = (t.note || '').toLowerCase().includes(q);
      const matchId = t.id.toLowerCase().includes(q);
      if (!matchCode && !matchName && !matchNote && !matchId) return false;
    }
    return true;
  });

  const totalQuantity = filtered.reduce((sum, t) => sum + (Number(t.quantity) || 0), 0);
  const formatNumber = (num: number) => new Intl.NumberFormat('vi-VN').format(num || 0);

  return (
    <div className="bg-white rounded-2xl border border-teal-100 shadow-xs overflow-hidden">
      {/* Header and Toolbar */}
      <div className="p-4 sm:px-6 border-b border-teal-100 bg-gradient-to-r from-teal-50/50 to-sky-50/40 flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div
            className={`w-10 h-10 rounded-xl flex items-center justify-center text-white shadow-sm ${
              isOut ? 'bg-rose-500 shadow-rose-500/20' : 'bg-emerald-500 shadow-emerald-500/20'
            }`}
          >
            {isOut ? (
              <ArrowDownRight className="w-5 h-5 stroke-[2.5]" />
            ) : (
              <ArrowUpRight className="w-5 h-5 stroke-[2.5]" />
            )}
          </div>
          <div>
            <h2 className="text-base sm:text-lg font-bold text-slate-800">
              {isOut ? 'DANH SÁCH GIAO DỊCH XUẤT KHO' : 'DANH SÁCH GIAO DỊCH NHẬP KHO'}
            </h2>
            <p className="text-xs text-slate-500">
              Quản lý chi tiết từng phiếu {isOut ? 'xuất kho' : 'nhập kho'} • Có hỗ trợ Sửa & Xóa
            </p>
          </div>
        </div>

        <button
          onClick={onOpenCreateModal}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-white font-bold text-xs uppercase tracking-wider transition-all cursor-pointer shadow-sm ${
            isOut
              ? 'bg-rose-600 hover:bg-rose-700 shadow-rose-500/20'
              : 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-500/20'
          }`}
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span>{isOut ? '+ XUẤT KHO MỚI' : '+ NHẬP KHO MỚI'}</span>
        </button>
      </div>

      {/* Filter Bar inside table */}
      <div className="p-3 bg-[#F5FBFA] border-b border-teal-100 flex flex-wrap items-center gap-2.5">
        {/* Search Input */}
        <div className="relative flex-1 min-w-[200px]">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Tìm theo mã hàng, tên hàng, ghi chú..."
            className="w-full pl-9 pr-3 py-1.5 rounded-lg border border-slate-200 text-xs outline-none bg-white focus:border-teal-500"
          />
        </div>

        {/* Month Filter */}
        <div className="flex items-center gap-1.5 bg-white px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs">
          <Calendar className="w-3.5 h-3.5 text-slate-400" />
          <select
            value={filterMonth}
            onChange={(e) => setFilterMonth(e.target.value)}
            className="font-semibold text-slate-700 outline-none bg-transparent cursor-pointer"
          >
            <option value="ALL">Tất cả tháng</option>
            {months.map((m) => (
              <option key={m} value={m}>
                {m}
              </option>
            ))}
          </select>
        </div>

        {/* Branch Filter */}
        <div className="flex items-center gap-1.5 bg-white px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs">
          <MapPin className="w-3.5 h-3.5 text-slate-400" />
          <select
            value={filterBranch}
            onChange={(e) => setFilterBranch(e.target.value)}
            className="font-semibold text-slate-700 outline-none bg-transparent cursor-pointer"
          >
            <option value="ALL">Tất cả chi nhánh</option>
            {branches.map((b) => (
              <option key={b.id} value={b.name}>
                {b.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Table Content */}
      <div className="overflow-x-auto max-h-[560px] scrollbar-thin scrollbar-thumb-teal-200">
        <table className="w-full text-left border-collapse text-xs sm:text-sm">
          <thead className="bg-[#E0F2F1]/80 text-teal-950 font-bold sticky top-0 z-20 border-b border-teal-200">
            <tr>
              <th className="py-3 px-3 w-12 text-center">STT</th>
              <th className="py-3 px-3 min-w-[90px]">Tháng</th>
              <th className="py-3 px-3 min-w-[100px]">Ngày GD</th>
              <th className="py-3 px-3 min-w-[120px]">Chi nhánh</th>
              <th className="py-3 px-3 min-w-[110px]">Mã VT</th>
              <th className="py-3 px-4 min-w-[180px]">Tên vật tư</th>
              <th className="py-3 px-3 text-right min-w-[100px]">Số lượng</th>
              <th className="py-3 px-2 w-16 text-center">ĐVT</th>
              <th className="py-3 px-4 min-w-[150px]">Ghi chú</th>
              <th className="py-3 px-3 text-center min-w-[100px]">Thao tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={10} className="py-12 text-center text-slate-400">
                  Chưa có giao dịch {isOut ? 'xuất kho' : 'nhập kho'} nào trong bộ lọc này.
                </td>
              </tr>
            ) : (
              filtered.map((tx, idx) => (
                <tr key={tx.id} className="hover:bg-teal-50/40 transition-colors group">
                  <td className="py-2.5 px-3 text-center text-slate-400 font-medium">{idx + 1}</td>
                  <td className="py-2.5 px-3 font-semibold text-slate-700">{tx.month}</td>
                  <td className="py-2.5 px-3 text-slate-600">{tx.date}</td>
                  <td className="py-2.5 px-3 font-semibold text-teal-900">{tx.branchId}</td>
                  <td className="py-2.5 px-3 font-mono font-bold text-slate-800">{tx.itemCode}</td>
                  <td className="py-2.5 px-4 font-semibold text-slate-800">{tx.itemName}</td>
                  <td
                    className={`py-2.5 px-3 text-right font-extrabold ${
                      isOut ? 'text-rose-700' : 'text-emerald-700'
                    }`}
                  >
                    {isOut ? '-' : '+'}
                    {formatNumber(tx.quantity)}
                  </td>
                  <td className="py-2.5 px-2 text-center text-slate-500 font-medium">{tx.unit}</td>
                  <td className="py-2.5 px-4 text-xs text-slate-500 italic max-w-xs truncate">
                    {tx.note || '—'}
                  </td>
                  <td className="py-2.5 px-3 text-center">
                    <div className="flex items-center justify-center gap-1">
                      <button
                        onClick={() => onEditTransaction(tx)}
                        title="Sửa giao dịch này"
                        className="p-1.5 rounded-lg hover:bg-teal-100 text-teal-700 transition-colors cursor-pointer"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => onDeleteTransaction(tx)}
                        title="Xóa giao dịch này"
                        className="p-1.5 rounded-lg hover:bg-rose-100 text-rose-600 transition-colors cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
          {/* Footer Total */}
          <tfoot className="bg-[#E0F2F1] text-teal-950 font-extrabold sticky bottom-0 z-20 border-t-2 border-teal-300">
            <tr>
              <td colSpan={6} className="py-3 px-4 text-slate-800 uppercase tracking-wider text-xs sm:text-sm">
                TỔNG CỘNG ({filtered.length} PHIẾU {isOut ? 'XUẤT' : 'NHẬP'})
              </td>
              <td
                className={`py-3 px-3 text-right text-base sm:text-lg font-black ${
                  isOut ? 'text-rose-800 bg-rose-200/80' : 'text-emerald-800 bg-emerald-200/80'
                }`}
              >
                {isOut ? '-' : '+'}
                {formatNumber(totalQuantity)}
              </td>
              <td colSpan={3} className="py-3 px-3 text-xs text-teal-800 font-semibold">
                Sản phẩm
              </td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
};
