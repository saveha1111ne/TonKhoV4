import React, { useState, useEffect } from 'react';
import { X, Layers, Check, Copy, ExternalLink, RefreshCw, Send, AlertCircle, Link } from 'lucide-react';
import { GoogleSheetsConfig } from '../types/inventory';
import { SAMPLE_APPS_SCRIPT_CODE, DEFAULT_GOOGLE_APPS_SCRIPT_URL } from '../utils/googleSheetsSync';

interface GoogleSheetsModalProps {
  isOpen: boolean;
  config: GoogleSheetsConfig;
  onClose: () => void;
  onSaveConfig: (config: GoogleSheetsConfig) => void;
  onTriggerSync: () => Promise<void>;
  isSyncing: boolean;
  lastSyncMessage?: string;
}

export const GoogleSheetsModal: React.FC<GoogleSheetsModalProps> = ({
  isOpen,
  config,
  onClose,
  onSaveConfig,
  onTriggerSync,
  isSyncing,
  lastSyncMessage,
}) => {
  const [webhookUrl, setWebhookUrl] = useState(config.webhookUrl || DEFAULT_GOOGLE_APPS_SCRIPT_URL);
  const [sheetName, setSheetName] = useState(config.sheetName || 'Kho_CIC');
  const [autoSync, setAutoSync] = useState(config.autoSync ?? true);
  const [copied, setCopied] = useState(false);
  const [showInstructions, setShowInstructions] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setWebhookUrl(config.webhookUrl || DEFAULT_GOOGLE_APPS_SCRIPT_URL);
      setSheetName(config.sheetName || 'Kho_CIC');
      setAutoSync(config.autoSync ?? true);
    }
  }, [isOpen, config]);

  if (!isOpen) return null;

  const handleCopyCode = () => {
    navigator.clipboard.writeText(SAMPLE_APPS_SCRIPT_CODE);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveConfig({
      webhookUrl: webhookUrl.trim(),
      sheetName: sheetName.trim() || 'Kho_CIC',
      autoSync,
      lastSyncedAt: config.lastSyncedAt,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-2xl border border-teal-100 max-h-[90vh] overflow-y-auto animate-in zoom-in-95">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-sm shadow-emerald-600/20">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-slate-800">
                LIÊN KẾT & ĐỒNG BỘ GOOGLE SHEETS
              </h3>
              <p className="text-xs text-slate-500">
                Cập nhật dữ liệu tồn kho liên tục và tự động lên Google Sheet trực tuyến
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

        {/* Form Body */}
        <form onSubmit={handleSave} className="mt-4 space-y-4">
          {lastSyncMessage && (
            <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2">
              <Check className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{lastSyncMessage}</span>
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Google Apps Script Web App URL (Webhook) <span className="text-rose-500">*</span>
            </label>
            <input
              type="url"
              value={webhookUrl}
              onChange={(e) => setWebhookUrl(e.target.value)}
              placeholder="https://script.google.com/macros/s/AKfycb.../exec"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 text-xs font-mono outline-none bg-[#F5FBFA]"
            />
            <div className="flex items-center justify-between mt-1 text-[11px]">
              <span className="text-slate-500">
                URL triển khai ứng dụng web của Google Sheet để nhận dữ liệu tồn kho.
              </span>
              {webhookUrl !== DEFAULT_GOOGLE_APPS_SCRIPT_URL && (
                <button
                  type="button"
                  onClick={() => setWebhookUrl(DEFAULT_GOOGLE_APPS_SCRIPT_URL)}
                  className="text-emerald-700 hover:text-emerald-800 font-semibold underline cursor-pointer"
                >
                  Dùng link mặc định Team CIC
                </button>
              )}
            </div>
            {webhookUrl === DEFAULT_GOOGLE_APPS_SCRIPT_URL && (
              <div className="mt-1.5 flex items-center gap-1.5 text-[11px] text-emerald-700 font-medium bg-emerald-50 px-2 py-1 rounded-md border border-emerald-200">
                <Check className="w-3.5 h-3.5 text-emerald-600" />
                <span>Đã kết nối Google Apps Script chính thức của Team CIC</span>
              </div>
            )}
          </div>

          <div className="flex items-center justify-between p-3.5 rounded-xl bg-emerald-50/70 border border-emerald-100">
            <div>
              <span className="text-xs font-bold text-emerald-950 block">
                Cập nhật tự động (Auto-Sync)
              </span>
              <span className="text-[11px] text-emerald-800/80">
                Tự động gửi dữ liệu lên Google Sheet mỗi khi thêm/sửa/xóa giao dịch
              </span>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={autoSync}
                onChange={(e) => setAutoSync(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
            </label>
          </div>

          {/* Sync Now Button */}
          {webhookUrl && (
            <div className="flex items-center justify-between pt-1">
              <span className="text-xs text-slate-500">
                {config.lastSyncedAt
                  ? `Lần đồng bộ gần nhất: ${new Date(config.lastSyncedAt).toLocaleString('vi-VN')}`
                  : 'Chưa đồng bộ lần nào'}
              </span>
              <button
                type="button"
                onClick={onTriggerSync}
                disabled={isSyncing}
                className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1.5 transition-all shadow-xs cursor-pointer disabled:opacity-50"
              >
                {isSyncing ? (
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Send className="w-3.5 h-3.5" />
                )}
                <span>{isSyncing ? 'Đang gửi...' : 'ĐỒNG BỘ NGAY'}</span>
              </button>
            </div>
          )}

          {/* Instruction accordion */}
          <div className="border border-slate-200 rounded-xl overflow-hidden">
            <button
              type="button"
              onClick={() => setShowInstructions(!showInstructions)}
              className="w-full px-4 py-2.5 bg-slate-50 hover:bg-slate-100 flex items-center justify-between text-xs font-bold text-slate-700 cursor-pointer text-left"
            >
              <span>📖 Hướng dẫn thiết lập Google Sheets trong 2 phút</span>
              <span className="text-emerald-700">{showInstructions ? 'Ẩn ▲' : 'Xem ▼'}</span>
            </button>

            {showInstructions && (
              <div className="p-4 bg-white text-xs text-slate-600 space-y-3 border-t border-slate-200 leading-relaxed">
                <ol className="list-decimal list-inside space-y-1.5 text-[11.5px]">
                  <li>
                    Mở một trang <strong>Google Sheets</strong> mới (docs.google.com/spreadsheets).
                  </li>
                  <li>
                    Vào menu <strong>Tiện ích mở rộng (Extensions)</strong> → Chọn <strong>Apps Script</strong>.
                  </li>
                  <li>
                    Xóa hết mã code mặc định, sau đó copy và dán đoạn mã Google Apps Script mẫu bên dưới.
                  </li>
                  <li>
                    Bấm <strong>Triển khai (Deploy)</strong> → Chọn <strong>Tùy chọn triển khai mới (New deployment)</strong>.
                  </li>
                  <li>
                    Loại triển khai: Chọn <strong>Ứng dụng web (Web app)</strong>.
                  </li>
                  <li>
                    Mục "Ai có quyền truy cập" (Who has access): Chọn <strong>Bất kỳ ai (Anyone)</strong>.
                  </li>
                  <li>
                    Bấm <strong>Triển khai</strong> và sao chép <strong>Web App URL</strong> dán vào ô trên!
                  </li>
                </ol>

                <div className="relative pt-1">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[11px] font-bold text-slate-700">Mã Google Apps Script mẫu:</span>
                    <button
                      type="button"
                      onClick={handleCopyCode}
                      className="px-2.5 py-1 rounded-lg bg-emerald-100 hover:bg-emerald-200 text-emerald-800 text-[11px] font-bold flex items-center gap-1 cursor-pointer transition-colors"
                    >
                      {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                      <span>{copied ? 'Đã sao chép!' : 'Copy Code'}</span>
                    </button>
                  </div>
                  <pre className="p-2.5 bg-slate-900 text-teal-300 font-mono text-[10px] rounded-xl overflow-x-auto max-h-40">
                    {SAMPLE_APPS_SCRIPT_CODE}
                  </pre>
                </div>
              </div>
            )}
          </div>

          {/* Action buttons */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-slate-300 text-slate-600 hover:bg-slate-100 font-bold text-xs uppercase tracking-wider transition-all cursor-pointer"
            >
              ĐÓNG
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs uppercase tracking-wider transition-all cursor-pointer shadow-sm shadow-emerald-600/20"
            >
              LƯU CẤU HÌNH
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
