import DashboardHeader from "@/components/layout/dashboard/header";
import { Metadata } from "next";
import { PositionsList } from "./positionsList";

export const metadata: Metadata = {
  title: "Cargos - Amplo Serviços",
  description: "Página de cargos da amplo serviços",
};

export default async function PositionsPage() {
  return (
    <main className="container mx-auto flex h-full w-11/12 flex-col justify-evenly gap-8">
      <DashboardHeader title="Cargos" link="cargos/cadastrar" />

      <PositionsList />
    </main>
  );
}
