const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:6000";
const ACCESS_TOKEN_KEY = "expense-tracker-access-token";

function getAccessToken() {
  if (typeof window === "undefined") {
    return null;
  }

  return window.localStorage.getItem(ACCESS_TOKEN_KEY);
}

async function fetcher<T>(
  endpoint: string,
  options?: RequestInit
): Promise<T> {
  const token = getAccessToken();

  const res = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options?.headers ?? {}),
    },
  });

  if (!res.ok) {
    if (res.status === 401 && typeof window !== "undefined") {
      window.localStorage.removeItem(ACCESS_TOKEN_KEY);
    }

    const error = await res.json().catch(() => ({}));
    throw new Error(error.message || `API Error: ${res.status}`);
  }

  if (res.status === 204) {
    return undefined as T;
  }

  return res.json();
}

export const api = {
  get: <T>(endpoint: string) => fetcher<T>(endpoint),

  post: <T>(endpoint: string, body: unknown) =>
    fetcher<T>(endpoint, {
      method: "POST",
      body: JSON.stringify(body),
    }),

  put: <T>(endpoint: string, body: unknown) =>
    fetcher<T>(endpoint, {
      method: "PUT",
      body: JSON.stringify(body),
    }),

  patch: <T>(endpoint: string, body?: unknown) =>
    fetcher<T>(endpoint, {
      method: "PATCH",
      body: body !== undefined ? JSON.stringify(body) : undefined,
    }),

  delete: <T>(endpoint: string) =>
    fetcher<T>(endpoint, { method: "DELETE" }),
};
