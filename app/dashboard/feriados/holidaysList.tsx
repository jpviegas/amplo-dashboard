"use client";

import { DeleteHoliday, GetAllHolidays } from "@/api/dashboard/feriados/route";
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
import { HolidayTypeWithId } from "@/zodSchemas";
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

export function HolidaysList() {
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
  const formatHolidayDate = (value?: string | null) => {
    const raw = String(value ?? "");
    const digits = raw.replace(/\D/g, "");
    if (digits.length === 8) {
      const dd = digits.slice(0, 2);
      const mm = digits.slice(2, 4);
      const yyyy = digits.slice(4, 8);
      return `${dd}/${mm}/${yyyy}`;
    }
    return raw || "-";
  };
  const buildHolidayHref = (holiday: HolidayTypeWithId) => {
    const base = holiday.comment || holiday.date || "feriado";
    const slug = slugify(base) || "feriado";
    return `/dashboard/feriados/${slug}-${holiday._id}`;
  };

  const [holidays, setHolidays] = useState<HolidayTypeWithId[]>([]);
  const [deletingHolidayId, setDeletingHolidayId] = useState<string | null>(
    null,
  );
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
  const { user } = useUser();
  const userId = user?._id || Cookies.get("user");
  const TABLE_ROWS = 10;

  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      search: "",
    },
  });

  const fetchHolidays = useCallback(
    async (values: z.infer<typeof FormSchema>, page = "1") => {
      try {
        setIsLoading(true);
        if (!userId) {
          setHolidays([]);
          return;
        }

        const {
          success,
          pagination: paginationData,
          holidays,
        } = await GetAllHolidays(userId, values.search || "", page);

        if (success) {
          setHolidays(holidays);
          setPagination(paginationData);
          return;
        }

        toast.error("Não foi possível carregar os feriados.");
        setHolidays([]);
      } catch (error) {
        console.error("Erro ao buscar feriados:", error);
        toast.error("Não foi possível carregar os feriados.");
        setHolidays([]);
      } finally {
        setIsLoading(false);
      }
    },
    [userId],
  );

  const debouncedFetchHolidays = useMemo(() => {
    return debounce((values: z.infer<typeof FormSchema>) => {
      fetchHolidays(values, "1");
    }, 500);
  }, [fetchHolidays]);

  useEffect(() => {
    const subscription = form.watch((values) => {
      debouncedFetchHolidays(values as z.infer<typeof FormSchema>);
    });

    return () => {
      subscription.unsubscribe();
      debouncedFetchHolidays.cancel();
    };
  }, [form, debouncedFetchHolidays]);

  useEffect(() => {
    fetchHolidays(form.getValues(), "1");
  }, [form, fetchHolidays]);

  const handlePageChange = async (newPage: number) => {
    try {
      setIsLoading(true);
      if (!userId) {
        toast.error("Usuário não identificado.");
        return;
      }

      const {
        success,
        pagination: paginationData,
        holidays,
      } = await GetAllHolidays(
        userId,
        form.getValues("search") || "",
        newPage.toString(),
      );

      if (success) {
        setHolidays(holidays);
        setPagination(paginationData);
      }
    } catch (error) {
      console.error("Erro ao mudar de página:", error);
      toast.error("Não foi possível carregar a página.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteHoliday = async (holidayId: string) => {
    try {
      if (!userId) {
        toast.error("Usuário não identificado.");
        return;
      }

      setDeletingHolidayId(holidayId);
      const { success, message } = await DeleteHoliday(userId, holidayId);

      if (!success) {
        toast.warning(message);
        return;
      }

      toast.success(message);

      const isLastItemOnPage = holidays.length === 1;
      const nextPage = isLastItemOnPage
        ? Math.max(1, pagination.page - 1)
        : pagination.page;
      await handlePageChange(nextPage);
    } catch (error) {
      console.error("Erro ao deletar feriado:", error);
      toast.error("Não foi possível deletar o feriado.");
    } finally {
      setDeletingHolidayId(null);
    }
  };

  return (
    <>
      <Form {...form}>
        <form
          className="flex items-center justify-between"
          onSubmit={form.handleSubmit((values) => fetchHolidays(values, "1"))}
        >
          <FormField
            control={form.control}
            name="search"
            render={({ field }) => (
              <FormItem className="flex items-center gap-4">
                <FormLabel>Buscar:</FormLabel>
                <FormControl>
                  <Input placeholder="buscar feriado" {...field} />
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
              <TableHead className="w-[30%]">Data</TableHead>
              <TableHead className="w-[55%]">Comentário</TableHead>
              <TableHead className="w-[15%]">Ação</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading
              ? Array.from({ length: TABLE_ROWS }).map((_, index) => (
                  <TableRow key={index}>
                    <TableCell className="w-[30%]">
                      <Skeleton className="h-4 w-full max-w-[140px]" />
                    </TableCell>
                    <TableCell className="w-[55%]">
                      <Skeleton className="h-4 w-full max-w-[250px]" />
                    </TableCell>
                    <TableCell className="w-[15%]">
                      <div className="flex items-center justify-end gap-2">
                        <Skeleton className="size-8 rounded-md" />
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              : holidays.map((holiday) => (
                  <TableRow key={holiday._id}>
                    <TableCell className="w-[30%]">
                      <div
                        className="truncate text-sm"
                        title={formatHolidayDate(holiday.date)}
                      >
                        {formatHolidayDate(holiday.date)}
                      </div>
                    </TableCell>
                    <TableCell className="w-[55%]">
                      <div
                        className="truncate text-sm"
                        title={holiday.comment ?? ""}
                      >
                        {holiday.comment ?? "-"}
                      </div>
                    </TableCell>
                    <TableCell className="w-[15%]">
                      <div className="flex justify-start gap-2">
                        <Button variant="ghost" size="icon" className="size-8">
                          <Link href={buildHolidayHref(holiday)}>
                            <Pencil className="size-4" />
                          </Link>
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="size-8"
                              disabled={
                                isLoading || deletingHolidayId === holiday._id
                              }
                            >
                              <Trash className="size-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>
                                Deletar feriado?
                              </AlertDialogTitle>
                              <AlertDialogDescription>
                                Essa ação não pode ser desfeita. O feriado será
                                removido permanentemente.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancelar</AlertDialogCancel>
                              <AlertDialogAction
                                variant="destructive"
                                onClick={() => handleDeleteHoliday(holiday._id)}
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
                {holidays.length === 0 && (
                  <TableRow>
                    <TableCell
                      colSpan={3}
                      className="text-muted-foreground h-16 text-center"
                    >
                      Nenhum feriado encontrado.
                    </TableCell>
                  </TableRow>
                )}
                {Array.from({
                  length: Math.max(
                    0,
                    TABLE_ROWS -
                      holidays.length -
                      (holidays.length === 0 ? 1 : 0),
                  ),
                }).map((_, index) => (
                  <TableRow key={`empty-${index}`}>
                    <TableCell className="w-[30%]">&nbsp;</TableCell>
                    <TableCell className="w-[55%]">&nbsp;</TableCell>
                    <TableCell className="w-[15%]">&nbsp;</TableCell>
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
