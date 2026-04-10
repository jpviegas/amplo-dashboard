"use client";

import { GetHolidayById, UpdateHoliday } from "@/api/dashboard/feriados/route";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
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
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useUser } from "@/context/UserContext";
import { cn } from "@/lib/utils";
import { HolidayTypeWithId, holidaySchema } from "@/zodSchemas";
import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import Cookies from "js-cookie";
import { ArrowLeft, Calendar as CalendarIcon } from "lucide-react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import { FieldErrors, useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

export default function HolidayEditPage() {
  type FormValues = z.infer<typeof holidaySchema>;
  const { user } = useUser();
  const userId = user?._id || Cookies.get("user");
  const params = useParams<{ id: string }>();
  const rawHolidayId = params?.id;
  const holidayId = useMemo(() => {
    const raw = String(rawHolidayId ?? "");
    const match = raw.match(/[a-f0-9]{24}$/i);
    return match?.[0] ?? rawHolidayId;
  }, [rawHolidayId]);
  const [holiday, setHoliday] = useState<HolidayTypeWithId>();
  const router = useRouter();
  const [isReturning, setIsReturning] = useState(false);
  const currentYear = new Date().getFullYear();

  const toDate = (value: unknown) => {
    if (!value) return undefined;

    if (value instanceof Date) {
      return Number.isNaN(value.getTime()) ? undefined : value;
    }

    const raw = String(value);
    const digits = raw.replace(/\D/g, "");
    if (digits.length === 8) {
      const day = Number(digits.slice(0, 2));
      const month = Number(digits.slice(2, 4));
      const year = Number(digits.slice(4, 8));
      const date = new Date(year, month - 1, day);
      return Number.isNaN(date.getTime()) ? undefined : date;
    }

    if (raw.includes("/")) {
      const parts = raw.split("/");
      if (parts.length === 3) {
        const dd = Number(parts[0]);
        const mm = Number(parts[1]);
        const yyyy = Number(parts[2]);
        const date = new Date(yyyy, mm - 1, dd);
        return Number.isNaN(date.getTime()) ? undefined : date;
      }
    }

    const date = new Date(raw);
    return Number.isNaN(date.getTime()) ? undefined : date;
  };

  const formattedHolidayDate = useMemo(() => {
    const selectedDate = toDate(holiday?.date);
    return selectedDate ? format(selectedDate, "dd/MM/yyyy") : "";
  }, [holiday]);

  const form = useForm<FormValues>({
    resolver: zodResolver(holidaySchema),
    defaultValues: {
      date: "",
      comment: "",
    },
  });

  const fetchHoliday = useCallback(async () => {
    try {
      if (!userId) {
        return;
      }
      if (!holidayId) {
        return;
      }
      const { success, holiday } = await GetHolidayById(userId, holidayId);

      if (!success) {
        toast.error("Não foi possível carregar o feriado.");
        return;
      }

      if (!holiday) {
        toast.error("Feriado não encontrado.");
        return;
      }

      setHoliday(holiday);
      form.reset({
        date: holiday.date ?? "",
        comment: holiday.comment ?? "",
      });
    } catch (error) {
      console.error("Erro ao carregar feriado:", error);
      toast.error("Não foi possível carregar o feriado.");
    }
  }, [holidayId, form, userId]);

  useEffect(() => {
    fetchHoliday();
  }, [fetchHoliday]);

  async function onSubmit(values: FormValues) {
    try {
      if (!userId) {
        toast.error("Usuário não identificado.");
        return;
      }
      if (!holidayId) {
        toast.error("Feriado inválido.");
        return;
      }

      const { success, message } = await UpdateHoliday(
        userId,
        holidayId,
        values,
      );

      if (!success) {
        toast.warning(message);
        return;
      }

      toast.success(message);
      await fetchHoliday();
      setIsReturning(true);
      setTimeout(() => {
        router.push("/dashboard/feriados");
      }, 1000);
    } catch (error) {
      console.error("Erro ao editar feriado:", error);
      toast.error("Erro ao editar o feriado.");
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
            <Link href="/dashboard/feriados">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <h1 className="text-3xl font-bold">
            Editar Feriado {formattedHolidayDate}
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
                    name="date"
                    render={({ field }) => {
                      const selectedDate = toDate(field.value);
                      return (
                        <FormItem>
                          <FormLabel>Data</FormLabel>
                          <Popover>
                            <PopoverTrigger asChild>
                              <FormControl>
                                <Button
                                  type="button"
                                  variant="outline"
                                  className={cn(
                                    "w-full pl-3 text-left font-normal",
                                    !selectedDate && "text-muted-foreground",
                                  )}
                                >
                                  {selectedDate ? (
                                    format(selectedDate, "dd/MM/yyyy")
                                  ) : (
                                    <span>Selecione uma data</span>
                                  )}
                                  <CalendarIcon className="ml-auto size-4" />
                                </Button>
                              </FormControl>
                            </PopoverTrigger>
                            <PopoverContent
                              className="w-auto p-0"
                              align="start"
                            >
                              <Calendar
                                mode="single"
                                captionLayout="dropdown"
                                fromYear={1900}
                                toYear={currentYear}
                                selected={selectedDate}
                                onSelect={(date) =>
                                  field.onChange(
                                    date ? format(date, "ddMMyyyy") : "",
                                  )
                                }
                                initialFocus
                              />
                            </PopoverContent>
                          </Popover>
                          <FormMessage />
                        </FormItem>
                      );
                    }}
                  />
                  <FormField
                    control={form.control}
                    name="comment"
                    render={({ field }) => (
                      <FormItem className="md:col-span-2">
                        <FormLabel>Comentário</FormLabel>
                        <FormControl>
                          <Input placeholder="Ex: Natal" {...field} />
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
