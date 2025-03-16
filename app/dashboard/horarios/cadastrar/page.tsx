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
import { registerWorkingHourSchema } from "@/zodSchemas";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

export default function NewWorkingHourForm() {
  type FormValues = z.infer<typeof registerWorkingHourSchema>;

  const form = useForm<FormValues>({
    resolver: zodResolver(registerWorkingHourSchema),
    defaultValues: {
      hour: "",
      company: "",
    },
  });

  function onSubmit(values: FormValues) {
    console.log(values);

    // Example error handling
    try {
      // API call or other logic
      toast("O cargo foi cadastrado com sucesso.");
    } catch {
      toast("Não foi possível cadastrar o cargo.");
    }
  }

  return (
    <main className="container mx-auto h-full">
      <div className="flex items-center justify-between">
        <h1 className="mt-8 text-3xl font-bold">Novo Horário</h1>
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
                    control={form.control}
                    name="hour"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nome</FormLabel>
                        <FormControl>
                          <Input placeholder="Nome" {...field} />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="company"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Empresa</FormLabel>
                        <FormControl>
                          <Input placeholder="Empresa" {...field} />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </div>
                <div className="flex gap-4">
                  <Button
                    type="submit"
                    onClick={() =>
                      toast("Não foi possível cadastrar o cargo", {
                        description:
                          "falta preencher algum campo ou preencheu errado",
                      })
                    }
                  >
                    Salvar
                  </Button>
                  <Button asChild variant="outline" type="reset">
                    <Link href="./">Cancelar</Link>
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
