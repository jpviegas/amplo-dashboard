import { CadastrarLayout } from "@/components/layout/cadastrar";
import { Metadata } from "next";
import NewDepartmentForm from "./departmentForm";

export const metadata: Metadata = {
  title: "Cadastrar departamento - Amplo Serviços",
  description: "Página para cadastro de departamento da amplo serviços",
};

export default async function NewDepartment() {
  return (
    <CadastrarLayout title="Novo Departamento">
      <NewDepartmentForm />
    </CadastrarLayout>
  );
}
