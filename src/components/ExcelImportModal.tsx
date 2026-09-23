import React, { useState, useRef } from 'react';
import { X, Upload, FileSpreadsheet, CheckCircle2, AlertTriangle, Loader2 } from 'lucide-react';
import { InventoryItem, Branch, InventoryTransaction, BeginningBalance } from '../types/inventory';
import { parseExcelOrCsvFile, ImportResult } from '../utils/excelImport';

interface ExcelImportModalProps {
  isOpen: boolean;
  existingItems: InventoryItem[];
  branches: Branch[];
  onClose: () => void;
  onApplyImport: (
    newItems: InventoryItem[],
    newTransactions: InventoryTransaction[],
    newBalances: BeginningBalance[]
  ) => void;
}

export const ExcelImportModal: React.FC<ExcelImportModalProps> = ({
  isOpen,
  existingItems,
  branches,
  onClose,
  onApplyImport,
}) => {
  const [file, setFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<ImportResult | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    setFile(selectedFile);
    setIsLoading(true);
    setResult(null);

    const branchNames = branches.map((b) => b.name);
    const parsed = await parseExcelOrCsvFile(selectedFile, existingItems, branchNames);
    setResult(parsed);
    setIsLoading(false);
  };

  const handleApply = () => {
    if (!result || !result.success) return;
    onApplyImport(result.newItems, result.newTransactions, result.newBalances);
    onClose();
  };

  const handleReset = () => {
    setFile(null);
    setResult(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-teal-100 max-h-[90vh] overflow-y-auto animate-in zoom-in-95">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500 text-white flex items-center justify-center shadow-sm shadow-amber-500/20">
              <Upload className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-slate-800">
                TẢI DỮ LIỆU TỪ FILE EXCEL / CSV
              </h3>
              <p className="text-xs text-slate-500">
                Nạp danh mục vật tư hoặc danh sách giao dịch nhập/xuất tự động
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="mt-4 space-y-4">
          {/* Dropzone */}
          <div
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed border-teal-300 hover:border-teal-500 rounded-2xl p-6 text-center bg-[#F5FBFA] hover:bg-teal-50/50 transition-all cursor-pointer group"
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".xlsx, .xls, .csv"
              onChange={handleFileChange}
              className="hidden"
            />
            <div className="w-12 h-12 rounded-2xl bg-teal-100 text-teal-700 flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform">
              <FileSpreadsheet className="w-6 h-6" />
            </div>
            <p className="text-sm font-bold text-slate-800">
              {file ? file.name : 'Bấm vào đây để chọn file Excel / CSV'}
            </p>
            <p className="text-xs text-slate-500 mt-1">
              Hỗ trợ định dạng: .xlsx, .xls, .csv (Tối đa 15MB)
            </p>
          </div>

          {isLoading && (
            <div className="p-4 rounded-xl bg-teal-50 text-teal-800 text-xs font-semibold flex items-center justify-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin text-teal-600" />
              <span>Đang đọc và phân tích cấu trúc bảng tính...</span>
            </div>
          )}

          {result && (
            <div
              className={`p-4 rounded-xl border text-xs ${
                result.success
                  ? 'bg-emerald-50/80 border-emerald-200 text-emerald-950'
                  : 'bg-rose-50/80 border-rose-200 text-rose-950'
              }`}
            >
              <div className="flex items-start gap-2.5">
                {result.success ? (
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                ) : (
                  <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
                )}
                <div className="space-y-1">
                  <p className="font-bold">{result.message}</p>
                  {result.success && (
                    <ul className="list-disc list-inside text-[11px] text-emerald-800 pt-1 space-y-0.5">
                      <li>Vật tư mới: {result.itemsAdded}</li>
                      <li>Phiếu giao dịch: {result.transactionsAdded}</li>
                      <li>Số dư ban đầu: {result.balancesAdded}</li>
                    </ul>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Guide */}
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-600 space-y-1.5">
            <span className="font-bold text-slate-800 block">💡 Gợi ý cấu trúc cột file Excel:</span>
            <p>
              • <strong>Giao dịch:</strong> Loại (Nhập/Xuất), Tháng (T07/2026), Ngày, Chi nhánh, Mã vật tư, Số lượng, Ghi chú.
            </p>
            <p>
              • <strong>Danh mục:</strong> Mã vật tư, Tên vật tư, ĐVT, Nhóm vật tư.
            </p>
          </div>

          {/* Buttons */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={handleReset}
              className="px-4 py-2.5 rounded-xl border border-slate-300 text-slate-600 hover:bg-slate-100 font-bold text-xs uppercase tracking-wider transition-all cursor-pointer"
            >
              CHỌN LẠI FILE
            </button>
            <button
              type="button"
              disabled={!result || !result.success}
              onClick={handleApply}
              className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs uppercase tracking-wider transition-all cursor-pointer shadow-sm shadow-emerald-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              NẠP VÀO HỆ THỐNG
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
