"use client";

import { GetAllServices } from "@/api/dashboard/atendimento/route";
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
import Cookies from "js-cookie";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";

type ServiceItem = {
  _id?: string;
  type?: string;
  subject: string;
  text: string;
  status: string;
  user?: string;
  name?: string;
};

export default function ServicesList() {
  const slugify = (value: string) => {
    const raw = String(value ?? "")
      .trim()
      .toLowerCase();
    const noDiacritics = raw.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    const slug = noDiacritics
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/-+/g, "-")
      .replace(/^-|-$/g, "");
    return slug;
  };
  const buildServiceHref = (service: ServiceItem) => {
    const base = service.subject || "atendimento";
    const slug = slugify(base) || "atendimento";
    return `/dashboard/atendimento/${slug}-${service._id}`;
  };

  const { user } = useUser();
  const userId = user?._id || Cookies.get("user");
  const [services, setServices] = useState<ServiceItem[]>([]);
  const router = useRouter();
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

  const fetchServices = useCallback(
    async (page = "1") => {
      try {
        setIsLoading(true);

        if (!userId) {
          setServices([]);
          setPagination({
            total: 0,
            page: 1,
            totalPages: 0,
            limit: 10,
            hasNextPage: false,
            hasPrevPage: false,
            nextPage: null,
            prevPage: null,
          });
          return;
        }

        const { success, services, pagination } = await GetAllServices(
          userId,
          page,
        );

        if (!success) {
          toast.error("Não foi possível carregar os atendimentos.");
          setServices([]);
          setPagination({
            total: 0,
            page: 1,
            totalPages: 0,
            limit: 10,
            hasNextPage: false,
            hasPrevPage: false,
            nextPage: null,
            prevPage: null,
          });
          return;
        }

        setServices(services);
        setPagination(pagination);
      } catch (error) {
        console.error("Erro ao buscar atendimentos:", error);
        toast.error("Não foi possível carregar os atendimentos.");
        setServices([]);
        setPagination({
          total: 0,
          page: 1,
          totalPages: 0,
          limit: 10,
          hasNextPage: false,
          hasPrevPage: false,
          nextPage: null,
          prevPage: null,
        });
      } finally {
        setIsLoading(false);
      }
    },
    [userId],
  );

  useEffect(() => {
    fetchServices();
  }, [fetchServices]);

  const handlePageChange = async (newPage: number) => {
    await fetchServices(newPage.toString());
  };

  return (
    <>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Usuário</TableHead>
              <TableHead>Tipo</TableHead>
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
                    <Skeleton className="h-4 w-full max-w-[120px]" />
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
                      colSpan={5}
                      className="text-muted-foreground h-16 text-center"
                    >
                      Nenhum atendimento encontrado.
                    </TableCell>
                  </TableRow>
                )}

                {services.map((service) => (
                  <TableRow
                    key={`${service._id ?? service.subject}-${service.status}`}
                    className={
                      service._id
                        ? "hover:text-amplo-secondary cursor-pointer hover:underline"
                        : ""
                    }
                    role={service._id ? "link" : undefined}
                    tabIndex={service._id ? 0 : -1}
                    onClick={() => {
                      if (!service._id) return;
                      router.push(buildServiceHref(service));
                    }}
                    onKeyDown={(e) => {
                      if (!service._id) return;
                      if (e.key !== "Enter" && e.key !== " ") return;
                      e.preventDefault();
                      router.push(buildServiceHref(service));
                    }}
                  >
                    <TableCell>{service.name ?? "-"}</TableCell>
                    <TableCell>{service.type ?? "-"}</TableCell>
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
      <TablePagination
        pagination={pagination}
        itemsCount={services.length}
        onPageChange={handlePageChange}
      />
    </>
  );
}
