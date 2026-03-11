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
      profiles: {
        Row: {
          id: string
          email: string
          full_name: string | null
          avatar_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          full_name?: string | null
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          full_name?: string | null
          avatar_url?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      teams: {
        Row: {
          id: string
          name: string
          slug: string
          description: string | null
          settings: Json
          created_by: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          slug: string
          description?: string | null
          settings?: Json
          created_by?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          name?: string
          description?: string | null
          settings?: Json
          updated_at?: string
        }
        Relationships: []
      }
      team_members: {
        Row: {
          id: string
          team_id: string
          user_id: string
          role: 'admin' | 'editor' | 'viewer'
          invited_by: string | null
          joined_at: string
        }
        Insert: {
          id?: string
          team_id: string
          user_id: string
          role?: 'admin' | 'editor' | 'viewer'
          invited_by?: string | null
          joined_at?: string
        }
        Update: {
          role?: 'admin' | 'editor' | 'viewer'
        }
        Relationships: []
      }
      documents: {
        Row: {
          id: string
          team_id: string
          created_by: string | null
          title: string
          file_name: string
          file_type: string
          file_size: number | null
          storage_path: string
          storage_bucket: string
          status: 'pending' | 'processing' | 'ready' | 'error'
          raw_text: string | null
          ai_summary: string | null
          ai_metadata: Json
          is_public: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          team_id: string
          created_by?: string | null
          title: string
          file_name: string
          file_type: string
          file_size?: number | null
          storage_path: string
          storage_bucket?: string
          status?: 'pending' | 'processing' | 'ready' | 'error'
          raw_text?: string | null
          ai_summary?: string | null
          ai_metadata?: Json
          is_public?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          title?: string
          status?: 'pending' | 'processing' | 'ready' | 'error'
          raw_text?: string | null
          ai_summary?: string | null
          ai_metadata?: Json
          is_public?: boolean
          updated_at?: string
        }
        Relationships: []
      }
      articles: {
        Row: {
          id: string
          team_id: string
          created_by: string | null
          title: string
          content: Json
          content_text: string | null
          excerpt: string | null
          cover_image_url: string | null
          status: 'draft' | 'published' | 'archived'
          is_public: boolean
          view_count: number
          created_at: string
          updated_at: string
          published_at: string | null
        }
        Insert: {
          id?: string
          team_id: string
          created_by?: string | null
          title: string
          content?: Json
          content_text?: string | null
          excerpt?: string | null
          cover_image_url?: string | null
          status?: 'draft' | 'published' | 'archived'
          is_public?: boolean
          view_count?: number
          created_at?: string
          updated_at?: string
          published_at?: string | null
        }
        Update: {
          title?: string
          content?: Json
          content_text?: string | null
          excerpt?: string | null
          cover_image_url?: string | null
          status?: 'draft' | 'published' | 'archived'
          is_public?: boolean
          view_count?: number
          updated_at?: string
          published_at?: string | null
        }
        Relationships: []
      }
      tags: {
        Row: {
          id: string
          team_id: string
          name: string
          slug: string
          color: string
          created_by: string | null
          created_at: string
        }
        Insert: {
          id?: string
          team_id: string
          name: string
          slug: string
          color?: string
          created_by?: string | null
          created_at?: string
        }
        Update: {
          name?: string
          color?: string
        }
        Relationships: []
      }
      content_tags: {
        Row: {
          id: string
          tag_id: string
          content_type: 'document' | 'article' | 'contact' | 'idea'
          content_id: string
          created_at: string
        }
        Insert: {
          id?: string
          tag_id: string
          content_type: 'document' | 'article' | 'contact' | 'idea'
          content_id: string
          created_at?: string
        }
        Update: {
          id?: string
          tag_id?: string
          content_type?: 'document' | 'article' | 'contact' | 'idea'
          content_id?: string
          created_at?: string
        }
        Relationships: []
      }
      contacts: {
        Row: {
          id: string
          team_id: string
          created_by: string | null
          name: string
          email: string | null
          phone: string | null
          company: string | null
          title: string | null
          linkedin_url: string | null
          notes: string | null
          source_document_id: string | null
          metadata: Json
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          team_id: string
          created_by?: string | null
          name: string
          email?: string | null
          phone?: string | null
          company?: string | null
          title?: string | null
          linkedin_url?: string | null
          notes?: string | null
          source_document_id?: string | null
          metadata?: Json
          created_at?: string
          updated_at?: string
        }
        Update: {
          name?: string
          email?: string | null
          phone?: string | null
          company?: string | null
          title?: string | null
          linkedin_url?: string | null
          notes?: string | null
          metadata?: Json
          updated_at?: string
        }
        Relationships: []
      }
      ideas: {
        Row: {
          id: string
          team_id: string
          created_by: string | null
          title: string
          description: string | null
          category: string | null
          priority: 'low' | 'medium' | 'high'
          status: 'new' | 'in-review' | 'approved' | 'rejected' | 'archived'
          source_document_id: string | null
          metadata: Json
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          team_id: string
          created_by?: string | null
          title: string
          description?: string | null
          category?: string | null
          priority?: 'low' | 'medium' | 'high'
          status?: 'new' | 'in-review' | 'approved' | 'rejected' | 'archived'
          source_document_id?: string | null
          metadata?: Json
          created_at?: string
          updated_at?: string
        }
        Update: {
          title?: string
          description?: string | null
          category?: string | null
          priority?: 'low' | 'medium' | 'high'
          status?: 'new' | 'in-review' | 'approved' | 'rejected' | 'archived'
          metadata?: Json
          updated_at?: string
        }
        Relationships: []
      }
      tasks: {
        Row: {
          id: string
          team_id: string
          created_by: string | null
          assigned_to: string | null
          title: string
          description: string | null
          status: 'todo' | 'in-progress' | 'done' | 'cancelled'
          priority: 'low' | 'medium' | 'high'
          due_date: string | null
          source_document_id: string | null
          source_article_id: string | null
          metadata: Json
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          team_id: string
          created_by?: string | null
          assigned_to?: string | null
          title: string
          description?: string | null
          status?: 'todo' | 'in-progress' | 'done' | 'cancelled'
          priority?: 'low' | 'medium' | 'high'
          due_date?: string | null
          source_document_id?: string | null
          source_article_id?: string | null
          metadata?: Json
          created_at?: string
          updated_at?: string
        }
        Update: {
          title?: string
          description?: string | null
          status?: 'todo' | 'in-progress' | 'done' | 'cancelled'
          priority?: 'low' | 'medium' | 'high'
          due_date?: string | null
          assigned_to?: string | null
          metadata?: Json
          updated_at?: string
        }
        Relationships: []
      }
      comments: {
        Row: {
          id: string
          team_id: string
          created_by: string | null
          content_type: 'document' | 'article' | 'idea' | 'task'
          content_id: string
          parent_id: string | null
          body: string
          is_resolved: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          team_id: string
          created_by?: string | null
          content_type: 'document' | 'article' | 'idea' | 'task'
          content_id: string
          parent_id?: string | null
          body: string
          is_resolved?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          body?: string
          is_resolved?: boolean
          updated_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

// Convenience row types
export type Profile = Database['public']['Tables']['profiles']['Row']
export type Team = Database['public']['Tables']['teams']['Row']
export type TeamMember = Database['public']['Tables']['team_members']['Row']
export type Document = Database['public']['Tables']['documents']['Row']
export type Article = Database['public']['Tables']['articles']['Row']
export type Tag = Database['public']['Tables']['tags']['Row']
export type ContentTag = Database['public']['Tables']['content_tags']['Row']
export type Contact = Database['public']['Tables']['contacts']['Row']
export type Idea = Database['public']['Tables']['ideas']['Row']
export type Task = Database['public']['Tables']['tasks']['Row']
export type Comment = Database['public']['Tables']['comments']['Row']

export type UserRole = 'admin' | 'editor' | 'viewer'
