"use client";

import { GetAllServices } from "@/api/dashboard/atendimento/route";
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
import Cookies from "js-cookie";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";

type ServiceItem = {
  _id?: string;
  subject: string;
  text: string;
  status: string;
  user?: string;
  name?: string;
};

export default function ServicesList() {
  const { user } = useUser();
  const userId = user?._id || Cookies.get("user");
  const [services, setServices] = useState<ServiceItem[]>([]);
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

  const fetchServices = useCallback(async () => {
    try {
      setIsLoading(true);

      if (!userId) {
        setServices([]);
        return;
      }

      const { success, services } = await GetAllServices(userId);

      if (!success) {
        toast.error("Não foi possível carregar os atendimentos.");
        setServices([]);
        return;
      }

      setServices(services);
      // setPagination(pagination);
    } catch (error) {
      console.error("Erro ao buscar atendimentos:", error);
      toast.error("Não foi possível carregar os atendimentos.");
      setServices([]);
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchServices();
  }, [fetchServices]);

  // const handlePageChange = async (newPage: number) => {
  //   await fetchServices(newPage.toString());
  // };

  return (
    <Card className="w-full self-center p-6 lg:w-2/3">
      <CardTitle>
        {/* <h1 className="border-b-2 text-2xl font-bold">Atendimentos</h1> */}
      </CardTitle>
      <CardContent className="flex flex-col gap-4 pt-6">
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Usuário</TableHead>
                <TableHead>Assunto</TableHead>
                <TableHead>Justificativa</TableHead>
                <TableHead>Situação</TableHead>
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
                      <Skeleton className="h-4 w-full max-w-[250px]" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-4 w-full max-w-[100px]" />
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <>
                  {services.length === 0 && (
                    <TableRow>
                      <TableCell
                        colSpan={4}
                        className="text-muted-foreground h-16 text-center"
                      >
                        Nenhum atendimento encontrado.
                      </TableCell>
                    </TableRow>
                  )}

                  {services.map((service) => (
                    <TableRow
                      key={`${service._id ?? service.subject}-${service.status}`}
                    >
                      <TableCell>{service.name ?? "-"}</TableCell>
                      <TableCell>{service.subject}</TableCell>
                      <TableCell className="max-w-[420px] truncate">
                        {service.text}
                      </TableCell>
                      <TableCell>{service.status}</TableCell>
                    </TableRow>
                  ))}
                </>
              )}
            </TableBody>
          </Table>
        </div>

        {/* <TablePagination
          pagination={pagination}
          itemsCount={services.length}
          onPageChange={handlePageChange}
        /> */}
      </CardContent>
    </Card>
  );
}
