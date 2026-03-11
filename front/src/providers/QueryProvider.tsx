// providers/QueryProvider.tsx
import { QueryClientProvider } from "@tanstack/react-query";
import { type ReactNode } from "react";
import { queryClient } from "../lib/queryClient";

interface QueryProviderProps {
  children: ReactNode;
}

export const QueryProvider = ({ children }: QueryProviderProps) => {
  return (
    <QueryClientProvider client={queryClient}>
      {children}
      {/* Only show devtools in development */}
      {/* {process.env.NODE_ENV === "development" && (
        <ReactQueryDevtools initialIsOpen={false} />
      )} */}
    </QueryClientProvider>
  );
};
