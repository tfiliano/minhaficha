import { Header } from "@/components/layout";
import { Footer } from "@/components/layout/footer";
import { PropsWithChildren } from "react";

export default function MasterDashboardLayout({ children }: PropsWithChildren) {
  return (
    <>
      <Header />
      <main className="flex-grow container mx-auto p-4 md:ml-64">{children}</main>
      <Footer />
    </>
  );
}
