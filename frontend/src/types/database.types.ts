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
      audit_logs: {
        Row: {
          action: string
          actor_id: string | null
          after: Json | null
          before: Json | null
          created_at: string
          entity: string
          entity_id: string | null
          id: number
        }
        Insert: {
          action: string
          actor_id?: string | null
          after?: Json | null
          before?: Json | null
          created_at?: string
          entity: string
          entity_id?: string | null
          id?: number
        }
        Update: {
          action?: string
          actor_id?: string | null
          after?: Json | null
          before?: Json | null
          created_at?: string
          entity?: string
          entity_id?: string | null
          id?: number
        }
        Relationships: []
      }
      bills: {
        Row: {
          discount: number
          id: string
          issued_at: string
          issued_by: string | null
          promotion_id: string | null
          service_charge: number
          status: Database["public"]["Enums"]["payment_status"]
          subtotal: number
          total: number
          vat: number
          visit_id: string
        }
        Insert: {
          discount?: number
          id?: string
          issued_at?: string
          issued_by?: string | null
          promotion_id?: string | null
          service_charge?: number
          status?: Database["public"]["Enums"]["payment_status"]
          subtotal?: number
          total?: number
          vat?: number
          visit_id: string
        }
        Update: {
          discount?: number
          id?: string
          issued_at?: string
          issued_by?: string | null
          promotion_id?: string | null
          service_charge?: number
          status?: Database["public"]["Enums"]["payment_status"]
          subtotal?: number
          total?: number
          vat?: number
          visit_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "bills_issued_by_fkey"
            columns: ["issued_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bills_promotion_id_fkey"
            columns: ["promotion_id"]
            isOneToOne: false
            referencedRelation: "promotions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bills_visit_id_fkey"
            columns: ["visit_id"]
            isOneToOne: true
            referencedRelation: "visits"
            referencedColumns: ["id"]
          },
        ]
      }
      buffet_packages: {
        Row: {
          description: string | null
          id: string
          is_active: boolean
          minutes: number
          name: string
          price_adult: number
          price_child: number
          sort_order: number
        }
        Insert: {
          description?: string | null
          id?: string
          is_active?: boolean
          minutes?: number
          name: string
          price_adult: number
          price_child?: number
          sort_order?: number
        }
        Update: {
          description?: string | null
          id?: string
          is_active?: boolean
          minutes?: number
          name?: string
          price_adult?: number
          price_child?: number
          sort_order?: number
        }
        Relationships: []
      }
      dining_tables: {
        Row: {
          code: string
          id: string
          is_active: boolean
          seats: number
          sort_order: number
          status: Database["public"]["Enums"]["table_status"]
          updated_at: string
          zone: string | null
        }
        Insert: {
          code: string
          id?: string
          is_active?: boolean
          seats?: number
          sort_order?: number
          status?: Database["public"]["Enums"]["table_status"]
          updated_at?: string
          zone?: string | null
        }
        Update: {
          code?: string
          id?: string
          is_active?: boolean
          seats?: number
          sort_order?: number
          status?: Database["public"]["Enums"]["table_status"]
          updated_at?: string
          zone?: string | null
        }
        Relationships: []
      }
      menu_categories: {
        Row: {
          id: string
          is_active: boolean
          name: string
          sort_order: number
        }
        Insert: {
          id?: string
          is_active?: boolean
          name: string
          sort_order?: number
        }
        Update: {
          id?: string
          is_active?: boolean
          name?: string
          sort_order?: number
        }
        Relationships: []
      }
      menu_items: {
        Row: {
          category_id: string | null
          created_at: string
          description: string | null
          id: string
          image_url: string | null
          is_available: boolean
          kind: Database["public"]["Enums"]["menu_kind"]
          max_per_order: number | null
          name: string
          price: number
          sort_order: number
          station: Database["public"]["Enums"]["prep_station"]
        }
        Insert: {
          category_id?: string | null
          created_at?: string
          description?: string | null
          id?: string
          image_url?: string | null
          is_available?: boolean
          kind?: Database["public"]["Enums"]["menu_kind"]
          max_per_order?: number | null
          name: string
          price?: number
          sort_order?: number
          station?: Database["public"]["Enums"]["prep_station"]
        }
        Update: {
          category_id?: string | null
          created_at?: string
          description?: string | null
          id?: string
          image_url?: string | null
          is_available?: boolean
          kind?: Database["public"]["Enums"]["menu_kind"]
          max_per_order?: number | null
          name?: string
          price?: number
          sort_order?: number
          station?: Database["public"]["Enums"]["prep_station"]
        }
        Relationships: [
          {
            foreignKeyName: "menu_items_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "menu_categories"
            referencedColumns: ["id"]
          },
        ]
      }
      order_items: {
        Row: {
          created_at: string
          id: string
          menu_item_id: string | null
          name_snapshot: string
          note: string | null
          order_id: string
          qty: number
          station: Database["public"]["Enums"]["prep_station"]
          status: Database["public"]["Enums"]["order_status"]
          unit_price: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          menu_item_id?: string | null
          name_snapshot: string
          note?: string | null
          order_id: string
          qty: number
          station?: Database["public"]["Enums"]["prep_station"]
          status?: Database["public"]["Enums"]["order_status"]
          unit_price?: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          menu_item_id?: string | null
          name_snapshot?: string
          note?: string | null
          order_id?: string
          qty?: number
          station?: Database["public"]["Enums"]["prep_station"]
          status?: Database["public"]["Enums"]["order_status"]
          unit_price?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "order_items_menu_item_id_fkey"
            columns: ["menu_item_id"]
            isOneToOne: false
            referencedRelation: "menu_items"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_items_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      orders: {
        Row: {
          created_at: string
          id: string
          note: string | null
          placed_by: string | null
          round_no: number
          status: Database["public"]["Enums"]["order_status"]
          updated_at: string
          visit_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          note?: string | null
          placed_by?: string | null
          round_no?: number
          status?: Database["public"]["Enums"]["order_status"]
          updated_at?: string
          visit_id: string
        }
        Update: {
          created_at?: string
          id?: string
          note?: string | null
          placed_by?: string | null
          round_no?: number
          status?: Database["public"]["Enums"]["order_status"]
          updated_at?: string
          visit_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "orders_visit_id_fkey"
            columns: ["visit_id"]
            isOneToOne: false
            referencedRelation: "visits"
            referencedColumns: ["id"]
          },
        ]
      }
      package_items: {
        Row: {
          menu_item_id: string
          package_id: string
        }
        Insert: {
          menu_item_id: string
          package_id: string
        }
        Update: {
          menu_item_id?: string
          package_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "package_items_menu_item_id_fkey"
            columns: ["menu_item_id"]
            isOneToOne: false
            referencedRelation: "menu_items"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "package_items_package_id_fkey"
            columns: ["package_id"]
            isOneToOne: false
            referencedRelation: "buffet_packages"
            referencedColumns: ["id"]
          },
        ]
      }
      payments: {
        Row: {
          amount: number
          bill_id: string
          created_at: string
          id: string
          method: Database["public"]["Enums"]["payment_method"]
          paid_at: string | null
          received_by: string | null
          ref_no: string | null
          status: Database["public"]["Enums"]["payment_status"]
        }
        Insert: {
          amount: number
          bill_id: string
          created_at?: string
          id?: string
          method: Database["public"]["Enums"]["payment_method"]
          paid_at?: string | null
          received_by?: string | null
          ref_no?: string | null
          status?: Database["public"]["Enums"]["payment_status"]
        }
        Update: {
          amount?: number
          bill_id?: string
          created_at?: string
          id?: string
          method?: Database["public"]["Enums"]["payment_method"]
          paid_at?: string | null
          received_by?: string | null
          ref_no?: string | null
          status?: Database["public"]["Enums"]["payment_status"]
        }
        Relationships: [
          {
            foreignKeyName: "payments_bill_id_fkey"
            columns: ["bill_id"]
            isOneToOne: false
            referencedRelation: "bills"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payments_received_by_fkey"
            columns: ["received_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      point_transactions: {
        Row: {
          created_at: string
          id: string
          kind: Database["public"]["Enums"]["point_txn_kind"]
          note: string | null
          points: number
          profile_id: string
          visit_id: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          kind?: Database["public"]["Enums"]["point_txn_kind"]
          note?: string | null
          points: number
          profile_id: string
          visit_id?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          kind?: Database["public"]["Enums"]["point_txn_kind"]
          note?: string | null
          points?: number
          profile_id?: string
          visit_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "point_transactions_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "point_transactions_visit_id_fkey"
            columns: ["visit_id"]
            isOneToOne: false
            referencedRelation: "visits"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string
          display_name: string | null
          id: string
          is_active: boolean
          phone: string | null
          points: number
          role: Database["public"]["Enums"]["app_role"]
          total_spent: number
        }
        Insert: {
          created_at?: string
          display_name?: string | null
          id: string
          is_active?: boolean
          phone?: string | null
          points?: number
          role?: Database["public"]["Enums"]["app_role"]
          total_spent?: number
        }
        Update: {
          created_at?: string
          display_name?: string | null
          id?: string
          is_active?: boolean
          phone?: string | null
          points?: number
          role?: Database["public"]["Enums"]["app_role"]
          total_spent?: number
        }
        Relationships: []
      }
      promotions: {
        Row: {
          code: string | null
          ends_at: string | null
          id: string
          is_active: boolean
          kind: string
          min_total: number
          name: string
          starts_at: string | null
          value: number
        }
        Insert: {
          code?: string | null
          ends_at?: string | null
          id?: string
          is_active?: boolean
          kind: string
          min_total?: number
          name: string
          starts_at?: string | null
          value: number
        }
        Update: {
          code?: string | null
          ends_at?: string | null
          id?: string
          is_active?: boolean
          kind?: string
          min_total?: number
          name?: string
          starts_at?: string | null
          value?: number
        }
        Relationships: []
      }
      queue_tickets: {
        Row: {
          called_at: string | null
          claim_token: string
          contact_name: string | null
          contact_phone: string | null
          created_at: string
          id: string
          note: string | null
          party_size: number
          seated_at: string | null
          service_date: string
          status: Database["public"]["Enums"]["queue_status"]
          ticket_no: string
        }
        Insert: {
          called_at?: string | null
          claim_token?: string
          contact_name?: string | null
          contact_phone?: string | null
          created_at?: string
          id?: string
          note?: string | null
          party_size: number
          seated_at?: string | null
          service_date?: string
          status?: Database["public"]["Enums"]["queue_status"]
          ticket_no: string
        }
        Update: {
          called_at?: string | null
          claim_token?: string
          contact_name?: string | null
          contact_phone?: string | null
          created_at?: string
          id?: string
          note?: string | null
          party_size?: number
          seated_at?: string | null
          service_date?: string
          status?: Database["public"]["Enums"]["queue_status"]
          ticket_no?: string
        }
        Relationships: []
      }
      service_calls: {
        Row: {
          accepted_at: string | null
          accepted_by: string | null
          created_at: string
          done_at: string | null
          id: string
          note: string | null
          status: Database["public"]["Enums"]["service_call_status"]
          table_id: string | null
          type: Database["public"]["Enums"]["service_call_type"]
          visit_id: string
        }
        Insert: {
          accepted_at?: string | null
          accepted_by?: string | null
          created_at?: string
          done_at?: string | null
          id?: string
          note?: string | null
          status?: Database["public"]["Enums"]["service_call_status"]
          table_id?: string | null
          type?: Database["public"]["Enums"]["service_call_type"]
          visit_id: string
        }
        Update: {
          accepted_at?: string | null
          accepted_by?: string | null
          created_at?: string
          done_at?: string | null
          id?: string
          note?: string | null
          status?: Database["public"]["Enums"]["service_call_status"]
          table_id?: string | null
          type?: Database["public"]["Enums"]["service_call_type"]
          visit_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "service_calls_accepted_by_fkey"
            columns: ["accepted_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "service_calls_table_id_fkey"
            columns: ["table_id"]
            isOneToOne: false
            referencedRelation: "dining_tables"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "service_calls_visit_id_fkey"
            columns: ["visit_id"]
            isOneToOne: false
            referencedRelation: "visits"
            referencedColumns: ["id"]
          },
        ]
      }
      visit_guests: {
        Row: {
          guest_id: string
          joined_at: string
          visit_id: string
        }
        Insert: {
          guest_id: string
          joined_at?: string
          visit_id: string
        }
        Update: {
          guest_id?: string
          joined_at?: string
          visit_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "visit_guests_visit_id_fkey"
            columns: ["visit_id"]
            isOneToOne: false
            referencedRelation: "visits"
            referencedColumns: ["id"]
          },
        ]
      }
      visits: {
        Row: {
          access_token: string
          adults: number
          children: number
          closed_at: string | null
          closed_by: string | null
          code: string
          expires_at: string | null
          id: string
          member_id: string | null
          note: string | null
          opened_at: string
          opened_by: string | null
          package_id: string | null
          queue_ticket_id: string | null
          status: Database["public"]["Enums"]["visit_status"]
          table_id: string | null
        }
        Insert: {
          access_token?: string
          adults?: number
          children?: number
          closed_at?: string | null
          closed_by?: string | null
          code: string
          expires_at?: string | null
          id?: string
          member_id?: string | null
          note?: string | null
          opened_at?: string
          opened_by?: string | null
          package_id?: string | null
          queue_ticket_id?: string | null
          status?: Database["public"]["Enums"]["visit_status"]
          table_id?: string | null
        }
        Update: {
          access_token?: string
          adults?: number
          children?: number
          closed_at?: string | null
          closed_by?: string | null
          code?: string
          expires_at?: string | null
          id?: string
          member_id?: string | null
          note?: string | null
          opened_at?: string
          opened_by?: string | null
          package_id?: string | null
          queue_ticket_id?: string | null
          status?: Database["public"]["Enums"]["visit_status"]
          table_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "visits_closed_by_fkey"
            columns: ["closed_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "visits_member_id_fkey"
            columns: ["member_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "visits_opened_by_fkey"
            columns: ["opened_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "visits_package_id_fkey"
            columns: ["package_id"]
            isOneToOne: false
            referencedRelation: "buffet_packages"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "visits_queue_ticket_id_fkey"
            columns: ["queue_ticket_id"]
            isOneToOne: false
            referencedRelation: "queue_tickets"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "visits_table_id_fkey"
            columns: ["table_id"]
            isOneToOne: false
            referencedRelation: "dining_tables"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      call_staff: {
        Args: {
          p_note?: string
          p_type?: Database["public"]["Enums"]["service_call_type"]
          p_visit_id: string
        }
        Returns: {
          accepted_at: string | null
          accepted_by: string | null
          created_at: string
          done_at: string | null
          id: string
          note: string | null
          status: Database["public"]["Enums"]["service_call_status"]
          table_id: string | null
          type: Database["public"]["Enums"]["service_call_type"]
          visit_id: string
        }
        SetofOptions: {
          from: "*"
          to: "service_calls"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      close_visit: {
        Args: { p_visit_id: string }
        Returns: {
          access_token: string
          adults: number
          children: number
          closed_at: string | null
          closed_by: string | null
          code: string
          expires_at: string | null
          id: string
          member_id: string | null
          note: string | null
          opened_at: string
          opened_by: string | null
          package_id: string | null
          queue_ticket_id: string | null
          status: Database["public"]["Enums"]["visit_status"]
          table_id: string | null
        }
        SetofOptions: {
          from: "*"
          to: "visits"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      has_visit_access: { Args: { p_visit: string }; Returns: boolean }
      is_manager: { Args: never; Returns: boolean }
      is_staff: { Args: never; Returns: boolean }
      issue_bill: {
        Args: { p_visit_id: string }
        Returns: {
          discount: number
          id: string
          issued_at: string
          issued_by: string | null
          promotion_id: string | null
          service_charge: number
          status: Database["public"]["Enums"]["payment_status"]
          subtotal: number
          total: number
          vat: number
          visit_id: string
        }
        SetofOptions: {
          from: "*"
          to: "bills"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      join_visit: {
        Args: { p_token: string }
        Returns: {
          access_token: string
          adults: number
          children: number
          closed_at: string | null
          closed_by: string | null
          code: string
          expires_at: string | null
          id: string
          member_id: string | null
          note: string | null
          opened_at: string
          opened_by: string | null
          package_id: string | null
          queue_ticket_id: string | null
          status: Database["public"]["Enums"]["visit_status"]
          table_id: string | null
        }
        SetofOptions: {
          from: "*"
          to: "visits"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      my_role: { Args: never; Returns: Database["public"]["Enums"]["app_role"] }
      next_ticket_no: { Args: never; Returns: string }
      next_visit_code: { Args: never; Returns: string }
      open_visit: {
        Args: {
          p_adults: number
          p_children?: number
          p_package_id: string
          p_table_id: string
          p_ticket_id?: string
        }
        Returns: {
          access_token: string
          adults: number
          children: number
          closed_at: string | null
          closed_by: string | null
          code: string
          expires_at: string | null
          id: string
          member_id: string | null
          note: string | null
          opened_at: string
          opened_by: string | null
          package_id: string | null
          queue_ticket_id: string | null
          status: Database["public"]["Enums"]["visit_status"]
          table_id: string | null
        }
        SetofOptions: {
          from: "*"
          to: "visits"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      pay_bill: {
        Args: {
          p_amount: number
          p_bill_id: string
          p_method: Database["public"]["Enums"]["payment_method"]
          p_ref?: string
        }
        Returns: {
          amount: number
          bill_id: string
          created_at: string
          id: string
          method: Database["public"]["Enums"]["payment_method"]
          paid_at: string | null
          received_by: string | null
          ref_no: string | null
          status: Database["public"]["Enums"]["payment_status"]
        }
        SetofOptions: {
          from: "*"
          to: "payments"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      place_order: {
        Args: { p_items: Json; p_note?: string; p_visit_id: string }
        Returns: {
          created_at: string
          id: string
          note: string | null
          placed_by: string | null
          round_no: number
          status: Database["public"]["Enums"]["order_status"]
          updated_at: string
          visit_id: string
        }
        SetofOptions: {
          from: "*"
          to: "orders"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      queue_board: {
        Args: never
        Returns: {
          created_at: string
          id: string
          party_size: number
          status: Database["public"]["Enums"]["queue_status"]
          ticket_no: string
        }[]
      }
      queue_ticket_by_token: {
        Args: { p_token: string }
        Returns: {
          ahead_count: number
          called_at: string
          created_at: string
          id: string
          party_size: number
          status: Database["public"]["Enums"]["queue_status"]
          ticket_no: string
        }[]
      }
      set_order_item_status: {
        Args: {
          p_item_id: string
          p_status: Database["public"]["Enums"]["order_status"]
        }
        Returns: {
          created_at: string
          id: string
          menu_item_id: string | null
          name_snapshot: string
          note: string | null
          order_id: string
          qty: number
          station: Database["public"]["Enums"]["prep_station"]
          status: Database["public"]["Enums"]["order_status"]
          unit_price: number
          updated_at: string
        }
        SetofOptions: {
          from: "*"
          to: "order_items"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      staff_dashboard: {
        Args: never
        Returns: {
          dining_visits: number
          free_tables: number
          open_calls: number
          pending_items: number
          sales_today: number
          waiting_queue: number
        }[]
      }
      take_queue_ticket: {
        Args: { p_name?: string; p_party_size: number; p_phone?: string }
        Returns: {
          called_at: string | null
          claim_token: string
          contact_name: string | null
          contact_phone: string | null
          created_at: string
          id: string
          note: string | null
          party_size: number
          seated_at: string | null
          service_date: string
          status: Database["public"]["Enums"]["queue_status"]
          ticket_no: string
        }
        SetofOptions: {
          from: "*"
          to: "queue_tickets"
          isOneToOne: true
          isSetofReturn: false
        }
      }
    }
    Enums: {
      app_role:
        | "customer"
        | "kitchen"
        | "staff"
        | "cashier"
        | "manager"
        | "owner"
      menu_kind: "buffet" | "a_la_carte" | "addon" | "drink"
      order_status:
        | "pending"
        | "accepted"
        | "preparing"
        | "ready"
        | "served"
        | "cancelled"
      payment_method: "cash" | "promptpay" | "card" | "transfer"
      payment_status: "pending" | "paid" | "failed" | "refunded"
      point_txn_kind: "earn" | "redeem" | "adjust"
      prep_station: "kitchen" | "grill" | "drink" | "dessert"
      queue_status: "waiting" | "called" | "seated" | "cancelled" | "no_show"
      service_call_status: "open" | "accepted" | "done" | "cancelled"
      service_call_type:
        | "staff"
        | "water"
        | "utensils"
        | "charcoal"
        | "bill"
        | "problem"
      table_status:
        | "available"
        | "reserved"
        | "occupied"
        | "billing"
        | "cleaning"
      visit_status: "open" | "billing" | "paid" | "closed" | "cancelled"
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
      app_role: ["customer", "kitchen", "staff", "cashier", "manager", "owner"],
      menu_kind: ["buffet", "a_la_carte", "addon", "drink"],
      order_status: [
        "pending",
        "accepted",
        "preparing",
        "ready",
        "served",
        "cancelled",
      ],
      payment_method: ["cash", "promptpay", "card", "transfer"],
      payment_status: ["pending", "paid", "failed", "refunded"],
      point_txn_kind: ["earn", "redeem", "adjust"],
      prep_station: ["kitchen", "grill", "drink", "dessert"],
      queue_status: ["waiting", "called", "seated", "cancelled", "no_show"],
      service_call_status: ["open", "accepted", "done", "cancelled"],
      service_call_type: [
        "staff",
        "water",
        "utensils",
        "charcoal",
        "bill",
        "problem",
      ],
      table_status: [
        "available",
        "reserved",
        "occupied",
        "billing",
        "cleaning",
      ],
      visit_status: ["open", "billing", "paid", "closed", "cancelled"],
    },
  },
} as const
