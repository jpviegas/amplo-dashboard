"use client";

import { CreateHoliday } from "@/api/dashboard/feriados/route";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
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
import { holidaySchema } from "@/zodSchemas";
import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import Cookies from "js-cookie";
import { Calendar as CalendarIcon } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { setTimeout } from "timers";
import { z } from "zod";

export default function NewHolidayForm() {
  const { user } = useUser();
  const userId = user?._id || Cookies.get("user");
  const router = useRouter();
  const [isReturning, setIsReturning] = useState(false);
  const currentYear = new Date().getFullYear();

  type FormValues = z.infer<typeof holidaySchema>;

  const form = useForm<FormValues>({
    resolver: zodResolver(holidaySchema),
    defaultValues: {
      date: "",
      comment: "",
    },
  });

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

  async function onSubmit(values: FormValues) {
    try {
      if (!userId) {
        toast.error("Usuário não identificado.");
        return;
      }

      const { success, message } = await CreateHoliday(userId, values);

      if (!success) {
        toast.warning(message);
      } else {
        toast.success(message);
        setIsReturning(true);
        setTimeout(() => {
          router.push("/dashboard/feriados");
        }, 1000);
      }
    } catch {
      toast.error("Erro ao cadastrar o feriado.");
    }
  }

  return (
    <Form {...form}>
      <form className="space-y-8" onSubmit={form.handleSubmit(onSubmit)}>
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
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        captionLayout="dropdown"
                        fromYear={1900}
                        toYear={currentYear}
                        selected={selectedDate}
                        onSelect={(date) =>
                          field.onChange(date ? format(date, "ddMMyyyy") : "")
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
  );
}
