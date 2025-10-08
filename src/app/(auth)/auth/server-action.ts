"use server";

import { createClient } from "@/utils/supabase";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

export async function login(formData: any) {
  try {
    const supabase = await createClient();

    const { error, data } = await supabase.auth.signInWithPassword(formData);

    if (error) throw error;

    const lojas = await getStoreUser(data.user.id);

    if ("error" in lojas) {
      await logout();
      throw new Error(lojas.error?.message);
    }

    if (Array.isArray(lojas) && lojas.length === 0) {
      const { data: userAdmin, error } = await supabase
        .from("usuarios_masters")
        .select()
        .eq("id", data.user.id)
        .eq("is_active", true);

      if (!error && userAdmin) {
        return { success: true, redirect: "/dashboard" };
      }

      await logout();
      throw new Error("Usuário não autorizado a acessar a loja");
    }

    let loja = lojas.length === 1 ? lojas[0] : null;

    if (lojas.length > 1) {
      return { success: true, redirect: "/store-picker" };
    }

    const cookieStore = await cookies();

    // Configuração dos cookies
    const cookieOptions = {
      httpOnly: false,
      sameSite: "lax" as const,
      path: "/",
      maxAge: 60 * 60 * 24 * 30, // 30 dias
    };

    cookieStore.set("minhaficha_loja_id", loja!.loja_id!, cookieOptions);
    cookieStore.set("minhaficha_loja_user_tipo", loja!.tipo!, cookieOptions);

    // Revalidar para garantir que os cookies sejam reconhecidos
    revalidatePath("/", "layout");

    console.log("[LOGIN] Cookies setados:", {
      loja_id: loja!.loja_id,
      tipo: loja!.tipo,
    });

    return { success: true, redirect: "/operador" };
  } catch (error: any) {
    console.error("[LOGIN] Erro:", error);
    return { error: error.message };
  }
}

export async function logout() {
  const supabase = await createClient();

  const { error } = await supabase.auth.signOut();

  if (error) {
    throw error;
  }

  const cookieStore = await cookies();
  cookieStore.delete("minhaficha_loja_id");
  cookieStore.delete("minhaficha_loja_user_tipo");

  redirect("/auth/login");
}

async function getStoreUser(user_id: string) {
  try {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from("loja_usuarios")
      .select("*")
      .eq("user_id", user_id)
      .eq("ativo", true);

    if (error) throw error;
    return data;
  } catch (error: any) {
    return { error: error.message };
  }
}
