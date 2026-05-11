"use client";

import { useMemo } from "react";
import { formatNumber } from "@/lib/utils";
import type { StoredBatch } from "@/lib/viewingKey";

type Point = { label: string; value: number };

const DAY_MS = 24 * 60 * 60 * 1000;

function getBatchTotal(batch: StoredBatch): number {
  return batch.result.entries.reduce((acc, entry) => acc + entry.amount, 0);
}

function formatCompactUSD(value: number): string {
  return new Intl.NumberFormat(undefined, {
    style: "currency",
    currency: "USD",
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(value);
}

function getLast30DayTrend(batches: StoredBatch[]): Point[] {
  const today = new Date();
  const end = new Date(today.getFullYear(), today.getMonth(), today.getDate()).getTime();
  const start = end - 29 * DAY_MS;
  const map = new Map<number, number>();

  for (let i = 0; i < 30; i += 1) {
    const ts = start + i * DAY_MS;
    map.set(ts, 0);
  }

  for (const batch of batches) {
    const day = new Date(batch.result.timestamp);
    const dayTs = new Date(day.getFullYear(), day.getMonth(), day.getDate()).getTime();
    if (dayTs < start || dayTs > end) continue;
    map.set(dayTs, (map.get(dayTs) ?? 0) + getBatchTotal(batch));
  }

  return Array.from(map.entries()).map(([ts, value]) => ({
    label: new Date(ts).toLocaleDateString(undefined, { month: "short", day: "numeric" }),
    value,
  }));
}

function toLinePath(points: Point[], width: number, height: number, padding: number): string {
  if (points.length === 0) return "";
  const max = Math.max(...points.map((p) => p.value), 1);
  const innerW = width - padding * 2;
  const innerH = height - padding * 2;

  return points
    .map((point, idx) => {
      const x = padding + (idx / Math.max(points.length - 1, 1)) * innerW;
      const y = padding + (1 - point.value / max) * innerH;
      return `${idx === 0 ? "M" : "L"}${x.toFixed(2)} ${y.toFixed(2)}`;
    })
    .join(" ");
}

function toAreaPath(points: Point[], width: number, height: number, padding: number): string {
  if (points.length === 0) return "";
  const line = toLinePath(points, width, height, padding);
  const innerW = width - padding * 2;
  const lastX = padding + innerW;
  const baseY = height - padding;
  return `${line} L ${lastX.toFixed(2)} ${baseY.toFixed(2)} L ${padding.toFixed(2)} ${baseY.toFixed(2)} Z`;
}

function tokenSplit(batches: StoredBatch[]): { usdc: number; usdt: number } {
  let usdc = 0;
  let usdt = 0;

  for (const batch of batches) {
    for (const entry of batch.result.entries) {
      if (entry.token === "USDC") usdc += entry.amount;
      if (entry.token === "USDT") usdt += entry.amount;
    }
  }

  return { usdc, usdt };
}

export function ExecutiveInsights({ batches }: { batches: StoredBatch[] }) {
  const analytics = useMemo(() => {
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).getTime();
    const monthBatches = batches.filter((b) => b.result.timestamp >= monthStart);

    const monthTotal = monthBatches.reduce((acc, b) => acc + getBatchTotal(b), 0);
    const teamSet = new Set<string>();
    for (const batch of monthBatches) {
      for (const entry of batch.result.entries) {
        teamSet.add(entry.wallet);
      }
    }

    const totalEverDisbursed = batches.reduce((acc, b) => acc + getBatchTotal(b), 0);
    const pendingBatches = batches.filter((b) =>
      b.result.entries.some((entry) => entry.status === "pending")
    ).length;

    const trend = getLast30DayTrend(batches);
    const trendMax = Math.max(...trend.map((p) => p.value), 1);
    const linePath = toLinePath(trend, 640, 240, 18);
    const areaPath = toAreaPath(trend, 640, 240, 18);

    const split = tokenSplit(batches);
    const splitTotal = split.usdc + split.usdt;
    const usdcPct = splitTotal > 0 ? (split.usdc / splitTotal) * 100 : 0;
    const usdtPct = splitTotal > 0 ? (split.usdt / splitTotal) * 100 : 0;

    const radius = 56;
    const circumference = 2 * Math.PI * radius;
    const usdcDash = (usdcPct / 100) * circumference;

    return {
      monthTotal,
      teamsThisMonth: teamSet.size,
      totalEverDisbursed,
      pendingBatches,
      trend,
      trendMax,
      linePath,
      areaPath,
      split,
      usdcPct,
      usdtPct,
      circumference,
      usdcDash,
    };
  }, [batches]);

  const startLabel = analytics.trend[0]?.label ?? "-";
  const endLabel = analytics.trend[analytics.trend.length - 1]?.label ?? "-";

  return (
    <section className="card rounded-2xl p-5 sm:p-6 flex flex-col gap-5" aria-label="Executive insights">
      <div className="flex flex-col gap-1">
        <p className="step-num uppercase tracking-widest">Executive Snapshot</p>
        <h2 className="text-2xl font-bold" style={{ color: "var(--text-main)" }}>
          You disbursed {formatCompactUSD(analytics.monthTotal)} to {formatNumber(analytics.teamsThisMonth, 0)} teams this month
        </h2>
        <p className="text-sm" style={{ color: "var(--text-muted)" }}>
          Real-time executive analytics from your private payroll vault.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div
          className="rounded-xl p-4 flex flex-col gap-2"
          style={{ border: "1px solid var(--border-dim)", background: "var(--surface)" }}
        >
          <p className="text-xs uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>
            Total Ever Disbursed
          </p>
          <p className="text-2xl font-bold" style={{ color: "var(--text-main)" }}>
            {formatCompactUSD(analytics.totalEverDisbursed)}
          </p>
        </div>

        <div
          className="rounded-xl p-4 flex flex-col gap-2"
          style={{ border: "1px solid var(--border-dim)", background: "var(--surface)" }}
        >
          <p className="text-xs uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>
            Pending Batches
          </p>
          <p className="text-2xl font-bold" style={{ color: "var(--text-main)" }}>
            {formatNumber(analytics.pendingBatches, 0)}
          </p>
        </div>

        <div
          className="rounded-xl p-4 flex flex-col gap-2"
          style={{ border: "1px solid var(--border-dim)", background: "var(--surface)" }}
        >
          <p className="text-xs uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>
            30D Peak Daily Disbursement
          </p>
          <p className="text-2xl font-bold" style={{ color: "var(--text-main)" }}>
            {formatCompactUSD(analytics.trendMax)}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        <div
          className="xl:col-span-2 rounded-xl p-4"
          style={{ border: "1px solid var(--border-dim)", background: "var(--surface)" }}
        >
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm font-semibold" style={{ color: "var(--text-main)" }}>
              Trending disbursements by day (last 30 days)
            </p>
            <p className="text-xs" style={{ color: "var(--text-muted)" }}>
              {startLabel} - {endLabel}
            </p>
          </div>
          <svg viewBox="0 0 640 240" className="w-full h-52" role="img" aria-label="30 day disbursement trend chart">
            <defs>
              <linearGradient id="trendFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="rgba(124,58,237,0.35)" />
                <stop offset="100%" stopColor="rgba(124,58,237,0.04)" />
              </linearGradient>
            </defs>
            <line x1="18" y1="18" x2="18" y2="222" stroke="rgba(124,58,237,0.25)" strokeWidth="1" />
            <line x1="18" y1="222" x2="622" y2="222" stroke="rgba(124,58,237,0.25)" strokeWidth="1" />
            <line x1="18" y1="120" x2="622" y2="120" stroke="rgba(124,58,237,0.15)" strokeDasharray="4 6" strokeWidth="1" />
            {analytics.areaPath && <path d={analytics.areaPath} fill="url(#trendFill)" />}
            {analytics.linePath && <path d={analytics.linePath} fill="none" stroke="#8b5cf6" strokeWidth="3" strokeLinecap="round" />}
          </svg>
        </div>

        <div
          className="rounded-xl p-4 flex flex-col gap-3"
          style={{ border: "1px solid var(--border-dim)", background: "var(--surface)" }}
        >
          <p className="text-sm font-semibold" style={{ color: "var(--text-main)" }}>
            Token breakdown (USDC vs USDT)
          </p>
          <div className="flex items-center justify-center py-2">
            <svg viewBox="0 0 160 160" className="w-40 h-40" role="img" aria-label="USDC versus USDT pie chart">
              <circle cx="80" cy="80" r="56" fill="none" stroke="rgba(124,58,237,0.15)" strokeWidth="24" />
              <circle
                cx="80"
                cy="80"
                r="56"
                fill="none"
                stroke="#7c3aed"
                strokeWidth="24"
                strokeDasharray={`${analytics.usdcDash} ${analytics.circumference}`}
                transform="rotate(-90 80 80)"
              />
              <circle cx="80" cy="80" r="38" fill="rgba(10,14,36,0.82)" />
              <text x="80" y="84" textAnchor="middle" fill="#e2e8f0" fontSize="12" fontWeight="700">
                {formatNumber(analytics.usdcPct + analytics.usdtPct, 0)}%
              </text>
            </svg>
          </div>
          <div className="space-y-1.5 text-sm">
            <div className="flex items-center justify-between">
              <span style={{ color: "#a78bfa" }}>USDC</span>
              <span style={{ color: "var(--text-main)" }}>
                {formatCompactUSD(analytics.split.usdc)} ({formatNumber(analytics.usdcPct, 1)}%)
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span style={{ color: "#38bdf8" }}>USDT</span>
              <span style={{ color: "var(--text-main)" }}>
                {formatCompactUSD(analytics.split.usdt)} ({formatNumber(analytics.usdtPct, 1)}%)
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
