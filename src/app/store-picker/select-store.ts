"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";

export async function actionSelectLoja({ loja_id, tipo }: any) {
  try {
    const cookieStore = await cookies();

    cookieStore.set("minhaficha_loja_id", loja_id, {
      httpOnly: false,
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 30, // 30 dias
    });

    cookieStore.set("minhaficha_loja_user_tipo", tipo, {
      httpOnly: false,
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 30, // 30 dias
    });

    // Revalidar para garantir que os cookies sejam reconhecidos
    revalidatePath("/", "layout");

    return { success: true };
  } catch (error: any) {
    return { error: error.message };
  }
}
