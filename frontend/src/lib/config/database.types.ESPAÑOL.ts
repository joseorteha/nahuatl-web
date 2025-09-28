export type Json = | string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export interface Database {
  public: {
    Tables: {
      perfiles: {
        Row: {
          id: string;
          nombre_completo: string;
          email: string;
          username: string | null;
          url_avatar: string | null;
          fecha_creacion: string;
          fecha_actualizacion: string;
          es_beta_tester: boolean;
          contador_feedback: number;
          password: string | null;
        };
        Insert: {
          id?: string;
          nombre_completo: string;
          email: string;
          username?: string | null;
          url_avatar?: string | null;
          fecha_creacion?: string;
          fecha_actualizacion?: string;
          es_beta_tester?: boolean;
          contador_feedback?: number;
          password?: string | null;
        };
        Update: {
          id?: string;
          nombre_completo?: string;
          email?: string;
          username?: string | null;
          url_avatar?: string | null;
          fecha_creacion?: string;
          fecha_actualizacion?: string;
          es_beta_tester?: boolean;
          contador_feedback?: number;
          password?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "perfiles_id_fkey";
            columns: ["id"];
            referencedRelation: "users";
            referencedColumns: ["id"];
          }
        ];
      };
      diccionario: {
        Row: {
          id: string;
          word: string;
          variants: string[] | null;
          info_gramatical: string | null;
          definition: string;
          nombre_cientifico: string | null;
          examples: Json | null;
          synonyms: string[] | null;
          roots: string[] | null;
          ver_tambien: string[] | null;
          ortografias_alternativas: string[] | null;
          notes: string[] | null;
          fecha_creacion: string;
          fecha_actualizacion: string;
          usuario_id: string | null;
        };
        Insert: {
          id?: string;
          word: string;
          variants?: string[] | null;
          info_gramatical?: string | null;
          definition: string;
          nombre_cientifico?: string | null;
          examples?: Json | null;
          synonyms?: string[] | null;
          roots?: string[] | null;
          ver_tambien?: string[] | null;
          ortografias_alternativas?: string[] | null;
          notes?: string[] | null;
          fecha_creacion?: string;
          fecha_actualizacion?: string;
          usuario_id?: string | null;
        };
        Update: {
          id?: string;
          word?: string;
          variants?: string[] | null;
          info_gramatical?: string | null;
          definition?: string;
          nombre_cientifico?: string | null;
          examples?: Json | null;
          synonyms?: string[] | null;
          roots?: string[] | null;
          ver_tambien?: string[] | null;
          ortografias_alternativas?: string[] | null;
          notes?: string[] | null;
          fecha_creacion?: string;
          fecha_actualizacion?: string;
          usuario_id?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "diccionario_usuario_id_fkey";
            columns: ["usuario_id"];
            referencedRelation: "perfiles";
            referencedColumns: ["id"];
          }
        ];
      };
      retroalimentacion: {
        Row: {
          id: string;
          usuario_id: string;
          titulo: string;
          contenido: string;
          categoria: 'suggestion' | 'question' | 'issue' | 'other' | 'bug_report' | 'feature_request' | 'general';
          estado: 'pending' | 'reviewed' | 'implemented' | 'declined';
          prioridad: 'low' | 'medium' | 'high' | 'critical';
          contador_likes: number;
          fecha_creacion: string;
          fecha_actualizacion: string;
        };
        Insert: {
          id?: string;
          usuario_id: string;
          titulo: string;
          contenido: string;
          categoria?: 'suggestion' | 'question' | 'issue' | 'other' | 'bug_report' | 'feature_request' | 'general';
          estado?: 'pending' | 'reviewed' | 'implemented' | 'declined';
          prioridad?: 'low' | 'medium' | 'high' | 'critical';
          contador_likes?: number;
          fecha_creacion?: string;
          fecha_actualizacion?: string;
        };
        Update: {
          id?: string;
          usuario_id?: string;
          titulo?: string;
          contenido?: string;
          categoria?: 'suggestion' | 'question' | 'issue' | 'other' | 'bug_report' | 'feature_request' | 'general';
          estado?: 'pending' | 'reviewed' | 'implemented' | 'declined';
          prioridad?: 'low' | 'medium' | 'high' | 'critical';
          contador_likes?: number;
          fecha_creacion?: string;
          fecha_actualizacion?: string;
        };
        Relationships: [
          {
            foreignKeyName: "retroalimentacion_usuario_id_fkey";
            columns: ["usuario_id"];
            referencedRelation: "perfiles";
            referencedColumns: ["id"];
          }
        ];
      };
      retroalimentacion_likes: {
        Row: {
          id: string;
          retroalimentacion_id: string;
          usuario_id: string;
          fecha_creacion: string;
        };
        Insert: {
          id?: string;
          retroalimentacion_id: string;
          usuario_id: string;
          fecha_creacion?: string;
        };
        Update: {
          id?: string;
          retroalimentacion_id?: string;
          usuario_id?: string;
          fecha_creacion?: string;
        };
        Relationships: [
          {
            foreignKeyName: "retroalimentacion_likes_retroalimentacion_id_fkey";
            columns: ["retroalimentacion_id"];
            referencedRelation: "retroalimentacion";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "retroalimentacion_likes_usuario_id_fkey";
            columns: ["usuario_id"];
            referencedRelation: "perfiles";
            referencedColumns: ["id"];
          }
        ];
      };
      retroalimentacion_respuestas: {
        Row: {
          id: string;
          retroalimentacion_id: string;
          usuario_id: string;
          contenido: string;
          es_respuesta_admin: boolean;
          fecha_creacion: string;
          fecha_actualizacion: string;
        };
        Insert: {
          id?: string;
          retroalimentacion_id: string;
          usuario_id: string;
          contenido: string;
          es_respuesta_admin?: boolean;
          fecha_creacion?: string;
          fecha_actualizacion?: string;
        };
        Update: {
          id?: string;
          retroalimentacion_id?: string;
          usuario_id?: string;
          contenido?: string;
          es_respuesta_admin?: boolean;
          fecha_creacion?: string;
          fecha_actualizacion?: string;
        };
        Relationships: [
          {
            foreignKeyName: "retroalimentacion_respuestas_retroalimentacion_id_fkey";
            columns: ["retroalimentacion_id"];
            referencedRelation: "retroalimentacion";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "retroalimentacion_respuestas_usuario_id_fkey";
            columns: ["usuario_id"];
            referencedRelation: "perfiles";
            referencedColumns: ["id"];
          }
        ];
      };
      palabras_guardadas: {
        Row: {
          id: string;
          usuario_id: string;
          diccionario_id: string;
          fecha_creacion: string;
        };
        Insert: {
          id?: string;
          usuario_id: string;
          diccionario_id: string;
          fecha_creacion?: string;
        };
        Update: {
          id?: string;
          usuario_id?: string;
          diccionario_id?: string;
          fecha_creacion?: string;
        };
        Relationships: [
          {
            foreignKeyName: "palabras_guardadas_usuario_id_fkey";
            columns: ["usuario_id"];
            referencedRelation: "perfiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "palabras_guardadas_diccionario_id_fkey";
            columns: ["diccionario_id"];
            referencedRelation: "diccionario";
            referencedColumns: ["id"];
          }
        ];
      };
    };
    Views: { [_ in never]: never };
    Functions: { [_ in never]: never };
    Enums: { [_ in never]: never };
    CompositeTypes: { [_ in never]: never };
  };
}
