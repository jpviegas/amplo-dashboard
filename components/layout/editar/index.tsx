"use client";

import { ReactNode } from "react";

export default function EditarLayout({ children }: { children: ReactNode }) {
  return (
    <main className="container mx-auto flex h-full w-11/12 flex-col justify-evenly gap-8 pt-12">
      {children}
    </main>
  );
}
