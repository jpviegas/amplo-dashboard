"use client";

import { CreateDepartment } from "@/api/dashboard/departamentos/route";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { registerDepartmentSchema } from "@/zodSchemas";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

export default function NewDepartmentForm() {
  type FormValues = z.infer<typeof registerDepartmentSchema>;

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
      const { success, message } = await CreateDepartment(values);

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
            name="department"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nome do departamento</FormLabel>
                <FormControl>
                  <Input placeholder="Nome do departamento" {...field} />
                </FormControl>
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="company"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Selecione a empresa</FormLabel>
                <FormControl>
                  <Input placeholder="Selecione a empresa" {...field} />
                </FormControl>
              </FormItem>
            )}
          />
          <FormField
            name="approvalFlow"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Fluxo de aprovação</FormLabel>
                <FormControl>
                  <Input placeholder="Fluxo de aprovação" {...field} />
                </FormControl>
              </FormItem>
            )}
          />
          <FormField
            name="sheetNumber"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Número da folha</FormLabel>
                <FormControl>
                  <Input placeholder="Número da folha" {...field} />
                </FormControl>
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
