import { Logo } from "@/components/Logo";
import { Lightbulb } from "lucide-react";
import { PropsWithChildren, Suspense } from "react";

function LogoFallback() {
  return (
    <>
      <div className="p-2 bg-primary rounded-xl">
        <Lightbulb className="h-5 w-5 text-white" />
      </div>
      <div className="flex flex-col">
        <h1 className="font-bold text-sm sm:text-base">Minha Ficha</h1>
      </div>
    </>
  );
}

export default function LayoutAuth({ children }: PropsWithChildren) {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background">
      <div className="flex flex-row gap-4 mx-auto items-center justify-center py-4 fixed top-0 border-b border-border w-full">
        <Suspense fallback={<LogoFallback />}>
          <Logo />
        </Suspense>
      </div>
      {children}
    </div>
  );
}
