import { Suspense } from "react";
import { Logo } from "../Logo";
import { ModeToggle } from "../mode-toggle";
import { BackButton } from "./back-button";

export function Header() {
  return (
    <header className="bg-background/70 border-b h-20 sticky top-0 flex items-center justify-center gap-4 z-20 backdrop-blur shadow-lg mb-4 shadow-primary-foreground">
      <Suspense>
        <BackButton />
      </Suspense>
      <Logo />
      <ModeToggle />
    </header>
  );
}
