export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  crm: {
    Tables: {
      activities: {
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
            foreignKeyName: "activities_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "activities_contact_id_fkey"
            columns: ["contact_id"]
            isOneToOne: false
            referencedRelation: "contacts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "activities_deal_id_fkey"
            columns: ["deal_id"]
            isOneToOne: false
            referencedRelation: "deals"
            referencedColumns: ["id"]
          },
        ]
      }
      companies: {
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
        Relationships: []
      }
      contacts: {
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
            foreignKeyName: "contacts_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      custom_field_definitions: {
        Row: {
          created_at: string | null
          entity_type: string
          field_key: string
          field_type: string
          id: string
          is_required: boolean | null
          name: string
          options: Json | null
          organization_id: string
          position: number | null
        }
        Insert: {
          created_at?: string | null
          entity_type: string
          field_key: string
          field_type: string
          id?: string
          is_required?: boolean | null
          name: string
          options?: Json | null
          organization_id: string
          position?: number | null
        }
        Update: {
          created_at?: string | null
          entity_type?: string
          field_key?: string
          field_type?: string
          id?: string
          is_required?: boolean | null
          name?: string
          options?: Json | null
          organization_id?: string
          position?: number | null
        }
        Relationships: []
      }
      deals: {
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
            foreignKeyName: "deals_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "deals_contact_id_fkey"
            columns: ["contact_id"]
            isOneToOne: false
            referencedRelation: "contacts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "deals_pipeline_id_fkey"
            columns: ["pipeline_id"]
            isOneToOne: false
            referencedRelation: "pipelines"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "deals_stage_id_fkey"
            columns: ["stage_id"]
            isOneToOne: false
            referencedRelation: "pipeline_stages"
            referencedColumns: ["id"]
          },
        ]
      }
      pipeline_stages: {
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
            foreignKeyName: "pipeline_stages_pipeline_id_fkey"
            columns: ["pipeline_id"]
            isOneToOne: false
            referencedRelation: "pipelines"
            referencedColumns: ["id"]
          },
        ]
      }
      pipelines: {
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
        Relationships: []
      }
      tags: {
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
  graphql_public: {
    Tables: {
      [_ in never]: never
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      graphql: {
        Args: {
          operationName?: string
          query?: string
          variables?: Json
          extensions?: Json
        }
        Returns: Json
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  hr: {
    Tables: {
      employees: {
        Row: {
          address_line_1: string | null
          address_line_2: string | null
          annual_leave_balance: number | null
          birth_date: string | null
          birth_place: string | null
          city: string | null
          contract_end_date: string | null
          contract_start_date: string | null
          contract_type: Database["hr"]["Enums"]["contract_type"] | null
          country: string | null
          created_at: string | null
          custom_fields: Json | null
          deleted_at: string | null
          department: string | null
          email: string | null
          emergency_contact_name: string | null
          emergency_contact_phone: string | null
          emergency_contact_relation: string | null
          employee_number: string | null
          first_name: string
          gross_salary: number | null
          id: string
          job_title: string | null
          last_name: string
          left_date: string | null
          left_reason: string | null
          manager_id: string | null
          nationality: string | null
          notes: string | null
          organization_id: string
          phone: string | null
          photo_url: string | null
          postal_code: string | null
          rtt_balance: number | null
          salary_currency: string | null
          social_security_number: string | null
          status: Database["hr"]["Enums"]["employee_status"] | null
          trial_end_date: string | null
          updated_at: string | null
          user_id: string | null
          work_email: string | null
          work_phone: string | null
        }
        Insert: {
          address_line_1?: string | null
          address_line_2?: string | null
          annual_leave_balance?: number | null
          birth_date?: string | null
          birth_place?: string | null
          city?: string | null
          contract_end_date?: string | null
          contract_start_date?: string | null
          contract_type?: Database["hr"]["Enums"]["contract_type"] | null
          country?: string | null
          created_at?: string | null
          custom_fields?: Json | null
          deleted_at?: string | null
          department?: string | null
          email?: string | null
          emergency_contact_name?: string | null
          emergency_contact_phone?: string | null
          emergency_contact_relation?: string | null
          employee_number?: string | null
          first_name: string
          gross_salary?: number | null
          id?: string
          job_title?: string | null
          last_name: string
          left_date?: string | null
          left_reason?: string | null
          manager_id?: string | null
          nationality?: string | null
          notes?: string | null
          organization_id: string
          phone?: string | null
          photo_url?: string | null
          postal_code?: string | null
          rtt_balance?: number | null
          salary_currency?: string | null
          social_security_number?: string | null
          status?: Database["hr"]["Enums"]["employee_status"] | null
          trial_end_date?: string | null
          updated_at?: string | null
          user_id?: string | null
          work_email?: string | null
          work_phone?: string | null
        }
        Update: {
          address_line_1?: string | null
          address_line_2?: string | null
          annual_leave_balance?: number | null
          birth_date?: string | null
          birth_place?: string | null
          city?: string | null
          contract_end_date?: string | null
          contract_start_date?: string | null
          contract_type?: Database["hr"]["Enums"]["contract_type"] | null
          country?: string | null
          created_at?: string | null
          custom_fields?: Json | null
          deleted_at?: string | null
          department?: string | null
          email?: string | null
          emergency_contact_name?: string | null
          emergency_contact_phone?: string | null
          emergency_contact_relation?: string | null
          employee_number?: string | null
          first_name?: string
          gross_salary?: number | null
          id?: string
          job_title?: string | null
          last_name?: string
          left_date?: string | null
          left_reason?: string | null
          manager_id?: string | null
          nationality?: string | null
          notes?: string | null
          organization_id?: string
          phone?: string | null
          photo_url?: string | null
          postal_code?: string | null
          rtt_balance?: number | null
          salary_currency?: string | null
          social_security_number?: string | null
          status?: Database["hr"]["Enums"]["employee_status"] | null
          trial_end_date?: string | null
          updated_at?: string | null
          user_id?: string | null
          work_email?: string | null
          work_phone?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "employees_manager_id_fkey"
            columns: ["manager_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
        ]
      }
      interviews: {
        Row: {
          achievements: string | null
          completed_date: string | null
          created_at: string | null
          created_by: string | null
          deleted_at: string | null
          development_plan: string | null
          document_url: string | null
          employee_comments: string | null
          employee_id: string
          feedback: string | null
          id: string
          interviewer_id: string | null
          objectives: string | null
          organization_id: string
          scheduled_date: string
          status: Database["hr"]["Enums"]["interview_status"] | null
          type: Database["hr"]["Enums"]["interview_type"]
          updated_at: string | null
        }
        Insert: {
          achievements?: string | null
          completed_date?: string | null
          created_at?: string | null
          created_by?: string | null
          deleted_at?: string | null
          development_plan?: string | null
          document_url?: string | null
          employee_comments?: string | null
          employee_id: string
          feedback?: string | null
          id?: string
          interviewer_id?: string | null
          objectives?: string | null
          organization_id: string
          scheduled_date: string
          status?: Database["hr"]["Enums"]["interview_status"] | null
          type: Database["hr"]["Enums"]["interview_type"]
          updated_at?: string | null
        }
        Update: {
          achievements?: string | null
          completed_date?: string | null
          created_at?: string | null
          created_by?: string | null
          deleted_at?: string | null
          development_plan?: string | null
          document_url?: string | null
          employee_comments?: string | null
          employee_id?: string
          feedback?: string | null
          id?: string
          interviewer_id?: string | null
          objectives?: string | null
          organization_id?: string
          scheduled_date?: string
          status?: Database["hr"]["Enums"]["interview_status"] | null
          type?: Database["hr"]["Enums"]["interview_type"]
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "interviews_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "interviews_interviewer_id_fkey"
            columns: ["interviewer_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
        ]
      }
      leave_requests: {
        Row: {
          approved_at: string | null
          approved_by: string | null
          created_at: string | null
          days_count: number
          deleted_at: string | null
          employee_id: string
          end_date: string
          end_half_day: boolean | null
          id: string
          leave_type_id: string
          organization_id: string
          reason: string | null
          rejection_reason: string | null
          requested_by: string | null
          start_date: string
          start_half_day: boolean | null
          status: Database["hr"]["Enums"]["leave_status"] | null
          updated_at: string | null
        }
        Insert: {
          approved_at?: string | null
          approved_by?: string | null
          created_at?: string | null
          days_count?: number
          deleted_at?: string | null
          employee_id: string
          end_date: string
          end_half_day?: boolean | null
          id?: string
          leave_type_id: string
          organization_id: string
          reason?: string | null
          rejection_reason?: string | null
          requested_by?: string | null
          start_date: string
          start_half_day?: boolean | null
          status?: Database["hr"]["Enums"]["leave_status"] | null
          updated_at?: string | null
        }
        Update: {
          approved_at?: string | null
          approved_by?: string | null
          created_at?: string | null
          days_count?: number
          deleted_at?: string | null
          employee_id?: string
          end_date?: string
          end_half_day?: boolean | null
          id?: string
          leave_type_id?: string
          organization_id?: string
          reason?: string | null
          rejection_reason?: string | null
          requested_by?: string | null
          start_date?: string
          start_half_day?: boolean | null
          status?: Database["hr"]["Enums"]["leave_status"] | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "leave_requests_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "leave_requests_leave_type_id_fkey"
            columns: ["leave_type_id"]
            isOneToOne: false
            referencedRelation: "leave_types"
            referencedColumns: ["id"]
          },
        ]
      }
      leave_types: {
        Row: {
          code: string
          color: string | null
          created_at: string | null
          deducts_from_balance: boolean | null
          id: string
          is_paid: boolean | null
          is_system: boolean | null
          name: string
          organization_id: string
          requires_approval: boolean | null
        }
        Insert: {
          code: string
          color?: string | null
          created_at?: string | null
          deducts_from_balance?: boolean | null
          id?: string
          is_paid?: boolean | null
          is_system?: boolean | null
          name: string
          organization_id: string
          requires_approval?: boolean | null
        }
        Update: {
          code?: string
          color?: string | null
          created_at?: string | null
          deducts_from_balance?: boolean | null
          id?: string
          is_paid?: boolean | null
          is_system?: boolean | null
          name?: string
          organization_id?: string
          requires_approval?: boolean | null
        }
        Relationships: []
      }
      settings: {
        Row: {
          alert_contract_end_days: number | null
          alert_interview_days: number | null
          alert_trial_end_days: number | null
          annual_leave_days_per_year: number | null
          created_at: string | null
          default_work_hours_per_week: number | null
          employee_self_service_enabled: boolean | null
          employees_can_edit_profile: boolean | null
          employees_can_request_leaves: boolean | null
          employees_can_view_directory: boolean | null
          id: string
          leave_year_start_month: number | null
          organization_id: string
          rtt_days_per_year: number | null
          updated_at: string | null
          work_days: Json | null
        }
        Insert: {
          alert_contract_end_days?: number | null
          alert_interview_days?: number | null
          alert_trial_end_days?: number | null
          annual_leave_days_per_year?: number | null
          created_at?: string | null
          default_work_hours_per_week?: number | null
          employee_self_service_enabled?: boolean | null
          employees_can_edit_profile?: boolean | null
          employees_can_request_leaves?: boolean | null
          employees_can_view_directory?: boolean | null
          id?: string
          leave_year_start_month?: number | null
          organization_id: string
          rtt_days_per_year?: number | null
          updated_at?: string | null
          work_days?: Json | null
        }
        Update: {
          alert_contract_end_days?: number | null
          alert_interview_days?: number | null
          alert_trial_end_days?: number | null
          annual_leave_days_per_year?: number | null
          created_at?: string | null
          default_work_hours_per_week?: number | null
          employee_self_service_enabled?: boolean | null
          employees_can_edit_profile?: boolean | null
          employees_can_request_leaves?: boolean | null
          employees_can_view_directory?: boolean | null
          id?: string
          leave_year_start_month?: number | null
          organization_id?: string
          rtt_days_per_year?: number | null
          updated_at?: string | null
          work_days?: Json | null
        }
        Relationships: []
      }
      time_entries: {
        Row: {
          break_duration_minutes: number | null
          created_at: string | null
          date: string
          employee_id: string
          end_time: string | null
          hours_worked: number
          id: string
          notes: string | null
          organization_id: string
          overtime_hours: number | null
          start_time: string | null
          updated_at: string | null
          validated_at: string | null
          validated_by: string | null
        }
        Insert: {
          break_duration_minutes?: number | null
          created_at?: string | null
          date: string
          employee_id: string
          end_time?: string | null
          hours_worked: number
          id?: string
          notes?: string | null
          organization_id: string
          overtime_hours?: number | null
          start_time?: string | null
          updated_at?: string | null
          validated_at?: string | null
          validated_by?: string | null
        }
        Update: {
          break_duration_minutes?: number | null
          created_at?: string | null
          date?: string
          employee_id?: string
          end_time?: string | null
          hours_worked?: number
          id?: string
          notes?: string | null
          organization_id?: string
          overtime_hours?: number | null
          start_time?: string | null
          updated_at?: string | null
          validated_at?: string | null
          validated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "time_entries_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "employees"
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
      contract_type:
        | "cdi"
        | "cdd"
        | "stage"
        | "alternance"
        | "freelance"
        | "interim"
      document_type:
        | "contract"
        | "id_card"
        | "diploma"
        | "rib"
        | "medical"
        | "other"
      employee_status: "active" | "trial_period" | "notice_period" | "left"
      interview_status: "scheduled" | "completed" | "canceled"
      interview_type: "annual" | "professional" | "trial_end" | "other"
      leave_status: "pending" | "approved" | "rejected" | "canceled"
      leave_type_code:
        | "cp"
        | "rtt"
        | "sick"
        | "unpaid"
        | "maternity"
        | "paternity"
        | "other"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  invoice: {
    Tables: {
      clients: {
        Row: {
          billing_address_line1: string | null
          billing_address_line2: string | null
          billing_city: string | null
          billing_country: string | null
          billing_email: string | null
          billing_phone: string | null
          billing_postal_code: string | null
          contact_name: string | null
          created_at: string | null
          crm_company_id: string | null
          crm_contact_id: string | null
          custom_fields: Json | null
          default_currency: string | null
          deleted_at: string | null
          id: string
          legal_form: string | null
          legal_name: string | null
          name: string
          notes: string | null
          organization_id: string
          payment_method: string | null
          payment_terms: number | null
          siret: string | null
          updated_at: string | null
          vat_number: string | null
        }
        Insert: {
          billing_address_line1?: string | null
          billing_address_line2?: string | null
          billing_city?: string | null
          billing_country?: string | null
          billing_email?: string | null
          billing_phone?: string | null
          billing_postal_code?: string | null
          contact_name?: string | null
          created_at?: string | null
          crm_company_id?: string | null
          crm_contact_id?: string | null
          custom_fields?: Json | null
          default_currency?: string | null
          deleted_at?: string | null
          id?: string
          legal_form?: string | null
          legal_name?: string | null
          name: string
          notes?: string | null
          organization_id: string
          payment_method?: string | null
          payment_terms?: number | null
          siret?: string | null
          updated_at?: string | null
          vat_number?: string | null
        }
        Update: {
          billing_address_line1?: string | null
          billing_address_line2?: string | null
          billing_city?: string | null
          billing_country?: string | null
          billing_email?: string | null
          billing_phone?: string | null
          billing_postal_code?: string | null
          contact_name?: string | null
          created_at?: string | null
          crm_company_id?: string | null
          crm_contact_id?: string | null
          custom_fields?: Json | null
          default_currency?: string | null
          deleted_at?: string | null
          id?: string
          legal_form?: string | null
          legal_name?: string | null
          name?: string
          notes?: string | null
          organization_id?: string
          payment_method?: string | null
          payment_terms?: number | null
          siret?: string | null
          updated_at?: string | null
          vat_number?: string | null
        }
        Relationships: []
      }
      credit_notes: {
        Row: {
          applied_at: string | null
          client_id: string
          created_at: string | null
          created_by: string | null
          credit_note_number: string
          currency: string | null
          deleted_at: string | null
          id: string
          invoice_id: string | null
          issue_date: string
          organization_id: string
          reason: string | null
          status: string | null
          subtotal: number
          total: number
          updated_at: string | null
          vat_amount: number
        }
        Insert: {
          applied_at?: string | null
          client_id: string
          created_at?: string | null
          created_by?: string | null
          credit_note_number: string
          currency?: string | null
          deleted_at?: string | null
          id?: string
          invoice_id?: string | null
          issue_date?: string
          organization_id: string
          reason?: string | null
          status?: string | null
          subtotal?: number
          total?: number
          updated_at?: string | null
          vat_amount?: number
        }
        Update: {
          applied_at?: string | null
          client_id?: string
          created_at?: string | null
          created_by?: string | null
          credit_note_number?: string
          currency?: string | null
          deleted_at?: string | null
          id?: string
          invoice_id?: string | null
          issue_date?: string
          organization_id?: string
          reason?: string | null
          status?: string | null
          subtotal?: number
          total?: number
          updated_at?: string | null
          vat_amount?: number
        }
        Relationships: [
          {
            foreignKeyName: "credit_notes_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "credit_notes_invoice_id_fkey"
            columns: ["invoice_id"]
            isOneToOne: false
            referencedRelation: "invoices"
            referencedColumns: ["id"]
          },
        ]
      }
      invoices: {
        Row: {
          amount_paid: number | null
          client_id: string
          created_at: string | null
          created_by: string | null
          currency: string | null
          custom_fields: Json | null
          deal_id: string | null
          deleted_at: string | null
          discount_amount: number | null
          discount_percent: number | null
          due_date: string
          footer: string | null
          id: string
          introduction: string | null
          invoice_number: string
          issue_date: string
          last_reminder_at: string | null
          notes: string | null
          organization_id: string
          paid_at: string | null
          payment_instructions: string | null
          quote_id: string | null
          reminder_count: number | null
          sent_at: string | null
          status: string | null
          subject: string | null
          subtotal: number
          terms: string | null
          total: number
          updated_at: string | null
          vat_amount: number
        }
        Insert: {
          amount_paid?: number | null
          client_id: string
          created_at?: string | null
          created_by?: string | null
          currency?: string | null
          custom_fields?: Json | null
          deal_id?: string | null
          deleted_at?: string | null
          discount_amount?: number | null
          discount_percent?: number | null
          due_date: string
          footer?: string | null
          id?: string
          introduction?: string | null
          invoice_number: string
          issue_date?: string
          last_reminder_at?: string | null
          notes?: string | null
          organization_id: string
          paid_at?: string | null
          payment_instructions?: string | null
          quote_id?: string | null
          reminder_count?: number | null
          sent_at?: string | null
          status?: string | null
          subject?: string | null
          subtotal?: number
          terms?: string | null
          total?: number
          updated_at?: string | null
          vat_amount?: number
        }
        Update: {
          amount_paid?: number | null
          client_id?: string
          created_at?: string | null
          created_by?: string | null
          currency?: string | null
          custom_fields?: Json | null
          deal_id?: string | null
          deleted_at?: string | null
          discount_amount?: number | null
          discount_percent?: number | null
          due_date?: string
          footer?: string | null
          id?: string
          introduction?: string | null
          invoice_number?: string
          issue_date?: string
          last_reminder_at?: string | null
          notes?: string | null
          organization_id?: string
          paid_at?: string | null
          payment_instructions?: string | null
          quote_id?: string | null
          reminder_count?: number | null
          sent_at?: string | null
          status?: string | null
          subject?: string | null
          subtotal?: number
          terms?: string | null
          total?: number
          updated_at?: string | null
          vat_amount?: number
        }
        Relationships: [
          {
            foreignKeyName: "invoices_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invoices_quote_id_fkey"
            columns: ["quote_id"]
            isOneToOne: false
            referencedRelation: "quotes"
            referencedColumns: ["id"]
          },
        ]
      }
      line_items: {
        Row: {
          created_at: string | null
          description: string
          discount_amount: number | null
          discount_percent: number | null
          document_id: string
          document_type: string
          id: string
          line_total: number
          line_total_with_vat: number
          position: number
          product_id: string | null
          quantity: number
          unit: string | null
          unit_price: number
          updated_at: string | null
          vat_amount: number
          vat_rate: number | null
        }
        Insert: {
          created_at?: string | null
          description: string
          discount_amount?: number | null
          discount_percent?: number | null
          document_id: string
          document_type: string
          id?: string
          line_total?: number
          line_total_with_vat?: number
          position?: number
          product_id?: string | null
          quantity?: number
          unit?: string | null
          unit_price: number
          updated_at?: string | null
          vat_amount?: number
          vat_rate?: number | null
        }
        Update: {
          created_at?: string | null
          description?: string
          discount_amount?: number | null
          discount_percent?: number | null
          document_id?: string
          document_type?: string
          id?: string
          line_total?: number
          line_total_with_vat?: number
          position?: number
          product_id?: string | null
          quantity?: number
          unit?: string | null
          unit_price?: number
          updated_at?: string | null
          vat_amount?: number
          vat_rate?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "line_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      number_sequences: {
        Row: {
          created_at: string | null
          current_number: number | null
          id: string
          last_reset_at: string | null
          organization_id: string
          padding: number | null
          prefix: string | null
          reset_frequency: string | null
          suffix: string | null
          type: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          current_number?: number | null
          id?: string
          last_reset_at?: string | null
          organization_id: string
          padding?: number | null
          prefix?: string | null
          reset_frequency?: string | null
          suffix?: string | null
          type: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          current_number?: number | null
          id?: string
          last_reset_at?: string | null
          organization_id?: string
          padding?: number | null
          prefix?: string | null
          reset_frequency?: string | null
          suffix?: string | null
          type?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      organization_settings: {
        Row: {
          address_line1: string | null
          address_line2: string | null
          bank_name: string | null
          bic: string | null
          capital: string | null
          city: string | null
          company_name: string | null
          country: string | null
          created_at: string | null
          default_currency: string | null
          default_payment_terms: number | null
          default_quote_validity: number | null
          default_vat_rate: number | null
          discount_terms: string | null
          email: string | null
          iban: string | null
          id: string
          invoice_email_body: string | null
          invoice_email_subject: string | null
          invoice_footer_template: string | null
          invoice_notes_template: string | null
          late_payment_penalty: string | null
          legal_form: string | null
          legal_mentions: string | null
          legal_name: string | null
          logo_url: string | null
          organization_id: string
          phone: string | null
          postal_code: string | null
          quote_email_body: string | null
          quote_email_subject: string | null
          quote_footer_template: string | null
          quote_notes_template: string | null
          reminder_email_body: string | null
          reminder_email_subject: string | null
          siret: string | null
          updated_at: string | null
          vat_number: string | null
          website: string | null
        }
        Insert: {
          address_line1?: string | null
          address_line2?: string | null
          bank_name?: string | null
          bic?: string | null
          capital?: string | null
          city?: string | null
          company_name?: string | null
          country?: string | null
          created_at?: string | null
          default_currency?: string | null
          default_payment_terms?: number | null
          default_quote_validity?: number | null
          default_vat_rate?: number | null
          discount_terms?: string | null
          email?: string | null
          iban?: string | null
          id?: string
          invoice_email_body?: string | null
          invoice_email_subject?: string | null
          invoice_footer_template?: string | null
          invoice_notes_template?: string | null
          late_payment_penalty?: string | null
          legal_form?: string | null
          legal_mentions?: string | null
          legal_name?: string | null
          logo_url?: string | null
          organization_id: string
          phone?: string | null
          postal_code?: string | null
          quote_email_body?: string | null
          quote_email_subject?: string | null
          quote_footer_template?: string | null
          quote_notes_template?: string | null
          reminder_email_body?: string | null
          reminder_email_subject?: string | null
          siret?: string | null
          updated_at?: string | null
          vat_number?: string | null
          website?: string | null
        }
        Update: {
          address_line1?: string | null
          address_line2?: string | null
          bank_name?: string | null
          bic?: string | null
          capital?: string | null
          city?: string | null
          company_name?: string | null
          country?: string | null
          created_at?: string | null
          default_currency?: string | null
          default_payment_terms?: number | null
          default_quote_validity?: number | null
          default_vat_rate?: number | null
          discount_terms?: string | null
          email?: string | null
          iban?: string | null
          id?: string
          invoice_email_body?: string | null
          invoice_email_subject?: string | null
          invoice_footer_template?: string | null
          invoice_notes_template?: string | null
          late_payment_penalty?: string | null
          legal_form?: string | null
          legal_mentions?: string | null
          legal_name?: string | null
          logo_url?: string | null
          organization_id?: string
          phone?: string | null
          postal_code?: string | null
          quote_email_body?: string | null
          quote_email_subject?: string | null
          quote_footer_template?: string | null
          quote_notes_template?: string | null
          reminder_email_body?: string | null
          reminder_email_subject?: string | null
          siret?: string | null
          updated_at?: string | null
          vat_number?: string | null
          website?: string | null
        }
        Relationships: []
      }
      payments: {
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
          updated_at: string | null
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
          updated_at?: string | null
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
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "payments_invoice_id_fkey"
            columns: ["invoice_id"]
            isOneToOne: false
            referencedRelation: "invoices"
            referencedColumns: ["id"]
          },
        ]
      }
      products: {
        Row: {
          accounting_code: string | null
          category: string | null
          created_at: string | null
          currency: string | null
          custom_fields: Json | null
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
          vat_exempt: boolean | null
          vat_rate: number | null
        }
        Insert: {
          accounting_code?: string | null
          category?: string | null
          created_at?: string | null
          currency?: string | null
          custom_fields?: Json | null
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
          vat_exempt?: boolean | null
          vat_rate?: number | null
        }
        Update: {
          accounting_code?: string | null
          category?: string | null
          created_at?: string | null
          currency?: string | null
          custom_fields?: Json | null
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
          vat_exempt?: boolean | null
          vat_rate?: number | null
        }
        Relationships: []
      }
      quotes: {
        Row: {
          accepted_at: string | null
          client_id: string
          converted_to_invoice_id: string | null
          created_at: string | null
          created_by: string | null
          currency: string | null
          custom_fields: Json | null
          deal_id: string | null
          deleted_at: string | null
          discount_amount: number | null
          discount_percent: number | null
          footer: string | null
          id: string
          introduction: string | null
          issue_date: string
          notes: string | null
          organization_id: string
          quote_number: string
          rejected_at: string | null
          status: string | null
          subject: string | null
          subtotal: number
          terms: string | null
          total: number
          updated_at: string | null
          valid_until: string | null
          vat_amount: number
        }
        Insert: {
          accepted_at?: string | null
          client_id: string
          converted_to_invoice_id?: string | null
          created_at?: string | null
          created_by?: string | null
          currency?: string | null
          custom_fields?: Json | null
          deal_id?: string | null
          deleted_at?: string | null
          discount_amount?: number | null
          discount_percent?: number | null
          footer?: string | null
          id?: string
          introduction?: string | null
          issue_date?: string
          notes?: string | null
          organization_id: string
          quote_number: string
          rejected_at?: string | null
          status?: string | null
          subject?: string | null
          subtotal?: number
          terms?: string | null
          total?: number
          updated_at?: string | null
          valid_until?: string | null
          vat_amount?: number
        }
        Update: {
          accepted_at?: string | null
          client_id?: string
          converted_to_invoice_id?: string | null
          created_at?: string | null
          created_by?: string | null
          currency?: string | null
          custom_fields?: Json | null
          deal_id?: string | null
          deleted_at?: string | null
          discount_amount?: number | null
          discount_percent?: number | null
          footer?: string | null
          id?: string
          introduction?: string | null
          issue_date?: string
          notes?: string | null
          organization_id?: string
          quote_number?: string
          rejected_at?: string | null
          status?: string | null
          subject?: string | null
          subtotal?: number
          terms?: string | null
          total?: number
          updated_at?: string | null
          valid_until?: string | null
          vat_amount?: number
        }
        Relationships: [
          {
            foreignKeyName: "quotes_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
        ]
      }
      recurring_line_items: {
        Row: {
          created_at: string | null
          description: string
          id: string
          position: number
          product_id: string | null
          quantity: number
          template_id: string
          unit: string | null
          unit_price: number
          vat_rate: number | null
        }
        Insert: {
          created_at?: string | null
          description: string
          id?: string
          position?: number
          product_id?: string | null
          quantity?: number
          template_id: string
          unit?: string | null
          unit_price: number
          vat_rate?: number | null
        }
        Update: {
          created_at?: string | null
          description?: string
          id?: string
          position?: number
          product_id?: string | null
          quantity?: number
          template_id?: string
          unit?: string | null
          unit_price?: number
          vat_rate?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "recurring_line_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "recurring_line_items_template_id_fkey"
            columns: ["template_id"]
            isOneToOne: false
            referencedRelation: "recurring_templates"
            referencedColumns: ["id"]
          },
        ]
      }
      recurring_templates: {
        Row: {
          client_id: string
          created_at: string | null
          created_by: string | null
          day_of_month: number | null
          deleted_at: string | null
          end_date: string | null
          footer: string | null
          frequency: string
          id: string
          introduction: string | null
          invoices_generated: number | null
          is_active: boolean | null
          last_generated_at: string | null
          month_of_year: number | null
          name: string
          next_invoice_date: string | null
          notes: string | null
          organization_id: string
          start_date: string
          subject: string | null
          terms: string | null
          updated_at: string | null
        }
        Insert: {
          client_id: string
          created_at?: string | null
          created_by?: string | null
          day_of_month?: number | null
          deleted_at?: string | null
          end_date?: string | null
          footer?: string | null
          frequency: string
          id?: string
          introduction?: string | null
          invoices_generated?: number | null
          is_active?: boolean | null
          last_generated_at?: string | null
          month_of_year?: number | null
          name: string
          next_invoice_date?: string | null
          notes?: string | null
          organization_id: string
          start_date: string
          subject?: string | null
          terms?: string | null
          updated_at?: string | null
        }
        Update: {
          client_id?: string
          created_at?: string | null
          created_by?: string | null
          day_of_month?: number | null
          deleted_at?: string | null
          end_date?: string | null
          footer?: string | null
          frequency?: string
          id?: string
          introduction?: string | null
          invoices_generated?: number | null
          is_active?: boolean | null
          last_generated_at?: string | null
          month_of_year?: number | null
          name?: string
          next_invoice_date?: string | null
          notes?: string | null
          organization_id?: string
          start_date?: string
          subject?: string | null
          terms?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "recurring_templates_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
        ]
      }
      vat_rates: {
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
  public: {
    Tables: {
      audit_logs: {
        Row: {
          action: string
          created_at: string
          entity_id: string | null
          entity_type: string | null
          id: string
          ip_address: string | null
          new_data: Json | null
          old_data: Json | null
          organization_id: string | null
          request_id: string | null
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          action: string
          created_at?: string
          entity_id?: string | null
          entity_type?: string | null
          id?: string
          ip_address?: string | null
          new_data?: Json | null
          old_data?: Json | null
          organization_id?: string | null
          request_id?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          action?: string
          created_at?: string
          entity_id?: string | null
          entity_type?: string | null
          id?: string
          ip_address?: string | null
          new_data?: Json | null
          old_data?: Json | null
          organization_id?: string | null
          request_id?: string | null
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
      module_limits: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          limit_key: string
          limit_value: number
          module_id: string
          tier: string
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          limit_key: string
          limit_value: number
          module_id: string
          tier: string
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          limit_key?: string
          limit_value?: number
          module_id?: string
          tier?: string
        }
        Relationships: [
          {
            foreignKeyName: "module_limits_module_id_fkey"
            columns: ["module_id"]
            isOneToOne: false
            referencedRelation: "modules"
            referencedColumns: ["id"]
          },
        ]
      }
      module_subscriptions: {
        Row: {
          billing_cycle: string | null
          cancel_at_period_end: boolean | null
          canceled_at: string | null
          created_at: string | null
          current_period_end: string | null
          current_period_start: string | null
          id: string
          module_id: string
          organization_id: string
          status: string
          stripe_customer_id: string | null
          stripe_price_id: string | null
          stripe_subscription_id: string | null
          trial_end: string | null
          updated_at: string | null
        }
        Insert: {
          billing_cycle?: string | null
          cancel_at_period_end?: boolean | null
          canceled_at?: string | null
          created_at?: string | null
          current_period_end?: string | null
          current_period_start?: string | null
          id?: string
          module_id: string
          organization_id: string
          status?: string
          stripe_customer_id?: string | null
          stripe_price_id?: string | null
          stripe_subscription_id?: string | null
          trial_end?: string | null
          updated_at?: string | null
        }
        Update: {
          billing_cycle?: string | null
          cancel_at_period_end?: boolean | null
          canceled_at?: string | null
          created_at?: string | null
          current_period_end?: string | null
          current_period_start?: string | null
          id?: string
          module_id?: string
          organization_id?: string
          status?: string
          stripe_customer_id?: string | null
          stripe_price_id?: string | null
          stripe_subscription_id?: string | null
          trial_end?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "module_subscriptions_module_id_fkey"
            columns: ["module_id"]
            isOneToOne: false
            referencedRelation: "modules"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "module_subscriptions_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      module_usage: {
        Row: {
          current_count: number | null
          id: string
          limit_key: string
          module_id: string
          organization_id: string
          period_end: string
          period_start: string
          updated_at: string | null
        }
        Insert: {
          current_count?: number | null
          id?: string
          limit_key: string
          module_id: string
          organization_id: string
          period_end: string
          period_start: string
          updated_at?: string | null
        }
        Update: {
          current_count?: number | null
          id?: string
          limit_key?: string
          module_id?: string
          organization_id?: string
          period_end?: string
          period_start?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "module_usage_module_id_fkey"
            columns: ["module_id"]
            isOneToOne: false
            referencedRelation: "modules"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "module_usage_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      modules: {
        Row: {
          base_price_monthly: number
          base_price_yearly: number
          color: string | null
          created_at: string | null
          description: string | null
          display_order: number | null
          icon: string | null
          id: string
          is_active: boolean | null
          name: string
          updated_at: string | null
        }
        Insert: {
          base_price_monthly: number
          base_price_yearly: number
          color?: string | null
          created_at?: string | null
          description?: string | null
          display_order?: number | null
          icon?: string | null
          id: string
          is_active?: boolean | null
          name: string
          updated_at?: string | null
        }
        Update: {
          base_price_monthly?: number
          base_price_yearly?: number
          color?: string | null
          created_at?: string | null
          description?: string | null
          display_order?: number | null
          icon?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      organization_members: {
        Row: {
          created_at: string
          id: string
          invitation_expires_at: string | null
          invitation_token: string | null
          invited_at: string | null
          invited_by: string | null
          joined_at: string | null
          organization_id: string
          role: Database["public"]["Enums"]["organization_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          invitation_expires_at?: string | null
          invitation_token?: string | null
          invited_at?: string | null
          invited_by?: string | null
          joined_at?: string | null
          organization_id: string
          role?: Database["public"]["Enums"]["organization_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          invitation_expires_at?: string | null
          invitation_token?: string | null
          invited_at?: string | null
          invited_by?: string | null
          joined_at?: string | null
          organization_id?: string
          role?: Database["public"]["Enums"]["organization_role"]
          user_id?: string
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
          address: Json | null
          address_line1: string | null
          address_line2: string | null
          city: string | null
          country: string | null
          created_at: string
          created_by: string | null
          deleted_at: string | null
          email: string | null
          id: string
          industry: string | null
          legal_name: string | null
          logo_url: string | null
          name: string
          onboarding_completed: boolean | null
          onboarding_completed_at: string | null
          phone: string | null
          postal_code: string | null
          settings: Json
          siren: string | null
          siret: string | null
          slug: string
          stripe_customer_id: string | null
          updated_at: string
          vat_number: string | null
          website: string | null
        }
        Insert: {
          address?: Json | null
          address_line1?: string | null
          address_line2?: string | null
          city?: string | null
          country?: string | null
          created_at?: string
          created_by?: string | null
          deleted_at?: string | null
          email?: string | null
          id?: string
          industry?: string | null
          legal_name?: string | null
          logo_url?: string | null
          name: string
          onboarding_completed?: boolean | null
          onboarding_completed_at?: string | null
          phone?: string | null
          postal_code?: string | null
          settings?: Json
          siren?: string | null
          siret?: string | null
          slug: string
          stripe_customer_id?: string | null
          updated_at?: string
          vat_number?: string | null
          website?: string | null
        }
        Update: {
          address?: Json | null
          address_line1?: string | null
          address_line2?: string | null
          city?: string | null
          country?: string | null
          created_at?: string
          created_by?: string | null
          deleted_at?: string | null
          email?: string | null
          id?: string
          industry?: string | null
          legal_name?: string | null
          logo_url?: string | null
          name?: string
          onboarding_completed?: boolean | null
          onboarding_completed_at?: string | null
          phone?: string | null
          postal_code?: string | null
          settings?: Json
          siren?: string | null
          siret?: string | null
          slug?: string
          stripe_customer_id?: string | null
          updated_at?: string
          vat_number?: string | null
          website?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "organizations_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      sessions: {
        Row: {
          created_at: string
          current_organization_id: string | null
          device_type: string | null
          expires_at: string
          id: string
          ip_address: string | null
          last_active_at: string | null
          refresh_token: string | null
          token: string
          user_agent: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          current_organization_id?: string | null
          device_type?: string | null
          expires_at: string
          id?: string
          ip_address?: string | null
          last_active_at?: string | null
          refresh_token?: string | null
          token: string
          user_agent?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          current_organization_id?: string | null
          device_type?: string | null
          expires_at?: string
          id?: string
          ip_address?: string | null
          last_active_at?: string | null
          refresh_token?: string | null
          token?: string
          user_agent?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "sessions_current_organization_id_fkey"
            columns: ["current_organization_id"]
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
      usage_tracking: {
        Row: {
          current_count: number
          feature: string
          id: string
          module: string
          organization_id: string
          period_end: string | null
          period_start: string | null
          updated_at: string
        }
        Insert: {
          current_count?: number
          feature: string
          id?: string
          module: string
          organization_id: string
          period_end?: string | null
          period_start?: string | null
          updated_at?: string
        }
        Update: {
          current_count?: number
          feature?: string
          id?: string
          module?: string
          organization_id?: string
          period_end?: string | null
          period_start?: string | null
          updated_at?: string
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
          created_at: string
          deleted_at: string | null
          email: string
          email_verified: boolean | null
          id: string
          last_login_at: string | null
          locale: string
          name: string | null
          password_hash: string | null
          phone: string | null
          settings: Json
          timezone: string
          two_factor_enabled: boolean
          two_factor_secret: string | null
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          deleted_at?: string | null
          email: string
          email_verified?: boolean | null
          id?: string
          last_login_at?: string | null
          locale?: string
          name?: string | null
          password_hash?: string | null
          phone?: string | null
          settings?: Json
          timezone?: string
          two_factor_enabled?: boolean
          two_factor_secret?: string | null
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          deleted_at?: string | null
          email?: string
          email_verified?: boolean | null
          id?: string
          last_login_at?: string | null
          locale?: string
          name?: string | null
          password_hash?: string | null
          phone?: string | null
          settings?: Json
          timezone?: string
          two_factor_enabled?: boolean
          two_factor_secret?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      verification_tokens: {
        Row: {
          created_at: string
          email: string | null
          expires_at: string
          id: string
          token: string
          type: string
          used_at: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string
          email?: string | null
          expires_at: string
          id?: string
          token: string
          type: string
          used_at?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string
          email?: string | null
          expires_at?: string
          id?: string
          token?: string
          type?: string
          used_at?: string | null
          user_id?: string | null
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
          id: string | null
          organization_id: string | null
          subject: string | null
          type: string | null
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
          id?: string | null
          organization_id?: string | null
          subject?: string | null
          type?: string | null
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
          id?: string | null
          organization_id?: string | null
          subject?: string | null
          type?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "activities_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "crm_companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "activities_contact_id_fkey"
            columns: ["contact_id"]
            isOneToOne: false
            referencedRelation: "crm_contacts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "activities_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "activities_deal_id_fkey"
            columns: ["deal_id"]
            isOneToOne: false
            referencedRelation: "crm_deals"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "activities_organization_id_fkey"
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
          id: string | null
          industry: string | null
          name: string | null
          organization_id: string | null
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
          id?: string | null
          industry?: string | null
          name?: string | null
          organization_id?: string | null
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
          id?: string | null
          industry?: string | null
          name?: string | null
          organization_id?: string | null
          phone?: string | null
          postal_code?: string | null
          siret?: string | null
          size?: string | null
          updated_at?: string | null
          website?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "companies_organization_id_fkey"
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
          id: string | null
          job_title: string | null
          last_name: string | null
          mobile: string | null
          organization_id: string | null
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
          id?: string | null
          job_title?: string | null
          last_name?: string | null
          mobile?: string | null
          organization_id?: string | null
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
          id?: string | null
          job_title?: string | null
          last_name?: string | null
          mobile?: string | null
          organization_id?: string | null
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
            foreignKeyName: "contacts_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "crm_companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "contacts_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "contacts_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "users"
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
          id: string | null
          lost_at: string | null
          lost_reason: string | null
          name: string | null
          organization_id: string | null
          owner_id: string | null
          pipeline_id: string | null
          probability: number | null
          stage_id: string | null
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
          id?: string | null
          lost_at?: string | null
          lost_reason?: string | null
          name?: string | null
          organization_id?: string | null
          owner_id?: string | null
          pipeline_id?: string | null
          probability?: number | null
          stage_id?: string | null
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
          id?: string | null
          lost_at?: string | null
          lost_reason?: string | null
          name?: string | null
          organization_id?: string | null
          owner_id?: string | null
          pipeline_id?: string | null
          probability?: number | null
          stage_id?: string | null
          status?: string | null
          updated_at?: string | null
          won_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "deals_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "crm_companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "deals_contact_id_fkey"
            columns: ["contact_id"]
            isOneToOne: false
            referencedRelation: "crm_contacts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "deals_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "deals_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "deals_pipeline_id_fkey"
            columns: ["pipeline_id"]
            isOneToOne: false
            referencedRelation: "crm_pipelines"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "deals_stage_id_fkey"
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
          id: string | null
          name: string | null
          pipeline_id: string | null
          position: number | null
          probability: number | null
          updated_at: string | null
        }
        Insert: {
          color?: string | null
          created_at?: string | null
          id?: string | null
          name?: string | null
          pipeline_id?: string | null
          position?: number | null
          probability?: number | null
          updated_at?: string | null
        }
        Update: {
          color?: string | null
          created_at?: string | null
          id?: string | null
          name?: string | null
          pipeline_id?: string | null
          position?: number | null
          probability?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "pipeline_stages_pipeline_id_fkey"
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
          id: string | null
          is_default: boolean | null
          name: string | null
          organization_id: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          deleted_at?: string | null
          description?: string | null
          id?: string | null
          is_default?: boolean | null
          name?: string | null
          organization_id?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          deleted_at?: string | null
          description?: string | null
          id?: string | null
          is_default?: boolean | null
          name?: string | null
          organization_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "pipelines_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      hr_employees: {
        Row: {
          address_line_1: string | null
          address_line_2: string | null
          annual_leave_balance: number | null
          birth_date: string | null
          birth_place: string | null
          city: string | null
          contract_end_date: string | null
          contract_start_date: string | null
          contract_type: Database["hr"]["Enums"]["contract_type"] | null
          country: string | null
          created_at: string | null
          custom_fields: Json | null
          deleted_at: string | null
          department: string | null
          email: string | null
          emergency_contact_name: string | null
          emergency_contact_phone: string | null
          emergency_contact_relation: string | null
          employee_number: string | null
          first_name: string | null
          gross_salary: number | null
          id: string | null
          job_title: string | null
          last_name: string | null
          left_date: string | null
          left_reason: string | null
          manager_id: string | null
          nationality: string | null
          notes: string | null
          organization_id: string | null
          phone: string | null
          photo_url: string | null
          postal_code: string | null
          rtt_balance: number | null
          salary_currency: string | null
          social_security_number: string | null
          status: Database["hr"]["Enums"]["employee_status"] | null
          trial_end_date: string | null
          updated_at: string | null
          user_id: string | null
          work_email: string | null
          work_phone: string | null
        }
        Insert: {
          address_line_1?: string | null
          address_line_2?: string | null
          annual_leave_balance?: number | null
          birth_date?: string | null
          birth_place?: string | null
          city?: string | null
          contract_end_date?: string | null
          contract_start_date?: string | null
          contract_type?: Database["hr"]["Enums"]["contract_type"] | null
          country?: string | null
          created_at?: string | null
          custom_fields?: Json | null
          deleted_at?: string | null
          department?: string | null
          email?: string | null
          emergency_contact_name?: string | null
          emergency_contact_phone?: string | null
          emergency_contact_relation?: string | null
          employee_number?: string | null
          first_name?: string | null
          gross_salary?: number | null
          id?: string | null
          job_title?: string | null
          last_name?: string | null
          left_date?: string | null
          left_reason?: string | null
          manager_id?: string | null
          nationality?: string | null
          notes?: string | null
          organization_id?: string | null
          phone?: string | null
          photo_url?: string | null
          postal_code?: string | null
          rtt_balance?: number | null
          salary_currency?: string | null
          social_security_number?: string | null
          status?: Database["hr"]["Enums"]["employee_status"] | null
          trial_end_date?: string | null
          updated_at?: string | null
          user_id?: string | null
          work_email?: string | null
          work_phone?: string | null
        }
        Update: {
          address_line_1?: string | null
          address_line_2?: string | null
          annual_leave_balance?: number | null
          birth_date?: string | null
          birth_place?: string | null
          city?: string | null
          contract_end_date?: string | null
          contract_start_date?: string | null
          contract_type?: Database["hr"]["Enums"]["contract_type"] | null
          country?: string | null
          created_at?: string | null
          custom_fields?: Json | null
          deleted_at?: string | null
          department?: string | null
          email?: string | null
          emergency_contact_name?: string | null
          emergency_contact_phone?: string | null
          emergency_contact_relation?: string | null
          employee_number?: string | null
          first_name?: string | null
          gross_salary?: number | null
          id?: string | null
          job_title?: string | null
          last_name?: string | null
          left_date?: string | null
          left_reason?: string | null
          manager_id?: string | null
          nationality?: string | null
          notes?: string | null
          organization_id?: string | null
          phone?: string | null
          photo_url?: string | null
          postal_code?: string | null
          rtt_balance?: number | null
          salary_currency?: string | null
          social_security_number?: string | null
          status?: Database["hr"]["Enums"]["employee_status"] | null
          trial_end_date?: string | null
          updated_at?: string | null
          user_id?: string | null
          work_email?: string | null
          work_phone?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "employees_manager_id_fkey"
            columns: ["manager_id"]
            isOneToOne: false
            referencedRelation: "hr_employees"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "employees_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "employees_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      hr_interviews: {
        Row: {
          achievements: string | null
          completed_date: string | null
          created_at: string | null
          created_by: string | null
          deleted_at: string | null
          development_plan: string | null
          document_url: string | null
          employee_comments: string | null
          employee_id: string | null
          feedback: string | null
          id: string | null
          interviewer_id: string | null
          objectives: string | null
          organization_id: string | null
          scheduled_date: string | null
          status: Database["hr"]["Enums"]["interview_status"] | null
          type: Database["hr"]["Enums"]["interview_type"] | null
          updated_at: string | null
        }
        Insert: {
          achievements?: string | null
          completed_date?: string | null
          created_at?: string | null
          created_by?: string | null
          deleted_at?: string | null
          development_plan?: string | null
          document_url?: string | null
          employee_comments?: string | null
          employee_id?: string | null
          feedback?: string | null
          id?: string | null
          interviewer_id?: string | null
          objectives?: string | null
          organization_id?: string | null
          scheduled_date?: string | null
          status?: Database["hr"]["Enums"]["interview_status"] | null
          type?: Database["hr"]["Enums"]["interview_type"] | null
          updated_at?: string | null
        }
        Update: {
          achievements?: string | null
          completed_date?: string | null
          created_at?: string | null
          created_by?: string | null
          deleted_at?: string | null
          development_plan?: string | null
          document_url?: string | null
          employee_comments?: string | null
          employee_id?: string | null
          feedback?: string | null
          id?: string | null
          interviewer_id?: string | null
          objectives?: string | null
          organization_id?: string | null
          scheduled_date?: string | null
          status?: Database["hr"]["Enums"]["interview_status"] | null
          type?: Database["hr"]["Enums"]["interview_type"] | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "interviews_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "interviews_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "hr_employees"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "interviews_interviewer_id_fkey"
            columns: ["interviewer_id"]
            isOneToOne: false
            referencedRelation: "hr_employees"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "interviews_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      hr_leave_requests: {
        Row: {
          approved_at: string | null
          approved_by: string | null
          created_at: string | null
          days_count: number | null
          deleted_at: string | null
          employee_id: string | null
          end_date: string | null
          end_half_day: boolean | null
          id: string | null
          leave_type_id: string | null
          organization_id: string | null
          reason: string | null
          rejection_reason: string | null
          requested_by: string | null
          start_date: string | null
          start_half_day: boolean | null
          status: Database["hr"]["Enums"]["leave_status"] | null
          updated_at: string | null
        }
        Insert: {
          approved_at?: string | null
          approved_by?: string | null
          created_at?: string | null
          days_count?: number | null
          deleted_at?: string | null
          employee_id?: string | null
          end_date?: string | null
          end_half_day?: boolean | null
          id?: string | null
          leave_type_id?: string | null
          organization_id?: string | null
          reason?: string | null
          rejection_reason?: string | null
          requested_by?: string | null
          start_date?: string | null
          start_half_day?: boolean | null
          status?: Database["hr"]["Enums"]["leave_status"] | null
          updated_at?: string | null
        }
        Update: {
          approved_at?: string | null
          approved_by?: string | null
          created_at?: string | null
          days_count?: number | null
          deleted_at?: string | null
          employee_id?: string | null
          end_date?: string | null
          end_half_day?: boolean | null
          id?: string | null
          leave_type_id?: string | null
          organization_id?: string | null
          reason?: string | null
          rejection_reason?: string | null
          requested_by?: string | null
          start_date?: string | null
          start_half_day?: boolean | null
          status?: Database["hr"]["Enums"]["leave_status"] | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "leave_requests_approved_by_fkey"
            columns: ["approved_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "leave_requests_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "hr_employees"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "leave_requests_leave_type_id_fkey"
            columns: ["leave_type_id"]
            isOneToOne: false
            referencedRelation: "hr_leave_types"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "leave_requests_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "leave_requests_requested_by_fkey"
            columns: ["requested_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      hr_leave_types: {
        Row: {
          code: string | null
          color: string | null
          created_at: string | null
          deducts_from_balance: boolean | null
          id: string | null
          is_paid: boolean | null
          is_system: boolean | null
          name: string | null
          organization_id: string | null
          requires_approval: boolean | null
        }
        Insert: {
          code?: string | null
          color?: string | null
          created_at?: string | null
          deducts_from_balance?: boolean | null
          id?: string | null
          is_paid?: boolean | null
          is_system?: boolean | null
          name?: string | null
          organization_id?: string | null
          requires_approval?: boolean | null
        }
        Update: {
          code?: string | null
          color?: string | null
          created_at?: string | null
          deducts_from_balance?: boolean | null
          id?: string | null
          is_paid?: boolean | null
          is_system?: boolean | null
          name?: string | null
          organization_id?: string | null
          requires_approval?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "leave_types_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      hr_settings: {
        Row: {
          alert_contract_end_days: number | null
          alert_interview_days: number | null
          alert_trial_end_days: number | null
          annual_leave_days_per_year: number | null
          created_at: string | null
          default_work_hours_per_week: number | null
          employee_self_service_enabled: boolean | null
          employees_can_edit_profile: boolean | null
          employees_can_request_leaves: boolean | null
          employees_can_view_directory: boolean | null
          id: string | null
          leave_year_start_month: number | null
          organization_id: string | null
          rtt_days_per_year: number | null
          updated_at: string | null
          work_days: Json | null
        }
        Insert: {
          alert_contract_end_days?: number | null
          alert_interview_days?: number | null
          alert_trial_end_days?: number | null
          annual_leave_days_per_year?: number | null
          created_at?: string | null
          default_work_hours_per_week?: number | null
          employee_self_service_enabled?: boolean | null
          employees_can_edit_profile?: boolean | null
          employees_can_request_leaves?: boolean | null
          employees_can_view_directory?: boolean | null
          id?: string | null
          leave_year_start_month?: number | null
          organization_id?: string | null
          rtt_days_per_year?: number | null
          updated_at?: string | null
          work_days?: Json | null
        }
        Update: {
          alert_contract_end_days?: number | null
          alert_interview_days?: number | null
          alert_trial_end_days?: number | null
          annual_leave_days_per_year?: number | null
          created_at?: string | null
          default_work_hours_per_week?: number | null
          employee_self_service_enabled?: boolean | null
          employees_can_edit_profile?: boolean | null
          employees_can_request_leaves?: boolean | null
          employees_can_view_directory?: boolean | null
          id?: string | null
          leave_year_start_month?: number | null
          organization_id?: string | null
          rtt_days_per_year?: number | null
          updated_at?: string | null
          work_days?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "settings_organization_id_fkey"
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
          created_at: string | null
          date: string | null
          employee_id: string | null
          end_time: string | null
          hours_worked: number | null
          id: string | null
          notes: string | null
          organization_id: string | null
          overtime_hours: number | null
          start_time: string | null
          updated_at: string | null
          validated_at: string | null
          validated_by: string | null
        }
        Insert: {
          break_duration_minutes?: number | null
          created_at?: string | null
          date?: string | null
          employee_id?: string | null
          end_time?: string | null
          hours_worked?: number | null
          id?: string | null
          notes?: string | null
          organization_id?: string | null
          overtime_hours?: number | null
          start_time?: string | null
          updated_at?: string | null
          validated_at?: string | null
          validated_by?: string | null
        }
        Update: {
          break_duration_minutes?: number | null
          created_at?: string | null
          date?: string | null
          employee_id?: string | null
          end_time?: string | null
          hours_worked?: number | null
          id?: string | null
          notes?: string | null
          organization_id?: string | null
          overtime_hours?: number | null
          start_time?: string | null
          updated_at?: string | null
          validated_at?: string | null
          validated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "time_entries_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "hr_employees"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "time_entries_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "time_entries_validated_by_fkey"
            columns: ["validated_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      invoice_clients: {
        Row: {
          billing_address_line1: string | null
          billing_address_line2: string | null
          billing_city: string | null
          billing_country: string | null
          billing_email: string | null
          billing_phone: string | null
          billing_postal_code: string | null
          contact_name: string | null
          created_at: string | null
          crm_company_id: string | null
          crm_contact_id: string | null
          custom_fields: Json | null
          default_currency: string | null
          deleted_at: string | null
          id: string | null
          legal_form: string | null
          legal_name: string | null
          name: string | null
          notes: string | null
          organization_id: string | null
          payment_method: string | null
          payment_terms: number | null
          siret: string | null
          updated_at: string | null
          vat_number: string | null
        }
        Insert: {
          billing_address_line1?: string | null
          billing_address_line2?: string | null
          billing_city?: string | null
          billing_country?: string | null
          billing_email?: string | null
          billing_phone?: string | null
          billing_postal_code?: string | null
          contact_name?: string | null
          created_at?: string | null
          crm_company_id?: string | null
          crm_contact_id?: string | null
          custom_fields?: Json | null
          default_currency?: string | null
          deleted_at?: string | null
          id?: string | null
          legal_form?: string | null
          legal_name?: string | null
          name?: string | null
          notes?: string | null
          organization_id?: string | null
          payment_method?: string | null
          payment_terms?: number | null
          siret?: string | null
          updated_at?: string | null
          vat_number?: string | null
        }
        Update: {
          billing_address_line1?: string | null
          billing_address_line2?: string | null
          billing_city?: string | null
          billing_country?: string | null
          billing_email?: string | null
          billing_phone?: string | null
          billing_postal_code?: string | null
          contact_name?: string | null
          created_at?: string | null
          crm_company_id?: string | null
          crm_contact_id?: string | null
          custom_fields?: Json | null
          default_currency?: string | null
          deleted_at?: string | null
          id?: string | null
          legal_form?: string | null
          legal_name?: string | null
          name?: string | null
          notes?: string | null
          organization_id?: string | null
          payment_method?: string | null
          payment_terms?: number | null
          siret?: string | null
          updated_at?: string | null
          vat_number?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "clients_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      invoice_credit_notes: {
        Row: {
          applied_at: string | null
          client_id: string | null
          created_at: string | null
          created_by: string | null
          credit_note_number: string | null
          currency: string | null
          deleted_at: string | null
          id: string | null
          invoice_id: string | null
          issue_date: string | null
          organization_id: string | null
          reason: string | null
          status: string | null
          subtotal: number | null
          total: number | null
          updated_at: string | null
          vat_amount: number | null
        }
        Insert: {
          applied_at?: string | null
          client_id?: string | null
          created_at?: string | null
          created_by?: string | null
          credit_note_number?: string | null
          currency?: string | null
          deleted_at?: string | null
          id?: string | null
          invoice_id?: string | null
          issue_date?: string | null
          organization_id?: string | null
          reason?: string | null
          status?: string | null
          subtotal?: number | null
          total?: number | null
          updated_at?: string | null
          vat_amount?: number | null
        }
        Update: {
          applied_at?: string | null
          client_id?: string | null
          created_at?: string | null
          created_by?: string | null
          credit_note_number?: string | null
          currency?: string | null
          deleted_at?: string | null
          id?: string | null
          invoice_id?: string | null
          issue_date?: string | null
          organization_id?: string | null
          reason?: string | null
          status?: string | null
          subtotal?: number | null
          total?: number | null
          updated_at?: string | null
          vat_amount?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "credit_notes_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "invoice_clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "credit_notes_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "credit_notes_invoice_id_fkey"
            columns: ["invoice_id"]
            isOneToOne: false
            referencedRelation: "invoice_invoices"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "credit_notes_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      invoice_invoices: {
        Row: {
          amount_paid: number | null
          client_id: string | null
          created_at: string | null
          created_by: string | null
          currency: string | null
          custom_fields: Json | null
          deal_id: string | null
          deleted_at: string | null
          discount_amount: number | null
          discount_percent: number | null
          due_date: string | null
          footer: string | null
          id: string | null
          introduction: string | null
          invoice_number: string | null
          issue_date: string | null
          last_reminder_at: string | null
          notes: string | null
          organization_id: string | null
          paid_at: string | null
          payment_instructions: string | null
          quote_id: string | null
          reminder_count: number | null
          sent_at: string | null
          status: string | null
          subject: string | null
          subtotal: number | null
          terms: string | null
          total: number | null
          updated_at: string | null
          vat_amount: number | null
        }
        Insert: {
          amount_paid?: number | null
          client_id?: string | null
          created_at?: string | null
          created_by?: string | null
          currency?: string | null
          custom_fields?: Json | null
          deal_id?: string | null
          deleted_at?: string | null
          discount_amount?: number | null
          discount_percent?: number | null
          due_date?: string | null
          footer?: string | null
          id?: string | null
          introduction?: string | null
          invoice_number?: string | null
          issue_date?: string | null
          last_reminder_at?: string | null
          notes?: string | null
          organization_id?: string | null
          paid_at?: string | null
          payment_instructions?: string | null
          quote_id?: string | null
          reminder_count?: number | null
          sent_at?: string | null
          status?: string | null
          subject?: string | null
          subtotal?: number | null
          terms?: string | null
          total?: number | null
          updated_at?: string | null
          vat_amount?: number | null
        }
        Update: {
          amount_paid?: number | null
          client_id?: string | null
          created_at?: string | null
          created_by?: string | null
          currency?: string | null
          custom_fields?: Json | null
          deal_id?: string | null
          deleted_at?: string | null
          discount_amount?: number | null
          discount_percent?: number | null
          due_date?: string | null
          footer?: string | null
          id?: string | null
          introduction?: string | null
          invoice_number?: string | null
          issue_date?: string | null
          last_reminder_at?: string | null
          notes?: string | null
          organization_id?: string | null
          paid_at?: string | null
          payment_instructions?: string | null
          quote_id?: string | null
          reminder_count?: number | null
          sent_at?: string | null
          status?: string | null
          subject?: string | null
          subtotal?: number | null
          terms?: string | null
          total?: number | null
          updated_at?: string | null
          vat_amount?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "invoices_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "invoice_clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invoices_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invoices_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invoices_quote_id_fkey"
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
          description: string | null
          discount_amount: number | null
          discount_percent: number | null
          document_id: string | null
          document_type: string | null
          id: string | null
          line_total: number | null
          line_total_with_vat: number | null
          position: number | null
          product_id: string | null
          quantity: number | null
          unit: string | null
          unit_price: number | null
          updated_at: string | null
          vat_amount: number | null
          vat_rate: number | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          discount_amount?: number | null
          discount_percent?: number | null
          document_id?: string | null
          document_type?: string | null
          id?: string | null
          line_total?: number | null
          line_total_with_vat?: number | null
          position?: number | null
          product_id?: string | null
          quantity?: number | null
          unit?: string | null
          unit_price?: number | null
          updated_at?: string | null
          vat_amount?: number | null
          vat_rate?: number | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          discount_amount?: number | null
          discount_percent?: number | null
          document_id?: string | null
          document_type?: string | null
          id?: string | null
          line_total?: number | null
          line_total_with_vat?: number | null
          position?: number | null
          product_id?: string | null
          quantity?: number | null
          unit?: string | null
          unit_price?: number | null
          updated_at?: string | null
          vat_amount?: number | null
          vat_rate?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "line_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "invoice_products"
            referencedColumns: ["id"]
          },
        ]
      }
      invoice_payments: {
        Row: {
          amount: number | null
          created_at: string | null
          created_by: string | null
          currency: string | null
          id: string | null
          invoice_id: string | null
          notes: string | null
          organization_id: string | null
          payment_date: string | null
          payment_method: string | null
          reference: string | null
          updated_at: string | null
        }
        Insert: {
          amount?: number | null
          created_at?: string | null
          created_by?: string | null
          currency?: string | null
          id?: string | null
          invoice_id?: string | null
          notes?: string | null
          organization_id?: string | null
          payment_date?: string | null
          payment_method?: string | null
          reference?: string | null
          updated_at?: string | null
        }
        Update: {
          amount?: number | null
          created_at?: string | null
          created_by?: string | null
          currency?: string | null
          id?: string | null
          invoice_id?: string | null
          notes?: string | null
          organization_id?: string | null
          payment_date?: string | null
          payment_method?: string | null
          reference?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "payments_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payments_invoice_id_fkey"
            columns: ["invoice_id"]
            isOneToOne: false
            referencedRelation: "invoice_invoices"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payments_organization_id_fkey"
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
          custom_fields: Json | null
          deleted_at: string | null
          description: string | null
          id: string | null
          is_active: boolean | null
          name: string | null
          organization_id: string | null
          sku: string | null
          type: string | null
          unit: string | null
          unit_price: number | null
          updated_at: string | null
          vat_exempt: boolean | null
          vat_rate: number | null
        }
        Insert: {
          accounting_code?: string | null
          category?: string | null
          created_at?: string | null
          currency?: string | null
          custom_fields?: Json | null
          deleted_at?: string | null
          description?: string | null
          id?: string | null
          is_active?: boolean | null
          name?: string | null
          organization_id?: string | null
          sku?: string | null
          type?: string | null
          unit?: string | null
          unit_price?: number | null
          updated_at?: string | null
          vat_exempt?: boolean | null
          vat_rate?: number | null
        }
        Update: {
          accounting_code?: string | null
          category?: string | null
          created_at?: string | null
          currency?: string | null
          custom_fields?: Json | null
          deleted_at?: string | null
          description?: string | null
          id?: string | null
          is_active?: boolean | null
          name?: string | null
          organization_id?: string | null
          sku?: string | null
          type?: string | null
          unit?: string | null
          unit_price?: number | null
          updated_at?: string | null
          vat_exempt?: boolean | null
          vat_rate?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "products_organization_id_fkey"
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
          client_id: string | null
          converted_to_invoice_id: string | null
          created_at: string | null
          created_by: string | null
          currency: string | null
          custom_fields: Json | null
          deal_id: string | null
          deleted_at: string | null
          discount_amount: number | null
          discount_percent: number | null
          footer: string | null
          id: string | null
          introduction: string | null
          issue_date: string | null
          notes: string | null
          organization_id: string | null
          quote_number: string | null
          rejected_at: string | null
          status: string | null
          subject: string | null
          subtotal: number | null
          terms: string | null
          total: number | null
          updated_at: string | null
          valid_until: string | null
          vat_amount: number | null
        }
        Insert: {
          accepted_at?: string | null
          client_id?: string | null
          converted_to_invoice_id?: string | null
          created_at?: string | null
          created_by?: string | null
          currency?: string | null
          custom_fields?: Json | null
          deal_id?: string | null
          deleted_at?: string | null
          discount_amount?: number | null
          discount_percent?: number | null
          footer?: string | null
          id?: string | null
          introduction?: string | null
          issue_date?: string | null
          notes?: string | null
          organization_id?: string | null
          quote_number?: string | null
          rejected_at?: string | null
          status?: string | null
          subject?: string | null
          subtotal?: number | null
          terms?: string | null
          total?: number | null
          updated_at?: string | null
          valid_until?: string | null
          vat_amount?: number | null
        }
        Update: {
          accepted_at?: string | null
          client_id?: string | null
          converted_to_invoice_id?: string | null
          created_at?: string | null
          created_by?: string | null
          currency?: string | null
          custom_fields?: Json | null
          deal_id?: string | null
          deleted_at?: string | null
          discount_amount?: number | null
          discount_percent?: number | null
          footer?: string | null
          id?: string | null
          introduction?: string | null
          issue_date?: string | null
          notes?: string | null
          organization_id?: string | null
          quote_number?: string | null
          rejected_at?: string | null
          status?: string | null
          subject?: string | null
          subtotal?: number | null
          terms?: string | null
          total?: number | null
          updated_at?: string | null
          valid_until?: string | null
          vat_amount?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "quotes_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "invoice_clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "quotes_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "quotes_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Functions: {
      check_module_downgrade: {
        Args: {
          p_org_id: string
          p_module_id: string
        }
        Returns: Json
      }
      check_module_limit: {
        Args: {
          p_org_id: string
          p_module_id: string
          p_limit_key: string
        }
        Returns: boolean
      }
      check_organization_provisioned: {
        Args: {
          p_org_id: string
        }
        Returns: Json
      }
      create_organization_with_owner: {
        Args: {
          p_name: string
          p_slug: string
          p_industry?: string
          p_siret?: string
          p_siren?: string
          p_vat_number?: string
          p_address?: Json
          p_phone?: string
          p_email?: string
        }
        Returns: Json
      }
      decrement_module_usage: {
        Args: {
          p_org_id: string
          p_module_id: string
          p_limit_key: string
          p_decrement?: number
        }
        Returns: undefined
      }
      get_module_limit: {
        Args: {
          p_org_id: string
          p_module_id: string
          p_limit_key: string
        }
        Returns: number
      }
      get_organization_modules: {
        Args: {
          p_org_id: string
        }
        Returns: Json
      }
      get_user_admin_organization_ids: {
        Args: Record<PropertyKey, never>
        Returns: string[]
      }
      get_user_organization_ids: {
        Args: Record<PropertyKey, never>
        Returns: string[]
      }
      get_user_organizations: {
        Args: {
          user_uuid: string
        }
        Returns: string[]
      }
      get_user_owner_organization_ids: {
        Args: Record<PropertyKey, never>
        Returns: string[]
      }
      handle_stripe_subscription_canceled: {
        Args: {
          p_stripe_subscription_id: string
        }
        Returns: Json
      }
      handle_stripe_subscription_update: {
        Args: {
          p_org_id: string
          p_module_id: string
          p_stripe_subscription_id: string
          p_stripe_price_id: string
          p_stripe_customer_id: string
          p_status: string
          p_billing_cycle: string
          p_current_period_start: string
          p_current_period_end: string
          p_cancel_at_period_end?: boolean
          p_trial_end?: string
        }
        Returns: Json
      }
      increment_module_usage: {
        Args: {
          p_org_id: string
          p_module_id: string
          p_limit_key: string
          p_increment?: number
        }
        Returns: undefined
      }
      is_module_paid: {
        Args: {
          p_org_id: string
          p_module_id: string
        }
        Returns: boolean
      }
      is_org_admin: {
        Args: {
          org_id: string
        }
        Returns: boolean
      }
      is_org_member: {
        Args: {
          org_id: string
        }
        Returns: boolean
      }
      is_org_owner: {
        Args: {
          org_id: string
        }
        Returns: boolean
      }
      is_slug_available: {
        Args: {
          p_slug: string
        }
        Returns: boolean
      }
      provision_crm: {
        Args: {
          p_org_id: string
        }
        Returns: boolean
      }
      provision_hr: {
        Args: {
          p_org_id: string
        }
        Returns: boolean
      }
      provision_invoice: {
        Args: {
          p_org_id: string
        }
        Returns: boolean
      }
      provision_module_subscriptions: {
        Args: {
          p_org_id: string
        }
        Returns: boolean
      }
      provision_module_usage: {
        Args: {
          p_org_id: string
        }
        Returns: boolean
      }
      provision_organization: {
        Args: {
          p_org_id: string
        }
        Returns: Json
      }
      provision_tickets: {
        Args: {
          p_org_id: string
        }
        Returns: boolean
      }
      setup_organization: {
        Args: {
          p_org_name: string
          p_org_slug: string
          p_admin_name: string
          p_admin_email: string
          p_user_id: string
        }
        Returns: Json
      }
    }
    Enums: {
      organization_role: "owner" | "admin" | "member"
      subscription_plan: "FREE" | "PRO" | "ENTERPRISE"
      subscription_status:
        | "active"
        | "canceled"
        | "past_due"
        | "trialing"
        | "incomplete"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type PublicSchema = Database[Extract<keyof Database, "public">]

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

