import type { CraftGql } from '~/queries/types'

/**
 * Minimal GraphQL client for Craft CMS. Craft's GraphQL is not public: there
 * is no public token, so anonymous requests are refused.
 *
 *  - Server (SSR): calls Craft directly on the internal Docker network
 *    (`gqlApiHostServer`, http://web:8080/api) with the private schema token
 *    (`gqlToken`, server-only runtime config — never shipped to the browser).
 *  - Browser (client-side navigation): POSTs only the operation name and its
 *    variables to Nuxt's /_gql route, which looks the query up in its
 *    allowlist (server/utils/gqlOps.ts) and calls Craft server-side.
 *
 * Forwards Craft's live-preview token (X-Craft-Token) when present, so
 * editors see draft content in the preview pane.
 *
 * Usage — always pair with useAsyncData so errors surface properly instead
 * of being swallowed by <Suspense>:
 *
 *   const { query } = useCraftQuery()
 *   const { data } = await useAsyncData('home', () => query<PageData>(getHomeGql()))
 */
export const useCraftQuery = () => {
  const config = useRuntimeConfig()
  const previewToken = usePreviewToken()

  const query = async <T>(gql: CraftGql): Promise<T> => {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    }

    if (previewToken.value) {
      headers['X-Craft-Token'] = previewToken.value
    }

    type GqlResponse = { data: T, errors?: { message: string }[] }
    let response: GqlResponse

    if (import.meta.server) {
      if (config.gqlToken) headers.Authorization = `Bearer ${config.gqlToken}`
      response = await $fetch<GqlResponse>(config.gqlApiHostServer, {
        method: 'POST',
        headers,
        body: gql.variables ? { query: gql.query, variables: gql.variables } : { query: gql.query },
      })
    }
    else {
      response = await $fetch<GqlResponse>('/_gql', {
        method: 'POST',
        headers,
        body: { op: gql.op, variables: gql.variables },
      })
    }

    if (response.errors?.length) {
      throw new Error(`GraphQL errors: ${response.errors.map(e => e.message).join('; ')}`)
    }

    return response.data
  }

  return { query }
}
