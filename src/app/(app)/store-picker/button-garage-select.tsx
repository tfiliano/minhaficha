"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useRouter } from "@/hooks/use-router";
import { generateToastPromise } from "@/lib/toast";
import { Warehouse } from "lucide-react";
import { actionSelectLoja } from "./select-store";

export function ButtonGarageSelect({ loja, tipo }: any) {
  const router = useRouter();
  const handleSelectGarage = async () => {
    const response = await generateToastPromise<any, any>({
      action: actionSelectLoja,
      actionData: {
        loja_id: loja.id,
        tipo,
      },
      successMessage: "Acesso permitido.",
    });

    setTimeout(() => router.replace("/"), 500);
  };

  return (
    <button
      className="flex flex-col items-center group"
      onClick={handleSelectGarage}
    >
      <Avatar className="w-24 h-24 rounded-full overflow-hidden mb-2 border-border dark:border-white/20 hover:border-primary transition-all duration-300 flex items-center justify-center border hover:scale-110">
        <AvatarImage src={loja?.image} />
        <AvatarFallback>
          <div>
            <Warehouse className="w-7 h-7  text-muted-foreground group-hover:text-primary transition-colors duration-300" />
          </div>
        </AvatarFallback>
      </Avatar>
      <span className="text-sm font-bold text-gray-500 group-hover:text-primary transition-colors duration-300">
        {loja?.nome}
      </span>
    </button>
  );
}
