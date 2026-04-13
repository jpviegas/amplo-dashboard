"use client";

import { CreateNotice } from "@/api/dashboard/noticias/route";
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
import { noticesSchema } from "@/zodSchemas";
import { zodResolver } from "@hookform/resolvers/zod";
import Cookies from "js-cookie";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

export default function NewNoticeForm() {
  const { user } = useUser();
  const userId = user?._id || Cookies.get("user");
  const router = useRouter();
  const [isReturning, setIsReturning] = useState(false);

  type FormValues = z.infer<typeof noticesSchema>;

  const form = useForm<FormValues>({
    resolver: zodResolver(noticesSchema),
    defaultValues: {
      title: "",
      subTitle: "",
      notice: "",
    },
  });

  async function onSubmit(values: FormValues) {
    try {
      if (!userId) {
        toast.error("Usuário não identificado.");
        return;
      }

      const { success, message } = await CreateNotice(userId, values);

      if (!success) {
        toast.warning(message);
      } else {
        toast.success(message);
        setIsReturning(true);
        setTimeout(() => {
          router.push("/dashboard/noticias");
        }, 1000);
      }
    } catch {
      toast.error("Erro ao cadastrar a notícia.");
    }
  }

  return (
    <Form {...form}>
      <form className="space-y-8" onSubmit={form.handleSubmit(onSubmit)}>
        <div className="grid gap-4 md:grid-cols-2">
          <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Título</FormLabel>
                <FormControl>
                  <Input placeholder="Título da notícia" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="subTitle"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Subtítulo</FormLabel>
                <FormControl>
                  <Input placeholder="Subtítulo (opcional)" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="notice"
            render={({ field }) => (
              <FormItem className="md:col-span-2">
                <FormLabel>Conteúdo</FormLabel>
                <FormControl>
                  <Input placeholder="Conteúdo da notícia" {...field} />
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
