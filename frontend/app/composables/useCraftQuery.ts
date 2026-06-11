/**
 * Minimal GraphQL client for Craft CMS.
 *
 * Endpoint selection:
 *  - Server (SSR): private runtimeConfig `gqlApiHostServer` — the internal
 *    Docker URL (http://web/api). Overridable via NUXT_GQL_API_HOST_SERVER.
 *  - Client: public runtimeConfig `gqlApiHost` (http://localhost/api).
 *
 * Forwards Craft's live-preview token (X-Craft-Token) when present, so
 * editors see draft content in the preview pane.
 *
 * Usage — always pair with useAsyncData so errors surface properly instead
 * of being swallowed by <Suspense>:
 *
 *   const { query } = useCraftQuery()
 *   const { data } = await useAsyncData('home', () => query<PageData>(homeGql))
 */
export const useCraftQuery = () => {
  const config = useRuntimeConfig()
  const previewToken = usePreviewToken()

  function getGqlEndpoint(): string {
    if (import.meta.server) {
      return config.gqlApiHostServer
    }
    return config.public.gqlApiHost
  }

  const query = async <T>(queryString: string, variables?: Record<string, unknown>): Promise<T> => {
    const endpoint = getGqlEndpoint()

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    }

    if (previewToken.value) {
      headers['X-Craft-Token'] = previewToken.value
    }

    const response = await $fetch<{ data: T; errors?: { message: string }[] }>(endpoint, {
      method: 'POST',
      headers,
      body: { query: queryString, variables },
    })

    if (response.errors?.length) {
      throw new Error(`GraphQL errors: ${response.errors.map(e => e.message).join('; ')}`)
    }

    return response.data
  }

  return { query }
}
