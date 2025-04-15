"use server";


import { createClient } from "@/utils/supabase";
import type { Json } from "@/types/database.types";
import { FieldPosition, Template } from "./types";
import { createProductTemplate } from "./editor/templates/product-template";
import { createShippingTemplate } from "./editor/templates/shipping-template";
import { createInventoryTemplate } from "./editor/templates/inventory-template";


// Função segura para serializar objetos para o Supabase
function safelyStringifyForSupabase(obj: any): any {
  // Se for array, mapeamos cada item
  if (Array.isArray(obj)) {
    return obj.map(item => safelyStringifyForSupabase(item));
  }
  
  // Se não for um objeto ou for null, retornamos diretamente
  if (obj === null || typeof obj !== 'object') {
    return obj;
  }
  
  // Para objetos, criamos uma cópia limpa com apenas propriedades seguras
  const cleanObj = {};
  
  for (const [key, value] of Object.entries(obj)) {
    // Ignoramos funções, símbolos e outras coisas não serializáveis
    if (typeof value === 'function' || typeof value === 'symbol') {
      continue;
    }
    
    // Lidamos recursivamente com objetos aninhados
    if (value !== null && typeof value === 'object') {
      if (Array.isArray(value)) {
        cleanObj[key] = value.map(item => safelyStringifyForSupabase(item));
      } else {
        // Evitamos entrar em ciclos de referência
        if (value !== obj) {  // Evita auto-referências diretas
          cleanObj[key] = safelyStringifyForSupabase(value);
        }
      }
    } else {
      // Valores primitivos são copiados diretamente
      cleanObj[key] = value;
    }
  }
  
  return cleanObj;
}

export async function saveTemplate(template) {
  const supabase = await createClient();
  
  try {
    // Limpar os dados para garantir que são seguros para serialização
    const cleanTemplate = safelyStringifyForSupabase(template);
    
    // Verificar se temos os campos mínimos necessários
    if (!cleanTemplate.nome) {
      throw new Error("Nome do template é obrigatório");
    }
    
    // Construir objeto de dados para upsert manualmente para maior controle
    const upsertData = {
      id: cleanTemplate.id,
      nome: cleanTemplate.nome,
      zpl: cleanTemplate.zpl || '',
      campos: cleanTemplate.campos || [],
      width: cleanTemplate.width || 400,
      height: cleanTemplate.height || 300
    };
    
    // Agora é seguro enviá-lo para o Supabase
    const { data, error } = await supabase
      .from("templates_etiquetas")
      .upsert(upsertData, {
        onConflict: 'id'
      });

    if (error) {
      console.error("Erro do Supabase:", error);
      throw new Error(error.message);
    }
    
    return data;
  } catch (error) {
    console.error("Erro ao salvar template:", error);
    throw error;
  }
}

