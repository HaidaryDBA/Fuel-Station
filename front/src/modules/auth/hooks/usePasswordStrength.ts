import { useMemo } from "react";

export const PasswordStrength = {
  WEAK: 0,
  MEDIUM: 1,
  STRONG: 2,
  VERY_STRONG: 3,
} as const;

export type PasswordStrength = typeof PasswordStrength[keyof typeof PasswordStrength];

export interface PasswordRequirements {
  hasMinLength: boolean;
  hasUppercase: boolean;
  hasLowercase: boolean;
  hasNumber: boolean;
  hasSpecialChar: boolean;
}

export interface PasswordStrengthResult {
  strength: PasswordStrength;
  strengthLabel: string;
  strengthColor: string;
  requirements: PasswordRequirements;
  isValid: boolean;
  score: number; // 0-5 for progress bar
}

/**
 * Password Strength Hook
 * Calculates password strength based on requirements
 *
 * @param password - The password to evaluate
 * @returns Password strength information
 *
 * @example
 * const { strength, strengthLabel, isValid } = usePasswordStrength("MyP@ssw0rd");
 */
export const usePasswordStrength = (password: string): PasswordStrengthResult => {
  const requirements = useMemo<PasswordRequirements>(
    () => ({
      hasMinLength: password.length >= 8,
      hasUppercase: /[A-Z]/.test(password),
      hasLowercase: /[a-z]/.test(password),
      hasNumber: /[0-9]/.test(password),
      hasSpecialChar: /[^A-Za-z0-9]/.test(password),
    }),
    [password]
  );

  const strength = useMemo<PasswordStrength>(() => {
    const metRequirements = Object.values(requirements).filter(Boolean).length;

    if (!requirements.hasMinLength) return PasswordStrength.WEAK;
    if (metRequirements <= 2) return PasswordStrength.WEAK;
    if (metRequirements === 3) return PasswordStrength.MEDIUM;
    if (metRequirements === 4) return PasswordStrength.STRONG;
    return PasswordStrength.VERY_STRONG;
  }, [requirements]);

  const strengthLabel = useMemo(() => {
    switch (strength) {
      case PasswordStrength.WEAK:
        return "Weak";
      case PasswordStrength.MEDIUM:
        return "Medium";
      case PasswordStrength.STRONG:
        return "Strong";
      case PasswordStrength.VERY_STRONG:
        return "Very Strong";
      default:
        return "Weak";
    }
  }, [strength]);

  const strengthColor = useMemo(() => {
    switch (strength) {
      case PasswordStrength.WEAK:
        return "bg-error";
      case PasswordStrength.MEDIUM:
        return "bg-warning";
      case PasswordStrength.STRONG:
        return "bg-success";
      case PasswordStrength.VERY_STRONG:
        return "bg-primary";
      default:
        return "bg-error";
    }
  }, [strength]);

  const score = useMemo(() => {
    return Object.values(requirements).filter(Boolean).length;
  }, [requirements]);

  return {
    strength,
    strengthLabel,
    strengthColor,
    requirements,
    isValid: strength >= PasswordStrength.STRONG,
    score,
  };
};
