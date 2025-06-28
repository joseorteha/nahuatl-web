export type Json = | string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          full_name: string;
          email: string;
          username: string | null;
          avatar_url: string | null;
          created_at: string;
          updated_at: string;
          is_beta_tester: boolean;
          feedback_count: number;
        };
        Insert: {
          id: string;
          full_name: string;
          email: string;
          username?: string | null;
          avatar_url?: string | null;
          created_at?: string;
          updated_at?: string;
          is_beta_tester?: boolean;
          feedback_count?: number;
        };
        Update: {
          id?: string;
          full_name?: string;
          email?: string;
          username?: string | null;
          avatar_url?: string | null;
          created_at?: string;
          updated_at?: string;
          is_beta_tester?: boolean;
          feedback_count?: number;
        };
        Relationships: [
          {
            foreignKeyName: "profiles_id_fkey";
            columns: ["id"];
            referencedRelation: "users";
            referencedColumns: ["id"];
          }
        ];
      };
      feedback: {
        Row: {
          id: string;
          user_id: string;
          title: string;
          content: string;
          category: 'suggestion' | 'bug_report' | 'feature_request' | 'general';
          status: 'pending' | 'reviewed' | 'implemented' | 'declined';
          priority: 'low' | 'medium' | 'high' | 'critical';
          likes_count: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          title: string;
          content: string;
          category?: 'suggestion' | 'bug_report' | 'feature_request' | 'general';
          status?: 'pending' | 'reviewed' | 'implemented' | 'declined';
          priority?: 'low' | 'medium' | 'high' | 'critical';
          likes_count?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          title?: string;
          content?: string;
          category?: 'suggestion' | 'bug_report' | 'feature_request' | 'general';
          status?: 'pending' | 'reviewed' | 'implemented' | 'declined';
          priority?: 'low' | 'medium' | 'high' | 'critical';
          likes_count?: number;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "feedback_user_id_fkey";
            columns: ["user_id"];
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          }
        ];
      };
      feedback_likes: {
        Row: {
          id: string;
          feedback_id: string;
          user_id: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          feedback_id: string;
          user_id: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          feedback_id?: string;
          user_id?: string;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "feedback_likes_feedback_id_fkey";
            columns: ["feedback_id"];
            referencedRelation: "feedback";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "feedback_likes_user_id_fkey";
            columns: ["user_id"];
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          }
        ];
      };
      feedback_replies: {
        Row: {
          id: string;
          feedback_id: string;
          user_id: string;
          content: string;
          is_admin_reply: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          feedback_id: string;
          user_id: string;
          content: string;
          is_admin_reply?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          feedback_id?: string;
          user_id?: string;
          content?: string;
          is_admin_reply?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "feedback_replies_feedback_id_fkey";
            columns: ["feedback_id"];
            referencedRelation: "feedback";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "feedback_replies_user_id_fkey";
            columns: ["user_id"];
            referencedRelation: "profiles";
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
