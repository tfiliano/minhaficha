"use client";

import dynamic from 'next/dynamic';
import { useEffect } from 'react';
import React from 'react';

// Carregar o componente dinâmicamente para evitar problemas de SSR
const DynamicTemplateEditor = dynamic(() => import('../page'), { ssr: false });

export default function EditTemplatePage({ params }: { params: { id: string } }) {
  // Desempacotar params se for uma Promise usando React.use()
  const safeParams = params instanceof Promise ? React.use(params) : params;
  
  useEffect(() => {
    // Adicionar logs para depuração em modo cliente
    console.log("EditTemplatePage - params recebidos:", params);
    console.log("ID do template:", safeParams.id);
    
    // Verificar se o ID está sendo passado corretamente
    if (!safeParams.id) {
      console.error("ERRO: ID do template não foi fornecido!");
    }
  }, [safeParams]);
  
  // Garantir que o parâmetro id esteja sendo passado corretamente
  return <DynamicTemplateEditor params={safeParams} />;
}