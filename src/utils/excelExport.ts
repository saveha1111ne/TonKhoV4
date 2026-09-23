import * as XLSX from 'xlsx';
import {
  InventoryItem,
  Branch,
  InventoryTransaction,
  InventorySummaryRow,
  BranchSummaryRow,
  MonthSummary,
} from '../types/inventory';

export interface ExcelExportPayload {
  selectedMonth: string;
  itemSummaries: InventorySummaryRow[];
  branchSummaries: BranchSummaryRow[];
  transactions: InventoryTransaction[];
  branches: Branch[];
  items: InventoryItem[];
  monthlyTrends: MonthSummary[];
  kpi: {
    totalBeginning: number;
    totalIn: number;
    totalOut: number;
    totalEnding: number;
    branchCount: number;
    itemCount: number;
  };
}

export function exportInventoryToExcel(payload: ExcelExportPayload): void {
  const {
    selectedMonth,
    itemSummaries,
    branchSummaries,
    transactions,
    branches,
    monthlyTrends,
    kpi,
  } = payload;

  const wb = XLSX.utils.book_new();

  // 1. SHEET TỔNG QUAN
  const overviewData = [
    ['HỆ THỐNG QUẢN LÝ HÀNG TỒN KHO TEAM CIC'],
    ['BÁO CÁO TỔNG QUAN NHẬP - XUẤT - TỒN'],
    [`Tháng báo cáo: ${selectedMonth}`],
    [`Thời gian xuất: ${new Date().toLocaleString('vi-VN')}`],
    ['Version: Made by Ha Nhung logistic | Hotline: 0901601600'],
    [],
    ['CHỈ SỐ KPI CHÍNH', 'GIÁ TRỊ', 'ĐƠN VỊ'],
    ['Tổng Tồn Đầu Kỳ', kpi.totalBeginning, 'Sản phẩm'],
    ['Tổng Nhập Trong Kỳ', kpi.totalIn, 'Sản phẩm'],
    ['Tổng Xuất Trong Kỳ', kpi.totalOut, 'Sản phẩm'],
    ['Tổng Tồn Cuối Kỳ', kpi.totalEnding, 'Sản phẩm'],
    ['Số Chi Nhánh Quản Lý', kpi.branchCount, 'Chi nhánh'],
    ['Số Mã Vật Tư', kpi.itemCount, 'Mã vật tư'],
    [],
    ['BẢNG TÓM TẮT THEO VẬT TƯ'],
    ['STT', 'Mã Vật Tư', 'Tên Vật Tư', 'Nhóm', 'ĐVT', 'Tồn Đầu', 'Tổng Nhập', 'Tổng Xuất', 'Tồn Cuối'],
    ...itemSummaries.map((item, idx) => [
      idx + 1,
      item.itemCode,
      item.itemName,
      item.category,
      item.unit,
      item.beginningStock,
      item.inQuantity,
      item.outQuantity,
      item.endingStock,
    ]),
    [
      'TỔNG CỘNG',
      '',
      '',
      '',
      '',
      kpi.totalBeginning,
      kpi.totalIn,
      kpi.totalOut,
      kpi.totalEnding,
    ],
  ];
  const wsOverview = XLSX.utils.aoa_to_sheet(overviewData);
  XLSX.utils.book_append_sheet(wb, wsOverview, '1. Tổng quan');

  // 2. SHEET NHẬP KHO
  const inTransactions = transactions.filter((t) => t.type === 'IN' && (t.month === selectedMonth || !selectedMonth));
  const inData = [
    ['DANH SÁCH GIAO DỊCH NHẬP KHO'],
    [`Tháng: ${selectedMonth || 'Tất cả các tháng'}`],
    [],
    ['STT', 'Mã Giao Dịch', 'Tháng', 'Ngày Nhập', 'Chi Nhánh', 'Mã Vật Tư', 'Tên Vật Tư', 'ĐVT', 'Số Lượng', 'Ghi Chú'],
    ...inTransactions.map((t, idx) => [
      idx + 1,
      t.id,
      t.month,
      t.date,
      t.branchId,
      t.itemCode,
      t.itemName,
      t.unit,
      t.quantity,
      t.note || '',
    ]),
    [
      'TỔNG CỘNG',
      '',
      '',
      '',
      '',
      '',
      '',
      '',
      inTransactions.reduce((sum, t) => sum + (Number(t.quantity) || 0), 0),
      '',
    ],
  ];
  const wsIn = XLSX.utils.aoa_to_sheet(inData);
  XLSX.utils.book_append_sheet(wb, wsIn, '2. Nhập kho');

  // 3. SHEET XUẤT KHO
  const outTransactions = transactions.filter((t) => t.type === 'OUT' && (t.month === selectedMonth || !selectedMonth));
  const outData = [
    ['DANH SÁCH GIAO DỊCH XUẤT KHO'],
    [`Tháng: ${selectedMonth || 'Tất cả các tháng'}`],
    [],
    ['STT', 'Mã Giao Dịch', 'Tháng', 'Ngày Xuất', 'Chi Nhánh', 'Mã Vật Tư', 'Tên Vật Tư', 'ĐVT', 'Số Lượng', 'Ghi Chú'],
    ...outTransactions.map((t, idx) => [
      idx + 1,
      t.id,
      t.month,
      t.date,
      t.branchId,
      t.itemCode,
      t.itemName,
      t.unit,
      t.quantity,
      t.note || '',
    ]),
    [
      'TỔNG CỘNG',
      '',
      '',
      '',
      '',
      '',
      '',
      '',
      outTransactions.reduce((sum, t) => sum + (Number(t.quantity) || 0), 0),
      '',
    ],
  ];
  const wsOut = XLSX.utils.aoa_to_sheet(outData);
  XLSX.utils.book_append_sheet(wb, wsOut, '3. Xuất kho');

  // 4. SHEET TỒN KHO CHI TIẾT
  const branchHeaders = branches.flatMap((b) => [
    `${b.name} (Đầu)`,
    `${b.name} (Nhập)`,
    `${b.name} (Xuất)`,
    `${b.name} (Cuối)`,
  ]);

  const stockHeaderRow = [
    'STT',
    'Mã Vật Tư',
    'Tên Vật Tư',
    'Nhóm',
    'ĐVT',
    'Tổng Đầu Kỳ',
    'Tổng Nhập',
    'Tổng Xuất',
    'Tổng Tồn Cuối',
    ...branchHeaders,
  ];

  const stockRows = itemSummaries.map((item, idx) => {
    const branchCols = branches.flatMap((b) => {
      const cell = item.branchBreakdown[b.name] || {
        beginningStock: 0,
        inQuantity: 0,
        outQuantity: 0,
        endingStock: 0,
      };
      return [cell.beginningStock, cell.inQuantity, cell.outQuantity, cell.endingStock];
    });

    return [
      idx + 1,
      item.itemCode,
      item.itemName,
      item.category,
      item.unit,
      item.beginningStock,
      item.inQuantity,
      item.outQuantity,
      item.endingStock,
      ...branchCols,
    ];
  });

  const stockData = [
    ['BẢNG TỔNG HỢP NHẬP - XUẤT - TỒN KHO CHI TIẾT TOÀN HỆ THỐNG'],
    [`Tháng: ${selectedMonth}`],
    [],
    stockHeaderRow,
    ...stockRows,
  ];
  const wsStock = XLSX.utils.aoa_to_sheet(stockData);
  XLSX.utils.book_append_sheet(wb, wsStock, '4. Tồn kho');

  // 5. SHEET THEO CHI NHÁNH
  const branchData = [
    ['BÁO CÁO TỒN KHO VÀ TỶ LỆ THEO CHI NHÁNH'],
    [`Tháng: ${selectedMonth}`],
    [],
    ['STT', 'Chi Nhánh', 'Khu Vực', 'Tồn Đầu Kỳ', 'Tổng Nhập', 'Tổng Xuất', 'Tồn Cuối Kỳ', 'Tỷ Trọng Tồn (%)'],
    ...branchSummaries.map((b, idx) => [
      idx + 1,
      b.branchName,
      b.region,
      b.beginningStock,
      b.inQuantity,
      b.outQuantity,
      b.endingStock,
      `${b.stockPercentage.toFixed(1)}%`,
    ]),
    [
      'TỔNG CỘNG',
      'Toàn hệ thống',
      '',
      kpi.totalBeginning,
      kpi.totalIn,
      kpi.totalOut,
      kpi.totalEnding,
      '100.0%',
    ],
  ];
  const wsBranch = XLSX.utils.aoa_to_sheet(branchData);
  XLSX.utils.book_append_sheet(wb, wsBranch, '5. Theo chi nhánh');

  // 6. SHEET THEO THÁNG
  const monthlyData = [
    ['DIỄN BIẾN NHẬP - XUẤT - TỒN THEO CÁC THÁNG'],
    [],
    ['STT', 'Tháng', 'Tồn Đầu Kỳ', 'Tổng Nhập', 'Tổng Xuất', 'Tồn Cuối Kỳ'],
    ...monthlyTrends.map((m, idx) => [
      idx + 1,
      m.month,
      m.beginningStock,
      m.inQuantity,
      m.outQuantity,
      m.endingStock,
    ]),
  ];
  const wsMonthly = XLSX.utils.aoa_to_sheet(monthlyData);
  XLSX.utils.book_append_sheet(wb, wsMonthly, '6. Theo tháng');

  // Generate clean filename
  const cleanMonth = selectedMonth.replace(/[^a-zA-Z0-9]/g, '_');
  const fileName = `Bao_Cao_Ton_Kho_CIC_${cleanMonth}.xlsx`;

  XLSX.writeFile(wb, fileName);
}

export function exportInventoryToCSV(
  selectedMonth: string,
  itemSummaries: InventorySummaryRow[],
  branches: Branch[]
): void {
  const headers = [
    'Mã Vật Tư',
    'Tên Vật Tư',
    'Nhóm Vật Tư',
    'Đơn Vị',
    'Tồn Đầu Kỳ',
    'Tổng Nhập',
    'Tổng Xuất',
    'Tồn Cuối Kỳ',
    ...branches.map((b) => `Tồn tại ${b.name}`),
  ];

  const rows = itemSummaries.map((item) => [
    `"${item.itemCode}"`,
    `"${item.itemName}"`,
    `"${item.category}"`,
    `"${item.unit}"`,
    item.beginningStock,
    item.inQuantity,
    item.outQuantity,
    item.endingStock,
    ...branches.map((b) => item.branchBreakdown[b.name]?.endingStock || 0),
  ]);

  const csvContent =
    '\uFEFF' + // UTF-8 BOM for Excel support
    [headers.join(','), ...rows.map((r) => r.join(','))].join('\r\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  const cleanMonth = selectedMonth.replace(/[^a-zA-Z0-9]/g, '_');
  link.setAttribute('download', `Ton_Kho_CIC_${cleanMonth}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