export async function getTemplates() {
  const supabase = await createClient();
  
  const { data, error } = await supabase
    .from("templates_etiquetas")
    .select("*")
    .order("nome");

  if (error) throw new Error(error.message);
  
  // Debug dos dados brutos
  console.log("Dados brutos do banco:", JSON.stringify(data, null, 2));
  
  // Converter propriamente os dados JSON para o tipo Template
  const templates = (data || []).map(item => {
    try {
      // Garantir que campos é um array
      let campos: any[] = [];
      if (Array.isArray(item.campos)) {
        campos = item.campos;
      } else if (typeof item.campos === 'string') {
        try {
          campos = JSON.parse(item.campos);
        } catch (e) {
          console.error("Erro ao fazer parse dos campos:", e);
          campos = [];
        }
      }
      
      // Retornar um objeto Template com valores padrão para campos ausentes
      const template = {
        id: item.id,
        nome: item.nome || '',
        zpl: item.zpl || '',
        created_at: item.created_at,
        width: item.width || 400,
        height: item.height || 300,
        // Mapear os campos garantindo que todos tenham as propriedades esperadas
        campos: campos.map(campo => ({
          name: campo?.name || 'campo',
          x: typeof campo?.x === 'number' ? campo.x : 10,
          y: typeof campo?.y === 'number' ? campo.y : 10,
          fontSize: typeof campo?.fontSize === 'number' ? campo.fontSize : 10,
          fontStyle: campo?.fontStyle || 'normal',
          reversed: Boolean(campo?.reversed),
          alignment: campo?.alignment || 'left',
          fontFamily: campo?.fontFamily || 'A',
          fieldType: campo?.fieldType || 'dynamic',
          lineNumber: typeof campo?.lineNumber === 'number' ? campo.lineNumber : 1,
          linePosition: typeof campo?.linePosition === 'number' ? campo.linePosition : 1,
          staticValue: campo?.staticValue,
          defaultValue: campo?.defaultValue,
          barcodeType: campo?.barcodeType,
          barcodeHeight: campo?.barcodeHeight,
          lineWidth: campo?.lineWidth,
          lineHeight: campo?.lineHeight,
          boxWidth: campo?.boxWidth,
          boxHeight: campo?.boxHeight,
          boxBorderWidth: campo?.boxBorderWidth,
          enabled: campo?.hasOwnProperty('enabled') ? Boolean(campo.enabled) : true,
          uppercase: Boolean(campo?.uppercase),
          prefix: campo?.prefix,
          suffix: campo?.suffix,
          dateFormat: campo?.dateFormat
        }))
      } as Template;
      
      return template;
    } catch (e) {
      console.error(`Erro ao processar template ${item.id}:`, e);
      // Retorna um template mínimo em caso de erro
      return {
        id: item.id,
        nome: item.nome || '[Erro ao carregar]',
        zpl: '',
        campos: [],
        width: 400,
        height: 300
      } as Template;
    }
  });
  
  return templates;
}

export async function testPrint(templateId: string, testData: Record<string, string>, currentZpl?: string) {
  const supabase = await createClient();
  let zpl: string;
  
  if (templateId === "temp" && currentZpl) {
    // For new templates that haven't been saved yet
    zpl = currentZpl;
  } else {
    // For existing templates
    const { data: template, error: templateError } = await supabase
      .from("templates_etiquetas")
      .select("*")
      .eq("id", templateId)
      .single();

    if (templateError) throw new Error(templateError.message);
    zpl = template.zpl ?? '';
  }

  // Replace placeholders with test data
  Object.entries(testData).forEach(([key, value]) => {
    zpl = zpl.replace(new RegExp(`\\{${key}\\}`, 'g'), value || '');
  });

  // Create a test print job
  const { data, error } = await supabase
    .from("etiquetas")
    .insert({
      command: zpl,
      status: "pending",
      quantidade: 1,
      // test_print: true
    });

  if (error) throw new Error(error.message);
  return data;
}

export async function deleteTemplate(id: string) {
  const supabase = await createClient();
  
  const { error } = await supabase
    .from("templates_etiquetas")
    .delete()
    .eq("id", id);

  if (error) throw new Error(error.message);
  return true;
}

