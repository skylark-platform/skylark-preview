import clsx from "clsx";
import React from "react";

interface InputProps {
  name: string;
  label: string;
  type: React.HTMLInputTypeAttribute;
  value: string;
  className?: string;
  disabled?: boolean;
  onChange: (value: string) => void;
}

export const Input = ({
  name,
  label,
  type,
  value,
  className,
  disabled,
  onChange,
}: InputProps) => (
  <div className={clsx("relative mt-2 w-full", className)}>
    <label
      className="absolute left-2 top-0 -translate-y-1/2 transform text-sm font-medium uppercase text-manatee-500 md:left-3"
      htmlFor={name}
    >
      <span className="bg-white px-2">{label}</span>
    </label>
    <input
      aria-label={name}
      className="form-input w-full rounded-lg border border-gray-200 p-3 text-base text-gray-800 focus:ring-brand-primary"
      name={name}
      type={type}
      value={value}
      disabled={disabled}
      autoComplete="off"
      onChange={(e) => onChange(e.target.value)}
    />
  </div>
);
