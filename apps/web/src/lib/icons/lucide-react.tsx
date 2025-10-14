import { forwardRef } from "react";
import type { SVGProps } from "react";

type IconProps = SVGProps<SVGSVGElement> & {
  size?: number;
  strokeWidth?: number;
};

const createIcon = (children: JSX.Element[]) =>
  forwardRef<SVGSVGElement, IconProps>(({ size = 24, strokeWidth = 2, ...props }, ref) => (
    <svg
      ref={ref}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      {children}
    </svg>
  ));

export const Trophy = createIcon([
  <path key="cup" d="M8 2h8v3a4 4 0 0 1-4 4h0a4 4 0 0 1-4-4Z" />, 
  <path key="left-handle" d="M4 5h2a3.5 3.5 0 0 0 3.5 3.5" />, 
  <path key="right-handle" d="M20 5h-2a3.5 3.5 0 0 1-3.5 3.5" />, 
  <path key="stem" d="M12 9.5v4.5" />, 
  <path key="base" d="M9 21h6" />, 
  <path key="stand" d="M10 18h4l1 3H9Z" />,
]);

export const Shield = createIcon([
  <path
    key="shield"
    d="M12 22s-7-4-7-10V6l7-3 7 3v6c0 6-7 10-7 10Z"
  />,
]);

export const Star = createIcon([
  <polygon
    key="star"
    points="12 3 14.8 8.8 21 9.6 16.5 13.9 17.8 20 12 16.9 6.2 20 7.5 13.9 3 9.6 9.2 8.8 12 3"
  />,
]);

export const Medal = createIcon([
  <circle key="medal" cx={12} cy={13} r={4} />, 
  <path key="ribbon-left" d="M9 3 7 8" />, 
  <path key="ribbon-right" d="M15 3 17 8" />,
  <path key="hanger" d="M9 3h6" />,
]);

export type { IconProps };
