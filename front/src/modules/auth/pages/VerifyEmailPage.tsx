import { useEffect, useState } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { CheckCircle, XCircle, Mail, ArrowLeft } from "lucide-react";
import { useVerifyEmail, useResendVerification } from "../api/useAuthMutations";
import Button from "@/components/ui/Button";
import Card, { CardContent } from "@/components/ui/Card";
import Spinner from "@/components/ui/Spinner";

/**
 * Verify Email Page
 * Automatically verifies email using token from URL
 */
export default function VerifyEmailPage() {
  const { t } = useTranslation();
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();
  const [countdown, setCountdown] = useState(3);
  const [email, setEmail] = useState<string>("");

  const verifyEmailMutation = useVerifyEmail();
  const resendMutation = useResendVerification();

  const isSuccess = verifyEmailMutation.isSuccess;
  const isError = verifyEmailMutation.isError;
  const isLoading = verifyEmailMutation.isPending;

  // Auto-verify on mount
  useEffect(() => {
    if (token) {
      verifyEmailMutation.mutate({ token });
    } else {
      // Invalid token - no token in URL
      verifyEmailMutation.reset();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  // Store email from response
  useEffect(() => {
    if (verifyEmailMutation.data?.data?.email) {
      setEmail(verifyEmailMutation.data.data.email);
    }
  }, [verifyEmailMutation.data]);

  // Countdown redirect on success
  useEffect(() => {
    if (isSuccess && countdown > 0) {
      const timer = setTimeout(() => {
        setCountdown(countdown - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else if (isSuccess && countdown === 0) {
      navigate("/auth/login");
    }
  }, [isSuccess, countdown, navigate]);

  const handleResend = () => {
    if (email) {
      resendMutation.mutate(email);
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Card className="w-full max-w-md">
          <CardContent className="py-12">
            <div className="space-y-4 text-center">
              <Spinner size="lg" />
              <p className="text-sm text-text-secondary">
                {t("auth.verifyingEmail", "Verifying your email...")}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Success state
  if (isSuccess) {
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
                  {t("auth.emailVerifiedTitle", "Email Verified!")}
                </h3>
                <p className="mt-2 text-sm text-text-secondary">
                  {t(
                    "auth.emailVerifiedMessage",
                    "Your email has been successfully verified. You can now log in to your account."
                  )}
                </p>
                <p className="mt-4 text-sm text-text-muted">
                  {t(
                    "auth.redirectingIn",
                    "Redirecting to login in {seconds} seconds...",
                    { seconds: countdown }
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

  // Error state
  if (isError || !token) {
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
                  {t("auth.verificationFailed", "Verification Failed")}
                </h3>
                <p className="mt-2 text-sm text-text-secondary">
                  {t(
                    "auth.verificationFailedMessage",
                    "The verification link is invalid or has expired. Please request a new verification email."
                  )}
                </p>
              </div>
              <div className="flex flex-col gap-2 pt-4">
                {email && (
                  <Button
                    variant="primary"
                    fullWidth
                    onClick={handleResend}
                    loading={resendMutation.isPending}
                    leftIcon={<Mail className="h-5 w-5" />}
                  >
                    {t("auth.resendVerification", "Resend Verification Email")}
                  </Button>
                )}
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

  return null;
}
