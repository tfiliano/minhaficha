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
        <SelectTrigger className="h-12 sm:h-14 bg-white dark:bg-slate-800 border-2 border-slate-300 dark:border-slate-600 rounded-lg px-4 sm:px-5 text-base sm:text-lg font-medium text-slate-900 dark:text-slate-100 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all duration-200 shadow-sm hover:border-slate-400 dark:hover:border-slate-500">
          <SelectValue placeholder="Selecione uma opção" className="text-slate-500 dark:text-slate-400" />
        </SelectTrigger>
        <SelectContent className="bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 rounded-lg shadow-xl max-h-48 sm:max-h-60 text-sm sm:text-base">
          {!cleanField.required && (
            <SelectItem key="clear" value="__empty__" className="text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700 py-3 px-4 cursor-pointer">
              <div className="flex items-center gap-2">
                <span className="text-xs">✕</span>
                Limpar seleção
              </div>
            </SelectItem>
          )}
          {cleanField.options.map((option) => (
            <SelectItem key={uuid()} value={option.value?.toString() || "__empty__"} className="text-slate-900 dark:text-slate-100 hover:bg-blue-50 dark:hover:bg-blue-900/20 py-3 px-4 cursor-pointer font-medium transition-colors">
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    );
  }
}
