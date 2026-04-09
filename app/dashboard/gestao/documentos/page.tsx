import ListarLayout from "@/components/layout/listar";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "E.P.I. - Amplo Serviços",
  description: "Página de E.P.I. da amplo serviços",
};

export default async function DocumentsPage() {
  return (
    <ListarLayout title="Gestão: Documentos">
      <></>
    </ListarLayout>
  );
}
