"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { generateToastPromise } from "@/lib/toast";
import { Store } from "lucide-react";
import { actionSelectLoja } from "./select-store";

export function ButtonGarageSelect({ loja, tipo }: any) {
  const handleSelectGarage = async () => {
    await generateToastPromise<any, any>({
      action: actionSelectLoja,
      actionData: {
        loja_id: loja.id,
        tipo,
      },
      successMessage: "Acesso permitido.",
    });

    // Pequeno delay para garantir que cookies sejam persistidos
    await new Promise((resolve) => setTimeout(resolve, 100));

    // Forçar navegação completa
    window.location.href = "/operador";
  };

  return (
    <button
      className="bg-white dark:bg-slate-900 rounded-2xl shadow-lg hover:shadow-2xl p-8 border border-slate-200 dark:border-slate-700 transition-all duration-300 hover:scale-105 hover:border-blue-500 dark:hover:border-blue-500 group"
      onClick={handleSelectGarage}
    >
      <div className="flex flex-col items-center">
        <Avatar className="w-20 h-20 rounded-full overflow-hidden mb-4 border-2 border-slate-200 dark:border-slate-700 group-hover:border-blue-500 transition-all duration-300 flex items-center justify-center">
          <AvatarImage src={loja?.image} className="object-cover" />
          <AvatarFallback className="bg-gradient-to-br from-blue-500 to-blue-600">
            <Store className="w-10 h-10 text-white" />
          </AvatarFallback>
        </Avatar>
        <span className="text-lg font-bold text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors duration-300 text-center">
          {loja?.nome}
        </span>
      </div>
    </button>
  );
}
