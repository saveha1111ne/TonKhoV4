import {
  Branch,
  InventoryItem,
  InventoryTransaction,
  BeginningBalance,
  GoogleSheetsConfig,
} from '../types/inventory';
import {
  DEFAULT_BRANCHES,
  DEFAULT_ITEMS,
  INITIAL_MONTHS,
  SAMPLE_INITIAL_BALANCES,
  SAMPLE_TRANSACTIONS,
} from '../data/sampleData';
import { DEFAULT_GOOGLE_APPS_SCRIPT_URL } from './googleSheetsSync';

const KEYS = {
  BRANCHES: 'cic_inventory_branches_v1',
  ITEMS: 'cic_inventory_items_v1',
  TRANSACTIONS: 'cic_inventory_transactions_v1',
  MONTHS: 'cic_inventory_months_v1',
  INITIAL_BALANCES: 'cic_inventory_initial_balances_v1',
  GOOGLE_SHEETS_CONFIG: 'cic_google_sheets_config_v1',
};

export function loadBranches(): Branch[] {
  try {
    const raw = localStorage.getItem(KEYS.BRANCHES);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error('Error loading branches', e);
  }
  return DEFAULT_BRANCHES;
}

export function saveBranches(branches: Branch[]): void {
  try {
    localStorage.setItem(KEYS.BRANCHES, JSON.stringify(branches));
  } catch (e) {
    console.error('Error saving branches', e);
  }
}

export function loadItems(): InventoryItem[] {
  try {
    const raw = localStorage.getItem(KEYS.ITEMS);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error('Error loading items', e);
  }
  return DEFAULT_ITEMS;
}

export function saveItems(items: InventoryItem[]): void {
  try {
    localStorage.setItem(KEYS.ITEMS, JSON.stringify(items));
  } catch (e) {
    console.error('Error saving items', e);
  }
}

export function loadMonths(): string[] {
  try {
    const raw = localStorage.getItem(KEYS.MONTHS);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error('Error loading months', e);
  }
  return INITIAL_MONTHS;
}

export function saveMonths(months: string[]): void {
  try {
    localStorage.setItem(KEYS.MONTHS, JSON.stringify(months));
  } catch (e) {
    console.error('Error saving months', e);
  }
}

export function loadInitialBalances(): BeginningBalance[] {
  try {
    const raw = localStorage.getItem(KEYS.INITIAL_BALANCES);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error('Error loading initial balances', e);
  }
  return SAMPLE_INITIAL_BALANCES;
}

export function saveInitialBalances(balances: BeginningBalance[]): void {
  try {
    localStorage.setItem(KEYS.INITIAL_BALANCES, JSON.stringify(balances));
  } catch (e) {
    console.error('Error saving initial balances', e);
  }
}

export function loadTransactions(): InventoryTransaction[] {
  try {
    const raw = localStorage.getItem(KEYS.TRANSACTIONS);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error('Error loading transactions', e);
  }
  return SAMPLE_TRANSACTIONS;
}

export function saveTransactions(transactions: InventoryTransaction[]): void {
  try {
    localStorage.setItem(KEYS.TRANSACTIONS, JSON.stringify(transactions));
  } catch (e) {
    console.error('Error saving transactions', e);
  }
}

export const DEFAULT_GOOGLE_SHEETS_CONFIG: GoogleSheetsConfig = {
  webhookUrl: DEFAULT_GOOGLE_APPS_SCRIPT_URL,
  sheetName: 'Kho_CIC',
  autoSync: true,
};

export function loadGoogleSheetsConfig(): GoogleSheetsConfig {
  try {
    const raw = localStorage.getItem(KEYS.GOOGLE_SHEETS_CONFIG);
    if (raw) {
      const parsed: GoogleSheetsConfig = JSON.parse(raw);
      // If user previously had an empty webhookUrl or autoSync false, populate with default official URL
      if (!parsed.webhookUrl) {
        parsed.webhookUrl = DEFAULT_GOOGLE_APPS_SCRIPT_URL;
        parsed.autoSync = true;
      }
      return parsed;
    }
  } catch (e) {
    console.error('Error loading google sheets config', e);
  }
  return { ...DEFAULT_GOOGLE_SHEETS_CONFIG };
}

export function saveGoogleSheetsConfig(config: GoogleSheetsConfig): void {
  try {
    localStorage.setItem(KEYS.GOOGLE_SHEETS_CONFIG, JSON.stringify(config));
  } catch (e) {
    console.error('Error saving google sheets config', e);
  }
}

export function loadAppData() {
  return {
    branches: loadBranches(),
    items: loadItems(),
    months: loadMonths(),
    transactions: loadTransactions(),
    initialBalances: loadInitialBalances(),
    googleSheetsConfig: loadGoogleSheetsConfig(),
  };
}

export function saveAppData(data: {
  branches: Branch[];
  items: InventoryItem[];
  months: string[];
  transactions: InventoryTransaction[];
  initialBalances: BeginningBalance[];
  googleSheetsConfig: GoogleSheetsConfig;
}) {
  saveBranches(data.branches);
  saveItems(data.items);
  saveMonths(data.months);
  saveTransactions(data.transactions);
  saveInitialBalances(data.initialBalances);
  saveGoogleSheetsConfig(data.googleSheetsConfig);
}

export function resetAllDataToDefault(): void {
  localStorage.setItem(KEYS.BRANCHES, JSON.stringify(DEFAULT_BRANCHES));
  localStorage.setItem(KEYS.ITEMS, JSON.stringify(DEFAULT_ITEMS));
  localStorage.setItem(KEYS.MONTHS, JSON.stringify(INITIAL_MONTHS));
  localStorage.setItem(KEYS.INITIAL_BALANCES, JSON.stringify(SAMPLE_INITIAL_BALANCES));
  localStorage.setItem(KEYS.TRANSACTIONS, JSON.stringify(SAMPLE_TRANSACTIONS));
}

export function clearAppData(): void {
  resetAllDataToDefault();
}



export function exportBackupJSON(): string {
  const data = {
    appName: 'HỆ THỐNG QUẢN LÝ HÀNG TỒN KHO TEAM CIC',
    version: 'Made by Ha Nhung logistic | Hotline: 0901601600',
    exportedAt: new Date().toISOString(),
    branches: loadBranches(),
    items: loadItems(),
    months: loadMonths(),
    initialBalances: loadInitialBalances(),
    transactions: loadTransactions(),
  };
  return JSON.stringify(data, null, 2);
}

export function importBackupJSON(jsonStr: string): boolean {
  try {
    const data = JSON.parse(jsonStr);
    if (Array.isArray(data.items) && Array.isArray(data.transactions)) {
      if (data.branches) saveBranches(data.branches);
      if (data.items) saveItems(data.items);
      if (data.months) saveMonths(data.months);
      if (data.initialBalances) saveInitialBalances(data.initialBalances);
      if (data.transactions) saveTransactions(data.transactions);
      return true;
    }
  } catch (e) {
    console.error('Failed to parse backup JSON', e);
  }
  return false;
}
