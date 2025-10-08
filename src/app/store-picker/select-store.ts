"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";

export async function actionSelectLoja({ loja_id, tipo }: any) {
  try {
    const cookieStore = await cookies();

    const cookieOptions = {
      httpOnly: false,
      sameSite: "lax" as const,
      path: "/",
      maxAge: 60 * 60 * 24 * 30, // 30 dias
    };

    cookieStore.set("minhaficha_loja_id", loja_id, cookieOptions);
    cookieStore.set("minhaficha_loja_user_tipo", tipo, cookieOptions);

    // Revalidar para garantir que os cookies sejam reconhecidos
    revalidatePath("/", "layout");

    console.log("[STORE-PICKER] Cookies setados:", { loja_id, tipo });

    return { success: true };
  } catch (error: any) {
    console.error("[STORE-PICKER] Erro:", error);
    return { error: error.message };
  }
}
