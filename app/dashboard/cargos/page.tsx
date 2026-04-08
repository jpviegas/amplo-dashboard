import ListarLayout from "@/components/layout/listar";
import { Metadata } from "next";
import { PositionsList } from "./positionsList";

export const metadata: Metadata = {
  title: "Cargos - Amplo Serviços",
  description: "Página de cargos da amplo serviços",
};

export default async function PositionsPage() {
  return (
    <ListarLayout title="Cargos">
      <PositionsList />
    </ListarLayout>
  );
}
