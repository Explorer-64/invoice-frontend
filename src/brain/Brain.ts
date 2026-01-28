import {
  BusinessProfile,
  CancelSubscriptionData,
  ChatDemoData,
  ChatDemoError,
  ChatRequest,
  ChatWithAssistantData,
  ChatWithAssistantError,
  CheckHealthData,
  CheckMarketRatesData,
  CheckMarketRatesError,
  CheckSystemHealthData,
  ConnectIcloudData,
  ConnectIcloudError,
  CreateBillingRateData,
  CreateBillingRateError,
  CreateBillingRateParams,
  CreateBillingRateRequest,
  CreateClientData,
  CreateClientError,
  CreateClientRequest,
  CreateFeedbackRequest,
  CreateInvoiceData,
  CreateInvoiceError,
  CreateInvoiceRequest,
  CreateTaskData,
  CreateTaskError,
  CreateTaskRequest,
  DeleteAccountDataData,
  DeleteBillingRateData,
  DeleteBillingRateError,
  DeleteBillingRateParams,
  DeleteClientData,
  DeleteClientError,
  DeleteClientParams,
  DeleteInvoiceData,
  DeleteInvoiceError,
  DeleteInvoiceParams,
  DeleteSessionData,
  DeleteSessionError,
  DeleteSessionParams,
  DeleteTaskData,
  DeleteTaskError,
  DeleteTaskParams,
  DisconnectIcloudData,
  EndBreakData,
  EndBreakError,
  EndBreakParams,
  EndSessionData,
  EndSessionError,
  EndSessionParams,
  EndSessionRequest,
  ExportSessionsCsvData,
  FetchEventsData,
  FetchEventsError,
  FetchEventsRequest,
  GetActiveSessionsData,
  GetAssistantContextData,
  GetBusinessProfileData,
  GetClientColumnsData,
  GetClientColumnsError,
  GetClientColumnsParams,
  GetClientData,
  GetClientError,
  GetClientParams,
  GetClientRatesData,
  GetClientRatesError,
  GetClientRatesParams,
  GetDashboardStatsData,
  GetDemoContextData,
  GetIcloudStatusData,
  GetImageData,
  GetImageError,
  GetImageParams,
  GetInvoiceData,
  GetInvoiceError,
  GetInvoiceParams,
  GetManifestData,
  GetMicrosoftOauthStatusData,
  GetOauthStatusData,
  GetPackingSlipDetailsData,
  GetPackingSlipDetailsError,
  GetPackingSlipDetailsParams,
  GetPlanIdData,
  GetPwaConfigData,
  GetRecentSessionsData,
  GetRecentSessionsError,
  GetRecentSessionsParams,
  GetSessionData,
  GetSessionError,
  GetSessionParams,
  GetSubscriptionStatusData,
  GoogleOauthCallbackData,
  GoogleOauthCallbackError,
  GoogleOauthCallbackParams,
  ICloudCredentialsRequest,
  InitiateGoogleOauthData,
  InitiateMicrosoftOauthData,
  ListAllCalendarsData,
  ListClientsData,
  ListFeedbackData,
  ListInvoicesData,
  ListSessionsData,
  ListSessionsError,
  ListSessionsParams,
  ListTasksData,
  ListTasksError,
  ListTasksParams,
  ListUninvoicedSlipsData,
  MicrosoftOauthCallbackData,
  MicrosoftOauthCallbackError,
  MicrosoftOauthCallbackParams,
  MigrateClientsToFirestoreData,
  RateCheckRequest,
  RestoreClientData,
  RestoreClientError,
  RestoreClientParams,
  RestoreSessionData,
  RestoreSessionError,
  RestoreSessionParams,
  SetupPlanData,
  SetupPlanError,
  SetupPlanRequest,
  StartBreakData,
  StartBreakError,
  StartBreakParams,
  StartBreakRequest,
  StartSessionData,
  StartSessionError,
  StartSessionRequest,
  SubmitFeedbackData,
  SubmitFeedbackError,
  TranslateTextData,
  TranslateTextError,
  TranslationRequest,
  UpdateBillingRateData,
  UpdateBillingRateError,
  UpdateBillingRateParams,
  UpdateBillingRateRequest,
  UpdateBusinessProfileData,
  UpdateBusinessProfileError,
  UpdateClientColumnsData,
  UpdateClientColumnsError,
  UpdateClientColumnsParams,
  UpdateClientColumnsRequest,
  UpdateClientData,
  UpdateClientError,
  UpdateClientParams,
  UpdateClientRequest,
  UpdateInvoiceData,
  UpdateInvoiceError,
  UpdateInvoiceParams,
  UpdateInvoiceRequest,
  UpdateSessionData,
  UpdateSessionError,
  UpdateSessionParams,
  UpdateSessionRequest,
  UpdateTaskData,
  UpdateTaskError,
  UpdateTaskParams,
  UpdateTaskRequest,
  VerifySubscriptionData,
  VerifySubscriptionError,
  VerifySubscriptionRequest,
} from "./data-contracts";
import { ContentType, HttpClient, RequestParams } from "./http-client";

