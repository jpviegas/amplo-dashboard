"use client";

import { GetAllManagements } from "@/api/dashboard/gestao/route";
import { TablePagination } from "@/components/layout/dashboard/TablePagination";
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
import { ManagementsTypeWithId } from "@/zodSchemas";
import Cookies from "js-cookie";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";

export function ManagementEPIList() {
  const { user } = useUser();
  const userId = user?._id || Cookies.get("user");
  const [managements, setManagements] = useState<ManagementsTypeWithId[]>([]);
  const [isLoading, setIsLoading] = useState(false);
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
    nextPage: 0,
    prevPage: null,
  });

  const TABLE_ROWS = 8;

  const fetchManagements = useCallback(
    async (page = "1") => {
      try {
        setIsLoading(true);

        if (!userId) {
          setManagements([]);
          return;
        }

        const {
          success,
          managements,
          pagination: paginationData,
        } = await GetAllManagements(userId, page);

        if (!success) {
          toast.error("Não foi possível carregar a gestão de EPI.");
          setManagements([]);
          return;
        }

        setManagements(managements ?? []);
        if (paginationData) setPagination(paginationData);
      } catch (error) {
        console.error("Erro ao buscar gestão de EPI:", error);
        toast.error("Não foi possível carregar a gestão de EPI.");
        setManagements([]);
      } finally {
        setIsLoading(false);
      }
    },
    [userId],
  );

  useEffect(() => {
    fetchManagements(String(pagination.page));
  }, [fetchManagements]);

  const handlePageChange = async (newPage: number) => {
    try {
      setIsLoading(true);
      if (!userId) {
        toast.error("Usuário não identificado.");
        return;
      }

      const {
        success,
        managements,
        pagination: paginationData,
      } = await GetAllManagements(userId, newPage.toString());

      if (!success) {
        toast.error("Não foi possível carregar a página.");
        return;
      }
      setManagements(managements ?? []);
      if (paginationData) setPagination(paginationData);
    } catch (error) {
      console.error("Erro ao mudar de página:", error);
      toast.error("Não foi possível carregar a página.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <div className="mx-auto overflow-x-auto rounded-md border lg:w-[70%]">
        <Table className="w-full table-fixed">
          <TableHeader>
            <TableRow>
              <TableHead className="w-[50%]">Funcionário</TableHead>
              <TableHead className="w-[50%]">E.P.I.</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading
              ? Array.from({ length: TABLE_ROWS }).map((_, index) => (
                  <TableRow key={index}>
                    <TableCell className="w-[50%]">
                      <Skeleton className="h-4 w-full max-w-[280px]" />
                    </TableCell>
                    <TableCell className="w-[50%]">
                      <Skeleton className="h-4 w-full max-w-[280px]" />
                    </TableCell>
                  </TableRow>
                ))
              : managements.map((mng) => (
                  <TableRow key={mng._id}>
                    <TableCell className="w-[50%]">
                      <div
                        className="truncate text-sm"
                        title={mng.employeeId?.name ?? ""}
                      >
                        {mng.employeeId?.name ?? "-"}
                      </div>
                    </TableCell>
                    <TableCell className="w-[50%]">
                      <div
                        className="truncate text-sm"
                        title={mng.epiId?.name ?? ""}
                      >
                        {mng.epiId?.name ?? "-"}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
            {!isLoading && (
              <>
                {managements.length === 0 && (
                  <TableRow>
                    <TableCell
                      colSpan={2}
                      className="text-muted-foreground h-16 text-center"
                    >
                      Nenhuma gestão de EPI encontrada.
                    </TableCell>
                  </TableRow>
                )}
                {Array.from({
                  length: Math.max(
                    0,
                    TABLE_ROWS -
                      managements.length -
                      (managements.length === 0 ? 1 : 0),
                  ),
                }).map((_, index) => (
                  <TableRow key={`empty-${index}`}>
                    <TableCell className="w-[50%]">&nbsp;</TableCell>
                    <TableCell className="w-[50%]">&nbsp;</TableCell>
                  </TableRow>
                ))}
              </>
            )}
          </TableBody>
        </Table>
      </div>

      <TablePagination
        pagination={pagination}
        itemsCount={pagination.total}
        onPageChange={handlePageChange}
      />
    </>
  );
}
