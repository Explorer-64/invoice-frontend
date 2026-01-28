/**
 * BillingRateResponse
 * Response model for a billing rate.
 */
export interface BillingRateResponse {
  /** Id */
  id: string;
  /** Client Id */
  client_id: string;
  /** Rate Type */
  rate_type: string;
  /** Amount */
  amount: string;
  /** Currency */
  currency: string;
  /** Is Default */
  is_default: boolean;
  /**
   * Created At
   * @format date-time
   */
  created_at: string;
  /**
   * Updated At
   * @format date-time
   */
  updated_at: string;
}

/** BusinessProfile */
export interface BusinessProfile {
  /** Company Name */
  company_name?: string | null;
  /** Address */
  address?: string | null;
  /** Email */
  email?: string | null;
  /** Phone */
  phone?: string | null;
  /** Website */
  website?: string | null;
  /** Tax Id */
  tax_id?: string | null;
  /** Logo Url */
  logo_url?: string | null;
}

/** CalendarEvent */
export interface CalendarEvent {
  /** Id */
  id: string;
  /** Summary */
  summary: string;
  /** Description */
  description?: string | null;
  /**
   * Start
   * @format date-time
   */
  start: string;
  /**
   * End
   * @format date-time
   */
  end: string;
  /** Duration Hours */
  duration_hours: number;
  /** Location */
  location?: string | null;
  /** Calendar Name */
  calendar_name: string;
  /** Source */
  source: string;
}

/** CalendarInfo */
export interface CalendarInfo {
  /** Id */
  id: string;
  /** Name */
  name: string;
  /** Source */
  source: string;
  /** Color */
  color?: string | null;
  /**
   * Primary
   * @default false
   */
  primary?: boolean;
}

/** CalendarListResponse */
export interface CalendarListResponse {
  /** Calendars */
  calendars: CalendarInfo[];
}

/**
 * ChatRequest
 * Request to send a message to the assistant.
 */
export interface ChatRequest {
  /** Message */
  message: string;
  /**
   * Conversation History
   * @default []
   */
  conversation_history?: Message[];
  /** Nearby Clients */
  nearby_clients?: Record<string, any>[] | null;
  /** Scenario Description */
  scenario_description?: string | null;
}

/**
 * ChatResponse
 * Response from the assistant.
 */
export interface ChatResponse {
  /** Message */
  message: string;
  /** Conversation History */
  conversation_history: Message[];
  /** Suggested Actions */
  suggested_actions?: string[] | null;
  /** Metadata */
  metadata?: Record<string, any> | null;
}

/**
 * ClientInvoiceColumn
 * Custom column definition for a client
 */
export interface ClientInvoiceColumn {
  /** Id */
  id?: number | null;
  /** Client Id */
  client_id: string;
  /** Column Name */
  column_name: string;
  /** Column Label */
  column_label: string;
  /**
   * Column Order
   * @default 0
   */
  column_order?: number;
  /**
   * Is Active
   * @default true
   */
  is_active?: boolean;
}

/**
 * ClientResponse
 * Response model for a single client.
 */
export interface ClientResponse {
  /** Id */
  id: string;
  /** Name */
  name: string;
  /** Email */
  email: string | null;
  /** Phone */
  phone: string | null;
  /** Address */
  address: string | null;
  /** Latitude */
  latitude: number | null;
  /** Longitude */
  longitude: number | null;
  /** Radius */
  radius: number | null;
  /**
   * Created At
   * @format date-time
   */
  created_at: string;
  /**
   * Updated At
   * @format date-time
   */
  updated_at: string;
  /**
   * Invoice Template Type
   * @default "standard"
   */
  invoice_template_type?: string;
}

/**
 * ClientWithRatesResponse
 * Response model for a client with their billing rates.
 */
export interface ClientWithRatesResponse {
  /** Response model for a single client. */
  client: ClientResponse;
  /** Rates */
  rates: BillingRateResponse[];
}

/**
 * CreateBillingRateRequest
 * Request model for creating a billing rate.
 */
