import ListarLayout from "@/components/layout/listar";
import { Metadata } from "next";
import { CitiesList } from "./citiesList";

export const metadata: Metadata = {
  title: "Cidades - Amplo Serviços",
  description: "Página de cidades da amplo serviços",
};

export default async function CitiesPage() {
  return (
    <ListarLayout title="Cidades">
      <CitiesList />
    </ListarLayout>
  );
}
