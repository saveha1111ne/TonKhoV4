import React, { useState } from 'react';
import {
  Boxes,
  Building,
  ChevronDown,
  ChevronRight,
  ArrowUpRight,
  ArrowDownRight,
  AlertTriangle,
  Info,
} from 'lucide-react';
import {
  InventorySummaryRow,
  BranchSummaryRow,
  Branch,
} from '../types/inventory';
import { DataTypeFilter } from './FilterBar';

interface InventoryTableProps {
  itemSummaries: InventorySummaryRow[];
  branchSummaries: BranchSummaryRow[];
  branches: Branch[];
  selectedMonth: string;
  selectedBranch: string;
  dataType: DataTypeFilter;
  onQuickInward: (itemCode: string) => void;
  onQuickOutward: (itemCode: string) => void;
}

export const InventoryTable: React.FC<InventoryTableProps> = ({
  itemSummaries,
  branchSummaries,
  branches,
  selectedMonth,
  selectedBranch,
  dataType,
  onQuickInward,
  onQuickOutward,
}) => {
  const [viewMode, setViewMode] = useState<'item' | 'branch'>('item');
  const [expandedRows, setExpandedRows] = useState<Record<string, boolean>>({});

  const formatNumber = (num: number) => new Intl.NumberFormat('vi-VN').format(num || 0);

  const toggleExpand = (code: string) => {
    setExpandedRows((prev) => ({ ...prev, [code]: !prev[code] }));
  };

  // Grand totals across displayed items
  const grandTotal = itemSummaries.reduce(
    (acc, curr) => {
      if (selectedBranch === 'ALL') {
        acc.beginning += curr.beginningStock;
        acc.in += curr.inQuantity;
        acc.out += curr.outQuantity;
        acc.ending += curr.endingStock;
      } else {
        const b = curr.branchBreakdown[selectedBranch] || {
          beginningStock: 0,
          inQuantity: 0,
          outQuantity: 0,
          endingStock: 0,
        };
        acc.beginning += b.beginningStock;
        acc.in += b.inQuantity;
        acc.out += b.outQuantity;
        acc.ending += b.endingStock;
      }
      return acc;
    },
    { beginning: 0, in: 0, out: 0, ending: 0 }
  );

  return (
    <div className="bg-white rounded-2xl border border-teal-100 shadow-xs overflow-hidden">
      {/* Header toolbar */}
      <div className="p-4 sm:px-6 border-b border-teal-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-gradient-to-r from-teal-50/50 to-sky-50/40">
        <div>
          <div className="flex items-center gap-2">
            <Boxes className="w-5 h-5 text-teal-700" />
            <h2 className="text-base sm:text-lg font-bold text-slate-800">
              BẢNG TỔNG QUAN NHẬP - XUẤT - TỒN KHO
            </h2>
            <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-teal-100 text-teal-800 border border-teal-200">
              {selectedMonth}
            </span>
            {selectedBranch !== 'ALL' && (
              <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-sky-100 text-sky-800 border border-sky-200">
                Chi nhánh: {selectedBranch}
              </span>
            )}
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Công thức: <strong className="text-teal-700">Tồn cuối = Tồn đầu + Nhập - Xuất</strong> (Tự động cập nhật tức thì)
          </p>
        </div>

        {/* View Mode Switcher */}
        <div className="flex items-center bg-slate-100/90 p-1 rounded-xl border border-slate-200 text-xs font-semibold self-start sm:self-auto">
          <button
            onClick={() => setViewMode('item')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
              viewMode === 'item'
                ? 'bg-white text-teal-800 shadow-xs font-bold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Boxes className="w-3.5 h-3.5" />
            <span>Theo vật tư ({itemSummaries.length})</span>
          </button>
          <button
            onClick={() => setViewMode('branch')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
              viewMode === 'branch'
                ? 'bg-white text-teal-800 shadow-xs font-bold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Building className="w-3.5 h-3.5" />
            <span>Theo chi nhánh ({branchSummaries.length})</span>
          </button>
        </div>
      </div>

      {/* Main Table Content */}
      {viewMode === 'item' ? (
        <div className="overflow-x-auto max-h-[640px] relative scrollbar-thin scrollbar-thumb-teal-200">
          <table className="w-full text-left border-collapse text-xs sm:text-sm">
            <thead className="bg-[#E0F2F1]/80 text-teal-950 font-bold sticky top-0 z-20 shadow-2xs border-b border-teal-200">
              <tr>
                <th className="py-3 px-3 w-10 text-center">STT</th>
                <th className="py-3 px-3 min-w-[120px]">Mã vật tư</th>
                <th className="py-3 px-4 min-w-[220px]">Tên vật tư</th>
                <th className="py-3 px-3 min-w-[100px]">Nhóm</th>
                <th className="py-3 px-2 w-16 text-center">ĐVT</th>
                {(dataType === 'ALL' || dataType === 'STOCK') && (
                  <th className="py-3 px-3 text-right min-w-[90px] text-slate-700 bg-[#E0F2F1]">
                    Tồn đầu
                  </th>
                )}
                {(dataType === 'ALL' || dataType === 'IN') && (
                  <th className="py-3 px-3 text-right min-w-[90px] text-emerald-800 bg-emerald-50/60">
                    Nhập
                  </th>
                )}
                {(dataType === 'ALL' || dataType === 'OUT') && (
                  <th className="py-3 px-3 text-right min-w-[90px] text-rose-800 bg-rose-50/60">
                    Xuất
                  </th>
                )}
                {(dataType === 'ALL' || dataType === 'STOCK') && (
                  <th className="py-3 px-3 text-right min-w-[110px] text-sky-900 bg-sky-100/70 font-extrabold">
                    Tồn cuối
                  </th>
                )}
                <th className="py-3 px-3 text-center min-w-[110px]">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {itemSummaries.length === 0 ? (
                <tr>
                  <td colSpan={10} className="py-12 text-center text-slate-400">
                    <Info className="w-6 h-6 mx-auto mb-2 text-slate-300" />
                    Không tìm thấy vật tư nào phù hợp với bộ lọc.
                  </td>
                </tr>
              ) : (
                itemSummaries.map((item, idx) => {
                  const isExpanded = !!expandedRows[item.itemCode];

                  // If a specific branch is selected in FilterBar, display that branch's stock
                  const displayData =
                    selectedBranch === 'ALL'
                      ? item
                      : {
                          beginningStock: item.branchBreakdown[selectedBranch]?.beginningStock || 0,
                          inQuantity: item.branchBreakdown[selectedBranch]?.inQuantity || 0,
                          outQuantity: item.branchBreakdown[selectedBranch]?.outQuantity || 0,
                          endingStock: item.branchBreakdown[selectedBranch]?.endingStock || 0,
                        };

                  const isLowStock = displayData.endingStock <= 20;

                  return (
                    <React.Fragment key={item.itemCode}>
                      <tr className="hover:bg-teal-50/40 transition-colors group">
                        <td className="py-2.5 px-3 text-center text-slate-400 font-medium">
                          {idx + 1}
                        </td>
                        <td className="py-2.5 px-3 font-mono font-bold text-teal-900 flex items-center gap-1.5">
                          <button
                            onClick={() => toggleExpand(item.itemCode)}
                            className="p-1 rounded hover:bg-teal-100 text-teal-700 cursor-pointer"
                            title="Xem chi tiết từng chi nhánh"
                          >
                            {isExpanded ? (
                              <ChevronDown className="w-3.5 h-3.5" />
                            ) : (
                              <ChevronRight className="w-3.5 h-3.5" />
                            )}
                          </button>
                          <span>{item.itemCode}</span>
                        </td>
                        <td className="py-2.5 px-4 font-semibold text-slate-800">
                          <div className="flex items-center gap-2">
                            <span>{item.itemName}</span>
                            {isLowStock && (
                              <span
                                className="px-1.5 py-0.2 rounded text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-200 flex items-center gap-0.5"
                                title="Cảnh báo tồn kho thấp"
                              >
                                <AlertTriangle className="w-3 h-3 text-amber-600" />
                                Tồn thấp
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="py-2.5 px-3 text-slate-600">
                          <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-700">
                            {item.category}
                          </span>
                        </td>
                        <td className="py-2.5 px-2 text-center text-slate-500 font-medium">
                          {item.unit}
                        </td>

                        {(dataType === 'ALL' || dataType === 'STOCK') && (
                          <td className="py-2.5 px-3 text-right font-medium text-slate-700">
                            {formatNumber(displayData.beginningStock)}
                          </td>
                        )}
                        {(dataType === 'ALL' || dataType === 'IN') && (
                          <td className="py-2.5 px-3 text-right font-semibold text-emerald-700">
                            +{formatNumber(displayData.inQuantity)}
                          </td>
                        )}
                        {(dataType === 'ALL' || dataType === 'OUT') && (
                          <td className="py-2.5 px-3 text-right font-semibold text-rose-700">
                            -{formatNumber(displayData.outQuantity)}
                          </td>
                        )}
                        {(dataType === 'ALL' || dataType === 'STOCK') && (
                          <td className="py-2.5 px-3 text-right font-extrabold text-sky-900 bg-sky-50/50">
                            {formatNumber(displayData.endingStock)}
                          </td>
                        )}

                        {/* Quick action buttons */}
                        <td className="py-2.5 px-3 text-center">
                          <div className="flex items-center justify-center gap-1 opacity-80 group-hover:opacity-100 transition-opacity">
                            <button
                              onClick={() => onQuickInward(item.itemCode)}
                              title={`Nhập nhanh ${item.itemCode}`}
                              className="px-2 py-1 rounded bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-xs font-bold flex items-center gap-0.5 cursor-pointer border border-emerald-200"
                            >
                              <ArrowUpRight className="w-3 h-3 text-emerald-600" />
                              <span>Nhập</span>
                            </button>
                            <button
                              onClick={() => onQuickOutward(item.itemCode)}
                              title={`Xuất nhanh ${item.itemCode}`}
                              className="px-2 py-1 rounded bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-bold flex items-center gap-0.5 cursor-pointer border border-rose-200"
                            >
                              <ArrowDownRight className="w-3 h-3 text-rose-600" />
                              <span>Xuất</span>
                            </button>
                          </div>
                        </td>
                      </tr>

                      {/* Sub-row: Branch breakdown details */}
                      {isExpanded && (
                        <tr className="bg-teal-50/30 border-y border-teal-100">
                          <td colSpan={10} className="p-3 pl-12">
                            <div className="bg-white rounded-xl p-3 border border-teal-200/80 shadow-inner">
                              <div className="text-xs font-bold text-teal-900 mb-2 flex items-center gap-1.5">
                                <Building className="w-3.5 h-3.5 text-teal-600" />
                                <span>
                                  Chi tiết tồn kho theo từng chi nhánh của {item.itemCode} - {item.itemName}:
                                </span>
                              </div>
                              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                                {branches.map((b) => {
                                  const cell = item.branchBreakdown[b.name] || {
                                    beginningStock: 0,
                                    inQuantity: 0,
                                    outQuantity: 0,
                                    endingStock: 0,
                                  };
                                  return (
                                    <div
                                      key={b.id}
                                      className="p-2.5 rounded-lg bg-[#F5FBFA] border border-teal-100"
                                    >
                                      <div className="flex items-center justify-between text-xs font-bold text-slate-800">
                                        <span>{b.name}</span>
                                        <span className="text-[10px] text-teal-600 font-semibold">
                                          {b.region}
                                        </span>
                                      </div>
                                      <div className="mt-1.5 space-y-0.5 text-[11px]">
                                        <div className="flex justify-between text-slate-500">
                                          <span>Đầu kỳ:</span>
                                          <span className="font-semibold">{formatNumber(cell.beginningStock)}</span>
                                        </div>
                                        <div className="flex justify-between text-emerald-700">
                                          <span>Nhập:</span>
                                          <span className="font-bold">+{formatNumber(cell.inQuantity)}</span>
                                        </div>
                                        <div className="flex justify-between text-rose-700">
                                          <span>Xuất:</span>
                                          <span className="font-bold">-{formatNumber(cell.outQuantity)}</span>
                                        </div>
                                        <div className="flex justify-between pt-1 border-t border-slate-200 font-extrabold text-sky-900">
                                          <span>Tồn cuối:</span>
                                          <span className="text-xs">{formatNumber(cell.endingStock)}</span>
                                        </div>
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })
              )}
            </tbody>
            {/* Highlighted Grand Total Row */}
            <tfoot className="bg-[#E0F2F1] text-teal-950 font-extrabold sticky bottom-0 z-20 border-t-2 border-teal-300">
              <tr>
                <td colSpan={5} className="py-3 px-4 text-slate-800 uppercase tracking-wider text-xs sm:text-sm">
                  TỔNG CỘNG TOÀN HỆ THỐNG ({itemSummaries.length} VẬT TƯ)
                </td>
                {(dataType === 'ALL' || dataType === 'STOCK') && (
                  <td className="py-3 px-3 text-right text-slate-800 text-sm">
                    {formatNumber(grandTotal.beginning)}
                  </td>
                )}
                {(dataType === 'ALL' || dataType === 'IN') && (
                  <td className="py-3 px-3 text-right text-emerald-800 text-sm">
                    +{formatNumber(grandTotal.in)}
                  </td>
                )}
                {(dataType === 'ALL' || dataType === 'OUT') && (
                  <td className="py-3 px-3 text-right text-rose-800 text-sm">
                    -{formatNumber(grandTotal.out)}
                  </td>
                )}
                {(dataType === 'ALL' || dataType === 'STOCK') && (
                  <td className="py-3 px-3 text-right text-sky-950 text-base sm:text-lg bg-sky-200/80">
                    {formatNumber(grandTotal.ending)}
                  </td>
                )}
                <td className="py-3 px-3 text-center text-xs text-teal-800 font-semibold">
                  Tự động tính
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      ) : (
        /* View mode: Theo chi nhánh */
        <div className="overflow-x-auto max-h-[640px] relative scrollbar-thin scrollbar-thumb-teal-200">
          <table className="w-full text-left border-collapse text-xs sm:text-sm">
            <thead className="bg-[#E0F2F1]/80 text-teal-950 font-bold sticky top-0 z-20 border-b border-teal-200">
              <tr>
                <th className="py-3 px-3 w-12 text-center">STT</th>
                <th className="py-3 px-4 min-w-[140px]">Chi nhánh</th>
                <th className="py-3 px-3 min-w-[120px]">Khu vực</th>
                <th className="py-3 px-3 text-right min-w-[110px] text-slate-700">Tồn đầu kỳ</th>
                <th className="py-3 px-3 text-right min-w-[110px] text-emerald-800 bg-emerald-50/60">
                  Tổng Nhập
                </th>
                <th className="py-3 px-3 text-right min-w-[110px] text-rose-800 bg-rose-50/60">
                  Tổng Xuất
                </th>
                <th className="py-3 px-3 text-right min-w-[130px] text-sky-950 bg-sky-100/70 font-extrabold">
                  Tồn cuối kỳ
                </th>
                <th className="py-3 px-3 text-right min-w-[120px]">Tỷ trọng tồn (%)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {branchSummaries.map((b, idx) => (
                <tr key={b.branchId} className="hover:bg-teal-50/40 transition-colors">
                  <td className="py-3 px-3 text-center text-slate-400 font-medium">{idx + 1}</td>
                  <td className="py-3 px-4 font-bold text-teal-950 text-sm flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-teal-500"></span>
                    <span>{b.branchName}</span>
                  </td>
                  <td className="py-3 px-3 text-slate-600 font-medium">{b.region}</td>
                  <td className="py-3 px-3 text-right font-medium text-slate-700">
                    {formatNumber(b.beginningStock)}
                  </td>
                  <td className="py-3 px-3 text-right font-semibold text-emerald-700">
                    +{formatNumber(b.inQuantity)}
                  </td>
                  <td className="py-3 px-3 text-right font-semibold text-rose-700">
                    -{formatNumber(b.outQuantity)}
                  </td>
                  <td className="py-3 px-3 text-right font-extrabold text-sky-900 bg-sky-50/50 text-sm">
                    {formatNumber(b.endingStock)}
                  </td>
                  <td className="py-3 px-3 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <div className="w-16 h-2 rounded-full bg-slate-100 overflow-hidden">
                        <div
                          className="h-full bg-teal-500 rounded-full"
                          style={{ width: `${Math.min(b.stockPercentage, 100)}%` }}
                        ></div>
                      </div>
                      <span className="font-bold text-slate-700 text-xs">
                        {b.stockPercentage.toFixed(1)}%
                      </span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
            {/* Highlighted Grand Total Row for Branches */}
            <tfoot className="bg-[#E0F2F1] text-teal-950 font-extrabold sticky bottom-0 z-20 border-t-2 border-teal-300">
              <tr>
                <td colSpan={3} className="py-3.5 px-4 text-slate-800 uppercase tracking-wider text-xs sm:text-sm">
                  TỔNG TOÀN HỆ THỐNG ({branchSummaries.length} CHI NHÁNH)
                </td>
                <td className="py-3.5 px-3 text-right text-slate-800 text-sm">
                  {formatNumber(branchSummaries.reduce((sum, b) => sum + b.beginningStock, 0))}
                </td>
                <td className="py-3.5 px-3 text-right text-emerald-800 text-sm">
                  +{formatNumber(branchSummaries.reduce((sum, b) => sum + b.inQuantity, 0))}
                </td>
                <td className="py-3.5 px-3 text-right text-rose-800 text-sm">
                  -{formatNumber(branchSummaries.reduce((sum, b) => sum + b.outQuantity, 0))}
                </td>
                <td className="py-3.5 px-3 text-right text-sky-950 text-base sm:text-lg bg-sky-200/80">
                  {formatNumber(branchSummaries.reduce((sum, b) => sum + b.endingStock, 0))}
                </td>
                <td className="py-3.5 px-3 text-right font-extrabold text-teal-900">
                  100.0%
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      )}
    </div>
  );
};
