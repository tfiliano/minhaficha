import { Suspense } from "react";
import { PageClient } from "./suspense";

export default function Page() {
  return (
    <Suspense>
      <PageClient />
    </Suspense>
  );
}
