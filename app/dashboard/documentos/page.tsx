import ListarLayout from "@/components/layout/listar";
import { Metadata } from "next";
import { DocumentsList } from "./documentsList";

export const metadata: Metadata = {
  title: "Documentos - Amplo Serviços",
  description: "Página de documentos da amplo serviços",
};

export default async function DocumentsPage() {
  return (
    <ListarLayout title="Documentos">
      <DocumentsList />
    </ListarLayout>
  );
}
