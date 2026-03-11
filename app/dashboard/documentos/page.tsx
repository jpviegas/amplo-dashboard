import DashboardHeader from "@/components/layout/dashboard/header";
import { Metadata } from "next";
import { DocumentsList } from "./documentsList";

export const metadata: Metadata = {
  title: "Documentos - Amplo Serviços",
  description: "Página de documentos da amplo serviços",
};

export default async function DocumentsPage() {
  return (
    <main className="container mx-auto flex h-full w-11/12 flex-col justify-evenly gap-8">
      <DashboardHeader title="Documentos" link="documentos/cadastrar" />
      <DocumentsList />
    </main>
  );
}