export class Brain<SecurityDataType = unknown> extends HttpClient<SecurityDataType> {
  /**
   * @description Check health of application. Returns 200 when OK, 500 when not.
   *
   * @name check_health
   * @summary Check Health
   * @request GET:/_healthz
   */
  check_health = (params: RequestParams = {}) =>
    this.request<CheckHealthData, any>({
      path: `/_healthz`,
      method: "GET",
      ...params,
    });

  /**
   * No description
   *
   * @tags dbtn/module:assets
   * @name get_manifest
   * @summary Get Manifest
   * @request GET:/routes/assets/manifest.json
   */
  get_manifest = (params: RequestParams = {}) =>
    this.request<GetManifestData, any>({
      path: `/routes/assets/manifest.json`,
      method: "GET",
      ...params,
    });

  /**
   * No description
   *
   * @tags dbtn/module:assets
   * @name get_pwa_config
   * @summary Get Pwa Config
   * @request GET:/routes/assets/pwa-config
   */
  get_pwa_config = (params: RequestParams = {}) =>
    this.request<GetPwaConfigData, any>({
      path: `/routes/assets/pwa-config`,
      method: "GET",
      ...params,
    });

  /**
   * No description
   *
   * @tags dbtn/module:assets
   * @name get_image
   * @summary Get Image
   * @request GET:/routes/assets/image/{filename}
   */
  get_image = ({ filename, ...query }: GetImageParams, params: RequestParams = {}) =>
    this.request<GetImageData, GetImageError>({
      path: `/routes/assets/image/${filename}`,
      method: "GET",
      ...params,
    });

  /**
   * @description List calendars from all connected sources.
   *
   * @tags dbtn/module:calendars, dbtn/hasAuth
   * @name list_all_calendars
   * @summary List All Calendars
   * @request GET:/routes/calendars/list
   */
  list_all_calendars = (params: RequestParams = {}) =>
    this.request<ListAllCalendarsData, any>({
      path: `/routes/calendars/list`,
      method: "GET",
      ...params,
    });

  /**
   * @description Fetch events from specified calendars.
   *
   * @tags dbtn/module:calendars, dbtn/hasAuth
   * @name fetch_events
   * @summary Fetch Events
   * @request POST:/routes/calendars/events
   */
  fetch_events = (data: FetchEventsRequest, params: RequestParams = {}) =>
    this.request<FetchEventsData, FetchEventsError>({
      path: `/routes/calendars/events`,
      method: "POST",
      body: data,
      type: ContentType.Json,
      ...params,
    });

  /**
   * @description List tasks for the current user.
   *
   * @tags dbtn/module:tasks, dbtn/hasAuth
   * @name list_tasks
   * @summary List Tasks
   * @request GET:/routes/tasks
   */
  list_tasks = (query: ListTasksParams, params: RequestParams = {}) =>
    this.request<ListTasksData, ListTasksError>({
      path: `/routes/tasks`,
      method: "GET",
      query: query,
      ...params,
    });

  /**
   * @description Create a new task.
   *
   * @tags dbtn/module:tasks, dbtn/hasAuth
   * @name create_task
   * @summary Create Task
   * @request POST:/routes/tasks
   */
  create_task = (data: CreateTaskRequest, params: RequestParams = {}) =>
    this.request<CreateTaskData, CreateTaskError>({
      path: `/routes/tasks`,
      method: "POST",
      body: data,
      type: ContentType.Json,
      ...params,
    });

  /**
   * @description Update a task.
   *
   * @tags dbtn/module:tasks, dbtn/hasAuth
   * @name update_task
   * @summary Update Task
   * @request PATCH:/routes/tasks/{task_id}
   */
  update_task = ({ taskId, ...query }: UpdateTaskParams, data: UpdateTaskRequest, params: RequestParams = {}) =>
    this.request<UpdateTaskData, UpdateTaskError>({
      path: `/routes/tasks/${taskId}`,
      method: "PATCH",
      body: data,
      type: ContentType.Json,
      ...params,
    });

  /**
   * @description Delete a task.
   *
   * @tags dbtn/module:tasks, dbtn/hasAuth
   * @name delete_task
   * @summary Delete Task
   * @request DELETE:/routes/tasks/{task_id}
   */
  delete_task = ({ taskId, ...query }: DeleteTaskParams, params: RequestParams = {}) =>
    this.request<DeleteTaskData, DeleteTaskError>({
      path: `/routes/tasks/${taskId}`,
      method: "DELETE",
      ...params,
    });

  /**
   * @description Get the current user's subscription status.
   *
   * @tags dbtn/module:subscriptions, dbtn/hasAuth
   * @name get_subscription_status
   * @summary Get Subscription Status
   * @request GET:/routes/status
   */
  get_subscription_status = (params: RequestParams = {}) =>
    this.request<GetSubscriptionStatusData, any>({
      path: `/routes/status`,
      method: "GET",
      ...params,
    });

  /**
   * @description Verify a subscription created on the client side and update DB.
   *
   * @tags dbtn/module:subscriptions, dbtn/hasAuth
   * @name verify_subscription
   * @summary Verify Subscription
   * @request POST:/routes/verify
   */
  verify_subscription = (data: VerifySubscriptionRequest, params: RequestParams = {}) =>
    this.request<VerifySubscriptionData, VerifySubscriptionError>({
      path: `/routes/verify`,
      method: "POST",
      body: data,
      type: ContentType.Json,
      ...params,
    });

