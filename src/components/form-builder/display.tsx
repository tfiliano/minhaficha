import { format } from "date-fns";
import { get } from "lodash";
import { Label } from "../ui/label";

interface Field {
  name: string;
  label: string;
  placeholder?: string | null;
  type?: string;
  autoComplete?: string;
  value?: string | number;
}

interface Row {
  fields: Field[];
}

interface FormDisplayProps {
  rows: Row[];
  data?: any;
}

function renderValue(field: Field, value: any) {
  if (!value) return "N/A";

  if (field.name == "tsn" || field.name === "tso") return value?.toFixed(1);

  if (field.type === "date") {
    return format(new Date(value), "dd/MM/yyyy");
  }

  if (field.type === "datetime-local") {
    return format(new Date(value), "dd/MM/yyyy HH:mm");
  }

  return value;
}

export function FormDisplay({ rows, data }: FormDisplayProps) {
  return (
    <div className="flex flex-col gap-4 mt-4">
      {rows.map((row, rowIndex) => (
        <div
          key={rowIndex}
          className="grid gap-4"
          style={{
            gridTemplateColumns: `repeat(${row.fields.length}, minmax(0, 1fr))`,
          }}
        >
          {row.fields.map((field) => (
            <div key={field.name} className="space-y-1">
              <Label>{field.label}</Label>
              <div className=" text-gray-500 h-fit px-0 py-0 border-none rounded-none truncate hover:overflow-visible hover:text-wrap	transition-all">
                {renderValue(
                  field,
                  get(data, field.name) || field.value?.toString()
                )}
              </div>
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}
