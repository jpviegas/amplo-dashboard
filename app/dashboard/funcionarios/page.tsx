import DashboardHeader from "@/components/layout/dashboard/header";
import { Metadata } from "next";
import { EmployeesList } from "./employeesList";

export const metadata: Metadata = {
  title: "Funcionários - Amplo Serviços",
  description: "Página de funcionários da amplo serviços",
};

export default async function EmployeesPage() {
  return (
    <main className="container mx-auto flex h-full flex-col justify-evenly gap-8">
      <DashboardHeader title="Funcionários" link="funcionarios/cadastrar" />

      <EmployeesList />
    </main>
  );
}
