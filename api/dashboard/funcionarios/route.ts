import { EmployeeType, EmployeeTypeWithId } from "@/zodSchemas";

export async function GetAllEmployees(
  company: string,
  search?: string,
  page?: string,
): Promise<{
  success: boolean;
  pagination: {
    total: number;
    page: number;
    totalPages: number;
    limit: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
    nextPage: null | number;
    prevPage: null | number;
  };
  employees: (EmployeeTypeWithId & { companyName: string })[];
}> {
  let url = `${process.env.NEXT_PUBLIC_API_URL}/api/employees/`;

  const queryParams = new URLSearchParams();

  if (company) {
    queryParams.append("company", company);
  }

  if (search) {
    queryParams.append("search", search);
  }

  if (page) {
    queryParams.append("page", page);
  }

  if (queryParams.toString()) {
    url += `?${queryParams.toString()}`;
  }

  const res = await fetch(url, {
    method: "GET",
    headers: { "content-type": "application/json" },
  });

  const data = await res.json();
  console.log(data);

  return data;
}

export async function GetCompanyEmployees(
  company: string,
  employee?: string,
  page?: string,
): Promise<{
  success: boolean;
  pagination: {
    total: number;
    page: number;
    totalPages: number;
    limit: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
    nextPage: null | number;
    prevPage: null | number;
  };
  employees: EmployeeTypeWithId[];
}> {
  let url = `${process.env.NEXT_PUBLIC_API_URL}/api/employees/`;

  const queryParams = new URLSearchParams();

  if (company) {
    queryParams.append("company", company);
  }

  if (employee) {
    queryParams.append("name", employee);
  }

  if (page) {
    queryParams.append("page", page);
  }

  if (queryParams.toString()) {
    url += `?${queryParams.toString()}`;
  }

  const res = await fetch(url, {
    method: "GET",
    headers: { "content-type": "application/json" },
  });

  const data = await res.json();
  console.log(data);

  return data;
}

export async function GetCompanyEmployeeById(employee: string): Promise<{
  success: boolean;
  employee: EmployeeTypeWithId;
}> {
  const url = `${process.env.NEXT_PUBLIC_API_URL}/api/employees/${employee}`;

  const res = await fetch(url, {
    method: "GET",
    headers: { "content-type": "application/json" },
  });

  const data = await res.json();
  return data;
}

export async function CreateEmployee(
  values: EmployeeType,
): Promise<{ message: string; success: boolean }> {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/employees`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(values),
  });

  if (!res) {
    throw new Error("Erro ao cadastrar a funcionário");
  }

  const data = await res.json();
  return data;
}

export async function UpdateEmployee(
  values: EmployeeType,
  id: string,
): Promise<{ message: string; success: boolean }> {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/api/employees/${id}`,
    {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(values),
    },
  );

  if (!res) {
    throw new Error("Erro ao cadastrar a funcionário");
  }

  const data = await res.json();
  return data;
}
