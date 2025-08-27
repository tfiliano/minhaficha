"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useState } from "react";
import { toast } from "sonner";

export default function SetupMasterPage() {
  const [email, setEmail] = useState("eliomaralves79@gmail.com");
  const [loading, setLoading] = useState(false);

  const handleSetup = async () => {
    if (!email) {
      toast.error("Email é obrigatório");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch("/api/setup-master", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success("Usuário configurado como master com sucesso!");
        // Redirecionar para dashboard após 2 segundos
        setTimeout(() => {
          window.location.href = "/dashboard";
        }, 2000);
      } else {
        toast.error(data.error || "Erro ao configurar usuário master");
      }
    } catch (error) {
      console.error("Erro:", error);
      toast.error("Erro inesperado");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle>Configuração Master</CardTitle>
          <CardDescription>
            Configure um usuário como administrador master do sistema
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email do Usuário</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="usuario@exemplo.com"
            />
          </div>
          
          <Button
            onClick={handleSetup}
            disabled={loading || !email}
            className="w-full"
          >
            {loading ? "Configurando..." : "Configurar como Master"}
          </Button>

          <div className="text-sm text-muted-foreground text-center">
            <p>⚠️ Esta página é apenas para configuração inicial</p>
            <p>Remova após configurar os usuários masters necessários</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}