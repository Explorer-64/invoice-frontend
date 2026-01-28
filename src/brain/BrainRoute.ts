import {
  BusinessProfile,
  CancelSubscriptionData,
  ChatDemoData,
  ChatRequest,
  ChatWithAssistantData,
  CheckHealthData,
  CheckMarketRatesData,
  CheckSystemHealthData,
  ConnectIcloudData,
  CreateBillingRateData,
  CreateBillingRateRequest,
  CreateClientData,
  CreateClientRequest,
  CreateFeedbackRequest,
  CreateInvoiceData,
  CreateInvoiceRequest,
  CreateTaskData,
  CreateTaskRequest,
  DeleteAccountDataData,
  DeleteBillingRateData,
  DeleteClientData,
  DeleteInvoiceData,
  DeleteSessionData,
  DeleteTaskData,
  DisconnectIcloudData,
  EndBreakData,
  EndSessionData,
  EndSessionRequest,
  ExportSessionsCsvData,
  FetchEventsData,
  FetchEventsRequest,
  GetActiveSessionsData,
  GetAssistantContextData,
  GetBusinessProfileData,
  GetClientColumnsData,
  GetClientData,
  GetClientRatesData,
  GetDashboardStatsData,
  GetDemoContextData,
  GetIcloudStatusData,
  GetImageData,
  GetInvoiceData,
  GetManifestData,
  GetMicrosoftOauthStatusData,
  GetOauthStatusData,
  GetPackingSlipDetailsData,
  GetPlanIdData,
  GetPwaConfigData,
  GetRecentSessionsData,
  GetSessionData,
  GetSubscriptionStatusData,
  GoogleOauthCallbackData,
  ICloudCredentialsRequest,
  InitiateGoogleOauthData,
  InitiateMicrosoftOauthData,
  ListAllCalendarsData,
  ListClientsData,
  ListFeedbackData,
  ListInvoicesData,
  ListSessionsData,
  ListTasksData,
  ListUninvoicedSlipsData,
  MicrosoftOauthCallbackData,
  MigrateClientsToFirestoreData,
  RateCheckRequest,
  RestoreClientData,
  RestoreSessionData,
  SetupPlanData,
  SetupPlanRequest,
  StartBreakData,
  StartBreakRequest,
  StartSessionData,
  StartSessionRequest,
  SubmitFeedbackData,
  TranslateTextData,
  TranslationRequest,
  UpdateBillingRateData,
  UpdateBillingRateRequest,
  UpdateBusinessProfileData,
  UpdateClientColumnsData,
  UpdateClientColumnsRequest,
  UpdateClientData,
  UpdateClientRequest,
  UpdateInvoiceData,
  UpdateInvoiceRequest,
  UpdateSessionData,
  UpdateSessionRequest,
  UpdateTaskData,
  UpdateTaskRequest,
  VerifySubscriptionData,
  VerifySubscriptionRequest,
} from "./data-contracts";

export namespace Brain {
  /**
   * @description Check health of application. Returns 200 when OK, 500 when not.
   * @name check_health
   * @summary Check Health
   * @request GET:/_healthz
   */
  export namespace check_health {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = CheckHealthData;
  }

  /**
   * No description
   * @tags dbtn/module:assets
   * @name get_manifest
   * @summary Get Manifest
   * @request GET:/routes/assets/manifest.json
   */
  export namespace get_manifest {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = GetManifestData;
  }

  /**
   * No description
   * @tags dbtn/module:assets
   * @name get_pwa_config
   * @summary Get Pwa Config
   * @request GET:/routes/assets/pwa-config
   */
  export namespace get_pwa_config {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = GetPwaConfigData;
  }

  /**
   * No description
   * @tags dbtn/module:assets
   * @name get_image
   * @summary Get Image
   * @request GET:/routes/assets/image/{filename}
   */
  export namespace get_image {
    export type RequestParams = {
      /** Filename */
      filename: string;
    };
    export type RequestQuery = {};
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = GetImageData;
  }

