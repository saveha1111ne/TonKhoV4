import React from 'react';
import { Phone, Building2, ShieldCheck, Download, RefreshCw, FileCode } from 'lucide-react';

import { GoogleSheetsConfig } from '../types/inventory';

interface HeaderProps {
  onResetData: () => void;
  onBackupData?: () => void;
  onDownloadSingleHtml?: () => void;
  onOpenGoogleSheetsModal?: () => void;
  onOpenExcelImportModal?: () => void;
  lastSyncTime?: string;
  isGoogleSynced?: boolean;
  googleSheetsConfig?: GoogleSheetsConfig;
}

export const Header: React.FC<HeaderProps> = ({
  onResetData,
  onBackupData,
  onDownloadSingleHtml,
  onOpenGoogleSheetsModal,
  onOpenExcelImportModal,
  lastSyncTime,
  isGoogleSynced,
  googleSheetsConfig,
}) => {

  return (
    <header className="relative bg-gradient-to-r from-[#00695C] via-[#00897B] to-[#0288D1] text-white shadow-lg overflow-hidden">
      {/* Decorative background curves */}
      <div className="absolute inset-0 opacity-10 pointer-events-none">
        <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
          <path d="M0,0 L100,0 L100,75 Q50,100 0,75 Z" fill="white" />
        </svg>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 relative z-10">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          {/* Left: App Title and Subtitle */}
          <div className="space-y-1">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-xl bg-white/15 backdrop-blur-md border border-white/25 flex items-center justify-center shadow-inner">
                <Building2 className="w-6 h-6 text-cyan-200" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold tracking-wider uppercase bg-[#80CBC4]/30 text-teal-100 border border-[#80CBC4]/40">
                    Team CIC System
                  </span>
                  <button
                    onClick={onOpenGoogleSheetsModal}
                    title={isGoogleSynced ? `Google Sheets: Tự động đồng bộ đang BẬT (${googleSheetsConfig?.webhookUrl?.slice(0, 45)}...)` : 'Cấu hình Google Sheets'}
                    className={`px-2 py-0.5 rounded text-[10px] font-semibold flex items-center gap-1 cursor-pointer transition-colors border ${
                      isGoogleSynced
                        ? 'bg-emerald-500/30 text-emerald-200 border-emerald-400/50 hover:bg-emerald-500/40'
                        : 'bg-white/10 text-white/70 border-white/20 hover:bg-white/20'
                    }`}
                  >
                    <span className={`w-1.5 h-1.5 rounded-full ${isGoogleSynced ? 'bg-emerald-400 animate-pulse' : 'bg-slate-400'}`}></span>
                    <span>Google Sheets: {isGoogleSynced ? 'Tự động đồng bộ' : 'Chưa kết nối'}</span>
                  </button>
                </div>
                <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight text-white drop-shadow-sm">
                  HỆ THỐNG QUẢN LÝ HÀNG TỒN KHO TEAM CIC
                </h1>
                <p className="text-xs sm:text-sm text-cyan-100/90 font-medium">
                  Inventory Management Dashboard • Chuẩn hóa dữ liệu đa chi nhánh
                </p>
              </div>
            </div>
          </div>

          {/* Right: Author, Hotline & Utility actions */}
          <div className="flex flex-wrap items-center justify-between md:justify-end gap-3 pt-2 md:pt-0 border-t border-white/15 md:border-t-0">
            <div className="bg-white/10 backdrop-blur-md rounded-xl p-2.5 px-4 border border-white/20 shadow-sm text-right">
              <div className="text-xs font-semibold text-teal-100 flex items-center justify-end gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-[#80CBC4]" />
                <span>Made by Ha Nhung logistic</span>
              </div>
              <a
                href="tel:0901601600"
                className="mt-0.5 inline-flex items-center gap-1.5 text-sm sm:text-base font-bold text-amber-300 hover:text-amber-200 transition-colors"
                title="Gọi hỗ trợ kỹ thuật"
              >
                <Phone className="w-4 h-4 animate-bounce" />
                <span>Hotline: 0901601600</span>
              </a>
            </div>

            <div className="flex items-center gap-1.5">
              <button
                onClick={onDownloadSingleHtml}
                title="Tải file HTML đơn lẻ độc lập chạy offline không cần mạng/cài đặt"
                className="p-2 rounded-lg bg-white/15 hover:bg-white/25 active:bg-white/30 text-white transition-all text-xs flex items-center gap-1 font-medium border border-white/20 shadow-sm"
              >
                <FileCode className="w-4 h-4 text-cyan-200" />
                <span className="hidden lg:inline">Tải file HTML</span>
              </button>

              <button
                onClick={onBackupData}
                title="Sao lưu toàn bộ dữ liệu ra file JSON"
                className="p-2 rounded-lg bg-white/15 hover:bg-white/25 active:bg-white/30 text-white transition-all text-xs flex items-center gap-1 font-medium border border-white/20 shadow-sm"
              >
                <Download className="w-4 h-4 text-teal-200" />
                <span className="hidden lg:inline">Sao lưu</span>
              </button>

              <button
                onClick={onResetData}
                title="Khôi phục lại dữ liệu mẫu CIC"
                className="p-2 rounded-lg bg-white/10 hover:bg-rose-500/30 text-white/90 hover:text-white transition-all text-xs flex items-center gap-1 font-medium border border-white/15"
              >
                <RefreshCw className="w-4 h-4 text-rose-200" />
                <span className="hidden lg:inline">Dữ liệu mẫu</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
