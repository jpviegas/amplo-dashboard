"use client";

import {
  GetNoticeById,
  UpdateNotice,
} from "@/api/dashboard/noticias/route";
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
import { NoticesTypeWithId, noticesSchema } from "@/zodSchemas";
import { zodResolver } from "@hookform/resolvers/zod";
import Cookies from "js-cookie";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import { FieldErrors, useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

export default function NoticeEditPage() {
  type FormValues = z.infer<typeof noticesSchema>;
  const { user } = useUser();
  const userId = user?._id || Cookies.get("user");
  const params = useParams<{ id: string }>();
  const rawNoticeId = params?.id;
  const noticeId = useMemo(() => {
    const raw = String(rawNoticeId ?? "");
    const match = raw.match(/[a-f0-9]{24}$/i);
    return match?.[0] ?? rawNoticeId;
  }, [rawNoticeId]);
  const [notice, setNotice] = useState<NoticesTypeWithId>();
  const router = useRouter();
  const [isReturning, setIsReturning] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(noticesSchema),
    defaultValues: {
      title: "",
      subTitle: "",
      notice: "",
    },
  });

  const fetchNotice = useCallback(async () => {
    try {
      if (!userId) {
        return;
      }
      if (!noticeId) {
        return;
      }
      const { success, notice } = await GetNoticeById(userId, noticeId);

      if (!success) {
        toast.error("Não foi possível carregar a notícia.");
        return;
      }

      if (!notice) {
        toast.error("Notícia não encontrada.");
        return;
      }

      setNotice(notice);
      form.reset({
        title: notice.title ?? "",
        subTitle: notice.subTitle ?? "",
        notice: notice.notice ?? "",
      });
    } catch (error) {
      console.error("Erro ao carregar notícia:", error);
      toast.error("Não foi possível carregar a notícia.");
    }
  }, [noticeId, form, userId]);

  useEffect(() => {
    fetchNotice();
  }, [fetchNotice]);

  async function onSubmit(values: FormValues) {
    try {
      if (!userId) {
        toast.error("Usuário não identificado.");
        return;
      }
      if (!noticeId) {
        toast.error("Notícia inválida.");
        return;
      }

      const { success, message } = await UpdateNotice(userId, noticeId, values);

      if (!success) {
        toast.warning(message);
        return;
      }

      toast.success(message);
      await fetchNotice();
      setIsReturning(true);
      setTimeout(() => {
        router.push("/dashboard/noticias");
      }, 1000);
    } catch (error) {
      console.error("Erro ao editar notícia:", error);
      toast.error("Erro ao editar a notícia.");
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
            <Link href="/dashboard/noticias">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <h1 className="text-3xl font-bold">
            Editar Notícia {notice?.title}
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
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
