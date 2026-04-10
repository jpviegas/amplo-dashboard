"use client";

import { GetHourById, UpdateHour } from "@/api/dashboard/horarios/route";
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
import {
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useUser } from "@/context/UserContext";
import { registerWorkingHourSchema, WorkingHourTypeWithId } from "@/zodSchemas";
import { zodResolver } from "@hookform/resolvers/zod";
import Cookies from "js-cookie";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import { FieldErrors, useForm, useWatch } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

export default function HoursEditPage() {
  type FormValues = z.infer<typeof registerWorkingHourSchema>;
  const { user } = useUser();
  const userId = user?._id || Cookies.get("user");
  const params = useParams<{ id: string }>();
  const rawHourId = params?.id;
  const hourId = useMemo(() => {
    const raw = String(rawHourId ?? "");
    const match = raw.match(/[a-f0-9]{24}$/i);
    return match?.[0] ?? rawHourId;
  }, [rawHourId]);
  const [hour, setHour] = useState<WorkingHourTypeWithId>();
  const router = useRouter();
  const [isReturning, setIsReturning] = useState(false);

  const orderedDays = useMemo(() => [1, 2, 3, 4, 5, 6, 0], []);
  const dayLabelByDayOfWeek = useMemo(() => {
    return new Map<number, string>([
      [1, "2a feira"],
      [2, "3a feira"],
      [3, "4a feira"],
      [4, "5a feira"],
      [5, "6a feira"],
      [6, "Sábado"],
      [0, "Domingo"],
    ]);
  }, []);

  const parseTimeToMinutes = (value?: string) => {
    const raw = String(value ?? "");
    const match = raw.match(/^(\d{2}):(\d{2})$/);
    if (!match) return null;
    const hours = Number(match[1]);
    const minutes = Number(match[2]);
    if (!Number.isFinite(hours) || !Number.isFinite(minutes)) return null;
    return hours * 60 + minutes;
  };

  const formatMinutes = (minutes: number) => {
    const safe = Math.max(0, Math.floor(minutes));
    const h = Math.floor(safe / 60);
    const m = safe % 60;
    return `${h}:${String(m).padStart(2, "0")}`;
  };

  const form = useForm<FormValues>({
    resolver: zodResolver(registerWorkingHourSchema),
    defaultValues: {
      name: "",
      days: [
        {
          dayOfWeek: 0,
          ranges: [
            { start: "", end: "" },
            { start: "", end: "" },
          ],
        },
        {
          dayOfWeek: 1,
          ranges: [
            { start: "", end: "" },
            { start: "", end: "" },
          ],
        },
        {
          dayOfWeek: 2,
          ranges: [
            { start: "", end: "" },
            { start: "", end: "" },
          ],
        },
        {
          dayOfWeek: 3,
          ranges: [
            { start: "", end: "" },
            { start: "", end: "" },
          ],
        },
        {
          dayOfWeek: 4,
          ranges: [
            { start: "", end: "" },
            { start: "", end: "" },
          ],
        },
        {
          dayOfWeek: 5,
          ranges: [
            { start: "", end: "" },
            { start: "", end: "" },
          ],
        },
        {
          dayOfWeek: 6,
          ranges: [
            { start: "", end: "" },
            { start: "", end: "" },
          ],
        },
      ],
    },
  });

  const watchedDays = useWatch({ control: form.control, name: "days" });
  const weekTotalMinutes = useMemo(() => {
    const days = watchedDays ?? [];
    return orderedDays.reduce((acc, dayOfWeek) => {
      const day = days[dayOfWeek];
      const ranges = day?.ranges ?? [];
      const r1 = ranges[0] ?? { start: "", end: "" };
      const r2 = ranges[1] ?? { start: "", end: "" };

      const r1Start = parseTimeToMinutes(r1.start);
      const r1End = parseTimeToMinutes(r1.end);
      const r2Start = parseTimeToMinutes(r2.start);
      const r2End = parseTimeToMinutes(r2.end);

      const dayTotal =
        (r1Start !== null && r1End !== null && r1End > r1Start
          ? r1End - r1Start
          : 0) +
        (r2Start !== null && r2End !== null && r2End > r2Start
          ? r2End - r2Start
          : 0);

      return acc + dayTotal;
    }, 0);
  }, [orderedDays, watchedDays]);

  const normalizeDays = useCallback((days?: FormValues["days"]) => {
    const fallback: FormValues["days"] = [
      {
        dayOfWeek: 0,
        ranges: [
          { start: "", end: "" },
          { start: "", end: "" },
        ],
      },
      {
        dayOfWeek: 1,
        ranges: [
          { start: "", end: "" },
          { start: "", end: "" },
        ],
      },
      {
        dayOfWeek: 2,
        ranges: [
          { start: "", end: "" },
          { start: "", end: "" },
        ],
      },
      {
        dayOfWeek: 3,
        ranges: [
          { start: "", end: "" },
          { start: "", end: "" },
        ],
      },
      {
        dayOfWeek: 4,
        ranges: [
          { start: "", end: "" },
          { start: "", end: "" },
        ],
      },
      {
        dayOfWeek: 5,
        ranges: [
          { start: "", end: "" },
          { start: "", end: "" },
        ],
      },
      {
        dayOfWeek: 6,
        ranges: [
          { start: "", end: "" },
          { start: "", end: "" },
        ],
      },
    ];

    if (!Array.isArray(days) || days.length !== 7) return fallback;

    const byDay = new Map<number, FormValues["days"][number]>();
    for (const item of days) {
      if (typeof item?.dayOfWeek === "number") {
        const ranges = Array.isArray(item.ranges) ? item.ranges : [];
        byDay.set(item.dayOfWeek, {
          dayOfWeek: item.dayOfWeek,
          ranges: [
            ranges[0] ?? { start: "", end: "" },
            ranges[1] ?? { start: "", end: "" },
          ],
        });
      }
    }

    return fallback.map((d) => byDay.get(d.dayOfWeek) ?? d);
  }, []);

  const fetchHour = useCallback(async () => {
    try {
      if (!userId) {
        return;
      }
      if (!hourId) {
        return;
      }
      const { success, hour } = await GetHourById(userId, hourId);

      if (!success) {
        toast.error("Não foi possível carregar o horário.");
        return;
      }

      if (!hour) {
        toast.error("Horário não encontrado.");
        return;
      }

      setHour(hour);
      form.reset({
        name: hour.name ?? "",
        days: normalizeDays(hour.days as FormValues["days"]),
      });
    } catch (error) {
      console.error("Erro ao carregar horário:", error);
      toast.error("Não foi possível carregar o horário.");
    }
  }, [hourId, form, userId, normalizeDays]);

  useEffect(() => {
    fetchHour();
  }, [fetchHour]);

  async function onSubmit(values: FormValues) {
    try {
      if (!userId) {
        toast.error("Usuário não identificado.");
        return;
      }
      if (!hourId) {
        toast.error("Horário inválido.");
        return;
      }

      const normalizedValues: FormValues = {
        ...values,
        days: values.days.map((day) => ({
          ...day,
          ranges: (day.ranges ?? []).filter(
            (range) => Boolean(range?.start) && Boolean(range?.end),
          ),
        })),
      };

      const { success, message } = await UpdateHour(
        userId,
        hourId,
        normalizedValues,
      );

      if (!success) {
        toast.warning(message);
        return;
      }

      toast.success(message);
      await fetchHour();
      setIsReturning(true);
      setTimeout(() => {
        router.push("/dashboard/horarios");
      }, 1000);
    } catch (error) {
      console.error("Erro ao editar horário:", error);
      toast.error("Erro ao editar o horário.");
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
    <main className="container mx-auto h-full pt-8">
      <div className="mb-8 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" asChild>
            <Link href="/dashboard/horarios">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <h1 className="text-3xl font-bold">
            Editar Horário {hour?.name ?? ""}
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
                <div className="grid gap-4">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nome</FormLabel>
                        <FormControl>
                          <Input placeholder="Ex: Horário padrão" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="rounded-md border">
                  <Table className="table-fixed">
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-[20%]">Dia</TableHead>
                        <TableHead className="w-[13%] text-center">
                          Entrada 1
                        </TableHead>
                        <TableHead className="w-[13%] text-center">
                          Saída 1
                        </TableHead>
                        <TableHead className="w-[13%] text-center">
                          Entrada 2
                        </TableHead>
                        <TableHead className="w-[13%] text-center">
                          Saída 2
                        </TableHead>
                        <TableHead className="w-[10%] text-right">
                          Total
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {orderedDays.map((dayOfWeek) => {
                        const ranges =
                          form.watch(`days.${dayOfWeek}.ranges`) ?? [];
                        const r1 = ranges[0] ?? { start: "", end: "" };
                        const r2 = ranges[1] ?? { start: "", end: "" };

                        const r1Start = parseTimeToMinutes(r1.start);
                        const r1End = parseTimeToMinutes(r1.end);
                        const r2Start = parseTimeToMinutes(r2.start);
                        const r2End = parseTimeToMinutes(r2.end);

                        const dayTotal =
                          (r1Start !== null && r1End !== null && r1End > r1Start
                            ? r1End - r1Start
                            : 0) +
                          (r2Start !== null && r2End !== null && r2End > r2Start
                            ? r2End - r2Start
                            : 0);

                        return (
                          <TableRow key={dayOfWeek}>
                            <TableCell className="font-medium">
                              {dayLabelByDayOfWeek.get(dayOfWeek) ?? "-"}
                            </TableCell>
                            <TableCell>
                              <FormField
                                control={form.control}
                                name={`days.${dayOfWeek}.ranges.0.start`}
                                render={({ field }) => (
                                  <FormItem>
                                    <FormControl>
                                      <Input type="time" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                            </TableCell>
                            <TableCell>
                              <FormField
                                control={form.control}
                                name={`days.${dayOfWeek}.ranges.0.end`}
                                render={({ field }) => (
                                  <FormItem>
                                    <FormControl>
                                      <Input type="time" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                            </TableCell>
                            <TableCell>
                              <FormField
                                control={form.control}
                                name={`days.${dayOfWeek}.ranges.1.start`}
                                render={({ field }) => (
                                  <FormItem>
                                    <FormControl>
                                      <Input type="time" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                            </TableCell>
                            <TableCell>
                              <FormField
                                control={form.control}
                                name={`days.${dayOfWeek}.ranges.1.end`}
                                render={({ field }) => (
                                  <FormItem>
                                    <FormControl>
                                      <Input type="time" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                            </TableCell>
                            <TableCell className="text-right">
                              {formatMinutes(dayTotal)}
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                    <TableFooter>
                      <TableRow>
                        <TableCell className="font-semibold">Total</TableCell>
                        <TableCell colSpan={4} />
                        <TableCell className="text-right font-semibold">
                          {formatMinutes(weekTotalMinutes)}
                        </TableCell>
                      </TableRow>
                    </TableFooter>
                  </Table>
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
