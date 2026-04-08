"use client";

import { DeleteEPI, GetAllEPIs } from "@/api/dashboard/epi/route";
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
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import { Input } from "@/components/ui/input";
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
import { EPITypeWithId } from "@/zodSchemas";
import { zodResolver } from "@hookform/resolvers/zod";
import Cookies from "js-cookie";
import debounce from "lodash/debounce";
import { Pencil, Trash } from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

const FormSchema = z.object({
  search: z.string().optional(),
});

export function EPIList() {
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
  const buildEPIHref = (epi: EPITypeWithId) => {
    const base = epi.name || "epi";
    const slug = slugify(base) || "epi";
    return `/dashboard/epi/${slug}-${epi._id}`;
  };

  const { user } = useUser();
  const userId = user?._id || Cookies.get("user");
  const [epis, setEPIs] = useState<EPITypeWithId[]>([]);
  const [deletingEPIId, setDeletingEPIId] = useState<string | null>(null);
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

  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      search: "",
    },
  });

  const fetchEPIs = useCallback(
    async (values: z.infer<typeof FormSchema>, page = "1") => {
      try {
        setIsLoading(true);

        if (!userId) {
          setEPIs([]);
          return;
        }

        const {
          success,
          pagination: paginationData,
          epis,
        } = await GetAllEPIs(userId, values.search || "", page);

        if (!success) {
          toast.error("Não foi possível carregar os E.P.I.");
          setEPIs([]);
          return;
        }

        setEPIs(epis);
        setPagination(paginationData);
      } catch (error) {
        console.error("Erro ao buscar E.P.I.:", error);
        toast.error("Não foi possível carregar os E.P.I.");
        setEPIs([]);
      } finally {
        setIsLoading(false);
      }
    },
    [userId],
  );

  const debouncedFetchEPIs = useMemo(() => {
    return debounce((values: z.infer<typeof FormSchema>) => {
      fetchEPIs(values);
    }, 500);
  }, [fetchEPIs]);

  useEffect(() => {
    const subscription = form.watch((values) => {
      debouncedFetchEPIs(values as z.infer<typeof FormSchema>);
    });

    return () => {
      subscription.unsubscribe();
      debouncedFetchEPIs.cancel();
    };
  }, [form, debouncedFetchEPIs]);

  useEffect(() => {
    fetchEPIs(form.getValues());
  }, [fetchEPIs, form]);

  const handlePageChange = async (newPage: number) => {
    try {
      setIsLoading(true);
      if (!userId) {
        throw new Error("User ID is required");
      }

      const {
        success,
        pagination: paginationData,
        epis,
      } = await GetAllEPIs(
        userId,
        form.getValues("search"),
        newPage.toString(),
      );

      if (success) {
        setEPIs(epis);
        setPagination(paginationData);
      }
    } catch (error) {
      console.error("Erro ao mudar de página:", error);
      toast.error("Não foi possível carregar a página.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteEPI = async (epiId: string) => {
    try {
      if (!userId) {
        toast.error("Usuário não identificado.");
        return;
      }

      setDeletingEPIId(epiId);
      const { success, message } = await DeleteEPI(userId, epiId);

      if (!success) {
        toast.warning(message);
        return;
      }

      toast.success(message);

      const isLastItemOnPage = epis.length === 1;
      const nextPage = isLastItemOnPage
        ? Math.max(1, pagination.page - 1)
        : pagination.page;
      await handlePageChange(nextPage);
    } catch (error) {
      console.error("Erro ao deletar E.P.I.:", error);
      toast.error("Não foi possível deletar o E.P.I.");
    } finally {
      setDeletingEPIId(null);
    }
  };

  return (
    <>
      <Form {...form}>
        <form
          className="flex items-center justify-between"
          onSubmit={form.handleSubmit((values) => fetchEPIs(values))}
        >
          <FormField
            control={form.control}
            name="search"
            render={({ field }) => (
              <FormItem className="flex items-center gap-4">
                <FormLabel>Buscar:</FormLabel>
                <FormControl>
                  <Input placeholder="buscar por nome" {...field} />
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
              <TableHead className="w-[50%]">Nome</TableHead>
              <TableHead className="w-[30%]">C.A.</TableHead>
              <TableHead className="w-[20%]">Ação</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading
              ? Array.from({ length: TABLE_ROWS }).map((_, index) => (
                  <TableRow key={index}>
                    <TableCell className="w-[50%]">
                      <Skeleton className="h-4 w-full max-w-[250px]" />
                    </TableCell>
                    <TableCell className="w-[30%]">
                      <Skeleton className="h-4 w-full max-w-[200px]" />
                    </TableCell>
                    <TableCell className="w-[20%]">
                      <div className="flex items-center justify-end gap-2">
                        <Skeleton className="size-8 rounded-md" />
                        <Skeleton className="size-8 rounded-md" />
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              : epis.map((epi) => (
                  <TableRow key={epi._id}>
                    <TableCell className="w-[50%]">
                      <div className="truncate text-sm" title={epi.name ?? ""}>
                        {epi.name ?? "-"}
                      </div>
                    </TableCell>
                    <TableCell className="w-[30%]">
                      <div className="truncate text-sm" title={epi.ca ?? ""}>
                        {epi.ca ?? "-"}
                      </div>
                    </TableCell>
                    <TableCell className="w-[20%]">
                      <div className="flex justify-start gap-2">
                        <HoverCard openDelay={100} closeDelay={0}>
                          <HoverCardTrigger>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="size-8"
                            >
                              <Link href={buildEPIHref(epi)}>
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
                                    isLoading || deletingEPIId === epi._id
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
                                Deletar E.P.I.?
                              </AlertDialogTitle>
                              <AlertDialogDescription>
                                Essa ação não pode ser desfeita. O E.P.I.
                                {epi.name ? ` "${epi.name}"` : ""} será removido
                                permanentemente.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancelar</AlertDialogCancel>
                              <AlertDialogAction
                                variant="destructive"
                                onClick={() => handleDeleteEPI(epi._id)}
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
            {!isLoading && (
              <>
                {epis.length === 0 && (
                  <TableRow>
                    <TableCell
                      colSpan={3}
                      className="text-muted-foreground h-16 text-center"
                    >
                      Nenhum E.P.I. encontrado.
                    </TableCell>
                  </TableRow>
                )}
                {Array.from({
                  length: Math.max(
                    0,
                    TABLE_ROWS - epis.length - (epis.length === 0 ? 1 : 0),
                  ),
                }).map((_, index) => (
                  <TableRow key={`empty-${index}`}>
                    <TableCell className="w-[50%]">&nbsp;</TableCell>
                    <TableCell className="w-[30%]">&nbsp;</TableCell>
                    <TableCell className="w-[20%]">
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
