"use client";

import { InputHTMLAttributes, forwardRef } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
}

/**
 * Rounded, accessible text input. Forwards its ref so parent forms can
 * manage focus (e.g. focusing the first invalid field on submit).
 */
const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, id, className = "", ...rest }, ref) => {
    const inputId = id ?? rest.name;

    return (
      <div className="flex flex-col gap-1.5">
        <label
          htmlFor={inputId}
          className="text-xs font-semibold uppercase tracking-wider text-smoke"
        >
          {label} <span className="text-reel">*</span>
        </label>
        <input
          ref={ref}
          id={inputId}
          aria-invalid={!!error}
          aria-describedby={error ? `${inputId}-error` : undefined}
          className={`
            w-full rounded-xl border bg-white/10 backdrop-blur-sm px-4 py-3.5 text-ink
            placeholder:text-smoke/50
            transition-all duration-200
            focus:outline-none focus:ring-2 focus:ring-reel focus:border-reel
            ${error ? "border-red-500" : "border-line"}
            ${className}
          `}
          {...rest}
        />
        {error && (
          <p id={`${inputId}-error`} className="text-xs font-medium text-red-500">
            {error}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = "Input";

export default Input;
