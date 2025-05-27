import { Logo } from "@/components/Logo";
import { PropsWithChildren } from "react";

export default function LayoutAuth({ children }: PropsWithChildren) {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background">
      <div className="flex flex-row gap-4 mx-auto items-center justify-center py-4 fixed top-0 border-b border-border w-full">
        <Logo />
      </div>
      {children}
    </div>
  );
}
