import { VERSION_APP } from "@/utils/consts";
import { ListChecks } from "lucide-react";

export function Logo() {
  return (
    <>
      <div className="p-2 bg-primary rounded-xl">
        <ListChecks className="text-sm text-white" />
      </div>
      {/* Mostrar texto apenas no desktop */}
      <div className="hidden sm:flex flex-col">
        <h1 className="font-bold">MinhaFicha</h1>
        <small className="text-[10px] text-primary/50">{VERSION_APP}</small>
      </div>
    </>
  );
}
