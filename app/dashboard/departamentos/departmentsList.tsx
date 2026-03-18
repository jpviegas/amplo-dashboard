"use client";

import {
  DeleteDepartment,
  GetCompanyDepartments,
} from "@/api/dashboard/departamentos/route";
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
import { DepartmentTypeWithId } from "@/zodSchemas";
import { zodResolver } from "@hookform/resolvers/zod";
import debounce from "lodash/debounce";
import { Pencil, Trash } from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

const FormSchema = z.object({
  departmentName: z.string(),
});

export function DepartmentsList() {
  const [departments, setDepartments] = useState<DepartmentTypeWithId[]>([]);
  const [deletingDepartmentId, setDeletingDepartmentId] = useState<
    string | null
  >(null);
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

  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      departmentName: "",
    },
  });

  const fetchDepartments = async (values: z.infer<typeof FormSchema>) => {
    try {
      setIsLoading(true);
      if (!user?._id) {
        throw new Error("User ID is required");
      }

      const {
        success,
        pagination: paginationData,
        departments,
      } = await GetCompanyDepartments(
        user._id,
        values.departmentName,
        pagination.page.toString(),
      );

      if (success) {
        setDepartments(departments);
        setPagination(paginationData);
      }
    } catch (error) {
      console.error("Erro ao buscar departamentos:", error);
      toast.error("Não foi possível carregar os departamentos.");
    } finally {
      setIsLoading(false);
    }
  };

  const debouncedFetchDepartment = useCallback(
    debounce((values: z.infer<typeof FormSchema>) => {
      fetchDepartments(values);
    }, 500),
    [user?._id],
  );

  useEffect(() => {
    const subscription = form.watch((values) => {
      debouncedFetchDepartment(values as z.infer<typeof FormSchema>);
    });

    return () => {
      subscription.unsubscribe();
      debouncedFetchDepartment.cancel();
    };
  }, [form, debouncedFetchDepartment]);

  useEffect(() => {
    fetchDepartments(form.getValues());
  }, [form]);

  const TABLE_ROWS = 10;

  const handlePageChange = async (newPage: number) => {
    try {
      setIsLoading(true);
      if (!user?._id) {
        throw new Error("User ID is required");
      }

      const {
        success,
        pagination: paginationData,
        departments,
      } = await GetCompanyDepartments(
        user._id,
        form.getValues("departmentName"),
        newPage.toString(),
      );
      console.log(departments);

      if (success) {
        setDepartments(departments);
        setPagination(paginationData);
      }
    } catch (error) {
      console.error("Erro ao mudar de página:", error);
      toast.error("Não foi possível carregar a página.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteDepartment = async (departmentId: string) => {
    try {
      if (!user?._id) {
        toast.error("Usuário não identificado.");
        return;
      }

      setDeletingDepartmentId(departmentId);
      const { success, message } = await DeleteDepartment(
        user._id,
        departmentId,
      );

      if (!success) {
        toast.warning(message);
        return;
      }

      toast.success(message);

      const isLastItemOnPage = departments.length === 1;
      const nextPage = isLastItemOnPage
        ? Math.max(1, pagination.page - 1)
        : pagination.page;
      await handlePageChange(nextPage);
    } catch (error) {
      console.error("Erro ao deletar departamento:", error);
      toast.error("Não foi possível deletar o departamento.");
    } finally {
      setDeletingDepartmentId(null);
    }
  };

  return (
    <>
      <Form {...form}>
        <form
          className="flex items-center justify-between"
          onSubmit={form.handleSubmit(fetchDepartments)}
        >
          <FormField
            control={form.control}
            name="departmentName"
            render={({ field }) => (
              <FormItem className="flex items-center gap-4">
                <FormLabel>Buscar:</FormLabel>
                <FormControl>
                  <Input placeholder="buscar departamento" {...field} />
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
              <TableHead>Departamento</TableHead>
              {/* <TableHead>Quantidade de Funcionários</TableHead> */}
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array.from({ length: TABLE_ROWS }).map((_, index) => (
                <TableRow key={index}>
                  <TableCell className="w-1/2">
                    <Skeleton className="h-4 w-full max-w-[250px]" />
                  </TableCell>
                  <TableCell className="flex w-full items-center justify-between">
                    <Skeleton className="h-4 w-full max-w-[50px]" />
                    <div className="flex justify-end gap-2">
                      <Skeleton className="size-8 rounded-md" />
                      <Skeleton className="size-8 rounded-md" />
                    </div>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <>
                {departments.length === 0 && (
                  <TableRow>
                    <TableCell
                      colSpan={2}
                      className="text-muted-foreground h-16 text-center"
                    >
                      Nenhum departamento encontrado.
                    </TableCell>
                  </TableRow>
                )}
                {departments.map((job) => (
                  <TableRow key={job._id}>
                    <TableCell className="w-1/2">
                      {job.departmentName}
                    </TableCell>
                    <TableCell className="flex w-full items-center justify-between">
                      <div className="flex justify-end gap-2">
                        <HoverCard openDelay={100} closeDelay={200}>
                          <HoverCardTrigger>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="size-8"
                            >
                              <Link href={`departamentos/${job._id}`}>
                                <Pencil className="size-4" />
                              </Link>
                            </Button>
                          </HoverCardTrigger>
                          <HoverCardContent>Editar</HoverCardContent>
                        </HoverCard>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <HoverCard openDelay={100} closeDelay={200}>
                              <HoverCardTrigger>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="size-8 cursor-pointer"
                                  disabled={
                                    isLoading ||
                                    deletingDepartmentId === job._id
                                  }
                                >
                                  <Trash className="size-4" />
                                </Button>
                                <HoverCardContent>Deletar</HoverCardContent>
                              </HoverCardTrigger>
                            </HoverCard>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>
                                Deletar departamento?
                              </AlertDialogTitle>
                              <AlertDialogDescription>
                                Essa ação não pode ser desfeita. O departamento
                                {job.departmentName
                                  ? ` "${job.departmentName}"`
                                  : ""}{" "}
                                será removido permanentemente.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancelar</AlertDialogCancel>
                              <AlertDialogAction
                                variant="destructive"
                                onClick={() => handleDeleteDepartment(job._id)}
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
                      departments.length -
                      (departments.length === 0 ? 1 : 0),
                  ),
                }).map((_, index) => (
                  <TableRow key={`empty-${index}`}>
                    <TableCell className="w-1/2">&nbsp;</TableCell>
                    <TableCell className="flex w-full items-center justify-between">
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
        itemsCount={departments.length}
        onPageChange={handlePageChange}
      />
    </>
  );
}
