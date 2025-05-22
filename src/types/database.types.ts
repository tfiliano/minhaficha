export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      etiquetas: {
        Row: {
          armazenamento_id: string | null
          codigo_produto: string | null
          command: string | null
          completed_at: string | null
          created_at: string
          error_message: string | null
          fornecedor_id: string | null
          grupo_id: string | null
          id: string
          impressora_id: string | null
          loja_id: string | null
          lote: string | null
          operador: string | null
          operador_id: string | null
          processing_started_at: string | null
          produto_id: string | null
          produto_nome: string | null
          quantidade: number | null
          retry_count: number | null
          SIF: string | null
          status: string | null
          validade: string | null
        }
        Insert: {
          armazenamento_id?: string | null
          codigo_produto?: string | null
          command?: string | null
          completed_at?: string | null
          created_at?: string
          error_message?: string | null
          fornecedor_id?: string | null
          grupo_id?: string | null
          id?: string
          impressora_id?: string | null
          loja_id?: string | null
          lote?: string | null
          operador?: string | null
          operador_id?: string | null
          processing_started_at?: string | null
          produto_id?: string | null
          produto_nome?: string | null
          quantidade?: number | null
          retry_count?: number | null
          SIF?: string | null
          status?: string | null
          validade?: string | null
        }
        Update: {
          armazenamento_id?: string | null
          codigo_produto?: string | null
          command?: string | null
          completed_at?: string | null
          created_at?: string
          error_message?: string | null
          fornecedor_id?: string | null
          grupo_id?: string | null
          id?: string
          impressora_id?: string | null
          loja_id?: string | null
          lote?: string | null
          operador?: string | null
          operador_id?: string | null
          processing_started_at?: string | null
          produto_id?: string | null
          produto_nome?: string | null
          quantidade?: number | null
          retry_count?: number | null
          SIF?: string | null
          status?: string | null
          validade?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "etiquetas_armazenamento_id_fkey"
            columns: ["armazenamento_id"]
            isOneToOne: false
            referencedRelation: "locais_armazenamento"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "etiquetas_grupo_id_fkey"
            columns: ["grupo_id"]
            isOneToOne: false
            referencedRelation: "grupos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "etiquetas_impressora_id_fkey"
            columns: ["impressora_id"]
            isOneToOne: false
            referencedRelation: "impressoras"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "etiquetas_loja_id_fkey"
            columns: ["loja_id"]
            isOneToOne: false
            referencedRelation: "lojas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "etiquetas_operador_id_fkey"
            columns: ["operador_id"]
            isOneToOne: false
            referencedRelation: "operadores"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "etiquetas_produto_id_fkey"
            columns: ["produto_id"]
            isOneToOne: false
            referencedRelation: "produtos"
            referencedColumns: ["id"]
          },
        ]
      }
      fabricantes: {
        Row: {
          cnpj: string | null
          created_at: string
          id: string
          loja_id: string | null
          nome: string | null
        }
        Insert: {
          cnpj?: string | null
          created_at?: string
          id?: string
          loja_id?: string | null
          nome?: string | null
        }
        Update: {
          cnpj?: string | null
          created_at?: string
          id?: string
          loja_id?: string | null
          nome?: string | null
        }
        Relationships: []
      }
      grupos: {
        Row: {
          cor_botao: string | null
          cor_fonte: string | null
          created_at: string
          icone: string | null
          id: string
          loja_id: string | null
          nome: string | null
        }
        Insert: {
          cor_botao?: string | null
          cor_fonte?: string | null
          created_at?: string
          icone?: string | null
          id?: string
          loja_id?: string | null
          nome?: string | null
        }
        Update: {
          cor_botao?: string | null
          cor_fonte?: string | null
          created_at?: string
          icone?: string | null
          id?: string
          loja_id?: string | null
          nome?: string | null
        }
        Relationships: []
      }
      impressoras: {
        Row: {
          created_at: string | null
          id: string
          ip: string | null
          localizacao: string | null
          loja_id: string | null
          nome: string
          porta: number | null
          status: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          ip?: string | null
          localizacao?: string | null
          loja_id?: string | null
          nome: string
          porta?: number | null
          status?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          ip?: string | null
          localizacao?: string | null
          loja_id?: string | null
          nome?: string
          porta?: number | null
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "impressoras_loja_id_fkey"
            columns: ["loja_id"]
            isOneToOne: false
            referencedRelation: "lojas"
            referencedColumns: ["id"]
          },
        ]
      }
      locais_armazenamento: {
        Row: {
          armazenamento: string | null
          created_at: string
          id: string
          loja_id: string | null
          metodo: string | null
        }
        Insert: {
          armazenamento?: string | null
          created_at?: string
          id?: string
          loja_id?: string | null
          metodo?: string | null
        }
        Update: {
          armazenamento?: string | null
          created_at?: string
          id?: string
          loja_id?: string | null
          metodo?: string | null
        }
        Relationships: []
      }
      loja_usuarios: {
        Row: {
          ativo: boolean | null
          created_at: string
          id: string
          loja_id: string | null
          tipo: Database["public"]["Enums"]["USER_TYPE"] | null
          user_id: string | null
        }
        Insert: {
          ativo?: boolean | null
          created_at?: string
          id?: string
          loja_id?: string | null
          tipo?: Database["public"]["Enums"]["USER_TYPE"] | null
          user_id?: string | null
        }
        Update: {
          ativo?: boolean | null
          created_at?: string
          id?: string
          loja_id?: string | null
          tipo?: Database["public"]["Enums"]["USER_TYPE"] | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "loja_usuarios_loja_id_fkey"
            columns: ["loja_id"]
            isOneToOne: false
            referencedRelation: "lojas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "loja_usuarios_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "usuarios"
            referencedColumns: ["id"]
          },
        ]
      }
      lojas: {
        Row: {
          ativo: boolean | null
          codigo: string | null
          configuracoes: Json | null
          created_at: string
          id: string
          nome: string | null
        }
        Insert: {
          ativo?: boolean | null
          codigo?: string | null
          configuracoes?: Json | null
          created_at?: string
          id?: string
          nome?: string | null
        }
        Update: {
          ativo?: boolean | null
          codigo?: string | null
          configuracoes?: Json | null
          created_at?: string
          id?: string
          nome?: string | null
        }
        Relationships: []
      }
      operadores: {
        Row: {
          ativo: boolean | null
          cor_botao: string | null
          cor_fonte: string | null
          created_at: string
          id: string
          loja_id: string | null
          nome: string
        }
        Insert: {
          ativo?: boolean | null
          cor_botao?: string | null
          cor_fonte?: string | null
          created_at?: string
          id?: string
          loja_id?: string | null
          nome: string
        }
        Update: {
          ativo?: boolean | null
          cor_botao?: string | null
          cor_fonte?: string | null
          created_at?: string
          id?: string
          loja_id?: string | null
          nome?: string
        }
        Relationships: []
      }
      producoes: {
        Row: {
          created_at: string
          fator_correcao: number | null
          grupo_id: string | null
          id: string
          items: Json | null
          loja_id: string | null
          operador_id: string | null
          peso_bruto: number | null
          peso_liquido: number | null
          peso_perda: number | null
          produto: string | null
          produto_id: string | null
          quantidade: number
          setor: string | null
        }
        Insert: {
          created_at?: string
          fator_correcao?: number | null
          grupo_id?: string | null
          id?: string
          items?: Json | null
          loja_id?: string | null
          operador_id?: string | null
          peso_bruto?: number | null
          peso_liquido?: number | null
          peso_perda?: number | null
          produto?: string | null
          produto_id?: string | null
          quantidade?: number
          setor?: string | null
        }
        Update: {
          created_at?: string
          fator_correcao?: number | null
          grupo_id?: string | null
          id?: string
          items?: Json | null
          loja_id?: string | null
          operador_id?: string | null
          peso_bruto?: number | null
          peso_liquido?: number | null
          peso_perda?: number | null
          produto?: string | null
          produto_id?: string | null
          quantidade?: number
          setor?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "producao_produto_id_fkey"
            columns: ["produto_id"]
            isOneToOne: false
            referencedRelation: "produtos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "producoes_client_id_fkey"
            columns: ["loja_id"]
            isOneToOne: false
            referencedRelation: "lojas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "producoes_grupo_id_fkey"
            columns: ["grupo_id"]
            isOneToOne: false
            referencedRelation: "grupos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "producoes_operador_id_fkey"
            columns: ["operador_id"]
            isOneToOne: false
            referencedRelation: "operadores"
            referencedColumns: ["id"]
          },
        ]
      }
      produtos: {
        Row: {
          armazenamento: string | null
          armazenamento_id: string | null
          ativo: boolean | null
          codigo: string
          dias_validade: number | null
          estoque_kilo: number | null
          estoque_unidade: number | null
          grupo: string
          grupo_id: string | null
          id: string
          loja_id: string | null
          nome: string
          originado: string | null
          setor: string
          unidade: string
        }
        Insert: {
          armazenamento?: string | null
          armazenamento_id?: string | null
          ativo?: boolean | null
          codigo: string
          dias_validade?: number | null
          estoque_kilo?: number | null
          estoque_unidade?: number | null
          grupo: string
          grupo_id?: string | null
          id?: string
          loja_id?: string | null
          nome: string
          originado?: string | null
          setor: string
          unidade: string
        }
        Update: {
          armazenamento?: string | null
          armazenamento_id?: string | null
          ativo?: boolean | null
          codigo?: string
          dias_validade?: number | null
          estoque_kilo?: number | null
          estoque_unidade?: number | null
          grupo?: string
          grupo_id?: string | null
          id?: string
          loja_id?: string | null
          nome?: string
          originado?: string | null
          setor?: string
          unidade?: string
        }
        Relationships: [
          {
            foreignKeyName: "produtos_armazenamento_id_fkey"
            columns: ["armazenamento_id"]
            isOneToOne: false
            referencedRelation: "locais_armazenamento"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "produtos_client_id_fkey"
            columns: ["loja_id"]
            isOneToOne: false
            referencedRelation: "lojas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "produtos_grupo_id_fkey"
            columns: ["grupo_id"]
            isOneToOne: false
            referencedRelation: "grupos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "produtos_originado_fkey"
            columns: ["originado"]
            isOneToOne: false
            referencedRelation: "produtos"
            referencedColumns: ["id"]
          },
        ]
      }
      recebimentos: {
        Row: {
          conformidade_embalagem: string | null
          conformidade_produtos: string | null
          conformidade_transporte: string | null
          created_at: string
          data_recebimento: string | null
          fabricante_id: string | null
          fornecedor: string | null
          id: string
          loja_id: string | null
          lote: string | null
          nota_fiscal: string | null
          observacoes: string | null
          operador_id: string | null
          peso_bruto: number | null
          produto: string | null
          produto_id: string | null
          sif: string | null
          temperatura: string | null
          validade: string | null
        }
        Insert: {
          conformidade_embalagem?: string | null
          conformidade_produtos?: string | null
          conformidade_transporte?: string | null
          created_at?: string
          data_recebimento?: string | null
          fabricante_id?: string | null
          fornecedor?: string | null
          id?: string
          loja_id?: string | null
          lote?: string | null
          nota_fiscal?: string | null
          observacoes?: string | null
          operador_id?: string | null
          peso_bruto?: number | null
          produto?: string | null
          produto_id?: string | null
          sif?: string | null
          temperatura?: string | null
          validade?: string | null
        }
        Update: {
          conformidade_embalagem?: string | null
          conformidade_produtos?: string | null
          conformidade_transporte?: string | null
          created_at?: string
          data_recebimento?: string | null
          fabricante_id?: string | null
          fornecedor?: string | null
          id?: string
          loja_id?: string | null
          lote?: string | null
          nota_fiscal?: string | null
          observacoes?: string | null
          operador_id?: string | null
          peso_bruto?: number | null
          produto?: string | null
          produto_id?: string | null
          sif?: string | null
          temperatura?: string | null
          validade?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "entrada_insumos_produto_fkey"
            columns: ["produto"]
            isOneToOne: false
            referencedRelation: "produtos"
            referencedColumns: ["codigo"]
          },
          {
            foreignKeyName: "entrada_insumos_produto_id_fkey"
            columns: ["produto_id"]
            isOneToOne: false
            referencedRelation: "produtos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "recebimento_operador_id_fkey"
            columns: ["operador_id"]
            isOneToOne: false
            referencedRelation: "operadores"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "recebimentos_cliente_id_fkey"
            columns: ["loja_id"]
            isOneToOne: false
            referencedRelation: "lojas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "recebimentos_fabricante_id_fkey"
            columns: ["fabricante_id"]
            isOneToOne: false
            referencedRelation: "fabricantes"
            referencedColumns: ["id"]
          },
        ]
      }
      setores: {
        Row: {
          cor_botao: string | null
          cor_fonte: string | null
          created_at: string
          id: string
          loja_id: string | null
          nome: string | null
        }
        Insert: {
          cor_botao?: string | null
          cor_fonte?: string | null
          created_at?: string
          id?: string
          loja_id?: string | null
          nome?: string | null
        }
        Update: {
          cor_botao?: string | null
          cor_fonte?: string | null
          created_at?: string
          id?: string
          loja_id?: string | null
          nome?: string | null
        }
        Relationships: []
      }
      sifs: {
        Row: {
          created_at: string
          id: string
          nome: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          nome?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          nome?: string | null
        }
        Relationships: []
      }
      templates_etiquetas: {
        Row: {
          campos: Json | null
          created_at: string
          height: number | null
          id: string
          loja_id: string | null
          nome: string | null
          width: number | null
          zpl: string | null
        }
        Insert: {
          campos?: Json | null
          created_at?: string
          height?: number | null
          id?: string
          loja_id?: string | null
          nome?: string | null
          width?: number | null
          zpl?: string | null
        }
        Update: {
          campos?: Json | null
          created_at?: string
          height?: number | null
          id?: string
          loja_id?: string | null
          nome?: string | null
          width?: number | null
          zpl?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "templates_etiquetas_loja_id_fkey"
            columns: ["loja_id"]
            isOneToOne: false
            referencedRelation: "lojas"
            referencedColumns: ["id"]
          },
        ]
      }
      usuarios: {
        Row: {
          ativo: boolean
          avatar: string | null
          created_at: string
          email: string | null
          id: string
          name: string | null
          type: Database["public"]["Enums"]["USER_TYPE"]
        }
        Insert: {
          ativo?: boolean
          avatar?: string | null
          created_at?: string
          email?: string | null
          id: string
          name?: string | null
          type?: Database["public"]["Enums"]["USER_TYPE"]
        }
        Update: {
          ativo?: boolean
          avatar?: string | null
          created_at?: string
          email?: string | null
          id?: string
          name?: string | null
          type?: Database["public"]["Enums"]["USER_TYPE"]
        }
        Relationships: []
      }
      usuarios_masters: {
        Row: {
          created_at: string
          id: string
          is_active: boolean | null
        }
        Insert: {
          created_at?: string
          id: string
          is_active?: boolean | null
        }
        Update: {
          created_at?: string
          id?: string
          is_active?: boolean | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      listar_setores: {
        Args: Record<PropertyKey, never>
        Returns: {
          nome: string
        }[]
      }
    }
    Enums: {
      USER_TYPE: "master" | "admin" | "manager" | "operator" | "user"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

export type PublicSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema["Tables"] & PublicSchema["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] &
        PublicSchema["Views"])
    ? (PublicSchema["Tables"] &
        PublicSchema["Views"])[PublicTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof PublicSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
    ? PublicSchema["Enums"][PublicEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof PublicSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof PublicSchema["CompositeTypes"]
    ? PublicSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never
