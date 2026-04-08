import { ServiceType, ServiceTypeWithId } from "@/zodSchemas";

export async function GetAllServices(
  userId: string | { email: string },
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
  services: ServiceType[];
}> {
  let url = `${process.env.NEXT_PUBLIC_API_URL}/api/services/`;

  const queryParams = new URLSearchParams();
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

export async function GetServiceById(
  userId: string | { email: string },
  serviceId: string,
): Promise<{ success: boolean; service: ServiceTypeWithId }> {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/api/services/${serviceId}`,
    {
      method: "GET",
      headers: {
        "content-type": "application/json",
        Authorization: `Bearer ${typeof userId === "string" ? userId : userId.email}`,
      },
    },
  );

  const data = await res.json();
  return data;
}

export async function UpdateService(
  userId: string | { email: string },
  serviceId: string,
  values: Pick<ServiceType, "status">,
): Promise<{ success: boolean; message: string }> {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/api/services/${serviceId}`,
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
    throw new Error("Erro ao atualizar o atendimento");
  }

  const data = await res.json();
  return data;
}
