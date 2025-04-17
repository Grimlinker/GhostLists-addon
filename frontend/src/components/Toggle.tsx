import React from "react";

interface ToggleProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
}

export const Toggle = ({ checked, onChange, disabled = false }: ToggleProps) => (
  <button
    type="button"
    onClick={() => !disabled && onChange(!checked)}
    disabled={disabled}
    className={`w-10 h-5 flex items-center rounded-full p-1 transition-colors ${
      checked ? "bg-purple-600" : "bg-gray-300"
    } ${disabled ? "opacity-50 cursor-not-allowed" : ""}`}
    role="switch"
    aria-checked={checked}
  >
    <span
      className={`bg-white w-4 h-4 rounded-full shadow transform transition-transform ${
        checked ? "translate-x-5" : ""
      }`}
    />
  </button>
);
