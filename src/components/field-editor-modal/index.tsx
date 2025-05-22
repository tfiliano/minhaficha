"use client";

import React from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { FieldPosition } from "@/app/admin/templates/etiquetas/actions";

interface FieldEditorModalProps {
  field: FieldPosition;
  onSave: (field: FieldPosition) => void;
  onCancel: () => void;
  isNew?: boolean;
}

export function FieldEditorModal({ field, onSave, onCancel, isNew = false }: FieldEditorModalProps) {
  const [editedField, setEditedField] = React.useState<FieldPosition>({ ...field });
  
  const handleChange = (key: keyof FieldPosition, value: any) => {
    setEditedField(prev => ({ ...prev, [key]: value }));
  };
  
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-background rounded-lg p-6 w-[700px] max-w-[95vw] max-h-[90vh] overflow-y-auto">
        <h3 className="text-lg font-semibold mb-4">
          {isNew ? 'Adicionar Campo' : 'Editar Campo'}
        </h3>
        
        <Tabs defaultValue="basic">
          <TabsList className="mb-4 w-full">
            <TabsTrigger value="basic" className="flex-1">Básico</TabsTrigger>
            <TabsTrigger value="appearance" className="flex-1">Aparência</TabsTrigger>
            <TabsTrigger value="position" className="flex-1">Posição</TabsTrigger>
            <TabsTrigger value="advanced" className="flex-1">Avançado</TabsTrigger>
          </TabsList>
          
          {/* Aba de Configurações Básicas */}
          <TabsContent value="basic" className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Tipo de Campo</Label>
                <Select
                  value={editedField.fieldType}
                  onValueChange={(value) => 
                    handleChange('fieldType', value as FieldPosition['fieldType'])
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="dynamic">Campo Dinâmico</SelectItem>
                    <SelectItem value="static">Texto Estático</SelectItem>
                    <SelectItem value="barcode">Código de Barras</SelectItem>
                    <SelectItem value="qrcode">QR Code</SelectItem>
                    <SelectItem value="line">Linha</SelectItem>
                    <SelectItem value="box">Caixa/Retângulo</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label>Ativado</Label>
                <div className="flex items-center h-10 space-x-2">
                  <Checkbox 
                    id="field-enabled" 
                    checked={editedField.enabled} 
                    onCheckedChange={(checked) => 
                      handleChange('enabled', checked === true)
                    } 
                  />
                  <Label htmlFor="field-enabled">Campo ativo na impressão</Label>
                </div>
              </div>
            </div>
            
            {/* Campos Dinâmicos */}
            {editedField.fieldType === 'dynamic' && (
              <div>
                <Label>Nome do Campo</Label>
                <Input 
                  value={editedField.name} 
                  onChange={(e) => handleChange('name', e.target.value)}
                  placeholder="Ex: produto, lote, validade" 
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Use esse nome para referenciar o campo nos dados de impressão.
                </p>
              </div>
            )}
            
            {/* Texto Estático */}
            {editedField.fieldType === 'static' && (
              <div>
                <Label>Texto Estático</Label>
                <Input 
                  value={editedField.staticValue || ''} 
                  onChange={(e) => handleChange('staticValue', e.target.value)}
                  placeholder="Ex: VALIDADE:" 
                />
              </div>
            )}
            
            {/* Valor Padrão */}
            {(editedField.fieldType === 'dynamic' || 
              editedField.fieldType === 'barcode' || 
              editedField.fieldType === 'qrcode') && (
              <div>
                <Label>Valor Padrão (para visualização)</Label>
                <Input 
                  value={editedField.defaultValue || ''} 
                  onChange={(e) => handleChange('defaultValue', e.target.value)}
                  placeholder="Valor exibido na prévia" 
                />
              </div>
            )}
            
            {/* Propriedades de Linha */}
            {editedField.fieldType === 'line' && (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Largura da Linha</Label>
                  <Input 
                    type="number" 
                    value={editedField.lineWidth || 100} 
                    onChange={(e) => handleChange('lineWidth', Number(e.target.value))}
                  />
                </div>
                <div>
                  <Label>Altura da Linha</Label>
                  <Input 
                    type="number" 
                    value={editedField.lineHeight || 1} 
                    onChange={(e) => handleChange('lineHeight', Number(e.target.value))}
                  />
                </div>
              </div>
            )}
            
            {/* Propriedades de Caixa */}
            {editedField.fieldType === 'box' && (
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label>Largura da Caixa</Label>
                  <Input 
                    type="number" 
                    value={editedField.boxWidth || 100} 
                    onChange={(e) => handleChange('boxWidth', Number(e.target.value))}
                  />
                </div>
                <div>
                  <Label>Altura da Caixa</Label>
                  <Input 
                    type="number" 
                    value={editedField.boxHeight || 50} 
                    onChange={(e) => handleChange('boxHeight', Number(e.target.value))}
                  />
                </div>
                <div>
                  <Label>Espessura da Borda</Label>
                  <Input 
                    type="number" 
                    value={editedField.boxBorderWidth || 1} 
                    onChange={(e) => handleChange('boxBorderWidth', Number(e.target.value))}
                  />
                </div>
              </div>
            )}
            
            {/* Propriedades de Código de Barras */}
            {editedField.fieldType === 'barcode' && (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Tipo de Código de Barras</Label>
                  <Select
                    value={editedField.barcodeType || 'code128'}
                    onValueChange={(value) => 
                      handleChange('barcodeType', value as 'code39' | 'code128' | 'ean13')
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o tipo" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="code128">Código 128</SelectItem>
                      <SelectItem value="code39">Código 39</SelectItem>
                      <SelectItem value="ean13">EAN-13</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Altura do Código</Label>
                  <Input 
                    type="number" 
                    value={editedField.barcodeHeight || 50} 
                    onChange={(e) => handleChange('barcodeHeight', Number(e.target.value))}
                  />
                </div>
              </div>
            )}
          </TabsContent>
          
          {/* Aba de Aparência */}
          <TabsContent value="appearance" className="space-y-4">
            {(editedField.fieldType === 'dynamic' || editedField.fieldType === 'static') && (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Tamanho da Fonte</Label>
                    <Input 
                      type="number" 
                      value={editedField.fontSize} 
                      onChange={(e) => handleChange('fontSize', Number(e.target.value))}
                    />
                  </div>
                  <div>
                    <Label>Estilo da Fonte</Label>
                    <Select
                      value={editedField.fontStyle}
                      onValueChange={(value) => 
                        handleChange('fontStyle', value as 'normal' | 'bold' | 'italic')
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o estilo" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="normal">Normal</SelectItem>
                        <SelectItem value="bold">Negrito</SelectItem>
                        <SelectItem value="italic">Itálico</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Fonte</Label>
                    <Select
                      value={editedField.fontFamily}
                      onValueChange={(value) => handleChange('fontFamily', value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione a fonte" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="A">Fonte A (padrão)</SelectItem>
                        <SelectItem value="B">Fonte B (condensada)</SelectItem>
                        <SelectItem value="C">Fonte C (específica)</SelectItem>
                        <SelectItem value="D">Fonte D (específica)</SelectItem>
                        <SelectItem value="E">Fonte E (específica)</SelectItem>
                        <SelectItem value="F">Fonte F (específica)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Alinhamento</Label>
                    <Select
                      value={editedField.alignment}
                      onValueChange={(value) => 
                        handleChange('alignment', value as 'left' | 'center' | 'right')
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o alinhamento" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="left">Esquerda</SelectItem>
                        <SelectItem value="center">Centro</SelectItem>
                        <SelectItem value="right">Direita</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="text-reversed" 
                    checked={editedField.reversed} 
                    onCheckedChange={(checked) => 
                      handleChange('reversed', checked === true)
                    } 
                  />
                  <Label htmlFor="text-reversed">
                    Texto Reverso (texto branco com fundo preto)
                  </Label>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="text-uppercase" 
                    checked={editedField.uppercase} 
                    onCheckedChange={(checked) => 
                      handleChange('uppercase', checked === true)
                    } 
                  />
                  <Label htmlFor="text-uppercase">
                    TEXTO EM MAIÚSCULAS
                  </Label>
                </div>

                <div className="flex items-center space-x-2 mt-4">
                <Checkbox 
                    id="full-width" 
                    checked={editedField.fullWidth} 
                    onCheckedChange={(checked) => 
                    handleChange('fullWidth', checked === true)
                    } 
                />
                <Label htmlFor="full-width">
                    Usar largura total da etiqueta
                </Label>
                </div>
              </>
            )}
          </TabsContent>
          
          {/* Aba de Posição */}
          <TabsContent value="position" className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Posição X</Label>
                <Input 
                  type="number" 
                  value={editedField.x} 
                  onChange={(e) => handleChange('x', Number(e.target.value))}
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Distância horizontal em pontos a partir da borda esquerda
                </p>
              </div>
              <div>
                <Label>Posição Y</Label>
                <Input 
                  type="number" 
                  value={editedField.y} 
                  onChange={(e) => handleChange('y', Number(e.target.value))}
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Distância vertical em pontos a partir do topo
                </p>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Número da Linha</Label>
                <Input 
                  type="number" 
                  min="1"
                  value={editedField.lineNumber} 
                  onChange={(e) => handleChange('lineNumber', Number(e.target.value) || 1)}
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Agrupa campos na mesma linha lógica
                </p>
              </div>
              <div>
                <Label>Posição na Linha</Label>
                <Input 
                  type="number" 
                  min="1"
                  value={editedField.linePosition} 
                  onChange={(e) => handleChange('linePosition', Number(e.target.value) || 1)}
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Ordem dos campos dentro da mesma linha
                </p>
              </div>
            </div>
          </TabsContent>
          
          {/* Aba Avançada */}
          <TabsContent value="advanced" className="space-y-4">
            {(editedField.fieldType === 'dynamic' || editedField.fieldType === 'static') && (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Prefixo</Label>
                    <Input 
                      value={editedField.prefix || ''} 
                      onChange={(e) => handleChange('prefix', e.target.value)}
                      placeholder="Texto antes do valor" 
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      Ex: "Lote: " para preceder o número do lote
                    </p>
                  </div>
                  <div>
                    <Label>Sufixo</Label>
                    <Input 
                      value={editedField.suffix || ''} 
                      onChange={(e) => handleChange('suffix', e.target.value)}
                      placeholder="Texto após o valor" 
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      Ex: " kg" para adicionar unidade após um valor
                    </p>
                  </div>
                </div>
                
                {(editedField.name === 'validade' || 
                 editedField.name === 'manipulacao' || 
                 editedField.name === 'data' || 
                 editedField.name.includes('data')) && (
                  <div>
                    <Label>Formato de Data</Label>
                    <Select
                      value={editedField.dateFormat || 'DD/MM/YYYY'}
                      onValueChange={(value) => handleChange('dateFormat', value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o formato" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="DD/MM/YYYY">DD/MM/YYYY (31/12/2024)</SelectItem>
                        <SelectItem value="DD/MM/YY">DD/MM/YY (31/12/24)</SelectItem>
                        <SelectItem value="MM/DD/YYYY">MM/DD/YYYY (12/31/2024)</SelectItem>
                        <SelectItem value="YYYY-MM-DD">YYYY-MM-DD (2024-12-31)</SelectItem>
                        <SelectItem value="DD MMM YYYY">DD MMM YYYY (31 DEZ 2024)</SelectItem>
                      </SelectContent>
                    </Select>
                    <p className="text-xs text-muted-foreground mt-1">
                      Determina como datas serão formatadas na impressão
                    </p>
                  </div>
                )}
              </>
            )}
          </TabsContent>
        </Tabs>
        
        <div className="flex justify-end gap-2 mt-6">
          <Button variant="outline" onClick={onCancel}>
            Cancelar
          </Button>
          <Button onClick={() => onSave(editedField)}>
            {isNew ? 'Adicionar' : 'Salvar'}
          </Button>
        </div>
      </div>
    </div>
  );
}