  /**
   * @description Cancel the current user's subscription.
   *
   * @tags dbtn/module:subscriptions, dbtn/hasAuth
   * @name cancel_subscription
   * @summary Cancel Subscription
   * @request POST:/routes/cancel
   */
  cancel_subscription = (params: RequestParams = {}) =>
    this.request<CancelSubscriptionData, any>({
      path: `/routes/cancel`,
      method: "POST",
      ...params,
    });

  /**
   * @description Get the configured PayPal Plan IDs.
   *
   * @tags dbtn/module:subscriptions, dbtn/hasAuth
   * @name get_plan_id
   * @summary Get Plan Id
   * @request GET:/routes/plan-id
   */
  get_plan_id = (params: RequestParams = {}) =>
    this.request<GetPlanIdData, any>({
      path: `/routes/plan-id`,
      method: "GET",
      ...params,
    });

  /**
   * @description Setup a product and plan in PayPal. ADMIN only.
   *
   * @tags dbtn/module:subscriptions, dbtn/hasAuth
   * @name setup_plan
   * @summary Setup Plan
   * @request POST:/routes/setup-plan
   */
  setup_plan = (data: SetupPlanRequest, params: RequestParams = {}) =>
    this.request<SetupPlanData, SetupPlanError>({
      path: `/routes/setup-plan`,
      method: "POST",
      body: data,
      type: ContentType.Json,
      ...params,
    });

  /**
   * @description Delete all data associated with the authenticated user.
   *
   * @tags dbtn/module:user, dbtn/hasAuth
   * @name delete_account_data
   * @summary Delete Account Data
   * @request DELETE:/routes/user/me
   */
  delete_account_data = (params: RequestParams = {}) =>
    this.request<DeleteAccountDataData, any>({
      path: `/routes/user/me`,
      method: "DELETE",
      ...params,
    });

  /**
   * @description Check system health (env vars).
   *
   * @tags dbtn/module:dashboard, dbtn/hasAuth
   * @name check_system_health
   * @summary Check System Health
   * @request GET:/routes/dashboard/health
   */
  check_system_health = (params: RequestParams = {}) =>
    this.request<CheckSystemHealthData, any>({
      path: `/routes/dashboard/health`,
      method: "GET",
      ...params,
    });

  /**
   * @description Get statistics for the dashboard.
   *
   * @tags dbtn/module:dashboard, dbtn/hasAuth
   * @name get_dashboard_stats
   * @summary Get Dashboard Stats
   * @request GET:/routes/dashboard/stats
   */
  get_dashboard_stats = (params: RequestParams = {}) =>
    this.request<GetDashboardStatsData, any>({
      path: `/routes/dashboard/stats`,
      method: "GET",
      ...params,
    });

  /**
   * @description Store iCloud credentials (encrypted).
   *
   * @tags dbtn/module:icloud_auth, dbtn/hasAuth
   * @name connect_icloud
   * @summary Connect Icloud
   * @request POST:/routes/auth/icloud/connect
   */
  connect_icloud = (data: ICloudCredentialsRequest, params: RequestParams = {}) =>
    this.request<ConnectIcloudData, ConnectIcloudError>({
      path: `/routes/auth/icloud/connect`,
      method: "POST",
      body: data,
      type: ContentType.Json,
      ...params,
    });

  /**
   * @description Remove iCloud credentials.
   *
   * @tags dbtn/module:icloud_auth, dbtn/hasAuth
   * @name disconnect_icloud
   * @summary Disconnect Icloud
   * @request DELETE:/routes/auth/icloud/disconnect
   */
  disconnect_icloud = (params: RequestParams = {}) =>
    this.request<DisconnectIcloudData, any>({
      path: `/routes/auth/icloud/disconnect`,
      method: "DELETE",
      ...params,
    });

  /**
   * @description Check if iCloud is connected.
   *
   * @tags dbtn/module:icloud_auth, dbtn/hasAuth
   * @name get_icloud_status
   * @summary Get Icloud Status
   * @request GET:/routes/auth/icloud/status
   */
  get_icloud_status = (params: RequestParams = {}) =>
    this.request<GetIcloudStatusData, any>({
      path: `/routes/auth/icloud/status`,
      method: "GET",
      ...params,
    });

  /**
   * @description Initiate Microsoft OAuth flow.
   *
   * @tags dbtn/module:microsoft_oauth
   * @name initiate_microsoft_oauth
   * @summary Initiate Microsoft Oauth
   * @request GET:/routes/auth/microsoft/connect
   */
  initiate_microsoft_oauth = (params: RequestParams = {}) =>
    this.request<InitiateMicrosoftOauthData, any>({
      path: `/routes/auth/microsoft/connect`,
      method: "GET",
      ...params,
    });

  /**
   * @description Handle OAuth callback from Microsoft.
   *
   * @tags dbtn/module:microsoft_oauth
   * @name microsoft_oauth_callback
   * @summary Microsoft Oauth Callback
   * @request GET:/routes/auth/microsoft/callback
   */
  microsoft_oauth_callback = (query: MicrosoftOauthCallbackParams, params: RequestParams = {}) =>
    this.request<MicrosoftOauthCallbackData, MicrosoftOauthCallbackError>({
      path: `/routes/auth/microsoft/callback`,
      method: "GET",
      query: query,
      ...params,
    });

