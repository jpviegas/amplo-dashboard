import { CadastrarLayout } from "@/components/layout/cadastrar";
import { Metadata } from "next";
import NewCityForm from "./citiesForm";

export const metadata: Metadata = {
  title: "Cadastrar cidade - Amplo Serviços",
  description: "Página para cadastro de cidade da amplo serviços",
};

export default async function NewCity() {
  return (
    <CadastrarLayout title="Novo Cidade">
      <NewCityForm />
    </CadastrarLayout>
  );
}
