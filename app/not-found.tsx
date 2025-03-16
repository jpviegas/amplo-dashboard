import { Button } from "@/components/ui/button";
import Link from "next/link";

export default async function NotFound() {
  return (
    <main className="container flex h-screen w-screen items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <h2>404 Not Found</h2>
        <p>Could not find requested resource</p>
        <Link href="/">
          <Button>Voltar</Button>
        </Link>
      </div>
    </main>
  );
}