export interface CreateBillingRateRequest {
  /**
   * Rate Type
   * @pattern ^(hourly|daily|piece|fixed|travel)$
   */
  rate_type: string;
  /** Amount */
  amount: number | string;
  /**
   * Currency
   * @minLength 3
   * @maxLength 3
   * @default "USD"
   */
  currency?: string;
  /**
   * Is Default
   * @default true
   */
  is_default?: boolean;
}

/**
 * CreateClientRequest
 * Request model for creating a new client.
 */
export interface CreateClientRequest {
  /**
   * Name
   * @minLength 1
   * @maxLength 255
   */
  name: string;
  /** Email */
  email?: string | null;
  /** Phone */
  phone?: string | null;
  /** Address */
  address?: string | null;
  /** Latitude */
  latitude?: number | null;
  /** Longitude */
  longitude?: number | null;
  /**
   * Radius
   * @default 200
   */
  radius?: number | null;
  /** Default Rate Type */
  default_rate_type?: string | null;
  /** Default Rate Amount */
  default_rate_amount?: number | string | null;
  /**
   * Default Rate Currency
   * @minLength 3
   * @maxLength 3
   * @default "USD"
   */
  default_rate_currency?: string;
  /**
   * Invoice Template Type
   * @default "standard"
   * @pattern ^(standard|legal|creative|trades)$
   */
  invoice_template_type?: string;
}

/**
 * CreateFeedbackRequest
 * Request to submit feedback.
 */
export interface CreateFeedbackRequest {
  /**
   * Type
   * @pattern ^(bug|feature|general)$
   */
  type: string;
  /**
   * Message
   * @minLength 5
   */
  message: string;
}

/**
 * CreateInvoiceRequest
 * Request to create a new invoice
 */
export interface CreateInvoiceRequest {
  /** Client Id */
  client_id: string;
  /** Client Name */
  client_name: string;
  /** Client Email */
  client_email?: string | null;
  /** Session Ids */
  session_ids: number[];
  /**
   * Manual Items
   * @default []
   */
  manual_items?: ManualInvoiceItem[];
  /** Invoice Date */
  invoice_date?: string | null;
  /** Due Date */
  due_date?: string | null;
  /**
   * Tax Rate
   * @default 0
   */
  tax_rate?: number;
  /** Notes */
  notes?: string | null;
  /**
   * Custom Columns
   * @default []
   */
  custom_columns?: string[];
  /**
   * Item Custom Fields
   * @default {}
   */
  item_custom_fields?: Record<string, Record<string, string>>;
  /**
   * Template Type
   * @default "standard"
   */
  template_type?: string;
  /** Linked Packing Slip Id */
  linked_packing_slip_id?: string | null;
  /** Linked Packing Slip Number */
  linked_packing_slip_number?: string | null;
}

/** CreateTaskRequest */
export interface CreateTaskRequest {
  /**
   * Title
   * @minLength 1
   */
  title: string;
  /** Description */
  description?: string | null;
  /**
   * Type
   * @default "manual"
   * @pattern ^(auto|manual)$
   */
  type?: string;
  /** Entity Type */
  entity_type?: string | null;
  /** Entity Id */
  entity_id?: number | null;
  /** Due Date */
  due_date?: string | null;
}

/** DashboardInvoice */
export interface DashboardInvoice {
  /** Id */
  id: number;
  /** Invoice Number */
  invoice_number: string;
  /** Client Name */
  client_name: string;
  /** Total */
  total: number;
  /** Status */
  status: string;
  /**
   * Date
   * @format date
   */
  date: string;
}

/** DashboardStats */
export interface DashboardStats {
  /** Hours This Week */
  hours_this_week: number;
  /** Earnings */
  earnings: number;
  /** Invoices Count */
  invoices_count: number;
  /** Recent Invoices */
  recent_invoices: DashboardInvoice[];
}

/** DeleteAccountResponse */
export interface DeleteAccountResponse {
  /** Message */
  message: string;
  /** Deleted Records */
  deleted_records: Record<string, any>;
}

/**
 * DeleteBillingRateResponse
 * Response model for deleting a billing rate.
 */
