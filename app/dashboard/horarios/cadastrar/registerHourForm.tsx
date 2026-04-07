"use client";

import { CreateHour } from "@/api/dashboard/horarios/route";
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
// import {
//   Select,
//   SelectContent,
//   SelectItem,
//   SelectTrigger,
//   SelectValue,
// } from "@/components/ui/select";
import { useUser } from "@/context/UserContext";
import { registerWorkingHourSchema } from "@/zodSchemas";
import { zodResolver } from "@hookform/resolvers/zod";
import Cookies from "js-cookie";
import Link from "next/link";
// import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

export default function NewWorkingHourForm() {
  type FormValues = z.infer<typeof registerWorkingHourSchema>;
  const { user } = useUser();
  const userId = user?._id || Cookies.get("user");
  // const [companies, setCompanies] = useState<CompanyTypeWithId[]>([]);

  const form = useForm<FormValues>({
    resolver: zodResolver(registerWorkingHourSchema),
    defaultValues: {
      initialHour: "",
      finalHour: "",
      // company: "",
    },
  });

  // useEffect(() => {
  //   let isMounted = true;

  //   async function fetchCompanies() {
  //     try {
  //       if (!userId) return;
  //       const data = await GetAllCompanies(userId);
  //       if (isMounted) {
  //         setCompanies(data.companies);
  //       }
  //     } catch (error) {
  //       console.error("Erro ao buscar empresas:", error);
  //     }
  //   }

  //   fetchCompanies();

  //   return () => {
  //     isMounted = false;
  //   };
  // }, [userId]);
  console.log(form.getValues());

  async function onSubmit(values: FormValues) {
    try {
      if (!userId) {
        toast.error("Usuário não identificado.");
        return;
      }

      const { success, message } = await CreateHour(userId, values);

      if (!success) {
        toast.warning(message);
        return;
      }

      toast.success(message);
      form.reset({
        initialHour: "",
        finalHour: "",
        // company: values.company ?? "",
      });
    } catch {
      toast.error("Não foi possível cadastrar o horário.");
    }
  }

  return (
    <main className="container mx-auto h-full">
      <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-[1fr,300px]">
        <Form {...form}>
          <form className="space-y-8" onSubmit={form.handleSubmit(onSubmit)}>
            <div className="grid gap-4 md:grid-cols-3">
              <FormField
                control={form.control}
                name="initialHour"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Hora Inicial</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Hora Inicial"
                        {...field}
                        type="time"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="finalHour"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Hora Final</FormLabel>
                    <FormControl>
                      <Input placeholder="Hora Final" {...field} type="time" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              {/* <FormField
                    control={form.control}
                    name="company"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Empresa</FormLabel>
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
            </div>
            <div className="flex gap-4">
              <Button type="submit" disabled={form.formState.isSubmitting}>
                Salvar
              </Button>
              <Button asChild variant="outline" type="reset">
                <Link href="/dashboard/horarios">Cancelar</Link>
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </main>
  );
}
