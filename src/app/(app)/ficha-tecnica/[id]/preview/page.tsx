import { createClient } from "@/utils/supabase";
import { notFound } from "next/navigation";
import { FichaTecnicaPDFPreview } from "@/components/ficha-tecnica/ficha-tecnica-pdf-preview";

type Props = {
  params: Promise<{
    id: string;
  }>;
};

export default async function FichaTecnicaPreviewPage(props: Props) {
  const params = await props.params;
  const produtoId = params.id;

  const supabase = await createClient();

  // Buscar o produto de cardápio
  const { data: produto, error: produtoError } = await supabase
    .from("produtos")
    .select("*")
    .eq("id", produtoId)
    .eq("item_de_cardapio", true)
    .maybeSingle();

  if (produtoError || !produto) {
    notFound();
  }

  // Buscar a ficha técnica
  const { data: fichaTecnica } = await supabase
    .from("fichas_tecnicas")
    .select("*")
    .eq("produto_cardapio_id", produtoId)
    .maybeSingle();

  if (!fichaTecnica) {
    notFound();
  }

  // Buscar ingredientes da ficha técnica com informações do produto
  const { data: ingredientes } = await supabase
    .from("fichas_tecnicas_itens")
    .select(`
      *,
      produto:produto_ingrediente_id (
        id,
        codigo,
        nome,
        unidade,
        grupo,
        custo_unitario
      )
    `)
    .eq("ficha_tecnica_id", fichaTecnica.id)
    .order("ordem", { ascending: true });

  // Buscar foto de capa
  const { data: fotos } = await supabase
    .from("fichas_tecnicas_fotos")
    .select("*")
    .eq("ficha_tecnica_id", fichaTecnica.id)
    .order("ordem", { ascending: true });

  const fotoCapa = fotos?.find(f => f.is_capa)?.url || fotos?.[0]?.url;

  return (
    <FichaTecnicaPDFPreview
      produto={produto}
      fichaTecnica={fichaTecnica}
      ingredientes={ingredientes || []}
      fotoCapa={fotoCapa}
    />
  );
}
