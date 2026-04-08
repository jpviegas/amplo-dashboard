"use client";

import { GetAllPositions } from "@/api/dashboard/cargos/route";
import { GetAllCities } from "@/api/dashboard/cities/route";
import { GetAllDepartments } from "@/api/dashboard/departamentos/route";
import { GetAllCompanies } from "@/api/dashboard/empresas/route";
import {
  CreateEmployee,
  UpdateEmployee,
} from "@/api/dashboard/funcionarios/route";
import { GetAllHours } from "@/api/dashboard/horarios/route";
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
  CityTypeWithId,
  CompanyTypeWithId,
  DepartmentTypeWithId,
  EmployeeTypeWithId,
  PositionTypeWithId,
  registerEmployeeSchema,
  ufsBrasil,
  WorkingHourTypeWithId,
} from "@/zodSchemas";
import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import { CalendarIcon, MapPin, Phone, Search, User } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { useFieldArray, useForm } from "react-hook-form";
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
  const formatPhone = (value: string) => {
    const v = onlyDigits(value).slice(0, 11);
    const ddd = v.slice(0, 2);
    const rest = v.slice(2);

    if (!v) return "";
    if (v.length <= 2) return `(${ddd}`;
    if (v.length <= 6) return `(${ddd}) ${rest}`;
    if (v.length <= 10)
      return `(${ddd}) ${rest.slice(0, 4)}-${rest.slice(4)}`.replace(/-$/, "");
    return `(${ddd}) ${rest.slice(0, 5)}-${rest.slice(5)}`.replace(/-$/, "");
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
  const normalizeCityName = (value: unknown) =>
    String(value ?? "")
      .trim()
      .toUpperCase();
  const toDate = (value: unknown) => {
    if (!value) return undefined;
    if (value instanceof Date) {
      return Number.isNaN(value.getTime()) ? undefined : value;
    }
    const raw = String(value).trim();
    if (!raw) return undefined;

    const slashMatch = raw.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
    if (slashMatch) {
      const [, ddRaw, mmRaw, yyyyRaw] = slashMatch;
      const day = Number(ddRaw);
      const month = Number(mmRaw);
      const year = Number(yyyyRaw);
      const date = new Date(year, month - 1, day);
      return Number.isNaN(date.getTime()) ? undefined : date;
    }

    const digits = onlyDigits(raw);
    if (digits.length >= 8) {
      const first8 = digits.slice(0, 8);
      const yyyy = Number(first8.slice(0, 4));
      const mm = Number(first8.slice(4, 6));
      const dd = Number(first8.slice(6, 8));
      if (yyyy >= 1900 && yyyy <= 2100) {
        const date = new Date(yyyy, mm - 1, dd);
        return Number.isNaN(date.getTime()) ? undefined : date;
      }

      const dd2 = Number(first8.slice(0, 2));
      const mm2 = Number(first8.slice(2, 4));
      const yyyy2 = Number(first8.slice(4, 8));
      if (yyyy2 >= 1900 && yyyy2 <= 2100) {
        const date = new Date(yyyy2, mm2 - 1, dd2);
        return Number.isNaN(date.getTime()) ? undefined : date;
      }
    }

    const date = new Date(raw);
    return Number.isNaN(date.getTime()) ? undefined : date;
  };
  const formatDateDigits = (value: unknown) => {
    const date = toDate(value);
    return date ? format(date, "ddMMyyyy") : "";
  };
  const parseCtpsParts = (value: unknown) => {
    const raw = String(value ?? "").trim();
    const digits = raw.match(/\d+/g) ?? [];

    const ufCandidate =
      raw
        .toUpperCase()
        .match(/\b[A-Z]{2}\b/g)
        ?.find((uf) => ufsBrasil.includes(uf)) ?? "";

    return {
      number: digits[0] ?? "",
      series: digits[1] ?? "",
      uf: ufCandidate,
    };
  };
  const buildCtpsValue = (parts: {
    number?: string;
    series?: string;
    uf?: string;
  }) => {
    const number = onlyDigits(parts.number ?? "");
    const series = onlyDigits(parts.series ?? "");
    const uf = String(parts.uf ?? "").toUpperCase();

    if (!number && !series && !uf) return "";
    return [number, series, uf].filter(Boolean).join("-");
  };
  const currentYear = new Date().getFullYear();

  const [activeTab, setActiveTab] = useState("general");
  const [companies, setCompanies] = useState<CompanyTypeWithId[]>([]);
  const [hours, setHours] = useState<WorkingHourTypeWithId[]>([]);
  const [departments, setDepartments] = useState<DepartmentTypeWithId[]>([]);
  const [positions, setPositions] = useState<PositionTypeWithId[]>([]);
  const [cities, setCities] = useState<CityTypeWithId[]>([]);
  const [isCepLoading, setIsCepLoading] = useState(false);
  const router = useRouter();
  const [isReturning, setIsReturning] = useState(false);
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
    fetchCompanies();
    fetchHours();
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
      // pis: initialData?.pis ?? "",
      cpf: initialData?.cpf ?? "",
      //   registration: initialData?.registration ?? "",
      admissionDate: formatDateDigits(initialData?.admissionDate),
      companyId: initialData?.companyId ?? "",
      workingHours: initialData?.workingHours ?? "",
      //   position: initialData?.position ?? "",
      //   departmentId: initialData?.departmentId ?? "",
      //   sheetNumber: initialData?.sheetNumber ?? "",
      //   ctps: initialData?.ctps ?? "",
      //   rg: initialData?.rg ?? "",
      //   birthDate: initialData?.birthDate
      //     ? formatDateDigits(initialData.birthDate)
      //     : undefined,
      //   socialName: initialData?.socialName ?? "",
      //   cnh: initialData?.cnh ?? "",
      //   cnhExpiration: initialData?.cnhExpiration
      //     ? formatDateDigits(initialData.cnhExpiration)
      //     : undefined,
      //   cep: initialData?.cep ?? "",
      //   address: initialData?.address ?? "",
      //   addressNumber: initialData?.addressNumber ?? "",
      //   neighborhood: initialData?.neighborhood ?? "",
      //   city:
      //     typeof initialData?.city === "string" ? initialData.city : undefined,
      //   phone: onlyDigits(initialData?.phone ?? ""),
      //   extension: initialData?.extension ?? "",
      //   fatherName: initialData?.fatherName ?? "",
      //   motherName: initialData?.motherName ?? "",
      //   nationality: initialData?.nationality ?? "",
      //   placeOfBirth: initialData?.placeOfBirth ?? "",
      //   children: Array.isArray(initialData?.children)
      //     ? initialData!.children.map((child) => ({
      //         ...child,
      //         birthDate: child?.birthDate
      //           ? formatDateDigits(child.birthDate)
      //           : undefined,
      //       }))
      //     : [],
    },
  });

  const childrenFieldArray = useFieldArray({
    control: form.control,
    name: "children",
  });

  const cityOptions = useMemo(() => {
    const uniqueById = new Map<string, CityTypeWithId>();
    for (const city of cities) {
      if (city?._id && !uniqueById.has(city._id))
        uniqueById.set(city._id, city);
    }
    return Array.from(uniqueById.values()).sort((a, b) =>
      String(a.city ?? "").localeCompare(String(b.city ?? "")),
    );
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
          const match = cities.find(
            (c) =>
              normalizeCityName(c.city) === normalizeCityName(data.localidade),
          );
          form.setValue("city", match?._id ?? "", {
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
  }, [cepValue, form, cities]);

  async function onSubmit(values: FormValues) {
    if (!user?._id) {
      toast.error("Usuário não autenticado.");
      return;
    }

    try {
      const payload: FormValues = {
        ...values,
        admissionDate: formatDateDigits(values.admissionDate),
        birthDate: values.birthDate
          ? formatDateDigits(values.birthDate)
          : undefined,
        cnhExpiration: values.cnhExpiration
          ? formatDateDigits(values.cnhExpiration)
          : undefined,
        children: Array.isArray(values.children)
          ? values.children.map((child) => ({
              ...child,
              birthDate: child.birthDate
                ? formatDateDigits(child.birthDate)
                : undefined,
            }))
          : values.children,
      };

      if (initialData) {
        const { message, success } = await UpdateEmployee(
          user._id,
          payload,
          initialData._id,
        );
        if (!success) {
          toast.error(message);
        } else {
          toast.success(message);
        }
      } else {
        const { message, success } = await CreateEmployee(user._id, payload);

        if (!success) {
          toast.error(message);
        } else {
          toast.success(message);
          setIsReturning(true);
          setTimeout(() => {
            router.push("/dashboard/funcionarios");
          }, 1000);
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
            render={({ field }) => {
              const selectedDate = toDate(field.value);
              return (
                <FormItem>
                  <FormLabel>Data da admissão</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full pl-3 text-left font-normal",
                            !selectedDate && "text-muted-foreground",
                          )}
                        >
                          {selectedDate ? (
                            format(selectedDate, "dd/MM/yyyy")
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
                        captionLayout="dropdown"
                        fromYear={1900}
                        toYear={currentYear}
                        selected={selectedDate}
                        onSelect={(date) =>
                          field.onChange(date ? format(date, "ddMMyyyy") : "")
                        }
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              );
            }}
          />

          <FormField
            control={form.control}
            name="companyId"
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
            <TabsTrigger
              value="children"
              className={cn(
                "rounded-none border-b-2 border-transparent pb-2",
                activeTab === "children" && "border-primary",
              )}
              onClick={() => setActiveTab("children")}
            >
              Dependentes
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
                name="ctps"
                render={({ field }) => (
                  <FormItem className="md:col-span-3">
                    <FormLabel>CTPS</FormLabel>
                    <div className="grid gap-6 md:grid-cols-3">
                      <div className="space-y-2">
                        <Label>Número</Label>
                        <FormControl>
                          <Input
                            placeholder="Número"
                            inputMode="numeric"
                            value={parseCtpsParts(field.value).number}
                            onChange={(e) => {
                              const current = parseCtpsParts(field.value);
                              field.onChange(
                                buildCtpsValue({
                                  ...current,
                                  number: e.target.value,
                                }),
                              );
                            }}
                            onBlur={field.onBlur}
                            name={field.name}
                            ref={field.ref}
                          />
                        </FormControl>
                      </div>

                      <div className="space-y-2">
                        <Label>Série</Label>
                        <FormControl>
                          <Input
                            placeholder="Série"
                            inputMode="numeric"
                            value={parseCtpsParts(field.value).series}
                            onChange={(e) => {
                              const current = parseCtpsParts(field.value);
                              field.onChange(
                                buildCtpsValue({
                                  ...current,
                                  series: e.target.value,
                                }),
                              );
                            }}
                            onBlur={field.onBlur}
                            name={field.name}
                            ref={field.ref}
                          />
                        </FormControl>
                      </div>

                      <div className="space-y-2">
                        <Label>UF</Label>
                        <Select
                          value={parseCtpsParts(field.value).uf || undefined}
                          onValueChange={(uf) => {
                            const current = parseCtpsParts(field.value);
                            field.onChange(buildCtpsValue({ ...current, uf }));
                          }}
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
                      </div>
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* <div>
                      <Label>Observações para o Cartão de Ponto</Label>
                      <Textarea className="min-h-[100px]" />
                    </div> */}
          </TabsContent>

          <TabsContent value="children" className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <h3 className="text-base leading-none font-medium">
                  Dependentes
                </h3>
                <p className="text-muted-foreground text-sm">
                  Adicione um ou mais dependentes.
                </p>
              </div>
              <Button
                type="button"
                variant="outline"
                onClick={() =>
                  childrenFieldArray.append({
                    name: "",
                    cpf: "",
                    birthDate: undefined,
                  })
                }
              >
                Adicionar dependente
              </Button>
            </div>

            <div className="space-y-6">
              {childrenFieldArray.fields.map((child, index) => (
                <div key={child.id} className="rounded-lg border p-4">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-medium">
                      Dependente {index + 1}
                    </h4>
                    <Button
                      type="button"
                      variant="ghost"
                      onClick={() => childrenFieldArray.remove(index)}
                    >
                      Remover
                    </Button>
                  </div>

                  <div className="mt-4 grid gap-6 md:grid-cols-3">
                    <FormField
                      name={`children.${index}.name`}
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
                      name={`children.${index}.cpf`}
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
                      name={`children.${index}.birthDate`}
                      render={({ field }) => {
                        const selectedDate = toDate(field.value);
                        return (
                          <FormItem>
                            <FormLabel>Data de nascimento</FormLabel>
                            <Popover>
                              <PopoverTrigger asChild>
                                <FormControl>
                                  <Button
                                    variant="outline"
                                    className={cn(
                                      "w-full pl-3 text-left font-normal",
                                      !selectedDate && "text-muted-foreground",
                                    )}
                                  >
                                    {selectedDate ? (
                                      format(selectedDate, "dd/MM/yyyy")
                                    ) : (
                                      <span>Selecione uma data</span>
                                    )}
                                    <CalendarIcon className="ml-auto size-4" />
                                  </Button>
                                </FormControl>
                              </PopoverTrigger>
                              <PopoverContent
                                className="w-auto p-0"
                                align="start"
                              >
                                <Calendar
                                  mode="single"
                                  captionLayout="dropdown"
                                  fromYear={1900}
                                  toYear={currentYear}
                                  selected={selectedDate}
                                  onSelect={(date) =>
                                    field.onChange(
                                      date ? format(date, "ddMMyyyy") : "",
                                    )
                                  }
                                  initialFocus
                                />
                              </PopoverContent>
                            </Popover>
                            <FormMessage />
                          </FormItem>
                        );
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
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
                render={({ field }) => {
                  const selectedDate = toDate(field.value);
                  return (
                    <FormItem>
                      <FormLabel>Data da nascimento</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant="outline"
                              className={cn(
                                "w-full pl-3 text-left font-normal",
                                !selectedDate && "text-muted-foreground",
                              )}
                            >
                              {selectedDate ? (
                                format(selectedDate, "dd/MM/yyyy")
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
                            captionLayout="dropdown"
                            fromYear={1900}
                            toYear={currentYear}
                            selected={selectedDate}
                            onSelect={(date) =>
                              field.onChange(
                                date ? format(date, "ddMMyyyy") : "",
                              )
                            }
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                    </FormItem>
                  );
                }}
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
                render={({ field }) => {
                  const selectedDate = toDate(field.value);
                  return (
                    <FormItem>
                      <FormLabel>Data da vencimento da CNH</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant="outline"
                              className={cn(
                                "w-full pl-3 text-left font-normal",
                                !selectedDate && "text-muted-foreground",
                              )}
                            >
                              {selectedDate ? (
                                format(selectedDate, "dd/MM/yyyy")
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
                            captionLayout="dropdown"
                            fromYear={1900}
                            toYear={new Date().getFullYear() + 20}
                            selected={selectedDate}
                            onSelect={(date) =>
                              field.onChange(
                                date ? format(date, "ddMMyyyy") : "",
                              )
                            }
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                    </FormItem>
                  );
                }}
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
                name="addressNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Número do endereço</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input placeholder="Número do endereço" {...field} />
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
                      value={field.value ? field.value : undefined}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione a cidade" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {cityOptions.map((city) => (
                          <SelectItem key={city._id} value={city._id}>
                            {city.city}
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
                        <Input
                          placeholder="(00) 00000-0000"
                          inputMode="numeric"
                          maxLength={15}
                          value={formatPhone(field.value ?? "")}
                          onChange={(e) =>
                            field.onChange(
                              onlyDigits(e.target.value).slice(0, 11),
                            )
                          }
                          onBlur={field.onBlur}
                          name={field.name}
                          ref={field.ref}
                        />
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
  );
}
