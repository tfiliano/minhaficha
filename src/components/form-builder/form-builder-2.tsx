"use client";

import { cn } from "@/lib/utils";
import { zodResolver } from "@hookform/resolvers/zod";
import { Package } from "lucide-react";
import {
  Fragment,
  PropsWithChildren,
  useImperativeHandle,
  useState,
} from "react";
import {
  Controller,
  FieldValues,
  FormProvider,
  UseFormReturn,
  useForm,
} from "react-hook-form";
import {
  Builder,
  Column,
  FooterFormBuilder,
  FormMessageError,
  RenderContainer,
  Row,
} from ".";
import { FormItem } from "../ui/form";
import { Label } from "../ui/label";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "../ui/tooltip";
import { RenderField } from "./render-field";
import { isSelectField } from "./select-form";
import { generateSchema } from "./validators";

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
  form: FieldValues;
  schema?: any;
  preventDefaultSubmit?: boolean;
};

export type FormBuilderRef = UseFormReturn<any, any, undefined>;

export const FormBuilder2: React.ForwardRefRenderFunction<
  FormBuilderRef | undefined,
  FormBuilderProps
> = (props, ref) => {
  const {
    onSubmit,
    submitLabel,
    submitType,
    extraButtons,
    submitClass,
    extraButtonsContainerClass,
    buttonsContainerClass,
    builder: builderState,
    schema,
    form,
    preventDefaultSubmit,
  } = props;

  const [builder, setBuilder] = useState(builderState);

  if (schema) {
    Object.assign(form || {}, {
      resolver: zodResolver(schema),
    });
  } else {
    Object.assign(form || {}, {
      resolver: zodResolver(generateSchema(builder.columns, {})),
    });
  }

  const methods = useForm<any>(form || {});

  useImperativeHandle(ref, () => ({ ...methods }), []);

  if (!builder) return <>Formulário não pode ser carregado sem o Builder</>;

  const renderColumns = (columns: Column[], inline?: boolean) => {
    return columns.map((builderCol, colIndex) => (
      <RenderContainer
        inline={inline}
        className={builderCol.className}
        key={colIndex}
      >
        {builderCol.label && (
          <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
            <div className="p-1.5 sm:p-2 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 shadow-md">
              <Package className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
            </div>
            <h2
              data-inline={inline}
              className={cn(
                "text-lg sm:text-xl font-bold text-slate-900 dark:text-slate-100",
                builder.styled
                  ? "data-[inline=true]:rounded-none"
                  : null
              )}
            >
              {builderCol.label}
            </h2>
          </div>
        )}
        <div
          data-inline={inline}
          className={cn(
            "w-full gap-4 sm:gap-6 flex flex-col",

            builder.styled
              ? cn(
                  "bg-gradient-to-br from-white to-slate-50/30 dark:from-slate-900 dark:to-slate-800/30 rounded-xl data-[inline=true]:rounded-b-none data-[inline=true]:border-b-0 shadow-sm",
                  {
                    "gap-4 sm:gap-6 p-4 sm:p-6 border-0 shadow-lg": !builderCol.columns,
                  }
                )
              : "gap-4 sm:gap-6 p-4 sm:p-6"
          )}
        >
          {builderCol.rows &&
            builderCol.rows
              .filter((row) => row.fields.length)
              .map((row, rowIndex) => (
                <Fragment key={rowIndex}>
                  <RenderRows
                    rowIndex={rowIndex}
                    row={row}
                    methods={methods}
                    builderCol={builderCol}
                    builder={builder}
                    setBuilder={setBuilder}
                  />
                </Fragment>
              ))}
          {builderCol.columns && renderColumns(builderCol.columns, inline)}
        </div>
      </RenderContainer>
    ));
  };

  return (
    <FormProvider {...methods}>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50/30 dark:from-slate-900 dark:to-slate-800 -mx-6 -my-6 px-3 sm:px-6 py-6 sm:py-8">
        <form
          onSubmit={(e) => {
            if (preventDefaultSubmit) return e.preventDefault();
            return methods.handleSubmit(onSubmit)(e);
          }}
          id={`formRef-builder`}
          className="max-w-4xl mx-auto w-full"
        >
        <div
          data-inline={builder.inline || builder.columns.length === 1}
          className="flex data-[inline=true]:flex-col data-[inline=false]:gap-6 flex-col mb-8"
        >
          {renderColumns(builder.columns, builder.inline)}
        </div>
        <FooterFormBuilder
          submitLabel={submitLabel}
          submitType={submitType}
          extraButtons={extraButtons}
          submitClass={submitClass}
          extraButtonsContainerClass={extraButtonsContainerClass}
          buttonsContainerClass={buttonsContainerClass}
          onSubmit={onSubmit}
        />
        </form>
      </div>
    </FormProvider>
  );
};

