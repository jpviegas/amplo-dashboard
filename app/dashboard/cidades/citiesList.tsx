"use client";

import { DeleteCity, GetAllCities } from "@/api/dashboard/cities/route";
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
import { CityTypeWithId } from "@/zodSchemas";
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

export function CitiesList() {
  const [cities, setCities] = useState<CityTypeWithId[]>([]);
  const [deletingCityId, setDeletingCityId] = useState<string | null>(null);
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
  const TABLE_ROWS = 10;

  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      search: "",
    },
  });

  const fetchCities = async (values: z.infer<typeof FormSchema>) => {
    try {
      setIsLoading(true);
      if (!userId) {
        throw new Error("User ID is required");
      }

      const {
        success,
        pagination: paginationData,
        cities,
      } = await GetAllCities(userId, values.search, pagination.page.toString());

      if (success) {
        setCities(cities);
        setPagination(paginationData);
      }
    } catch (error) {
      console.error("Erro ao buscar cidades:", error);
      toast.error("Não foi possível carregar as cidades.");
    } finally {
      setIsLoading(false);
    }
  };

  const debouncedFetchCities = useCallback(
    debounce((values: z.infer<typeof FormSchema>) => {
      fetchCities(values);
    }, 500),
    [userId],
  );

  useEffect(() => {
    const subscription = form.watch((values) => {
      debouncedFetchCities(values as z.infer<typeof FormSchema>);
    });

    return () => {
      subscription.unsubscribe();
      debouncedFetchCities.cancel();
    };
  }, [form, debouncedFetchCities]);

  useEffect(() => {
    fetchCities(form.getValues());
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
        cities,
      } = await GetAllCities(
        userId,
        form.getValues("search"),
        newPage.toString(),
      );

      if (success) {
        setCities(cities);
        setPagination(paginationData);
      }
    } catch (error) {
      console.error("Erro ao mudar de página:", error);
      toast.error("Não foi possível carregar a página.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteCity = async (cityId: string) => {
    try {
      if (!userId) {
        toast.error("Usuário não identificado.");
        return;
      }

      setDeletingCityId(cityId);
      const { success, message } = await DeleteCity(userId, cityId);

      if (!success) {
        toast.warning(message);
        return;
      }

      toast.success(message);

      const isLastItemOnPage = cities.length === 1;
      const nextPage = isLastItemOnPage
        ? Math.max(1, pagination.page - 1)
        : pagination.page;
      await handlePageChange(nextPage);
    } catch (error) {
      console.error("Erro ao deletar cidade:", error);
      toast.error("Não foi possível deletar a cidade.");
    } finally {
      setDeletingCityId(null);
    }
  };

  return (
    <>
      <Form {...form}>
        <form
          className="flex items-center justify-between"
          onSubmit={form.handleSubmit(fetchCities)}
        >
          <FormField
            control={form.control}
            name="search"
            render={({ field }) => (
              <FormItem className="flex items-center gap-4">
                <FormLabel>Buscar:</FormLabel>
                <FormControl>
                  <Input placeholder="buscar cidade" {...field} />
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
              <TableHead className="w-[40%]">Cidade</TableHead>
              <TableHead className="w-[20%]">Vale-Refeição</TableHead>
              <TableHead className="w-[20%]">Vale-Transporte</TableHead>
              <TableHead className="w-[20%]">Ação</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading
              ? Array.from({ length: TABLE_ROWS }).map((_, index) => (
                  <TableRow key={index}>
                    <TableCell className="w-[40%]">
                      <Skeleton className="h-4 w-full max-w-[250px]" />
                    </TableCell>
                    <TableCell className="w-[20%]">
                      <Skeleton className="h-4 w-full max-w-[100px]" />
                    </TableCell>
                    <TableCell className="w-[20%]">
                      <Skeleton className="h-4 w-full max-w-[100px]" />
                    </TableCell>
                    <TableCell className="w-[20%]">
                      <div className="flex items-center justify-end gap-2">
                        <Skeleton className="size-8 rounded-md" />
                        <Skeleton className="size-8 rounded-md" />
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              : cities.map((city) => (
                  <TableRow key={city._id}>
                    <TableCell className="w-[40%]">
                      <div className="truncate text-sm" title={city.city ?? ""}>
                        {city.city ?? "-"}
                      </div>
                    </TableCell>
                    <TableCell className="w-[20%]">
                      <div className="truncate text-sm">
                        {typeof city.meal === "number" ? city.meal : "-"}
                      </div>
                    </TableCell>
                    <TableCell className="w-[20%]">
                      <div className="truncate text-sm">
                        {typeof city.transport === "number"
                          ? city.transport
                          : "-"}
                      </div>
                    </TableCell>
                    <TableCell className="w-[20%]">
                      <div className="flex gap-2">
                        <HoverCard openDelay={100} closeDelay={0}>
                          <HoverCardTrigger>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="size-8"
                            >
                              <Link href={`/dashboard/cidades/${city._id}`}>
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
                                    isLoading || deletingCityId === city._id
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
                                Deletar cidade?
                              </AlertDialogTitle>
                              <AlertDialogDescription>
                                Essa ação não pode ser desfeita. A cidade
                                {city.city ? ` "${city.city}"` : ""} será
                                removido permanentemente.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancelar</AlertDialogCancel>
                              <AlertDialogAction
                                variant="destructive"
                                onClick={() => handleDeleteCity(city._id)}
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
                {cities.length === 0 && (
                  <TableRow>
                    <TableCell
                      colSpan={4}
                      className="text-muted-foreground h-16 text-center"
                    >
                      Nenhuma cidade encontrada.
                    </TableCell>
                  </TableRow>
                )}
                {Array.from({
                  length: Math.max(
                    0,
                    TABLE_ROWS - cities.length - (cities.length === 0 ? 1 : 0),
                  ),
                }).map((_, index) => (
                  <TableRow key={`empty-${index}`}>
                    <TableCell className="w-[40%]">&nbsp;</TableCell>
                    <TableCell className="w-[20%]">&nbsp;</TableCell>
                    <TableCell className="w-[20%]">&nbsp;</TableCell>
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