  /**
   * @description List calendars from all connected sources.
   * @tags dbtn/module:calendars, dbtn/hasAuth
   * @name list_all_calendars
   * @summary List All Calendars
   * @request GET:/routes/calendars/list
   */
  export namespace list_all_calendars {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = ListAllCalendarsData;
  }

  /**
   * @description Fetch events from specified calendars.
   * @tags dbtn/module:calendars, dbtn/hasAuth
   * @name fetch_events
   * @summary Fetch Events
   * @request POST:/routes/calendars/events
   */
  export namespace fetch_events {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = FetchEventsRequest;
    export type RequestHeaders = {};
    export type ResponseBody = FetchEventsData;
  }

  /**
   * @description List tasks for the current user.
   * @tags dbtn/module:tasks, dbtn/hasAuth
   * @name list_tasks
   * @summary List Tasks
   * @request GET:/routes/tasks
   */
  export namespace list_tasks {
    export type RequestParams = {};
    export type RequestQuery = {
      /** Status */
      status?: string | null;
      /**
       * Limit
       * @default 50
       */
      limit?: number;
    };
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = ListTasksData;
  }

  /**
   * @description Create a new task.
   * @tags dbtn/module:tasks, dbtn/hasAuth
   * @name create_task
   * @summary Create Task
   * @request POST:/routes/tasks
   */
  export namespace create_task {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = CreateTaskRequest;
    export type RequestHeaders = {};
    export type ResponseBody = CreateTaskData;
  }

  /**
   * @description Update a task.
   * @tags dbtn/module:tasks, dbtn/hasAuth
   * @name update_task
   * @summary Update Task
   * @request PATCH:/routes/tasks/{task_id}
   */
  export namespace update_task {
    export type RequestParams = {
      /** Task Id */
      taskId: number;
    };
    export type RequestQuery = {};
    export type RequestBody = UpdateTaskRequest;
    export type RequestHeaders = {};
    export type ResponseBody = UpdateTaskData;
  }

  /**
   * @description Delete a task.
   * @tags dbtn/module:tasks, dbtn/hasAuth
   * @name delete_task
   * @summary Delete Task
   * @request DELETE:/routes/tasks/{task_id}
   */
  export namespace delete_task {
    export type RequestParams = {
      /** Task Id */
      taskId: number;
    };
    export type RequestQuery = {};
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = DeleteTaskData;
  }

  /**
   * @description Get the current user's subscription status.
   * @tags dbtn/module:subscriptions, dbtn/hasAuth
   * @name get_subscription_status
   * @summary Get Subscription Status
   * @request GET:/routes/status
   */
  export namespace get_subscription_status {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = GetSubscriptionStatusData;
  }

  /**
   * @description Verify a subscription created on the client side and update DB.
   * @tags dbtn/module:subscriptions, dbtn/hasAuth
   * @name verify_subscription
   * @summary Verify Subscription
   * @request POST:/routes/verify
   */
  export namespace verify_subscription {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = VerifySubscriptionRequest;
    export type RequestHeaders = {};
    export type ResponseBody = VerifySubscriptionData;
  }

  /**
   * @description Cancel the current user's subscription.
   * @tags dbtn/module:subscriptions, dbtn/hasAuth
   * @name cancel_subscription
   * @summary Cancel Subscription
   * @request POST:/routes/cancel
   */
  export namespace cancel_subscription {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = CancelSubscriptionData;
  }

  /**
   * @description Get the configured PayPal Plan IDs.
   * @tags dbtn/module:subscriptions, dbtn/hasAuth
   * @name get_plan_id
   * @summary Get Plan Id
   * @request GET:/routes/plan-id
   */
  export namespace get_plan_id {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = GetPlanIdData;
  }

  /**
   * @description Setup a product and plan in PayPal. ADMIN only.
   * @tags dbtn/module:subscriptions, dbtn/hasAuth
   * @name setup_plan
   * @summary Setup Plan
   * @request POST:/routes/setup-plan
   */
  export namespace setup_plan {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = SetupPlanRequest;
    export type RequestHeaders = {};
    export type ResponseBody = SetupPlanData;
  }

