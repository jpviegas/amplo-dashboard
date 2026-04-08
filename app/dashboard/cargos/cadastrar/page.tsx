import { CadastrarLayout } from "@/components/layout/cadastrar";
import { Metadata } from "next";
import NewPositionForm from "./positionsForm";

export const metadata: Metadata = {
  title: "Cadastrar cargo - Amplo Serviços",
  description: "Página para cadastro de cargo da amplo serviços",
};

export default async function NewPosition() {
  return (
    <CadastrarLayout title="Novo Cargo">
      <NewPositionForm />
    </CadastrarLayout>
  );
}
