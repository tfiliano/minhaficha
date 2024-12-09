"use client";

import { createBrowserClient } from "@/utils/supabase-client";
import { FocusEvent } from "react";
import { toast } from "sonner";

export async function getUserByEmail(
  event: FocusEvent<HTMLInputElement, Element> | FocusEvent<Element, Element>,
  setUserExists: any,
  formRef: any
) {
  const { value, validity } = event.target as EventTarget & HTMLInputElement;
  if (validity.valid) {
    const supabase = createBrowserClient();

    const { data: user } = await supabase
      .from("usuarios")
      .select("*")
      .eq("email", value.trim())
      .maybeSingle();

    if (user) {
      setUserExists(!!user);
      formRef.current!.resetField("name", { defaultValue: user.name });
      formRef.current!.setValue("password", "***************");
      formRef.current!.setValue("re_password", "***************");
      toast.success("Usuario encontrado.");
    } else {
      setUserExists(!!user);
      formRef.current!.resetField("password");
      formRef.current!.resetField("re_password");
    }
  }
}
