"use client";

import { useEffect, useRef } from "react";

interface FieldPosition {
  name: string;
  x: number;
  y: number;
  fontSize: number;
  fontStyle: 'normal' | 'bold';
  reversed: boolean;
  alignment: 'left' | 'center' | 'right';
  fontFamily: string;
  fieldType?: 'dynamic' | 'static' | 'qrcode' | 'barcode' | 'line';
  staticValue?: string;
  lineNumber?: number;
  linePosition?: number;
  defaultValue?: string;
  barcodeType?: 'code39' | 'code128' | 'ean13';
  barcodeHeight?: number;
  lineWidth?: number;
  lineHeight?: number;
}

interface LabelPreviewProps {
  fields: FieldPosition[];
  width?: number;
  height?: number;
  scale?: number;
}

const SAMPLE_DATA = {
  produto: "PRODUTO TESTE",
  validade: "31/12/2024",
  lote: "LOTE-123",
  sif: "SIF-456",
  codigo: "12345678",
  endereco: "Av. Exemplo, 123",
  cidade: "São Paulo"
};

const FIELD_COLORS = {
  produto: "#ff0000",
  validade: "#00ff00",
  lote: "#0000ff",
  sif: "#ff00ff",
  codigo: "#ff9900",
  static: "#666666",
  barcode: "#009688",
  line: "#424242",
  default: "#333333"
};

