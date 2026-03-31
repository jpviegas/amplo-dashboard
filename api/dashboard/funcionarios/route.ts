import { EmployeeType, EmployeeTypeWithId } from "@/zodSchemas";

export async function GetAllEmployees(
  userId: string | { email: string },
  search?: string,
  status?: "active" | "inactive",
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
  users: (EmployeeTypeWithId & { companyName: string })[];
}> {
  let url = `${process.env.NEXT_PUBLIC_API_URL}/api/auth/`;

  const queryParams = new URLSearchParams();

  // if (company) {
  //   queryParams.append("company", company);
  // }

  if (search) {
    queryParams.append("search", search);
  }

  if (status) {
    queryParams.append("status", status);
  }

  if (page) {
    queryParams.append("page", page);
  }

  if (queryParams.toString()) {
    url += `?${queryParams.toString()}`;
  }

  // const cookieStore = await cookies();
  // const token = cookieStore.get("user")?.value;
  // console.log(token);

  const res = await fetch(url, {
    method: "GET",
    headers: {
      "content-type": "application/json",
      Authorization: `Bearer ${typeof userId === "string" ? userId : userId.email}`,
    },
  });

  const data = await res.json();

  return data;
}

export async function GetCompanyEmployees(
  userId: string | { email: string },
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
  let url = `${process.env.NEXT_PUBLIC_API_URL}/api/auth`;

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
    headers: {
      "content-type": "application/json",
      Authorization: `Bearer ${typeof userId === "string" ? userId : userId.email}`,
    },
  });

  const data = await res.json();

  return data;
}

export async function GetCompanyEmployeeById(
  userId: string | { email: string },
): Promise<{
  success: boolean;
  user: EmployeeTypeWithId;
  message: string;
}> {
  const userIdValue = typeof userId === "string" ? userId : userId.email;
  const url = `${process.env.NEXT_PUBLIC_API_URL}/api/auth/${userIdValue}`;

  const res = await fetch(url, {
    method: "GET",
    headers: {
      "content-type": "application/json",
      Authorization: `Bearer ${userIdValue}`,
    },
  });

  const data = await res.json();
  return data;
}

export async function CreateEmployee(
  userId: string | { email: string },
  values: EmployeeType,
): Promise<{ message: string; success: boolean }> {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/api/auth/register`,
    {
      method: "POST",
      headers: {
        "content-type": "application/json",
        Authorization: `Bearer ${typeof userId === "string" ? userId : userId.email}`,
      },
      body: JSON.stringify(values),
    },
  );

  if (!res) {
    throw new Error("Erro ao cadastrar a funcionário");
  }

  const data = await res.json();
  return data;
}

export async function UpdateEmployee(
  userId: string | { email: string },
  values: EmployeeType,
  id: string,
): Promise<{ message: string; success: boolean }> {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/${id}`, {
    method: "PATCH",
    headers: {
      "content-type": "application/json",
      Authorization: `Bearer ${typeof userId === "string" ? userId : userId.email}`,
    },
    body: JSON.stringify(values),
  });

  if (!res) {
    throw new Error("Erro ao cadastrar a funcionário");
  }

  const data = await res.json();
  return data;
}

export async function DeleteEmployee(
  userId: string | { email: string },
  employeeId: string,
): Promise<{ message: string; success: boolean }> {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/api/auth/${employeeId}`,
    {
      method: "DELETE",
      headers: {
        "content-type": "application/json",
        Authorization: `Bearer ${typeof userId === "string" ? userId : userId.email}`,
      },
    },
  );

  if (!res) {
    throw new Error("Erro ao deletar o funcionário");
  }

  const data = await res.json();
  return data;
}
