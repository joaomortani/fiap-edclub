import { forwardRef } from "react";
import type { InputHTMLAttributes } from "react";

type InputProps = InputHTMLAttributes<HTMLInputElement>;

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, type = "text", ...props }, ref) => {
    const baseClasses =
      "flex h-10 w-full rounded-lg border border-slate-700 bg-slate-950/60 px-3 py-2 text-sm text-slate-100 shadow-sm transition-colors placeholder:text-slate-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 focus-visible:ring-offset-0 disabled:cursor-not-allowed disabled:opacity-60";

    return (
      <input
        ref={ref}
        type={type}
        className={className ? `${baseClasses} ${className}` : baseClasses}
        {...props}
      />
    );
  },
);

Input.displayName = "Input";
