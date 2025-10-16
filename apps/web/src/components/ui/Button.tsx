import { forwardRef } from "react";
import type { ButtonHTMLAttributes } from "react";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement>;

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, type = "button", ...props }, ref) => {
    const baseClasses =
      "inline-flex items-center justify-center rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950 disabled:pointer-events-none disabled:opacity-60";

    return (
      <button
        ref={ref}
        type={type}
        className={className ? `${baseClasses} ${className}` : baseClasses}
        {...props}
      />
    );
  },
);

Button.displayName = "Button";
