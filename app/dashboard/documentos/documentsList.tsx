"use client";

import { GetDocuments } from "@/api/dashboard/documentos/route";
import { GetAllUsers, GetAllUsersType } from "@/api/route";
import { TablePagination } from "@/components/layout/dashboard/TablePagination";
import { GoLinkExternal } from "react-icons/go";

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
// import { useUser } from "@/context/UserContext";
import { zodResolver } from "@hookform/resolvers/zod";
import debounce from "lodash/debounce";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
// import { useUser } from "@/context/UserContext";

const FormSchema = z.object({
  search: z.string().optional(),
});

type DocumentSigner = {
  token: string;
  status: string;
  name: string;
  email: string;
  phone_country: string;
  phone_number: string;
  signed_at: string | null;
};

export function DocumentsList() {
  const [documents, setDocuments] = useState<DocumentSigner[]>([]);
  const [users, setUsers] = useState<GetAllUsersType["users"]>([]);
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
  const [isUsersLoading, setIsUsersLoading] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  // const { user } = useUser();

  const resetPagination = useCallback(() => {
    setPagination({
      total: 0,
      page: 1,
      totalPages: 0,
      limit: 10,
      hasNextPage: false,
      hasPrevPage: false,
      nextPage: null,
      prevPage: null,
    });
  }, []);

  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      search: "",
    },
  });

  useEffect(() => {
    let isMounted = true;

    async function fetchUsers() {
      try {
        setIsUsersLoading(true);
        const data = await GetAllUsers();
        if (isMounted) {
          setUsers(data.users);
        }
      } catch (error) {
        console.error("Erro ao buscar usuários:", error);
      } finally {
        if (isMounted) {
          setIsUsersLoading(false);
        }
      }
    }

    fetchUsers();

    return () => {
      isMounted = false;
    };
  }, []);

  const fetchDocuments = useCallback(
    async ({ search }: z.infer<typeof FormSchema>, page = "1") => {
      try {
        setIsLoading(true);
        const raw = (search ?? "").trim();
        const resolvedEmail = raw.includes("@")
          ? raw
          : (() => {
              const normalized = raw.toLowerCase();
              const exactMatch = users.find(
                (u) => (u.name || "").toLowerCase() === normalized,
              );
              if (exactMatch) {
                return exactMatch.email;
              }

              const startsWithMatches = users.filter((u) =>
                (u.name || "").toLowerCase().startsWith(normalized),
              );
              if (startsWithMatches.length === 1) {
                return startsWithMatches[0].email;
              }

              const containsMatches = users.filter((u) =>
                (u.name || "").toLowerCase().includes(normalized),
              );
              if (containsMatches.length === 1) {
                return containsMatches[0].email;
              }

              return "";
            })();

        const {
          success,
          signers,
          pagination: paginationData,
        } = await GetDocuments(resolvedEmail || "", page);

        if (success) {
          setDocuments(signers);
          setPagination(paginationData);
          return;
        }

        setDocuments([]);
        resetPagination();
        toast.error("Não foi possível carregar os documentos.");
      } catch (error) {
        console.error("Erro ao buscar documentos:", error);
        toast.error("Não foi possível carregar os documentos.");
        setDocuments([]);
        resetPagination();
      } finally {
        setIsLoading(false);
      }
    },
    [resetPagination, users],
  );

  const debouncedFetchDocuments = useMemo(() => {
    return debounce((values: z.infer<typeof FormSchema>) => {
      fetchDocuments(values, "1");
    }, 500);
  }, [fetchDocuments]);

  useEffect(() => {
    const subscription = form.watch((values) => {
      debouncedFetchDocuments(values as z.infer<typeof FormSchema>);
    });

    return () => {
      subscription.unsubscribe();
      debouncedFetchDocuments.cancel();
    };
  }, [form, debouncedFetchDocuments]);

  useEffect(() => {
    // const currentValue = form.getValues("search");
    // if (!currentValue && user?.email) {
    //   form.setValue("search", user.email, { shouldDirty: false });
    fetchDocuments({ search: "" }, "1");
    // }
  }, [form, fetchDocuments]);

  const searchValue = form.watch("search") || "";
  const searchQuery = useMemo(() => {
    return searchValue.trim().toLowerCase();
  }, [searchValue]);

  const filteredUsers = useMemo(() => {
    if (!searchQuery) {
      return [];
    }

    return users
      .filter((u) => {
        const name = (u.name || "").toLowerCase();
        const email = (u.email || "").toLowerCase();
        return name.includes(searchQuery) || email.includes(searchQuery);
      })
      .slice(0, 10);
  }, [users, searchQuery]);

  const PAGE_SIZE = 10;
  const handlePageChange = async (newPage: number) => {
    await fetchDocuments(form.getValues(), newPage.toString());
  };

  return (
    <>
      <Form {...form}>
        <form
          className="flex items-center justify-between"
          onSubmit={form.handleSubmit((values) => fetchDocuments(values, "1"))}
        >
          <FormField
            control={form.control}
            name="search"
            render={({ field }) => (
              <FormItem className="flex items-center gap-4">
                <FormLabel>Email ou nome:</FormLabel>
                <FormControl>
                  <div className="relative">
                    <Input
                      placeholder="Digite um email ou nome"
                      {...field}
                      onChange={(event) => {
                        field.onChange(event);
                        setIsSearchOpen(true);
                      }}
                      onFocus={() => setIsSearchOpen(true)}
                      onBlur={() => {
                        window.setTimeout(() => {
                          setIsSearchOpen(false);
                        }, 150);
                      }}
                    />
                    {isSearchOpen && searchQuery && (
                      <div className="bg-popover text-popover-foreground absolute top-full z-50 mt-1 w-full overflow-hidden rounded-md border shadow-md">
                        {isUsersLoading ? (
                          <div className="text-muted-foreground p-2 text-sm">
                            Carregando...
                          </div>
                        ) : filteredUsers.length === 0 ? (
                          <div className="text-muted-foreground p-2 text-sm">
                            Nenhum resultado
                          </div>
                        ) : (
                          <div className="max-h-60 overflow-auto">
                            {filteredUsers.map((u) => (
                              <button
                                key={u._id}
                                type="button"
                                className="hover:bg-accent hover:text-accent-foreground w-full px-3 py-2 text-left text-sm"
                                onMouseDown={(e) => {
                                  e.preventDefault();
                                  form.setValue("search", u.email, {
                                    shouldDirty: true,
                                    shouldTouch: true,
                                    shouldValidate: true,
                                  });
                                  fetchDocuments({ search: u.email }, "1");
                                  setIsSearchOpen(false);
                                }}
                              >
                                <div className="">{u.name}</div>
                                <div className="text-muted-foreground text-xs">
                                  {u.email}
                                </div>
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
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
              <TableHead className="w-[35%] md:w-[30%]">Funcionário</TableHead>
              <TableHead className="w-[45%] md:w-[45%]">Documento</TableHead>
              <TableHead className="w-[20%] md:w-[10%]">Status</TableHead>
              <TableHead className="hidden w-[15%] md:table-cell">
                Assinado em
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array.from({ length: PAGE_SIZE }).map((_, index) => (
                <TableRow key={index}>
                  <TableCell className="w-[35%]">
                    <Skeleton className="h-4 w-full max-w-[250px]" />
                  </TableCell>
                  <TableCell className="w-[45%]">
                    <Skeleton className="h-4 w-full max-w-[150px]" />
                  </TableCell>
                  <TableCell className="w-[20%]">
                    <Skeleton className="h-4 w-full max-w-[150px]" />
                  </TableCell>
                  <TableCell className="hidden w-[15%] md:table-cell">
                    <Skeleton className="h-4 w-full max-w-[150px]" />
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <>
                {documents.length === 0 && (
                  <TableRow>
                    <TableCell
                      colSpan={4}
                      className="text-muted-foreground h-16 text-center"
                    >
                      Nenhum documento encontrado.
                    </TableCell>
                  </TableRow>
                )}

                {documents.map((document) => (
                  <TableRow key={document.token}>
                    <TableCell className="w-[35%]">
                      <div className="truncate text-sm" title={document.name}>
                        {document.name}
                      </div>
                    </TableCell>
                    <TableCell className="flex">
                      <Link
                        className="hover:text-amplo-secondary flex min-w-0 items-center gap-2 hover:underline"
                        href={`https://sandbox.app.zapsign.com.br/verificar/${document.token}`}
                        target="_blank"
                      >
                        <span
                          className="min-w-0 flex-1 truncate text-sm"
                          title={document.token}
                        >
                          {document.token}
                        </span>
                        <GoLinkExternal className="shrink-0" />
                      </Link>
                    </TableCell>
                    <TableCell className="w-[20%]">
                      <div
                        className="truncate text-xs md:text-sm"
                        title={document.status}
                      >
                        {document.status}
                      </div>
                    </TableCell>
                    <TableCell className="hidden w-[15%] md:table-cell">
                      <div
                        className="truncate text-xs md:text-sm"
                        title={document.signed_at ?? "-"}
                      >
                        {document.signed_at ?? "-"}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}

                {Array.from({
                  length: Math.max(
                    0,
                    PAGE_SIZE -
                      documents.length -
                      (documents.length === 0 ? 1 : 0),
                  ),
                }).map((_, index) => (
                  <TableRow key={`empty-${index}`}>
                    <TableCell className="w-[35%]">&nbsp;</TableCell>
                    <TableCell className="w-[45%]">&nbsp;</TableCell>
                    <TableCell className="w-[20%]">&nbsp;</TableCell>
                    <TableCell className="hidden w-[10%] md:table-cell">
                      &nbsp;
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
        itemsCount={documents.length}
        onPageChange={handlePageChange}
      />
    </>
  );
}
