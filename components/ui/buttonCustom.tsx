import { ColorsContext } from "@/context/colors-provider";
import { ButtonHTMLAttributes, useContext } from "react";

export function ButtonCustom({
  children,
  className = "",

  ...props
}: ButtonHTMLAttributes<HTMLButtonElement>) {
  const colors = useContext(ColorsContext);

  return (
    <button className={`${colors} ${className}`} {...props}>
      {children}
    </button>
  );
}
