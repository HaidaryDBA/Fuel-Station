// components/ToastProvider.tsx
import React from "react";
import { Toaster } from "sonner";

export const ToastProvider: React.FC = () => {
  return (
    <Toaster
      position="top-center"
      richColors
      // Apply overall container padding/margin if you like
      // containerClassName="fixed top-5 right-5 z-50 space-y-2"

      toastOptions={{
        // Base styles for every toast
        className: "rounded-2xl p-4 shadow-lg",
        // Default duration
        duration: 4000,
        // Variant-specific overrides
        // success: {
        //   className:
        //     "bg-green-600 text-white border border-green-700 before:bg-green-300",
        //   iconTheme: {
        //     primary: "#ffffff",
        //     secondary: "#52c41a",
        //   },
        // },
        // error: {
        //   className: "bg-red-600 text-white border border-red-700",
        //   iconTheme: {
        //     primary: "#ffffff",
        //     secondary: "#f87171",
        //   },
        // },
      }}
    />
    // <Toaster
    //   position="top-center"
    //   richColors
    //   // To style the toaster container, use the standard 'className' prop
    //   // 'containerClassName' is not a valid prop on this component
    //   className="fixed top-5 right-5 z-50 space-y-2"
    //   // toastOptions is for global defaults that apply to all toasts
    //   toastOptions={{
    //     // Base styles for every toast
    //     className: "rounded-2xl p-4 shadow-lg",
    //     // Default duration for all toasts
    //     duration: 4000,
    //   }}
    // />
  );
};
