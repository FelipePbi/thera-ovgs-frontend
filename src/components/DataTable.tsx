"use client";

import * as React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";

export type DataTableColumn<T> = {
  header: string;
  accessor: keyof T | string;
  cell?: (row: T) => React.ReactNode;
};

type DataTableProps<T> = {
  columns: DataTableColumn<T>[];
  data: T[];
  isLoading?: boolean;
  emptyMessage?: string;
  getRowKey?: (row: T) => string;
};

function getCellValue<T>(row: T, accessor: keyof T | string): unknown {
  return (row as Record<string, unknown>)[accessor as string];
}

export function DataTable<T>({
  columns,
  data,
  isLoading = false,
  emptyMessage = "Nenhum registro encontrado.",
  getRowKey,
}: DataTableProps<T>) {
  const skeletonRows = 5;

  if (isLoading) {
    return (
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              {columns.map((column) => (
                <TableHead key={String(column.accessor)}>{column.header}</TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {Array.from({ length: skeletonRows }).map((_, rowIndex) => (
              <TableRow key={rowIndex}>
                {columns.map((column) => (
                  <TableCell key={String(column.accessor)}>
                    <Skeleton
                      className={rowIndex % 2 === 0 ? "h-4 w-full" : "h-4 w-3/4"}
                    />
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              {columns.map((column) => (
                <TableHead key={String(column.accessor)}>{column.header}</TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow>
              <TableCell
                colSpan={columns.length}
                className="h-24 text-center text-muted-foreground"
              >
                {emptyMessage}
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </div>
    );
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            {columns.map((column) => (
              <TableHead key={String(column.accessor)}>{column.header}</TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((row, rowIndex) => {
            const rowKey =
              getRowKey?.(row) ??
              String(getCellValue(row, "id" as keyof T) ?? rowIndex);
            return (
              <TableRow key={rowKey}>
                {columns.map((column) => (
                  <TableCell key={String(column.accessor)}>
                    {column.cell
                      ? column.cell(row)
                      : String(getCellValue(row, column.accessor) ?? "—")}
                  </TableCell>
                ))}
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
