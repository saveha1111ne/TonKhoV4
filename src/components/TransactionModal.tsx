import React, { useState, useEffect } from 'react';
import { X, ArrowUpRight, ArrowDownRight, AlertTriangle, CheckCircle, Package } from 'lucide-react';
import {
  TransactionType,
  InventoryTransaction,
  InventoryItem,
  Branch,
} from '../types/inventory';

interface TransactionModalProps {
  isOpen: boolean;
  type: TransactionType;
  editingTransaction?: InventoryTransaction | null;
  items: InventoryItem[];
  branches: Branch[];
  months: string[];
  selectedMonth: string;
  onClose: () => void;
  onSave: (transaction: Omit<InventoryTransaction, 'id' | 'createdAt'> & { id?: string }) => void;
  getCurrentStock: (month: string, branchName: string, itemCode: string) => number;
}

export const TransactionModal: React.FC<TransactionModalProps> = ({
  isOpen,
  type,
  editingTransaction,
  items,
  branches,
  months,
  selectedMonth,
  onClose,
  onSave,
  getCurrentStock,
}) => {
  const [month, setMonth] = useState(selectedMonth || months[0] || 'T07/2026');
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [branchId, setBranchId] = useState(branches[0]?.name || 'Hà Nội');
  const [itemCode, setItemCode] = useState(items[0]?.code || '');
  const [quantity, setQuantity] = useState<number | ''>(10);
  const [note, setNote] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // When opening or editing, initialize state
  useEffect(() => {
    if (editingTransaction) {
      setMonth(editingTransaction.month);
      setDate(editingTransaction.date);
      setBranchId(editingTransaction.branchId);
      setItemCode(editingTransaction.itemCode);
      setQuantity(editingTransaction.quantity);
      setNote(editingTransaction.note || '');
    } else {
      setMonth(selectedMonth || months[0] || 'T07/2026');
      setDate(new Date().toISOString().slice(0, 10));
      setBranchId(branches[0]?.name || 'Hà Nội');
      setItemCode(items[0]?.code || '');
      setQuantity(10);
      setNote('');
    }
    setErrorMsg('');
  }, [isOpen, editingTransaction, selectedMonth, items, branches, months]);

  if (!isOpen) return null;

  const currentItem = items.find((i) => i.code === itemCode);
  const isOut = type === 'OUT';

  // Calculate current available stock for this item in this branch and month
  // If editing an existing OUT transaction, add back its previous quantity for realistic limit checking
  const baseStock = getCurrentStock(month, branchId, itemCode);
  const existingAdjustment = editingTransaction && editingTransaction.type === 'OUT' ? editingTransaction.quantity : 0;
  const availableStock = baseStock + existingAdjustment;

  const numQty = Number(quantity) || 0;
  const isOverStock = isOut && numQty > availableStock;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!itemCode) {
      setErrorMsg('Vui lòng chọn mã vật tư.');
      return;
    }
    if (!currentItem) {
      setErrorMsg('Mã vật tư không tồn tại trong danh mục!');
      return;
    }
    if (numQty <= 0) {
      setErrorMsg('Số lượng giao dịch phải lớn hơn 0.');
      return;
    }

    if (isOut && numQty > availableStock) {
      setErrorMsg(
        `Cảnh báo: Số lượng xuất (${numQty}) vượt quá tồn kho khả dụng hiện tại (${availableStock} ${currentItem.unit}) tại chi nhánh ${branchId}!`
      );
      return;
    }

    onSave({
      id: editingTransaction ? editingTransaction.id : undefined,
      type,
      month,
      date,
      branchId,
      itemCode,
      itemName: currentItem.name,
      unit: currentItem.unit,
      quantity: numQty,
      note: note.trim(),
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-teal-100 transform transition-all max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div
              className={`w-10 h-10 rounded-xl flex items-center justify-center text-white ${
                isOut ? 'bg-rose-500 shadow-rose-500/20' : 'bg-emerald-500 shadow-emerald-500/20'
              } shadow-sm`}
            >
              {isOut ? (
                <ArrowDownRight className="w-5 h-5 stroke-[2.5]" />
              ) : (
                <ArrowUpRight className="w-5 h-5 stroke-[2.5]" />
              )}
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-slate-800">
                {editingTransaction
                  ? `SỬA GIAO DỊCH ${isOut ? 'XUẤT KHO' : 'NHẬP KHO'}`
                  : isOut
                  ? 'PHIẾU XUẤT KHO'
                  : 'PHIẾU NHẬP KHO'}
              </h3>
              <p className="text-xs text-slate-500">
                {isOut ? 'Xuất hàng khỏi chi nhánh' : 'Nhập hàng vào chi nhánh'} • Tự động tính tồn
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          {errorMsg && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Row 1: Month and Date */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Tháng hạch toán <span className="text-rose-500">*</span>
              </label>
              <select
                value={month}
                onChange={(e) => setMonth(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:border-teal-500 focus:ring-2 focus:ring-teal-200 text-sm font-semibold outline-none bg-[#F5FBFA]"
              >
                {months.map((m) => (
                  <option key={m} value={m}>
                    {m}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Ngày giao dịch <span className="text-rose-500">*</span>
              </label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
                className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:border-teal-500 focus:ring-2 focus:ring-teal-200 text-sm outline-none bg-[#F5FBFA]"
              >
              </input>
            </div>
          </div>

          {/* Row 2: Branch Selection */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Chi nhánh giao dịch <span className="text-rose-500">*</span>
            </label>
            <select
              value={branchId}
              onChange={(e) => setBranchId(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:border-teal-500 focus:ring-2 focus:ring-teal-200 text-sm font-semibold outline-none bg-[#F5FBFA]"
            >
              {branches.map((b) => (
                <option key={b.id} value={b.name}>
                  {b.name} ({b.region})
                </option>
              ))}
            </select>
          </div>

          {/* Row 3: Item Selection */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Vật tư / Hàng hóa <span className="text-rose-500">*</span>
            </label>
            <select
              value={itemCode}
              onChange={(e) => setItemCode(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:border-teal-500 focus:ring-2 focus:ring-teal-200 text-sm font-bold outline-none bg-[#F5FBFA]"
            >
              {items.map((i) => (
                <option key={i.id} value={i.code}>
                  [{i.code}] - {i.name} ({i.unit})
                </option>
              ))}
            </select>

            {currentItem && (
              <div className="mt-2 p-2.5 rounded-xl bg-teal-50/70 border border-teal-100 flex items-center justify-between text-xs">
                <div className="flex items-center gap-1.5 text-teal-900 font-semibold">
                  <Package className="w-3.5 h-3.5 text-teal-700" />
                  <span>
                    {currentItem.name} • {currentItem.category}
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-slate-500">Tồn tại {branchId}: </span>
                  <span
                    className={`font-extrabold ${
                      availableStock <= 0
                        ? 'text-rose-600'
                        : availableStock < 20
                        ? 'text-amber-700'
                        : 'text-teal-800'
                    }`}
                  >
                    {availableStock} {currentItem.unit}
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Row 4: Quantity & Unit */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-bold text-slate-700">
                {isOut ? 'Số lượng xuất' : 'Số lượng nhập'} <span className="text-rose-500">*</span>
              </label>
              {currentItem && (
                <span className="text-xs text-slate-500">
                  Đơn vị tính: <strong className="text-slate-800">{currentItem.unit}</strong>
                </span>
              )}
            </div>
            <div className="relative">
              <input
                type="number"
                min="1"
                step="1"
                value={quantity}
                onChange={(e) => {
                  const val = e.target.value === '' ? '' : Math.max(0, parseInt(e.target.value, 10));
                  setQuantity(val);
                }}
                required
                placeholder="Nhập số lượng..."
                className={`w-full px-3.5 py-2.5 rounded-xl border text-base font-bold outline-none transition-all ${
                  isOverStock
                    ? 'border-rose-400 bg-rose-50/50 text-rose-900 focus:ring-2 focus:ring-rose-200'
                    : 'border-slate-200 bg-[#F5FBFA] focus:border-teal-500 focus:ring-2 focus:ring-teal-200 text-slate-800'
                }`}
              />
              <span className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-xs font-bold text-slate-500 pointer-events-none">
                {currentItem?.unit || 'Sản phẩm'}
              </span>
            </div>

            {isOverStock && (
              <p className="mt-1 text-xs font-bold text-rose-600 flex items-center gap-1">
                <AlertTriangle className="w-3.5 h-3.5" />
                Vượt quá tồn kho ({availableStock} {currentItem?.unit})! Vui lòng giảm số lượng.
              </p>
            )}
          </div>

          {/* Row 5: Note */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Ghi chú giao dịch</label>
            <textarea
              rows={2}
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="VD: Cấp phát sự kiện, nhập hàng từ nhà máy, điều chuyển nội bộ..."
              className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:border-teal-500 focus:ring-2 focus:ring-teal-200 text-xs outline-none bg-[#F5FBFA]"
            />
          </div>

          {/* Action buttons */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-slate-300 text-slate-600 hover:bg-slate-100 font-bold text-xs uppercase tracking-wider transition-all cursor-pointer"
            >
              HỦY THAO TÁC
            </button>
            <button
              type="submit"
              disabled={isOverStock}
              className={`px-6 py-2.5 rounded-xl text-white font-bold text-xs uppercase tracking-wider transition-all cursor-pointer shadow-sm ${
                isOut
                  ? 'bg-rose-600 hover:bg-rose-700 shadow-rose-500/20 disabled:opacity-50 disabled:cursor-not-allowed'
                  : 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-500/20 disabled:opacity-50'
              }`}
            >
              {editingTransaction ? 'CẬP NHẬT GIAO DỊCH' : isOut ? 'LƯU PHIẾU XUẤT' : 'LƯU PHIẾU NHẬP'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
