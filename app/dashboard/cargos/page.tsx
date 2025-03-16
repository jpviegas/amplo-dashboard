import DashboardHeader from "@/components/layout/dashboard/header";
import { Metadata } from "next";
import { RolesList } from "./rolesList";

export const metadata: Metadata = {
  title: "Cargos - Amplo Serviços",
  description: "Página de cargos da amplo serviços",
};

export default async function JobRolesPage() {
  return (
    <main className="container mx-auto flex h-full flex-col justify-evenly gap-8">
      <DashboardHeader title="Cargos" link="cargos/cadastrar" />

      <RolesList />
    </main>
  );
}
