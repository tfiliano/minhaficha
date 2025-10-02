"use server";

import { cookies } from "next/headers";

export async function actionSelectLoja({ loja_id, tipo }: any) {
  try {
    (await cookies()).set("minhaficha_loja_id", loja_id, { httpOnly: false });
    (await cookies()).set("minhaficha_loja_user_tipo", tipo, {
      httpOnly: false,
    });
  } catch (error: any) {
    return { error: error.message };
  }
}
