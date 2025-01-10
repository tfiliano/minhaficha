export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  public: {
    Tables: {
      codigos: {
        Row: {
          code: string | null;
          created_at: string;
          id: string;
        };
        Insert: {
          code?: string | null;
          created_at?: string;
          id?: string;
        };
        Update: {
          code?: string | null;
          created_at?: string;
          id?: string;
        };
        Relationships: [];
      };
      etiquetas: {
        Row: {
          armazenamento_id: string | null;
          command: string | null;
          created_at: string;
          fornecedor_id: string | null;
          grupo_id: string | null;
          id: string;
          impressora: string | null;
          loja_id: string | null;
          lote: string | null;
          operador_id: string | null;
          produto_id: string | null;
          quantidade: number | null;
          SIF: string | null;
          validade: string | null;
        };
        Insert: {
          armazenamento_id?: string | null;
          command?: string | null;
          created_at?: string;
          fornecedor_id?: string | null;
          grupo_id?: string | null;
          id?: string;
          impressora?: string | null;
          loja_id?: string | null;
          lote?: string | null;
          operador_id?: string | null;
          produto_id?: string | null;
          quantidade?: number | null;
          SIF?: string | null;
          validade?: string | null;
        };
        Update: {
          armazenamento_id?: string | null;
          command?: string | null;
          created_at?: string;
          fornecedor_id?: string | null;
          grupo_id?: string | null;
          id?: string;
          impressora?: string | null;
          loja_id?: string | null;
          lote?: string | null;
          operador_id?: string | null;
          produto_id?: string | null;
          quantidade?: number | null;
          SIF?: string | null;
          validade?: string | null;
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
      fabricantes: {
        Row: {
          cnpj: string | null;
          created_at: string;
          id: string;
          loja_id: string | null;
          nome: string | null;
        };
        Insert: {
          cnpj?: string | null;
          created_at?: string;
          id?: string;
          loja_id?: string | null;
          nome?: string | null;
        };
        Update: {
          cnpj?: string | null;
          created_at?: string;
          id?: string;
          loja_id?: string | null;
          nome?: string | null;
        };
        Relationships: [];
      };
      grupos: {
        Row: {
          cor_botao: string | null;
          cor_fonte: string | null;
          created_at: string;
          icone: string | null;
          id: string;
          loja_id: string | null;
          nome: string | null;
        };
        Insert: {
          cor_botao?: string | null;
          cor_fonte?: string | null;
          created_at?: string;
          icone?: string | null;
          id?: string;
          loja_id?: string | null;
          nome?: string | null;
        };
        Update: {
          cor_botao?: string | null;
          cor_fonte?: string | null;
          created_at?: string;
          icone?: string | null;
          id?: string;
          loja_id?: string | null;
          nome?: string | null;
        };
        Relationships: [];
      };
      impressoras: {
        Row: {
          id: string;
          nome: string;
        };
        Insert: {
          id?: string;
          nome: string;
        };
        Update: {
          id?: string;
          nome?: string;
        };
        Relationships: [];
      };
      locais_armazenamento: {
        Row: {
          armazenamento: string | null;
          created_at: string;
          id: string;
          loja_id: string | null;
          metodo: string | null;
        };
        Insert: {
          armazenamento?: string | null;
          created_at?: string;
          id?: string;
          loja_id?: string | null;
          metodo?: string | null;
        };
        Update: {
          armazenamento?: string | null;
          created_at?: string;
          id?: string;
          loja_id?: string | null;
          metodo?: string | null;
        };
        Relationships: [];
      };
      loja_usuarios: {
        Row: {
          ativo: boolean | null;
          created_at: string;
          id: string;
          loja_id: string | null;
        };
        Insert: {
          ativo?: boolean | null;
          created_at?: string;
          id: string;
          loja_id?: string | null;
        };
        Update: {
          ativo?: boolean | null;
          created_at?: string;
          id?: string;
          loja_id?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "loja_usuarios_id_fkey";
            columns: ["id"];
            isOneToOne: true;
            referencedRelation: "usuarios";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "loja_usuarios_loja_id_fkey";
            columns: ["loja_id"];
            isOneToOne: false;
            referencedRelation: "lojas";
            referencedColumns: ["id"];
          }
        ];
      };
      lojas: {
        Row: {
          ativo: boolean | null;
          codigo: string | null;
          configuracoes: Json | null;
          created_at: string;
          id: string;
          nome: string | null;
        };
        Insert: {
          ativo?: boolean | null;
          codigo?: string | null;
          configuracoes?: Json | null;
          created_at?: string;
          id?: string;
          nome?: string | null;
        };
        Update: {
          ativo?: boolean | null;
          codigo?: string | null;
          configuracoes?: Json | null;
          created_at?: string;
          id?: string;
          nome?: string | null;
        };
        Relationships: [];
      };
      operadores: {
        Row: {
          ativo: boolean | null;
          cor_botao: string | null;
          cor_fonte: string | null;
          created_at: string;
          id: string;
          loja_id: string | null;
          nome: string;
        };
        Insert: {
          ativo?: boolean | null;
          cor_botao?: string | null;
          cor_fonte?: string | null;
          created_at?: string;
          id?: string;
          loja_id?: string | null;
          nome: string;
        };
        Update: {
          ativo?: boolean | null;
          cor_botao?: string | null;
          cor_fonte?: string | null;
          created_at?: string;
          id?: string;
          loja_id?: string | null;
          nome?: string;
        };
        Relationships: [];
      };
      producoes: {
        Row: {
          created_at: string;
          fator_correcao: number | null;
          grupo: string | null;
          grupo_id: string | null;
          id: string;
          items: Json | null;
          loja_id: string | null;
          operador_id: string | null;
          peso_bruto: number | null;
          peso_liquido: number | null;
          peso_perda: number | null;
          produto: string | null;
          produto_id: string | null;
          setor: string | null;
        };
        Insert: {
          created_at?: string;
          fator_correcao?: number | null;
          grupo?: string | null;
          grupo_id?: string | null;
          id?: string;
          items?: Json | null;
          loja_id?: string | null;
          operador_id?: string | null;
          peso_bruto?: number | null;
          peso_liquido?: number | null;
          peso_perda?: number | null;
          produto?: string | null;
          produto_id?: string | null;
          setor?: string | null;
        };
        Update: {
          created_at?: string;
          fator_correcao?: number | null;
          grupo?: string | null;
          grupo_id?: string | null;
          id?: string;
          items?: Json | null;
          loja_id?: string | null;
          operador_id?: string | null;
          peso_bruto?: number | null;
          peso_liquido?: number | null;
          peso_perda?: number | null;
          produto?: string | null;
          produto_id?: string | null;
          setor?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "producao_produto_fkey";
            columns: ["produto"];
            isOneToOne: false;
            referencedRelation: "produtos";
            referencedColumns: ["codigo"];
          },
          {
            foreignKeyName: "producao_produto_id_fkey";
            columns: ["produto_id"];
            isOneToOne: false;
            referencedRelation: "produtos";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "producoes_client_id_fkey";
            columns: ["loja_id"];
            isOneToOne: false;
            referencedRelation: "lojas";
            referencedColumns: ["id"];
          }
        ];
      };
      produtos: {
        Row: {
          armazenamento: string | null;
          armazenamento_id: string | null;
          ativo: boolean | null;
          codigo: string;
          dias_validade: number | null;
          estoque_kilo: number | null;
          estoque_unidade: number | null;
          grupo: string;
          grupo_id: string | null;
          id: string;
          loja_id: string | null;
          nome: string;
          originado: string | null;
          setor: string;
          unidade: string;
        };
        Insert: {
          armazenamento?: string | null;
          armazenamento_id?: string | null;
          ativo?: boolean | null;
          codigo: string;
          dias_validade?: number | null;
          estoque_kilo?: number | null;
          estoque_unidade?: number | null;
          grupo: string;
          grupo_id?: string | null;
          id?: string;
          loja_id?: string | null;
          nome: string;
          originado?: string | null;
          setor: string;
          unidade: string;
        };
        Update: {
          armazenamento?: string | null;
          armazenamento_id?: string | null;
          ativo?: boolean | null;
          codigo?: string;
          dias_validade?: number | null;
          estoque_kilo?: number | null;
          estoque_unidade?: number | null;
          grupo?: string;
          grupo_id?: string | null;
          id?: string;
          loja_id?: string | null;
          nome?: string;
          originado?: string | null;
          setor?: string;
          unidade?: string;
        };
        Relationships: [
          {
            foreignKeyName: "produtos_client_id_fkey";
            columns: ["loja_id"];
            isOneToOne: false;
            referencedRelation: "lojas";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "produtos_originado_fkey";
            columns: ["originado"];
            isOneToOne: false;
            referencedRelation: "produtos";
            referencedColumns: ["codigo"];
          }
        ];
      };
      recebimentos: {
        Row: {
          conformidade_embalagem: string | null;
          conformidade_produtos: string | null;
          conformidade_transporte: string | null;
          created_at: string;
          data_recebimento: string | null;
          fabricante_id: string | null;
          fornecedor: string | null;
          id: string;
          loja_id: string | null;
          lote: string | null;
          nota_fiscal: string | null;
          observacoes: string | null;
          operador_id: string | null;
          peso_bruto: number | null;
          produto: string | null;
          produto_id: string | null;
          sif: string | null;
          temperatura: string | null;
          validade: string | null;
        };
        Insert: {
          conformidade_embalagem?: string | null;
          conformidade_produtos?: string | null;
          conformidade_transporte?: string | null;
          created_at?: string;
          data_recebimento?: string | null;
          fabricante_id?: string | null;
          fornecedor?: string | null;
          id?: string;
          loja_id?: string | null;
          lote?: string | null;
          nota_fiscal?: string | null;
          observacoes?: string | null;
          operador_id?: string | null;
          peso_bruto?: number | null;
          produto?: string | null;
          produto_id?: string | null;
          sif?: string | null;
          temperatura?: string | null;
          validade?: string | null;
        };
        Update: {
          conformidade_embalagem?: string | null;
          conformidade_produtos?: string | null;
          conformidade_transporte?: string | null;
          created_at?: string;
          data_recebimento?: string | null;
          fabricante_id?: string | null;
          fornecedor?: string | null;
          id?: string;
          loja_id?: string | null;
          lote?: string | null;
          nota_fiscal?: string | null;
          observacoes?: string | null;
          operador_id?: string | null;
          peso_bruto?: number | null;
          produto?: string | null;
          produto_id?: string | null;
          sif?: string | null;
          temperatura?: string | null;
          validade?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "entrada_insumos_produto_fkey";
            columns: ["produto"];
            isOneToOne: false;
            referencedRelation: "produtos";
            referencedColumns: ["codigo"];
          },
          {
            foreignKeyName: "entrada_insumos_produto_id_fkey";
            columns: ["produto_id"];
            isOneToOne: false;
            referencedRelation: "produtos";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "recebimento_operador_id_fkey";
            columns: ["operador_id"];
            isOneToOne: false;
            referencedRelation: "operadores";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "recebimentos_cliente_id_fkey";
            columns: ["loja_id"];
            isOneToOne: false;
            referencedRelation: "lojas";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "recebimentos_fabricante_id_fkey";
            columns: ["fabricante_id"];
            isOneToOne: false;
            referencedRelation: "fabricantes";
            referencedColumns: ["id"];
          }
        ];
      };
      sifs: {
        Row: {
          created_at: string;
          id: string;
          nome: string | null;
        };
        Insert: {
          created_at?: string;
          id?: string;
          nome?: string | null;
        };
        Update: {
          created_at?: string;
          id?: string;
          nome?: string | null;
        };
        Relationships: [];
      };
      usuarios: {
        Row: {
          ativo: boolean;
          avatar: string | null;
          created_at: string;
          email: string | null;
          id: string;
          name: string | null;
          type: string;
        };
        Insert: {
          ativo?: boolean;
          avatar?: string | null;
          created_at?: string;
          email?: string | null;
          id: string;
          name?: string | null;
          type?: string;
        };
        Update: {
          ativo?: boolean;
          avatar?: string | null;
          created_at?: string;
          email?: string | null;
          id?: string;
          name?: string | null;
          type?: string;
        };
        Relationships: [];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      listar_setores: {
        Args: Record<PropertyKey, never>;
        Returns: {
          nome: string;
        }[];
      };
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};

export type PublicSchema = Database[Extract<keyof Database, "public">];

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema["Tables"] & PublicSchema["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R;
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] &
      PublicSchema["Views"])
  ? (PublicSchema["Tables"] &
      PublicSchema["Views"])[PublicTableNameOrOptions] extends {
      Row: infer R;
    }
    ? R
    : never
  : never;

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I;
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
  ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
      Insert: infer I;
    }
    ? I
    : never
  : never;

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U;
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
  ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
      Update: infer U;
    }
    ? U
    : never
  : never;

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof PublicSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
  ? PublicSchema["Enums"][PublicEnumNameOrOptions]
  : never;

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof PublicSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database;
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof PublicSchema["CompositeTypes"]
  ? PublicSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
  : never;
