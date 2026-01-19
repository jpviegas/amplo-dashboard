import { RoleType, RoleTypeWithId } from "@/zodSchemas";

export async function GetAllRoles(userId: string): Promise<{
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
  roles: RoleTypeWithId[];
}> {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/roles/`, {
    method: "GET",
    headers: {
      "content-type": "application/json",
      Authorization: `Bearer ${userId}`,
    },
  });

  const data = await res.json();
  return data;
}

export async function GetCompanyRoles(
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
  roles: RoleTypeWithId[];
}> {
  let url = `${process.env.NEXT_PUBLIC_API_URL}/api/positions`;

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

export async function GetCompanyRoleById(
  userId: string,
  role: string,
): Promise<{
  success: boolean;
  roles: RoleTypeWithId;
}> {
  const url = `${process.env.NEXT_PUBLIC_API_URL}/api/positions/${role}`;

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

export async function CreateRole(
  userId: string,
  values: RoleType,
): Promise<{ success: boolean; message: string }> {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/positions`, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      Authorization: `Bearer ${userId}`,
    },
    body: JSON.stringify(values),
  });

  if (!res) {
    throw new Error("Erro ao cadastrar o cargo");
  }

  const data = await res.json();
  return data;
}
