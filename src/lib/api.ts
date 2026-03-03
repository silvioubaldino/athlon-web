const API_BASE = process.env.NEXT_PUBLIC_API_URL!

/**
 * Typed fetch wrapper. All API calls in the app go through this module.
 * Throws ApiError for non-2xx responses.
 */
export async function apiFetch<T>(
  path: string,
  options?: RequestInit & { token?: string }
): Promise<T> {
  const { token, ...fetchOptions } = options ?? {}

  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...(fetchOptions.headers ?? {}),
  }

  if (token) {
    (headers as Record<string, string>)['Authorization'] = `Bearer ${token}`
  }

  const response = await fetch(`${API_BASE}${path}`, {
    ...fetchOptions,
    headers,
  })

  if (!response.ok) {
    let message = `HTTP ${response.status}`
    try {
      const body = await response.json()
      message = body?.message ?? body?.error ?? message
    } catch {
      // ignore parse errors
    }
    throw new ApiError(response.status, message)
  }

  // 204 No Content — return empty object
  if (response.status === 204) {
    return {} as T
  }

  return response.json() as Promise<T>
}

export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
    public details?: Record<string, unknown>
  ) {
    super(message)
    this.name = 'ApiError'
  }
}
