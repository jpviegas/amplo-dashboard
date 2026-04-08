import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft } from "lucide-react";
import { Metadata } from "next";
import Link from "next/link";
import { ComponentType, ReactNode } from "react";

export function CadastrarLayout({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <main className="container mx-auto h-full w-11/12">
      <div className="mb-8 flex items-center justify-between pt-8">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" asChild>
            <Link href=".">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <h1 className="text-3xl font-bold">{title}</h1>
        </div>
      </div>

      <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-[1fr,300px]">
        <Card>
          <CardContent className="p-6">{children}</CardContent>
        </Card>
      </div>
    </main>
  );
}

export function createCadastrarPage({
  metadata,
  title,
  Content,
}: {
  metadata: Metadata;
  title: string;
  backHref: string;
  Content: ComponentType;
}) {
  async function Page() {
    return (
      <CadastrarLayout title={title}>
        <Content />
      </CadastrarLayout>
    );
  }

  return { metadata, Page };
}
