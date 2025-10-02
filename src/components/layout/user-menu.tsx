"use client";

import { LogOut, Moon, Sun, User, Store, Check } from "lucide-react";
import { useTheme } from "next-themes";
import { useRouter } from "next/navigation";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { createBrowserClient } from "@/utils/supabase-client";
import { getCookie } from "@/utils/cookie-local";
import { actionSelectLoja } from "@/app/store-picker/select-store";
import { toast } from "sonner";
import { useEffect, useState } from "react";

type UserData = {
  email: string;
  name: string;
  initials: string;
  avatar?: string;
};

type Loja = {
  id: string;
  nome: string;
  ativo?: boolean;
};

type LojaUsuario = {
  tipo: string;
  loja: Loja;
};

export function UserMenu() {
  const router = useRouter();
  const { theme, setTheme } = useTheme();
  const [user, setUser] = useState<UserData | null>(null);
  const [currentStore, setCurrentStore] = useState<Loja | null>(null);
  const [availableStores, setAvailableStores] = useState<LojaUsuario[]>([]);
  const [loading, setLoading] = useState(true);
  const [showStores, setShowStores] = useState(false);

  useEffect(() => {
    async function loadUserData() {
      try {
        const supabase = createBrowserClient();
        const { data: { user: authUser } } = await supabase.auth.getUser();

        if (authUser) {
          // Buscar informações do usuário
          const name = authUser.user_metadata?.name || authUser.email?.split('@')[0] || 'Usuário';
          const initials = name
            .split(' ')
            .map((n: string) => n[0])
            .slice(0, 2)
            .join('')
            .toUpperCase();

          setUser({
            email: authUser.email || '',
            name,
            initials,
            avatar: authUser.user_metadata?.avatar_url,
          });

          // Buscar lojas do usuário
          const { data: lojas } = await supabase
            .from("loja_usuarios")
            .select("tipo, loja:lojas(*)")
            .eq("user_id", authUser.id);

          if (lojas) {
            setAvailableStores(lojas as LojaUsuario[]);

            // Identificar loja atual pelo cookie
            const currentLojaId = getCookie("minhaficha_loja_id");

            if (currentLojaId) {
              const current = lojas.find((l: any) => l.loja.id === currentLojaId);
              if (current) {
                setCurrentStore(current.loja);
              }
            }
          }
        }
      } catch (error) {
        console.error('Erro ao carregar dados do usuário:', error);
      } finally {
        setLoading(false);
      }
    }

    loadUserData();
  }, []);

  const handleStoreChange = async (loja: Loja, tipo: string) => {
    try {
      await actionSelectLoja({ loja_id: loja.id, tipo });
      setCurrentStore(loja);
      toast.success(`Trocado para: ${loja.nome}`);

      // Recarregar página para aplicar filtros
      setTimeout(() => window.location.reload(), 500);
    } catch (error) {
      toast.error("Erro ao trocar de loja");
    }
  };

  const handleLogout = async () => {
    const supabase = createBrowserClient();
    await supabase.auth.signOut();
    router.push('/auth/login');
  };

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  if (loading || !user) {
    return (
      <Avatar className="h-9 w-9 cursor-pointer border-2 border-border">
        <AvatarFallback>
          <User className="h-4 w-4" />
        </AvatarFallback>
      </Avatar>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded-full">
          <Avatar className="h-9 w-9 cursor-pointer border-2 border-border hover:border-primary transition-colors">
            {user.avatar && <AvatarImage src={user.avatar} alt={user.name} />}
            <AvatarFallback className="bg-primary text-primary-foreground font-semibold">
              {user.initials}
            </AvatarFallback>
          </Avatar>
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-64">
        <DropdownMenuLabel>
          <div className="flex flex-col">
            <p className="text-sm font-medium leading-none">{user.name}</p>
            <p className="text-xs leading-none text-muted-foreground truncate mt-1">
              {user.email}
            </p>
            {currentStore && (
              <div className="flex items-center gap-1.5 mt-2 pt-2 border-t border-border/50">
                <Store className="h-3.5 w-3.5 text-muted-foreground flex-shrink-0" />
                <p className="text-xs font-normal text-muted-foreground truncate">
                  {currentStore.nome}
                </p>
              </div>
            )}
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />

        {availableStores.length > 1 && !showStores && (
          <>
            <DropdownMenuItem
              className="cursor-pointer"
              onSelect={(e) => {
                e.preventDefault();
                setShowStores(true);
              }}
            >
              <Store className="mr-2 h-4 w-4" />
              <span>Trocar loja</span>
              <Badge variant="secondary" className="ml-auto text-xs">
                {availableStores.length}
              </Badge>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
          </>
        )}

        {showStores && (
          <>
            <DropdownMenuItem
              className="cursor-pointer text-muted-foreground"
              onSelect={(e) => {
                e.preventDefault();
                setShowStores(false);
              }}
            >
              <span className="text-xs">← Voltar</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuLabel className="text-xs text-muted-foreground">
              Lojas disponíveis
            </DropdownMenuLabel>
            {availableStores.map((lojaUsuario) => (
              <DropdownMenuItem
                key={lojaUsuario.loja.id}
                className="cursor-pointer"
                onClick={() => handleStoreChange(lojaUsuario.loja, lojaUsuario.tipo)}
                disabled={currentStore?.id === lojaUsuario.loja.id}
              >
                <div className="flex items-center justify-between w-full gap-2">
                  <div className="flex flex-col flex-1 min-w-0">
                    <span className="text-sm truncate">{lojaUsuario.loja.nome}</span>
                    <Badge variant="outline" className="text-xs w-fit mt-1">
                      {lojaUsuario.tipo}
                    </Badge>
                  </div>
                  {currentStore?.id === lojaUsuario.loja.id && (
                    <Check className="h-4 w-4 text-green-600 flex-shrink-0" />
                  )}
                </div>
              </DropdownMenuItem>
            ))}
            <DropdownMenuSeparator />
          </>
        )}

        <DropdownMenuItem onClick={toggleTheme} className="cursor-pointer">
          {theme === 'dark' ? (
            <>
              <Sun className="mr-2 h-4 w-4" />
              <span>Modo claro</span>
            </>
          ) : (
            <>
              <Moon className="mr-2 h-4 w-4" />
              <span>Modo escuro</span>
            </>
          )}
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleLogout} className="cursor-pointer text-red-600 focus:text-red-600">
          <LogOut className="mr-2 h-4 w-4" />
          <span>Sair</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}