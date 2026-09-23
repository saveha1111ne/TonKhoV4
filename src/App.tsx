import React, { useState, useMemo, useEffect, useCallback } from 'react';
import {
  Header,
  Navbar,
  TabId,
  KpiCards,
  QuickActions,
  FilterBar,
  DataTypeFilter,
  ChartsSection,
} from './components';
import { InventoryTable } from './components/InventoryTable';
import { MonthlyMatrixReport } from './components/MonthlyMatrixReport';
import { TransactionsTable } from './components/TransactionsTable';
import { ItemsManager } from './components/ItemsManager';
import { TransactionModal } from './components/TransactionModal';
import { ItemModal } from './components/ItemModal';
import { MonthModal } from './components/MonthModal';
import { BranchModal } from './components/BranchModal';
import { GoogleSheetsModal } from './components/GoogleSheetsModal';
import { ExcelImportModal } from './components/ExcelImportModal';
import { ConfirmModal } from './components/ConfirmModal';
import { Toast, ToastMessage } from './components/Toast';

import {
  Branch,
  InventoryItem,
  InventoryTransaction,
  BeginningBalance,
  GoogleSheetsConfig,
  TransactionType,
} from './types/inventory';
import {
  loadAppData,
  saveAppData,
  clearAppData,
  exportBackupJSON,
  DEFAULT_GOOGLE_SHEETS_CONFIG,
} from './utils/storage';
import {
  calculateFullInventory,
  calculateKPIs,
  getNextMonthSuggestion,
} from './utils/calculations';
import { exportInventoryToExcel, exportInventoryToCSV } from './utils/excelExport';
import { syncInventoryToGoogleSheets } from './utils/googleSheetsSync';
import { RefreshCw, Download, FileCode, CheckCircle2 } from 'lucide-react';

