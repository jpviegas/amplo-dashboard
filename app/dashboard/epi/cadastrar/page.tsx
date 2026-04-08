import { CadastrarLayout } from "@/components/layout/cadastrar";
import { Metadata } from "next";
import NewEPIForm from "./epiForm";

export const metadata: Metadata = {
  title: "Cadastrar E.P.I. - Amplo Serviços",
  description: "Página para cadastro de E.P.I. da amplo serviços",
};

export default async function NewEPI() {
  return (
    <CadastrarLayout title="Novo E.P.I.">
      <NewEPIForm />
    </CadastrarLayout>
  );
}
