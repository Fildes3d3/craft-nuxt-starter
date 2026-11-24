/**
 * A named, fixed Craft GraphQL operation.
 *
 * The browser only ever sends `op` + `variables` to Nuxt's /_gql route, which
 * looks the query up server-side (server/utils/gqlOps.ts). Query text from a
 * client is never forwarded to Craft.
 */
export interface CraftGql {
  op: string
  query: string
  variables?: Record<string, unknown>
}
