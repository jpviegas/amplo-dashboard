"use client";

import { CreateHour } from "@/api/dashboard/horarios/route";
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
import { registerWorkingHourSchema } from "@/zodSchemas";
import { zodResolver } from "@hookform/resolvers/zod";
import Cookies from "js-cookie";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

export default function RegisterHourForm() {
  type FormValues = z.infer<typeof registerWorkingHourSchema>;
  const { user } = useUser();
  const userId = user?._id || Cookies.get("user");
  const [isReturning, setIsReturning] = useState(false);
  const router = useRouter();

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
            { start: "08:00", end: "12:00" },
            { start: "13:00", end: "17:00" },
          ],
        },
        {
          dayOfWeek: 2,
          ranges: [
            { start: "08:00", end: "12:00" },
            { start: "13:00", end: "17:00" },
          ],
        },
        {
          dayOfWeek: 3,
          ranges: [
            { start: "08:00", end: "12:00" },
            { start: "13:00", end: "17:00" },
          ],
        },
        {
          dayOfWeek: 4,
          ranges: [
            { start: "08:00", end: "12:00" },
            { start: "13:00", end: "17:00" },
          ],
        },
        {
          dayOfWeek: 5,
          ranges: [
            { start: "08:00", end: "12:00" },
            { start: "13:00", end: "17:00" },
          ],
        },
        {
          dayOfWeek: 6,
          ranges: [
            { start: "08:00", end: "12:00" },
            { start: "13:00", end: "17:00" },
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

  async function onSubmit(values: FormValues) {
    try {
      if (!userId) {
        toast.error("Usuário não identificado.");
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

      const { success, message } = await CreateHour(userId, normalizedValues);

      if (!success) {
        toast.warning(message);
        return;
      }

      toast.success(message);
      setIsReturning(true);
      setTimeout(() => {
        router.push("/dashboard/horarios");
      }, 1000);
    } catch {
      toast.error("Não foi possível cadastrar o horário.");
    }
  }

  return (
    <main className="container mx-auto h-full">
      <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-[1fr,300px]">
        <Form {...form}>
          <form className="space-y-8" onSubmit={form.handleSubmit(onSubmit)}>
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
      </div>
    </main>
  );
}
