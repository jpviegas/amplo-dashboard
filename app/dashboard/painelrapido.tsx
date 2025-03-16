import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardTitle,
} from "@/components/ui/card";
import Link from "next/link";
import { FaRegClock, FaUsers } from "react-icons/fa6";
import { LiaClipboardCheckSolid } from "react-icons/lia";

export default async function QuickPanel() {
  return (
    <Card className="flex w-full flex-col gap-4 rounded-lg border p-6 shadow-lg lg:w-2/3">
      <CardTitle>
        <h1 className="border-b-2 text-2xl font-bold">Painel rápido</h1>
      </CardTitle>
      <CardDescription>
        <h2>Opções rápidas de navegação pelo sistema</h2>
      </CardDescription>
      <CardContent className="grid grid-cols-2 gap-8 md:grid-cols-3">
        {[
          {
            icon: FaUsers,
            link: "dashboard/funcionarios",
            title: "Funcionários",
          },
          {
            icon: FaRegClock,
            link: "dashboard/horarios",
            title: "Horários",
          },
          {
            icon: LiaClipboardCheckSolid,
            link: "dashboard/pontos",
            title: "Cartão de ponto",
          },
        ].map((item) => (
          <Button key={item.title} asChild variant="outline" className="h-24">
            <Link href={item.link} className="flex flex-col justify-evenly">
              {<item.icon />}
              <p>{item.title}</p>
            </Link>
          </Button>
        ))}
      </CardContent>
    </Card>
  );
}
