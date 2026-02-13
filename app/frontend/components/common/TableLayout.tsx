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
  showMobile?: boolean;
  container?: boolean;
  rounded?: boolean; // ✅ NEW PROP
  containerClassName?: string;
  tableClassName?: string;
  theadClassName?: string;
  thClassName?: string;
  tbodyClassName?: string;
  rowClassName?: string;
  tdClassName?: string;
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
  showMobile = true,
  container = true,
  rounded = true, // ✅ default true
  containerClassName = "",
  tableClassName = "",
  theadClassName = "",
  thClassName = "",
  tbodyClassName = "",
  rowClassName = "",
  tdClassName = "",
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
      <div
        className={`hidden md:block ${
          container
            ? `
              ${rounded ? "rounded-3xl" : "rounded-none"}
              overflow-hidden
              border border-white/10
              bg-transparent backdrop-blur-xl shadow-2xl
            `
            : "w-full"
        } ${containerClassName}`}
      >

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
          className={`w-full text-sm border-collapse ${tableClassName}`}
          aria-busy={loading}
        >
          {caption && <caption className="sr-only">{caption}</caption>}

          <thead className={`bg-white/5 border-b border-white/10 ${theadClassName}`}>
            <tr>
              {columns.map((col, i) => (
                <th
                  key={i}
                  scope="col"
                  className={`px-6 py-4 text-xs font-semibold text-gray-400 uppercase tracking-wider ${ALIGN_CLASS[
                    col.align ?? "left"
                  ]} ${thClassName}`}
                >
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>

          <tbody className={`divide-y divide-white/10 ${tbodyClassName}`}>

            {loading && (
              <tr>
                <td colSpan={columns.length} className="p-8 text-center text-white/60">
                  <Spinner size={26} label="Loading..." />
                </td>
              </tr>
            )}

            {!loading && data.length === 0 && (
              <tr>
                <td colSpan={columns.length} className="p-8 text-center text-white/60">
                  {emptyText}
                </td>
              </tr>
            )}

            {!loading &&
              data.map((row, rowIndex) => (
                <tr
                  key={getKey(row, rowIndex)}
                  className={`hover:bg-white/5 transition-colors duration-200 ${rowClassName}`}
                >
                  {columns.map((col, colIndex) => (
                    <td
                      key={colIndex}
                      className={`px-6 py-4 whitespace-nowrap ${ALIGN_CLASS[
                        col.align ?? "left"
                      ]} ${tdClassName}`}
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
      {showMobile && (
        <div className="md:hidden space-y-4">
          {!loading &&
            data.map((row, index) => (
              <div
                key={getKey(row, index)}
                className={`
                  ${rounded ? "rounded-2xl" : "rounded-none"}
                  p-4 border border-white/10
                  bg-gradient-to-br from-purple-600/25 via-indigo-600/20 to-pink-600/20
                  backdrop-blur-xl shadow-lg transition hover:shadow-xl
                `}
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
      )}
    </div>
  );
}

export default memo(DataTable) as typeof DataTable;
