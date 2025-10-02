import { Database } from "@/types/database.types";
import { createBrowserClient as createSupabaseBrowserClient } from "@supabase/ssr";

/**
 * Cria um cliente Supabase para uso em Client Components (browser)
 * Não aplica filtros automáticos de loja_id
 */
export function createBrowserClient() {
  return createSupabaseBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
