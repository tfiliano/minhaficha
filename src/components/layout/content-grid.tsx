import { PropsWithChildren } from "react";

export function ContentGrid({ children }: PropsWithChildren) {
  return (
    <div className="px-4 flex flex-row flex-wrap gap-6 max-w-3xl items-center justify-center mx-auto">
      {children}
    </div>
  );
}
