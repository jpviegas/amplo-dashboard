import { clsx, type ClassValue } from "clsx";
import Cookies from "js-cookie";
import { redirect } from "next/navigation";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function Logout() {
  Cookies.remove("token");
  Cookies.remove("userid");
  return redirect("/");
}
