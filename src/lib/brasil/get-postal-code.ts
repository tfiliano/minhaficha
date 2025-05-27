import { FormBuilderRef } from "@/components/form-builder";
import { MutableRefObject } from "react";
import { retrivePostalCode } from "./postalcode";

export const getPostalCode =
  (formRef?: MutableRefObject<FormBuilderRef | undefined>) =>
  async (event: React.ChangeEvent<HTMLInputElement>) => {
    const postalCodeData = await retrivePostalCode(event)!;
    if (postalCodeData) {
      console.log(formRef);
      formRef?.current?.reset({
        ...formRef?.current?.getValues(),
        address: {
          ...postalCodeData,
        },
      });
    }
  };
