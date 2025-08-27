import { Suspense } from "react";
import { Logo } from "../Logo";
import { ModeToggle } from "../mode-toggle";
import { StoreSelector } from "../store-selector";
import { BackButton } from "./back-button";

export function Header() {
  return (
    <header className="bg-background/95 border-b h-16 sm:h-20 sticky top-0 flex items-center justify-between px-3 sm:px-4 lg:px-6 z-20 backdrop-blur-sm shadow-sm mb-4">
      <div className="flex items-center gap-1.5 sm:gap-2 lg:gap-3 flex-1 min-w-0">
        <Suspense>
          <BackButton />
        </Suspense>
        <Logo />
      </div>
      
      <div className="flex items-center gap-1.5 sm:gap-2 lg:gap-3 flex-shrink-0 ml-2 sm:ml-4">
        <StoreSelector />
        <ModeToggle />
      </div>
    </header>
  );
}
