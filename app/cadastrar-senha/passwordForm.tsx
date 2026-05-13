"use client";

import { ConsumePasswordToken, ValidatePasswordToken } from "@/api/route";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, EyeOff, LoaderCircleIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import * as z from "zod";

const firstAccessPasswordSchema = z
  .object({
    newPassword: z.string().min(8, "A senha deve ter no mínimo 8 caracteres"),
    confirmNewPassword: z
      .string()
      .min(8, "A confirmação deve ter no mínimo 8 caracteres"),
  })
  .refine((data) => data.newPassword === data.confirmNewPassword, {
    message: "As senhas não conferem",
    path: ["confirmNewPassword"],
  });

export function PasswordForm({ token }: { token: string }) {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [isValidating, setIsValidating] = useState(true);
  const [isTokenValid, setIsTokenValid] = useState(false);
  const [tokenMessage, setTokenMessage] = useState<string>("");

  const form = useForm<z.infer<typeof firstAccessPasswordSchema>>({
    resolver: zodResolver(firstAccessPasswordSchema),
    defaultValues: {
      newPassword: "",
      confirmNewPassword: "",
    },
  });

  const normalizedToken = useMemo(() => String(token ?? "").trim(), [token]);

  useEffect(() => {
    let isMounted = true;

    async function validate() {
      setIsValidating(true);
      setTokenMessage("");

      if (!normalizedToken) {
        setIsTokenValid(false);
        setTokenMessage("Token inválido.");
        setIsValidating(false);
        return;
      }

      try {
        const { success, message } = await ValidatePasswordToken({
          token: normalizedToken,
          type: "first-access",
        });

        if (!isMounted) return;
        setIsTokenValid(Boolean(success));
        setTokenMessage(message);
      } catch {
        if (!isMounted) return;
        setIsTokenValid(false);
        setTokenMessage("Não foi possível validar o token.");
      } finally {
        if (!isMounted) return;
        setIsValidating(false);
      }
    }

    validate();

    return () => {
      isMounted = false;
    };
  }, [normalizedToken]);

  async function onSubmit(values: z.infer<typeof firstAccessPasswordSchema>) {
    try {
      const { success, message } = await ConsumePasswordToken({
        token: normalizedToken,
        type: "first-access",
        newPassword: values.newPassword,
      });

      if (!success) {
        toast.error(message || "Não foi possível criar a senha.");
        return;
      }

      toast.success(message || "Senha criada com sucesso.");
      router.push("/");
    } catch {
      toast.error("Ocorreu um erro.");
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-center text-2xl">Criar nova senha</CardTitle>
        <CardDescription>Primeiro acesso ao sistema.</CardDescription>
      </CardHeader>
      <CardContent>
        {isValidating ? (
          <div className="space-y-4">
            <div className="text-muted-foreground flex items-center justify-center gap-2 text-sm">
              Validando token...
              <LoaderCircleIcon className="size-4 animate-spin" />
            </div>
          </div>
        ) : !isTokenValid ? (
          <div className="space-y-4">
            <p className="text-destructive text-sm">
              {tokenMessage || "Token inválido ou expirado."}
            </p>
            <Button
              type="button"
              className="w-full"
              onClick={() => router.push("/")}
            >
              Voltar
            </Button>
          </div>
        ) : (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {tokenMessage ? (
                <p className="text-muted-foreground text-sm">{tokenMessage}</p>
              ) : null}

              <FormField
                control={form.control}
                name="newPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nova senha</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input
                          placeholder="Digite sua nova senha"
                          type={showPassword ? "text" : "password"}
                          required
                          disabled={form.formState.isSubmitting}
                          {...field}
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute top-1/2 right-3 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                        >
                          {showPassword ? (
                            <EyeOff className="size-4 hover:cursor-pointer" />
                          ) : (
                            <Eye className="size-4 hover:cursor-pointer" />
                          )}
                        </button>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="confirmNewPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Confirmar nova senha</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Repita sua nova senha"
                        type={showPassword ? "text" : "password"}
                        required
                        disabled={form.formState.isSubmitting}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="space-y-2">
                <Label>Token</Label>
                <Input value={normalizedToken} disabled />
              </div>

              <Button
                type="submit"
                className="w-full"
                disabled={form.formState.isSubmitting}
              >
                {form.formState.isSubmitting ? (
                  <>
                    Salvando...
                    <LoaderCircleIcon className="animate-spin" />
                  </>
                ) : (
                  "Criar senha"
                )}
              </Button>
            </form>
          </Form>
        )}
      </CardContent>
    </Card>
  );
}