  /**
   * @description Delete all data associated with the authenticated user.
   * @tags dbtn/module:user, dbtn/hasAuth
   * @name delete_account_data
   * @summary Delete Account Data
   * @request DELETE:/routes/user/me
   */
  export namespace delete_account_data {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = DeleteAccountDataData;
  }

  /**
   * @description Check system health (env vars).
   * @tags dbtn/module:dashboard, dbtn/hasAuth
   * @name check_system_health
   * @summary Check System Health
   * @request GET:/routes/dashboard/health
   */
  export namespace check_system_health {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = CheckSystemHealthData;
  }

  /**
   * @description Get statistics for the dashboard.
   * @tags dbtn/module:dashboard, dbtn/hasAuth
   * @name get_dashboard_stats
   * @summary Get Dashboard Stats
   * @request GET:/routes/dashboard/stats
   */
  export namespace get_dashboard_stats {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = GetDashboardStatsData;
  }

  /**
   * @description Store iCloud credentials (encrypted).
   * @tags dbtn/module:icloud_auth, dbtn/hasAuth
   * @name connect_icloud
   * @summary Connect Icloud
   * @request POST:/routes/auth/icloud/connect
   */
  export namespace connect_icloud {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = ICloudCredentialsRequest;
    export type RequestHeaders = {};
    export type ResponseBody = ConnectIcloudData;
  }

  /**
   * @description Remove iCloud credentials.
   * @tags dbtn/module:icloud_auth, dbtn/hasAuth
   * @name disconnect_icloud
   * @summary Disconnect Icloud
   * @request DELETE:/routes/auth/icloud/disconnect
   */
  export namespace disconnect_icloud {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = DisconnectIcloudData;
  }

  /**
   * @description Check if iCloud is connected.
   * @tags dbtn/module:icloud_auth, dbtn/hasAuth
   * @name get_icloud_status
   * @summary Get Icloud Status
   * @request GET:/routes/auth/icloud/status
   */
  export namespace get_icloud_status {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = GetIcloudStatusData;
  }

  /**
   * @description Initiate Microsoft OAuth flow.
   * @tags dbtn/module:microsoft_oauth
   * @name initiate_microsoft_oauth
   * @summary Initiate Microsoft Oauth
   * @request GET:/routes/auth/microsoft/connect
   */
  export namespace initiate_microsoft_oauth {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = InitiateMicrosoftOauthData;
  }

  /**
   * @description Handle OAuth callback from Microsoft.
   * @tags dbtn/module:microsoft_oauth
   * @name microsoft_oauth_callback
   * @summary Microsoft Oauth Callback
   * @request GET:/routes/auth/microsoft/callback
   */
  export namespace microsoft_oauth_callback {
    export type RequestParams = {};
    export type RequestQuery = {
      /** Code */
      code?: string;
      /** Error */
      error?: string;
      /** State */
      state?: string;
    };
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = MicrosoftOauthCallbackData;
  }

  /**
   * @description Check if Microsoft Calendar is connected.
   * @tags dbtn/module:microsoft_oauth
   * @name get_microsoft_oauth_status
   * @summary Get Microsoft Oauth Status
   * @request GET:/routes/auth/microsoft/status
   */
  export namespace get_microsoft_oauth_status {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = GetMicrosoftOauthStatusData;
  }

  /**
   * @description List all feedback (Admin only).
   * @tags dbtn/module:feedback, dbtn/hasAuth
   * @name list_feedback
   * @summary List Feedback
   * @request GET:/routes/feedback/
   */
  export namespace list_feedback {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = ListFeedbackData;
  }

  /**
   * @description Submit user feedback.
   * @tags dbtn/module:feedback, dbtn/hasAuth
   * @name submit_feedback
   * @summary Submit Feedback
   * @request POST:/routes/feedback/
   */
  export namespace submit_feedback {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = CreateFeedbackRequest;
    export type RequestHeaders = {};
    export type ResponseBody = SubmitFeedbackData;
  }

