"use client";

export function isTextareaField(field: Field): field is TextareaField {
  return field.type === "textarea";
}

type OnBlurAction = {
  action: (value: string, resetForm: UseFormReset<FieldValues>) => void;
};

class BlurActionRegistry {
  public actions: { [key: string]: OnBlurAction["action"] } = {};

  register(handle: OnBlurAction["action"]) {
    this.actions[handle.name] = handle;
  }

  getAction(name: string): OnBlurAction["action"] | undefined {
    return this.actions[name];
  }

  execute(name: string, value: string, resetForm: UseFormReset<FieldValues>) {
    const action = this.getAction(name);
    if (action) {
      action(value, resetForm);
    }
  }
}

export const blurActionRegistry = new BlurActionRegistry();

export type Option = {
  value: string | number | null;
  label: string;
};

import {
  PostgrestFilterBuilder,
  PostgrestQueryBuilder,
} from "@supabase/postgrest-js";

type PostgresQueryBuilder = any;

type PostgrestFilterBuilderClass = any;

type MethodNames<T> = {
  [K in keyof T]: T[K] extends (...args: any[]) => any ? K : never;
}[keyof T];

export type SearchOptions = {
  querySelect?: string;
  conditions?: Partial<
    Record<MethodNames<PostgrestFilterBuilderClass>, string | any[]>
  >;
};

import { cn } from "@/lib/utils";
import { PublicSchema } from "@/types/database.types";
import { get } from "lodash";
import { Loader2 } from "lucide-react";
import React, { FocusEvent, forwardRef, type JSX } from "react";
import {
  FieldValues,
  UseFormReset,
  UseFormReturn,
  useFormContext,
} from "react-hook-form";
import { Button } from "../ui/button";
import { FieldMask } from "./@masks";
import { AddOptionComponentType } from "./add-option-component-list";
import { FormBuilder2 as FormBuilderV2 } from "./form-builder-2";
import { ServiceLoadOptionsType } from "./services-loadOptions";
import { ServiceSearchType } from "./services-search";

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

type BaseField = {
  name: string;
  label?: string;
  placeholder?: string;
  autoComplete?: React.HTMLInputAutoCompleteAttribute;
  readOnly?: boolean;
  component?: (...props: any) => JSX.Element;
  itemClass?: string;
  onWheel?: (event: any) => void;
  onChange?: (event: any) => void;
  required?: boolean;
  onChangeFieldsForm?: boolean;
  onBlur?: (
    event: FocusEvent<HTMLInputElement, Element> | FocusEvent<Element, Element>
  ) => void;
  onActionBlur?: keyof typeof blurActionRegistry.actions;
  width?: string;
  isFullRow?: boolean;
  mask?: FieldMask;
};

export interface InputField extends BaseField {
  type?: React.HTMLInputTypeAttribute;
  step?: string | number;
  onChangeCapture?: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onDebouncedChange?: (event: React.ChangeEvent<HTMLInputElement>) => void; // New property
}

export interface TextareaField extends BaseField {
  type?: React.HTMLInputTypeAttribute;
  onChangeCapture?: (event: React.ChangeEvent<HTMLTextAreaElement>) => void;
  onBlur?: (
    event: FocusEvent<HTMLInputElement, Element> | FocusEvent<Element, Element>
  ) => void;
}

export interface ComboBoxField extends BaseField {
  type: "combobox";
  placeholderInputSearch?: string;
  options: Option[];
  loadOptions?: ServiceLoadOptionsType;
  loadOptionsData?: any[] | (() => any[]);
  serviceSearch: ServiceSearchType;
  searchOptions?: SearchOptions;
  actionOnChange?: (data: { value: string; label: string }) => void;
  useProp: "label" | "value";
  addOption?: {
    component: AddOptionComponentType;
    classNamesContent?: string;
  };
  map: (item?: any) => { value: any; label: any };
  addNew?: boolean;
}

export interface RadioField extends BaseField {
  type: "radio";
  orientation?: "horizontal" | "vertical";
  options: { value: any; label: any }[];
}

export interface SelectField extends BaseField {
  type: "select";
  options: { value: string | number | boolean | null; label: string }[];
  valueAs?: "number" | "string" | "boolean";
  copy?: {
    onEvent: "onchange" | "click";
    columnId: string;
    changePropName: string;
    ignores: string[];
    rows?: Row[];
  };
}

export type Field =
  | InputField
  | ComboBoxField
  | SelectField
  | TextareaField
  | RadioField;

export type Row = {
  fields: Field[];
  separator?: boolean;
  separatorText?: string;
  separatorTextHeader?: string;
  fieldSetLegend?: string;
  className?: string;
};

export type Builder = {
  columns: Column[];
  styled?: boolean;
  inline?: boolean;
};

type BaseColumn = {
  label?: string;
  id?: string;
  separator?: boolean;
  className?: string;
  component?: (...props: any) => JSX.Element;
};

type ColumnWithRows = BaseColumn & {
  rows: Row[];
  columns?: Column[];
};

type ColumnWithNestedColumns = BaseColumn & {
  columns: Column[];
  rows?: Row[];
};

export type Column = ColumnWithRows | ColumnWithNestedColumns;

type FormBuilderProps = {
  builder: Builder;
  onSubmit: (data: any) => void;
  submitLabel?: string;
  submitType?: React.ButtonHTMLAttributes<HTMLButtonElement>["type"];
  submitClass?: string;
  extraButtons?: React.ReactNode;
  extraButtonsContainerClass?: string;
  buttonsContainerClass?: string;
  columns?: number;
  form: UseFormReturn<any>;
};

