import React from "react";

interface ApiKeyInputProps {
  label: string;
  value: string;
  onChange: (val: string) => void;
}

const ApiKeyInput = ({ label, value, onChange }: ApiKeyInputProps) => {
  return (
    <div>
      <label className="block text-sm font-medium text-purple-700 mb-1">{label}</label>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full border border-purple-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-purple-400"
        placeholder={`Enter ${label}`}
      />
    </div>
  );
};

export default ApiKeyInput;
