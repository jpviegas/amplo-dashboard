import {
  ManagementEPIType,
  ManagementEPITypeWithId,
  ManagementsTypeWithId,
} from "@/zodSchemas";

export async function GetAllManagements(
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
  managements: ManagementsTypeWithId[];
}> {
  let url = `${process.env.NEXT_PUBLIC_API_URL}/api/managements`;

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

export async function GetManagementById(
  userId: string | { email: string },
  managementId: string,
): Promise<{
  success: boolean;
  management: ManagementEPITypeWithId;
}> {
  const url = `${process.env.NEXT_PUBLIC_API_URL}/api/managements/${managementId}`;

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

export async function CreateManagement(
  userId: string | { email: string },
  values: ManagementEPIType,
): Promise<{ success: boolean; message: string }> {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/api/managements`,
    {
      method: "POST",
      headers: {
        "content-type": "application/json",
        Authorization: `Bearer ${typeof userId === "string" ? userId : userId.email}`,
      },
      body: JSON.stringify(values),
    },
  );

  if (!res) {
    throw new Error("Erro ao cadastrar a gestão de EPI");
  }

  const data = await res.json();
  return data;
}

export async function UpdateManagement(
  userId: string | { email: string },
  managementId: string,
  values: ManagementEPIType,
): Promise<{ success: boolean; message: string }> {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/api/managements/${managementId}`,
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
    throw new Error("Erro ao atualizar a gestão de EPI");
  }

  const data = await res.json();
  return data;
}

export async function DeleteManagement(
  userId: string | { email: string },
  managementId: string,
): Promise<{ success: boolean; message: string }> {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/api/managements/${managementId}`,
    {
      method: "DELETE",
      headers: {
        "content-type": "application/json",
        Authorization: `Bearer ${typeof userId === "string" ? userId : userId.email}`,
      },
    },
  );

  if (!res) {
    throw new Error("Erro ao deletar o management");
  }

  const data = await res.json();
  return data;
}

export async function GetPointsById(
  userId: string | { email: string },
  employeeId: string,
  year?: string,
  month?: string,
): Promise<{
  success: boolean;
  points: unknown[];
}> {
  let url = `${process.env.NEXT_PUBLIC_API_URL}/api/managements/points/user/${employeeId}`;

  const queryParams = new URLSearchParams();
  if (year) queryParams.append("year", year);
  if (month) queryParams.append("month", month);
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
  const normalizedPoints: unknown[] =
    data?.points ??
    data?.managements ??
    (Array.isArray(data?.management) ? data.management : data?.management) ??
    [];

  return { ...data, points: normalizedPoints };
}

export async function UpdatePoint(
  userId: string | { email: string },
  values: {
    userId: string;
    location: { latitude: number; longitude: number };
    type: "rh";
    timestamp: string;
  },
): Promise<{ success: boolean; message: string }> {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/api/timesheet/register`,
    {
      method: "POST",
      headers: {
        "content-type": "application/json",
        Authorization: `Bearer ${typeof userId === "string" ? userId : userId.email}`,
      },
      body: JSON.stringify(values),
    },
  );

  if (!res) {
    throw new Error("Erro ao atualizar o ponto do funcionário");
  }

  const data = await res.json();
  return data;
}
