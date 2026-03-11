import { useTranslation } from "react-i18next";
import { Check, X } from "lucide-react";
import { usePasswordStrength } from "../hooks/usePasswordStrength";

interface PasswordStrengthMeterProps {
  password: string;
  showRequirements?: boolean;
}

/**
 * Password Strength Meter Component
 * Displays visual feedback for password strength
 *
 * @param password - The password to evaluate
 * @param showRequirements - Whether to show requirements checklist (default: true)
 */
export default function PasswordStrengthMeter({
  password,
  showRequirements = true,
}: PasswordStrengthMeterProps) {
  const { t } = useTranslation();
  const { strengthLabel, strengthColor, requirements, score } =
    usePasswordStrength(password);

  // Don't show anything if password is empty
  if (!password) return null;

  return (
    <div className="space-y-3">
      {/* Progress Bar */}
      <div className="space-y-1">
        <div className="flex items-center justify-between text-sm">
          <span className="text-text-secondary">
            {t("auth.passwordStrength", "Password Strength")}
          </span>
          <span className="font-medium text-text-primary">{strengthLabel}</span>
        </div>
        <div className="h-2 w-full overflow-hidden rounded-full bg-surface">
          <div
            className={`h-full transition-all duration-300 ${strengthColor}`}
            style={{ width: `${(score / 5) * 100}%` }}
          />
        </div>
      </div>

      {/* Requirements Checklist */}
      {showRequirements && (
        <div className="space-y-1.5">
          <p className="text-xs font-medium text-text-secondary">
            {t("auth.passwordRequirements", "Password must contain:")}
          </p>
          <ul className="space-y-1">
            <RequirementItem
              met={requirements.hasMinLength}
              label={t(
                "auth.requirementMinLength",
                "At least 8 characters"
              )}
            />
            <RequirementItem
              met={requirements.hasUppercase}
              label={t(
                "auth.requirementUppercase",
                "One uppercase letter (A-Z)"
              )}
            />
            <RequirementItem
              met={requirements.hasLowercase}
              label={t(
                "auth.requirementLowercase",
                "One lowercase letter (a-z)"
              )}
            />
            <RequirementItem
              met={requirements.hasNumber}
              label={t("auth.requirementNumber", "One number (0-9)")}
            />
            <RequirementItem
              met={requirements.hasSpecialChar}
              label={t(
                "auth.requirementSpecial",
                "One special character (!@#$...)"
              )}
            />
          </ul>
        </div>
      )}
    </div>
  );
}

/**
 * Requirement Item Component
 * Individual requirement with checkmark/x icon
 */
function RequirementItem({ met, label }: { met: boolean; label: string }) {
  return (
    <li className="flex items-center gap-2 text-xs">
      {met ? (
        <Check className="h-4 w-4 text-success" />
      ) : (
        <X className="h-4 w-4 text-text-muted" />
      )}
      <span className={met ? "text-success" : "text-text-muted"}>{label}</span>
    </li>
  );
}