export interface DeleteBillingRateResponse {
  /** Message */
  message: string;
  /** Rate Id */
  rate_id: string;
}

/**
 * EndSessionRequest
 * Request to end an active work session.
 */
export interface EndSessionRequest {
  /** Notes */
  notes?: string | null;
}

/**
 * FeedbackResponse
 * Response model for submitted feedback.
 */
export interface FeedbackResponse {
  /** Id */
  id: string;
  /** User Id */
  user_id: string;
  /** Type */
  type: string;
  /** Message */
  message: string;
  /**
   * Created At
   * @format date-time
   */
  created_at: string;
  /** Resolved */
  resolved: boolean;
}

/** FetchEventsRequest */
export interface FetchEventsRequest {
  /**
   * Calendar Ids
   * @default []
   */
  calendar_ids?: string[];
  /** Start Date */
  start_date: string;
  /** End Date */
  end_date: string;
}

/** FetchEventsResponse */
export interface FetchEventsResponse {
  /** Events */
  events: CalendarEvent[];
}

/** HTTPValidationError */
export interface HTTPValidationError {
  /** Detail */
  detail?: ValidationError[];
}

/** HealthResponse */
export interface HealthResponse {
  /** Status */
  status: string;
}

/** ICloudCredentialsRequest */
export interface ICloudCredentialsRequest {
  /** Apple Id */
  apple_id: string;
  /** App Specific Password */
  app_specific_password: string;
}

/** ICloudStatus */
export interface ICloudStatus {
  /** Connected */
  connected: boolean;
  /** Apple Id */
  apple_id?: string | null;
}

/**
 * Invoice
 * Invoice response model
 */
export interface Invoice {
  /** Id */
  id: number;
  /** Invoice Number */
  invoice_number: string;
  /** Client Id */
  client_id: string;
  /** Client Name */
  client_name: string;
  /**
   * Invoice Date
   * @format date
   */
  invoice_date: string;
  /** Due Date */
  due_date: string | null;
  /** Subtotal */
  subtotal: number;
  /** Tax Rate */
  tax_rate: number;
  /** Tax Amount */
  tax_amount: number;
  /** Total */
  total: number;
  /** Status */
  status: string;
  /** Notes */
  notes: string | null;
  /** Items */
  items: InvoiceItem[];
  /**
   * Created At
   * @format date-time
   */
  created_at: string;
  /**
   * Template Type
   * @default "standard"
   */
  template_type?: string;
  /** Share Token */
  share_token?: string | null;
  /** Linked Packing Slip Id */
  linked_packing_slip_id?: string | null;
  /** Linked Packing Slip Number */
  linked_packing_slip_number?: string | null;
}

/** InvoiceDeleteResponse */
export interface InvoiceDeleteResponse {
  /** Message */
  message: string;
  /** Invoice Id */
  invoice_id: number;
}

/**
 * InvoiceItem
 * Single item on an invoice
 */
export interface InvoiceItem {
  /** Session Id */
  session_id: number | null;
  /** Description */
  description: string;
  /** Hours */
  hours: number;
  /** Rate */
  rate: number;
  /** Amount */
  amount: number;
  /**
   * Custom Fields
   * @default {}
   */
  custom_fields?: Record<string, string>;
}

/**
 * InvoiceListItem
 * Simplified invoice for list views
 */
export interface InvoiceListItem {
  /** Id */
  id: number;
  /** Invoice Number */
  invoice_number: string;
  /** Client Id */
  client_id: string;
  /** Client Name */
  client_name: string;
  /**
   * Invoice Date
   * @format date
   */
  invoice_date: string;
  /** Total */
  total: number;
  /** Status */
  status: string;
  /**
   * Created At
   * @format date-time
   */
  created_at: string;
  /** Share Token */
  share_token?: string | null;
  /** Linked Packing Slip Number */
  linked_packing_slip_number?: string | null;
}

/**
 * ListUninvoicedSlipsResponse
 * Response containing list of uninvoiced packing slips.
 */
