import { PropsWithChildren } from "react";

export default function AcctounLayout({ children }: PropsWithChildren) {
  return (
    <div className="h-[calc(100vh-80px)] w-full mx-auto flex flex-col items-center justify-center ">
      <div className="w-full sm:max-w-xs">{children}</div>
    </div>
  );
}
