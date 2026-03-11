import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  Eye,
  EyeOff,
  LogIn,
  GraduationCap,
  AlertCircle,
  Lock,
} from "lucide-react";
import { toast } from "sonner";

import {
  loginSchema,
  type LoginFormInputs,
} from "@/schemas/loginPageValidation";
import { useUserStore } from "@/modules/auth/stores/useUserStore";
import { AccountLockedMessage } from "@/modules/auth";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import { AxiosError } from "axios";

export default function LoginPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const [showPassword, setShowPassword] = useState(false);
  const [attemptsRemaining, setAttemptsRemaining] = useState<number | null>(
    null
  );
  const [isLocked, setIsLocked] = useState(false);
  const [lockedUntil, setLockedUntil] = useState<string | null>(null);

  const {
    login,
    loading,
    error,
    clearError,
    lockedUntil: storeLockedUntil,
  } = useUserStore();

  // Get the intended destination from location state
  const from =
    (location.state as { from?: { pathname: string } })?.from?.pathname ||
    "/";

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormInputs>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  });

  const onSubmit = async (data: LoginFormInputs) => {
    clearError();
    setAttemptsRemaining(null);
    setIsLocked(false);
    setLockedUntil(null);

    try {
      await login(data);
      toast.success(t("auth.loginSuccess", "Welcome back!"));
      navigate(from, { replace: true });
    } catch (err) {
      // Check for account lockout
      if (err instanceof AxiosError) {
        if (
          err?.response?.status === 429 ||
          err?.response?.data?.locked_until
        ) {
          setIsLocked(true);
          setLockedUntil(err?.response?.data?.locked_until || storeLockedUntil);
          toast.error(t("auth.accountLocked", "Account is temporarily locked"));
        } else if (err?.response?.data?.attempts_remaining !== undefined) {
          // Show remaining attempts
          const remaining = err.response.data.attempts_remaining;
          setAttemptsRemaining(remaining);
          if (remaining > 0) {
            toast.error(
              t("auth.attemptsRemaining", "{{count}} attempts remaining", {
                count: remaining,
              })
            );
          }
        } else {
          toast.error(
            error || t("auth.loginError", "Invalid username or password")
          );
        }
      }
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-primary/5 via-background to-secondary/5 px-4">
      <div className="w-full max-w-md">
        {/* Logo and Title */}
        <div className="mb-8 text-center">
          <div className="mb-4 flex justify-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary text-white shadow-lg">
              <GraduationCap className="h-8 w-8" />
            </div>
          </div>
          <h1 className="text-2xl font-bold text-text-primary">
            {t("branding.schoolName", "Su")}
          </h1>
          <p className="mt-1 text-sm text-text-secondary">
            {t("auth.subtitle", "pump station Management System")}
          </p>
        </div>

        {/* Login Card */}Wali Asr
        <div className="rounded-2xl border border-border bg-card p-8 shadow-xl">
          <div className="mb-6">
            <h2 className="text-xl font-semibold text-text-primary">
              {t("auth.login", "Sign In")}
            </h2>
            <p className="mt-1 text-sm text-text-secondary">
              {t(
                "auth.loginDescription",
                "Enter your credentials to access your account"
              )}
            </p>
          </div>

          {/* Account Locked Warning */}
          {isLocked && lockedUntil && (
            <AccountLockedMessage lockedUntil={lockedUntil} />
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            {/* Username Field */}
            <Input
              label={t("auth.username", "Username")}
              placeholder={t("auth.usernamePlaceholder", "Enter your username")}
              error={errors.username?.message}
              autoComplete="username"
              disabled={isLocked}
              {...register("username")}
            />

            {/* Password Field */}
            <div>
              <Input
                type={showPassword ? "text" : "password"}
                label={t("auth.password", "Password")}
                placeholder={t(
                  "auth.passwordPlaceholder",
                  "Enter your password"
                )}
                error={errors.password?.message}
                autoComplete="current-password"
                disabled={isLocked}
                rightIcon={
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="text-muted hover:text-text-primary transition-colors"
                    tabIndex={-1}
                    disabled={isLocked}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                }
                {...register("password")}
              />

              {/* Forgot Password Link */}
              <div className="mt-2 text-right">
                <Link
                  to="/auth/forgot-password"
                  className="text-sm font-medium text-primary hover:underline"
                >
                  {t("auth.forgotPassword", "Forgot password?")}
                </Link>
              </div>
            </div>

            {/* Store Error Display */}
            {error && !isLocked && (
              <div className="flex items-start gap-2 rounded-lg bg-error/10 p-3 text-sm text-error">
                <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                <div>
                  <p>{error}</p>
                  {attemptsRemaining !== null && attemptsRemaining > 0 && (
                    <p className="mt-1 font-medium">
                      {t(
                        "auth.attemptsRemaining",
                        "{{count}} attempts remaining",
                        {
                          count: attemptsRemaining,
                        }
                      )}
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* Submit Button */}
            <Button
              type="submit"
              fullWidth
              size="lg"
              loading={loading}
              disabled={isLocked}
              leftIcon={
                isLocked ? (
                  <Lock className="h-4 w-4" />
                ) : (
                  <LogIn className="h-4 w-4" />
                )
              }
            >
              {isLocked
                ? t("auth.accountLocked", "Account Locked")
                : loading
                ? t("auth.loggingIn", "Signing in...")
                : t("auth.loginButton", "Sign In")}
            </Button>
          </form>

          {/* Footer */}
          <div className="mt-6 text-center text-sm text-text-secondary">
            <p>
              {t("auth.needHelp", "Need help?")}{" "}
              <a
                href="mailto:support@school.edu"
                className="font-medium text-primary hover:underline"
              >
                {t("auth.contactSupport", "Contact Support")}
              </a>
            </p>
          </div>
        </div>

        {/* Copyright */}
        <p className="mt-6 text-center text-xs text-text-secondary">
          {t(
            "footer.copyright",
            "© 2025 pump station managment system  all functionalities."
          )}
        </p>
      </div>
    </div>
  );
}
