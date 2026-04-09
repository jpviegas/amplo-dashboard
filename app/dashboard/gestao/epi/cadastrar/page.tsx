import { CadastrarLayout } from "@/components/layout/cadastrar";
import { Metadata } from "next";
import { NewManagementEPI } from "./epiForm";

export const metadata: Metadata = {
  title: "Atribuir E.P.I. ao funcionário - Amplo Serviços",
  description:
    "Página para atribuição de E.P.I. a funcionário da amplo serviços",
};

export default async function NewEmployee() {
  return (
    <CadastrarLayout title="Atribuir E.P.I. ao funcionário">
      <NewManagementEPI />
    </CadastrarLayout>
  );
}
