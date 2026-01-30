/**
 * Database types for Sedona.AI
 * Run `pnpm db:generate` to regenerate this file from Supabase
 *
 * Note: These are manually defined types matching 001_base_schema.sql
 * They will be overwritten by Supabase CLI generated types.
 */

export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

// ===========================================
// ENUMS
// ===========================================

export type SubscriptionPlan = 'FREE' | 'PRO' | 'ENTERPRISE'
export type SubscriptionStatus = 'active' | 'canceled' | 'past_due' | 'trialing' | 'incomplete'
export type OrganizationRole = 'owner' | 'admin' | 'member'

// ===========================================
// DATABASE INTERFACE
// ===========================================

export interface Database {
  public: {
    Tables: {
      organizations: {
        Row: {
          id: string
          name: string
          slug: string
          logo_url: string | null
          siret: string | null
          siren: string | null
          vat_number: string | null
          legal_name: string | null
          address_street: string | null
          address_complement: string | null
          address_postal_code: string | null
          address_city: string | null
          address_country: string | null
          phone: string | null
          email: string | null
          website: string | null
          stripe_customer_id: string | null
          subscription_plan: SubscriptionPlan
          subscription_status: SubscriptionStatus
          subscription_id: string | null
          subscription_period_start: string | null
          subscription_period_end: string | null
          settings: Json
          onboarding_completed_at: string | null
          created_at: string
          updated_at: string
          deleted_at: string | null
        }
        Insert: {
          id?: string
          name: string
          slug: string
          logo_url?: string | null
          siret?: string | null
          siren?: string | null
          vat_number?: string | null
          legal_name?: string | null
          address_street?: string | null
          address_complement?: string | null
          address_postal_code?: string | null
          address_city?: string | null
          address_country?: string | null
          phone?: string | null
          email?: string | null
          website?: string | null
          stripe_customer_id?: string | null
          subscription_plan?: SubscriptionPlan
          subscription_status?: SubscriptionStatus
          subscription_id?: string | null
          subscription_period_start?: string | null
          subscription_period_end?: string | null
          settings?: Json
          onboarding_completed_at?: string | null
          created_at?: string
          updated_at?: string
          deleted_at?: string | null
        }
        Update: {
          id?: string
          name?: string
          slug?: string
          logo_url?: string | null
          siret?: string | null
          siren?: string | null
          vat_number?: string | null
          legal_name?: string | null
          address_street?: string | null
          address_complement?: string | null
          address_postal_code?: string | null
          address_city?: string | null
          address_country?: string | null
          phone?: string | null
          email?: string | null
          website?: string | null
          stripe_customer_id?: string | null
          subscription_plan?: SubscriptionPlan
          subscription_status?: SubscriptionStatus
          subscription_id?: string | null
          subscription_period_start?: string | null
          subscription_period_end?: string | null
          settings?: Json
          onboarding_completed_at?: string | null
          created_at?: string
          updated_at?: string
          deleted_at?: string | null
        }
      }
      users: {
        Row: {
          id: string
          email: string
          email_verified_at: string | null
          name: string | null
          avatar_url: string | null
          phone: string | null
          password_hash: string | null
          locale: string
          timezone: string
          settings: Json
          two_factor_enabled: boolean
          two_factor_secret: string | null
          last_login_at: string | null
          created_at: string
          updated_at: string
          deleted_at: string | null
        }
        Insert: {
          id?: string
          email: string
          email_verified_at?: string | null
          name?: string | null
          avatar_url?: string | null
          phone?: string | null
          password_hash?: string | null
          locale?: string
          timezone?: string
          settings?: Json
          two_factor_enabled?: boolean
          two_factor_secret?: string | null
          last_login_at?: string | null
          created_at?: string
          updated_at?: string
          deleted_at?: string | null
        }
        Update: {
          id?: string
          email?: string
          email_verified_at?: string | null
          name?: string | null
          avatar_url?: string | null
          phone?: string | null
          password_hash?: string | null
          locale?: string
          timezone?: string
          settings?: Json
          two_factor_enabled?: boolean
          two_factor_secret?: string | null
          last_login_at?: string | null
          created_at?: string
          updated_at?: string
          deleted_at?: string | null
        }
      }
      organization_members: {
        Row: {
          id: string
          organization_id: string
          user_id: string
          role: OrganizationRole
          invited_by: string | null
          invited_at: string | null
          invitation_token: string | null
          invitation_expires_at: string | null
          joined_at: string | null
          created_at: string
        }
        Insert: {
          id?: string
          organization_id: string
          user_id: string
          role?: OrganizationRole
          invited_by?: string | null
          invited_at?: string | null
          invitation_token?: string | null
          invitation_expires_at?: string | null
          joined_at?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          organization_id?: string
          user_id?: string
          role?: OrganizationRole
          invited_by?: string | null
          invited_at?: string | null
          invitation_token?: string | null
          invitation_expires_at?: string | null
          joined_at?: string | null
          created_at?: string
        }
      }
      sessions: {
        Row: {
          id: string
          user_id: string
          token: string
          refresh_token: string | null
          expires_at: string
          ip_address: string | null
          user_agent: string | null
          device_type: string | null
          current_organization_id: string | null
          created_at: string
          last_active_at: string | null
        }
        Insert: {
          id?: string
          user_id: string
          token: string
          refresh_token?: string | null
          expires_at: string
          ip_address?: string | null
          user_agent?: string | null
          device_type?: string | null
          current_organization_id?: string | null
          created_at?: string
          last_active_at?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          token?: string
          refresh_token?: string | null
          expires_at?: string
          ip_address?: string | null
          user_agent?: string | null
          device_type?: string | null
          current_organization_id?: string | null
          created_at?: string
          last_active_at?: string | null
        }
      }
      verification_tokens: {
        Row: {
          id: string
          user_id: string | null
          email: string | null
          token: string
          type: string
          expires_at: string
          used_at: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id?: string | null
          email?: string | null
          token: string
          type: string
          expires_at: string
          used_at?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string | null
          email?: string | null
          token?: string
          type?: string
          expires_at?: string
          used_at?: string | null
          created_at?: string
        }
      }
      usage_tracking: {
        Row: {
          id: string
          organization_id: string
          module: string
          feature: string
          current_count: number
          period_start: string | null
          period_end: string | null
          updated_at: string
        }
        Insert: {
          id?: string
          organization_id: string
          module: string
          feature: string
          current_count?: number
          period_start?: string | null
          period_end?: string | null
          updated_at?: string
        }
        Update: {
          id?: string
          organization_id?: string
          module?: string
          feature?: string
          current_count?: number
          period_start?: string | null
          period_end?: string | null
          updated_at?: string
        }
      }
      audit_logs: {
        Row: {
          id: string
          organization_id: string | null
          user_id: string | null
          action: string
          entity_type: string | null
          entity_id: string | null
          old_data: Json | null
          new_data: Json | null
          ip_address: string | null
          user_agent: string | null
          request_id: string | null
          created_at: string
        }
        Insert: {
          id?: string
          organization_id?: string | null
          user_id?: string | null
          action: string
          entity_type?: string | null
          entity_id?: string | null
          old_data?: Json | null
          new_data?: Json | null
          ip_address?: string | null
          user_agent?: string | null
          request_id?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          organization_id?: string | null
          user_id?: string | null
          action?: string
          entity_type?: string | null
          entity_id?: string | null
          old_data?: Json | null
          new_data?: Json | null
          ip_address?: string | null
          user_agent?: string | null
          request_id?: string | null
          created_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      generate_slug: {
        Args: { input_text: string }
        Returns: string
      }
      is_slug_available: {
        Args: { check_slug: string }
        Returns: boolean
      }
      increment_usage: {
        Args: {
          p_org_id: string
          p_module: string
          p_feature: string
          p_increment?: number
        }
        Returns: number
      }
      get_usage: {
        Args: {
          p_org_id: string
          p_module: string
          p_feature: string
        }
        Returns: number
      }
    }
    Enums: {
      subscription_plan: SubscriptionPlan
      subscription_status: SubscriptionStatus
      organization_role: OrganizationRole
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  crm: {
    Tables: {
      contacts: {
        Row: {
          id: string
          organization_id: string
          first_name: string | null
          last_name: string | null
          email: string | null
          phone: string | null
          mobile: string | null
          job_title: string | null
          company_id: string | null
          source: ContactSource | null
          source_details: string | null
          address_line1: string | null
          address_line2: string | null
          city: string | null
          postal_code: string | null
          country: string
          custom_fields: Json
          tags: string[]
          owner_id: string | null
          created_at: string
          updated_at: string
          deleted_at: string | null
        }
        Insert: {
          id?: string
          organization_id: string
          first_name?: string | null
          last_name?: string | null
          email?: string | null
          phone?: string | null
          mobile?: string | null
          job_title?: string | null
          company_id?: string | null
          source?: ContactSource | null
          source_details?: string | null
          address_line1?: string | null
          address_line2?: string | null
          city?: string | null
          postal_code?: string | null
          country?: string
          custom_fields?: Json
          tags?: string[]
          owner_id?: string | null
          created_at?: string
          updated_at?: string
          deleted_at?: string | null
        }
        Update: {
          id?: string
          organization_id?: string
          first_name?: string | null
          last_name?: string | null
          email?: string | null
          phone?: string | null
          mobile?: string | null
          job_title?: string | null
          company_id?: string | null
          source?: ContactSource | null
          source_details?: string | null
          address_line1?: string | null
          address_line2?: string | null
          city?: string | null
          postal_code?: string | null
          country?: string
          custom_fields?: Json
          tags?: string[]
          owner_id?: string | null
          created_at?: string
          updated_at?: string
          deleted_at?: string | null
        }
      }
      companies: {
        Row: {
          id: string
          organization_id: string
          name: string
          siret: string | null
          website: string | null
          industry: string | null
          size: CompanySize | null
          address_line1: string | null
          address_line2: string | null
          city: string | null
          postal_code: string | null
          country: string
          phone: string | null
          email: string | null
          custom_fields: Json
          created_at: string
          updated_at: string
          deleted_at: string | null
        }
        Insert: {
          id?: string
          organization_id: string
          name: string
          siret?: string | null
          website?: string | null
          industry?: string | null
          size?: CompanySize | null
          address_line1?: string | null
          address_line2?: string | null
          city?: string | null
          postal_code?: string | null
          country?: string
          phone?: string | null
          email?: string | null
          custom_fields?: Json
          created_at?: string
          updated_at?: string
          deleted_at?: string | null
        }
        Update: {
          id?: string
          organization_id?: string
          name?: string
          siret?: string | null
          website?: string | null
          industry?: string | null
          size?: CompanySize | null
          address_line1?: string | null
          address_line2?: string | null
          city?: string | null
          postal_code?: string | null
          country?: string
          phone?: string | null
          email?: string | null
          custom_fields?: Json
          created_at?: string
          updated_at?: string
          deleted_at?: string | null
        }
      }
      pipelines: {
        Row: {
          id: string
          organization_id: string
          name: string
          description: string | null
          is_default: boolean
          created_at: string
          updated_at: string
          deleted_at: string | null
        }
        Insert: {
          id?: string
          organization_id: string
          name: string
          description?: string | null
          is_default?: boolean
          created_at?: string
          updated_at?: string
          deleted_at?: string | null
        }
        Update: {
          id?: string
          organization_id?: string
          name?: string
          description?: string | null
          is_default?: boolean
          created_at?: string
          updated_at?: string
          deleted_at?: string | null
        }
      }
      pipeline_stages: {
        Row: {
          id: string
          pipeline_id: string
          name: string
          color: string
          position: number
          probability: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          pipeline_id: string
          name: string
          color?: string
          position: number
          probability?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          pipeline_id?: string
          name?: string
          color?: string
          position?: number
          probability?: number
          created_at?: string
          updated_at?: string
        }
      }
      deals: {
        Row: {
          id: string
          organization_id: string
          pipeline_id: string
          stage_id: string
          name: string
          amount: number | null
          currency: string
          probability: number | null
          expected_close_date: string | null
          contact_id: string | null
          company_id: string | null
          status: DealStatus
          won_at: string | null
          lost_at: string | null
          lost_reason: string | null
          owner_id: string | null
          custom_fields: Json
          created_at: string
          updated_at: string
          deleted_at: string | null
        }
        Insert: {
          id?: string
          organization_id: string
          pipeline_id: string
          stage_id: string
          name: string
          amount?: number | null
          currency?: string
          probability?: number | null
          expected_close_date?: string | null
          contact_id?: string | null
          company_id?: string | null
          status?: DealStatus
          won_at?: string | null
          lost_at?: string | null
          lost_reason?: string | null
          owner_id?: string | null
          custom_fields?: Json
          created_at?: string
          updated_at?: string
          deleted_at?: string | null
        }
        Update: {
          id?: string
          organization_id?: string
          pipeline_id?: string
          stage_id?: string
          name?: string
          amount?: number | null
          currency?: string
          probability?: number | null
          expected_close_date?: string | null
          contact_id?: string | null
          company_id?: string | null
          status?: DealStatus
          won_at?: string | null
          lost_at?: string | null
          lost_reason?: string | null
          owner_id?: string | null
          custom_fields?: Json
          created_at?: string
          updated_at?: string
          deleted_at?: string | null
        }
      }
      activities: {
        Row: {
          id: string
          organization_id: string
          type: ActivityType
          subject: string
          description: string | null
          contact_id: string | null
          company_id: string | null
          deal_id: string | null
          due_date: string | null
          completed_at: string | null
          duration_minutes: number | null
          created_by: string | null
          created_at: string
          updated_at: string
          deleted_at: string | null
        }
        Insert: {
          id?: string
          organization_id: string
          type: ActivityType
          subject: string
          description?: string | null
          contact_id?: string | null
          company_id?: string | null
          deal_id?: string | null
          due_date?: string | null
          completed_at?: string | null
          duration_minutes?: number | null
          created_by?: string | null
          created_at?: string
          updated_at?: string
          deleted_at?: string | null
        }
        Update: {
          id?: string
          organization_id?: string
          type?: ActivityType
          subject?: string
          description?: string | null
          contact_id?: string | null
          company_id?: string | null
          deal_id?: string | null
          due_date?: string | null
          completed_at?: string | null
          duration_minutes?: number | null
          created_by?: string | null
          created_at?: string
          updated_at?: string
          deleted_at?: string | null
        }
      }
      custom_field_definitions: {
        Row: {
          id: string
          organization_id: string
          entity_type: string
          name: string
          field_key: string
          field_type: CustomFieldType
          options: string[] | null
          is_required: boolean
          position: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          organization_id: string
          entity_type: string
          name: string
          field_key: string
          field_type: CustomFieldType
          options?: string[] | null
          is_required?: boolean
          position?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          organization_id?: string
          entity_type?: string
          name?: string
          field_key?: string
          field_type?: CustomFieldType
          options?: string[] | null
          is_required?: boolean
          position?: number
          created_at?: string
          updated_at?: string
        }
      }
      tags: {
        Row: {
          id: string
          organization_id: string
          name: string
          color: string
          created_at: string
        }
        Insert: {
          id?: string
          organization_id: string
          name: string
          color?: string
          created_at?: string
        }
        Update: {
          id?: string
          organization_id?: string
          name?: string
          color?: string
          created_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      contact_source: ContactSource
      company_size: CompanySize
      deal_status: DealStatus
      activity_type: ActivityType
      custom_field_type: CustomFieldType
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

// ===========================================
// HELPER TYPES
// ===========================================

export type Tables<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Row']
export type TablesInsert<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Insert']
export type TablesUpdate<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Update']
export type Enums<T extends keyof Database['public']['Enums']> = Database['public']['Enums'][T]
export type Functions<T extends keyof Database['public']['Functions']> =
  Database['public']['Functions'][T]

// ===========================================
// CONVENIENCE TYPE ALIASES
// ===========================================

export type Organization = Tables<'organizations'>
export type OrganizationInsert = TablesInsert<'organizations'>
export type OrganizationUpdate = TablesUpdate<'organizations'>

export type User = Tables<'users'>
export type UserInsert = TablesInsert<'users'>
export type UserUpdate = TablesUpdate<'users'>

export type OrganizationMember = Tables<'organization_members'>
export type OrganizationMemberInsert = TablesInsert<'organization_members'>
export type OrganizationMemberUpdate = TablesUpdate<'organization_members'>

export type Session = Tables<'sessions'>
export type SessionInsert = TablesInsert<'sessions'>
export type SessionUpdate = TablesUpdate<'sessions'>

export type VerificationToken = Tables<'verification_tokens'>
export type VerificationTokenInsert = TablesInsert<'verification_tokens'>
export type VerificationTokenUpdate = TablesUpdate<'verification_tokens'>

export type UsageTracking = Tables<'usage_tracking'>
export type UsageTrackingInsert = TablesInsert<'usage_tracking'>
export type UsageTrackingUpdate = TablesUpdate<'usage_tracking'>

export type AuditLog = Tables<'audit_logs'>
export type AuditLogInsert = TablesInsert<'audit_logs'>
export type AuditLogUpdate = TablesUpdate<'audit_logs'>

// ===========================================
// CRM SCHEMA TYPES
// ===========================================

export type ContactSource =
  | 'website'
  | 'referral'
  | 'linkedin'
  | 'facebook'
  | 'google'
  | 'trade_show'
  | 'cold_call'
  | 'email_campaign'
  | 'partner'
  | 'manual'
  | 'import'
  | 'other'

export type CompanySize = '1-10' | '11-50' | '51-200' | '201-500' | '500+'

export type DealStatus = 'open' | 'won' | 'lost'

export type ActivityType = 'call' | 'email' | 'meeting' | 'task' | 'note'

export type CustomFieldType = 'text' | 'number' | 'date' | 'select' | 'multiselect' | 'boolean'

// Extend the Database interface with CRM schema
declare module '@supabase/supabase-js' {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  interface Database {
    crm: CrmSchema
  }
}

export interface CrmSchema {
  Tables: {
    contacts: {
      Row: {
        id: string
        organization_id: string
        first_name: string | null
        last_name: string | null
        email: string | null
        phone: string | null
        mobile: string | null
        job_title: string | null
        company_id: string | null
        source: ContactSource | null
        source_details: string | null
        address_line1: string | null
        address_line2: string | null
        city: string | null
        postal_code: string | null
        country: string
        custom_fields: Json
        tags: string[]
        owner_id: string | null
        created_at: string
        updated_at: string
        deleted_at: string | null
      }
      Insert: {
        id?: string
        organization_id: string
        first_name?: string | null
        last_name?: string | null
        email?: string | null
        phone?: string | null
        mobile?: string | null
        job_title?: string | null
        company_id?: string | null
        source?: ContactSource | null
        source_details?: string | null
        address_line1?: string | null
        address_line2?: string | null
        city?: string | null
        postal_code?: string | null
        country?: string
        custom_fields?: Json
        tags?: string[]
        owner_id?: string | null
        created_at?: string
        updated_at?: string
        deleted_at?: string | null
      }
      Update: {
        id?: string
        organization_id?: string
        first_name?: string | null
        last_name?: string | null
        email?: string | null
        phone?: string | null
        mobile?: string | null
        job_title?: string | null
        company_id?: string | null
        source?: ContactSource | null
        source_details?: string | null
        address_line1?: string | null
        address_line2?: string | null
        city?: string | null
        postal_code?: string | null
        country?: string
        custom_fields?: Json
        tags?: string[]
        owner_id?: string | null
        created_at?: string
        updated_at?: string
        deleted_at?: string | null
      }
    }
    companies: {
      Row: {
        id: string
        organization_id: string
        name: string
        siret: string | null
        website: string | null
        industry: string | null
        size: CompanySize | null
        address_line1: string | null
        address_line2: string | null
        city: string | null
        postal_code: string | null
        country: string
        phone: string | null
        email: string | null
        custom_fields: Json
        created_at: string
        updated_at: string
        deleted_at: string | null
      }
      Insert: {
        id?: string
        organization_id: string
        name: string
        siret?: string | null
        website?: string | null
        industry?: string | null
        size?: CompanySize | null
        address_line1?: string | null
        address_line2?: string | null
        city?: string | null
        postal_code?: string | null
        country?: string
        phone?: string | null
        email?: string | null
        custom_fields?: Json
        created_at?: string
        updated_at?: string
        deleted_at?: string | null
      }
      Update: {
        id?: string
        organization_id?: string
        name?: string
        siret?: string | null
        website?: string | null
        industry?: string | null
        size?: CompanySize | null
        address_line1?: string | null
        address_line2?: string | null
        city?: string | null
        postal_code?: string | null
        country?: string
        phone?: string | null
        email?: string | null
        custom_fields?: Json
        created_at?: string
        updated_at?: string
        deleted_at?: string | null
      }
    }
    pipelines: {
      Row: {
        id: string
        organization_id: string
        name: string
        description: string | null
        is_default: boolean
        created_at: string
        updated_at: string
        deleted_at: string | null
      }
      Insert: {
        id?: string
        organization_id: string
        name: string
        description?: string | null
        is_default?: boolean
        created_at?: string
        updated_at?: string
        deleted_at?: string | null
      }
      Update: {
        id?: string
        organization_id?: string
        name?: string
        description?: string | null
        is_default?: boolean
        created_at?: string
        updated_at?: string
        deleted_at?: string | null
      }
    }
    pipeline_stages: {
      Row: {
        id: string
        pipeline_id: string
        name: string
        color: string
        position: number
        probability: number
        created_at: string
        updated_at: string
      }
      Insert: {
        id?: string
        pipeline_id: string
        name: string
        color?: string
        position: number
        probability?: number
        created_at?: string
        updated_at?: string
      }
      Update: {
        id?: string
        pipeline_id?: string
        name?: string
        color?: string
        position?: number
        probability?: number
        created_at?: string
        updated_at?: string
      }
    }
    deals: {
      Row: {
        id: string
        organization_id: string
        pipeline_id: string
        stage_id: string
        name: string
        amount: number | null
        currency: string
        probability: number | null
        expected_close_date: string | null
        contact_id: string | null
        company_id: string | null
        status: DealStatus
        won_at: string | null
        lost_at: string | null
        lost_reason: string | null
        owner_id: string | null
        custom_fields: Json
        created_at: string
        updated_at: string
        deleted_at: string | null
      }
      Insert: {
        id?: string
        organization_id: string
        pipeline_id: string
        stage_id: string
        name: string
        amount?: number | null
        currency?: string
        probability?: number | null
        expected_close_date?: string | null
        contact_id?: string | null
        company_id?: string | null
        status?: DealStatus
        won_at?: string | null
        lost_at?: string | null
        lost_reason?: string | null
        owner_id?: string | null
        custom_fields?: Json
        created_at?: string
        updated_at?: string
        deleted_at?: string | null
      }
      Update: {
        id?: string
        organization_id?: string
        pipeline_id?: string
        stage_id?: string
        name?: string
        amount?: number | null
        currency?: string
        probability?: number | null
        expected_close_date?: string | null
        contact_id?: string | null
        company_id?: string | null
        status?: DealStatus
        won_at?: string | null
        lost_at?: string | null
        lost_reason?: string | null
        owner_id?: string | null
        custom_fields?: Json
        created_at?: string
        updated_at?: string
        deleted_at?: string | null
      }
    }
    activities: {
      Row: {
        id: string
        organization_id: string
        type: ActivityType
        subject: string
        description: string | null
        contact_id: string | null
        company_id: string | null
        deal_id: string | null
        due_date: string | null
        completed_at: string | null
        duration_minutes: number | null
        created_by: string | null
        created_at: string
        updated_at: string
        deleted_at: string | null
      }
      Insert: {
        id?: string
        organization_id: string
        type: ActivityType
        subject: string
        description?: string | null
        contact_id?: string | null
        company_id?: string | null
        deal_id?: string | null
        due_date?: string | null
        completed_at?: string | null
        duration_minutes?: number | null
        created_by?: string | null
        created_at?: string
        updated_at?: string
        deleted_at?: string | null
      }
      Update: {
        id?: string
        organization_id?: string
        type?: ActivityType
        subject?: string
        description?: string | null
        contact_id?: string | null
        company_id?: string | null
        deal_id?: string | null
        due_date?: string | null
        completed_at?: string | null
        duration_minutes?: number | null
        created_by?: string | null
        created_at?: string
        updated_at?: string
        deleted_at?: string | null
      }
    }
    custom_field_definitions: {
      Row: {
        id: string
        organization_id: string
        entity_type: string
        name: string
        field_key: string
        field_type: CustomFieldType
        options: string[] | null
        is_required: boolean
        position: number
        created_at: string
        updated_at: string
      }
      Insert: {
        id?: string
        organization_id: string
        entity_type: string
        name: string
        field_key: string
        field_type: CustomFieldType
        options?: string[] | null
        is_required?: boolean
        position?: number
        created_at?: string
        updated_at?: string
      }
      Update: {
        id?: string
        organization_id?: string
        entity_type?: string
        name?: string
        field_key?: string
        field_type?: CustomFieldType
        options?: string[] | null
        is_required?: boolean
        position?: number
        created_at?: string
        updated_at?: string
      }
    }
    tags: {
      Row: {
        id: string
        organization_id: string
        name: string
        color: string
        created_at: string
      }
      Insert: {
        id?: string
        organization_id: string
        name: string
        color?: string
        created_at?: string
      }
      Update: {
        id?: string
        organization_id?: string
        name?: string
        color?: string
        created_at?: string
      }
    }
  }
  Views: {
    [_ in never]: never
  }
  Functions: {
    [_ in never]: never
  }
  Enums: {
    contact_source: ContactSource
    company_size: CompanySize
    deal_status: DealStatus
    activity_type: ActivityType
    custom_field_type: CustomFieldType
  }
  CompositeTypes: {
    [_ in never]: never
  }
}
