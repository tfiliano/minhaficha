"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useState } from "react";
import { toast } from "sonner";
import { UserPlus } from "lucide-react";

interface AssignUserProps {
  lojaId: string;
  lojaNome: string;
  onUserAssigned?: () => void;
}

export function AssignUserToStore({ lojaId, lojaNome, onUserAssigned }: AssignUserProps) {
  const [userEmail, setUserEmail] = useState("");
  const [tipo, setTipo] = useState("admin");
  const [loading, setLoading] = useState(false);

  const handleAssign = async () => {
    if (!userEmail.trim()) {
      toast.error("Email é obrigatório");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch("/api/master/assign-user-to-store", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userEmail: userEmail.trim(),
          lojaId,
          tipo
        }),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success(data.message || "Usuário atribuído com sucesso!");
        setUserEmail("");
        onUserAssigned?.();
      } else {
        toast.error(data.error || "Erro ao atribuir usuário");
      }
    } catch (error) {
      console.error("Erro:", error);
      toast.error("Erro inesperado");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <UserPlus className="w-5 h-5" />
          Atribuir Usuário à Loja
        </CardTitle>
        <CardDescription>
          Adicione um usuário à loja <strong>{lojaNome}</strong>
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="userEmail">Email do Usuário</Label>
          <Input
            id="userEmail"
            type="email"
            value={userEmail}
            onChange={(e) => setUserEmail(e.target.value)}
            placeholder="usuario@exemplo.com"
            disabled={loading}
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="tipo">Tipo de Acesso</Label>
          <Select value={tipo} onValueChange={setTipo} disabled={loading}>
            <SelectTrigger>
              <SelectValue placeholder="Selecione o tipo" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="admin">Admin</SelectItem>
              <SelectItem value="manager">Manager</SelectItem>
              <SelectItem value="operator">Operador</SelectItem>
              <SelectItem value="user">Usuário</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <Button
          onClick={handleAssign}
          disabled={loading || !userEmail.trim()}
          className="w-full"
        >
          {loading ? "Atribuindo..." : "Atribuir Usuário"}
        </Button>
      </CardContent>
    </Card>
  );
}