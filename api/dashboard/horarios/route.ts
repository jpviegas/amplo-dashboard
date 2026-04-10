import { WorkingHourType, WorkingHourTypeWithId } from "@/zodSchemas";

export async function GetAllHours(
  userId: string | { email: string },
  hour?: string,
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
  hours: WorkingHourTypeWithId[];
}> {
  let url = `${process.env.NEXT_PUBLIC_API_URL}/api/hours/`;

  const queryParams = new URLSearchParams();

  if (hour) {
    queryParams.append("hour", hour);
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
  if (!Array.isArray(data?.hours) && Array.isArray(data?.roles)) {
    return { ...data, hours: data.roles };
  }
  return data;
}

export async function GetCompanyHours(
  userId: string | { email: string },
  company: string,
  hour?: string,
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
  hours: WorkingHourTypeWithId[];
}> {
  let url = `${process.env.NEXT_PUBLIC_API_URL}/api/hours/${company}`;

  const queryParams = new URLSearchParams();

  if (hour) {
    queryParams.append("hour", hour);
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

export async function GetHourById(
  userId: string | { email: string },
  hourId: string,
): Promise<{
  success: boolean;
  hour: WorkingHourTypeWithId | null;
}> {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/hours/${hourId}`, {
    method: "GET",
    headers: {
      "content-type": "application/json",
      Authorization: `Bearer ${typeof userId === "string" ? userId : userId.email}`,
    },
  });

  const data = await res.json();
  const normalizedHour: WorkingHourTypeWithId | null =
    data?.hour ??
    (Array.isArray(data?.hours) ? data.hours[0] : data?.hours) ??
    null;

  return {
    ...data,
    hour: normalizedHour,
  };
}

export async function CreateHour(
  userId: string | { email: string },
  values: WorkingHourType,
): Promise<{ message: string; success: boolean }> {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/hours`, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      Authorization: `Bearer ${typeof userId === "string" ? userId : userId.email}`,
    },
    body: JSON.stringify(values),
  });

  if (!res) {
    throw new Error("Erro ao cadastrar o horário");
  }

  const data = await res.json();
  return data;
}

export async function UpdateHour(
  userId: string | { email: string },
  hourId: string,
  values: WorkingHourType,
): Promise<{ success: boolean; message: string }> {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/api/hours/${hourId}`,
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
    throw new Error("Erro ao atualizar o horário");
  }

  const data = await res.json();
  return data;
}

export async function DeleteHour(
  userId: string | { email: string },
  hourId: string,
): Promise<{ success: boolean; message: string }> {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/api/hours/${hourId}`,
    {
      method: "DELETE",
      headers: {
        "content-type": "application/json",
        Authorization: `Bearer ${typeof userId === "string" ? userId : userId.email}`,
      },
    },
  );

  if (!res) {
    throw new Error("Erro ao deletar o horário");
  }

  const data = await res.json();
  return data;
}
