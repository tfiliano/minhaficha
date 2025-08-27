"use client";

import { GridItem, GridItems } from "@/components/admin/grid-items";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Search, Users, Building2, Mail, Calendar, ArrowLeft, Settings, UserX, UserCheck, Plus } from "lucide-react";
import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

interface LojaUsuario {
  loja_id: string | null;
  tipo: "master" | "admin" | "manager" | "operator" | "user" | null;
  ativo: boolean | null;
  loja: {
    nome: string | null;
    codigo: string | null;
  } | null;
}

interface Usuario {
  id: string;
  name: string | null;
  email: string | null;
  created_at: string;
  ativo: boolean;
  avatar: string | null;
  type: "master" | "admin" | "manager" | "operator" | "user";
  loja_usuarios: LojaUsuario[];
}

interface Loja {
  id: string;
  nome: string | null;
  codigo: string | null;
}

interface UsuariosPageClientProps {
  usuarios: Usuario[];
  lojas: Loja[];
}

export function UsuariosPageClient({ usuarios, lojas }: UsuariosPageClientProps) {
  const [busca, setBusca] = useState("");
  const [selectedUser, setSelectedUser] = useState<Usuario | null>(null);
  const [selectedLoja, setSelectedLoja] = useState<string>("");
  const [selectedTipo, setSelectedTipo] = useState<string>("admin");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleToggleUserStatus = async (userId: string, lojaId: string, currentStatus: boolean) => {
    try {
      const response = await fetch("/api/master/toggle-user-store-status", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId,
          lojaId,
          newStatus: !currentStatus
        }),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success(data.message);
        setTimeout(() => {
          window.location.reload();
        }, 1000);
      } else {
        toast.error(data.error || "Erro ao alterar status do usuário");
      }
    } catch (error) {
      console.error("Erro:", error);
      toast.error("Erro inesperado");
    }
  };

  const handleRemoveUserFromStore = async (userId: string, lojaId: string) => {
    if (!confirm("Tem certeza que deseja remover este usuário da loja?")) return;
    
    try {
      const response = await fetch("/api/master/remove-user-from-store", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId,
          lojaId
        }),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success(data.message);
        setTimeout(() => {
          window.location.reload();
        }, 1000);
      } else {
        toast.error(data.error || "Erro ao remover usuário da loja");
      }
    } catch (error) {
      console.error("Erro:", error);
      toast.error("Erro inesperado");
    }
  };

  const handleAddUserToStore = async () => {
    if (!selectedUser || !selectedLoja || !selectedTipo) {
      toast.error("Preencha todos os campos");
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch("/api/master/assign-user-to-store", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userEmail: selectedUser.email,
          lojaId: selectedLoja,
          tipo: selectedTipo
        }),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success("Usuário adicionado à loja com sucesso!");
        setIsModalOpen(false);
        setSelectedUser(null);
        setSelectedLoja("");
        setSelectedTipo("admin");
        // Recarregar página para mostrar as mudanças
        setTimeout(() => {
          window.location.reload();
        }, 1000);
      } else {
        toast.error(data.error || "Erro ao adicionar usuário à loja");
      }
    } catch (error) {
      console.error("Erro:", error);
      toast.error("Erro inesperado");
    } finally {
      setIsLoading(false);
    }
  };

  const openAddUserModal = (usuario: Usuario) => {
    setSelectedUser(usuario);
    setIsModalOpen(true);
  };

  // Filtrar lojas que o usuário ainda não tem acesso
  const getAvailableLojas = (usuario: Usuario) => {
    const userLojaIds = usuario.loja_usuarios?.map(lu => lu.loja) || [];
    return lojas.filter(loja => 
      !userLojaIds.some(userLoja => userLoja && typeof userLoja === 'object' && 'id' in userLoja)
    );
  };

  const usuariosFiltrados = usuarios.filter((usuario) => {
    const normalizar = (texto: string) =>
      texto
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLowerCase();
    
    const termoBusca = normalizar(busca);
    return (
      normalizar(usuario.name || "").includes(termoBusca) ||
      normalizar(usuario.email || "").includes(termoBusca) ||
      usuario.loja_usuarios?.some(lu => 
        normalizar(lu.loja?.nome || "").includes(termoBusca) ||
        normalizar(lu.loja?.codigo || "").includes(termoBusca)
      )
    );
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/dashboard">
          <Button variant="outline" size="sm" className="flex items-center gap-2">
            <ArrowLeft className="w-4 h-4" />
            Voltar ao Dashboard
          </Button>
        </Link>
      </div>

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Usuários do Sistema</h1>
          <p className="text-muted-foreground">
            Gerencie todos os usuários e suas permissões
          </p>
        </div>
        <Badge variant="outline" className="flex items-center gap-2">
          <Users className="w-4 h-4" />
          {usuarios.length} usuários
        </Badge>
      </div>

      <div className="relative">
        <Input
          type="text"
          placeholder="Buscar por nome, email ou loja..."
          className="pl-10"
          value={busca}
          onChange={(event) => setBusca(event.target.value)}
        />
        <Search
          className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
          size={20}
        />
      </div>

      <GridItems classNames="md:grid-cols-1 lg:grid-cols-2">
        {usuariosFiltrados.map((usuario) => (
          <Card key={usuario.id} className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">{usuario.name || 'Usuário sem nome'}</CardTitle>
                <div className="flex items-center gap-2">
                  <Badge variant={usuario.loja_usuarios?.length > 0 ? "default" : "secondary"}>
                    {usuario.loja_usuarios?.length || 0} lojas
                  </Badge>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" size="sm">
                        <Settings className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => openAddUserModal(usuario)}>
                        <Plus className="w-4 h-4 mr-2" />
                        Adicionar à Loja
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem className="text-muted-foreground">
                        <Settings className="w-4 h-4 mr-2" />
                        Gerenciar Permissões
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
              <CardDescription className="flex items-center gap-2">
                <Mail className="w-4 h-4" />
                {usuario.email}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {usuario.loja_usuarios && usuario.loja_usuarios.length > 0 ? (
                <div className="space-y-2">
                  <div className="text-sm font-medium text-muted-foreground">
                    Lojas com acesso:
                  </div>
                  {usuario.loja_usuarios.map((lojaUsuario, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Building2 className="w-4 h-4 text-muted-foreground" />
                        <span className="text-sm">
                          {lojaUsuario.loja?.nome || lojaUsuario.loja?.codigo}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-xs">
                          {lojaUsuario.tipo}
                        </Badge>
                        {!lojaUsuario.ativo && (
                          <Badge variant="destructive" className="text-xs">
                            Inativo
                          </Badge>
                        )}
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                              <Settings className="w-3 h-3" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-48">
                            <DropdownMenuItem
                              onClick={() => {
                                if (lojaUsuario.loja_id && lojaUsuario.ativo !== null) {
                                  handleToggleUserStatus(usuario.id, lojaUsuario.loja_id, lojaUsuario.ativo);
                                }
                              }}
                            >
                              {lojaUsuario.ativo ? (
                                <>
                                  <UserX className="w-4 h-4 mr-2" />
                                  Desativar Acesso
                                </>
                              ) : (
                                <>
                                  <UserCheck className="w-4 h-4 mr-2" />
                                  Ativar Acesso
                                </>
                              )}
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              onClick={() => {
                                if (lojaUsuario.loja_id) {
                                  handleRemoveUserFromStore(usuario.id, lojaUsuario.loja_id);
                                }
                              }}
                              className="text-destructive"
                            >
                              <UserX className="w-4 h-4 mr-2" />
                              Remover da Loja
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-sm text-muted-foreground text-center py-4">
                  Usuário não tem acesso a nenhuma loja
                </div>
              )}
              
              <div className="pt-2 border-t border-border">
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Calendar className="w-3 h-3" />
                  Criado em {new Date(usuario.created_at).toLocaleDateString('pt-BR')}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </GridItems>

      {usuariosFiltrados.length === 0 && (
        <div className="text-center py-12">
          <Users className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium text-muted-foreground mb-2">
            Nenhum usuário encontrado
          </h3>
          <p className="text-sm text-muted-foreground">
            {busca ? "Tente ajustar os termos de busca" : "Não há usuários cadastrados"}
          </p>
        </div>
      )}

      {/* Modal para adicionar usuário à loja */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Adicionar Usuário à Loja</DialogTitle>
            <DialogDescription>
              Adicione <strong>{selectedUser?.name}</strong> a uma loja e defina suas permissões.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="loja">Loja</Label>
              <Select value={selectedLoja} onValueChange={setSelectedLoja}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione uma loja" />
                </SelectTrigger>
                <SelectContent>
                  {lojas.map((loja) => (
                    <SelectItem key={loja.id} value={loja.id}>
                      {loja.nome || 'Sem nome'} ({loja.codigo || 'Sem código'})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="tipo">Tipo de Acesso</Label>
              <Select value={selectedTipo} onValueChange={setSelectedTipo}>
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
            
            <div className="flex justify-end gap-3">
              <Button 
                variant="outline" 
                onClick={() => setIsModalOpen(false)}
                disabled={isLoading}
              >
                Cancelar
              </Button>
              <Button
                onClick={handleAddUserToStore}
                disabled={isLoading || !selectedLoja}
              >
                {isLoading ? "Adicionando..." : "Adicionar"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}