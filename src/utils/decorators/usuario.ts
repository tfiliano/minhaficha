import { UsuarioTypes } from "@/models/Usuario";

export function UsuarioClass<T extends { new (...args: any[]): any }>(
  constructor: T
) {
  return class extends constructor {
    constructor(...args: any[]) {
      super(...args);
      if (this.type) {
        const labels: Record<string, string> = UsuarioTypes;
        this.type = labels[this.type] || this.type;
      }
    }
  };
}
