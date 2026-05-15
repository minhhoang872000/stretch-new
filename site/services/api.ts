import axios from 'axios'
import type { AxiosInstance } from 'axios'

/**
 * Centralized API service for all backend calls.
 *
 * When NUXT_PUBLIC_TRACKING_API_URL is set, all calls go to the external
 * lead-tracker-api backend. When empty, falls back to Nuxt's built-in
 * server routes (demo/template mode).
 */

let _instance: AxiosInstance | null = null

export function getApiInstance(baseURL: string): AxiosInstance {
  if (_instance) return _instance

  _instance = axios.create({
    baseURL,
    timeout: 10000,
    headers: { 'Content-Type': 'application/json' },
  })

  return _instance
}

/**
 * Check if external API is configured.
 */
export function useApiBase() {
  const config = useRuntimeConfig()
  const apiUrl = config.public.trackingApiUrl as string

  return {
    /** True when external lead-tracker-api is configured */
    isExternal: !!apiUrl,
    /** Base URL of the API (external or empty for Nuxt internal) */
    baseUrl: apiUrl,
  }
}
