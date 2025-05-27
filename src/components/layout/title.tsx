import { cn } from "@/lib/utils";
import { PropsWithChildren } from "react";

export function Title({
  children,
  classNames,
}: PropsWithChildren<{ classNames?: string }>) {
  return (
    <h1 className={cn("text-center py-2 my-4 text-gray-500 ", classNames)}>
      {children}
    </h1>
  );
}
