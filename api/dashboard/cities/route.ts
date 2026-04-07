import { CityType, CityTypeWithId } from "@/zodSchemas";

export async function GetAllCities(
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
  cities: CityTypeWithId[];
}> {
  let url = `${process.env.NEXT_PUBLIC_API_URL}/api/cities/`;

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

export async function GetCityById(
  userId: string | { email: string },
  cityId: string,
): Promise<{
  success: boolean;
  city: CityType | null;
}> {
  const url = `${process.env.NEXT_PUBLIC_API_URL}/api/cities/${cityId}`;

  const res = await fetch(url, {
    method: "GET",
    headers: {
      "content-type": "application/json",
      Authorization: `Bearer ${typeof userId === "string" ? userId : userId.email}`,
    },
  });

  const data = await res.json();
  const normalizedCity: CityType | null =
    data?.city ??
    (Array.isArray(data?.cities) ? data.cities[0] : data?.cities) ??
    null;

  return {
    ...data,
    city: normalizedCity,
  };
}

export async function CreateCity(
  userId: string | { email: string },
  values: CityType,
): Promise<{ success: boolean; message: string }> {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/cities`, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      Authorization: `Bearer ${typeof userId === "string" ? userId : userId.email}`,
    },
    body: JSON.stringify(values),
  });

  if (!res) {
    throw new Error("Erro ao cadastrar a cidade");
  }

  const data = await res.json();
  return data;
}

export async function UpdateCity(
  userId: string | { email: string },
  cityId: string,
  values: CityType,
): Promise<{ success: boolean; message: string }> {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/api/cities/${cityId}`,
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
    throw new Error("Erro ao atualizar a cidade");
  }

  const data = await res.json();
  return data;
}

export async function DeleteCity(
  userId: string | { email: string },
  cityId: string,
): Promise<{ success: boolean; message: string }> {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/api/cities/${cityId}`,
    {
      method: "DELETE",
      headers: {
        "content-type": "application/json",
        Authorization: `Bearer ${typeof userId === "string" ? userId : userId.email}`,
      },
    },
  );

  if (!res) {
    throw new Error("Erro ao deletar a cidade");
  }

  const data = await res.json();
  return data;
}
