"use client";

import { CreateCompany } from "@/api/dashboard/empresas/route";
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
import Cookies from "js-cookie";

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
import { registerCompanySchema, ufsBrasil } from "@/zodSchemas";
import { zodResolver } from "@hookform/resolvers/zod";
import { MapPin } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

export default function RegisterCompanyPage() {
  const [activeTab, setActiveTab] = useState("general");
  const { user } = useUser();
  const userId = user?._id || Cookies.get("user");
  const onlyDigits = (s: string) => s.replace(/\D+/g, "");
  const router = useRouter();

  const formatCep = (value: string) => {
    const v = onlyDigits(value).slice(0, 8);
    if (v.length <= 5) return v;
    return v.replace(/(\d{5})(\d+)/, "$1-$2");
  };
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
  const [isCepLoading, setIsCepLoading] = useState(false);
  const lastCepLookupRef = useRef<string | null>(null);
  const cepAbortRef = useRef<AbortController | null>(null);

  type FormValues = z.infer<typeof registerCompanySchema>;

  const form = useForm<FormValues>({
    resolver: zodResolver(registerCompanySchema),
    defaultValues: {
      companyName: "",
      nickname: "",
      cnpj: "",
      cep: "",
      address: "",
      addressNumber: "",
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

  async function onSubmit(userId: string, values: FormValues) {
    try {
      const { message, success } = await CreateCompany(userId, values);
      if (!success) {
        toast.error(message);
      } else {
        toast.success(message);
        setTimeout(() => {
          router.push("/dashboard/empresas");
        }, 1000);
      }
    } catch (message) {
      toast.error(`${message}`);
    }
  }

  return (
    <Form {...form}>
      <form
        className="space-y-8"
        onSubmit={form.handleSubmit((values) => {
          if (!userId) {
            toast.error("Usuário não identificado");
            return;
          }
          onSubmit(userId, values);
        })}
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
            {/* <TabsTrigger
                      value="icon"
                      className={cn(
                        "rounded-none border-b-2 border-transparent pb-2",
                        activeTab === "icon" && "border-primary",
                      )}
                      onClick={() => setActiveTab("icon")}
                    >
                      Ícone
                    </TabsTrigger> */}
          </TabsList>

          <TabsContent value="general" className="space-y-6">
            <div className="grid gap-4 md:grid-cols-3">
              <FormField
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
              {/* <FormField
                        name="cnpj"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>CNPJ</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="CNPJ"
                                maxLength={14}
                                min={0}
                                {...field}
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      /> */}
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
                      <Input placeholder="Número do endereço" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
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
                        name="page"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Número da folha</FormLabel>
                            <FormControl>
                              <Input placeholder="Número da folha" {...field} />
                            </FormControl>
                          </FormItem>
                        )}
                      /> */}

              {/* <FormField
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
                          </FormItem>
                        )}
                      /> */}
            </div>
          </TabsContent>

          {/* <TabsContent value="personal" className="space-y-6">
                    <FormField
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
                        </FormItem>
                      )}
                    />
                    <FormField
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
                        </FormItem>
                      )}
                    />
                    <FormField
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
                        </FormItem>
                      )}
                    />
                    <FormField
                      name="companyEmail"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email da empresa</FormLabel>
                          <FormControl>
                            <Input placeholder="Email da empresa" {...field} />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                  </TabsContent> */}

          {/* <TabsContent value="icon" className="space-y-6">
                    <Card>
                      <CardContent className="flex flex-col items-center gap-4 p-6">
                        <div className="relative h-64 w-64">
                          <div className="bg-muted flex h-full w-full items-center justify-center rounded-full">
                            <User className="text-muted-foreground h-32 w-32" />
                          </div>
                        </div>
                        <div className="flex w-full gap-2">
                          <Button className="flex-1 gap-2">
                            <Upload className="size-4" />
                            Upload
                          </Button>
                          <Button variant="outline" className="flex-1">
                            Remover
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent> */}
        </Tabs>
        <div className="flex gap-4">
          <Button type="submit">Salvar</Button>
          <Button variant="outline" type="reset">
            <Link href={"./"}>Cancelar</Link>
          </Button>
        </div>
      </form>
    </Form>
  );
}
