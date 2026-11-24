import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mockNuxtImport } from '@nuxt/test-utils/runtime'
import type { CraftGql } from '~/queries/types'

// ── mocks ────────────────────────────────────────────────────────────────────
// Note: we deliberately do NOT mock useRuntimeConfig — Nuxt's test runtime
// needs the real one to boot. Tests run client side, so every call goes
// through Nuxt's /_gql route.

const { previewTokenMock } = vi.hoisted(() => ({
  // Duck-typed ref — vi.hoisted runs before module imports, so we can't
  // use vue's ref() here.
  previewTokenMock: { value: null as string | null },
}))

mockNuxtImport('usePreviewToken', () => () => previewTokenMock)

// Typed signature so assertions on url/options below are fully checked.
interface GqlFetchOptions {
  method: string
  headers: Record<string, string>
  body: { op?: string, query?: string, variables?: Record<string, unknown> }
}

const fetchSpy = vi.fn<(url: string, options: GqlFetchOptions) => Promise<unknown>>()
vi.stubGlobal('$fetch', fetchSpy)

const homeOp: CraftGql = { op: 'home', query: 'query Home { entry { title } }' }
const pageOp: CraftGql = {
  op: 'page',
  query: 'query Page($slug: [String]) { entry(slug: $slug) { title } }',
  variables: { slug: 'about' },
}

// ── tests ────────────────────────────────────────────────────────────────────

describe('useCraftQuery (browser)', () => {
  beforeEach(() => {
    fetchSpy.mockReset()
    previewTokenMock.value = null
  })

  it('POSTs the operation name to /_gql and returns response.data', async () => {
    fetchSpy.mockResolvedValue({ data: { entry: { title: 'Home' } } })

    const { query } = useCraftQuery()
    const result = await query<{ entry: { title: string } }>(homeOp)

    expect(result.entry.title).toBe('Home')

    const [url, options] = fetchSpy.mock.calls[0]!
    expect(url).toBe('/_gql')
    expect(options.method).toBe('POST')
    expect(options.body.op).toBe('home')
  })

  it('never sends query text or a token from the browser', async () => {
    fetchSpy.mockResolvedValue({ data: {} })

    const { query } = useCraftQuery()
    await query(homeOp)

    const [, options] = fetchSpy.mock.calls[0]!
    expect(options.body.query).toBeUndefined()
    expect(options.headers.Authorization).toBeUndefined()
  })

  it('passes variables through to the request body', async () => {
    fetchSpy.mockResolvedValue({ data: {} })

    const { query } = useCraftQuery()
    await query(pageOp)

    const [, options] = fetchSpy.mock.calls[0]!
    expect(options.body.variables).toEqual({ slug: 'about' })
  })

  it('throws when the GraphQL response contains errors', async () => {
    fetchSpy.mockResolvedValue({
      data: null,
      errors: [{ message: 'Cannot query field "nope"' }],
    })

    const { query } = useCraftQuery()

    await expect(query(homeOp)).rejects.toThrow(/Cannot query field/)
  })

  it('sends X-Craft-Token header when a preview token is active', async () => {
    previewTokenMock.value = 'preview-token-123'
    fetchSpy.mockResolvedValue({ data: {} })

    const { query } = useCraftQuery()
    await query(homeOp)

    const [, options] = fetchSpy.mock.calls[0]!
    expect(options.headers['X-Craft-Token']).toBe('preview-token-123')
  })

  it('omits X-Craft-Token header when no preview session is active', async () => {
    fetchSpy.mockResolvedValue({ data: {} })

    const { query } = useCraftQuery()
    await query(homeOp)

    const [, options] = fetchSpy.mock.calls[0]!
    expect(options.headers['X-Craft-Token']).toBeUndefined()
  })
})
