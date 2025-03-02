"use client";

import { Title } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { useEffect, useState } from "react";
import { saveTemplate, testPrint, getTemplates, deleteTemplate } from "../actions";
import { LabelPreview } from "@/components/label-preview";
import { LoaderCircle } from "lucide-react";
import { useRouter } from "next/navigation";

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

interface Template {
  id: string;
  nome: string;
  zpl: string;
  campos: FieldPosition[];
  width: number;
  height: number;
}

const ZOOM_OPTIONS = [
  { value: "0.5", label: "50%" },
  { value: "0.75", label: "75%" },
  { value: "1", label: "100%" },
  { value: "1.25", label: "125%" },
  { value: "1.5", label: "150%" },
  { value: "2", label: "200%" },
];

export default function TemplateEditorPage({ params }: { params?: { id: string } }) {
  const router = useRouter();
  const [zpl, setZpl] = useState<string>("");
  const [templateName, setTemplateName] = useState<string>("");
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [scale, setScale] = useState(1);
  const [labelWidth, setLabelWidth] = useState(400);
  const [labelHeight, setLabelHeight] = useState(300);
  const [fields, setFields] = useState<FieldPosition[]>([
    { 
      name: "produto", 
      x: 10, 
      y: 10, 
      fontSize: 12,
      fontStyle: 'normal',
      reversed: false,
      alignment: 'left',
      fontFamily: 'A'
    },
    { 
      name: "validade", 
      x: 10, 
      y: 40, 
      fontSize: 10,
      fontStyle: 'normal',
      reversed: false,
      alignment: 'left',
      fontFamily: 'A'
    },
    { 
      name: "lote", 
      x: 10, 
      y: 70, 
      fontSize: 10,
      fontStyle: 'normal',
      reversed: false,
      alignment: 'left',
      fontFamily: 'A'
    },
    { 
      name: "sif", 
      x: 10, 
      y: 100, 
      fontSize: 10,
      fontStyle: 'normal',
      reversed: false,
      alignment: 'left',
      fontFamily: 'A'
    },
  ]);

  useEffect(() => {
    const loadTemplate = async () => {
      try {
        if (params?.id) {
          const templates = await getTemplates();
          const template = templates.find(t => t.id === params.id);
          if (template) {
            setTemplateName(template.nome ?? "");
            setZpl(template.zpl ?? "");
            setFields((template.campos ?? []) as unknown as FieldPosition[]);
            setLabelWidth(template.width ?? 0);
            setLabelHeight(template.height ?? 0);
          }
        }
      } catch (error: any) {
        toast.error(error.message || "Erro ao carregar template");
      } finally {
        setLoading(false);
      }
    };
    loadTemplate();
  }, [params?.id]);

  const handleFieldChange = (index: number, field: Partial<FieldPosition>) => {
    const newFields = [...fields];
    newFields[index] = { ...newFields[index], ...field };
    setFields(newFields);
    generateZpl(newFields);
  };

  const generateZpl = (currentFields: FieldPosition[]) => {
    // Basic ZPL template with label dimensions
    let template = `^XA
^CI28
^LH0,0
^PW${labelWidth}
^LL${labelHeight}
`;

    // Add fields
    currentFields.forEach((field) => {
      // Start field origin
      template += `^FO${field.x},${field.y}`;
      
      // Font selection and style
      const fontCommand = field.fontStyle === 'bold' ? 'B' : 'N';
      template += `^A${field.fontFamily}${fontCommand},${field.fontSize}`;
      
      // Alignment and text block
      const alignmentValue = field.alignment === 'center' ? 'C' : field.alignment === 'right' ? 'R' : 'L';
      template += `^FB${labelWidth - field.x},1,0,${alignmentValue}`;
      
      // Reverse print if enabled
      if (field.reversed) {
        template += '^FR';
      }
      
      // Field data
      template += `^FD{${field.name}}^FS\n`;
    });

    template += "^XZ";
    setZpl(template);
  };

  const handleSave = async () => {
    if (!templateName) {
      toast.error("Nome do template é obrigatório");
      return;
    }

    try {
      setSaving(true);
      await saveTemplate({
        id: params?.id,
        nome: templateName,
        zpl,
        campos: fields,
        width: labelWidth,
        height: labelHeight
      });
      toast.success("Template salvo com sucesso");
      router.push("/admin/templates/etiquetas/list");
    } catch (error: any) {
      toast.error(error.message || "Erro ao salvar template");
    } finally {
      setSaving(false);
    }
  };

  const handleTest = async () => {
    try {
      setTesting(true);
      // Create test data
      const testData = {
        produto: "PRODUTO TESTE",
        validade: "31/12/2024",
        lote: "LOTE-123",
        sif: "SIF-456"
      };

      // If editing, use the template ID, otherwise use a temporary ID and current ZPL
      const templateId = params?.id || "temp";
      await testPrint(templateId, testData, templateId === "temp" ? zpl : undefined);
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
        <Title>Editor de Template de Etiqueta</Title>
        <Button variant="outline" onClick={() => router.push("/admin/templates/etiquetas/list")}>
          Voltar
        </Button>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mt-4">
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

            <h3 className="text-lg font-semibold mb-4">Campos Disponíveis</h3>
            <div className="space-y-4">
              {fields.map((field, index) => (
                <div key={field.name} className="space-y-2">
                  <Label>{field.name}</Label>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="grid grid-cols-3 gap-2">
                      <div>
                        <Label>X</Label>
                        <Input
                          type="number"
                          value={field.x}
                          onChange={(e) => handleFieldChange(index, { x: parseInt(e.target.value) })}
                        />
                      </div>
                      <div>
                        <Label>Y</Label>
                        <Input
                          type="number"
                          value={field.y}
                          onChange={(e) => handleFieldChange(index, { y: parseInt(e.target.value) })}
                        />
                      </div>
                      <div>
                        <Label>Tamanho</Label>
                        <Input
                          type="number"
                          value={field.fontSize}
                          onChange={(e) => handleFieldChange(index, { fontSize: parseInt(e.target.value) })}
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <Label>Fonte</Label>
                        <Select
                          value={field.fontFamily}
                          onValueChange={(value) => handleFieldChange(index, { fontFamily: value })}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Fonte" />
                          </SelectTrigger>
                          <SelectContent>
                            {['A', 'B', 'C', 'D', 'E', 'F'].map((font) => (
                              <SelectItem key={font} value={font}>
                                Fonte {font}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label>Estilo</Label>
                        <Select
                          value={field.fontStyle}
                          onValueChange={(value) => handleFieldChange(index, { fontStyle: value as 'normal' | 'bold' })}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Estilo" />
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
                          value={field.alignment}
                          onValueChange={(value) => handleFieldChange(index, { alignment: value as 'left' | 'center' | 'right' })}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Alinhamento" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="left">Esquerda</SelectItem>
                            <SelectItem value="center">Centro</SelectItem>
                            <SelectItem value="right">Direita</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="flex items-end">
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id={`reversed-${index}`}
                            checked={field.reversed}
                            onCheckedChange={(checked: boolean | 'indeterminate') => 
                              handleFieldChange(index, { reversed: checked === true })
                            }
                          />
                          <Label htmlFor={`reversed-${index}`}>Invertido</Label>
                        </div>
                      </div>
                    </div>
                  </div>
                  <Separator className="my-2" />
                </div>
              ))}
            </div>
          </Card>

          <Card className="p-4">
            <h3 className="text-lg font-semibold mb-4">Comando ZPL</h3>
            <Textarea
              value={zpl}
              onChange={(e) => setZpl(e.target.value)}
              className="h-[200px] font-mono"
            />
            <div className="mt-4 space-x-2">
              <Button onClick={() => generateZpl(fields)}>Atualizar</Button>
              <Button 
                variant="outline" 
                onClick={handleTest}
                disabled={testing}
              >
                {testing ? "Enviando..." : "Testar Impressão"}
              </Button>
              <Button 
                onClick={handleSave}
                disabled={saving || !templateName}
              >
                {saving ? "Salvando..." : "Salvar Template"}
              </Button>
            </div>
          </Card>
        </div>

        <div className="space-y-4">
          <Card className="p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Visualização</h3>
              <div className="flex items-center gap-4">
                <Label>Zoom</Label>
                <div className="w-32">
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
            <LabelPreview 
              fields={fields} 
              scale={scale}
              width={400}
              height={300}
            />
          </Card>
        </div>
      </div>
    </div>
  );
}
