import {
  Builder,
  FormBuilder2,
  FormBuilderRef,
} from "@/components/form-builder";
import { useRouter } from "@/hooks/use-router";
import { executeRevalidationPath } from "@/lib/revalidation-next";
import { executeQuery } from "@/lib/supabase-helper";
import { Usuario, UsuarioTypes } from "@/models/Usuario";
import { createBrowserClient } from "@/utils/supabase-client";
import { FocusEvent, useRef, useState } from "react";
import { toast } from "sonner";
import { FormContent, ModeFormHandlerProp } from "..";

export type UsuarioProps = {
  usuario?: Usuario;
};

function UsuarioForm({ mode, usuario }: UsuarioProps & ModeFormHandlerProp) {
  const supabase = createBrowserClient();
  const router = useRouter();

  const [userExists, setUserExists] = useState(false);

  const formRef = useRef<FormBuilderRef | undefined>(undefined);

  const formBuilder: Builder = {
    columns: [
      {
        rows: [
          {
            fields: [
              {
                name: "email",
                label: "E-mail",
                placeholder: "E-mail",
                type: "email",
                autoComplete: "username",
                onBlur: getUserByEmail,
              },
              {
                name: "name",
                label: "Nome",
                placeholder: "Nome",
                type: "text",
              },
            ],
          },

          {
            fields: [
              ...(!userExists
                ? [
                    {
                      name: "password",
                      label: "Nova senha",
                      placeholder: "Nome senha",
                      type: "password",
                      autoComplete: "new-password",
                    },
                    {
                      name: "re_password",
                      label: "Confirmar senha",
                      placeholder: "Confirme sua nova senha",
                      type: "password",
                      autoComplete: "new-password",
                    },
                  ]
                : []),
            ],
          },
          {
            fields: [
              {
                name: "type",
                label: "Tipo",
                type: "select",
                options: Object.keys(UsuarioTypes).map((usuarioType) => ({
                  label: UsuarioTypes[usuarioType as keyof typeof UsuarioTypes],
                  value: usuarioType,
                })),
              },
            ],
          },
        ],
      },
    ],
  };

  async function getUserByEmail(
    event: FocusEvent<HTMLInputElement, Element> | FocusEvent<Element, Element>
  ) {
    const { value, validity } = event.target as EventTarget & HTMLInputElement;
    if (validity.valid) {
      const supabase = createBrowserClient();

      const { data: user } = await supabase
        .from("usuarios")
        .select("*")
        .eq("email", value.trim())
        .maybeSingle();

      if (user) {
        setUserExists(!!user);
        formRef.current!.resetField("name", { defaultValue: user.name });
        formRef.current!.resetField("type", { defaultValue: user!.type });
        formRef.current!.setValue("password", "***************");
        formRef.current!.setValue("re_password", "***************");
        toast.success("Usuario encontrado.");
      } else {
        setUserExists(!!user);
        formRef.current!.resetField("password");
        formRef.current!.resetField("re_password");
      }
    }
  }

  const handleSubmit = async (data: Usuario) => {
    const query =
      mode === "update"
        ? supabase.from("usuarios").update(data).eq("id", usuario!.id)
        : supabase.from("usuarios").insert(data).select().maybeSingle();

    const {
      success,
      message,
      data: result,
    } = await executeQuery<typeof query, Usuario>(() => query);

    if (success) {
      toast.success(message);
      if (mode === "create") router.push("/master/usuarios" + `/${result!.id}`);
      executeRevalidationPath("/master/usuarios");
    } else {
      toast.error(message);
    }
  };

  return (
    <FormContent>
      <FormBuilder2
        ref={formRef}
        builder={formBuilder}
        onSubmit={handleSubmit}
        submitLabel="Adicionar"
        form={{ defaultValues: {} }}
      />
    </FormContent>
  );
}

export const Usuarios = {
  Update: (props: UsuarioProps) => <UsuarioForm mode="update" {...props} />,
  Create: (props: UsuarioProps) => <UsuarioForm mode="create" {...props} />,
};
