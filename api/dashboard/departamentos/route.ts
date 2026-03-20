import { DepartmentType, DepartmentTypeWithId } from "@/zodSchemas";

export async function GetAllDepartments(
  userId: string | { email: string },
  search?: string,
  page?: string,
): Promise<{
  success: boolean;
  count: number;
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
  departments: DepartmentTypeWithId[];
}> {
  let url = `${process.env.NEXT_PUBLIC_API_URL}/api/deparments`;

  const queryParams = new URLSearchParams();

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
    headers: {
      "content-type": "application/json",
      Authorization: `Bearer ${typeof userId === "string" ? userId : userId.email}`,
    },
  });

  const data = await res.json();
  return data;
}

export async function GetCompanyDepartments(
  userId: string | { email: string },
  company: string,
  department?: string,
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
  departments: DepartmentTypeWithId[];
}> {
  let url = `${process.env.NEXT_PUBLIC_API_URL}/api/departments/`;

  const queryParams = new URLSearchParams();

  if (company) {
    queryParams.append("company", company);
  }

  if (department) {
    queryParams.append("departmentName", department);
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

export async function GetCompanyDepartmentById(
  userId: string | { email: string },
  department: string,
): Promise<{
  success: boolean;
  department: DepartmentTypeWithId;
}> {
  const url = `${process.env.NEXT_PUBLIC_API_URL}/api/departments/${department}`;

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

export async function CreateDepartment(
  userId: string | { email: string },
  values: DepartmentType,
): Promise<{ success: boolean; message: string }> {
  console.log(values);
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/api/departments`,
    {
      method: "POST",
      headers: {
        "content-type": "application/json",
        Authorization: `Bearer ${typeof userId === "string" ? userId : userId.email}`,
      },
      body: JSON.stringify({ departmentName: values.departmentName }),
    },
  );

  if (!res) {
    throw new Error("Erro ao cadastrar o departamento");
  }

  const data = await res.json();
  return data;
}

export async function UpdateDepartment(
  userId: string | { email: string },
  departmentId: string,
  values: DepartmentType,
): Promise<{ success: boolean; message: string }> {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/api/departments/${departmentId}`,
    {
      method: "PATCH",
      headers: {
        "content-type": "application/json",
        Authorization: `Bearer ${typeof userId === "string" ? userId : userId.email}`,
      },
      body: JSON.stringify({ departmentName: values.departmentName }),
    },
  );

  if (!res) {
    throw new Error("Erro ao atualizar o departamento");
  }

  const data = await res.json();
  return data;
}

export async function DeleteDepartment(
  userId: string | { email: string },
  departmentId: string,
): Promise<{ success: boolean; message: string }> {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/api/departments/${departmentId}`,
    {
      method: "DELETE",
      headers: {
        "content-type": "application/json",
        Authorization: `Bearer ${typeof userId === "string" ? userId : userId.email}`,
      },
    },
  );

  if (!res) {
    throw new Error("Erro ao deletar o departamento");
  }

  const data = await res.json();
  return data;
}
