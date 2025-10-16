import type { HTMLAttributes } from "react";
import { Medal, Shield, Star, Trophy } from "lucide-react";

const ICON_MAP: Record<string, typeof Trophy> = {
  "Assíduo": Trophy,
  Equipe: Shield,
  "Fair Play": Star,
};

type BadgeIconProps = {
  name: string;
  size?: number;
} & HTMLAttributes<HTMLSpanElement>;

export function BadgeIcon({ name, size = 32, className, ...props }: BadgeIconProps) {
  const IconComponent = ICON_MAP[name] ?? Medal;
  const baseClasses =
    "inline-flex items-center justify-center rounded-full bg-slate-800/80 p-2 text-amber-400";

  return (
    <span
      role="img"
      aria-label={name}
      className={className ? `${baseClasses} ${className}` : baseClasses}
      {...props}
    >
      <IconComponent aria-hidden size={size} strokeWidth={1.8} />
    </span>
  );
}