  /**
   * @description Initiate Google OAuth flow to get calendar access.
   * @tags dbtn/module:google_oauth
   * @name initiate_google_oauth
   * @summary Initiate Google Oauth
   * @request GET:/routes/auth/google/connect
   */
  export namespace initiate_google_oauth {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = InitiateGoogleOauthData;
  }

  /**
   * @description Handle OAuth callback from Google.
   * @tags dbtn/module:google_oauth
   * @name google_oauth_callback
   * @summary Google Oauth Callback
   * @request GET:/routes/auth/google/callback
   */
  export namespace google_oauth_callback {
    export type RequestParams = {};
    export type RequestQuery = {
      /** Code */
      code?: string;
      /** Error */
      error?: string;
      /** State */
      state?: string;
    };
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = GoogleOauthCallbackData;
  }

  /**
   * @description Check if Google Calendar is connected.
   * @tags dbtn/module:google_oauth
   * @name get_oauth_status
   * @summary Get Oauth Status
   * @request GET:/routes/auth/google/status
   */
  export namespace get_oauth_status {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = GetOauthStatusData;
  }

  /**
   * @description Have a conversation with the billing assistant.
   * @tags dbtn/module:assistant
   * @name chat_with_assistant
   * @summary Chat With Assistant
   * @request POST:/routes/assistant/chat
   */
  export namespace chat_with_assistant {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = ChatRequest;
    export type RequestHeaders = {};
    export type ResponseBody = ChatWithAssistantData;
  }

  /**
   * @description Have a conversation with the billing assistant in demo mode (no auth).
   * @tags dbtn/module:assistant
   * @name chat_demo
   * @summary Chat Demo
   * @request POST:/routes/assistant/chat/demo
   */
  export namespace chat_demo {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = ChatRequest;
    export type RequestHeaders = {};
    export type ResponseBody = ChatDemoData;
  }

  /**
   * @description Get the current context data that the assistant has access to.
   * @tags dbtn/module:assistant
   * @name get_assistant_context
   * @summary Get Assistant Context
   * @request GET:/routes/assistant/context
   */
  export namespace get_assistant_context {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = GetAssistantContextData;
  }

  /**
   * @description Get dummy context data for demo mode.
   * @tags dbtn/module:assistant
   * @name get_demo_context
   * @summary Get Demo Context
   * @request GET:/routes/assistant/context/demo
   */
  export namespace get_demo_context {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = GetDemoContextData;
  }

  /**
   * @description Analyze the user's rate against market averages using Gemini.
   * @tags dbtn/module:assistant
   * @name check_market_rates
   * @summary Check Market Rates
   * @request POST:/routes/assistant/rate-check
   */
  export namespace check_market_rates {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = RateCheckRequest;
    export type RequestHeaders = {};
    export type ResponseBody = CheckMarketRatesData;
  }

  /**
   * No description
   * @tags dbtn/module:translation
   * @name translate_text
   * @summary Translate Text
   * @request POST:/routes/translate_text
   */
  export namespace translate_text {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = TranslationRequest;
    export type RequestHeaders = {};
    export type ResponseBody = TranslateTextData;
  }

  /**
   * @description List all clients for the authenticated user. Returns a list of all clients for the user, ordered by name.
   * @tags dbtn/module:clients, dbtn/hasAuth
   * @name list_clients
   * @summary List Clients
   * @request GET:/routes/clients/
   */
  export namespace list_clients {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = ListClientsData;
  }

  /**
   * @description Create a new client. Optionally creates a default billing rate for the client. Args: body: Client details including optional default billing rate user: The authenticated user Returns: The newly created client
   * @tags dbtn/module:clients, dbtn/hasAuth
   * @name create_client
   * @summary Create Client
   * @request POST:/routes/clients/
   */
  export namespace create_client {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = CreateClientRequest;
    export type RequestHeaders = {};
    export type ResponseBody = CreateClientData;
  }

