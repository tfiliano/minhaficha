"use client";

import { useState, useEffect } from "react";
import { Title } from "@/components/layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Shield, Save, AlertCircle, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import {
  getRecursosComPermissoes,
  toggleRolePermissao,
  type UserType,
  type RecursoComPermissoes,
} from "./actions";
import { Alert, AlertDescription } from "@/components/ui/alert";

const ROLES: { value: UserType; label: string; description: string }[] = [
  {
    value: "master",
    label: "Master",
    description: "Acesso total ao sistema (não editável)",
  },
  {
    value: "admin",
    label: "Administrador",
    description: "Acesso administrativo completo",
  },
  {
    value: "manager",
    label: "Gerente",
    description: "Gerenciamento de produtos e operações",
  },
  {
    value: "operator",
    label: "Operador",
    description: "Operações de produção e entrada",
  },
  {
    value: "user",
    label: "Usuário",
    description: "Apenas visualização",
  },
];

export default function PermissoesPage() {
  const [selectedRole, setSelectedRole] = useState<UserType>("admin");
  const [recursos, setRecursos] = useState<RecursoComPermissoes[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    loadPermissoes();
  }, [selectedRole]);

  async function loadPermissoes() {
    setLoading(true);
    setHasChanges(false);

    const result = await getRecursosComPermissoes(selectedRole);

    if (result.success && result.data) {
      setRecursos(result.data);
    } else {
      toast.error("Erro ao carregar permissões");
    }

    setLoading(false);
  }

  async function handleTogglePermissao(
    recursoId: string,
    acao: "read" | "create" | "update" | "delete",
    permissaoId: string,
    currentValue: boolean
  ) {
    if (selectedRole === "master") {
      toast.error("Permissões do Master não podem ser alteradas");
      return;
    }

    const newValue = !currentValue;

    // Atualizar localmente
    setRecursos((prev) =>
      prev.map((r) =>
        r.id === recursoId
          ? {
              ...r,
              permissoes: {
                ...r.permissoes,
                [acao]: {
                  ...r.permissoes[acao],
                  habilitado: newValue,
                },
              },
            }
          : r
      )
    );

    setHasChanges(true);

    // Salvar no banco
    const result = await toggleRolePermissao(selectedRole, permissaoId, newValue);

    if (!result.success) {
      toast.error("Erro ao atualizar permissão");
      // Reverter mudança local
      loadPermissoes();
    }
  }

  function countPermissoes() {
    let total = 0;
    let habilitadas = 0;

    recursos.forEach((r) => {
      total += 4; // read, create, update, delete
      if (r.permissoes.read.habilitado) habilitadas++;
      if (r.permissoes.create.habilitado) habilitadas++;
      if (r.permissoes.update.habilitado) habilitadas++;
      if (r.permissoes.delete.habilitado) habilitadas++;
    });

    return { total, habilitadas };
  }

  const roleInfo = ROLES.find((r) => r.value === selectedRole);
  const { total, habilitadas } = countPermissoes();

  return (
    <div className="container mx-auto p-4 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <Title>Gerenciamento de Permissões</Title>
          <p className="text-sm text-muted-foreground mt-1">
            Configure as permissões de acesso por função (role)
          </p>
        </div>
        <Shield className="h-8 w-8 text-primary" />
      </div>

      {/* Seletor de Role */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Selecionar Função</CardTitle>
          <CardDescription>
            Escolha a função para visualizar e editar suas permissões
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="role">Função</Label>
            <Select value={selectedRole} onValueChange={(v) => setSelectedRole(v as UserType)}>
              <SelectTrigger id="role">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {ROLES.map((role) => (
                  <SelectItem key={role.value} value={role.value}>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{role.label}</span>
                      <span className="text-xs text-muted-foreground">
                        - {role.description}
                      </span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {roleInfo && (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                <strong>{roleInfo.label}:</strong> {roleInfo.description}
                <div className="mt-2 flex items-center gap-2">
                  <Badge variant="outline">
                    {habilitadas} de {total} permissões habilitadas
                  </Badge>
                </div>
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Tabela de Permissões */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Permissões por Recurso</CardTitle>
          <CardDescription>
            Marque as ações que esta função pode realizar em cada recurso
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b bg-muted/50">
                    <th className="text-left p-3 font-semibold">Recurso</th>
                    <th className="text-center p-3 font-semibold">Visualizar</th>
                    <th className="text-center p-3 font-semibold">Criar</th>
                    <th className="text-center p-3 font-semibold">Editar</th>
                    <th className="text-center p-3 font-semibold">Deletar</th>
                  </tr>
                </thead>
                <tbody>
                  {recursos.map((recurso) => (
                    <tr key={recurso.id} className="border-b hover:bg-muted/30">
                      <td className="p-3">
                        <div>
                          <div className="font-medium">{recurso.nome}</div>
                          {recurso.descricao && (
                            <div className="text-xs text-muted-foreground">
                              {recurso.descricao}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="text-center p-3">
                        <Checkbox
                          checked={recurso.permissoes.read.habilitado}
                          onCheckedChange={() =>
                            handleTogglePermissao(
                              recurso.id,
                              "read",
                              recurso.permissoes.read.id,
                              recurso.permissoes.read.habilitado
                            )
                          }
                          disabled={selectedRole === "master"}
                        />
                      </td>
                      <td className="text-center p-3">
                        <Checkbox
                          checked={recurso.permissoes.create.habilitado}
                          onCheckedChange={() =>
                            handleTogglePermissao(
                              recurso.id,
                              "create",
                              recurso.permissoes.create.id,
                              recurso.permissoes.create.habilitado
                            )
                          }
                          disabled={selectedRole === "master"}
                        />
                      </td>
                      <td className="text-center p-3">
                        <Checkbox
                          checked={recurso.permissoes.update.habilitado}
                          onCheckedChange={() =>
                            handleTogglePermissao(
                              recurso.id,
                              "update",
                              recurso.permissoes.update.id,
                              recurso.permissoes.update.habilitado
                            )
                          }
                          disabled={selectedRole === "master"}
                        />
                      </td>
                      <td className="text-center p-3">
                        <Checkbox
                          checked={recurso.permissoes.delete.habilitado}
                          onCheckedChange={() =>
                            handleTogglePermissao(
                              recurso.id,
                              "delete",
                              recurso.permissoes.delete.id,
                              recurso.permissoes.delete.habilitado
                            )
                          }
                          disabled={selectedRole === "master"}
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {hasChanges && (
            <Alert className="mt-4 border-green-200 bg-green-50 dark:bg-green-900/20">
              <CheckCircle2 className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-800 dark:text-green-200">
                As alterações foram salvas automaticamente.
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
