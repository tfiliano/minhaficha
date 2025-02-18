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
};

const FIELD_COLORS = {
  produto: "#ff0000",
  validade: "#00ff00",
  lote: "#0000ff",
  sif: "#ff00ff",
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
      const color = FIELD_COLORS[field.name as keyof typeof FIELD_COLORS] || "#000000";
      const text = SAMPLE_DATA[field.name as keyof typeof SAMPLE_DATA] || field.name;

      // Draw field box
      ctx.strokeStyle = color;
      ctx.lineWidth = 1;
      ctx.strokeRect(
        field.x * scale,
        field.y * scale,
        ctx.measureText(text).width + 10,
        field.fontSize * 1.2 * scale
      );

      // Draw field text
      ctx.fillStyle = field.reversed ? 'white' : color;
      
      // Set font with style
      const fontWeight = field.fontStyle === 'bold' ? 'bold' : 'normal';
      ctx.font = `${fontWeight} ${field.fontSize * scale}px Arial`;
      
      // Calculate text width for alignment
      const textWidth = ctx.measureText(text).width;
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

      // Draw coordinates
      ctx.fillStyle = "#666666";
      ctx.font = "10px Arial";
      ctx.fillText(
        `(${field.x}, ${field.y})`,
        field.x * scale,
        (field.y - 5) * scale
      );
    });
  }, [fields, width, height, scale]);

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
        {Object.entries(FIELD_COLORS).map(([field, color]) => (
          <div key={field} className="flex items-center gap-2 text-sm">
            <div
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: color }}
            />
            <span>{field}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
