import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mockNuxtImport } from '@nuxt/test-utils/runtime'

const { routeMock, cookieMock } = vi.hoisted(() => ({
  routeMock: { query: {} as Record<string, string | undefined> },
  // Duck-typed ref — vi.hoisted runs before module imports, so vue's ref()
  // isn't available here. usePreviewToken only reads/writes `.value`.
  cookieMock: { value: null as string | null },
}))

mockNuxtImport('useRoute', () => () => routeMock)
mockNuxtImport('useCookie', () => () => cookieMock)

describe('usePreviewToken', () => {
  beforeEach(() => {
    routeMock.query = {}
    cookieMock.value = null
  })

  it('returns null when no token is present anywhere', () => {
    const token = usePreviewToken()
    expect(token.value).toBeNull()
  })

  it('reads the token from the URL query', () => {
    routeMock.query = { token: 'fresh-token' }

    const token = usePreviewToken()
    expect(token.value).toBe('fresh-token')
  })

  it('persists a URL token into the cookie', () => {
    routeMock.query = { token: 'fresh-token' }

    usePreviewToken()
    expect(cookieMock.value).toBe('fresh-token')
  })

  it('falls back to the cookie when the URL has no token', () => {
    cookieMock.value = 'cookie-token'

    const token = usePreviewToken()
    expect(token.value).toBe('cookie-token')
  })

  it('prefers the URL token over a stale cookie token', () => {
    routeMock.query = { token: 'url-token' }
    cookieMock.value = 'old-cookie-token'

    const token = usePreviewToken()
    expect(token.value).toBe('url-token')
  })
})
