import { createSupabaseServerAdmin } from "@/utils/server-admin";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const { userId, lojaId, newStatus } = await request.json();

    if (!userId || !lojaId || typeof newStatus !== 'boolean') {
      return NextResponse.json({ 
        error: "userId, lojaId e newStatus são obrigatórios" 
      }, { status: 400 });
    }

    console.log("Alterando status do usuário na loja:", { userId, lojaId, newStatus });

    const supabase = await createSupabaseServerAdmin();

    // Atualizar status do usuário na loja
    const { error } = await supabase
      .from("loja_usuarios")
      .update({ ativo: newStatus })
      .eq("user_id", userId)
      .eq("loja_id", lojaId);

    if (error) {
      console.error("Erro ao atualizar status:", error);
      return NextResponse.json({ 
        error: "Erro ao atualizar status do usuário" 
      }, { status: 500 });
    }

    console.log("Status atualizado com sucesso!");

    return NextResponse.json({ 
      success: true, 
      message: `Usuário ${newStatus ? 'ativado' : 'desativado'} na loja com sucesso`
    });

  } catch (error: any) {
    console.error("Erro na API toggle-user-store-status:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}