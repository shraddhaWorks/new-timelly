"use client";

import { ReactNode, memo } from "react";
import { Column } from "../../types/superadmin";
import Spinner from "./Spinner";

type DataTableProps<T> = {
  columns: Column<T>[];
  data: T[];
  loading?: boolean;
  emptyText?: string;
  rowKey?: (row: T, index: number) => string | number;
  caption?: string;
  tableTitle?: string;
  tableSubtitle?: string;
  pagination?: {
    page: number;
    totalPages: number;
    onChange: (page: number) => void;
  };
};

const ALIGN_CLASS = {
  left: "text-left",
  center: "text-center",
  right: "text-right",
} as const;

function DataTable<T>({
  columns,
  data,
  loading = false,
  emptyText = "No data found",
  rowKey,
  caption,
  tableTitle,
  tableSubtitle,
  pagination,
}: DataTableProps<T>) {

  const getKey = (row: T, index: number) => {
    if (rowKey) return rowKey(row, index);
    if ((row as any)?.id) return (row as any).id;
    return `row-${index}`;
  };

  const renderCell = (col: Column<T>, row: T, rowIndex: number) => {
    if (col.render) return col.render(row, rowIndex);
    const value = row[col.accessor as keyof T];
    return value as ReactNode;
  };

  return (
    <div className="w-full space-y-4">

      {/* DESKTOP TABLE */}
      <div className="hidden md:block rounded-3xl overflow-hidden border border-white/10 bg-transparent backdrop-blur-xl shadow-2xl">
        {tableTitle && (
          <div className="p-5 border-b border-white/10">
            <div className="text-lg font-semibold text-white">
              {tableTitle}
            </div>
            {tableSubtitle && (
              <div className="text-xs text-white/60 mt-1">
                {tableSubtitle}
              </div>
            )}
          </div>
        )}

        <table
          className="w-full text-sm border-collapse"
          aria-busy={loading}
        >
          {caption && (
            <caption className="sr-only">{caption}</caption>
          )}

          <thead className="bg-white/5 border-b border-white/10">
            <tr>
              {columns.map((col, i) => (
                <th
                  key={i}
                  scope="col"
                  className={`px-6 py-4 text-xs font-semibold text-gray-400 uppercase tracking-wider ${ALIGN_CLASS[col.align ?? "left"]
                    }`}
                >
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>


          <tbody className="divide-y divide-white/10">

            {loading && (
              <tr>
                <td
                  colSpan={columns.length}
                  className="p-8 text-center text-white/60"
                >
                  <Spinner size={26} label="Loading..." />
                </td>
              </tr>
            )}

            {!loading && data.length === 0 && (
              <tr>
                <td
                  colSpan={columns.length}
                  className="p-8 text-center text-white/60"
                >
                  {emptyText}
                </td>
              </tr>
            )}

            {!loading &&
              data.map((row, rowIndex) => (
                <tr
                  key={getKey(row, rowIndex)}
                  className="hover:bg-white/5 transition-colors duration-200"
                >
                  {columns.map((col, colIndex) => (
                    <td
                      key={colIndex}
                      className={`px-6 py-4 whitespace-nowrap ${ALIGN_CLASS[col.align ?? "left"]
                        }`}
                    >
                      {renderCell(col, row, rowIndex)}
                    </td>
                  ))}
                </tr>
              ))}
          </tbody>
        </table>
      </div>

      {/* MOBILE CARDS */}
      <div className="md:hidden space-y-4">

        {loading && (
          <div className="flex justify-center py-10">
            <Spinner size={26} label="Loading..." />
          </div>
        )}

        {!loading && data.length === 0 && (
          <div className="text-center py-10 text-white/60">
            {emptyText}
          </div>
        )}

        {!loading &&
          data.map((row, index) => (
            <div
              key={getKey(row, index)}
              className="rounded-2xl p-4 border border-white/10 bg-gradient-to-br from-purple-600/25 via-indigo-600/20 to-pink-600/20 backdrop-blur-xl shadow-lg transition hover:shadow-xl"
            >
              {columns.map(
                (col, colIndex) =>
                  !col.hideOnMobile && (
                    <div
                      key={colIndex}
                      className="flex justify-between text-sm py-1"
                    >
                      <span className="text-white/60">
                        {col.header}
                      </span>
                      <span className="text-white text-right">
                        {renderCell(col, row, index)}
                      </span>
                    </div>
                  )
              )}
            </div>
          ))}
      </div>

      {/* PAGINATION */}
      {pagination && pagination.totalPages > 1 && (
        <div className="flex justify-end items-center gap-3 pt-2">

          <button
            aria-label="Previous page"
            disabled={pagination.page === 1}
            onClick={() =>
              pagination.onChange(pagination.page - 1)
            }
            className="px-3 py-1.5 rounded-lg bg-white/10 text-white hover:bg-white/20 transition disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Prev
          </button>

          <span className="text-white/70 text-sm">
            {pagination.page} / {pagination.totalPages}
          </span>

          <button
            aria-label="Next page"
            disabled={pagination.page === pagination.totalPages}
            onClick={() =>
              pagination.onChange(pagination.page + 1)
            }
            className="px-3 py-1.5 rounded-lg bg-lime-400 text-black font-medium hover:bg-lime-300 transition disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}

export default memo(DataTable) as typeof DataTable;
