"use client";

import { useTheme } from "@/contexts/ThemeContext";
import type React from "react";

interface ThemedButtonProps {
  children: React.ReactNode;
  isPrimary?: boolean;
}

export const ThemedButton: React.FC<ThemedButtonProps> = ({
  children,
  isPrimary = true,
}) => {
  const { primaryColor, secondaryColor } = useTheme();

  const buttonStyle = {
    backgroundColor: isPrimary ? primaryColor : secondaryColor,
    color: "white",
    padding: "0.5rem 1rem",
    borderRadius: "0.25rem",
    border: "none",
    cursor: "pointer",
  };

  return <button style={buttonStyle}>{children}</button>;
};
