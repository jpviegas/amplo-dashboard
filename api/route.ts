import { LoginType } from "@/zodSchemas";

export type UserType = { _id: string; name: string; email: string };

export async function GetAllUsers(): Promise<LoginType[]> {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/user`, {
    method: "GET",
    headers: { "content-type": "application/json" },
  });

  const data = await res.json();
  return data;
}

export async function GetUserByEmail(email: string): Promise<LoginType[]> {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/auth/user/${email}`,
    {
      method: "GET",
      headers: { "content-type": "application/json" },
    },
  );

  const data = await res.json();
  return data;
}

export async function GetUserById(
  id: string,
): Promise<{ success: boolean; users: UserType }> {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/auth/user/${id}`,
    {
      method: "GET",
      headers: { "content-type": "application/json" },
    },
  );

  const data = await res.json();
  return data;
}

export async function login(values: LoginType): Promise<{
  message: string;
  success: boolean;
  token: string;
  user: {
    email: string;
    name: string;
    id: string;
  };
}> {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(values),
  });

  if (!res) {
    throw new Error("Erro ao tentar login");
  }

  const data = await res.json();

  return data;
}

export async function createUser(values: LoginType) {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/user`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(values),
  });
  const data = await res.json();

  if (!res.ok) {
    return "Email ou senha incorreto";
  } else {
    return data;
  }
}
