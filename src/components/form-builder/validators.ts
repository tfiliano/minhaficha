import { z } from "zod";
import { Builder, Column, Field, SelectField } from ".";

type SchemaFields = {
  [x: string]: any;
};

// Função recursiva para processar as colunas e campos
export const generateSchema = (columns: Column[], schemaFields: any = {}) => {
  const setNestedSchemaField = (fieldPath: string, schema: any) => {
    const keys = fieldPath.split(".");
    let current = schemaFields;

    for (let i = 0; i < keys.length - 1; i++) {
      if (!current[keys[i]]) {
        current[keys[i]] = z.object({});
      }
      current = current[keys[i]].shape;
    }

    current[keys[keys.length - 1]] = schema;
  };

  for (let column of columns) {
    if (column.columns) {
      generateSchema(column.columns, schemaFields);
    }

    if (column.rows) {
      for (let row of column.rows) {
        for (let field of row.fields) {
          if (field.required === false) continue;
          let schema;
          switch (field.type) {
            case "number":
              schema = z.number({
                required_error: "Campo obrigatório",
                invalid_type_error: "Campo numerico",
              });
              break;
            case "combobox":
            case "select":
              if ((field as SelectField)?.valueAs === "number") {
                schema = z.number({
                  required_error: "Campo obrigatório",
                  invalid_type_error: "Campo numerico",
                });
              } else {
                schema = z
                  .string({ required_error: "Campo obrigatório" })
                  .min(1);
              }

              break;
            case "email":
              schema = z.string({ required_error: "Campo obrigatório" }).email({
                message: "Email inválido",
              });
              break;
            default:
              schema = z
                .string({
                  required_error: "Campo obrigatório",
                  invalid_type_error: "Campo não pode ficar vazio.",
                })
                .min(1);
          }

          setNestedSchemaField(field.name, schema);
        }
      }
    }
  }

  return z.object(schemaFields);
};

export const updateFieldsInBuilder = (
  builder: Builder,
  fieldsToUpdate: { name: string; field: Partial<Field>; remove?: boolean }[]
): boolean => {
  // Mapeia os nomes dos campos a serem atualizados para um conjunto para verificação eficiente
  const fieldsToUpdateSet = new Set(fieldsToUpdate.map((field) => field.name));

  // Função interna para atualizar ou remover um campo dentro de uma coluna
  const updateFieldInColumn = (
    column: Column,
    fieldName: string,
    updatedField: Partial<Field>,
    remove?: boolean
  ) => {
    if (column.rows) {
      for (const row of column.rows) {
        // Verifica se a linha atual possui um array de campos (fields)
        if (row.fields) {
          let fieldIndex = row.fields.findIndex((f) => f.name === fieldName);

          if (fieldIndex > -1) {
            const field = row.fields[fieldIndex];
            if (field.name === fieldName) {
              if (remove) {
                // Remove o campo da linha
                row.fields.splice(fieldIndex, 1);
              } else {
                // Atualiza o campo da linha
                const { name, label, type, required, ...rest } = updatedField;
                row.fields[fieldIndex] = {
                  name: name || field.name,
                  label: label || field.label,
                  type: type || field.type,
                  required: required || field.required,
                  ...rest,
                };
              }
              fieldsToUpdateSet.delete(fieldName); // Remove o campo do conjunto de campos a serem atualizados/removidos
              if (fieldsToUpdateSet.size === 0) {
                return true; // Todos os campos foram processados
              }
            }
          }
        }
      }
    }

    return false;
  };

  const processColumn = (
    column: Column,
    name: string,
    field: Partial<Field>,
    remove?: boolean
  ) => {
    if (column.columns) {
      for (const col of column.columns) {
        processColumn(col, name, field, remove);
      }
    }
    updateFieldInColumn(column, name, field as Field, remove);
  };

  for (const column of builder.columns) {
    for (const { name, field, remove } of fieldsToUpdate) {
      processColumn(column, name, field as Field, remove);
    }
  }

  return fieldsToUpdateSet.size === 0; // Retorna true se todos os campos foram processados
};
