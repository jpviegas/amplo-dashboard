import { Card, CardContent } from "@/components/ui/card";
import Link from "next/link";
import { FaRegClock, FaUsers } from "react-icons/fa6";
import { LiaClipboardCheckSolid } from "react-icons/lia";

export const QuickPanel = () => {
  return (
    <div className="flex w-full flex-col gap-4 rounded-lg border p-6 shadow-lg lg:w-2/3">
      <h1 className="border-b-2 text-2xl font-bold">Painel rápido</h1>
      <h2>Opções rápidas de navegação pelo sistema</h2>
      <div className="grid grid-cols-2 gap-8 md:grid-cols-3">
        <Link href="dashboard/funcionarios">
          <Card className="hover:bg-se h-24 w-full transition-colors duration-200">
            <CardContent className="flex h-full w-full flex-col items-center justify-evenly p-0">
              <FaUsers className="size-6" />
              <p className="text-center">Funcionários</p>
            </CardContent>
          </Card>
        </Link>
        <Link href="dashboard/horarios">
          <Card className="h-24 w-full transition-colors duration-200 hover:-text--secondary-color">
            <CardContent className="flex h-full w-full flex-col items-center justify-evenly p-0">
              <FaRegClock className="size-6" />
              <p className="text-center">Horários</p>
            </CardContent>
          </Card>
        </Link>
        <Link href="dashboard/cartao">
          <Card className="h-24 w-full transition-colors duration-200 hover:-text--secondary-color">
            <CardContent className="flex h-full w-full flex-col items-center justify-evenly p-0">
              <LiaClipboardCheckSolid className="size-6" />
              <p className="text-center">Cartão de ponto</p>
            </CardContent>
          </Card>
        </Link>
      </div>
    </div>
  );
};
