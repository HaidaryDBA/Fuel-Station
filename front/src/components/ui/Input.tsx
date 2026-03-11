import {
  forwardRef,
  type ChangeEvent,
  type ClipboardEvent,
  type InputHTMLAttributes,
  type ReactNode,
} from "react";

import { normalizeNumericInput } from "@/utils/normalizeDigits";

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
  helperText?: string;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  fullWidth?: boolean;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      label,
      error,
      hint,
      helperText,
      leftIcon,
      rightIcon,
      fullWidth = true,
      className = "",
      id,
      onChange,
      onPaste,
      type,
      ...props
    },
    ref
  ) => {
    const inputId = id || `input-${Math.random().toString(36).substr(2, 9)}`;
    const shouldNormalizeNumberInput = type === "number";

    const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
      if (shouldNormalizeNumberInput) {
        const normalized = normalizeNumericInput(event.currentTarget.value);
        if (normalized !== event.currentTarget.value) {
          event.currentTarget.value = normalized;
        }
      }
      onChange?.(event);
    };

    const handlePaste = (event: ClipboardEvent<HTMLInputElement>) => {
      if (!shouldNormalizeNumberInput) {
        onPaste?.(event);
        return;
      }

      const pastedText = event.clipboardData.getData("text");
      const normalized = normalizeNumericInput(pastedText);
      if (normalized !== pastedText) {
        event.preventDefault();
        const input = event.currentTarget;
        const start = input.selectionStart ?? input.value.length;
        const end = input.selectionEnd ?? input.value.length;
        input.setRangeText(normalized, start, end, "end");
        input.dispatchEvent(new Event("input", { bubbles: true }));
      }

      onPaste?.(event);
    };

    return (
      <div className={`${fullWidth ? "w-full" : ""}`}>
        {label && (
          <label
            htmlFor={inputId}
            className="mb-1.5 block text-sm font-medium text-text-primary"
          >
            {label}
          </label>
        )}
        <div className="relative">
          {leftIcon && (
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-muted">
              {leftIcon}
            </div>
          )}
          <input
            ref={ref}
            id={inputId}
            className={`
              w-full rounded-lg border bg-background px-4 py-2.5 text-sm text-text-primary
              placeholder:text-muted
              transition-all duration-200
              focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20
              disabled:cursor-not-allowed disabled:bg-surface disabled:opacity-50
              ${leftIcon ? "pl-10" : ""}
              ${rightIcon ? "pr-10" : ""}
              ${error ? "border-error focus:border-error focus:ring-error/20" : "border-border"}
              ${className}
            `}
            type={type}
            {...props}
            onChange={handleChange}
            onPaste={handlePaste}
          />
          {rightIcon && (
            <div className="absolute inset-y-0 right-0 flex items-center pr-3 text-muted">
              {rightIcon}
            </div>
          )}
        </div>
        {error && (
          <p className="mt-1.5 text-sm text-error">{error}</p>
        )}
        {(helperText || hint) && !error && (
          <p className="mt-1.5 text-sm text-muted">{helperText || hint}</p>
        )}
      </div>
    );
  }
);

Input.displayName = "Input";

export default Input;
