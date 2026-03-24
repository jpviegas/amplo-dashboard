"use client";

import {
  DeleteHour,
  GetAllHours,
  UpdateHour,
} from "@/api/dashboard/horarios/route";
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useUser } from "@/context/UserContext";
import {
  registerWorkingHourSchema,
  WorkingHourType,
  WorkingHourTypeWithId,
} from "@/zodSchemas";
import { zodResolver } from "@hookform/resolvers/zod";
import Cookies from "js-cookie";
import debounce from "lodash/debounce";
import { Pencil, Trash } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

const FormSchema = z.object({
  search: z.string().optional(),
});

export function HoursList() {
  const [hours, setHours] = useState<WorkingHourTypeWithId[]>([]);
  const [deletingHourId, setDeletingHourId] = useState<string | null>(null);
  const [editingHourId, setEditingHourId] = useState<string | null>(null);
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

  const editForm = useForm<WorkingHourType>({
    resolver: zodResolver(registerWorkingHourSchema),
    defaultValues: {
      initialHour: "",
      finalHour: "",
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

  const handleOpenEdit = (hour: WorkingHourTypeWithId) => {
    setEditingHourId(hour._id);
    editForm.reset({
      initialHour: hour.initialHour,
      finalHour: hour.finalHour,
    });
  };

  const handleUpdateHour = async (values: WorkingHourType) => {
    try {
      if (!userId) {
        toast.error("Usuário não identificado.");
        return;
      }
      if (!editingHourId) {
        toast.error("Horário não identificado.");
        return;
      }

      const { success, message } = await UpdateHour(
        userId,
        editingHourId,
        values,
      );

      if (!success) {
        toast.warning(message);
        return;
      }

      toast.success(message);
      setEditingHourId(null);
      await handlePageChange(pagination.page);
    } catch (error) {
      console.error("Erro ao atualizar horário:", error);
      toast.error("Não foi possível atualizar o horário.");
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

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Horário de trabalho</TableHead>
              <TableHead>Ação</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={2} className="h-24 text-center">
                  <div className="flex items-center justify-center gap-2">
                    <div className="border-primary h-4 w-4 animate-spin rounded-full border-2 border-t-transparent" />
                    Carregando...
                  </div>
                </TableCell>
              </TableRow>
            ) : hours.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={2}
                  className="text-muted-foreground h-24 text-center"
                >
                  Nenhum horário encontrado.
                </TableCell>
              </TableRow>
            ) : (
              hours.map((hour) => (
                <TableRow key={hour._id}>
                  <TableCell className="w-1/2">
                    {hour.initialHour} / {hour.finalHour}
                  </TableCell>
                  <TableCell className="flex w-full items-center justify-between">
                    <div className="flex justify-end gap-2">
                      <AlertDialog
                        open={editingHourId === hour._id}
                        onOpenChange={(open) => {
                          if (!open) setEditingHourId(null);
                        }}
                      >
                        <HoverCard openDelay={100} closeDelay={200}>
                          <HoverCardTrigger asChild>
                            <AlertDialogTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="size-8 cursor-pointer"
                                onClick={() => handleOpenEdit(hour)}
                                disabled={isLoading}
                              >
                                <Pencil className="size-4" />
                              </Button>
                            </AlertDialogTrigger>
                          </HoverCardTrigger>
                          <HoverCardContent>Editar</HoverCardContent>
                        </HoverCard>

                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Editar horário</AlertDialogTitle>
                            <AlertDialogDescription>
                              Atualize as horas inicial e final.
                            </AlertDialogDescription>
                          </AlertDialogHeader>

                          <Form {...editForm}>
                            <form
                              id={`edit-hour-${hour._id}`}
                              className="space-y-4"
                              onSubmit={editForm.handleSubmit(handleUpdateHour)}
                            >
                              <div className="grid gap-4 md:grid-cols-2">
                                <FormField
                                  control={editForm.control}
                                  name="initialHour"
                                  render={({ field }) => (
                                    <FormItem>
                                      <FormLabel>Hora Inicial</FormLabel>
                                      <FormControl>
                                        <Input type="time" {...field} />
                                      </FormControl>
                                      <FormMessage />
                                    </FormItem>
                                  )}
                                />
                                <FormField
                                  control={editForm.control}
                                  name="finalHour"
                                  render={({ field }) => (
                                    <FormItem>
                                      <FormLabel>Hora Final</FormLabel>
                                      <FormControl>
                                        <Input type="time" {...field} />
                                      </FormControl>
                                      <FormMessage />
                                    </FormItem>
                                  )}
                                />
                              </div>
                            </form>
                          </Form>

                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancelar</AlertDialogCancel>
                            <AlertDialogAction
                              type="submit"
                              form={`edit-hour-${hour._id}`}
                            >
                              Salvar
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>

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
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <TablePagination
        pagination={pagination}
        itemsCount={hours.length}
        onPageChange={handlePageChange}
      />
    </>
  );
}
