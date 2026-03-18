"use client";

import {
  GetCompanyPositionById,
  UpdatePosition,
} from "@/api/dashboard/cargos/route";
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
import { PositionTypeWithId, registerPositionSchema } from "@/zodSchemas";
import { zodResolver } from "@hookform/resolvers/zod";
import Cookies from "js-cookie";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { FieldErrors, useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

export default function PositionEditPage() {
  type FormValues = z.infer<typeof registerPositionSchema>;
  const { user } = useUser();
  const userId = user?._id || Cookies.get("user");
  const params = useParams<{ id: string }>();
  const positionId = params?.id;
  const [isLoading, setIsLoading] = useState(false);
  const [position, setPosition] = useState<PositionTypeWithId>();

  const form = useForm<FormValues>({
    resolver: zodResolver(registerPositionSchema),
    defaultValues: {
      positionName: "",
    },
  });

  const fetchPosition = useCallback(async () => {
    try {
      if (!userId) {
        return;
      }
      if (!positionId) {
        return;
      }

      setIsLoading(true);
      const { success, position } = await GetCompanyPositionById(
        userId,
        positionId,
      );

      if (!success) {
        toast.error("Não foi possível carregar o cargo.");
        return;
      }

      if (!position) {
        toast.error("Cargo não encontrado.");
        return;
      }

      setPosition(position);
      form.reset({ positionName: position.positionName ?? "" });
    } catch (error) {
      console.error("Erro ao carregar cargo:", error);
      toast.error("Não foi possível carregar o cargo.");
    } finally {
      setIsLoading(false);
    }
  }, [positionId, form, userId]);

  useEffect(() => {
    fetchPosition();
  }, [fetchPosition]);

  async function onSubmit(values: FormValues) {
    try {
      if (!userId) {
        toast.error("Usuário não identificado.");
        return;
      }
      if (!positionId) {
        toast.error("Cargo inválido.");
        return;
      }

      setIsLoading(true);
      const { success, message } = await UpdatePosition(userId, positionId, {
        positionName: values.positionName,
      });

      if (!success) {
        toast.warning(message);
        return;
      }

      toast.success(message);
      await fetchPosition();
    } catch (error) {
      console.error("Erro ao editar cargo:", error);
      toast.error("Erro ao editar o cargo.");
    } finally {
      setIsLoading(false);
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
            <Link href="/dashboard/cargos">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <h1 className="text-3xl font-bold">
            Editar Cargo {position?.positionName}
          </h1>
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
                <div className="grid gap-4 md:grid-cols-3">
                  <FormField
                    control={form.control}
                    name="positionName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nome do cargo</FormLabel>
                        <FormControl>
                          <Input placeholder="Nome do cargo" {...field} />
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
                    disabled={isLoading}
                  >
                    Salvar
                  </Button>
                  <Button asChild variant="outline" type="reset">
                    <Link href="/dashboard/cargos">Cancelar</Link>
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
