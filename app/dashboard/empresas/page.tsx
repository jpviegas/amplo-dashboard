import ListarLayout from "@/components/layout/listar";
import { Metadata } from "next";
import { CompaniesList } from "./companiesList";

export const metadata: Metadata = {
  title: "Empresas - Amplo Serviços",
  description: "Página de empresas da amplo serviços",
};

export default async function CompaniesPage() {
  return (
    <ListarLayout title="Empresas">
      <CompaniesList />
    </ListarLayout>
  );
}
