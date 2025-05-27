"use client";

import { FieldEditorModal } from "@/components/field-editor-modal/index"; // Corrected import
import { LabelPreview } from "@/components/label-preview";
import { Title } from "@/components/layout";
import { TemplatePresetDialog } from "@/components/template-presets/index"; // Corrected import
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  Copy,
  Edit,
  FileText,
  LayoutTemplate,
  LoaderCircle,
  PlusCircle,
  Printer,
  Save,
  SquareMenu,
  Trash2,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import {
  generateZplCode,
  getTemplates,
  saveTemplate,
  testPrint,
} from "../actions";
import { FieldPosition } from "../types";

// Opções de zoom para a visualização
const ZOOM_OPTIONS = [
  { value: "0.5", label: "50%" },
  { value: "0.75", label: "75%" },
  { value: "1", label: "100%" },
  { value: "1.25", label: "125%" },
  { value: "1.5", label: "150%" },
  { value: "2", label: "200%" },
];

interface TemplateEditorParams {
  id?: string;
}

export default function TemplateEditorPage({ params }: any) {
  // Garantir que params seja um objeto mesmo que seja undefined
  const safeParams = params || {};

  // Obtém o ID do template com segurança
  const templateId = safeParams.id;

  const router = useRouter();
  const [zpl, setZpl] = useState<string>("");
  const [templateName, setTemplateName] = useState<string>("");
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [scale, setScale] = useState(1);
  const [labelWidth, setLabelWidth] = useState(400);
  const [labelHeight, setLabelHeight] = useState(300);
  const [fields, setFields] = useState<FieldPosition[]>([]);
  const [selectedFieldIndex, setSelectedFieldIndex] = useState<number | null>(
    null
  );
  const [showFieldEditor, setShowFieldEditor] = useState(false);
  const [newFieldData, setNewFieldData] = useState<FieldPosition | null>(null);
  const [showTemplatePresets, setShowTemplatePresets] = useState(false);
  const [showGrid, setShowGrid] = useState(true);

  // Log para debugging
  useEffect(() => {
    if (templateId) {
      console.log("Componente Editor - ID do template:", templateId);
    } else {
      console.log("Componente Editor - Novo template");
    }
  }, [templateId]);

  // Carregar o template quando o componente monta ou quando templateId muda
  useEffect(() => {
    const loadTemplate = async () => {
      try {
        if (templateId) {
          const templates = await getTemplates();
          const template = templates.find((t) => t.id === templateId);

          if (template) {
            console.log("Template carregado:", template);
            setTemplateName(template.nome);
            setZpl(template.zpl || "");
            setLabelWidth(template.width || 400);
            setLabelHeight(template.height || 300);

            if (Array.isArray(template.campos)) {
              setFields(template.campos);
            } else {
              console.error(
                "Campos do template não são um array:",
                template.campos
              );
              setFields([]);
            }
          } else {
            toast.error(`Template não encontrado`);
          }
        } else {
          // Inicializar com campos vazios
          setFields([]);
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

  // Atualizar o ZPL quando os campos mudarem
  useEffect(() => {
    const updateZpl = async () => {
      if (Array.isArray(fields)) {
        const newZpl = await generateZplCode(fields, labelWidth, labelHeight);
        setZpl(newZpl);
      }
    };

    updateZpl();
  }, [fields, labelWidth, labelHeight]);

  // Adicionar um novo campo
  const handleAddField = () => {
    const newField: FieldPosition = {
      name: `campo${Array.isArray(fields) ? fields.length + 1 : 1}`,
      x: 10,
      y:
        Array.isArray(fields) && fields.length > 0
          ? Math.max(...fields.map((f) => f.y)) + 30
          : 10,
      fontSize: 10,
      fontStyle: "normal",
      reversed: false,
      alignment: "left",
      fontFamily: "A",
      fieldType: "dynamic",
      enabled: true,
      lineNumber: Array.isArray(fields) ? fields.length + 1 : 1,
      linePosition: 1,
    };

    setNewFieldData(newField);
    setShowFieldEditor(true);
  };

  // Editar um campo existente
  const handleEditField = (index: number) => {
    if (Array.isArray(fields) && index >= 0 && index < fields.length) {
      setSelectedFieldIndex(index);
      setNewFieldData({ ...fields[index] });
      setShowFieldEditor(true);
    }
  };

  // Salvar as alterações de um campo (novo ou editado)
  const handleSaveField = (fieldData: FieldPosition) => {
    if (selectedFieldIndex !== null && Array.isArray(fields)) {
      // Editar campo existente
      const updatedFields = [...fields];
      updatedFields[selectedFieldIndex] = fieldData;
      setFields(updatedFields);
    } else {
      // Adicionar novo campo
      setFields(Array.isArray(fields) ? [...fields, fieldData] : [fieldData]);
    }

    setShowFieldEditor(false);
    setNewFieldData(null);
    setSelectedFieldIndex(null);
  };

  // Excluir um campo
  const handleDeleteField = (index: number) => {
    if (Array.isArray(fields)) {
      const updatedFields = fields.filter((_, i) => i !== index);
      setFields(updatedFields);
      if (selectedFieldIndex === index) {
        setSelectedFieldIndex(null);
      }
    }
  };

  // Duplicar um campo
  const handleDuplicateField = (index: number) => {
    if (Array.isArray(fields) && index >= 0 && index < fields.length) {
      const fieldToDuplicate = { ...fields[index] };
      // Atualizar posição e nome para diferenciar da original
      fieldToDuplicate.y += 20;
      fieldToDuplicate.name = `${fieldToDuplicate.name}_copia`;
      fieldToDuplicate.lineNumber += 1;

      setFields([...fields, fieldToDuplicate]);
    }
  };

  // Aplicar um template predefinido
  const handleApplyTemplate = async (templateFields: FieldPosition[]) => {
    if (!Array.isArray(templateFields) || templateFields.length === 0) {
      // Template em branco ou inválido
      setShowTemplatePresets(false);
      return;
    }

    // Confirmar substituição se já existirem campos
    if (Array.isArray(fields) && fields.length > 0) {
      if (confirm("Isso substituirá todos os campos existentes. Continuar?")) {
        setFields(templateFields);
      }
    } else {
      setFields(templateFields);
    }

    setShowTemplatePresets(false);
  };

  // Salvar o template
  // Salvar o template
  const handleSaveTemplate = async () => {
    if (!templateName.trim()) {
      toast.error("Nome do template é obrigatório");
      return;
    }

    if (!Array.isArray(fields)) {
      toast.error("Erro: campos não estão em formato válido");
      return;
    }

    try {
      setSaving(true);

      // Criar objeto simples sem métodos ou propriedades complexas
      const templateData = {
        id: templateId,
        nome: templateName,
        zpl,
        campos: fields.map((field) => ({
          name: field.name,
          x: field.x,
          y: field.y,
          fontSize: field.fontSize,
          fontStyle: field.fontStyle,
          reversed: field.reversed,
          alignment: field.alignment,
          fontFamily: field.fontFamily,
          fieldType: field.fieldType,
          staticValue: field.staticValue,
          lineNumber: field.lineNumber,
          linePosition: field.linePosition,
          defaultValue: field.defaultValue,
          barcodeType: field.barcodeType,
          barcodeHeight: field.barcodeHeight,
          lineWidth: field.lineWidth,
          lineHeight: field.lineHeight,
          boxWidth: field.boxWidth,
          boxHeight: field.boxHeight,
          boxBorderWidth: field.boxBorderWidth,
          enabled: field.enabled,
          uppercase: field.uppercase,
          prefix: field.prefix,
          suffix: field.suffix,
          dateFormat: field.dateFormat,
        })),
        width: labelWidth,
        height: labelHeight,
      };

      await saveTemplate(templateData);
      toast.success("Template salvo com sucesso");

      if (!templateId) {
        router.push("/admin/templates/etiquetas/list");
      }
    } catch (error: any) {
      console.error("Erro ao salvar template:", error);
      toast.error(error.message || "Erro ao salvar template");
    } finally {
      setSaving(false);
    }
  };

  // Testar impressão
  const handleTestPrint = async () => {
    if (!Array.isArray(fields)) {
      toast.error("Erro: campos não estão em formato válido para impressão");
      return;
    }

    try {
      setTesting(true);

      // Criar dados de teste que incluem todos os campos possíveis
      const testData: Record<string, string> = {};

      // Adicionar todos os nomes de campos aos dados de teste
      fields.forEach((field) => {
        if (field.fieldType === "dynamic") {
          let testValue =
            field.defaultValue || field.name.toUpperCase() + " TESTE";

          // Aplicar qualquer formatação necessária
          if (field.uppercase) {
            testValue = testValue.toUpperCase();
          }

          testData[field.name] = testValue;
        }
      });

      // Adicionar dados de teste específicos para campos comuns
      if ("produto" in testData) testData.produto = "PRODUTO TESTE";
      if ("validade" in testData) testData.validade = "31/12/2024";
      if ("lote" in testData) testData.lote = "LOTE-123";
      if ("sif" in testData) testData.sif = "SIF-456";
      if ("manipulacao" in testData) testData.manipulacao = "23/08/2024";
      if ("responsavel" in testData) testData.responsavel = "ADILSON";

      // Imprimir teste
      const templateTestId = templateId || "temp";
      await testPrint(templateTestId, testData, templateId ? undefined : zpl);
      toast.success("Impressão de teste enviada");
    } catch (error: any) {
      toast.error(error.message || "Erro ao testar impressão");
    } finally {
      setTesting(false);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto p-4">
        <Title>Editor de Template de Etiqueta</Title>
        <div className="flex justify-center items-center h-64">
          <LoaderCircle className="w-6 h-6 animate-spin" />
          <span className="ml-2">Carregando...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <Title>
          {templateId
            ? `Editando Template: ${templateName}`
            : "Novo Template de Etiqueta"}
        </Title>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => setShowTemplatePresets(true)}
          >
            <LayoutTemplate className="h-4 w-4 mr-2" />
            Modelos Prontos
          </Button>
          <Button
            variant="outline"
            onClick={() => router.push("/admin/templates/etiquetas/list")}
          >
            Voltar
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mt-4">
        <div className="space-y-4">
          {/* Configurações básicas */}
          <Card className="p-4">
            <h2 className="text-lg font-semibold mb-4">
              Configurações Básicas
            </h2>
            <div className="mb-4">
              <Label>Nome do Template</Label>
              <Input
                value={templateName}
                onChange={(e) => setTemplateName(e.target.value)}
                placeholder="Ex: Etiqueta Padrão"
              />
            </div>

            <div className="mb-4 grid grid-cols-2 gap-4">
              <div>
                <Label>Largura (mm)</Label>
                <Input
                  type="number"
                  value={labelWidth}
                  onChange={(e) => setLabelWidth(parseInt(e.target.value))}
                />
              </div>
              <div>
                <Label>Altura (mm)</Label>
                <Input
                  type="number"
                  value={labelHeight}
                  onChange={(e) => setLabelHeight(parseInt(e.target.value))}
                />
              </div>
            </div>

            <div className="flex justify-between">
              <Button variant="outline" onClick={handleAddField}>
                <PlusCircle className="h-4 w-4 mr-2" />
                Adicionar Campo
              </Button>

              <div className="space-x-2">
                <Button
                  variant="outline"
                  onClick={handleTestPrint}
                  disabled={
                    testing || !Array.isArray(fields) || fields.length === 0
                  }
                >
                  <Printer className="h-4 w-4 mr-2" />
                  {testing ? "Enviando..." : "Testar Impressão"}
                </Button>
                <Button
                  disabled={saving || !templateName || !Array.isArray(fields)}
                  onClick={handleSaveTemplate}
                >
                  <Save className="h-4 w-4 mr-2" />
                  {saving ? "Salvando..." : "Salvar Template"}
                </Button>
              </div>
            </div>
          </Card>

          {/* Lista de campos */}
          <Card className="p-4">
            <h2 className="text-lg font-semibold mb-4">Campos do Template</h2>
            <div className="space-y-2 max-h-[60vh] overflow-y-auto pr-2">
              {!Array.isArray(fields) || fields.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <FileText className="h-8 w-8 mx-auto mb-2 opacity-30" />
                  <p>Nenhum campo adicionado.</p>
                  <p className="text-sm">
                    Clique em Adicionar Campo ou use um dos modelos prontos
                  </p>
                </div>
              ) : (
                fields.map((field, index) => (
                  <div
                    key={index}
                    className={`
                      flex items-center justify-between p-3 rounded 
                      ${
                        selectedFieldIndex === index
                          ? "bg-primary/10 border border-primary"
                          : "bg-secondary/20 hover:bg-secondary/30 border border-transparent"
                      }
                      cursor-pointer transition-colors
                    `}
                    onClick={() => setSelectedFieldIndex(index)}
                  >
                    <div className="flex items-center gap-2">
                      <Checkbox
                        id={`field-enabled-${index}`}
                        checked={field.enabled}
                        onCheckedChange={(checked) => {
                          const updatedFields = [...fields];
                          updatedFields[index] = {
                            ...updatedFields[index],
                            enabled: checked === true,
                          };
                          setFields(updatedFields);
                        }}
                        onClick={(e) => e.stopPropagation()} // Evitar seleção ao clicar no checkbox
                      />
                      <div>
                        <div className="font-medium flex items-center">
                          {(() => {
                            switch (field.fieldType) {
                              case "dynamic":
                                return (
                                  <SquareMenu className="h-3 w-3 mr-1 text-blue-500" />
                                );
                              case "static":
                                return (
                                  <FileText className="h-3 w-3 mr-1 text-green-500" />
                                );
                              case "barcode":
                                return (
                                  <Copy className="h-3 w-3 mr-1 text-orange-500" />
                                );
                              case "qrcode":
                                return (
                                  <div className="h-3 w-3 mr-1 bg-violet-500 rounded-sm" />
                                );
                              case "line":
                                return (
                                  <div className="h-0.5 w-3 mr-1 bg-gray-500" />
                                );
                              case "box":
                                return (
                                  <div className="h-3 w-3 mr-1 border border-gray-500" />
                                );
                              default:
                                return null;
                            }
                          })()}
                          {field.name}
                        </div>
                        <div className="text-xs text-muted-foreground flex flex-wrap gap-1">
                          <span>
                            x:{field.x} y:{field.y}
                          </span>
                          {field.fieldType === "static" && (
                            <span className="italic">{field.staticValue}</span>
                          )}
                          {field.reversed && (
                            <span className="px-1 bg-black text-white text-[10px] rounded">
                              Reverso
                            </span>
                          )}
                          {field.uppercase && (
                            <span className="px-1 border text-[10px] rounded">
                              MAIÚSC
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEditField(index);
                        }}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 text-blue-500"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDuplicateField(index);
                        }}
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 text-destructive hover:text-destructive"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteField(index);
                        }}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </Card>
        </div>

        <div className="space-y-4">
          {/* Prévia do template */}
          <Card className="p-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">Visualização</h2>
              <div className="flex items-center gap-4">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="show-grid"
                    checked={showGrid}
                    onCheckedChange={(checked) => setShowGrid(checked === true)}
                  />
                  <Label htmlFor="show-grid">Mostrar grade</Label>
                </div>
                <div className="flex items-center gap-2">
                  <Label>Zoom</Label>
                  <div className="w-28">
                    <Select
                      value={scale.toString()}
                      onValueChange={(value) => setScale(parseFloat(value))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Zoom" />
                      </SelectTrigger>
                      <SelectContent>
                        {ZOOM_OPTIONS.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            </div>
            <LabelPreview
              fields={Array.isArray(fields) ? fields : []}
              scale={scale}
              width={labelWidth}
              height={labelHeight}
              onSelectField={setSelectedFieldIndex}
              selectedFieldIndex={selectedFieldIndex}
              showGrid={showGrid}
            />
            <p className="text-xs text-muted-foreground mt-2 text-center">
              Clique nos elementos para selecioná-los ou editar suas
              propriedades
            </p>
          </Card>

          {/* Código ZPL */}
          <Card className="p-4">
            <h2 className="text-lg font-semibold mb-4">Código ZPL</h2>
            <Textarea
              value={zpl}
              onChange={(e) => setZpl(e.target.value)}
              className="h-[200px] font-mono text-xs"
            />
            <p className="text-xs text-muted-foreground mt-2">
              O código ZPL é gerado automaticamente com base nos campos
              configurados. Edições manuais podem ser sobrescritas ao atualizar
              campos.
            </p>
          </Card>
        </div>
      </div>

      {/* Modal de edição de campo */}
      {showFieldEditor && newFieldData && (
        <FieldEditorModal
          field={newFieldData}
          onSave={handleSaveField}
          onCancel={() => {
            setShowFieldEditor(false);
            setNewFieldData(null);
            setSelectedFieldIndex(null);
          }}
          isNew={selectedFieldIndex === null}
        />
      )}

      {/* Modal de templates predefinidos */}
      {showTemplatePresets && (
        <TemplatePresetDialog
          onSelect={handleApplyTemplate}
          onCancel={() => setShowTemplatePresets(false)}
        />
      )}
    </div>
  );
}
