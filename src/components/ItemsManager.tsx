import React, { useState } from 'react';
import {
  Package,
  Plus,
  Edit2,
  Trash2,
  Building2,
  Search,
  CheckCircle2,
  XCircle,
} from 'lucide-react';
import { InventoryItem, Branch } from '../types/inventory';

interface ItemsManagerProps {
  items: InventoryItem[];
  branches: Branch[];
  onOpenAddItemModal: () => void;
  onEditItem: (item: InventoryItem) => void;
  onDeleteItem: (item: InventoryItem) => void;
  onOpenAddBranchModal: () => void;
  onDeleteBranch: (branch: Branch) => void;
}

export const ItemsManager: React.FC<ItemsManagerProps> = ({
  items,
  branches,
  onOpenAddItemModal,
  onEditItem,
  onDeleteItem,
  onOpenAddBranchModal,
  onDeleteBranch,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'items' | 'branches'>('items');
  const [search, setSearch] = useState('');

  const filteredItems = items.filter((i) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      i.code.toLowerCase().includes(q) ||
      i.name.toLowerCase().includes(q) ||
      i.category.toLowerCase().includes(q)
    );
  });

  return (
    <div className="bg-white rounded-2xl border border-teal-100 shadow-xs overflow-hidden">
      {/* Tab Switcher & Header */}
      <div className="p-4 sm:px-6 border-b border-teal-100 bg-gradient-to-r from-teal-50/50 to-sky-50/40 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <div className="flex items-center bg-slate-100 p-1 rounded-xl text-xs font-bold">
            <button
              onClick={() => setActiveSubTab('items')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                activeSubTab === 'items'
                  ? 'bg-teal-600 text-white shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Package className="w-3.5 h-3.5" />
              <span>Danh mục vật tư ({items.length})</span>
            </button>
            <button
              onClick={() => setActiveSubTab('branches')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                activeSubTab === 'branches'
                  ? 'bg-teal-600 text-white shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Building2 className="w-3.5 h-3.5" />
              <span>Danh sách chi nhánh ({branches.length})</span>
            </button>
          </div>
        </div>

        <div>
          {activeSubTab === 'items' ? (
            <button
              onClick={onOpenAddItemModal}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs uppercase tracking-wider transition-all cursor-pointer shadow-sm shadow-teal-500/20"
            >
              <Plus className="w-4 h-4 stroke-[2.5]" />
              <span>+ THÊM VẬT TƯ MỚI</span>
            </button>
          ) : (
            <button
              onClick={onOpenAddBranchModal}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs uppercase tracking-wider transition-all cursor-pointer shadow-sm shadow-amber-500/20"
            >
              <Plus className="w-4 h-4 stroke-[2.5]" />
              <span>+ THÊM CHI NHÁNH MỚI</span>
            </button>
          )}
        </div>
      </div>

      {activeSubTab === 'items' ? (
        <div>
          {/* Search bar */}
          <div className="p-3 bg-[#F5FBFA] border-b border-teal-100">
            <div className="relative max-w-md">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Tìm mã vật tư, tên vật tư, nhóm hàng..."
                className="w-full pl-9 pr-3 py-1.5 rounded-lg border border-slate-200 text-xs outline-none bg-white focus:border-teal-500"
              />
            </div>
          </div>

          {/* Items Table */}
          <div className="overflow-x-auto max-h-[560px] scrollbar-thin scrollbar-thumb-teal-200">
            <table className="w-full text-left border-collapse text-xs sm:text-sm">
              <thead className="bg-[#E0F2F1]/80 text-teal-950 font-bold sticky top-0 z-20 border-b border-teal-200">
                <tr>
                  <th className="py-3 px-3 w-12 text-center">STT</th>
                  <th className="py-3 px-3 min-w-[120px]">Mã vật tư</th>
                  <th className="py-3 px-4 min-w-[220px]">Tên vật tư</th>
                  <th className="py-3 px-3 min-w-[130px]">Nhóm hàng</th>
                  <th className="py-3 px-2 w-16 text-center">ĐVT</th>
                  <th className="py-3 px-3 min-w-[100px] text-center">Trạng thái</th>
                  <th className="py-3 px-4 min-w-[180px]">Mô tả</th>
                  <th className="py-3 px-3 text-center min-w-[100px]">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredItems.map((item, idx) => (
                  <tr key={item.id} className="hover:bg-teal-50/40 transition-colors">
                    <td className="py-2.5 px-3 text-center text-slate-400 font-medium">{idx + 1}</td>
                    <td className="py-2.5 px-3 font-mono font-bold text-teal-900">{item.code}</td>
                    <td className="py-2.5 px-4 font-semibold text-slate-800">{item.name}</td>
                    <td className="py-2.5 px-3 text-slate-600">
                      <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-700">
                        {item.category}
                      </span>
                    </td>
                    <td className="py-2.5 px-2 text-center text-slate-500">{item.unit}</td>
                    <td className="py-2.5 px-3 text-center">
                      {item.status === 'active' ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                          Hoạt động
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold bg-rose-100 text-rose-800">
                          <XCircle className="w-3 h-3 text-rose-600" />
                          Tạm ngừng
                        </span>
                      )}
                    </td>
                    <td className="py-2.5 px-4 text-xs text-slate-500 max-w-xs truncate">
                      {item.description || '—'}
                    </td>
                    <td className="py-2.5 px-3 text-center">
                      <div className="flex items-center justify-center gap-1">
                        <button
                          onClick={() => onEditItem(item)}
                          title="Sửa thông tin"
                          className="p-1.5 rounded-lg hover:bg-teal-100 text-teal-700 transition-colors cursor-pointer"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => onDeleteItem(item)}
                          title="Xóa vật tư này"
                          className="p-1.5 rounded-lg hover:bg-rose-100 text-rose-600 transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* Branches Table */
        <div className="overflow-x-auto max-h-[560px]">
          <table className="w-full text-left border-collapse text-xs sm:text-sm">
            <thead className="bg-[#E0F2F1]/80 text-teal-950 font-bold sticky top-0 z-20 border-b border-teal-200">
              <tr>
                <th className="py-3 px-3 w-12 text-center">STT</th>
                <th className="py-3 px-4 min-w-[150px]">Tên chi nhánh</th>
                <th className="py-3 px-3 min-w-[100px]">Mã viết tắt</th>
                <th className="py-3 px-3 min-w-[120px]">Khu vực</th>
                <th className="py-3 px-4 min-w-[250px]">Địa chỉ kho hàng</th>
                <th className="py-3 px-3 text-center min-w-[100px]">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {branches.map((b, idx) => (
                <tr key={b.id} className="hover:bg-teal-50/40 transition-colors">
                  <td className="py-3 px-3 text-center text-slate-400 font-medium">{idx + 1}</td>
                  <td className="py-3 px-4 font-bold text-teal-950 flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-teal-500"></span>
                    <span>{b.name}</span>
                    {b.isDefault && (
                      <span className="px-1.5 py-0.2 rounded text-[10px] bg-slate-100 text-slate-600">
                        Mặc định
                      </span>
                    )}
                  </td>
                  <td className="py-3 px-3 font-mono font-bold text-slate-800">{b.code}</td>
                  <td className="py-3 px-3 text-slate-700 font-medium">{b.region}</td>
                  <td className="py-3 px-4 text-xs text-slate-500">{b.address || '—'}</td>
                  <td className="py-3 px-3 text-center">
                    {!b.isDefault && (
                      <button
                        onClick={() => onDeleteBranch(b)}
                        title="Xóa chi nhánh"
                        className="p-1.5 rounded-lg hover:bg-rose-100 text-rose-600 transition-colors cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
