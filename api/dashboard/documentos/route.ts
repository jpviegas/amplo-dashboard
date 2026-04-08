export async function GetDocuments(
  email: string,
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
    nextPage: number | null;
    prevPage: number | null;
  };
  count: number;
  signers: Array<{
    token: string;
    status: string;
    name: string;
    email: string;
    phone_country: string;
    phone_number: string;
    signed_at: string | null;
  }>;
  // documents: Array<{
  //   userId: string;
  //   userEmail: string;
  //   document_name: string;
  //   token: string;
  //   status: string;
  //   signers: Array<{
  //     token: string;
  //     status: string;
  //     name: string;
  //     email: string;
  //     phone_country: string;
  //     phone_number: string;
  //     signed_at: string | null;
  //   }>;
  // }>;
}> {
  const queryParams = new URLSearchParams();
  queryParams.append("email", email);
  if (page) {
    queryParams.append("page", page);
  }

  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/documents?${queryParams.toString()}`,
    {
      method: "GET",
      headers: {
        "content-type":
          "multipart/form-data; boundary=<calculated when request is sent>",
        Authorization: `Bearer ${email}`,
      },
    },
  );

  const data = await res.json();
  return data;
}

export async function CreateDocuments(
  userId: string | { email: string },
  signers: string[],
  file: Blob,
): Promise<{
  success: boolean;
  message: string;
  data: {
    id: string;
    user_id: string;
    document_name: string;
    token: string;
    status: string;
    signers: Array<{
      token: string;
      status: string;
      name: string;
      email: string;
      phone_country: string;
      phone_number: string;
      signed_at: string | null;
    }>;
  };
}> {
  const userIdValue = typeof userId === "string" ? userId : userId.email;
  const formData = new FormData();
  formData.append("userId", userIdValue);
  for (const signerEmail of signers) {
    formData.append("signers", signerEmail);
  }
  const fileName =
    "name" in file && typeof file.name === "string" ? file.name : "document";
  formData.append("file", file, fileName);

  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/documents/`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${userIdValue}`,
    },
    body: formData,
  });

  const data = await res.json();
  return data;
}
