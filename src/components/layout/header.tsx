import { Suspense } from "react";
import { Logo } from "../Logo";
import { StoreSelector } from "../store-selector";
import { BackButton } from "./back-button";
import { MobileMenu } from "./mobile-menu";
import { UserMenu } from "./user-menu";

export function Header() {
  return (
    <header className="bg-background/95 border-b h-16 sm:h-20 sticky top-0 flex items-center px-3 sm:px-4 lg:px-6 z-20 backdrop-blur-sm shadow-sm mb-4">
      {/* Lado esquerdo */}
      <div className="flex items-center gap-1.5 sm:gap-2 lg:gap-3 flex-1 min-w-0">
        {/* Menu burger visível em todos os tamanhos */}
        <MobileMenu />
        <Suspense>
          <BackButton />
        </Suspense>
      </div>

      {/* Centro - Logo */}
      <div className="flex items-center gap-2 absolute left-1/2 transform -translate-x-1/2">
        <Logo />
      </div>

      {/* Lado direito */}
      <div className="flex items-center gap-1.5 sm:gap-2 lg:gap-3 flex-shrink-0 ml-auto">
        <div className="hidden md:block">
          <StoreSelector />
        </div>
        <UserMenu />
      </div>
    </header>
  );
}