  /**
   * @description Check if Microsoft Calendar is connected.
   *
   * @tags dbtn/module:microsoft_oauth
   * @name get_microsoft_oauth_status
   * @summary Get Microsoft Oauth Status
   * @request GET:/routes/auth/microsoft/status
   */
  get_microsoft_oauth_status = (params: RequestParams = {}) =>
    this.request<GetMicrosoftOauthStatusData, any>({
      path: `/routes/auth/microsoft/status`,
      method: "GET",
      ...params,
    });

  /**
   * @description List all feedback (Admin only).
   *
   * @tags dbtn/module:feedback, dbtn/hasAuth
   * @name list_feedback
   * @summary List Feedback
   * @request GET:/routes/feedback/
   */
  list_feedback = (params: RequestParams = {}) =>
    this.request<ListFeedbackData, any>({
      path: `/routes/feedback/`,
      method: "GET",
      ...params,
    });

  /**
   * @description Submit user feedback.
   *
   * @tags dbtn/module:feedback, dbtn/hasAuth
   * @name submit_feedback
   * @summary Submit Feedback
   * @request POST:/routes/feedback/
   */
  submit_feedback = (data: CreateFeedbackRequest, params: RequestParams = {}) =>
    this.request<SubmitFeedbackData, SubmitFeedbackError>({
      path: `/routes/feedback/`,
      method: "POST",
      body: data,
      type: ContentType.Json,
      ...params,
    });

  /**
   * @description Initiate Google OAuth flow to get calendar access.
   *
   * @tags dbtn/module:google_oauth
   * @name initiate_google_oauth
   * @summary Initiate Google Oauth
   * @request GET:/routes/auth/google/connect
   */
  initiate_google_oauth = (params: RequestParams = {}) =>
    this.request<InitiateGoogleOauthData, any>({
      path: `/routes/auth/google/connect`,
      method: "GET",
      ...params,
    });

  /**
   * @description Handle OAuth callback from Google.
   *
   * @tags dbtn/module:google_oauth
   * @name google_oauth_callback
   * @summary Google Oauth Callback
   * @request GET:/routes/auth/google/callback
   */
  google_oauth_callback = (query: GoogleOauthCallbackParams, params: RequestParams = {}) =>
    this.request<GoogleOauthCallbackData, GoogleOauthCallbackError>({
      path: `/routes/auth/google/callback`,
      method: "GET",
      query: query,
      ...params,
    });

  /**
   * @description Check if Google Calendar is connected.
   *
   * @tags dbtn/module:google_oauth
   * @name get_oauth_status
   * @summary Get Oauth Status
   * @request GET:/routes/auth/google/status
   */
  get_oauth_status = (params: RequestParams = {}) =>
    this.request<GetOauthStatusData, any>({
      path: `/routes/auth/google/status`,
      method: "GET",
      ...params,
    });

  /**
   * @description Have a conversation with the billing assistant.
   *
   * @tags dbtn/module:assistant
   * @name chat_with_assistant
   * @summary Chat With Assistant
   * @request POST:/routes/assistant/chat
   */
  chat_with_assistant = (data: ChatRequest, params: RequestParams = {}) =>
    this.request<ChatWithAssistantData, ChatWithAssistantError>({
      path: `/routes/assistant/chat`,
      method: "POST",
      body: data,
      type: ContentType.Json,
      ...params,
    });

  /**
   * @description Have a conversation with the billing assistant in demo mode (no auth).
   *
   * @tags dbtn/module:assistant
   * @name chat_demo
   * @summary Chat Demo
   * @request POST:/routes/assistant/chat/demo
   */
  chat_demo = (data: ChatRequest, params: RequestParams = {}) =>
    this.request<ChatDemoData, ChatDemoError>({
      path: `/routes/assistant/chat/demo`,
      method: "POST",
      body: data,
      type: ContentType.Json,
      ...params,
    });

  /**
   * @description Get the current context data that the assistant has access to.
   *
   * @tags dbtn/module:assistant
   * @name get_assistant_context
   * @summary Get Assistant Context
   * @request GET:/routes/assistant/context
   */
  get_assistant_context = (params: RequestParams = {}) =>
    this.request<GetAssistantContextData, any>({
      path: `/routes/assistant/context`,
      method: "GET",
      ...params,
    });

  /**
   * @description Get dummy context data for demo mode.
   *
   * @tags dbtn/module:assistant
   * @name get_demo_context
   * @summary Get Demo Context
   * @request GET:/routes/assistant/context/demo
   */
  get_demo_context = (params: RequestParams = {}) =>
    this.request<GetDemoContextData, any>({
      path: `/routes/assistant/context/demo`,
      method: "GET",
      ...params,
    });

