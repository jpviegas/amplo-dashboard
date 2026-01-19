import { EmployeeType, EmployeeTypeWithId } from "@/zodSchemas";

export async function GetAllEmployees(
  userId: string,
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
      Authorization: `Bearer ${userId}`,
    },
  });

  const data = await res.json();

  return data;
}

export async function GetCompanyEmployees(
  userId: string,
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
      Authorization: `Bearer ${userId}`,
    },
  });

  const data = await res.json();

  return data;
}

export async function GetCompanyEmployeeById(userId: string): Promise<{
  success: boolean;
  user: EmployeeTypeWithId;
  message: string;
}> {
  const url = `${process.env.NEXT_PUBLIC_API_URL}/api/auth/${userId}`;

  const res = await fetch(url, {
    method: "GET",
    headers: {
      "content-type": "application/json",
      Authorization: `Bearer ${userId}`,
    },
  });

  const data = await res.json();
  return data;
}

export async function CreateEmployee(
  userId: string,
  values: EmployeeType,
): Promise<{ message: string; success: boolean }> {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth`, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      Authorization: `Bearer ${userId}`,
    },
    body: JSON.stringify(values),
  });

  if (!res) {
    throw new Error("Erro ao cadastrar a funcionário");
  }

  const data = await res.json();
  return data;
}

export async function UpdateEmployee(
  userId: string,
  values: EmployeeType,
  id: string,
): Promise<{ message: string; success: boolean }> {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/${id}`, {
    method: "PATCH",
    headers: {
      "content-type": "application/json",
      Authorization: `Bearer ${userId}`,
    },
    body: JSON.stringify(values),
  });

  if (!res) {
    throw new Error("Erro ao cadastrar a funcionário");
  }

  const data = await res.json();
  return data;
}
