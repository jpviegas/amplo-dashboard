import DashboardHeader from "@/components/layout/dashboard/header";
import { Metadata } from "next";
import { DepartmentsList } from "./departmentsList";

export const metadata: Metadata = {
  title: "Departamentos - Amplo Serviços",
  description: "Página de departamentos amplo serviços",
};

export default async function DepartmentPage() {
  return (
    <main className="container mx-auto flex h-full flex-col justify-evenly gap-8">
      <DashboardHeader title="Departamentos" link="departamentos/cadastrar" />

      <DepartmentsList />
    </main>
  );
}
