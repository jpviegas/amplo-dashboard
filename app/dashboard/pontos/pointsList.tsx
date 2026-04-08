"use client";

import { GetAllPoints } from "@/api/dashboard/historicoDePonto/route";
import { TablePagination } from "@/components/layout/dashboard/TablePagination";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useUser } from "@/context/UserContext";
import { format } from "date-fns";
import Cookies from "js-cookie";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";

type PointItem = {
  userId: string;
  name: string;
  date: string;
  timestamps: string[];
};

function formatPointDate(timestamp?: string | null) {
  const raw = (timestamp ?? "").trim();
  if (!raw) return "-";

  const date = new Date(raw);
  if (Number.isNaN(date.getTime())) {
    return "-";
  }
  return format(date, "dd/MM/yy");
}

function formatPointTime(timestamp?: string | null) {
  const raw = (timestamp ?? "").trim();
  if (!raw) return "-";

  const exactHm = raw.match(/^(\d{1,2}):(\d{2})(?::\d{2})?$/);
  if (exactHm) {
    const [, h, m] = exactHm;
    return `${h.padStart(2, "0")}:${m}`;
  }

  const isoMatch = raw.match(/T(\d{2}:\d{2})/);
  if (isoMatch?.[1]) {
    return isoMatch[1];
  }

  const looseMatch = raw.match(/(\d{1,2}):(\d{2})(?::\d{2})?/);
  if (looseMatch) {
    const [, h, m] = looseMatch;
    return `${h.padStart(2, "0")}:${m}`;
  }

  const date = new Date(raw);
  if (!Number.isNaN(date.getTime())) {
    return format(date, "HH:mm");
  }

  return "-";
}

