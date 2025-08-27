"use client";

import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tables } from "@/types/database.types";
import { 
  Search, 
  Printer, 
  Plus, 
  Hash,
  Wifi,
  WifiOff,
  Monitor,
  Settings,
  CheckCircle,
  AlertCircle
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { PropsWithChildren, useState } from "react";
import { cn } from "@/lib/utils";

type Impressora = Tables<`impressoras`>;

type ImpressorasPage = {
  impressoras: Impressora[] | null;
};

export function ImpressorasPageClient({
  impressoras,
}: PropsWithChildren<ImpressorasPage>) {
  const pathname = usePathname();
  const [busca, setBusca] = useState("");

  const impressorasFiltrados = (impressoras || []).filter((impressora) => {
    const normalizar = (texto: string) =>
      texto
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLowerCase();
    return (
      normalizar(impressora.nome || "").includes(normalizar(busca)) ||
      normalizar(impressora.ip || "").includes(normalizar(busca)) ||
      normalizar(impressora.modelo || "").includes(normalizar(busca))
    );
  });

  // Estatísticas
  const totalImpressoras = impressorasFiltrados.length;
  const impressorasAtivas = impressorasFiltrados.filter(imp => imp.ativa).length;
  const impressorasOnline = impressorasFiltrados.filter(imp => imp.status === 'online').length;

  const getStatusInfo = (status: string | null, ativa: boolean) => {
    if (!ativa) {
      return {
        label: 'Inativa',
        icon: AlertCircle,
        color: 'text-slate-500',
        bgColor: 'bg-slate-100 dark:bg-slate-800',
        badgeClass: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
      };
    }
    
    switch (status) {
      case 'online':
        return {
          label: 'Online',
          icon: CheckCircle,
          color: 'text-emerald-600 dark:text-emerald-400',
          bgColor: 'bg-emerald-100 dark:bg-emerald-900/30',
          badgeClass: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
        };
      case 'offline':
        return {
          label: 'Offline',
          icon: AlertCircle,
          color: 'text-red-600 dark:text-red-400',
          bgColor: 'bg-red-100 dark:bg-red-900/30',
          badgeClass: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
        };
      default:
        return {
          label: 'Desconhecido',
          icon: AlertCircle,
          color: 'text-amber-600 dark:text-amber-400',
          bgColor: 'bg-amber-100 dark:bg-amber-900/30',
          badgeClass: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'
        };
    }
  };

  return (
    <div className="space-y-6">
      {/* Header com controles */}
      <div className="bg-gradient-to-r from-slate-50 to-violet-50 dark:from-slate-900 dark:to-slate-800 rounded-xl p-6 border border-slate-200 dark:border-slate-700 shadow-sm">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          {/* Título e descrição */}
          <div className="flex flex-col gap-4">
            <div>
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
                Impressoras
              </h2>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Gerencie impressoras de etiquetas e monitore status de conexão
              </p>
            </div>
            {/* Estatísticas */}
            <div className="flex flex-wrap gap-3">
              <Badge className="px-3 py-1.5 bg-violet-100 text-violet-700 dark:bg-violet-900 dark:text-violet-300">
                <Printer className="h-3.5 w-3.5 mr-1.5" />
                {totalImpressoras} {totalImpressoras === 1 ? 'impressora' : 'impressoras'}
              </Badge>
              <Badge className="px-3 py-1.5 bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300">
                <CheckCircle className="h-3.5 w-3.5 mr-1.5" />
                {impressorasAtivas} ativas
              </Badge>
              <Badge className="px-3 py-1.5 bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300">
                <Wifi className="h-3.5 w-3.5 mr-1.5" />
                {impressorasOnline} online
              </Badge>
            </div>
          </div>

          {/* Botão de adicionar */}
          <Link href={`${pathname}/add`}>
            <Button className="bg-gradient-to-r from-violet-500 to-violet-600 hover:from-violet-600 hover:to-violet-700 text-white shadow-lg hover:shadow-xl transition-all duration-200">
              <Plus className="h-4 w-4 mr-2" />
              Nova Impressora
            </Button>
          </Link>
        </div>
      </div>

      {/* Busca */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-5 w-5" />
        <Input
          type="text"
          placeholder="Buscar impressoras por nome, IP ou modelo..."
          className="pl-10 h-11 bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700"
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
        />
      </div>

      {/* Grid de impressoras */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {impressorasFiltrados.length === 0 ? (
          <div className="col-span-full">
            <Card className="border-2 border-dashed border-slate-300 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/50">
              <CardContent className="flex flex-col items-center justify-center py-16">
                <div className="rounded-full bg-slate-100 dark:bg-slate-800 p-6 mb-6">
                  <Printer className="h-12 w-12 text-slate-400" />
                </div>
                <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">
                  Nenhuma impressora encontrada
                </h3>
                <p className="text-slate-600 dark:text-slate-400 text-center max-w-sm mb-6">
                  {busca ? 
                    `Nenhuma impressora corresponde à busca "${busca}"` : 
                    "Comece cadastrando impressoras para o sistema de etiquetas"
                  }
                </p>
                {!busca && (
                  <Link href={`${pathname}/add`}>
                    <Button className="bg-gradient-to-r from-violet-500 to-violet-600 hover:from-violet-600 hover:to-violet-700 text-white">
                      <Plus className="h-4 w-4 mr-2" />
                      Criar Primeira Impressora
                    </Button>
                  </Link>
                )}
              </CardContent>
            </Card>
          </div>
        ) : (
          impressorasFiltrados.map((impressora) => {
            const statusInfo = getStatusInfo(impressora.status, impressora.ativa);
            const StatusIcon = statusInfo.icon;
            const isOnline = impressora.status === 'online' && impressora.ativa;
            
            return (
              <Link href={pathname + `/${impressora.id}`} key={impressora.id}>
                <Card className={cn(
                  "group relative overflow-hidden transition-all duration-300 hover:shadow-xl border-2",
                  impressora.ativa 
                    ? "border-slate-200 dark:border-slate-700 hover:border-violet-300 dark:hover:border-violet-700" 
                    : "border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-800/50 opacity-75"
                )}>
                  {/* Gradiente decorativo */}
                  <div className={cn(
                    "absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300",
                    impressora.ativa 
                      ? "bg-gradient-to-br from-violet-500/10 to-transparent" 
                      : "bg-gradient-to-br from-slate-500/10 to-transparent"
                  )} />
                  
                  {/* Indicador de status online */}
                  {isOnline && (
                    <div className="absolute top-2 right-2 w-3 h-3 bg-emerald-500 rounded-full animate-pulse" />
                  )}
                  
                  <CardHeader className="relative pb-3">
                    <div className="flex justify-between items-start gap-2">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <CardTitle className={cn(
                            "text-lg font-bold transition-colors line-clamp-2",
                            impressora.ativa 
                              ? "text-slate-900 dark:text-white group-hover:text-violet-600 dark:group-hover:text-violet-400" 
                              : "text-slate-500 dark:text-slate-400"
                          )}>
                            {impressora.nome}
                          </CardTitle>
                          <Badge className={statusInfo.badgeClass}>
                            <StatusIcon className="h-3 w-3 mr-1" />
                            {statusInfo.label}
                          </Badge>
                        </div>
                        {impressora.id && (
                          <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1">
                            <Hash className="h-3 w-3" />
                            {impressora.id.slice(0, 8)}
                          </p>
                        )}
                      </div>
                      <div className={cn(
                        "p-2 rounded-lg",
                        impressora.ativa 
                          ? "bg-violet-100 dark:bg-violet-900/30" 
                          : "bg-slate-200 dark:bg-slate-700"
                      )}>
                        <Printer className={cn(
                          "h-4 w-4",
                          impressora.ativa 
                            ? "text-violet-600 dark:text-violet-400" 
                            : "text-slate-400"
                        )} />
                      </div>
                    </div>
                  </CardHeader>
                  
                  <CardContent className="relative space-y-4">
                    {/* Modelo */}
                    {impressora.modelo && (
                      <div className={cn(
                        "flex items-center gap-3 p-3 rounded-lg",
                        impressora.ativa 
                          ? "bg-slate-100 dark:bg-slate-800" 
                          : "bg-slate-200 dark:bg-slate-700"
                      )}>
                        <Monitor className="h-4 w-4 text-slate-500" />
                        <div className="flex-1">
                          <p className="text-xs text-slate-500 dark:text-slate-400">Modelo</p>
                          <p className="font-semibold text-sm text-slate-700 dark:text-slate-300">
                            {impressora.modelo}
                          </p>
                        </div>
                      </div>
                    )}

                    {/* Endereço IP */}
                    {impressora.ip && (
                      <div className={cn(
                        "flex items-center gap-3 p-3 rounded-lg",
                        statusInfo.bgColor
                      )}>
                        {impressora.ativa && impressora.status === 'online' ? 
                          <Wifi className={cn("h-4 w-4", statusInfo.color)} /> :
                          <WifiOff className={cn("h-4 w-4", statusInfo.color)} />
                        }
                        <div className="flex-1">
                          <p className={cn("text-xs", statusInfo.color)}>Endereço IP</p>
                          <p className={cn("font-semibold text-sm font-mono", statusInfo.color)}>
                            {impressora.ip}
                          </p>
                        </div>
                      </div>
                    )}

                    {/* Porta */}
                    {impressora.porta && (
                      <div className="flex items-center gap-3">
                        <Settings className="h-4 w-4 text-slate-400" />
                        <div className="flex-1">
                          <p className="text-xs text-slate-500 dark:text-slate-400">Porta</p>
                          <p className="font-semibold text-sm text-slate-700 dark:text-slate-300 font-mono">
                            {impressora.porta}
                          </p>
                        </div>
                      </div>
                    )}

                    {/* Status final */}
                    <div className="pt-3 border-t border-slate-200 dark:border-slate-700">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <StatusIcon className={cn("h-4 w-4", statusInfo.color)} />
                          <div>
                            <p className="text-xs text-slate-500 dark:text-slate-400">Conexão</p>
                            <p className={cn("text-sm font-medium", statusInfo.color)}>
                              {statusInfo.label}
                            </p>
                          </div>
                        </div>
                        
                        {/* Tipo de impressora */}
                        <div className="px-3 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-xs font-medium text-slate-700 dark:text-slate-300 flex items-center gap-1">
                          <Printer className="h-3 w-3" />
                          ZPL
                        </div>
                      </div>
                    </div>
                  </CardContent>
                  
                  {/* Hover overlay com ações */}
                  <div className="absolute inset-x-0 bottom-0 h-12 bg-gradient-to-t from-black/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
                </Card>
              </Link>
            );
          })
        )}
      </div>
    </div>
  );
}