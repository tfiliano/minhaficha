import { Builder } from "@/components/form-builder";
import { useRouter } from "@/hooks/use-router";
import { executeRevalidationPath } from "@/lib/revalidation-next";
import { executeQuery } from "@/lib/supabase-helper";
import { Tables } from "@/types/database.types";
import { createBrowserClient } from "@/utils/supabase-client";
import { toast } from "sonner";
import { EntityFormHandler, ModeFormHandlerProp } from "..";
import { createUser } from "./create-user";

type Usuario = Tables<"usuarios">;

export type UsuarioProps = {
  user?: Usuario;
  loja_id: string;
};

function UsuarioForm({
  mode,
  user,
  loja_id,
  keyProp,
}: UsuarioProps & ModeFormHandlerProp) {
  const supabase = createBrowserClient();
  const router = useRouter();
  const handleSubmit = async (data: Usuario) => {
    if (mode == "create") {
      await createUser(data as any, loja_id);
      if (mode === "create") router.push(`/dashboard/lojas/${loja_id}`);
    } else {
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

        executeRevalidationPath("/admin/usuarios");
      } else {
        toast.error(message);
      }
    }
  };

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
                required: mode == "create",
                readOnly: mode === "update",
              },
            ],
          },
          {
            fields: [
              {
                name: "type",
                label: "Tipo",
                placeholder: "Tipo",
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

  if (mode === "create") {
    formBuilder.columns[0].rows?.push({
      fields: [
        {
          name: "password",
          label: "Senha",
          placeholder: "Digite uma senha",
          type: "password",
          required: true,
        },
      ],
    });
  }

  return (
    <EntityFormHandler<Usuario>
      mode={mode}
      entity={user}
      builder={formBuilder}
      onSubmit={handleSubmit}
      tableCollection={mode === "create" ? "usuarios" : "loja_usuarios"}
      submitLabel={mode === "create" ? "Adicionar" : "Atualizar"}
      keyProp={keyProp}
    />
  );
}

export const Usuarios = {
  Create: (props: Omit<UsuarioProps, "user">) => (
    <UsuarioForm mode="create" {...props} />
  ),
  Update: (props: UsuarioProps & { keyProp?: string }) => (
    <UsuarioForm mode="update" {...props} />
  ),
};
