import { NoticesType, NoticesTypeWithId } from "@/zodSchemas";

export async function GetAllNotices(
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
  notices: NoticesTypeWithId[];
}> {
  let url = `${process.env.NEXT_PUBLIC_API_URL}/api/notices/`;

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
  const normalizedNotices: NoticesTypeWithId[] =
    data?.notices ??
    (Array.isArray(data?.notice) ? data.notice : data?.notice) ??
    [];

  return {
    ...data,
    notices: normalizedNotices,
  };
}

export async function GetNoticeById(
  userId: string | { email: string },
  noticeId: string,
): Promise<{
  success: boolean;
  notice: NoticesTypeWithId | null;
}> {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/api/notices/${noticeId}`,
    {
      method: "GET",
      headers: {
        "content-type": "application/json",
        Authorization: `Bearer ${typeof userId === "string" ? userId : userId.email}`,
      },
    },
  );

  const data = await res.json();
  const normalizedNotice: NoticesTypeWithId | null =
    data?.notice ??
    (Array.isArray(data?.notices) ? data.notices[0] : data?.notices) ??
    null;

  return {
    ...data,
    notice: normalizedNotice,
  };
}

export async function CreateNotice(
  userId: string | { email: string },
  values: NoticesType,
): Promise<{ success: boolean; message: string }> {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/notices`, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      Authorization: `Bearer ${typeof userId === "string" ? userId : userId.email}`,
    },
    body: JSON.stringify(values),
  });

  if (!res) {
    throw new Error("Erro ao cadastrar a notícia");
  }

  const data = await res.json();
  return data;
}

export async function UpdateNotice(
  userId: string | { email: string },
  noticeId: string,
  values: NoticesType,
): Promise<{ success: boolean; message: string }> {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/api/notices/${noticeId}`,
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
    throw new Error("Erro ao atualizar a notícia");
  }

  const data = await res.json();
  return data;
}

export async function DeleteNotice(
  userId: string | { email: string },
  noticeId: string,
): Promise<{ success: boolean; message: string }> {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/api/notices/${noticeId}`,
    {
      method: "DELETE",
      headers: {
        "content-type": "application/json",
        Authorization: `Bearer ${typeof userId === "string" ? userId : userId.email}`,
      },
    },
  );

  if (!res) {
    throw new Error("Erro ao deletar a notícia");
  }

  const data = await res.json();
  return data;
}
