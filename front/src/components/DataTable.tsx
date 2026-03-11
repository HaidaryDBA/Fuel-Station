import { DataTable as PrimeDataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import type { DataTableProps } from "primereact/datatable";

interface ColumnDef {
  field: string;
  header: string;
  sortable?: boolean;
  body?: (rowData: unknown) => React.ReactNode;
}

interface MISDataTableProps<T extends Record<string, unknown>>
  extends Omit<
    DataTableProps<T[]>,
    | "children"
    | "selectionMode"
    | "selection"
    | "onSelectionChange"
    | "onContextMenuSelectionChange"
    | "cellSelection"
  > {
  data: T[];
  columns: ColumnDef[];
  loading?: boolean;
}

export default function DataTable<T extends Record<string, unknown>>({
  data,
  columns,
  loading = false,
  ...props
}: MISDataTableProps<T>) {
  return (
    <PrimeDataTable
      value={data}
      loading={loading}
      paginator
      rows={10}
      rowsPerPageOptions={[5, 10, 25, 50]}
      className="rounded-xl bg-white shadow-sm dark:bg-gray-800"
      {...props}
    >
      {columns.map((col) => (
        <Column
          key={col.field}
          field={col.field}
          header={col.header}
          sortable={col.sortable}
          body={col.body}
        />
      ))}
    </PrimeDataTable>
  );
}
