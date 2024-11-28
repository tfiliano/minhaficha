"use client";

import { cn } from "@/lib/utils";
import { Check, Loader, Plus } from "lucide-react";
import { Dispatch, SetStateAction, useState } from "react";
import { ControllerRenderProps } from "react-hook-form";
import { ComboBoxField, Option } from "../form-builder";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "../ui/command";

import { useDebouncedCallback } from "use-debounce";
import {
  ServiceSearchType,
  ServicesSearch,
} from "../form-builder/services-search";
import { Button } from "../ui/button";

type SearchProps = {
  options: Option[];
  setOptions: Dispatch<SetStateAction<Option[]>>;
  field: ComboBoxField;
  formField: ControllerRenderProps<any, string>;
  onOpenPopover: (open: boolean) => void;
  serviceSearch: ServiceSearchType;
  onSelect: (option: Option) => void;
  handleAddOption: () => void;
  map: (data?: any) => { value: any; label: string };
};

export function Search({
  field,
  options,
  setOptions,
  formField,
  serviceSearch,
  onSelect,
  handleAddOption,
  map,
}: SearchProps) {
  const [query, setQuery] = useState<null | string>(null);
  const [isLoading, setLoading] = useState(false);
  const debouncedSearchQuery = useDebouncedCallback(async (query) => {
    if (!query) {
      setOptions(options);
      setQuery("");
      return;
    } else {
      try {
        setLoading(true);
        const response = await ServicesSearch[serviceSearch].search(
          query as string,
          field.searchOptions
        );
        const defaultMap = (item: any) => ({
          value: item.id,
          label: item.name || item.code || item.prefix || item.description,
        });

        const results = response.map(map || defaultMap);
        setOptions(results);
        setQuery(query as string);
      } catch (error) {
        console.log({ error });
      } finally {
        setLoading(false);
      }
    }
  }, 300);

  return (
    <Command shouldFilter={false}>
      <CommandInput
        placeholder={`Digite: ${
          field.placeholderInputSearch || field.placeholder || field.label
        }`}
        onValueChange={async (e: string) => {
          debouncedSearchQuery(e);
        }}
      />
      {query && !isLoading && <CommandEmpty>Sem opções.</CommandEmpty>}
      {isLoading && (
        <div className="text-center p-4 text-sm text-gray-500 flex justify-center items-center gap-2">
          <Loader size={14} className="animate-spin" />
          Buscando...
        </div>
      )}
      <SearchResult
        onSelect={onSelect}
        field={field}
        formField={formField}
        setOptions={setOptions}
        options={options}
        handleAddOption={handleAddOption}
      />
    </Command>
  );
}

export const Selected = ({ field, formField, item }: any) => {
  let itemIsSelected = false;

  if (field.useProp === "label") {
    itemIsSelected = formField.value === (item?.label || item);
  } else {
    itemIsSelected = (formField.value || formField.value?.value) === item.value;
  }

  return (
    <>
      <Check
        className={cn(
          "mr-2 h-4 w-4",
          itemIsSelected ? "opacity-100" : "opacity-0"
        )}
      />
      {item?.label === undefined ? String(item) : item.label}
    </>
  );
};

function SearchResult({
  formField,
  options,
  field,
  handleAddOption,
  onSelect,
}: {
  query?: string;
  field: ComboBoxField;
  formField: ControllerRenderProps<any, string>;
  options: Option[];
  setOptions: Dispatch<SetStateAction<Option[]>>;
  onSelect: (option: Option) => void;
  handleAddOption: () => void;
}) {
  return (
    <CommandGroup>
      <CommandList>
        {options.map((item: any, index) => (
          <CommandItem
            value={item}
            key={index}
            onSelect={() => onSelect(item)}
            onBlur={formField.onBlur}
          >
            <Selected item={item} formField={formField} field={field} />
          </CommandItem>
        ))}
        {field.addOption && (
          <Button
            size="sm"
            variant="ghost"
            onClick={handleAddOption}
            className="mt-1 w-full justify-start"
          >
            <Plus className={cn("mr-2 h-4 w-4")} />
            Adicionar
          </Button>
        )}
      </CommandList>
    </CommandGroup>
  );
}
