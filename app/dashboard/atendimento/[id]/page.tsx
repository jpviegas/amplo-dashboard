"use client";

import {
  GetServiceById,
  UpdateService,
} from "@/api/dashboard/atendimento/route";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useUser } from "@/context/UserContext";
import { zodResolver } from "@hookform/resolvers/zod";
import Cookies from "js-cookie";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

type ServiceDetails = {
  _id: string;
  type: string;
  subject: string;
  text: string;
  status: string;
  name: string;
};

const StatusSchema = z.object({
  status: z.enum(["Pendente", "Aprovado", "Rejeitado"]),
});

export default function ServicePage() {
  const params = useParams<{ id: string }>();
  const rawServiceId = params?.id;
  const serviceId = useMemo(() => {
    const raw = String(rawServiceId ?? "");
    const match = raw.match(/[a-f0-9]{24}$/i);
    return match?.[0] ?? rawServiceId;
  }, [rawServiceId]);
  const { user } = useUser();
  const userId = user?._id || Cookies.get("user");
  const [service, setService] = useState<ServiceDetails | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const router = useRouter();

  const form = useForm<z.infer<typeof StatusSchema>>({
    resolver: zodResolver(StatusSchema),
    defaultValues: { status: "Pendente" },
  });

  const fetchService = useCallback(async () => {
    try {
      if (!userId || !serviceId) return;
      setIsLoading(true);
      const { success, service } = await GetServiceById(userId, serviceId);
      if (!success || !service) {
        toast.error("Não foi possível carregar o atendimento.");
        setService(null);
        return;
      }
      setService(service as ServiceDetails);
      form.reset({ status: service.status });
    } catch (error) {
      console.error("Erro ao carregar atendimento:", error);
      toast.error("Não foi possível carregar o atendimento.");
      setService(null);
    } finally {
      setIsLoading(false);
    }
  }, [form, serviceId, userId]);

  useEffect(() => {
    fetchService();
  }, [fetchService]);

  const onSubmit = async (values: z.infer<typeof StatusSchema>) => {
    try {
      if (!userId || !serviceId) return;
      setIsSaving(true);
      const { success, message } = await UpdateService(userId, serviceId, {
        status: values.status,
      });
      if (!success) {
        toast.warning(message || "Não foi possível atualizar o atendimento.");
        return;
      }
      toast.success(message || "Atendimento atualizado.");
      await fetchService();
      setTimeout(() => {
        router.push("/dashboard/atendimento");
      }, 1000);
    } catch (error) {
      console.error("Erro ao atualizar atendimento:", error);
      toast.error("Não foi possível atualizar o atendimento.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <main className="container mx-auto flex h-full w-11/12 flex-col justify-evenly gap-8">
      <div className="mb-8 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" asChild>
            <Link href="/dashboard/atendimento">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <h1 className="text-3xl font-bold">Atendimento</h1>
        </div>
      </div>

      <div className="mx-auto overflow-x-auto rounded-md border lg:w-[70%]">
        <Card>
          <CardContent className="p-6">
            <div className="space-y-6">
              <div className="text-sm">
                <span className="text-muted-foreground">ID:</span>{" "}
                {serviceId ?? "-"}
              </div>

              {isLoading ? (
                <div className="text-muted-foreground text-sm">
                  Carregando...
                </div>
              ) : service ? (
                <div className="grid gap-4">
                  <div className="grid gap-1">
                    <div className="text-muted-foreground text-xs">Usuário</div>
                    <div className="text-sm">{service.name || "-"}</div>
                  </div>

                  <div className="grid gap-1">
                    <div className="text-muted-foreground text-xs">Assunto</div>
                    <div className="text-sm">{service.subject || "-"}</div>
                  </div>

                  <div className="grid gap-1">
                    <div className="text-muted-foreground text-xs">Tipo</div>
                    <div className="text-sm">{service.type || "-"}</div>
                  </div>

                  <div className="grid gap-1">
                    <div className="text-muted-foreground text-xs">
                      Justificativa
                    </div>
                    <div className="rounded-md border p-3 text-sm">
                      {service.text || "-"}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-muted-foreground text-sm">
                  Atendimento não encontrado.
                </div>
              )}

              <Form {...form}>
                <form
                  className="space-y-4"
                  onSubmit={form.handleSubmit(onSubmit)}
                >
                  <FormField
                    control={form.control}
                    name="status"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Status</FormLabel>
                        <FormControl>
                          <Select
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                            disabled={!service || isLoading || isSaving}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Selecione o status" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Pendente">Pendente</SelectItem>
                              <SelectItem value="Aprovado">Aprovado</SelectItem>
                              <SelectItem value="Rejeitado">
                                Rejeitado
                              </SelectItem>
                            </SelectContent>
                          </Select>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <Button
                    type="submit"
                    disabled={!service || isLoading || isSaving}
                  >
                    {isSaving ? "Salvando..." : "Salvar"}
                  </Button>
                </form>
              </Form>
            </div>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
