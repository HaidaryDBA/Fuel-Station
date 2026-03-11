import { useState, useEffect } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslation } from "react-i18next";
import { Lock, Eye, EyeOff, XCircle, ArrowLeft } from "lucide-react";
import {
  resetPasswordSchema,
  type ResetPasswordInput,
} from "../schemas/authSchemas";
import { useResetPassword } from "../api/useAuthMutations";
import PasswordStrengthMeter from "../components/PasswordStrengthMeter";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Card, { CardContent, CardHeader } from "@/components/ui/Card";
import Spinner from "@/components/ui/Spinner";

/**
 * Reset Password Page
 * Allows users to set a new password using reset token from email
 */
export default function ResetPasswordPage() {
  const { t } = useTranslation();
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [tokenValid, setTokenValid] = useState<boolean | null>(null);

  const resetPasswordMutation = useResetPassword();

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<ResetPasswordInput>({
    resolver: zodResolver(resetPasswordSchema),
  });

  const newPassword = watch("newPassword", "");

  // Validate token on mount
  useEffect(() => {
    if (!token || token.length < 10) {
      setTokenValid(false);
    } else {
      setTokenValid(true);
    }
  }, [token]);

  const onSubmit = async (data: ResetPasswordInput) => {
    if (!token) return;

    try {
      await resetPasswordMutation.mutateAsync({
        token,
        email_or_username: "",
        code: "",
        new_password: data.newPassword,
        confirm_password: data.confirmPassword,
      });
    } catch {
      // Error handled by mutation onError
    }
  };

  // Loading state
  if (tokenValid === null) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Spinner size="lg" />
      </div>
    );
  }

  // Invalid token state
  if (tokenValid === false) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background p-4">
        <Card className="w-full max-w-md">
          <CardContent className="py-12">
            <div className="space-y-4 text-center">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-error/10">
                <XCircle className="h-8 w-8 text-error" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-text-primary">
                  {t("auth.invalidToken", "Invalid Reset Link")}
                </h3>
                <p className="mt-2 text-sm text-text-secondary">
                  {t(
                    "auth.invalidTokenMessage",
                    "This password reset link is invalid or has expired. Please request a new one."
                  )}
                </p>
              </div>
              <div className="flex flex-col gap-2 pt-4">
                <Button
                  variant="primary"
                  fullWidth
                  onClick={() => navigate("/auth/forgot-password")}
                >
                  {t("auth.requestNewLink", "Request New Link")}
                </Button>
                <Link
                  to="/auth/login"
                  className="inline-flex items-center justify-center gap-2 text-sm text-text-secondary hover:text-primary"
                >
                  <ArrowLeft className="h-4 w-4" />
                  {t("auth.backToLogin", "Back to Login")}
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Reset password form
  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <div className="text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
              <Lock className="h-6 w-6 text-primary" />
            </div>
            <h1 className="text-2xl font-bold text-text-primary">
              {t("auth.resetPasswordTitle", "Set New Password")}
            </h1>
            <p className="mt-2 text-sm text-text-secondary">
              {t(
                "auth.resetPasswordSubtitle",
                "Create a strong password for your account"
              )}
            </p>
          </div>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/* New Password */}
            <Input
              label={t("auth.newPassword", "New Password")}
              type={showPassword ? "text" : "password"}
              placeholder={t(
                "auth.newPasswordPlaceholder",
                "Enter your new password"
              )}
              leftIcon={<Lock className="h-5 w-5 text-text-muted" />}
              rightIcon={
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="text-text-muted hover:text-text-primary"
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </button>
              }
              error={errors.newPassword?.message}
              {...register("newPassword")}
            />

            {/* Password Strength Meter */}
            <PasswordStrengthMeter password={newPassword} />

            {/* Confirm Password */}
            <Input
              label={t("auth.confirmPassword", "Confirm Password")}
              type={showConfirmPassword ? "text" : "password"}
              placeholder={t(
                "auth.confirmPasswordPlaceholder",
                "Re-enter your new password"
              )}
              leftIcon={<Lock className="h-5 w-5 text-text-muted" />}
              rightIcon={
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="text-text-muted hover:text-text-primary"
                >
                  {showConfirmPassword ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </button>
              }
              error={errors.confirmPassword?.message}
              {...register("confirmPassword")}
            />

            <Button
              type="submit"
              variant="primary"
              fullWidth
              loading={resetPasswordMutation.isPending}
            >
              {t("auth.resetPassword", "Reset Password")}
            </Button>

            <div className="text-center">
              <Link
                to="/auth/login"
                className="inline-flex items-center gap-2 text-sm text-text-secondary hover:text-primary"
              >
                <ArrowLeft className="h-4 w-4" />
                {t("auth.backToLogin", "Back to Login")}
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
