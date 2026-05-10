"use client";

/**
 * DataGrid Component — Flexible, reusable table component
 *
 * Replaces PayrollPreviewTable, AuditReportTable, and similar custom implementations.
 * Provides sorting, filtering, editing, and customizable rendering.
 */

import { BACKGROUND, BRAND } from "@/lib/design";
import { ReactNode, useMemo, useState } from "react";

export interface Column<T> {
  /** Unique column identifier */
  key: string;
  /** Display header label */
  label: string;
  /** Data accessor (string key or function) */
  accessor: keyof T | ((item: T) => unknown);
  /** Column width (CSS) */
  width?: string;
  /** Cell renderer */
  render?: (value: unknown, item: T, rowIndex: number) => ReactNode;
  /** Make column sortable */
  sortable?: boolean;
  /** Make column hideable */
  hideable?: boolean;
  /** Text alignment */
  align?: "left" | "center" | "right";
  /** Custom className for cells */
  className?: string;
}

interface DataGridProps<T extends { id?: string | number }> {
  /** Array of data to display */
  data: T[];
  /** Column definitions */
  columns: Column<T>[];
  /** Row click handler */
  onRowClick?: (item: T, rowIndex: number) => void;
  /** Custom row renderer */
  rowRenderer?: (item: T, rowIndex: number, defaultRow: ReactNode) => ReactNode;
  /** Empty state message */
  emptyMessage?: string;
  /** Show header */
  showHeader?: boolean;
  /** Striped rows */
  striped?: boolean;
  /** Hover effects */
  hoverable?: boolean;
  /** Show row numbers */
  showRowNumbers?: boolean;
  /** Max height with scroll */
  maxHeight?: string;
  /** Additional className */
  className?: string;
  /** Loading state */
  isLoading?: boolean;
}

