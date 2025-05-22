import { FormBuilderRef } from "@/components/form-builder";
import { MutableRefObject } from "react";
import { retriveCompanyDocument } from "./document-company";

export const getDocumentCompany =
  (formRef?: MutableRefObject<FormBuilderRef | undefined>) =>
  async (event: React.ChangeEvent<HTMLInputElement>) => {
    const documentCompany = await retriveCompanyDocument(event)!;
    console.log(documentCompany);
    if (documentCompany) {
      formRef?.current?.reset({
        ...formRef?.current?.getValues(),
        ...documentCompany,
      });
    }
  };
