import { ControllerRenderProps, useFormContext } from "react-hook-form";
import {
  Builder,
  Field,
  InputField,
  blurActionRegistry,
  isTextareaField,
} from ".";

import { Loader } from "lucide-react";
import { ChangeEvent, useState } from "react";
import { ComboBoxSearch, isComboBoxField } from "../comboxbox-search";
import { Input } from "../ui/input";
import { Textarea } from "../ui/textarea";
import { CustomInput } from "./input-mask";
import { RadioGroupForm } from "./radio-group";
import { SelectForm, isSelectField } from "./select-form";

export function RenderField(
  field: Field,
  formField: ControllerRenderProps<any, string>,
  builder?: Builder,
  setBuilder?: any
) {
  const [isFetching, setIsFetching] = useState(false);

  const { reset, control } = useFormContext();

  if (field.mask)
    return (
      <CustomInput
        control={control}
        registerName={field.name}
        maskName={field.mask}
        type={field.type!}
      />
    );

  if (field.component) {
    const Component = field.component;
    return (
      <Component
        field={field}
        formField={formField}
        builder={builder}
        setBuilder={setBuilder}
      />
    );
  }

  if (isComboBoxField(field))
    return (
      <ComboBoxSearch
        field={field}
        formField={formField}
        serviceSearch={field.serviceSearch}
      />
    );

  if (isSelectField(field)) {
    return (
      <SelectForm
        field={field}
        formField={formField}
        builder={builder}
        setBuilder={setBuilder}
      />
    );
  }

  if (isTextareaField(field)) {
    return (
      <Textarea
        className="min-h-[120px] bg-white dark:bg-slate-800 border-2 border-slate-300 dark:border-slate-600 rounded-lg px-4 py-3 text-base font-medium text-slate-900 dark:text-slate-100 placeholder-slate-500 dark:placeholder-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all duration-200 shadow-sm hover:border-slate-400 dark:hover:border-slate-500 resize-y"
        placeholder={field.placeholder || field.label}
        type={field.type || "text"}
        autoComplete={field?.autoComplete}
        onChange={formField.onChange}
        onBlur={formField.onBlur}
        ref={formField.ref}
        defaultValue={formField.value}
        {...field}
      />
    );
  }

  if (field.type === "radio") {
    return <RadioGroupForm formField={formField} field={field} />;
  }

  if (field.type === "number") {
    field.onWheel = (event) => event.target.blur();
  }

  const { readOnly, onActionBlur, onDebouncedChange, isFullRow, ...restField } = field as InputField;

  const onChangeBase = (e: ChangeEvent<HTMLInputElement>) => {
    if (restField.type === "number") return formField.onChange(+e.target.value);
    
    return formField.onChange(e);
  }

  // Debounce function
  function debounce(func: (...args: any[]) => void, wait: number) {
    let timeout: NodeJS.Timeout;
    return function executedFunction(...args: any[]) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  }

  const debouncedOnChange = onDebouncedChange
    ? debounce((e: ChangeEvent<HTMLInputElement>) => {
        formField.onChange(e);
        onDebouncedChange(e);
      }, 300) // 300ms debounce
    : onChangeBase;

  const onChange = debouncedOnChange;

  return (
    <div className="relative">
      <Input
        readOnly={isFetching || readOnly}
        className="h-12 sm:h-14 bg-white dark:bg-slate-800 border-2 border-slate-300 dark:border-slate-600 rounded-lg px-4 sm:px-5 text-base sm:text-lg font-medium text-slate-900 dark:text-slate-100 placeholder-slate-500 dark:placeholder-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all duration-200 shadow-sm hover:border-slate-400 dark:hover:border-slate-500"
        placeholder={restField.placeholder || restField.label}
        type={restField.type || "text"}
        autoComplete={restField?.autoComplete}
        onChange={onChange}
        ref={formField.ref}
        value={formField.value || ""}
        id={restField.name}
        onBlur={async (e) => {
          if (onActionBlur) {
            try {
              setIsFetching(true);
              await blurActionRegistry.actions[onActionBlur](
                e.target.value,
                reset
              );
            } finally {
              setIsFetching(false);
            }
          }

          return formField.onBlur;
        }}
        {...restField}
        onChangeCapture={async (e) => {
          if (restField.onChangeCapture) {
            try {
              setIsFetching(true);
              await (restField.onChangeCapture(
                e as ChangeEvent<HTMLInputElement>
              ) as unknown as Promise<any>);
            } finally {
              setIsFetching(false);
            }
          }
        }}
      />
      {isFetching && (
        <div className="absolute top-1/2 right-4 transform -translate-y-1/2">
          <div className="p-1 rounded-md bg-blue-100 dark:bg-blue-900/30">
            <Loader size={16} className="animate-spin text-blue-600 dark:text-blue-400" />
          </div>
        </div>
      )}
    </div>
  );
}
