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
      analytics_dashboards: {
        Row: {
          created_at: string | null
          created_by: string | null
          deleted_at: string | null
          description: string | null
          id: string
          is_default: boolean | null
          is_shared: boolean | null
          layout: Json | null
          name: string
          organization_id: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          deleted_at?: string | null
          description?: string | null
          id?: string
          is_default?: boolean | null
          is_shared?: boolean | null
          layout?: Json | null
          name: string
          organization_id: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          deleted_at?: string | null
          description?: string | null
          id?: string
          is_default?: boolean | null
          is_shared?: boolean | null
          layout?: Json | null
          name?: string
          organization_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "analytics_dashboards_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "analytics_dashboards_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      analytics_goals: {
        Row: {
          assigned_to: string | null
          created_at: string | null
          created_by: string | null
          current_value: number | null
          description: string | null
          end_date: string
          id: string
          metric_name: string
          metric_source: string
          name: string
          organization_id: string
          progress_history: Json | null
          start_date: string
          target_value: number
          updated_at: string | null
        }
        Insert: {
          assigned_to?: string | null
          created_at?: string | null
          created_by?: string | null
          current_value?: number | null
          description?: string | null
          end_date: string
          id?: string
          metric_name: string
          metric_source: string
          name: string
          organization_id: string
          progress_history?: Json | null
          start_date: string
          target_value: number
          updated_at?: string | null
        }
        Update: {
          assigned_to?: string | null
          created_at?: string | null
          created_by?: string | null
          current_value?: number | null
          description?: string | null
          end_date?: string
          id?: string
          metric_name?: string
          metric_source?: string
          name?: string
          organization_id?: string
          progress_history?: Json | null
          start_date?: string
          target_value?: number
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "analytics_goals_assigned_to_fkey"
            columns: ["assigned_to"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "analytics_goals_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "analytics_goals_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      analytics_reports: {
        Row: {
          created_at: string | null
          created_by: string | null
          dashboard_id: string
          day_of_month: number | null
          day_of_week: number | null
          export_format: string
          frequency: string
          id: string
          is_active: boolean | null
          last_sent_at: string | null
          name: string
          next_send_at: string | null
          organization_id: string
          recipients: string[]
          time_of_day: string | null
          timezone: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          dashboard_id: string
          day_of_month?: number | null
          day_of_week?: number | null
          export_format: string
          frequency: string
          id?: string
          is_active?: boolean | null
          last_sent_at?: string | null
          name: string
          next_send_at?: string | null
          organization_id: string
          recipients?: string[]
          time_of_day?: string | null
          timezone?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          dashboard_id?: string
          day_of_month?: number | null
          day_of_week?: number | null
          export_format?: string
          frequency?: string
          id?: string
          is_active?: boolean | null
          last_sent_at?: string | null
          name?: string
          next_send_at?: string | null
          organization_id?: string
          recipients?: string[]
          time_of_day?: string | null
          timezone?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "analytics_reports_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "analytics_reports_dashboard_id_fkey"
            columns: ["dashboard_id"]
            isOneToOne: false
            referencedRelation: "analytics_dashboards"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "analytics_reports_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      analytics_widgets: {
        Row: {
          color: string | null
          comparison_period: string | null
          config: Json
          created_at: string | null
          dashboard_id: string
          format: string | null
          height: number | null
          id: string
          metric_source: string
          position_x: number | null
          position_y: number | null
          show_comparison: boolean | null
          title: string
          updated_at: string | null
          widget_type: string
          width: number | null
        }
        Insert: {
          color?: string | null
          comparison_period?: string | null
          config?: Json
          created_at?: string | null
          dashboard_id: string
          format?: string | null
          height?: number | null
          id?: string
          metric_source: string
          position_x?: number | null
          position_y?: number | null
          show_comparison?: boolean | null
          title: string
          updated_at?: string | null
          widget_type: string
          width?: number | null
        }
        Update: {
          color?: string | null
          comparison_period?: string | null
          config?: Json
          created_at?: string | null
          dashboard_id?: string
          format?: string | null
          height?: number | null
          id?: string
          metric_source?: string
          position_x?: number | null
          position_y?: number | null
          show_comparison?: boolean | null
          title?: string
          updated_at?: string | null
          widget_type?: string
          width?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "analytics_widgets_dashboard_id_fkey"
            columns: ["dashboard_id"]
            isOneToOne: false
            referencedRelation: "analytics_dashboards"
            referencedColumns: ["id"]
          },
        ]
      }
      audit_logs: {
        Row: {
          action: Database["public"]["Enums"]["audit_action"]
          created_at: string | null
          entity_id: string | null
          entity_type: string
          id: string
          ip_address: string | null
          new_data: Json | null
          old_data: Json | null
          organization_id: string
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          action: Database["public"]["Enums"]["audit_action"]
          created_at?: string | null
          entity_id?: string | null
          entity_type: string
          id?: string
          ip_address?: string | null
          new_data?: Json | null
          old_data?: Json | null
          organization_id: string
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          action?: Database["public"]["Enums"]["audit_action"]
          created_at?: string | null
          entity_id?: string | null
          entity_type?: string
          id?: string
          ip_address?: string | null
          new_data?: Json | null
          old_data?: Json | null
          organization_id?: string
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "audit_logs_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "audit_logs_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      crm_activities: {
        Row: {
          company_id: string | null
          completed_at: string | null
          contact_id: string | null
          created_at: string | null
          created_by: string | null
          deal_id: string | null
          deleted_at: string | null
          description: string | null
          due_date: string | null
          duration_minutes: number | null
          id: string
          organization_id: string
          subject: string
          type: string
          updated_at: string | null
        }
        Insert: {
          company_id?: string | null
          completed_at?: string | null
          contact_id?: string | null
          created_at?: string | null
          created_by?: string | null
          deal_id?: string | null
          deleted_at?: string | null
          description?: string | null
          due_date?: string | null
          duration_minutes?: number | null
          id?: string
          organization_id: string
          subject: string
          type: string
          updated_at?: string | null
        }
        Update: {
          company_id?: string | null
          completed_at?: string | null
          contact_id?: string | null
          created_at?: string | null
          created_by?: string | null
          deal_id?: string | null
          deleted_at?: string | null
          description?: string | null
          due_date?: string | null
          duration_minutes?: number | null
          id?: string
          organization_id?: string
          subject?: string
          type?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "crm_activities_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "crm_companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "crm_activities_contact_id_fkey"
            columns: ["contact_id"]
            isOneToOne: false
            referencedRelation: "crm_contacts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "crm_activities_deal_id_fkey"
            columns: ["deal_id"]
            isOneToOne: false
            referencedRelation: "crm_deals"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "crm_activities_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      crm_companies: {
        Row: {
          address_line1: string | null
          address_line2: string | null
          city: string | null
          country: string | null
          created_at: string | null
          custom_fields: Json | null
          deleted_at: string | null
          email: string | null
          id: string
          industry: string | null
          name: string
          organization_id: string
          phone: string | null
          postal_code: string | null
          siret: string | null
          size: string | null
          updated_at: string | null
          website: string | null
        }
        Insert: {
          address_line1?: string | null
          address_line2?: string | null
          city?: string | null
          country?: string | null
          created_at?: string | null
          custom_fields?: Json | null
          deleted_at?: string | null
          email?: string | null
          id?: string
          industry?: string | null
          name: string
          organization_id: string
          phone?: string | null
          postal_code?: string | null
          siret?: string | null
          size?: string | null
          updated_at?: string | null
          website?: string | null
        }
        Update: {
          address_line1?: string | null
          address_line2?: string | null
          city?: string | null
          country?: string | null
          created_at?: string | null
          custom_fields?: Json | null
          deleted_at?: string | null
          email?: string | null
          id?: string
          industry?: string | null
          name?: string
          organization_id?: string
          phone?: string | null
          postal_code?: string | null
          siret?: string | null
          size?: string | null
          updated_at?: string | null
          website?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "crm_companies_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      crm_contacts: {
        Row: {
          address_line1: string | null
          address_line2: string | null
          city: string | null
          company_id: string | null
          country: string | null
          created_at: string | null
          custom_fields: Json | null
          deleted_at: string | null
          email: string | null
          first_name: string | null
          id: string
          job_title: string | null
          last_name: string | null
          mobile: string | null
          organization_id: string
          owner_id: string | null
          phone: string | null
          postal_code: string | null
          source: string | null
          source_details: string | null
          tags: string[] | null
          updated_at: string | null
        }
        Insert: {
          address_line1?: string | null
          address_line2?: string | null
          city?: string | null
          company_id?: string | null
          country?: string | null
          created_at?: string | null
          custom_fields?: Json | null
          deleted_at?: string | null
          email?: string | null
          first_name?: string | null
          id?: string
          job_title?: string | null
          last_name?: string | null
          mobile?: string | null
          organization_id: string
          owner_id?: string | null
          phone?: string | null
          postal_code?: string | null
          source?: string | null
          source_details?: string | null
          tags?: string[] | null
          updated_at?: string | null
        }
        Update: {
          address_line1?: string | null
          address_line2?: string | null
          city?: string | null
          company_id?: string | null
          country?: string | null
          created_at?: string | null
          custom_fields?: Json | null
          deleted_at?: string | null
          email?: string | null
          first_name?: string | null
          id?: string
          job_title?: string | null
          last_name?: string | null
          mobile?: string | null
          organization_id?: string
          owner_id?: string | null
          phone?: string | null
          postal_code?: string | null
          source?: string | null
          source_details?: string | null
          tags?: string[] | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "crm_contacts_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "crm_companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "crm_contacts_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      crm_deals: {
        Row: {
          amount: number | null
          company_id: string | null
          contact_id: string | null
          created_at: string | null
          currency: string | null
          custom_fields: Json | null
          deleted_at: string | null
          expected_close_date: string | null
          id: string
          lost_at: string | null
          lost_reason: string | null
          name: string
          organization_id: string
          owner_id: string | null
          pipeline_id: string
          probability: number | null
          stage_id: string
          status: string | null
          updated_at: string | null
          won_at: string | null
        }
        Insert: {
          amount?: number | null
          company_id?: string | null
          contact_id?: string | null
          created_at?: string | null
          currency?: string | null
          custom_fields?: Json | null
          deleted_at?: string | null
          expected_close_date?: string | null
          id?: string
          lost_at?: string | null
          lost_reason?: string | null
          name: string
          organization_id: string
          owner_id?: string | null
          pipeline_id: string
          probability?: number | null
          stage_id: string
          status?: string | null
          updated_at?: string | null
          won_at?: string | null
        }
        Update: {
          amount?: number | null
          company_id?: string | null
          contact_id?: string | null
          created_at?: string | null
          currency?: string | null
          custom_fields?: Json | null
          deleted_at?: string | null
          expected_close_date?: string | null
          id?: string
          lost_at?: string | null
          lost_reason?: string | null
          name?: string
          organization_id?: string
          owner_id?: string | null
          pipeline_id?: string
          probability?: number | null
          stage_id?: string
          status?: string | null
          updated_at?: string | null
          won_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "crm_deals_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "crm_companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "crm_deals_contact_id_fkey"
            columns: ["contact_id"]
            isOneToOne: false
            referencedRelation: "crm_contacts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "crm_deals_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "crm_deals_pipeline_id_fkey"
            columns: ["pipeline_id"]
            isOneToOne: false
            referencedRelation: "crm_pipelines"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "crm_deals_stage_id_fkey"
            columns: ["stage_id"]
            isOneToOne: false
            referencedRelation: "crm_pipeline_stages"
            referencedColumns: ["id"]
          },
        ]
      }
      crm_pipeline_stages: {
        Row: {
          color: string | null
          created_at: string | null
          id: string
          name: string
          pipeline_id: string
          position: number
          probability: number | null
          updated_at: string | null
        }
        Insert: {
          color?: string | null
          created_at?: string | null
          id?: string
          name: string
          pipeline_id: string
          position: number
          probability?: number | null
          updated_at?: string | null
        }
        Update: {
          color?: string | null
          created_at?: string | null
          id?: string
          name?: string
          pipeline_id?: string
          position?: number
          probability?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "crm_pipeline_stages_pipeline_id_fkey"
            columns: ["pipeline_id"]
            isOneToOne: false
            referencedRelation: "crm_pipelines"
            referencedColumns: ["id"]
          },
        ]
      }
      crm_pipelines: {
        Row: {
          created_at: string | null
          deleted_at: string | null
          description: string | null
          id: string
          is_default: boolean | null
          name: string
          organization_id: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          deleted_at?: string | null
          description?: string | null
          id?: string
          is_default?: boolean | null
          name: string
          organization_id: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          deleted_at?: string | null
          description?: string | null
          id?: string
          is_default?: boolean | null
          name?: string
          organization_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "crm_pipelines_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      crm_tags: {
        Row: {
          color: string | null
          created_at: string | null
          id: string
          name: string
          organization_id: string
        }
        Insert: {
          color?: string | null
          created_at?: string | null
          id?: string
          name: string
          organization_id: string
        }
        Update: {
          color?: string | null
          created_at?: string | null
          id?: string
          name?: string
          organization_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "crm_tags_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      docs_activity_log: {
        Row: {
          action: string
          created_at: string | null
          details: Json | null
          file_id: string | null
          folder_id: string | null
          id: string
          organization_id: string
          user_id: string | null
        }
        Insert: {
          action: string
          created_at?: string | null
          details?: Json | null
          file_id?: string | null
          folder_id?: string | null
          id?: string
          organization_id: string
          user_id?: string | null
        }
        Update: {
          action?: string
          created_at?: string | null
          details?: Json | null
          file_id?: string | null
          folder_id?: string | null
          id?: string
          organization_id?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "docs_activity_log_file_id_fkey"
            columns: ["file_id"]
            isOneToOne: false
            referencedRelation: "docs_files"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "docs_activity_log_folder_id_fkey"
            columns: ["folder_id"]
            isOneToOne: false
            referencedRelation: "docs_folders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "docs_activity_log_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "docs_activity_log_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      docs_favorites: {
        Row: {
          created_at: string | null
          file_id: string | null
          folder_id: string | null
          id: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          file_id?: string | null
          folder_id?: string | null
          id?: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          file_id?: string | null
          folder_id?: string | null
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "docs_favorites_file_id_fkey"
            columns: ["file_id"]
            isOneToOne: false
            referencedRelation: "docs_files"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "docs_favorites_folder_id_fkey"
            columns: ["folder_id"]
            isOneToOne: false
            referencedRelation: "docs_folders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "docs_favorites_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      docs_files: {
        Row: {
          content_text: string | null
          created_at: string | null
          deleted_at: string | null
          download_count: number | null
          entity_id: string | null
          entity_type: string | null
          file_size: number
          file_type: string
          folder_id: string | null
          id: string
          locked_at: string | null
          locked_by: string | null
          mime_type: string | null
          name: string
          organization_id: string
          storage_path: string
          tags: string[] | null
          updated_at: string | null
          uploaded_by: string | null
          version: number | null
        }
        Insert: {
          content_text?: string | null
          created_at?: string | null
          deleted_at?: string | null
          download_count?: number | null
          entity_id?: string | null
          entity_type?: string | null
          file_size: number
          file_type: string
          folder_id?: string | null
          id?: string
          locked_at?: string | null
          locked_by?: string | null
          mime_type?: string | null
          name: string
          organization_id: string
          storage_path: string
          tags?: string[] | null
          updated_at?: string | null
          uploaded_by?: string | null
          version?: number | null
        }
        Update: {
          content_text?: string | null
          created_at?: string | null
          deleted_at?: string | null
          download_count?: number | null
          entity_id?: string | null
          entity_type?: string | null
          file_size?: number
          file_type?: string
          folder_id?: string | null
          id?: string
          locked_at?: string | null
          locked_by?: string | null
          mime_type?: string | null
          name?: string
          organization_id?: string
          storage_path?: string
          tags?: string[] | null
          updated_at?: string | null
          uploaded_by?: string | null
          version?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "docs_files_folder_id_fkey"
            columns: ["folder_id"]
            isOneToOne: false
            referencedRelation: "docs_folders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "docs_files_locked_by_fkey"
            columns: ["locked_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "docs_files_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "docs_files_uploaded_by_fkey"
            columns: ["uploaded_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      docs_folders: {
        Row: {
          color: string | null
          created_at: string | null
          created_by: string | null
          deleted_at: string | null
          depth: number | null
          icon: string | null
          id: string
          name: string
          organization_id: string
          parent_id: string | null
          path: string
          updated_at: string | null
        }
        Insert: {
          color?: string | null
          created_at?: string | null
          created_by?: string | null
          deleted_at?: string | null
          depth?: number | null
          icon?: string | null
          id?: string
          name: string
          organization_id: string
          parent_id?: string | null
          path?: string
          updated_at?: string | null
        }
        Update: {
          color?: string | null
          created_at?: string | null
          created_by?: string | null
          deleted_at?: string | null
          depth?: number | null
          icon?: string | null
          id?: string
          name?: string
          organization_id?: string
          parent_id?: string | null
          path?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "docs_folders_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "docs_folders_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "docs_folders_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "docs_folders"
            referencedColumns: ["id"]
          },
        ]
      }
      docs_settings: {
        Row: {
          created_at: string | null
          enable_ocr: boolean | null
          enable_versioning: boolean | null
          id: string
          max_file_size_bytes: number | null
          organization_id: string
          storage_limit_bytes: number | null
          updated_at: string | null
          version_retention_days: number | null
        }
        Insert: {
          created_at?: string | null
          enable_ocr?: boolean | null
          enable_versioning?: boolean | null
          id?: string
          max_file_size_bytes?: number | null
          organization_id: string
          storage_limit_bytes?: number | null
          updated_at?: string | null
          version_retention_days?: number | null
        }
        Update: {
          created_at?: string | null
          enable_ocr?: boolean | null
          enable_versioning?: boolean | null
          id?: string
          max_file_size_bytes?: number | null
          organization_id?: string
          storage_limit_bytes?: number | null
          updated_at?: string | null
          version_retention_days?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "docs_settings_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: true
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      hr_contracts: {
        Row: {
          classification: string | null
          coefficient: string | null
          collective_agreement: string | null
          contract_type: string
          created_at: string | null
          department: string | null
          document_url: string | null
          employee_id: string
          end_date: string | null
          gross_salary: number
          id: string
          job_title: string
          notes: string | null
          remote_days_per_week: number | null
          salary_frequency: string | null
          start_date: string
          trial_duration_days: number | null
          trial_renewable: boolean | null
          updated_at: string | null
          work_hours_per_week: number | null
        }
        Insert: {
          classification?: string | null
          coefficient?: string | null
          collective_agreement?: string | null
          contract_type: string
          created_at?: string | null
          department?: string | null
          document_url?: string | null
          employee_id: string
          end_date?: string | null
          gross_salary: number
          id?: string
          job_title: string
          notes?: string | null
          remote_days_per_week?: number | null
          salary_frequency?: string | null
          start_date: string
          trial_duration_days?: number | null
          trial_renewable?: boolean | null
          updated_at?: string | null
          work_hours_per_week?: number | null
        }
        Update: {
          classification?: string | null
          coefficient?: string | null
          collective_agreement?: string | null
          contract_type?: string
          created_at?: string | null
          department?: string | null
          document_url?: string | null
          employee_id?: string
          end_date?: string | null
          gross_salary?: number
          id?: string
          job_title?: string
          notes?: string | null
          remote_days_per_week?: number | null
          salary_frequency?: string | null
          start_date?: string
          trial_duration_days?: number | null
          trial_renewable?: boolean | null
          updated_at?: string | null
          work_hours_per_week?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "hr_contracts_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "hr_employees"
            referencedColumns: ["id"]
          },
        ]
      }
      hr_documents: {
        Row: {
          created_at: string | null
          document_type: string
          employee_id: string
          file_size: number | null
          file_url: string
          id: string
          mime_type: string | null
          name: string
          uploaded_by: string | null
          valid_from: string | null
          valid_until: string | null
        }
        Insert: {
          created_at?: string | null
          document_type: string
          employee_id: string
          file_size?: number | null
          file_url: string
          id?: string
          mime_type?: string | null
          name: string
          uploaded_by?: string | null
          valid_from?: string | null
          valid_until?: string | null
        }
        Update: {
          created_at?: string | null
          document_type?: string
          employee_id?: string
          file_size?: number | null
          file_url?: string
          id?: string
          mime_type?: string | null
          name?: string
          uploaded_by?: string | null
          valid_from?: string | null
          valid_until?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "hr_documents_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "hr_employees"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "hr_documents_uploaded_by_fkey"
            columns: ["uploaded_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      hr_employees: {
        Row: {
          address_line1: string | null
          address_line2: string | null
          birth_date: string | null
          birth_place: string | null
          city: string | null
          contract_end_date: string | null
          country: string | null
          created_at: string | null
          custom_fields: Json | null
          deleted_at: string | null
          department: string | null
          email: string
          emergency_contact_name: string | null
          emergency_contact_phone: string | null
          emergency_contact_relation: string | null
          employee_number: string | null
          first_name: string
          hire_date: string
          id: string
          job_title: string | null
          last_name: string
          leave_date: string | null
          manager_id: string | null
          nationality: string | null
          organization_id: string
          paid_leave_balance: number | null
          phone: string | null
          postal_code: string | null
          rtt_balance: number | null
          salary: number | null
          salary_currency: string | null
          social_security_number: string | null
          status: string | null
          trial_end_date: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          address_line1?: string | null
          address_line2?: string | null
          birth_date?: string | null
          birth_place?: string | null
          city?: string | null
          contract_end_date?: string | null
          country?: string | null
          created_at?: string | null
          custom_fields?: Json | null
          deleted_at?: string | null
          department?: string | null
          email: string
          emergency_contact_name?: string | null
          emergency_contact_phone?: string | null
          emergency_contact_relation?: string | null
          employee_number?: string | null
          first_name: string
          hire_date: string
          id?: string
          job_title?: string | null
          last_name: string
          leave_date?: string | null
          manager_id?: string | null
          nationality?: string | null
          organization_id: string
          paid_leave_balance?: number | null
          phone?: string | null
          postal_code?: string | null
          rtt_balance?: number | null
          salary?: number | null
          salary_currency?: string | null
          social_security_number?: string | null
          status?: string | null
          trial_end_date?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          address_line1?: string | null
          address_line2?: string | null
          birth_date?: string | null
          birth_place?: string | null
          city?: string | null
          contract_end_date?: string | null
          country?: string | null
          created_at?: string | null
          custom_fields?: Json | null
          deleted_at?: string | null
          department?: string | null
          email?: string
          emergency_contact_name?: string | null
          emergency_contact_phone?: string | null
          emergency_contact_relation?: string | null
          employee_number?: string | null
          first_name?: string
          hire_date?: string
          id?: string
          job_title?: string | null
          last_name?: string
          leave_date?: string | null
          manager_id?: string | null
          nationality?: string | null
          organization_id?: string
          paid_leave_balance?: number | null
          phone?: string | null
          postal_code?: string | null
          rtt_balance?: number | null
          salary?: number | null
          salary_currency?: string | null
          social_security_number?: string | null
          status?: string | null
          trial_end_date?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "hr_employees_manager_id_fkey"
            columns: ["manager_id"]
            isOneToOne: false
            referencedRelation: "hr_employees"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "hr_employees_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "hr_employees_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      hr_interviews: {
        Row: {
          conducted_at: string | null
          created_at: string | null
          development_plan: string | null
          document_url: string | null
          employee_id: string
          id: string
          interview_type: string
          interviewer_id: string | null
          objectives: string | null
          outcomes: string | null
          rating: number | null
          scheduled_date: string
          updated_at: string | null
        }
        Insert: {
          conducted_at?: string | null
          created_at?: string | null
          development_plan?: string | null
          document_url?: string | null
          employee_id: string
          id?: string
          interview_type: string
          interviewer_id?: string | null
          objectives?: string | null
          outcomes?: string | null
          rating?: number | null
          scheduled_date: string
          updated_at?: string | null
        }
        Update: {
          conducted_at?: string | null
          created_at?: string | null
          development_plan?: string | null
          document_url?: string | null
          employee_id?: string
          id?: string
          interview_type?: string
          interviewer_id?: string | null
          objectives?: string | null
          outcomes?: string | null
          rating?: number | null
          scheduled_date?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "hr_interviews_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "hr_employees"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "hr_interviews_interviewer_id_fkey"
            columns: ["interviewer_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      hr_leave_requests: {
        Row: {
          approved_at: string | null
          approved_by: string | null
          created_at: string | null
          days_count: number
          employee_id: string
          end_date: string
          end_half_day: boolean | null
          id: string
          leave_type_id: string
          reason: string | null
          rejection_reason: string | null
          start_date: string
          start_half_day: boolean | null
          status: string | null
          updated_at: string | null
        }
        Insert: {
          approved_at?: string | null
          approved_by?: string | null
          created_at?: string | null
          days_count: number
          employee_id: string
          end_date: string
          end_half_day?: boolean | null
          id?: string
          leave_type_id: string
          reason?: string | null
          rejection_reason?: string | null
          start_date: string
          start_half_day?: boolean | null
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          approved_at?: string | null
          approved_by?: string | null
          created_at?: string | null
          days_count?: number
          employee_id?: string
          end_date?: string
          end_half_day?: boolean | null
          id?: string
          leave_type_id?: string
          reason?: string | null
          rejection_reason?: string | null
          start_date?: string
          start_half_day?: boolean | null
          status?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "hr_leave_requests_approved_by_fkey"
            columns: ["approved_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "hr_leave_requests_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "hr_employees"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "hr_leave_requests_leave_type_id_fkey"
            columns: ["leave_type_id"]
            isOneToOne: false
            referencedRelation: "hr_leave_types"
            referencedColumns: ["id"]
          },
        ]
      }
      hr_leave_types: {
        Row: {
          code: string
          color: string | null
          created_at: string | null
          deducts_balance: boolean | null
          id: string
          is_paid: boolean | null
          name: string
          organization_id: string
          requires_approval: boolean | null
        }
        Insert: {
          code: string
          color?: string | null
          created_at?: string | null
          deducts_balance?: boolean | null
          id?: string
          is_paid?: boolean | null
          name: string
          organization_id: string
          requires_approval?: boolean | null
        }
        Update: {
          code?: string
          color?: string | null
          created_at?: string | null
          deducts_balance?: boolean | null
          id?: string
          is_paid?: boolean | null
          name?: string
          organization_id?: string
          requires_approval?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "hr_leave_types_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      hr_notes: {
        Row: {
          content: string
          created_at: string | null
          created_by: string | null
          employee_id: string
          id: string
          is_private: boolean | null
          updated_at: string | null
        }
        Insert: {
          content: string
          created_at?: string | null
          created_by?: string | null
          employee_id: string
          id?: string
          is_private?: boolean | null
          updated_at?: string | null
        }
        Update: {
          content?: string
          created_at?: string | null
          created_by?: string | null
          employee_id?: string
          id?: string
          is_private?: boolean | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "hr_notes_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "hr_notes_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "hr_employees"
            referencedColumns: ["id"]
          },
        ]
      }
      hr_settings: {
        Row: {
          created_at: string | null
          default_paid_leave_days: number | null
          default_rtt_days: number | null
          fiscal_year_start_month: number | null
          id: string
          organization_id: string
          overtime_threshold_daily: number | null
          overtime_threshold_weekly: number | null
          updated_at: string | null
          work_hours_per_day: number | null
        }
        Insert: {
          created_at?: string | null
          default_paid_leave_days?: number | null
          default_rtt_days?: number | null
          fiscal_year_start_month?: number | null
          id?: string
          organization_id: string
          overtime_threshold_daily?: number | null
          overtime_threshold_weekly?: number | null
          updated_at?: string | null
          work_hours_per_day?: number | null
        }
        Update: {
          created_at?: string | null
          default_paid_leave_days?: number | null
          default_rtt_days?: number | null
          fiscal_year_start_month?: number | null
          id?: string
          organization_id?: string
          overtime_threshold_daily?: number | null
          overtime_threshold_weekly?: number | null
          updated_at?: string | null
          work_hours_per_day?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "hr_settings_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: true
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      hr_time_entries: {
        Row: {
          break_duration_minutes: number | null
          clock_in: string | null
          clock_out: string | null
          created_at: string | null
          date: string
          employee_id: string
          id: string
          is_validated: boolean | null
          notes: string | null
          overtime_hours: number | null
          total_hours: number | null
          updated_at: string | null
          validated_at: string | null
          validated_by: string | null
        }
        Insert: {
          break_duration_minutes?: number | null
          clock_in?: string | null
          clock_out?: string | null
          created_at?: string | null
          date: string
          employee_id: string
          id?: string
          is_validated?: boolean | null
          notes?: string | null
          overtime_hours?: number | null
          total_hours?: number | null
          updated_at?: string | null
          validated_at?: string | null
          validated_by?: string | null
        }
        Update: {
          break_duration_minutes?: number | null
          clock_in?: string | null
          clock_out?: string | null
          created_at?: string | null
          date?: string
          employee_id?: string
          id?: string
          is_validated?: boolean | null
          notes?: string | null
          overtime_hours?: number | null
          total_hours?: number | null
          updated_at?: string | null
          validated_at?: string | null
          validated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "hr_time_entries_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "hr_employees"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "hr_time_entries_validated_by_fkey"
            columns: ["validated_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      invoice_clients: {
        Row: {
          address_line1: string | null
          address_line2: string | null
          city: string | null
          contact_name: string | null
          country: string | null
          created_at: string | null
          crm_company_id: string | null
          crm_contact_id: string | null
          custom_fields: Json | null
          default_payment_method: string | null
          deleted_at: string | null
          email: string | null
          id: string
          legal_name: string | null
          name: string
          notes: string | null
          organization_id: string
          payment_terms: number | null
          phone: string | null
          postal_code: string | null
          siret: string | null
          updated_at: string | null
          vat_number: string | null
        }
        Insert: {
          address_line1?: string | null
          address_line2?: string | null
          city?: string | null
          contact_name?: string | null
          country?: string | null
          created_at?: string | null
          crm_company_id?: string | null
          crm_contact_id?: string | null
          custom_fields?: Json | null
          default_payment_method?: string | null
          deleted_at?: string | null
          email?: string | null
          id?: string
          legal_name?: string | null
          name: string
          notes?: string | null
          organization_id: string
          payment_terms?: number | null
          phone?: string | null
          postal_code?: string | null
          siret?: string | null
          updated_at?: string | null
          vat_number?: string | null
        }
        Update: {
          address_line1?: string | null
          address_line2?: string | null
          city?: string | null
          contact_name?: string | null
          country?: string | null
          created_at?: string | null
          crm_company_id?: string | null
          crm_contact_id?: string | null
          custom_fields?: Json | null
          default_payment_method?: string | null
          deleted_at?: string | null
          email?: string | null
          id?: string
          legal_name?: string | null
          name?: string
          notes?: string | null
          organization_id?: string
          payment_terms?: number | null
          phone?: string | null
          postal_code?: string | null
          siret?: string | null
          updated_at?: string | null
          vat_number?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "invoice_clients_crm_company_id_fkey"
            columns: ["crm_company_id"]
            isOneToOne: false
            referencedRelation: "crm_companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invoice_clients_crm_contact_id_fkey"
            columns: ["crm_contact_id"]
            isOneToOne: false
            referencedRelation: "crm_contacts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invoice_clients_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      invoice_invoices: {
        Row: {
          amount_due: number | null
          amount_paid: number | null
          client_id: string
          created_at: string | null
          created_by: string | null
          currency: string | null
          deal_id: string | null
          deleted_at: string | null
          discount_amount: number | null
          discount_percent: number | null
          due_date: string
          id: string
          invoice_number: string
          issue_date: string
          last_reminder_at: string | null
          notes: string | null
          organization_id: string
          paid_at: string | null
          quote_id: string | null
          reminder_count: number | null
          sent_at: string | null
          status: string | null
          subtotal: number | null
          terms: string | null
          total: number | null
          updated_at: string | null
          vat_amount: number | null
        }
        Insert: {
          amount_due?: number | null
          amount_paid?: number | null
          client_id: string
          created_at?: string | null
          created_by?: string | null
          currency?: string | null
          deal_id?: string | null
          deleted_at?: string | null
          discount_amount?: number | null
          discount_percent?: number | null
          due_date: string
          id?: string
          invoice_number: string
          issue_date?: string
          last_reminder_at?: string | null
          notes?: string | null
          organization_id: string
          paid_at?: string | null
          quote_id?: string | null
          reminder_count?: number | null
          sent_at?: string | null
          status?: string | null
          subtotal?: number | null
          terms?: string | null
          total?: number | null
          updated_at?: string | null
          vat_amount?: number | null
        }
        Update: {
          amount_due?: number | null
          amount_paid?: number | null
          client_id?: string
          created_at?: string | null
          created_by?: string | null
          currency?: string | null
          deal_id?: string | null
          deleted_at?: string | null
          discount_amount?: number | null
          discount_percent?: number | null
          due_date?: string
          id?: string
          invoice_number?: string
          issue_date?: string
          last_reminder_at?: string | null
          notes?: string | null
          organization_id?: string
          paid_at?: string | null
          quote_id?: string | null
          reminder_count?: number | null
          sent_at?: string | null
          status?: string | null
          subtotal?: number | null
          terms?: string | null
          total?: number | null
          updated_at?: string | null
          vat_amount?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "invoice_invoices_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "invoice_clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invoice_invoices_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invoice_invoices_deal_id_fkey"
            columns: ["deal_id"]
            isOneToOne: false
            referencedRelation: "crm_deals"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invoice_invoices_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invoice_invoices_quote_id_fkey"
            columns: ["quote_id"]
            isOneToOne: false
            referencedRelation: "invoice_quotes"
            referencedColumns: ["id"]
          },
        ]
      }
      invoice_line_items: {
        Row: {
          created_at: string | null
          description: string
          discount_percent: number | null
          document_type: string
          id: string
          invoice_id: string | null
          position: number | null
          product_id: string | null
          quantity: number
          quote_id: string | null
          subtotal: number | null
          total: number | null
          unit: string | null
          unit_price: number
          updated_at: string | null
          vat_amount: number | null
          vat_rate: number | null
        }
        Insert: {
          created_at?: string | null
          description: string
          discount_percent?: number | null
          document_type: string
          id?: string
          invoice_id?: string | null
          position?: number | null
          product_id?: string | null
          quantity?: number
          quote_id?: string | null
          subtotal?: number | null
          total?: number | null
          unit?: string | null
          unit_price: number
          updated_at?: string | null
          vat_amount?: number | null
          vat_rate?: number | null
        }
        Update: {
          created_at?: string | null
          description?: string
          discount_percent?: number | null
          document_type?: string
          id?: string
          invoice_id?: string | null
          position?: number | null
          product_id?: string | null
          quantity?: number
          quote_id?: string | null
          subtotal?: number | null
          total?: number | null
          unit?: string | null
          unit_price?: number
          updated_at?: string | null
          vat_amount?: number | null
          vat_rate?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "invoice_line_items_invoice_id_fkey"
            columns: ["invoice_id"]
            isOneToOne: false
            referencedRelation: "invoice_invoices"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invoice_line_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "invoice_products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invoice_line_items_quote_id_fkey"
            columns: ["quote_id"]
            isOneToOne: false
            referencedRelation: "invoice_quotes"
            referencedColumns: ["id"]
          },
        ]
      }
      invoice_number_sequences: {
        Row: {
          created_at: string | null
          current_number: number | null
          document_type: string
          id: string
          last_reset_at: string | null
          organization_id: string
          padding: number | null
          prefix: string | null
          reset_frequency: string | null
          suffix: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          current_number?: number | null
          document_type: string
          id?: string
          last_reset_at?: string | null
          organization_id: string
          padding?: number | null
          prefix?: string | null
          reset_frequency?: string | null
          suffix?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          current_number?: number | null
          document_type?: string
          id?: string
          last_reset_at?: string | null
          organization_id?: string
          padding?: number | null
          prefix?: string | null
          reset_frequency?: string | null
          suffix?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "invoice_number_sequences_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      invoice_payments: {
        Row: {
          amount: number
          created_at: string | null
          created_by: string | null
          currency: string | null
          id: string
          invoice_id: string
          notes: string | null
          organization_id: string
          payment_date: string
          payment_method: string
          reference: string | null
        }
        Insert: {
          amount: number
          created_at?: string | null
          created_by?: string | null
          currency?: string | null
          id?: string
          invoice_id: string
          notes?: string | null
          organization_id: string
          payment_date?: string
          payment_method: string
          reference?: string | null
        }
        Update: {
          amount?: number
          created_at?: string | null
          created_by?: string | null
          currency?: string | null
          id?: string
          invoice_id?: string
          notes?: string | null
          organization_id?: string
          payment_date?: string
          payment_method?: string
          reference?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "invoice_payments_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invoice_payments_invoice_id_fkey"
            columns: ["invoice_id"]
            isOneToOne: false
            referencedRelation: "invoice_invoices"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invoice_payments_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      invoice_products: {
        Row: {
          accounting_code: string | null
          category: string | null
          created_at: string | null
          currency: string | null
          deleted_at: string | null
          description: string | null
          id: string
          is_active: boolean | null
          name: string
          organization_id: string
          sku: string | null
          type: string | null
          unit: string | null
          unit_price: number
          updated_at: string | null
          vat_rate: number | null
        }
        Insert: {
          accounting_code?: string | null
          category?: string | null
          created_at?: string | null
          currency?: string | null
          deleted_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          organization_id: string
          sku?: string | null
          type?: string | null
          unit?: string | null
          unit_price: number
          updated_at?: string | null
          vat_rate?: number | null
        }
        Update: {
          accounting_code?: string | null
          category?: string | null
          created_at?: string | null
          currency?: string | null
          deleted_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          organization_id?: string
          sku?: string | null
          type?: string | null
          unit?: string | null
          unit_price?: number
          updated_at?: string | null
          vat_rate?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "invoice_products_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      invoice_quotes: {
        Row: {
          accepted_at: string | null
          client_id: string
          converted_at: string | null
          converted_to_invoice_id: string | null
          created_at: string | null
          created_by: string | null
          currency: string | null
          deal_id: string | null
          deleted_at: string | null
          discount_amount: number | null
          discount_percent: number | null
          id: string
          issue_date: string
          notes: string | null
          organization_id: string
          quote_number: string
          rejected_at: string | null
          rejection_reason: string | null
          sent_at: string | null
          status: string | null
          subtotal: number | null
          terms: string | null
          total: number | null
          updated_at: string | null
          validity_date: string | null
          vat_amount: number | null
        }
        Insert: {
          accepted_at?: string | null
          client_id: string
          converted_at?: string | null
          converted_to_invoice_id?: string | null
          created_at?: string | null
          created_by?: string | null
          currency?: string | null
          deal_id?: string | null
          deleted_at?: string | null
          discount_amount?: number | null
          discount_percent?: number | null
          id?: string
          issue_date?: string
          notes?: string | null
          organization_id: string
          quote_number: string
          rejected_at?: string | null
          rejection_reason?: string | null
          sent_at?: string | null
          status?: string | null
          subtotal?: number | null
          terms?: string | null
          total?: number | null
          updated_at?: string | null
          validity_date?: string | null
          vat_amount?: number | null
        }
        Update: {
          accepted_at?: string | null
          client_id?: string
          converted_at?: string | null
          converted_to_invoice_id?: string | null
          created_at?: string | null
          created_by?: string | null
          currency?: string | null
          deal_id?: string | null
          deleted_at?: string | null
          discount_amount?: number | null
          discount_percent?: number | null
          id?: string
          issue_date?: string
          notes?: string | null
          organization_id?: string
          quote_number?: string
          rejected_at?: string | null
          rejection_reason?: string | null
          sent_at?: string | null
          status?: string | null
          subtotal?: number | null
          terms?: string | null
          total?: number | null
          updated_at?: string | null
          validity_date?: string | null
          vat_amount?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "invoice_quotes_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "invoice_clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invoice_quotes_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invoice_quotes_deal_id_fkey"
            columns: ["deal_id"]
            isOneToOne: false
            referencedRelation: "crm_deals"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invoice_quotes_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      invoice_settings: {
        Row: {
          bank_name: string | null
          bic: string | null
          company_logo_url: string | null
          company_name: string | null
          created_at: string | null
          default_currency: string | null
          default_payment_terms: number | null
          default_vat_rate: number | null
          email_body_invoice: string | null
          email_body_quote: string | null
          email_subject_invoice: string | null
          email_subject_quote: string | null
          iban: string | null
          id: string
          invoice_notes_template: string | null
          invoice_terms_template: string | null
          late_payment_mentions: string | null
          legal_mentions: string | null
          organization_id: string
          quote_notes_template: string | null
          quote_terms_template: string | null
          updated_at: string | null
        }
        Insert: {
          bank_name?: string | null
          bic?: string | null
          company_logo_url?: string | null
          company_name?: string | null
          created_at?: string | null
          default_currency?: string | null
          default_payment_terms?: number | null
          default_vat_rate?: number | null
          email_body_invoice?: string | null
          email_body_quote?: string | null
          email_subject_invoice?: string | null
          email_subject_quote?: string | null
          iban?: string | null
          id?: string
          invoice_notes_template?: string | null
          invoice_terms_template?: string | null
          late_payment_mentions?: string | null
          legal_mentions?: string | null
          organization_id: string
          quote_notes_template?: string | null
          quote_terms_template?: string | null
          updated_at?: string | null
        }
        Update: {
          bank_name?: string | null
          bic?: string | null
          company_logo_url?: string | null
          company_name?: string | null
          created_at?: string | null
          default_currency?: string | null
          default_payment_terms?: number | null
          default_vat_rate?: number | null
          email_body_invoice?: string | null
          email_body_quote?: string | null
          email_subject_invoice?: string | null
          email_subject_quote?: string | null
          iban?: string | null
          id?: string
          invoice_notes_template?: string | null
          invoice_terms_template?: string | null
          late_payment_mentions?: string | null
          legal_mentions?: string | null
          organization_id?: string
          quote_notes_template?: string | null
          quote_terms_template?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "invoice_settings_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: true
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      invoice_vat_rates: {
        Row: {
          created_at: string | null
          id: string
          is_default: boolean | null
          name: string
          organization_id: string
          rate: number
        }
        Insert: {
          created_at?: string | null
          id?: string
          is_default?: boolean | null
          name: string
          organization_id: string
          rate: number
        }
        Update: {
          created_at?: string | null
          id?: string
          is_default?: boolean | null
          name?: string
          organization_id?: string
          rate?: number
        }
        Relationships: [
          {
            foreignKeyName: "invoice_vat_rates_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      organization_members: {
        Row: {
          created_at: string | null
          id: string
          invitation_email: string | null
          invitation_expires_at: string | null
          invitation_token: string | null
          invited_by: string | null
          joined_at: string | null
          organization_id: string
          role: Database["public"]["Enums"]["user_role"] | null
          status: Database["public"]["Enums"]["member_status"] | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          invitation_email?: string | null
          invitation_expires_at?: string | null
          invitation_token?: string | null
          invited_by?: string | null
          joined_at?: string | null
          organization_id: string
          role?: Database["public"]["Enums"]["user_role"] | null
          status?: Database["public"]["Enums"]["member_status"] | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          invitation_email?: string | null
          invitation_expires_at?: string | null
          invitation_token?: string | null
          invited_by?: string | null
          joined_at?: string | null
          organization_id?: string
          role?: Database["public"]["Enums"]["user_role"] | null
          status?: Database["public"]["Enums"]["member_status"] | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "organization_members_invited_by_fkey"
            columns: ["invited_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "organization_members_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "organization_members_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      organizations: {
        Row: {
          address_line1: string | null
          address_line2: string | null
          city: string | null
          country: string | null
          created_at: string | null
          current_period_ends_at: string | null
          deleted_at: string | null
          email: string | null
          id: string
          legal_name: string | null
          logo_url: string | null
          name: string
          onboarding_completed: boolean | null
          onboarding_step: number | null
          phone: string | null
          postal_code: string | null
          primary_color: string | null
          settings: Json | null
          siren: string | null
          siret: string | null
          slug: string
          stripe_customer_id: string | null
          stripe_subscription_id: string | null
          subscription_plan:
            | Database["public"]["Enums"]["subscription_plan"]
            | null
          subscription_status:
            | Database["public"]["Enums"]["subscription_status"]
            | null
          trial_ends_at: string | null
          updated_at: string | null
          vat_number: string | null
          website: string | null
        }
        Insert: {
          address_line1?: string | null
          address_line2?: string | null
          city?: string | null
          country?: string | null
          created_at?: string | null
          current_period_ends_at?: string | null
          deleted_at?: string | null
          email?: string | null
          id?: string
          legal_name?: string | null
          logo_url?: string | null
          name: string
          onboarding_completed?: boolean | null
          onboarding_step?: number | null
          phone?: string | null
          postal_code?: string | null
          primary_color?: string | null
          settings?: Json | null
          siren?: string | null
          siret?: string | null
          slug: string
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          subscription_plan?:
            | Database["public"]["Enums"]["subscription_plan"]
            | null
          subscription_status?:
            | Database["public"]["Enums"]["subscription_status"]
            | null
          trial_ends_at?: string | null
          updated_at?: string | null
          vat_number?: string | null
          website?: string | null
        }
        Update: {
          address_line1?: string | null
          address_line2?: string | null
          city?: string | null
          country?: string | null
          created_at?: string | null
          current_period_ends_at?: string | null
          deleted_at?: string | null
          email?: string | null
          id?: string
          legal_name?: string | null
          logo_url?: string | null
          name?: string
          onboarding_completed?: boolean | null
          onboarding_step?: number | null
          phone?: string | null
          postal_code?: string | null
          primary_color?: string | null
          settings?: Json | null
          siren?: string | null
          siret?: string | null
          slug?: string
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          subscription_plan?:
            | Database["public"]["Enums"]["subscription_plan"]
            | null
          subscription_status?:
            | Database["public"]["Enums"]["subscription_status"]
            | null
          trial_ends_at?: string | null
          updated_at?: string | null
          vat_number?: string | null
          website?: string | null
        }
        Relationships: []
      }
      projects_activity_log: {
        Row: {
          action: string
          client_access_id: string | null
          created_at: string | null
          details: Json | null
          id: string
          project_id: string
          task_id: string | null
          user_id: string | null
          visible_to_client: boolean | null
        }
        Insert: {
          action: string
          client_access_id?: string | null
          created_at?: string | null
          details?: Json | null
          id?: string
          project_id: string
          task_id?: string | null
          user_id?: string | null
          visible_to_client?: boolean | null
        }
        Update: {
          action?: string
          client_access_id?: string | null
          created_at?: string | null
          details?: Json | null
          id?: string
          project_id?: string
          task_id?: string | null
          user_id?: string | null
          visible_to_client?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "projects_activity_log_client_access_id_fkey"
            columns: ["client_access_id"]
            isOneToOne: false
            referencedRelation: "projects_client_access"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "projects_activity_log_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects_projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "projects_activity_log_task_id_fkey"
            columns: ["task_id"]
            isOneToOne: false
            referencedRelation: "projects_tasks"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "projects_activity_log_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      projects_client_access: {
        Row: {
          access_count: number | null
          access_type: string | null
          can_comment: boolean | null
          can_see_budget: boolean | null
          can_see_team_members: boolean | null
          can_see_time_tracking: boolean | null
          can_upload_files: boolean | null
          client_email: string | null
          client_name: string | null
          created_at: string | null
          created_by: string | null
          expires_at: string | null
          id: string
          is_active: boolean | null
          last_accessed_at: string | null
          link_password_hash: string | null
          notify_on_updates: boolean | null
          password_protected: boolean | null
          project_id: string
          share_token: string | null
          updated_at: string | null
        }
        Insert: {
          access_count?: number | null
          access_type?: string | null
          can_comment?: boolean | null
          can_see_budget?: boolean | null
          can_see_team_members?: boolean | null
          can_see_time_tracking?: boolean | null
          can_upload_files?: boolean | null
          client_email?: string | null
          client_name?: string | null
          created_at?: string | null
          created_by?: string | null
          expires_at?: string | null
          id?: string
          is_active?: boolean | null
          last_accessed_at?: string | null
          link_password_hash?: string | null
          notify_on_updates?: boolean | null
          password_protected?: boolean | null
          project_id: string
          share_token?: string | null
          updated_at?: string | null
        }
        Update: {
          access_count?: number | null
          access_type?: string | null
          can_comment?: boolean | null
          can_see_budget?: boolean | null
          can_see_team_members?: boolean | null
          can_see_time_tracking?: boolean | null
          can_upload_files?: boolean | null
          client_email?: string | null
          client_name?: string | null
          created_at?: string | null
          created_by?: string | null
          expires_at?: string | null
          id?: string
          is_active?: boolean | null
          last_accessed_at?: string | null
          link_password_hash?: string | null
          notify_on_updates?: boolean | null
          password_protected?: boolean | null
          project_id?: string
          share_token?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "projects_client_access_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "projects_client_access_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects_projects"
            referencedColumns: ["id"]
          },
        ]
      }
      projects_client_questions: {
        Row: {
          answer: string | null
          answered_at: string | null
          answered_by: string | null
          client_access_id: string
          created_at: string | null
          id: string
          message: string
          project_id: string
          status: string | null
          subject: string
          updated_at: string | null
        }
        Insert: {
          answer?: string | null
          answered_at?: string | null
          answered_by?: string | null
          client_access_id: string
          created_at?: string | null
          id?: string
          message: string
          project_id: string
          status?: string | null
          subject: string
          updated_at?: string | null
        }
        Update: {
          answer?: string | null
          answered_at?: string | null
          answered_by?: string | null
          client_access_id?: string
          created_at?: string | null
          id?: string
          message?: string
          project_id?: string
          status?: string | null
          subject?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "projects_client_questions_answered_by_fkey"
            columns: ["answered_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "projects_client_questions_client_access_id_fkey"
            columns: ["client_access_id"]
            isOneToOne: false
            referencedRelation: "projects_client_access"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "projects_client_questions_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects_projects"
            referencedColumns: ["id"]
          },
        ]
      }
      projects_client_validations: {
        Row: {
          change_requests: string | null
          client_feedback: string | null
          created_at: string | null
          created_by: string | null
          description: string | null
          id: string
          project_id: string
          status: string | null
          task_ids: string[] | null
          title: string
          updated_at: string | null
          validated_at: string | null
          validated_by_client_id: string | null
        }
        Insert: {
          change_requests?: string | null
          client_feedback?: string | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          id?: string
          project_id: string
          status?: string | null
          task_ids?: string[] | null
          title: string
          updated_at?: string | null
          validated_at?: string | null
          validated_by_client_id?: string | null
        }
        Update: {
          change_requests?: string | null
          client_feedback?: string | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          id?: string
          project_id?: string
          status?: string | null
          task_ids?: string[] | null
          title?: string
          updated_at?: string | null
          validated_at?: string | null
          validated_by_client_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "projects_client_validations_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "projects_client_validations_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects_projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "projects_client_validations_validated_by_client_id_fkey"
            columns: ["validated_by_client_id"]
            isOneToOne: false
            referencedRelation: "projects_client_access"
            referencedColumns: ["id"]
          },
        ]
      }
      projects_labels: {
        Row: {
          color: string | null
          created_at: string | null
          id: string
          name: string
          project_id: string
        }
        Insert: {
          color?: string | null
          created_at?: string | null
          id?: string
          name: string
          project_id: string
        }
        Update: {
          color?: string | null
          created_at?: string | null
          id?: string
          name?: string
          project_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "projects_labels_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects_projects"
            referencedColumns: ["id"]
          },
        ]
      }
      projects_project_members: {
        Row: {
          can_delete_tasks: boolean | null
          can_edit: boolean | null
          can_manage_members: boolean | null
          created_at: string | null
          id: string
          project_id: string
          role: string | null
          user_id: string
        }
        Insert: {
          can_delete_tasks?: boolean | null
          can_edit?: boolean | null
          can_manage_members?: boolean | null
          created_at?: string | null
          id?: string
          project_id: string
          role?: string | null
          user_id: string
        }
        Update: {
          can_delete_tasks?: boolean | null
          can_edit?: boolean | null
          can_manage_members?: boolean | null
          created_at?: string | null
          id?: string
          project_id?: string
          role?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "projects_project_members_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects_projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "projects_project_members_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      projects_projects: {
        Row: {
          archived_at: string | null
          budget: number | null
          client_id: string | null
          color: string | null
          created_at: string | null
          created_by: string | null
          currency: string | null
          custom_fields: Json | null
          deal_id: string | null
          deleted_at: string | null
          description: string | null
          end_date: string | null
          estimated_hours: number | null
          id: string
          name: string
          organization_id: string
          start_date: string | null
          status: string | null
          time_tracking_enabled: boolean | null
          updated_at: string | null
        }
        Insert: {
          archived_at?: string | null
          budget?: number | null
          client_id?: string | null
          color?: string | null
          created_at?: string | null
          created_by?: string | null
          currency?: string | null
          custom_fields?: Json | null
          deal_id?: string | null
          deleted_at?: string | null
          description?: string | null
          end_date?: string | null
          estimated_hours?: number | null
          id?: string
          name: string
          organization_id: string
          start_date?: string | null
          status?: string | null
          time_tracking_enabled?: boolean | null
          updated_at?: string | null
        }
        Update: {
          archived_at?: string | null
          budget?: number | null
          client_id?: string | null
          color?: string | null
          created_at?: string | null
          created_by?: string | null
          currency?: string | null
          custom_fields?: Json | null
          deal_id?: string | null
          deleted_at?: string | null
          description?: string | null
          end_date?: string | null
          estimated_hours?: number | null
          id?: string
          name?: string
          organization_id?: string
          start_date?: string | null
          status?: string | null
          time_tracking_enabled?: boolean | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "projects_projects_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "invoice_clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "projects_projects_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "projects_projects_deal_id_fkey"
            columns: ["deal_id"]
            isOneToOne: false
            referencedRelation: "crm_deals"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "projects_projects_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      projects_task_assignees: {
        Row: {
          assigned_at: string | null
          assigned_by: string | null
          id: string
          task_id: string
          user_id: string
        }
        Insert: {
          assigned_at?: string | null
          assigned_by?: string | null
          id?: string
          task_id: string
          user_id: string
        }
        Update: {
          assigned_at?: string | null
          assigned_by?: string | null
          id?: string
          task_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "projects_task_assignees_assigned_by_fkey"
            columns: ["assigned_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "projects_task_assignees_task_id_fkey"
            columns: ["task_id"]
            isOneToOne: false
            referencedRelation: "projects_tasks"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "projects_task_assignees_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      projects_task_attachments: {
        Row: {
          created_at: string | null
          file_name: string
          file_size: number | null
          file_url: string
          id: string
          mime_type: string | null
          task_id: string
          uploaded_by: string | null
        }
        Insert: {
          created_at?: string | null
          file_name: string
          file_size?: number | null
          file_url: string
          id?: string
          mime_type?: string | null
          task_id: string
          uploaded_by?: string | null
        }
        Update: {
          created_at?: string | null
          file_name?: string
          file_size?: number | null
          file_url?: string
          id?: string
          mime_type?: string | null
          task_id?: string
          uploaded_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "projects_task_attachments_task_id_fkey"
            columns: ["task_id"]
            isOneToOne: false
            referencedRelation: "projects_tasks"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "projects_task_attachments_uploaded_by_fkey"
            columns: ["uploaded_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      projects_task_checklist_items: {
        Row: {
          completed_at: string | null
          completed_by: string | null
          created_at: string | null
          id: string
          is_completed: boolean | null
          position: number | null
          task_id: string
          title: string
        }
        Insert: {
          completed_at?: string | null
          completed_by?: string | null
          created_at?: string | null
          id?: string
          is_completed?: boolean | null
          position?: number | null
          task_id: string
          title: string
        }
        Update: {
          completed_at?: string | null
          completed_by?: string | null
          created_at?: string | null
          id?: string
          is_completed?: boolean | null
          position?: number | null
          task_id?: string
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "projects_task_checklist_items_completed_by_fkey"
            columns: ["completed_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "projects_task_checklist_items_task_id_fkey"
            columns: ["task_id"]
            isOneToOne: false
            referencedRelation: "projects_tasks"
            referencedColumns: ["id"]
          },
        ]
      }
      projects_task_comments: {
        Row: {
          client_access_id: string | null
          content: string
          created_at: string | null
          deleted_at: string | null
          edited_at: string | null
          id: string
          parent_id: string | null
          task_id: string
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          client_access_id?: string | null
          content: string
          created_at?: string | null
          deleted_at?: string | null
          edited_at?: string | null
          id?: string
          parent_id?: string | null
          task_id: string
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          client_access_id?: string | null
          content?: string
          created_at?: string | null
          deleted_at?: string | null
          edited_at?: string | null
          id?: string
          parent_id?: string | null
          task_id?: string
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "projects_task_comments_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "projects_task_comments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "projects_task_comments_task_id_fkey"
            columns: ["task_id"]
            isOneToOne: false
            referencedRelation: "projects_tasks"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "projects_task_comments_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      projects_task_dependencies: {
        Row: {
          created_at: string | null
          dependency_type: string | null
          depends_on_task_id: string
          id: string
          task_id: string
        }
        Insert: {
          created_at?: string | null
          dependency_type?: string | null
          depends_on_task_id: string
          id?: string
          task_id: string
        }
        Update: {
          created_at?: string | null
          dependency_type?: string | null
          depends_on_task_id?: string
          id?: string
          task_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "projects_task_dependencies_depends_on_task_id_fkey"
            columns: ["depends_on_task_id"]
            isOneToOne: false
            referencedRelation: "projects_tasks"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "projects_task_dependencies_task_id_fkey"
            columns: ["task_id"]
            isOneToOne: false
            referencedRelation: "projects_tasks"
            referencedColumns: ["id"]
          },
        ]
      }
      projects_task_labels: {
        Row: {
          label_id: string
          task_id: string
        }
        Insert: {
          label_id: string
          task_id: string
        }
        Update: {
          label_id?: string
          task_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "projects_task_labels_label_id_fkey"
            columns: ["label_id"]
            isOneToOne: false
            referencedRelation: "projects_labels"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "projects_task_labels_task_id_fkey"
            columns: ["task_id"]
            isOneToOne: false
            referencedRelation: "projects_tasks"
            referencedColumns: ["id"]
          },
        ]
      }
      projects_task_statuses: {
        Row: {
          color: string | null
          created_at: string | null
          id: string
          is_completed: boolean | null
          name: string
          position: number | null
          project_id: string
          updated_at: string | null
        }
        Insert: {
          color?: string | null
          created_at?: string | null
          id?: string
          is_completed?: boolean | null
          name: string
          position?: number | null
          project_id: string
          updated_at?: string | null
        }
        Update: {
          color?: string | null
          created_at?: string | null
          id?: string
          is_completed?: boolean | null
          name?: string
          position?: number | null
          project_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "projects_task_statuses_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects_projects"
            referencedColumns: ["id"]
          },
        ]
      }
      projects_tasks: {
        Row: {
          completed_at: string | null
          created_at: string | null
          created_by: string | null
          custom_fields: Json | null
          deleted_at: string | null
          description: string | null
          due_date: string | null
          estimated_hours: number | null
          id: string
          parent_id: string | null
          position: number | null
          priority: string | null
          project_id: string
          start_date: string | null
          status_id: string
          title: string
          updated_at: string | null
        }
        Insert: {
          completed_at?: string | null
          created_at?: string | null
          created_by?: string | null
          custom_fields?: Json | null
          deleted_at?: string | null
          description?: string | null
          due_date?: string | null
          estimated_hours?: number | null
          id?: string
          parent_id?: string | null
          position?: number | null
          priority?: string | null
          project_id: string
          start_date?: string | null
          status_id: string
          title: string
          updated_at?: string | null
        }
        Update: {
          completed_at?: string | null
          created_at?: string | null
          created_by?: string | null
          custom_fields?: Json | null
          deleted_at?: string | null
          description?: string | null
          due_date?: string | null
          estimated_hours?: number | null
          id?: string
          parent_id?: string | null
          position?: number | null
          priority?: string | null
          project_id?: string
          start_date?: string | null
          status_id?: string
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "projects_tasks_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "projects_tasks_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "projects_tasks"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "projects_tasks_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects_projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "projects_tasks_status_id_fkey"
            columns: ["status_id"]
            isOneToOne: false
            referencedRelation: "projects_task_statuses"
            referencedColumns: ["id"]
          },
        ]
      }
      projects_time_entries: {
        Row: {
          created_at: string | null
          date: string
          description: string | null
          duration_minutes: number
          hourly_rate: number | null
          id: string
          is_billable: boolean | null
          project_id: string
          task_id: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          date: string
          description?: string | null
          duration_minutes: number
          hourly_rate?: number | null
          id?: string
          is_billable?: boolean | null
          project_id: string
          task_id?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          date?: string
          description?: string | null
          duration_minutes?: number
          hourly_rate?: number | null
          id?: string
          is_billable?: boolean | null
          project_id?: string
          task_id?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "projects_time_entries_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects_projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "projects_time_entries_task_id_fkey"
            columns: ["task_id"]
            isOneToOne: false
            referencedRelation: "projects_tasks"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "projects_time_entries_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      sessions: {
        Row: {
          created_at: string | null
          device_type: string | null
          expires_at: string
          id: string
          ip_address: string | null
          last_active_at: string | null
          organization_id: string | null
          refresh_token: string | null
          token: string
          user_agent: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          device_type?: string | null
          expires_at: string
          id?: string
          ip_address?: string | null
          last_active_at?: string | null
          organization_id?: string | null
          refresh_token?: string | null
          token: string
          user_agent?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          device_type?: string | null
          expires_at?: string
          id?: string
          ip_address?: string | null
          last_active_at?: string | null
          organization_id?: string | null
          refresh_token?: string | null
          token?: string
          user_agent?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "sessions_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sessions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      tickets_activity_log: {
        Row: {
          activity_type: string
          actor_id: string | null
          actor_type: string | null
          created_at: string | null
          description: string | null
          field_name: string | null
          id: string
          new_value: string | null
          old_value: string | null
          ticket_id: string
        }
        Insert: {
          activity_type: string
          actor_id?: string | null
          actor_type?: string | null
          created_at?: string | null
          description?: string | null
          field_name?: string | null
          id?: string
          new_value?: string | null
          old_value?: string | null
          ticket_id: string
        }
        Update: {
          activity_type?: string
          actor_id?: string | null
          actor_type?: string | null
          created_at?: string | null
          description?: string | null
          field_name?: string | null
          id?: string
          new_value?: string | null
          old_value?: string | null
          ticket_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "tickets_activity_log_actor_id_fkey"
            columns: ["actor_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tickets_activity_log_ticket_id_fkey"
            columns: ["ticket_id"]
            isOneToOne: false
            referencedRelation: "tickets_tickets"
            referencedColumns: ["id"]
          },
        ]
      }
      tickets_automation_rules: {
        Row: {
          actions: Json
          conditions: Json
          created_at: string | null
          description: string | null
          id: string
          is_active: boolean | null
          name: string
          organization_id: string
          position: number | null
          trigger_type: string
          updated_at: string | null
        }
        Insert: {
          actions?: Json
          conditions?: Json
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          organization_id: string
          position?: number | null
          trigger_type: string
          updated_at?: string | null
        }
        Update: {
          actions?: Json
          conditions?: Json
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          organization_id?: string
          position?: number | null
          trigger_type?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "tickets_automation_rules_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      tickets_canned_responses: {
        Row: {
          category: string | null
          content: string
          created_at: string | null
          id: string
          is_shared: boolean | null
          organization_id: string
          shortcut: string | null
          title: string
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          category?: string | null
          content: string
          created_at?: string | null
          id?: string
          is_shared?: boolean | null
          organization_id: string
          shortcut?: string | null
          title: string
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          category?: string | null
          content?: string
          created_at?: string | null
          id?: string
          is_shared?: boolean | null
          organization_id?: string
          shortcut?: string | null
          title?: string
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "tickets_canned_responses_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tickets_canned_responses_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      tickets_categories: {
        Row: {
          color: string | null
          created_at: string | null
          description: string | null
          icon: string | null
          id: string
          is_active: boolean | null
          name: string
          organization_id: string
          parent_id: string | null
          position: number | null
          updated_at: string | null
        }
        Insert: {
          color?: string | null
          created_at?: string | null
          description?: string | null
          icon?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          organization_id: string
          parent_id?: string | null
          position?: number | null
          updated_at?: string | null
        }
        Update: {
          color?: string | null
          created_at?: string | null
          description?: string | null
          icon?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          organization_id?: string
          parent_id?: string | null
          position?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "tickets_categories_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tickets_categories_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "tickets_categories"
            referencedColumns: ["id"]
          },
        ]
      }
      tickets_kb_categories: {
        Row: {
          color: string | null
          created_at: string | null
          description: string | null
          icon: string | null
          id: string
          is_active: boolean | null
          name: string
          organization_id: string
          position: number | null
          updated_at: string | null
        }
        Insert: {
          color?: string | null
          created_at?: string | null
          description?: string | null
          icon?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          organization_id: string
          position?: number | null
          updated_at?: string | null
        }
        Update: {
          color?: string | null
          created_at?: string | null
          description?: string | null
          icon?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          organization_id?: string
          position?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "tickets_kb_categories_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      tickets_kb_articles: {
        Row: {
          author_id: string | null
          category_id: string | null
          kb_category_id: string | null
          content: string
          created_at: string | null
          deleted_at: string | null
          excerpt: string | null
          helpful_count: number | null
          id: string
          meta_description: string | null
          meta_title: string | null
          not_helpful_count: number | null
          organization_id: string
          published_at: string | null
          slug: string
          status: string | null
          title: string
          updated_at: string | null
          view_count: number | null
        }
        Insert: {
          author_id?: string | null
          category_id?: string | null
          kb_category_id?: string | null
          content: string
          created_at?: string | null
          deleted_at?: string | null
          excerpt?: string | null
          helpful_count?: number | null
          id?: string
          meta_description?: string | null
          meta_title?: string | null
          not_helpful_count?: number | null
          organization_id: string
          published_at?: string | null
          slug: string
          status?: string | null
          title: string
          updated_at?: string | null
          view_count?: number | null
        }
        Update: {
          author_id?: string | null
          category_id?: string | null
          kb_category_id?: string | null
          content?: string
          created_at?: string | null
          deleted_at?: string | null
          excerpt?: string | null
          helpful_count?: number | null
          id?: string
          meta_description?: string | null
          meta_title?: string | null
          not_helpful_count?: number | null
          organization_id?: string
          published_at?: string | null
          slug?: string
          status?: string | null
          title?: string
          updated_at?: string | null
          view_count?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "tickets_kb_articles_author_id_fkey"
            columns: ["author_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tickets_kb_articles_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "tickets_categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tickets_kb_articles_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      tickets_messages: {
        Row: {
          author_email: string | null
          author_id: string | null
          author_name: string | null
          author_type: string
          content: string
          content_type: string | null
          created_at: string | null
          deleted_at: string | null
          edited_at: string | null
          email_in_reply_to: string | null
          email_message_id: string | null
          id: string
          in_reply_to: string | null
          is_internal: boolean | null
          message_type: string | null
          ticket_id: string
          updated_at: string | null
        }
        Insert: {
          author_email?: string | null
          author_id?: string | null
          author_name?: string | null
          author_type: string
          content: string
          content_type?: string | null
          created_at?: string | null
          deleted_at?: string | null
          edited_at?: string | null
          email_in_reply_to?: string | null
          email_message_id?: string | null
          id?: string
          in_reply_to?: string | null
          is_internal?: boolean | null
          message_type?: string | null
          ticket_id: string
          updated_at?: string | null
        }
        Update: {
          author_email?: string | null
          author_id?: string | null
          author_name?: string | null
          author_type?: string
          content?: string
          content_type?: string | null
          created_at?: string | null
          deleted_at?: string | null
          edited_at?: string | null
          email_in_reply_to?: string | null
          email_message_id?: string | null
          id?: string
          in_reply_to?: string | null
          is_internal?: boolean | null
          message_type?: string | null
          ticket_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "tickets_messages_author_id_fkey"
            columns: ["author_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tickets_messages_ticket_id_fkey"
            columns: ["ticket_id"]
            isOneToOne: false
            referencedRelation: "tickets_tickets"
            referencedColumns: ["id"]
          },
        ]
      }
      tickets_sla_policies: {
        Row: {
          business_days: number[] | null
          business_hours_end: string | null
          business_hours_only: boolean | null
          business_hours_start: string | null
          created_at: string | null
          description: string | null
          id: string
          is_default: boolean | null
          name: string
          organization_id: string
          resolution_time_high: number | null
          resolution_time_low: number | null
          resolution_time_normal: number | null
          resolution_time_urgent: number | null
          response_time_high: number | null
          response_time_low: number | null
          response_time_normal: number | null
          response_time_urgent: number | null
          updated_at: string | null
        }
        Insert: {
          business_days?: number[] | null
          business_hours_end?: string | null
          business_hours_only?: boolean | null
          business_hours_start?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          is_default?: boolean | null
          name: string
          organization_id: string
          resolution_time_high?: number | null
          resolution_time_low?: number | null
          resolution_time_normal?: number | null
          resolution_time_urgent?: number | null
          response_time_high?: number | null
          response_time_low?: number | null
          response_time_normal?: number | null
          response_time_urgent?: number | null
          updated_at?: string | null
        }
        Update: {
          business_days?: number[] | null
          business_hours_end?: string | null
          business_hours_only?: boolean | null
          business_hours_start?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          is_default?: boolean | null
          name?: string
          organization_id?: string
          resolution_time_high?: number | null
          resolution_time_low?: number | null
          resolution_time_normal?: number | null
          resolution_time_urgent?: number | null
          response_time_high?: number | null
          response_time_low?: number | null
          response_time_normal?: number | null
          response_time_urgent?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "tickets_sla_policies_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      tickets_tags: {
        Row: {
          color: string | null
          created_at: string | null
          id: string
          name: string
          organization_id: string
        }
        Insert: {
          color?: string | null
          created_at?: string | null
          id?: string
          name: string
          organization_id: string
        }
        Update: {
          color?: string | null
          created_at?: string | null
          id?: string
          name?: string
          organization_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "tickets_tags_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      tickets_tickets: {
        Row: {
          assigned_to: string | null
          category_id: string | null
          closed_at: string | null
          company_id: string | null
          contact_id: string | null
          created_at: string | null
          created_by: string | null
          custom_fields: Json | null
          deleted_at: string | null
          description: string | null
          first_response_at: string | null
          first_response_due_at: string | null
          id: string
          organization_id: string
          priority: string | null
          requester_email: string | null
          requester_name: string | null
          requester_phone: string | null
          resolution_due_at: string | null
          resolved_at: string | null
          satisfaction_comment: string | null
          satisfaction_rating: number | null
          sla_breached: boolean | null
          sla_first_response_at: string | null
          sla_first_response_due: string | null
          sla_policy_id: string | null
          sla_resolution_breached: boolean | null
          sla_resolution_due: string | null
          sla_resolved_at: string | null
          sla_response_breached: boolean | null
          source: string | null
          status: string | null
          subject: string
          tags: string[] | null
          ticket_number: string
          updated_at: string | null
        }
        Insert: {
          assigned_to?: string | null
          category_id?: string | null
          closed_at?: string | null
          company_id?: string | null
          contact_id?: string | null
          created_at?: string | null
          created_by?: string | null
          custom_fields?: Json | null
          deleted_at?: string | null
          description?: string | null
          first_response_at?: string | null
          first_response_due_at?: string | null
          id?: string
          organization_id: string
          priority?: string | null
          requester_email?: string | null
          requester_name?: string | null
          requester_phone?: string | null
          resolution_due_at?: string | null
          resolved_at?: string | null
          satisfaction_comment?: string | null
          satisfaction_rating?: number | null
          sla_breached?: boolean | null
          sla_first_response_at?: string | null
          sla_first_response_due?: string | null
          sla_policy_id?: string | null
          sla_resolution_breached?: boolean | null
          sla_resolution_due?: string | null
          sla_resolved_at?: string | null
          sla_response_breached?: boolean | null
          source?: string | null
          status?: string | null
          subject: string
          tags?: string[] | null
          ticket_number: string
          updated_at?: string | null
        }
        Update: {
          assigned_to?: string | null
          category_id?: string | null
          closed_at?: string | null
          company_id?: string | null
          contact_id?: string | null
          created_at?: string | null
          created_by?: string | null
          custom_fields?: Json | null
          deleted_at?: string | null
          description?: string | null
          first_response_at?: string | null
          first_response_due_at?: string | null
          id?: string
          organization_id?: string
          priority?: string | null
          requester_email?: string | null
          requester_name?: string | null
          requester_phone?: string | null
          resolution_due_at?: string | null
          resolved_at?: string | null
          satisfaction_comment?: string | null
          satisfaction_rating?: number | null
          sla_breached?: boolean | null
          sla_first_response_at?: string | null
          sla_first_response_due?: string | null
          sla_policy_id?: string | null
          sla_resolution_breached?: boolean | null
          sla_resolution_due?: string | null
          sla_resolved_at?: string | null
          sla_response_breached?: boolean | null
          source?: string | null
          status?: string | null
          subject?: string
          tags?: string[] | null
          ticket_number?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "tickets_tickets_assigned_to_fkey"
            columns: ["assigned_to"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tickets_tickets_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "tickets_categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tickets_tickets_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "crm_companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tickets_tickets_contact_id_fkey"
            columns: ["contact_id"]
            isOneToOne: false
            referencedRelation: "crm_contacts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tickets_tickets_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tickets_tickets_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tickets_tickets_sla_policy_id_fkey"
            columns: ["sla_policy_id"]
            isOneToOne: false
            referencedRelation: "tickets_sla_policies"
            referencedColumns: ["id"]
          },
        ]
      }
      usage_tracking: {
        Row: {
          created_at: string | null
          current_count: number | null
          feature: string
          id: string
          module: string
          organization_id: string
          period_end: string
          period_start: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          current_count?: number | null
          feature: string
          id?: string
          module: string
          organization_id: string
          period_end: string
          period_start: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          current_count?: number | null
          feature?: string
          id?: string
          module?: string
          organization_id?: string
          period_end?: string
          period_start?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "usage_tracking_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      users: {
        Row: {
          avatar_url: string | null
          created_at: string | null
          deleted_at: string | null
          email: string
          email_verified: boolean | null
          first_name: string | null
          id: string
          last_login_at: string | null
          last_name: string | null
          locale: string | null
          password_hash: string | null
          preferences: Json | null
          timezone: string | null
          two_factor_enabled: boolean | null
          two_factor_secret: string | null
          updated_at: string | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string | null
          deleted_at?: string | null
          email: string
          email_verified?: boolean | null
          first_name?: string | null
          id?: string
          last_login_at?: string | null
          last_name?: string | null
          locale?: string | null
          password_hash?: string | null
          preferences?: Json | null
          timezone?: string | null
          two_factor_enabled?: boolean | null
          two_factor_secret?: string | null
          updated_at?: string | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string | null
          deleted_at?: string | null
          email?: string
          email_verified?: boolean | null
          first_name?: string | null
          id?: string
          last_login_at?: string | null
          last_name?: string | null
          locale?: string | null
          password_hash?: string | null
          preferences?: Json | null
          timezone?: string | null
          two_factor_enabled?: boolean | null
          two_factor_secret?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      verification_tokens: {
        Row: {
          created_at: string | null
          expires_at: string
          id: string
          new_email: string | null
          token: string
          type: string
          used_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          expires_at: string
          id?: string
          new_email?: string | null
          token: string
          type: string
          used_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          expires_at?: string
          id?: string
          new_email?: string | null
          token?: string
          type?: string
          used_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "verification_tokens_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      check_usage_limit: {
        Args: {
          p_feature: string
          p_limit: number
          p_module: string
          p_organization_id: string
        }
        Returns: boolean
      }
      create_default_crm_data: {
        Args: { p_organization_id: string }
        Returns: undefined
      }
      create_default_dashboard: {
        Args: { p_organization_id: string; p_user_id: string }
        Returns: undefined
      }
      create_default_docs_settings: {
        Args: { p_organization_id: string }
        Returns: undefined
      }
      create_default_hr_leave_types: {
        Args: { p_organization_id: string }
        Returns: undefined
      }
      create_default_invoice_settings: {
        Args: { p_organization_id: string }
        Returns: undefined
      }
      create_default_project_statuses: {
        Args: { p_project_id: string }
        Returns: undefined
      }
      create_default_sla_policy: {
        Args: { p_organization_id: string }
        Returns: undefined
      }
      create_default_ticket_categories: {
        Args: { p_organization_id: string }
        Returns: undefined
      }
      decrement_usage: {
        Args: {
          p_amount?: number
          p_feature: string
          p_module: string
          p_organization_id: string
        }
        Returns: number
      }
      get_or_create_usage_tracking: {
        Args: { p_feature: string; p_module: string; p_organization_id: string }
        Returns: {
          created_at: string | null
          current_count: number | null
          feature: string
          id: string
          module: string
          organization_id: string
          period_end: string
          period_start: string
          updated_at: string | null
        }
        SetofOptions: {
          from: "*"
          to: "usage_tracking"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      get_user_organizations: { Args: { user_id: string }; Returns: string[] }
      increment_usage: {
        Args: {
          p_amount?: number
          p_feature: string
          p_module: string
          p_organization_id: string
        }
        Returns: number
      }
      initialize_organization_defaults: {
        Args: { p_organization_id: string; p_user_id?: string }
        Returns: undefined
      }
      is_org_member: { Args: { org_id: string }; Returns: boolean }
      show_limit: { Args: never; Returns: number }
      show_trgm: { Args: { "": string }; Returns: string[] }
    }
    Enums: {
      audit_action:
        | "create"
        | "update"
        | "delete"
        | "restore"
        | "login"
        | "logout"
        | "export"
      member_status: "pending" | "active" | "suspended"
      subscription_plan: "free" | "pro" | "enterprise"
      subscription_status:
        | "trialing"
        | "active"
        | "past_due"
        | "canceled"
        | "unpaid"
      user_role: "owner" | "admin" | "member"
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
      audit_action: [
        "create",
        "update",
        "delete",
        "restore",
        "login",
        "logout",
        "export",
      ],
      member_status: ["pending", "active", "suspended"],
      subscription_plan: ["free", "pro", "enterprise"],
      subscription_status: [
        "trialing",
        "active",
        "past_due",
        "canceled",
        "unpaid",
      ],
      user_role: ["owner", "admin", "member"],
    },
  },
} as const
