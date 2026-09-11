/**
 * Centralized API Client for RenewableIQ
 * Supports base URL, typed requests, timeouts via AbortSignal, and structured errors.
 */

export interface ApiClientConfig {
  baseUrl?: string;
  defaultTimeoutMs?: number;
}

export type ApiErrorCode = 
  | 'SERVICE_UNAVAILABLE'
  | 'TIMEOUT'
  | 'UNAUTHORIZED'
  | 'NOT_FOUND'
  | 'INVALID_RESPONSE'
  | 'SERVER_ERROR'
  | 'UNKNOWN';

export class ApiError extends Error {
  constructor(
    message: string,
    public code: ApiErrorCode = 'UNKNOWN',
    public status?: number,
    public data?: unknown
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

export class ApiClient {
  private baseUrl: string;
  private defaultTimeoutMs: number;

  constructor(config: ApiClientConfig = {}) {
    this.baseUrl = (
      config.baseUrl ||
      process.env.NEXT_PUBLIC_API_BASE_URL ||
      process.env.NEXT_PUBLIC_API_URL ||
      ''
    ).replace(/\/$/, '');
    this.defaultTimeoutMs = config.defaultTimeoutMs || 5000;
  }

  public isConfigured(): boolean {
    return Boolean(this.baseUrl && this.baseUrl.length > 0);
  }

  public getBaseUrl(): string {
    return this.baseUrl;
  }

  /**
   * Internal request executor with timeout and error wrapping
   */
  private async request<T>(
    endpoint: string,
    options: RequestInit = {},
    timeoutMs?: number
  ): Promise<T> {
    if (!this.isConfigured()) {
      throw new ApiError(
        'API client base URL is not configured. Falling back to deterministic demo data.',
        'SERVICE_UNAVAILABLE'
      );
    }

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), timeoutMs || this.defaultTimeoutMs);

    const formattedEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
    const url = endpoint.startsWith('http') ? endpoint : `${this.baseUrl}${formattedEndpoint}`;

    try {
      const response = await fetch(url, {
        ...options,
        signal: controller.signal,
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
          ...options.headers,
        },
      });

      if (!response.ok) {
        let errorBody: unknown;
        try {
          errorBody = await response.json();
        } catch {
          errorBody = await response.text();
        }

        let code: ApiErrorCode = 'SERVER_ERROR';
        if (response.status === 401 || response.status === 403) code = 'UNAUTHORIZED';
        if (response.status === 404) code = 'NOT_FOUND';
        if (response.status >= 500) code = 'SERVICE_UNAVAILABLE';

        throw new ApiError(
          `Request to ${endpoint} failed with status ${response.status}`,
          code,
          response.status,
          errorBody
        );
      }

      return (await response.json()) as T;
    } catch (err: unknown) {
      if (err instanceof ApiError) {
        throw err;
      }
      if (err instanceof DOMException && err.name === 'AbortError') {
        throw new ApiError(
          `Request to ${endpoint} timed out after ${timeoutMs || this.defaultTimeoutMs}ms`,
          'TIMEOUT'
        );
      }
      const message = err instanceof Error ? err.message : 'Unknown network error';
      throw new ApiError(message, 'SERVICE_UNAVAILABLE');
    } finally {
      clearTimeout(timeout);
    }
  }

  public async get<T>(endpoint: string, timeoutMs?: number): Promise<T> {
    return this.request<T>(endpoint, { method: 'GET' }, timeoutMs);
  }

  public async post<T, B = unknown>(endpoint: string, body: B, timeoutMs?: number): Promise<T> {
    return this.request<T>(
      endpoint,
      {
        method: 'POST',
        body: JSON.stringify(body),
      },
      timeoutMs
    );
  }

  public async patch<T, B = unknown>(endpoint: string, body: B, timeoutMs?: number): Promise<T> {
    return this.request<T>(
      endpoint,
      {
        method: 'PATCH',
        body: JSON.stringify(body),
      },
      timeoutMs
    );
  }
}

export const apiClient = new ApiClient();
