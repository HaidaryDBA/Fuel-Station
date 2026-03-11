import { forwardRef, type InputHTMLAttributes } from "react";
import { Check } from "lucide-react";

export interface CheckboxProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "type"> {
  label?: string;
  description?: string;
  error?: string;
}

const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
  ({ label, description, error, className = "", id, ...props }, ref) => {
    const checkboxId = id || `checkbox-${Math.random().toString(36).substr(2, 9)}`;

    return (
      <div className={`${className}`}>
        <label
          htmlFor={checkboxId}
          className="flex cursor-pointer items-start gap-3"
        >
          <div className="relative mt-0.5 flex items-center">
            <input
              ref={ref}
              type="checkbox"
              id={checkboxId}
              className="peer sr-only"
              {...props}
            />
            <div className="h-5 w-5 rounded border-2 border-border bg-background transition-all peer-checked:border-primary peer-checked:bg-primary peer-focus:ring-2 peer-focus:ring-primary/20 peer-disabled:cursor-not-allowed peer-disabled:opacity-50">
              <Check className="h-full w-full p-0.5 text-white opacity-0 transition-opacity peer-checked:opacity-100" />
            </div>
            <Check className="absolute left-0 top-0 h-5 w-5 p-0.5 text-white opacity-0 transition-opacity [input:checked~&]:opacity-100" />
          </div>
          {(label || description) && (
            <div className="flex flex-col">
              {label && (
                <span className="text-sm font-medium text-text-primary">
                  {label}
                </span>
              )}
              {description && (
                <span className="text-sm text-text-secondary">
                  {description}
                </span>
              )}
            </div>
          )}
        </label>
        {error && <p className="mt-1.5 text-sm text-error">{error}</p>}
      </div>
    );
  }
);

Checkbox.displayName = "Checkbox";

export default Checkbox;
