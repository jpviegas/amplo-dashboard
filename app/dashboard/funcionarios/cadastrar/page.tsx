import { CadastrarLayout } from "@/components/layout/cadastrar";
import { Metadata } from "next";
import NewEmployeeForm from "./registerEployeeForm";

export const metadata: Metadata = {
  title: "Cadastrar funcionário - Amplo Serviços",
  description: "Página para cadastro de funcionário da amplo serviços",
};

export default async function NewEmployee() {
  return (
    <CadastrarLayout title="Novo Funcionário">
      <NewEmployeeForm />
    </CadastrarLayout>
  );
}
