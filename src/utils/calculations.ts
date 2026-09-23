import {
  Branch,
  InventoryItem,
  InventoryTransaction,
  BeginningBalance,
  InventorySummaryRow,
  BranchSummaryRow,
  MonthSummary,
} from '../types/inventory';

// Parse month string like "T06/2026" or "T6/2026" or "07/2026" to a sortable number (year * 100 + month)
export function parseMonthToSortKey(m: string): number {
  const clean = m.replace(/^[Tt]/, '').trim();
  const parts = clean.split('/');
  if (parts.length === 2) {
    const month = parseInt(parts[0], 10);
    const year = parseInt(parts[1], 10);
    if (!isNaN(month) && !isNaN(year)) {
      return year * 100 + month;
    }
  }
  return 0;
}

export function sortMonths(months: string[]): string[] {
  return [...months].sort((a, b) => parseMonthToSortKey(a) - parseMonthToSortKey(b));
}

// Generate next month from the current latest month (e.g., T08/2026 -> T09/2026, T12/2026 -> T01/2027)
export function getNextMonthSuggestion(latestMonth: string): string {
  const clean = latestMonth.replace(/^[Tt]/, '').trim();
  const parts = clean.split('/');
  if (parts.length === 2) {
    let month = parseInt(parts[0], 10);
    let year = parseInt(parts[1], 10);
    if (!isNaN(month) && !isNaN(year)) {
      month += 1;
      if (month > 12) {
        month = 1;
        year += 1;
      }
      const mStr = month < 10 ? `0${month}` : `${month}`;
      return `T${mStr}/${year}`;
    }
  }
  return 'T09/2026';
}

export interface SystemCalculatedData {
  sortedMonths: string[];
  // Month -> ItemCode -> BranchId -> { beginning, in, out, ending }
  monthMatrix: Record<
    string,
    Record<
      string,
      Record<
        string,
        {
          beginningStock: number;
          inQuantity: number;
          outQuantity: number;
          endingStock: number;
        }
      >
    >
  >;
  // Active month summaries
  itemSummaries: InventorySummaryRow[];
  branchSummaries: BranchSummaryRow[];
  kpi: {
    totalBeginning: number;
    totalIn: number;
    totalOut: number;
    totalEnding: number;
    branchCount: number;
    itemCount: number;
  };
  monthlyTrends: MonthSummary[];
}

/**
 * Core calculation engine:
 * Cascades beginning stock across months:
 * Ending(M) = Beginning(M) + In(M) - Out(M)
 * Beginning(M+1) = Ending(M)
 */
