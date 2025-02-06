import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { NextResponse, type NextRequest } from "next/server";

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

    return NextResponse.next();
  }

  private isPublicRoute(): boolean {
    return (
      this.request.nextUrl.pathname.startsWith("/login") ||
      this.request.nextUrl.pathname.startsWith("/auth")
    );
  }
}

export async function updateSession(request: NextRequest) {
  const supabaseService = new SupabaseService(request);
  const authGuard = new AuthGuard(request, supabaseService);
  return authGuard.validateUserAccess();
}
