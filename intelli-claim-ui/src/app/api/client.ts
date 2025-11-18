import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse, AxiosError } from 'axios';
import { NextRequest, NextResponse } from 'next/server';
import { AuthManager } from '@/Auth/AuthManager';
import { KEYCLOAK_CLIENT_SECRET } from '@/constants';

interface ApiClientConfig {
  baseURL?: string;
  timeout?: number;
}

interface RequestContext {
  request: NextRequest;
  response?: NextResponse;
}

interface QueueItem {
  resolve: (value?: unknown) => void;
  reject: (error?: unknown) => void;
}

class ApiClient {
  private axiosInstance: AxiosInstance;
  private authManager: AuthManager;
  private isRefreshing: boolean = false;
  private failedQueue: QueueItem[] = [];

  constructor(config: ApiClientConfig = {}) {
    this.authManager = AuthManager.getInstance();
    
    this.axiosInstance = axios.create({
      baseURL: config.baseURL || 'http://localhost:8082/api',
      timeout: config.timeout || 10000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    this.setupInterceptors();
  }

  private setupInterceptors() {
    // Request interceptor to add auth headers
    this.axiosInstance.interceptors.request.use(
      (config) => {
        // The token will be added in the request method based on context
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // Response interceptor to handle token refresh
    this.axiosInstance.interceptors.response.use(
      (response) => response,
      async (error: AxiosError) => {
        const originalRequest = error.config as AxiosRequestConfig & { 
          _retry?: boolean; 
          _context?: RequestContext;
        };

        if (error.response?.status === 401 && !originalRequest._retry && originalRequest._context) {
          if (this.isRefreshing) {
            // If already refreshing, queue this request
            return new Promise((resolve, reject) => {
              this.failedQueue.push({ resolve, reject });
            }).then(() => {
              return this.axiosInstance.request(originalRequest);
            }).catch(err => {
              return Promise.reject(err);
            });
          }

          originalRequest._retry = true;
          this.isRefreshing = true;

          try {
            const { request, response } = originalRequest._context;
            const newResponse = response || new NextResponse();
            
            await this.authManager.refreshToken(request, newResponse);
            
            // Process failed queue
            this.processQueue(null);
            
            // Get new token and retry original request
            const newToken = this.authManager.getToken(request);
            if (newToken) {
              originalRequest.headers = {
                ...originalRequest.headers,
                'Authorization': `Bearer ${newToken}`,
              };
            }

            return this.axiosInstance.request(originalRequest);
          } catch (refreshError) {
            // Refresh failed, process queue with error
            this.processQueue(refreshError);
            
            // Clear cookies and return error
            if (originalRequest._context?.response) {
              await this.authManager.logout(
                originalRequest._context.request, 
                originalRequest._context.response
              );
            }
            
            return Promise.reject(refreshError);
          } finally {
            this.isRefreshing = false;
          }
        }

        return Promise.reject(error);
      }
    );
  }

  private processQueue(error: unknown) {
    this.failedQueue.forEach(({ resolve, reject }) => {
      if (error) {
        reject(error);
      } else {
        resolve();
      }
    });
    
    this.failedQueue = [];
  }

  private getAuthHeaders(request: NextRequest): Record<string, string> {
    const token = request.cookies.get("access_token")?.value;
    const headers: Record<string, string> = {
      'client_id': 'capstone-3',
      'client_secret': KEYCLOAK_CLIENT_SECRET,
    };
    
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    
    return headers;
  }

  async get<T = unknown>(
    url: string, 
    context: RequestContext, 
    config?: AxiosRequestConfig
  ): Promise<AxiosResponse<T>> {
    const headers = this.getAuthHeaders(context.request);
    
    return this.axiosInstance.get<T>(url, {
      ...config,
      headers: { ...headers, ...config?.headers },
      _context: context,
    } as AxiosRequestConfig & { _context: RequestContext });
  }

  async post<T = unknown>(
    url: string, 
    data?: unknown, 
    context?: RequestContext, 
    config?: AxiosRequestConfig
  ): Promise<AxiosResponse<T>> {
    const headers = context ? this.getAuthHeaders(context.request) : {};
    
    return this.axiosInstance.post<T>(url, data, {
      ...config,
      headers: { ...headers, ...config?.headers },
      ...(context && { _context: context }),
    } as AxiosRequestConfig & { _context?: RequestContext });
  }

  async put<T = unknown>(
    url: string, 
    data?: unknown, 
    context?: RequestContext, 
    config?: AxiosRequestConfig
  ): Promise<AxiosResponse<T>> {
    const headers = context ? this.getAuthHeaders(context.request) : {};
    
    return this.axiosInstance.put<T>(url, data, {
      ...config,
      headers: { ...headers, ...config?.headers },
      ...(context && { _context: context }),
    } as AxiosRequestConfig & { _context?: RequestContext });
  }

  async delete<T = unknown>(
    url: string, 
    context?: RequestContext, 
    config?: AxiosRequestConfig
  ): Promise<AxiosResponse<T>> {
    const headers = context ? this.getAuthHeaders(context.request) : {};
    
    return this.axiosInstance.delete<T>(url, {
      ...config,
      headers: { ...headers, ...config?.headers },
      ...(context && { _context: context }),
    } as AxiosRequestConfig & { _context?: RequestContext });
  }

  async patch<T = unknown>(
    url: string, 
    data?: unknown, 
    context?: RequestContext, 
    config?: AxiosRequestConfig
  ): Promise<AxiosResponse<T>> {
    const headers = context ? this.getAuthHeaders(context.request) : {};
    
    return this.axiosInstance.patch<T>(url, data, {
      ...config,
      headers: { ...headers, ...config?.headers },
      ...(context && { _context: context }),
    } as AxiosRequestConfig & { _context?: RequestContext });
  }

  // Method for external API calls (like Keycloak) without token refresh logic
  async external<T = unknown>(
    method: 'GET' | 'POST' | 'PUT' | 'DELETE',
    url: string,
    data?: unknown,
    config?: AxiosRequestConfig
  ): Promise<AxiosResponse<T>> {
    // Create a separate axios instance for external calls to avoid interceptors
    const externalClient = axios.create({
      timeout: 10000,
      ...config,
    });

    switch (method.toUpperCase()) {
      case 'GET':
        return externalClient.get<T>(url, config);
      case 'POST':
        return externalClient.post<T>(url, data, config);
      case 'PUT':
        return externalClient.put<T>(url, data, config);
      case 'DELETE':
        return externalClient.delete<T>(url, config);
      default:
        throw new Error(`Unsupported method: ${method}`);
    }
  }
}

// Export a singleton instance
export const apiClient = new ApiClient();

// Export the class for custom instances if needed
export { ApiClient };
export type { RequestContext, ApiClientConfig };
