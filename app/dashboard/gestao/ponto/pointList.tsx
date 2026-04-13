"use client";

import { GetAllEmployees } from "@/api/dashboard/funcionarios/route";
import { UpdatePoint } from "@/api/dashboard/gestao/route";
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
import { EmployeeTypeWithId } from "@/zodSchemas";
import { zodResolver } from "@hookform/resolvers/zod";
import Cookies from "js-cookie";
import debounce from "lodash/debounce";
import { useCallback, useEffect, useMemo, useState } from "react";
import { FieldErrors, useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

const EditPointSchema = z.object({
  employeeId: z.string().min(1, "Selecione um funcionário"),
  location: z.string().min(1, "Informe o local"),
  dateTimeLocal: z
    .string()
    .min(1, "Selecione o horário")
    .regex(
      /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/,
      "Horário inválido. Use o seletor.",
    ),
});

export function PointEditForm() {
  const { user } = useUser();
  const userId = user?._id || Cookies.get("user");

  const [employeeQuery, setEmployeeQuery] = useState("");
  const [isEmployeeOpen, setIsEmployeeOpen] = useState(false);
  const [isEmployeeLoading, setIsEmployeeLoading] = useState(false);
  const [employees, setEmployees] = useState<
    (EmployeeTypeWithId & { companyName?: string })[]
  >([]);

  const [isLoading, setIsLoading] = useState(false);

  type FormValues = z.infer<typeof EditPointSchema>;

  const form = useForm<FormValues>({
    resolver: zodResolver(EditPointSchema),
    defaultValues: {
      employeeId: "",
      location: "",
      dateTimeLocal: "",
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

  const debouncedFetchEmployees = useMemo(() => {
    return debounce((query: string) => {
      fetchEmployees(query);
    }, 350);
  }, [fetchEmployees]);

  useEffect(() => {
    return () => {
      debouncedFetchEmployees.cancel();
    };
  }, [debouncedFetchEmployees]);

  useEffect(() => {
    const q = employeeQuery.trim();
    if (!isEmployeeOpen || q.length === 0) {
      setEmployees([]);
      return;
    }
    debouncedFetchEmployees(q);
  }, [employeeQuery, isEmployeeOpen, debouncedFetchEmployees]);

  const toApiDateTime = (value: string) => {
    const raw = String(value ?? "").trim();
    if (!raw) return "";
    const [date, time] = raw.split("T");
    if (!date || !time) return "";
    return `${date} ${time}:00`;
  };

  async function onSubmit(values: FormValues) {
    console.log(values);

    try {
      if (!userId) {
        toast.error("Usuário não identificado.");
        return;
      }

      setIsLoading(true);
      const timestamp = toApiDateTime(values.dateTimeLocal);
      if (!timestamp) {
        toast.error("Horário inválido.");
        return;
      }

      const { success, message } = await UpdatePoint(userId, {
        userId: values.employeeId,
        location: { latitude: -22.8305, longitude: -43.2192 },
        type: "rh",
        timestamp,
      });

      if (!success) {
        toast.warning(message);
        return;
      }

      toast.success(message);
      form.reset({ employeeId: "", location: "", dateTimeLocal: "" });
      setEmployeeQuery("");
    } catch (error) {
      console.error("Erro ao registrar ponto:", error);
      toast.error("Não foi possível registrar o ponto.");
    } finally {
      setIsLoading(false);
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
      <div className="mx-auto w-full max-w-3xl rounded-md border p-6">
        <Form {...form}>
          <form
            className="space-y-6"
            onSubmit={form.handleSubmit(onSubmit, onInvalid)}
          >
            <div className="grid gap-6 md:grid-cols-2">
              <FormField
                control={form.control}
                name="employeeId"
                render={({ field }) => (
                  <FormItem className="md:col-span-2">
                    <FormLabel>Funcionário</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input
                          placeholder="Digite o nome do funcionário"
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
                                      {u.companyName
                                        ? ` • ${u.companyName}`
                                        : ""}
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
                name="dateTimeLocal"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Horário</FormLabel>
                    <FormControl>
                      <Input type="datetime-local" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* <FormField
                control={form.control}
                name="location"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Local</FormLabel>
                    <FormControl>
                      <Input placeholder="Ex: RH" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              /> */}
            </div>

            <div className="flex gap-4">
              <Button type="submit" disabled={isLoading}>
                {isLoading ? "Enviando..." : "Salvar"}
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </>
  );
}
