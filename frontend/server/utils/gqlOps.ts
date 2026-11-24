import { getBlogListGql, getBlogPostGql, getHomeGql, getPageGql } from '~~/app/queries/content'
import type { CraftGql } from '~~/app/queries/types'

/**
 * Allowlist of the only GraphQL operations the browser may trigger (via
 * /_gql). Craft's GraphQL endpoint itself is not public, and arbitrary query
 * text from a client is never forwarded.
 *
 * Adding an operation: write its builder in app/queries/, then register it
 * below with the variable validator it needs.
 */
const SLUG = /^[a-z0-9][a-z0-9-]{0,127}$/

const noVars = (build: () => CraftGql) => (vars: unknown) =>
  vars === undefined || (typeof vars === 'object' && vars !== null && Object.keys(vars).length === 0)
    ? build()
    : null

const slugVar = (build: (slug: string) => CraftGql) => (vars: unknown) => {
  if (typeof vars !== 'object' || vars === null) return null
  const keys = Object.keys(vars)
  const slug = (vars as { slug?: unknown }).slug
  return keys.length === 1 && typeof slug === 'string' && SLUG.test(slug) ? build(slug) : null
}

const OPS: Record<string, (vars: unknown) => CraftGql | null> = {
  home:     noVars(getHomeGql),
  blogList: noVars(getBlogListGql),
  page:     slugVar(getPageGql),
  blogPost: slugVar(getBlogPostGql),
}

/** Returns the fixed operation for a client request, or null if it isn't allowed. */
export function resolveGqlOp(op: unknown, vars: unknown): CraftGql | null {
  if (typeof op !== 'string' || !Object.hasOwn(OPS, op)) return null
  return OPS[op]!(vars)
}
