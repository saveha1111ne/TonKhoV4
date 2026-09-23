import React from 'react';
import { ArrowDownLeft, ArrowUpRight, Archive, MapPin, PackageCheck } from 'lucide-react';

interface KpiCardsProps {
  totalBeginning: number;
  totalIn: number;
  totalOut: number;
  totalEnding: number;
  branchCount: number;
  itemCount: number;
  selectedMonth: string;
}

export const KpiCards: React.FC<KpiCardsProps> = ({
  totalBeginning,
  totalIn,
  totalOut,
  totalEnding,
  branchCount,
  itemCount,
  selectedMonth,
}) => {
  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('vi-VN').format(num || 0);
  };

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5 sm:gap-4">
      {/* 1. TỔNG NHẬP */}
      <div className="bg-gradient-to-br from-emerald-50/90 to-teal-50/70 border border-emerald-200/70 rounded-2xl p-4 shadow-xs hover:shadow-md transition-shadow relative overflow-hidden group">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-bold tracking-wider uppercase text-emerald-800/80">
            TỔNG NHẬP
          </span>
          <div className="w-8 h-8 rounded-xl bg-emerald-100/90 text-emerald-600 flex items-center justify-center group-hover:scale-110 transition-transform">
            <ArrowDownLeft className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-2 flex items-baseline gap-1.5">
          <span className="text-2xl sm:text-3xl font-extrabold text-emerald-700 tracking-tight">
            {formatNumber(totalIn)}
          </span>
          <span className="text-xs font-semibold text-emerald-600">sp</span>
        </div>
        <div className="mt-1 text-[11px] text-emerald-700/80 flex items-center gap-1 font-medium">
          <span>Kỳ {selectedMonth}</span>
        </div>
      </div>

      {/* 2. TỔNG XUẤT */}
      <div className="bg-gradient-to-br from-rose-50/90 to-orange-50/60 border border-rose-200/70 rounded-2xl p-4 shadow-xs hover:shadow-md transition-shadow relative overflow-hidden group">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-bold tracking-wider uppercase text-rose-800/80">
            TỔNG XUẤT
          </span>
          <div className="w-8 h-8 rounded-xl bg-rose-100/90 text-rose-600 flex items-center justify-center group-hover:scale-110 transition-transform">
            <ArrowUpRight className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-2 flex items-baseline gap-1.5">
          <span className="text-2xl sm:text-3xl font-extrabold text-rose-700 tracking-tight">
            {formatNumber(totalOut)}
          </span>
          <span className="text-xs font-semibold text-rose-600">sp</span>
        </div>
        <div className="mt-1 text-[11px] text-rose-700/80 flex items-center gap-1 font-medium">
          <span>Kỳ {selectedMonth}</span>
        </div>
      </div>

      {/* 3. TỔNG TỒN (HIGHLIGHT CARD) */}
      <div className="bg-gradient-to-br from-cyan-50/95 via-sky-50/80 to-teal-50/70 border-2 border-sky-300/80 rounded-2xl p-4 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-bold tracking-wider uppercase text-sky-800">
            TỔNG TỒN CUỐI
          </span>
          <div className="w-8 h-8 rounded-xl bg-sky-100/90 text-sky-600 flex items-center justify-center group-hover:scale-110 transition-transform">
            <Archive className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-2 flex items-baseline gap-1.5">
          <span className="text-2xl sm:text-3xl font-extrabold text-sky-800 tracking-tight">
            {formatNumber(totalEnding)}
          </span>
          <span className="text-xs font-semibold text-sky-600">sp</span>
        </div>
        <div className="mt-1 text-[11px] text-sky-700 font-medium">
          <span>Đầu kỳ: {formatNumber(totalBeginning)} sp</span>
        </div>
      </div>

      {/* 4. SỐ CHI NHÁNH */}
      <div className="bg-gradient-to-br from-amber-50/90 to-yellow-50/60 border border-amber-200/70 rounded-2xl p-4 shadow-xs hover:shadow-md transition-shadow relative overflow-hidden group">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-bold tracking-wider uppercase text-amber-800/80">
            SỐ CHI NHÁNH
          </span>
          <div className="w-8 h-8 rounded-xl bg-amber-100/90 text-amber-700 flex items-center justify-center group-hover:scale-110 transition-transform">
            <MapPin className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-2 flex items-baseline gap-1.5">
          <span className="text-2xl sm:text-3xl font-extrabold text-amber-800 tracking-tight">
            {branchCount}
          </span>
          <span className="text-xs font-semibold text-amber-700">chi nhánh</span>
        </div>
        <div className="mt-1 text-[11px] text-amber-700/80 font-medium truncate">
          <span>HN • ĐN • HCM • CT</span>
        </div>
      </div>

      {/* 5. SỐ MÃ VẬT TƯ */}
      <div className="col-span-2 sm:col-span-1 bg-gradient-to-br from-indigo-50/90 to-purple-50/60 border border-indigo-200/70 rounded-2xl p-4 shadow-xs hover:shadow-md transition-shadow relative overflow-hidden group">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-bold tracking-wider uppercase text-indigo-800/80">
            SỐ MÃ VẬT TƯ
          </span>
          <div className="w-8 h-8 rounded-xl bg-indigo-100/90 text-indigo-600 flex items-center justify-center group-hover:scale-110 transition-transform">
            <PackageCheck className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-2 flex items-baseline gap-1.5">
          <span className="text-2xl sm:text-3xl font-extrabold text-indigo-800 tracking-tight">
            {itemCount}
          </span>
          <span className="text-xs font-semibold text-indigo-600">mã hàng</span>
        </div>
        <div className="mt-1 text-[11px] text-indigo-700/80 font-medium">
          <span>Quản lý danh mục CIC</span>
        </div>
      </div>
    </div>
  );
};