  /**
   * @description Get a specific client with their billing rates. Args: client_id: The ID of the client to retrieve user: The authenticated user Returns: Client details along with all associated billing rates Raises: HTTPException: 404 if client not found or doesn't belong to user
   * @tags dbtn/module:clients, dbtn/hasAuth
   * @name get_client
   * @summary Get Client
   * @request GET:/routes/clients/{client_id}
   */
  export namespace get_client {
    export type RequestParams = {
      /** Client Id */
      clientId: string;
    };
    export type RequestQuery = {};
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = GetClientData;
  }

  /**
   * @description Update a client's information. Args: client_id: The ID of the client to update body: Fields to update (only provided fields will be updated) user: The authenticated user Returns: The updated client Raises: HTTPException: 404 if client not found
   * @tags dbtn/module:clients, dbtn/hasAuth
   * @name update_client
   * @summary Update Client
   * @request PUT:/routes/clients/{client_id}
   */
  export namespace update_client {
    export type RequestParams = {
      /** Client Id */
      clientId: string;
    };
    export type RequestQuery = {};
    export type RequestBody = UpdateClientRequest;
    export type RequestHeaders = {};
    export type ResponseBody = UpdateClientData;
  }

  /**
   * @description Delete a client. This will also delete all associated billing rates due to CASCADE. Args: client_id: The ID of the client to delete user: The authenticated user Returns: Success message Raises: HTTPException: 404 if client not found
   * @tags dbtn/module:clients, dbtn/hasAuth
   * @name delete_client
   * @summary Delete Client
   * @request DELETE:/routes/clients/{client_id}
   */
  export namespace delete_client {
    export type RequestParams = {
      /** Client Id */
      clientId: string;
    };
    export type RequestQuery = {};
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = DeleteClientData;
  }

  /**
   * No description
   * @tags dbtn/module:clients, dbtn/hasAuth
   * @name restore_client
   * @summary Restore Client
   * @request POST:/routes/clients/{client_id}/restore
   */
  export namespace restore_client {
    export type RequestParams = {
      /** Client Id */
      clientId: string;
    };
    export type RequestQuery = {};
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = RestoreClientData;
  }

  /**
   * @description Get all billing rates for a specific client. Args: client_id: The ID of the client user: The authenticated user Returns: List of billing rates for the client Raises: HTTPException: 404 if client not found
   * @tags dbtn/module:clients, dbtn/hasAuth
   * @name get_client_rates
   * @summary Get Client Rates
   * @request GET:/routes/clients/{client_id}/rates
   */
  export namespace get_client_rates {
    export type RequestParams = {
      /** Client Id */
      clientId: string;
    };
    export type RequestQuery = {};
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = GetClientRatesData;
  }

  /**
   * @description Create a new billing rate for a client. If marked as default, will unmark any existing default rates. Args: client_id: The ID of the client body: Billing rate details user: The authenticated user Returns: The newly created billing rate Raises: HTTPException: 404 if client not found
   * @tags dbtn/module:clients, dbtn/hasAuth
   * @name create_billing_rate
   * @summary Create Billing Rate
   * @request POST:/routes/clients/{client_id}/rates
   */
  export namespace create_billing_rate {
    export type RequestParams = {
      /** Client Id */
      clientId: string;
    };
    export type RequestQuery = {};
    export type RequestBody = CreateBillingRateRequest;
    export type RequestHeaders = {};
    export type ResponseBody = CreateBillingRateData;
  }

  /**
   * @description Update a billing rate for a client. If marked as default, will unmark other default rates.
   * @tags dbtn/module:clients, dbtn/hasAuth
   * @name update_billing_rate
   * @summary Update Billing Rate
   * @request PUT:/routes/clients/{client_id}/rates/{rate_id}
   */
  export namespace update_billing_rate {
    export type RequestParams = {
      /** Client Id */
      clientId: string;
      /** Rate Id */
      rateId: string;
    };
    export type RequestQuery = {};
    export type RequestBody = UpdateBillingRateRequest;
    export type RequestHeaders = {};
    export type ResponseBody = UpdateBillingRateData;
  }

