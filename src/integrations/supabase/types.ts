export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      article_categories: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          label: string
          value: string
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          label: string
          value: string
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          label?: string
          value?: string
        }
        Relationships: []
      }
      articles: {
        Row: {
          author_name: string | null
          author_role: string | null
          category: string
          category_label: string | null
          citations: Json | null
          content: Json | null
          content_images: Json | null
          created_at: string
          featured_image_url: string | null
          id: string
          published_date: string | null
          read_time: number | null
          related_peptides: string[] | null
          slug: string
          summary: string | null
          table_of_contents: Json | null
          title: string
          updated_at: string
        }
        Insert: {
          author_name?: string | null
          author_role?: string | null
          category: string
          category_label?: string | null
          citations?: Json | null
          content?: Json | null
          content_images?: Json | null
          created_at?: string
          featured_image_url?: string | null
          id?: string
          published_date?: string | null
          read_time?: number | null
          related_peptides?: string[] | null
          slug: string
          summary?: string | null
          table_of_contents?: Json | null
          title: string
          updated_at?: string
        }
        Update: {
          author_name?: string | null
          author_role?: string | null
          category?: string
          category_label?: string | null
          citations?: Json | null
          content?: Json | null
          content_images?: Json | null
          created_at?: string
          featured_image_url?: string | null
          id?: string
          published_date?: string | null
          read_time?: number | null
          related_peptides?: string[] | null
          slug?: string
          summary?: string | null
          table_of_contents?: Json | null
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      batches: {
        Row: {
          batch_id: string
          created_at: string
          id: string
          lab_name: string | null
          product_id: string | null
          product_name: string
          purity_result: number
          report_url: string | null
          test_date: string
          test_method: string | null
          vendor_id: string | null
          vendor_name: string
        }
        Insert: {
          batch_id: string
          created_at?: string
          id?: string
          lab_name?: string | null
          product_id?: string | null
          product_name: string
          purity_result: number
          report_url?: string | null
          test_date: string
          test_method?: string | null
          vendor_id?: string | null
          vendor_name: string
        }
        Update: {
          batch_id?: string
          created_at?: string
          id?: string
          lab_name?: string | null
          product_id?: string | null
          product_name?: string
          purity_result?: number
          report_url?: string | null
          test_date?: string
          test_method?: string | null
          vendor_id?: string | null
          vendor_name?: string
        }
        Relationships: [
          {
            foreignKeyName: "batches_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "batches_vendor_id_fkey"
            columns: ["vendor_id"]
            isOneToOne: false
            referencedRelation: "vendors"
            referencedColumns: ["id"]
          },
        ]
      }
      products: {
        Row: {
          category: string
          created_at: string
          description: string | null
          half_life: string | null
          id: string
          is_popular: boolean | null
          molecular_weight: string | null
          name: string
          purity_standard: string | null
          sequence: string | null
          slug: string
          synonyms: string[] | null
          updated_at: string
          video_url: string | null
        }
        Insert: {
          category: string
          created_at?: string
          description?: string | null
          half_life?: string | null
          id?: string
          is_popular?: boolean | null
          molecular_weight?: string | null
          name: string
          purity_standard?: string | null
          sequence?: string | null
          slug: string
          synonyms?: string[] | null
          updated_at?: string
          video_url?: string | null
        }
        Update: {
          category?: string
          created_at?: string
          description?: string | null
          half_life?: string | null
          id?: string
          is_popular?: boolean | null
          molecular_weight?: string | null
          name?: string
          purity_standard?: string | null
          sequence?: string | null
          slug?: string
          synonyms?: string[] | null
          updated_at?: string
          video_url?: string | null
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      vendor_products: {
        Row: {
          created_at: string | null
          currency: string | null
          id: string
          in_stock: boolean | null
          last_synced_at: string | null
          price: number | null
          price_per_mg: number | null
          price_per_mg_usd: number | null
          price_usd: number | null
          product_id: string | null
          product_name: string
          size_mg: number | null
          source_url: string | null
          stock_status: string | null
          updated_at: string | null
          vendor_id: string
        }
        Insert: {
          created_at?: string | null
          currency?: string | null
          id?: string
          in_stock?: boolean | null
          last_synced_at?: string | null
          price?: number | null
          price_per_mg?: number | null
          price_per_mg_usd?: number | null
          price_usd?: number | null
          product_id?: string | null
          product_name: string
          size_mg?: number | null
          source_url?: string | null
          stock_status?: string | null
          updated_at?: string | null
          vendor_id: string
        }
        Update: {
          created_at?: string | null
          currency?: string | null
          id?: string
          in_stock?: boolean | null
          last_synced_at?: string | null
          price?: number | null
          price_per_mg?: number | null
          price_per_mg_usd?: number | null
          price_usd?: number | null
          product_id?: string | null
          product_name?: string
          size_mg?: number | null
          source_url?: string | null
          stock_status?: string | null
          updated_at?: string | null
          vendor_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "vendor_products_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "vendor_products_vendor_id_fkey"
            columns: ["vendor_id"]
            isOneToOne: false
            referencedRelation: "vendors"
            referencedColumns: ["id"]
          },
        ]
      }
      vendors: {
        Row: {
          coa_verified: boolean | null
          created_at: string
          default_currency: string | null
          description: string | null
          discount_code: string | null
          discount_percentage: number | null
          id: string
          last_verified: string | null
          location: string | null
          logo_url: string | null
          name: string
          payment_methods: string[] | null
          peptides: string[] | null
          price_per_mg: number | null
          purity_score: number | null
          region: string
          shipping_methods: string[] | null
          shipping_regions: string[] | null
          slug: string
          status: string
          updated_at: string
          website: string | null
          year_founded: string | null
        }
        Insert: {
          coa_verified?: boolean | null
          created_at?: string
          default_currency?: string | null
          description?: string | null
          discount_code?: string | null
          discount_percentage?: number | null
          id?: string
          last_verified?: string | null
          location?: string | null
          logo_url?: string | null
          name: string
          payment_methods?: string[] | null
          peptides?: string[] | null
          price_per_mg?: number | null
          purity_score?: number | null
          region?: string
          shipping_methods?: string[] | null
          shipping_regions?: string[] | null
          slug: string
          status?: string
          updated_at?: string
          website?: string | null
          year_founded?: string | null
        }
        Update: {
          coa_verified?: boolean | null
          created_at?: string
          default_currency?: string | null
          description?: string | null
          discount_code?: string | null
          discount_percentage?: number | null
          id?: string
          last_verified?: string | null
          location?: string | null
          logo_url?: string | null
          name?: string
          payment_methods?: string[] | null
          peptides?: string[] | null
          price_per_mg?: number | null
          purity_score?: number | null
          region?: string
          shipping_methods?: string[] | null
          shipping_regions?: string[] | null
          slug?: string
          status?: string
          updated_at?: string
          website?: string | null
          year_founded?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_admin: { Args: never; Returns: boolean }
    }
    Enums: {
      app_role: "admin" | "moderator" | "user"
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
      app_role: ["admin", "moderator", "user"],
    },
  },
} as const
