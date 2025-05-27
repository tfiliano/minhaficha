"use server";

import { createClient } from "@/utils/supabase";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

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
        return { redirect: "/dashboard" };
      }

      await logout();
      throw new Error("Usuário não autorizado a acessar a loja");
    }

    let loja = lojas.length === 1 ? lojas[0] : null;

    if (lojas.length > 1) {
      return { redirect: "/store-picker" };
    }

    (await cookies()).set("minhaficha_loja_id", loja!.loja_id!, {
      httpOnly: false,
    });

    (await cookies()).set("minhaficha_loja_user_tipo", loja!.tipo!, {
      httpOnly: false,
    });

    return { success: true };
  } catch (error: any) {
    return { error: error.message };
  }
}

export async function logout() {
  try {
    const supabase = await createClient();

    const { error } = await supabase.auth.signOut();

    if (error) {
      throw error;
    }
    (await cookies()).delete("minhaficha_loja_id");
    (await cookies()).delete("minhaficha_loja_user_tipo");
    return { success: true };
  } catch (error: any) {
    return { error: error.message };
  }

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
