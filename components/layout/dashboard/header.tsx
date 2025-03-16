import { Button } from "@/components/ui/button";
import { MoreHorizontal } from "lucide-react";
import Link from "next/link";

export default async function DashboardHeader({
  title,
  link,
}: {
  title: string;
  link: string;
}) {
  return (
    <header className="flex items-center justify-between border-b pb-8">
      <h1 className="flex text-2xl font-semibold">{title}</h1>
      <div className="flex gap-2">
        <Button asChild className="gap-2">
          <Link href={link}>
            <span>+ Adicionar</span>
          </Link>
        </Button>
        <Button variant="ghost" size="icon">
          <MoreHorizontal className="size-4" />
        </Button>
      </div>
    </header>
  );
}
