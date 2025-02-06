"use client";

import { useTheme } from "@/contexts/ThemeContext";
import type React from "react";

export const ColorPicker: React.FC = () => {
  const { primaryColor, setPrimaryColor, secondaryColor, setSecondaryColor } =
    useTheme();

  return (
    <div className="mb-4 flex space-x-4">
      <div>
        <label
          htmlFor="primaryColor"
          className="block text-sm font-medium text-gray-700"
        >
          Cor Primária
        </label>
        <input
          type="color"
          id="primaryColor"
          value={primaryColor}
          onChange={(e) => setPrimaryColor(e.target.value)}
          className="mt-1 block w-full"
        />
      </div>
      <div>
        <label
          htmlFor="secondaryColor"
          className="block text-sm font-medium text-gray-700"
        >
          Cor Secundária
        </label>
        <input
          type="color"
          id="secondaryColor"
          value={secondaryColor}
          onChange={(e) => setSecondaryColor(e.target.value)}
          className="mt-1 block w-full"
        />
      </div>
    </div>
  );
};
