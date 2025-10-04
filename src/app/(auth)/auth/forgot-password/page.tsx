"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { KeyRound, Mail, Sparkles } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { toast } from "sonner";
import { sendPasswordResetEmail, sendMagicLink } from "./actions";

export default function Page() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [mode, setMode] = useState<"reset" | "magic">("reset");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const result = mode === "reset"
        ? await sendPasswordResetEmail(email)
        : await sendMagicLink(email);

      if (!result.success) {
        toast.error("Erro ao enviar email", {
          description: result.error,
        });
        setIsLoading(false);
        return;
      }

      setEmailSent(true);
      toast.success("Email enviado!", {
        description: mode === "reset"
          ? "Verifique sua caixa de entrada para redefinir sua senha."
          : "Verifique sua caixa de entrada para acessar com o link mágico.",
      });
    } catch (error: any) {
      toast.error("Erro ao enviar email", {
        description: error?.message || "Tente novamente mais tarde.",
      });
      setIsLoading(false);
    }
  };

  if (emailSent) {
    return (
      <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl shadow-2xl p-8 border border-slate-200 dark:border-slate-700">
        <div className="text-center">
          <div className="inline-flex p-4 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl mb-6">
            <Mail className="h-12 w-12 text-white" />
          </div>
          <h1 className="font-bold mb-3 text-2xl">Email enviado!</h1>
          <p className="text-sm text-muted-foreground mb-6">
            Verifique sua caixa de entrada e clique no link para redefinir sua senha.
          </p>
          <Button variant="link" className="text-sm" asChild>
            <Link href="/auth/login">Voltar para login</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl shadow-2xl p-8 border border-slate-200 dark:border-slate-700">
      {/* Ícone */}
      <div className="flex flex-col items-center mb-8">
        <div className="p-4 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl mb-4">
          {mode === "reset" ? (
            <KeyRound className="h-12 w-12 text-white" />
          ) : (
            <Sparkles className="h-12 w-12 text-white" />
          )}
        </div>
        <h1 className="text-2xl font-bold mb-2">
          {mode === "reset" ? "Recuperar senha" : "Login sem senha"}
        </h1>
        <p className="text-sm text-muted-foreground text-center">
          {mode === "reset"
            ? "Digite seu email para receber um link de recuperação"
            : "Digite seu email para receber um link mágico de acesso"}
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6 p-1 bg-slate-100 dark:bg-slate-800 rounded-lg">
        <button
          type="button"
          onClick={() => setMode("reset")}
          className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all ${
            mode === "reset"
              ? "bg-white dark:bg-slate-900 shadow-sm"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          Redefinir senha
        </button>
        <button
          type="button"
          onClick={() => setMode("magic")}
          className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all ${
            mode === "magic"
              ? "bg-white dark:bg-slate-900 shadow-sm"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          Link mágico
        </button>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
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

        <Button
          type="submit"
          className="w-full h-12 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold"
          disabled={isLoading}
        >
          {isLoading
            ? "Enviando..."
            : mode === "reset"
            ? "Enviar link de recuperação"
            : "Enviar link mágico"}
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
