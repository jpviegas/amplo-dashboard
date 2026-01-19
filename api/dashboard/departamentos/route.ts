import { DepartmentType, DepartmentTypeWithId } from "@/zodSchemas";

export async function GetAllDepartments(
  userId: string,
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
      Authorization: `Bearer ${userId}`,
    },
  });

  const data = await res.json();
  return data;
}

export async function GetCompanyDepartments(
  userId: string,
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
    queryParams.append("department", department);
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

export async function GetCompanyDepartmentById(
  userId: string,
  department: string,
): Promise<{
  success: boolean;
  departments: DepartmentTypeWithId[];
}> {
  const url = `${process.env.NEXT_PUBLIC_API_URL}/api/departments/${department}`;

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

export async function CreateDepartment(
  userId: string,
  values: DepartmentType,
): Promise<{ success: boolean; message: string }> {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/api/departments`,
    {
      method: "POST",
      headers: {
        "content-type": "application/json",
        Authorization: `Bearer ${userId}`,
      },
      body: JSON.stringify(values),
    },
  );

  if (!res) {
    throw new Error("Erro ao cadastrar o departamento");
  }

  const data = await res.json();
  return data;
}
