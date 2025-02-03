import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { HTMLAttributes, PropsWithChildren } from "react";

export function GridItems({
  children,
  classNames,
}: PropsWithChildren<{ classNames?: string }>) {
  return (
    <div
      className={cn(
        "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3  gap-6 w-full",
        classNames
      )}
    >
      {children}
    </div>
  );
}

type GridItemProps = {
  title: string;
} & HTMLAttributes<HTMLDivElement>;

export function GridItem({
  title,
  children,
  ...props
}: PropsWithChildren<GridItemProps>) {
  return (
    <Card className="w-full hover:border-primary cursor-pointer" {...props}>
      <CardHeader>{title}</CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  );
}
