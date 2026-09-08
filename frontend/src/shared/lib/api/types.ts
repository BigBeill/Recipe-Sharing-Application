export interface TypeApiRequestConfig {
   method: string;
   url: string;
   body?: Record<string, unknown> | FormData;
}

export type TypeApiCaller = <T>(config: TypeApiRequestConfig) => Promise<T>;

export interface TypePreparedRequest {
   url: string;
   headers: Record<string, string>;
   options: RequestInit;
}

export interface TypeApiAdapter {
   prepare(request: TypePreparedRequest, config: TypeApiRequestConfig): void | Promise<void>;
   recover?<T>(error: unknown, config: TypeApiRequestConfig, retry: () => Promise<T>): Promise<T>;
}