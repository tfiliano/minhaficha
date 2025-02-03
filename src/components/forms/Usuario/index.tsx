import { Builder } from "@/components/form-builder";
import { useRouter } from "@/hooks/use-router";
import { executeRevalidationPath } from "@/lib/revalidation-next";
import { executeQuery } from "@/lib/supabase-helper";
import { Tables } from "@/types/database.types";
import { createBrowserClient } from "@/utils/supabase-client";
import { toast } from "sonner";
import { EntityFormHandler, ModeFormHandlerProp } from "..";

const formBuilder: Builder = {
  columns: [
    {
      rows: [
        {
          fields: [
            {
              name: "name",
              label: "Nome",
              placeholder: "Digite o nome Usuario",
              type: "text",
              required: true,
            },
          ],
        },
        {
          fields: [
            {
              name: "email",
              label: "Email",
              placeholder: "Digite o email",
              type: "text",
              required: false,
              readOnly: true,
            },
          ],
        },
        {
          fields: [
            {
              name: "type",
              label: "Email",
              placeholder: "Digite o email",
              type: "select",
              options: [
                {
                  value: "admin",
                  label: "Admin",
                },
                {
                  value: "manager",
                  label: "Gerente",
                },
              ],
            },
          ],
        },
      ],
    },
  ],
};

type Usuario = Tables<"usuarios">;

export type UsuarioProps = {
  user: Usuario;
  loja_id: string;
};

function UsuarioForm({ mode, user }: UsuarioProps & ModeFormHandlerProp) {
  const supabase = createBrowserClient();
  const router = useRouter();
  const handleSubmit = async (data: Usuario) => {
    const query =
      mode === "update"
        ? supabase.from("usuarios").update(data).eq("id", user!.id)
        : supabase.from("usuarios").insert(data).select().maybeSingle();

    const {
      success,
      message,
      data: result,
    } = await executeQuery<typeof query, Usuario>(() => query);

    if (success) {
      toast.success(message);
      if (mode === "create") router.push("/admin/usuarios" + `/${result!.id}`);
      executeRevalidationPath("/admin/usuarios");
    } else {
      toast.error(message);
    }
  };
  return (
    <EntityFormHandler<Usuario>
      mode={mode}
      entity={user}
      builder={formBuilder}
      onSubmit={handleSubmit}
      tableCollection="usuarios"
      submitLabel={mode === "create" ? "Adicionar" : "Atualizar"}
    />
  );
}

export const Usuarios = {
  Create: (props: UsuarioProps) => <UsuarioForm mode="create" {...props} />,
  Update: (props: UsuarioProps) => <UsuarioForm mode="update" {...props} />,
};
