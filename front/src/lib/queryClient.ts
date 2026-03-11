import { QueryClient } from "@tanstack/react-query";
import type { AxiosError } from "axios";

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minute
      gcTime: 10 * 60 * 1000, // 10 minutes
      retry: (failureCount, e) => {
        const error = e as AxiosError;
        // Don't retry on 4xx errors (client errors)
        if (
          (error.response?.status || 0) >= 400 &&
          (error.response?.status || 0) < 500
        ) {
          return false;
        }
        // Retry up to 3 times for other errors
        return failureCount < 3;
      },
      refetchOnWindowFocus: false,
    },
    mutations: {
      retry: 1,
    },
  },
});
