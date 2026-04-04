import { CompanyType, CompanyTypeWithId } from "@/zodSchemas";

export async function GetAllCompanies(
  userId: string | { email: string },
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
    nextPage: number;
    prevPage: null | number;
  };
  companies: CompanyTypeWithId[];
}> {
  let url = `${process.env.NEXT_PUBLIC_API_URL}/api/companies`;

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

export async function GetCompanyById(
  userId: string | { email: string },
  company: string,
): Promise<{
  success: boolean;
  company: CompanyTypeWithId;
}> {
  const url = `${process.env.NEXT_PUBLIC_API_URL}/api/companies/${company}`;

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

export async function CreateCompany(
  userId: string | { email: string },
  values: CompanyType,
): Promise<{ message: string; success: boolean }> {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/companies`, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      Authorization: `Bearer ${typeof userId === "string" ? userId : userId.email}`,
    },
    body: JSON.stringify(values),
  });

  if (!res) {
    throw new Error("Erro ao cadastrar a empresa");
  }

  const data = await res.json();
  return data;
}

export async function UpdateCompany(
  userId: string | { email: string },
  companyId: string,
  values: CompanyType,
): Promise<{ success: boolean; message: string }> {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/api/companies/${companyId}`,
    {
      method: "PATCH",
      headers: {
        "content-type": "application/json",
        Authorization: `Bearer ${typeof userId === "string" ? userId : userId.email}`,
      },
      body: JSON.stringify(values),
    },
  );

  if (!res) {
    throw new Error("Erro ao atualizar a empresa");
  }

  const data = await res.json();
  return data;
}

export async function DeleteCompany(
  userId: string | { email: string },
  companyId: string,
): Promise<{ success: boolean; message: string }> {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/api/companies/${companyId}`,
    {
      method: "DELETE",
      headers: {
        "content-type": "application/json",
        Authorization: `Bearer ${typeof userId === "string" ? userId : userId.email}`,
      },
    },
  );

  if (!res) {
    throw new Error("Erro ao deletar a empresa");
  }

  const data = await res.json();
  return data;
}
