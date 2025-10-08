"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { useSearchParams } from "@/hooks/use-router";
import { generateToastPromise } from "@/lib/toast";
import { createBrowserClient } from "@/utils/supabase-browser";
import { Lightbulb, Mail } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { toast } from "sonner";
import { login } from "../server-action";

export function PageClient() {
  const params = useSearchParams();
  const supabase = createBrowserClient();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [magicLinkSent, setMagicLinkSent] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await generateToastPromise({
        action: login,
        actionData: { email, password },
        successMessage: "Autenticado com sucesso!",
        loadingMessage: "Autenticando...",
      });
      const redirectTo = params.get("nextUrl") || response?.redirect || "/operador";

      // Usar window.location.href para forçar reload completo e garantir cookies
      window.location.href = redirectTo;
    } catch (error) {
      setIsLoading(false);
    }
  };

  const handleMagicLink = async () => {
    if (!email) {
      toast.error("Digite seu email");
      return;
    }

    setIsLoading(true);
    try {
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (error) {
        toast.error("Erro ao enviar magic link", {
          description: error.message,
        });
        setIsLoading(false);
        return;
      }

      setMagicLinkSent(true);
      toast.success("Magic link enviado!", {
        description: "Verifique sua caixa de entrada.",
      });
    } catch (error: any) {
      toast.error("Erro ao enviar magic link");
      setIsLoading(false);
    }
  };

  if (magicLinkSent) {
    return (
      <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl shadow-2xl p-8 border border-slate-200 dark:border-slate-700">
        <div className="text-center">
          <div className="inline-flex p-4 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl mb-6">
            <Mail className="h-12 w-12 text-white" />
          </div>
          <h1 className="font-bold mb-3 text-2xl">Email enviado!</h1>
          <p className="text-sm text-muted-foreground mb-6">
            Verifique sua caixa de entrada e clique no link para fazer login.
          </p>
          <Button
            variant="link"
            className="text-sm"
            onClick={() => setMagicLinkSent(false)}
          >
            Voltar
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl shadow-2xl p-8 border border-slate-200 dark:border-slate-700">
      {/* Logo */}
      <div className="flex flex-col items-center mb-8">
        <div className="p-4 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl mb-4">
          <Lightbulb className="h-12 w-12 text-white" />
        </div>
        <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-blue-700 bg-clip-text text-transparent">
          Minha Ficha
        </h1>
        <p className="text-sm text-muted-foreground mt-2">
          Entre com sua conta
        </p>
      </div>

      {/* Form */}
      <form onSubmit={handleLogin} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            placeholder="email@exemplo.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoComplete="username"
            className="h-11"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="password">Senha</Label>
          <Input
            id="password"
            type="password"
            placeholder="Sua senha"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            autoComplete="current-password"
            className="h-11"
          />
        </div>

        <Button
          type="submit"
          className="w-full h-12 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold"
          disabled={isLoading}
        >
          Entrar
        </Button>
      </form>

      {/* Divider */}
      <div className="relative my-6">
        <Separator />
        <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-white dark:bg-slate-900 px-3 text-xs text-muted-foreground">
          ou
        </span>
      </div>

      {/* Magic Link Button */}
      <Button
        type="button"
        variant="outline"
        className="w-full h-12"
        onClick={handleMagicLink}
        disabled={isLoading}
      >
        <Mail className="h-4 w-4 mr-2" />
        Receber link no email
      </Button>

      {/* Links */}
      <div className="flex flex-col items-center gap-2 mt-6">
        <Button variant="link" className="text-sm" asChild>
          <Link href="/auth/forgot-password">Esqueci minha senha</Link>
        </Button>
      </div>
    </div>
  );
}