// Versão final com correções para alinhamento e posicionamento
export async function generateZplCode(fields: FieldPosition[], labelWidth: number, labelHeight: number): string {
  // Iniciar o documento ZPL
  let zpl = [
    `^XA`,
    `^PW${labelWidth}`,
    `^LL${labelHeight}`,
    `^LS0`,
    `^LH0,0`,
    `^CI28`  // Definir conjunto de caracteres internacionais
  ];
  
  // Ordenar campos por número de linha e posição
  const sortedFields = [...fields].sort((a, b) => {
    if (a.lineNumber !== b.lineNumber) {
      return a.lineNumber - b.lineNumber;
    }
    return a.linePosition - b.linePosition;
  });
  
  // Processar apenas campos habilitados
  sortedFields.filter(field => field.enabled).forEach(field => {
    switch(field.fieldType) {
      case 'dynamic':
      case 'static': {
        // Para campos de texto
        const content = field.fieldType === 'static' 
          ? field.staticValue || '' 
          : `{${field.name}}`;
          
        // Processa o conteúdo com prefixo/sufixo e maiúsculas
        let processedContent = content;
        if (field.prefix) {
          processedContent = field.prefix + processedContent;
        }
        if (field.suffix) {
          processedContent = processedContent + field.suffix;
        }
        
        // Se configurado para maiúsculas
        if (field.uppercase) {
          processedContent = processedContent.toUpperCase();
        }
        
        // Ponto de Origem - Define a posição do campo
        zpl.push(`^FO${field.x},${field.y}`);
        
        // Definir fonte - Mapear estilos de fonte
        const fontStyle = field.fontStyle === 'bold' ? 'B' : 
                          field.fontStyle === 'italic' ? 'I' : 'N';
        zpl.push(`^A${field.fontFamily}${fontStyle},${field.fontSize}`);
        
        // Definir alinhamento/bloco de texto
        const alignVal = field.alignment === 'center' ? 'C' : field.alignment === 'right' ? 'R' : 'L';
        
        // Calcular a largura do campo
        let fieldWidth;
        if (field.fullWidth) {
          // Se for largura total, usa a largura da etiqueta menos um pequeno padding
          fieldWidth = labelWidth - 20;
        } else {
          // Caso contrário, calcula a largura disponível a partir da posição X
          fieldWidth = labelWidth - field.x;
        }
        
        // Aplicar bloco de texto com a largura calculada
        zpl.push(`^FB${fieldWidth},1,0,${alignVal}`);
        
        // Se for largura total e reverso, primeiro desenhar um retângulo preto de fundo
        if (field.fullWidth && field.reversed) {
          // Criar um retângulo preto com a largura total da etiqueta
          zpl.push(`^GB${fieldWidth},${field.fontSize * 1.5},${field.fontSize * 0.1},B^FS`);
          
          // Reposicionar para o texto
          zpl.push(`^FO${field.x},${field.y}`);
          
          // Replicar as configurações de fonte e bloco
          zpl.push(`^A${field.fontFamily}${fontStyle},${field.fontSize}`);
          zpl.push(`^FB${fieldWidth},1,0,${alignVal}`);
        }
        // Para texto reverso normal 
        else if (field.reversed) {
          zpl.push(`^FR`);
        }
        
        // Adicionar dados do campo
        zpl.push(`^FD${processedContent}^FS`);
        break;
      }
        
      case 'line': {
        // Linha horizontal ou vertical
        zpl.push(`^FO${field.x},${field.y}`);
        zpl.push(`^GB${field.lineWidth || 100},${field.lineHeight || 1},${field.lineHeight || 1}^FS`);
        break;
      }
        
      case 'box': {
        // Caixa/retângulo
        zpl.push(`^FO${field.x},${field.y}`);
        zpl.push(`^GB${field.boxWidth || 100},${field.boxHeight || 50},${field.boxBorderWidth || 1}^FS`);
        break;
      }
        
      case 'barcode': {
        // Código de barras
        zpl.push(`^FO${field.x},${field.y}`);
        const barcodeType = field.barcodeType || 'code128';
        if (barcodeType === 'code128') {
          zpl.push(`^BC,${field.barcodeHeight || 50},Y,N,N`);
        } else if (barcodeType === 'code39') {
          zpl.push(`^B3,N,${field.barcodeHeight || 50},Y,N`);
        } else if (barcodeType === 'ean13') {
          zpl.push(`^BE,${field.barcodeHeight || 50},Y,N`);
        }
        zpl.push(`^FD{${field.name}}^FS`);
        break;
      }
        
      case 'qrcode': {
        // QR Code
        zpl.push(`^FO${field.x},${field.y}`);
        zpl.push(`^BQN,2,5`); // QR Code com nível de correção de erro M, magnificação 5
        zpl.push(`^FD{${field.name}}^FS`);
        break;
      }
    }
  });
  
  // Finalizar documento ZPL
  zpl.push("^XZ");
  
  return zpl.join('\n');
}

// Função para criar templates predefinidos
export async function createLabelTemplate(type: 'produto' | 'envio' | 'inventario' | 'personalizado'): Promise<FieldPosition[]> {
  // Template base
  let template: FieldPosition[] = [];
  
  // Selecionar o tipo de template
  switch(type) {
    case 'produto':
      template = createProductTemplate();
      break;
    case 'envio':
      template = createShippingTemplate();
      break;
    case 'inventario':
      template = createInventoryTemplate();
      break;
    case 'personalizado':
    default:
      // Template vazio para personalizado
      template = [];
      break;
  }
  
  return template;
}