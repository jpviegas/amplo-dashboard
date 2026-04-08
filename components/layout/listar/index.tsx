"use client";

import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ReactNode, useMemo } from "react";

export default function ListarLayout({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  const pathname = usePathname();
  const link = useMemo(() => {
    const base = pathname.replace(/\/$/, "");
    if (base.endsWith("/cadastrar")) return base;
    return `${base}/cadastrar`;
  }, [pathname]);

  return (
    <main className="container mx-auto flex h-full w-11/12 flex-col justify-evenly gap-8">
      <header className="flex items-center justify-between border-b pb-8">
        <h1 className="flex text-2xl font-semibold">{title}</h1>
        <div className="flex gap-2">
          <Button asChild className="gap-2">
            <Link href={link}>
              <Plus className="size-4" />
              <span>Adicionar</span>
            </Link>
          </Button>
        </div>
      </header>

      {children}
    </main>
  );
}
