import { ListChecks } from "lucide-react";

export function Logo() {
  return (
    <>
      <div className="p-2 bg-primary rounded-xl">
        <ListChecks className="text-sm text-white" />
      </div>
      <div className="flex flex-col">
        <h1 className="font-bold">MinhaFicha</h1>
        <small className="text-[10px] text-primary/50">v0.1.0</small>
      </div>
    </>
  );
}
