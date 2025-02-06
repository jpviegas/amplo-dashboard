import { api } from "@/api/fake";

export const LastPoints = async () => {
  const data = await api.getEmployeeStartDates();
  return (
    <div className="flex w-full flex-col gap-8 rounded-lg border p-6 shadow-lg lg:w-2/3">
      <h1 className="border-b-2 text-2xl font-bold">Últimas marcações</h1>
      {data.map((employee) => (
        <div key={employee.id}>
          <p className="flex items-center gap-8 text-balance">
            <span>{employee.name}</span>
            <span className="rounded-lg -bg--secondary-color px-4 py-2">
              {employee.startDate} - {employee.startTime}
            </span>
          </p>
        </div>
      ))}
    </div>
  );
};
