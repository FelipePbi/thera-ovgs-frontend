"use client";

import { AuthGuard } from "@/features/auth/AuthGuard";
import { SidebarNav } from "@/components/SidebarNav";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthGuard>
      <div className="flex min-h-screen">
        <aside className="hidden w-64 shrink-0 bg-slate-900 text-slate-100 md:block">
          <div className="flex h-16 items-center border-b border-slate-700/80 px-6">
            <span className="text-lg font-semibold tracking-tight text-white">
              Thera - OVGS
            </span>
          </div>
          <SidebarNav />
        </aside>
        <main className="flex-1 bg-slate-50 p-6 md:p-8">{children}</main>
      </div>
    </AuthGuard>
  );
}
