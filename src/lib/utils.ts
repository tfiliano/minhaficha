import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const removeDuplicatesInArrayObj = <T>(arr: T[], key: keyof T): T[] =>
  Array.from(
    new Map<string, T>(
      arr.map((item) => [
        String(item[key]).trim().toLowerCase(),
        { ...item, [key]: String(item[key]).trim() },
      ])
    ).values()
  ) as T[];
