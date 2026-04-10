// Tipos generados por: supabase gen types typescript --local > src/lib/supabase/types.ts
// Re-ejecutar tras cada migración de base de datos.

export type Json = string | number | boolean | null | { [key: string]: Json } | Json[]

export type TicketStatus = 'abierto' | 'en_revision' | 'en_progreso' | 'resuelto' | 'cerrado'
export type TicketPriority = 'baja' | 'media' | 'alta' | 'critica'
export type TicketCategory = 'digital' | 'fisico' | 'comunicacion' | 'servicio'

export interface Database {
  public: {
    Tables: {
      tickets: {
        Row: {
          id: string
          folio: string
          titulo: string
          descripcion: string
          categoria: TicketCategory
          prioridad: TicketPriority
          estado: TicketStatus
          url_afectada: string | null
          created_by: string | null
          assigned_to: string | null
          created_at: string
          updated_at: string
          resolved_at: string | null
        }
        Insert: Omit<Database['public']['Tables']['tickets']['Row'], 'id' | 'folio' | 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['tickets']['Insert']>
      }
      accessibility_scores: {
        Row: {
          id: string
          url: string
          score_total: number | null
          score_a11y: number | null
          score_perf: number | null
          score_seo: number | null
          score_bp: number | null
          violations: Json | null
          lhci_report_url: string | null
          measured_at: string
          measured_by: string | null
        }
        Insert: Omit<Database['public']['Tables']['accessibility_scores']['Row'], 'id' | 'measured_at'>
        Update: Partial<Database['public']['Tables']['accessibility_scores']['Insert']>
      }
      courses: {
        Row: {
          id: string
          slug: string
          titulo: string
          descripcion: string | null
          thumbnail: string | null
          published: boolean
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['courses']['Row'], 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['courses']['Insert']>
      }
      enrollments: {
        Row: {
          id: string
          user_id: string
          course_id: string
          estado: 'inscrito' | 'en_curso' | 'completado' | 'abandonado'
          progress: number
          enrolled_at: string
          completed_at: string | null
        }
        Insert: Omit<Database['public']['Tables']['enrollments']['Row'], 'id' | 'enrolled_at'>
        Update: Partial<Database['public']['Tables']['enrollments']['Insert']>
      }
    }
  }
}
