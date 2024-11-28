export interface ServiceSearch {
  search: (query: string) => Promise<any[]>;
}

export const ServicesSearch: any = {};

export type ServiceSearchType = keyof typeof ServicesSearch;
