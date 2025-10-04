"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, CheckCircle2, XCircle, Mail, Lock, User } from "lucide-react";
import { toast } from "sonner";
import { acceptInvite, validateInviteToken } from "./actions";

function AcceptInviteContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [loading, setLoading] = useState(true);
  const [validating, setValidating] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [inviteData, setInviteData] = useState<any>(null);
  const [error, setError] = useState("");

  // Form state
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  useEffect(() => {
    if (!token) {
      setError("Token de convite não encontrado");
      setValidating(false);
      setLoading(false);
      return;
    }

    validateToken();
  }, [token]);

  async function validateToken() {
    try {
      const result = await validateInviteToken(token!);

      if (!result.success) {
        setError(result.error || "Convite inválido ou expirado");
        setValidating(false);
        setLoading(false);
        return;
      }

      setInviteData(result.data);
      setValidating(false);
      setLoading(false);
    } catch (error) {
      console.error("Erro ao validar token:", error);
      setError("Erro ao validar convite");
      setValidating(false);
      setLoading(false);
    }
  }

  async function handleAccept() {
    if (inviteData.needsAccount) {
      if (!name || !password || !confirmPassword) {
        toast.error("Preencha todos os campos");
        return;
      }

      if (password !== confirmPassword) {
        toast.error("As senhas não coincidem");
        return;
      }

      if (password.length < 6) {
        toast.error("A senha deve ter no mínimo 6 caracteres");
        return;
      }
    }

    setProcessing(true);

    try {
      const result = await acceptInvite(
        token!,
        inviteData.needsAccount ? { name, password } : undefined
      );

      if (result.success) {
        toast.success(result.message);
        // Redirecionar após 1 segundo
        setTimeout(() => {
          router.push("/home");
        }, 1000);
      } else {
        toast.error(result.error || "Erro ao aceitar convite");
        setProcessing(false);
      }
    } catch (error) {
      console.error("Erro ao aceitar convite:", error);
      toast.error("Erro ao processar convite");
      setProcessing(false);
    }
  }

  if (loading || validating) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-blue-100 dark:from-gray-900 dark:to-gray-800 p-4">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="flex flex-col items-center gap-4 py-8">
              <Loader2 className="h-12 w-12 animate-spin text-blue-600" />
              <p className="text-muted-foreground">Validando convite...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error || !inviteData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-blue-100 dark:from-gray-900 dark:to-gray-800 p-4">
        <Card className="w-full max-w-md border-red-200">
          <CardHeader>
            <div className="flex items-center gap-3">
              <XCircle className="h-8 w-8 text-red-600" />
              <div>
                <CardTitle className="text-red-600">Convite Inválido</CardTitle>
                <CardDescription>{error}</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Button
              onClick={() => router.push("/auth/login")}
              variant="outline"
              className="w-full"
            >
              Ir para Login
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-blue-100 dark:from-gray-900 dark:to-gray-800 p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <div className="flex items-center gap-3">
            <CheckCircle2 className="h-8 w-8 text-green-600" />
            <div>
              <CardTitle>Convite para {inviteData.lojaNome}</CardTitle>
              <CardDescription>
                Você foi convidado por {inviteData.inviterName}
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-blue-50 dark:bg-blue-950 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
            <div className="flex items-center gap-2 text-sm">
              <Mail className="h-4 w-4 text-blue-600" />
              <span className="font-medium">{inviteData.email}</span>
            </div>
            <div className="mt-2 text-sm text-muted-foreground">
              Permissão: <span className="font-medium">{inviteData.roleLabel}</span>
            </div>
          </div>

          {inviteData.needsAccount ? (
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Você ainda não possui uma conta. Preencha os dados abaixo para criar sua conta:
              </p>

              <div className="space-y-2">
                <Label htmlFor="name">Nome Completo</Label>
                <div className="relative">
                  <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="name"
                    type="text"
                    placeholder="Seu nome completo"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="pl-10"
                    disabled={processing}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Senha</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="password"
                    type="password"
                    placeholder="Mínimo 6 caracteres"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10"
                    disabled={processing}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirm-password">Confirmar Senha</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="confirm-password"
                    type="password"
                    placeholder="Digite a senha novamente"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="pl-10"
                    disabled={processing}
                  />
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-green-50 dark:bg-green-950 p-4 rounded-lg border border-green-200 dark:border-green-800">
              <p className="text-sm text-green-800 dark:text-green-200">
                ✓ Você já possui uma conta. Clique em aceitar para acessar a loja.
              </p>
            </div>
          )}

          <div className="flex gap-2 pt-4">
            <Button
              variant="outline"
              onClick={() => router.push("/auth/login")}
              disabled={processing}
              className="w-full"
            >
              Cancelar
            </Button>
            <Button
              onClick={handleAccept}
              disabled={processing}
              className="w-full"
            >
              {processing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processando...
                </>
              ) : (
                "Aceitar Convite"
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default function AcceptInvitePage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-blue-100 dark:from-gray-900 dark:to-gray-800 p-4">
          <Card className="w-full max-w-md">
            <CardContent className="pt-6">
              <div className="flex flex-col items-center gap-4 py-8">
                <Loader2 className="h-12 w-12 animate-spin text-blue-600" />
                <p className="text-muted-foreground">Carregando...</p>
              </div>
            </CardContent>
          </Card>
        </div>
      }
    >
      <AcceptInviteContent />
    </Suspense>
  );
}
