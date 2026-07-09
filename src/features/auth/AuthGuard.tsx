"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { AuthShellSkeleton } from "@/components/skeletons";
import { useAuth } from "@/features/auth/AuthProvider";

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      const next =
        pathname && pathname !== "/login"
          ? `?next=${encodeURIComponent(pathname)}`
          : "";
      router.replace(`/login${next}`);
    }
  }, [isAuthenticated, isLoading, pathname, router]);

  if (isLoading) {
    return <AuthShellSkeleton />;
  }

  if (!isAuthenticated) {
    return null;
  }

  return <>{children}</>;
}
