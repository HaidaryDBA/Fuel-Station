import { useState } from "react";
import { Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslation } from "react-i18next";
import { Mail, ArrowLeft, CheckCircle } from "lucide-react";
import { forgotPasswordSchema, type ForgotPasswordInput } from "../schemas/authSchemas";
import { useForgotPassword } from "../api/useAuthMutations";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Card, { CardContent, CardHeader } from "@/components/ui/Card";

/**
 * Forgot Password Page
 * Allows users to request a password reset link
 */
export default function ForgotPasswordPage() {
  const { t } = useTranslation();
  const [emailSent, setEmailSent] = useState(false);
  const forgotPasswordMutation = useForgotPassword();

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<ForgotPasswordInput>({
    resolver: zodResolver(forgotPasswordSchema),
  });

  const email_or_username = watch("email_or_username");

  const onSubmit = async (data: ForgotPasswordInput) => {
    try {
      await forgotPasswordMutation.mutateAsync(data);
      setEmailSent(true);
    } catch {
      // Error handled by mutation onError
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <div className="text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
              <Mail className="h-6 w-6 text-primary" />
            </div>
            <h1 className="text-2xl font-bold text-text-primary">
              {t("auth.forgotPasswordTitle", "Reset Your Password")}
            </h1>
            <p className="mt-2 text-sm text-text-secondary">
              {t(
                "auth.forgotPasswordSubtitle",
                "Enter your email or username to receive a reset link"
              )}
            </p>
          </div>
        </CardHeader>

        <CardContent>
          {emailSent ? (
            // Success State
            <div className="space-y-4 text-center">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-success/10">
                <CheckCircle className="h-8 w-8 text-success" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-text-primary">
                  {t("auth.checkYourEmail", "Check Your Email")}
                </h3>
                <p className="mt-2 text-sm text-text-secondary">
                  {t(
                    "auth.emailSentMessage",
                    "If an account exists for {identifier}, you will receive a password reset link shortly.",
                    { identifier: email_or_username }
                  )}
                </p>
              </div>
              <div className="pt-4">
                <Link
                  to="/auth/login"
                  className="inline-flex items-center gap-2 text-sm text-primary hover:underline"
                >
                  <ArrowLeft className="h-4 w-4" />
                  {t("auth.backToLogin", "Back to Login")}
                </Link>
              </div>
            </div>
          ) : (
            // Form State
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <Input
                label={t("auth.emailOrUsername", "Email or Username")}
                type="text"
                placeholder={t(
                  "auth.emailOrUsernamePlaceholder",
                  "Enter your email or username"
                )}
                leftIcon={<Mail className="h-5 w-5 text-text-muted" />}
                error={errors.email_or_username?.message}
                {...register("email_or_username")}
              />

              <Button
                type="submit"
                variant="primary"
                fullWidth
                loading={forgotPasswordMutation.isPending}
              >
                {t("auth.sendResetLink", "Send Reset Link")}
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
          )}
        </CardContent>
      </Card>
    </div>
  );
}