export default function PointsList() {
  const { user } = useUser();
  const userId = user?._id || Cookies.get("user");

  const [points, setPoints] = useState<PointItem[]>([]);
  const [isExporting, setIsExporting] = useState<null | "excel" | "pdf">(null);
  const [pagination, setPagination] = useState<{
    total: number;
    page: number;
    totalPages: number;
    limit: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
    nextPage: null | number;
    prevPage: null | number;
  }>({
    total: 0,
    page: 1,
    totalPages: 0,
    limit: 10,
    hasNextPage: false,
    hasPrevPage: false,
    nextPage: null,
    prevPage: null,
  });
  const [isLoading, setIsLoading] = useState(false);
  const TABLE_ROWS = 10;

  const fetchPoints = useCallback(
    async (page = "1") => {
      try {
        setIsLoading(true);

        if (!userId) {
          setPoints([]);
          setPagination((prev) => ({ ...prev, total: 0, totalPages: 0 }));
          return;
        }

        const { success, points, pagination } = await GetAllPoints(
          userId,
          page,
        );

        if (!success) {
          toast.error("Não foi possível carregar as marcações.");
          setPoints([]);

          return;
        }

        setPoints(points);
        setPagination(pagination);
      } catch (error) {
        console.error("Erro ao buscar marcações:", error);
        toast.error("Não foi possível carregar as marcações.");
        setPoints([]);
      } finally {
        setIsLoading(false);
      }
    },
    [userId],
  );

  useEffect(() => {
    fetchPoints("1");
  }, [fetchPoints]);

  const handlePageChange = async (newPage: number) => {
    await fetchPoints(newPage.toString());
  };

  function buildExportRows(items: PointItem[]) {
    const headers = [
      "Funcionário",
      "Data",
      "Entrada 1",
      "Saída 1",
      "Entrada 2",
      "Saída 2",
    ];
    const rows = items.map((p) => {
      const entradasSaidas = [0, 1, 2, 3].map((i) =>
        formatPointTime(
          Array.isArray(p.timestamps)
            ? p.timestamps[i]
            : i === 0
              ? (p.timestamps?.[0] ?? null)
              : null,
        ),
      );
      return [
        p.name ?? "-",
        formatPointDate(
          p.date ??
            (typeof p.timestamps === "string"
              ? p.timestamps
              : (p.timestamps?.[0] ?? null)),
        ),
        entradasSaidas[0],
        entradasSaidas[1],
        entradasSaidas[2],
        entradasSaidas[3],
      ];
    });
    return { headers, rows };
  }

  function downloadBlob(content: Blob, filename: string) {
    const url = URL.createObjectURL(content);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  }

  function timestampFilename(suffix: string) {
    const now = new Date();
    const pad = (n: number) => String(n).padStart(2, "0");
    const name = `${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(
      now.getDate(),
    )}-${pad(now.getHours())}${pad(now.getMinutes())}`;
    return `relatorio-pontos-${name}.${suffix}`;
  }

  const handleExportExcel = () => {
    try {
      setIsExporting("excel");
      const { headers, rows } = buildExportRows(points);

      const escapeHtml = (s: string) =>
        String(s)
          .replace(/&/g, "&amp;")
          .replace(/</g, "&lt;")
          .replace(/>/g, "&gt;")
          .replace(/"/g, "&quot;");

      const tableHead = `<tr>${headers
        .map(
          (h) =>
            `<th style="border:1px solid #000;padding:4px;">${escapeHtml(h)}</th>`,
        )
        .join("")}</tr>`;
      const tableRows = rows
        .map(
          (r) =>
            `<tr>${r
              .map(
                (c) =>
                  `<td style="border:1px solid #000;padding:4px;">${escapeHtml(
                    c ?? "-",
                  )}</td>`,
              )
              .join("")}</tr>`,
        )
        .join("");

      const html = `
        <html>
          <head>
            <meta charset="UTF-8" />
          </head>
          <body>
            <table>
              <thead>${tableHead}</thead>
              <tbody>${tableRows}</tbody>
            </table>
          </body>
        </html>`;

      const blob = new Blob([html], {
        type: "application/vnd.ms-excel;charset=utf-8",
      });
      downloadBlob(blob, timestampFilename("xls"));
    } finally {
      setIsExporting(null);
    }
  };

  const handleExportPDF = () => {
    try {
      setIsExporting("pdf");
      const { headers, rows } = buildExportRows(points);

      const makeRow = (cells: string[], cellTag = "td") =>
        `<tr>${cells
          .map(
            (c) =>
              `<${cellTag} style="border:1px solid #999;padding:6px;font-size:12px;">${c}</${cellTag}>`,
          )
          .join("")}</tr>`;

      const headHtml = makeRow(headers, "th");
      const rowsHtml = rows.map((r) => makeRow(r)).join("");

      const html = `
        <html>
          <head>
            <meta charset="UTF-8" />
            <title>Relatório de Pontos</title>
            <style>
              @page { size: A4 landscape; margin: 16mm; }
              body { font-family: Arial, Helvetica, sans-serif; }
              h1 { font-size: 18px; margin: 0 0 12px 0; }
              table { border-collapse: collapse; width: 100%; }
              th { background: #f2f2f2; text-align: left; }
            </style>
          </head>
          <body>
            <h1>Relatório de Pontos</h1>
            <table>
              <thead>${headHtml}</thead>
              <tbody>${rowsHtml}</tbody>
            </table>
            <script>
              window.onload = function () {
                setTimeout(function () {
                  window.print();
                }, 150);
              }
            </script>
          </body>
        </html>`;

      const w = window.open("", "_blank");
      if (!w) return;
      w.document.open();
      w.document.write(html);
      w.document.close();
    } finally {
      setIsExporting(null);
    }
  };

  return (
    <div>
      <div className="mb-8 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Button
              variant="secondary"
              disabled={
                isLoading || points.length === 0 || isExporting !== null
              }
              onClick={handleExportExcel}
            >
              Exportar Excel
            </Button>
            <Button
              variant="secondary"
              disabled={
                isLoading || points.length === 0 || isExporting !== null
              }
              onClick={handleExportPDF}
            >
              Exportar PDF
            </Button>
          </div>
        </div>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Funcionário</TableHead>
              <TableHead>Data</TableHead>
              <TableHead>Entrada 1</TableHead>
              <TableHead>Saída 1</TableHead>
              <TableHead>Entrada 2</TableHead>
              <TableHead>Saída 2</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array.from({ length: TABLE_ROWS }).map((_, index) => (
                <TableRow key={index}>
                  <TableCell>
                    <Skeleton className="h-4 w-full max-w-[250px]" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-full max-w-[150px]" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-full max-w-[100px]" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-full max-w-[100px]" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-full max-w-[100px]" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-full max-w-[100px]" />
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <>
                {points.length === 0 && (
                  <TableRow>
                    <TableCell
                      colSpan={6}
                      className="text-muted-foreground h-16 text-center"
                    >
                      Nenhuma marcação encontrada.
                    </TableCell>
                  </TableRow>
                )}

                {points.map((point) => (
                  <TableRow
                    key={`${point.userId ?? ""}-${point.date ?? ""}-${point.name}`}
                  >
                    <TableCell>{point.name}</TableCell>
                    <TableCell>
                      {formatPointDate(
                        point.date ??
                          (typeof point.timestamps === "string"
                            ? point.timestamps
                            : (point.timestamps?.[0] ?? null)),
                      )}
                    </TableCell>
                    {[0, 1, 2, 3].map((i) => (
                      <TableCell key={i}>
                        {formatPointTime(
                          Array.isArray(point.timestamps)
                            ? point.timestamps[i]
                            : i === 0
                              ? (point.timestamps?.[0] ?? null)
                              : null,
                        )}
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
              </>
            )}
          </TableBody>
        </Table>
      </div>
      <TablePagination
        pagination={pagination}
        itemsCount={points.length}
        onPageChange={handlePageChange}
      />
    </div>
  );
}
