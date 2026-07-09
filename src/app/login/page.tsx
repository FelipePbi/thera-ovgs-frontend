"use client";

import { Suspense } from "react";
import { AuthShellSkeleton } from "@/components/skeletons";
import LoginForm from "./LoginForm";

export default function LoginRoutePage() {
  return (
    <Suspense fallback={<AuthShellSkeleton />}>
      <LoginForm />
    </Suspense>
  );
}
