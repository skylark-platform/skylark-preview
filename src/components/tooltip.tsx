import { ReactNode } from "react";
import { FiInfo } from "react-icons/fi";

interface TooltipProps {
  tooltip: ReactNode;
}

export const Tooltip = ({ tooltip }: TooltipProps) => (
  <div className="group relative py-2 hover:cursor-pointer">
    <FiInfo className="h-3.5 w-3.5 transition-colors group-hover:text-brand-primary" />
    <div className="absolute -left-40 bottom-7 z-50 hidden w-80 space-y-2 rounded-lg bg-white p-4 text-xs shadow-md shadow-gray-400 group-hover:block">
      {tooltip}
    </div>
  </div>
);
