import {
  GoogleSheetsConfig,
  InventorySummaryRow,
  BranchSummaryRow,
  InventoryTransaction,
} from '../types/inventory';

export const DEFAULT_GOOGLE_APPS_SCRIPT_URL =
  'https://script.google.com/macros/s/AKfycbzbxUwe6LniwrQZvQcSnODrKPsQ5IXj0EmV3-9FJTbRRORVXxJrEgDsDOp1i_KHvl_sKw/exec';

export const SAMPLE_APPS_SCRIPT_CODE = `/**
 * GOOGLE APPS SCRIPT CHO HỆ THỐNG QUẢN LÝ KHO TEAM CIC
 * Cách cài đặt:
 * 1. Mở Google Sheet mới -> Menu "Tiện ích mở rộng" (Extensions) -> "Apps Script"
 * 2. Xóa code cũ, dán toàn bộ đoạn code này vào.
 * 3. Bấm "Triển khai" (Deploy) -> "Tùy chọn triển khai mới" (New deployment)
 * 4. Chọn loại: "Ứng dụng web" (Web App)
 * 5. Tại "Người có quyền truy cập" (Who has access): Chọn "Bất kỳ ai" (Anyone)
 * 6. Bấm Triển khai và Copy URL dán vào ứng dụng Kho CIC!
 */

function doPost(e) {
  try {
    var data = JSON.parse(e.postData.contents);
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    
    // Ghi dữ liệu Tồn kho
    var sheetStock = ss.getSheetByName("Ton_Kho");
    if (!sheetStock) {
      sheetStock = ss.insertSheet("Ton_Kho");
      sheetStock.appendRow(["Mã VT", "Tên VT", "Nhóm", "ĐVT", "Tồn Đầu", "Tổng Nhập", "Tổng Xuất", "Tồn Cuối", "Tháng Cập Nhật"]);
    }
    
    if (data.items && data.items.length > 0) {
      // Clear data cũ và ghi mới
      if (sheetStock.getLastRow() > 1) {
        sheetStock.getRange(2, 1, sheetStock.getLastRow() - 1, 9).clearContent();
      }
      var rows = data.items.map(function(item) {
        return [
          item.itemCode,
          item.itemName,
          item.category,
          item.unit,
          item.beginningStock,
          item.inQuantity,
          item.outQuantity,
          item.endingStock,
          data.selectedMonth || new Date().toLocaleString("vi-VN")
        ];
      });
      sheetStock.getRange(2, 1, rows.length, 9).setValues(rows);
    }

    // Ghi log giao dịch mới nhất
    var sheetTx = ss.getSheetByName("Nhat_Ky_Giao_Dich");
    if (!sheetTx) {
      sheetTx = ss.insertSheet("Nhat_Ky_Giao_Dich");
      sheetTx.appendRow(["Mã GD", "Loại", "Tháng", "Ngày", "Chi Nhánh", "Mã VT", "Tên VT", "Số Lượng", "Ghi Chú", "Thời Gian Đẩy"]);
    }
    
    if (data.latestTransaction) {
      var tx = data.latestTransaction;
      sheetTx.appendRow([
        tx.id,
        tx.type === "IN" ? "NHẬP KHO" : "XUẤT KHO",
        tx.month,
        tx.date,
        tx.branchId,
        tx.itemCode,
        tx.itemName,
        tx.quantity,
        tx.note || "",
        new Date().toLocaleString("vi-VN")
      ]);
    }
    
    return ContentService.createTextOutput(JSON.stringify({ status: "success", message: "Đồng bộ thành công!" }))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({ status: "error", message: err.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}
`;

export interface SyncPayload {
  selectedMonth: string;
  items: InventorySummaryRow[];
  branches: BranchSummaryRow[];
  latestTransaction?: InventoryTransaction;
  systemSummary?: {
    totalIn: number;
    totalOut: number;
    totalEnding: number;
    itemCount: number;
  };
}

export async function syncToGoogleSheets(
  config: GoogleSheetsConfig,
  payload: SyncPayload
): Promise<{ success: boolean; message: string }> {
  if (!config.webhookUrl || !config.webhookUrl.trim()) {
    return {
      success: false,
      message: 'Chưa cấu hình Google Apps Script Webhook URL. Hãy bấm vào "Cấu hình Google Sheets" để thiết lập.',
    };
  }

  try {
    // Mode no-cors with text/plain is standard for browser requests to Google Apps Script Web Apps to prevent CORS preflight block
    await fetch(config.webhookUrl.trim(), {
      method: 'POST',
      mode: 'no-cors',
      headers: {
        'Content-Type': 'text/plain;charset=utf-8',
      },
      body: JSON.stringify(payload),
    });

    return {
      success: true,
      message: `Đã gửi dữ liệu đồng bộ sang Google Sheets (${new Date().toLocaleTimeString('vi-VN')})!`,
    };
  } catch (error: any) {
    console.error('Lỗi đồng bộ Google Sheets:', error);
    return {
      success: false,
      message: `Không thể kết nối đến Google Sheets: ${error.message || 'Lỗi mạng'}`,
    };
  }
}

export async function syncInventoryToGoogleSheets(
  config: GoogleSheetsConfig,
  fullEngine: Record<string, any>,
  transactions: InventoryTransaction[],
  branches: any[],
  months: string[]
): Promise<{ success: boolean; message: string }> {
  const latestMonth = months[months.length - 1] || 'T07/2026';
  const monthData = fullEngine[latestMonth] || { itemSummaries: [], branchSummaries: [] };
  const latestTx = transactions.length > 0 ? transactions[0] : undefined;

  return syncToGoogleSheets(config, {
    selectedMonth: latestMonth,
    items: monthData.itemSummaries || [],
    branches: monthData.branchSummaries || [],
    latestTransaction: latestTx,
  });
}

