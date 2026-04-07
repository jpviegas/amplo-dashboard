"use client";

import { DeleteCompany, GetAllCompanies } from "@/api/dashboard/empresas/route";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import Cookies from "js-cookie";

import { TablePagination } from "@/components/layout/dashboard/TablePagination";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useUser } from "@/context/UserContext";
import { CompanyTypeWithId } from "@/zodSchemas";
import { zodResolver } from "@hookform/resolvers/zod";
import debounce from "lodash/debounce";
import { Pencil, Trash } from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

const FormSchema = z.object({
  search: z.string().optional(),
});

export function CompaniesList() {
  const onlyDigits = (s: string) => s.replace(/\D+/g, "");
  const formatCnpj = (value?: string | null) => {
    const raw = String(value ?? "");
    const v = onlyDigits(raw).slice(0, 14);
    if (v.length !== 14) return raw;
    return v.replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/, "$1.$2.$3/$4-$5");
  };

  const [companies, setCompanies] = useState<CompanyTypeWithId[]>([]);
  const [deletingCompanyId, setDeletingCompanyId] = useState<string | null>(
    null,
  );
  const [pagination, setPagination] = useState<{
    total: number;
    page: number;
    totalPages: number;
    limit: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
    nextPage: number;
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
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useUser();
  const userId = user?._id || Cookies.get("user");

  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      search: "",
    },
  });

  const fetchCompanies = async (values: z.infer<typeof FormSchema>) => {
    try {
      setIsLoading(true);
      if (!userId) {
        throw new Error("User ID is required");
      }

      const {
        success,
        pagination: paginationData,
        companies,
      } = await GetAllCompanies(
        userId,
        values.search,
        pagination.page.toString(),
      );

      if (success) {
        setCompanies(companies);
        setPagination(paginationData);
      }
    } catch (error) {
      console.error("Erro ao buscar empresas:", error);
      toast.error("Não foi possível carregar as empresas.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteCompany = async (companyId: string) => {
    try {
      if (!userId) {
        toast.error("Usuário não identificado.");
        return;
      }

      setDeletingCompanyId(companyId);
      const { success, message } = await DeleteCompany(userId, companyId);
      if (!success) {
        toast.warning(message || "Não foi possível deletar a empresa.");
        return;
      }
      toast.success(message || "Empresa deletada.");

      const isLastItemOnPage = companies.length === 1;
      const nextPage = isLastItemOnPage
        ? Math.max(1, pagination.page - 1)
        : pagination.page;
      await handlePageChange(nextPage);
    } catch (error) {
      console.error("Erro ao deletar empresa:", error);
      toast.error("Não foi possível deletar a empresa.");
    } finally {
      setDeletingCompanyId(null);
    }
  };

  const debouncedFetchCompanies = useCallback(
    debounce((values: z.infer<typeof FormSchema>) => {
      fetchCompanies(values);
    }, 500),
    [userId],
  );

  useEffect(() => {
    const subscription = form.watch((values) => {
      debouncedFetchCompanies(values as z.infer<typeof FormSchema>);
    });

    return () => {
      subscription.unsubscribe();
      debouncedFetchCompanies.cancel();
    };
  }, [form, debouncedFetchCompanies]);

  useEffect(() => {
    fetchCompanies(form.getValues());
  }, [form]);

  const TABLE_ROWS = 10;

  const handlePageChange = async (newPage: number) => {
    try {
      setIsLoading(true);
      if (!userId) {
        throw new Error("User ID is required");
      }

      const {
        success,
        pagination: paginationData,
        companies,
      } = await GetAllCompanies(
        userId,
        form.getValues("search"),
        newPage.toString(),
      );

      if (success) {
        setCompanies(companies);
        setPagination(paginationData);
      }
    } catch (error) {
      console.error("Erro ao mudar de página:", error);
      toast.error("Não foi possível carregar a página.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Form {...form}>
        <form
          className="flex items-center justify-between"
          onSubmit={form.handleSubmit(fetchCompanies)}
        >
          <FormField
            control={form.control}
            name="search"
            render={({ field }) => (
              <FormItem className="flex items-center gap-4">
                <FormLabel>Buscar:</FormLabel>
                <FormControl>
                  <Input placeholder="buscar empresa" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </form>
      </Form>
      <div className="mx-auto overflow-x-auto rounded-md border lg:w-[70%]">
        <Table className="w-full table-fixed">
          <TableHeader>
            <TableRow>
              <TableHead className="w-[45%]">Nome</TableHead>
              <TableHead className="w-[30%]">CNPJ</TableHead>
              <TableHead className="w-[25%]">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array.from({ length: TABLE_ROWS }).map((_, index) => (
                <TableRow key={index}>
                  <TableCell className="w-[45%]">
                    <Skeleton className="h-4 w-full max-w-[250px]" />
                  </TableCell>
                  <TableCell className="w-[30%]">
                    <Skeleton className="h-4 w-full max-w-[150px]" />
                  </TableCell>
                  <TableCell className="w-[25%]">
                    <div className="flex justify-end gap-2">
                      <Skeleton className="size-8 rounded-md" />
                      <Skeleton className="size-8 rounded-md" />
                    </div>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <>
                {companies.length === 0 && (
                  <TableRow>
                    <TableCell
                      colSpan={3}
                      className="text-muted-foreground h-16 text-center"
                    >
                      Nenhuma empresa encontrada.
                    </TableCell>
                  </TableRow>
                )}
                {companies.map((company) => (
                  <TableRow key={company._id}>
                    <TableCell className="w-[45%]">
                      <div
                        className="truncate text-sm"
                        title={company.companyName}
                      >
                        {company.companyName}
                      </div>
                    </TableCell>
                    <TableCell className="w-[30%]">
                      <div
                        className="truncate text-xs md:text-sm"
                        title={formatCnpj(company.cnpj)}
                      >
                        {formatCnpj(company.cnpj)}
                      </div>
                    </TableCell>
                    <TableCell className="w-[25%]">
                      <div className="flex justify-start gap-2">
                        <HoverCard openDelay={100} closeDelay={0}>
                          <HoverCardTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="size-8"
                              asChild
                            >
                              <Link href={`empresas/${company._id}`}>
                                <Pencil className="size-4" />
                              </Link>
                            </Button>
                          </HoverCardTrigger>
                          <HoverCardContent className="pointer-events-none">
                            Editar
                          </HoverCardContent>
                        </HoverCard>
                        <AlertDialog>
                          <HoverCard openDelay={100} closeDelay={0}>
                            <HoverCardTrigger asChild>
                              <AlertDialogTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="size-8 cursor-pointer"
                                  disabled={
                                    isLoading ||
                                    deletingCompanyId === company._id
                                  }
                                >
                                  <Trash className="size-4" />
                                </Button>
                              </AlertDialogTrigger>
                            </HoverCardTrigger>
                            <HoverCardContent className="pointer-events-none">
                              Deletar
                            </HoverCardContent>
                          </HoverCard>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>
                                Deletar empresa?
                              </AlertDialogTitle>
                              <AlertDialogDescription>
                                Essa ação não pode ser desfeita. O empresa
                                {company.companyName
                                  ? ` "${company.companyName}"`
                                  : ""}{" "}
                                será removida permanentemente.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancelar</AlertDialogCancel>
                              <AlertDialogAction
                                variant="destructive"
                                onClick={() => handleDeleteCompany(company._id)}
                              >
                                Deletar
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
                {Array.from({
                  length: Math.max(
                    0,
                    TABLE_ROWS -
                      companies.length -
                      (companies.length === 0 ? 1 : 0),
                  ),
                }).map((_, index) => (
                  <TableRow key={`empty-${index}`}>
                    <TableCell className="w-[45%]">&nbsp;</TableCell>
                    <TableCell className="w-[30%]">&nbsp;</TableCell>
                    <TableCell className="w-[25%]">
                      <div className="flex justify-end gap-2 opacity-0">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="size-8"
                          disabled
                        >
                          <Pencil className="size-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="size-8"
                          disabled
                        >
                          <Trash className="size-4" />
                        </Button>
                      </div>
                    </TableCell>
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
