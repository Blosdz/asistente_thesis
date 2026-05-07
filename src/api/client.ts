const API_URL = import.meta.env.VITE_API_URL;

export const TOKEN_STORAGE_KEY = 'thesis_token';
export const USER_STORAGE_KEY = 'thesis_user';

export class ApiError extends Error {
  status: number;
  data: unknown;

  constructor(message: string, status: number, data: unknown = null) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.data = data;
  }
}

type RequestOptions = {
  method?: string;
  body?: unknown;
  headers?: Record<string, string>;
  auth?: boolean;
};

export function getStoredToken() {
  if (typeof window === 'undefined') return null;
  return window.localStorage.getItem(TOKEN_STORAGE_KEY);
}

export function getStoredUser() {
  if (typeof window === 'undefined') return null;

  const raw = window.localStorage.getItem(USER_STORAGE_KEY);
  if (!raw) return null;

  try {
    return JSON.parse(raw);
  } catch {
    window.localStorage.removeItem(USER_STORAGE_KEY);
    return null;
  }
}

export function setStoredSession(token: string, usuario: unknown) {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(TOKEN_STORAGE_KEY, token);
  window.localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(usuario));
}

export function clearStoredSession() {
  if (typeof window === 'undefined') return;
  window.localStorage.removeItem(TOKEN_STORAGE_KEY);
  window.localStorage.removeItem(USER_STORAGE_KEY);
}

function buildUrl(path: string) {
  if (!API_URL) {
    throw new ApiError(
      'Falta configurar VITE_API_URL para consumir el backend NestJS.',
      0,
    );
  }

  const base = API_URL.replace(/\/+$/, '');
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  return `${base}${normalizedPath}`;
}

async function parseResponse(response: Response) {
  const contentType = response.headers.get('content-type') || '';
  if (response.status === 204) return null;

  if (contentType.includes('application/json')) {
    return response.json();
  }

  const text = await response.text();
  return text || null;
}

function resolveErrorMessage(data: any, fallback: string) {
  const message = data?.message || data?.error || data?.detail;
  if (Array.isArray(message)) return message.join(', ');
  return message || fallback;
}

export async function apiRequest<T = unknown>(
  path: string,
  options: RequestOptions = {},
): Promise<T> {
  const { method = 'GET', body, headers = {}, auth = true } = options;
  const token = getStoredToken();
  const requestHeaders: Record<string, string> = { ...headers };

  if (body !== undefined && !(body instanceof FormData)) {
    requestHeaders['Content-Type'] = requestHeaders['Content-Type'] || 'application/json';
  }

  if (auth && token) {
    requestHeaders.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(buildUrl(path), {
    method,
    headers: requestHeaders,
    body:
      body === undefined
        ? undefined
        : body instanceof FormData
          ? body
          : JSON.stringify(body),
  });

  const data = await parseResponse(response);

  if (!response.ok) {
    if (response.status === 401) {
      clearStoredSession();
    }

    throw new ApiError(
      resolveErrorMessage(data, 'No se pudo completar la solicitud.'),
      response.status,
      data,
    );
  }

  return data as T;
}

export function pendingEndpoint(featureName: string): never {
  throw new Error(
    `${featureName} queda pendiente: no hay endpoint NestJS documentado en .codex/resources/api-contract.md.`,
  );
}
