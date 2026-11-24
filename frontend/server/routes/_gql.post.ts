import { resolveGqlOp } from '~~/server/utils/gqlOps'
import { craftGql } from '~~/server/utils/craftGql'

/**
 * Browser-side data fetching for client-side navigation. Accepts only a named
 * operation + validated variables (see gqlOps), never query text, and calls
 * Craft with the server-only token.
 */
export default defineEventHandler(async (event) => {
  const body = await readBody<{ op?: unknown, variables?: unknown }>(event).catch(() => null)
  const gql = body ? resolveGqlOp(body.op, body.variables) : null
  if (!gql) {
    throw createError({ statusCode: 400, statusMessage: 'Unknown operation' })
  }

  const res = await craftGql(event, gql.query, gql.variables).catch(() => null)
  if (!res || res.errors?.length) {
    throw createError({ statusCode: 502, statusMessage: 'CMS query failed' })
  }

  setHeader(event, 'Cache-Control', 'no-store')
  return { data: res.data }
})
