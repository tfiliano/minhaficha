import { Database } from "@/types/database.types";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export async function createClient() {
  const cookieStore = await cookies();

  const loja_id = cookieStore.get("minhaficha_loja_id")?.value;

  // Função para adicionar lógica customizada antes das operações do Supabase
  const wrapWithInterceptor = (
    method: string,
    fn: Function,
    table: keyof Database["public"]["Tables"]
  ) => {
    return (...args: any[]) => {
      // No caso do select, adiciona o filtro `.eq("loja_id", loja_id)`
      if (
        method === "select" &&
        table !== "loja_usuarios" &&
        table !== "usuarios" &&
        table !== "lojas" &&
        table !== "usuarios_masters"
      ) {
        const query = fn(...args);
        return query.eq("loja_id", loja_id!);
      }
      // Chama o método original
      return fn(...args);
    };
  };

  // Criação do cliente Supabase
  const supabase = createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // The `setAll` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing
            // user sessions.
          }
        },
      },
    }
  );

  // Criação do Proxy para interceptar chamadas
  const handler: ProxyHandler<typeof supabase> = {
    get(target, prop) {
      if (prop === "from") {
        return (table: keyof Database["public"]["Tables"]) => {
          const tableClient = target.from(table);
          return new Proxy(tableClient, {
            get(tableTarget, tableProp) {
              const originalMethod =
                tableTarget[tableProp as keyof typeof tableTarget];
              if (typeof originalMethod === "function") {
                return wrapWithInterceptor(
                  tableProp as string,
                  originalMethod.bind(tableTarget),
                  table
                );
              }
              return originalMethod;
            },
          });
        };
      }
      return target[prop as keyof typeof target];
    },
  };

  return new Proxy(supabase, handler);
}
