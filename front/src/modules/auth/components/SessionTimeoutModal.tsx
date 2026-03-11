import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Clock, LogOut } from "lucide-react";
import Modal from "@/components/ui/Modal";
import Button from "@/components/ui/Button";
import { useUserStore } from "../stores/useUserStore";

interface SessionTimeoutModalProps {
  isOpen: boolean;
  remainingSeconds: number;
  onKeepAlive: () => void;
}

/**
 * Session Timeout Warning Modal
 * Displays countdown before automatic logout
 *
 * @param isOpen - Whether modal is visible
 * @param remainingSeconds - Seconds until auto-logout
 * @param onKeepAlive - Callback to extend session
 */
export default function SessionTimeoutModal({
  isOpen,
  remainingSeconds,
  onKeepAlive,
}: SessionTimeoutModalProps) {
  const { t } = useTranslation();
  const { logout } = useUserStore();
  const [countdown, setCountdown] = useState(remainingSeconds);

  // Update countdown every second
  useEffect(() => {
    if (isOpen) {
      setCountdown(remainingSeconds);

      const interval = setInterval(() => {
        setCountdown((prev) => Math.max(0, prev - 1));
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [isOpen, remainingSeconds]);

  // Format time as MM:SS
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const handleLogout = () => {
    logout();
    window.location.href = "/auth/login";
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onKeepAlive}
      size="sm"
      closeOnOverlayClick={false}
      showCloseButton={false}
    >
      <div className="space-y-6 p-6">
        {/* Header */}
        <div className="text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-warning/10">
            <Clock className="h-8 w-8 text-warning" />
          </div>
          <h3 className="text-xl font-semibold text-text-primary">
            {t("auth.sessionTimeout", "Session Timeout")}
          </h3>
          <p className="mt-2 text-sm text-text-secondary">
            {t(
              "auth.sessionExpiringSoon",
              "Your session will expire due to inactivity"
            )}
          </p>
        </div>

        {/* Countdown */}
        <div className="rounded-lg bg-surface p-6 text-center">
          <div className="text-4xl font-bold text-warning">
            {formatTime(countdown)}
          </div>
          <p className="mt-2 text-sm text-text-muted">
            {t("auth.timeRemaining", "Time Remaining")}
          </p>
        </div>

        {/* Actions */}
        <div className="flex flex-col gap-3">
          <Button
            variant="primary"
            fullWidth
            onClick={onKeepAlive}
            leftIcon={<Clock className="h-5 w-5" />}
          >
            {t("auth.stayLoggedIn", "Stay Logged In")}
          </Button>
          <Button
            variant="outline"
            fullWidth
            onClick={handleLogout}
            leftIcon={<LogOut className="h-5 w-5" />}
          >
            {t("auth.logout", "Logout")}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
