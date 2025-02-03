import { VERSION_APP } from "@/utils/consts";

export function Footer() {
  return (
    <div className="p-4 text-xs text-primary/50 border-t border-border fixed w-full bottom-0 z-10 text-right bg-background/70 backdrop-blur">
      Admin - {VERSION_APP}
    </div>
  );
}
