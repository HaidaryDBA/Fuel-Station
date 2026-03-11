import { useState, useEffect } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslation } from "react-i18next";
import { Eye, EyeOff, Lock, ArrowLeft, CheckCircle } from "lucide-react";
import { resetPasswordSchema, type ResetPasswordInput } from "../schemas/authSchemas";
import { useResetPassword } from "../api/useAuthMutations";
import { PasswordStrengthMeter } from "..";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Card, { CardContent, CardHeader } from "@/components/ui/Card";

/**
 * Reset Password Page
 * Uses code from email verification + new password
 */
export default function ResetPasswordPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [success, setSuccess] = useState(false);

  const resetPasswordMutation = useResetPassword();

  // Get emailOrUsername and code from location state
  const { emailOrUsername, code } = (location.state as {
    emailOrUsername?: string;
    code?: string;
  }) || {};

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<ResetPasswordInput>({
    resolver: zodResolver(resetPasswordSchema),
  });

  const password = watch("newPassword");

  useEffect(() => {
    // Redirect if no code or email
    if (!emailOrUsername || !code) {
      navigate("/auth/forgot-password", { replace: true });
    }
  }, [emailOrUsername, code, navigate]);

  const onSubmit = async (data: ResetPasswordInput) => {
    if (!emailOrUsername || !code) return;

    try {
      await resetPasswordMutation.mutateAsync({
        email_or_username: emailOrUsername,
        code: code, // Use code from navigation state
        new_password: data.newPassword,
        confirm_password: data.confirmPassword,
      });
      setSuccess(true);
    } catch (error) {
      // Error handled by mutation
    }
  };

  if (success) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background p-4">
        <Card className="w-full max-w-md">
          <CardContent className="py-12">
            <div className="space-y-4 text-center">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-success/10">
                <CheckCircle className="h-8 w-8 text-success" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-text-primary">
                  {t("auth.passwordResetSuccess", "Password Reset Successfully!")}
                </h3>
                <p className="mt-2 text-sm text-text-secondary">
                  {t(
                    "auth.passwordResetSuccessMessage",
                    "Your password has been reset. You can now log in with your new password."
                  )}
                </p>
              </div>
              <div className="pt-4">
                <Button
                  variant="primary"
                  fullWidth
                  onClick={() => navigate("/auth/login")}
                >
                  {t("auth.goToLogin", "Go to Login")}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

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
                "Choose a strong password for your account"
              )}
            </p>
          </div>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/* New Password */}
            <div>
              <Input
                type={showPassword ? "text" : "password"}
                label={t("auth.newPassword", "New Password")}
                placeholder={t("auth.newPasswordPlaceholder", "Enter new password")}
                error={errors.newPassword?.message}
                autoComplete="new-password"
                rightIcon={
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="text-muted hover:text-text-primary transition-colors"
                    tabIndex={-1}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                }
                {...register("newPassword")}
              />
              {password && <PasswordStrengthMeter password={password} />}
            </div>

            {/* Confirm Password */}
            <Input
              type={showConfirmPassword ? "text" : "password"}
              label={t("auth.confirmPassword", "Confirm Password")}
              placeholder={t("auth.confirmPasswordPlaceholder", "Re-enter new password")}
              error={errors.confirmPassword?.message}
              autoComplete="new-password"
              rightIcon={
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="text-muted hover:text-text-primary transition-colors"
                  tabIndex={-1}
                >
                  {showConfirmPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              }
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
                to="/auth/forgot-password"
                className="inline-flex items-center gap-2 text-sm text-text-secondary hover:text-primary"
              >
                <ArrowLeft className="h-4 w-4" />
                {t("auth.backToForgotPassword", "Back to Forgot Password")}
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
