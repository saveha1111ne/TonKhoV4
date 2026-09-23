import React from 'react';
import {
  PlusCircle,
  ArrowUpRight,
  ArrowDownRight,
  CalendarPlus,
  FileSpreadsheet,
  FileText,
  Upload,
  Layers,
  Sparkles,
} from 'lucide-react';

interface QuickActionsProps {
  onOpenInwardModal: () => void;
  onOpenOutwardModal: () => void;
  onOpenItemModal: () => void;
  onOpenMonthModal: () => void;
  onExportExcel: () => void;
  onExportCSV: () => void;
  onOpenImportModal: () => void;
  onOpenGoogleSheetsModal: () => void;
}

export const QuickActions: React.FC<QuickActionsProps> = ({
  onOpenInwardModal,
  onOpenOutwardModal,
  onOpenItemModal,
  onOpenMonthModal,
  onExportExcel,
  onExportCSV,
  onOpenImportModal,
  onOpenGoogleSheetsModal,
}) => {
  return (
    <div className="bg-white/90 backdrop-blur-xs rounded-2xl p-4 border border-teal-100/80 shadow-xs">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-teal-500 animate-ping"></div>
          <span className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-teal-600" />
            Thao tác nhanh hệ thống
          </span>
        </div>
        <span className="text-xs text-slate-500 hidden sm:inline">
          Dễ dàng nhập liệu, tính toán tự động & xuất báo cáo
        </span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2.5">
        {/* + NHẬP KHO */}
        <button
          onClick={onOpenInwardModal}
          className="flex flex-col items-center justify-center p-3 rounded-xl bg-gradient-to-b from-emerald-50 to-teal-50/80 hover:from-emerald-100 hover:to-teal-100 border border-emerald-200 text-emerald-800 font-bold text-xs transition-all shadow-2xs hover:shadow-xs active:scale-95 group cursor-pointer"
        >
          <div className="w-7 h-7 rounded-lg bg-emerald-500 text-white flex items-center justify-center mb-1.5 shadow-sm group-hover:scale-110 transition-transform">
            <ArrowUpRight className="w-4 h-4 stroke-[2.5]" />
          </div>
          <span>+ NHẬP KHO</span>
        </button>

        {/* + XUẤT KHO */}
        <button
          onClick={onOpenOutwardModal}
          className="flex flex-col items-center justify-center p-3 rounded-xl bg-gradient-to-b from-rose-50 to-orange-50/80 hover:from-rose-100 hover:to-orange-100 border border-rose-200 text-rose-800 font-bold text-xs transition-all shadow-2xs hover:shadow-xs active:scale-95 group cursor-pointer"
        >
          <div className="w-7 h-7 rounded-lg bg-rose-500 text-white flex items-center justify-center mb-1.5 shadow-sm group-hover:scale-110 transition-transform">
            <ArrowDownRight className="w-4 h-4 stroke-[2.5]" />
          </div>
          <span>+ XUẤT KHO</span>
        </button>

        {/* + THÊM VẬT TƯ */}
        <button
          onClick={onOpenItemModal}
          className="flex flex-col items-center justify-center p-3 rounded-xl bg-gradient-to-b from-sky-50 to-cyan-50/80 hover:from-sky-100 hover:to-cyan-100 border border-sky-200 text-sky-800 font-bold text-xs transition-all shadow-2xs hover:shadow-xs active:scale-95 group cursor-pointer"
        >
          <div className="w-7 h-7 rounded-lg bg-sky-500 text-white flex items-center justify-center mb-1.5 shadow-sm group-hover:scale-110 transition-transform">
            <PlusCircle className="w-4 h-4" />
          </div>
          <span>+ THÊM VẬT TƯ</span>
        </button>

        {/* + THÊM THÁNG */}
        <button
          onClick={onOpenMonthModal}
          className="flex flex-col items-center justify-center p-3 rounded-xl bg-gradient-to-b from-indigo-50 to-blue-50/80 hover:from-indigo-100 hover:to-blue-100 border border-indigo-200 text-indigo-800 font-bold text-xs transition-all shadow-2xs hover:shadow-xs active:scale-95 group cursor-pointer"
        >
          <div className="w-7 h-7 rounded-lg bg-indigo-500 text-white flex items-center justify-center mb-1.5 shadow-sm group-hover:scale-110 transition-transform">
            <CalendarPlus className="w-4 h-4" />
          </div>
          <span>+ THÊM THÁNG</span>
        </button>

        {/* 📥 XUẤT EXCEL */}
        <button
          onClick={onExportExcel}
          className="flex flex-col items-center justify-center p-3 rounded-xl bg-gradient-to-b from-teal-50 to-emerald-50/60 hover:from-teal-100 hover:to-emerald-100 border border-teal-200 text-teal-800 font-bold text-xs transition-all shadow-2xs hover:shadow-xs active:scale-95 group cursor-pointer"
        >
          <div className="w-7 h-7 rounded-lg bg-[#00897B] text-white flex items-center justify-center mb-1.5 shadow-sm group-hover:scale-110 transition-transform">
            <FileSpreadsheet className="w-4 h-4" />
          </div>
          <span>📥 XUẤT EXCEL</span>
        </button>

        {/* 📄 XUẤT CSV */}
        <button
          onClick={onExportCSV}
          className="flex flex-col items-center justify-center p-3 rounded-xl bg-gradient-to-b from-slate-50 to-teal-50/40 hover:from-slate-100 hover:to-teal-100 border border-slate-200 text-slate-700 font-bold text-xs transition-all shadow-2xs hover:shadow-xs active:scale-95 group cursor-pointer"
        >
          <div className="w-7 h-7 rounded-lg bg-slate-600 text-white flex items-center justify-center mb-1.5 shadow-sm group-hover:scale-110 transition-transform">
            <FileText className="w-4 h-4" />
          </div>
          <span>📄 XUẤT CSV</span>
        </button>

        {/* 📤 NHẬP EXCEL */}
        <button
          onClick={onOpenImportModal}
          className="flex flex-col items-center justify-center p-3 rounded-xl bg-gradient-to-b from-amber-50 to-orange-50/60 hover:from-amber-100 hover:to-orange-100 border border-amber-200 text-amber-900 font-bold text-xs transition-all shadow-2xs hover:shadow-xs active:scale-95 group cursor-pointer"
        >
          <div className="w-7 h-7 rounded-lg bg-amber-600 text-white flex items-center justify-center mb-1.5 shadow-sm group-hover:scale-110 transition-transform">
            <Upload className="w-4 h-4" />
          </div>
          <span>📤 NHẬP EXCEL</span>
        </button>

        {/* 🔗 GOOGLE SHEET */}
        <button
          onClick={onOpenGoogleSheetsModal}
          className="flex flex-col items-center justify-center p-3 rounded-xl bg-gradient-to-b from-green-50 to-emerald-50/80 hover:from-green-100 hover:to-emerald-100 border border-green-300 text-green-900 font-bold text-xs transition-all shadow-2xs hover:shadow-xs active:scale-95 group cursor-pointer"
        >
          <div className="w-7 h-7 rounded-lg bg-green-600 text-white flex items-center justify-center mb-1.5 shadow-sm group-hover:scale-110 transition-transform">
            <Layers className="w-4 h-4" />
          </div>
          <span>🔗 GOOGLE SHEET</span>
        </button>
      </div>
    </div>
  );
};
