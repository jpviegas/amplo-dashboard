"use client";

import { GetCityById, UpdateCity } from "@/api/dashboard/cities/route";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
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
import { CityTypeWithId, citySchema } from "@/zodSchemas";
import { zodResolver } from "@hookform/resolvers/zod";
import Cookies from "js-cookie";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { FieldErrors, FieldPath, useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

export default function CityEditPage() {
  const cityFormSchema = citySchema;
  type FormValues = z.infer<typeof cityFormSchema>;
  const { user } = useUser();
  const userId = user?._id || Cookies.get("user");
  const params = useParams<{ id: string }>();
  const cityId = params?.id;
  const [isLoading, setIsLoading] = useState(false);
  const [city, setCity] = useState<CityTypeWithId>();
  const router = useRouter();
  const [isReturning, setIsReturning] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(cityFormSchema),
    defaultValues: {
      city: "",
      meal: undefined,
      transport: undefined,
    },
  });

  const extractMessages = (value: unknown): string[] => {
    if (!value) return [];
    if (Array.isArray(value)) return value.flatMap(extractMessages);
    if (typeof value === "object") {
      const rec = value as Record<string, unknown>;
      const message = rec.message;
      if (typeof message === "string" && message) return [message];

      const issues = rec.issues;
      if (Array.isArray(issues)) {
        const fromIssues = issues.flatMap((issue) => {
          if (!issue || typeof issue !== "object") return [];
          const issueMessage = (issue as Record<string, unknown>).message;
          return typeof issueMessage === "string" && issueMessage
            ? [issueMessage]
            : [];
        });
        if (fromIssues.length > 0) return fromIssues;
      }

      const error = rec.error;
      if (error) return extractMessages(error);

      return Object.values(rec).flatMap(extractMessages);
    }
    if (typeof value === "string" && value) return [value];
    return [];
  };

  const extractFieldErrors = (
    value: unknown,
  ): Array<{ path: string; message: string }> => {
    const results: Array<{ path: string; message: string }> = [];
    const visit = (v: unknown) => {
      if (!v) return;
      if (Array.isArray(v)) {
        for (const item of v) visit(item);
        return;
      }
      if (typeof v !== "object") return;

      const rec = v as Record<string, unknown>;
      const issues = rec.issues;
      if (Array.isArray(issues)) {
        for (const issue of issues) {
          if (!issue || typeof issue !== "object") continue;
          const i = issue as Record<string, unknown>;
          const rawPath = i.path;
          const rawMessage = i.message;
          const path = Array.isArray(rawPath)
            ? rawPath
                .filter((p) => typeof p === "string" || typeof p === "number")
                .map((p) => String(p))
                .join(".")
            : "";
          const message =
            typeof rawMessage === "string" && rawMessage ? rawMessage : "";
          if (path && message) results.push({ path, message });
        }
      }

      for (const next of Object.values(rec)) visit(next);
    };
    visit(value);
    return results;
  };

  const fetchCity = useCallback(async () => {
    try {
      if (!userId) {
        return;
      }
      if (!cityId) {
        return;
      }

      setIsLoading(true);
      const { success, city } = await GetCityById(userId, cityId);

      if (!success) {
        toast.error("Não foi possível carregar a cidade.");
        return;
      }

      if (!city) {
        toast.error("Cidade não encontrada.");
        return;
      }

      setCity(city as CityTypeWithId);
      form.reset({
        city: (city as CityTypeWithId).city ?? "",
        meal:
          typeof (city as CityTypeWithId).meal === "number"
            ? (city as CityTypeWithId).meal
            : undefined,
        transport:
          typeof (city as CityTypeWithId).transport === "number"
            ? (city as CityTypeWithId).transport
            : undefined,
      });
    } catch (error) {
      console.error("Erro ao carregar cidade:", error);
      toast.error("Não foi possível carregar a cidade.");
    } finally {
      setIsLoading(false);
    }
  }, [cityId, form, userId]);

  useEffect(() => {
    fetchCity();
  }, [fetchCity]);

  async function onSubmit(values: FormValues) {
    try {
      if (!userId) {
        toast.error("Usuário não identificado.");
        return;
      }
      if (!cityId) {
        toast.error("Cidade inválida.");
        return;
      }

      setIsLoading(true);
      const { success, message } = await UpdateCity(userId, cityId, values);

      if (!success) {
        const fieldErrors = extractFieldErrors(message);
        for (const { path, message: msg } of fieldErrors) {
          form.setError(path as FieldPath<FormValues>, {
            type: "server",
            message: msg,
          });
        }
        toast.warning(
          typeof message === "string" ? message : "Não foi possível salvar.",
        );
        return;
      }

      toast.success(
        typeof message === "string"
          ? message
          : "Cidade atualizada com sucesso.",
      );
      await fetchCity();
      setTimeout(() => {
        router.push("/dashboard/cidades");
      }, 1000);
      setIsReturning(true);
    } catch (error) {
      const fieldErrors = extractFieldErrors(error);
      for (const { path, message } of fieldErrors) {
        form.setError(path as FieldPath<FormValues>, {
          type: "server",
          message,
        });
      }
      const messages = Array.from(new Set(extractMessages(error))).filter(
        (m) => m.trim().length > 0,
      );
      toast.error(messages[0] ?? "Erro ao editar a cidade.");
    } finally {
      setIsLoading(false);
    }
  }

  function onInvalid(errors: FieldErrors<FormValues>) {
    const messages = Array.from(new Set(extractMessages(errors))).filter(
      (m) => m.trim().length > 0,
    );
    if (messages.length > 0) toast.error(messages[0]);
  }

  return (
    <main className="container mx-auto h-full w-11/12 pt-8">
      <div className="mb-8 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" asChild>
            <Link href="/dashboard/cidades">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <h1 className="text-3xl font-bold">
            Editar Cidade {city?.city ?? ""}
          </h1>
        </div>
      </div>

      <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-[1fr,300px]">
        <Card>
          <CardContent className="p-6">
            <Form {...form}>
              <form
                className="space-y-8"
                onSubmit={async (e) => {
                  e.preventDefault();
                  try {
                    form.clearErrors();
                    await form.handleSubmit(async (values) => {
                      await onSubmit(values);
                    }, onInvalid)(e);
                  } catch (error) {
                    const fieldErrors = extractFieldErrors(error);
                    for (const { path, message } of fieldErrors) {
                      form.setError(path as FieldPath<FormValues>, {
                        type: "server",
                        message,
                      });
                    }

                    const messages = Array.from(
                      new Set(extractMessages(error)),
                    ).filter((m) => m.trim().length > 0);
                    toast.error(messages[0] ?? "Formulário inválido.");
                  }
                }}
              >
                <div className="grid gap-4 md:grid-cols-3">
                  <FormField
                    control={form.control}
                    name="city"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Cidade</FormLabel>
                        <FormControl>
                          <Input placeholder="Nome da cidade" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="meal"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Vale-Refeição</FormLabel>
                        <FormControl>
                          <Input
                            inputMode="decimal"
                            placeholder="0"
                            value={field.value ?? ""}
                            onChange={(e) => {
                              const raw = e.target.value;
                              if (!raw.trim()) {
                                field.onChange(undefined);
                                return;
                              }
                              const n = Number(raw);
                              field.onChange(Number.isNaN(n) ? undefined : n);
                            }}
                            onBlur={field.onBlur}
                            name={field.name}
                            ref={field.ref}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="transport"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Vale-Transporte</FormLabel>
                        <FormControl>
                          <Input
                            inputMode="decimal"
                            placeholder="0"
                            value={field.value ?? ""}
                            onChange={(e) => {
                              const raw = e.target.value;
                              if (!raw.trim()) {
                                field.onChange(undefined);
                                return;
                              }
                              const n = Number(raw);
                              field.onChange(Number.isNaN(n) ? undefined : n);
                            }}
                            onBlur={field.onBlur}
                            name={field.name}
                            ref={field.ref}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="flex gap-4">
                  <Button
                    type="submit"
                    className="cursor-pointer"
                    disabled={isLoading || isReturning}
                  >
                    {isReturning
                      ? "Voltando..."
                      : isLoading
                        ? "Enviando..."
                        : "Salvar"}
                  </Button>
                  <Button
                    asChild
                    variant="outline"
                    type="reset"
                    disabled={isLoading || isReturning}
                  >
                    <Link href="/dashboard/cidades">Cancelar</Link>
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