export interface ListUninvoicedSlipsResponse {
  /** Slips */
  slips: PackingSlipSummary[];
}

/**
 * ManualInvoiceItem
 * Manual item to add to invoice
 */
export interface ManualInvoiceItem {
  /** Description */
  description: string;
  /** Quantity */
  quantity: number;
  /** Unit Price */
  unit_price: number;
  /** Amount */
  amount: number;
  /**
   * Custom Fields
   * @default {}
   */
  custom_fields?: Record<string, string>;
}

/**
 * Message
 * A single message in the conversation.
 */
export interface Message {
  /**
   * Role
   * @pattern ^(user|assistant|system)$
   */
  role: string;
  /** Content */
  content: string;
  /** Timestamp */
  timestamp?: string | null;
}

/**
 * OAuthStatus
 * OAuth connection status
 */
export interface OAuthStatus {
  /** Connected */
  connected: boolean;
  /** Email */
  email?: string | null;
}

/**
 * PackingSlipDetail
 * Detailed packing slip data for invoice creation.
 */
export interface PackingSlipDetail {
  /** Slip Id */
  slip_id: string;
  /** Slip Number */
  slip_number: string;
  /** Client Id */
  client_id: string;
  /** Client Name */
  client_name: string;
  /** Client Email */
  client_email: string;
  /** Client Address */
  client_address: string;
  /** Date */
  date: string | null;
  /** Items */
  items: Record<string, any>[];
}

/**
 * PackingSlipSummary
 * Summary of a packing slip for display in picker.
 */
export interface PackingSlipSummary {
  /** Id */
  id: string;
  /**
   * Slip Number
   * @default "N/A"
   */
  slip_number?: string;
  /** Customer Name */
  customer_name: string;
  /** Created At */
  created_at: string | null;
  /** Item Count */
  item_count: number;
}

/**
 * PlanIdResponse
 * Response with the configured plan ID.
 */
export interface PlanIdResponse {
  /** Plans */
  plans: Record<string, string>;
  /** Paypal Client Id */
  paypal_client_id: string | null;
}

/**
 * RateCheckRequest
 * Request to check market rates.
 */
export interface RateCheckRequest {
  /** Trade */
  trade: string;
  /** Location */
  location: string;
  /** Experience Level */
  experience_level: string;
  /** Years Experience */
  years_experience?: number | null;
  /** Current Rate */
  current_rate: number;
  /**
   * Currency
   * @default "USD"
   */
  currency?: string;
  /** Scenario Description */
  scenario_description?: string | null;
}

/**
 * RateCheckResponse
 * Response with market rate analysis.
 */
export interface RateCheckResponse {
  /** Market Low */
  market_low: number;
  /** Market High */
  market_high: number;
  /** Market Average */
  market_average: number;
  /** Recommendation */
  recommendation: string;
  /** Reasoning */
  reasoning: string;
  /** Suggested Daily Rate */
  suggested_daily_rate?: number | null;
  /** Suggested Travel Rate */
  suggested_travel_rate?: number | null;
  /** Rate Structure Advice */
  rate_structure_advice?: string | null;
  /**
   * Suggested Rates
   * @default []
   */
  suggested_rates?: SuggestedRate[];
}

/** RestoreClientResponse */
export interface RestoreClientResponse {
  /** Message */
  message: string;
  /** Response model for a single client. */
  client: ClientResponse;
}

/** RestoreSessionResponse */
export interface RestoreSessionResponse {
  /** Message */
  message: string;
  /** Response model for a work session. */
  session: WorkSessionResponse;
}

/**
 * SessionBreakResponse
 * Response model for a session break.
 */
export interface SessionBreakResponse {
  /** Id */
  id: number;
  /** Session Id */
  session_id: number;
  /**
   * Start Time
   * @format date-time
   */
  start_time: string;
  /** End Time */
  end_time: string | null;
  /** Duration Minutes */
  duration_minutes: number | null;
  /** Break Type */
  break_type: string;
  /**
   * Created At
   * @format date-time
   */
  created_at: string;
}

/**
 * SetupPlanRequest
 * Request to setup a plan product in PayPal.
 */
