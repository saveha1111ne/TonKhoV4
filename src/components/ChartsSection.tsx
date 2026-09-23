import React, { useState } from 'react';
import { BarChart3, PieChart, TrendingUp, CalendarDays, Info } from 'lucide-react';
import { BranchSummaryRow, MonthSummary } from '../types/inventory';

interface ChartsSectionProps {
  branchSummaries: BranchSummaryRow[];
  monthlyTrends: MonthSummary[];
  selectedMonth: string;
}

export const ChartsSection: React.FC<ChartsSectionProps> = ({
  branchSummaries,
  monthlyTrends,
  selectedMonth,
}) => {
  const [hoveredBranch, setHoveredBranch] = useState<string | null>(null);
  const [hoveredMonth, setHoveredMonth] = useState<string | null>(null);

  const formatNumber = (num: number) => new Intl.NumberFormat('vi-VN').format(num || 0);

  // Palettes aligned with: Deep Teal (#00695C), Sky Blue (#29B6F6), Fresh Mint (#80CBC4), Amber (#F59E0B)
  const branchColors: Record<string, string> = {
    'Hà Nội': '#0288D1', // Sky blue
    'Đà Nẵng': '#00897B', // Teal
    'HCM': '#00695C', // Deep Teal
    'Cần Thơ': '#26A69A', // Fresh Mint
  };

  const getBranchColor = (name: string, index: number) => {
    if (branchColors[name]) return branchColors[name];
    const fallbacks = ['#0288D1', '#00897B', '#00695C', '#26A69A', '#7E57C2', '#EC407A'];
    return fallbacks[index % fallbacks.length];
  };

  // --- CHART 1: BAR CHART (TỒN KHO THEO CHI NHÁNH) ---
  const maxBranchStock = Math.max(...branchSummaries.map((b) => b.endingStock), 100);

  // --- CHART 2: PIE / DOUGHNUT (TỶ LỆ TỒN KHO THEO VÙNG) ---
  const totalStock = branchSummaries.reduce((sum, b) => sum + b.endingStock, 0) || 1;
  let cumulativeAngle = 0;
  const pieSlices = branchSummaries.map((b, idx) => {
    const fraction = b.endingStock / totalStock;
    const angle = fraction * 360;
    const startAngle = cumulativeAngle;
    const endAngle = cumulativeAngle + angle;
    cumulativeAngle = endAngle;

    const startRad = ((startAngle - 90) * Math.PI) / 180;
    const endRad = ((endAngle - 90) * Math.PI) / 180;
    const cx = 100;
    const cy = 100;
    const r = 80;
    const innerR = 48; // Doughnut hole

    const x1 = cx + r * Math.cos(startRad);
    const y1 = cy + r * Math.sin(startRad);
    const x2 = cx + r * Math.cos(endRad);
    const y2 = cy + r * Math.sin(endRad);

    const x1Inner = cx + innerR * Math.cos(startRad);
    const y1Inner = cy + innerR * Math.sin(startRad);
    const x2Inner = cx + innerR * Math.cos(endRad);
    const y2Inner = cy + innerR * Math.sin(endRad);

    const largeArc = angle > 180 ? 1 : 0;

    const pathData =
      angle >= 359.99
        ? `M ${cx},${cy - r} A ${r},${r} 0 1,1 ${cx},${cy + r} A ${r},${r} 0 1,1 ${cx},${cy - r} M ${cx},${cy - innerR} A ${innerR},${innerR} 0 1,0 ${cx},${cy + innerR} A ${innerR},${innerR} 0 1,0 ${cx},${cy - innerR} Z`
        : `M ${x1},${y1} A ${r},${r} 0 ${largeArc},1 ${x2},${y2} L ${x2Inner},${y2Inner} A ${innerR},${innerR} 0 ${largeArc},0 ${x1Inner},${y1Inner} Z`;

    return {
      branchName: b.branchName,
      fraction,
      percentage: fraction * 100,
      endingStock: b.endingStock,
      pathData,
      color: getBranchColor(b.branchName, idx),
    };
  });

  // --- CHART 3 & 4: MONTHLY DATA (NHẬP, XUẤT, TỒN & XU HƯỚNG) ---
  const maxMonthlyVal = Math.max(
    ...monthlyTrends.flatMap((m) => [m.inQuantity, m.outQuantity, m.endingStock]),
    100
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-teal-500"></div>
          <h2 className="text-base sm:text-lg font-bold text-slate-800 tracking-tight">
            PHÂN TÍCH HÀNG TỒN KHO & BIỂU ĐỒ TRỰC QUAN
          </h2>
        </div>
        <span className="text-xs text-slate-500 hidden sm:inline">
          Dữ liệu tự động tính toán tức thì theo thời gian thực
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* BIỂU ĐỒ 1: TỒN KHO THEO CHI NHÁNH (CỘT) */}
        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-teal-100/90 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-teal-50 text-teal-600 flex items-center justify-center">
                  <BarChart3 className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-800">1. Tồn kho theo chi nhánh</h3>
                  <p className="text-xs text-slate-500">So sánh số lượng tồn cuối kỳ {selectedMonth}</p>
                </div>
              </div>
            </div>

            {/* Custom Bar Chart SVG */}
            <div className="h-52 w-full pt-4">
              <svg className="w-full h-full" viewBox="0 0 400 170" preserveAspectRatio="none">
                {/* Horizontal gridlines */}
                {[0, 0.25, 0.5, 0.75, 1].map((ratio, i) => {
                  const y = 140 - ratio * 120;
                  const val = Math.round(ratio * maxBranchStock);
                  return (
                    <g key={i}>
                      <line x1="45" y1={y} x2="385" y2={y} stroke="#E2E8F0" strokeDasharray="3 3" />
                      <text x="38" y={y + 3} textAnchor="end" fontSize="9" fill="#94A3B8" fontWeight="500">
                        {val}
                      </text>
                    </g>
                  );
                })}

                {/* Bars for each branch */}
                {branchSummaries.map((b, idx) => {
                  const barCount = branchSummaries.length;
                  const slotWidth = (385 - 55) / barCount;
                  const barWidth = Math.min(slotWidth * 0.55, 42);
                  const x = 55 + idx * slotWidth + (slotWidth - barWidth) / 2;
                  const barHeight = Math.max((b.endingStock / maxBranchStock) * 120, 4);
                  const y = 140 - barHeight;
                  const color = getBranchColor(b.branchName, idx);
                  const isHovered = hoveredBranch === b.branchName;

                  return (
                    <g
                      key={b.branchId}
                      className="cursor-pointer transition-opacity"
                      onMouseEnter={() => setHoveredBranch(b.branchName)}
                      onMouseLeave={() => setHoveredBranch(null)}
                      opacity={hoveredBranch && !isHovered ? 0.45 : 1}
                    >
                      {/* Bar shadow/glow on hover */}
                      {isHovered && (
                        <rect
                          x={x - 2}
                          y={y - 2}
                          width={barWidth + 4}
                          height={barHeight + 4}
                          rx="6"
                          fill={color}
                          opacity="0.3"
                        />
                      )}
                      <rect
                        x={x}
                        y={y}
                        width={barWidth}
                        height={barHeight}
                        rx="5"
                        fill={color}
                      />
                      {/* Value label on top */}
                      <text
                        x={x + barWidth / 2}
                        y={y - 6}
                        textAnchor="middle"
                        fontSize="10"
                        fontWeight="700"
                        fill="#1E293B"
                      >
                        {formatNumber(b.endingStock)}
                      </text>
                      {/* Branch label below */}
                      <text
                        x={x + barWidth / 2}
                        y={156}
                        textAnchor="middle"
                        fontSize="11"
                        fontWeight="600"
                        fill="#475569"
                      >
                        {b.branchName}
                      </text>
                    </g>
                  );
                })}
              </svg>
            </div>
          </div>

          <div className="mt-2 pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>Chi nhánh có tồn cao nhất:</span>
            <span className="font-bold text-teal-800">
              {[...branchSummaries].sort((a, b) => b.endingStock - a.endingStock)[0]?.branchName || 'N/A'} (
              {formatNumber(Math.max(...branchSummaries.map((b) => b.endingStock), 0))} sp)
            </span>
          </div>
        </div>

        {/* BIỂU ĐỒ 2: TỶ LỆ TỒN KHO THEO VÙNG (DOUGHNUT) */}
        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-teal-100/90 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-sky-50 text-sky-600 flex items-center justify-center">
                  <PieChart className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-800">2. Tỷ lệ tồn kho theo vùng</h3>
                  <p className="text-xs text-slate-500">Cơ cấu phân bổ tồn kho hệ thống {selectedMonth}</p>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 py-2">
              {/* SVG Doughnut */}
              <div className="relative w-44 h-44 flex items-center justify-center shrink-0">
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 200 200">
                  {pieSlices.map((slice, i) => (
                    <path
                      key={i}
                      d={slice.pathData}
                      fill={slice.color}
                      stroke="#ffffff"
                      strokeWidth="2.5"
                      className="transition-all duration-200 cursor-pointer hover:opacity-85"
                      onMouseEnter={() => setHoveredBranch(slice.branchName)}
                      onMouseLeave={() => setHoveredBranch(null)}
                      transform={hoveredBranch === slice.branchName ? 'scale(1.04) translate(-4, -4)' : ''}
                    />
                  ))}
                </svg>
                {/* Center hole info */}
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-center">
                  <span className="text-[10px] font-semibold uppercase text-slate-400">Tổng Tồn</span>
                  <span className="text-base font-extrabold text-slate-800 leading-tight">
                    {formatNumber(totalStock)}
                  </span>
                  <span className="text-[10px] text-teal-700 font-medium">sản phẩm</span>
                </div>
              </div>

              {/* Legend with percentages */}
              <div className="flex-1 w-full space-y-2">
                {branchSummaries.map((b, idx) => {
                  const color = getBranchColor(b.branchName, idx);
                  const isHovered = hoveredBranch === b.branchName;
                  return (
                    <div
                      key={b.branchId}
                      className={`flex items-center justify-between p-2 rounded-xl transition-all cursor-pointer ${
                        isHovered ? 'bg-teal-50/80 ring-1 ring-teal-200' : 'hover:bg-slate-50'
                      }`}
                      onMouseEnter={() => setHoveredBranch(b.branchName)}
                      onMouseLeave={() => setHoveredBranch(null)}
                    >
                      <div className="flex items-center gap-2">
                        <span className="w-3 h-3 rounded-full" style={{ backgroundColor: color }}></span>
                        <span className="text-xs font-semibold text-slate-700">{b.branchName}</span>
                        <span className="text-[10px] text-slate-400">({b.region})</span>
                      </div>
                      <div className="text-right">
                        <span className="text-xs font-bold text-slate-800 mr-2">
                          {b.stockPercentage.toFixed(1)}%
                        </span>
                        <span className="text-[11px] text-slate-500 font-medium">
                          {formatNumber(b.endingStock)} sp
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="mt-2 pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>Khu vực chiếm tỷ trọng lớn:</span>
            <span className="font-bold text-sky-800">
              {branchSummaries.find((b) => b.stockPercentage === Math.max(...branchSummaries.map((s) => s.stockPercentage)))?.branchName || 'N/A'}
            </span>
          </div>
        </div>

        {/* BIỂU ĐỒ 3: NHẬP - XUẤT THEO THÁNG */}
        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-teal-100/90 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                  <CalendarDays className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-800">3. Nhập - Xuất theo tháng</h3>
                  <p className="text-xs text-slate-500">So sánh biến động luân chuyển hàng hóa theo thời gian</p>
                </div>
              </div>

              {/* Legend */}
              <div className="flex items-center gap-3 text-xs">
                <span className="flex items-center gap-1.5 font-medium text-emerald-700">
                  <span className="w-2.5 h-2.5 rounded-sm bg-emerald-500"></span> Nhập
                </span>
                <span className="flex items-center gap-1.5 font-medium text-rose-700">
                  <span className="w-2.5 h-2.5 rounded-sm bg-rose-500"></span> Xuất
                </span>
              </div>
            </div>

            {/* Custom Grouped Bar SVG */}
            <div className="h-52 w-full pt-4">
              <svg className="w-full h-full" viewBox="0 0 400 170" preserveAspectRatio="none">
                {/* Horizontal gridlines */}
                {[0, 0.25, 0.5, 0.75, 1].map((ratio, i) => {
                  const y = 140 - ratio * 120;
                  const val = Math.round(ratio * maxMonthlyVal);
                  return (
                    <g key={i}>
                      <line x1="45" y1={y} x2="385" y2={y} stroke="#E2E8F0" strokeDasharray="3 3" />
                      <text x="38" y={y + 3} textAnchor="end" fontSize="9" fill="#94A3B8" fontWeight="500">
                        {val}
                      </text>
                    </g>
                  );
                })}

                {monthlyTrends.map((m, idx) => {
                  const count = monthlyTrends.length;
                  const slotWidth = (385 - 55) / count;
                  const groupWidth = slotWidth * 0.65;
                  const barWidth = (groupWidth - 4) / 2;
                  const groupX = 55 + idx * slotWidth + (slotWidth - groupWidth) / 2;

                  const inH = Math.max((m.inQuantity / maxMonthlyVal) * 120, 3);
                  const inY = 140 - inH;

                  const outH = Math.max((m.outQuantity / maxMonthlyVal) * 120, 3);
                  const outY = 140 - outH;

                  const isHovered = hoveredMonth === m.month;

                  return (
                    <g
                      key={m.month}
                      className="cursor-pointer"
                      onMouseEnter={() => setHoveredMonth(m.month)}
                      onMouseLeave={() => setHoveredMonth(null)}
                      opacity={hoveredMonth && !isHovered ? 0.45 : 1}
                    >
                      {/* Bar Nhập */}
                      <rect
                        x={groupX}
                        y={inY}
                        width={barWidth}
                        height={inH}
                        rx="4"
                        fill="#10B981"
                      />
                      <text
                        x={groupX + barWidth / 2}
                        y={inY - 4}
                        textAnchor="middle"
                        fontSize="9"
                        fontWeight="700"
                        fill="#059669"
                      >
                        {m.inQuantity}
                      </text>

                      {/* Bar Xuất */}
                      <rect
                        x={groupX + barWidth + 3}
                        y={outY}
                        width={barWidth}
                        height={outH}
                        rx="4"
                        fill="#F43F5E"
                      />
                      <text
                        x={groupX + barWidth + 3 + barWidth / 2}
                        y={outY - 4}
                        textAnchor="middle"
                        fontSize="9"
                        fontWeight="700"
                        fill="#E11D48"
                      >
                        {m.outQuantity}
                      </text>

                      {/* Month label */}
                      <text
                        x={groupX + groupWidth / 2}
                        y={156}
                        textAnchor="middle"
                        fontSize="11"
                        fontWeight="600"
                        fill="#334155"
                      >
                        {m.month}
                      </text>
                    </g>
                  );
                })}
              </svg>
            </div>
          </div>

          <div className="mt-2 pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>Tháng xuất hàng cao nhất:</span>
            <span className="font-bold text-rose-700">
              {[...monthlyTrends].sort((a, b) => b.outQuantity - a.outQuantity)[0]?.month || 'N/A'} (
              {formatNumber(Math.max(...monthlyTrends.map((m) => m.outQuantity), 0))} sp)
            </span>
          </div>
        </div>

        {/* BIỂU ĐỒ 4: XU HƯỚNG TỒN KHO THEO THỜI GIAN (ĐƯỜNG) */}
        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-teal-100/90 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
                  <TrendingUp className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-800">4. Xu hướng tồn kho</h3>
                  <p className="text-xs text-slate-500">Biểu đồ đường thể hiện tồn kho tăng/giảm qua các tháng</p>
                </div>
              </div>

              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-sky-100 text-sky-800 border border-sky-200">
                Toàn hệ thống
              </span>
            </div>

            {/* Custom Line Chart SVG */}
            <div className="h-52 w-full pt-4">
              {monthlyTrends.length > 0 && (() => {
                const maxStockVal = Math.max(...monthlyTrends.map((m) => m.endingStock), 100);
                const minStockVal = Math.min(...monthlyTrends.map((m) => m.endingStock), 0);
                const range = maxStockVal - minStockVal || 1;

                const points = monthlyTrends.map((m, idx) => {
                  const count = monthlyTrends.length;
                  const x = count === 1 ? 215 : 60 + (idx / (count - 1)) * 315;
                  const y = 140 - ((m.endingStock - minStockVal) / range) * 110;
                  return { x, y, month: m.month, val: m.endingStock };
                });

                const linePath = points.reduce((acc, p, i) => `${acc} ${i === 0 ? 'M' : 'L'} ${p.x},${p.y}`, '');
                const areaPath = `${linePath} L ${points[points.length - 1].x},140 L ${points[0].x},140 Z`;

                return (
                  <svg className="w-full h-full" viewBox="0 0 400 170" preserveAspectRatio="none">
                    <defs>
                      <linearGradient id="stockAreaGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#29B6F6" stopOpacity="0.4" />
                        <stop offset="100%" stopColor="#29B6F6" stopOpacity="0.0" />
                      </linearGradient>
                    </defs>

                    {/* Horizontal gridlines */}
                    {[0, 0.33, 0.66, 1].map((ratio, i) => {
                      const y = 140 - ratio * 110;
                      const val = Math.round(minStockVal + ratio * range);
                      return (
                        <g key={i}>
                          <line x1="45" y1={y} x2="385" y2={y} stroke="#E2E8F0" strokeDasharray="3 3" />
                          <text x="38" y={y + 3} textAnchor="end" fontSize="9" fill="#94A3B8" fontWeight="500">
                            {val}
                          </text>
                        </g>
                      );
                    })}

                    {/* Gradient Area below line */}
                    <path d={areaPath} fill="url(#stockAreaGrad)" />

                    {/* Main Trend Line */}
                    <path
                      d={linePath}
                      fill="none"
                      stroke="#0288D1"
                      strokeWidth="3.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />

                    {/* Points & Labels */}
                    {points.map((p, idx) => (
                      <g key={idx} className="cursor-pointer">
                        <circle
                          cx={p.x}
                          cy={p.y}
                          r="5.5"
                          fill="#ffffff"
                          stroke="#0288D1"
                          strokeWidth="3"
                        />
                        <text
                          x={p.x}
                          y={p.y - 10}
                          textAnchor="middle"
                          fontSize="10"
                          fontWeight="700"
                          fill="#0369A1"
                        >
                          {formatNumber(p.val)}
                        </text>
                        <text
                          x={p.x}
                          y={156}
                          textAnchor="middle"
                          fontSize="11"
                          fontWeight="600"
                          fill="#334155"
                        >
                          {p.month}
                        </text>
                      </g>
                    ))}
                  </svg>
                );
              })()}
            </div>
          </div>

          <div className="mt-2 pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>Tình trạng tồn kho:</span>
            <span className="font-bold text-teal-800 flex items-center gap-1">
              <Info className="w-3.5 h-3.5 text-teal-600" />
              Tự động kế thừa tồn cuối tháng N sang tồn đầu tháng N+1
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