export function calculateInventorySystem(
  months: string[],
  branches: Branch[],
  items: InventoryItem[],
  transactions: InventoryTransaction[],
  baseInitialBalances: BeginningBalance[],
  selectedMonth: string
): SystemCalculatedData {
  const sortedMonths = sortMonths(months);

  // Pre-index transactions by month -> itemCode -> branchName
  const txMap: Record<
    string,
    Record<string, Record<string, { inQty: number; outQty: number }>>
  > = {};

  transactions.forEach((tx) => {
    if (!txMap[tx.month]) txMap[tx.month] = {};
    if (!txMap[tx.month][tx.itemCode]) txMap[tx.month][tx.itemCode] = {};
    if (!txMap[tx.month][tx.itemCode][tx.branchId]) {
      txMap[tx.month][tx.itemCode][tx.branchId] = { inQty: 0, outQty: 0 };
    }
    if (tx.type === 'IN') {
      txMap[tx.month][tx.itemCode][tx.branchId].inQty += Number(tx.quantity) || 0;
    } else {
      txMap[tx.month][tx.itemCode][tx.branchId].outQty += Number(tx.quantity) || 0;
    }
  });

  // Base initial balance map for month 0 (or explicitly set balances)
  const initialBalanceMap: Record<string, Record<string, Record<string, number>>> = {};
  baseInitialBalances.forEach((bal) => {
    if (!initialBalanceMap[bal.month]) initialBalanceMap[bal.month] = {};
    if (!initialBalanceMap[bal.month][bal.itemCode]) {
      initialBalanceMap[bal.month][bal.itemCode] = {};
    }
    initialBalanceMap[bal.month][bal.itemCode][bal.branchId] = Number(bal.quantity) || 0;
  });

  const monthMatrix: Record<
    string,
    Record<
      string,
      Record<
        string,
        {
          beginningStock: number;
          inQuantity: number;
          outQuantity: number;
          endingStock: number;
        }
      >
    >
  > = {};

  // Compute month by month in sorted order
  for (let mIdx = 0; mIdx < sortedMonths.length; mIdx++) {
    const curMonth = sortedMonths[mIdx];
    const prevMonth = mIdx > 0 ? sortedMonths[mIdx - 1] : null;

    monthMatrix[curMonth] = {};

    items.forEach((item) => {
      monthMatrix[curMonth][item.code] = {};

      branches.forEach((b) => {
        let beginning = 0;

        if (prevMonth && monthMatrix[prevMonth]?.[item.code]?.[b.name]) {
          // Rule 6: Tự động chuyển tồn: Tồn cuối tháng trước = Tồn đầu tháng sau
          beginning = monthMatrix[prevMonth][item.code][b.name].endingStock;
        } else if (initialBalanceMap[curMonth]?.[item.code]?.[b.name] !== undefined) {
          beginning = initialBalanceMap[curMonth][item.code][b.name];
        }

        const txData = txMap[curMonth]?.[item.code]?.[b.name] || { inQty: 0, outQty: 0 };
        const inQty = txData.inQty;
        const outQty = txData.outQty;
        const ending = beginning + inQty - outQty;

        monthMatrix[curMonth][item.code][b.name] = {
          beginningStock: beginning,
          inQuantity: inQty,
          outQuantity: outQty,
          endingStock: ending,
        };
      });
    });
  }

  // Active month calculations
  const activeMonth = sortedMonths.includes(selectedMonth)
    ? selectedMonth
    : sortedMonths[sortedMonths.length - 1] || '';

  const activeMatrix = monthMatrix[activeMonth] || {};

  // Build item summaries for selected month
  const itemSummaries: InventorySummaryRow[] = items.map((item) => {
    let beginningStock = 0;
    let inQuantity = 0;
    let outQuantity = 0;
    let endingStock = 0;
    const branchBreakdown: Record<
      string,
      {
        beginningStock: number;
        inQuantity: number;
        outQuantity: number;
        endingStock: number;
      }
    > = {};

    branches.forEach((b) => {
      const bData = activeMatrix[item.code]?.[b.name] || {
        beginningStock: 0,
        inQuantity: 0,
        outQuantity: 0,
        endingStock: 0,
      };

      branchBreakdown[b.name] = bData;
      beginningStock += bData.beginningStock;
      inQuantity += bData.inQuantity;
      outQuantity += bData.outQuantity;
      endingStock += bData.endingStock;
    });

    return {
      itemCode: item.code,
      itemName: item.name,
      category: item.category,
      unit: item.unit,
      beginningStock,
      inQuantity,
      outQuantity,
      endingStock,
      branchBreakdown,
    };
  });

  // Build branch summaries for selected month
  let grandTotalEnding = 0;
  const rawBranchSummaries = branches.map((b) => {
    let beginningStock = 0;
    let inQuantity = 0;
    let outQuantity = 0;
    let endingStock = 0;

    items.forEach((item) => {
      const bData = activeMatrix[item.code]?.[b.name];
      if (bData) {
        beginningStock += bData.beginningStock;
        inQuantity += bData.inQuantity;
        outQuantity += bData.outQuantity;
        endingStock += bData.endingStock;
      }
    });

    grandTotalEnding += endingStock;

    return {
      branchId: b.id,
      branchName: b.name,
      region: b.region,
      beginningStock,
      inQuantity,
      outQuantity,
      endingStock,
    };
  });

  const branchSummaries: BranchSummaryRow[] = rawBranchSummaries.map((b) => ({
    ...b,
    stockPercentage: grandTotalEnding > 0 ? (b.endingStock / grandTotalEnding) * 100 : 0,
  }));

  // KPI for selected month
  const totalBeginning = itemSummaries.reduce((sum, i) => sum + i.beginningStock, 0);
  const totalIn = itemSummaries.reduce((sum, i) => sum + i.inQuantity, 0);
  const totalOut = itemSummaries.reduce((sum, i) => sum + i.outQuantity, 0);
  const totalEnding = itemSummaries.reduce((sum, i) => sum + i.endingStock, 0);

  // Monthly trends across all months for charts
  const monthlyTrends: MonthSummary[] = sortedMonths.map((m) => {
    let mBeg = 0;
    let mIn = 0;
    let mOut = 0;
    let mEnd = 0;

    items.forEach((item) => {
      branches.forEach((b) => {
        const cell = monthMatrix[m]?.[item.code]?.[b.name];
        if (cell) {
          mBeg += cell.beginningStock;
          mIn += cell.inQuantity;
          mOut += cell.outQuantity;
          mEnd += cell.endingStock;
        }
      });
    });

    return {
      month: m,
      beginningStock: mBeg,
      inQuantity: mIn,
      outQuantity: mOut,
      endingStock: mEnd,
    };
  });

  return {
    sortedMonths,
    monthMatrix,
    itemSummaries,
    branchSummaries,
    kpi: {
      totalBeginning,
      totalIn,
      totalOut,
      totalEnding,
      branchCount: branches.length,
      itemCount: items.length,
    },
    monthlyTrends,
  };
}

