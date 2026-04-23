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
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      audit_submissions: {
        Row: {
          auditor_id: string
          hallazgos: Json
          id: string
          recomendaciones: string | null
          resumen: string
          submitted_at: string
          ticket_id: string
        }
        Insert: {
          auditor_id: string
          hallazgos?: Json
          id?: string
          recomendaciones?: string | null
          resumen: string
          submitted_at?: string
          ticket_id: string
        }
        Update: {
          auditor_id?: string
          hallazgos?: Json
          id?: string
          recomendaciones?: string | null
          resumen?: string
          submitted_at?: string
          ticket_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "audit_submissions_auditor_id_fkey"
            columns: ["auditor_id"]
            isOneToOne: false
            referencedRelation: "auditor_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "audit_submissions_ticket_id_fkey"
            columns: ["ticket_id"]
            isOneToOne: false
            referencedRelation: "tickets"
            referencedColumns: ["id"]
          },
        ]
      }
      auditor_learning_path: {
        Row: {
          course_id: string
          created_at: string
          id: string
          obligatorio: boolean
          orden: number
        }
        Insert: {
          course_id: string
          created_at?: string
          id?: string
          obligatorio?: boolean
          orden?: number
        }
        Update: {
          course_id?: string
          created_at?: string
          id?: string
          obligatorio?: boolean
          orden?: number
        }
        Relationships: [
          {
            foreignKeyName: "auditor_learning_path_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: true
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
        ]
      }
      auditor_profiles: {
        Row: {
          certified_at: string | null
          created_at: string
          estado: Database["public"]["Enums"]["auditor_status"]
          id: string
          nombre_completo: string
          pais: string
          updated_at: string
          user_id: string
        }
        Insert: {
          certified_at?: string | null
          created_at?: string
          estado?: Database["public"]["Enums"]["auditor_status"]
          id?: string
          nombre_completo: string
          pais: string
          updated_at?: string
          user_id: string
        }
        Update: {
          certified_at?: string | null
          created_at?: string
          estado?: Database["public"]["Enums"]["auditor_status"]
          id?: string
          nombre_completo?: string
          pais?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      accessibility_scores: {
        Row: {
          id: string
          lhci_report_url: string | null
          measured_at: string
          measured_by: string | null
          score_a11y: number | null
          score_bp: number | null
          score_perf: number | null
          score_seo: number | null
          score_total: number | null
          url: string
          violations: Json | null
        }
        Insert: {
          id?: string
          lhci_report_url?: string | null
          measured_at?: string
          measured_by?: string | null
          score_a11y?: number | null
          score_bp?: number | null
          score_perf?: number | null
          score_seo?: number | null
          score_total?: number | null
          url: string
          violations?: Json | null
        }
        Update: {
          id?: string
          lhci_report_url?: string | null
          measured_at?: string
          measured_by?: string | null
          score_a11y?: number | null
          score_bp?: number | null
          score_perf?: number | null
          score_seo?: number | null
          score_total?: number | null
          url?: string
          violations?: Json | null
        }
        Relationships: []
      }
      certificates: {
        Row: {
          course_id: string
          course_title: string
          folio: string
          id: string
          issued_at: string
          storage_path: string | null
          student_name: string
          user_id: string
        }
        Insert: {
          course_id: string
          course_title: string
          folio: string
          id?: string
          issued_at?: string
          storage_path?: string | null
          student_name: string
          user_id: string
        }
        Update: {
          course_id?: string
          course_title?: string
          folio?: string
          id?: string
          issued_at?: string
          storage_path?: string | null
          student_name?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "certificates_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
        ]
      }
      courses: {
        Row: {
          created_at: string
          descripcion: string | null
          id: string
          published: boolean
          slug: string
          thumbnail: string | null
          titulo: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          descripcion?: string | null
          id?: string
          published?: boolean
          slug: string
          thumbnail?: string | null
          titulo: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          descripcion?: string | null
          id?: string
          published?: boolean
          slug?: string
          thumbnail?: string | null
          titulo?: string
          updated_at?: string
        }
        Relationships: []
      }
      enrollments: {
        Row: {
          completed_at: string | null
          course_id: string
          enrolled_at: string
          estado: Database["public"]["Enums"]["enrollment_status"]
          id: string
          progress: number
          user_id: string
        }
        Insert: {
          completed_at?: string | null
          course_id: string
          enrolled_at?: string
          estado?: Database["public"]["Enums"]["enrollment_status"]
          id?: string
          progress?: number
          user_id: string
        }
        Update: {
          completed_at?: string | null
          course_id?: string
          enrolled_at?: string
          estado?: Database["public"]["Enums"]["enrollment_status"]
          id?: string
          progress?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "enrollments_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
        ]
      }
      lesson_progress: {
        Row: {
          completed: boolean
          completed_at: string | null
          id: string
          lesson_id: string
          user_id: string
        }
        Insert: {
          completed?: boolean
          completed_at?: string | null
          id?: string
          lesson_id: string
          user_id: string
        }
        Update: {
          completed?: boolean
          completed_at?: string | null
          id?: string
          lesson_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "lesson_progress_lesson_id_fkey"
            columns: ["lesson_id"]
            isOneToOne: false
            referencedRelation: "lessons"
            referencedColumns: ["id"]
          },
        ]
      }
      lessons: {
        Row: {
          contenido: string | null
          course_id: string
          created_at: string
          duracion_min: number | null
          id: string
          orden: number
          published: boolean
          tipo: Database["public"]["Enums"]["lesson_type"]
          titulo: string
        }
        Insert: {
          contenido?: string | null
          course_id: string
          created_at?: string
          duracion_min?: number | null
          id?: string
          orden?: number
          published?: boolean
          tipo?: Database["public"]["Enums"]["lesson_type"]
          titulo: string
        }
        Update: {
          contenido?: string | null
          course_id?: string
          created_at?: string
          duracion_min?: number | null
          id?: string
          orden?: number
          published?: boolean
          tipo?: Database["public"]["Enums"]["lesson_type"]
          titulo?: string
        }
        Relationships: [
          {
            foreignKeyName: "lessons_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
        ]
      }
      lighthouse_metrics: {
        Row: {
          accessibility_score: number | null
          alias: string
          categoria: string
          created_at: string
          critical_issues: Json
          id: string
          measured_at: string
          nombre_sitio: string
          pais: string
          subcategoria: string | null
          url: string
        }
        Insert: {
          accessibility_score?: number | null
          alias: string
          categoria: string
          created_at?: string
          critical_issues?: Json
          id?: string
          measured_at?: string
          nombre_sitio: string
          pais: string
          subcategoria?: string | null
          url: string
        }
        Update: {
          accessibility_score?: number | null
          alias?: string
          categoria?: string
          created_at?: string
          critical_issues?: Json
          id?: string
          measured_at?: string
          nombre_sitio?: string
          pais?: string
          subcategoria?: string | null
          url?: string
        }
        Relationships: []
      }
      ticket_events: {
        Row: {
          created_at: string
          evento: string
          id: string
          payload: Json | null
          ticket_id: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          evento: string
          id?: string
          payload?: Json | null
          ticket_id: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          evento?: string
          id?: string
          payload?: Json | null
          ticket_id?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "ticket_events_ticket_id_fkey"
            columns: ["ticket_id"]
            isOneToOne: false
            referencedRelation: "tickets"
            referencedColumns: ["id"]
          },
        ]
      }
      tickets: {
        Row: {
          assigned_to: string | null
          categoria: Database["public"]["Enums"]["ticket_category"]
          created_at: string
          created_by: string | null
          descripcion: string
          estado: Database["public"]["Enums"]["ticket_status"]
          folio: string
          id: string
          prioridad: Database["public"]["Enums"]["ticket_priority"]
          resolved_at: string | null
          titulo: string
          updated_at: string
          url_afectada: string | null
        }
        Insert: {
          assigned_to?: string | null
          categoria?: Database["public"]["Enums"]["ticket_category"]
          created_at?: string
          created_by?: string | null
          descripcion: string
          estado?: Database["public"]["Enums"]["ticket_status"]
          folio: string
          id?: string
          prioridad?: Database["public"]["Enums"]["ticket_priority"]
          resolved_at?: string | null
          titulo: string
          updated_at?: string
          url_afectada?: string | null
        }
        Update: {
          assigned_to?: string | null
          categoria?: Database["public"]["Enums"]["ticket_category"]
          created_at?: string
          created_by?: string | null
          descripcion?: string
          estado?: Database["public"]["Enums"]["ticket_status"]
          folio?: string
          id?: string
          prioridad?: Database["public"]["Enums"]["ticket_priority"]
          resolved_at?: string | null
          titulo?: string
          updated_at?: string
          url_afectada?: string | null
        }
        Relationships: []
      }
      volunteer_applications: {
        Row: {
          created_at: string
          estado: Database["public"]["Enums"]["application_status"]
          experiencia_previa: string | null
          id: string
          motivacion: string
          nombre_completo: string
          pais: string
          reviewed_at: string | null
          reviewed_by: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          estado?: Database["public"]["Enums"]["application_status"]
          experiencia_previa?: string | null
          id?: string
          motivacion: string
          nombre_completo: string
          pais: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          estado?: Database["public"]["Enums"]["application_status"]
          experiencia_previa?: string | null
          id?: string
          motivacion?: string
          nombre_completo?: string
          pais?: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      v_a11y_ranking_by_pais: {
        Row: {
          avg_score: number | null
          criticos: number | null
          pais: string | null
          total_sitios: number | null
        }
        Relationships: []
      }
    }
    Functions: {
      show_limit: { Args: never; Returns: number }
      show_trgm: { Args: { "": string }; Returns: string[] }
    }
    Enums: {
      application_status: "pendiente" | "aprobado" | "rechazado"
      auditor_status:
        | "en_formacion"
        | "certificado"
        | "activo"
        | "inactivo"
        | "suspendido"
      enrollment_status: "inscrito" | "en_curso" | "completado" | "abandonado"
      lesson_type: "video" | "lectura" | "ejercicio" | "evaluacion"
      ticket_category: "digital" | "fisico" | "comunicacion" | "servicio"
      ticket_priority: "baja" | "media" | "alta" | "critica"
      ticket_status:
        | "abierto"
        | "en_revision"
        | "en_progreso"
        | "resuelto"
        | "cerrado"
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
      application_status: ["pendiente", "aprobado", "rechazado"],
      auditor_status: [
        "en_formacion",
        "certificado",
        "activo",
        "inactivo",
        "suspendido",
      ],
      enrollment_status: ["inscrito", "en_curso", "completado", "abandonado"],
      lesson_type: ["video", "lectura", "ejercicio", "evaluacion"],
      ticket_category: ["digital", "fisico", "comunicacion", "servicio"],
      ticket_priority: ["baja", "media", "alta", "critica"],
      ticket_status: [
        "abierto",
        "en_revision",
        "en_progreso",
        "resuelto",
        "cerrado",
      ],
    },
  },
} as const
