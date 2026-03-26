"use client";

import {
  GetCompanyDepartmentById,
  UpdateDepartment,
} from "@/api/dashboard/departamentos/route";
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
import { DepartmentType, registerDepartmentSchema } from "@/zodSchemas";
import { zodResolver } from "@hookform/resolvers/zod";
import Cookies from "js-cookie";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { FieldErrors, useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

export default function DepartmentEditPage() {
  type FormValues = z.infer<typeof registerDepartmentSchema>;
  const { user } = useUser();
  const userId = user?._id || Cookies.get("user");
  const params = useParams<{ id: string }>();
  const departmentId = params?.id;
  const [isLoading, setIsLoading] = useState(false);
  const [department, setDepartment] = useState<DepartmentType>();
  const router = useRouter();
  const [isReturning, setIsReturning] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(registerDepartmentSchema),
    defaultValues: {
      departmentName: "",
    },
  });

  const fetchDepartment = useCallback(async () => {
    try {
      if (!userId) {
        return;
      }
      if (!departmentId) {
        return;
      }

      setIsLoading(true);
      const { success, department } = await GetCompanyDepartmentById(
        userId,
        departmentId,
      );

      if (!success) {
        toast.error("Não foi possível carregar o departamento.");
        return;
      }

      if (!department) {
        toast.error("Departamento não encontrado.");
        return;
      }

      setDepartment(department);
      form.reset({ departmentName: department.departmentName ?? "" });
    } catch (error) {
      console.error("Erro ao carregar departamento:", error);
      toast.error("Não foi possível carregar o departamento.");
    } finally {
      setIsLoading(false);
    }
  }, [departmentId, form, userId]);

  useEffect(() => {
    fetchDepartment();
  }, [fetchDepartment]);

  async function onSubmit(values: FormValues) {
    try {
      if (!userId) {
        toast.error("Usuário não identificado.");
        return;
      }
      if (!departmentId) {
        toast.error("Departamento inválido.");
        return;
      }

      setIsLoading(true);
      const { success, message } = await UpdateDepartment(
        userId,
        departmentId,
        {
          departmentName: values.departmentName,
        },
      );

      if (!success) {
        toast.warning(message);
        return;
      }

      toast.success(message);
      await fetchDepartment();
      setIsReturning(true);
      setTimeout(() => {
        router.push("/dashboard/departamentos");
      }, 1000);
    } catch (error) {
      console.error("Erro ao editar departamento:", error);
      toast.error("Erro ao editar o departamento.");
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
            <Link href="/dashboard/departamentos">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <h1 className="text-3xl font-bold">
            Editar Departamento {department?.departmentName}
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
                    name="departmentName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nome do departamento</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Nome do departamento"
                            {...field}
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
                    className="cursor-pointer"
                    disabled={isLoading || isReturning}
                  >
                    {isReturning ? "Voltando..." : isLoading ? "Enviando..." : "Salvar"}
                  </Button>
                  <Button
                    asChild
                    variant="outline"
                    type="reset"
                    disabled={isLoading || isReturning}
                  >
                    <Link href="/dashboard/departamentos">Cancelar</Link>
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
