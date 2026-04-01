"use client";

import { GetAllPoints } from "@/api/dashboard/historicoDePonto/route";
import { TablePagination } from "@/components/layout/dashboard/TablePagination";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
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
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
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

export default function PointsPage() {
  const { user } = useUser();
  const userId = user?._id || Cookies.get("user");

  const [points, setPoints] = useState<PointItem[]>([]);
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

  return (
    <main className="container mx-auto h-full w-11/12 pt-8">
      <div className="mb-8 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" asChild>
            <Link href="/dashboard">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <h1 className="text-3xl font-bold">Relatório de Pontos</h1>
        </div>
      </div>

      <Card>
        <CardContent className="p-6">
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
        </CardContent>
      </Card>
    </main>
  );
}
