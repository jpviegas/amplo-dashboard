"use client";

import { CreateCompany } from "@/api/dashboard/empresas/route";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
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
import { cn } from "@/lib/utils";
import { registerCompanySchema, ufsBrasil } from "@/zodSchemas";
import { zodResolver } from "@hookform/resolvers/zod";
import { Upload, User } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

export default function RegisterCompanyPage() {
  const [activeTab, setActiveTab] = useState("general");

  type FormValues = z.infer<typeof registerCompanySchema>;

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
      page: "",
      registration: "",
      responsibleCpf: "",
      responsibleName: "",
      responsibleRole: "",
      companyEmail: "",
    },
  });

  async function onSubmit(values: FormValues) {
    try {
      const { message, success } = await CreateCompany(values);
      if (!success) {
        toast.error(`${message}`);
      } else {
        toast.success(`${message}`);
      }
    } catch (message) {
      toast.error(`${message}`);
    }
  }

  return (
    <main className="container mx-auto h-full">
      <div className="flex items-center justify-between">
        <h1 className="mt-8 text-3xl font-bold">Nova Empresa</h1>
      </div>
      <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-[1fr,300px]">
        <Card>
          <CardContent className="p-6">
            <Form {...form}>
              <form
                className="space-y-8"
                onSubmit={form.handleSubmit(onSubmit)}
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
                    <TabsTrigger
                      value="personal"
                      className={cn(
                        "rounded-none border-b-2 border-transparent pb-2",
                        activeTab === "personal" && "border-primary",
                      )}
                      onClick={() => setActiveTab("personal")}
                    >
                      Responsável Legal
                    </TabsTrigger>
                    <TabsTrigger
                      value="icon"
                      className={cn(
                        "rounded-none border-b-2 border-transparent pb-2",
                        activeTab === "icon" && "border-primary",
                      )}
                      onClick={() => setActiveTab("icon")}
                    >
                      Ícone
                    </TabsTrigger>
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
                          </FormItem>
                        )}
                      />
                      <FormField
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
                      />
                      <FormField
                        name="cep"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>CEP</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="CEP"
                                maxLength={7}
                                min={0}
                                {...field}
                              />
                            </FormControl>
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
                                defaultValue={field.value}
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
                          </FormItem>
                        )}
                      />

                      <FormField
                        name="page"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Número da folha</FormLabel>
                            <FormControl>
                              <Input placeholder="Número da folha" {...field} />
                            </FormControl>
                          </FormItem>
                        )}
                      />

                      <FormField
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
                      />
                    </div>
                  </TabsContent>

                  <TabsContent value="personal" className="space-y-6">
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
                  </TabsContent>

                  <TabsContent value="icon" className="space-y-6">
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
                  </TabsContent>
                </Tabs>
                <div className="flex gap-4">
                  <Button type="submit">Salvar</Button>
                  <Button variant="outline" type="reset">
                    <Link href={"./"}>Cancelar</Link>
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
