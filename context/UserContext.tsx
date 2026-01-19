"use client";

import { UserType } from "@/api/route";
import Cookies from "js-cookie";
import React, { createContext, useContext, useEffect, useState } from "react";

interface UserContextType {
  user: UserType | null;
  setUser: (user: UserType | null) => void;
  fetchUser: (userId: string) => Promise<void>;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<UserType | null>(null);

  const fetchUser = async (userId: string) => {
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/auth/${userId}`,
        {
          method: "GET",
          headers: { "Content-Type": "application/json" },
        },
      );
      const data = await res.json();

      if (res.ok) {
        setUser(data.user);
      } else {
        console.error(data.message);
      }
    } catch (error) {
      console.error("Erro ao buscar usuário:", error);
    }
  };

  useEffect(() => {
    const userId = Cookies.get("user");
    if (userId && !user) {
      fetchUser(userId);
    }
  }, []);

  return (
    <UserContext.Provider value={{ user, setUser, fetchUser }}>
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
