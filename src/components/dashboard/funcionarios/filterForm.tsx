"use client";

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
import { toast } from "@/hooks/use-toast";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

const FormSchema = z.object({
  show: z
    .string({
      required_error: "Selecione um valor",
    })
    .optional(),
  filter: z
    .string({
      required_error: "Selecione um valor",
    })
    .optional(),
  search: z
    .string({
      required_error: "Selecione um valor",
    })
    .optional(),
});

export function EmployeeFilterForm() {
  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      show: "10",
      filter: "Todos",
      search: "",
    },
  });

  useEffect(() => {
    const subscription = form.watch((value) => {
      onSubmit(value as z.infer<typeof FormSchema>);
    });

    return () => subscription.unsubscribe();
  }, [form]);

  function onSubmit(values: z.infer<typeof FormSchema>) {
    console.log(values);

    toast({
      title: "You submitted the following values:",
      description: (
        <pre className="mt-2 w-[340px] rounded-md bg-slate-950 p-4">
          <code className="text-white">{JSON.stringify(values, null, 2)}</code>
        </pre>
      ),
    });
  }

  return (
    <Form {...form}>
      <form className="flex items-center justify-between">
        <FormField
          control={form.control}
          name="show"
          render={({ field }) => (
            <FormItem className="flex items-center gap-4">
              <FormLabel>Mostrar</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="10" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="10">10</SelectItem>
                  <SelectItem value="20">20</SelectItem>
                  <SelectItem value="30">30</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="filter"
          render={({ field }) => (
            <FormItem className="flex items-center gap-4">
              <FormLabel>Filtrar por funcionários:</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Todos" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="Todos">Todos</SelectItem>
                  <SelectItem value="Ativos">Ativos</SelectItem>
                  <SelectItem value="Inativos">Inativos</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="search"
          render={({ field }) => (
            <FormItem className="flex items-center gap-4">
              <FormLabel>Buscar:</FormLabel>
              <FormControl>
                <Input placeholder="buscar funcionário" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </form>
    </Form>
  );
}
