import ListarLayout from "@/components/layout/listar";
import { Metadata } from "next";
import { HolidaysList } from "./holidaysList";

export const metadata: Metadata = {
  title: "Feriados - Amplo Serviços",
  description: "Página de feriados da amplo serviços",
};

export default async function HolidaysPage() {
  return (
    <ListarLayout title="Feriados">
      <HolidaysList />
    </ListarLayout>
  );
}
