export type TransactionType = 'IN' | 'OUT';

export interface Branch {
  id: string;
  name: string;
  code: string;
  region: 'Bắc' | 'Trung' | 'Nam' | 'Tây Nam Bộ';
  address?: string;
  isDefault?: boolean;
}

export interface InventoryItem {
  id: string;
  code: string;
  name: string;
  unit: string;
  category: string;
  minStock?: number;
  status: 'active' | 'inactive';
  description?: string;
}

export interface InventoryTransaction {
  id: string;
  type: TransactionType; // 'IN' = Nhập kho, 'OUT' = Xuất kho
  month: string;         // e.g. "T07/2026"
  date: string;          // e.g. "2026-07-15"
  branchId: string;      // Branch name or code, e.g. "Hà Nội"
  itemCode: string;
  itemName: string;
  unit: string;
  quantity: number;
  note?: string;
  createdAt: number;
}

// Initial balances for month N (if manual override exists, else calculated from previous month)
export interface BeginningBalance {
  month: string;
  branchId: string;
  itemCode: string;
  quantity: number;
}

export interface InventorySummaryRow {
  itemCode: string;
  itemName: string;
  category: string;
  unit: string;
  beginningStock: number;
  inQuantity: number;
  outQuantity: number;
  endingStock: number;
  // Breakdown by branch
  branchBreakdown: Record<string, {
    beginningStock: number;
    inQuantity: number;
    outQuantity: number;
    endingStock: number;
  }>;
}

export interface BranchSummaryRow {
  branchId: string;
  branchName: string;
  region: string;
  beginningStock: number;
  inQuantity: number;
  outQuantity: number;
  endingStock: number;
  stockPercentage: number;
}

export interface MonthSummary {
  month: string;
  beginningStock: number;
  inQuantity: number;
  outQuantity: number;
  endingStock: number;
}

export interface GoogleSheetsConfig {
  webhookUrl: string;
  sheetName: string;
  autoSync: boolean;
  lastSyncedAt?: string;
}
