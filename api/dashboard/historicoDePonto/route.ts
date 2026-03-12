export async function GetAllPoints(
  userId: string,
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
  points: Array<{
    id?: string;
    name: string;
    timestamp: string;
  }>;
}> {
  let url = `${process.env.NEXT_PUBLIC_API_URL}/api/timesheet/`;

  const queryParams = new URLSearchParams();
  if (page) {
    queryParams.append("page", page);
  }
  if (queryParams.toString()) {
    url += `?${queryParams.toString()}`;
  }

  const res = await fetch(url, {
    method: "GET",
    cache: "no-store",
    headers: {
      "content-type": "application/json",
      Authorization: `Bearer ${userId}`,
    },
  });

  const data = await res.json();
  return data;
}
