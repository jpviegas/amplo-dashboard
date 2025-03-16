"use client";

import { GetCompanyDepartments } from "@/api/dashboard/departamentos/route";
import { TablePagination } from "@/components/layout/dashboard/TablePagination";
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
  department: z.string(),
});

export function DepartmentsList() {
  const [departments, setDepartments] = useState<DepartmentTypeWithId[]>([]);
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
      department: "",
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
        values.department,
        pagination.page.toString(),
      );

      if (success) {
        setDepartments(departments);
        setPagination(paginationData);
      }
    } catch (error) {
      console.error("Erro ao buscar cargos da empresa:", error);
      toast.error("Não foi possível carregar os cargos da empresa.");
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
        form.getValues("department"),
        newPage.toString(),
      );

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

  return (
    <>
      <Form {...form}>
        <form
          className="flex items-center justify-between"
          onSubmit={form.handleSubmit(fetchDepartments)}
        >
          <FormField
            control={form.control}
            name="department"
            render={({ field }) => (
              <FormItem className="flex items-center gap-4">
                <FormLabel>Buscar:</FormLabel>
                <FormControl>
                  <Input placeholder="buscar cargo" {...field} />
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
              <TableHead>Quantidade de Funcionários</TableHead>
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
            ) : departments.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={2}
                  className="text-muted-foreground h-24 text-center"
                >
                  Nenhum departamento encontrado.
                </TableCell>
              </TableRow>
            ) : (
              departments.map((job) => (
                <TableRow key={job._id}>
                  <TableCell className="w-1/2">{job.department}</TableCell>
                  <TableCell className="flex w-full items-center justify-between">
                    10
                    <div className="flex justify-end gap-2">
                      <Button variant="ghost" size="icon" className="size-8">
                        <Link href={`roles/${job._id}`}>
                          <Pencil className="size-4" />
                        </Link>
                      </Button>
                      <Button variant="ghost" size="icon" className="size-8">
                        <Trash className="size-4" />
                      </Button>
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
        itemsCount={departments.length}
        onPageChange={handlePageChange}
      />
    </>
  );
}
