import { Metadata } from "next";
import NewCompanyForm from "./companyForm";

export const metadata: Metadata = {
  title: "Cadastrar empresa - Amplo Serviços",
  description: "Página para cadastro de empresa da amplo serviços",
};

export default async function NewCompany() {
  return <NewCompanyForm />;
}
