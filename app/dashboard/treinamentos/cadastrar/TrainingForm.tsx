"use client";

import { CreateTraining } from "@/api/dashboard/treinamentos/route";
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
import { trainingSchema } from "@/zodSchemas";
import { zodResolver } from "@hookform/resolvers/zod";
import Cookies from "js-cookie";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { FieldErrors, useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

export default function NewTrainingForm() {
  type FormValues = z.infer<typeof trainingSchema>;

  const { user } = useUser();
  const userId = user?._id || Cookies.get("user");
  const router = useRouter();
  const [isReturning, setIsReturning] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(trainingSchema),
    defaultValues: {
      title: "",
      subTitle: "",
      image: "",
    },
  });

  async function onSubmit(values: FormValues) {
    try {
      if (!userId) {
        toast.error("Usuário não identificado.");
        return;
      }

      const payload: FormValues = {
        title: values.title,
        subTitle: values.subTitle,
        image: values.image ? values.image : undefined,
      };

      const { success, message } = await CreateTraining(userId, payload);

      if (!success) {
        toast.warning(message);
        return;
      }

      toast.success(message);
      setIsReturning(true);
      setTimeout(() => {
        router.push("/dashboard/treinamentos");
      }, 1000);
    } catch (error) {
      console.error("Erro ao cadastrar treinamento:", error);
      toast.error("Erro ao cadastrar o treinamento.");
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
        <div className="grid gap-4 md:grid-cols-3">
          <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Título</FormLabel>
                <FormControl>
                  <Input placeholder="Título do treinamento" {...field} />
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
                  <Input placeholder="Subtítulo do treinamento" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="image"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Imagem (URL)</FormLabel>
                <FormControl>
                  <Input placeholder="https://..." {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="flex gap-4">
          <Button
            type="submit"
            className="cursor-pointer"
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
            <Link href="/dashboard/treinamentos">Cancelar</Link>
          </Button>
        </div>
      </form>
    </Form>
  );
}
