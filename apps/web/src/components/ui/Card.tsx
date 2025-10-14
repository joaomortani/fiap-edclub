import { forwardRef } from "react";
import type { HTMLAttributes } from "react";

type CardProps = HTMLAttributes<HTMLDivElement>;

type CardSectionProps = HTMLAttributes<HTMLDivElement>;

export const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ className, ...props }, ref) => {
    const baseClasses =
      "rounded-xl border border-slate-200 bg-white p-6 shadow-sm";

    return (
      <div
        ref={ref}
        className={className ? `${baseClasses} ${className}` : baseClasses}
        {...props}
      />
    );
  },
);

Card.displayName = "Card";

export const CardHeader = forwardRef<HTMLDivElement, CardSectionProps>(
  ({ className, ...props }, ref) => {
    const baseClasses = "mb-4 space-y-2";

    return (
      <div
        ref={ref}
        className={className ? `${baseClasses} ${className}` : baseClasses}
        {...props}
      />
    );
  },
);

CardHeader.displayName = "CardHeader";

export const CardTitle = forwardRef<HTMLDivElement, CardSectionProps>(
  ({ className, ...props }, ref) => {
    const baseClasses = "text-xl font-semibold";

    return (
      <div
        ref={ref}
        className={className ? `${baseClasses} ${className}` : baseClasses}
        {...props}
      />
    );
  },
);

CardTitle.displayName = "CardTitle";

export const CardContent = forwardRef<HTMLDivElement, CardSectionProps>(
  ({ className, ...props }, ref) => {
    const baseClasses = "space-y-2 text-sm text-slate-600";

    return (
      <div
        ref={ref}
        className={className ? `${baseClasses} ${className}` : baseClasses}
        {...props}
      />
    );
  },
);

CardContent.displayName = "CardContent";