export function DataGrid<T extends { id?: string | number }>({
  data,
  columns,
  onRowClick,
  rowRenderer,
  emptyMessage = "No data to display",
  showHeader = true,
  striped = false,
  hoverable = true,
  showRowNumbers = false,
  maxHeight,
  className,
  isLoading = false,
}: DataGridProps<T>) {
  const [sortKey, setSortKey] = useState<string | null>(null);
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [visibleColumns, setVisibleColumns] = useState<Set<string>>(
    new Set(columns.map((c) => c.key))
  );

  // Sort data
  const sortedData = useMemo(() => {
    if (!sortKey) return data;

    const col = columns.find((c) => c.key === sortKey);
    if (!col) return data;

    return [...data].sort((a, b) => {
      let aVal = typeof col.accessor === "function" ? col.accessor(a) : a[col.accessor as keyof T];
      let bVal = typeof col.accessor === "function" ? col.accessor(b) : b[col.accessor as keyof T];

      // Handle null/undefined
      if (aVal == null) aVal = "";
      if (bVal == null) bVal = "";

      // Compare
      const comparison =
        aVal < bVal ? -1 : aVal > bVal ? 1 : 0;
      return sortOrder === "asc" ? comparison : -comparison;
    });
  }, [data, sortKey, sortOrder, columns]);

  // Filter visible columns
  const visibleCols = useMemo(
    () => columns.filter((c) => visibleColumns.has(c.key)),
    [columns, visibleColumns]
  );

  function handleSort(colKey: string) {
    if (sortKey === colKey) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortKey(colKey);
      setSortOrder("asc");
    }
  }

  // Render cell value
  function renderCell(col: Column<T>, item: T, rowIndex: number): ReactNode {
    if (col.render) {
      const value = typeof col.accessor === "function" ? col.accessor(item) : item[col.accessor as keyof T];
      return col.render(value, item, rowIndex);
    }

    const value = typeof col.accessor === "function" ? col.accessor(item) : item[col.accessor as keyof T];
    if (value === null || value === undefined) return "—";
    if (typeof value === "boolean") return value ? "Yes" : "No";
    return String(value);
  }

  const alignClass = {
    left: "text-left",
    center: "text-center",
    right: "text-right",
  };

  // Empty state
  if (sortedData.length === 0 && !isLoading) {
    return (
      <div
        className="rounded-xl p-8 text-center"
        style={{
          background: BACKGROUND.surface,
          border: `1px solid ${BACKGROUND.dim}`,
        }}
        role="status"
      >
        <p className="text-slate-500">{emptyMessage}</p>
      </div>
    );
  }

  // Table wrapper
  const tableContent = (
    <div
      className={`overflow-x-auto ${className || ""}`}
      style={{ maxHeight }}
    >
      <table className="w-full text-sm border-collapse" role="table">
        {/* Header */}
        {showHeader && (
          <thead>
            <tr
              style={{
                borderBottom: `1px solid ${BACKGROUND.dim}`,
                background: BACKGROUND.subtle,
              }}
            >
              {showRowNumbers && (
                <th
                  className="px-4 py-3 text-left text-xs uppercase font-semibold text-slate-500 tracking-wider"
                  style={{ width: "40px" }}
                >
                  #
                </th>
              )}
              {visibleCols.map((col) => (
                <th
                  key={col.key}
                  className={`px-4 py-3 text-xs uppercase font-semibold text-slate-500 tracking-wider cursor-pointer hover:text-slate-400 transition-colors ${
                    col.sortable ? "select-none" : ""
                  } ${alignClass[col.align || "left"]} ${col.className || ""}`}
                  style={{ width: col.width }}
                  onClick={() => col.sortable && handleSort(col.key)}
                  role="columnheader"
                >
                  <div className="flex items-center gap-1">
                    {col.label}
                    {col.sortable && (
                      <svg
                        className={`w-3 h-3 shrink-0 ${
                          sortKey === col.key ? "opacity-100" : "opacity-30"
                        } ${sortKey === col.key && sortOrder === "desc" ? "rotate-180" : ""}`}
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        aria-hidden="true"
                      >
                        <path d="M12 5v14M5 12l7 7 7-7" />
                      </svg>
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
        )}

        {/* Body */}
        <tbody>
          {isLoading ? (
            <tr>
              <td colSpan={visibleCols.length + (showRowNumbers ? 1 : 0)} className="text-center py-8">
                <div className="inline-flex items-center gap-2">
                  <svg
                    className="w-4 h-4 animate-spin"
                    viewBox="0 0 24 24"
                    fill="none"
                  >
                    <circle
                      cx="12"
                      cy="12"
                      r="10"
                      stroke={`${BRAND.lite}50`}
                      strokeWidth="2"
                    />
                    <path
                      d="M12 2a10 10 0 0 1 10 10"
                      stroke={BRAND.lite}
                      strokeWidth="2"
                      strokeLinecap="round"
                    />
                  </svg>
                  <span className="text-slate-400 text-sm">Loading…</span>
                </div>
              </td>
            </tr>
          ) : (
            sortedData.map((item, rowIdx) => {
              const defaultRow = (
                <tr
                  key={item.id || rowIdx}
                  onClick={() => onRowClick?.(item, rowIdx)}
                  style={{
                    borderTop: `1px solid ${BACKGROUND.dimmer}`,
                    background: striped && rowIdx % 2 === 1 ? "rgba(13, 18, 48, 0.3)" : undefined,
                  }}
                  className={hoverable ? "hover:bg-white/2 transition-colors cursor-pointer" : ""}
                >
                  {showRowNumbers && (
                    <td
                      className="px-4 py-3.5 text-slate-600 text-sm font-mono"
                      style={{ width: "40px" }}
                    >
                      {rowIdx + 1}
                    </td>
                  )}
                  {visibleCols.map((col) => (
                    <td
                      key={`${rowIdx}-${col.key}`}
                      className={`px-4 py-3.5 ${alignClass[col.align || "left"]} ${col.className || ""}`}
                    >
                      {renderCell(col, item, rowIdx)}
                    </td>
                  ))}
                </tr>
              );

              return rowRenderer ? rowRenderer(item, rowIdx, defaultRow) : defaultRow;
            })
          )}
        </tbody>
      </table>
    </div>
  );

  // Card wrapper
  return (
    <div
      className="rounded-2xl overflow-hidden"
      style={{
        background: BACKGROUND.surface,
        border: `1px solid ${BACKGROUND.dim}`,
      }}
      role="region"
      aria-label="Data table"
    >
      {tableContent}
    </div>
  );
}

export default DataGrid;
