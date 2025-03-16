"use client";

import { Card, CardContent } from "@/components/ui/card";
import NewDepartmentForm from "./departmentForm";

export default function Department() {
  return (
    <main className="container mx-auto h-full">
      <div className="flex items-center justify-between">
        <h1 className="mt-8 text-3xl font-bold">Novo Departamento</h1>
      </div>
      <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-[1fr,300px]">
        <Card>
          <CardContent className="p-6">
            <NewDepartmentForm />
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
