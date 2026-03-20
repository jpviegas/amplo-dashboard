import { PositionType, PositionTypeWithId } from "@/zodSchemas";

export async function GetAllPositions(
  userId: string | { email: string },
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
  positions: PositionTypeWithId[];
}> {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/positions/`, {
    method: "GET",
    headers: {
      "content-type": "application/json",
      Authorization: `Bearer ${typeof userId === "string" ? userId : userId.email}`,
    },
  });

  const data = await res.json();
  return data;
}

export async function GetCompanyPositions(
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
    nextPage: null | number;
    prevPage: null | number;
  };
  positions: PositionTypeWithId[];
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
      Authorization: `Bearer ${typeof userId === "string" ? userId : userId.email}`,
    },
  });

  const data = await res.json();
  return data;
}

export async function GetCompanyPositionById(
  userId: string | { email: string },
  position: string,
): Promise<{
  success: boolean;
  position: PositionTypeWithId | null;
}> {
  const url = `${process.env.NEXT_PUBLIC_API_URL}/api/positions/${position}`;

  const res = await fetch(url, {
    method: "GET",
    headers: {
      "content-type": "application/json",
      Authorization: `Bearer ${typeof userId === "string" ? userId : userId.email}`,
    },
  });

  const data = await res.json();
  const normalizedPosition: PositionTypeWithId | null =
    data?.position ??
    (Array.isArray(data?.positions) ? data.positions[0] : data?.positions) ??
    null;

  return {
    ...data,
    position: normalizedPosition,
  };
}

export async function CreatePosition(
  userId: string | { email: string },
  values: PositionType,
): Promise<{ success: boolean; message: string }> {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/positions`, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      Authorization: `Bearer ${typeof userId === "string" ? userId : userId.email}`,
    },
    body: JSON.stringify(values),
  });

  if (!res) {
    throw new Error("Erro ao cadastrar o cargo");
  }

  const data = await res.json();
  return data;
}

export async function UpdatePosition(
  userId: string | { email: string },
  positionId: string,
  values: PositionType,
): Promise<{ success: boolean; message: string }> {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/api/positions/${positionId}`,
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
    throw new Error("Erro ao atualizar o cargo");
  }

  const data = await res.json();
  return data;
}

export async function DeletePosition(
  userId: string | { email: string },
  positionId: string,
): Promise<{ success: boolean; message: string }> {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/api/positions/${positionId}`,
    {
      method: "DELETE",
      headers: {
        "content-type": "application/json",
        Authorization: `Bearer ${typeof userId === "string" ? userId : userId.email}`,
      },
    },
  );

  if (!res) {
    throw new Error("Erro ao deletar o cargo");
  }

  const data = await res.json();
  return data;
}