  /**
   * @description Analyze the user's rate against market averages using Gemini.
   *
   * @tags dbtn/module:assistant
   * @name check_market_rates
   * @summary Check Market Rates
   * @request POST:/routes/assistant/rate-check
   */
  check_market_rates = (data: RateCheckRequest, params: RequestParams = {}) =>
    this.request<CheckMarketRatesData, CheckMarketRatesError>({
      path: `/routes/assistant/rate-check`,
      method: "POST",
      body: data,
      type: ContentType.Json,
      ...params,
    });

  /**
   * No description
   *
   * @tags dbtn/module:translation
   * @name translate_text
   * @summary Translate Text
   * @request POST:/routes/translate_text
   */
  translate_text = (data: TranslationRequest, params: RequestParams = {}) =>
    this.request<TranslateTextData, TranslateTextError>({
      path: `/routes/translate_text`,
      method: "POST",
      body: data,
      type: ContentType.Json,
      ...params,
    });

  /**
   * @description List all clients for the authenticated user. Returns a list of all clients for the user, ordered by name.
   *
   * @tags dbtn/module:clients, dbtn/hasAuth
   * @name list_clients
   * @summary List Clients
   * @request GET:/routes/clients/
   */
  list_clients = (params: RequestParams = {}) =>
    this.request<ListClientsData, any>({
      path: `/routes/clients/`,
      method: "GET",
      ...params,
    });

  /**
   * @description Create a new client. Optionally creates a default billing rate for the client. Args: body: Client details including optional default billing rate user: The authenticated user Returns: The newly created client
   *
   * @tags dbtn/module:clients, dbtn/hasAuth
   * @name create_client
   * @summary Create Client
   * @request POST:/routes/clients/
   */
  create_client = (data: CreateClientRequest, params: RequestParams = {}) =>
    this.request<CreateClientData, CreateClientError>({
      path: `/routes/clients/`,
      method: "POST",
      body: data,
      type: ContentType.Json,
      ...params,
    });

  /**
   * @description Get a specific client with their billing rates. Args: client_id: The ID of the client to retrieve user: The authenticated user Returns: Client details along with all associated billing rates Raises: HTTPException: 404 if client not found or doesn't belong to user
   *
   * @tags dbtn/module:clients, dbtn/hasAuth
   * @name get_client
   * @summary Get Client
   * @request GET:/routes/clients/{client_id}
   */
  get_client = ({ clientId, ...query }: GetClientParams, params: RequestParams = {}) =>
    this.request<GetClientData, GetClientError>({
      path: `/routes/clients/${clientId}`,
      method: "GET",
      ...params,
    });

  /**
   * @description Update a client's information. Args: client_id: The ID of the client to update body: Fields to update (only provided fields will be updated) user: The authenticated user Returns: The updated client Raises: HTTPException: 404 if client not found
   *
   * @tags dbtn/module:clients, dbtn/hasAuth
   * @name update_client
   * @summary Update Client
   * @request PUT:/routes/clients/{client_id}
   */
  update_client = ({ clientId, ...query }: UpdateClientParams, data: UpdateClientRequest, params: RequestParams = {}) =>
    this.request<UpdateClientData, UpdateClientError>({
      path: `/routes/clients/${clientId}`,
      method: "PUT",
      body: data,
      type: ContentType.Json,
      ...params,
    });

  /**
   * @description Delete a client. This will also delete all associated billing rates due to CASCADE. Args: client_id: The ID of the client to delete user: The authenticated user Returns: Success message Raises: HTTPException: 404 if client not found
   *
   * @tags dbtn/module:clients, dbtn/hasAuth
   * @name delete_client
   * @summary Delete Client
   * @request DELETE:/routes/clients/{client_id}
   */
  delete_client = ({ clientId, ...query }: DeleteClientParams, params: RequestParams = {}) =>
    this.request<DeleteClientData, DeleteClientError>({
      path: `/routes/clients/${clientId}`,
      method: "DELETE",
      ...params,
    });

  /**
   * No description
   *
   * @tags dbtn/module:clients, dbtn/hasAuth
   * @name restore_client
   * @summary Restore Client
   * @request POST:/routes/clients/{client_id}/restore
   */
  restore_client = ({ clientId, ...query }: RestoreClientParams, params: RequestParams = {}) =>
    this.request<RestoreClientData, RestoreClientError>({
      path: `/routes/clients/${clientId}/restore`,
      method: "POST",
      ...params,
    });

  /**
   * @description Get all billing rates for a specific client. Args: client_id: The ID of the client user: The authenticated user Returns: List of billing rates for the client Raises: HTTPException: 404 if client not found
   *
   * @tags dbtn/module:clients, dbtn/hasAuth
   * @name get_client_rates
   * @summary Get Client Rates
   * @request GET:/routes/clients/{client_id}/rates
   */
  get_client_rates = ({ clientId, ...query }: GetClientRatesParams, params: RequestParams = {}) =>
    this.request<GetClientRatesData, GetClientRatesError>({
      path: `/routes/clients/${clientId}/rates`,
      method: "GET",
      ...params,
    });

