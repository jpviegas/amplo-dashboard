"use client";

import { GetCompanyHours } from "@/api/dashboard/horarios/route";
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
import { WorkingHourTypeWithId } from "@/zodSchemas";
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

export function HoursList() {
  const [hours, setHours] = useState<WorkingHourTypeWithId[]>([]);
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

  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      search: "",
    },
  });

  const fetchHours = useCallback(
    async (values: z.infer<typeof FormSchema>) => {
      try {
        setIsLoading(true);
        if (!user?._id) {
          throw new Error("User ID is required");
        }

        const {
          success,
          pagination: paginationData,
          hours,
        } = await GetCompanyHours(
          user._id,
          values.search,
          pagination.page.toString(),
        );

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
    [user?._id, pagination.page],
  );

  const debouncedFetchHours = useCallback(
    debounce((values: z.infer<typeof FormSchema>) => {
      fetchHours(values);
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
    fetchHours(form.getValues());
  }, [fetchHours]);

  const handlePageChange = async (newPage: number) => {
    try {
      setIsLoading(true);
      if (!user?._id) {
        throw new Error("User ID is required");
      }

      const {
        success,
        pagination: paginationData,
        hours,
      } = await GetCompanyHours(
        user._id,
        form.getValues("search"),
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

  return (
    <>
      <Form {...form}>
        <form
          className="flex items-center justify-between"
          onSubmit={form.handleSubmit(fetchHours)}
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
                  <TableCell className="w-1/2">{hour.hour}</TableCell>
                  <TableCell className="flex w-full items-center justify-between">
                    10
                    <div className="flex justify-end gap-2">
                      <Button variant="ghost" size="icon" className="size-8">
                        <Link href={`hours/${hour._id}`}>
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
        itemsCount={hours.length}
        onPageChange={handlePageChange}
      />
    </>
  );
}
