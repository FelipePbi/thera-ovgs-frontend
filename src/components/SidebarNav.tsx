"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  ClipboardList,
  FolderOpen,
  Activity,
  Database,
  ChevronDown,
  Users,
  Truck,
  Package,
  LogOut,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/features/auth/AuthProvider";

const flatNavItems = [
  { href: "/monitoramento", label: "Monitoramento", icon: Activity },
  { href: "/pedidos", label: "Pedidos", icon: ClipboardList },
] as const;

const cadastrosSubItems = [
  { href: "/cadastros/clients", label: "Clientes", icon: Users },
  { href: "/cadastros/transport-types", label: "Tipos de Transporte", icon: Truck },
  { href: "/cadastros/items", label: "Itens", icon: Package },
] as const;

const bottomNavItems = [
  { href: "/registro", label: "Auditoria", icon: Database },
] as const;

function NavLink({
  href,
  label,
  icon: Icon,
  isActive,
  indented,
}: {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  isActive: boolean;
  indented?: boolean;
}) {
  return (
    <Link
      href={href}
      className={cn(
        "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
        indented && "pl-9",
        isActive
          ? "bg-blue-600 text-white shadow-sm"
          : "text-slate-300 hover:bg-slate-800 hover:text-white",
      )}
    >
      <Icon className="h-4 w-4 shrink-0" />
      {label}
    </Link>
  );
}

export function SidebarNav() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuth();
  const isCadastrosRoute = pathname.startsWith("/cadastros");
  const [cadastrosOpen, setCadastrosOpen] = useState(isCadastrosRoute);

  useEffect(() => {
    if (isCadastrosRoute) {
      setCadastrosOpen(true);
    }
  }, [isCadastrosRoute]);

  function isActive(href: string) {
    return pathname === href || pathname.startsWith(`${href}/`);
  }

  function handleLogout() {
    logout();
    router.replace("/login");
  }

  return (
    <div className="flex h-[calc(100vh-4rem)] flex-col">
      <nav className="flex-1 space-y-1 overflow-y-auto p-4">
        {flatNavItems.map((item) => (
          <NavLink
            key={item.href}
            href={item.href}
            label={item.label}
            icon={item.icon}
            isActive={isActive(item.href)}
          />
        ))}

        <div>
          <button
            type="button"
            onClick={() => setCadastrosOpen((open) => !open)}
            className={cn(
              "flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
              isCadastrosRoute
                ? "bg-slate-800 text-white"
                : "text-slate-300 hover:bg-slate-800 hover:text-white",
            )}
            aria-expanded={cadastrosOpen}
          >
            <FolderOpen className="h-4 w-4 shrink-0" />
            <span className="flex-1 text-left">Cadastros</span>
            <ChevronDown
              className={cn(
                "h-4 w-4 shrink-0 transition-transform",
                cadastrosOpen && "rotate-180",
              )}
            />
          </button>

          {cadastrosOpen && (
            <div className="mt-1 space-y-1">
              {cadastrosSubItems.map((item) => (
                <NavLink
                  key={item.href}
                  href={item.href}
                  label={item.label}
                  icon={item.icon}
                  isActive={isActive(item.href)}
                  indented
                />
              ))}
            </div>
          )}
        </div>

        {bottomNavItems.map((item) => (
          <NavLink
            key={item.href}
            href={item.href}
            label={item.label}
            icon={item.icon}
            isActive={isActive(item.href)}
          />
        ))}
      </nav>

      <div className="space-y-2 border-t border-slate-700/80 p-4">
        {user && (
          <p className="truncate px-1 text-xs text-slate-400">
            {user.name} ({user.username})
          </p>
        )}
        <Button
          type="button"
          variant="outline"
          className="w-full justify-start gap-2 border-slate-600 bg-transparent text-slate-200 hover:bg-slate-800 hover:text-white"
          onClick={handleLogout}
        >
          <LogOut className="h-4 w-4" />
          Sair
        </Button>
      </div>
    </div>
  );
}