export interface SetupPlanRequest {
  /**
   * Tier Key
   * @pattern ^(starter|pro|unlimited)$
   */
  tier_key: string;
  /** Product Name */
  product_name: string;
  /** Product Description */
  product_description: string;
  /** Plan Name */
  plan_name: string;
  /** Plan Description */
  plan_description: string;
  /** Price Monthly */
  price_monthly: string;
}

/**
 * SetupPlanResponse
 * Response with created plan ID.
 */
export interface SetupPlanResponse {
  /** Plan Id */
  plan_id: string;
  /** Product Id */
  product_id: string;
  /** Tier Key */
  tier_key: string;
}

/**
 * StartBreakRequest
 * Request to start a break during a session.
 */
export interface StartBreakRequest {
  /**
   * Break Type
   * @default "manual"
   * @pattern ^(manual|voice|auto)$
   */
  break_type?: string;
}

/**
 * StartSessionRequest
 * Request to start a new work session.
 */
export interface StartSessionRequest {
  /** Client Id */
  client_id: string;
  /** Start Time */
  start_time?: string | null;
  /** End Time */
  end_time?: string | null;
  /** Location Name */
  location_name?: string | null;
  /** Location Lat */
  location_lat?: number | string | null;
  /** Location Lng */
  location_lng?: number | string | null;
  /** Notes */
  notes?: string | null;
  /**
   * Session Type
   * @default "manual"
   * @pattern ^(manual|voice|auto|calendar)$
   */
  session_type?: string;
}

/**
 * SubscriptionStatusResponse
 * Response model for subscription status.
 */
export interface SubscriptionStatusResponse {
  /** Is Active */
  is_active: boolean;
  /** Plan */
  plan: string;
  /** Status */
  status: string;
  /** Expires At */
  expires_at?: string | null;
  /** Paypal Subscription Id */
  paypal_subscription_id?: string | null;
  /** Features */
  features: Record<string, any>;
}

/**
 * SuggestedRate
 * A specific rate component suggested by the advisor.
 */
export interface SuggestedRate {
  /** Name */
  name: string;
  /** Rate Type */
  rate_type: string;
  /** Amount */
  amount: number;
  /** Description */
  description?: string | null;
}

/** SystemHealth */
export interface SystemHealth {
  /** Status */
  status: string;
  /** Issues */
  issues: string[];
  /**
   * Checked At
   * @format date-time
   */
  checked_at: string;
}

/** TaskResponse */
export interface TaskResponse {
  /** Id */
  id: number;
  /** User Id */
  user_id: string;
  /** Title */
  title: string;
  /** Description */
  description: string | null;
  /** Type */
  type: string;
  /** Status */
  status: string;
  /** Entity Type */
  entity_type: string | null;
  /** Entity Id */
  entity_id: number | null;
  /** Due Date */
  due_date: string | null;
  /**
   * Created At
   * @format date-time
   */
  created_at: string;
  /**
   * Updated At
   * @format date-time
   */
  updated_at: string;
}

/** TranslationRequest */
export interface TranslationRequest {
  /** Text */
  text: string;
  /** Target Language */
  target_language: string;
}

/** TranslationResponse */
export interface TranslationResponse {
  /** Translated Text */
  translated_text: string;
}

/**
 * UpdateBillingRateRequest
 * Request model for updating a billing rate.
 */
export interface UpdateBillingRateRequest {
  /** Rate Type */
  rate_type?: string | null;
  /** Amount */
  amount?: number | string | null;
  /** Currency */
  currency?: string | null;
  /** Is Default */
  is_default?: boolean | null;
}

/**
 * UpdateClientColumnsRequest
 * Request to update client column preferences
 */
export interface UpdateClientColumnsRequest {
  /** Columns */
  columns: ClientInvoiceColumn[];
}

/**
 * UpdateClientRequest
 * Request model for updating a client.
 */
