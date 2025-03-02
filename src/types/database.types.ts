export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

// Helper type to maintain backward compatibility with existing code
export type Tables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Row'];

export interface Database {
  public: {
    Tables: {
      loja_usuarios: {
        Row: {
          id: string;
          loja_id: string;
          usuario_id: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          loja_id: string;
          usuario_id: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          loja_id?: string;
          usuario_id?: string;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "loja_usuarios_loja_id_fkey";
            columns: ["loja_id"];
            isOneToOne: false;
            referencedRelation: "lojas";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "loja_usuarios_usuario_id_fkey";
            columns: ["usuario_id"];
            isOneToOne: false;
            referencedRelation: "usuarios";
            referencedColumns: ["id"];
          }
        ];
      };
      usuarios: {
        Row: {
          id: string;
          nome: string;
          email: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          nome: string;
          email: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          nome?: string;
          email?: string;
          created_at?: string;
        };
        Relationships: [];
      };
      usuarios_masters: {
        Row: {
          id: string;
          usuario_id: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          usuario_id: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          usuario_id?: string;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "usuarios_masters_usuario_id_fkey";
            columns: ["usuario_id"];
            isOneToOne: false;
            referencedRelation: "usuarios";
            referencedColumns: ["id"];
          }
        ];
      };
      lojas: {
        Row: {
          id: string;
          nome: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          nome: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          nome?: string;
          created_at?: string;
        };
        Relationships: [];
      };
      impressoras: {
        Row: {
          id: string;
          created_at: string;
          nome: string;
          ip: string;
          port: number;
          status: 'online' | 'offline';
          loja_id: string | null;
        };
        Insert: {
          id?: string;
          created_at?: string;
          nome: string;
          ip: string;
          port?: number;
          status?: 'online' | 'offline';
          loja_id?: string | null;
        };
        Update: {
          id?: string;
          created_at?: string;
          nome?: string;
          ip?: string;
          port?: number;
          status?: 'online' | 'offline';
          loja_id?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "impressoras_loja_id_fkey";
            columns: ["loja_id"];
            isOneToOne: false;
            referencedRelation: "lojas";
            referencedColumns: ["id"];
          }
        ];
      };
      templates_etiquetas: {
        Row: {
          id: string;
          created_at: string;
          nome: string;
          zpl: string;
          campos: Json;
          loja_id: string | null;
        };
        Insert: {
          id?: string;
          created_at?: string;
          nome: string;
          zpl: string;
          campos: Json;
          loja_id?: string | null;
        };
        Update: {
          id?: string;
          created_at?: string;
          nome?: string;
          zpl?: string;
          campos?: Json;
          loja_id?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "templates_etiquetas_loja_id_fkey";
            columns: ["loja_id"];
            isOneToOne: false;
            referencedRelation: "lojas";
            referencedColumns: ["id"];
          }
        ];
      };
      etiquetas: {
        Row: {
          armazenamento_id: string | null;
          command: string | null;
          created_at: string;
          fornecedor_id: string | null;
          grupo_id: string | null;
          id: string;
          impressora_id: string | null;
          loja_id: string | null;
          lote: string | null;
          operador_id: string | null;
          produto_id: string | null;
          quantidade: number | null;
          SIF: string | null;
          validade: string | null;
          status: string | null;
          test_print: boolean | null;
        };
        Insert: {
          armazenamento_id?: string | null;
          command?: string | null;
          created_at?: string;
          fornecedor_id?: string | null;
          grupo_id?: string | null;
          id?: string;
          impressora_id?: string | null;
          loja_id?: string | null;
          lote?: string | null;
          operador_id?: string | null;
          produto_id?: string | null;
          quantidade?: number | null;
          SIF?: string | null;
          validade?: string | null;
          status?: string | null;
          test_print?: boolean | null;
        };
        Update: {
          armazenamento_id?: string | null;
          command?: string | null;
          created_at?: string;
          fornecedor_id?: string | null;
          grupo_id?: string | null;
          id?: string;
          impressora_id?: string | null;
          loja_id?: string | null;
          lote?: string | null;
          operador_id?: string | null;
          produto_id?: string | null;
          quantidade?: number | null;
          SIF?: string | null;
          validade?: string | null;
          status?: string | null;
          test_print?: boolean | null;
        };
        Relationships: [
          {
            foreignKeyName: "etiquetas_armazenamento_id_fkey";
            columns: ["armazenamento_id"];
            isOneToOne: false;
            referencedRelation: "locais_armazenamento";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "etiquetas_grupo_id_fkey";
            columns: ["grupo_id"];
            isOneToOne: false;
            referencedRelation: "grupos";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "etiquetas_loja_id_fkey";
            columns: ["loja_id"];
            isOneToOne: false;
            referencedRelation: "lojas";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "etiquetas_impressora_id_fkey";
            columns: ["impressora_id"];
            isOneToOne: false;
            referencedRelation: "impressoras";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "etiquetas_operador_id_fkey";
            columns: ["operador_id"];
            isOneToOne: false;
            referencedRelation: "operadores";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "etiquetas_produto_id_fkey";
            columns: ["produto_id"];
            isOneToOne: false;
            referencedRelation: "produtos";
            referencedColumns: ["id"];
          }
        ];
      };
      locais_armazenamento: {
        Row: {
          id: string;
          armazenamento: string;
          metodo: string;
          created_at: string;
          loja_id: string | null;
        };
        Insert: {
          id?: string;
          armazenamento: string;
          metodo: string;
          created_at?: string;
          loja_id?: string | null;
        };
        Update: {
          id?: string;
          armazenamento?: string;
          metodo?: string;
          created_at?: string;
          loja_id?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "locais_armazenamento_loja_id_fkey";
            columns: ["loja_id"];
            isOneToOne: false;
            referencedRelation: "lojas";
            referencedColumns: ["id"];
          }
        ];
      };
      // ... rest of your existing tables ...
    };
  };
}
