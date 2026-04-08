import { CadastrarLayout } from "@/components/layout/cadastrar";
import { Metadata } from "next";
import RegisterHourForm from "./registerHourForm";

export const metadata: Metadata = {
  title: "Cadastrar horário - Amplo Serviços",
  description: "Página para cadastro de horário da amplo serviços",
};

export default async function NewHour() {
  return (
    <CadastrarLayout title="Novo Horário">
      <RegisterHourForm />
    </CadastrarLayout>
  );
}
