import React, { useState } from 'react';
import { X, Building2, MapPin } from 'lucide-react';
import { Branch } from '../types/inventory';

interface BranchModalProps {
  isOpen: boolean;
  branches: Branch[];
  onClose: () => void;
  onAddBranch: (branch: Omit<Branch, 'id'>) => void;
}

export const BranchModal: React.FC<BranchModalProps> = ({
  isOpen,
  branches,
  onClose,
  onAddBranch,
}) => {
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [region, setRegion] = useState<'Bắc' | 'Trung' | 'Nam' | 'Tây Nam Bộ'>('Bắc');
  const [address, setAddress] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    const cleanName = name.trim();
    const cleanCode = code.trim().toUpperCase();

    if (!cleanName) {
      setErrorMsg('Vui lòng nhập tên chi nhánh (VD: Hải Phòng, Cần Thơ...)');
      return;
    }
    if (!cleanCode) {
      setErrorMsg('Vui lòng nhập mã chi nhánh (VD: HP, VT...)');
      return;
    }

    if (branches.some((b) => b.name.toLowerCase() === cleanName.toLowerCase())) {
      setErrorMsg(`Chi nhánh "${cleanName}" đã tồn tại!`);
      return;
    }

    onAddBranch({
      name: cleanName,
      code: cleanCode,
      region,
      address: address.trim(),
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-teal-100 animate-in zoom-in-95">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500 text-white flex items-center justify-center shadow-sm shadow-amber-500/20">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-slate-800">
                + THÊM CHI NHÁNH MỚI
              </h3>
              <p className="text-xs text-slate-500">Mở rộng mạng lưới kho bãi Team CIC</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          {errorMsg && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold">
              {errorMsg}
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Tên chi nhánh <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                placeholder="VD: Hải Phòng"
                className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:border-amber-500 focus:ring-2 focus:ring-amber-200 text-sm font-semibold outline-none bg-[#F5FBFA]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Mã viết tắt <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase())}
                required
                placeholder="VD: HP"
                className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:border-amber-500 focus:ring-2 focus:ring-amber-200 text-sm font-mono font-bold outline-none uppercase bg-[#F5FBFA]"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Khu vực địa lý <span className="text-rose-500">*</span>
            </label>
            <select
              value={region}
              onChange={(e) => setRegion(e.target.value as any)}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:border-amber-500 focus:ring-2 focus:ring-amber-200 text-sm font-semibold outline-none bg-[#F5FBFA]"
            >
              <option value="Bắc">Miền Bắc</option>
              <option value="Trung">Miền Trung</option>
              <option value="Nam">Miền Nam</option>
              <option value="Tây Nam Bộ">Tây Nam Bộ</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Địa chỉ kho hàng</label>
            <input
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="VD: Kho Cảng Hải Phòng, Lê Hồng Phong..."
              className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:border-amber-500 focus:ring-2 focus:ring-amber-200 text-sm outline-none bg-[#F5FBFA]"
            />
          </div>

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
              className="px-5 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs uppercase tracking-wider transition-all cursor-pointer shadow-sm shadow-amber-500/20"
            >
              + THÊM CHI NHÁNH
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
