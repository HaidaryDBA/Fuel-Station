import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Lock, Mail, Clock } from "lucide-react";
import Alert from "@/components/ui/Alert";

interface AccountLockedMessageProps {
  lockedUntil: string;
}

/**
 * Account Locked Message Component
 * Displays account lockout information after failed login attempts
 *
 * @param lockedUntil - ISO timestamp when account will be unlocked
 */
export default function AccountLockedMessage({
  lockedUntil,
}: AccountLockedMessageProps) {
  const { t } = useTranslation();

  // Calculate time remaining
  const unlockTime = new Date(lockedUntil);
  const now = new Date();
  const minutesRemaining = Math.ceil(
    (unlockTime.getTime() - now.getTime()) / (1000 * 60)
  );

  return (
    <Alert variant="error" className="space-y-3">
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0">
          <Lock className="h-5 w-5" />
        </div>
        <div className="flex-1 space-y-2">
          <h4 className="font-semibold">
            {t("auth.accountLocked", "Account Temporarily Locked")}
          </h4>
          <p className="text-sm">
            {t(
              "auth.accountLockedMessage",
              "Your account has been temporarily locked due to multiple failed login attempts."
            )}
          </p>

          {/* Time Remaining */}
          <div className="flex items-center gap-2 text-sm font-medium">
            <Clock className="h-4 w-4" />
            <span>
              {t(
                "auth.tryAgainIn",
                "Try again in {minutes} minutes",
                { minutes: minutesRemaining }
              )}
            </span>
          </div>

          {/* Help Links */}
          <div className="flex flex-col gap-2 border-t border-error/20 pt-3 text-sm">
            <Link
              to="/mis/forgot-password"
              className="inline-flex items-center gap-2 font-medium hover:underline"
            >
              <Mail className="h-4 w-4" />
              {t("auth.forgotPassword", "Forgot Password?")}
            </Link>
            <p className="text-sm opacity-90">
              {t(
                "auth.contactSupport",
                "If you need immediate access, please contact support."
              )}
            </p>
          </div>
        </div>
      </div>
    </Alert>
  );
}
