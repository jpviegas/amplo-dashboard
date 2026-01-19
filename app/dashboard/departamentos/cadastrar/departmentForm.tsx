"use client";

import { CreateDepartment } from "@/api/dashboard/departamentos/route";
import { GetAllCompanies } from "@/api/dashboard/empresas/route";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useUser } from "@/context/UserContext";
import { CompanyTypeWithId, registerDepartmentSchema } from "@/zodSchemas";
import { zodResolver } from "@hookform/resolvers/zod";
import Cookies from "js-cookie";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

export default function NewDepartmentForm() {
  type FormValues = z.infer<typeof registerDepartmentSchema>;
  const [companies, setCompanies] = useState<CompanyTypeWithId[]>([]);
  const { user } = useUser();
  const userId = user?._id || Cookies.get("user");

  const fetchCompanies = async () => {
    try {
      if (!userId) {
        return;
      }

      const { success, companies } = await GetAllCompanies(userId);

      if (success) {
        setCompanies(companies);
      }
    } catch (error) {
      console.error("Erro ao buscar empresas:", error);
      toast.error("Não foi possível carregar as empresas.");
    }
  };

  useEffect(() => {
    fetchCompanies();
  }, [userId]);

  const form = useForm<FormValues>({
    resolver: zodResolver(registerDepartmentSchema),
    defaultValues: {
      department: "",
      company: "",
      approvalFlow: "",
      sheetNumber: "",
    },
  });

  async function onSubmit(values: FormValues) {
    try {
      if (!userId) {
        toast.error("Usuário não identificado.");
        return;
      }

      const { success, message } = await CreateDepartment(userId, values);

      if (!success) {
        toast.warning(message);
      } else {
        toast.success(message);
      }
    } catch {
      toast.error("Erro ao cadastrar o departamento.");
    }
  }

  return (
    <Form {...form}>
      <form className="space-y-8" onSubmit={form.handleSubmit(onSubmit)}>
        <div className="grid gap-4 md:grid-cols-3">
          <FormField
            control={form.control}
            name="department"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nome do departamento</FormLabel>
                <FormControl>
                  <Input placeholder="Nome do departamento" {...field} />
                </FormControl>
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
            control={form.control}
            name="approvalFlow"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Fluxo de aprovação</FormLabel>
                <FormControl>
                  <Input placeholder="Fluxo de aprovação" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="sheetNumber"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Número da folha</FormLabel>
                <FormControl>
                  <Input placeholder="Número da folha" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
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
