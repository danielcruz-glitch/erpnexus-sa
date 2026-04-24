export type Role = "admin" | "support" | "client_admin" | "user";
export type TicketStatus =
  | "New"
  | "In Progress"
  | "Waiting on User"
  | "Resolved"
  | "Pending Invoicing Approval"
  | "Pending Invoicing"
  | "Invoiced";
export type TicketPriority = "Low" | "Medium" | "High" | "Urgent";
export type InvoiceStatus = "Draft" | "Sent" | "Paid" | "Void";
export type WorkLogApprovalStatus = "Pending Approval" | "Approved" | "Rejected";

export type Database = {
  public: {
    Tables: {
      companies: {
        Row: {
          id: string;
          name: string;
          is_main_account: boolean;
          is_active: boolean;
          billing_name: string | null;
          billing_contact_name: string | null;
          billing_address_line_1: string | null;
          billing_address_line_2: string | null;
          billing_city: string | null;
          billing_state: string | null;
          billing_zip: string | null;
          billing_email: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          is_main_account?: boolean;
          is_active?: boolean;
          billing_name?: string | null;
          billing_contact_name?: string | null;
          billing_address_line_1?: string | null;
          billing_address_line_2?: string | null;
          billing_city?: string | null;
          billing_state?: string | null;
          billing_zip?: string | null;
          billing_email?: string | null;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["companies"]["Insert"]>;
      };
      profiles: {
        Row: {
          id: string;
          email: string | null;
          full_name: string | null;
          role: Role;
          company_id: string | null;
          is_active: boolean;
          created_at: string;
        };
        Insert: {
          id: string;
          email?: string | null;
          full_name?: string | null;
          role?: Role;
          company_id?: string | null;
          is_active?: boolean;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["profiles"]["Insert"]>;
      };
      tickets: {
        Row: {
          id: string;
          ticket_number: string;
          user_id: string;
          company_id: string | null;
          assigned_company_id: string | null;
          assigned_to_user_id: string | null;
          title: string;
          description: string;
          priority: TicketPriority;
          status: TicketStatus;
          invoice_approval_status: "Not Needed" | "Pending Approval" | "Pending Invoicing" | "Invoiced";
          resolution_note: string | null;
          work_completed_on: string | null;
          invoice_id: string | null;
          approved_by: string | null;
          approved_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          ticket_number: string;
          user_id: string;
          company_id?: string | null;
          assigned_company_id?: string | null;
          assigned_to_user_id?: string | null;
          title: string;
          description: string;
          priority?: TicketPriority;
          status?: TicketStatus;
          invoice_approval_status?: "Not Needed" | "Pending Approval" | "Pending Invoicing" | "Invoiced";
          resolution_note?: string | null;
          work_completed_on?: string | null;
          invoice_id?: string | null;
          approved_by?: string | null;
          approved_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["tickets"]["Insert"]>;
      };
      work_logs: {
        Row: {
          id: string;
          ticket_id: string;
          user_id: string;
          work_date: string;
          work_completed_on: string | null;
          notes: string;
          invoice_line_description: string | null;
          hours_worked: number;
          billable: boolean;
          approval_status: WorkLogApprovalStatus;
          invoice_id: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          ticket_id: string;
          user_id: string;
          work_date: string;
          work_completed_on?: string | null;
          notes: string;
          invoice_line_description?: string | null;
          hours_worked?: number;
          billable?: boolean;
          approval_status?: WorkLogApprovalStatus;
          invoice_id?: string | null;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["work_logs"]["Insert"]>;
      };
      invoices: {
        Row: {
          id: string;
          invoice_number: string;
          company_id: string | null;
          main_account_company_id: string | null;
          status: InvoiceStatus;
          due_date: string | null;
          payment_terms_label: string | null;
          remit_to_name: string | null;
          remit_to_company_name: string | null;
          remit_to_address_line_1: string | null;
          remit_to_address_line_2: string | null;
          remit_to_city: string | null;
          remit_to_state: string | null;
          remit_to_zip: string | null;
          notes: string | null;
          subtotal: number;
          tax_amount: number;
          total_amount: number;
          approved_by: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          invoice_number: string;
          company_id?: string | null;
          main_account_company_id?: string | null;
          status?: InvoiceStatus;
          due_date?: string | null;
          payment_terms_label?: string | null;
          remit_to_name?: string | null;
          remit_to_company_name?: string | null;
          remit_to_address_line_1?: string | null;
          remit_to_address_line_2?: string | null;
          remit_to_city?: string | null;
          remit_to_state?: string | null;
          remit_to_zip?: string | null;
          notes?: string | null;
          subtotal?: number;
          tax_amount?: number;
          total_amount?: number;
          approved_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["invoices"]["Insert"]>;
      };
      invoice_items: {
        Row: {
          id: string;
          invoice_id: string;
          work_log_id: string | null;
          work_completed_on: string | null;
          description: string;
          hours: number;
          rate: number;
          amount: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          invoice_id: string;
          work_log_id?: string | null;
          work_completed_on?: string | null;
          description: string;
          hours?: number;
          rate?: number;
          amount?: number;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["invoice_items"]["Insert"]>;
      };
      invoice_settings: {
        Row: {
          id: string;
          company_id: string;
          pay_to_name: string | null;
          pay_to_company_name: string | null;
          pay_to_address_line_1: string | null;
          pay_to_address_line_2: string | null;
          pay_to_city: string | null;
          pay_to_state: string | null;
          pay_to_zip: string | null;
          default_payment_terms_days: number;
          default_payment_terms_label: string;
          created_at: string;
          updated_at: string;
          updated_by: string | null;
        };
        Insert: {
          id?: string;
          company_id: string;
          pay_to_name?: string | null;
          pay_to_company_name?: string | null;
          pay_to_address_line_1?: string | null;
          pay_to_address_line_2?: string | null;
          pay_to_city?: string | null;
          pay_to_state?: string | null;
          pay_to_zip?: string | null;
          default_payment_terms_days?: number;
          default_payment_terms_label?: string;
          created_at?: string;
          updated_at?: string;
          updated_by?: string | null;
        };
        Update: Partial<Database["public"]["Tables"]["invoice_settings"]["Insert"]>;
      };
    };
  };
};

export type CompanyRow = Database["public"]["Tables"]["companies"]["Row"];
export type ProfileRow = Database["public"]["Tables"]["profiles"]["Row"];
export type TicketRow = Database["public"]["Tables"]["tickets"]["Row"];
export type WorkLogRow = Database["public"]["Tables"]["work_logs"]["Row"];
export type InvoiceRow = Database["public"]["Tables"]["invoices"]["Row"];
export type InvoiceItemRow = Database["public"]["Tables"]["invoice_items"]["Row"];
export type InvoiceSettingsRow = Database["public"]["Tables"]["invoice_settings"]["Row"];

export type CompanyRelation = Pick<CompanyRow, "id" | "name">;
export type CompanyBillingRelation = Pick<
  CompanyRow,
  | "id"
  | "name"
  | "billing_name"
  | "billing_address_line_1"
  | "billing_address_line_2"
  | "billing_city"
  | "billing_state"
  | "billing_zip"
>;
export type ProfileRelation = Pick<ProfileRow, "id" | "full_name" | "email" | "role" | "company_id">;

export type TicketListItem = Pick<
  TicketRow,
  "id" | "ticket_number" | "title" | "status" | "created_at" | "priority"
> & {
  companies: CompanyRelation[] | null;
};

export type TicketDetail = TicketRow & {
  companies: CompanyRelation[] | null;
  profiles: Pick<ProfileRow, "full_name">[] | null;
};

export type InvoiceListItem = Pick<
  InvoiceRow,
  "id" | "invoice_number" | "status" | "total_amount" | "created_at" | "due_date"
> & {
  companies: CompanyRelation[] | null;
};

export type InvoiceDetail = InvoiceRow & {
  companies: CompanyBillingRelation[] | null;
};

export type UserListItem = Pick<ProfileRow, "id" | "full_name" | "email" | "role" | "is_active"> & {
  companies: CompanyRelation[] | null;
};
