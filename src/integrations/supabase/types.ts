export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instanciate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.3 (519615d)"
  }
  public: {
    Tables: {
      category: {
        Row: {
          code: string | null
          created_at: string | null
          description: string | null
          id: number
          name: string
          sort_order: number | null
          status: string | null
        }
        Insert: {
          code?: string | null
          created_at?: string | null
          description?: string | null
          id?: number
          name: string
          sort_order?: number | null
          status?: string | null
        }
        Update: {
          code?: string | null
          created_at?: string | null
          description?: string | null
          id?: number
          name?: string
          sort_order?: number | null
          status?: string | null
        }
        Relationships: []
      }
      company_affiliate: {
        Row: {
          code: string | null
          created_at: string | null
          description: string | null
          id: number
          name: string
          status: string | null
        }
        Insert: {
          code?: string | null
          created_at?: string | null
          description?: string | null
          id?: number
          name: string
          status?: string | null
        }
        Update: {
          code?: string | null
          created_at?: string | null
          description?: string | null
          id?: number
          name?: string
          status?: string | null
        }
        Relationships: []
      }
      opinion: {
        Row: {
          answered: boolean | null
          asis: string | null
          case_study: string | null
          category_id: number
          company_affiliate_id: number
          content: string
          created_at: string | null
          effect: string | null
          id: number
          negative_score: number | null
          quarter: Database["public"]["Enums"]["quarter_enum"]
          reg_date: string | null
          seq: number
          status: string | null
          title: string | null
          tobe: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          answered?: boolean | null
          asis?: string | null
          case_study?: string | null
          category_id: number
          company_affiliate_id: number
          content: string
          created_at?: string | null
          effect?: string | null
          id?: number
          negative_score?: number | null
          quarter: Database["public"]["Enums"]["quarter_enum"]
          reg_date?: string | null
          seq?: number
          status?: string | null
          title?: string | null
          tobe?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          answered?: boolean | null
          asis?: string | null
          case_study?: string | null
          category_id?: number
          company_affiliate_id?: number
          content?: string
          created_at?: string | null
          effect?: string | null
          id?: number
          negative_score?: number | null
          quarter?: Database["public"]["Enums"]["quarter_enum"]
          reg_date?: string | null
          seq?: number
          status?: string | null
          title?: string | null
          tobe?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "opinion_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "category"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "opinion_company_affiliate_id_fkey"
            columns: ["company_affiliate_id"]
            isOneToOne: false
            referencedRelation: "company_affiliate"
            referencedColumns: ["id"]
          },
        ]
      }
      processing_history: {
        Row: {
          id: string
          opinion_id: number | null
          proc_desc: string | null
          proc_name: string | null
          processed_at: string | null
          processing_content: string | null
          processor_id: string | null
          status: string
        }
        Insert: {
          id: string
          opinion_id?: number | null
          proc_desc?: string | null
          proc_name?: string | null
          processed_at?: string | null
          processing_content?: string | null
          processor_id?: string | null
          status: string
        }
        Update: {
          id?: string
          opinion_id?: number | null
          proc_desc?: string | null
          proc_name?: string | null
          processed_at?: string | null
          processing_content?: string | null
          processor_id?: string | null
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "processing_history_opinion_id_fkey"
            columns: ["opinion_id"]
            isOneToOne: false
            referencedRelation: "opinion"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "processing_history_processor_id_fkey"
            columns: ["processor_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      users: {
        Row: {
          company_id: number | null
          created_at: string | null
          dept: string | null
          email: string | null
          employee_id: string
          id: string
          last_login_at: string | null
          name: string
          password_hash: string
          role: string | null
          status: string | null
        }
        Insert: {
          company_id?: number | null
          created_at?: string | null
          dept?: string | null
          email?: string | null
          employee_id: string
          id: string
          last_login_at?: string | null
          name: string
          password_hash: string
          role?: string | null
          status?: string | null
        }
        Update: {
          company_id?: number | null
          created_at?: string | null
          dept?: string | null
          email?: string | null
          employee_id?: string
          id?: string
          last_login_at?: string | null
          name?: string
          password_hash?: string
          role?: string | null
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "users_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "company_affiliate"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      quarter_enum: "Q1" | "Q2" | "Q3" | "Q4"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      quarter_enum: ["Q1", "Q2", "Q3", "Q4"],
    },
  },
} as const
