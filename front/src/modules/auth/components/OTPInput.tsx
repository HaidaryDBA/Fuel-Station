import {
  useRef,
  useState,
  useEffect,
  type KeyboardEvent,
  type ClipboardEvent,
} from "react";

interface OTPInputProps {
  length?: number;
  value?: string;
  onChange?: (value: string) => void;
  onComplete?: (value: string) => void;
  disabled?: boolean;
  error?: string;
}

export default function OTPInput({
  length = 6,
  value = "",
  onChange,
  onComplete,
  disabled = false,
  error,
}: OTPInputProps) {
  const [otp, setOtp] = useState<string[]>(Array(length).fill(""));
  const [isShaking, setIsShaking] = useState(false);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Sync with external value prop
  useEffect(() => {
    if (value) {
      const digits = value.split("").slice(0, length);
      const paddedDigits = [
        ...digits,
        ...Array(length - digits.length).fill(""),
      ];
      setOtp(paddedDigits);
    } else {
      setOtp(Array(length).fill(""));
    }
  }, [value, length]);

  // Focus first input on mount
  useEffect(() => {
    inputRefs.current[0]?.focus();
  }, []);

  const handleChange = (index: number, digit: string) => {
    // Only allow single digit numbers
    if (digit && !/^\d$/.test(digit)) {
      return;
    }

    const newOtp = [...otp];
    newOtp[index] = digit;
    setOtp(newOtp);

    const completeCode = newOtp.join("");

    // Call onChange callback
    onChange?.(completeCode);

    // Auto-focus next input
    if (digit && index < length - 1) {
      inputRefs.current[index + 1]?.focus();
    }

    // Check if all digits are filled
    if (completeCode.length === length) {
      // Trigger shake animation
      setIsShaking(true);
      setTimeout(() => setIsShaking(false), 500);

      // Call onComplete callback after a short delay
      setTimeout(() => {
        onComplete?.(completeCode);
      }, 400);
    }
  };

  const handleKeyDown = (index: number, e: KeyboardEvent<HTMLInputElement>) => {
    // Handle backspace
    if (e.key === "Backspace") {
      e.preventDefault();
      const newOtp = [...otp];

      if (otp[index]) {
        // Clear current box
        newOtp[index] = "";
        setOtp(newOtp);
        onChange?.(newOtp.join(""));
      } else if (index > 0) {
        // Move to previous box and clear it
        newOtp[index - 1] = "";
        setOtp(newOtp);
        onChange?.(newOtp.join(""));
        inputRefs.current[index - 1]?.focus();
      }
    }

    // Handle arrow keys
    if (e.key === "ArrowLeft" && index > 0) {
      e.preventDefault();
      inputRefs.current[index - 1]?.focus();
    }

    if (e.key === "ArrowRight" && index < length - 1) {
      e.preventDefault();
      inputRefs.current[index + 1]?.focus();
    }

    // Handle delete key
    if (e.key === "Delete") {
      e.preventDefault();
      const newOtp = [...otp];
      newOtp[index] = "";
      setOtp(newOtp);
      onChange?.(newOtp.join(""));
    }
  };

  const handlePaste = (e: ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text/plain").trim();

    // Only process if pasted data is all digits
    if (!/^\d+$/.test(pastedData)) {
      return;
    }

    // Split pasted data and fill inputs
    const digits = pastedData.split("").slice(0, length);
    const newOtp = [...Array(length).fill("")];
    digits.forEach((digit, index) => {
      newOtp[index] = digit;
    });

    setOtp(newOtp);
    const completeCode = newOtp.join("");
    onChange?.(completeCode);

    // Focus the next empty box or the last box
    const nextIndex = Math.min(digits.length, length - 1);
    inputRefs.current[nextIndex]?.focus();

    // Check if pasted code is complete
    if (digits.length === length) {
      // Trigger shake animation
      setIsShaking(true);
      setTimeout(() => setIsShaking(false), 500);

      // Call onComplete callback after a short delay
      setTimeout(() => {
        onComplete?.(completeCode);
      }, 400);
    }
  };

  const handleFocus = (index: number) => {
    // Select the content on focus for easier replacement
    inputRefs.current[index]?.select();
  };

  return (
    <div className="space-y-2">
      <style>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-8px); }
          75% { transform: translateX(8px); }
        }
        .shake-animation {
          animation: shake 0.4s ease-in-out;
        }
      `}</style>
      <div
        className={`flex justify-center gap-2 ${
          isShaking ? "shake-animation" : ""
        }`}
      >
        {otp.map((digit, index) => (
          <input
            key={index}
            ref={(e) => { inputRefs.current[index] = e; }}
            type="text"
            inputMode="numeric"
            maxLength={1}
            value={digit}
            onChange={(e) => handleChange(index, e.target.value)}
            onKeyDown={(e) => handleKeyDown(index, e)}
            onPaste={handlePaste}
            onFocus={() => handleFocus(index)}
            disabled={disabled}
            className={`
              h-12 w-12 rounded-lg border-2 text-center text-2xl font-semibold
              transition-all duration-200
              focus:outline-none focus:ring-2 focus:ring-primary/50
              ${
                error
                  ? "border-error bg-error/5 text-error"
                  : digit
                  ? "border-primary bg-primary/5 text-text-primary"
                  : "border-border bg-background text-text-primary hover:border-primary/50"
              }
              ${disabled ? "cursor-not-allowed opacity-50" : "cursor-text"}
            `}
            aria-label={`Digit ${index + 1}`}
          />
        ))}
      </div>
      {error && <p className="text-center text-sm text-error">{error}</p>}
    </div>
  );
}
