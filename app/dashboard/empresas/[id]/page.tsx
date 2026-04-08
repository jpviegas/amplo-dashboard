"use client";

import { GetCompanyById, UpdateCompany } from "@/api/dashboard/empresas/route";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useUser } from "@/context/UserContext";
import { cn } from "@/lib/utils";
import {
  registerCompanySchema,
  ufsBrasil,
  type CompanyType,
} from "@/zodSchemas";
import { zodResolver } from "@hookform/resolvers/zod";
import Cookies from "js-cookie";
import { ArrowLeft, MapPin } from "lucide-react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { FieldErrors, useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

export default function CompanyEditPage() {
  type FormValues = z.infer<typeof registerCompanySchema>;
  const { user } = useUser();
  const userId = user?._id || Cookies.get("user");
  const params = useParams<{ id: string }>();

  const rawCompanyId = params?.id;
  const companyId = useMemo(() => {
    const raw = String(rawCompanyId ?? "");
    const match = raw.match(/[a-f0-9]{24}$/i);
    return match?.[0] ?? rawCompanyId;
  }, [rawCompanyId]);
  const [isLoading, setIsLoading] = useState(false);
  const [company, setCompany] = useState<CompanyType>();
  const router = useRouter();

  const [isReturning, setIsReturning] = useState(false);
  const [activeTab, setActiveTab] = useState("general");
  const onlyDigits = (s: string) => s.replace(/\D+/g, "");
  const normalizeUf = (value: unknown) => {
    const uf = String(value ?? "")
      .trim()
      .toUpperCase();
    return ufsBrasil.includes(uf) ? uf : "";
  };
  const formatCep = (value: string) => {
    const v = onlyDigits(value).slice(0, 8);
    if (v.length <= 5) return v;
    return v.replace(/(\d{5})(\d+)/, "$1-$2");
  };
  const [isCepLoading, setIsCepLoading] = useState(false);
  const lastCepLookupRef = useRef<string | null>(null);
  const cepAbortRef = useRef<AbortController | null>(null);
  const formatCnpj = (value?: string | null) => {
    const digits = onlyDigits(String(value ?? "")).slice(0, 14);
    const parts = [
      digits.slice(0, 2),
      digits.slice(2, 5),
      digits.slice(5, 8),
      digits.slice(8, 12),
      digits.slice(12, 14),
    ].filter(Boolean);

    if (digits.length <= 2) return parts[0] ?? "";
    if (digits.length <= 5)
      return `${parts[0]}.${parts[1] ?? ""}`.replace(/\.$/, "");
    if (digits.length <= 8)
      return `${parts[0]}.${parts[1]}.${parts[2] ?? ""}`.replace(/\.$/, "");
    if (digits.length <= 12)
      return `${parts[0]}.${parts[1]}.${parts[2]}/${parts[3] ?? ""}`.replace(
        /\/$/,
        "",
      );
    return `${parts[0]}.${parts[1]}.${parts[2]}/${parts[3]}-${parts[4] ?? ""}`.replace(
      /-$/,
      "",
    );
  };

  const form = useForm<FormValues>({
    resolver: zodResolver(registerCompanySchema),
    defaultValues: {
      companyName: "",
      nickname: "",
      cnpj: "",
      cep: "",
      address: "",
      district: "",
      city: "",
      uf: "",
      // page: "",
      // registration: "",
      // responsibleCpf: "",
      // responsibleName: "",
      // responsibleRole: "",
      // companyEmail: "",
    },
  });

  const fetchCompany = useCallback(async () => {
    try {
      if (!userId) {
        return;
      }
      if (!companyId) {
        return;
      }

      setIsLoading(true);
      const { success, company } = await GetCompanyById(userId, companyId);

      if (!success) {
        toast.error("Não foi possível carregar a empresa.");
        return;
      }

      if (!company) {
        toast.error("Empresa não encontrada.");
        return;
      }

      setCompany(company);
      form.reset({
        companyName: company.companyName ?? "",
        nickname: company.nickname ?? "",
        cnpj: onlyDigits(company.cnpj ?? ""),
        cep: company.cep ?? "",
        address: company.address ?? "",
        district: company.district ?? "",
        city: company.city ?? "",
        uf: normalizeUf(company.uf),
        // page: company.page ?? "",
        // registration: company.registration ?? "",
        // responsibleCpf: company.responsibleCpf ?? "",
        // responsibleName: company.responsibleName ?? "",
        // responsibleRole: company.responsibleRole ?? "",
        // companyEmail: company.companyEmail ?? "",
      });
      lastCepLookupRef.current = onlyDigits(company.cep ?? "");
    } catch (error) {
      console.error("Erro ao carregar empresa:", error);
      toast.error("Não foi possível carregar a empresa.");
    } finally {
      setIsLoading(false);
    }
  }, [companyId, form, userId]);

  useEffect(() => {
    fetchCompany();
  }, [fetchCompany]);

  const cepValue = form.watch("cep");
  useEffect(() => {
    const cepDigits = onlyDigits(cepValue ?? "");
    if (cepDigits.length !== 8) return;
    if (lastCepLookupRef.current === cepDigits) return;

    lastCepLookupRef.current = cepDigits;
    cepAbortRef.current?.abort();
    const controller = new AbortController();
    cepAbortRef.current = controller;

    const run = async () => {
      try {
        setIsCepLoading(true);
        const res = await fetch(`https://viacep.com.br/ws/${cepDigits}/json/`, {
          signal: controller.signal,
        });

        if (!res.ok) {
          throw new Error("Erro ao buscar CEP");
        }

        const data: {
          erro?: boolean;
          logradouro?: string;
          bairro?: string;
          localidade?: string;
          uf?: string;
        } = await res.json();

        if (data.erro) {
          toast.error("CEP não encontrado.");
          return;
        }

        if (data.logradouro) {
          form.setValue("address", data.logradouro, {
            shouldDirty: true,
            shouldTouch: true,
            shouldValidate: true,
          });
        }
        if (data.bairro) {
          form.setValue("district", data.bairro, {
            shouldDirty: true,
            shouldTouch: true,
            shouldValidate: true,
          });
        }
        if (data.localidade) {
          form.setValue("city", data.localidade, {
            shouldDirty: true,
            shouldTouch: true,
            shouldValidate: true,
          });
        }
        if (data.uf) {
          form.setValue("uf", data.uf, {
            shouldDirty: true,
            shouldTouch: true,
            shouldValidate: true,
          });
        }
      } catch (error) {
        if ((error as { name?: string } | null)?.name === "AbortError") return;
        toast.error("Não foi possível buscar o CEP.");
      } finally {
        setIsCepLoading(false);
      }
    };

    run();

    return () => {
      controller.abort();
    };
  }, [cepValue, form]);

  async function onSubmit(values: FormValues) {
    try {
      if (!userId) {
        toast.error("Usuário não identificado.");
        return;
      }
      if (!companyId) {
        toast.error("Empresa inválida.");
        return;
      }

      setIsLoading(true);
      const { success, message } = await UpdateCompany(
        userId,
        companyId,
        values,
      );

      if (!success) {
        toast.warning(message);
        return;
      }

      toast.success(message);
      await fetchCompany();
      setIsReturning(true);
      setTimeout(() => {
        router.push("/dashboard/empresas");
      }, 1000);
    } catch (error) {
      console.error("Erro ao editar empresa:", error);
      toast.error("Erro ao editar a empresa.");
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
    <main className="container mx-auto h-full w-11/12 pt-8">
      <div className="mb-8 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" asChild>
            <Link href="/dashboard/empresas">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <h1 className="text-3xl font-bold">
            Editar Empresa {company?.companyName}
          </h1>
        </div>
      </div>

      <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-[1fr,300px]">
        <Card>
          <CardContent className="p-6">
            <Form {...form}>
              <form
                className="space-y-8"
                onSubmit={form.handleSubmit(onSubmit, onInvalid)}
              >
                <Tabs defaultValue="general" className="space-y-4">
                  <TabsList className="w-full justify-start border-b bg-transparent p-0">
                    <TabsTrigger
                      value="general"
                      className={cn(
                        "rounded-none border-b-2 border-transparent pb-2",
                        activeTab === "general" && "border-primary",
                      )}
                      onClick={() => setActiveTab("general")}
                    >
                      Informações Gerais
                    </TabsTrigger>
                    {/* <TabsTrigger
                      value="personal"
                      className={cn(
                        "rounded-none border-b-2 border-transparent pb-2",
                        activeTab === "personal" && "border-primary",
                      )}
                      onClick={() => setActiveTab("personal")}
                    >
                      Responsável Legal
                    </TabsTrigger> */}
                  </TabsList>

                  <TabsContent value="general" className="space-y-6">
                    <div className="grid gap-4 md:grid-cols-3">
                      <FormField
                        control={form.control}
                        name="companyName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Nome</FormLabel>
                            <FormControl>
                              <Input placeholder="Nome da empresa" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="nickname"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Fantasia</FormLabel>
                            <FormControl>
                              <Input placeholder="Nome fantasia" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="cnpj"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>CNPJ</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="00.000.000/0000-00"
                                inputMode="numeric"
                                maxLength={18}
                                value={formatCnpj(field.value)}
                                onChange={(e) => {
                                  field.onChange(
                                    onlyDigits(e.target.value).slice(0, 14),
                                  );
                                }}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="cep"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>CEP</FormLabel>
                            <FormControl>
                              <div className="relative">
                                <Input
                                  placeholder="CEP"
                                  maxLength={9}
                                  value={formatCep(field.value ?? "")}
                                  onChange={(e) =>
                                    field.onChange(
                                      onlyDigits(e.target.value).slice(0, 8),
                                    )
                                  }
                                  onBlur={field.onBlur}
                                  name={field.name}
                                  ref={field.ref}
                                  disabled={isCepLoading}
                                />
                                <MapPin className="absolute top-2.5 right-3 size-4 text-gray-400" />
                              </div>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="address"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Endereço</FormLabel>
                            <FormControl>
                              <Input placeholder="Endereço" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        name="addressNumber"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Número do endereço</FormLabel>
                            <FormControl>
                              <div className="relative">
                                <Input
                                  placeholder="Número do endereço"
                                  {...field}
                                />
                                <MapPin className="absolute top-2.5 right-3 size-4 text-gray-400" />
                              </div>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="district"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Bairro</FormLabel>
                            <FormControl>
                              <Input placeholder="Bairro" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="city"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Cidade</FormLabel>
                            <FormControl>
                              <Input placeholder="Cidade" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="uf"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>UF</FormLabel>
                            <FormControl>
                              <Select
                                onValueChange={field.onChange}
                                value={field.value ? field.value : undefined}
                              >
                                <SelectTrigger>
                                  <SelectValue placeholder="Selecione a UF" />
                                </SelectTrigger>
                                <SelectContent>
                                  {ufsBrasil.map((uf) => (
                                    <SelectItem key={uf} value={uf}>
                                      {uf}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      {/* <FormField
                        control={form.control}
                        name="page"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Número da folha</FormLabel>
                            <FormControl>
                              <Input placeholder="Número da folha" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      /> */}

                      {/* <FormField
                        control={form.control}
                        name="registration"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Inscrição estadual</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="Inscrição estadual"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      /> */}
                    </div>
                  </TabsContent>

                  {/* <TabsContent value="personal" className="space-y-6">
                    <div className="grid gap-4 md:grid-cols-3">
                      <FormField
                        control={form.control}
                        name="responsibleCpf"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>CPF do responsável</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="CPF do responsável"
                                maxLength={11}
                                min={0}
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="responsibleName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Nome do responsável</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="Nome do responsável"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="responsibleRole"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Cargo do responsável</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="Cargo do responsável"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="companyEmail"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Email da empresa</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="Email da empresa"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </TabsContent> */}
                </Tabs>

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
                    <Link href="/dashboard/empresas">Cancelar</Link>
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
