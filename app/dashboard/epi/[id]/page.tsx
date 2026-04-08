"use client";

import { GetEPIById, UpdateEPI } from "@/api/dashboard/epi/route";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
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
import { EPITypeWithId, epiSchema } from "@/zodSchemas";
import { zodResolver } from "@hookform/resolvers/zod";
import Cookies from "js-cookie";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import { FieldErrors, useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

export default function EPIEditPage() {
  type FormValues = z.infer<typeof epiSchema>;

  const { user } = useUser();
  const userId = user?._id || Cookies.get("user");
  const params = useParams<{ id: string }>();
  const rawEPIId = params?.id;
  const epiId = useMemo(() => {
    const raw = String(rawEPIId ?? "");
    const match = raw.match(/[a-f0-9]{24}$/i);
    return match?.[0] ?? rawEPIId;
  }, [rawEPIId]);
  const [epi, setEPI] = useState<EPITypeWithId>();
  const router = useRouter();
  const [isReturning, setIsReturning] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(epiSchema),
    defaultValues: {
      name: "",
      ca: "",
    },
  });

  const fetchEPI = useCallback(async () => {
    try {
      if (!userId) return;
      if (!epiId) return;

      const { success, epi } = await GetEPIById(userId, String(epiId));

      if (!success) {
        toast.error("Não foi possível carregar o E.P.I.");
        return;
      }

      if (!epi) {
        toast.error("E.P.I. não encontrado.");
        return;
      }

      setEPI(epi);
      form.reset({
        name: epi.name ?? "",
        ca: epi.ca ?? "",
      });
    } catch (error) {
      console.error("Erro ao carregar E.P.I.:", error);
      toast.error("Não foi possível carregar o E.P.I.");
    }
  }, [epiId, form, userId]);

  useEffect(() => {
    fetchEPI();
  }, [fetchEPI]);

  async function onSubmit(values: FormValues) {
    try {
      if (!userId) {
        toast.error("Usuário não identificado.");
        return;
      }
      if (!epiId) {
        toast.error("E.P.I. inválido.");
        return;
      }

      const { success, message } = await UpdateEPI(userId, String(epiId), {
        name: values.name,
        ca: values.ca,
      });

      if (!success) {
        toast.warning(message);
        return;
      }

      toast.success(message);
      await fetchEPI();
      setIsReturning(true);
      setTimeout(() => {
        router.push("/dashboard/epi");
      }, 1000);
    } catch (error) {
      console.error("Erro ao editar E.P.I.:", error);
      toast.error("Erro ao editar o E.P.I.");
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
    <main className="container mx-auto h-full w-11/12 pt-8">
      <div className="mb-8 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" asChild>
            <Link href="/dashboard/epi">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <h1 className="text-3xl font-bold">Editar E.P.I. {epi?.name}</h1>
        </div>
      </div>

      <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-[1fr,300px]">
        <Card>
          <CardContent className="p-6">
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
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
