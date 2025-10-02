import { ControllerRenderProps } from "react-hook-form";
import { Switch } from "../ui/switch";
import { Label } from "../ui/label";
import { Field } from ".";

type ToggleFormProps = {
  formField: ControllerRenderProps<any, string>;
  field: Field;
  disabled?: boolean;
};

export function ToggleForm({ formField, field, disabled }: ToggleFormProps) {
  return (
    <>
      {field.label && (
        <Label
          htmlFor={field.name}
          className="flex items-center font-normal text-slate-600 dark:text-slate-400 text-xs sm:text-sm"
        >
          {field.label}
          {field.required && (
            <span className="text-red-500 ml-1 text-sm">*</span>
          )}
        </Label>
      )}
      <div className="flex items-center gap-3">
        <Switch
          id={field.name}
          checked={!!formField.value}
          onCheckedChange={formField.onChange}
          disabled={disabled}
        />
        <span className="text-sm text-slate-700 dark:text-slate-300">
          {formField.value ? "Sim" : "Não"}
        </span>
      </div>
    </>
  );
}
