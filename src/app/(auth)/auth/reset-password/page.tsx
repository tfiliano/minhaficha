"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createBrowserClient } from "@/utils/supabase-browser";
import { CheckCircle2, Lock } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

export default function Page() {
  const router = useRouter();
  const supabase = createBrowserClient();

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [passwordReset, setPasswordReset] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      toast.error("As senhas não coincidem");
      return;
    }

    if (password.length < 6) {
      toast.error("A senha precisa ter pelo menos 6 caracteres");
      return;
    }

    setIsLoading(true);

    try {
      const { error } = await supabase.auth.updateUser({
        password: password,
      });

      if (error) {
        toast.error("Erro ao redefinir senha", {
          description: error.message,
        });
        setIsLoading(false);
        return;
      }

      setPasswordReset(true);
      toast.success("Senha redefinida!", {
        description: "Você já pode fazer login com sua nova senha.",
      });

      setTimeout(() => {
        router.replace("/auth/login");
      }, 2000);
    } catch (error: any) {
      toast.error("Erro ao redefinir senha", {
        description: error?.message || "Tente novamente mais tarde.",
      });
      setIsLoading(false);
    }
  };

  if (passwordReset) {
    return (
      <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl shadow-2xl p-8 border border-slate-200 dark:border-slate-700">
        <div className="text-center">
          <div className="inline-flex p-4 bg-gradient-to-br from-green-500 to-emerald-500 rounded-2xl mb-6">
            <CheckCircle2 className="h-12 w-12 text-white" />
          </div>
          <h1 className="font-bold mb-3 text-2xl">Senha redefinida!</h1>
          <p className="text-sm text-muted-foreground mb-6">
            Redirecionando para o login...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl shadow-2xl p-8 border border-slate-200 dark:border-slate-700">
      {/* Ícone */}
      <div className="flex flex-col items-center mb-8">
        <div className="p-4 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl mb-4">
          <Lock className="h-12 w-12 text-white" />
        </div>
        <h1 className="text-2xl font-bold mb-2">Redefinir senha</h1>
        <p className="text-sm text-muted-foreground text-center">
          Digite sua nova senha abaixo
        </p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="password">Nova senha</Label>
          <Input
            id="password"
            type="password"
            placeholder="Digite sua nova senha"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            autoComplete="new-password"
            className="h-11"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="confirmPassword">Confirmar senha</Label>
          <Input
            id="confirmPassword"
            type="password"
            placeholder="Digite novamente"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            autoComplete="new-password"
            className="h-11"
          />
        </div>

        <Button
          type="submit"
          className="w-full h-12 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold"
          disabled={isLoading}
        >
          {isLoading ? "Redefinindo..." : "Redefinir senha"}
        </Button>
      </form>

      {/* Link */}
      <div className="flex flex-col items-center gap-2 mt-6">
        <Button variant="link" className="text-sm" asChild>
          <Link href="/auth/login">Voltar para login</Link>
        </Button>
      </div>
    </div>
  );
}
