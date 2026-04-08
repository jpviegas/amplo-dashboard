import ListarLayout from "@/components/layout/listar";
import { Metadata } from "next";
import { EmployeesList } from "./employeesList";

export const metadata: Metadata = {
  title: "Funcionários - Amplo Serviços",
  description: "Página de funcionários da amplo serviços",
};

export default async function EmployeesPage() {
  return (
    <ListarLayout title="Funcionários">
      <EmployeesList />
    </ListarLayout>
  );
}
