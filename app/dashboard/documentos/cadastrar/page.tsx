import { CadastrarLayout } from "@/components/layout/cadastrar";
import { Metadata } from "next";
import RegisterDocumentForm from "./registerDocumentForm";

export const metadata: Metadata = {
  title: "Cadastrar documento - Amplo Serviços",
  description: "Página para cadastro de documento da amplo serviços",
};

export default async function NewDocument() {
  return (
    <CadastrarLayout title="Novo Documento">
      <RegisterDocumentForm />
    </CadastrarLayout>
  );
}
