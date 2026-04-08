import { CadastrarLayout } from "@/components/layout/cadastrar";
import { Metadata } from "next";
import NewTrainingForm from "./TrainingForm";

export const metadata: Metadata = {
  title: "Cadastrar treinamento - Amplo Serviços",
  description: "Página para cadastro de treinamento da amplo serviços",
};

export default async function NewTraining() {
  return (
    <CadastrarLayout title="Novo Treinamento">
      <NewTrainingForm />
    </CadastrarLayout>
  );
}
