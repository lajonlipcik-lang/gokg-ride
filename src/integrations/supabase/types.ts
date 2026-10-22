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
    PostgrestVersion: "14.18"
  }
  public: {
    Tables: {
      admin_emails: {
        Row: {
          email: string
        }
        Insert: {
          email: string
        }
        Update: {
          email?: string
        }
        Relationships: []
      }
      app_config: {
        Row: {
          key: string
          value: string
        }
        Insert: {
          key: string
          value?: string
        }
        Update: {
          key?: string
          value?: string
        }
        Relationships: []
      }
      audit_log: {
        Row: {
          action: string
          actor: string | null
          created_at: string
          details: Json
          id: string
        }
        Insert: {
          action: string
          actor?: string | null
          created_at?: string
          details?: Json
          id?: string
        }
        Update: {
          action?: string
          actor?: string | null
          created_at?: string
          details?: Json
          id?: string
        }
        Relationships: []
      }
      complaints: {
        Row: {
          created_at: string
          id: string
          ride_id: string | null
          status: string
          text: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          ride_id?: string | null
          status?: string
          text: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          ride_id?: string | null
          status?: string
          text?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "complaints_ride_id_fkey"
            columns: ["ride_id"]
            isOneToOne: false
            referencedRelation: "rides"
            referencedColumns: ["id"]
          },
        ]
      }
      consents: {
        Row: {
          accepted_at: string
          doc_slug: string
          id: string
          user_id: string
          version: number
        }
        Insert: {
          accepted_at?: string
          doc_slug: string
          id?: string
          user_id: string
          version: number
        }
        Update: {
          accepted_at?: string
          doc_slug?: string
          id?: string
          user_id?: string
          version?: number
        }
        Relationships: []
      }
      documents: {
        Row: {
          created_at: string
          driver_id: string
          id: string
          kind: string
          path: string
        }
        Insert: {
          created_at?: string
          driver_id: string
          id?: string
          kind: string
          path: string
        }
        Update: {
          created_at?: string
          driver_id?: string
          id?: string
          kind?: string
          path?: string
        }
        Relationships: []
      }
      drivers: {
        Row: {
          created_at: string
          lat: number | null
          lng: number | null
          location_updated_at: string | null
          online: boolean
          rating: number
          reject_reason: string | null
          rides_count: number
          status: string
          user_id: string
        }
        Insert: {
          created_at?: string
          lat?: number | null
          lng?: number | null
          location_updated_at?: string | null
          online?: boolean
          rating?: number
          reject_reason?: string | null
          rides_count?: number
          status?: string
          user_id: string
        }
        Update: {
          created_at?: string
          lat?: number | null
          lng?: number | null
          location_updated_at?: string | null
          online?: boolean
          rating?: number
          reject_reason?: string | null
          rides_count?: number
          status?: string
          user_id?: string
        }
        Relationships: []
      }
      legal_documents: {
        Row: {
          body: string
          id: string
          lang: string
          slug: string
          title: string
          updated_at: string
          version: number
        }
        Insert: {
          body: string
          id?: string
          lang: string
          slug: string
          title: string
          updated_at?: string
          version?: number
        }
        Update: {
          body?: string
          id?: string
          lang?: string
          slug?: string
          title?: string
          updated_at?: string
          version?: number
        }
        Relationships: []
      }
      otp_codes: {
        Row: {
          attempts: number
          code_hash: string
          created_at: string
          expires_at: string
          id: string
          phone: string
          used: boolean
          user_id: string
        }
        Insert: {
          attempts?: number
          code_hash: string
          created_at?: string
          expires_at: string
          id?: string
          phone: string
          used?: boolean
          user_id: string
        }
        Update: {
          attempts?: number
          code_hash?: string
          created_at?: string
          expires_at?: string
          id?: string
          phone?: string
          used?: boolean
          user_id?: string
        }
        Relationships: []
      }
      payments: {
        Row: {
          amount: number
          created_at: string
          id: string
          method: string
          ride_id: string
        }
        Insert: {
          amount: number
          created_at?: string
          id?: string
          method?: string
          ride_id: string
        }
        Update: {
          amount?: number
          created_at?: string
          id?: string
          method?: string
          ride_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "payments_ride_id_fkey"
            columns: ["ride_id"]
            isOneToOne: true
            referencedRelation: "rides"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          blocked: boolean
          created_at: string
          email: string | null
          full_name: string
          id: string
          phone: string | null
          phone_verified: boolean
        }
        Insert: {
          blocked?: boolean
          created_at?: string
          email?: string | null
          full_name?: string
          id: string
          phone?: string | null
          phone_verified?: boolean
        }
        Update: {
          blocked?: boolean
          created_at?: string
          email?: string | null
          full_name?: string
          id?: string
          phone?: string | null
          phone_verified?: boolean
        }
        Relationships: []
      }
      ratings: {
        Row: {
          comment: string | null
          created_at: string
          from_user: string | null
          id: string
          ride_id: string
          stars: number
          to_user: string | null
        }
        Insert: {
          comment?: string | null
          created_at?: string
          from_user?: string | null
          id?: string
          ride_id: string
          stars: number
          to_user?: string | null
        }
        Update: {
          comment?: string | null
          created_at?: string
          from_user?: string | null
          id?: string
          ride_id?: string
          stars?: number
          to_user?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "ratings_ride_id_fkey"
            columns: ["ride_id"]
            isOneToOne: true
            referencedRelation: "rides"
            referencedColumns: ["id"]
          },
        ]
      }
      ride_events: {
        Row: {
          actor: string | null
          created_at: string
          id: string
          ride_id: string
          status: string
        }
        Insert: {
          actor?: string | null
          created_at?: string
          id?: string
          ride_id: string
          status: string
        }
        Update: {
          actor?: string | null
          created_at?: string
          id?: string
          ride_id?: string
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "ride_events_ride_id_fkey"
            columns: ["ride_id"]
            isOneToOne: false
            referencedRelation: "rides"
            referencedColumns: ["id"]
          },
        ]
      }
      rides: {
        Row: {
          accepted_at: string | null
          arrived_at: string | null
          cancelled_at: string | null
          candidate_ids: string[]
          class: string
          comment: string | null
          completed_at: string | null
          created_at: string
          distance_km: number
          driver_id: string | null
          duration_min: number
          entrance: string | null
          from_addr: string
          from_lat: number
          from_lng: number
          id: string
          idempotency_key: string
          no_call: boolean
          options: Json
          passenger_id: string | null
          price: number
          share_token: string | null
          started_at: string | null
          status: string
          to_addr: string
          to_lat: number
          to_lng: number
          zone_id: string | null
        }
        Insert: {
          accepted_at?: string | null
          arrived_at?: string | null
          cancelled_at?: string | null
          candidate_ids?: string[]
          class: string
          comment?: string | null
          completed_at?: string | null
          created_at?: string
          distance_km: number
          driver_id?: string | null
          duration_min: number
          entrance?: string | null
          from_addr: string
          from_lat: number
          from_lng: number
          id?: string
          idempotency_key: string
          no_call?: boolean
          options?: Json
          passenger_id?: string | null
          price: number
          share_token?: string | null
          started_at?: string | null
          status?: string
          to_addr: string
          to_lat: number
          to_lng: number
          zone_id?: string | null
        }
        Update: {
          accepted_at?: string | null
          arrived_at?: string | null
          cancelled_at?: string | null
          candidate_ids?: string[]
          class?: string
          comment?: string | null
          completed_at?: string | null
          created_at?: string
          distance_km?: number
          driver_id?: string | null
          duration_min?: number
          entrance?: string | null
          from_addr?: string
          from_lat?: number
          from_lng?: number
          id?: string
          idempotency_key?: string
          no_call?: boolean
          options?: Json
          passenger_id?: string | null
          price?: number
          share_token?: string | null
          started_at?: string | null
          status?: string
          to_addr?: string
          to_lat?: number
          to_lng?: number
          zone_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "rides_zone_id_fkey"
            columns: ["zone_id"]
            isOneToOne: false
            referencedRelation: "zones"
            referencedColumns: ["id"]
          },
        ]
      }
      sms_log: {
        Row: {
          created_at: string
          error: string | null
          id: string
          phone_masked: string
          status: string
          test: boolean
        }
        Insert: {
          created_at?: string
          error?: string | null
          id?: string
          phone_masked: string
          status: string
          test?: boolean
        }
        Update: {
          created_at?: string
          error?: string | null
          id?: string
          phone_masked?: string
          status?: string
          test?: boolean
        }
        Relationships: []
      }
      sms_secrets: {
        Row: {
          api_key_enc: string | null
          id: number
        }
        Insert: {
          api_key_enc?: string | null
          id?: number
        }
        Update: {
          api_key_enc?: string | null
          id?: number
        }
        Relationships: []
      }
      sms_settings: {
        Row: {
          api_url: string
          body_format: string
          body_template: string
          enabled: boolean
          has_key: boolean
          headers: Json
          id: number
          max_attempts: number
          max_per_10min: number
          method: string
          provider_name: string
          sender: string
          success_contains: string
          test_mode: boolean
          text_template: string
          ttl_min: number
          updated_at: string
        }
        Insert: {
          api_url?: string
          body_format?: string
          body_template?: string
          enabled?: boolean
          has_key?: boolean
          headers?: Json
          id?: number
          max_attempts?: number
          max_per_10min?: number
          method?: string
          provider_name?: string
          sender?: string
          success_contains?: string
          test_mode?: boolean
          text_template?: string
          ttl_min?: number
          updated_at?: string
        }
        Update: {
          api_url?: string
          body_format?: string
          body_template?: string
          enabled?: boolean
          has_key?: boolean
          headers?: Json
          id?: number
          max_attempts?: number
          max_per_10min?: number
          method?: string
          provider_name?: string
          sender?: string
          success_contains?: string
          test_mode?: boolean
          text_template?: string
          ttl_min?: number
          updated_at?: string
        }
        Relationships: []
      }
      sos_events: {
        Row: {
          created_at: string
          id: string
          lat: number | null
          lng: number | null
          ride_id: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          lat?: number | null
          lng?: number | null
          ride_id?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          lat?: number | null
          lng?: number | null
          ride_id?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "sos_events_ride_id_fkey"
            columns: ["ride_id"]
            isOneToOne: false
            referencedRelation: "rides"
            referencedColumns: ["id"]
          },
        ]
      }
      support_messages: {
        Row: {
          author_id: string
          body: string
          created_at: string
          id: string
          request_id: string
        }
        Insert: {
          author_id: string
          body: string
          created_at?: string
          id?: string
          request_id: string
        }
        Update: {
          author_id?: string
          body?: string
          created_at?: string
          id?: string
          request_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "support_messages_author_id_fkey"
            columns: ["author_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "support_messages_request_id_fkey"
            columns: ["request_id"]
            isOneToOne: false
            referencedRelation: "support_requests"
            referencedColumns: ["id"]
          },
        ]
      }
      support_requests: {
        Row: {
          body: string
          created_at: string
          id: string
          status: string
          subject: string
          user_id: string
        }
        Insert: {
          body: string
          created_at?: string
          id?: string
          status?: string
          subject: string
          user_id: string
        }
        Update: {
          body?: string
          created_at?: string
          id?: string
          status?: string
          subject?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "support_requests_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      tariffs: {
        Row: {
          base: number
          class: string
          fastest_surcharge: number
          id: string
          min_price: number
          multiplier: number
          per_km: number
          per_min: number
          zone_id: string
        }
        Insert: {
          base: number
          class: string
          fastest_surcharge?: number
          id?: string
          min_price: number
          multiplier?: number
          per_km: number
          per_min: number
          zone_id: string
        }
        Update: {
          base?: number
          class?: string
          fastest_surcharge?: number
          id?: string
          min_price?: number
          multiplier?: number
          per_km?: number
          per_min?: number
          zone_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "tariffs_zone_id_fkey"
            columns: ["zone_id"]
            isOneToOne: false
            referencedRelation: "zones"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      user_settings: {
        Row: {
          lang: string
          no_call: boolean
          notify_news: boolean
          notify_promo: boolean
          notify_status: boolean
          show_location: boolean
          theme: string
          traffic: boolean
          updated_at: string
          user_id: string
          vibration: boolean
        }
        Insert: {
          lang?: string
          no_call?: boolean
          notify_news?: boolean
          notify_promo?: boolean
          notify_status?: boolean
          show_location?: boolean
          theme?: string
          traffic?: boolean
          updated_at?: string
          user_id: string
          vibration?: boolean
        }
        Update: {
          lang?: string
          no_call?: boolean
          notify_news?: boolean
          notify_promo?: boolean
          notify_status?: boolean
          show_location?: boolean
          theme?: string
          traffic?: boolean
          updated_at?: string
          user_id?: string
          vibration?: boolean
        }
        Relationships: []
      }
      vehicles: {
        Row: {
          class: string
          color: string
          driver_id: string
          id: string
          make: string
          model: string
          plate: string
          year: number
        }
        Insert: {
          class?: string
          color: string
          driver_id: string
          id?: string
          make: string
          model: string
          plate: string
          year: number
        }
        Update: {
          class?: string
          color?: string
          driver_id?: string
          id?: string
          make?: string
          model?: string
          plate?: string
          year?: number
        }
        Relationships: []
      }
      zones: {
        Row: {
          center_lat: number
          center_lng: number
          id: string
          name: string
          radius_km: number
        }
        Insert: {
          center_lat: number
          center_lng: number
          id?: string
          name: string
          radius_km?: number
        }
        Update: {
          center_lat?: number
          center_lng?: number
          id?: string
          name?: string
          radius_km?: number
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      accept_ride: {
        Args: { p_ride: string }
        Returns: {
          accepted_at: string | null
          arrived_at: string | null
          cancelled_at: string | null
          candidate_ids: string[]
          class: string
          comment: string | null
          completed_at: string | null
          created_at: string
          distance_km: number
          driver_id: string | null
          duration_min: number
          entrance: string | null
          from_addr: string
          from_lat: number
          from_lng: number
          id: string
          idempotency_key: string
          no_call: boolean
          options: Json
          passenger_id: string | null
          price: number
          share_token: string | null
          started_at: string | null
          status: string
          to_addr: string
          to_lat: number
          to_lng: number
          zone_id: string | null
        }
        SetofOptions: {
          from: "*"
          to: "rides"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      admin_block_user: {
        Args: { p_blocked: boolean; p_user: string }
        Returns: undefined
      }
      admin_moderate_driver: {
        Args: { p_approve: boolean; p_reason: string; p_user: string }
        Returns: undefined
      }
      admin_stats: { Args: never; Returns: Json }
      advance_ride: {
        Args: { p_ride: string; p_status: string }
        Returns: {
          accepted_at: string | null
          arrived_at: string | null
          cancelled_at: string | null
          candidate_ids: string[]
          class: string
          comment: string | null
          completed_at: string | null
          created_at: string
          distance_km: number
          driver_id: string | null
          duration_min: number
          entrance: string | null
          from_addr: string
          from_lat: number
          from_lng: number
          id: string
          idempotency_key: string
          no_call: boolean
          options: Json
          passenger_id: string | null
          price: number
          share_token: string | null
          started_at: string | null
          status: string
          to_addr: string
          to_lat: number
          to_lng: number
          zone_id: string | null
        }
        SetofOptions: {
          from: "*"
          to: "rides"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      calc_price: {
        Args: { p_class: string; p_km: number; p_min: number; p_zone: string }
        Returns: number
      }
      cancel_ride: {
        Args: { p_ride: string }
        Returns: {
          accepted_at: string | null
          arrived_at: string | null
          cancelled_at: string | null
          candidate_ids: string[]
          class: string
          comment: string | null
          completed_at: string | null
          created_at: string
          distance_km: number
          driver_id: string | null
          duration_min: number
          entrance: string | null
          from_addr: string
          from_lat: number
          from_lng: number
          id: string
          idempotency_key: string
          no_call: boolean
          options: Json
          passenger_id: string | null
          price: number
          share_token: string | null
          started_at: string | null
          status: string
          to_addr: string
          to_lat: number
          to_lng: number
          zone_id: string | null
        }
        SetofOptions: {
          from: "*"
          to: "rides"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      create_ride: {
        Args: {
          p_class: string
          p_comment: string
          p_entrance: string
          p_from_addr: string
          p_from_lat: number
          p_from_lng: number
          p_idem: string
          p_no_call: boolean
          p_options: Json
          p_to_addr: string
          p_to_lat: number
          p_to_lng: number
        }
        Returns: {
          accepted_at: string | null
          arrived_at: string | null
          cancelled_at: string | null
          candidate_ids: string[]
          class: string
          comment: string | null
          completed_at: string | null
          created_at: string
          distance_km: number
          driver_id: string | null
          duration_min: number
          entrance: string | null
          from_addr: string
          from_lat: number
          from_lng: number
          id: string
          idempotency_key: string
          no_call: boolean
          options: Json
          passenger_id: string | null
          price: number
          share_token: string | null
          started_at: string | null
          status: string
          to_addr: string
          to_lat: number
          to_lng: number
          zone_id: string | null
        }
        SetofOptions: {
          from: "*"
          to: "rides"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      decline_ride: { Args: { p_ride: string }; Returns: undefined }
      driver_apply: {
        Args: {
          p_class: string
          p_color: string
          p_make: string
          p_model: string
          p_plate: string
          p_year: number
        }
        Returns: undefined
      }
      driver_become: { Args: never; Returns: undefined }
      driver_set_online: { Args: { p_online: boolean }; Returns: undefined }
      driver_update_location: {
        Args: { p_lat: number; p_lng: number }
        Returns: undefined
      }
      estimate_trip: {
        Args: {
          p_from_lat: number
          p_from_lng: number
          p_to_lat: number
          p_to_lng: number
        }
        Returns: Json
      }
      expire_search: { Args: { p_ride: string }; Returns: undefined }
      find_candidates: {
        Args: { p_class: string; p_lat: number; p_lng: number }
        Returns: string[]
      }
      get_shared_ride: { Args: { p_token: string }; Returns: Json }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      km_between: {
        Args: { a_lat: number; a_lng: number; b_lat: number; b_lng: number }
        Returns: number
      }
      log_audit: {
        Args: { p_action: string; p_details: Json }
        Returns: undefined
      }
      nearby_drivers: {
        Args: { p_lat: number; p_lng: number }
        Returns: {
          class: string
          eta_min: number
          lat: number
          lng: number
        }[]
      }
      nearest_zone: { Args: { p_lat: number; p_lng: number }; Returns: string }
      rate_ride: {
        Args: { p_comment: string; p_ride: string; p_stars: number }
        Returns: undefined
      }
      retry_ride: {
        Args: { p_ride: string }
        Returns: {
          accepted_at: string | null
          arrived_at: string | null
          cancelled_at: string | null
          candidate_ids: string[]
          class: string
          comment: string | null
          completed_at: string | null
          created_at: string
          distance_km: number
          driver_id: string | null
          duration_min: number
          entrance: string | null
          from_addr: string
          from_lat: number
          from_lng: number
          id: string
          idempotency_key: string
          no_call: boolean
          options: Json
          passenger_id: string | null
          price: number
          share_token: string | null
          started_at: string | null
          status: string
          to_addr: string
          to_lat: number
          to_lng: number
          zone_id: string | null
        }
        SetofOptions: {
          from: "*"
          to: "rides"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      ride_details: { Args: { p_ride: string }; Returns: Json }
      sms_required: { Args: never; Returns: boolean }
      trigger_sos: {
        Args: { p_lat: number; p_lng: number; p_ride: string }
        Returns: string
      }
    }
    Enums: {
      app_role: "passenger" | "driver" | "admin"
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
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
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
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
      app_role: ["passenger", "driver", "admin"],
    },
  },
} as const