export interface UpdateClientRequest {
  /** Name */
  name?: string | null;
  /** Email */
  email?: string | null;
  /** Phone */
  phone?: string | null;
  /** Address */
  address?: string | null;
  /** Latitude */
  latitude?: number | null;
  /** Longitude */
  longitude?: number | null;
  /** Radius */
  radius?: number | null;
  /** Invoice Template Type */
  invoice_template_type?: string | null;
}

/**
 * UpdateInvoiceRequest
 * Request to update invoice fields
 */
export interface UpdateInvoiceRequest {
  /** Invoice Date */
  invoice_date?: string | null;
  /** Due Date */
  due_date?: string | null;
}

/**
 * UpdateSessionRequest
 * Request to update session details.
 */
export interface UpdateSessionRequest {
  /** Notes */
  notes?: string | null;
  /** Start Time */
  start_time?: string | null;
  /** End Time */
  end_time?: string | null;
  /** Break Duration Minutes */
  break_duration_minutes?: number | null;
}

/** UpdateTaskRequest */
export interface UpdateTaskRequest {
  /** Title */
  title?: string | null;
  /** Description */
  description?: string | null;
  /** Status */
  status?: string | null;
  /** Due Date */
  due_date?: string | null;
}

/** ValidationError */
export interface ValidationError {
  /** Location */
  loc: (string | number)[];
  /** Message */
  msg: string;
  /** Error Type */
  type: string;
}

/** VerifySubscriptionRequest */
export interface VerifySubscriptionRequest {
  /** Subscription Id */
  subscription_id: string;
}

/**
 * WorkSessionResponse
 * Response model for a work session.
 */
export interface WorkSessionResponse {
  /** Id */
  id: number;
  /** Client Id */
  client_id: string;
  /** Client Name */
  client_name: string;
  /**
   * Start Time
   * @format date-time
   */
  start_time: string;
  /** End Time */
  end_time: string | null;
  /** Total Duration Minutes */
  total_duration_minutes: number | null;
  /** Break Duration Minutes */
  break_duration_minutes: number;
  /** Billable Duration Minutes */
  billable_duration_minutes: number | null;
  /** Location Name */
  location_name: string | null;
  /** Location Lat */
  location_lat: string | null;
  /** Location Lng */
  location_lng: string | null;
  /** Notes */
  notes: string | null;
  /** Session Type */
  session_type: string;
  /**
   * Created At
   * @format date-time
   */
  created_at: string;
  /**
   * Updated At
   * @format date-time
   */
  updated_at: string;
  /** Hourly Rate */
  hourly_rate?: number | null;
  /** Rate Currency */
  rate_currency?: string | null;
  /** Estimated Amount */
  estimated_amount?: number | null;
}

/**
 * WorkSessionWithBreaksResponse
 * Response model for a work session with breaks.
 */
export interface WorkSessionWithBreaksResponse {
  /** Response model for a work session. */
  session: WorkSessionResponse;
  /** Breaks */
  breaks: SessionBreakResponse[];
}

export type CheckHealthData = HealthResponse;

export type GetManifestData = any;

export type GetPwaConfigData = any;

export interface GetImageParams {
  /** Filename */
  filename: string;
}

export type GetImageData = any;

export type GetImageError = HTTPValidationError;

export type ListAllCalendarsData = CalendarListResponse;

export type FetchEventsData = FetchEventsResponse;

export type FetchEventsError = HTTPValidationError;

export interface ListTasksParams {
  /** Status */
  status?: string | null;
  /**
   * Limit
   * @default 50
   */
  limit?: number;
}

/** Response List Tasks */
export type ListTasksData = TaskResponse[];

export type ListTasksError = HTTPValidationError;

export type CreateTaskData = TaskResponse;

export type CreateTaskError = HTTPValidationError;

export interface UpdateTaskParams {
  /** Task Id */
  taskId: number;
}

export type UpdateTaskData = TaskResponse;

export type UpdateTaskError = HTTPValidationError;

export interface DeleteTaskParams {
  /** Task Id */
  taskId: number;
}

export type DeleteTaskData = any;

export type DeleteTaskError = HTTPValidationError;

export type GetSubscriptionStatusData = SubscriptionStatusResponse;

