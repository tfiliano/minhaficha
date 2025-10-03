"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Download, Maximize2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ReactNode } from "react";

interface ChartContainerProps {
  title: string;
  description?: string;
  children: ReactNode;
  onExport?: () => void;
  onFullscreen?: () => void;
  className?: string;
}

export function ChartContainer({
  title,
  description,
  children,
  onExport,
  onFullscreen,
  className,
}: ChartContainerProps) {
  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <CardTitle className="text-lg">{title}</CardTitle>
            {description && (
              <CardDescription>{description}</CardDescription>
            )}
          </div>
          <div className="flex gap-2">
            {onExport && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onExport}
                className="h-8 w-8 p-0"
              >
                <Download className="h-4 w-4" />
              </Button>
            )}
            {onFullscreen && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onFullscreen}
                className="h-8 w-8 p-0"
              >
                <Maximize2 className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {children}
      </CardContent>
    </Card>
  );
}
