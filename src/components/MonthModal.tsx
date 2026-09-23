import React, { useState } from 'react';
import { X, CalendarPlus, CheckCircle2, ArrowRight } from 'lucide-react';
import { getNextMonthSuggestion } from '../utils/calculations';

interface MonthModalProps {
  isOpen: boolean;
  existingMonths: string[];
  onClose: () => void;
  onAddMonth: (newMonth: string) => void;
}

export const MonthModal: React.FC<MonthModalProps> = ({
  isOpen,
  existingMonths,
  onClose,
  onAddMonth,
}) => {
  const latestMonth = existingMonths[existingMonths.length - 1] || 'T08/2026';
  const suggestedNext = getNextMonthSuggestion(latestMonth);
  const [monthInput, setMonthInput] = useState(suggestedNext);
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    let clean = monthInput.trim().toUpperCase();
    if (!clean.startsWith('T') && clean.includes('/')) {
      clean = 'T' + clean;
    }

    // Validate format TMM/YYYY
    const match = clean.match(/^T(\d{1,2})\/(\d{4})$/);
    if (!match) {
      setErrorMsg('Định dạng tháng không hợp lệ. Vui lòng nhập theo dạng: T09/2026 hoặc T10/2026');
      return;
    }

    const mNum = parseInt(match[1], 10);
    if (mNum < 1 || mNum > 12) {
      setErrorMsg('Tháng phải từ 1 đến 12 (VD: T09/2026)');
      return;
    }

    // Format with leading zero if single digit
    const formatted = `T${mNum < 10 ? '0' + mNum : mNum}/${match[2]}`;

    if (existingMonths.includes(formatted)) {
      setErrorMsg(`Tháng ${formatted} đã tồn tại trong hệ thống!`);
      return;
    }

    onAddMonth(formatted);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-teal-100 animate-in zoom-in-95">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-500 text-white flex items-center justify-center shadow-sm shadow-indigo-500/20">
              <CalendarPlus className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-slate-800">
                + THÊM THÁNG QUẢN LÝ MỚI
              </h3>
              <p className="text-xs text-slate-500">
                Tự động kết chuyển tồn kho sang tháng mới
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

        {/* Form */}
        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          {errorMsg && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold">
              {errorMsg}
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Tên tháng mới (Định dạng: TMM/YYYY) <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              value={monthInput}
              onChange={(e) => setMonthInput(e.target.value)}
              required
              placeholder="VD: T09/2026"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 text-base font-bold outline-none uppercase bg-[#F5FBFA]"
            />
            <p className="mt-1 text-[11px] text-slate-500">
              Gợi ý tháng tiếp theo: <strong className="text-indigo-600">{suggestedNext}</strong>
            </p>
          </div>

          {/* Logic Explanation Box */}
          <div className="p-3.5 rounded-xl bg-indigo-50/80 border border-indigo-100 text-xs text-indigo-950 space-y-1.5">
            <div className="font-bold flex items-center gap-1.5 text-indigo-800">
              <CheckCircle2 className="w-4 h-4 text-indigo-600" />
              <span>Quy tắc kết chuyển tự động Team CIC:</span>
            </div>
            <div className="text-[11px] text-indigo-900/90 leading-relaxed">
              <p className="flex items-center gap-1.5">
                <span>• Tồn cuối kỳ {latestMonth}</span>
                <ArrowRight className="w-3 h-3 text-indigo-500" />
                <span className="font-bold text-indigo-700">Tồn đầu kỳ {monthInput || 'mới'}</span>
              </p>
              <p>• Dữ liệu các tháng cũ được bảo lưu 100% nguyên vẹn.</p>
              <p>• Khi phát sinh giao dịch mới, tồn cuối sẽ tự động tính theo công thức.</p>
            </div>
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
              className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs uppercase tracking-wider transition-all cursor-pointer shadow-sm shadow-indigo-500/20"
            >
              + XÁC NHẬN TẠO THÁNG
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
