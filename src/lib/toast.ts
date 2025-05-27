import { Dispatch, SetStateAction } from "react";
import { toast } from "sonner";

export type GenerateToastProps<T, K> = {
  action: (data: K) => Promise<(T & { error?: any }) | undefined | void>;
  loadingMessage?: string;
  actionData?: K;
  successMessage?: string;
  errorMessage?: string;
  auxLoadingState?: Dispatch<SetStateAction<boolean>>;
  useToast?: boolean;
};

export async function generateToastPromise<T, K>({
  loadingMessage,
  action,
  actionData,
  successMessage,
  errorMessage,
  auxLoadingState,
  useToast = true,
}: GenerateToastProps<T, K>): Promise<any> {
  return new Promise(async (resolve, reject) => {
    if (auxLoadingState) {
      auxLoadingState(true);
    }
    let toastId: number | string | null;
    if (useToast) {
      toastId = toast.loading(loadingMessage || "Processando...", {
        closeButton: false,
      });
    }
    const response = await action(actionData!);
    if (auxLoadingState) {
      auxLoadingState(false);
    }
    if (response?.error) {
      if (useToast) {
        toast.error(
          errorMessage ||
            response.error?.message ||
            JSON.stringify(response.error, null, 2),
          {
            id: toastId!,
          }
        );
      }
      return reject(response.error);
    }

    if (useToast) {
      toast.success(successMessage || "Sucesso!", { id: toastId! });
    }
    return resolve(response);
  });
}
