import { createSupabaseServerAdmin } from "@/utils/server-admin";
import { NextResponse } from "next/server";

export async function DELETE(request: Request) {
  try {
    const { userId, lojaId } = await request.json();

    if (!userId || !lojaId) {
      return NextResponse.json({ 
        error: "userId e lojaId são obrigatórios" 
      }, { status: 400 });
    }

    console.log("Removendo usuário da loja:", { userId, lojaId });

    const supabase = await createSupabaseServerAdmin();

    // Remover associação usuário-loja
    const { error } = await supabase
      .from("loja_usuarios")
      .delete()
      .eq("user_id", userId)
      .eq("loja_id", lojaId);

    if (error) {
      console.error("Erro ao remover usuário da loja:", error);
      return NextResponse.json({ 
        error: "Erro ao remover usuário da loja" 
      }, { status: 500 });
    }

    console.log("Usuário removido da loja com sucesso!");

    return NextResponse.json({ 
      success: true, 
      message: "Usuário removido da loja com sucesso"
    });

  } catch (error: any) {
    console.error("Erro na API remove-user-from-store:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}