export function RenderContainer({
  inline,
  className,
  children,
}: {
  inline?: boolean;
  className?: string;
  children: React.ReactNode;
}) {
  if (!inline) return <div className={cn("w-full", className)}>{children}</div>;
  return <>{children}</>;
}

export type CopyAndAddRowParams = {
  builder: Builder;
  columnId: string;
  changePropName: string;
  ignores?: string[];
  qty?: number;
  max?: number;
  rows?: Row[];
};

export function copyAndAddRow({
  builder,
  columnId,
  changePropName,
  ignores,
  qty,
  rows,
}: CopyAndAddRowParams): Builder {
  const copyAndAddRowRecursive = (
    columns: Column[],
    columnId: string,
    changePropName: string,
    ignores: string[] | undefined,
    qty: number | undefined
  ): Column[] => {
    console.log("columns", columns)
    return columns.map((column) => {
      console.log("each column", column)
      if (column.id === columnId) {
        console.log("column ", column)
        let quantity = qty || 0;
        if (isNaN(quantity)) quantity = 1;

        const fieldsIgnoreds = column.rows
          ?.flatMap((row) =>
            row.fields.filter((field) =>
              ignores?.includes(field.name as string)
            )
          )
          .filter((x) => !!x);

        const newName = (field: Field, quantity: number) =>
          field.name.includes(".")
            ? `${propName}.${field.name.split(".").splice(1).join(".")}`
            : field.name;

        if (quantity === 0) {
          return {
            ...column,
            rows: [{ fields: [...(fieldsIgnoreds || [])] }],
          };
        }

        const propName = changePropName.replace("$1", `${quantity}`);

        if (quantity === 1) {
          return {
            ...column,
            rows: [
              { fields: [...(fieldsIgnoreds || [])] },
              ...(rows ||
                column.rows!.filter((row) =>
                  row.fields.find((field) =>
                    (field.name as string).match(propName)
                  )
                )),
            ].filter((row) => row.fields.length > 0),
          };
        }

        if (quantity > 1) {
          return {
            ...column,
            rows: [
              ...(column.rows || []),
              ...column.rows!.map((row) => {
                return {
                  ...row,
                  fields: [
                    ...row.fields
                      .filter(
                        (field) =>
                          !ignores?.includes(field.name as string) &&
                          (field.name as string).includes(
                            `${changePropName.replace("$1", `${quantity - 1}`)}`
                          )
                      )
                      .map((field) => ({
                        ...field,
                        label: field.label + " " + quantity,
                        name: newName(field, quantity),
                      })),
                  ],
                };
              }),
            ],
          };
        }
      } else if (column.columns) {
        return {
          ...column,
          columns: copyAndAddRowRecursive(
            column.columns,
            columnId,
            changePropName,
            ignores,
            qty
          ),
        };
      }

      return column;
    });
  };

  return {
    ...builder,
    columns: copyAndAddRowRecursive(
      builder.columns,
      columnId,
      changePropName,
      ignores,
      qty
    ),
  };
}

export function FooterFormBuilder({
  submitLabel,
  submitType,
  extraButtons,
  submitClass,
  extraButtonsContainerClass,
  buttonsContainerClass,
  onSubmit,
}: Pick<
  FormBuilderProps,
  | "submitLabel"
  | "extraButtons"
  | "submitClass"
  | "extraButtonsContainerClass"
  | "submitType"
  | "onSubmit"
  | "buttonsContainerClass"
>) {
  const { formState, handleSubmit } = useFormContext();

  if (submitLabel)
    return (
      <div className="bg-white dark:bg-slate-900 rounded-xl p-4 sm:p-6 shadow-lg border border-slate-200 dark:border-slate-700 mt-6 sm:mt-8">
        <div className="flex flex-col gap-3 sm:gap-4">
          <div className={cn("flex", buttonsContainerClass)}>
            <Button
              type={submitType || "submit"}
              className={cn(
                "flex-1 h-12 sm:h-14 text-base sm:text-lg font-semibold bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105",
                submitClass
              )}
              disabled={!!formState.isSubmitting || !formState.isValid}
              {...(submitType === "button"
                ? { onClick: handleSubmit(onSubmit) }
                : {})}
            >
              {!!formState.isSubmitting && (
                <Loader2 className="mr-2 sm:mr-3 h-4 w-4 sm:h-5 sm:w-5 animate-spin" />
              )}
              {!!formState.isSubmitting ? "Salvando..." : submitLabel}
            </Button>
          </div>

          {extraButtons && !formState.isSubmitting && (
            <div className={cn("flex justify-center", extraButtonsContainerClass)}>
              {extraButtons}
            </div>
          )}
        </div>
      </div>
    );
}

export function FormMessageError({ name }: { name: string }) {
  const {
    formState: { errors },
  } = useFormContext();

  const isError = get(errors, `${name}`);

  if (!isError || !isError.message) return <></>;

  return (
    <p id={name} className={cn("text-sm font-medium text-destructive")}>
      {isError.message.toString()}
    </p>
  );
}

export { type FormBuilderRef } from "./form-builder-2";

export const FormBuilder2 = forwardRef(FormBuilderV2);

// Example usage in a component
function InputComponent({ field }: { field: InputField }) {
  const debouncedOnChange = field.onDebouncedChange
    ? debounce(field.onDebouncedChange, 300) // 300ms debounce
    : undefined;

  return (
    <input
      type={field.type}
      step={field.step}
      onChangeCapture={field.onChangeCapture}
      onChange={debouncedOnChange}
      // ...other props
    />
  );
}
