import DashboardHeader from "@/components/layout/dashboard/header";
import { HoursList } from "./hoursList";

export default async function Shift() {
  return (
    <main className="container mx-auto flex h-full flex-col justify-evenly gap-8">
      <DashboardHeader title="Horários" link="horarios/cadastrar" />

      <HoursList />
    </main>
  );
}