/**
 * Get current stock for a specific branch and item in a month.
 * Used for stock validation before allowing OUT transaction.
 */
export function calculateFullInventory(
  months: string[],
  items: InventoryItem[],
  branches: Branch[],
  transactions: InventoryTransaction[],
  baseInitialBalances: BeginningBalance[]
): Record<string, { month: string; itemSummaries: InventorySummaryRow[]; branchSummaries: BranchSummaryRow[]; monthlyTrends: MonthSummary[]; kpi: any; grandTotal: any }> {
  const result: Record<string, any> = {};
  months.forEach((m) => {
    const calc = calculateInventorySystem(months, branches, items, transactions, baseInitialBalances, m);
    result[m] = {
      month: m,
      itemSummaries: calc.itemSummaries,
      branchSummaries: calc.branchSummaries,
      monthlyTrends: calc.monthlyTrends,
      kpi: calc.kpi,
      grandTotal: {
        beginningStock: calc.kpi.totalBeginning,
        inQuantity: calc.kpi.totalIn,
        outQuantity: calc.kpi.totalOut,
        endingStock: calc.kpi.totalEnding,
      },
    };
  });
  return result;
}


export function calculateKPIs(
  monthData: { itemSummaries: InventorySummaryRow[]; branchSummaries: BranchSummaryRow[]; grandTotal: any },
  selectedBranch: string,
  totalBranches: number,
  totalItems: number
) {
  if (selectedBranch === 'ALL') {
    return {
      totalBeginning: monthData.grandTotal?.beginningStock || 0,
      totalIn: monthData.grandTotal?.inQuantity || 0,
      totalOut: monthData.grandTotal?.outQuantity || 0,
      totalEnding: monthData.grandTotal?.endingStock || 0,
      branchCount: totalBranches,
      itemCount: totalItems,
    };
  }

  const bSummary = monthData.branchSummaries.find((b) => b.branchName === selectedBranch);
  return {
    totalBeginning: bSummary?.beginningStock || 0,
    totalIn: bSummary?.inQuantity || 0,
    totalOut: bSummary?.outQuantity || 0,
    totalEnding: bSummary?.endingStock || 0,
    branchCount: 1,
    itemCount: totalItems,
  };
}

