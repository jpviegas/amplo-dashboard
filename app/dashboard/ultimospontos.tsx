import { api } from "@/api/fake";
import { Card, CardContent, CardTitle } from "@/components/ui/card";

export default async function LastPoints() {
  const data = await api.getEmployeeStartDates();
  return (
    <Card className="w-full p-6 lg:w-2/3">
      <CardTitle>
        <h1 className="border-b-2 text-2xl font-bold">Últimas marcações</h1>
      </CardTitle>
      <CardContent className="flex flex-col gap-4">
        {data.map((employee) => (
          <div key={employee.id} className="flex items-center first:pt-6">
            <p className="w-1/3">{employee.name}</p>
            <p className="bg-primary-foreground rounded-lg px-4 py-2">
              {employee.startDate} - {employee.startTime}
            </p>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
