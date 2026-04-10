import { CadastrarLayout } from "@/components/layout/cadastrar";
import { Metadata } from "next";
import NewHolidayForm from "./holidayForm";

export const metadata: Metadata = {
  title: "Cadastrar feriado - Amplo Serviços",
  description: "Página para cadastro de feriado da amplo serviços",
};

export default async function NewHoliday() {
  return (
    <CadastrarLayout title="Novo Feriado">
      <NewHolidayForm />
    </CadastrarLayout>
  );
}
