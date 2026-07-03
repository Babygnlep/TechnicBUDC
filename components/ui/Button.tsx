"use client";

import { ButtonHTMLAttributes, ReactNode } from "react";
import Spinner from "./Spinner";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  variant?: "primary" | "dark" | "outline";
  size?: "md" | "lg";
  isLoading?: boolean;
}

const VARIANT_STYLES: Record<string, string> = {
  primary:
    "bg-gradient-to-r from-[#FFD100] via-reel to-[#FFD100] text-[#020617] shadow-glow hover:shadow-card active:scale-[0.98] disabled:hover:translate-y-0",
  dark: "bg-ink text-canvas hover:bg-slate-700 active:scale-[0.98] shadow-soft",
  outline:
    "bg-transparent border-2 border-line text-ink hover:bg-white/10 hover:text-ink shadow-soft",
};

const SIZE_STYLES: Record<string, string> = {
  md: "px-6 py-3 text-sm",
  lg: "px-10 py-5 text-base",
};

/**
 * Shared button used across the site. Handles its own disabled + loading
 * visuals so callers just toggle `isLoading`.
 */
export default function Button({
  children,
  variant = "primary",
  size = "md",
  isLoading = false,
  disabled,
  className = "",
  ...rest
}: ButtonProps) {
  return (
    <button
      disabled={disabled || isLoading}
      className={`
        inline-flex items-center justify-center gap-3 rounded-full
        font-display tracking-wide uppercase
        transition-all duration-300 ease-out
        disabled:opacity-60 disabled:cursor-not-allowed
        ${VARIANT_STYLES[variant]}
        ${SIZE_STYLES[size]}
        ${className}
      `}
      {...rest}
    >
      {isLoading && <Spinner size={18} />}
      <span>{isLoading ? "Submitting..." : children}</span>
    </button>
  );
}