export type VerifySubscriptionData = SubscriptionStatusResponse;

export type VerifySubscriptionError = HTTPValidationError;

export type CancelSubscriptionData = any;

export type GetPlanIdData = PlanIdResponse;

export type SetupPlanData = SetupPlanResponse;

export type SetupPlanError = HTTPValidationError;

export type DeleteAccountDataData = DeleteAccountResponse;

export type CheckSystemHealthData = SystemHealth;

export type GetDashboardStatsData = DashboardStats;

export type ConnectIcloudData = any;

export type ConnectIcloudError = HTTPValidationError;

export type DisconnectIcloudData = any;

export type GetIcloudStatusData = ICloudStatus;

export type InitiateMicrosoftOauthData = any;

export interface MicrosoftOauthCallbackParams {
  /** Code */
  code?: string;
  /** Error */
  error?: string;
  /** State */
  state?: string;
}

export type MicrosoftOauthCallbackData = any;

export type MicrosoftOauthCallbackError = HTTPValidationError;

export type GetMicrosoftOauthStatusData = OAuthStatus;

/** Response List Feedback */
export type ListFeedbackData = FeedbackResponse[];

export type SubmitFeedbackData = FeedbackResponse;

export type SubmitFeedbackError = HTTPValidationError;

export type InitiateGoogleOauthData = any;

export interface GoogleOauthCallbackParams {
  /** Code */
  code?: string;
  /** Error */
  error?: string;
  /** State */
  state?: string;
}

export type GoogleOauthCallbackData = any;

export type GoogleOauthCallbackError = HTTPValidationError;

export type GetOauthStatusData = OAuthStatus;

export type ChatWithAssistantData = ChatResponse;

export type ChatWithAssistantError = HTTPValidationError;

export type ChatDemoData = ChatResponse;

export type ChatDemoError = HTTPValidationError;

/** Response Get Assistant Context */
export type GetAssistantContextData = Record<string, any>;

/** Response Get Demo Context */
export type GetDemoContextData = Record<string, any>;

export type CheckMarketRatesData = RateCheckResponse;

export type CheckMarketRatesError = HTTPValidationError;

export type TranslateTextData = TranslationResponse;

export type TranslateTextError = HTTPValidationError;

/** Response List Clients */
export type ListClientsData = ClientResponse[];

export type CreateClientData = ClientResponse;

export type CreateClientError = HTTPValidationError;

export interface GetClientParams {
  /** Client Id */
  clientId: string;
}

export type GetClientData = ClientWithRatesResponse;

export type GetClientError = HTTPValidationError;

export interface UpdateClientParams {
  /** Client Id */
  clientId: string;
}

export type UpdateClientData = ClientResponse;

export type UpdateClientError = HTTPValidationError;

export interface DeleteClientParams {
  /** Client Id */
  clientId: string;
}

/** Response Delete Client */
export type DeleteClientData = Record<string, any>;

export type DeleteClientError = HTTPValidationError;

export interface RestoreClientParams {
  /** Client Id */
  clientId: string;
}

export type RestoreClientData = RestoreClientResponse;

export type RestoreClientError = HTTPValidationError;

export interface GetClientRatesParams {
  /** Client Id */
  clientId: string;
}

/** Response Get Client Rates */
export type GetClientRatesData = BillingRateResponse[];

export type GetClientRatesError = HTTPValidationError;

export interface CreateBillingRateParams {
  /** Client Id */
  clientId: string;
}

export type CreateBillingRateData = BillingRateResponse;

export type CreateBillingRateError = HTTPValidationError;

export interface UpdateBillingRateParams {
  /** Client Id */
  clientId: string;
  /** Rate Id */
  rateId: string;
}

export type UpdateBillingRateData = BillingRateResponse;

export type UpdateBillingRateError = HTTPValidationError;

export interface DeleteBillingRateParams {
  /** Client Id */
  clientId: string;
  /** Rate Id */
  rateId: string;
}

export type DeleteBillingRateData = DeleteBillingRateResponse;

export type DeleteBillingRateError = HTTPValidationError;

