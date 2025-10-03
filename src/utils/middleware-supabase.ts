import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { NextResponse, type NextRequest } from "next/server";

// Mapeamento de rotas para recursos do sistema de permissões
const ROUTE_TO_RESOURCE_MAP: Record<string, string> = {
  "/admin/produtos": "produtos",
  "/admin/etiquetas": "etiquetas",
  "/admin/reports": "relatorios",
  "/ficha-tecnica": "ficha-tecnica",
  "/admin/operadores": "operadores",
  "/admin/grupos": "grupos",
  "/admin/setores": "setores",
  "/admin/armazenamentos": "armazenamentos",
  "/admin/fabricantes": "fabricantes",
  "/admin/sifs": "sifs",
  "/admin/impressoras": "impressoras",
  "/admin/templates": "templates",
  "/admin/configuracoes": "configuracoes",
  "/operador": "producao",
  "/admin/permissoes": "configuracoes", // Gerenciar permissões requer acesso a configurações
};

class SupabaseService {
  private supabase;

  constructor(private request: NextRequest) {
    this.supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll: () => this.request.cookies.getAll(),
          setAll: (cookiesToSet) => {
            cookiesToSet.forEach(({ name, value }) =>
              this.request.cookies.set(name, value)
            );
          },
        },
      }
    );
  }

  async getUser() {
    const { data } = await this.supabase.auth.getUser();
    return data?.user;
  }

  async getLojaUsuario(userId: string, lojaId: string) {
    const { data, error } = await this.supabase
      .from("loja_usuarios")
      .select("*")
      .eq("user_id", userId)
      .eq("loja_id", lojaId)
      .eq("ativo", true)
      .single();
    return { data, error };
  }

  async getAdminAccess(userId: string, lojaId: string) {
    const { data, error } = await this.supabase
      .from("loja_usuarios")
      .select("tipo")
      .eq("user_id", userId)
      .eq("loja_id", lojaId)
      .or("tipo.eq.master,tipo.eq.manager,tipo.eq.admin")
      .maybeSingle();
    return { data, error };
  }

  async getDashboardAccess(userId: string) {
    const { data, error } = await this.supabase
      .from("usuarios_masters")
      .select("id")
      .eq("id", userId)
      .eq("is_active", true)
      .maybeSingle();
    return { data, error };
  }

  /**
   * Verifica se o usuário tem permissão para acessar um recurso
   */
  async checkPermission(
    userId: string,
    lojaId: string,
    recurso: string,
    acao: string = "read"
  ) {
    const { data, error } = await this.supabase.rpc("check_user_permission", {
      p_user_id: userId,
      p_loja_id: lojaId,
      p_recurso_slug: recurso,
      p_acao: acao,
    });

    if (error) {
      console.error("Erro ao verificar permissão:", error);
      return false;
    }

    return data === true;
  }
}
class AuthGuard {
  constructor(
    private request: NextRequest,
    private supabaseService: SupabaseService
  ) {}

  private redirectToLogin() {
    const url = this.request.nextUrl.clone();

    if (url.pathname !== "/") url.searchParams.set("nextUrl", url.pathname);
    url.pathname = "/auth/login";
    return NextResponse.redirect(url);
  }

  async validateUserAccess() {
    const user = await this.supabaseService.getUser();
    if (!user && !this.isPublicRoute()) {
      return this.redirectToLogin();
    }

    if (this.request.nextUrl.pathname.startsWith("/dashboard")) {
      if (!(await this.supabaseService.getDashboardAccess(user!.id)).data) {
        return this.redirectToLogin();
      }
      return NextResponse.next();
    }

    const lojaId = (await cookies()).get("minhaficha_loja_id")?.value;

    if (
      !lojaId ||
      !(await this.supabaseService.getLojaUsuario(user!.id, lojaId)).data
    ) {
      return this.redirectToLogin();
    }

    if (this.request.nextUrl.pathname.startsWith("/admin")) {
      if (!(await this.supabaseService.getAdminAccess(user!.id, lojaId)).data) {
        return this.redirectToLogin();
      }
    }

    // Verificar permissões baseadas em recursos
    const recurso = this.getResourceFromPath(this.request.nextUrl.pathname);
    if (recurso) {
      const hasPermission = await this.supabaseService.checkPermission(
        user!.id,
        lojaId,
        recurso,
        "read"
      );

      if (!hasPermission) {
        // Usuário não tem permissão para acessar este recurso
        const url = this.request.nextUrl.clone();
        url.pathname = "/";
        url.searchParams.set("error", "permission_denied");
        return NextResponse.redirect(url);
      }
    }

    return NextResponse.next();
  }

  /**
   * Extrai o recurso da rota baseado no mapeamento
   */
  private getResourceFromPath(pathname: string): string | null {
    // Tentar match exato primeiro
    if (ROUTE_TO_RESOURCE_MAP[pathname]) {
      return ROUTE_TO_RESOURCE_MAP[pathname];
    }

    // Tentar match por prefixo (para rotas dinâmicas como /admin/produtos/[id])
    for (const [route, resource] of Object.entries(ROUTE_TO_RESOURCE_MAP)) {
      if (pathname.startsWith(route + "/") || pathname === route) {
        return resource;
      }
    }

    return null;
  }

  private isPublicRoute(): boolean {
    return (
      this.request.nextUrl.pathname.startsWith("/login") ||
      this.request.nextUrl.pathname.startsWith("/auth") ||
      this.request.nextUrl.pathname.startsWith("/setup-master") ||
      this.request.nextUrl.pathname.startsWith("/api/setup-master")
    );
  }
}

export async function updateSession(request: NextRequest) {
  const supabaseService = new SupabaseService(request);
  const authGuard = new AuthGuard(request, supabaseService);
  return authGuard.validateUserAccess();
}
