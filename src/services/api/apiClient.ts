import { authStorage } from "@/services/auth/authStorage";

const API_URL = import.meta.env.VITE_API_URL;

export const SESSION_INVALID_EVENT = "jornadas:session-invalid";

export interface ApiRequestOptions {
  invalidateSessionOnUnauthorized?: boolean;
}

export class ApiError extends Error {
  status: number;
  data: unknown;

  constructor(status: number, data: unknown) {
    super(`Error HTTP: ${status}`);
    this.name = "ApiError";
    this.status = status;
    this.data = data;
  }
}

function notifySessionInvalid(
  response: Response,
  hasAuthToken: boolean,
  options?: ApiRequestOptions,
): void {
  if (
    response.status === 401 &&
    hasAuthToken &&
    options?.invalidateSessionOnUnauthorized !== false &&
    typeof window !== "undefined"
  ) {
    window.dispatchEvent(new Event(SESSION_INVALID_EVENT));
  }
}

async function get<T>(
  endpoint: string,
  options?: ApiRequestOptions,
): Promise<T> {
  const auth = authStorage.get();

  const headers: HeadersInit = {};

  if (auth?.token) {
    headers.Authorization = `Bearer ${auth.token}`;
  }

  const response = await fetch(`${API_URL}${endpoint}`, {
    headers,
  });

  notifySessionInvalid(response, Boolean(auth?.token), options);

  if (!response.ok) {
    throw new ApiError(response.status, await response.json());
  }

  return response.json();
}

async function post<TResponse>(
  endpoint: string,
  body: unknown,
  options?: ApiRequestOptions,
): Promise<TResponse> {
  const auth = authStorage.get();

  const headers: HeadersInit = {
    "Content-Type": "application/json",
  };

  if (auth?.token) {
    headers.Authorization = `Bearer ${auth.token}`;
  }

  const response = await fetch(`${API_URL}${endpoint}`, {
    method: "POST",
    headers,
    body: JSON.stringify(body),
  });

  notifySessionInvalid(response, Boolean(auth?.token), options);

  const data = await response.json();

  if (!response.ok) {
    throw new ApiError(response.status, data);
  }

  return data;
}

async function put<TResponse>(
  endpoint: string,
  body: unknown,
  options?: ApiRequestOptions,
): Promise<TResponse> {
  const auth = authStorage.get();

  const headers: HeadersInit = {
    "Content-Type": "application/json",
  };

  if (auth?.token) {
    headers.Authorization = `Bearer ${auth.token}`;
  }

  const response = await fetch(`${API_URL}${endpoint}`, {
    method: "PUT",
    headers,
    body: JSON.stringify(body),
  });

  notifySessionInvalid(response, Boolean(auth?.token), options);

  const data = await response.json();

  if (!response.ok) {
    throw new ApiError(response.status, data);
  }

  return data;
}


async function postBlob(
  endpoint: string,
  body: unknown,
  options?: ApiRequestOptions,
): Promise<Blob> {
  const auth = authStorage.get();

  const headers: HeadersInit = {
    "Content-Type": "application/json",
  };

  if (auth?.token) {
    headers.Authorization = `Bearer ${auth.token}`;
  }

  const response = await fetch(`${API_URL}${endpoint}`, {
    method: "POST",
    headers,
    body: JSON.stringify(body),
  });

  notifySessionInvalid(response, Boolean(auth?.token), options);

  if (!response.ok) {
    const data = await response.json();
    throw new ApiError(response.status, data);
  }

  return response.blob();
}



export const apiClient = {
  get,
  post,
  put,
  postBlob,
};