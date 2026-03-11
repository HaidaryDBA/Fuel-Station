import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslation } from "react-i18next";
import { Mail, ArrowLeft, KeyRound } from "lucide-react";
import { forgotPasswordSchema, verifyResetCodeSchema, type ForgotPasswordInput, type VerifyResetCodeInput } from "../schemas/authSchemas";
import { useForgotPassword, useVerifyResetCode } from "../api/useAuthMutations";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Card, { CardContent, CardHeader } from "@/components/ui/Card";
import OTPInput from "../components/OTPInput";

type Step = "email" | "code" | "reset";

/**
 * Forgot Password Page
 * Step 1: Enter email/username
 * Step 2: Enter verification code
 * Step 3: Reset password (handled by ResetPasswordPage)
 */
export default function ForgotPasswordPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [step, setStep] = useState<Step>("email");
  const [emailOrUsername, setEmailOrUsername] = useState("");
  const [maskedEmail, setMaskedEmail] = useState("");

  const forgotPasswordMutation = useForgotPassword();
  const verifyCodeMutation = useVerifyResetCode();

  // Email form
  const emailForm = useForm<ForgotPasswordInput>({
    resolver: zodResolver(forgotPasswordSchema),
  });

  // Code form
  const codeForm = useForm<VerifyResetCodeInput>({
    resolver: zodResolver(verifyResetCodeSchema),
  });

  const onEmailSubmit = async (data: ForgotPasswordInput) => {
    try {
      const response = await forgotPasswordMutation.mutateAsync(data);
      if (response.data.success) {
        setEmailOrUsername(data.email_or_username);
        setMaskedEmail(response.data.masked_email || "");
        setStep("code");
      }
    } catch {
      // Error handled by mutation
    }
  };

  const onCodeSubmit = async (data: VerifyResetCodeInput) => {
    try {
      const response = await verifyCodeMutation.mutateAsync({
        email_or_username: emailOrUsername,
        code: data.code,
      });

      if (response.data.success) {
        // Navigate to reset password page with code
        navigate("/auth/reset-password", {
          state: { emailOrUsername, code: data.code },
        });
      }
    } catch {
      // Error handled by mutation
    }
  };

  const handleOTPComplete = async (code: string) => {
    // Auto-submit when all 6 digits are filled
    try {
      const response = await verifyCodeMutation.mutateAsync({
        email_or_username: emailOrUsername,
        code: code,
      });

      if (response.data.success) {
        // Navigate to reset password page with code
        navigate("/auth/reset-password", {
          state: { emailOrUsername, code: code },
        });
      }
    } catch {
      // Error handled by mutation - will show error and shake
    }
  };

  const handleResendCode = async () => {
    try {
      await forgotPasswordMutation.mutateAsync({ email_or_username: emailOrUsername });
      codeForm.reset();
    } catch {
      // Error handled by mutation
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <div className="text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
              {step === "email" ? (
                <Mail className="h-6 w-6 text-primary" />
              ) : (
                <KeyRound className="h-6 w-6 text-primary" />
              )}
            </div>
            <h1 className="text-2xl font-bold text-text-primary">
              {step === "email"
                ? t("auth.forgotPasswordTitle", "Reset Your Password")
                : t("auth.verifyCodeTitle", "Enter Verification Code")}
            </h1>
            
            <p className="mt-2 text-sm text-text-secondary">
              {step === "email"
                ? t(
                    "auth.forgotPasswordSubtitle",
                    "Enter your email or username to receive a verification code"
                  )
                : t(
                    "auth.verifyCodeSubtitle",
                    "Enter the 6-digit code sent to {{email}}",
                    { email: maskedEmail }
                  )}
            </p>
          </div>
        </CardHeader>

        <CardContent>
          {step === "email" ? (
            // Email Step
            <form onSubmit={emailForm.handleSubmit(onEmailSubmit)} className="space-y-4">
              <Input
                label={t("auth.emailOrUsername", "Email or Username")}
                type="text"
                placeholder={t(
                  "auth.emailOrUsernamePlaceholder",
                  "Enter your email or username"
                )}
                leftIcon={<Mail className="h-5 w-5 text-text-muted" />}
                error={emailForm.formState.errors.email_or_username?.message}
                {...emailForm.register("email_or_username")}
              />

              <Button
                type="submit"
                variant="primary"
                fullWidth
                loading={forgotPasswordMutation.isPending}
              >
                {t("auth.sendCode", "Send Verification Code")}
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
          ) : (
            // Code Verification Step
            <form onSubmit={codeForm.handleSubmit(onCodeSubmit)} className="space-y-4">
              <div>
                <label className="mb-2 block text-sm font-medium text-text-primary">
                  {t("auth.verificationCode", "Verification Code")}
                </label>
                <OTPInput
                  length={6}
                  value={codeForm.watch("code") || ""}
                  onChange={(value) => codeForm.setValue("code", value)}
                  onComplete={handleOTPComplete}
                  disabled={verifyCodeMutation.isPending}
                  error={codeForm.formState.errors.code?.message}
                />
              </div>

              <div className="rounded-lg bg-warning/10 p-3 text-sm text-warning">
                <p className="font-medium">
                  {t("auth.codeExpiresIn", "Code expires in 15 minutes")}
                </p>
                <p className="mt-1 text-xs">
                  {t("auth.codeFiveAttempts", "You have 5 attempts to enter the correct code")}
                </p>
              </div>

              <Button
                type="submit"
                variant="primary"
                fullWidth
                loading={verifyCodeMutation.isPending}
              >
                {t("auth.verifyCode", "Verify Code")}
              </Button>

              <div className="space-y-2 text-center text-sm">
                <button
                  type="button"
                  onClick={handleResendCode}
                  disabled={forgotPasswordMutation.isPending}
                  className="text-primary hover:underline disabled:opacity-50"
                >
                  {t("auth.resendCode", "Resend Code")}
                </button>
                <div>
                  <button
                    type="button"
                    onClick={() => {
                      setStep("email");
                      codeForm.reset();
                    }}
                    className="inline-flex items-center gap-2 text-text-secondary hover:text-primary"
                  >
                    <ArrowLeft className="h-4 w-4" />
                    {t("auth.changeEmail", "Change Email/Username")}
                  </button>
                </div>
              </div>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
