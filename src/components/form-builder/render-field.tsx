import { ControllerRenderProps, useFormContext } from "react-hook-form";
import { Builder, Field, InputField, isTextareaField, onBlurActions } from ".";

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

  const { readOnly, onActionBlur, ...restField } = field as InputField;

  return (
    <div className="relative">
      <Input
        readOnly={isFetching || readOnly}
        className="appearance-none"
        placeholder={restField.placeholder || restField.label}
        type={restField.type || "text"}
        autoComplete={restField?.autoComplete}
        onChange={(e) => {
          if (restField.type === "number") {
            return formField.onChange(+e.target.value);
          }
          return formField.onChange(e);
        }}
        ref={formField.ref}
        value={formField.value || ""}
        id={restField.name}
        onBlur={async (e) => {
          if (onActionBlur) {
            try {
              setIsFetching(true);
              await onBlurActions[onActionBlur](e.target.value, reset);
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
        <div className="absolute top-3 right-3">
          <Loader size={16} className="animate-spin text-primary" />
        </div>
      )}
    </div>
  );
}
