import { Control, useFormContext } from "react-hook-form";
import { FormControl, FormField, FormItem, FormMessage } from "../ui/form";
import { Input } from "../ui/input";

import { ChangeEvent } from "react";
import { FieldMask, Masks } from "./@masks";

interface CustomInputProps {
  control: Control<any>;
  registerName: string;
  textlabel?: string;
  icon?: React.ComponentType<any>;
  placeholder?: string;
  type: string;
  maskName?: FieldMask;
  defaultValue?: string;
}

export const CustomInput = ({
  defaultValue,
  registerName,
  icon: Icon,
  textlabel,
  control,
  placeholder,
  type,
  maskName,
}: CustomInputProps) => {
  const { setValue } = useFormContext();

  const phoneMask = (event: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    let newValue = value;
    if (maskName && Masks[maskName]) {
      newValue = Masks[maskName](value);
    }
    setValue(name, newValue);
  };

  return (
    <FormField
      control={control}
      name={registerName}
      render={({ field }) => (
        <FormItem className="group space-y-0">
          <div className="flex items-center relative">
            {Icon && (
              <div className="text-slate-100 absolute ml-2">
                <Icon className="size-5 stroke-1" />
              </div>
            )}
            <FormControl onChange={phoneMask}>
              <Input
                defaultValue={defaultValue}
                id={registerName}
                data-mask={maskName}
                placeholder={placeholder}
                {...field}
                value={`${Masks[maskName!](field.value)}`}
                type={type}
                autoComplete="off"
              />
            </FormControl>
          </div>

          <FormMessage className="text-rose-400 font-normal text-xs pt-1" />
        </FormItem>
      )}
    />
  );
};
