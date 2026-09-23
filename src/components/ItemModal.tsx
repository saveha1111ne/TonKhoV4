import React, { useState, useEffect } from 'react';
import { X, PackagePlus, Layers, Hash } from 'lucide-react';
import { InventoryItem, Branch } from '../types/inventory';

interface ItemModalProps {
  isOpen: boolean;
  editingItem?: InventoryItem | null;
  categories: string[];
  branches: Branch[];
  onClose: () => void;
  onSave: (
    itemData: Omit<InventoryItem, 'id'> & { id?: string },
    initialStocks?: Record<string, number>
  ) => void;
}

export const ItemModal: React.FC<ItemModalProps> = ({
  isOpen,
  editingItem,
  categories,
  branches,
  onClose,
  onSave,
}) => {
  const [code, setCode] = useState('');
  const [name, setName] = useState('');
  const [unit, setUnit] = useState('Cái');
  const [category, setCategory] = useState(categories[0] || 'Túi đeo chéo');
  const [newCategoryInput, setNewCategoryInput] = useState('');
  const [isAddingCustomCategory, setIsAddingCustomCategory] = useState(false);
  const [status, setStatus] = useState<'active' | 'inactive'>('active');
  const [description, setDescription] = useState('');
  const [initialStocks, setInitialStocks] = useState<Record<string, number>>({});
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (editingItem) {
      setCode(editingItem.code);
      setName(editingItem.name);
      setUnit(editingItem.unit);
      setCategory(editingItem.category);
      setStatus(editingItem.status);
      setDescription(editingItem.description || '');
      setIsAddingCustomCategory(false);
    } else {
      setCode('');
      setName('');
      setUnit('Cái');
      setCategory(categories[0] || 'Túi đeo chéo');
      setStatus('active');
      setDescription('');
      setIsAddingCustomCategory(false);
      // Default initial stocks
      const defaultStocks: Record<string, number> = {};
      branches.forEach((b) => {
        defaultStocks[b.name] = 0;
      });
      setInitialStocks(defaultStocks);
    }
    setErrorMsg('');
  }, [isOpen, editingItem, categories, branches]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    const cleanCode = code.trim().toUpperCase();
    const cleanName = name.trim();
    const finalCategory = isAddingCustomCategory
      ? newCategoryInput.trim()
      : category;

    if (!cleanCode) {
      setErrorMsg('Vui lòng nhập Mã vật tư (VD: CIC-TDC-03)');
      return;
    }
    if (!cleanName) {
      setErrorMsg('Vui lòng nhập Tên vật tư');
      return;
    }
    if (!finalCategory) {
      setErrorMsg('Vui lòng chọn hoặc nhập Nhóm vật tư');
      return;
    }

    onSave(
      {
        id: editingItem ? editingItem.id : undefined,
        code: cleanCode,
        name: cleanName,
        unit: unit.trim() || 'Cái',
        category: finalCategory,
        status,
        description: description.trim(),
      },
      !editingItem ? initialStocks : undefined
    );

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-teal-100 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-teal-500 text-white flex items-center justify-center shadow-sm shadow-teal-500/20">
              <PackagePlus className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-slate-800">
                {editingItem ? 'SỬA THÔNG TIN VẬT TƯ' : '+ THÊM VẬT TƯ MỚI'}
              </h3>
              <p className="text-xs text-slate-500">
                Khai báo mã vật tư, đơn vị tính, nhóm hàng và tồn ban đầu
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
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold">
              {errorMsg}
            </div>
          )}

          {/* Row 1: Code and Unit */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Mã vật tư <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={code}
                  onChange={(e) => setCode(e.target.value.toUpperCase())}
                  required
                  placeholder="VD: CIC-TDC-03"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:border-teal-500 focus:ring-2 focus:ring-teal-200 text-sm font-mono font-bold outline-none uppercase bg-[#F5FBFA]"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Đơn vị tính <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                list="units-list"
                value={unit}
                onChange={(e) => setUnit(e.target.value)}
                required
                placeholder="Cái, Chiếc, Bộ, Cây..."
                className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:border-teal-500 focus:ring-2 focus:ring-teal-200 text-sm outline-none bg-[#F5FBFA]"
              />
              <datalist id="units-list">
                <option value="Cái" />
                <option value="Chiếc" />
                <option value="Cây" />
                <option value="Bình" />
                <option value="Cuốn" />
                <option value="Bộ" />
                <option value="Hộp" />
                <option value="Thùng" />
              </datalist>
            </div>
          </div>

          {/* Row 2: Name */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Tên vật tư <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              placeholder="VD: Túi đeo chéo Classic Team CIC Version 2026..."
              className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:border-teal-500 focus:ring-2 focus:ring-teal-200 text-sm font-semibold outline-none bg-[#F5FBFA]"
            />
          </div>

          {/* Row 3: Category */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-bold text-slate-700">
                Nhóm vật tư <span className="text-rose-500">*</span>
              </label>
              <button
                type="button"
                onClick={() => setIsAddingCustomCategory(!isAddingCustomCategory)}
                className="text-xs font-bold text-teal-600 hover:text-teal-700 underline cursor-pointer"
              >
                {isAddingCustomCategory ? '← Chọn nhóm có sẵn' : '+ Tạo nhóm mới'}
              </button>
            </div>

            {isAddingCustomCategory ? (
              <input
                type="text"
                value={newCategoryInput}
                onChange={(e) => setNewCategoryInput(e.target.value)}
                placeholder="Nhập tên nhóm mới (VD: Balo chống gù, Nón bảo hiểm...)"
                className="w-full px-3 py-2 rounded-xl border border-teal-300 focus:border-teal-500 focus:ring-2 focus:ring-teal-200 text-sm outline-none bg-teal-50/40"
              />
            ) : (
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:border-teal-500 focus:ring-2 focus:ring-teal-200 text-sm outline-none bg-[#F5FBFA]"
              >
                {categories.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* Row 4: Status */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Trạng thái quản lý</label>
            <div className="flex items-center gap-4 text-xs font-semibold">
              <label className="flex items-center gap-1.5 cursor-pointer">
                <input
                  type="radio"
                  name="status"
                  value="active"
                  checked={status === 'active'}
                  onChange={() => setStatus('active')}
                  className="text-teal-600 focus:ring-teal-500"
                />
                <span className="text-emerald-700">Hoạt động (Đang kinh doanh)</span>
              </label>
              <label className="flex items-center gap-1.5 cursor-pointer">
                <input
                  type="radio"
                  name="status"
                  value="inactive"
                  checked={status === 'inactive'}
                  onChange={() => setStatus('inactive')}
                  className="text-rose-600 focus:ring-rose-500"
                />
                <span className="text-slate-500">Tạm ngừng sử dụng</span>
              </label>
            </div>
          </div>

          {/* Row 5: Initial Beginning Stock for Branches (Only for new item) */}
          {!editingItem && (
            <div className="p-3 rounded-xl bg-teal-50/60 border border-teal-100">
              <label className="block text-xs font-bold text-teal-900 mb-1.5">
                Thiết lập tồn đầu kỳ ban đầu tại các chi nhánh (tùy chọn):
              </label>
              <div className="grid grid-cols-2 gap-2">
                {branches.map((b) => (
                  <div key={b.id} className="flex items-center justify-between gap-2 bg-white px-2.5 py-1.5 rounded-lg border border-teal-100">
                    <span className="text-xs font-medium text-slate-700 truncate">{b.name}:</span>
                    <input
                      type="number"
                      min="0"
                      value={initialStocks[b.name] ?? 0}
                      onChange={(e) => {
                        const val = Math.max(0, parseInt(e.target.value, 10) || 0);
                        setInitialStocks((prev) => ({ ...prev, [b.name]: val }));
                      }}
                      className="w-16 px-1.5 py-0.5 rounded border border-slate-200 text-xs font-bold text-right outline-none focus:border-teal-500"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Row 6: Description */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Mô tả / Thông số kỹ thuật</label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="VD: Chất liệu, quy cách đóng gói, kích thước..."
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
              HỦY BỎ
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs uppercase tracking-wider transition-all cursor-pointer shadow-sm shadow-teal-500/20"
            >
              {editingItem ? 'LƯU THAY ĐỔI' : '+ THÊM VẬT TƯ'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