export type StartSessionData = WorkSessionResponse;

export type StartSessionError = HTTPValidationError;

export interface EndSessionParams {
  /** Session Id */
  sessionId: number;
}

export type EndSessionData = WorkSessionResponse;

export type EndSessionError = HTTPValidationError;

/** Response Get Active Sessions */
export type GetActiveSessionsData = WorkSessionResponse[];

export interface GetRecentSessionsParams {
  /**
   * Limit
   * @default 10
   */
  limit?: number;
}

/** Response Get Recent Sessions */
export type GetRecentSessionsData = WorkSessionResponse[];

export type GetRecentSessionsError = HTTPValidationError;

export interface ListSessionsParams {
  /** Start Date */
  start_date?: string | null;
  /** End Date */
  end_date?: string | null;
  /** Client Id */
  client_id?: string | null;
}

/** Response List Sessions */
export type ListSessionsData = WorkSessionResponse[];

export type ListSessionsError = HTTPValidationError;

export interface GetSessionParams {
  /** Session Id */
  sessionId: number;
}

export type GetSessionData = WorkSessionWithBreaksResponse;

export type GetSessionError = HTTPValidationError;

export interface UpdateSessionParams {
  /** Session Id */
  sessionId: number;
}

export type UpdateSessionData = WorkSessionResponse;

export type UpdateSessionError = HTTPValidationError;

export interface DeleteSessionParams {
  /** Session Id */
  sessionId: number;
}

/** Response Delete Session */
export type DeleteSessionData = Record<string, any>;

export type DeleteSessionError = HTTPValidationError;

export interface StartBreakParams {
  /** Session Id */
  sessionId: number;
}

export type StartBreakData = SessionBreakResponse;

export type StartBreakError = HTTPValidationError;

export interface EndBreakParams {
  /** Session Id */
  sessionId: number;
}

export type EndBreakData = SessionBreakResponse;

export type EndBreakError = HTTPValidationError;

export interface RestoreSessionParams {
  /** Session Id */
  sessionId: number;
}

export type RestoreSessionData = RestoreSessionResponse;

export type RestoreSessionError = HTTPValidationError;

export type ExportSessionsCsvData = any;

export type MigrateClientsToFirestoreData = any;

export type GetBusinessProfileData = BusinessProfile;

export type UpdateBusinessProfileData = BusinessProfile;

export type UpdateBusinessProfileError = HTTPValidationError;

export type ListUninvoicedSlipsData = ListUninvoicedSlipsResponse;

export interface GetPackingSlipDetailsParams {
  /** Slip Id */
  slipId: string;
}

/** Response Get Packing Slip Details */
export type GetPackingSlipDetailsData = PackingSlipDetail | null;

export type GetPackingSlipDetailsError = HTTPValidationError;

export type CreateInvoiceData = Invoice;

export type CreateInvoiceError = HTTPValidationError;

/** Response List Invoices */
export type ListInvoicesData = InvoiceListItem[];

export interface GetClientColumnsParams {
  /** Client Id */
  clientId: string;
}

/** Response Get Client Columns */
export type GetClientColumnsData = ClientInvoiceColumn[];

export type GetClientColumnsError = HTTPValidationError;

export interface UpdateClientColumnsParams {
  /** Client Id */
  clientId: string;
}

/** Response Update Client Columns */
export type UpdateClientColumnsData = ClientInvoiceColumn[];

export type UpdateClientColumnsError = HTTPValidationError;

export interface GetInvoiceParams {
  /** Invoice Id */
  invoiceId: string;
}

export type GetInvoiceData = Invoice;

export type GetInvoiceError = HTTPValidationError;

export interface UpdateInvoiceParams {
  /** Invoice Id */
  invoiceId: string;
}

export type UpdateInvoiceData = Invoice;

export type UpdateInvoiceError = HTTPValidationError;

export interface DeleteInvoiceParams {
  /** Invoice Id */
  invoiceId: string;
}

export type DeleteInvoiceData = InvoiceDeleteResponse;

export type DeleteInvoiceError = HTTPValidationError;
