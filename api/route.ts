import { LoginType } from "@/zodSchemas";

export type UserType = { _id: string; name: string; email: string };

export type GetAllUsersType = {
  success: boolean;
  users: UserType[];
};
export type GetUserType = {
  success: boolean;
  user: UserType;
};

export async function GetAllUsers(): Promise<GetAllUsersType> {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth`, {
    method: "GET",
    headers: { "content-type": "application/json" },
  });

  const data = await res.json();
  return data;
}

export async function GetUserByEmail(email: string): Promise<LoginType[]> {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/api/auth/${email}`,
    {
      method: "GET",
      headers: { "content-type": "application/json" },
    },
  );

  const data = await res.json();
  return data;
}

export async function GetUserById(id: string): Promise<GetUserType> {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/${id}`, {
    method: "GET",
    headers: { "content-type": "application/json" },
  });

  const data = await res.json();
  return data;
}

export async function login(values: LoginType): Promise<{
  message: string;
  success: boolean;
  token: string;
  user: {
    _id: string;
    email: string;
    name: string;
  };
}> {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${values.email}`,
    },
    body: JSON.stringify(values),
  });

  if (!res) {
    throw new Error("Erro ao tentar login");
  }

  const data = await res.json();

  return data;
}

export async function createUser(values: LoginType) {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/api/auth/register`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${values.email}`,
      },
      body: JSON.stringify(values),
    },
  );
  const data = await res.json();

  if (!res.ok) {
    return "Email ou senha incorreto";
  } else {
    return data;
  }
}
