"use client";

import { GetAllPositions } from "@/api/dashboard/cargos/route";
import { GetAllCities } from "@/api/dashboard/cities/route";
import { GetAllDepartments } from "@/api/dashboard/departamentos/route";
import {
  CreateEmployee,
  UpdateEmployee,
} from "@/api/dashboard/funcionarios/route";
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
  DepartmentTypeWithId,
  EmployeeTypeWithId,
  PositionTypeWithId,
  registerEmployeeSchema,
  ufsBrasil,
} from "@/zodSchemas";
import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import { CalendarIcon, MapPin, Phone, Search, User } from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

interface EmployeeFormProps {
  initialData?: EmployeeTypeWithId;
}

export default function RegisterEmployeeForm({
  initialData,
}: EmployeeFormProps) {
  const onlyDigits = (s: string) => s.replace(/\D+/g, "");
  const formatCep = (value: string) => {
    const v = onlyDigits(value).slice(0, 8);
    if (v.length <= 5) return v;
    return v.replace(/(\d{5})(\d+)/, "$1-$2");
  };
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
  const [departments, setDepartments] = useState<DepartmentTypeWithId[]>([]);
  const [positions, setPositions] = useState<PositionTypeWithId[]>([]);
  const [cities, setCities] = useState<CityType[]>([]);
  const [isCepLoading, setIsCepLoading] = useState(false);
  const lastCepLookupRef = useRef<string | null>(
    initialData?.cep ? onlyDigits(initialData.cep) : null,
  );
  const cepAbortRef = useRef<AbortController | null>(null);
  const { user } = useUser();

  type FormValues = z.infer<typeof registerEmployeeSchema>;

  const fetchPositions = async () => {
    try {
      if (!user?._id) {
        return;
      }

      const { success, positions } = await GetAllPositions(user._id);

      if (success) {
        setPositions(positions);
      }
    } catch (error) {
      console.error("Erro ao buscar cargos:", error);
      toast.error("Não foi possível carregar os cargos.");
    }
  };

  const fetchDepartments = async () => {
    try {
      if (!user?._id) {
        return;
      }

      const { success, departments } = await GetAllDepartments(
        user._id,
        "",
        "1",
      );

      if (success) {
        setDepartments(departments);
      }
    } catch (error) {
      console.error("Erro ao buscar departamentos:", error);
      toast.error("Não foi possível carregar os departamentos.");
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

  useEffect(() => {
    fetchDepartments();
    fetchPositions();
    fetchCities();
  }, [user?._id]);

  const form = useForm<FormValues>({
    resolver: zodResolver(registerEmployeeSchema),
    defaultValues: {
      ...(initialData ?? {}),
      status: initialData?.status ?? "active",
      name: initialData?.name ?? "",
      email: initialData?.email ?? "",
      pis: initialData?.pis ?? "",
      cpf: initialData?.cpf ?? "",
      registration: initialData?.registration ?? "",
      sheetNumber: initialData?.sheetNumber ?? "",
      ctps: initialData?.ctps ?? "",
      rg: initialData?.rg ?? "",
      socialName: initialData?.socialName ?? "",
      cnh: initialData?.cnh ?? "",
      cep: initialData?.cep ?? "",
      address: initialData?.address ?? "",
      neighborhood: initialData?.neighborhood ?? "",
      city:
        typeof initialData?.city === "string" ? initialData.city : undefined,
      extension: initialData?.extension ?? "",
      fatherName: initialData?.fatherName ?? "",
      motherName: initialData?.motherName ?? "",
      nationality: initialData?.nationality ?? "",
      placeOfBirth: initialData?.placeOfBirth ?? "",
    },
  });

  const cityOptions = useMemo(() => {
    const normalized = cities
      .map((c) => c?.city)
      .filter((c): c is string => Boolean(c))
      .map((c) => c.trim())
      .filter(Boolean);

    return Array.from(new Set(normalized));
  }, [cities]);

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
          form.setValue("neighborhood", data.bairro, {
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
          form.setValue("state", data.uf, {
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
    if (!user?._id) {
      toast.error("Usuário não autenticado.");
      return;
    }

    try {
      if (initialData) {
        const { message, success } = await UpdateEmployee(
          user._id,
          values,
          initialData._id,
        );
        if (!success) {
          toast.error(message);
        } else {
          toast.success(message);
        }
      } else {
        const { message, success } = await CreateEmployee(user._id, values);

        if (!success) {
          toast.error(message);
        } else {
          toast.success(message);
        }
      }
    } catch {
      toast.error(
        initialData
          ? "Erro ao atualizar o funcionário."
          : "Erro ao cadastrar o funcionário.",
      );
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
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>E-mail</FormLabel>
                <FormControl>
                  <Input placeholder="E-mail" {...field} />
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
                      field.onChange(onlyDigits(e.target.value).slice(0, 11))
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
          {/* <FormField
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
          /> */}
          {/* <FormField
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
                <Button variant="outline" size="sm" className="gap-2">
                          <Plus className="size-4" />
                          Criar novo Horário
                        </Button>
                <FormMessage />
              </FormItem>
            )}
          /> */}
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
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {departments.map((department) => (
                          <SelectItem
                            key={department._id}
                            value={department._id}
                          >
                            {department.departmentName}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {/* <Button variant="outline" size="sm" className="gap-2">
                      <Link
                        href="/dashboard/departamentos/cadastrar"
                        className="flex items-center gap-2"
                      >
                        <Plus className="size-4" />
                        Criar novo departamento
                      </Link>
                    </Button> */}
                  </FormItem>
                )}
              />

              {/* <FormField
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
              /> */}

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
                        {positions.map((position) => (
                          <SelectItem key={position._id} value={position._id}>
                            {position.positionName}
                          </SelectItem>
                        ))}
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
                      value={field.value ?? undefined}
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
                    <Select onValueChange={field.onChange} value={field.value}>
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
          <Button type="submit">{initialData ? "Atualizar" : "Salvar"}</Button>
          <Button asChild variant="outline" type="reset">
            <Link href={initialData ? "/dashboard/funcionarios" : "./"}>
              Cancelar
            </Link>
          </Button>
        </div>
      </form>
    </Form>
  );
}
