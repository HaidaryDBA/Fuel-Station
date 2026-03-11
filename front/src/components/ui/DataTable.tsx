import { useState, useMemo, type ReactNode } from "react";
import {
  ChevronUp,
  ChevronDown,
  ChevronsUpDown,
  ChevronLeft,
  ChevronRight,
  Search,
} from "lucide-react";
import Input from "./Input";
import Skeleton from "./Skeleton";

export interface Column<T> {
  key: string;
  header: string;
  sortable?: boolean;
  label: string;
  width?: string;
  render?: (row: T, index: number) => ReactNode;
}

export interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  loading?: boolean;
  searchable?: boolean;
  searchPlaceholder?: string;
  searchKeys?: string[];
  pagination?: boolean;
  pageSize?: number;
  selectable?: boolean;
  selectedRows?: T[];
  onSelectionChange?: (selected: T[]) => void;
  onRowClick?: (row: T) => void;
  emptyMessage?: string;
  className?: string;
  getRowKey?: (row: T) => string | number;
}

export default function DataTable<T extends Record<string, any>>({
  columns,
  data,
  loading = false,
  searchable = false,
  searchPlaceholder = "Search...",
  searchKeys = [],
  pagination = true,
  pageSize = 20,
  selectable = false,
  selectedRows = [],
  onSelectionChange,
  onRowClick,
  emptyMessage = "No data available",
  className = "",
  getRowKey,
}: DataTableProps<T>) {
  const [sortColumn, setSortColumn] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  // Filter data based on search
  const filteredData = useMemo(() => {
    if (!searchQuery || searchKeys.length === 0) return data;

    return data.filter((row) =>
      searchKeys.some((key) => {
        const value = row[key];
        if (typeof value === "string") {
          return value.toLowerCase().includes(searchQuery.toLowerCase());
        }
        if (typeof value === "number") {
          return value.toString().includes(searchQuery);
        }
        return false;
      })
    );
  }, [data, searchQuery, searchKeys]);

  // Sort data
  const sortedData = useMemo(() => {
    if (!sortColumn) return filteredData;

    return [...filteredData].sort((a, b) => {
      const aValue = a[sortColumn];
      const bValue = b[sortColumn];

      if (aValue === bValue) return 0;
      if (aValue === null || aValue === undefined) return 1;
      if (bValue === null || bValue === undefined) return -1;

      const comparison = aValue < bValue ? -1 : 1;
      return sortDirection === "asc" ? comparison : -comparison;
    });
  }, [filteredData, sortColumn, sortDirection]);

  // Paginate data
  const paginatedData = useMemo(() => {
    if (!pagination) return sortedData;

    const start = (currentPage - 1) * pageSize;
    return sortedData.slice(start, start + pageSize);
  }, [sortedData, currentPage, pageSize, pagination]);

  const totalPages = Math.ceil(sortedData.length / pageSize);

  const handleSort = (columnKey: string) => {
    if (sortColumn === columnKey) {
      setSortDirection((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortColumn(columnKey);
      setSortDirection("asc");
    }
  };

  const handleSelectAll = () => {
    if (!onSelectionChange) return;

    if (selectedRows.length === paginatedData.length) {
      onSelectionChange([]);
    } else {
      onSelectionChange([...paginatedData]);
    }
  };

  const handleSelectRow = (row: T) => {
    if (!onSelectionChange) return;

    const rowKey = getRowKey ? getRowKey(row) : JSON.stringify(row);
    const isSelected = selectedRows.some(
      (r) => (getRowKey ? getRowKey(r) : JSON.stringify(r)) === rowKey
    );

    if (isSelected) {
      onSelectionChange(
        selectedRows.filter(
          (r) => (getRowKey ? getRowKey(r) : JSON.stringify(r)) !== rowKey
        )
      );
    } else {
      onSelectionChange([...selectedRows, row]);
    }
  };

  const isRowSelected = (row: T) => {
    const rowKey = getRowKey ? getRowKey(row) : JSON.stringify(row);
    return selectedRows.some(
      (r) => (getRowKey ? getRowKey(r) : JSON.stringify(r)) === rowKey
    );
  };

  const SortIcon = ({ columnKey }: { columnKey: string }) => {
    if (sortColumn !== columnKey) {
      return <ChevronsUpDown className="h-4 w-4 text-muted" />;
    }
    return sortDirection === "asc" ? (
      <ChevronUp className="h-4 w-4 text-primary" />
    ) : (
      <ChevronDown className="h-4 w-4 text-primary" />
    );
  };

  if (loading) {
    return (
      <div className={`rounded-xl border border-border bg-card ${className}`}>
        <div className="space-y-4 p-6">
          <Skeleton height={40} />
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex gap-4">
              <Skeleton width="10%" height={20} />
              <Skeleton width="30%" height={20} />
              <Skeleton width="20%" height={20} />
              <Skeleton width="20%" height={20} />
              <Skeleton width="20%" height={20} />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className={`rounded-xl border border-border bg-card ${className}`}>
      {/* Search */}
      {searchable && (
        <div className="border-b border-border p-4">
          <Input
            placeholder={searchPlaceholder}
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
            leftIcon={<Search className="h-4 w-4" />}
            fullWidth={false}
            className="max-w-sm"
          />
        </div>
      )}

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border bg-surface">
              {selectable && (
                <th className="w-12 px-4 py-3">
                  <input
                    type="checkbox"
                    checked={
                      paginatedData.length > 0 &&
                      selectedRows.length === paginatedData.length
                    }
                    onChange={handleSelectAll}
                    className="h-4 w-4 rounded border-border text-primary focus:ring-primary"
                  />
                </th>
              )}
              {columns.map((column) => (
                <th
                  key={column.key}
                  className={`px-4 py-3 text-left text-sm font-semibold text-text-primary ${
                    column.sortable ? "cursor-pointer select-none" : ""
                  }`}
                  style={{ width: column.width }}
                  onClick={() => column.sortable && handleSort(column.key)}
                >
                  <div className="flex items-center gap-2">
                    {column.header}
                    {column.sortable && <SortIcon columnKey={column.key} />}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {paginatedData.length === 0 ? (
              <tr>
                <td
                  colSpan={columns.length + (selectable ? 1 : 0)}
                  className="px-4 py-12 text-center text-text-secondary"
                >
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              paginatedData.map((row, index) => (
                <tr
                  key={getRowKey ? getRowKey(row) : index}
                  className={`border-b border-border transition-colors last:border-0 ${
                    onRowClick ? "cursor-pointer hover:bg-surface-hover" : ""
                  } ${isRowSelected(row) ? "bg-primary/5" : ""}`}
                  onClick={() => onRowClick?.(row)}
                >
                  {selectable && (
                    <td
                      className="px-4 py-3"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <input
                        type="checkbox"
                        checked={isRowSelected(row)}
                        onChange={() => handleSelectRow(row)}
                        className="h-4 w-4 rounded border-border text-primary focus:ring-primary"
                      />
                    </td>
                  )}
                  {columns.map((column) => (
                    <td
                      key={column.key}
                      className="px-4 py-3 text-sm text-text-primary"
                    >
                      {column.render
                        ? column.render(row, index)
                        : (row[column.key] as ReactNode)}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {pagination && totalPages > 1 && (
        <div className="flex items-center justify-between border-t border-border px-4 py-3">
          <p className="text-sm text-text-secondary">
            Showing {(currentPage - 1) * pageSize + 1} to{" "}
            {Math.min(currentPage * pageSize, sortedData.length)} of{" "}
            {sortedData.length} results
          </p>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="rounded-lg p-2 text-text-secondary transition-colors hover:bg-surface-hover disabled:cursor-not-allowed disabled:opacity-50"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            {Array.from({ length: Math.min(5, totalPages) }).map((_, i) => {
              let pageNum: number;
              if (totalPages <= 5) {
                pageNum = i + 1;
              } else if (currentPage <= 3) {
                pageNum = i + 1;
              } else if (currentPage >= totalPages - 2) {
                pageNum = totalPages - 4 + i;
              } else {
                pageNum = currentPage - 2 + i;
              }

              return (
                <button
                  key={pageNum}
                  onClick={() => setCurrentPage(pageNum)}
                  className={`h-8 w-8 rounded-lg text-sm font-medium transition-colors ${
                    currentPage === pageNum
                      ? "bg-primary text-white"
                      : "text-text-secondary hover:bg-surface-hover"
                  }`}
                >
                  {pageNum}
                </button>
              );
            })}
            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="rounded-lg p-2 text-text-secondary transition-colors hover:bg-surface-hover disabled:cursor-not-allowed disabled:opacity-50"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
