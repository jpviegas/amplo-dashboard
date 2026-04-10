"use client";

import { DeleteHour, GetAllHours } from "@/api/dashboard/horarios/route";
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
import { WorkingHourTypeWithId } from "@/zodSchemas";
import { zodResolver } from "@hookform/resolvers/zod";
import Cookies from "js-cookie";
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

export function HoursList() {
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
  const buildHourHref = (hour: WorkingHourTypeWithId) => {
    const base = hour.name || "horario";
    const slug = slugify(base) || "horario";
    return `/dashboard/horarios/${slug}-${hour._id}`;
  };
  const [hours, setHours] = useState<WorkingHourTypeWithId[]>([]);
  const [deletingHourId, setDeletingHourId] = useState<string | null>(null);
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
  const TABLE_ROWS = 10;

  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      search: "",
    },
  });

  const fetchHours = useCallback(
    async (values: z.infer<typeof FormSchema>, page = "1") => {
      try {
        setIsLoading(true);
        if (!userId) {
          throw new Error("Usuário não identificado.");
        }

        const {
          success,
          pagination: paginationData,
          hours,
        } = await GetAllHours(userId, values.search || "", page);

        if (success) {
          setHours(hours);
          setPagination(paginationData);
        }
      } catch (error) {
        console.error("Erro ao buscar horas:", error);
        toast.error("Não foi possível carregar as horas.");
      } finally {
        setIsLoading(false);
      }
    },
    [userId],
  );

  const debouncedFetchHours = useCallback(
    debounce((values: z.infer<typeof FormSchema>) => {
      fetchHours(values, "1");
    }, 500),
    [fetchHours],
  );

  useEffect(() => {
    const subscription = form.watch((values) => {
      debouncedFetchHours(values as z.infer<typeof FormSchema>);
    });

    return () => {
      subscription.unsubscribe();
      debouncedFetchHours.cancel();
    };
  }, [form, debouncedFetchHours]);

  useEffect(() => {
    fetchHours(form.getValues(), "1");
  }, [fetchHours]);

  const handlePageChange = async (newPage: number) => {
    try {
      setIsLoading(true);
      if (!userId) {
        throw new Error("Usuário não identificado.");
      }

      const {
        success,
        pagination: paginationData,
        hours,
      } = await GetAllHours(
        userId,
        form.getValues("search") || "",
        newPage.toString(),
      );

      if (success) {
        setHours(hours);
        setPagination(paginationData);
      }
    } catch (error) {
      console.error("Erro ao mudar de página:", error);
      toast.error("Não foi possível carregar a página.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteHour = async (hourId: string) => {
    try {
      if (!userId) {
        toast.error("Usuário não identificado.");
        return;
      }

      setDeletingHourId(hourId);
      const { success, message } = await DeleteHour(userId, hourId);

      if (!success) {
        toast.warning(message);
        return;
      }

      toast.success(message);

      const isLastItemOnPage = hours.length === 1;
      const nextPage = isLastItemOnPage
        ? Math.max(1, pagination.page - 1)
        : pagination.page;
      await handlePageChange(nextPage);
    } catch (error) {
      console.error("Erro ao deletar horário:", error);
      toast.error("Não foi possível deletar o horário.");
    } finally {
      setDeletingHourId(null);
    }
  };

  return (
    <>
      <Form {...form}>
        <form
          className="flex items-center justify-between"
          onSubmit={form.handleSubmit((values) => fetchHours(values, "1"))}
        >
          <FormField
            control={form.control}
            name="search"
            render={({ field }) => (
              <FormItem className="flex items-center gap-4">
                <FormLabel>Buscar:</FormLabel>
                <FormControl>
                  <Input placeholder="buscar horário de trabalho" {...field} />
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
              <TableHead className="w-[70%]">Horário de trabalho</TableHead>
              <TableHead className="w-[30%]">Ação</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading
              ? Array.from({ length: TABLE_ROWS }).map((_, index) => (
                  <TableRow key={index}>
                    <TableCell className="w-[70%]">
                      <Skeleton className="h-4 w-full max-w-[250px]" />
                    </TableCell>
                    <TableCell className="w-[30%]">
                      <div className="flex items-center justify-end gap-2">
                        <Skeleton className="size-8 rounded-md" />
                        <Skeleton className="size-8 rounded-md" />
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              : hours.map((hour) => (
                  <TableRow key={hour._id}>
                    <TableCell className="w-[70%]">
                      <div className="truncate text-sm">{hour.name}</div>
                    </TableCell>
                    <TableCell className="w-[30%]">
                      <div className="flex gap-2">
                        <HoverCard openDelay={100} closeDelay={200}>
                          <HoverCardTrigger asChild>
                            <Button
                              asChild
                              variant="ghost"
                              size="icon"
                              className="size-8 cursor-pointer"
                              disabled={isLoading}
                            >
                              <Link href={buildHourHref(hour)}>
                                <Pencil className="size-4" />
                              </Link>
                            </Button>
                          </HoverCardTrigger>
                          <HoverCardContent>Editar</HoverCardContent>
                        </HoverCard>

                        <AlertDialog>
                          <HoverCard openDelay={100} closeDelay={200}>
                            <HoverCardTrigger asChild>
                              <AlertDialogTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="size-8 cursor-pointer"
                                  disabled={
                                    isLoading || deletingHourId === hour._id
                                  }
                                >
                                  <Trash className="size-4" />
                                </Button>
                              </AlertDialogTrigger>
                            </HoverCardTrigger>
                            <HoverCardContent>Deletar</HoverCardContent>
                          </HoverCard>

                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>
                                Deletar horário?
                              </AlertDialogTitle>
                              <AlertDialogDescription>
                                Essa ação não pode ser desfeita. O horário será
                                removido permanentemente.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancelar</AlertDialogCancel>
                              <AlertDialogAction
                                variant="destructive"
                                onClick={() => handleDeleteHour(hour._id)}
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
                {hours.length === 0 && (
                  <TableRow>
                    <TableCell
                      colSpan={2}
                      className="text-muted-foreground h-16 text-center"
                    >
                      Nenhum horário encontrado.
                    </TableCell>
                  </TableRow>
                )}
                {Array.from({
                  length: Math.max(
                    0,
                    TABLE_ROWS - hours.length - (hours.length === 0 ? 1 : 0),
                  ),
                }).map((_, index) => (
                  <TableRow key={`empty-${index}`}>
                    <TableCell className="w-[70%]">&nbsp;</TableCell>
                    <TableCell className="w-[30%]">
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
