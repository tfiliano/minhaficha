import NProgress from "nprogress";

import { useRouter as useBaseRouter, useSearchParams } from "next/navigation";
export { useSearchParams };
export function useRouter() {
  const router = useBaseRouter();
  const { push, back, replace } = router;

  router.push = async (...args: Parameters<typeof push>) => {
    NProgress.start();
    push(...args);
  };

  router.back = async (...args: Parameters<typeof back>) => {
    NProgress.start();
    back(...args);
  };

  router.replace = async (...args: Parameters<typeof replace>) => {
    NProgress.start();
    replace(...args);
  };

  return router;
}
