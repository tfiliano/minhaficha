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

export function sanitizeZPL(text?: string) {
  if (!text) return null;
  return text
    .normalize("NFD") // Separa letras de acentos
    .replace(/[\u0300-\u036f]/g, "") // Remove acentos
    .replace(/[^a-zA-Z0-9\s.,;:\/\-_=+!?]/g, "") // Remove caracteres fora do padrão
    .replace(/\s+/g, "  ") // Normaliza espaços múltiplos
    .trim();
}
