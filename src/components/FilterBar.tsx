import React from 'react';
import { Search, Calendar, MapPin, Filter, X } from 'lucide-react';
import { Branch } from '../types/inventory';

export type DataTypeFilter = 'ALL' | 'IN' | 'OUT' | 'STOCK';

interface FilterBarProps {
  searchQuery: string;
  onSearchChange: (q: string) => void;
  months: string[];
  selectedMonth: string;
  onMonthChange: (m: string) => void;
  branches: Branch[];
  selectedBranch: string;
  onBranchChange: (b: string) => void;
  dataType: DataTypeFilter;
  onDataTypeChange: (t: DataTypeFilter) => void;
  categories: string[];
  selectedCategory: string;
  onCategoryChange: (c: string) => void;
}

export const FilterBar: React.FC<FilterBarProps> = ({
  searchQuery,
  onSearchChange,
  months,
  selectedMonth,
  onMonthChange,
  branches,
  selectedBranch,
  onBranchChange,
  dataType,
  onDataTypeChange,
  categories,
  selectedCategory,
  onCategoryChange,
}) => {
  const hasActiveFilters =
    searchQuery.trim() !== '' ||
    selectedBranch !== 'ALL' ||
    dataType !== 'ALL' ||
    selectedCategory !== 'ALL';

  const resetFilters = () => {
    onSearchChange('');
    onBranchChange('ALL');
    onDataTypeChange('ALL');
    onCategoryChange('ALL');
  };

  return (
    <div className="bg-white rounded-2xl p-4 border border-teal-100/90 shadow-xs">
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
        {/* Search Input */}
        <div className="relative flex-1 min-w-[240px]">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
            <Search className="w-4 h-4 text-teal-600" />
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="🔍 Tìm kiếm mã vật tư, tên vật tư, nhóm hàng..."
            className="w-full pl-10 pr-9 py-2 rounded-xl border border-slate-200 focus:border-teal-500 focus:ring-2 focus:ring-teal-200 outline-none text-sm transition-all bg-[#F5FBFA]/60"
          />
          {searchQuery && (
            <button
              onClick={() => onSearchChange('')}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Filter Dropdowns */}
        <div className="flex flex-wrap items-center gap-2 sm:gap-2.5">
          {/* Month Selector */}
          <div className="flex items-center gap-1 bg-[#F5FBFA] px-2.5 py-1.5 rounded-xl border border-teal-200">
            <Calendar className="w-3.5 h-3.5 text-teal-700" />
            <span className="text-xs font-semibold text-slate-600 mr-1">Tháng:</span>
            <select
              value={selectedMonth}
              onChange={(e) => onMonthChange(e.target.value)}
              className="bg-transparent text-xs font-bold text-teal-900 outline-none cursor-pointer pr-1"
            >
              {months.map((m) => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
            </select>
          </div>

          {/* Branch Filter */}
          <div className="flex items-center gap-1 bg-[#F5FBFA] px-2.5 py-1.5 rounded-xl border border-teal-200">
            <MapPin className="w-3.5 h-3.5 text-teal-700" />
            <span className="text-xs font-semibold text-slate-600 mr-1">Chi nhánh:</span>
            <select
              value={selectedBranch}
              onChange={(e) => onBranchChange(e.target.value)}
              className="bg-transparent text-xs font-bold text-teal-900 outline-none cursor-pointer pr-1"
            >
              <option value="ALL">Tất cả chi nhánh ({branches.length})</option>
              {branches.map((b) => (
                <option key={b.id} value={b.name}>
                  {b.name}
                </option>
              ))}
            </select>
          </div>

          {/* Data Type Filter */}
          <div className="flex items-center gap-1 bg-[#F5FBFA] px-2.5 py-1.5 rounded-xl border border-teal-200">
            <Filter className="w-3.5 h-3.5 text-teal-700" />
            <span className="text-xs font-semibold text-slate-600 mr-1">Dữ liệu:</span>
            <select
              value={dataType}
              onChange={(e) => onDataTypeChange(e.target.value as DataTypeFilter)}
              className="bg-transparent text-xs font-bold text-teal-900 outline-none cursor-pointer pr-1"
            >
              <option value="ALL">Tất cả (Nhập - Xuất - Tồn)</option>
              <option value="IN">Chỉ xem Nhập kho</option>
              <option value="OUT">Chỉ xem Xuất kho</option>
              <option value="STOCK">Chỉ xem Tồn kho</option>
            </select>
          </div>

          {/* Category Filter */}
          {categories.length > 0 && (
            <div className="flex items-center gap-1 bg-[#F5FBFA] px-2.5 py-1.5 rounded-xl border border-teal-200">
              <span className="text-xs font-semibold text-slate-600 mr-1">Nhóm:</span>
              <select
                value={selectedCategory}
                onChange={(e) => onCategoryChange(e.target.value)}
                className="bg-transparent text-xs font-bold text-teal-900 outline-none cursor-pointer pr-1"
              >
                <option value="ALL">Tất cả nhóm</option>
                {categories.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Reset Filters button */}
          {hasActiveFilters && (
            <button
              onClick={resetFilters}
              className="px-2.5 py-1.5 rounded-xl bg-slate-100 hover:bg-rose-50 text-slate-600 hover:text-rose-600 text-xs font-medium transition-colors cursor-pointer flex items-center gap-1"
              title="Đặt lại bộ lọc"
            >
              <X className="w-3.5 h-3.5" />
              <span>Xóa lọc</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
