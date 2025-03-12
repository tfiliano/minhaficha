"use client";

import { Title } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { useEffect, useState } from "react";
import { FieldPosition, saveTemplate, getTemplates } from "../actions";
import { LoaderCircle, Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import React from 'react';

// Interface para os parâmetros
interface TemplateEditorParams {
  id?: string;
}

// Componente de cliente que recebe parâmetros já processados
export default function TemplateEditorPage({ params }: { params?: TemplateEditorParams }) {
  // Garantir que params seja um objeto mesmo que seja undefined
  const safeParams = params || {};
  
  // Obtém o ID do template com segurança
  const templateId = safeParams.id;
  
  const router = useRouter();
  const [zpl, setZpl] = useState("");
  const [templateName, setTemplateName] = useState("");
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [labelWidth, setLabelWidth] = useState(400);
  const [labelHeight, setLabelHeight] = useState(300);
  const [fields, setFields] = useState<FieldPosition[]>([]);
  const [currentLine, setCurrentLine] = useState(1);
  const [availableFields, setAvailableFields] = useState([
    'produto', 'validade', 'lote', 'sif', 'codigo'
  ]);
  
  // Estado para diálogos
  const [customFieldName, setCustomFieldName] = useState("");
  const [showCustomFieldDialog, setShowCustomFieldDialog] = useState(false);
  const [fieldFontSize, setFieldFontSize] = useState(10);
  const [fieldFontStyle, setFieldFontStyle] = useState<'normal' | 'bold'>('normal');
  const [fieldAlignment, setFieldAlignment] = useState<'left' | 'center' | 'right'>('left');
  const [fieldReversed, setFieldReversed] = useState(false);
  
  // Texto estático
  const [showStaticTextDialog, setShowStaticTextDialog] = useState(false);
  const [staticText, setStaticText] = useState("");
  const [staticTextAlignment, setStaticTextAlignment] = useState<'left' | 'center' | 'right'>('left');

  // Modo de edição
  const [editingField, setEditingField] = useState<FieldPosition | null>(null);
  const [showEditFieldDialog, setShowEditFieldDialog] = useState(false);
  const [editFieldIndex, setEditFieldIndex] = useState<number | null>(null);
  const [editLineWidth, setEditLineWidth] = useState<number>(0);
  const [editLineHeight, setEditLineHeight] = useState<number>(1);
  const [editLineNumber, setEditLineNumber] = useState<number>(1);

  // Log para debugging
  useEffect(() => {
    if (templateId) {
      console.log("Componente Editor - ID do template:", templateId);
    } else {
      console.log("Componente Editor - Novo template");
    }
  }, [templateId]);

  // Carrega o template quando o componente monta ou quando templateId muda
  useEffect(() => {
    const loadTemplate = async () => {
      try {
        if (templateId) {
          const templates = await getTemplates();
          const template = templates.find(t => t.id === templateId);
          
          if (template) {
            setTemplateName(template.nome || "");
            setZpl(template.zpl || "");
            setLabelWidth(template.width || 400);
            setLabelHeight(template.height || 300);
            
            if (Array.isArray(template.campos)) {
              const dynamicFields = template.campos
                .filter(campo => campo.fieldType === 'dynamic')
                .map(campo => campo.name);
                
              setAvailableFields(prev => {
                const newFields = [...prev];
                dynamicFields.forEach(field => {
                  if (!newFields.includes(field)) {
                    newFields.push(field);
                  }
                });
                return newFields;
              });
              
              setFields(template.campos);
            } else {
              setFields([]);
            }
          } else {
            toast.error(`Template não encontrado`);
          }
        } else {
          // Inicializar com campos padrão para novo template
          setFields([
            { 
              name: "produto", 
              x: 10, 
              y: 10, 
              fontSize: 12,
              fontStyle: 'normal',
              reversed: false,
              alignment: 'left',
              fontFamily: 'A',
              fieldType: 'dynamic',
              lineNumber: 1,
              linePosition: 1
            },
            { 
              name: "validade", 
              x: 10, 
              y: 40, 
              fontSize: 10,
              fontStyle: 'normal',
              reversed: false,
              alignment: 'left',
              fontFamily: 'A',
              fieldType: 'dynamic',
              lineNumber: 2,
              linePosition: 1
            }
          ]);
        }
      } catch (error) {
        console.error("Erro ao carregar template:", error);
        toast.error("Erro ao carregar template");
      } finally {
        setLoading(false);
      }
    };
    
    loadTemplate();
  }, [templateId]);

  // Função para adicionar um campo personalizado
  const addCustomField = () => {
    if (!customFieldName.trim()) {
      toast.error("Nome do campo é obrigatório");
      return;
    }
    
    if (!availableFields.includes(customFieldName)) {
      setAvailableFields([...availableFields, customFieldName]);
    }
    
    const newField: FieldPosition = {
      name: customFieldName,
      x: 10,
      y: currentLine * 30,
      fontSize: fieldFontSize,
      fontStyle: fieldFontStyle,
      reversed: fieldReversed,
      alignment: fieldAlignment,
      fontFamily: 'A',
      fieldType: 'dynamic',
      defaultValue: '',
      lineNumber: currentLine,
      linePosition: fields.filter(f => f.lineNumber === currentLine).length + 1
    };
    
    setFields([...fields, newField]);
    setCustomFieldName("");
    setShowCustomFieldDialog(false);
  };

  // Função para adicionar texto estático
  const addStaticText = () => {
    if (!staticText.trim()) {
      toast.error("Texto é obrigatório");
      return;
    }
    
    const newField: FieldPosition = {
      name: `static_${Date.now()}`,
      x: 10,
      y: currentLine * 30,
      fontSize: 10,
      fontStyle: 'normal',
      reversed: false,
      alignment: staticTextAlignment,
      fontFamily: 'A',
      fieldType: 'static',
      staticValue: staticText,
      lineNumber: currentLine,
      linePosition: fields.filter(f => f.lineNumber === currentLine).length + 1
    };
    
    setFields([...fields, newField]);
    setStaticText("");
    setShowStaticTextDialog(false);
  };

  // Função para adicionar códigos
  const addBarcode = () => {
    const newField: FieldPosition = {
      name: 'codigo',
      x: 10,
      y: currentLine * 30,
      fontSize: 10,
      fontStyle: 'normal',
      reversed: false,
      alignment: 'left',
      fontFamily: 'A',
      fieldType: 'barcode',
      barcodeType: 'code128',
      lineNumber: currentLine,
      linePosition: fields.filter(f => f.lineNumber === currentLine).length + 1
    };
    setFields([...fields, newField]);
  };
  
  const addQRCode = () => {
    const newField: FieldPosition = {
      name: 'codigo',
      x: 10,
      y: currentLine * 30,
      fontSize: 10,
      fontStyle: 'normal',
      reversed: false,
      alignment: 'left',
      fontFamily: 'A',
      fieldType: 'qrcode',
      lineNumber: currentLine,
      linePosition: fields.filter(f => f.lineNumber === currentLine).length + 1
    };
    setFields([...fields, newField]);
  };

  // Adicionar linha horizontal
  const addHorizontalLine = () => {
    const newField: FieldPosition = {
      name: `line_${Date.now()}`,
      x: 0,
      y: currentLine * 30,
      fontSize: 0,
      fontStyle: 'normal',
      reversed: false,
      alignment: 'left',
      fontFamily: 'A',
      fieldType: 'line',
      lineWidth: labelWidth - 20,
      lineHeight: 1,
      lineNumber: currentLine,
      linePosition: fields.filter(f => f.lineNumber === currentLine).length + 1
    };
    
    setFields([...fields, newField]);
  };

  // Função para abrir diálogo de edição
  const openEditDialog = (field: FieldPosition, index: number) => {
    setEditingField({...field});
    setEditFieldIndex(index);
    
    if (field.fieldType === 'line') {
      setEditLineWidth(field.lineWidth || labelWidth - 20);
      setEditLineHeight(field.lineHeight || 1);
    }
    
    setEditLineNumber(field.lineNumber || 1);
    setShowEditFieldDialog(true);
  };

  // Função para salvar edição de campo
  const saveFieldEdit = () => {
    if (!editingField || editFieldIndex === null) return;
    
    const updatedField = {...editingField};
    
    if (editingField.fieldType === 'line') {
      updatedField.lineWidth = editLineWidth;
      updatedField.lineHeight = editLineHeight;
    }
    
    updatedField.lineNumber = editLineNumber;
    
    const updatedFields = [...fields];
    updatedFields[editFieldIndex] = updatedField;
    setFields(updatedFields);
    
    setShowEditFieldDialog(false);
    setEditingField(null);
    setEditFieldIndex(null);
  };

  // Função para gerar ZPL
  const generateZPL = () => {
    let zpl = `^XA^LL${labelHeight}^FWB`; // Início do ZPL, comprimento da etiqueta e orientação
    
    fields.sort((a, b) => {
      if (a.lineNumber !== b.lineNumber) {
        return (a.lineNumber || 0) - (b.lineNumber || 0);
      }
      return (a.linePosition || 0) - (b.linePosition || 0);
    }).forEach(field => {
      if (field.fieldType === 'dynamic') {
        zpl += `^FO${field.x},${(field.lineNumber - 1) * 30 + 10}^A0,${field.fontSize},${field.fontSize}^FD{${field.name}}^FS`;
      } else if (field.fieldType === 'static') {
        zpl += `^FO${field.x},${(field.lineNumber - 1) * 30 + 10}^A0,${field.fontSize},${field.fontSize}^FD${field.staticValue}^FS`;
      } else if (field.fieldType === 'barcode') {
        zpl += `^FO${field.x},${(field.lineNumber - 1) * 30 + 10}^BCN,${field.barcodeHeight || 50},Y,N,N^FD{${field.name}}^FS`;
      } else if (field.fieldType === 'qrcode') {
        zpl += `^FO${field.x},${(field.lineNumber - 1) * 30 + 10}^BQ,2,2^FD{${field.name}}^FS`;
      } else if (field.fieldType === 'line') {
        zpl += `^FO${field.x},${(field.lineNumber - 1) * 30 + 10}^GB${field.lineWidth},${field.lineHeight},${field.lineHeight}^FS`;
      }
    });
    
    zpl += "^XZ"; // Fim do ZPL
    return zpl;
  };

  useEffect(() => {
    const newZpl = generateZPL();
    setZpl(newZpl);
  }, [fields, labelWidth, labelHeight]);

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <Title>Editor de Template de Etiqueta {templateId ? '(Editando)' : '(Novo)'}</Title>
        <Button variant="outline" onClick={() => router.push("/admin/templates/etiquetas/list")}>
          Voltar
        </Button>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="space-y-4">
          <Card className="p-4">
            <div className="mb-4">
              <Label>Nome do Template</Label>
              <Input
                value={templateName}
                onChange={(e) => setTemplateName(e.target.value)}
                placeholder="Ex: Etiqueta Padrão"
              />
            </div>

            <div className="flex flex-wrap items-center gap-2 mb-4">
              <Button
                onClick={() => setShowCustomFieldDialog(true)}
                variant="outline"
                size="sm"
              >
                + Campo Personalizado
              </Button>
              <Button
                onClick={() => setShowStaticTextDialog(true)}
                variant="outline"
                size="sm"
              >
                + Texto Estático
              </Button>
              <Button
                onClick={addBarcode}
                variant="outline"
                size="sm"
              >
                + Código de Barras
              </Button>
              <Button
                onClick={addQRCode}
                variant="outline"
                size="sm"
              >
                + QR Code
              </Button>
              <Button
                onClick={addHorizontalLine}
                variant="outline"
                size="sm"
              >
                + Linha Horizontal
              </Button>
            </div>
          </Card>

          <Card className="p-4">
            <Button 
              disabled={saving}
              onClick={async () => {
                if (!templateName.trim()) {
                  toast.error("Nome do template é obrigatório");
                  return;
                }
                
                if (fields.length === 0) {
                  toast.error("Adicione pelo menos um campo ao template");
                  return;
                }
                
                try {
                  setSaving(true);
                  
                  const templateData = {
                    id: templateId,
                    nome: templateName,
                    zpl: zpl,
                    campos: fields,
                    width: labelWidth,
                    height: labelHeight
                  };
                  
                  await saveTemplate(templateData);
                  
                  toast.success("Template salvo com sucesso");
                  
                  if (!templateId) {
                    router.push("/admin/templates/etiquetas/list");
                  }
                } catch (error: any) {
                  toast.error(error.message || "Erro ao salvar template");
                } finally {
                  setSaving(false);
                }
              }}
              className="w-full"
            >
              {saving ? "Salvando..." : "Salvar Template"}
            </Button>
          </Card>

          <Card className="p-4">
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold mb-2">Configuração de Linhas</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Linha Atual</Label>
                    <Input 
                      type="number" 
                      min="1" 
                      value={currentLine} 
                      onChange={(e) => setCurrentLine(parseInt(e.target.value) || 1)}
                    />
                  </div>
                  <div>
                    <Label>Tamanho da Etiqueta</Label>
                    <div className="flex gap-2">
                      <Input 
                        type="number" 
                        min="100" 
                        value={labelWidth} 
                        onChange={(e) => setLabelWidth(parseInt(e.target.value) || 400)}
                        placeholder="Largura"
                      />
                      <Input 
                        type="number" 
                        min="100" 
                        value={labelHeight} 
                        onChange={(e) => setLabelHeight(parseInt(e.target.value) || 300)}
                        placeholder="Altura"
                      />
                    </div>
                  </div>
                </div>
              </div>
              
              <Separator />
              
              <div className="mt-4">
                <h3 className="text-lg font-semibold mb-2">Campos do Template</h3>
                <div className="space-y-2 max-h-80 overflow-y-auto">
                  {fields.length === 0 ? (
                    <p className="text-sm text-muted-foreground">Nenhum campo adicionado</p>
                  ) : (
                    fields
                      .sort((a, b) => {
                        if (a.lineNumber !== b.lineNumber) {
                          return (a.lineNumber || 0) - (b.lineNumber || 0);
                        }
                        return (a.linePosition || 0) - (b.linePosition || 0);
                      })
                      .map((field, index) => (
                        <div 
                          key={index} 
                          className="flex items-center justify-between p-2 bg-secondary/20 rounded cursor-pointer hover:bg-secondary/30"
                          onClick={() => openEditDialog(field, index)}
                        >
                          <div className="flex-1">
                            <span className="font-medium">
                              L{field.lineNumber || 1} - {field.name}
                            </span>
                            <span className="text-xs ml-1 text-muted-foreground">
                              ({field.fieldType})
                            </span>
                            {field.fieldType === 'static' && (
                              <span className="text-xs ml-1 italic">
                                "{field.staticValue}"
                              </span>
                            )}
                            {field.reversed && (
                              <span className="text-xs ml-1 px-1 bg-black text-white rounded">
                                Reverso
                              </span>
                            )}
                            <span className="text-xs ml-1">
                              {field.fontSize}px {field.fontStyle === 'bold' ? 'Negrito' : ''}
                            </span>
                          </div>
                          <div className="flex gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-7 px-2"
                              onClick={(e) => {
                                e.stopPropagation();  // Impedir que abra o diálogo de edição
                                openEditDialog(field, index);
                              }}
                            >
                              Editar
                            </Button>
                            <Button
                              variant="destructive"
                              size="sm"
                              className="h-7 px-2"
                              onClick={(e) => {
                                e.stopPropagation();  // Impedir que abra o diálogo de edição
                                setFields(fields.filter((_, i) => i !== index));
                              }}
                            >
                              Remover
                            </Button>
                          </div>
                        </div>
                      ))
                  )}
                </div>
              </div>
            </div>
          </Card>
        </div>
        
        <div className="space-y-4">
          <Card className="p-4">
            <h3 className="text-lg font-semibold mb-4">Visualização do Template</h3>
            <div className="border p-4 rounded-md bg-white relative" 
              style={{ 
                width: `${labelWidth}px`, 
                height: `${labelHeight}px`,
                margin: '0 auto',
                overflow: 'hidden'
              }}
            >
              {fields.map((field, index) => {
                const lineHeight = 30;
                const y = field.lineNumber ? (field.lineNumber - 1) * lineHeight + 20 : field.y;
                
                let x = 10;
                if (field.alignment === 'center') x = labelWidth / 2;
                else if (field.alignment === 'right') x = labelWidth - 20;
                
                if (field.fieldType === 'line') {
                  return (
                    <div 
                      key={index} 
                      style={{
                        position: 'absolute',
                        left: `${field.x}px`,
                        top: `${y}px`,
                        width: `${field.lineWidth}px`,
                        height: `${field.lineHeight}px`,
                        backgroundColor: 'black',
                      }}
                    />
                  );
                }
                
                let content = "";
                if (field.fieldType === 'static') content = field.staticValue || "";
                else if (field.fieldType === 'barcode') content = "[Código de Barras]";
                else if (field.fieldType === 'qrcode') content = "[QR Code]";
                else content = `{${field.name}}`;
                
                const style: React.CSSProperties = {
                  position: 'absolute',
                  left: `${x}px`,
                  top: `${y}px`,
                  fontSize: `${field.fontSize}px`,
                  fontWeight: field.fontStyle === 'bold' ? 'bold' : 'normal',
                  textAlign: field.alignment,
                  transform: field.alignment === 'center' ? 'translateX(-50%)' : 
                          field.alignment === 'right' ? 'translateX(-100%)' : 'none',
                  backgroundColor: field.reversed ? 'black' : 'transparent',
                  color: field.reversed ? 'white' : 'black',
                  padding: field.reversed ? '2px 4px' : 0,
                };
                
                return <div key={index} style={style}>{content}</div>;
              })}
            </div>
          </Card>
          <Card className="p-4">
            <h3 className="text-lg font-semibold mb-4">ZPL Gerado</h3>
            <pre className="bg-gray-100 p-2 rounded-md overflow-x-auto">{zpl}</pre>
          </Card>
        </div>
      </div>
      
      {/* Modal de campo personalizado */}
      {showCustomFieldDialog && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-background rounded-lg p-6 w-96 max-w-full">
            <h3 className="text-lg font-semibold mb-4">Adicionar Campo Personalizado</h3>
            <div className="space-y-4">
              <div>
                <Label>Nome do Campo</Label>
                <Input 
                  value={customFieldName} 
                  onChange={(e) => setCustomFieldName(e.target.value)} 
                  placeholder="Ex: endereco"
                />
              </div>
              
              <div>
                <Label>Tamanho da Fonte</Label>
                <Input 
                  type="number" 
                  min="6" 
                  max="24" 
                  value={fieldFontSize} 
                  onChange={(e) => setFieldFontSize(parseInt(e.target.value) || 10)} 
                />
              </div>
              
              <div>
                <Label>Estilo da Fonte</Label>
                <Select
                  value={fieldFontStyle}
                  onValueChange={(value) => 
                    setFieldFontStyle(value as 'normal' | 'bold')
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o estilo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="normal">Normal</SelectItem>
                    <SelectItem value="bold">Negrito</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label>Alinhamento</Label>
                <Select
                  value={fieldAlignment}
                  onValueChange={(value) => 
                    setFieldAlignment(value as 'left' | 'center' | 'right')
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
              
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="field-reversed" 
                  checked={fieldReversed} 
                  onCheckedChange={(checked) => setFieldReversed(checked === true)} 
                />
                <Label htmlFor="field-reversed">Texto Reverso (branco em fundo preto)</Label>
              </div>
              
              <div className="flex justify-between">
                <Button 
                  variant="outline"
                  onClick={() => setShowCustomFieldDialog(false)}
                >
                  Cancelar
                </Button>
                <Button onClick={addCustomField}>
                  Adicionar
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal de texto estático */}
      {showStaticTextDialog && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-background rounded-lg p-6 w-96 max-w-full">
            <h3 className="text-lg font-semibold mb-4">Adicionar Texto Estático</h3>
            <div className="space-y-4">
              <div>
                <Label>Texto</Label>
                <Input 
                  value={staticText} 
                  onChange={(e) => setStaticText(e.target.value)} 
                  placeholder="Ex: Data de Manipulação:"
                />
              </div>
              
              <div>
                <Label>Tamanho da Fonte</Label>
                <Input 
                  type="number" 
                  min="6" 
                  max="24" 
                  value={fieldFontSize} 
                  onChange={(e) => setFieldFontSize(parseInt(e.target.value) || 10)} 
                />
              </div>
              
              <div>
                <Label>Estilo da Fonte</Label>
                <Select
                  value={fieldFontStyle}
                  onValueChange={(value) => 
                    setFieldFontStyle(value as 'normal' | 'bold')
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o estilo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="normal">Normal</SelectItem>
                    <SelectItem value="bold">Negrito</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label>Alinhamento</Label>
                <Select
                  value={staticTextAlignment}
                  onValueChange={(value) => 
                    setStaticTextAlignment(value as 'left' | 'center' | 'right')
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
              
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="static-reversed" 
                  checked={fieldReversed} 
                  onCheckedChange={(checked) => setFieldReversed(checked === true)} 
                />
                <Label htmlFor="static-reversed">Texto Reverso (branco em fundo preto)</Label>
              </div>
              
              <div className="flex justify-between">
                <Button 
                  variant="outline"
                  onClick={() => setShowStaticTextDialog(false)}
                >
                  Cancelar
                </Button>
                <Button onClick={addStaticText}>
                  Adicionar
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Modal de edição de campo */}
      {showEditFieldDialog && editingField && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-background rounded-lg p-6 w-96 max-w-full">
            <h3 className="text-lg font-semibold mb-4">Editar Campo</h3>
            <div className="space-y-4">
              {editingField.fieldType === 'dynamic' && (
                <div>
                  <Label>Nome do Campo</Label>
                  <Input 
                    value={editingField.name} 
                    onChange={(e) => setEditingField({...editingField, name: e.target.value})}
                  />
                </div>
              )}
              
              {editingField.fieldType === 'static' && (
                <div>
                  <Label>Texto</Label>
                  <Input 
                    value={editingField.staticValue || ''} 
                    onChange={(e) => setEditingField({...editingField, staticValue: e.target.value})}
                  />
                </div>
              )}
              
              <div>
                <Label>Linha</Label>
                <Input 
                  type="number" 
                  min="1" 
                  value={editLineNumber} 
                  onChange={(e) => setEditLineNumber(parseInt(e.target.value) || 1)}
                />
              </div>
              
              {editingField.fieldType === 'line' ? (
                <>
                  <div>
                    <Label>Largura da Linha</Label>
                    <Input 
                      type="number" 
                      min="10" 
                      value={editLineWidth} 
                      onChange={(e) => setEditLineWidth(parseInt(e.target.value) || 100)}
                    />
                  </div>
                  
                  <div>
                    <Label>Altura da Linha</Label>
                    <Input 
                      type="number" 
                      min="1" 
                      max="10" 
                      value={editLineHeight} 
                      onChange={(e) => setEditLineHeight(parseInt(e.target.value) || 1)}
                    />
                  </div>
                </>
              ) : (
                <>
                  <div>
                    <Label>Tamanho da Fonte</Label>
                    <Input 
                      type="number" 
                      min="6" 
                      max="24" 
                      value={editingField.fontSize} 
                      onChange={(e) => setEditingField({...editingField, fontSize: parseInt(e.target.value) || 10})}
                    />
                  </div>
                  
                  <div>
                    <Label>Estilo da Fonte</Label>
                    <Select
                      value={editingField.fontStyle}
                      onValueChange={(value) => 
                        setEditingField({...editingField, fontStyle: value as 'normal' | 'bold'})
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o estilo" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="normal">Normal</SelectItem>
                        <SelectItem value="bold">Negrito</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <Label>Alinhamento</Label>
                    <Select
                      value={editingField.alignment}
                      onValueChange={(value) => 
                        setEditingField({...editingField, alignment: value as 'left' | 'center' | 'right'})
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
                  
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="edit-reversed" 
                      checked={editingField.reversed} 
                      onCheckedChange={(checked) => setEditingField({...editingField, reversed: checked === true})}
                    />
                    <Label htmlFor="edit-reversed">Texto Reverso (branco em fundo preto)</Label>
                  </div>
                </>
              )}
              
              <div className="flex justify-between">
                <Button 
                  variant="outline"
                  onClick={() => setShowEditFieldDialog(false)}
                >
                  Cancelar
                </Button>
                <Button onClick={saveFieldEdit}>
                  Salvar
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}