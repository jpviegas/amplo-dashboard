import { ServiceType } from "@/zodSchemas";

export async function GetAllServices(
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
  services: ServiceType[];
}> {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/services/`, {
    method: "GET",
    headers: {
      "content-type": "application/json",
      Authorization: `Bearer ${typeof userId === "string" ? userId : userId.email}`,
    },
  });

  const data = await res.json();
  return data;
}