  /**
   * @description Delete a billing rate for a client.
   * @tags dbtn/module:clients, dbtn/hasAuth
   * @name delete_billing_rate
   * @summary Delete Billing Rate
   * @request DELETE:/routes/clients/{client_id}/rates/{rate_id}
   */
  export namespace delete_billing_rate {
    export type RequestParams = {
      /** Client Id */
      clientId: string;
      /** Rate Id */
      rateId: string;
    };
    export type RequestQuery = {};
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = DeleteBillingRateData;
  }

  /**
   * @description Start a new work session. Args: body: Session details including client_id and optional location user: The authenticated user Returns: The newly created active work session Raises: HTTPException: 400 if client not found or session already active
   * @tags dbtn/module:sessions, dbtn/hasAuth
   * @name start_session
   * @summary Start Session
   * @request POST:/routes/sessions/start
   */
  export namespace start_session {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = StartSessionRequest;
    export type RequestHeaders = {};
    export type ResponseBody = StartSessionData;
  }

  /**
   * @description End an active work session. Args: session_id: The ID of the session to end user: The authenticated user body: Optional notes to add when ending the session Returns: The completed work session with calculated durations Raises: HTTPException: 404 if session not found, 400 if already ended
   * @tags dbtn/module:sessions, dbtn/hasAuth
   * @name end_session
   * @summary End Session
   * @request POST:/routes/sessions/{session_id}/end
   */
  export namespace end_session {
    export type RequestParams = {
      /** Session Id */
      sessionId: number;
    };
    export type RequestQuery = {};
    export type RequestBody = EndSessionRequest;
    export type RequestHeaders = {};
    export type ResponseBody = EndSessionData;
  }

  /**
   * @description Get all currently active work sessions for the user. Returns: List of active sessions (sessions without end_time)
   * @tags dbtn/module:sessions, dbtn/hasAuth
   * @name get_active_sessions
   * @summary Get Active Sessions
   * @request GET:/routes/sessions/active
   */
  export namespace get_active_sessions {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = GetActiveSessionsData;
  }

  /**
   * @description Get recent work sessions for the user. Args: user: The authenticated user limit: Maximum number of sessions to return (default: 10) Returns: List of recent sessions ordered by start time
   * @tags dbtn/module:sessions, dbtn/hasAuth
   * @name get_recent_sessions
   * @summary Get Recent Sessions
   * @request GET:/routes/sessions/recent
   */
  export namespace get_recent_sessions {
    export type RequestParams = {};
    export type RequestQuery = {
      /**
       * Limit
       * @default 10
       */
      limit?: number;
    };
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = GetRecentSessionsData;
  }

  /**
   * @description List work sessions with optional filtering. Args: user: The authenticated user start_date: Filter by start date (inclusive) end_date: Filter by end date (inclusive) client_id: Filter by client Returns: List of sessions matching criteria
   * @tags dbtn/module:sessions, dbtn/hasAuth
   * @name list_sessions
   * @summary List Sessions
   * @request GET:/routes/sessions/
   */
  export namespace list_sessions {
    export type RequestParams = {};
    export type RequestQuery = {
      /** Start Date */
      start_date?: string | null;
      /** End Date */
      end_date?: string | null;
      /** Client Id */
      client_id?: string | null;
    };
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = ListSessionsData;
  }

  /**
   * @description Get a specific session with its breaks. Args: session_id: The ID of the session to retrieve user: The authenticated user Returns: Session details along with all associated breaks Raises: HTTPException: 404 if session not found
   * @tags dbtn/module:sessions, dbtn/hasAuth
   * @name get_session
   * @summary Get Session
   * @request GET:/routes/sessions/{session_id}
   */
  export namespace get_session {
    export type RequestParams = {
      /** Session Id */
      sessionId: number;
    };
    export type RequestQuery = {};
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = GetSessionData;
  }

