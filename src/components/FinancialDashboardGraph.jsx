import React, { useState, useMemo } from 'react';
import {
  TrendingUp,
  BarChart3,
  LineChart,
  DollarSign,
  Percent,
  Layers,
  ArrowUpRight,
  Info,
} from 'lucide-react';
import { formatCurrency } from '../utils/numberToWords';

export default function FinancialDashboardGraph({
  salesInvoices = [],
  allFilteredQuotes = [],
  onResetDateRange,
  dateRangeLabel = '',
}) {
  const [chartView, setChartView] = useState('bars'); // 'bars' | 'trend'
  const [hoveredIndex, setHoveredIndex] = useState(null);

  // Process data points from sales invoices
  const chartData = useMemo(() => {
    if (!salesInvoices || salesInvoices.length === 0) {
      return [];
    }

    // Sort chronologically
    const sorted = [...salesInvoices].sort((a, b) => {
      const dateA = a.createdAt || (a.invoiceDate ? Date.parse(a.invoiceDate) : 0);
      const dateB = b.createdAt || (b.invoiceDate ? Date.parse(b.invoiceDate) : 0);
      return dateA - dateB;
    });

    return sorted.map((inv, idx) => {
      const sales = Number(inv.grandTotal) || 0;
      const cost = (inv.items || []).reduce((sum, it) => {
        const pRate = Number(
          it.purchaseRate ||
            it.product?.purchaseRate ||
            Math.round(Number(it.unitPrice || it.product?.price || 0) * 0.65)
        );
        const qty = Number(it.quantity || 1);
        return sum + pRate * qty;
      }, 0);
      const profit = Math.max(0, sales - cost);
      const margin = sales > 0 ? ((profit / sales) * 100).toFixed(1) : 0;

      const dateStr = inv.invoiceDate || inv.date || '';
      const shortDate = dateStr
        ? dateStr.replace(/-\d{4}$/, '').replace(/-/g, ' ')
        : `Inv #${idx + 1}`;

      return {
        id: inv.id,
        invoiceNumber: inv.invoiceNumber || inv.id,
        customerName: inv.customerName || 'Direct Client',
        dateLabel: shortDate,
        fullDate: dateStr,
        sales,
        cost,
        profit,
        margin,
      };
    });
  }, [salesInvoices]);

  // Aggregate Totals
  const totalSales = chartData.reduce((acc, d) => acc + d.sales, 0);
  const totalCost = chartData.reduce((acc, d) => acc + d.cost, 0);
  const totalProfit = chartData.reduce((acc, d) => acc + d.profit, 0);
  const overallMargin =
    totalSales > 0 ? ((totalProfit / totalSales) * 100).toFixed(1) : '0.0';

  // SVG Chart Geometry
  const svgWidth = 800;
  const svgHeight = 280;
  const padding = { top: 30, right: 30, bottom: 45, left: 75 };
  const plotWidth = svgWidth - padding.left - padding.right;
  const plotHeight = svgHeight - padding.top - padding.bottom;

  // Max value for Y scaling
  const maxVal = useMemo(() => {
    if (chartData.length === 0) return 10000;
    const peak = Math.max(...chartData.map((d) => Math.max(d.sales, d.cost, d.profit)));
    return Math.ceil((peak * 1.15) / 5000) * 5000 || 10000;
  }, [chartData]);

  // Y-axis tick values (4 steps)
  const yTicks = [0, maxVal * 0.25, maxVal * 0.5, maxVal * 0.75, maxVal];

  // Helper scale functions
  const getY = (val) => padding.top + plotHeight - (val / maxVal) * plotHeight;
  const getX = (index) => {
    if (chartData.length <= 1) return padding.left + plotWidth / 2;
    return padding.left + (index / (chartData.length - 1)) * plotWidth;
  };

  // Generate SVG Path for Trend View (Spline / Line)
  const salesPath = useMemo(() => {
    if (chartData.length === 0) return '';
    return chartData.reduce((acc, d, i) => {
      const x = getX(i);
      const y = getY(d.sales);
      return i === 0 ? `M ${x} ${y}` : `${acc} L ${x} ${y}`;
    }, '');
  }, [chartData, maxVal]);

  const profitPath = useMemo(() => {
    if (chartData.length === 0) return '';
    return chartData.reduce((acc, d, i) => {
      const x = getX(i);
      const y = getY(d.profit);
      return i === 0 ? `M ${x} ${y}` : `${acc} L ${x} ${y}`;
    }, '');
  }, [chartData, maxVal]);

  const profitAreaPath = useMemo(() => {
    if (chartData.length === 0) return '';
    const firstX = getX(0);
    const lastX = getX(chartData.length - 1);
    const baseY = getY(0);
    const linePart = chartData.reduce((acc, d, i) => {
      const x = getX(i);
      const y = getY(d.profit);
      return i === 0 ? `M ${x} ${y}` : `${acc} L ${x} ${y}`;
    }, '');
    return `${linePart} L ${lastX} ${baseY} L ${firstX} ${baseY} Z`;
  }, [chartData, maxVal]);

  const costPath = useMemo(() => {
    if (chartData.length === 0) return '';
    return chartData.reduce((acc, d, i) => {
      const x = getX(i);
      const y = getY(d.cost);
      return i === 0 ? `M ${x} ${y}` : `${acc} L ${x} ${y}`;
    }, '');
  }, [chartData, maxVal]);

  // Active hovered point details
  const activeItem = hoveredIndex !== null ? chartData[hoveredIndex] : null;

  return (
    <div className="rounded-2xl bg-surface border border-white/10 p-4 sm:p-6 space-y-5 shadow-2xl relative overflow-hidden">
      {/* Background ambient gradient glow */}
      <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-80 h-80 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />

      {/* Header & Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10 border-b border-white/5 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <TrendingUp className="w-4 h-4" />
            </div>
            <h3 className="font-oswald text-base sm:text-lg font-bold text-white uppercase tracking-wider">
              FINANCIAL PERFORMANCE & PROFIT ANALYTICS
            </h3>
            <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
              LIVE ERP METRICS
            </span>
          </div>
          <p className="text-slate-400 text-xs mt-1">
            Realized Revenue, Wholesale Purchase Cost & Net Profit for Sales Invoices in Selected Range
            {dateRangeLabel && ` (${dateRangeLabel})`}
          </p>
        </div>

        {/* View Mode Toggle Buttons */}
        <div className="flex items-center gap-2 self-start md:self-auto">
          <div className="flex items-center bg-[#070A12] border border-white/10 rounded-xl p-1 text-xs">
            <button
              onClick={() => setChartView('bars')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-bold transition-all ${
                chartView === 'bars'
                  ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 font-bold shadow-sm shadow-amber-500/20'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <BarChart3 className="w-3.5 h-3.5" />
              <span>Comparative Bars</span>
            </button>
            <button
              onClick={() => setChartView('trend')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-bold transition-all ${
                chartView === 'trend'
                  ? 'bg-gradient-to-r from-emerald-500 to-emerald-600 text-slate-950 font-bold shadow-sm shadow-emerald-500/20'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <LineChart className="w-3.5 h-3.5" />
              <span>Profit Trend Curve</span>
            </button>
          </div>
        </div>
      </div>

      {/* Aggregate KPI Strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 relative z-10">
        {/* Sales */}
        <div className="p-3.5 rounded-xl bg-[#070A12] border border-white/10 relative overflow-hidden group">
          <div className="flex items-center justify-between text-slate-400 text-[11px] uppercase font-bold">
            <span>Total Sales (AED)</span>
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
          </div>
          <div className="text-lg sm:text-xl font-mono font-bold text-white mt-1">
            AED {formatCurrency(totalSales)}
          </div>
          <div className="text-[10px] text-slate-500 mt-0.5">
            {chartData.length} Converted Invoice{chartData.length !== 1 ? 's' : ''}
          </div>
        </div>

        {/* Purchase Cost */}
        <div className="p-3.5 rounded-xl bg-[#070A12] border border-white/10 relative overflow-hidden group">
          <div className="flex items-center justify-between text-slate-400 text-[11px] uppercase font-bold">
            <span>Purchase Cost (AED)</span>
            <span className="w-2 h-2 rounded-full bg-amber-400" />
          </div>
          <div className="text-lg sm:text-xl font-mono font-bold text-amber-400 mt-1">
            AED {formatCurrency(totalCost)}
          </div>
          <div className="text-[10px] text-slate-500 mt-0.5">
            Admin Acquisition Cost (COGS)
          </div>
        </div>

        {/* Total Profit */}
        <div className="p-3.5 rounded-xl bg-gradient-to-br from-emerald-500/10 via-[#070A12] to-emerald-500/5 border border-emerald-500/30 relative overflow-hidden group shadow-lg shadow-emerald-500/5">
          <div className="flex items-center justify-between text-emerald-400 text-[11px] uppercase font-bold">
            <span className="flex items-center gap-1">
              <TrendingUp className="w-3.5 h-3.5" />
              Total Net Profit
            </span>
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
          </div>
          <div className="text-lg sm:text-xl font-mono font-black text-emerald-300 mt-1">
            AED {formatCurrency(totalProfit)}
          </div>
          <div className="text-[10px] text-emerald-400/80 font-mono mt-0.5">
            Formula: Sales − Total Purchase Rate
          </div>
        </div>

        {/* Profit Margin */}
        <div className="p-3.5 rounded-xl bg-[#070A12] border border-white/10 relative overflow-hidden group">
          <div className="flex items-center justify-between text-slate-400 text-[11px] uppercase font-bold">
            <span>Gross Profit Margin</span>
            <Percent className="w-3.5 h-3.5 text-cyan-400" />
          </div>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-lg sm:text-xl font-mono font-bold text-cyan-300">
              {overallMargin}%
            </span>
            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-bold">
              {Number(overallMargin) > 25 ? 'High Margin' : 'Standard Margin'}
            </span>
          </div>
          <div className="text-[10px] text-slate-500 mt-0.5">
            Net Margin Realized
          </div>
        </div>
      </div>

      {/* Main Chart Area */}
      <div className="relative z-10">
        {chartData.length === 0 ? (
          <div className="h-64 rounded-xl bg-[#070A12] border border-white/10 flex flex-col items-center justify-center p-6 text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
              <Info className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-bold text-white text-sm">
                No Converted Sales Invoices in this Calendar Range
              </h4>
              <p className="text-xs text-slate-400 max-w-md mt-1">
                Profit and analytics graphs visualize realized sales invoices. There are currently no
                invoices matching this time window.
              </p>
            </div>
            {onResetDateRange && (
              <button
                onClick={onResetDateRange}
                className="px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 text-xs font-bold text-white transition-all"
              >
                Reset Date Filter to All Time
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-3">
            {/* Legend & Interactive Hover Ribbon */}
            <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
              <div className="flex flex-wrap items-center gap-4">
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded bg-emerald-500 inline-block shadow-sm shadow-emerald-500/50" />
                  <span className="text-slate-300 font-medium">Sales Invoice (Revenue)</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded bg-amber-500 inline-block shadow-sm shadow-amber-500/50" />
                  <span className="text-slate-300 font-medium">Purchase Rate (Cost)</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded bg-cyan-400 inline-block shadow-sm shadow-cyan-400/50" />
                  <span className="text-slate-300 font-medium">Net Realized Profit</span>
                </div>
              </div>

              {activeItem && (
                <div className="flex items-center gap-2 bg-[#070A12] border border-emerald-500/30 px-3 py-1 rounded-lg text-[11px] font-mono text-white animate-fadeIn">
                  <span className="text-slate-400">{activeItem.invoiceNumber}:</span>
                  <span className="text-emerald-400 font-bold">
                    Sales: AED {formatCurrency(activeItem.sales)}
                  </span>
                  <span className="text-slate-500">|</span>
                  <span className="text-amber-400 font-bold">
                    Cost: AED {formatCurrency(activeItem.cost)}
                  </span>
                  <span className="text-slate-500">|</span>
                  <span className="text-cyan-300 font-black">
                    Profit: AED {formatCurrency(activeItem.profit)} ({activeItem.margin}%)
                  </span>
                </div>
              )}
            </div>

            {/* SVG Visual Canvas */}
            <div className="w-full overflow-x-auto rounded-xl bg-[#070A12] border border-white/10 p-2 sm:p-4">
              <svg
                viewBox={`0 0 ${svgWidth} ${svgHeight}`}
                className="w-full h-auto min-w-[650px] select-none"
              >
                <defs>
                  {/* Gradients */}
                  <linearGradient id="profitAreaGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#06b6d4" stopOpacity="0.45" />
                    <stop offset="70%" stopColor="#10b981" stopOpacity="0.15" />
                    <stop offset="100%" stopColor="#10b981" stopOpacity="0.0" />
                  </linearGradient>

                  <linearGradient id="barSalesGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#10b981" />
                    <stop offset="100%" stopColor="#047857" />
                  </linearGradient>

                  <linearGradient id="barCostGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#f59e0b" />
                    <stop offset="100%" stopColor="#b45309" />
                  </linearGradient>

                  <linearGradient id="barProfitGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#22d3ee" />
                    <stop offset="100%" stopColor="#059669" />
                  </linearGradient>
                </defs>

                {/* Horizontal Grid Lines & Ticks */}
                {yTicks.map((tick, i) => {
                  const y = getY(tick);
                  return (
                    <g key={i}>
                      <line
                        x1={padding.left}
                        y1={y}
                        x2={svgWidth - padding.right}
                        y2={y}
                        stroke="rgba(255, 255, 255, 0.08)"
                        strokeDasharray={i === 0 ? 'none' : '4,4'}
                      />
                      <text
                        x={padding.left - 10}
                        y={y + 4}
                        textAnchor="end"
                        className="text-[10px] font-mono fill-slate-500"
                      >
                        {formatCurrency(tick)}
                      </text>
                    </g>
                  );
                })}

                {/* CHART VIEW A: COMPARATIVE BARS */}
                {chartView === 'bars' && (
                  <g>
                    {chartData.map((d, i) => {
                      // Total width allocated per data slot
                      const slotWidth = plotWidth / chartData.length;
                      const slotX = padding.left + i * slotWidth;
                      const groupPadding = Math.max(12, slotWidth * 0.18);
                      const barGroupWidth = slotWidth - groupPadding * 2;
                      const singleBarWidth = Math.min(24, Math.max(8, barGroupWidth / 3 - 2));

                      const startX = slotX + (slotWidth - singleBarWidth * 3 - 4) / 2;

                      // Bar heights
                      const salesH = (d.sales / maxVal) * plotHeight;
                      const costH = (d.cost / maxVal) * plotHeight;
                      const profitH = (d.profit / maxVal) * plotHeight;

                      const isHovered = hoveredIndex === i;

                      return (
                        <g
                          key={d.id || i}
                          onMouseEnter={() => setHoveredIndex(i)}
                          onMouseLeave={() => setHoveredIndex(null)}
                          className="cursor-pointer"
                        >
                          {/* Hover highlight background column */}
                          {isHovered && (
                            <rect
                              x={slotX + 4}
                              y={padding.top}
                              width={slotWidth - 8}
                              height={plotHeight}
                              fill="rgba(255, 255, 255, 0.04)"
                              rx="6"
                            />
                          )}

                          {/* 1. Sales Bar (Emerald) */}
                          <rect
                            x={startX}
                            y={padding.top + plotHeight - salesH}
                            width={singleBarWidth}
                            height={salesH}
                            fill="url(#barSalesGrad)"
                            rx="3"
                            className="transition-all hover:brightness-125"
                          />

                          {/* 2. Purchase Cost Bar (Amber) */}
                          <rect
                            x={startX + singleBarWidth + 2}
                            y={padding.top + plotHeight - costH}
                            width={singleBarWidth}
                            height={costH}
                            fill="url(#barCostGrad)"
                            rx="3"
                            className="transition-all hover:brightness-125"
                          />

                          {/* 3. Profit Bar (Cyan/Emerald) */}
                          <rect
                            x={startX + (singleBarWidth + 2) * 2}
                            y={padding.top + plotHeight - profitH}
                            width={singleBarWidth}
                            height={profitH}
                            fill="url(#barProfitGrad)"
                            rx="3"
                            className="transition-all hover:brightness-125"
                          />

                          {/* X-axis Label */}
                          <text
                            x={slotX + slotWidth / 2}
                            y={svgHeight - 15}
                            textAnchor="middle"
                            className={`text-[10px] font-mono transition-colors ${
                              isHovered ? 'fill-amber-400 font-bold' : 'fill-slate-400'
                            }`}
                          >
                            {d.dateLabel || d.invoiceNumber}
                          </text>

                          {/* Secondary Invoice Sub-label */}
                          <text
                            x={slotX + slotWidth / 2}
                            y={svgHeight - 4}
                            textAnchor="middle"
                            className="text-[8.5px] font-mono fill-slate-500"
                          >
                            {d.invoiceNumber}
                          </text>
                        </g>
                      );
                    })}
                  </g>
                )}

                {/* CHART VIEW B: PROFIT TREND CURVE */}
                {chartView === 'trend' && (
                  <g>
                    {/* Profit Gradient Filled Area */}
                    {chartData.length > 1 && (
                      <path d={profitAreaPath} fill="url(#profitAreaGrad)" />
                    )}

                    {/* Sales Curve */}
                    <path
                      d={salesPath}
                      fill="none"
                      stroke="#10b981"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                    />

                    {/* Cost Curve */}
                    <path
                      d={costPath}
                      fill="none"
                      stroke="#f59e0b"
                      strokeWidth="2"
                      strokeDasharray="4,4"
                      strokeLinecap="round"
                    />

                    {/* Profit Curve */}
                    <path
                      d={profitPath}
                      fill="none"
                      stroke="#06b6d4"
                      strokeWidth="3"
                      strokeLinecap="round"
                    />

                    {/* Data Points */}
                    {chartData.map((d, i) => {
                      const x = getX(i);
                      const ySales = getY(d.sales);
                      const yCost = getY(d.cost);
                      const yProfit = getY(d.profit);
                      const isHovered = hoveredIndex === i;

                      return (
                        <g
                          key={d.id || i}
                          onMouseEnter={() => setHoveredIndex(i)}
                          onMouseLeave={() => setHoveredIndex(null)}
                          className="cursor-pointer"
                        >
                          {/* Vertical guide line on hover */}
                          {isHovered && (
                            <line
                              x1={x}
                              y1={padding.top}
                              x2={x}
                              y2={padding.top + plotHeight}
                              stroke="rgba(255, 255, 255, 0.25)"
                              strokeDasharray="3,3"
                            />
                          )}

                          {/* Sales point */}
                          <circle
                            cx={x}
                            cy={ySales}
                            r={isHovered ? 6 : 4}
                            fill="#10b981"
                            stroke="#070A12"
                            strokeWidth="2"
                          />

                          {/* Cost point */}
                          <circle
                            cx={x}
                            cy={yCost}
                            r={isHovered ? 5 : 3.5}
                            fill="#f59e0b"
                            stroke="#070A12"
                            strokeWidth="2"
                          />

                          {/* Profit point */}
                          <circle
                            cx={x}
                            cy={yProfit}
                            r={isHovered ? 7 : 5}
                            fill="#06b6d4"
                            stroke="#ffffff"
                            strokeWidth="2"
                          />

                          {/* X-axis Label */}
                          <text
                            x={x}
                            y={svgHeight - 15}
                            textAnchor="middle"
                            className={`text-[10px] font-mono transition-colors ${
                              isHovered ? 'fill-cyan-300 font-bold' : 'fill-slate-400'
                            }`}
                          >
                            {d.dateLabel || d.invoiceNumber}
                          </text>

                          <text
                            x={x}
                            y={svgHeight - 4}
                            textAnchor="middle"
                            className="text-[8.5px] font-mono fill-slate-500"
                          >
                            {d.invoiceNumber}
                          </text>
                        </g>
                      );
                    })}
                  </g>
                )}
              </svg>
            </div>
          </div>
        )}
      </div>

      {/* Footer Info & Formula Note */}
      <div className="pt-3 border-t border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-[11px] text-slate-400">
        <div className="flex items-center gap-2">
          <span className="font-mono font-bold text-amber-400">VAT (5%):</span>
          <span>Invoices reflect standard 5% UAE VAT.</span>
          <span className="text-slate-600">•</span>
          <span className="font-mono text-emerald-400">
            Profit = Sales Invoice Grand Total − Sum(Purchase Rate × Qty)
          </span>
        </div>
        <div className="font-mono text-slate-500">
          Auto-synchronized with Delitrade ERP & Stock Engine
        </div>
      </div>
    </div>
  );
}
