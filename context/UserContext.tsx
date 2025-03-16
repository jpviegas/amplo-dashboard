"use client";

import { UserType } from "@/api/route";
import Cookies from "js-cookie";
import React, { createContext, useContext, useEffect, useState } from "react";

interface UserContextType {
  user: UserType | null;
  fetchUser: (email: string) => Promise<void>;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  useEffect(() => {
    const userid = Cookies.get("userid");
    if (userid) {
      fetchUser(userid);
    }
  }, []);
  const [user, setUser] = useState<UserType | null>(null);

  const fetchUser = async (userid: string) => {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/auth/user/${userid}`,
      {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      },
    );
    const data = await res.json();

    if (res.ok) {
      setUser(data.users);
    } else {
      console.error(data.message);
    }
  };

  return (
    <UserContext.Provider value={{ user, fetchUser }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error("useUser must be used within a UserProvider");
  }
  return context;
};
