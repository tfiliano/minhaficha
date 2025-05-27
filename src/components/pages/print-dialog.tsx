"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useState } from "react";

interface PrintDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: (printer: string, quantity: number) => void;
  printers: Array<{ id: string; nome: string }>;
}

export function PrintDialog({ open, onClose, onConfirm, printers }: PrintDialogProps) {
  const [selectedPrinter, setSelectedPrinter] = useState<string>("");
  const [quantity, setQuantity] = useState<number>(1);

  const handleConfirm = () => {
    if (!selectedPrinter) return;
    onConfirm(selectedPrinter, quantity);
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Imprimir Etiqueta</DialogTitle>
          <DialogDescription>
            Selecione a impressora e a quantidade de cópias
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <label htmlFor="printer">Impressora</label>
            <Select
              value={selectedPrinter}
              onValueChange={setSelectedPrinter}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione uma impressora" />
              </SelectTrigger>
              <SelectContent>
                {printers.map((printer) => (
                  <SelectItem key={printer.id} value={printer.id}>
                    {printer.nome}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-2">
            <label htmlFor="quantity">Quantidade</label>
            <Input
              id="quantity"
              type="number"
              min={1}
              value={quantity}
              onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button onClick={handleConfirm} disabled={!selectedPrinter}>
            Imprimir
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
