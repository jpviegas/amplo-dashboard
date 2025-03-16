"use client";

import { createContext } from "react";

export const ColorsContext = createContext("");
//   "bg-[#223954] hover:bg-[#223954]/80 text-[#FFF] hover:text-[#000]";

export default function ColorsProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  return <ColorsContext.Provider value="">{children}</ColorsContext.Provider>;
}
