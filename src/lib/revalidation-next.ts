"use server";

import { revalidatePath } from "next/cache";

export async function executeRevalidationPath(
  path: string,
  type: "page" | "layout" = "page"
) {
  revalidatePath(path, type);
}
