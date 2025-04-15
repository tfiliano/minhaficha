// components/label-preview.tsx
"use client";

import React, { useRef, useEffect } from 'react';
import type { FieldPosition } from "@/app/admin/templates/etiquetas/actions";

interface LabelPreviewProps {
  fields: FieldPosition[];
  scale?: number;
  width: number;
  height: number;
  onSelectField?: (index: number | null) => void;
  selectedFieldIndex?: number | null;
  showGrid?: boolean;
}

export function LabelPreview({ 
  fields, 
  scale = 1, 
  width, 
  height, 
  onSelectField,
  selectedFieldIndex = null,
  showGrid = true
}: LabelPreviewProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  // Função para processar conteúdo do campo (prefixos, sufixos, maiúsculas)
  const processFieldContent = (field: FieldPosition): string => {
    let content = '';
    
    if (field.fieldType === 'static') {
      content = field.staticValue || '';
    } else if (field.fieldType === 'dynamic') {
      content = field.defaultValue || `{${field.name}}`;
    } else if (field.fieldType === 'barcode' || field.fieldType === 'qrcode') {
      content = field.defaultValue || field.name;
    }
    
    // Aplicar prefixo/sufixo se configurados
    if (field.prefix) {
      content = field.prefix + content;
    }
    if (field.suffix) {
      content = content + field.suffix;
    }
    
    // Converter para maiúsculas se configurado
    if (field.uppercase) {
      content = content.toUpperCase();
    }
    
    return content;
  };

  // Desenhar a prévia da etiqueta
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Configurar dimensões do canvas
    canvas.width = width * scale;
    canvas.height = height * scale;

    // Limpar o canvas
    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Desenhar borda
    ctx.strokeStyle = '#ccc';
    ctx.lineWidth = 1;
    ctx.strokeRect(0.5, 0.5, canvas.width - 1, canvas.height - 1);

    // Desenhar grade (opcional)
    if (showGrid && scale > 0.75) {
      ctx.strokeStyle = '#f0f0f0';
      ctx.lineWidth = 0.5;
      
      // Linhas de grade verticais (a cada 50 pontos)
      for (let x = 50; x < width; x += 50) {
        ctx.beginPath();
        ctx.moveTo(x * scale, 0);
        ctx.lineTo(x * scale, height * scale);
        ctx.stroke();
        
        // Desenhar marcadores de coordenadas
        ctx.fillStyle = '#d0d0d0';
        ctx.font = '8px Arial';
        ctx.fillText(x.toString(), x * scale - 8, 10);
      }
      
      // Linhas de grade horizontais (a cada 50 pontos)
      for (let y = 50; y < height; y += 50) {
        ctx.beginPath();
        ctx.moveTo(0, y * scale);
        ctx.lineTo(width * scale, y * scale);
        ctx.stroke();
        
        // Desenhar marcadores de coordenadas
        ctx.fillStyle = '#d0d0d0';
        ctx.font = '8px Arial';
        ctx.fillText(y.toString(), 3, y * scale + 8);
      }
    }

    // Desenhar campos - apenas desenhar campos habilitados
    fields
      .filter(field => field.enabled !== false)
      .forEach((field, index) => {
        // Destacar campo selecionado
        if (selectedFieldIndex === index) {
          // Desenhar indicador de seleção
          ctx.strokeStyle = 'blue';
          ctx.lineWidth = 2;
          
          let selectionX = field.x * scale;
          let selectionY = field.y * scale;
          let selectionWidth = 0;
          let selectionHeight = 0;
          
          if (field.fieldType === 'line') {
            selectionWidth = (field.lineWidth || 100) * scale;
            selectionHeight = (field.lineHeight || 1) * scale;
          } else if (field.fieldType === 'box') {
            selectionWidth = (field.boxWidth || 100) * scale;
            selectionHeight = (field.boxHeight || 50) * scale;
          } else if (field.fieldType === 'barcode') {
            selectionWidth = 100 * scale;
            selectionHeight = (field.barcodeHeight || 50) * scale;
          } else if (field.fieldType === 'qrcode') {
            selectionWidth = 50 * scale;
            selectionHeight = 50 * scale;
          } else {
            // Para elementos de texto, estimar a largura
            const content = processFieldContent(field);
            ctx.font = `${field.fontStyle === 'bold' ? 'bold' : 'normal'} ${field.fontSize * scale}px Arial`;
            const textMetrics = ctx.measureText(content);
            selectionWidth = textMetrics.width + 10;
            selectionHeight = field.fontSize * scale * 1.5;
          }
          
          // Desenhar retângulo de seleção
          ctx.strokeRect(
            selectionX - 2, 
            selectionY - (field.fieldType === 'dynamic' || field.fieldType === 'static' ? field.fontSize * scale * 0.8 : 2), 
            selectionWidth + 4, 
            selectionHeight + 4
          );
          
          // Desenhar alças de controle
          const handleSize = 6;
          ctx.fillStyle = 'blue';
          // 4 cantos
          ctx.fillRect(selectionX - handleSize/2, selectionY - handleSize/2, handleSize, handleSize);
          ctx.fillRect(selectionX + selectionWidth - handleSize/2, selectionY - handleSize/2, handleSize, handleSize);
          ctx.fillRect(selectionX - handleSize/2, selectionY + selectionHeight - handleSize/2, handleSize, handleSize);
          ctx.fillRect(selectionX + selectionWidth - handleSize/2, selectionY + selectionHeight - handleSize/2, handleSize, handleSize);
        }
        
        // Desenhar o campo
        switch (field.fieldType) {
          case 'dynamic':
          case 'static': {
            // Configurar fonte
            const fontWeight = field.fontStyle === 'bold' ? 'bold' : 'normal';
            const fontFamilyMap: Record<string, string> = {
              'A': 'Arial',
              'B': 'Verdana',
              'C': 'Times New Roman',
              'D': 'Courier New',
              'E': 'Georgia',
              'F': 'Trebuchet MS'
            };
            
            const fontFamily = fontFamilyMap[field.fontFamily] || 'Arial';
            ctx.font = `${fontWeight} ${field.fontSize * scale}px ${fontFamily}`;
            
            // Processar o conteúdo (prefixo, sufixo, maiúsculas)
            const content = processFieldContent(field);
            
            // Calcular largura do campo
            let textWidth =1, fieldWidth;
            
            if (field.fullWidth) {
              // Se for largura total, usar a largura da etiqueta
              fieldWidth = width * scale - 20 * scale;
            } else {
              // Calcular a largura do texto para outros campos
              textWidth = ctx.measureText(content).width;
              fieldWidth = textWidth + 10 * scale;
            }
            
            // Configurar alinhamento do texto
            ctx.textAlign = field.alignment === 'center' ? 'center' : 
                          field.alignment === 'right' ? 'right' : 'left';
            
            // Calcular posição baseada no alinhamento
            let xPos = field.x * scale;
            
            if (field.fullWidth) {
              // Se for largura total e centralizado, ajustar posição X
              if (field.alignment === 'center') {
                xPos = width * scale / 2;
              } else if (field.alignment === 'right') {
                xPos = width * scale - 10 * scale;
              } else {
                xPos = 10 * scale;
              }
            } else if (field.alignment === 'center') {
              xPos += textWidth / 2;
            } else if (field.alignment === 'right') {
              xPos += textWidth;
            }
            
            // Configurar cor do texto e fundo
            if (field.reversed) {
              // Desenhar texto reverso (branco em fundo preto)
              const textWidth = ctx.measureText(content).width;
              const padding = 3 * scale;
              ctx.fillStyle = 'black';
              ctx.fillRect(
                field.alignment === 'left' ? xPos - padding : 
                field.alignment === 'center' ? xPos - textWidth / 2 - padding : 
                xPos - textWidth - padding, 
                field.y * scale - field.fontSize * scale * 0.8,
                textWidth + padding * 2,
                field.fontSize * scale * 1.3
              );
              ctx.fillStyle = 'white';
            } else {
              ctx.fillStyle = 'black';
            }
            
            // Desenhar o texto
            ctx.fillText(content, xPos, (field.y + field.fontSize * 0.3) * scale);
            break;
          }
          
          case 'line': {
            ctx.strokeStyle = 'black';
            ctx.fillStyle = 'black';
            ctx.lineWidth = (field.lineHeight || 1) * scale;
            
            // Desenhar linha
            ctx.beginPath();
            ctx.moveTo(field.x * scale, field.y * scale);
            ctx.lineTo((field.x + (field.lineWidth || 100)) * scale, field.y * scale);
            ctx.stroke();
            break;
          }
          
          case 'box': {
            ctx.strokeStyle = 'black';
            ctx.lineWidth = (field.boxBorderWidth || 1) * scale;
            
            // Desenhar caixa
            ctx.strokeRect(
              field.x * scale, 
              field.y * scale, 
              (field.boxWidth || 100) * scale, 
              (field.boxHeight || 50) * scale
            );
            break;
          }
          
          case 'barcode': {
            const barcodeHeight = (field.barcodeHeight || 50) * scale;
            const content = processFieldContent(field);
            
            // Representação visual simples do código de barras
            ctx.fillStyle = 'black';
            ctx.font = `bold ${8 * scale}px Arial`;
            ctx.textAlign = 'center';
            
            // Desenhar representação de código de barras
            const barWidth = 100 * scale;
            ctx.fillRect(field.x * scale, field.y * scale, barWidth, barcodeHeight);
            
            // Desenhar rótulo com fundo branco
            const textY = field.y * scale + barcodeHeight + 10 * scale;
            ctx.fillStyle = 'white';
            ctx.fillRect(field.x * scale - 5, textY - 8 * scale, barWidth + 10, 12 * scale);
            
            ctx.fillStyle = 'black';
            ctx.fillText(content, field.x * scale + barWidth/2, textY);
            break;
          }
          
          case 'qrcode': {
            const qrSize = 50 * scale;
            const content = processFieldContent(field);
            
            // Representação visual simples do QR code
            ctx.fillStyle = 'black';
            
            // Desenhar moldura do QR
            ctx.fillRect(field.x * scale, field.y * scale, qrSize, qrSize);
            
            // Desenhar padrão do QR (simplificado)
            ctx.fillStyle = 'white';
            const cellSize = qrSize / 7;
            for (let i = 1; i < 6; i++) {
              for (let j = 1; j < 6; j++) {
                if ((i % 3 !== 0 || j % 3 !== 0) && (i !== 3 || j !== 3)) {
                  ctx.fillRect(
                    field.x * scale + i * cellSize, 
                    field.y * scale + j * cellSize, 
                    cellSize, cellSize
                  );
                }
              }
            }
            
            // Desenhar padrão central
            ctx.fillStyle = 'black';
            ctx.fillRect(
              field.x * scale + 3 * cellSize - cellSize/2, 
              field.y * scale + 3 * cellSize - cellSize/2, 
              cellSize * 2, cellSize * 2
            );
            
            // Desenhar texto de rótulo abaixo do QR code
            ctx.fillStyle = 'black';
            ctx.font = `bold ${8 * scale}px Arial`;
            ctx.textAlign = 'center';
            ctx.fillText(content, field.x * scale + qrSize/2, field.y * scale + qrSize + 12 * scale);
            break;
          }
        }
      });
  }, [fields, scale, width, height, selectedFieldIndex, showGrid]);

  // Tratar cliques no canvas para selecionar campos
  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!onSelectField) return;
    
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    // Obter coordenadas do clique em relação ao canvas
    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX - rect.left) / scale;
    const y = (e.clientY - rect.top) / scale;
    
    // Encontrar o campo que foi clicado (em ordem reversa para selecionar o campo mais acima primeiro)
    for (let i = fields.length - 1; i >= 0; i--) {
      const field = fields[i];
      if (field.enabled === false) continue;
      
      let fieldX = field.x;
      let fieldY = field.y;
      let fieldWidth = 0;
      let fieldHeight = 0;
      
      // Calcular dimensões do campo baseado no tipo
      if (field.fieldType === 'line') {
        fieldWidth = field.lineWidth || 100;
        fieldHeight = field.lineHeight || 1;
      } else if (field.fieldType === 'box') {
        fieldWidth = field.boxWidth || 100;
        fieldHeight = field.boxHeight || 50;
      } else if (field.fieldType === 'barcode') {
        fieldWidth = 100;
        fieldHeight = field.barcodeHeight || 50;
      } else if (field.fieldType === 'qrcode') {
        fieldWidth = 50;
        fieldHeight = 50;
      } else {
        // Para elementos de texto, usar tamanho da fonte como altura
        fieldWidth = field.fontSize * 5; // Apenas uma estimativa
        fieldHeight = field.fontSize;
        fieldY -= fieldHeight * 0.8; // Ajustar para linha de base do texto
      }
      
      // Verificar se o clique está dentro dos limites do campo
      if (
        x >= fieldX && 
        x <= fieldX + fieldWidth && 
        y >= fieldY && 
        y <= fieldY + fieldHeight
      ) {
        onSelectField(i);
        return;
      }
    }
    
    // Se clicamos fora de qualquer campo
    onSelectField(null);
  };

  return (
    <div className="bg-white p-4 border rounded-lg overflow-auto">
      <div style={{ 
        width: width * scale, 
        height: height * scale, 
        position: 'relative',
        margin: '0 auto'
      }}>
        <canvas
          ref={canvasRef}
          width={width * scale}
          height={height * scale}
          onClick={handleCanvasClick}
          style={{
            display: 'block',
            backgroundColor: 'white',
            boxShadow: '0 0 10px rgba(0, 0, 0, 0.1)',
            cursor: onSelectField ? 'pointer' : 'default'
          }}
        />
      </div>
    </div>
  );
}