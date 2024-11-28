import { ControllerRenderProps } from "react-hook-form";
import { Builder, Field, SelectField, copyAndAddRow } from ".";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";

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
    let onValueChangeTransformer = formField.onChange;

    if (field.copy && builder && setBuilder) {
      if (field.copy.onEvent === "onchange") {
        const { columnId, ignores, changePropName, rows } = field.copy;

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

    const onValueChange = (e: any) => {
      if (field.valueAs === "number") {
        onValueChangeTransformer(+e);
      } else if (field.valueAs === "boolean") {
        onValueChangeTransformer(e === "true");
      } else {
        onValueChangeTransformer(e);
      }
    };

    return (
      <Select onValueChange={onValueChange} value={formField.value?.toString()}>
        <SelectTrigger>
          <SelectValue placeholder="Selecione" />
        </SelectTrigger>
        <SelectContent>
          {field.options.map((option) => (
            <SelectItem key={option.label} value={option.value.toString()}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    );
  }
}
