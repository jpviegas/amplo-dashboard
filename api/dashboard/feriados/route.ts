import { HolidayType, HolidayTypeWithId } from "@/zodSchemas";

export async function GetAllHolidays(
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
  holidays: HolidayTypeWithId[];
}> {
  let url = `${process.env.NEXT_PUBLIC_API_URL}/api/holidays/`;

  const queryParams = new URLSearchParams();
  if (search) queryParams.append("search", search);
  if (page) queryParams.append("page", page);
  if (queryParams.toString()) url += `?${queryParams.toString()}`;

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

export async function GetHolidayById(
  userId: string | { email: string },
  holidayId: string,
): Promise<{
  success: boolean;
  holiday: HolidayTypeWithId | null;
}> {
  const url = `${process.env.NEXT_PUBLIC_API_URL}/api/holidays/${holidayId}`;

  const res = await fetch(url, {
    method: "GET",
    headers: {
      "content-type": "application/json",
      Authorization: `Bearer ${typeof userId === "string" ? userId : userId.email}`,
    },
  });

  const data = await res.json();
  const normalizedHoliday: HolidayTypeWithId | null =
    data?.holiday ??
    (Array.isArray(data?.holidays) ? data.holidays[0] : data?.holidays) ??
    null;

  return {
    ...data,
    holiday: normalizedHoliday,
  };
}

export async function CreateHoliday(
  userId: string | { email: string },
  values: HolidayType,
): Promise<{ success: boolean; message: string }> {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/holidays`, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      Authorization: `Bearer ${typeof userId === "string" ? userId : userId.email}`,
    },
    body: JSON.stringify(values),
  });

  if (!res) {
    throw new Error("Erro ao cadastrar o feriado");
  }

  const data = await res.json();
  return data;
}

export async function UpdateHoliday(
  userId: string | { email: string },
  holidayId: string,
  values: HolidayType,
): Promise<{ success: boolean; message: string }> {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/api/holidays/${holidayId}`,
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
    throw new Error("Erro ao atualizar o feriado");
  }

  const data = await res.json();
  return data;
}

export async function DeleteHoliday(
  userId: string | { email: string },
  holidayId: string,
): Promise<{ success: boolean; message: string }> {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/api/holidays/${holidayId}`,
    {
      method: "DELETE",
      headers: {
        "content-type": "application/json",
        Authorization: `Bearer ${typeof userId === "string" ? userId : userId.email}`,
      },
    },
  );

  if (!res) {
    throw new Error("Erro ao deletar o feriado");
  }

  const data = await res.json();
  return data;
}
