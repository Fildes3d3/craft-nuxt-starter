import type { H3Event } from 'h3'

/**
 * Server-side call to Craft's GraphQL API over the internal Docker network,
 * authenticated with the private schema token (NUXT_GQL_TOKEN). Forwards a
 * Craft preview token (header, ?token= or the preview cookie) so drafts render
 * in live preview.
 */
export async function craftGql<T>(event: H3Event, query: string, variables?: Record<string, unknown>) {
  const config = useRuntimeConfig()

  const headers: Record<string, string> = { 'Content-Type': 'application/json' }
  if (config.gqlToken) headers.Authorization = `Bearer ${config.gqlToken}`

  const preview = getHeader(event, 'x-craft-token') || getQuery(event).token || getCookie(event, 'craft-preview-token')
  if (typeof preview === 'string' && /^[A-Za-z0-9_-]{1,128}$/.test(preview)) {
    headers['X-Craft-Token'] = preview
  }

  return $fetch<{ data?: T, errors?: { message: string }[] }>(config.gqlApiHostServer, {
    method: 'POST',
    headers,
    body: variables ? { query, variables } : { query },
  })
}
