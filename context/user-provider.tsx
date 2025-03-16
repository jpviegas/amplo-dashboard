"use client";

import { createContext, useEffect, useState } from "react";

export const UserContext = createContext("");

const [userInfo, setUserInfo] = useState({});
// type UserType = RoleType & { name: string };

useEffect(() => {
  async function GetUserByEmail() {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/user/email`, {
      method: "GET",
      headers: { "content-type": "application/json" },
    });

    const data = await res.json();
    setUserInfo(data);
    return data;
  }
  console.log(userInfo);
}, []);

export default function UserProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  return <UserContext.Provider value="">{children}</UserContext.Provider>;
}
