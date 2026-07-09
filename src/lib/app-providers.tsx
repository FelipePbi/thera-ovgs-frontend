"use client";

import { QueryProvider } from "@/lib/query-provider";
import { ReduxProvider } from "@/lib/redux-provider";
import { MswProvider } from "@/lib/msw-provider";
import { AuthProvider } from "@/features/auth/AuthProvider";

export function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <MswProvider>
      <QueryProvider>
        <ReduxProvider>
          <AuthProvider>{children}</AuthProvider>
        </ReduxProvider>
      </QueryProvider>
    </MswProvider>
  );
}
