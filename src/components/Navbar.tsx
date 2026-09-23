import React from 'react';
import {
  LayoutDashboard,
  Boxes,
  ArrowUpRight,
  ArrowDownRight,
  FileSpreadsheet,
  LineChart,
  Settings,
} from 'lucide-react';

export type ActiveTab =
  | 'dashboard'
  | 'inventory'
  | 'inward'
  | 'outward'
  | 'reports'
  | 'analytics'
  | 'catalog';

export type TabId = ActiveTab;


interface NavbarProps {
  activeTab: ActiveTab;
  onTabChange: (tab: ActiveTab) => void;
  inCount?: number;
  outCount?: number;
  itemCount?: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  onTabChange,
  inCount = 0,
  outCount = 0,
  itemCount = 0,
}) => {
  const navItems: { id: ActiveTab; label: string; icon: React.ReactNode; badge?: number }[] = [
    {
      id: 'dashboard',
      label: 'Tổng quan',
      icon: <LayoutDashboard className="w-4 h-4" />,
    },
    {
      id: 'inventory',
      label: 'Hàng tồn kho',
      icon: <Boxes className="w-4 h-4" />,
      badge: itemCount,
    },
    {
      id: 'inward',
      label: 'Nhập kho',
      icon: <ArrowUpRight className="w-4 h-4 text-emerald-500" />,
      badge: inCount,
    },
    {
      id: 'outward',
      label: 'Xuất kho',
      icon: <ArrowDownRight className="w-4 h-4 text-rose-500" />,
      badge: outCount,
    },
    {
      id: 'reports',
      label: 'Báo cáo',
      icon: <FileSpreadsheet className="w-4 h-4 text-sky-500" />,
    },
    {
      id: 'analytics',
      label: 'Phân tích',
      icon: <LineChart className="w-4 h-4 text-indigo-500" />,
    },
    {
      id: 'catalog',
      label: 'Danh mục vật tư',
      icon: <Settings className="w-4 h-4 text-slate-500" />,
    },
  ];

  return (
    <nav className="bg-white border-b border-teal-100 shadow-xs sticky top-0 z-30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center space-x-1 overflow-x-auto py-2 scrollbar-thin scrollbar-thumb-teal-200">
          {navItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onTabChange(item.id)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-semibold whitespace-nowrap transition-all duration-150 cursor-pointer ${
                  isActive
                    ? 'bg-gradient-to-r from-teal-500 to-sky-500 text-white shadow-sm shadow-teal-500/20'
                    : 'text-slate-600 hover:text-teal-700 hover:bg-teal-50/70'
                }`}
              >
                <span className={isActive ? 'text-white' : ''}>{item.icon}</span>
                <span>{item.label}</span>
                {item.badge !== undefined && item.badge > 0 && (
                  <span
                    className={`ml-0.5 px-1.5 py-0.2 rounded-full text-[11px] font-bold ${
                      isActive ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </nav>
  );
};