  /**
   * @description Update session details. Args: session_id: The ID of the session to update body: Fields to update user: The authenticated user Returns: The updated session Raises: HTTPException: 404 if session not found
   * @tags dbtn/module:sessions, dbtn/hasAuth
   * @name update_session
   * @summary Update Session
   * @request PUT:/routes/sessions/{session_id}
   */
  export namespace update_session {
    export type RequestParams = {
      /** Session Id */
      sessionId: number;
    };
    export type RequestQuery = {};
    export type RequestBody = UpdateSessionRequest;
    export type RequestHeaders = {};
    export type ResponseBody = UpdateSessionData;
  }

  /**
   * @description Soft delete (archive) a session.
   * @tags dbtn/module:sessions, dbtn/hasAuth
   * @name delete_session
   * @summary Delete Session
   * @request DELETE:/routes/sessions/{session_id}
   */
  export namespace delete_session {
    export type RequestParams = {
      /** Session Id */
      sessionId: number;
    };
    export type RequestQuery = {};
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = DeleteSessionData;
  }

  /**
   * @description Start a break for a session. Args: session_id: The ID of the session body: Break details user: The authenticated user Returns: The newly created active break Raises: HTTPException: 404 if session not found, 400 if session ended or break active
   * @tags dbtn/module:sessions, dbtn/hasAuth
   * @name start_break
   * @summary Start Break
   * @request POST:/routes/sessions/{session_id}/break/start
   */
  export namespace start_break {
    export type RequestParams = {
      /** Session Id */
      sessionId: number;
    };
    export type RequestQuery = {};
    export type RequestBody = StartBreakRequest;
    export type RequestHeaders = {};
    export type ResponseBody = StartBreakData;
  }

  /**
   * @description End the active break for a session. Args: session_id: The ID of the session user: The authenticated user Returns: The completed break Raises: HTTPException: 404 if session not found, 400 if no active break
   * @tags dbtn/module:sessions, dbtn/hasAuth
   * @name end_break
   * @summary End Break
   * @request POST:/routes/sessions/{session_id}/break/end
   */
  export namespace end_break {
    export type RequestParams = {
      /** Session Id */
      sessionId: number;
    };
    export type RequestQuery = {};
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = EndBreakData;
  }

  /**
   * No description
   * @tags dbtn/module:sessions, dbtn/hasAuth
   * @name restore_session
   * @summary Restore Session
   * @request POST:/routes/sessions/{session_id}/restore
   */
  export namespace restore_session {
    export type RequestParams = {
      /** Session Id */
      sessionId: number;
    };
    export type RequestQuery = {};
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = RestoreSessionData;
  }

  /**
   * @description Export all work sessions as CSV.
   * @tags stream, dbtn/module:sessions, dbtn/hasAuth
   * @name export_sessions_csv
   * @summary Export Sessions Csv
   * @request GET:/routes/sessions/export/csv
   */
  export namespace export_sessions_csv {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = ExportSessionsCsvData;
  }

  /**
   * @description One-time migration endpoint to copy clients from db.storage to Firestore. This ensures existing users don't lose their client data when switching to Firestore.
   * @tags dbtn/module:migrate_clients
   * @name migrate_clients_to_firestore
   * @summary Migrate Clients To Firestore
   * @request POST:/routes/migrate-clients-to-firestore
   */
  export namespace migrate_clients_to_firestore {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = MigrateClientsToFirestoreData;
  }

  /**
   * @description Get the user's business profile settings from Firestore shared storage.
   * @tags dbtn/module:settings, dbtn/hasAuth
   * @name get_business_profile
   * @summary Get Business Profile
   * @request GET:/routes/business-profile
   */
  export namespace get_business_profile {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = GetBusinessProfileData;
  }

  /**
   * @description Update the user's business profile settings in Firestore shared storage.
   * @tags dbtn/module:settings, dbtn/hasAuth
   * @name update_business_profile
   * @summary Update Business Profile
   * @request PUT:/routes/business-profile
   */
  export namespace update_business_profile {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = BusinessProfile;
    export type RequestHeaders = {};
    export type ResponseBody = UpdateBusinessProfileData;
  }

