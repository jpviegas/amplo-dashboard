import DashboardHeader from "@/components/layout/dashboard/header";
import { Metadata } from "next";
import { CitiesList } from "./citiesList";

export const metadata: Metadata = {
  title: "Cidades - Amplo Serviços",
  description: "Página de cidades da amplo serviços",
};

export default async function CitiesPage() {
  return (
    <main className="container mx-auto flex h-full w-11/12 flex-col justify-evenly gap-8">
      <DashboardHeader title="Cidades" link="cidades/cadastrar" />

      <CitiesList />
    </main>
  );
}
