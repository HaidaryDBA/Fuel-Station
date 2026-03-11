import { useState, useRef, useEffect, type ReactNode } from "react";
import { ChevronDown } from "lucide-react";

export interface DropdownItem {
  label: string;
  value: string;
  icon?: ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  divider?: boolean;
}

export interface DropdownProps {
  trigger: ReactNode;
  items: DropdownItem[];
  align?: "left" | "right";
  className?: string;
}

export default function Dropdown({
  trigger,
  items,
  align = "left",
  className = "",
}: DropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  const handleItemClick = (item: DropdownItem) => {
    if (!item.disabled && item.onClick) {
      item.onClick();
      setIsOpen(false);
    }
  };

  return (
    <div ref={dropdownRef} className={`relative inline-block ${className}`}>
      <div onClick={() => setIsOpen(!isOpen)} className="cursor-pointer">
        {trigger}
      </div>

      {isOpen && (
        <div
          className={`absolute z-50 mt-2 min-w-[200px] bg-surface border border-border rounded-lg shadow-lg py-1 animate-scale-in ${
            align === "right" ? "right-0" : "left-0"
          }`}
        >
          {items.map((item, index) => (
            <div key={index}>
              {item.divider ? (
                <div className="my-1 border-t border-border" />
              ) : (
                <button
                  onClick={() => handleItemClick(item)}
                  disabled={item.disabled}
                  className={`w-full flex items-center gap-3 px-4 py-2 text-sm text-left transition-colors ${
                    item.disabled
                      ? "opacity-50 cursor-not-allowed"
                      : "hover:bg-surface-hover cursor-pointer"
                  }`}
                >
                  {item.icon && <span className="flex-shrink-0">{item.icon}</span>}
                  <span>{item.label}</span>
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export function DropdownButton({
  label,
  items,
  variant = "outline",
  align = "left",
}: {
  label: string;
  items: DropdownItem[];
  variant?: "primary" | "secondary" | "outline";
  align?: "left" | "right";
}) {
  const variants = {
    primary: "bg-primary text-white hover:bg-primary-dark",
    secondary: "bg-secondary text-white hover:opacity-90",
    outline: "border-2 border-primary text-primary hover:bg-primary hover:text-white",
  };

  return (
    <Dropdown
      trigger={
        <button className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${variants[variant]}`}>
          {label}
          <ChevronDown className="h-4 w-4" />
        </button>
      }
      items={items}
      align={align}
    />
  );
}