export function App() {
  // --- Persistent State ---
  const [dataLoaded, setDataLoaded] = useState(false);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [months, setMonths] = useState<string[]>([]);
  const [transactions, setTransactions] = useState<InventoryTransaction[]>([]);
  const [initialBalances, setInitialBalances] = useState<BeginningBalance[]>([]);
  const [googleSheetsConfig, setGoogleSheetsConfig] = useState<GoogleSheetsConfig>({
    ...DEFAULT_GOOGLE_SHEETS_CONFIG,
  });


  // --- UI & Filter State ---
  const [activeTab, setActiveTab] = useState<TabId>('dashboard');
  const [selectedMonth, setSelectedMonth] = useState<string>('T07/2026');
  const [selectedBranch, setSelectedBranch] = useState<string>('ALL');
  const [dataType, setDataType] = useState<DataTypeFilter>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');

  // --- Modals State ---
  const [txModal, setTxModal] = useState<{
    isOpen: boolean;
    type: TransactionType;
    editingTx?: InventoryTransaction | null;
  }>({ isOpen: false, type: 'IN', editingTx: null });

  const [itemModal, setItemModal] = useState<{
    isOpen: boolean;
    editingItem?: InventoryItem | null;
  }>({ isOpen: false, editingItem: null });

  const [isMonthModalOpen, setIsMonthModalOpen] = useState(false);
  const [isBranchModalOpen, setIsBranchModalOpen] = useState(false);
  const [isSheetsModalOpen, setIsSheetsModalOpen] = useState(false);
  const [isExcelImportModalOpen, setIsExcelImportModalOpen] = useState(false);

  // --- Confirmation Dialog ---
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
  }>({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => {},
  });

  // --- Toast Notifications ---
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const addToast = (type: 'success' | 'error' | 'info', message: string) => {
    const id = 'toast-' + Date.now() + Math.random().toString(36).slice(2, 6);
    setToasts((prev) => [...prev, { id, type, message }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3800);
  };

  const dismissToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // --- Sync State ---
  const [isSyncingSheets, setIsSyncingSheets] = useState(false);
  const [lastSyncMessage, setLastSyncMessage] = useState<string>('');

  // 1. Load initial data on mount
  useEffect(() => {
    const loaded = loadAppData();
    setBranches(loaded.branches);
    setItems(loaded.items);
    setMonths(loaded.months);
    setTransactions(loaded.transactions);
    setInitialBalances(loaded.initialBalances);
    setGoogleSheetsConfig(loaded.googleSheetsConfig);

    if (loaded.months.length > 0) {
      setSelectedMonth(loaded.months[loaded.months.length - 1]);
    }
    setDataLoaded(true);
  }, []);

  // 2. Persist data changes to LocalStorage
  useEffect(() => {
    if (!dataLoaded) return;
    saveAppData({
      branches,
      items,
      months,
      transactions,
      initialBalances,
      googleSheetsConfig,
    });
  }, [branches, items, months, transactions, initialBalances, googleSheetsConfig, dataLoaded]);

  // 3. Calculation Engine (Dynamic multi-month cascade)
  const fullEngine = useMemo(() => {
    return calculateFullInventory(months, items, branches, transactions, initialBalances);
  }, [months, items, branches, transactions, initialBalances]);

  const currentMonthData = useMemo(() => {
    return (
      fullEngine[selectedMonth] || {
        month: selectedMonth,
        itemSummaries: [],
        branchSummaries: [],
        grandTotal: { beginningStock: 0, inQuantity: 0, outQuantity: 0, endingStock: 0 },
      }
    );
  }, [fullEngine, selectedMonth]);

  // Filtered item summaries based on search and category
  const filteredItemSummaries = useMemo(() => {
    return currentMonthData.itemSummaries.filter((item) => {
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchCode = item.itemCode.toLowerCase().includes(q);
        const matchName = item.itemName.toLowerCase().includes(q);
        const matchCategory = item.category.toLowerCase().includes(q);
        if (!matchCode && !matchName && !matchCategory) return false;
      }
      if (selectedCategory !== 'ALL' && item.category !== selectedCategory) {
        return false;
      }
      return true;
    });
  }, [currentMonthData.itemSummaries, searchQuery, selectedCategory]);

  // Dynamic KPIs for cards
  const kpiData = useMemo(() => {
    return calculateKPIs(currentMonthData, selectedBranch, branches.length, items.length);
  }, [currentMonthData, selectedBranch, branches.length, items.length]);

  // Distinct categories list
  const categories = useMemo(() => {
    const set = new Set<string>();
    items.forEach((i) => {
      if (i.category) set.add(i.category);
    });
    return Array.from(set);
  }, [items]);

  // Stock lookup for transaction modal
  const getCurrentStock = useCallback(
    (month: string, branchName: string, itemCode: string): number => {
      const mData = fullEngine[month];
      if (!mData) return 0;
      const it = mData.itemSummaries.find((i) => i.itemCode === itemCode);
      if (!it) return 0;
      const bData = it.branchBreakdown[branchName];
      return bData ? bData.endingStock : 0;
    },
    [fullEngine]
  );

  // Trigger Google Sheets auto-sync if configured
  const triggerAutoSync = useCallback(
    async (
      updatedTransactions: InventoryTransaction[],
      updatedItems: InventoryItem[],
      updatedBranches: Branch[],
      updatedMonths: string[],
      updatedBalances: BeginningBalance[]
    ) => {
      if (!googleSheetsConfig.webhookUrl || !googleSheetsConfig.autoSync) return;
      const calculated = calculateFullInventory(
        updatedMonths,
        updatedItems,
        updatedBranches,
        updatedTransactions,
        updatedBalances
      );
      const res = await syncInventoryToGoogleSheets(
        googleSheetsConfig,
        calculated,
        updatedTransactions,
        updatedBranches,
        updatedMonths
      );
      if (res.success) {
        setGoogleSheetsConfig((prev) => ({ ...prev, lastSyncedAt: new Date().toISOString() }));
      }
    },
    [googleSheetsConfig]
  );

  // --- Handlers: Transactions ---
  const handleSaveTransaction = (
    txData: Omit<InventoryTransaction, 'id' | 'createdAt'> & { id?: string }
  ) => {
    let updated: InventoryTransaction[];
    if (txData.id) {
      // Edit
      updated = transactions.map((t) =>
        t.id === txData.id ? { ...t, ...txData, id: txData.id } : t
      );
      addToast('success', '✓ Đã cập nhật phiếu giao dịch thành công!');
    } else {
      // Create new
      const newTx: InventoryTransaction = {
        ...txData,
        id: 'tx-' + Date.now() + Math.random().toString(36).slice(2, 5),
        createdAt: Date.now(),
      };
      updated = [newTx, ...transactions];
      addToast(
        'success',
        `✓ Đã thêm phiếu ${txData.type === 'IN' ? 'Nhập' : 'Xuất'} [${txData.itemCode}] thành công!`
      );
    }
    setTransactions(updated);
    triggerAutoSync(updated, items, branches, months, initialBalances);
  };

  const handleDeleteTransaction = (tx: InventoryTransaction) => {
    setConfirmModal({
      isOpen: true,
      title: 'Xác nhận xóa giao dịch',
      message: `Bạn có chắc chắn muốn xóa phiếu ${tx.type === 'IN' ? 'Nhập' : 'Xuất'} hàng cho [${
        tx.itemCode
      }] số lượng ${tx.quantity} ${tx.unit}?`,
      onConfirm: () => {
        const updated = transactions.filter((t) => t.id !== tx.id);
        setTransactions(updated);
        addToast('info', 'Đã xóa phiếu giao dịch.');
        setConfirmModal((prev) => ({ ...prev, isOpen: false }));
        triggerAutoSync(updated, items, branches, months, initialBalances);
      },
    });
  };

  // Quick Inward/Outward from table rows
  const handleQuickInward = (itemCode: string) => {
    const item = items.find((i) => i.code === itemCode);
    setTxModal({
      isOpen: true,
      type: 'IN',
      editingTx: {
        id: '',
        type: 'IN',
        month: selectedMonth,
        date: new Date().toISOString().slice(0, 10),
        branchId: selectedBranch === 'ALL' ? branches[0]?.name || 'Hà Nội' : selectedBranch,
        itemCode,
        itemName: item?.name || '',
        unit: item?.unit || 'Cái',
        quantity: 10,
        createdAt: Date.now(),
      },
    });
  };

  const handleQuickOutward = (itemCode: string) => {
    const item = items.find((i) => i.code === itemCode);
    setTxModal({
      isOpen: true,
      type: 'OUT',
      editingTx: {
        id: '',
        type: 'OUT',
        month: selectedMonth,
        date: new Date().toISOString().slice(0, 10),
        branchId: selectedBranch === 'ALL' ? branches[0]?.name || 'Hà Nội' : selectedBranch,
        itemCode,
        itemName: item?.name || '',
        unit: item?.unit || 'Cái',
        quantity: 5,
        createdAt: Date.now(),
      },
    });
  };


  // --- Handlers: Items ---
  const handleSaveItem = (
    itemData: Omit<InventoryItem, 'id'> & { id?: string },
    initialStocks?: Record<string, number>
  ) => {
    let updatedItems: InventoryItem[];
    let updatedBalances = [...initialBalances];

    if (itemData.id) {
      // Edit existing
      updatedItems = items.map((i) =>
        i.id === itemData.id ? { ...i, ...itemData, id: itemData.id } : i
      );
      addToast('success', `✓ Đã cập nhật thông tin vật tư ${itemData.code}`);
    } else {
      // Create new
      const newItem: InventoryItem = {
        ...itemData,
        id: 'item-' + Date.now(),
      };
      updatedItems = [...items, newItem];

      // Add initial beginning balances for each branch if specified
      if (initialStocks && months.length > 0) {
        const firstMonth = months[0];
        branches.forEach((b) => {
          const qty = initialStocks[b.name] || 0;
          if (qty > 0) {
            updatedBalances.push({
              month: firstMonth,
              branchId: b.name,
              itemCode: newItem.code,
              quantity: qty,
            });
          }
        });
        setInitialBalances(updatedBalances);
      }
      addToast('success', `✓ Đã thêm vật tư mới [${itemData.code}] vào danh mục.`);
    }

    setItems(updatedItems);
    triggerAutoSync(transactions, updatedItems, branches, months, updatedBalances);
  };

  const handleDeleteItem = (item: InventoryItem) => {
    setConfirmModal({
      isOpen: true,
      title: 'Xóa vật tư khỏi danh mục',
      message: `Bạn có chắc chắn muốn xóa [${item.code}] - ${item.name}? Các giao dịch liên quan sẽ không bị xóa nhưng sẽ hiển thị theo mã vật tư.`,
      onConfirm: () => {
        const updated = items.filter((i) => i.id !== item.id);
        setItems(updated);
        addToast('info', `Đã xóa vật tư ${item.code}`);
        setConfirmModal((prev) => ({ ...prev, isOpen: false }));
        triggerAutoSync(transactions, updated, branches, months, initialBalances);
      },
    });
  };

  // --- Handlers: Months ---
  const handleAddMonth = (newMonth: string) => {
    const updated = [...months, newMonth];
    setMonths(updated);
    setSelectedMonth(newMonth);
    addToast(
      'success',
      `✓ Đã tạo tháng quản lý ${newMonth}! Tồn cuối kỳ trước đã được tự động kết chuyển thành Tồn đầu kỳ ${newMonth}.`
    );
    triggerAutoSync(transactions, items, branches, updated, initialBalances);
  };

  // --- Handlers: Branches ---
  const handleAddBranch = (branchData: Omit<Branch, 'id'>) => {
    const newBranch: Branch = {
      ...branchData,
      id: 'branch-' + Date.now(),
    };
    const updated = [...branches, newBranch];
    setBranches(updated);
    addToast('success', `✓ Đã thêm chi nhánh mới: ${newBranch.name}`);
    triggerAutoSync(transactions, items, updated, months, initialBalances);
  };

  const handleDeleteBranch = (branch: Branch) => {
    setConfirmModal({
      isOpen: true,
      title: 'Xác nhận xóa chi nhánh',
      message: `Bạn có chắc chắn muốn xóa chi nhánh ${branch.name}?`,
      onConfirm: () => {
        const updated = branches.filter((b) => b.id !== branch.id);
        setBranches(updated);
        if (selectedBranch === branch.name) setSelectedBranch('ALL');
        addToast('info', `Đã xóa chi nhánh ${branch.name}`);
        setConfirmModal((prev) => ({ ...prev, isOpen: false }));
        triggerAutoSync(transactions, items, updated, months, initialBalances);
      },
    });
  };

  // --- Handlers: Excel/CSV Export & Import ---
  const handleExportExcel = () => {
    exportInventoryToExcel({
      selectedMonth,
      itemSummaries: currentMonthData.itemSummaries,
      branchSummaries: currentMonthData.branchSummaries,
      transactions,
      branches,
      items,
      monthlyTrends: currentMonthData.monthlyTrends || [],
      kpi: kpiData,
    });
    addToast('success', `✓ Đã xuất file Excel đa sheet cho kỳ ${selectedMonth}!`);
  };

  const handleExportCSV = () => {
    exportInventoryToCSV(
      selectedMonth,
      currentMonthData.itemSummaries,
      branches
    );
    addToast('success', `✓ Đã xuất file CSV cho kỳ ${selectedMonth}!`);
  };


  const handleApplyExcelImport = (
    newItems: InventoryItem[],
    newTransactions: InventoryTransaction[],
    newBalances: BeginningBalance[]
  ) => {
    const finalItems = newItems.length > 0 ? newItems : items;
    const finalTx = newTransactions.length > 0 ? newTransactions : transactions;
    const finalBalances = newBalances.length > 0 ? newBalances : initialBalances;
    if (newItems.length > 0) setItems(newItems);
    if (newTransactions.length > 0) setTransactions(newTransactions);
    if (newBalances.length > 0) setInitialBalances(newBalances);
    addToast('success', '✓ Đã nạp thành công dữ liệu từ file Excel/CSV vào hệ thống!');
    triggerAutoSync(finalTx, finalItems, branches, months, finalBalances);
  };

  // --- Handlers: JSON Backup ---
  const handleBackupData = () => {
    const jsonStr = exportBackupJSON();
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `backup_kho_cic_${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    addToast('success', '✓ Đã tải file sao lưu dữ liệu JSON thành công!');
  };

  // --- Handlers: Google Sheets Manual Sync ---
  const handleTriggerSheetsSync = async () => {
    setIsSyncingSheets(true);
    setLastSyncMessage('');
    const res = await syncInventoryToGoogleSheets(
      googleSheetsConfig,
      fullEngine,
      transactions,
      branches,
      months
    );
    setIsSyncingSheets(false);
    if (res.success) {
      setLastSyncMessage('Đồng bộ thành công! Bảng tính Google Sheet đã được cập nhật.');
      setGoogleSheetsConfig((prev) => ({ ...prev, lastSyncedAt: new Date().toISOString() }));
      addToast('success', '✓ Đã đồng bộ dữ liệu lên Google Sheets thành công!');
    } else {
      setLastSyncMessage('Đồng bộ thất bại: ' + res.message);
      addToast('error', 'Lỗi đồng bộ Google Sheets: ' + res.message);
    }
  };

  // --- Handlers: Reset Data ---
  const handleResetData = () => {
    setConfirmModal({
      isOpen: true,
      title: 'Khôi phục dữ liệu mặc định',
      message:
        'Bạn có chắc chắn muốn xóa toàn bộ dữ liệu hiện tại và khôi phục dữ liệu mẫu ban đầu của Team CIC không?',
      onConfirm: () => {
        clearAppData();
        const loaded = loadAppData();
        setBranches(loaded.branches);
        setItems(loaded.items);
        setMonths(loaded.months);
        setTransactions(loaded.transactions);
        setInitialBalances(loaded.initialBalances);
        setGoogleSheetsConfig(loaded.googleSheetsConfig);
        setSelectedMonth(loaded.months[loaded.months.length - 1] || 'T07/2026');
        addToast('info', 'Đã khôi phục dữ liệu mẫu thành công.');
        setConfirmModal((prev) => ({ ...prev, isOpen: false }));
      },
    });
  };

  // Download Single-File HTML
  const handleDownloadSingleFileHtml = () => {
    const link = document.createElement('a');
    link.href = '/inventory-cic.html';
    link.download = 'inventory-cic.html';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    addToast(
      'success',
      '✓ Đang tải file inventory-cic.html! Bạn có thể lưu vào máy và mở trực tiếp bằng bất kỳ trình duyệt nào mà không cần cài đặt gì thêm.'
    );
  };

  return (
    <div className="min-h-screen bg-[#F5FBFA] text-slate-800 flex flex-col justify-between selection:bg-teal-100 selection:text-teal-900">
      <div>
        {/* Top Header */}
        <Header
          onOpenGoogleSheetsModal={() => setIsSheetsModalOpen(true)}
          onOpenExcelImportModal={() => setIsExcelImportModalOpen(true)}
          onResetData={handleResetData}
          onBackupData={handleBackupData}
          onDownloadSingleHtml={handleDownloadSingleFileHtml}
          googleSheetsConfig={googleSheetsConfig}
          isGoogleSynced={Boolean(googleSheetsConfig.webhookUrl && googleSheetsConfig.autoSync)}
          lastSyncTime={googleSheetsConfig.lastSyncedAt}
        />

        {/* Navigation Bar */}
        <Navbar activeTab={activeTab} onTabChange={setActiveTab} />

        {/* Standalone HTML Download Banner */}
        <div className="bg-gradient-to-r from-teal-600 via-sky-600 to-teal-700 text-white py-2 px-4 shadow-xs">
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2 text-xs">
            <div className="flex items-center gap-2 text-center sm:text-left">
              <span className="px-2 py-0.5 rounded-full bg-white/20 font-bold uppercase tracking-wider text-[10px]">
                Single-File HTML
              </span>
              <span>
                Cần chạy offline không cần máy chủ hay tải lên Netlify? Tải ngay file duy nhất{' '}
                <strong>inventory-cic.html</strong>.
              </span>
            </div>
            <button
              onClick={handleDownloadSingleFileHtml}
              className="px-3 py-1 bg-white text-teal-900 hover:bg-teal-50 rounded-lg font-bold text-xs flex items-center gap-1.5 shadow-xs transition-transform active:scale-95 cursor-pointer shrink-0"
            >
              <Download className="w-3.5 h-3.5 text-teal-700" />
              <span>Tải file inventory-cic.html</span>
            </button>
          </div>
        </div>

        {/* Main Content Area */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
          {/* KPI Dashboard Cards */}
          <KpiCards
            totalBeginning={kpiData.totalBeginning}
            totalIn={kpiData.totalIn}
            totalOut={kpiData.totalOut}
            totalEnding={kpiData.totalEnding}
            branchCount={kpiData.branchCount}
            itemCount={kpiData.itemCount}
            selectedMonth={selectedMonth}
          />

          {/* Quick Actions Panel */}
          <QuickActions
            onOpenInwardModal={() =>
              setTxModal({ isOpen: true, type: 'IN', editingTx: null })
            }
            onOpenOutwardModal={() =>
              setTxModal({ isOpen: true, type: 'OUT', editingTx: null })
            }
            onOpenItemModal={() =>
              setItemModal({ isOpen: true, editingItem: null })
            }
            onOpenMonthModal={() => setIsMonthModalOpen(true)}
            onExportExcel={handleExportExcel}
            onExportCSV={handleExportCSV}
            onOpenImportModal={() => setIsExcelImportModalOpen(true)}
            onOpenGoogleSheetsModal={() => setIsSheetsModalOpen(true)}
          />


          {/* Filter Bar */}
          <FilterBar
            months={months}
            selectedMonth={selectedMonth}
            onMonthChange={setSelectedMonth}
            branches={branches}
            selectedBranch={selectedBranch}
            onBranchChange={setSelectedBranch}
            dataType={dataType}
            onDataTypeChange={setDataType}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            categories={categories}
            selectedCategory={selectedCategory}
            onCategoryChange={setSelectedCategory}
          />

          {/* Active Tab View */}
          {activeTab === 'dashboard' && (
            <div className="space-y-6">
              {/* Analytics & Charts section */}
              <ChartsSection
                branchSummaries={currentMonthData.branchSummaries}
                monthlyTrends={currentMonthData.monthlyTrends || []}
                selectedMonth={selectedMonth}
              />


              {/* Main Inventory Table in Dashboard */}
              <InventoryTable
                itemSummaries={filteredItemSummaries}
                branchSummaries={currentMonthData.branchSummaries}
                branches={branches}
                selectedMonth={selectedMonth}
                selectedBranch={selectedBranch}
                dataType={dataType}
                onQuickInward={handleQuickInward}
                onQuickOutward={handleQuickOutward}
              />
            </div>
          )}

          {activeTab === 'inventory' && (
            <div className="space-y-4">
              <InventoryTable
                itemSummaries={filteredItemSummaries}
                branchSummaries={currentMonthData.branchSummaries}
                branches={branches}
                selectedMonth={selectedMonth}
                selectedBranch={selectedBranch}
                dataType={dataType}
                onQuickInward={handleQuickInward}
                onQuickOutward={handleQuickOutward}
              />
            </div>
          )}

          {activeTab === 'inward' && (
            <div className="space-y-4">
              <TransactionsTable
                type="IN"
                transactions={transactions}
                branches={branches}
                months={months}
                selectedMonth={selectedMonth}
                onOpenCreateModal={() =>
                  setTxModal({ isOpen: true, type: 'IN', editingTx: null })
                }
                onEditTransaction={(tx) =>
                  setTxModal({ isOpen: true, type: 'IN', editingTx: tx })
                }
                onDeleteTransaction={handleDeleteTransaction}
              />
            </div>
          )}

          {activeTab === 'outward' && (
            <div className="space-y-4">
              <TransactionsTable
                type="OUT"
                transactions={transactions}
                branches={branches}
                months={months}
                selectedMonth={selectedMonth}
                onOpenCreateModal={() =>
                  setTxModal({ isOpen: true, type: 'OUT', editingTx: null })
                }
                onEditTransaction={(tx) =>
                  setTxModal({ isOpen: true, type: 'OUT', editingTx: tx })
                }
                onDeleteTransaction={handleDeleteTransaction}
              />
            </div>
          )}

          {activeTab === 'reports' && (
            <div className="space-y-4">
              <MonthlyMatrixReport
                itemSummaries={filteredItemSummaries}
                branches={branches}
                months={months}
                selectedMonth={selectedMonth}
                onMonthChange={setSelectedMonth}
                onExportExcel={handleExportExcel}
              />
            </div>
          )}

          {activeTab === 'analytics' && (
            <div className="space-y-6">
              <ChartsSection
                branchSummaries={currentMonthData.branchSummaries}
                monthlyTrends={currentMonthData.monthlyTrends || []}
                selectedMonth={selectedMonth}
              />
            </div>
          )}


          {activeTab === 'catalog' && (
            <div className="space-y-4">
              <ItemsManager
                items={items}
                branches={branches}
                onOpenAddItemModal={() =>
                  setItemModal({ isOpen: true, editingItem: null })
                }
                onEditItem={(item) =>
                  setItemModal({ isOpen: true, editingItem: item })
                }
                onDeleteItem={handleDeleteItem}
                onOpenAddBranchModal={() => setIsBranchModalOpen(true)}
                onDeleteBranch={handleDeleteBranch}
              />
            </div>
          )}
        </main>
      </div>

      {/* FOOTER */}
      <footer className="bg-white border-t border-teal-100 py-6 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-xs text-slate-500 space-y-1.5">
          <p className="font-bold text-slate-800 text-sm">
            HỆ THỐNG QUẢN LÝ HÀNG TỒN KHO TEAM CIC
          </p>
          <p className="text-teal-700 font-semibold">
            Version: Made by Ha Nhung logistic | Hotline: 0901601600
          </p>
          <p className="text-slate-400 text-[11px] pt-1">
            Ứng dụng tối ưu hóa quản lý tồn kho, chuẩn hóa đa chi nhánh • Tự động tính toán & lưu trữ trên trình duyệt
          </p>
        </div>
      </footer>

      {/* --- ALL MODALS --- */}

      {/* 1. Transaction Modal (Inward / Outward) */}
      <TransactionModal
        isOpen={txModal.isOpen}
        type={txModal.type}
        editingTransaction={txModal.editingTx}
        items={items}
        branches={branches}
        months={months}
        selectedMonth={selectedMonth}
        onClose={() => setTxModal({ isOpen: false, type: 'IN', editingTx: null })}
        onSave={handleSaveTransaction}
        getCurrentStock={getCurrentStock}
      />

      {/* 2. Item Modal */}
      <ItemModal
        isOpen={itemModal.isOpen}
        editingItem={itemModal.editingItem}
        categories={categories}
        branches={branches}
        onClose={() => setItemModal({ isOpen: false, editingItem: null })}
        onSave={handleSaveItem}
      />

      {/* 3. Month Modal */}
      <MonthModal
        isOpen={isMonthModalOpen}
        existingMonths={months}
        onClose={() => setIsMonthModalOpen(false)}
        onAddMonth={handleAddMonth}
      />

      {/* 4. Branch Modal */}
      <BranchModal
        isOpen={isBranchModalOpen}
        branches={branches}
        onClose={() => setIsBranchModalOpen(false)}
        onAddBranch={handleAddBranch}
      />

      {/* 5. Google Sheets Sync Modal */}
      <GoogleSheetsModal
        isOpen={isSheetsModalOpen}
        config={googleSheetsConfig}
        onClose={() => setIsSheetsModalOpen(false)}
        onSaveConfig={(cfg) => {
          setGoogleSheetsConfig(cfg);
          addToast('success', '✓ Đã lưu cấu hình Google Sheets!');
        }}
        onTriggerSync={handleTriggerSheetsSync}
        isSyncing={isSyncingSheets}
        lastSyncMessage={lastSyncMessage}
      />

      {/* 6. Excel/CSV Import Modal */}
      <ExcelImportModal
        isOpen={isExcelImportModalOpen}
        existingItems={items}
        branches={branches}
        onClose={() => setIsExcelImportModalOpen(false)}
        onApplyImport={handleApplyExcelImport}
      />

      {/* 7. Confirm Delete Dialog */}
      <ConfirmModal
        isOpen={confirmModal.isOpen}
        title={confirmModal.title}
        message={confirmModal.message}
        onConfirm={confirmModal.onConfirm}
        onCancel={() => setConfirmModal((prev) => ({ ...prev, isOpen: false }))}
      />

      {/* 8. Toast Notifications */}
      <Toast toasts={toasts} onDismiss={dismissToast} />
    </div>
  );
}

export default App;
