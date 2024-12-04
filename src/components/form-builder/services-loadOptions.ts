export const ServiceLoadOptions = {
  loadParams(data?: any) {
    if (data) {
      if (typeof data === "function") {
        return data();
      }
      return data;
    } else {
      console.log("Params LoadParams in comboxo is empty");
    }

    return [];
  },
};

export type ServiceLoadOptionsType = keyof typeof ServiceLoadOptions;