  /**
   * @description Create a new billing rate for a client. If marked as default, will unmark any existing default rates. Args: client_id: The ID of the client body: Billing rate details user: The authenticated user Returns: The newly created billing rate Raises: HTTPException: 404 if client not found
   *
   * @tags dbtn/module:clients, dbtn/hasAuth
   * @name create_billing_rate
   * @summary Create Billing Rate
   * @request POST:/routes/clients/{client_id}/rates
   */
  create_billing_rate = (
    { clientId, ...query }: CreateBillingRateParams,
    data: CreateBillingRateRequest,
    params: RequestParams = {},
  ) =>
    this.request<CreateBillingRateData, CreateBillingRateError>({
      path: `/routes/clients/${clientId}/rates`,
      method: "POST",
      body: data,
      type: ContentType.Json,
      ...params,
    });

  /**
   * @description Update a billing rate for a client. If marked as default, will unmark other default rates.
   *
   * @tags dbtn/module:clients, dbtn/hasAuth
   * @name update_billing_rate
   * @summary Update Billing Rate
   * @request PUT:/routes/clients/{client_id}/rates/{rate_id}
   */
  update_billing_rate = (
    { clientId, rateId, ...query }: UpdateBillingRateParams,
    data: UpdateBillingRateRequest,
    params: RequestParams = {},
  ) =>
    this.request<UpdateBillingRateData, UpdateBillingRateError>({
      path: `/routes/clients/${clientId}/rates/${rateId}`,
      method: "PUT",
      body: data,
      type: ContentType.Json,
      ...params,
    });

  /**
   * @description Delete a billing rate for a client.
   *
   * @tags dbtn/module:clients, dbtn/hasAuth
   * @name delete_billing_rate
   * @summary Delete Billing Rate
   * @request DELETE:/routes/clients/{client_id}/rates/{rate_id}
   */
  delete_billing_rate = ({ clientId, rateId, ...query }: DeleteBillingRateParams, params: RequestParams = {}) =>
    this.request<DeleteBillingRateData, DeleteBillingRateError>({
      path: `/routes/clients/${clientId}/rates/${rateId}`,
      method: "DELETE",
      ...params,
    });

  /**
   * @description Start a new work session. Args: body: Session details including client_id and optional location user: The authenticated user Returns: The newly created active work session Raises: HTTPException: 400 if client not found or session already active
   *
   * @tags dbtn/module:sessions, dbtn/hasAuth
   * @name start_session
   * @summary Start Session
   * @request POST:/routes/sessions/start
   */
  start_session = (data: StartSessionRequest, params: RequestParams = {}) =>
    this.request<StartSessionData, StartSessionError>({
      path: `/routes/sessions/start`,
      method: "POST",
      body: data,
      type: ContentType.Json,
      ...params,
    });

  /**
   * @description End an active work session. Args: session_id: The ID of the session to end user: The authenticated user body: Optional notes to add when ending the session Returns: The completed work session with calculated durations Raises: HTTPException: 404 if session not found, 400 if already ended
   *
   * @tags dbtn/module:sessions, dbtn/hasAuth
   * @name end_session
   * @summary End Session
   * @request POST:/routes/sessions/{session_id}/end
   */
  end_session = ({ sessionId, ...query }: EndSessionParams, data: EndSessionRequest, params: RequestParams = {}) =>
    this.request<EndSessionData, EndSessionError>({
      path: `/routes/sessions/${sessionId}/end`,
      method: "POST",
      body: data,
      type: ContentType.Json,
      ...params,
    });

  /**
   * @description Get all currently active work sessions for the user. Returns: List of active sessions (sessions without end_time)
   *
   * @tags dbtn/module:sessions, dbtn/hasAuth
   * @name get_active_sessions
   * @summary Get Active Sessions
   * @request GET:/routes/sessions/active
   */
  get_active_sessions = (params: RequestParams = {}) =>
    this.request<GetActiveSessionsData, any>({
      path: `/routes/sessions/active`,
      method: "GET",
      ...params,
    });

  /**
   * @description Get recent work sessions for the user. Args: user: The authenticated user limit: Maximum number of sessions to return (default: 10) Returns: List of recent sessions ordered by start time
   *
   * @tags dbtn/module:sessions, dbtn/hasAuth
   * @name get_recent_sessions
   * @summary Get Recent Sessions
   * @request GET:/routes/sessions/recent
   */
  get_recent_sessions = (query: GetRecentSessionsParams, params: RequestParams = {}) =>
    this.request<GetRecentSessionsData, GetRecentSessionsError>({
      path: `/routes/sessions/recent`,
      method: "GET",
      query: query,
      ...params,
    });

  /**
   * @description List work sessions with optional filtering. Args: user: The authenticated user start_date: Filter by start date (inclusive) end_date: Filter by end date (inclusive) client_id: Filter by client Returns: List of sessions matching criteria
   *
   * @tags dbtn/module:sessions, dbtn/hasAuth
   * @name list_sessions
   * @summary List Sessions
   * @request GET:/routes/sessions/
   */
  list_sessions = (query: ListSessionsParams, params: RequestParams = {}) =>
    this.request<ListSessionsData, ListSessionsError>({
      path: `/routes/sessions/`,
      method: "GET",
      query: query,
      ...params,
    });