  /**
   * @description List all packing slips with status 'unlinked' for the authenticated user. Returns: List of packing slip summaries for display in picker UI
   * @tags dbtn/module:packing_slips
   * @name list_uninvoiced_slips
   * @summary List Uninvoiced Slips
   * @request GET:/routes/packing-slips/uninvoiced
   */
  export namespace list_uninvoiced_slips {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = ListUninvoicedSlipsData;
  }

  /**
   * @description Get detailed information for a specific packing slip. Args: slip_id: Firestore document ID of the packing slip Returns: Packing slip data transformed to invoice format, or None if not found
   * @tags dbtn/module:packing_slips
   * @name get_packing_slip_details
   * @summary Get Packing Slip Details
   * @request GET:/routes/packing-slips/{slip_id}
   */
  export namespace get_packing_slip_details {
    export type RequestParams = {
      /** Slip Id */
      slipId: string;
    };
    export type RequestQuery = {};
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = GetPackingSlipDetailsData;
  }

  /**
   * @description Create a new invoice from selected work sessions.
   * @tags dbtn/module:invoices
   * @name create_invoice
   * @summary Create Invoice
   * @request POST:/routes/invoices/create
   */
  export namespace create_invoice {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = CreateInvoiceRequest;
    export type RequestHeaders = {};
    export type ResponseBody = CreateInvoiceData;
  }

  /**
   * @description List all invoices for the authenticated user.
   * @tags dbtn/module:invoices
   * @name list_invoices
   * @summary List Invoices
   * @request GET:/routes/invoices/
   */
  export namespace list_invoices {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = ListInvoicesData;
  }

  /**
   * @description Get custom columns for a client.
   * @tags dbtn/module:invoices
   * @name get_client_columns
   * @summary Get Client Columns
   * @request GET:/routes/invoices/clients/{client_id}/columns
   */
  export namespace get_client_columns {
    export type RequestParams = {
      /** Client Id */
      clientId: string;
    };
    export type RequestQuery = {};
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = GetClientColumnsData;
  }

  /**
   * @description Update custom columns for a client.
   * @tags dbtn/module:invoices
   * @name update_client_columns
   * @summary Update Client Columns
   * @request PUT:/routes/invoices/clients/{client_id}/columns
   */
  export namespace update_client_columns {
    export type RequestParams = {
      /** Client Id */
      clientId: string;
    };
    export type RequestQuery = {};
    export type RequestBody = UpdateClientColumnsRequest;
    export type RequestHeaders = {};
    export type ResponseBody = UpdateClientColumnsData;
  }

  /**
   * @description Get a specific invoice with all details.
   * @tags dbtn/module:invoices
   * @name get_invoice
   * @summary Get Invoice
   * @request GET:/routes/invoices/{invoice_id}
   */
  export namespace get_invoice {
    export type RequestParams = {
      /** Invoice Id */
      invoiceId: string;
    };
    export type RequestQuery = {};
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = GetInvoiceData;
  }

  /**
   * @description Update an existing invoice.
   * @tags dbtn/module:invoices
   * @name update_invoice
   * @summary Update Invoice
   * @request PUT:/routes/invoices/{invoice_id}
   */
  export namespace update_invoice {
    export type RequestParams = {
      /** Invoice Id */
      invoiceId: string;
    };
    export type RequestQuery = {};
    export type RequestBody = UpdateInvoiceRequest;
    export type RequestHeaders = {};
    export type ResponseBody = UpdateInvoiceData;
  }

  /**
   * @description Soft delete an invoice.
   * @tags dbtn/module:invoices
   * @name delete_invoice
   * @summary Delete Invoice
   * @request DELETE:/routes/invoices/{invoice_id}
   */
  export namespace delete_invoice {
    export type RequestParams = {
      /** Invoice Id */
      invoiceId: string;
    };
    export type RequestQuery = {};
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = DeleteInvoiceData;
  }
}
