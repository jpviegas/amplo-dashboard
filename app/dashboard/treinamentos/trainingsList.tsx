"use client";

import {
  DeleteTraining,
  GetAllTrainings,
} from "@/api/dashboard/treinamentos/route";
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
import { TrainingsTypeWithId } from "@/zodSchemas";
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

export function TrainingsList() {
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
  const buildTrainingHref = (training: TrainingsTypeWithId) => {
    const base = training.title || "treinamento";
    const slug = slugify(base) || "treinamento";
    return `/dashboard/treinamentos/${slug}-${training._id}`;
  };

  const { user } = useUser();
  const userId = user?._id || Cookies.get("user");
  const [trainings, setTrainings] = useState<TrainingsTypeWithId[]>([]);
  const [deletingTrainingId, setDeletingTrainingId] = useState<string | null>(
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

  const TABLE_ROWS = 10;

  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      search: "",
    },
  });

  const fetchTrainings = useCallback(
    async (values: z.infer<typeof FormSchema>, page = "1") => {
      try {
        setIsLoading(true);

        if (!userId) {
          setTrainings([]);
          return;
        }

        const {
          success,
          pagination: paginationData,
          trainings,
        } = await GetAllTrainings(userId, values.search || "", page);

        if (!success) {
          toast.error("Não foi possível carregar os treinamentos.");
          setTrainings([]);
          return;
        }

        setTrainings(trainings);
        setPagination(paginationData);
      } catch (error) {
        console.error("Erro ao buscar treinamentos:", error);
        toast.error("Não foi possível carregar os treinamentos.");
        setTrainings([]);
      } finally {
        setIsLoading(false);
      }
    },
    [userId],
  );

  const debouncedFetchTrainings = useMemo(() => {
    return debounce((values: z.infer<typeof FormSchema>) => {
      fetchTrainings(values);
    }, 500);
  }, [fetchTrainings]);

  useEffect(() => {
    const subscription = form.watch((values) => {
      debouncedFetchTrainings(values as z.infer<typeof FormSchema>);
    });

    return () => {
      subscription.unsubscribe();
      debouncedFetchTrainings.cancel();
    };
  }, [form, debouncedFetchTrainings]);

  useEffect(() => {
    fetchTrainings(form.getValues());
  }, [fetchTrainings, form]);

  const handlePageChange = async (newPage: number) => {
    try {
      setIsLoading(true);
      if (!userId) {
        throw new Error("User ID is required");
      }

      const {
        success,
        pagination: paginationData,
        trainings,
      } = await GetAllTrainings(
        userId,
        form.getValues("search"),
        newPage.toString(),
      );

      if (success) {
        setTrainings(trainings);
        setPagination(paginationData);
      }
    } catch (error) {
      console.error("Erro ao mudar de página:", error);
      toast.error("Não foi possível carregar a página.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteTraining = async (trainingId: string) => {
    try {
      if (!userId) {
        toast.error("Usuário não identificado.");
        return;
      }

      setDeletingTrainingId(trainingId);
      const { success, message } = await DeleteTraining(userId, trainingId);

      if (!success) {
        toast.warning(message);
        return;
      }

      toast.success(message);

      const isLastItemOnPage = trainings.length === 1;
      const nextPage = isLastItemOnPage
        ? Math.max(1, pagination.page - 1)
        : pagination.page;
      await handlePageChange(nextPage);
    } catch (error) {
      console.error("Erro ao deletar treinamento:", error);
      toast.error("Não foi possível deletar o treinamento.");
    } finally {
      setDeletingTrainingId(null);
    }
  };

  return (
    <>
      <Form {...form}>
        <form
          className="flex items-center justify-between"
          onSubmit={form.handleSubmit((values) => fetchTrainings(values))}
        >
          <FormField
            control={form.control}
            name="search"
            render={({ field }) => (
              <FormItem className="flex items-center gap-4">
                <FormLabel>Buscar:</FormLabel>
                <FormControl>
                  <Input placeholder="buscar por título" {...field} />
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
              <TableHead className="w-[35%]">Título</TableHead>
              <TableHead className="w-[45%]">Subtítulo</TableHead>
              <TableHead className="w-[20%]">Ação</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading
              ? Array.from({ length: TABLE_ROWS }).map((_, index) => (
                  <TableRow key={index}>
                    <TableCell className="w-[35%]">
                      <Skeleton className="h-4 w-full max-w-[250px]" />
                    </TableCell>
                    <TableCell className="w-[45%]">
                      <Skeleton className="h-4 w-full max-w-[350px]" />
                    </TableCell>
                    <TableCell className="w-[20%]">
                      <div className="flex items-center justify-end gap-2">
                        <Skeleton className="size-8 rounded-md" />
                        <Skeleton className="size-8 rounded-md" />
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              : trainings.map((training) => (
                  <TableRow key={training._id}>
                    <TableCell className="w-[35%]">
                      <div
                        className="truncate text-sm"
                        title={training.title ?? ""}
                      >
                        {training.title ?? "-"}
                      </div>
                    </TableCell>
                    <TableCell className="w-[45%]">
                      <div
                        className="truncate text-sm"
                        title={training.subTitle ?? ""}
                      >
                        {training.subTitle ?? "-"}
                      </div>
                    </TableCell>
                    <TableCell className="w-[20%]">
                      <div className="flex justify-end gap-2">
                        <HoverCard openDelay={100} closeDelay={0}>
                          <HoverCardTrigger>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="size-8"
                            >
                              <Link href={buildTrainingHref(training)}>
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
                                    isLoading ||
                                    deletingTrainingId === training._id
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
                                Deletar treinamento?
                              </AlertDialogTitle>
                              <AlertDialogDescription>
                                Essa ação não pode ser desfeita. O treinamento
                                {training.title
                                  ? ` "${training.title}"`
                                  : ""}{" "}
                                será removido permanentemente.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancelar</AlertDialogCancel>
                              <AlertDialogAction
                                variant="destructive"
                                onClick={() =>
                                  handleDeleteTraining(training._id)
                                }
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
                {trainings.length === 0 && (
                  <TableRow>
                    <TableCell
                      colSpan={3}
                      className="text-muted-foreground h-16 text-center"
                    >
                      Nenhum treinamento encontrado.
                    </TableCell>
                  </TableRow>
                )}
                {Array.from({
                  length: Math.max(
                    0,
                    TABLE_ROWS -
                      trainings.length -
                      (trainings.length === 0 ? 1 : 0),
                  ),
                }).map((_, index) => (
                  <TableRow key={`empty-${index}`}>
                    <TableCell className="w-[35%]">&nbsp;</TableCell>
                    <TableCell className="w-[45%]">&nbsp;</TableCell>
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
