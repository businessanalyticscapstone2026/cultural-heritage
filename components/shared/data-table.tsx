type Column<T> = {
  key: keyof T
  header: string
}

type DataTableProps<T> = {
  data: T[]
  columns: Column<T>[]
}

export default function DataTable<T extends Record<string, unknown>>({ data, columns }: DataTableProps<T>) {
  return (
    <div className="overflow-x-auto rounded-md border">
      <table className="w-full text-sm">
        <thead className="bg-muted">
          <tr>
            {columns.map((col) => (
              <th key={String(col.key)} className="px-4 py-2 text-left font-medium text-muted-foreground">
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row, i) => (
            <tr key={i} className="border-t">
              {columns.map((col) => (
                <td key={String(col.key)} className="px-4 py-2">
                  {String(row[col.key] ?? "")}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
