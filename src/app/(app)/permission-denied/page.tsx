import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function Forbidden() {
  return (
    <div className="flex items-center justify-center h-[calc(100vh-80px)] bg-background">
      <div className="text-center flex flex-col gap-4 max-w-sm">
        <h1 className="text-6xl font-bold text-destructive">403</h1>
        <p className="mt-4 text-xl">
          Você não tem permissão para acessar esta página.
        </p>
        <Button asChild variant="link">
          <Link href="/operador">Voltar para a página inicial</Link>
        </Button>
      </div>
    </div>
  );
}
