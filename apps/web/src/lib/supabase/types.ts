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
      admin_users: {
        Row: {
          created_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          user_id?: string
        }
        Relationships: []
      }
      audit_submissions: {
        Row: {
          auditor_id: string
          hallazgos: Json
          id: string
          puntaje_wcag: number | null
          recomendaciones: string | null
          resumen: string
          submitted_at: string
          ticket_id: string
        }
        Insert: {
          auditor_id: string
          hallazgos?: Json
          id?: string
          puntaje_wcag?: number | null
          recomendaciones?: string | null
          resumen: string
          submitted_at?: string
          ticket_id: string
        }
        Update: {
          auditor_id?: string
          hallazgos?: Json
          id?: string
          puntaje_wcag?: number | null
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
      cobertura_config: {
        Row: {
          categoria: string
          created_at: string
          id: string
          iso_code: string
          pais: string
          umbral_minimo: number
          updated_at: string
        }
        Insert: {
          categoria: string
          created_at?: string
          id?: string
          iso_code: string
          pais: string
          umbral_minimo?: number
          updated_at?: string
        }
        Update: {
          categoria?: string
          created_at?: string
          id?: string
          iso_code?: string
          pais?: string
          umbral_minimo?: number
          updated_at?: string
        }
        Relationships: []
      }
      audit_wcag_results: {
        Row: {
          audit_submission_id: string
          created_at: string
          criterio_codigo: string
          id: string
          notas: string | null
          resultado: Database["public"]["Enums"]["wcag_result_enum"]
        }
        Insert: {
          audit_submission_id: string
          created_at?: string
          criterio_codigo: string
          id?: string
          notas?: string | null
          resultado?: Database["public"]["Enums"]["wcag_result_enum"]
        }
        Update: {
          audit_submission_id?: string
          created_at?: string
          criterio_codigo?: string
          id?: string
          notas?: string | null
          resultado?: Database["public"]["Enums"]["wcag_result_enum"]
        }
        Relationships: [
          {
            foreignKeyName: "audit_wcag_results_audit_submission_id_fkey"
            columns: ["audit_submission_id"]
            isOneToOne: false
            referencedRelation: "audit_submissions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "audit_wcag_results_criterio_codigo_fkey"
            columns: ["criterio_codigo"]
            isOneToOne: false
            referencedRelation: "wcag_criterios"
            referencedColumns: ["codigo"]
          },
        ]
      }
      wcag_criterios: {
        Row: {
          codigo: string
          directriz: string
          es_21: boolean
          nivel: string
          nombre: string
          principio: string
        }
        Insert: {
          codigo: string
          directriz: string
          es_21?: boolean
          nivel: string
          nombre: string
          principio: string
        }
        Update: {
          codigo?: string
          directriz?: string
          es_21?: boolean
          nivel?: string
          nombre?: string
          principio?: string
        }
        Relationships: []
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
      legislacion_pais: {
        Row: {
          id: string
          pais: string
          iso_code: string
          ley_nombre: string
          ley_descripcion: string
          url_referencia: string | null
          obliga_sector: string[]
          nivel_sancion: 'alto' | 'medio' | 'bajo' | 'ninguno'
          ambito: 'web' | 'edificios' | 'transporte' | 'general'
          vigente: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          pais: string
          iso_code: string
          ley_nombre: string
          ley_descripcion: string
          url_referencia?: string | null
          obliga_sector?: string[]
          nivel_sancion: 'alto' | 'medio' | 'bajo' | 'ninguno'
          ambito?: 'web' | 'edificios' | 'transporte' | 'general'
          vigente?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          pais?: string
          iso_code?: string
          ley_nombre?: string
          ley_descripcion?: string
          url_referencia?: string | null
          obliga_sector?: string[]
          nivel_sancion?: 'alto' | 'medio' | 'bajo' | 'ninguno'
          ambito?: 'web' | 'edificios' | 'transporte' | 'general'
          vigente?: boolean
          created_at?: string
          updated_at?: string
        }
        Relationships: []
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
      lighthouse_snapshots: {
        Row: {
          accessibility_score: number | null
          alias: string
          categoria: string
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
      volunteer_applications: {
        Row: {
          created_at: string
          email_contacto: string | null
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
          email_contacto?: string | null
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
          email_contacto?: string | null
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
          reporter_email: string | null
          reporter_nombre: string | null
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
          reporter_email?: string | null
          reporter_nombre?: string | null
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
          reporter_email?: string | null
          reporter_nombre?: string | null
          resolved_at?: string | null
          titulo?: string
          updated_at?: string
          url_afectada?: string | null
        }
        Relationships: []
      }
      criterios_distintivo: {
        Row: {
          beneficios: string[]
          created_at: string
          descripcion: string | null
          id: string
          min_experiencias_accesibles: number
          min_flujos_accesibles: number
          min_porcentaje_accesibilidad: number
          min_tareas_accesibles: number
          nivel: Database["public"]["Enums"]["badge_nivel"]
          vigencia_meses: number
        }
        Insert: {
          beneficios?: string[]
          created_at?: string
          descripcion?: string | null
          id?: string
          min_experiencias_accesibles: number
          min_flujos_accesibles: number
          min_porcentaje_accesibilidad: number
          min_tareas_accesibles: number
          nivel: Database["public"]["Enums"]["badge_nivel"]
          vigencia_meses?: number
        }
        Update: {
          beneficios?: string[]
          created_at?: string
          descripcion?: string | null
          id?: string
          min_experiencias_accesibles?: number
          min_flujos_accesibles?: number
          min_porcentaje_accesibilidad?: number
          min_tareas_accesibles?: number
          nivel?: Database["public"]["Enums"]["badge_nivel"]
          vigencia_meses?: number
        }
        Relationships: []
      }
      distintivo_reauditorias: {
        Row: {
          id: string
          distintivo_id: string
          tipo: 'ok' | 'regresion' | 'renovacion' | 'sin_datos'
          url_verificada: string | null
          score_encontrado: number | null
          score_minimo: number
          cumple_score: boolean | null
          alerta_enviada: boolean
          notas: string | null
          checked_at: string
        }
        Insert: {
          id?: string
          distintivo_id: string
          tipo: 'ok' | 'regresion' | 'renovacion' | 'sin_datos'
          url_verificada?: string | null
          score_encontrado?: number | null
          score_minimo: number
          cumple_score?: boolean | null
          alerta_enviada?: boolean
          notas?: string | null
          checked_at?: string
        }
        Update: {
          id?: string
          distintivo_id?: string
          tipo?: 'ok' | 'regresion' | 'renovacion' | 'sin_datos'
          url_verificada?: string | null
          score_encontrado?: number | null
          score_minimo?: number
          cumple_score?: boolean | null
          alerta_enviada?: boolean
          notas?: string | null
          checked_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "distintivo_reauditorias_distintivo_id_fkey"
            columns: ["distintivo_id"]
            isOneToOne: false
            referencedRelation: "distintivos_emitidos"
            referencedColumns: ["id"]
          },
        ]
      }
      distintivos_emitidos: {
        Row: {
          alerta_regresion: boolean
          alerta_vencimiento_enviada: boolean
          badge_pdf_url: string | null
          badge_svg_url: string | null
          created_at: string
          embed_html: string | null
          fecha_emision: string
          fecha_revocacion: string | null
          fecha_vencimiento: string
          folio: string
          id: string
          motivo_revocacion: string | null
          nivel: Database["public"]["Enums"]["badge_nivel"]
          organizacion_id: string
          solicitud_id: string
          ultimo_check_at: string | null
          ultimo_score: number | null
          vigente: boolean
        }
        Insert: {
          alerta_regresion?: boolean
          alerta_vencimiento_enviada?: boolean
          badge_pdf_url?: string | null
          badge_svg_url?: string | null
          created_at?: string
          embed_html?: string | null
          fecha_emision?: string
          fecha_revocacion?: string | null
          fecha_vencimiento: string
          folio?: string
          id?: string
          motivo_revocacion?: string | null
          nivel: Database["public"]["Enums"]["badge_nivel"]
          organizacion_id: string
          solicitud_id: string
          ultimo_check_at?: string | null
          ultimo_score?: number | null
          vigente?: boolean
        }
        Update: {
          alerta_regresion?: boolean
          alerta_vencimiento_enviada?: boolean
          badge_pdf_url?: string | null
          badge_svg_url?: string | null
          created_at?: string
          embed_html?: string | null
          fecha_emision?: string
          fecha_revocacion?: string | null
          fecha_vencimiento?: string
          folio?: string
          id?: string
          motivo_revocacion?: string | null
          nivel?: Database["public"]["Enums"]["badge_nivel"]
          organizacion_id?: string
          solicitud_id?: string
          ultimo_check_at?: string | null
          ultimo_score?: number | null
          vigente?: boolean
        }
        Relationships: [
          {
            foreignKeyName: "distintivos_emitidos_organizacion_id_fkey"
            columns: ["organizacion_id"]
            isOneToOne: false
            referencedRelation: "organizaciones_distintivo"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "distintivos_emitidos_solicitud_id_fkey"
            columns: ["solicitud_id"]
            isOneToOne: true
            referencedRelation: "solicitudes_distintivo"
            referencedColumns: ["id"]
          },
        ]
      }
      etapas_progreso: {
        Row: {
          archivos_evidencia: string[]
          created_at: string
          curso_id: string | null
          enrollment_completado: boolean
          estado: Database["public"]["Enums"]["etapa_estado"]
          etapa: Database["public"]["Enums"]["etapa_programa"]
          fecha_completada: string | null
          fecha_inicio: string | null
          id: string
          notas: string | null
          solicitud_id: string
          ticket_id: string | null
        }
        Insert: {
          archivos_evidencia?: string[]
          created_at?: string
          curso_id?: string | null
          enrollment_completado?: boolean
          estado?: Database["public"]["Enums"]["etapa_estado"]
          etapa: Database["public"]["Enums"]["etapa_programa"]
          fecha_completada?: string | null
          fecha_inicio?: string | null
          id?: string
          notas?: string | null
          solicitud_id: string
          ticket_id?: string | null
        }
        Update: {
          archivos_evidencia?: string[]
          created_at?: string
          curso_id?: string | null
          enrollment_completado?: boolean
          estado?: Database["public"]["Enums"]["etapa_estado"]
          etapa?: Database["public"]["Enums"]["etapa_programa"]
          fecha_completada?: string | null
          fecha_inicio?: string | null
          id?: string
          notas?: string | null
          solicitud_id?: string
          ticket_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "etapas_progreso_solicitud_id_fkey"
            columns: ["solicitud_id"]
            isOneToOne: false
            referencedRelation: "solicitudes_distintivo"
            referencedColumns: ["id"]
          },
        ]
      }
      organizaciones_distintivo: {
        Row: {
          contacto_email: string
          contacto_nombre: string
          contacto_telefono: string | null
          created_at: string
          descripcion: string | null
          id: string
          logo_url: string | null
          nombre_organizacion: string
          pais: string
          sitio_web: string
          tipo: Database["public"]["Enums"]["tipo_organizacion"]
          updated_at: string
          user_id: string
        }
        Insert: {
          contacto_email: string
          contacto_nombre: string
          contacto_telefono?: string | null
          created_at?: string
          descripcion?: string | null
          id?: string
          logo_url?: string | null
          nombre_organizacion: string
          pais?: string
          sitio_web: string
          tipo: Database["public"]["Enums"]["tipo_organizacion"]
          updated_at?: string
          user_id: string
        }
        Update: {
          contacto_email?: string
          contacto_nombre?: string
          contacto_telefono?: string | null
          created_at?: string
          descripcion?: string | null
          id?: string
          logo_url?: string | null
          nombre_organizacion?: string
          pais?: string
          sitio_web?: string
          tipo?: Database["public"]["Enums"]["tipo_organizacion"]
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      solicitudes_distintivo: {
        Row: {
          auditor_id: string | null
          created_at: string
          estado: Database["public"]["Enums"]["solicitud_distintivo_status"]
          etapa_actual: Database["public"]["Enums"]["etapa_programa"] | null
          experiencias_accesibles: number
          fecha_auditoria: string | null
          fecha_emision: string | null
          fecha_inicio_programa: string | null
          fecha_solicitud: string
          flujos_accesibles: number
          folio: string
          id: string
          nivel_otorgado: Database["public"]["Enums"]["badge_nivel"] | null
          nivel_solicitado: Database["public"]["Enums"]["badge_nivel"]
          notas_admin: string | null
          organizacion_id: string
          tareas_accesibles: number
          ticket_id: string | null
          total_experiencias: number
          total_flujos: number
          total_tareas: number
          updated_at: string
        }
        Insert: {
          auditor_id?: string | null
          created_at?: string
          estado?: Database["public"]["Enums"]["solicitud_distintivo_status"]
          etapa_actual?: Database["public"]["Enums"]["etapa_programa"] | null
          experiencias_accesibles?: number
          fecha_auditoria?: string | null
          fecha_emision?: string | null
          fecha_inicio_programa?: string | null
          fecha_solicitud?: string
          flujos_accesibles?: number
          folio?: string
          id?: string
          nivel_otorgado?: Database["public"]["Enums"]["badge_nivel"] | null
          nivel_solicitado: Database["public"]["Enums"]["badge_nivel"]
          notas_admin?: string | null
          organizacion_id: string
          tareas_accesibles?: number
          ticket_id?: string | null
          total_experiencias?: number
          total_flujos?: number
          total_tareas?: number
          updated_at?: string
        }
        Update: {
          auditor_id?: string | null
          created_at?: string
          estado?: Database["public"]["Enums"]["solicitud_distintivo_status"]
          etapa_actual?: Database["public"]["Enums"]["etapa_programa"] | null
          experiencias_accesibles?: number
          fecha_auditoria?: string | null
          fecha_emision?: string | null
          fecha_inicio_programa?: string | null
          fecha_solicitud?: string
          flujos_accesibles?: number
          folio?: string
          id?: string
          nivel_otorgado?: Database["public"]["Enums"]["badge_nivel"] | null
          nivel_solicitado?: Database["public"]["Enums"]["badge_nivel"]
          notas_admin?: string | null
          organizacion_id?: string
          tareas_accesibles?: number
          ticket_id?: string | null
          total_experiencias?: number
          total_flujos?: number
          total_tareas?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "solicitudes_distintivo_organizacion_id_fkey"
            columns: ["organizacion_id"]
            isOneToOne: false
            referencedRelation: "organizaciones_distintivo"
            referencedColumns: ["id"]
          },
        ]
      }
      notification_log: {
        Row: {
          id: string
          user_id: string | null
          email: string
          type: string
          subject: string
          status: 'sent' | 'failed' | 'skipped'
          error: string | null
          metadata: Record<string, unknown> | null
          sent_at: string
        }
        Insert: {
          id?: string
          user_id?: string | null
          email: string
          type: string
          subject: string
          status: 'sent' | 'failed' | 'skipped'
          error?: string | null
          metadata?: Record<string, unknown> | null
          sent_at?: string
        }
        Update: {
          id?: string
          user_id?: string | null
          email?: string
          type?: string
          subject?: string
          status?: 'sent' | 'failed' | 'skipped'
          error?: string | null
          metadata?: Record<string, unknown> | null
          sent_at?: string
        }
        Relationships: []
      }
      user_profiles: {
        Row: {
          created_at: string
          email: string
          id: string
          nombre_completo: string
          onboarding_complete: boolean
          pais: string | null
          roles: Database['public']['Enums']['rol_usuario'][]
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          nombre_completo: string
          onboarding_complete?: boolean
          pais?: string | null
          roles?: Database['public']['Enums']['rol_usuario'][]
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          nombre_completo?: string
          onboarding_complete?: boolean
          pais?: string | null
          roles?: Database['public']['Enums']['rol_usuario'][]
          updated_at?: string
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
      v_cobertura_pais: {
        Row: {
          categoria: string | null
          cumple_umbral: boolean | null
          iso_code: string | null
          pais: string | null
          porcentaje: number | null
          sitios_auditados: number | null
          umbral_minimo: number | null
        }
        Relationships: []
      }
      v_cobertura_resumen: {
        Row: {
          auditados_total: number | null
          categorias_completas: number | null
          categorias_total: number | null
          iso_code: string | null
          meta_total: number | null
          pais: string | null
          porcentaje_global: number | null
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
      badge_nivel: "oro" | "platino" | "diamante"
      rol_usuario: "general" | "voluntario" | "auditor" | "estudiante"
      etapa_estado: "pendiente" | "en_curso" | "completada" | "omitida"
      etapa_programa:
        | "concientizacion"
        | "capacitacion"
        | "auditoria"
        | "remediacion"
        | "design_ops"
        | "politicas"
        | "declaratoria"
      solicitud_distintivo_status:
        | "borrador"
        | "enviada"
        | "en_revision"
        | "aprobada_para_programa"
        | "en_programa"
        | "auditada"
        | "distintivo_emitido"
        | "rechazada"
        | "suspendida"
        | "revocada"
      tipo_organizacion: "publica" | "privada" | "mixta" | "ong"
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
      wcag_result_enum: "cumple" | "no_cumple" | "no_aplica" | "no_evaluado"
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
      badge_nivel: ["oro", "platino", "diamante"],
      etapa_estado: ["pendiente", "en_curso", "completada", "omitida"],
      etapa_programa: [
        "concientizacion",
        "capacitacion",
        "auditoria",
        "remediacion",
        "design_ops",
        "politicas",
        "declaratoria",
      ],
      solicitud_distintivo_status: [
        "borrador",
        "enviada",
        "en_revision",
        "aprobada_para_programa",
        "en_programa",
        "auditada",
        "distintivo_emitido",
        "rechazada",
        "suspendida",
        "revocada",
      ],
      tipo_organizacion: ["publica", "privada", "mixta", "ong"],
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
