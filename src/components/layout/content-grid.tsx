import { PropsWithChildren } from "react";

export function ContentGrid({ children }: PropsWithChildren) {
  return (
    <div className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
        {children}
      </div>
    </div>
  );
}
