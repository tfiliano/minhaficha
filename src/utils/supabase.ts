import { Database } from "@/types/database.types";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export async function createClient() {
  const cookieStore = cookies();

  const loja_id = (await cookieStore).get("minhaficha_loja_id")?.value;

  // Função para adicionar lógica customizada antes das operações do Supabase
  const wrapWithInterceptor = (method: string, fn: Function) => {
    return (...args: any[]) => {
      // No caso do select, adiciona o filtro `.eq("loja_id", loja_id)`
      if (method === "select") {
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
        async getAll() {
          return (await cookieStore).getAll();
        },
        async setAll(
          cookiesToSet: { name: string; value: string; options: any }[]
        ) {
          try {
            cookiesToSet.forEach(async ({ name, value, options }) =>
              (await cookieStore).set(name, value, options)
            );
          } catch {
            // O método `setAll` foi chamado a partir de um Componente do Servidor.
            // Isso pode ser ignorado se você tiver um middleware que atualiza
            // as sessões dos usuários.
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
                  originalMethod.bind(tableTarget)
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
