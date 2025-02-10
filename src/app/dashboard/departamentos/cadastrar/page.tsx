"use client";

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
import { toast } from "@/hooks/use-toast";
import { registerDepartmentSchema } from "@/types";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { z } from "zod";

export default function NewDepartmentForm() {
  type FormValues = z.infer<typeof registerDepartmentSchema>;

  const form = useForm<FormValues>({
    resolver: zodResolver(registerDepartmentSchema),
    defaultValues: {
      name: "",
      company: "",
      approvalFlow: "",
      sheetNumber: "",
    },
  });

  function onSubmit(values: FormValues) {
    console.log(values);

    try {
      // API call or other logic
      toast({
        title: "O departamento foi cadastrado com sucesso.",
      });
    } catch {
      toast({
        title: "Não foi possível cadastrar o departamento.",
        variant: "destructive",
      });
    }
  }

  return (
    <main className="container mx-auto h-full">
      <div className="flex items-center justify-between">
        <h1 className="mt-8 text-3xl font-bold">Novo Departamento</h1>
      </div>
      <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-[1fr,300px]">
        <Card>
          <CardContent className="p-6">
            <Form {...form}>
              <form
                className="space-y-8"
                onSubmit={form.handleSubmit(onSubmit)}
              >
                <div className="grid gap-4 md:grid-cols-3">
                  <FormField
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nome do departamento</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Nome do departamento"
                            {...field}
                          />
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
                  <Button
                    type="submit"
                    onClick={() =>
                      toast({
                        title: "Não foi possível cadastrar o departamento",
                        description:
                          "falta preencher algum campo ou preencheu errado",
                        variant: "destructive",
                      })
                    }
                  >
                    Salvar
                  </Button>
                  <Button asChild variant="outline" type="reset">
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
