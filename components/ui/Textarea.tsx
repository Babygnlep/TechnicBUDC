"use client";

import { forwardRef, TextareaHTMLAttributes } from "react";

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label: string;
  error?: string;
  required?: boolean;
}

const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ label, error, required = true, id, className = "", ...rest }, ref) => {
    const textareaId = id ?? rest.name;

    return (
      <div className="flex flex-col gap-1.5">
        <label htmlFor={textareaId} className="text-xs font-semibold uppercase tracking-wider text-smoke">
          {label} {required && <span className="text-reel">*</span>}
        </label>
        <textarea
          ref={ref}
          id={textareaId}
          aria-invalid={!!error}
          aria-describedby={error ? `${textareaId}-error` : undefined}
          className={`
            w-full min-h-[140px] rounded-[1rem] border bg-white/10 backdrop-blur-sm px-4 py-3.5 text-ink
            placeholder:text-smoke/50
            transition-all duration-200
            focus:outline-none focus:ring-2 focus:ring-reel focus:border-reel
            ${error ? "border-red-500" : "border-line"}
            ${className}
          `}
          {...rest}
        />
        {error && (
          <p id={`${textareaId}-error`} className="text-xs font-medium text-red-500">
            {error}
          </p>
        )}
      </div>
    );
  }
);

Textarea.displayName = "Textarea";

export default Textarea;
