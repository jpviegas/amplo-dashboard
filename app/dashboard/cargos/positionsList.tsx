"use client";

import {
  DeletePosition,
  GetCompanyPositions,
} from "@/api/dashboard/cargos/route";
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
import { PositionTypeWithId } from "@/zodSchemas";
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

export function PositionsList() {
  const [positions, setPositions] = useState<PositionTypeWithId[]>([]);
  const [deletingPositionId, setDeletingPositionId] = useState<string | null>(
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

  const fetchPositions = async (values: z.infer<typeof FormSchema>) => {
    try {
      setIsLoading(true);
      if (!userId) {
        throw new Error("User ID is required");
      }

      const {
        success,
        pagination: paginationData,
        positions,
      } = await GetCompanyPositions(
        userId,
        values.search,
        pagination.page.toString(),
      );

      if (success) {
        setPositions(positions);
        setPagination(paginationData);
      }
    } catch (error) {
      console.error("Erro ao buscar cargos da empresa:", error);
      toast.error("Não foi possível carregar os cargos da empresa.");
    } finally {
      setIsLoading(false);
    }
  };

  const debouncedFetchPositions = useCallback(
    debounce((values: z.infer<typeof FormSchema>) => {
      fetchPositions(values);
    }, 500),
    [userId],
  );

  useEffect(() => {
    const subscription = form.watch((values) => {
      debouncedFetchPositions(values as z.infer<typeof FormSchema>);
    });

    return () => {
      subscription.unsubscribe();
      debouncedFetchPositions.cancel();
    };
  }, [form, debouncedFetchPositions]);

  useEffect(() => {
    fetchPositions(form.getValues());
  }, [form]);

  const handlePageChange = async (newPage: number) => {
    try {
      setIsLoading(true);
      if (!userId) {
        throw new Error("User ID is required");
      }

      const {
        success,
        pagination: paginationData,
        positions,
      } = await GetCompanyPositions(
        userId,
        form.getValues("search"),
        newPage.toString(),
      );

      if (success) {
        setPositions(positions);
        setPagination(paginationData);
      }
    } catch (error) {
      console.error("Erro ao mudar de página:", error);
      toast.error("Não foi possível carregar a página.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeletePosition = async (positionId: string) => {
    try {
      if (!userId) {
        toast.error("Usuário não identificado.");
        return;
      }

      setDeletingPositionId(positionId);
      const { success, message } = await DeletePosition(userId, positionId);

      if (!success) {
        toast.warning(message);
        return;
      }

      toast.success(message);

      const isLastItemOnPage = positions.length === 1;
      const nextPage = isLastItemOnPage
        ? Math.max(1, pagination.page - 1)
        : pagination.page;
      await handlePageChange(nextPage);
    } catch (error) {
      console.error("Erro ao deletar cargo:", error);
      toast.error("Não foi possível deletar o cargo.");
    } finally {
      setDeletingPositionId(null);
    }
  };

  return (
    <>
      <Form {...form}>
        <form
          className="flex items-center justify-between"
          onSubmit={form.handleSubmit(fetchPositions)}
        >
          <FormField
            control={form.control}
            name="search"
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
              <TableHead>Cargo</TableHead>
              {/* <TableHead>Quantidade de Funcionários</TableHead> */}
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
            ) : positions.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={2}
                  className="text-muted-foreground h-24 text-center"
                >
                  Nenhum cargo encontrado.
                </TableCell>
              </TableRow>
            ) : (
              positions.map((position) => (
                <TableRow key={position._id}>
                  <TableCell className="w-1/2">
                    {position.positionName}
                  </TableCell>
                  <TableCell className="flex w-full items-center justify-between">
                    {/* 10 */}
                    <div className="flex justify-end gap-2">
                      <HoverCard openDelay={100} closeDelay={200}>
                        <HoverCardTrigger>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="size-8"
                          >
                            <Link href={`/dashboard/cargos/${position._id}`}>
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
                                  deletingPositionId === position._id
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
                            <AlertDialogTitle>Deletar cargo?</AlertDialogTitle>
                            <AlertDialogDescription>
                              Essa ação não pode ser desfeita. O cargo
                              {position.positionName
                                ? ` "${position.positionName}"`
                                : ""}{" "}
                              será removido permanentemente.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancelar</AlertDialogCancel>
                            <AlertDialogAction
                              variant="destructive"
                              onClick={() => handleDeletePosition(position._id)}
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
        itemsCount={positions.length}
        onPageChange={handlePageChange}
      />
    </>
  );
}
