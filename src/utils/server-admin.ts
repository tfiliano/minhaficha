"use server";
import { cookies } from "next/headers";

import { Database } from "@/types/database.types";
import { createServerClient } from "@supabase/ssr";

export async function createSupabaseServerAdmin() {
  const cookiesServe = await cookies();

  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhuaGhvcWpteWRtZGprdnFtaWRmIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTcyMTg0MTk0NSwiZXhwIjoyMDM3NDE3OTQ1fQ.1Y34z8ae3x_wLJfeZn6A--wHgRwsv8Wh2X9iuXXMRhc",
    {
      cookies: {
        getAll() {
          return cookiesServe.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookiesServe.set(name, value)
          );

          cookiesToSet.forEach(({ name, value, options }) =>
            cookiesServe.set(name, value, options)
          );
        },
      },
    }
  );
}
