"use client";

import { cn } from "@/lib/utils";
import { zodResolver } from "@hookform/resolvers/zod";
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
  hideExtraButtonsSubmiting?: boolean;
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
    hideExtraButtonsSubmiting,
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
          <h2
            data-inline={inline}
            className={cn(
              "text-lg font-semibold p-2",
              builder.styled
                ? "bg-gray-100 rounded-t-md border-t border-l border-r data-[inline=true]:rounded-none"
                : null
            )}
          >
            {builderCol.label}
          </h2>
        )}
        <div
          data-inline={inline}
          className={cn(
            "w-full gap-2 flex flex-col",

            builder.styled
              ? cn(
                  "bg-gray-50/50 rounded-b-md data-[inline=true]:rounded-b-none data-[inline=true]:border-b-0",
                  {
                    "gap-1 p-4 border": !builderCol.columns,
                  }
                )
              : null
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
      <form
        onSubmit={(e) => {
          if (preventDefaultSubmit) return e.preventDefault();
          return methods.handleSubmit(onSubmit)(e);
        }}
        id={`formRef-builder`}
        className="mt-4"
      >
        <div
          data-inline={builder.inline || builder.columns.length === 1}
          className="flex data-[inline=true]:flex-col data-[inline=false]:gap-4 flex-col sm:flex-row  mb-4"
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
          hideExtraButtonsSubmiting={hideExtraButtonsSubmiting}
        />
      </form>
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
        "grid gap-4  data-[separator=true]:border-b",
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
                            className="block py-1 truncate w-auto"
                          >
                            {field.label}
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
