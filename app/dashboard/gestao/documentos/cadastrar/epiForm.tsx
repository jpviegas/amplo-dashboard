"use client";

import { GetAllEPIs } from "@/api/dashboard/epi/route";
import { GetAllEmployees } from "@/api/dashboard/funcionarios/route";
import { CreateManagement } from "@/api/dashboard/gestao/route";
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
import { useUser } from "@/context/UserContext";
import { EPITypeWithId, EmployeeTypeWithId } from "@/zodSchemas";
import { zodResolver } from "@hookform/resolvers/zod";
import Cookies from "js-cookie";
import debounce from "lodash/debounce";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import { FieldErrors, useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

const AssignSchema = z.object({
  employeeId: z.string().min(1, "Selecione um funcionário"),
  epiId: z.string().min(1, "Selecione um E.P.I."),
  quantity: z.coerce.number().int().min(1, "Informe a quantidade"),
  size: z.string().optional(),
  comment: z.string().optional(),
});

export function NewManagementEPI() {
  type FormValues = z.infer<typeof AssignSchema>;

  const { user } = useUser();
  const userId = user?._id || Cookies.get("user");

  const [employeeQuery, setEmployeeQuery] = useState("");
  const [isEmployeeOpen, setIsEmployeeOpen] = useState(false);
  const [isEmployeeLoading, setIsEmployeeLoading] = useState(false);
  const [employees, setEmployees] = useState<
    (EmployeeTypeWithId & { companyName?: string })[]
  >([]);

  const [epiQuery, setEPIQuery] = useState("");
  const [isEPIOpen, setIsEPIOpen] = useState(false);
  const [isEPILoading, setIsEPILoading] = useState(false);
  const [epis, setEPIs] = useState<EPITypeWithId[]>([]);
  const [isReturning, setIsReturning] = useState(false);
  const router = useRouter();

  const form = useForm<FormValues>({
    resolver: zodResolver(AssignSchema),
    defaultValues: {
      employeeId: "",
      epiId: "",
      quantity: 1,
      size: "",
      comment: "",
    },
  });

  const fetchEmployees = useCallback(
    async (query: string) => {
      try {
        setIsEmployeeLoading(true);
        if (!userId) {
          setEmployees([]);
          return;
        }

        const { success, users } = await GetAllEmployees(
          userId,
          query,
          "active",
          "1",
        );
        if (!success) {
          setEmployees([]);
          return;
        }
        setEmployees(users ?? []);
      } catch (error) {
        console.error("Erro ao buscar funcionários:", error);
        setEmployees([]);
      } finally {
        setIsEmployeeLoading(false);
      }
    },
    [userId],
  );

  const fetchEPIs = useCallback(
    async (query: string) => {
      try {
        setIsEPILoading(true);
        if (!userId) {
          setEPIs([]);
          return;
        }

        const { success, epis } = await GetAllEPIs(userId, query, "1");
        if (!success) {
          setEPIs([]);
          return;
        }

        setEPIs(epis ?? []);
      } catch (error) {
        console.error("Erro ao buscar E.P.I.:", error);
        setEPIs([]);
      } finally {
        setIsEPILoading(false);
      }
    },
    [userId],
  );

  const debouncedFetchEmployees = useMemo(() => {
    return debounce((query: string) => {
      fetchEmployees(query);
    }, 350);
  }, [fetchEmployees]);

  const debouncedFetchEPIs = useMemo(() => {
    return debounce((query: string) => {
      fetchEPIs(query);
    }, 350);
  }, [fetchEPIs]);

  useEffect(() => {
    return () => {
      debouncedFetchEmployees.cancel();
      debouncedFetchEPIs.cancel();
    };
  }, [debouncedFetchEmployees, debouncedFetchEPIs]);

  useEffect(() => {
    const q = employeeQuery.trim();
    if (!isEmployeeOpen || q.length === 0) {
      setEmployees([]);
      return;
    }
    debouncedFetchEmployees(q);
  }, [employeeQuery, isEmployeeOpen, debouncedFetchEmployees]);

  useEffect(() => {
    const q = epiQuery.trim();
    if (!isEPIOpen || q.length === 0) {
      setEPIs([]);
      return;
    }
    debouncedFetchEPIs(q);
  }, [epiQuery, isEPIOpen, debouncedFetchEPIs]);

  async function onSubmit(values: FormValues) {
    try {
      if (!userId) {
        toast.error("Usuário não identificado.");
        return;
      }

      const { success, message } = await CreateManagement(userId, {
        employeeId: values.employeeId,
        epiId: values.epiId,
        quantity: values.quantity,
        size: values.size ? values.size : undefined,
        comment: values.comment ? values.comment : undefined,
      });

      if (!success) {
        toast.warning(message);
        return;
      }

      toast.success(message);
      setIsReturning(true);
      setTimeout(() => {
        router.push("/dashboard/gestao/epi");
      }, 1000);
    } catch (error) {
      console.error("Erro ao vincular E.P.I. ao funcionário:", error);
      toast.error("Não foi possível vincular o E.P.I.");
    }
  }

  function onInvalid(errors: FieldErrors<FormValues>) {
    const messages = Object.values(errors)
      .map((error) => error?.message)
      .filter((message): message is string => Boolean(message));

    const uniqueMessages = Array.from(new Set(messages));
    for (const message of uniqueMessages) {
      toast.error(message);
    }
  }

  return (
    <>
      <Form {...form}>
        <form
          className="space-y-6"
          onSubmit={form.handleSubmit(onSubmit, onInvalid)}
        >
          <div className="grid gap-6 lg:grid-cols-2">
            <FormField
              control={form.control}
              name="employeeId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Funcionário</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Input
                        placeholder="Digite nome ou email do funcionário"
                        value={employeeQuery}
                        onChange={(event) => {
                          const next = event.target.value;
                          setEmployeeQuery(next);
                          setIsEmployeeOpen(true);
                          field.onChange("");
                        }}
                        onFocus={() => setIsEmployeeOpen(true)}
                        onBlur={() => {
                          window.setTimeout(() => {
                            setIsEmployeeOpen(false);
                          }, 150);
                        }}
                      />
                      {isEmployeeOpen && employeeQuery.trim() && (
                        <div className="bg-popover text-popover-foreground absolute top-full z-50 mt-1 w-full overflow-hidden rounded-md border shadow-md">
                          {isEmployeeLoading ? (
                            <div className="text-muted-foreground p-2 text-sm">
                              Carregando...
                            </div>
                          ) : employees.length === 0 ? (
                            <div className="text-muted-foreground p-2 text-sm">
                              Nenhum resultado
                            </div>
                          ) : (
                            <div className="max-h-60 overflow-auto">
                              {employees.slice(0, 10).map((u) => (
                                <button
                                  key={u._id}
                                  type="button"
                                  className="hover:bg-accent hover:text-accent-foreground w-full px-3 py-2 text-left text-sm"
                                  onMouseDown={(e) => {
                                    e.preventDefault();
                                    setEmployeeQuery(u.name ?? u.email ?? "");
                                    field.onChange(u._id);
                                    setIsEmployeeOpen(false);
                                  }}
                                >
                                  <div className="truncate">
                                    {u.name ?? "-"}
                                  </div>
                                  <div className="text-muted-foreground truncate text-xs">
                                    {u.email ?? "-"}
                                    {u.companyName ? ` • ${u.companyName}` : ""}
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

            <FormField
              control={form.control}
              name="epiId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>E.P.I.</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Input
                        placeholder="Digite o nome do E.P.I."
                        value={epiQuery}
                        onChange={(event) => {
                          const next = event.target.value;
                          setEPIQuery(next);
                          setIsEPIOpen(true);
                          field.onChange("");
                        }}
                        onFocus={() => setIsEPIOpen(true)}
                        onBlur={() => {
                          window.setTimeout(() => {
                            setIsEPIOpen(false);
                          }, 150);
                        }}
                      />
                      {isEPIOpen && epiQuery.trim() && (
                        <div className="bg-popover text-popover-foreground absolute top-full z-50 mt-1 w-full overflow-hidden rounded-md border shadow-md">
                          {isEPILoading ? (
                            <div className="text-muted-foreground p-2 text-sm">
                              Carregando...
                            </div>
                          ) : epis.length === 0 ? (
                            <div className="text-muted-foreground p-2 text-sm">
                              Nenhum resultado
                            </div>
                          ) : (
                            <div className="max-h-60 overflow-auto">
                              {epis.slice(0, 10).map((epi) => (
                                <button
                                  key={epi._id}
                                  type="button"
                                  className="hover:bg-accent hover:text-accent-foreground w-full px-3 py-2 text-left text-sm"
                                  onMouseDown={(e) => {
                                    e.preventDefault();
                                    setEPIQuery(epi.name ?? "");
                                    field.onChange(epi._id);
                                    setIsEPIOpen(false);
                                  }}
                                >
                                  <div className="truncate">
                                    {epi.name ?? "-"}
                                  </div>
                                  <div className="text-muted-foreground truncate text-xs">
                                    {epi.ca ? `C.A. ${epi.ca}` : "-"}
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
          </div>

          <div className="grid gap-6 lg:grid-cols-3">
            <FormField
              control={form.control}
              name="quantity"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Quantidade</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min={1}
                      placeholder="1"
                      value={String(field.value ?? "")}
                      onChange={(event) => field.onChange(event.target.value)}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="size"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tamanho</FormLabel>
                  <FormControl>
                    <Input placeholder="Ex: P, M, G, 42" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="comment"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Comentário</FormLabel>
                  <FormControl>
                    <Input placeholder="Observações" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="flex gap-4">
            <Button
              type="submit"
              disabled={form.formState.isSubmitting || isReturning}
            >
              {isReturning
                ? "Voltando..."
                : form.formState.isSubmitting
                  ? "Enviando..."
                  : "Salvar"}
            </Button>
            <Button
              asChild
              variant="outline"
              type="reset"
              disabled={form.formState.isSubmitting || isReturning}
            >
              <Link href="./">Cancelar</Link>
            </Button>
          </div>
        </form>
      </Form>
    </>
  );
}
