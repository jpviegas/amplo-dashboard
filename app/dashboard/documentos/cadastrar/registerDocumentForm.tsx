"use client";

import { CreateDocuments } from "@/api/dashboard/documentos/route";
import { GetAllUsers, GetAllUsersType } from "@/api/route";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useUser } from "@/context/UserContext";
import { zodResolver } from "@hookform/resolvers/zod";
import Cookies from "js-cookie";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { FieldErrors, useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

const uploadDocumentSchema = z.object({
  userId: z.string().min(1, "Usuário não autenticado."),
  signers: z.string().min(1, "Informe pelo menos um email."),
  type: z.string().min(1, "Informe o tipo do documento."),
  file: z
    .custom<File>((value) => value instanceof File, "Selecione um arquivo.")
    .refine(
      (file) =>
        file.type === "application/pdf" ||
        file.name.toLowerCase().endsWith(".pdf"),
      "O arquivo deve ser PDF.",
    ),
});

type UploadDocumentValues = z.infer<typeof uploadDocumentSchema>;

function parseSignerEmails(raw: string): string[] {
  return raw
    .split(/[,;\n]+/g)
    .map((email) => email.trim())
    .filter(Boolean);
}

function validateSignerEmails(emails: string[]): string[] {
  const emailSchema = z.string().email();
  const uniqueEmails = Array.from(new Set(emails.map((e) => e.toLowerCase())));
  return uniqueEmails.filter((email) => !emailSchema.safeParse(email).success);
}

function getCurrentSignerQuery(raw: string): string {
  const lastSeparatorIndex = Math.max(
    raw.lastIndexOf(","),
    raw.lastIndexOf(";"),
    raw.lastIndexOf("\n"),
  );
  return (lastSeparatorIndex >= 0 ? raw.slice(lastSeparatorIndex + 1) : raw)
    .trim()
    .toLowerCase();
}

function mergeSignerEmail(raw: string, email: string): string {
  const nextEmail = email.trim();

  const lastSeparatorIndex = Math.max(
    raw.lastIndexOf(","),
    raw.lastIndexOf(";"),
    raw.lastIndexOf("\n"),
  );

  const head =
    lastSeparatorIndex >= 0 ? raw.slice(0, lastSeparatorIndex + 1) : "";
  const existingEmails = parseSignerEmails(head);
  const merged = Array.from(
    new Set([...existingEmails, nextEmail].map((e) => e.toLowerCase())),
  );
  return merged.join(", ");
}

export default function RegisterDocumentForm() {
  const { user } = useUser();
  const userId = user?._id || Cookies.get("user") || "";
  const [users, setUsers] = useState<GetAllUsersType["users"]>([]);
  const [isUsersLoading, setIsUsersLoading] = useState(false);
  const [isSignerSearchOpen, setIsSignerSearchOpen] = useState(false);
  const [isReturning, setIsReturning] = useState(false);

  const form = useForm<UploadDocumentValues>({
    resolver: zodResolver(uploadDocumentSchema),
    mode: "onChange",
    reValidateMode: "onChange",
    criteriaMode: "firstError",
    defaultValues: {
      userId,
      signers: "",
      type: "",
      file: undefined as unknown as File,
    },
  });

  useEffect(() => {
    if (userId) {
      form.setValue("userId", userId, { shouldDirty: false });
    }
  }, [userId, form]);

  useEffect(() => {
    let isMounted = true;

    async function fetchUsers() {
      try {
        setIsUsersLoading(true);
        const data = await GetAllUsers();
        if (isMounted) {
          setUsers(data.users);
        }
      } catch (error) {
        console.error("Erro ao buscar usuários:", error);
        toast.error("Não foi possível carregar os usuários.");
      } finally {
        if (isMounted) {
          setIsUsersLoading(false);
        }
      }
    }

    fetchUsers();

    return () => {
      isMounted = false;
    };
  }, []);

  const signersValue = form.watch("signers") || "";

  const signerQuery = useMemo(() => {
    return getCurrentSignerQuery(signersValue);
  }, [signersValue]);

  const filteredUsers = useMemo(() => {
    if (!signerQuery) {
      return [];
    }

    return users
      .filter((u) => {
        const name = (u.name || "").toLowerCase();
        const email = (u.email || "").toLowerCase();
        return name.includes(signerQuery) || email.includes(signerQuery);
      })
      .slice(0, 10);
  }, [users, signerQuery]);

  function onInvalid(errors: FieldErrors<UploadDocumentValues>) {
    const messages = Object.values(errors)
      .map((error) => error?.message)
      .filter((message): message is string => Boolean(message));

    const uniqueMessages = Array.from(new Set(messages));
    for (const message of uniqueMessages) {
      toast.error(message);
    }
  }

  async function onSubmit(values: UploadDocumentValues) {
    try {
      const signerEmails = parseSignerEmails(values.signers);
      const invalidEmails = validateSignerEmails(signerEmails);

      if (signerEmails.length === 0) {
        form.setError("signers", { message: "Informe pelo menos um email." });
        toast.error("Informe pelo menos um email.");
        return;
      }

      if (invalidEmails.length > 0) {
        form.setError("signers", {
          message: `Emails inválidos: ${invalidEmails.join(", ")}`,
        });
        toast.error(`Emails inválidos: ${invalidEmails.join(", ")}`);
        return;
      }

      const { success, message } = await CreateDocuments(
        values.userId,
        signerEmails,
        values.file,
      );

      if (!success) {
        toast.error(message || "Não foi possível enviar o documento.");
        return;
      }

      toast.success(message || "Documento enviado com sucesso.");
      setIsReturning(true);
      setTimeout(() => {
        setIsReturning(false);
      }, 1000);
      form.reset({
        userId: values.userId,
        signers: "",
        file: undefined as unknown as File,
      });
    } catch (error) {
      console.error("Erro ao enviar documento:", error);
      toast.error("Não foi possível enviar o documento.");
    }
  }

  return (
    <Form {...form}>
      <form
        className="space-y-6"
        onSubmit={form.handleSubmit(onSubmit, onInvalid)}
      >
        <input type="hidden" {...form.register("userId")} />

        <FormField
          control={form.control}
          name="signers"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Assinantes (emails separados por vírgula)</FormLabel>
              <div className="relative">
                <FormControl>
                  <Input
                    placeholder="Digite um nome ou email"
                    {...field}
                    onChange={(event) => {
                      field.onChange(event);
                      setIsSignerSearchOpen(true);
                    }}
                    onFocus={() => setIsSignerSearchOpen(true)}
                    onBlur={() => {
                      window.setTimeout(() => {
                        setIsSignerSearchOpen(false);
                      }, 150);
                    }}
                  />
                </FormControl>
                {isSignerSearchOpen && signerQuery && (
                  <div className="bg-popover text-popover-foreground absolute top-full z-50 mt-1 w-full overflow-hidden rounded-md border shadow-md">
                    {isUsersLoading ? (
                      <div className="text-muted-foreground p-2 text-sm">
                        Carregando...
                      </div>
                    ) : filteredUsers.length === 0 ? (
                      <div className="text-muted-foreground p-2 text-sm">
                        Nenhum resultado
                      </div>
                    ) : (
                      <div className="max-h-60 overflow-auto">
                        {filteredUsers.map((u) => (
                          <button
                            key={u._id}
                            type="button"
                            className="hover:bg-accent hover:text-accent-foreground w-full px-3 py-2 text-left text-sm"
                            onMouseDown={(e) => {
                              e.preventDefault();
                              const nextValue = mergeSignerEmail(
                                form.getValues("signers"),
                                u.email,
                              );
                              form.setValue("signers", nextValue, {
                                shouldDirty: true,
                                shouldTouch: true,
                                shouldValidate: true,
                              });
                              setIsSignerSearchOpen(false);
                            }}
                          >
                            <div className="font-medium">{u.name}</div>
                            <div className="text-muted-foreground text-xs">
                              {u.email}
                            </div>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="type"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Tipo</FormLabel>
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o tipo do documento" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="codigo_conduta">
                    Código de Conduta
                  </SelectItem>
                  <SelectItem value="contrato">Contrato de Trabalho</SelectItem>
                  <SelectItem value="diversos">Diversos</SelectItem>
                  <SelectItem value="ficha_epi">Ficha EPI</SelectItem>
                  <SelectItem value="ficha_registro">
                    Ficha de Registro
                  </SelectItem>
                  <SelectItem value="politica_interna">
                    Política Interna
                  </SelectItem>
                  <SelectItem value="saude_ocupacional">
                    Saúde Ocupacional
                  </SelectItem>
                  <SelectItem value="termos">Termos</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="file"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Arquivo PDF</FormLabel>
              <FormControl>
                <Input
                  type="file"
                  accept="application/pdf"
                  onChange={(event) => {
                    const selectedFile = event.target.files?.[0];
                    field.onChange(selectedFile);
                  }}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end gap-4">
          <Button
            type="submit"
            disabled={
              form.formState.isSubmitting ||
              !form.formState.isValid ||
              isReturning
            }
          >
            {isReturning
              ? "Voltando..."
              : form.formState.isSubmitting
                ? "Enviando..."
                : "Enviar documento"}
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
