import { ControllerRenderProps } from "react-hook-form";
import { Builder, Field, SelectField, copyAndAddRow } from ".";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";

import { v4 as uuid } from "uuid";

export function isSelectField(field: Field): field is SelectField {
  return field.type === "select";
}

type SelectFormProps = {
  field: Field;
  formField: ControllerRenderProps<any, string>;
  builder?: Builder;
  setBuilder?: React.Dispatch<React.SetStateAction<Builder>>;
};

export function SelectForm({
  field,
  formField,
  builder,
  setBuilder,
}: SelectFormProps) {
  if (isSelectField(field)) {
    const { isFullRow, ...cleanField } = field;
    let onValueChangeTransformer = formField.onChange;
    if (cleanField.copy && builder && setBuilder) {
      if (cleanField.copy.onEvent === "onchange") {
        const { columnId, ignores, changePropName, rows } = cleanField.copy;

        onValueChangeTransformer = (e) => {
          const updatedBuilder = copyAndAddRow({
            builder,
            columnId,
            changePropName,
            ignores,
            qty: e,
            rows,
          });

          const updatedColumns = updatedBuilder.columns;

          setBuilder((oldBuilder) => ({
            ...oldBuilder,
            columns: updatedColumns,
          }));

          return formField.onChange(e);
        };
      }
    }

    return (
      <Select 
        onValueChange={(e) => {
          if (e === "__empty__") {
            onValueChangeTransformer(null);
          } else if (field.valueAs === "number") {
            onValueChangeTransformer(+e);
          } else if (field.valueAs === "boolean") {
            onValueChangeTransformer(e === "true");
          } else {
            onValueChangeTransformer(e);
          }
        }}
        value={formField.value ? formField.value.toString() : "__empty__"}
      >
        <SelectTrigger>
          <SelectValue placeholder="Selecione uma opção" />
        </SelectTrigger>
        <SelectContent>
          {!cleanField.required && (
            <SelectItem key="clear" value="__empty__">
              <div className="flex items-center gap-2">
                <span className="text-xs">✕</span>
                Limpar seleção
              </div>
            </SelectItem>
          )}
          {cleanField.options.map((option) => (
            <SelectItem key={uuid()} value={option.value?.toString() || "__empty__"}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    );
  }
}
