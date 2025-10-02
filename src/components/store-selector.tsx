"use client";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { Building2, ChevronDown, Store } from "lucide-react";
import { useEffect, useState } from "react";
import { createBrowserClient } from "@/utils/supabase-client";
import { actionSelectLoja } from "@/app/store-picker/select-store";
import { toast } from "sonner";
import { getCookie } from "@/utils/cookie-local";

interface Loja {
  id: string;
  nome: string;
  ativo?: boolean;
}

interface LojaUsuario {
  tipo: string;
  loja: Loja;
}

export function StoreSelector() {
  const [currentStore, setCurrentStore] = useState<Loja | null>(null);
  const [availableStores, setAvailableStores] = useState<LojaUsuario[]>([]);
  const [userType, setUserType] = useState<string>("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStoreData();
  }, []);

  const loadStoreData = async () => {
    try {
      const supabase = createBrowserClient();
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) return;

      // Buscar lojas do usuário
      const { data: lojas } = await supabase
        .from("loja_usuarios")
        .select("tipo, loja:lojas(*)")
        .eq("user_id", user.id);

      if (lojas) {
        setAvailableStores(lojas as LojaUsuario[]);
        
        // Identificar loja atual pelo cookie
        const currentLojaId = getCookie("minhaficha_loja_id");
        const currentLojaType = getCookie("minhaficha_loja_user_tipo") || "";
        
        if (currentLojaId) {
          const current = lojas.find((l: any) => l.loja.id === currentLojaId);
          if (current) {
            setCurrentStore(current.loja);
            setUserType(currentLojaType);
          }
        }
      }
    } catch (error) {
      console.error("Erro ao carregar dados da loja:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleStoreChange = async (loja: Loja, tipo: string) => {
    try {
      await actionSelectLoja({ loja_id: loja.id, tipo });
      setCurrentStore(loja);
      setUserType(tipo);
      toast.success(`Trocado para: ${loja.nome}`);
      
      // Recarregar página para aplicar filtros
      window.location.reload();
    } catch (error) {
      toast.error("Erro ao trocar de loja");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Store className="w-4 h-4" />
        <span>Carregando...</span>
      </div>
    );
  }

  if (!currentStore) {
    return (
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Store className="w-4 h-4" />
        <span>Nenhuma loja selecionada</span>
      </div>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="flex items-center gap-1.5 sm:gap-2 max-w-32 sm:max-w-48 lg:max-w-none text-xs sm:text-sm">
          <Building2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 flex-shrink-0" />
          <span className="font-medium truncate hidden sm:block">{currentStore.nome}</span>
          <span className="font-medium truncate sm:hidden">{currentStore.nome.slice(0, 8)}</span>
          {userType && (
            <Badge variant="secondary" className="text-xs hidden lg:flex">
              {userType}
            </Badge>
          )}
          <ChevronDown className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-64">
        <DropdownMenuLabel className="flex items-center gap-2">
          <Building2 className="w-4 h-4" />
          Lojas Disponíveis
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        
        {availableStores.map((lojaUsuario) => (
          <DropdownMenuItem
            key={lojaUsuario.loja.id}
            className="flex items-center justify-between cursor-pointer"
            onClick={() => handleStoreChange(lojaUsuario.loja, lojaUsuario.tipo)}
          >
            <div className="flex flex-col">
              <span className="font-medium">{lojaUsuario.loja.nome}</span>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-xs">
                {lojaUsuario.tipo}
              </Badge>
              {currentStore.id === lojaUsuario.loja.id && (
                <div className="w-2 h-2 bg-green-500 rounded-full" />
              )}
            </div>
          </DropdownMenuItem>
        ))}
        
        {availableStores.length === 0 && (
          <DropdownMenuItem disabled>
            <span className="text-muted-foreground">Nenhuma loja disponível</span>
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}