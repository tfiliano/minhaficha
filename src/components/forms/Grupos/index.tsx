import { BottomSheetSheetController } from "@/components/bottom-sheet";
import { FormBuilder2 } from "@/components/form-builder";
import { Button } from "@/components/ui/button";
import { useDeviceType } from "@/hooks/use-device-type";
import { executeRevalidationPath } from "@/lib/revalidation-next";
import { executeQuery } from "@/lib/supabase-helper";
import { cn } from "@/lib/utils";
import { Tables } from "@/types/database.types";
import { createBrowserClient } from "@/utils/supabase-client";
import { toast } from "sonner";

const formBuilder = {
  columns: [
    {
      rows: [
        {
          fields: [
            {
              name: "nome",
              label: "Nome",
              placeholder: "Digite o nome do Grupo",
              type: "text",
              required: true,
            },
          ],
        },
        {
          fields: [
            {
              name: "cor_botao",
              label: "Cor do Botao",
              placeholder: "Digite a Cor do Botão",
              type: "text",
              required: true,
            },
          ],
        },
        {
          fields: [
            {
              name: "cor_fonte",
              label: "Cor da Fonte",
              placeholder: "Digite a Cor da Fonte",
              type: "color",
              required: true,
            },
          ],
        },
        {
          fields: [
            {
              name: "icone",
              label: "Icone",
              placeholder: "Digite o Icone",
              type: "text",
              required: true,
            },
          ],
        },
      ],
    },
  ],
};

type Grupo = Tables<"grupos">;

type GrupoProps = {
  grupo: Grupo;
  bottomSheetController?: BottomSheetSheetController;
};

function Update({
  grupo,
  bottomSheetController,
}: Pick<GrupoProps, "grupo" | "bottomSheetController">) {
  const supabase = createBrowserClient();

  const onSubmit = async ({ id, ...data }: Grupo) => {
    const query = supabase
      .from("grupos")
      .update({ ...data })
      .eq("id", grupo.id);

    const { success, message } = await executeQuery<typeof query>(() => query);

    if (success) {
      toast.success(message);
      executeRevalidationPath("/admin/grupos");
    } else if (!success) {
      toast.error(message);
    }
  };

  return (
    <div className="max-w-lg mx-auto px-4">
      <FormBuilder2
        builder={formBuilder}
        onSubmit={onSubmit}
        submitLabel="Atualizar"
        buttonsContainerClass={cn({
          "mb-8": useDeviceType() === "PC",
        })}
        form={{ defaultValues: { ...(grupo || {}) } }}
        extraButtons={
          <Button
            variant="destructive"
            className="w-full"
            type="button"
            onClick={() => bottomSheetController?.current?.onClose()}
          >
            Cancelar
          </Button>
        }
      />
    </div>
  );
}

function Create({
  bottomSheetController,
}: Pick<GrupoProps, "bottomSheetController">) {
  const supabase = createBrowserClient();

  const onSubmit = async ({ ...data }: Grupo) => {
    const query = supabase.from("grupos").insert({ ...data });

    const { success, message } = await executeQuery<typeof query>(() => query);

    if (success) {
      toast.success(message);
      bottomSheetController?.current?.onClose();
      executeRevalidationPath("/admin/armazenamentos");
    } else if (!success) {
      toast.error(message);
    }
  };

  return (
    <div className="max-w-lg mx-auto px-4">
      <FormBuilder2
        builder={formBuilder}
        onSubmit={onSubmit}
        submitLabel="Adicionar"
        buttonsContainerClass={cn({
          "mb-8": useDeviceType() === "PC",
        })}
        form={{}}
        extraButtons={
          <Button
            variant="destructive"
            className="w-full"
            type="button"
            onClick={() => bottomSheetController?.current?.onClose()}
          >
            Cancelar
          </Button>
        }
      />
    </div>
  );
}

export const Grupos = {
  Update,
  Create,
};
