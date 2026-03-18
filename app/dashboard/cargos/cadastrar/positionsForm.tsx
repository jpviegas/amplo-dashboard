"use client";

import { CreatePosition } from "@/api/dashboard/cargos/route";
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
import { useUser } from "@/context/UserContext";
import { registerPositionSchema } from "@/zodSchemas";
import { zodResolver } from "@hookform/resolvers/zod";
import Cookies from "js-cookie";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

export default function NewPositionForm() {
  const { user } = useUser();
  const userId = user?._id || Cookies.get("user");

  type FormValues = z.infer<typeof registerPositionSchema>;

  const form = useForm<FormValues>({
    resolver: zodResolver(registerPositionSchema),
    defaultValues: {
      positionName: "",
    },
  });

  async function onSubmit(values: FormValues) {
    try {
      if (!userId) {
        toast.error("Usuário não identificado.");
        return;
      }

      const { success, message } = await CreatePosition(userId, values);

      if (!success) {
        toast.warning(message);
      } else {
        toast.success(message);
      }
    } catch {
      toast.error("Erro ao cadastrar o cargo.");
    }
  }

  return (
    <Form {...form}>
      <form className="space-y-8" onSubmit={form.handleSubmit(onSubmit)}>
        <div className="grid gap-4 md:grid-cols-3">
          <FormField
            control={form.control}
            name="positionName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nome</FormLabel>
                <FormControl>
                  <Input placeholder="Nome do cargo" {...field} />
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
                <FormControl>
                  <Input placeholder="Preencha o ID da empresa" {...field} />
                </FormControl>
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
            <Link href="./">Cancelar</Link>
          </Button>
        </div>
      </form>
    </Form>
  );
}
