import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Pencil, Trash } from "lucide-react";
import Link from "next/link";

interface Column {
  header: string;
  accessor: string;
}

interface DataTableProps<T> {
  data: T[];
  columns: Column[];
  isLoading: boolean;
  basePath: string;
  idField: keyof T;
  emptyMessage: string;
}

export async function DataTable<T>({
  data,
  columns,
  isLoading,
  basePath,
  idField,
  emptyMessage,
}: DataTableProps<T>) {
  // const fetch = await GetCompanyRoles(idField)

  return (
    <section className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            {columns.map((column) => (
              <TableHead key={column.accessor}>{column.header}</TableHead>
            ))}
            <TableHead>Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {isLoading ? (
            <TableRow>
              <TableCell
                colSpan={columns.length + 1}
                className="h-24 text-center"
              >
                <div className="flex items-center justify-center gap-2">
                  <div className="border-primary h-4 w-4 animate-spin rounded-full border-2 border-t-transparent" />
                  Carregando...
                </div>
              </TableCell>
            </TableRow>
          ) : data.length === 0 ? (
            <TableRow>
              <TableCell
                colSpan={columns.length + 1}
                className="text-muted-foreground h-24 text-center"
              >
                {emptyMessage}
              </TableCell>
            </TableRow>
          ) : (
            data.map((item) => (
              <TableRow key={String(item[idField])}>
                {columns.map((column) => (
                  <TableCell
                    key={`${String(item[idField])}-${column.accessor}`}
                  >
                    {String(item[column.accessor as keyof T])}
                  </TableCell>
                ))}
                <TableCell className="flex items-center justify-end">
                  <div className="flex justify-end gap-2">
                    <Button variant="ghost" size="icon" className="size-8">
                      <Link href={`${basePath}/${String(item[idField])}`}>
                        <Pencil className="size-4" />
                      </Link>
                    </Button>
                    <Button variant="ghost" size="icon" className="size-8">
                      <Trash className="size-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </section>
  );
}
