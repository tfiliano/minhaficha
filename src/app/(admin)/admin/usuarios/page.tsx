"use client";

import { useState, useEffect } from "react";
import { Title } from "@/components/layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Users, Edit, Shield, UserPlus, Mail, Loader2, X, Copy, Clock, Send } from "lucide-react";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { getUsuariosDaLoja, updateUsuarioRole, toggleUsuarioAtivo, inviteUser, getPendingInvites, cancelInvite, resendInvite } from "./actions";

const ROLES = [
  { value: "master", label: "Master", description: "Acesso total" },
  { value: "admin", label: "Admin", description: "Administrativo completo" },
  { value: "manager", label: "Gerente", description: "Gerenciamento" },
  { value: "operator", label: "Operador", description: "Operações" },
  { value: "user", label: "Usuário", description: "Visualização" },
];

interface Usuario {
  id: string;
  name: string;
  email: string;
  type: string;
  ativo: boolean;
  created_at: string;
}

interface Invite {
  id: string;
  email: string;
  tipo: string;
  status: string;
  token: string;
  expires_at: string;
  created_at: string;
  invited_by: string;
  usuarios: {
    name: string;
  };
}

export default function UsuariosPage() {
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [invites, setInvites] = useState<Invite[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingUser, setEditingUser] = useState<Usuario | null>(null);
  const [editRole, setEditRole] = useState("");
  const [inviteDialogOpen, setInviteDialogOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState("user");
  const [invitingUser, setInvitingUser] = useState(false);

  useEffect(() => {
    loadUsuarios();
    loadInvites();
  }, []);

  async function loadUsuarios() {
    setLoading(true);
    const result = await getUsuariosDaLoja();

    if (result.success) {
      setUsuarios(result.data as Usuario[]);
    } else {
      toast.error("Erro ao carregar usuários");
    }

    setLoading(false);
  }

  async function loadInvites() {
    const result = await getPendingInvites();

    if (result.success) {
      setInvites(result.data as Invite[]);
    }
  }

  async function handleToggleAtivo(userId: string, ativo: boolean) {
    const result = await toggleUsuarioAtivo(userId, ativo);

    if (result.success) {
      toast.success(result.message);
      loadUsuarios();
    } else {
      toast.error("Erro ao atualizar usuário");
    }
  }

  async function handleUpdateRole() {
    if (!editingUser) return;

    const result = await updateUsuarioRole(editingUser.id, editRole, editingUser.ativo);

    if (result.success) {
      toast.success(result.message);
      setEditingUser(null);
      loadUsuarios();
    } else {
      toast.error("Erro ao atualizar permissões");
    }
  }

  async function handleInviteUser() {
    if (!inviteEmail || !inviteRole) {
      toast.error("Preencha todos os campos");
      return;
    }

    setInvitingUser(true);

    try {
      const result = await inviteUser(inviteEmail, inviteRole);

      if (result.success) {
        toast.success(result.message);
        if (result.inviteLink) {
          // Copiar link para clipboard
          try {
            await navigator.clipboard.writeText(result.inviteLink);
            toast.info("Link de convite copiado para a área de transferência");
          } catch (clipboardError) {
            console.error("Erro ao copiar:", clipboardError);
            toast.info(`Link: ${result.inviteLink}`);
          }
        }
        setInviteDialogOpen(false);
        setInviteEmail("");
        setInviteRole("user");
        loadInvites(); // Recarregar lista de convites
      } else {
        toast.error(result.error || "Erro ao enviar convite");
      }
    } finally {
      setInvitingUser(false);
    }
  }

  async function handleCancelInvite(inviteId: string) {
    const result = await cancelInvite(inviteId);

    if (result.success) {
      toast.success(result.message);
      loadInvites();
    } else {
      toast.error("Erro ao cancelar convite");
    }
  }

  async function handleResendInvite(inviteId: string) {
    const result = await resendInvite(inviteId);

    if (result.success) {
      toast.success(result.message);
      if (result.inviteLink) {
        try {
          await navigator.clipboard.writeText(result.inviteLink);
          toast.info("Link de convite copiado para a área de transferência");
        } catch (clipboardError) {
          console.error("Erro ao copiar:", clipboardError);
        }
      }
    } else {
      toast.error(result.error || "Erro ao reenviar convite");
    }
  }

  async function handleCopyLink(token: string) {
    const inviteLink = `${window.location.origin}/accept-invite?token=${token}`;

    try {
      await navigator.clipboard.writeText(inviteLink);
      toast.success("Link copiado!");
    } catch (error) {
      toast.info(`Link: ${inviteLink}`);
    }
  }

  function getRoleBadge(role: string) {
    const colors: Record<string, string> = {
      master: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200",
      admin: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
      manager: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
      operator: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
      user: "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200",
    };

    const roleData = ROLES.find((r) => r.value === role);

    return (
      <Badge variant="outline" className={colors[role] || ""}>
        {roleData?.label || role}
      </Badge>
    );
  }

  return (
    <div className="container mx-auto p-4 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <Title>Gerenciamento de Usuários</Title>
          <p className="text-sm text-muted-foreground mt-1">
            Gerencie os usuários e suas permissões nesta loja
          </p>
        </div>
        <Dialog open={inviteDialogOpen} onOpenChange={setInviteDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <UserPlus className="h-4 w-4" />
              Convidar Usuário
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Convidar Usuário</DialogTitle>
              <DialogDescription>
                Envie um convite para um novo usuário acessar esta loja
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 pt-4">
              <div className="space-y-2">
                <Label htmlFor="invite-email">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="invite-email"
                    type="email"
                    placeholder="usuario@exemplo.com"
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Permissão Inicial</Label>
                <Select value={inviteRole} onValueChange={setInviteRole}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {ROLES.map((role) => (
                      <SelectItem key={role.value} value={role.value}>
                        <div className="flex flex-col">
                          <span className="font-medium">{role.label}</span>
                          <span className="text-xs text-muted-foreground">
                            {role.description}
                          </span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex justify-end gap-2">
                <Button
                  variant="outline"
                  onClick={() => setInviteDialogOpen(false)}
                  disabled={invitingUser}
                >
                  Cancelar
                </Button>
                <Button
                  onClick={handleInviteUser}
                  disabled={invitingUser}
                >
                  {invitingUser ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Enviando...
                    </>
                  ) : (
                    "Enviar Convite"
                  )}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Usuários da Loja
          </CardTitle>
          <CardDescription>
            Lista de todos os usuários com acesso a esta loja
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : usuarios.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              Nenhum usuário encontrado
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nome</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Permissão</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {usuarios.map((usuario) => (
                    <TableRow key={usuario.id}>
                      <TableCell className="font-medium">{usuario.name}</TableCell>
                      <TableCell>{usuario.email}</TableCell>
                      <TableCell>{getRoleBadge(usuario.type)}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Switch
                            checked={usuario.ativo}
                            onCheckedChange={(checked) =>
                              handleToggleAtivo(usuario.id, checked)
                            }
                          />
                          <span className="text-sm text-muted-foreground">
                            {usuario.ativo ? "Ativo" : "Inativo"}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                setEditingUser(usuario);
                                setEditRole(usuario.type);
                              }}
                            >
                              <Edit className="h-4 w-4 mr-2" />
                              Editar
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Editar Permissões</DialogTitle>
                              <DialogDescription>
                                Altere a permissão do usuário {usuario.name}
                              </DialogDescription>
                            </DialogHeader>
                            <div className="space-y-4 pt-4">
                              <div className="space-y-2">
                                <Label>Permissão</Label>
                                <Select value={editRole} onValueChange={setEditRole}>
                                  <SelectTrigger>
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {ROLES.map((role) => (
                                      <SelectItem key={role.value} value={role.value}>
                                        <div className="flex flex-col">
                                          <span className="font-medium">{role.label}</span>
                                          <span className="text-xs text-muted-foreground">
                                            {role.description}
                                          </span>
                                        </div>
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              </div>
                              <div className="flex justify-end gap-2">
                                <DialogTrigger asChild>
                                  <Button variant="outline">Cancelar</Button>
                                </DialogTrigger>
                                <Button onClick={handleUpdateRole}>Salvar</Button>
                              </div>
                            </div>
                          </DialogContent>
                        </Dialog>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Convites Pendentes */}
      {invites.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Convites Pendentes
            </CardTitle>
            <CardDescription>
              Convites aguardando aceitação
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Email</TableHead>
                    <TableHead>Permissão</TableHead>
                    <TableHead>Convidado por</TableHead>
                    <TableHead>Data</TableHead>
                    <TableHead>Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {invites.map((invite) => (
                    <TableRow key={invite.id}>
                      <TableCell className="font-medium">{invite.email}</TableCell>
                      <TableCell>{getRoleBadge(invite.tipo)}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {invite.usuarios?.name || "Desconhecido"}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {new Date(invite.created_at).toLocaleDateString("pt-BR")}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleResendInvite(invite.id)}
                          >
                            <Send className="h-4 w-4 mr-2" />
                            Reenviar
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleCopyLink(invite.token)}
                          >
                            <Copy className="h-4 w-4 mr-2" />
                            Copiar Link
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleCancelInvite(invite.id)}
                          >
                            <X className="h-4 w-4 mr-2" />
                            Cancelar
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
