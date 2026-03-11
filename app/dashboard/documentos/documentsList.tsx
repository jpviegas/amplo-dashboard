"use client";

import { GetDocumentsByEmail } from "@/api/dashboard/documentos/route";
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
import { useUser } from "@/context/UserContext";
import { zodResolver } from "@hookform/resolvers/zod";
import debounce from "lodash/debounce";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

const FormSchema = z.object({
  email: z.string().email("Email inválido").or(z.literal("")),
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
  const { user } = useUser();

  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      email: "",
    },
  });

  const buildPagination = useCallback((total: number, page: number) => {
    const limit = 10;
    const totalPages = Math.max(1, Math.ceil(total / limit));
    const safePage = Math.min(Math.max(1, page), totalPages);

    return {
      total,
      page: safePage,
      totalPages,
      limit,
      hasNextPage: safePage < totalPages,
      hasPrevPage: safePage > 1,
      nextPage: safePage < totalPages ? safePage + 1 : null,
      prevPage: safePage > 1 ? safePage - 1 : null,
    };
  }, []);

  const fetchDocuments = useCallback(
    async ({ email }: z.infer<typeof FormSchema>) => {
      if (!email) {
        setDocuments([]);
        setPagination(buildPagination(0, 1));
        return;
      }

      try {
        setIsLoading(true);
        const { success, signers } = await GetDocumentsByEmail(email);

        if (success) {
          setDocuments(signers);
          setPagination(buildPagination(signers.length, 1));
          return;
        }

        setDocuments([]);
        setPagination(buildPagination(0, 1));
        toast.error("Não foi possível carregar os documentos.");
      } catch (error) {
        console.error("Erro ao buscar documentos:", error);
        toast.error("Não foi possível carregar os documentos.");
        setDocuments([]);
        setPagination(buildPagination(0, 1));
      } finally {
        setIsLoading(false);
      }
    },
    [buildPagination],
  );

  const debouncedFetchDocuments = useMemo(() => {
    return debounce((values: z.infer<typeof FormSchema>) => {
      fetchDocuments(values);
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
    const currentEmail = form.getValues("email");
    if (!currentEmail && user?.email) {
      form.setValue("email", user.email, { shouldDirty: false });
      fetchDocuments({ email: user.email });
    }
  }, [user?.email, form, fetchDocuments]);

  const PAGE_SIZE = 10;
  const startIndex = (pagination.page - 1) * PAGE_SIZE;
  const visibleDocuments = documents.slice(startIndex, startIndex + PAGE_SIZE);

  const handlePageChange = (newPage: number) => {
    setPagination(buildPagination(documents.length, newPage));
  };

  return (
    <>
      <Form {...form}>
        <form
          className="flex items-center justify-between"
          onSubmit={form.handleSubmit(fetchDocuments)}
        >
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem className="flex items-center gap-4">
                <FormLabel>Email:</FormLabel>
                <FormControl>
                  <Input placeholder="email@exemplo.com" {...field} />
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
              <TableHead>Documento</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="hidden md:table-cell">
                Assinado em
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array.from({ length: PAGE_SIZE }).map((_, index) => (
                <TableRow key={index}>
                  <TableCell className="w-1/2">
                    <Skeleton className="h-4 w-full max-w-[250px]" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-full max-w-[150px]" />
                  </TableCell>
                  <TableCell className="hidden md:table-cell">
                    <Skeleton className="h-4 w-full max-w-[150px]" />
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <>
                {documents.length === 0 && (
                  <TableRow>
                    <TableCell
                      colSpan={3}
                      className="text-muted-foreground h-16 text-center"
                    >
                      Nenhum documento encontrado.
                    </TableCell>
                  </TableRow>
                )}

                {visibleDocuments.map((document) => (
                  <TableRow key={document.token}>
                    <TableCell className="">
                      <Link
                        className="hover:text-amplo-secondary flex items-center gap-2 hover:underline"
                        href={`https://sandbox.app.zapsign.com.br/verificar/${document.token}`}
                        target="_blank"
                      >
                        {document.token} <GoLinkExternal />
                      </Link>
                    </TableCell>
                    <TableCell>{document.status}</TableCell>
                    <TableCell className="hidden md:table-cell">
                      {document.signed_at ?? "-"}
                    </TableCell>
                  </TableRow>
                ))}

                {Array.from({
                  length: Math.max(
                    0,
                    PAGE_SIZE -
                      visibleDocuments.length -
                      (documents.length === 0 ? 1 : 0),
                  ),
                }).map((_, index) => (
                  <TableRow key={`empty-${index}`}>
                    <TableCell className="w-1/2">&nbsp;</TableCell>
                    <TableCell>&nbsp;</TableCell>
                    <TableCell className="hidden md:table-cell">
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
        itemsCount={pagination.total}
        onPageChange={handlePageChange}
      />
    </>
  );
}
