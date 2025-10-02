import { PropsWithChildren } from "react";

export default function StorePickerLayout({ children }: PropsWithChildren) {
  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-blue-50 via-cyan-50 to-slate-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      {children}
    </div>
  );
}
