import { useState } from "react";

export function useFilters<T extends Record<string, any>>(initialFilters: T) {
  const [filters, setFilters] = useState(initialFilters);

  const updateFilter = (key: keyof T, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const clearFilters = () => {
    setFilters(initialFilters);
  };

  const activeFiltersCount = Object.entries(filters)
    .filter(([key, value]) => value !== initialFilters[key as keyof T])
    .length;

  return { filters, updateFilter, clearFilters, activeFiltersCount };
}
