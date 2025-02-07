import { Card, CardContent } from "@/components/ui/card";
import Link from "next/link";

export const QuickPanel = () => {
  return (
    <div className="flex w-full flex-col gap-4 rounded-lg border p-6 shadow-lg lg:w-2/3">
      <h1 className="border-b-2 text-2xl font-bold">Painel rápido</h1>
      <h2>Opções rápidas de navegação pelo sistema</h2>
      <div className="grid grid-cols-2 gap-8 md:grid-cols-3">
        {(
          [
            ["FaUsers", "Funcionários", "dashboard/funcionarios"],
            ["FaRegClock", "Horários", "dashboard/horarios"],
            ["LiaClipboardCheckSolid", "Cartão de ponto", "dashboard/cartao"],
          ] as [string, string, string][]
        ).map(([icon, text, link], index) => (
          <Link href={link} key={index} className="h-28 w-40">
            <Card className="h-full w-full transition-colors duration-200 hover:-text--secondary-color">
              <CardContent className="flex h-full w-full flex-col items-center justify-evenly p-0">
                <div>{icon}</div>
                <div>
                  <p className="text-center">{text}</p>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
};
