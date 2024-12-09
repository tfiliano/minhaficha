"use client";

import { Builder, FormBuilder2 } from "@/components/form-builder";
import { Button } from "@/components/ui/button";
import { Lock } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import { auth } from "./actions";

export default function LoginPage() {
  const formBuilder: Builder = {
    columns: [
      {
        rows: [
          {
            fields: [
              {
                name: "email",
                type: "email",
                label: "Email",
                placeholder: "Digite seu email",
                required: true,
              },
            ],
          },
          {
            fields: [
              {
                name: "password",
                type: "password",
                label: "Senha",
                placeholder: "Digite sua senha",
                required: true,
              },
            ],
          },
        ],
      },
    ],
  };

  const handleSubmit = async (formData: {
    email: string;
    password: string;
  }) => {
    const { error } = await auth(formData);

    if (error) {
      toast.error(error.message);
    }
  };

  return (
    <>
      <h1 className="text-xl font-bold text-center">Entrar</h1>
      <FormBuilder2
        builder={formBuilder}
        onSubmit={handleSubmit}
        submitLabel="Entrar"
        submitClass="mt-2"
        extraButtons={
          <Button
            className="w-full gap-2"
            variant="ghost"
            asChild
            type="button"
          >
            <Link href="./recovery">
              <Lock size={16} />
              Esqueci minha senha
            </Link>
          </Button>
        }
        hideExtraButtonsSubmiting={false}
        form={{}}
      />
    </>
  );
}
