"use client";

import { ReactNode, memo } from "react";
import { Column } from "../../types/superadmin";

type DataTableProps<T> = {
  columns: Column<T>[];
  data: T[];
  loading?: boolean;
  emptyText?: string;
  rowKey?: (row: T, index: number) => string | number;
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
}: DataTableProps<T>) {
  const getKey = (row: T, index: number) =>
    rowKey ? rowKey(row, index) : index;

  return (
    <div className="w-full">
      {/* ================= DESKTOP TABLE ================= */}
      <div
        className="
          hidden md:block overflow-x-auto
          rounded-2xl border border-white/10
          bg-white/5 backdrop-blur-xl
          shadow-xl
        "
      >
        <table className="w-full text-sm border-collapse">
          <thead className="border-b border-white/10">
            <tr>
              {columns.map((col, i) => (
                <th
                  key={i}
                  scope="col"
                  className={`
                    p-4 font-medium text-white
                    ${ALIGN_CLASS[col.align ?? "left"]}
                  `}
                >
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            {loading && (
              <tr>
                <td
                  colSpan={columns.length}
                  className="p-6 text-center text-white/60"
                >
                  Loading...
                </td>
              </tr>
            )}

            {!loading && data.length === 0 && (
              <tr>
                <td
                  colSpan={columns.length}
                  className="p-6 text-center text-white/60"
                >
                  {emptyText}
                </td>
              </tr>
            )}

            {!loading &&
              data.map((row, rowIndex) => (
                <tr
                  key={getKey(row, rowIndex)}
                  className="
                    border-t border-white/10
                    hover:bg-white/5
                    transition-colors
                  "
                >
                  {columns.map((col, colIndex) => (
                    <td
                      key={colIndex}
                      className={`
                        p-4 text-white
                        ${ALIGN_CLASS[col.align ?? "left"]}
                      `}
                    >
                      {col.render
                        ? col.render(row, rowIndex)
                        : (row[col.accessor as keyof T] as ReactNode)}
                    </td>
                  ))}
                </tr>
              ))}
          </tbody>
        </table>
      </div>

      {/* ================= MOBILE CARDS ================= */}
      <div className="md:hidden space-y-4">
        {loading && (
          <div className="p-4 text-center text-white/60">Loading...</div>
        )}

        {!loading && data.length === 0 && (
          <div className="p-4 text-center text-white/60">
            {emptyText}
          </div>
        )}

        {!loading &&
          data.map((row, rowIndex) => (
            <div
              key={getKey(row, rowIndex)}
              className="
                rounded-2xl p-4
                border border-white/10
                bg-gradient-to-br
                from-purple-600/25 via-indigo-600/20 to-pink-600/20
                backdrop-blur-xl
                shadow-lg
              "
              role="group"
              aria-label={`Row ${rowIndex + 1}`}
            >
              <div className="space-y-2">
                {columns.map(
                  (col, colIndex) =>
                    !col.hideOnMobile && (
                      <div
                        key={colIndex}
                        className="flex justify-between gap-3"
                      >
                        <span className="text-xs text-white/60">
                          {col.header}
                        </span>
                        <span className="text-sm text-white text-right">
                          {col.render
                            ? col.render(row, rowIndex)
                            : (row[col.accessor as keyof T] as ReactNode)}
                        </span>
                      </div>
                    )
                )}
              </div>
            </div>
          ))}
      </div>
    </div>
  );
}

export default memo(DataTable) as typeof DataTable;
