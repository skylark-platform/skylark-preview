import clsx from "clsx";
import React from "react";
import { CgSpinner } from "react-icons/cg";

interface ButtonProps {
  children: React.ReactNode;
  disabled?: boolean;
  className?: string;
  success?: boolean;
  danger?: boolean;
  loading?: boolean;
  onClick?: () => void;
}

export const Button = ({
  children,
  className,
  disabled,
  success,
  danger,
  loading,
  onClick,
}: ButtonProps) => (
  <button
    className={clsx(
      "flex items-center rounded px-3 py-2 disabled:bg-manatee-500",
      success && "bg-success text-success-content",
      danger && "bg-error text-white",
      !success && !danger && "bg-brand-primary text-white",
      className
    )}
    disabled={disabled}
    onClick={onClick}
  >
    {children}
    {loading && <CgSpinner className="ml-1 h-4 w-4 animate-spin" />}
  </button>
);
