import { PropsWithChildren } from "react";

export function Title({ children }: PropsWithChildren) {
  return <h1 className="text-center py-2 my-4 text-gray-500 ">{children}</h1>;
}
