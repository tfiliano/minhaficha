import { Database } from "@/types/database.types";
import { createBrowserClient as createBrowserClientSupabase } from "@supabase/ssr";
import { getCookie } from "./cookie-local";

// Função para adicionar interceptores às operações do Supabase
export function createBrowserClient() {
  const supabase = createBrowserClientSupabase<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  // Função wrapper para adicionar lógica customizada antes das operações
  const wrapWithInterceptor = (
    method: string,
    fn: Function,
    table: keyof Database["public"]["Tables"]
  ) => {
    const loja_id = getCookie("minhaficha_loja_id");
    return (...args: any[]) => {
      if (method === "insert" || method === "update") {
        // Adicione o valor extra a cada operação de insert/update
        const data = args[0];
        args[0] = {
          ...data,
          loja_id, // Valor a ser injetado
        };
        if (table === "lojas") delete args[0].loja_id;
      }

      // Chame o método original
      return fn(...args);
    };
  };

  // Crie um proxy para interceptar chamadas
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
