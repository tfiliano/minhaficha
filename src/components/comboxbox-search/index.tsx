"use client";

import { cn } from "@/lib/utils";
import { ChevronsUpDown } from "lucide-react";
import { ControllerRenderProps } from "react-hook-form";
import { ComboBoxField, Field, Option } from "../form-builder";
import { Button } from "../ui/button";

import { useEffect, useState } from "react";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { Search, Selected } from "./search";

import { ServiceLoadOptions } from "../form-builder/services-loadOptions";
import { ServiceSearchType } from "../form-builder/services-search";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "../ui/command";

export function isComboBoxField(field: Field): field is ComboBoxField {
  return field.type === "combobox";
}

type ComboboxProps = {
  field: ComboBoxField;
  formField: ControllerRenderProps<any, string>;
  serviceSearch?: ServiceSearchType;
};

function formaterOptions(
  field: ComboBoxField,
  formField: ControllerRenderProps<any, string>
) {
  if (field.useProp === "label") {
    return Array.from(
      new Set([...field.options.map((item) => item.label), formField.value])
    )
      .filter((item) => item)
      .map((item) => ({ value: item, label: item }));
  }

  return (
    Array.from(new Set([...field?.options, formField.value])).filter(
      (item) => item
    ) || []
  );
}

export function ComboBoxSearch({
  field,
  formField,
  serviceSearch,
}: ComboboxProps) {
  const [loading, setLoading] = useState(false);
  const [openPopover, setOpenPopover] = useState(false);
  const [options, setOptions] = useState<Option[]>(
    formaterOptions(field, formField)
  );

  useEffect(() => {
    (async () => {
      if (openPopover && field.loadOptions) {
        setLoading(true);
        try {
          const optionsLoaded = await ServiceLoadOptions[field.loadOptions](
            field?.loadOptionsData
          );
          const options = formaterOptions(
            { ...field, options: optionsLoaded || [] },
            formField
          );
          setOptions(options);
        } catch (error) {
        } finally {
          setLoading(false);
        }
      }
    })();
  }, [openPopover]);

  const [inputValueSearch, setInputValueSearch] = useState<string | null>(null);

  const onSelect = (item: any) => {
    const find = (option: Option) => {
      return option[field.useProp] === item[field.useProp];
    };

    const alreadyExists = field.options.find(find);
    if (!alreadyExists) {
      field.options.push(item);
    }

    formField.onChange(item[field.useProp]);

    if (field.actionOnChange) {
      field.actionOnChange(item);
    }

    setOpenPopover(false);
  };

  const handleAddOption = () => {
    setOpenPopover(false);
  };

  const handleAddOptionStatic = () => {
    onSelect({ value: inputValueSearch, label: inputValueSearch });
    setOptions([
      ...options,
      { value: inputValueSearch!, label: inputValueSearch! },
    ]);
  };

  if (loading) return <>Carregando...</>;

  if (isComboBoxField(field)) {
    if (field.addNew === undefined) field.addNew = true;
    if (!field.useProp) field.useProp = "value";

    const label = () => {
      if (field.useProp === "label") return formField.value || "Selecione ...";

      const formValue = field.options.find(
        (option) => option.value === (formField.value?.value || formField.value)
      );
      if (formValue) return formValue.label;

      return formField.value?.label || "Selecione ...";
    };

    return (
      <>
        <Popover open={openPopover} onOpenChange={setOpenPopover}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              role="combobox"
              className={cn(
                "w-full justify-between",
                !formField.value && "text-muted-foreground"
              )}
            >
              <span className="truncate"> {label()}</span>

              <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="PopoverContent">
            {serviceSearch ? (
              <Search
                onSelect={onSelect}
                onOpenPopover={setOpenPopover}
                field={field}
                formField={formField}
                serviceSearch={serviceSearch}
                options={options}
                setOptions={setOptions}
                handleAddOption={handleAddOption}
                map={field.map}
              />
            ) : (
              <Command>
                <CommandInput
                  //@ts-ignore
                  onChangeCapture={(e) => setInputValueSearch(e.target.value)}
                  placeholder="Buscar..."
                />
                {field.addNew && inputValueSearch ? (
                  <CommandEmpty asChild>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={handleAddOptionStatic}
                      className="mt-1 w-full justify-start"
                    >
                      Adicionar {inputValueSearch}
                    </Button>
                  </CommandEmpty>
                ) : (
                  <CommandEmpty>Sem opções.</CommandEmpty>
                )}
                <CommandGroup>
                  <CommandList>
                    {options.map((item: any, index) => (
                      <CommandItem
                        value={item}
                        key={index}
                        onSelect={() => onSelect(item)}
                        onBlur={formField.onBlur}
                      >
                        <Selected
                          item={item}
                          formField={formField}
                          field={field}
                        />
                      </CommandItem>
                    ))}
                  </CommandList>
                </CommandGroup>
              </Command>
            )}
          </PopoverContent>
        </Popover>
      </>
    );
  }
}
