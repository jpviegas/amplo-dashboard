import DashboardHeader from "@/components/layout/dashboard/header";
import { Metadata } from "next";
import { CompaniesList } from "./companiesList";

export const metadata: Metadata = {
  title: "Empresas - Amplo Serviços",
  description: "Página de empresas da amplo serviços",
};

export default async function CompaniesPage() {
  return (
    <main className="container mx-auto flex h-full w-11/12 flex-col justify-evenly gap-8 pt-8">
      <DashboardHeader title="Empresas" link="empresas/cadastrar" />

      <CompaniesList />
    </main>
  );
}