  /**
   * @description Get a specific session with its breaks. Args: session_id: The ID of the session to retrieve user: The authenticated user Returns: Session details along with all associated breaks Raises: HTTPException: 404 if session not found
   *
   * @tags dbtn/module:sessions, dbtn/hasAuth
   * @name get_session
   * @summary Get Session
   * @request GET:/routes/sessions/{session_id}
   */
  get_session = ({ sessionId, ...query }: GetSessionParams, params: RequestParams = {}) =>
    this.request<GetSessionData, GetSessionError>({
      path: `/routes/sessions/${sessionId}`,
      method: "GET",
      ...params,
    });

  /**
   * @description Update session details. Args: session_id: The ID of the session to update body: Fields to update user: The authenticated user Returns: The updated session Raises: HTTPException: 404 if session not found
   *
   * @tags dbtn/module:sessions, dbtn/hasAuth
   * @name update_session
   * @summary Update Session
   * @request PUT:/routes/sessions/{session_id}
   */
  update_session = (
    { sessionId, ...query }: UpdateSessionParams,
    data: UpdateSessionRequest,
    params: RequestParams = {},
  ) =>
    this.request<UpdateSessionData, UpdateSessionError>({
      path: `/routes/sessions/${sessionId}`,
      method: "PUT",
      body: data,
      type: ContentType.Json,
      ...params,
    });

  /**
   * @description Soft delete (archive) a session.
   *
   * @tags dbtn/module:sessions, dbtn/hasAuth
   * @name delete_session
   * @summary Delete Session
   * @request DELETE:/routes/sessions/{session_id}
   */
  delete_session = ({ sessionId, ...query }: DeleteSessionParams, params: RequestParams = {}) =>
    this.request<DeleteSessionData, DeleteSessionError>({
      path: `/routes/sessions/${sessionId}`,
      method: "DELETE",
      ...params,
    });

  /**
   * @description Start a break for a session. Args: session_id: The ID of the session body: Break details user: The authenticated user Returns: The newly created active break Raises: HTTPException: 404 if session not found, 400 if session ended or break active
   *
   * @tags dbtn/module:sessions, dbtn/hasAuth
   * @name start_break
   * @summary Start Break
   * @request POST:/routes/sessions/{session_id}/break/start
   */
  start_break = ({ sessionId, ...query }: StartBreakParams, data: StartBreakRequest, params: RequestParams = {}) =>
    this.request<StartBreakData, StartBreakError>({
      path: `/routes/sessions/${sessionId}/break/start`,
      method: "POST",
      body: data,
      type: ContentType.Json,
      ...params,
    });

  /**
   * @description End the active break for a session. Args: session_id: The ID of the session user: The authenticated user Returns: The completed break Raises: HTTPException: 404 if session not found, 400 if no active break
   *
   * @tags dbtn/module:sessions, dbtn/hasAuth
   * @name end_break
   * @summary End Break
   * @request POST:/routes/sessions/{session_id}/break/end
   */
  end_break = ({ sessionId, ...query }: EndBreakParams, params: RequestParams = {}) =>
    this.request<EndBreakData, EndBreakError>({
      path: `/routes/sessions/${sessionId}/break/end`,
      method: "POST",
      ...params,
    });

  /**
   * No description
   *
   * @tags dbtn/module:sessions, dbtn/hasAuth
   * @name restore_session
   * @summary Restore Session
   * @request POST:/routes/sessions/{session_id}/restore
   */
  restore_session = ({ sessionId, ...query }: RestoreSessionParams, params: RequestParams = {}) =>
    this.request<RestoreSessionData, RestoreSessionError>({
      path: `/routes/sessions/${sessionId}/restore`,
      method: "POST",
      ...params,
    });

  /**
   * @description Export all work sessions as CSV.
   *
   * @tags stream, dbtn/module:sessions, dbtn/hasAuth
   * @name export_sessions_csv
   * @summary Export Sessions Csv
   * @request GET:/routes/sessions/export/csv
   */
  export_sessions_csv = (params: RequestParams = {}) =>
    this.requestStream<ExportSessionsCsvData, any>({
      path: `/routes/sessions/export/csv`,
      method: "GET",
      ...params,
    });

  /**
   * @description One-time migration endpoint to copy clients from db.storage to Firestore. This ensures existing users don't lose their client data when switching to Firestore.
   *
   * @tags dbtn/module:migrate_clients
   * @name migrate_clients_to_firestore
   * @summary Migrate Clients To Firestore
   * @request POST:/routes/migrate-clients-to-firestore
   */
  migrate_clients_to_firestore = (params: RequestParams = {}) =>
    this.request<MigrateClientsToFirestoreData, any>({
      path: `/routes/migrate-clients-to-firestore`,
      method: "POST",
      ...params,
    });

  /**
   * @description Get the user's business profile settings from Firestore shared storage.
   *
   * @tags dbtn/module:settings, dbtn/hasAuth
   * @name get_business_profile
   * @summary Get Business Profile
   * @request GET:/routes/business-profile
   */
  get_business_profile = (params: RequestParams = {}) =>
    this.request<GetBusinessProfileData, any>({
      path: `/routes/business-profile`,
      method: "GET",
      ...params,
    });

  /**
   * @description Update the user's business profile settings in Firestore shared storage.
   *
   * @tags dbtn/module:settings, dbtn/hasAuth
   * @name update_business_profile
   * @summary Update Business Profile
   * @request PUT:/routes/business-profile
   */
  update_business_profile = (data: BusinessProfile, params: RequestParams = {}) =>
    this.request<UpdateBusinessProfileData, UpdateBusinessProfileError>({
      path: `/routes/business-profile`,
      method: "PUT",
      body: data,
      type: ContentType.Json,
      ...params,
    });

