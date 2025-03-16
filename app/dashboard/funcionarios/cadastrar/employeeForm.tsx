"use client";

import { CreateEmployee } from "@/api/dashboard/funcionarios/route";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { registerEmployeeSchema, ufsBrasil } from "@/zodSchemas";
import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import { CalendarIcon, MapPin, Phone, Plus, Search, User } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

export default function NewEmployeeForm() {
  const [activeTab, setActiveTab] = useState("general");
  type FormValues = z.infer<typeof registerEmployeeSchema>;

  const form = useForm<FormValues>({
    resolver: zodResolver(registerEmployeeSchema),
    defaultValues: {
      name: "",
      pis: "",
      cpf: "",
      registration: "",
      admissionDate: new Date(),
      company: "",
      workingHours: "",
      status: "active",
      department: "",
      costCenter: "",
      position: "",
      sheetNumber: "",
      ctps: "",
      directSuperior: "",
      rg: "",
      birthDate: new Date(),
      socialName: "",
      cnh: "",
      cnhCategory: "",
      cnhExpiration: new Date(),
      cep: "",
      address: "",
      neighborhood: "",
      city: "",
      state: "",
      phone: "",
      extension: "",
      fatherName: "",
      motherName: "",
      gender: "",
      nationality: "",
      placeOfBirth: "",
      civilStatus: "",
    },
  });

  async function onSubmit(values: FormValues) {
    try {
      const { message, success } = await CreateEmployee(values);

      if (!success) {
        toast.error(message);
      } else {
        toast.success(message);
      }
    } catch {
      toast.error("Erro ao cadastrar o funcionário.");
    }
  }

  return (
    <Form {...form}>
      <form className="space-y-8" onSubmit={form.handleSubmit(onSubmit)}>
        <div className="grid gap-4 md:grid-cols-3">
          <FormField
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nome</FormLabel>
                <FormControl>
                  <Input placeholder="Nome" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            name="pis"
            render={({ field }) => (
              <FormItem>
                <FormLabel>PIS</FormLabel>
                <FormControl>
                  <Input placeholder="PIS" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            name="cpf"
            render={({ field }) => (
              <FormItem>
                <FormLabel>CPF</FormLabel>
                <FormControl>
                  <Input placeholder="CPF" maxLength={11} min={0} {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            name="registration"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Matrícula</FormLabel>
                <FormControl>
                  <Input placeholder="Matrícula" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            name="admissionDate"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Data da admissão</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full pl-3 text-left font-normal",
                          !field.value && "text-muted-foreground",
                        )}
                      >
                        {field.value ? (
                          format(field.value, "dd/MM/yyyy")
                        ) : (
                          <span>Selecione uma data</span>
                        )}
                        <CalendarIcon className="ml-auto size-4" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={field.value}
                      onSelect={field.onChange}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            name="company"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Empresa</FormLabel>
                <FormControl>
                  <Input placeholder="amplo" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            name="workingHours"
            render={({ field }) => (
              <FormItem className="space-y-2">
                <FormLabel>Horário de Trabalho</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="hour1">08:00 / 17:00</SelectItem>
                    <SelectItem value="hour2">18:00 / 06:00</SelectItem>
                  </SelectContent>
                </Select>
                {/* <Button variant="outline" size="sm" className="gap-2">
                          <Plus className="size-4" />
                          Criar novo Horário
                        </Button> */}
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            name="status"
            render={({ field }) => (
              <FormItem className="h-fit gap-6">
                <FormLabel>Status</FormLabel>
                <FormControl>
                  <RadioGroup
                    onValueChange={field.onChange}
                    defaultValue="active"
                  >
                    <div className="flex gap-8">
                      <div className="flex gap-2">
                        <RadioGroupItem value="active" id="active" />
                        <Label htmlFor="active">Ativo</Label>
                      </div>
                      <div className="flex gap-2">
                        <RadioGroupItem value="inactive" id="inactive" />
                        <Label htmlFor="inactive">Inativo</Label>
                      </div>
                    </div>
                  </RadioGroup>
                </FormControl>
              </FormItem>
            )}
          />
        </div>
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
              Dados Pessoais
            </TabsTrigger>
            {/* <TabsTrigger
                      value="credentials"
                      className={cn(
                        "rounded-none border-b-2 border-transparent pb-2",
                        activeTab === "credentials" && "border-primary",
                      )}
                      onClick={() => setActiveTab("credentials")}
                    >
                      Credenciais
                    </TabsTrigger>
                    <TabsTrigger
                      value="settings"
                      className={cn(
                        "rounded-none border-b-2 border-transparent pb-2",
                        activeTab === "settings" && "border-primary",
                      )}
                      onClick={() => setActiveTab("settings")}
                    >
                      Configurações REP-P
                    </TabsTrigger> */}
          </TabsList>

          <TabsContent value="general" className="space-y-6">
            <div className="grid gap-6 md:grid-cols-3">
              <FormField
                name="department"
                render={({ field }) => (
                  <FormItem className="space-y-2">
                    <FormLabel>Departamento</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="dept1">Departamento 1</SelectItem>
                        <SelectItem value="dept2">Departamento 2</SelectItem>
                      </SelectContent>
                    </Select>
                    <Button variant="outline" size="sm" className="gap-2">
                      <Plus className="size-4" />
                      Criar novo departamento
                    </Button>
                  </FormItem>
                )}
              />

              <FormField
                name="costCenter"
                render={({ field }) => (
                  <FormItem className="space-y-2">
                    <FormLabel>Centro de Custo</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="cost1">Centro 1</SelectItem>
                        <SelectItem value="cost2">Centro 2</SelectItem>
                      </SelectContent>
                    </Select>
                    <Button variant="outline" size="sm" className="gap-2">
                      <Plus className="size-4" />
                      Criar novo centro de custo
                    </Button>
                  </FormItem>
                )}
              />

              <FormField
                name="position"
                render={({ field }) => (
                  <FormItem className="space-y-2">
                    <FormLabel>Cargo</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {/* {roles.map((role, index) => (
                                  <SelectItem key={index} value={role.role}>
                                    {role.role}
                                  </SelectItem>
                                ))} */}
                      </SelectContent>
                    </Select>
                  </FormItem>
                )}
              />

              <FormField
                name="sheetNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Número da Folha</FormLabel>
                    <FormControl>
                      <Input placeholder="Número da Folha" {...field} />
                    </FormControl>
                  </FormItem>
                )}
              />
              <FormField
                name="ctps"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>CTPS</FormLabel>
                    <FormControl>
                      <Input placeholder="CTPS" {...field} />
                    </FormControl>
                  </FormItem>
                )}
              />

              <FormField
                name="directSuperior"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Superior direto</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="sup1">Superior 1</SelectItem>
                        <SelectItem value="sup2">Superior 2</SelectItem>
                      </SelectContent>
                    </Select>
                  </FormItem>
                )}
              />
            </div>

            {/* <div>
                      <Label>Observações para o Cartão de Ponto</Label>
                      <Textarea className="min-h-[100px]" />
                    </div> */}
          </TabsContent>

          <TabsContent value="personal" className="space-y-6">
            <div className="grid gap-6 md:grid-cols-3">
              <FormField
                name="rg"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>RG</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input
                          placeholder="RG"
                          maxLength={9}
                          min={0}
                          {...field}
                        />
                        <Search className="absolute top-2.5 right-3 size-4 text-gray-400" />
                        {/* <Search className="absolute ml-auto size-4 text-gray-400" /> */}
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                name="birthDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Data da nascimento</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant="outline"
                            className={cn(
                              "w-full pl-3 text-left font-normal",
                              !field.value && "text-muted-foreground",
                            )}
                          >
                            {field.value ? (
                              format(field.value, "dd/MM/yyyy")
                            ) : (
                              <span>Selecione uma data</span>
                            )}
                            <CalendarIcon className="ml-auto size-4" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </FormItem>
                )}
              />

              <FormField
                name="socialName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nome Social</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input placeholder="Nome Social" {...field} />
                        <Search className="absolute top-2.5 right-3 size-4 text-gray-400" />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                name="cnh"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>CNH</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input placeholder="CNH" {...field} />
                        <Search className="absolute top-2.5 right-3 size-4 text-gray-400" />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                name="cnhCategory"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Categoria da CNH</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="a">A</SelectItem>
                        <SelectItem value="b">B</SelectItem>
                        <SelectItem value="ab">AB</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                name="cnhExpiration"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Data da vencimento da CNH</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant="outline"
                            className={cn(
                              "w-full pl-3 text-left font-normal",
                              !field.value && "text-muted-foreground",
                            )}
                          >
                            {field.value ? (
                              format(field.value, "dd/MM/yyyy")
                            ) : (
                              <span>Selecione uma data</span>
                            )}
                            <CalendarIcon className="ml-auto size-4" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
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
                        <Input placeholder="CEP" {...field} />
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
                      <div className="relative">
                        <Input placeholder="Endereço" {...field} />
                        <MapPin className="absolute top-2.5 right-3 size-4 text-gray-400" />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                name="neighborhood"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Bairro</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input placeholder="Bairro" {...field} />
                        <MapPin className="absolute top-2.5 right-3 size-4 text-gray-400" />
                      </div>
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
                      <div className="relative">
                        <Input placeholder="Cidade" {...field} />
                        <MapPin className="absolute top-2.5 right-3 size-4 text-gray-400" />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                name="state"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>UF</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione a UF" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {ufsBrasil.map((uf) => (
                          <SelectItem key={uf} value={uf}>
                            {uf}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Telefone</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input placeholder="Telefone" {...field} />
                        <Phone className="absolute top-2.5 right-3 size-4 text-gray-400" />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                name="extension"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Ramal</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input placeholder="Ramal" {...field} />
                        <Phone className="absolute top-2.5 right-3 size-4 text-gray-400" />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                name="fatherName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nome do pai</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input placeholder="Nome do pai" {...field} />
                        <User className="absolute top-2.5 right-3 size-4 text-gray-400" />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                name="motherName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nome da mãe</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input placeholder="Nome da mãe" {...field} />
                        <User className="absolute top-2.5 right-3 size-4 text-gray-400" />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                name="gender"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Gênero</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="masculino">Masculino</SelectItem>
                        <SelectItem value="feminino">Feminino</SelectItem>
                        <SelectItem value="outro">Outro</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                name="nationality"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nacionalidade</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input placeholder="Nacionalidade" {...field} />
                        <Search className="absolute top-2.5 right-3 size-4 text-gray-400" />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                name="placeOfBirth"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Naturalidade</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input placeholder="Naturalidade" {...field} />
                        <Search className="absolute top-2.5 right-3 size-4 text-gray-400" />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                name="civilStatus"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Estado Civil</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="solteiro">Solteiro(a)</SelectItem>
                        <SelectItem value="casado">Casado(a)</SelectItem>
                        <SelectItem value="divorciado">
                          Divorciado(a)
                        </SelectItem>
                        <SelectItem value="viuvo">Viúvo(a)</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </TabsContent>
        </Tabs>
        <div className="flex gap-4">
          <Button type="submit">Salvar</Button>
          <Button asChild variant="outline" type="reset">
            <Link href={"./"}>Cancelar</Link>
          </Button>
        </div>
      </form>
    </Form>
  );
}
