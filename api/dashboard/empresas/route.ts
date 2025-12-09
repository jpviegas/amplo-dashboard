import { CompanyType, CompanyTypeWithId } from "@/zodSchemas";

export async function GetAllCompanies(
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
    headers: { "content-type": "application/json" },
  });

  const data = await res.json();
  return data;
}

export async function GetCompanyById(
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
    nextPage: number;
    prevPage: null | number;
  };
  companies: CompanyTypeWithId[];
}> {
  let url = `${process.env.NEXT_PUBLIC_API_URL}/api/companies/${company}`;

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
    headers: { "content-type": "application/json" },
  });

  const data = await res.json();
  return data;
}

export async function CreateCompany(
  values: CompanyType,
): Promise<{ message: string; success: boolean }> {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/companies`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(values),
  });

  if (!res) {
    throw new Error("Erro ao cadastrar a empresa");
  }

  const data = await res.json();
  return data;
}
