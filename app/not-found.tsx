"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function NotFound() {
  const router = useRouter();

  useEffect(() => {
    const t = window.setTimeout(() => {
      router.push("/dashboard");
    }, 2000);
    return () => window.clearTimeout(t);
  }, [router]);

  return (
    <main className="container flex h-screen w-screen items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <h1 className="text-3xl font-bold">Página não encontrada.</h1>
        <p>Você está sendo redirecionado.</p>
        <div className="flex flex-col items-center gap-4">
          <div className="relative size-16">
            <div className="absolute top-0 left-0 h-full w-full rounded-full border-4"></div>
            <div className="border-amplo-secondary absolute top-0 left-0 h-full w-full animate-spin rounded-full border-4 border-t-transparent"></div>
          </div>

          <div className="text-center">
            <p className="text-sm">Aguarde...</p>
          </div>
        </div>
      </div>
    </main>
  );
}
