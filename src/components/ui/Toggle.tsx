import React from "react";
import { motion } from "framer-motion";

interface ToggleProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: string;
  description?: string;
  disabled?: boolean;
}

export const Toggle: React.FC<ToggleProps> = ({
  checked,
  onChange,
  label,
  description,
  disabled = false,
}) => {
  return (
    <div className="flex items-start justify-between gap-4 py-2">
      {(label || description) && (
        <div className="flex flex-col gap-0.5 select-none">
          {label && <span className="text-sm font-semibold text-white">{label}</span>}
          {description && <span className="text-xs text-black">{description}</span>}
        </div>
      )}
      <button
        type="button"
        disabled={disabled}
        onClick={() => onChange(!checked)}
        title={label ? `${label}: ${checked ? "on" : "off"}` : checked ? "On" : "Off"}
        className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out outline-none focus:ring-2 focus:ring-cyan-500/50 ${
          checked ? "bg-cyan-500" : "bg-neutral-900"
        } ${disabled ? "opacity-50 pointer-events-none" : ""}`}
      >
        <motion.span
          animate={{ x: checked ? 20 : 0 }}
          transition={{ type: "spring", stiffness: 500, damping: 30 }}
          className="pointer-events-none inline-block h-5 w-5 transform rounded-full bg-black shadow-md ring-0"
        />
      </button>
    </div>
  );
};