export function LabelPreview({ 
  fields, 
  width = 400, 
  height = 300,
  scale = 1 
}: LabelPreviewProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw grid
    ctx.strokeStyle = "#e5e5e5";
    ctx.lineWidth = 0.5;

    // Vertical lines
    for (let x = 0; x < width; x += 20) {
      ctx.beginPath();
      ctx.moveTo(x * scale, 0);
      ctx.lineTo(x * scale, height * scale);
      ctx.stroke();
    }

    // Horizontal lines
    for (let y = 0; y < height; y += 20) {
      ctx.beginPath();
      ctx.moveTo(0, y * scale);
      ctx.lineTo(width * scale, y * scale);
      ctx.stroke();
    }

    // Draw fields
    fields.forEach((field) => {
      // Handle different field types
      const fieldType = field.fieldType || 'dynamic';
      
      // Select color based on field type and name
      let color;
      if (fieldType === 'static') {
        color = FIELD_COLORS.static;
      } else if (fieldType === 'qrcode') {
        color = FIELD_COLORS[field.name as keyof typeof FIELD_COLORS] || FIELD_COLORS.default;
      } else if (fieldType === 'barcode') {
        color = FIELD_COLORS.barcode;
      } else if (fieldType === 'line') {
        color = FIELD_COLORS.line;
      } else {
        color = FIELD_COLORS[field.name as keyof typeof FIELD_COLORS] || FIELD_COLORS.default;
      }

      // Get text to display
      let text;
      if (fieldType === 'static') {
        text = field.staticValue || 'Texto estático';
      } else if (fieldType === 'dynamic') {
        text = SAMPLE_DATA[field.name as keyof typeof SAMPLE_DATA] || field.name;
      } else if (fieldType === 'qrcode') {
        text = `QR: ${field.name}`;
      } else if (fieldType === 'barcode') {
        text = `Barcode: ${field.name}`;
      } else {
        text = '';
      }

      if (fieldType === 'qrcode') {
        // Draw QR code representation
        const size = 50 * scale;
        
        // Draw QR code outline
        ctx.strokeStyle = color;
        ctx.lineWidth = 2;
        ctx.strokeRect(
          field.x * scale,
          field.y * scale,
          size,
          size
        );
        
        // Draw QR code pattern
        ctx.fillStyle = color;
        // Draw some squares to represent QR code
        const cellSize = size / 5;
        for (let i = 0; i < 5; i++) {
          for (let j = 0; j < 5; j++) {
            if (Math.random() > 0.5) {
              ctx.fillRect(
                field.x * scale + i * cellSize,
                field.y * scale + j * cellSize,
                cellSize,
                cellSize
              );
            }
          }
        }
        
        // Draw field name under QR code
        ctx.fillStyle = color;
        ctx.font = "10px Arial";
        ctx.fillText(
          field.name,
          field.x * scale,
          (field.y * scale) + size + 10
        );
      } else if (fieldType === 'barcode') {
        // Draw barcode representation
        const barcodeHeight = (field.barcodeHeight || 30) * scale;
        const barcodeWidth = 80 * scale;
        
        // Draw barcode outline
        ctx.strokeStyle = color;
        ctx.lineWidth = 1;
        ctx.strokeRect(
          field.x * scale,
          field.y * scale,
          barcodeWidth,
          barcodeHeight
        );
        
        // Draw barcode lines
        ctx.fillStyle = color;
        const barCount = 20;
        const barWidth = barcodeWidth / barCount;
        
        for (let i = 0; i < barCount; i++) {
          if (i % 2 === 0) {
            ctx.fillRect(
              field.x * scale + i * barWidth,
              field.y * scale,
              barWidth/2,
              barcodeHeight
            );
          }
        }
        
        // Draw field name under barcode
        ctx.fillStyle = color;
        ctx.font = "10px Arial";
        ctx.fillText(
          field.name,
          field.x * scale,
          (field.y * scale) + barcodeHeight + 10
        );
      } else if (fieldType === 'line') {
        // Draw horizontal line
        const lineWidth = (field.lineWidth || width - 20) * scale;
        const lineHeight = (field.lineHeight || 1) * scale;
        
        ctx.fillStyle = color;
        ctx.fillRect(
          field.x * scale,
          field.y * scale,
          lineWidth,
          lineHeight
        );
        
      } else {
        // Draw field box
        ctx.strokeStyle = color;
        ctx.lineWidth = 1;
        
        // Set font with style
        const fontWeight = field.fontStyle === 'bold' ? 'bold' : 'normal';
        ctx.font = `${fontWeight} ${field.fontSize * scale}px Arial`;
        
        const textWidth = ctx.measureText(text).width;
        
        ctx.strokeRect(
          field.x * scale,
          field.y * scale,
          textWidth + 10,
          field.fontSize * 1.2 * scale
        );

        // Draw field text
        ctx.fillStyle = field.reversed ? 'white' : color;

        // Calculate text width for alignment
        let xPos = field.x * scale + 5;
        
        if (field.alignment === 'center') {
          xPos = field.x * scale + ((width * scale - field.x * scale) / 2) - (textWidth / 2);
        } else if (field.alignment === 'right') {
          xPos = (width * scale - textWidth - 5);
        }
        
        // Draw background if reversed
        if (field.reversed) {
          ctx.fillStyle = color;
          ctx.fillRect(
            field.x * scale,
            (field.y * scale) - (field.fontSize * scale * 0.8),
            textWidth + 10,
            field.fontSize * scale * 1.2
          );
          ctx.fillStyle = 'white';
        }
        
        ctx.fillText(text, xPos, (field.y + field.fontSize) * scale);
      }

      // Draw coordinates
      ctx.fillStyle = "#666666";
      ctx.font = "10px Arial";
      ctx.fillText(
        `(${field.x}, ${field.y})`,
        field.x * scale,
        (field.y - 5) * scale
      );
      
      // Draw line number and position if available
      if (field.lineNumber !== undefined && field.linePosition !== undefined) {
        ctx.fillStyle = "#666666";
        ctx.font = "8px Arial";
        ctx.fillText(
          `L${field.lineNumber}:P${field.linePosition}`,
          (field.x + 20) * scale,
          (field.y - 5) * scale
        );
      }
    });
  }, [fields, width, height, scale]);

  // Create a list of field types and colors to show in the legend
  const legendItems = [
    { id: 'dynamic', name: 'Campos Dinâmicos', color: '#333333' },
    { id: 'static', name: 'Texto Estático', color: FIELD_COLORS.static },
    { id: 'qrcode', name: 'QR Code', color: FIELD_COLORS.codigo },
    { id: 'barcode', name: 'Código de Barras', color: FIELD_COLORS.barcode },
    { id: 'line', name: 'Linha', color: FIELD_COLORS.line }
  ];

  return (
    <div className="relative bg-white border rounded-lg p-4">
      <div className="absolute top-2 right-2 text-xs text-gray-500">
        Scale: {scale}x
      </div>
      <canvas
        ref={canvasRef}
        width={width * scale}
        height={height * scale}
        className="border"
        style={{
          width: width,
          height: height,
        }}
      />
      <div className="mt-2 space-y-1">
        <p className="text-sm font-medium">Legenda:</p>
        {legendItems.map((item) => (
          <div key={item.id} className="flex items-center gap-2 text-sm">
            <div
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: item.color }}
            />
            <span>{item.name}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
