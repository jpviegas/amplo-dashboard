import { EPIType, EPITypeWithId } from "@/zodSchemas";

export async function GetAllEPIs(
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
  epis: EPITypeWithId[];
}> {
  let url = `${process.env.NEXT_PUBLIC_API_URL}/api/epis/`;

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

export async function GetEPIById(
  userId: string | { email: string },
  epiId: string,
): Promise<{
  success: boolean;
  epi: EPITypeWithId | null;
}> {
  const url = `${process.env.NEXT_PUBLIC_API_URL}/api/epis/${epiId}`;

  const res = await fetch(url, {
    method: "GET",
    headers: {
      "content-type": "application/json",
      Authorization: `Bearer ${typeof userId === "string" ? userId : userId.email}`,
    },
  });

  const data = await res.json();
  const normalizedEPI: EPITypeWithId | null =
    data?.epi ??
    (Array.isArray(data?.epis) ? data.epis[0] : data?.epis) ??
    null;

  return {
    ...data,
    epi: normalizedEPI,
  };
}

export async function CreateEPI(
  userId: string | { email: string },
  values: EPIType,
): Promise<{ success: boolean; message: string }> {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/epis`, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      Authorization: `Bearer ${typeof userId === "string" ? userId : userId.email}`,
    },
    body: JSON.stringify(values),
  });

  if (!res) {
    throw new Error("Erro ao cadastrar o E.P.I.");
  }

  const data = await res.json();
  return data;
}

export async function UpdateEPI(
  userId: string | { email: string },
  epiId: string,
  values: EPIType,
): Promise<{ success: boolean; message: string }> {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/api/epis/${epiId}`,
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
    throw new Error("Erro ao atualizar o E.P.I.");
  }

  const data = await res.json();
  return data;
}

export async function DeleteEPI(
  userId: string | { email: string },
  epiId: string,
): Promise<{ success: boolean; message: string }> {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/api/epis/${epiId}`,
    {
      method: "DELETE",
      headers: {
        "content-type": "application/json",
        Authorization: `Bearer ${typeof userId === "string" ? userId : userId.email}`,
      },
    },
  );

  const data = await res.json();
  return data;
}
