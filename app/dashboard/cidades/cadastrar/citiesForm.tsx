"use client";

import { CreateCity } from "@/api/dashboard/cities/route";
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
import { citySchema } from "@/zodSchemas";
import { zodResolver } from "@hookform/resolvers/zod";
import Cookies from "js-cookie";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

export default function NewCityForm() {
  const { user } = useUser();
  const userId = user?._id || Cookies.get("user");
  const router = useRouter();
  const [isReturning, setIsReturning] = useState(false);

  const cityFormSchema = citySchema;
  type FormValues = z.infer<typeof cityFormSchema>;

  const form = useForm<FormValues>({
    resolver: zodResolver(cityFormSchema),
    defaultValues: {
      city: "",
      meal: undefined,
      transport: undefined,
    },
  });

  async function onSubmit(values: FormValues) {
    try {
      if (!userId) {
        toast.error("Usuário não identificado.");
        return;
      }

      const { success, message } = await CreateCity(userId, values);

      if (!success) {
        toast.warning(message);
      } else {
        toast.success(message);
        setIsReturning(true);
        setTimeout(() => {
          router.push("/dashboard/cidades");
        }, 1000);
      }
    } catch (error) {
      toast.error(`${error}`);
    }
  }

  return (
    <Form {...form}>
      <form
        className="space-y-8"
        onSubmit={async (e) => {
          e.preventDefault();
          try {
            form.clearErrors();
            await form.handleSubmit(async (values) => {
              await onSubmit(values);
            })(e);
          } catch (error) {
            toast.error(`${error}`);
          }
        }}
      >
        <div className="grid gap-4 md:grid-cols-3">
          <FormField
            control={form.control}
            name="city"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Cidade</FormLabel>
                <FormControl>
                  <Input placeholder="Nome da cidade" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="meal"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Vale-Refeição</FormLabel>
                <FormControl>
                  <Input
                    inputMode="decimal"
                    placeholder="0"
                    value={field.value ?? ""}
                    onChange={(e) => {
                      const raw = e.target.value;
                      if (!raw.trim()) {
                        field.onChange(undefined);
                        return;
                      }
                      const n = Number(raw);
                      field.onChange(Number.isNaN(n) ? undefined : n);
                    }}
                    onBlur={field.onBlur}
                    name={field.name}
                    ref={field.ref}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="transport"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Vale-Transporte</FormLabel>
                <FormControl>
                  <Input
                    inputMode="decimal"
                    placeholder="0"
                    value={field.value ?? ""}
                    onChange={(e) => {
                      const raw = e.target.value;
                      if (!raw.trim()) {
                        field.onChange(undefined);
                        return;
                      }
                      const n = Number(raw);
                      field.onChange(Number.isNaN(n) ? undefined : n);
                    }}
                    onBlur={field.onBlur}
                    name={field.name}
                    ref={field.ref}
                  />
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
