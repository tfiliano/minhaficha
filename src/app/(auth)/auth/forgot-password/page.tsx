"use client";

import { Builder, FormBuilder2 } from "@/components/form-builder";
import { Button } from "@/components/ui/button";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { z } from "zod";

const schema = z
  .object({
    email: z
      .string({ required_error: "Email obrigatório" })
      .email({ message: "Email inválido" }),
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
      ],
    },
  ],
};

export default function Page() {
  const router = useRouter();
  const form = {
    defaultValues: {},
    resolver: zodResolver(schema),
  };

  const onSubmit = async (data: FormLogin) => {
    return router.replace("/");
  };

  return (
    <div className="w-full max-w-sm p-4">
      <h1 className="font-bold text-center mt-8 text-xl">Recuperar senha</h1>

      <FormBuilder2
        form={form}
        builder={builder}
        onSubmit={onSubmit}
        submitLabel="Entrar"
        extraButtons={
          <Button variant="link" className="p-0" asChild>
            <Link href="/auth/login">Fazer login</Link>
          </Button>
        }
        schema={schema}
      />
    </div>
  );
}
