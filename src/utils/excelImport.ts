import * as XLSX from 'xlsx';
import { InventoryItem, InventoryTransaction, BeginningBalance } from '../types/inventory';

export interface ImportResult {
  success: boolean;
  message: string;
  itemsAdded: number;
  transactionsAdded: number;
  balancesAdded: number;
  newItems: InventoryItem[];
  newTransactions: InventoryTransaction[];
  newBalances: BeginningBalance[];
}

// Clean and normalize column header for flexible matching
function normalizeHeader(h: string): string {
  return h
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]/g, '');
}

export async function parseExcelOrCsvFile(
  file: File,
  existingItems: InventoryItem[],
  existingBranches: string[]
): Promise<ImportResult> {
  return new Promise((resolve) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const buffer = e.target?.result;
        const workbook = XLSX.read(buffer, { type: 'binary' });

        const newItems: InventoryItem[] = [];
        const newTransactions: InventoryTransaction[] = [];
        const newBalances: BeginningBalance[] = [];

        // Loop through all sheets
        workbook.SheetNames.forEach((sheetName) => {
          const sheet = workbook.Sheets[sheetName];
          const rawRows = XLSX.utils.sheet_to_json<Record<string, any>>(sheet, { defval: '' });

          if (!rawRows || rawRows.length === 0) return;

          rawRows.forEach((row, idx) => {
            // Normalize keys of this row
            const normRow: Record<string, any> = {};
            Object.keys(row).forEach((k) => {
              normRow[normalizeHeader(k)] = row[k];
            });

            // Check if row is a Transaction
            const typeStr = String(normRow['loai'] || normRow['loaigiaodich'] || normRow['type'] || '').toUpperCase();
            const qty = Number(normRow['soluong'] || normRow['sl'] || normRow['quantity'] || 0);
            const itemCode = String(normRow['mavait'] || normRow['mavattu'] || normRow['code'] || normRow['ma'] || '').trim();
            const itemName = String(normRow['tenvattu'] || normRow['tenhang'] || normRow['name'] || '').trim();
            const branch = String(normRow['chinhanh'] || normRow['kho'] || normRow['branch'] || '').trim();
            const month = String(normRow['thang'] || normRow['month'] || '').trim();
            const date = String(normRow['ngay'] || normRow['ngaynhap'] || normRow['ngayxuat'] || normRow['date'] || '').trim();
            const unit = String(normRow['donvitinh'] || normRow['dvt'] || normRow['unit'] || 'Cái').trim();
            const category = String(normRow['nhomvattu'] || normRow['nhom'] || normRow['category'] || 'Chung').trim();
            const note = String(normRow['ghichu'] || normRow['note'] || '').trim();

            // If item has code & name but no transaction type, maybe it's an Item catalog row
            if (itemCode && itemName && !typeStr && !qty) {
              if (!newItems.find((i) => i.code === itemCode) && !existingItems.find((i) => i.code === itemCode)) {
                newItems.push({
                  id: `imp-item-${Date.now()}-${idx}`,
                  code: itemCode,
                  name: itemName,
                  unit: unit || 'Cái',
                  category: category || 'Chung',
                  minStock: 20,
                  status: 'active',
                });
              }
              return;
            }

            // If it has type 'IN' or 'NHAP' or 'XUAT' or 'OUT'
            if (itemCode && qty > 0 && (typeStr.includes('NHAP') || typeStr.includes('IN') || typeStr.includes('XUAT') || typeStr.includes('OUT'))) {
              const isOut = typeStr.includes('XUAT') || typeStr.includes('OUT');
              const txType = isOut ? 'OUT' : 'IN';

              // Ensure item exists in newItems or existingItems
              let matchedItem = existingItems.find((i) => i.code.toLowerCase() === itemCode.toLowerCase());
              if (!matchedItem && !newItems.find((i) => i.code.toLowerCase() === itemCode.toLowerCase())) {
                newItems.push({
                  id: `imp-item-${Date.now()}-${idx}`,
                  code: itemCode,
                  name: itemName || itemCode,
                  unit: unit || 'Cái',
                  category: category || 'Chung',
                  minStock: 20,
                  status: 'active',
                });
              }

              // Format date nicely
              let validDate = date;
              if (!validDate || validDate.length < 5) {
                validDate = new Date().toISOString().slice(0, 10);
              }

              // Format month nicely if missing
              let validMonth = month;
              if (!validMonth) {
                const parts = validDate.split('-');
                if (parts.length === 3) {
                  validMonth = `T${parts[1]}/${parts[0]}`;
                } else {
                  validMonth = 'T07/2026';
                }
              }

              // Match branch
              let matchedBranch = existingBranches.find((b) => b.toLowerCase() === branch.toLowerCase()) || branch || 'Hà Nội';

              newTransactions.push({
                id: `imp-tx-${Date.now()}-${idx}`,
                type: txType,
                month: validMonth,
                date: validDate,
                branchId: matchedBranch,
                itemCode: itemCode,
                itemName: itemName || matchedItem?.name || itemCode,
                unit: unit || matchedItem?.unit || 'Cái',
                quantity: qty,
                note: note || `Nhập từ file Excel: ${file.name}`,
                createdAt: Date.now() + idx,
              });
            } else if (itemCode && qty > 0 && (normRow['tondau'] || normRow['dauthang'] || normRow['beginning'])) {
              // Beginning balance row
              newBalances.push({
                month: month || 'T06/2026',
                branchId: branch || 'Hà Nội',
                itemCode: itemCode,
                quantity: qty,
              });
            }
          });
        });

        if (newItems.length === 0 && newTransactions.length === 0 && newBalances.length === 0) {
          resolve({
            success: false,
            message: 'Không tìm thấy dữ liệu hợp lệ trong file. Hãy kiểm tra các cột tiêu đề (Mã vật tư, Tên, Số lượng, Loại giao dịch).',
            itemsAdded: 0,
            transactionsAdded: 0,
            balancesAdded: 0,
            newItems: [],
            newTransactions: [],
            newBalances: [],
          });
          return;
        }

        resolve({
          success: true,
          message: `Đọc file thành công! Tìm thấy: ${newItems.length} vật tư mới, ${newTransactions.length} giao dịch nhập/xuất, ${newBalances.length} số dư đầu kỳ.`,
          itemsAdded: newItems.length,
          transactionsAdded: newTransactions.length,
          balancesAdded: newBalances.length,
          newItems,
          newTransactions,
          newBalances,
        });
      } catch (err: any) {
        resolve({
          success: false,
          message: `Lỗi xử lý file Excel: ${err.message || 'Định dạng file không hỗ trợ'}`,
          itemsAdded: 0,
          transactionsAdded: 0,
          balancesAdded: 0,
          newItems: [],
          newTransactions: [],
          newBalances: [],
        });
      }
    };

    reader.onerror = () => {
      resolve({
        success: false,
        message: 'Lỗi khi đọc file từ thiết bị.',
        itemsAdded: 0,
        transactionsAdded: 0,
        balancesAdded: 0,
        newItems: [],
        newTransactions: [],
        newBalances: [],
      });
    };

    reader.readAsBinaryString(file);
  });
}
