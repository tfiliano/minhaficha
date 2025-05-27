import { Header } from "@/components/layout";
import { PropsWithChildren } from "react";

export default function LayoutApp({ children }: PropsWithChildren) {
  return (
    <>
      <Header />
      <main className=" h-[calc(100%-80px)]">{children}</main>
    </>
  );
}
