import { cn } from "@/lib/utils";
import { ControllerRenderProps } from "react-hook-form";
import { Field, RadioField } from ".";
import { FormControl, FormItem, FormLabel } from "../ui/form";
import { RadioGroup, RadioGroupItem } from "../ui/radio-group";

type RadioGroupFormProps = {
  field: Field;
  formField: ControllerRenderProps<any, string>;
};

export function isRadioField(field: Field): field is RadioField {
  return field.type === "radio";
}

export function RadioGroupForm({ field, formField }: RadioGroupFormProps) {
  if (isRadioField(field))
    return (
      <RadioGroup
        onValueChange={formField.onChange}
        defaultValue={formField.value}
        className={cn(
          {
            "flex flex-col space-y-2 pt-2": !field.orientation,
          },
          {
            "flex flex-row flex-wrap gap-4 pt-2":
              field.orientation && field.orientation === "horizontal",
          }
        )}
        disabled={field.readOnly}
        orientation={field?.orientation}
      >
        {field.options.map((option) => (
          <FormItem
            key={option.value}
            className="flex items-center space-x-3 space-y-0"
          >
            <FormControl>
              <RadioGroupItem value={option.value} />
            </FormControl>
            <FormLabel className="font-normal">{option.label}</FormLabel>
          </FormItem>
        ))}
      </RadioGroup>
    );
}