  /**
   * @description List all packing slips with status 'unlinked' for the authenticated user. Returns: List of packing slip summaries for display in picker UI
   *
   * @tags dbtn/module:packing_slips
   * @name list_uninvoiced_slips
   * @summary List Uninvoiced Slips
   * @request GET:/routes/packing-slips/uninvoiced
   */
  list_uninvoiced_slips = (params: RequestParams = {}) =>
    this.request<ListUninvoicedSlipsData, any>({
      path: `/routes/packing-slips/uninvoiced`,
      method: "GET",
      ...params,
    });

  /**
   * @description Get detailed information for a specific packing slip. Args: slip_id: Firestore document ID of the packing slip Returns: Packing slip data transformed to invoice format, or None if not found
   *
   * @tags dbtn/module:packing_slips
   * @name get_packing_slip_details
   * @summary Get Packing Slip Details
   * @request GET:/routes/packing-slips/{slip_id}
   */
  get_packing_slip_details = ({ slipId, ...query }: GetPackingSlipDetailsParams, params: RequestParams = {}) =>
    this.request<GetPackingSlipDetailsData, GetPackingSlipDetailsError>({
      path: `/routes/packing-slips/${slipId}`,
      method: "GET",
      ...params,
    });

  /**
   * @description Create a new invoice from selected work sessions.
   *
   * @tags dbtn/module:invoices
   * @name create_invoice
   * @summary Create Invoice
   * @request POST:/routes/invoices/create
   */
  create_invoice = (data: CreateInvoiceRequest, params: RequestParams = {}) =>
    this.request<CreateInvoiceData, CreateInvoiceError>({
      path: `/routes/invoices/create`,
      method: "POST",
      body: data,
      type: ContentType.Json,
      ...params,
    });

  /**
   * @description List all invoices for the authenticated user.
   *
   * @tags dbtn/module:invoices
   * @name list_invoices
   * @summary List Invoices
   * @request GET:/routes/invoices/
   */
  list_invoices = (params: RequestParams = {}) =>
    this.request<ListInvoicesData, any>({
      path: `/routes/invoices/`,
      method: "GET",
      ...params,
    });

  /**
   * @description Get custom columns for a client.
   *
   * @tags dbtn/module:invoices
   * @name get_client_columns
   * @summary Get Client Columns
   * @request GET:/routes/invoices/clients/{client_id}/columns
   */
  get_client_columns = ({ clientId, ...query }: GetClientColumnsParams, params: RequestParams = {}) =>
    this.request<GetClientColumnsData, GetClientColumnsError>({
      path: `/routes/invoices/clients/${clientId}/columns`,
      method: "GET",
      ...params,
    });

  /**
   * @description Update custom columns for a client.
   *
   * @tags dbtn/module:invoices
   * @name update_client_columns
   * @summary Update Client Columns
   * @request PUT:/routes/invoices/clients/{client_id}/columns
   */
  update_client_columns = (
    { clientId, ...query }: UpdateClientColumnsParams,
    data: UpdateClientColumnsRequest,
    params: RequestParams = {},
  ) =>
    this.request<UpdateClientColumnsData, UpdateClientColumnsError>({
      path: `/routes/invoices/clients/${clientId}/columns`,
      method: "PUT",
      body: data,
      type: ContentType.Json,
      ...params,
    });

  /**
   * @description Get a specific invoice with all details.
   *
   * @tags dbtn/module:invoices
   * @name get_invoice
   * @summary Get Invoice
   * @request GET:/routes/invoices/{invoice_id}
   */
  get_invoice = ({ invoiceId, ...query }: GetInvoiceParams, params: RequestParams = {}) =>
    this.request<GetInvoiceData, GetInvoiceError>({
      path: `/routes/invoices/${invoiceId}`,
      method: "GET",
      ...params,
    });

  /**
   * @description Update an existing invoice.
   *
   * @tags dbtn/module:invoices
   * @name update_invoice
   * @summary Update Invoice
   * @request PUT:/routes/invoices/{invoice_id}
   */
  update_invoice = (
    { invoiceId, ...query }: UpdateInvoiceParams,
    data: UpdateInvoiceRequest,
    params: RequestParams = {},
  ) =>
    this.request<UpdateInvoiceData, UpdateInvoiceError>({
      path: `/routes/invoices/${invoiceId}`,
      method: "PUT",
      body: data,
      type: ContentType.Json,
      ...params,
    });

  /**
   * @description Soft delete an invoice.
   *
   * @tags dbtn/module:invoices
   * @name delete_invoice
   * @summary Delete Invoice
   * @request DELETE:/routes/invoices/{invoice_id}
   */
  delete_invoice = ({ invoiceId, ...query }: DeleteInvoiceParams, params: RequestParams = {}) =>
    this.request<DeleteInvoiceData, DeleteInvoiceError>({
      path: `/routes/invoices/${invoiceId}`,
      method: "DELETE",
      ...params,
    });
}
