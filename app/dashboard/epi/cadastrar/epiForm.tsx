"use client";

import { CreateEPI } from "@/api/dashboard/epi/route";
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
import { epiSchema } from "@/zodSchemas";
import { zodResolver } from "@hookform/resolvers/zod";
import Cookies from "js-cookie";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { FieldErrors, useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

export default function NewEPIForm() {
  type FormValues = z.infer<typeof epiSchema>;

  const { user } = useUser();
  const userId = user?._id || Cookies.get("user");
  const router = useRouter();
  const [isReturning, setIsReturning] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(epiSchema),
    defaultValues: {
      name: "",
      ca: "",
    },
  });

  async function onSubmit(values: FormValues) {
    try {
      if (!userId) {
        toast.error("Usuário não identificado.");
        return;
      }

      const { success, message } = await CreateEPI(userId, {
        name: values.name,
        ca: values.ca,
      });

      if (!success) {
        toast.warning(message);
        return;
      }

      toast.success(message);
      setIsReturning(true);
      setTimeout(() => {
        router.push("/dashboard/epi");
      }, 1000);
    } catch (error) {
      console.error("Erro ao cadastrar E.P.I.:", error);
      toast.error("Erro ao cadastrar o E.P.I.");
    }
  }

  function onInvalid(errors: FieldErrors<FormValues>) {
    const messages = Object.values(errors)
      .map((error) => error?.message)
      .filter((message): message is string => Boolean(message));

    const uniqueMessages = Array.from(new Set(messages));
    for (const message of uniqueMessages) {
      toast.error(message);
    }
  }

  return (
    <Form {...form}>
      <form
        className="space-y-8"
        onSubmit={form.handleSubmit(onSubmit, onInvalid)}
      >
        <div className="grid gap-4 md:grid-cols-2">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nome</FormLabel>
                <FormControl>
                  <Input placeholder="Nome do E.P.I." {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="ca"
            render={({ field }) => (
              <FormItem>
                <FormLabel>C.A.</FormLabel>
                <FormControl>
                  <Input placeholder="Número do C.A." {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

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
