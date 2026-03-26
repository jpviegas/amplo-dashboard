"use client";

import {
  DeleteEmployee,
  GetAllEmployees,
} from "@/api/dashboard/funcionarios/route";
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
import { EmployeeTypeWithId } from "@/zodSchemas";
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
  search: z.string(),
});

export function EmployeesList() {
  const [employees, setEmployees] = useState<
    (EmployeeTypeWithId & { companyName: string })[]
  >([]);
  const [deletingEmployeeId, setDeletingEmployeeId] = useState<string | null>(
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

  const fetchEmployees = async (values: z.infer<typeof FormSchema>) => {
    try {
      setIsLoading(true);
      if (!userId) {
        throw new Error("User ID is required");
      }

      const {
        success,
        pagination: paginationData,
        users,
      } = await GetAllEmployees(
        userId,
        values.search,
        pagination.page.toString(),
      );

      if (success) {
        setEmployees(users);
        setPagination(paginationData);
      }
    } catch (error) {
      console.error("Erro ao buscar cargos da empresa:", error);
      toast.error("Não foi possível carregar os cargos da empresa.");
    } finally {
      setIsLoading(false);
    }
  };

  const debouncedfetchEmployees = useCallback(
    debounce((values: z.infer<typeof FormSchema>) => {
      fetchEmployees(values);
    }, 500),
    [userId],
  );

  useEffect(() => {
    const subscription = form.watch((values) => {
      debouncedfetchEmployees(values as z.infer<typeof FormSchema>);
    });

    return () => {
      subscription.unsubscribe();
      debouncedfetchEmployees.cancel();
    };
  }, [form, debouncedfetchEmployees]);

  useEffect(() => {
    fetchEmployees(form.getValues());
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
        users,
      } = await GetAllEmployees(
        userId,
        form.getValues("search"),
        newPage.toString(),
      );

      if (success) {
        setEmployees(users);
        setPagination(paginationData);
      }
    } catch (error) {
      console.error("Erro ao mudar de página:", error);
      toast.error("Não foi possível carregar a página.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteEmployee = async (employeeId: string) => {
    try {
      if (!userId) {
        toast.error("Usuário não identificado.");
        return;
      }

      setDeletingEmployeeId(employeeId);
      const { success, message } = await DeleteEmployee(userId, employeeId);

      if (!success) {
        toast.warning(message);
        return;
      }

      toast.success(message);

      const isLastItemOnPage = employees.length === 1;
      const nextPage = isLastItemOnPage
        ? Math.max(1, pagination.page - 1)
        : pagination.page;
      await handlePageChange(nextPage);
    } catch (error) {
      console.error("Erro ao deletar funcionário:", error);
      toast.error("Não foi possível deletar o funcionário.");
    } finally {
      setDeletingEmployeeId(null);
    }
  };

  return (
    <>
      <Form {...form}>
        <form
          className="flex items-center justify-between"
          onSubmit={form.handleSubmit(fetchEmployees)}
        >
          <FormField
            control={form.control}
            name="search"
            render={({ field }) => (
              <FormItem className="flex items-center gap-4">
                <FormLabel>Buscar:</FormLabel>
                <FormControl>
                  <Input placeholder="buscar funcionário" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </form>
      </Form>

      <div className="mx-auto overflow-x-auto rounded-md border sm:w-[70%] lg:w-[50%]">
        <Table className="w-full table-fixed">
          <TableHeader>
            <TableRow>
              <TableHead className="w-[70%]">Funcionário</TableHead>
              <TableHead className="w-[30%]">Ação</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array.from({ length: TABLE_ROWS }).map((_, index) => (
                <TableRow key={index}>
                  <TableCell className="w-[70%]">
                    <Skeleton className="h-4 w-full max-w-[250px]" />
                  </TableCell>
                  <TableCell className="w-[30%]">
                    <Skeleton className="h-4 w-full max-w-[150px]" />
                    <div className="mt-2 flex justify-end gap-2 md:mt-0">
                      <Skeleton className="size-8 rounded-md" />
                      <Skeleton className="size-8 rounded-md" />
                    </div>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <>
                {employees.length === 0 && (
                  <TableRow>
                    <TableCell
                      colSpan={2}
                      className="text-muted-foreground h-16 text-center"
                    >
                      Nenhum funcionário encontrado.
                    </TableCell>
                  </TableRow>
                )}
                {employees.map((employee) => (
                  <TableRow key={employee._id}>
                    <TableCell>
                      <div className="truncate text-sm" title={employee.name}>
                        {employee.name}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex min-w-0 items-center gap-2">
                        <div className="flex justify-start gap-2">
                          <HoverCard openDelay={100} closeDelay={200}>
                            <HoverCardTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="size-8"
                                asChild
                              >
                                <Link
                                  href={`/dashboard/funcionarios/${employee._id}`}
                                >
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
                                      isLoading ||
                                      deletingEmployeeId === employee._id
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
                                  Deletar funcionário?
                                </AlertDialogTitle>
                                <AlertDialogDescription>
                                  Essa ação não pode ser desfeita. O funcionário
                                  {employee.name
                                    ? ` "${employee.name}"`
                                    : ""}{" "}
                                  será removido permanentemente.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                <AlertDialogAction
                                  variant="destructive"
                                  onClick={() =>
                                    handleDeleteEmployee(employee._id)
                                  }
                                >
                                  Deletar
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                        <div
                          className="min-w-0 flex-1 truncate text-xs md:text-sm"
                          title={employee.companyName}
                        >
                          {employee.companyName}
                        </div>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
                {Array.from({
                  length: Math.max(
                    0,
                    TABLE_ROWS -
                      employees.length -
                      (employees.length === 0 ? 1 : 0),
                  ),
                }).map((_, index) => (
                  <TableRow key={`empty-${index}`}>
                    <TableCell className="w-[45%]">&nbsp;</TableCell>
                    <TableCell className="w-[55%]">
                      <div className="flex items-center justify-between">
                        &nbsp;
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
