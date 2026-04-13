import { CadastrarLayout } from "@/components/layout/cadastrar";
import { Metadata } from "next";
import NewNoticeForm from "./noticesForm";

export const metadata: Metadata = {
  title: "Cadastrar notícia - Amplo Serviços",
  description: "Página para cadastro de notícia da amplo serviços",
};

export default async function NewNotice() {
  return (
    <CadastrarLayout title="Nova Notícia">
      <NewNoticeForm />
    </CadastrarLayout>
  );
}
