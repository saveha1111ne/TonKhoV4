import React, { useState } from 'react';
import { FileSpreadsheet, Calendar, Filter, ArrowUpRight, ArrowDownRight, Archive } from 'lucide-react';
import { InventorySummaryRow, Branch } from '../types/inventory';

interface MonthlyMatrixReportProps {
  itemSummaries: InventorySummaryRow[];
  branches: Branch[];
  months: string[];
  selectedMonth: string;
  onMonthChange: (m: string) => void;
  onExportExcel: () => void;
}

export type MatrixMetric = 'STOCK' | 'IN' | 'OUT' | 'ALL_METRICS';

export const MonthlyMatrixReport: React.FC<MonthlyMatrixReportProps> = ({
  itemSummaries,
  branches,
  months,
  selectedMonth,
  onMonthChange,
  onExportExcel,
}) => {
  const [metric, setMetric] = useState<MatrixMetric>('STOCK');

  const formatNumber = (num: number) => new Intl.NumberFormat('vi-VN').format(num || 0);

  const getMetricLabel = () => {
    switch (metric) {
      case 'STOCK':
        return 'Tồn cuối kỳ';
      case 'IN':
        return 'Số lượng Nhập';
      case 'OUT':
        return 'Số lượng Xuất';
      case 'ALL_METRICS':
        return 'Nhập - Xuất - Tồn (Đầy đủ)';
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-teal-100 shadow-xs overflow-hidden">
      {/* Title & Toolbar */}
      <div className="p-4 sm:px-6 border-b border-teal-100 bg-gradient-to-r from-teal-50/60 to-sky-50/50 flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <FileSpreadsheet className="w-5 h-5 text-teal-700" />
            <h2 className="text-base sm:text-lg font-bold text-slate-800">
              BÁO CÁO NHẬP - XUẤT - TỒN THEO THÁNG
            </h2>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Bảng ma trận đối chiếu hàng hóa giữa các chi nhánh và toàn hệ thống CIC
          </p>
        </div>

        {/* Controls: Month dropdown & Metric selection */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Month selector */}
          <div className="flex items-center gap-1.5 bg-white px-3 py-1.5 rounded-xl border border-teal-200 shadow-2xs">
            <Calendar className="w-3.5 h-3.5 text-teal-600" />
            <span className="text-xs font-semibold text-slate-600">Kỳ:</span>
            <select
              value={selectedMonth}
              onChange={(e) => onMonthChange(e.target.value)}
              className="text-xs font-bold text-teal-900 bg-transparent outline-none cursor-pointer"
            >
              {months.map((m) => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
            </select>
          </div>

          {/* Metric selector pills */}
          <div className="flex items-center bg-slate-100 p-1 rounded-xl text-xs font-semibold">
            <button
              onClick={() => setMetric('STOCK')}
              className={`flex items-center gap-1 px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                metric === 'STOCK'
                  ? 'bg-teal-600 text-white shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Archive className="w-3 h-3" />
              <span>Chỉ xem Tồn</span>
            </button>
            <button
              onClick={() => setMetric('IN')}
              className={`flex items-center gap-1 px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                metric === 'IN'
                  ? 'bg-emerald-600 text-white shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <ArrowUpRight className="w-3 h-3" />
              <span>Chỉ xem Nhập</span>
            </button>
            <button
              onClick={() => setMetric('OUT')}
              className={`flex items-center gap-1 px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                metric === 'OUT'
                  ? 'bg-rose-600 text-white shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <ArrowDownRight className="w-3 h-3" />
              <span>Chỉ xem Xuất</span>
            </button>
          </div>

          <button
            onClick={onExportExcel}
            className="px-3 py-1.5 rounded-xl bg-teal-50 hover:bg-teal-100 text-teal-800 text-xs font-bold transition-all border border-teal-200 cursor-pointer shadow-2xs"
          >
            📥 Xuất Excel
          </button>
        </div>
      </div>

      {/* Matrix Table */}
      <div className="overflow-x-auto max-h-[600px] scrollbar-thin scrollbar-thumb-teal-200">
        <table className="w-full text-left border-collapse text-xs sm:text-sm">
          <thead className="bg-[#E0F2F1]/90 text-teal-950 font-bold sticky top-0 z-20 border-b border-teal-200">
            <tr>
              <th className="py-3 px-3 w-10 text-center">STT</th>
              <th className="py-3 px-3 min-w-[110px]">Mã VT</th>
              <th className="py-3 px-4 min-w-[200px]">Tên vật tư</th>
              <th className="py-3 px-2 w-14 text-center">ĐVT</th>
              {branches.map((b) => (
                <th key={b.id} className="py-3 px-3 text-right min-w-[100px]">
                  {b.name}
                </th>
              ))}
              <th className="py-3 px-4 text-right min-w-[120px] bg-teal-100 text-teal-950 font-extrabold">
                Tổng ({getMetricLabel()})
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {itemSummaries.map((item, idx) => {
              const getVal = (branchName: string) => {
                const cell = item.branchBreakdown[branchName] || {
                  beginningStock: 0,
                  inQuantity: 0,
                  outQuantity: 0,
                  endingStock: 0,
                };
                if (metric === 'STOCK') return cell.endingStock;
                if (metric === 'IN') return cell.inQuantity;
                if (metric === 'OUT') return cell.outQuantity;
                return cell.endingStock;
              };

              const getTotal = () => {
                if (metric === 'STOCK') return item.endingStock;
                if (metric === 'IN') return item.inQuantity;
                if (metric === 'OUT') return item.outQuantity;
                return item.endingStock;
              };

              const totalVal = getTotal();

              return (
                <tr key={item.itemCode} className="hover:bg-teal-50/40 transition-colors">
                  <td className="py-2.5 px-3 text-center text-slate-400 font-medium">{idx + 1}</td>
                  <td className="py-2.5 px-3 font-mono font-bold text-teal-900">{item.itemCode}</td>
                  <td className="py-2.5 px-4 font-semibold text-slate-800">{item.itemName}</td>
                  <td className="py-2.5 px-2 text-center text-slate-500">{item.unit}</td>
                  {branches.map((b) => {
                    const val = getVal(b.name);
                    return (
                      <td
                        key={b.id}
                        className={`py-2.5 px-3 text-right font-medium ${
                          val === 0 ? 'text-slate-300' : 'text-slate-700'
                        }`}
                      >
                        {formatNumber(val)}
                      </td>
                    );
                  })}
                  <td
                    className={`py-2.5 px-4 text-right font-extrabold ${
                      metric === 'IN'
                        ? 'text-emerald-700 bg-emerald-50/50'
                        : metric === 'OUT'
                        ? 'text-rose-700 bg-rose-50/50'
                        : 'text-sky-900 bg-sky-50/60'
                    }`}
                  >
                    {formatNumber(totalVal)}
                  </td>
                </tr>
              );
            })}
          </tbody>
          {/* Highlighted Footer Total Row */}
          <tfoot className="bg-[#E0F2F1] text-teal-950 font-extrabold sticky bottom-0 z-20 border-t-2 border-teal-300">
            <tr>
              <td colSpan={4} className="py-3 px-4 text-slate-800 uppercase tracking-wider text-xs sm:text-sm">
                TỔNG HỆ THỐNG ({getMetricLabel()})
              </td>
              {branches.map((b) => {
                const branchTotal = itemSummaries.reduce((sum, item) => {
                  const cell = item.branchBreakdown[b.name] || {
                    beginningStock: 0,
                    inQuantity: 0,
                    outQuantity: 0,
                    endingStock: 0,
                  };
                  if (metric === 'STOCK') return sum + cell.endingStock;
                  if (metric === 'IN') return sum + cell.inQuantity;
                  if (metric === 'OUT') return sum + cell.outQuantity;
                  return sum + cell.endingStock;
                }, 0);

                return (
                  <td key={b.id} className="py-3 px-3 text-right text-slate-800">
                    {formatNumber(branchTotal)}
                  </td>
                );
              })}
              <td
                className={`py-3 px-4 text-right text-base sm:text-lg font-black ${
                  metric === 'IN'
                    ? 'text-emerald-800 bg-emerald-200/80'
                    : metric === 'OUT'
                    ? 'text-rose-800 bg-rose-200/80'
                    : 'text-sky-950 bg-sky-200/80'
                }`}
              >
                {formatNumber(
                  itemSummaries.reduce((sum, item) => {
                    if (metric === 'STOCK') return sum + item.endingStock;
                    if (metric === 'IN') return sum + item.inQuantity;
                    if (metric === 'OUT') return sum + item.outQuantity;
                    return sum + item.endingStock;
                  }, 0)
                )}
              </td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
};
