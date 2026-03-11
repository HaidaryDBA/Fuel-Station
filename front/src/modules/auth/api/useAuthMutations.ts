import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { authService } from "./authService";
import type {
  ForgotPasswordRequest,
  VerifyResetCodeRequest,
  ResetPasswordRequest,
  VerifyEmailRequest,
} from "./authService";
import { extractAxiosError } from "@/utils/extractError";

/**
 * Extract error message from Axios error
 */


/**
 * Forgot Password Hook
 * Sends verification code to user's email
 */
export const useForgotPassword = () => {
  return useMutation({
    mutationFn: (data: ForgotPasswordRequest) =>
      authService.forgotPassword(data),
    onSuccess: (response) => {
      if (response.data.success) {
        toast.success(response.data.message);
      } else {
        toast.error(response.data.message);
      }
    },
    onError: (error) => {
      toast.error(extractAxiosError(error, "Failed to send verification code"));
    },
  });
};

/**
 * Verify Reset Code Hook
 * Verifies the 6-digit code
 */
export const useVerifyResetCode = () => {
  return useMutation({
    mutationFn: (data: VerifyResetCodeRequest) =>
      authService.verifyResetCode(data),
    onError: (error) => {
      toast.error(extractAxiosError(error, "Invalid verification code"));
    },
  });
};

/**
 * Reset Password Hook
 * Resets password using verification code
 */
export const useResetPassword = () => {
  const navigate = useNavigate();

  return useMutation({
    mutationFn: (data: ResetPasswordRequest) =>
      authService.resetPassword(data),
    onSuccess: (response) => {
      if (response.data.success) {
        toast.success(
          response.data.message || "Password reset successful! Redirecting..."
        );
        // Redirect to login after 2 seconds
        setTimeout(() => {
          navigate("/auth/login", { replace: true });
        }, 2000);
      } else {
        toast.error(response.data.message);
      }
    },
    onError: (error) => {
      const message = extractAxiosError(error, "Failed to reset password");
      toast.error(message);
    },
  });
};

/**
 * Verify Email Hook
 * Verifies user email using token
 */
export const useVerifyEmail = () => {
  const navigate = useNavigate();

  return useMutation({
    mutationFn: (data: VerifyEmailRequest) => authService.verifyEmail(data),
    onSuccess: (response) => {
      toast.success(
        response.data.message || "Email verified successfully!"
      );
      // Redirect to login after 3 seconds
      setTimeout(() => {
        navigate("/auth/login", { replace: true });
      }, 3000);
    },
    onError: (error) => {
      const message = extractAxiosError(error, "Email verification failed");
      toast.error(message);
    },
  });
};

/**
 * Resend Verification Hook
 * Resends verification email
 */
export const useResendVerification = () => {
  return useMutation({
    mutationFn: (email: string) => authService.resendVerificationEmail(email),
    onSuccess: () => {
      toast.success("Verification email sent! Please check your inbox.");
    },
    onError: (error) => {
      toast.error(extractAxiosError(error, "Failed to resend verification email"));
    },
  });
};

/**
 * Refresh Session Hook
 * Keeps user session alive
 */
export const useRefreshSession = () => {
  return useMutation({
    mutationFn: () => authService.refreshSession(),
    onError: (error) => {
      console.error("Failed to refresh session:", error);
    },
  });
};
