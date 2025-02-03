"use client";

import { Builder, FormBuilder2 } from "@/components/form-builder";
import { Button } from "@/components/ui/button";
import { useRouter, useSearchParams } from "@/hooks/use-router";
import { generateToastPromise } from "@/lib/toast";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { z } from "zod";
import { login } from "../server-action";

const schema = z
  .object({
    email: z
      .string({ required_error: "Email obrigatório" })
      .email({ message: "Email inválido" }),
    password: z
      .string({ required_error: "Senha obrigatória" })
      .min(6, { message: "Senha precisa conter pelo menos 6 caracteres" }),
  })
  .required();

type FormLogin = z.infer<typeof schema>;

const builder: Builder = {
  columns: [
    {
      rows: [
        {
          fields: [
            {
              name: "email",
              label: "Email",
              placeholder: "email@exemplo.com",
              type: "email",
              autoComplete: "username",
            },
          ],
        },
        {
          fields: [
            {
              name: "password",
              label: "Senha",
              placeholder: "Sua senha",
              type: "password",
              autoComplete: "current-password",
            },
          ],
        },
      ],
    },
  ],
};

export function PageClient() {
  const params = useSearchParams();
  const router = useRouter();
  const form = {
    defaultValues: {},
    resolver: zodResolver(schema),
  };

  const onSubmit = async (data: FormLogin) => {
    try {
      await generateToastPromise<Awaited<ReturnType<typeof login>>, FormLogin>({
        action: login,
        actionData: data,
        successMessage: "Autenticado com sucesso!",
        loadingMessage: "Autenticando...",
      });
      router.replace(params.get("nextUrl") || "/");
    } catch (error) {}
  };

  return (
    <div className="w-full max-w-sm p-4">
      <h1 className="font-bold text-center mt-8 text-xl">Entrar</h1>
      <FormBuilder2
        form={form}
        builder={builder}
        onSubmit={onSubmit}
        submitLabel="Entrar"
        extraButtons={
          <Button variant="link" className="p-0 hidden" asChild>
            <Link href="/auth/forgot-password">Esqueci minha senha</Link>
          </Button>
        }
        schema={schema}
      />
    </div>
  );
}
