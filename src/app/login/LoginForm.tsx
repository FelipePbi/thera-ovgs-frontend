"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import toast from "react-hot-toast";
import axios from "axios";
import { AuthShellSkeleton } from "@/components/skeletons";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/features/auth/AuthProvider";

const loginSchema = z.object({
  username: z.string().min(1, "Informe o usuário"),
  password: z.string().min(1, "Informe a senha"),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export default function LoginForm() {
  const { login, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = searchParams.get("next") || "/monitoramento";

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { username: "", password: "" },
  });

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      router.replace(next);
    }
  }, [isAuthenticated, isLoading, next, router]);

  async function onSubmit(values: LoginFormValues) {
    try {
      await login(values.username, values.password);
      toast.success("Login realizado com sucesso");
      router.replace(next);
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status === 401) {
        toast.error("Usuário ou senha inválidos");
        return;
      }
      toast.error("Erro ao fazer login");
    }
  }

  if (isLoading || isAuthenticated) {
    return <AuthShellSkeleton />;
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-900 p-4">
      <div className="w-full max-w-sm space-y-6 rounded-xl border border-slate-700 bg-slate-800 p-6 shadow-xl shadow-black/20">
        <div className="space-y-1 text-center">
          <h1 className="text-2xl font-bold text-white">Thera - OVGS</h1>
          <p className="text-sm text-slate-400">Entre com suas credenciais</p>
        </div>
        <form className="space-y-4" onSubmit={form.handleSubmit(onSubmit)}>
          <div className="space-y-1">
            <label htmlFor="username" className="text-sm font-medium text-slate-200">
              Usuário
            </label>
            <Input
              id="username"
              autoComplete="username"
              className="border-slate-600 bg-slate-900 text-slate-100 placeholder:text-slate-500"
              {...form.register("username")}
            />
            {form.formState.errors.username && (
              <p className="text-xs text-red-400">
                {form.formState.errors.username.message}
              </p>
            )}
          </div>
          <div className="space-y-1">
            <label htmlFor="password" className="text-sm font-medium text-slate-200">
              Senha
            </label>
            <Input
              id="password"
              type="password"
              autoComplete="current-password"
              className="border-slate-600 bg-slate-900 text-slate-100 placeholder:text-slate-500"
              {...form.register("password")}
            />
            {form.formState.errors.password && (
              <p className="text-xs text-red-400">
                {form.formState.errors.password.message}
              </p>
            )}
          </div>
          <Button
            type="submit"
            className="w-full bg-blue-600 text-white hover:bg-blue-500"
            disabled={form.formState.isSubmitting}
          >
            {form.formState.isSubmitting ? "Entrando..." : "Entrar"}
          </Button>
        </form>
        <p className="text-center text-xs text-slate-500">
          Usuário: teste · Senha: 123456
        </p>
      </div>
    </div>
  );
}
