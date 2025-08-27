"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle, AlertCircle, XCircle, Edit3, Save, X, Minus } from "lucide-react";
import { ProdutoImportPreview } from "@/app/(admin)/admin/produtos/preview-import-action";
import { Tables } from "@/types/database.types";

interface ImportPreviewTableProps {
  data: ProdutoImportPreview[];
  gruposDisponiveis: Tables<'grupos'>[];
  armazenamentosDisponiveis: Tables<'locais_armazenamento'>[];
  produtosDisponiveis: Tables<'produtos'>[];
  onDataChange: (updatedData: ProdutoImportPreview[]) => void;
  onConfirmImport: () => void;
  isProcessing: boolean;
}

export function ImportPreviewTable({ 
  data, 
  gruposDisponiveis, 
  armazenamentosDisponiveis, 
  produtosDisponiveis,
  onDataChange,
  onConfirmImport,
  isProcessing
}: ImportPreviewTableProps) {
  const [editingRow, setEditingRow] = useState<number | null>(null);
  const [editData, setEditData] = useState<ProdutoImportPreview | null>(null);

  const validItems = data.filter(item => 
    item.status !== 'error' && 
    item.conflicts.length === 0 && 
    !item.skipImport
  );
  const hasConflicts = data.some(item => 
    (item.conflicts.length > 0 || item.status === 'error') && 
    !item.skipImport
  );

  const getStatusIcon = (status: string, conflicts: string[], skipImport: boolean) => {
    if (skipImport) {
      return <Minus className="h-4 w-4 text-gray-500" />;
    }
    if (conflicts.length > 0 || status === 'error') {
      return <XCircle className="h-4 w-4 text-red-500" />;
    }
    if (status === 'update') {
      return <AlertCircle className="h-4 w-4 text-blue-500" />;
    }
    return <CheckCircle className="h-4 w-4 text-green-500" />;
  };

  const getStatusText = (item: ProdutoImportPreview) => {
    if (item.skipImport) return 'Pular';
    if (item.conflicts.length > 0) return 'Conflito';
    if (item.status === 'error') return 'Erro';
    if (item.status === 'update') return 'Atualizar';
    return 'Criar';
  };

  const getStatusColor = (item: ProdutoImportPreview) => {
    if (item.skipImport) return 'outline';
    if (item.conflicts.length > 0 || item.status === 'error') return 'destructive';
    if (item.status === 'update') return 'secondary';
    return 'default';
  };

  const toggleSkip = (index: number) => {
    const newData = [...data];
    newData[index] = {
      ...newData[index],
      skipImport: !newData[index].skipImport,
      status: newData[index].skipImport ? 
        (newData[index].produtoExistente ? 'update' : 'create') : 
        'skip'
    };
    onDataChange(newData);
  };

  const startEditing = (index: number) => {
    setEditingRow(index);
    setEditData({ ...data[index] });
  };

  const cancelEditing = () => {
    setEditingRow(null);
    setEditData(null);
  };

  const saveEditing = () => {
    if (editData && editingRow !== null) {
      const newData = [...data];
      
      // Revalidar o item editado
      const updated = { ...editData };
      updated.conflicts = [];
      updated.warnings = [];
      
      // Verificar código duplicado
      const codigoExistente = data.find((item, idx) => 
        idx !== editingRow && 
        item['Código'] === updated['Código'] && 
        updated['Código']
      );
      
      if (codigoExistente) {
        updated.conflicts.push(`Código "${updated['Código']}" duplicado na linha ${codigoExistente.linha}`);
      }
      
      // Verificar nome obrigatório
      if (!updated['Nome do Produto']?.trim()) {
        updated.conflicts.push('Nome do produto é obrigatório');
        updated.status = 'error';
      } else {
        // Determinar status
        const produtoExistente = produtosDisponiveis.find(p => 
          p.codigo === updated['Código'] || p.nome.toLowerCase() === updated['Nome do Produto'].toLowerCase()
        );
        
        updated.status = produtoExistente ? 'update' : 'create';
        updated.produtoExistente = produtoExistente || null;
      }
      
      // Verificar referências
      if (updated['Nome do Grupo'] && !gruposDisponiveis.find(g => g.nome?.toLowerCase() === updated['Nome do Grupo']?.toLowerCase())) {
        updated.warnings.push(`Grupo "${updated['Nome do Grupo']}" será criado automaticamente`);
      }
      
      if (updated['Nome do Armazenamento'] && !armazenamentosDisponiveis.find(a => a.armazenamento?.toLowerCase() === updated['Nome do Armazenamento']?.toLowerCase())) {
        updated.warnings.push(`Armazenamento "${updated['Nome do Armazenamento']}" será criado automaticamente`);
      }
      
      if (updated['Nome do Produto Pai'] && !produtosDisponiveis.find(p => p.nome.toLowerCase() === updated['Nome do Produto Pai']?.toLowerCase())) {
        updated.warnings.push(`Produto pai "${updated['Nome do Produto Pai']}" será criado automaticamente`);
      }

      newData[editingRow] = updated;
      onDataChange(newData);
      
      setEditingRow(null);
      setEditData(null);
    }
  };

  const updateEditField = (field: keyof ProdutoImportPreview, value: any) => {
    if (editData) {
      setEditData({ ...editData, [field]: value });
    }
  };

  const renderEditableCell = (item: ProdutoImportPreview, field: keyof ProdutoImportPreview, rowIndex: number) => {
    const isEditing = editingRow === rowIndex;
    
    if (!isEditing) {
      return (
        <div className="flex items-center gap-2">
          <span>{String(item[field] || '')}</span>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => startEditing(rowIndex)}
            className="h-6 w-6 p-0"
          >
            <Edit3 className="h-3 w-3" />
          </Button>
        </div>
      );
    }

    if (field === 'Nome do Grupo') {
      return (
        <Select
          value={String(editData?.[field] || 'NOVO')}
          onValueChange={(value) => updateEditField(field, value === 'NOVO' ? null : value)}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Selecionar grupo" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="NOVO">Criar novo grupo</SelectItem>
            {gruposDisponiveis.map((grupo) => (
              <SelectItem key={grupo.id} value={grupo.nome || 'NOVO'}>
                {grupo.nome}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      );
    }

    if (field === 'Nome do Armazenamento') {
      return (
        <Select
          value={String(editData?.[field] || 'NOVO')}
          onValueChange={(value) => updateEditField(field, value === 'NOVO' ? null : value)}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Selecionar armazenamento" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="NOVO">Criar novo armazenamento</SelectItem>
            {armazenamentosDisponiveis.map((armazenamento) => (
              <SelectItem key={armazenamento.id} value={armazenamento.armazenamento || 'NOVO'}>
                {armazenamento.armazenamento}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      );
    }

    if (field === 'Nome do Produto Pai') {
      return (
        <Select
          value={String(editData?.[field] || 'NENHUM')}
          onValueChange={(value) => updateEditField(field, value === 'NENHUM' ? null : value)}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Selecionar produto pai" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="NENHUM">Nenhum / Criar novo</SelectItem>
            {produtosDisponiveis
              .filter(produto => !produto.originado) // Apenas produtos sem pai
              .map((produto) => (
                <SelectItem key={produto.id} value={produto.nome}>
                  {produto.codigo} - {produto.nome}
                </SelectItem>
              ))}
          </SelectContent>
        </Select>
      );
    }

    if (field === 'Setor') {
      return (
        <Select
          value={String(editData?.[field] || '')}
          onValueChange={(value) => updateEditField(field, value)}
        >
          <SelectTrigger className="w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="AÇOUGUE">AÇOUGUE</SelectItem>
            <SelectItem value="FRIOS">FRIOS</SelectItem>
            <SelectItem value="PADARIA">PADARIA</SelectItem>
            <SelectItem value="HORTIFRUTI">HORTIFRUTI</SelectItem>
          </SelectContent>
        </Select>
      );
    }

    if (field === 'Unidade') {
      return (
        <Select
          value={String(editData?.[field] || '')}
          onValueChange={(value) => updateEditField(field, value)}
        >
          <SelectTrigger className="w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="UN">UN</SelectItem>
            <SelectItem value="KG">KG</SelectItem>
            <SelectItem value="LT">LT</SelectItem>
            <SelectItem value="MT">MT</SelectItem>
          </SelectContent>
        </Select>
      );
    }

    if (field === 'Ativo') {
      return (
        <Select
          value={String(editData?.[field] || '')}
          onValueChange={(value) => updateEditField(field, value)}
        >
          <SelectTrigger className="w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="SIM">SIM</SelectItem>
            <SelectItem value="NÃO">NÃO</SelectItem>
          </SelectContent>
        </Select>
      );
    }

    return (
      <Input
        type={field.includes('Estoque') || field.includes('Dias') ? 'number' : 'text'}
        value={String(editData?.[field] || '')}
        onChange={(e) => updateEditField(field, e.target.value)}
        className="w-full"
      />
    );
  };

  const stats = {
    total: data.length,
    toCreate: data.filter(item => item.status === 'create' && item.conflicts.length === 0 && !item.skipImport).length,
    toUpdate: data.filter(item => item.status === 'update' && item.conflicts.length === 0 && !item.skipImport).length,
    conflicts: data.filter(item => item.conflicts.length > 0 && !item.skipImport).length,
    errors: data.filter(item => item.status === 'error' && !item.skipImport).length,
    skipped: data.filter(item => item.skipImport).length
  };

  return (
    <div className="space-y-6">
      {/* Estatísticas */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-green-600">Criar</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.toCreate}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-blue-600">Atualizar</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{stats.toUpdate}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Pular</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-600">{stats.skipped}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-yellow-600">Conflitos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{stats.conflicts}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-red-600">Erros</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{stats.errors}</div>
          </CardContent>
        </Card>
      </div>

      {/* Alerta se houver conflitos */}
      {hasConflicts && (
        <Alert className="border-yellow-200 bg-yellow-50">
          <AlertCircle className="h-4 w-4 text-yellow-600" />
          <AlertDescription className="text-yellow-800">
            Existem conflitos que precisam ser resolvidos antes da importação. 
            Clique no ícone de edição para corrigir os problemas.
          </AlertDescription>
        </Alert>
      )}

      {/* Tabela de pré-visualização */}
      <div className="border rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12">
                <Checkbox className="w-4 h-4" />
              </TableHead>
              <TableHead className="w-16">Linha</TableHead>
              <TableHead className="w-20">Status</TableHead>
              <TableHead className="min-w-[200px]">Nome do Produto</TableHead>
              <TableHead className="min-w-[100px]">Código</TableHead>
              <TableHead className="min-w-[80px]">Unidade</TableHead>
              <TableHead className="min-w-[100px]">Setor</TableHead>
              <TableHead className="min-w-[120px]">Grupo</TableHead>
              <TableHead className="min-w-[140px]">Armazenamento</TableHead>
              <TableHead className="min-w-[140px]">Produto Pai</TableHead>
              <TableHead className="min-w-[100px]">Dias Validade</TableHead>
              <TableHead className="w-24">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((item, index) => (
              <TableRow 
                key={`${item.linha}-${index}`} 
                className={item.skipImport ? 'bg-gray-100 opacity-60' : item.conflicts.length > 0 ? 'bg-red-50' : ''}
              >
                <TableCell>
                  <Checkbox 
                    checked={item.skipImport}
                    onCheckedChange={() => toggleSkip(index)}
                    className="w-4 h-4"
                  />
                </TableCell>
                <TableCell>{item.linha}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    {getStatusIcon(item.status, item.conflicts, item.skipImport)}
                    <Badge variant={getStatusColor(item)}>
                      {getStatusText(item)}
                    </Badge>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="space-y-1">
                    {renderEditableCell(item, 'Nome do Produto', index)}
                    {item.conflicts.map((conflict, idx) => (
                      <div key={idx} className="text-xs text-red-600 flex items-center gap-1">
                        <XCircle className="h-3 w-3" />
                        {conflict}
                      </div>
                    ))}
                    {item.warnings.map((warning, idx) => (
                      <div key={idx} className="text-xs text-yellow-600 flex items-center gap-1">
                        <AlertCircle className="h-3 w-3" />
                        {warning}
                      </div>
                    ))}
                  </div>
                </TableCell>
                <TableCell>{renderEditableCell(item, 'Código', index)}</TableCell>
                <TableCell>{renderEditableCell(item, 'Unidade', index)}</TableCell>
                <TableCell>{renderEditableCell(item, 'Setor', index)}</TableCell>
                <TableCell>{renderEditableCell(item, 'Nome do Grupo', index)}</TableCell>
                <TableCell>{renderEditableCell(item, 'Nome do Armazenamento', index)}</TableCell>
                <TableCell>{renderEditableCell(item, 'Nome do Produto Pai', index)}</TableCell>
                <TableCell>{renderEditableCell(item, 'Dias Validade', index)}</TableCell>
                <TableCell>
                  {editingRow === index ? (
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={saveEditing}
                        className="h-6 w-6 p-0"
                      >
                        <Save className="h-3 w-3 text-green-600" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={cancelEditing}
                        className="h-6 w-6 p-0"
                      >
                        <X className="h-3 w-3 text-red-600" />
                      </Button>
                    </div>
                  ) : null}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Botão de confirmar importação */}
      <div className="flex justify-end">
        <Button
          onClick={onConfirmImport}
          disabled={hasConflicts || isProcessing || validItems.length === 0}
          className="min-w-[200px]"
        >
          {isProcessing ? 'Processando...' : `Confirmar Importação (${validItems.length} itens)`}
        </Button>
      </div>
    </div>
  );
}