function FieldSetLegend({
  row,
  rowIndex,
  builderCol,
  children,
}: PropsWithChildren<any>) {
  if (row.fieldSetLegend)
    return (
      <fieldset
        className={cn(
          "mt-4 grid gap-4 border border-gray-200  rounded-md px-4 pb-4 w-full",
          row.className
        )}
        style={{
          gridTemplateColumns: row.fields
            .filter((field: any) => !field.isFullRow)
            .map((field: any) => (field.width ? field.width : "1fr"))
            .join(" "),
        }}
      >
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <legend className="capitalize px-1 mb-2 text-xs">
                {row.fieldSetLegend}
              </legend>
            </TooltipTrigger>
            <TooltipContent>{row.fieldSetLegend}</TooltipContent>
          </Tooltip>
        </TooltipProvider>

        {children}
      </fieldset>
    );

  return (
    <div
      key={rowIndex}
      data-separator={
        !!row.separator && builderCol.rows![rowIndex + 1]?.fields?.length > 0
      }
      className={cn(
        "grid grid-cols-1 sm:grid-cols-2 gap-5 sm:gap-6 data-[separator=true]:border-b data-[separator=true]:border-slate-200 data-[separator=true]:dark:border-slate-700 data-[separator=true]:pb-5 sm:data-[separator=true]:pb-6 data-[separator=true]:mb-5 sm:data-[separator=true]:mb-6",
        row.className
      )}
      style={{
        gridTemplateColumns: row.fields
          .filter((field: any) => !field.isFullRow)
          .map((field: any) => (field.width ? field.width : "1fr"))
          .join(" "),
      }}
    >
      {row.separatorTextHeader && (
        <span
          className={cn("font-bold")}
          style={{
            gridColumn: `span ${
              row.fields.filter((field: any) => field.type !== "hidden").length
            }`,
          }}
        >
          {row.separatorTextHeader}
        </span>
      )}

      {children}

      {row.separatorText && (
        <span
          className={cn("font-bold")}
          style={{
            gridColumn: `span ${
              row.fields.filter((field: any) => field.type !== "hidden").length
            }`,
          }}
        >
          {row.separatorText}
        </span>
      )}
    </div>
  );
}

function RenderRows({ ...props }: any) {
  const { row, methods, builderCol, builder, setBuilder, rowIndex } = props;

  return (
    <FieldSetLegend row={row} rowIndex={rowIndex} builderCol={builderCol}>
      <>
        {(row as Row).fields.map((field) => (
          <Controller
            key={field.name}
            name={field.name}
            control={methods.control}
            render={({ field: formField }) => {
              if (
                !!builderCol.component &&
                field.type !== "select" &&
                field.type !== "combobox"
              )
                field.component = builderCol.component;

              return (
                <FormItem
                  className={cn(
                    {
                      hidden: field.type === "hidden",
                    },
                    "space-y-1.5",
                    field.itemClass
                  )}
                  style={
                    field.isFullRow
                      ? {
                          gridColumn: "1 / -1", // Faz o campo ocupar toda a linha
                        }
                      : undefined
                  }
                >
                  {field.label && field.type !== "hidden" && (
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Label
                            htmlFor={field.name}
                            className="min-h-[24px] sm:min-h-[28px] py-1 sm:py-2 flex items-center font-semibold text-slate-700 dark:text-slate-300 text-xs sm:text-sm"
                          >
                            {field.label}
                            {field.required && (
                              <span className="text-red-500 ml-1 text-base">*</span>
                            )}
                          </Label>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>{field.label}</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  )}
                  {isSelectField(field)
                    ? RenderField(field, formField, builder, setBuilder)
                    : RenderField(field, formField)}
                  <FormMessageError name={field.name} />
                </FormItem>
              );
            }}
          />
        ))}
      </>
    </FieldSetLegend>
  );
}
