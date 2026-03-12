"use client";

import { GetAllPoints } from "@/api/dashboard/historicoDePonto/route";
// import { TablePagination } from "@/components/layout/dashboard/TablePagination";
import { Card, CardContent, CardTitle } from "@/components/ui/card";
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
  id?: string;
  name: string;
  timestamp: string;
};

function formatPointDate(timestamp: string) {
  const date = new Date(timestamp);
  if (Number.isNaN(date.getTime())) {
    return "-";
  }
  return format(date, "dd/MM/yy");
}

function formatPointTime(timestamp: string) {
  const date = new Date(timestamp);
  if (Number.isNaN(date.getTime())) {
    return "-";
  }
  return format(date, "HH:mm");
}

export default function LastPoints() {
  const { user } = useUser();
  const userId = user?._id || Cookies.get("user");
  const [points, setPoints] = useState<PointItem[]>([]);
  // const [pagination, setPagination] = useState<{
  //   total: number;
  //   page: number;
  //   totalPages: number;
  //   limit: number;
  //   hasNextPage: boolean;
  //   hasPrevPage: boolean;
  //   nextPage: null | number;
  //   prevPage: null | number;
  // }>({
  //   total: 0,
  //   page: 1,
  //   totalPages: 0,
  //   limit: 10,
  //   hasNextPage: false,
  //   hasPrevPage: false,
  //   nextPage: null,
  //   prevPage: null,
  // });
  const [isLoading, setIsLoading] = useState(false);

  const TABLE_ROWS = 10;

  const fetchPoints = useCallback(
    async (page = "1") => {
      try {
        setIsLoading(true);

        if (!userId) {
          setPoints([]);
          return;
        }

        const { success, points } = await GetAllPoints(userId, page);

        if (!success) {
          toast.error("Não foi possível carregar as marcações.");
          setPoints([]);
          return;
        }

        setPoints(points);
        // setPagination(pagination);
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

  // const handlePageChange = async (newPage: number) => {
  //   await fetchPoints(newPage.toString());
  // };

  return (
    <Card className="w-full p-6 lg:w-2/3">
      <CardTitle>
        <h1 className="border-b-2 text-2xl font-bold">Últimas marcações</h1>
      </CardTitle>
      <CardContent className="flex flex-col gap-4 pt-6">
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Usuário</TableHead>
                <TableHead>Data</TableHead>
                <TableHead>Horário</TableHead>
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
                  </TableRow>
                ))
              ) : (
                <>
                  {points.length === 0 && (
                    <TableRow>
                      <TableCell
                        colSpan={3}
                        className="text-muted-foreground h-16 text-center"
                      >
                        Nenhuma marcação encontrada.
                      </TableCell>
                    </TableRow>
                  )}

                  {points.map((point) => (
                    <TableRow
                      key={`${point.id ?? point.timestamp}-${point.name}`}
                    >
                      <TableCell>{point.name}</TableCell>
                      <TableCell>{formatPointDate(point.timestamp)}</TableCell>
                      <TableCell>{formatPointTime(point.timestamp)}</TableCell>
                    </TableRow>
                  ))}
                </>
              )}
            </TableBody>
          </Table>
        </div>

        {/* <TablePagination
          pagination={pagination}
          itemsCount={points.length}
          onPageChange={handlePageChange}
        /> */}
      </CardContent>
    </Card>
  );
}
