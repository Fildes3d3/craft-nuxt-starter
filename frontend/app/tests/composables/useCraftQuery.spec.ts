import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mockNuxtImport } from '@nuxt/test-utils/runtime'

// ── mocks ────────────────────────────────────────────────────────────────────
// Note: we deliberately do NOT mock useRuntimeConfig — Nuxt's test runtime
// needs the real one to boot. The endpoint assertions use the defaults from
// nuxt.config.ts instead.

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
  body: { query: string, variables?: Record<string, unknown> }
}

const fetchSpy = vi.fn<(url: string, options: GqlFetchOptions) => Promise<unknown>>()
vi.stubGlobal('$fetch', fetchSpy)

// ── tests ────────────────────────────────────────────────────────────────────

describe('useCraftQuery', () => {
  beforeEach(() => {
    fetchSpy.mockReset()
    previewTokenMock.value = null
  })

  it('POSTs the query to the public endpoint and returns response.data', async () => {
    fetchSpy.mockResolvedValue({ data: { entry: { title: 'Home' } } })

    const { query } = useCraftQuery()
    const result = await query<{ entry: { title: string } }>('query Home { entry { title } }')

    expect(result.entry.title).toBe('Home')

    const [url, options] = fetchSpy.mock.calls[0]!
    // Client-side in the test environment → public endpoint from nuxt.config defaults
    expect(url).toBe('http://localhost/api')
    expect(options.method).toBe('POST')
    expect(options.body.query).toContain('query Home')
  })

  it('passes variables through to the request body', async () => {
    fetchSpy.mockResolvedValue({ data: {} })

    const { query } = useCraftQuery()
    await query('query Page($slug: [String]) { entry(slug: $slug) { title } }', { slug: ['about'] })

    const [, options] = fetchSpy.mock.calls[0]!
    expect(options.body.variables).toEqual({ slug: ['about'] })
  })

  it('throws when the GraphQL response contains errors', async () => {
    fetchSpy.mockResolvedValue({
      data: null,
      errors: [{ message: 'Cannot query field "nope"' }],
    })

    const { query } = useCraftQuery()

    await expect(query('query { nope }')).rejects.toThrow(/Cannot query field/)
  })

  it('sends X-Craft-Token header when a preview token is active', async () => {
    previewTokenMock.value = 'preview-token-123'
    fetchSpy.mockResolvedValue({ data: {} })

    const { query } = useCraftQuery()
    await query('query { entry { title } }')

    const [, options] = fetchSpy.mock.calls[0]!
    expect(options.headers['X-Craft-Token']).toBe('preview-token-123')
  })

  it('omits X-Craft-Token header when no preview session is active', async () => {
    fetchSpy.mockResolvedValue({ data: {} })

    const { query } = useCraftQuery()
    await query('query { entry { title } }')

    const [, options] = fetchSpy.mock.calls[0]!
    expect(options.headers['X-Craft-Token']).toBeUndefined()
  })
})
