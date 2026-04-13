import { CadastrarLayout } from "@/components/layout/cadastrar";
import { Metadata } from "next";
import { PointEditForm } from "../pointList";

export const metadata: Metadata = {
  title: "Editar ponto - Amplo Serviços",
  description: "Página para o RH editar o ponto do funcionário",
};

export default async function EditPointPage() {
  return (
    <CadastrarLayout title="Editar ponto do funcionário">
      <PointEditForm />
    </CadastrarLayout>
  );
}
