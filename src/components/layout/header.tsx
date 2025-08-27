import { Suspense } from "react";
import { Logo } from "../Logo";
import { ModeToggle } from "../mode-toggle";
import { StoreSelector } from "../store-selector";
import { BackButton } from "./back-button";

export function Header() {
  return (
    <header className="bg-background/70 border-b h-20 sticky top-0 flex items-center justify-between px-6 z-20 backdrop-blur shadow-lg mb-4 shadow-primary-foreground">
      <div className="flex items-center gap-4">
        <Suspense>
          <BackButton />
        </Suspense>
        <Logo />
      </div>
      
      <div className="flex items-center gap-4">
        <StoreSelector />
        <ModeToggle />
      </div>
    </header>
  );
}
