"use client";

import { GetAllCities } from "@/api/dashboard/cities/route";
import { GetAllCompanies } from "@/api/dashboard/empresas/route";
import {
  GetCompanyEmployeeById,
  UpdateEmployee,
} from "@/api/dashboard/funcionarios/route";
import { GetAllHours } from "@/api/dashboard/horarios/route";
import Loading from "@/app/loading";
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
import { useUser } from "@/context/UserContext";
import { cn } from "@/lib/utils";
import {
  CityType,
  CompanyTypeWithId,
  EmployeeTypeWithId,
  registerEmployeeSchema,
  ufsBrasil,
  WorkingHourTypeWithId,
} from "@/zodSchemas";
import { zodResolver } from "@hookform/resolvers/zod";
import { MapPin, Phone, Search, User } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

export default function EditEmployeeForm() {
  const onlyDigits = (s: string) => s.replace(/\D+/g, "");
  const formatCpf = (value: string) => {
    const v = onlyDigits(value).slice(0, 11);
    if (v.length <= 3) return v;
    if (v.length <= 6) return v.replace(/(\d{3})(\d+)/, "$1.$2");
    if (v.length <= 9) return v.replace(/(\d{3})(\d{3})(\d+)/, "$1.$2.$3");
    return v.replace(/(\d{3})(\d{3})(\d{3})(\d{0,2}).*/, "$1.$2.$3-$4");
  };
  const formatRg = (value: string) => {
    const v = onlyDigits(value).slice(0, 9);
    if (v.length <= 3) return v;
    if (v.length <= 6) return v.replace(/(\d{3})(\d+)/, "$1.$2");
    return v.replace(/(\d{3})(\d{3})(\d{0,3})/, "$1.$2.$3");
  };
  const [activeTab, setActiveTab] = useState("general");
  const [companies, setCompanies] = useState<CompanyTypeWithId[]>([]);
  const [hours, setHours] = useState<WorkingHourTypeWithId[]>([]);
  const [cities, setCities] = useState<CityType[]>([]);
  const [employee, setEmployee] = useState<EmployeeTypeWithId>();
  const { user } = useUser();
  const { id }: { id: string } = useParams();

  type FormValues = z.infer<typeof registerEmployeeSchema>;

  const fetchCompanies = async () => {
    try {
      if (!user?._id) {
        return;
      }

      const { success, companies } = await GetAllCompanies(user._id, "", "1");

      if (success) {
        setCompanies(companies);
      }
    } catch (error) {
      console.error("Erro ao buscar empresas:", error);
      toast.error("Não foi possível carregar as empresas.");
    }
  };

  const fetchHours = async () => {
    try {
      if (!user?._id) {
        return;
      }

      const { success, hours } = await GetAllHours(user._id);
      if (success) {
        setHours(Array.isArray(hours) ? hours : []);
      }
    } catch (error) {
      console.error("Erro ao buscar horários:", error);
      toast.error("Não foi possível carregar os horários.");
    }
  };

  const fetchCities = async () => {
    try {
      if (!user?._id) {
        return;
      }

      const { success, cities } = await GetAllCities(user._id);
      if (success) {
        setCities(Array.isArray(cities) ? cities : []);
      }
    } catch (error) {
      console.error("Erro ao buscar cidades:", error);
      toast.error("Não foi possível carregar as cidades.");
    }
  };

  const fetchEmployee = async () => {
    try {
      const { success, message, user } = await GetCompanyEmployeeById(id);
      if (!success) {
        toast.error(message);
        return;
      }

      if (success) {
        setEmployee(user);
        toast.success(message);
      }
    } catch (error) {
      console.error("Erro ao buscar funcionário:", error);
      toast.error("Não foi possível carregar o funcionário.");
    }
  };

  useEffect(() => {
    fetchCompanies();
    fetchHours();
    fetchCities();
    fetchEmployee();
  }, [user?._id]);

  const form = useForm<FormValues>({
    resolver: zodResolver(registerEmployeeSchema),
  });

  useEffect(() => {
    if (employee) {
      const parsedEmployee = {
        ...employee,
        city:
          typeof (employee as unknown as { city?: unknown })?.city === "string"
            ? (employee as unknown as { city?: string }).city
            : ((employee as unknown as { city?: { city?: string } })?.city
                ?.city ?? ""),
      };
      form.reset(parsedEmployee as FormValues);
    }
  }, [employee, form]);

  const cityOptions = useMemo(() => {
    const normalized = cities
      .map((c) => c?.city)
      .filter((c): c is string => Boolean(c))
      .map((c) => c.trim())
      .filter(Boolean);

    return Array.from(new Set(normalized));
  }, [cities]);

  async function onSubmit(values: FormValues) {
    if (!user?._id) {
      toast.error("Usuário não autenticado.");
      return;
    }

    try {
      const { message, success } = await UpdateEmployee(user._id, values, id);
      if (!success) {
        toast.error(message);
      } else {
        toast.success(message);
      }
    } catch {
      toast.error("Erro ao atualizar o funcionário.");
    }
  }

  console.log(form.getValues());

  return (
    <>
      {!employee ? (
        <Loading />
      ) : (
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
                      <Input
                        placeholder="CPF"
                        maxLength={14}
                        value={formatCpf(field.value ?? "")}
                        onChange={(e) =>
                          field.onChange(
                            onlyDigits(e.target.value).slice(0, 11),
                          )
                        }
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
                          {/* <Button
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
                          </Button> */}
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
                control={form.control}
                name="company"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Selecione a empresa</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione a empresa" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {companies.map((company) => (
                          <SelectItem key={company._id} value={company._id}>
                            {company.companyName}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
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
                        {hours.map((hour) => (
                          <SelectItem key={hour._id} value={hour._id}>
                            {hour.initialHour} / {hour.finalHour}
                          </SelectItem>
                        ))}
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
                        value={field.value}
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
                        <Select
                          onValueChange={field.onChange}
                          value={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Selecione" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="dept1">
                              Departamento 1
                            </SelectItem>
                            <SelectItem value="dept2">
                              Departamento 2
                            </SelectItem>
                          </SelectContent>
                        </Select>
                        {/* <Button variant="outline" size="sm" className="gap-2">
                          <Plus className="size-4" />
                          Criar novo departamento
                        </Button> */}
                      </FormItem>
                    )}
                  />

                  <FormField
                    name="costCenter"
                    render={({ field }) => (
                      <FormItem className="space-y-2">
                        <FormLabel>Centro de Custo</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          value={field.value}
                        >
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
                        {/* <Button variant="outline" size="sm" className="gap-2">
                          <Plus className="size-4" />
                          Criar novo centro de custo
                        </Button> */}
                      </FormItem>
                    )}
                  />

                  <FormField
                    name="position"
                    render={({ field }) => (
                      <FormItem className="space-y-2">
                        <FormLabel>Cargo</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          value={field.value}
                        >
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
                        <Select
                          onValueChange={field.onChange}
                          value={field.value}
                        >
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
                              maxLength={11}
                              value={formatRg(field.value ?? "")}
                              onChange={(e) =>
                                field.onChange(
                                  onlyDigits(e.target.value).slice(0, 9),
                                )
                              }
                              onBlur={field.onBlur}
                              name={field.name}
                              ref={field.ref}
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
                              {/* <Button
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
                              </Button> */}
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
                            <Input
                              placeholder="CNH"
                              maxLength={11}
                              inputMode="numeric"
                              value={onlyDigits(field.value ?? "").slice(0, 11)}
                              onChange={(e) =>
                                field.onChange(
                                  onlyDigits(e.target.value).slice(0, 11),
                                )
                              }
                              onBlur={field.onBlur}
                              name={field.name}
                              ref={field.ref}
                            />
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
                              {/* <Button
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
                              </Button> */}
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
                        <Select
                          onValueChange={field.onChange}
                          value={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Selecione a cidade" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {cityOptions.map((city) => (
                              <SelectItem key={city} value={city}>
                                {city}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
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
                            <SelectItem value="solteiro">
                              Solteiro(a)
                            </SelectItem>
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
              <Button type="submit">{employee ? "Atualizar" : "Salvar"}</Button>
              <Button asChild variant="outline" type="reset">
                <Link href={employee ? "/dashboard/funcionarios" : "./"}>
                  Cancelar
                </Link>
              </Button>
            </div>
          </form>
        </Form>
      )}
    </>
  );
}
