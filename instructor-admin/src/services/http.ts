import { computed, ref } from 'vue'

/**
 * The console's HTTP boundary to `lead-tracker-api`.
 *
 * Separate from `services/api.ts` on purpose: that file is the mock store and
 * still answers most screens, while everything here talks to the real backend.
 * As each mock function grows a real endpoint it moves onto `apiFetch`, and the
 * two files meet in the middle instead of being swapped in one risky commit.
 *
 * The API answers in one envelope — `{ success, data }` or
 * `{ success, error: { code, message } }` — so unwrapping it once here keeps
 * every caller reading plain data and catching one error type.
 */

const RAW_BASE = (import.meta.env.VITE_API_BASE_URL as string | undefined)?.trim()

/** No trailing slash: every path below starts with one. */
export const API_BASE = (RAW_BASE || 'http://localhost:3001/api/v1').replace(/\/+$/, '')

const TOKEN_KEY = 'stretch-instructor-token'

function readToken(): string | null {
  try {
    return localStorage.getItem(TOKEN_KEY)
  } catch {
    return null
  }
}

const token = ref<string | null>(readToken())

/** True once a real admin login has succeeded — the video screens gate on this. */
export const hasApi = computed(() => token.value !== null)

export function getApiToken(): string | null {
  return token.value
}

export function setApiToken(next: string | null): void {
  token.value = next
  try {
    if (next) localStorage.setItem(TOKEN_KEY, next)
    else localStorage.removeItem(TOKEN_KEY)
  } catch {
    // Blocked storage — the token still holds for this tab.
  }
}

export class ApiError extends Error {
  status: number
  code: string

  constructor(message: string, status = 0, code = 'ERROR') {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.code = code
  }
}

interface Envelope<T> {
  success: boolean
  data?: T
  error?: { code: string; message: string }
}

export interface FetchOptions extends Omit<RequestInit, 'body'> {
  body?: unknown
  /** Send the bearer token (default true). Login is the one caller that cannot. */
  auth?: boolean
}

export async function apiFetch<T>(path: string, options: FetchOptions = {}): Promise<T> {
  const { body, auth = true, headers, ...rest } = options

  const requestHeaders: Record<string, string> = { ...(headers as Record<string, string>) }
  if (body !== undefined) requestHeaders['Content-Type'] = 'application/json'
  if (auth && token.value) requestHeaders.Authorization = `Bearer ${token.value}`

  let response: Response
  try {
    response = await fetch(`${API_BASE}${path}`, {
      ...rest,
      headers: requestHeaders,
      body: body === undefined ? undefined : JSON.stringify(body),
    })
  } catch {
    // A dead API and a CORS rejection look identical from here (both surface
    // as "Failed to fetch"); the details are in the browser console for whoever
    // operates the server, not in the message shown to the person signing in.
    throw new ApiError(
      'Không kết nối được máy chủ. Vui lòng thử lại sau.',
      0,
      'NETWORK_ERROR',
    )
  }

  let payload: Envelope<T> | null = null
  try {
    payload = (await response.json()) as Envelope<T>
  } catch {
    payload = null
  }

  if (!response.ok || payload?.success === false) {
    // An expired token must not leave the console pretending it is connected.
    if (response.status === 401) setApiToken(null)
    throw new ApiError(
      payload?.error?.message || `API trả về lỗi ${response.status}`,
      response.status,
      payload?.error?.code || 'HTTP_ERROR',
    )
  }

  return payload?.data as T
}
