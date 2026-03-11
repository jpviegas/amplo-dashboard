"use client";

import { CreateDocuments } from "@/api/dashboard/documentos/route";
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
import { useUser } from "@/context/UserContext";
import { zodResolver } from "@hookform/resolvers/zod";
import Cookies from "js-cookie";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

const uploadDocumentSchema = z.object({
  userId: z.string().min(1, "Usuário não autenticado."),
  signers: z.string().min(1, "Informe pelo menos um email."),
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

export default function RegisterDocumentForm() {
  const { user } = useUser();
  const userId = user?._id || Cookies.get("user") || "";

  const form = useForm<UploadDocumentValues>({
    resolver: zodResolver(uploadDocumentSchema),
    defaultValues: {
      userId,
      signers: "",
      file: undefined as unknown as File,
    },
  });

  useEffect(() => {
    if (userId) {
      form.setValue("userId", userId, { shouldDirty: false });
    }
  }, [userId, form]);

  async function onSubmit(values: UploadDocumentValues) {
    try {
      const signerEmails = parseSignerEmails(values.signers);
      const invalidEmails = validateSignerEmails(signerEmails);

      if (signerEmails.length === 0) {
        form.setError("signers", { message: "Informe pelo menos um email." });
        return;
      }

      if (invalidEmails.length > 0) {
        form.setError("signers", {
          message: `Emails inválidos: ${invalidEmails.join(", ")}`,
        });
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
      <form className="space-y-6" onSubmit={form.handleSubmit(onSubmit)}>
        <input type="hidden" {...form.register("userId")} />

        <FormField
          control={form.control}
          name="signers"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Assinantes (emails separados por vírgula)</FormLabel>
              <FormControl>
                <Input
                  placeholder="email1@exemplo.com, email2@exemplo.com"
                  {...field}
                />
              </FormControl>
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

        <div className="flex justify-end">
          <Button type="submit" disabled={form.formState.isSubmitting}>
            Enviar documento
          </Button>
        </div>
      </form>
    </Form>
  );
}
