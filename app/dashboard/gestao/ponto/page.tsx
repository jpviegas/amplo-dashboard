import ListarLayout from "@/components/layout/listar";
import { Metadata } from "next";
import { PointEditForm } from "./pointList";

export const metadata: Metadata = {
  title: "Ponto - Amplo Serviços",
  description: "Página para editar o ponto do funcionário",
};

export default async function PontoPage() {
  return (
    <ListarLayout title="Gestão: Ponto">
      <PointEditForm />
    </ListarLayout>
  );
}
