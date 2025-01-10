import { ListChecks } from "lucide-react";
import { Suspense } from "react";
import { ModeToggle } from "../mode-toggle";
import { BackButton } from "./back-button";

export function Header() {
  return (
    <header className="bg-background/70 border-b h-20 sticky top-0 flex items-center justify-center gap-4 z-20 backdrop-blur">
      <Suspense>
        <BackButton />
      </Suspense>
      <div className="p-2 bg-primary rounded-xl ">
        <ListChecks className="text-sm text-white" />
      </div>
      <div className="flex flex-col">
        <h1 className="font-bold">MinhaFicha</h1>
        <small className="text-[10px] text-primary/50">v0.0.9</small>
      </div>
      <ModeToggle />
    </header>
  );
}
