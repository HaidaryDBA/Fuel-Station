import { forwardRef, type InputHTMLAttributes } from "react";

export interface RadioProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "type"> {
  label?: string;
  description?: string;
  error?: string;
}

const Radio = forwardRef<HTMLInputElement, RadioProps>(
  ({ label, description, error, className = "", id, ...props }, ref) => {
    const radioId = id || `radio-${Math.random().toString(36).substr(2, 9)}`;

    return (
      <div className={`${className}`}>
        <label
          htmlFor={radioId}
          className="flex cursor-pointer items-start gap-3"
        >
          <div className="relative mt-0.5 flex items-center">
            <input
              ref={ref}
              type="radio"
              id={radioId}
              className="peer sr-only"
              {...props}
            />
            <div className="h-5 w-5 rounded-full border-2 border-border bg-background transition-all peer-checked:border-primary peer-focus:ring-2 peer-focus:ring-primary/20 peer-disabled:cursor-not-allowed peer-disabled:opacity-50" />
            <div className="absolute left-1/2 top-1/2 h-2.5 w-2.5 -translate-x-1/2 -translate-y-1/2 scale-0 rounded-full bg-primary transition-transform peer-checked:scale-100" />
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

Radio.displayName = "Radio";

export default Radio;
